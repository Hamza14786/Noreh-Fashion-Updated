import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to the configured test admin.');
if (!process.env.UPLOAD_DIR || !path.isAbsolute(process.env.UPLOAD_DIR) || !/noreh[-_]smoke[-_]uploads/i.test(process.env.UPLOAD_DIR)) {
  throw new Error('Set UPLOAD_DIR to a dedicated absolute path containing "noreh-smoke-uploads".');
}
const uploadDir=path.resolve(process.env.UPLOAD_DIR);
const originalFiles=new Set(await readdir(uploadDir).catch(()=>[]));
const response = async (route, options) => fetch(`${base}${route}`, options);

try {
  const login = await response('/api/admin/login/', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});
  if (!login.ok) throw new Error(`Login failed (${login.status}): ${await login.text()}`);
  const setCookie = login.headers.get('set-cookie') || '';
  if (!/HttpOnly/i.test(setCookie) || !/SameSite=Strict/i.test(setCookie)) throw new Error('Admin cookie is missing HTTP-only or SameSite protection.');
  const cookie = setCookie.split(';')[0];
  const png = await sharp({create:{width:1,height:1,channels:3,background:'#fff'}}).png().toBuffer();
  const form = new FormData();
  form.set('file',new Blob([png],{type:'image/png'}),'pixel.png');
  const unauth = await response('/api/admin/upload/',{method:'POST',body:form});
  if (unauth.status !== 401) throw new Error(`Unauthenticated upload returned ${unauth.status}.`);
  const upload = await response('/api/admin/upload/',{method:'POST',headers:{cookie},body:form});
  if (upload.status !== 201) throw new Error(`Valid upload failed (${upload.status}): ${await upload.text()}`);
  const {url} = await upload.json();
  const served = await fetch(new URL(url,base));
  if (!served.ok || served.headers.get('content-type') !== 'image/webp' || served.headers.get('x-content-type-options') !== 'nosniff') throw new Error('Uploaded image was not safely served as WebP.');
  const fake = new FormData();
  fake.set('file',new Blob(['not an image'],{type:'image/png'}),'fake.png');
  const rejected = await response('/api/admin/upload/',{method:'POST',headers:{cookie},body:fake});
  if (rejected.status !== 400) throw new Error(`Malformed image was not rejected (status ${rejected.status}).`);
  console.log('PASS: admin login cookie flags, unauthenticated upload rejection, sanitized upload/serve, and invalid image rejection.');
} finally {
  const currentFiles=await readdir(uploadDir).catch(()=>[]);
  for(const filename of currentFiles){
    if(!originalFiles.has(filename)&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(filename)) await unlink(path.join(uploadDir,filename)).catch(error=>{if(error.code!=='ENOENT')throw error;});
  }
}
