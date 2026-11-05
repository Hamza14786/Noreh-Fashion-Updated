import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'noreh_admin';
function signature(value: string) { return createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('base64url'); }
export function validAdminCookie(token?: string) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [payload, sig] = token.split('.'); if (!payload || !sig) return false;
  const expected = signature(payload);
  try { if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false; } catch { return false; }
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.exp > Date.now(); } catch { return false; }
}
export function isAdminRequest(request: Request) { return validAdminCookie(request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${cookieName}=`))?.slice(cookieName.length+1)); }
export async function adminCookieOptions() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  (await cookies()).set(cookieName, `${payload}.${signature(payload)}`, { httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:'strict',path:'/',maxAge:8*60*60 });
}
export async function clearAdminCookie() { (await cookies()).set(cookieName, '', { httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:'strict',path:'/',maxAge:0 }); }
export function jsonError(message: string, status=400) { return Response.json({ error:message }, { status }); }
