import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminCookieOptions, jsonError } from '@/lib/server/auth';
export const runtime = 'nodejs';
const attempts = new Map<string,{count:number;reset:number}>();
export async function POST(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').map(value => value.trim()).filter(Boolean);
  const ip = forwarded?.[forwarded.length - 1] || 'unknown';
  const now=Date.now();
  let entry=attempts.get(ip);
  if(entry&&entry.reset>now&&entry.count>=8)return jsonError('Too many sign-in attempts. Try again in 15 minutes.',429);
  if(entry&&entry.reset<=now){attempts.delete(ip);entry=undefined;}
  if(attempts.size>=1000)Array.from(attempts.entries()).forEach(([key,value])=>{if(value.reset<=now)attempts.delete(key);});
  if(attempts.size>=1000&&!attempts.has(ip))return jsonError('Sign-in is temporarily unavailable. Try again later.',429);
  if(!entry){entry={count:0,reset:now+15*60*1000};attempts.set(ip,entry);}
  const body = await req.json().catch(()=>null);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length<16 || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length<32) return jsonError('Admin credentials are not securely configured',503);
  const email=String(body?.email||'').trim().toLowerCase(), password=String(body?.password||'');
  if(email.length>254||password.length>1024)return jsonError('Invalid email or password',401);
  const a=createHash('sha256').update(email).digest(), b=createHash('sha256').update(process.env.ADMIN_EMAIL.toLowerCase()).digest();
  const c=createHash('sha256').update(password).digest(), d=createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  const emailMatches=timingSafeEqual(a,b), passwordMatches=timingSafeEqual(c,d);
  if (!emailMatches || !passwordMatches) { const current=attempts.get(ip)!;current.count++;return jsonError('Invalid email or password',401); }
  attempts.delete(ip); await adminCookieOptions(); return NextResponse.json({ ok:true });
}
