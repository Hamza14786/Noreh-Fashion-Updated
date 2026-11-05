import { isAdminRequest } from '@/lib/server/auth';
export const runtime='nodejs';
export async function GET(req:Request){ return Response.json({authenticated:isAdminRequest(req)},{status:isAdminRequest(req)?200:401}); }
