import { initializeDatabase, pool } from '@/lib/server/db';
import { isAdminRequest, jsonError } from '@/lib/server/auth';
import { deliverOrderNotification } from '@/lib/server/order-email';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return jsonError('Unauthorized', 401);
  const { id } = await params;
  try {
    await initializeDatabase();
    const existing = await pool.query('SELECT 1 FROM order_notifications WHERE order_number=$1', [id]);
    if (!existing.rowCount) return jsonError('Order notification not found', 404);
    await deliverOrderNotification(id);
    const { rows } = await pool.query('SELECT sent_at,attempts,customer_sent_at,customer_attempts FROM order_notifications WHERE order_number=$1', [id]);
    const sent = Boolean(rows[0]?.sent_at && rows[0]?.customer_sent_at);
    return Response.json({ sent, attempts: (rows[0]?.attempts ?? 0) + (rows[0]?.customer_attempts ?? 0) }, { status: sent ? 200 : 502 });
  } catch {
    return jsonError('Could not retry order notification', 503);
  }
}
