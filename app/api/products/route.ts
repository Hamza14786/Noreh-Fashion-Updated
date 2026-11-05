import { initializeDatabase,pool,fromRow } from '@/lib/server/db';
export const runtime='nodejs';
export async function GET(){ try { await initializeDatabase(); const {rows}=await pool.query('SELECT * FROM products ORDER BY created_at DESC'); return Response.json(rows.map(fromRow)); } catch { return Response.json({error:'Product service unavailable'},{status:503}); } }
