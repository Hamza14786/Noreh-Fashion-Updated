import nodemailer from 'nodemailer';
import { pool } from '@/lib/server/db';

type NotificationPayload = {
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  shipping?: { address: string; city: string; postal: string; country: string };
  items: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number; size?: string; color?: string }>;
  subtotal: number;
  shippingTotal: number;
  tax: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
};

function smtpSettings() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM?.trim();
  const to = (process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL)?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  if (!host && !from && !to && !user && !password) return null;
  if (!host || !from || !to || !Number.isInteger(port) || port < 1 || port > 65535 || Boolean(user) !== Boolean(password)) {
    throw new Error('SMTP configuration is incomplete');
  }
  return { host, port, from, to, user, password, secure: process.env.SMTP_SECURE === 'true' };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]!));
}

function itemText(item: NotificationPayload['items'][number]) {
  const variant = [item.size, item.color].filter(Boolean).join(' / ');
  return `${item.name}${variant ? ` (${variant})` : ''} x ${item.quantity} — PKR ${item.lineTotal.toLocaleString('en-US')}`;
}

function itemHtml(item: NotificationPayload['items'][number]) {
  const variant = [item.size, item.color].filter(Boolean).join(' / ');
  return `<li>${escapeHtml(item.name)}${variant ? ` (${escapeHtml(variant)})` : ''} x ${item.quantity} — PKR ${item.lineTotal.toLocaleString('en-US')}</li>`;
}

function totalsText(payload: NotificationPayload) {
  return [
    `Subtotal: PKR ${payload.subtotal.toLocaleString('en-US')}`,
    `Shipping: PKR ${payload.shippingTotal.toLocaleString('en-US')}`,
    `Total: PKR ${payload.total.toLocaleString('en-US')}`,
  ];
}

function shippingText(payload: NotificationPayload) {
  const address = payload.shipping;
  return address ? `${address.address}, ${address.city}, ${address.postal}, ${address.country}` : 'Delivery address is available in your order record.';
}

function shippingHtml(payload: NotificationPayload) {
  return escapeHtml(shippingText(payload));
}

function paymentLabel(method: string) {
  return method === 'cod' ? 'Cash on Delivery' : method;
}

/** Delivers queued administrator and customer messages without rolling back a placed order. */
export async function deliverOrderNotification(orderNumber: string) {
  const settings = smtpSettings();
  if (!settings) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT n.order_number,n.recipient,n.payload,n.sent_at,n.customer_sent_at,o.shipping
       FROM order_notifications n JOIN orders o USING(order_number)
       WHERE n.order_number=$1 FOR UPDATE OF n`, [orderNumber]
    );
    const notification = rows[0];
    if (!notification) {
      await client.query('COMMIT');
      return false;
    }

    const payload = notification.payload as NotificationPayload;
    if (!payload.shipping) payload.shipping = notification.shipping;
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: settings.user ? { user: settings.user, pass: settings.password } : undefined,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    const itemsText = payload.items.map(itemText);
    const itemsHtml = payload.items.map(itemHtml).join('');
    const totals = totalsText(payload);
    let adminSent = Boolean(notification.sent_at);
    let customerSent = Boolean(notification.customer_sent_at);

    if (!adminSent) {
      try {
        await transporter.sendMail({
          from: settings.from,
          to: notification.recipient || settings.to,
          subject: `New Noreh.pk order ${payload.orderNumber}`,
          text: [
            `New order ${payload.orderNumber}`,
            `Customer: ${payload.customer.name} (${payload.customer.email})`,
            `Phone: ${payload.customer.phone || 'Not provided'}`,
            ...itemsText,
            ...totals,
            `Delivery method: ${payload.deliveryMethod}`,
            `Delivery address: ${shippingText(payload)}`,
            `Payment method: ${paymentLabel(payload.paymentMethod)}`,
          ].join('\n'),
          html: `<h1>New order ${escapeHtml(payload.orderNumber)}</h1><p>Customer: ${escapeHtml(payload.customer.name)} (${escapeHtml(payload.customer.email)})<br>Phone: ${escapeHtml(payload.customer.phone || 'Not provided')}</p><ul>${itemsHtml}</ul><p>${totals.map(escapeHtml).join('<br>')}</p><p>Delivery method: ${escapeHtml(payload.deliveryMethod)}<br>Delivery address: ${shippingHtml(payload)}<br>Payment method: ${escapeHtml(paymentLabel(payload.paymentMethod))}</p>`,
        });
        await client.query('UPDATE order_notifications SET sent_at=now(),attempts=attempts+1,last_error=NULL WHERE order_number=$1', [orderNumber]);
        adminSent = true;
      } catch (error) {
        console.error('Admin order notification SMTP or persistence step failed', { orderNumber, error: error instanceof Error ? error.message : 'unknown error' });
        await client.query('UPDATE order_notifications SET attempts=attempts+1,last_error=$2 WHERE order_number=$1', [orderNumber, error instanceof Error ? error.message.slice(0, 500) : 'SMTP delivery failed']);
        console.error('Admin order notification delivery failed', { orderNumber });
      }
    }

    if (!customerSent && payload.customer.email) {
      try {
        await transporter.sendMail({
          from: settings.from,
          to: payload.customer.email,
          subject: `Your Noreh.pk order ${payload.orderNumber} is confirmed`,
          text: [
            `Hello ${payload.customer.name},`,
            `Thank you for your order. Your order number is ${payload.orderNumber}.`,
            'Order items:',
            ...itemsText,
            ...totals,
            `Delivery method: ${payload.deliveryMethod}`,
            `Delivery address: ${shippingText(payload)}`,
            `Contact phone: ${payload.customer.phone || 'Not provided'}`,
            `Payment method: ${paymentLabel(payload.paymentMethod)}`,
            'Payment is due in cash when your order is delivered.',
          ].join('\n'),
          html: `<h1>Thank you for your order</h1><p>Hello ${escapeHtml(payload.customer.name)}, your Noreh.pk order <strong>${escapeHtml(payload.orderNumber)}</strong> is confirmed.</p><h2>Items</h2><ul>${itemsHtml}</ul><p>${totals.map(escapeHtml).join('<br>')}</p><p><strong>Delivery method:</strong> ${escapeHtml(payload.deliveryMethod)}<br><strong>Delivery address:</strong> ${shippingHtml(payload)}<br><strong>Contact phone:</strong> ${escapeHtml(payload.customer.phone || 'Not provided')}<br><strong>Payment method:</strong> ${escapeHtml(paymentLabel(payload.paymentMethod))}<br>Payment is due in cash when your order is delivered.</p>`,
        });
        await client.query('UPDATE order_notifications SET customer_sent_at=now(),customer_attempts=customer_attempts+1,customer_last_error=NULL WHERE order_number=$1', [orderNumber]);
        customerSent = true;
      } catch (error) {
        console.error('Customer order confirmation SMTP or persistence step failed', { orderNumber, error: error instanceof Error ? error.message : 'unknown error' });
        await client.query('UPDATE order_notifications SET customer_attempts=customer_attempts+1,customer_last_error=$2 WHERE order_number=$1', [orderNumber, error instanceof Error ? error.message.slice(0, 500) : 'SMTP delivery failed']);
        console.error('Customer order confirmation delivery failed', { orderNumber });
      }
    }

    await client.query('COMMIT');
    return adminSent && customerSent;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
