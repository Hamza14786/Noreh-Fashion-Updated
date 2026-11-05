import { randomUUID } from 'node:crypto';
import { initializeDatabase, pool } from '@/lib/server/db';
import { availableProductSizes } from '@/lib/product-sizes';
import { jsonError } from '@/lib/server/auth';
import { deliverOrderNotification } from '@/lib/server/order-email';

export const runtime = 'nodejs';
const maxInteger = 2_147_483_647;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const customer = body?.customer;
  const shippingAddress = body?.shipping;
  const key = body?.idempotencyKey;
  const validFields = [customer?.name, customer?.email, customer?.phone, shippingAddress?.address, shippingAddress?.city, shippingAddress?.postal, shippingAddress?.country]
    .every(value => typeof value === 'string' && value.trim().length > 0 && value.length <= 300);
  if (!Array.isArray(body?.items) || !body.items.length || body.items.length > 30 || !validFields ||
      customer.name.length > 120 || customer.phone.length > 40 || customer.email.length > 254 || !/^\S+@\S+\.\S+$/.test(customer.email) ||
      !['standard', 'express'].includes(body.deliveryMethod) || body.paymentMethod !== 'cod' ||
      typeof key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key) ||
      body.items.some((item: any) => !item || typeof item.productId !== 'string' || item.productId.length > 100 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || !Number.isSafeInteger(item.expectedUnitPrice) || item.expectedUnitPrice < 0 || typeof item.size !== 'string' || item.size.length > 40 || typeof item.color !== 'string' || item.color.length > 80)) {
    return jsonError('Please check your checkout details');
  }

  try {
    await initializeDatabase();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Serialize retries carrying the same key, including requests reaching different app workers.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [key]);
      const duplicate = await client.query('SELECT order_number,total FROM orders WHERE idempotency_key=$1', [key]);
      if (duplicate.rows[0]) {
        await client.query('COMMIT');
        void deliverOrderNotification(duplicate.rows[0].order_number).catch(error => console.error('Could not process order notification', { orderNumber: duplicate.rows[0].order_number, error: error instanceof Error ? error.message : 'unknown error' }));
        return Response.json({ orderNumber: duplicate.rows[0].order_number, total: duplicate.rows[0].total, duplicate: true }, { status: 200 });
      }

      // Lock products in a stable order to avoid deadlocks between overlapping carts.
      const lines = [...body.items].sort((a: any, b: any) => a.productId.localeCompare(b.productId));
      let subtotal = 0;
      const items = [];
      for (const line of lines) {
        const { rows } = await client.query('SELECT id,name,slug,price,sale_price,images,stock,sku,sizes,colors FROM products WHERE id=$1 FOR UPDATE', [line.productId]);
        const product = rows[0];
        if (!product || product.stock < line.quantity) {
          await client.query('ROLLBACK');
          return jsonError('One or more items are no longer available in the requested quantity', 409);
        }
        const availableSizes = availableProductSizes(product);
        if ((availableSizes.length && !availableSizes.includes(line.size)) || (product.colors?.length && !product.colors.some((color:any)=>color.name===line.color))) {
          await client.query('ROLLBACK');
          return jsonError('A selected size or color is no longer available. Review your cart and try again.', 409);
        }
        const unitPrice = product.sale_price ?? product.price;
        if (unitPrice !== line.expectedUnitPrice) {
          await client.query('ROLLBACK');
          return jsonError('A product price changed. Review the updated total and place the order again.', 409);
        }
        subtotal += unitPrice * line.quantity;
        if (!Number.isSafeInteger(subtotal) || subtotal > maxInteger) {
          await client.query('ROLLBACK');
          return jsonError('Order total exceeds the supported limit');
        }
        items.push({ productId:product.id, name:product.name, slug:product.slug, sku:product.sku, image:product.images[0] || '',
          size:String(line.size || '').slice(0,40), color:String(line.color || '').slice(0,80), unitPrice, quantity:line.quantity, lineTotal:unitPrice * line.quantity });
        await client.query('UPDATE products SET stock=stock-$2,updated_at=now() WHERE id=$1', [product.id, line.quantity]);
      }

      const shippingTotal = subtotal >= 5000 ? 0 : 250;
      const tax = 0;
      const total = subtotal + shippingTotal;
      if (total > maxInteger) { await client.query('ROLLBACK'); return jsonError('Order total exceeds the supported limit'); }
      const orderNumber = `NR-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0,10).toUpperCase()}`;
      const result = await client.query(
        `INSERT INTO orders(order_number,idempotency_key,customer,shipping,payment_method,delivery_method,items,subtotal,shipping_total,tax,total)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING order_number,total`,
        [orderNumber,key,JSON.stringify({name:customer.name.trim(),email:customer.email.trim().toLowerCase(),phone:customer.phone.trim()}),
          JSON.stringify({address:shippingAddress.address.trim(),city:shippingAddress.city.trim(),postal:shippingAddress.postal.trim(),country:shippingAddress.country.trim()}),
          body.paymentMethod,body.deliveryMethod,JSON.stringify(items),subtotal,shippingTotal,tax,total]
      );
      const notificationPayload = {
        orderNumber,
        customer: { name: customer.name.trim(), email: customer.email.trim().toLowerCase(), phone: customer.phone.trim() },
        shipping: { address: shippingAddress.address.trim(), city: shippingAddress.city.trim(), postal: shippingAddress.postal.trim(), country: shippingAddress.country.trim() },
        items,
        subtotal,
        shippingTotal,
        tax,
        total,
        deliveryMethod: body.deliveryMethod,
        paymentMethod: body.paymentMethod,
      };
      await client.query(
        'INSERT INTO order_notifications(order_number,recipient,payload) VALUES($1,$2,$3) ON CONFLICT(order_number) DO NOTHING',
        [orderNumber, (process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '').trim(), JSON.stringify(notificationPayload)]
      );
      await client.query('COMMIT');
      void deliverOrderNotification(orderNumber).catch(error => console.error('Could not process order notification', { orderNumber, error: error instanceof Error ? error.message : 'unknown error' }));
      return Response.json({ orderNumber:result.rows[0].order_number, total:result.rows[0].total }, { status:201 });
    } catch {
      await client.query('ROLLBACK').catch(() => undefined);
      throw new Error('Order transaction failed');
    } finally { client.release(); }
  } catch {
    return jsonError('Could not place your order. Please try again.', 500);
  }
}
