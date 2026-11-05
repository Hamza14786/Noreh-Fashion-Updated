import { clearAdminCookie } from '@/lib/server/auth';
export const runtime='nodejs';
export async function POST(){ await clearAdminCookie(); return Response.json({ok:true}); }
