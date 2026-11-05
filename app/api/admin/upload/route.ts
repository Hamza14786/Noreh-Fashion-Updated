import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { isAdminRequest, jsonError } from '@/lib/server/auth';

export const runtime = 'nodejs';
const maxFileBytes = 5 * 1024 * 1024;
const maxRequestBytes = maxFileBytes + 64 * 1024;

async function boundedBody(req: Request) {
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxRequestBytes) throw new Error('too-large');
  if (!req.body) throw new Error('empty');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxRequestBytes) { await reader.cancel(); throw new Error('too-large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  return bytes;
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return jsonError('Unauthorized', 401);
  try {
    const body = await boundedBody(req);
    const form = await new Request(req.url, { method:'POST', headers:req.headers, body }).formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > maxFileBytes || !['image/jpeg','image/png','image/webp'].includes(file.type)) {
      return jsonError('Upload a JPEG, PNG, or WebP image up to 5 MB');
    }
    const source = Buffer.from(await file.arrayBuffer());
    // Decode and re-encode so file extensions, MIME labels, polyglots, and metadata are not trusted.
    let safeImage: Buffer;
    try {
      const image = sharp(source, { limitInputPixels: 40_000_000, failOn:'error' });
      const metadata = await image.metadata();
      if (!['jpeg','png','webp'].includes(metadata.format || '')) return jsonError('Invalid image file');
      safeImage = await image.rotate().resize({ width:3000, height:3000, fit:'inside', withoutEnlargement:true }).webp({ quality:82 }).toBuffer();
    } catch { return jsonError('Invalid image file'); }
    const dir = process.env.UPLOAD_DIR || path.join(process.cwd(),'.data','uploads');
    await mkdir(dir,{recursive:true});
    const name = `${randomUUID()}.webp`;
    await writeFile(path.join(dir,name),safeImage,{flag:'wx'});
    return Response.json({url:`/uploads/${name}`},{status:201});
  } catch (error) {
    if (error instanceof Error && error.message === 'too-large') return jsonError('Upload request is too large');
    return jsonError('Could not upload image',500);
  }
}
