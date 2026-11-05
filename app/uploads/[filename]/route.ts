import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const {filename} = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(filename)) {
    return new Response('Not found', { status:404 });
  }
  const directory = process.env.UPLOAD_DIR || path.join(process.cwd(),'.data','uploads');
  try {
    const image = await readFile(path.join(directory,filename));
    return new Response(image, { headers:{ 'Content-Type':'image/webp', 'Content-Length':String(image.byteLength), 'Cache-Control':'public, max-age=31536000, immutable', 'X-Content-Type-Options':'nosniff' } });
  } catch { return new Response('Not found', { status:404 }); }
}
