import { initializeDatabase,pool } from '@/lib/server/db';
import { isAdminRequest,jsonError } from '@/lib/server/auth';
export const runtime='nodejs';
export async function GET(req:Request){if(!isAdminRequest(req))return jsonError('Unauthorized',401);try{await initializeDatabase();const {rows}=await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500');return Response.json(rows);}catch{return jsonError('Database unavailable',503);}}
