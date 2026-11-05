import { initializeDatabase, pool } from '@/lib/server/db';
import { isAdminRequest, jsonError } from '@/lib/server/auth';

export const runtime = 'nodejs';
const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
const transitions: Record<string,string[]> = { pending:['pending','processing','cancelled'], processing:['processing','shipped','cancelled'], shipped:['shipped','completed'], completed:['completed'], cancelled:['cancelled'] };

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return jsonError('Unauthorized', 401);
  const {id}=await params;
  const body = await req.json().catch(() => null);
  if (!statuses.includes(body?.status)) return jsonError('Invalid order status');
  try {
    await initializeDatabase();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query('SELECT order_number,status,items FROM orders WHERE order_number=$1 FOR UPDATE', [id]);
      if (!found.rows[0]) { await client.query('ROLLBACK'); return jsonError('Order not found', 404); }
      const order = found.rows[0];
      if (!(transitions[order.status] || []).includes(body.status)) {
        await client.query('ROLLBACK');
        return jsonError('Invalid order status transition', 409);
      }
      if (order.status !== 'cancelled' && body.status === 'cancelled') {
        const lines = [...order.items].sort((a: any,b: any) => a.productId.localeCompare(b.productId));
        for (const item of lines) await client.query('UPDATE products SET stock=stock+$2,updated_at=now() WHERE id=$1', [item.productId, item.quantity]);
      }
      const updated = await client.query('UPDATE orders SET status=$2,updated_at=now() WHERE order_number=$1 RETURNING order_number,status', [id, body.status]);
      await client.query('COMMIT');
      return Response.json(updated.rows[0]);
    } catch {
      await client.query('ROLLBACK').catch(() => undefined);
      return jsonError('Could not update order', 500);
    } finally { client.release(); }
  } catch { return jsonError('Database unavailable', 503); }
}
