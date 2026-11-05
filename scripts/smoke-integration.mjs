import { randomUUID } from 'node:crypto';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import sharp from 'sharp';
import { SMTPServer } from 'smtp-server';

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const runId = randomUUID();
const sku = `SMOKE-${runId}`;
const emails = [`cancel-${runId}@example.test`, `complete-${runId}@example.test`, `shipping-${runId}@example.test`];
const idempotencyKeys = [randomUUID(), randomUUID(), randomUUID()];
const imageUrls = [];
let cleanupAllowed = false;
let cleanupFailed = false;
let uploadDir;
let initialUploadFiles = new Set();
const receivedEmails = [];
const smtpPort = Number(process.env.SMTP_PORT || 2526);
let smtpStarted = false;
const smtpServer = new SMTPServer({
  authOptional: true,
  hideSTARTTLS: true,
  closeTimeout: 500,
  disabledCommands: ['AUTH'],
  onData(stream, _session, callback) {
    const chunks = [];
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => { receivedEmails.push(Buffer.concat(chunks).toString('utf8')); callback(); });
  },
});

if (process.env.ALLOW_DESTRUCTIVE_SMOKE !== 'YES') throw new Error('Refusing to run without ALLOW_DESTRUCTIVE_SMOKE=YES. Use only a disposable test database.');
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL to the disposable noreh_smoke_test database.');
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD for the local test admin.');
if (!process.env.UPLOAD_DIR || !path.isAbsolute(process.env.UPLOAD_DIR) || !/noreh[-_]smoke[-_]uploads/i.test(process.env.UPLOAD_DIR)) {
  throw new Error('Set UPLOAD_DIR to a dedicated absolute path containing "noreh-smoke-uploads".');
}
uploadDir=path.resolve(process.env.UPLOAD_DIR);
initialUploadFiles=new Set(await readdir(uploadDir).catch(()=>[]));

const dbUrl = new URL(process.env.DATABASE_URL);
const databaseName = decodeURIComponent(dbUrl.pathname.replace(/^\//, ''));
if (!['localhost','127.0.0.1','[::1]'].includes(dbUrl.hostname) || !/^noreh_smoke_test$/i.test(databaseName)) {
  throw new Error('Refusing database writes: DATABASE_URL must point to local database noreh_smoke_test.');
}

const pool = new Pool({ connectionString:process.env.DATABASE_URL, ssl:process.env.DATABASE_SSL === 'true' ? {rejectUnauthorized:true} : undefined });
let cookie = '';
let productId;
let primaryOrderNumber;
let seedWasFresh = false;
const assert = (condition,message) => { if (!condition) throw new Error(message); };
const request = async (route,options={}) => fetch(`${base}${route}`,options);
const admin = (route,options={}) => request(route,{...options,headers:{...(options.headers||{}),cookie}});
const postOrder = (body) => request('/api/checkout/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const readOrders = async () => {
  const result=await admin('/api/admin/orders/');
  assert(result.ok,`Admin orders read failed (${result.status}).`);
  return result.json();
};
const readProducts = async () => {
  const result=await admin('/api/admin/products/');
  assert(result.ok,`Admin products read failed (${result.status}).`);
  return result.json();
};
const setStatus = async (number,status,expectedStatus=200) => {
  const result=await admin(`/api/admin/orders/${number}/`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  assert(result.status===expectedStatus,`Status ${status} returned ${result.status}; expected ${expectedStatus}.`);
  return result.status===200?result.json():null;
};

try {
  // Only accept a fresh database or the clean seed baseline left by a previous successful run.
  const before=await pool.query(`SELECT to_regclass('public.products') products,to_regclass('public.orders') orders,to_regclass('public.app_metadata') metadata`);
  const schema=before.rows[0];
  if (!schema.products&&!schema.orders&&!schema.metadata) seedWasFresh=true;
  else {
    assert(schema.products&&schema.orders&&schema.metadata,'Test database is partially initialized; use a new empty noreh_smoke_test database.');
    const baseline=await pool.query("SELECT (SELECT count(*)::int FROM products) products,(SELECT count(*)::int FROM orders) orders,(SELECT value FROM app_metadata WHERE key='catalog-seed-v1') seed");
    assert(baseline.rows[0].products===20&&baseline.rows[0].orders===0&&baseline.rows[0].seed==='complete','Test database is not clean. Keep its 20 seeded catalog products, remove test rows, or recreate the disposable database.');
  }
  cleanupAllowed=true;
  await new Promise((resolve,reject)=>smtpServer.listen(smtpPort,'127.0.0.1',error=>error?reject(error):resolve()));
  smtpStarted=true;

  const unauthorized=await request('/api/admin/overview/');
  assert(unauthorized.status===401,'Overview API did not reject an unauthenticated request.');
  const unauthorizedNotificationRetry=await request('/api/admin/orders/NR-NOT-REAL/notification/',{method:'POST'});
  assert(unauthorizedNotificationRetry.status===401,'Notification retry API did not reject an unauthenticated request.');
  const login=await request('/api/admin/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});
  if(!login.ok)throw new Error(`Admin login failed (${login.status}): ${await login.text()}`);
  cookie=(login.headers.get('set-cookie')||'').split(';')[0];
  assert(cookie.startsWith('noreh_admin='),'Admin login did not issue the session cookie.');

  const unauthWrite=await request('/api/admin/products/',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert(unauthWrite.status===401,'Product write API did not reject an unauthenticated request.');

  // This first authorized DB read runs schema initialization and the one-time seed.
  const seededProducts=await readProducts();
  assert(seededProducts.length===20,'Fresh database did not seed the expected 20 catalog products.');
  const legacyImageRow=await pool.query("SELECT images FROM products WHERE slug='embroidered-lawn-suit-maroon'");
  const originalImages=legacyImageRow.rows[0].images;
  try {
    await pool.query("UPDATE products SET images='[\"/products/suit-.jpg\"]'::jsonb WHERE slug='embroidered-lawn-suit-maroon'");
    const legacyRead=(await readProducts()).find(product=>product.slug==='embroidered-lawn-suit-maroon');
    assert(legacyRead?.images[0]==='/products/suit-01.jpg','Legacy persisted placeholder image was not mapped to its matching asset.');
    const stillLegacy=await pool.query("SELECT images FROM products WHERE slug='embroidered-lawn-suit-maroon'");
    assert(stillLegacy.rows[0].images[0]==='/products/suit-.jpg','Legacy image compatibility modified the database record.');
  } finally {
    await pool.query('UPDATE products SET images=$1 WHERE slug=$2',[JSON.stringify(originalImages),'embroidered-lawn-suit-maroon']);
  }
  const marker=await pool.query("SELECT value FROM app_metadata WHERE key='catalog-seed-v1'");
  assert(marker.rows[0]?.value==='complete','Catalog seed completion marker was not persisted.');

  const png=await sharp({create:{width:1,height:1,channels:3,background:'#ffffff'}}).png().toBuffer();
  const form=new FormData();
  form.set('file',new Blob([png],{type:'image/png'}),'pixel.png');
  const unauthUpload=await request('/api/admin/upload/',{method:'POST',body:form});
  assert(unauthUpload.status===401,'Unauthenticated upload API did not reject the request.');
  const upload=await admin('/api/admin/upload/',{method:'POST',body:form});
  if(upload.status!==201)throw new Error(`Image upload failed (${upload.status}): ${await upload.text()}`);
  const image=await upload.json();
  imageUrls.push(image.url);
  const served=await fetch(new URL(image.url,base));
  assert(served.ok&&served.headers.get('content-type')==='image/webp','Sanitized upload did not serve as WebP.');
  const fake=new FormData();
  fake.set('file',new Blob(['not image data'],{type:'image/png'}),'fake.png');
  const invalidUpload=await admin('/api/admin/upload/',{method:'POST',body:fake});
  assert(invalidUpload.status===400,'Malformed image upload was not rejected.');

  const create=await admin('/api/admin/products/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Integration smoke product',slug:sku.toLowerCase(),description:'Disposable integration fixture',category:'lawn-suits',price:2000,salePrice:1500,stock:5,sku,images:[image.url],colors:[],sizes:['Unstitched'],tags:[]})});
  if(create.status!==201)throw new Error(`Product create failed (${create.status}): ${await create.text()}`);
  let product=await create.json();
  productId=product.id;
  let listed=await readProducts();
  assert(listed.some(p=>p.id===productId),'Created product was not persisted/listed.');

  const update=await admin(`/api/admin/products/${productId}/`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...product,name:'Integration smoke product updated',description:'CRUD update verified'})});
  assert(update.status===200,`Product update failed (${update.status}).`);
  product=await update.json();
  assert(product.name==='Integration smoke product updated','Updated product values were not returned.');

  const orderA={idempotencyKey:idempotencyKeys[0],customer:{name:'Smoke Cancellation Test',email:emails[0],phone:'+923001234567'},shipping:{address:'1 Test Road',city:'Lahore',postal:'54000',country:'Pakistan'},deliveryMethod:'standard',paymentMethod:'cod',items:[{productId,quantity:1,expectedUnitPrice:1500,size:'Unstitched',color:''}]};
  const unsupportedPayment=await postOrder({...orderA,idempotencyKey:randomUUID(),paymentMethod:'card'});
  assert(unsupportedPayment.status===400,'Checkout accepted a payment method that is not available.');
  const priceMismatch=await postOrder({...orderA,idempotencyKey:randomUUID(),items:[{...orderA.items[0],expectedUnitPrice:1}]});
  assert(priceMismatch.status===409,'Checkout accepted a stale displayed price.');
  const first=await postOrder(orderA);
  const firstBody=await first.json();
  assert(first.status===201&&firstBody.total===1870,`Standard pricing mismatch: status=${first.status}, body=${JSON.stringify(firstBody)}.`);
  primaryOrderNumber=firstBody.orderNumber;
  const emailDeadline=Date.now()+10000;
  while(Date.now()<emailDeadline&&receivedEmails.filter(message=>message.includes(primaryOrderNumber)).length<2)await new Promise(resolve=>setTimeout(resolve,100));
  const outbox=await pool.query('SELECT sent_at,attempts,last_error,customer_sent_at,customer_attempts,customer_last_error FROM order_notifications WHERE order_number=$1',[primaryOrderNumber]);
  const orderEmails=receivedEmails.filter(message=>message.includes(primaryOrderNumber));
  assert(orderEmails.length===2,`Admin and customer order emails were not both delivered (messages=${orderEmails.length}, admin error=${outbox.rows[0]?.last_error}, customer error=${outbox.rows[0]?.customer_last_error}).`);
  const customerConfirmation=orderEmails.find(message=>message.includes(emails[0])&&message.includes('Your Noreh.pk order'));
  const customerMailFields={recipient:Boolean(customerConfirmation),address:Boolean(customerConfirmation?.includes('1 Test Road')),item:Boolean(customerConfirmation?.includes('Integration smoke product updated')),payment:Boolean(customerConfirmation?.includes('Cash on Delivery')),total:Boolean(customerConfirmation?.includes('Total: PKR 1,870'))};
  assert(Object.values(customerMailFields).every(Boolean),`Customer confirmation omitted required details: ${JSON.stringify(customerMailFields)}.`);
  assert(Boolean(outbox.rows[0]?.sent_at)&&outbox.rows[0]?.attempts===1&&Boolean(outbox.rows[0]?.customer_sent_at)&&outbox.rows[0]?.customer_attempts===1,'Order email outbox did not independently record both successful deliveries.');
  const retry=await postOrder(orderA);
  const retryBody=await retry.json();
  assert(retry.status===200&&retryBody.orderNumber===primaryOrderNumber,'Checkout retry created a duplicate order.');
  await new Promise(resolve=>setTimeout(resolve,300));
  assert(receivedEmails.length===2,'An idempotent checkout retry sent duplicate order emails.');
  await pool.query('UPDATE order_notifications SET sent_at=NULL WHERE order_number=$1',[primaryOrderNumber]);
  const retryEmail=await admin(`/api/admin/orders/${primaryOrderNumber}/notification/`,{method:'POST'});
  assert(retryEmail.status===200&&(await retryEmail.json()).sent,'Admin could not retry a queued order notification.');
  assert(receivedEmails.length===3,'Queued notification retry did not deliver exactly one additional admin email.');
  const oversell=await postOrder({...orderA,idempotencyKey:randomUUID(),items:[{...orderA.items[0],quantity:5}]});
  assert(oversell.status===409,'Checkout accepted more units than were in stock.');
  listed=await readProducts();
  assert(listed.find(p=>p.id===productId)?.stock===4,'Retry or oversell changed stock incorrectly.');

  await setStatus(primaryOrderNumber,'cancelled');
  await setStatus(primaryOrderNumber,'cancelled');
  await setStatus(primaryOrderNumber,'processing',409);
  listed=await readProducts();
  assert(listed.find(p=>p.id===productId)?.stock===5,'Cancellation did not restore stock exactly once.');
  let orders=await readOrders();
  assert(orders.find(o=>o.order_number===primaryOrderNumber)?.status==='cancelled','Cancellation status was not persisted.');

  // Express order checks base price, express shipping, tax, and forward status persistence.
  const repriced=await admin(`/api/admin/products/${productId}/`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...product,name:'Integration smoke product updated',price:6500,salePrice:null,stock:5})});
  assert(repriced.status===200,`Product repricing failed (${repriced.status}).`);
  product=await repriced.json();
  const orderB={idempotencyKey:idempotencyKeys[1],customer:{name:'Smoke Status Test',email:emails[1],phone:'+923001234568'},shipping:orderA.shipping,deliveryMethod:'express',paymentMethod:'cod',items:[{productId,quantity:1,expectedUnitPrice:6500,size:'Unstitched',color:''}]};
  const express=await postOrder(orderB);
  const expressBody=await express.json();
  assert(express.status===201&&expressBody.total===7520,`Express pricing mismatch: status=${express.status}, body=${JSON.stringify(expressBody)}.`);
  const expressNumber=expressBody.orderNumber;
  for(const status of ['processing','shipped','completed']) await setStatus(expressNumber,status);
  orders=await readOrders();
  assert(orders.find(o=>o.order_number===expressNumber)?.status==='completed','Completed status was not persisted in the order list.');
  await setStatus(expressNumber,'cancelled',409);
  listed=await readProducts();
  assert(listed.find(p=>p.id===productId)?.stock===4,'A rejected completed-order cancellation changed stock.');

  // Standard shipping becomes free for subtotal > PKR 5,000.
  const orderC={idempotencyKey:idempotencyKeys[2],customer:{name:'Smoke Free Shipping Test',email:emails[2],phone:'+923001234569'},shipping:orderA.shipping,deliveryMethod:'standard',paymentMethod:'cod',items:[{productId,quantity:1,expectedUnitPrice:6500,size:'Unstitched',color:''}]};
  const freeShip=await postOrder(orderC);
  const freeShipBody=await freeShip.json();
  assert(freeShip.status===201&&freeShipBody.total===7020,`Free-shipping pricing mismatch: status=${freeShip.status}, body=${JSON.stringify(freeShipBody)}.`);
  const orderNumbers=[primaryOrderNumber,expressNumber,freeShipBody.orderNumber];
  const allEmailsDeadline=Date.now()+10000;
  while(Date.now()<allEmailsDeadline&&!orderNumbers.every((number,index)=>receivedEmails.some(message=>message.includes(number)&&message.includes(emails[index])&&message.includes('Your Noreh.pk order'))))await new Promise(resolve=>setTimeout(resolve,100));
  assert(orderNumbers.every(number=>receivedEmails.some(message=>message.includes(number))),'Not every new order produced an SMTP notification.');
  assert(orderNumbers.every((number,index)=>receivedEmails.some(message=>message.includes(number)&&message.includes(emails[index])&&message.includes('Your Noreh.pk order'))),'Not every customer received an order confirmation email.');
  const outboxDeadline=Date.now()+10000;
  let allOutbox;
  do {
    allOutbox=await pool.query('SELECT count(*)::int total,count(*) FILTER(WHERE sent_at IS NOT NULL)::int admin_sent,count(*) FILTER(WHERE customer_sent_at IS NOT NULL)::int customer_sent FROM order_notifications WHERE order_number=ANY($1::text[])',[orderNumbers]);
    if(allOutbox.rows[0].total===3&&allOutbox.rows[0].admin_sent===3&&allOutbox.rows[0].customer_sent===3)break;
    await new Promise(resolve=>setTimeout(resolve,100));
  } while(Date.now()<outboxDeadline);
  assert(allOutbox.rows[0].total===3&&allOutbox.rows[0].admin_sent===3&&allOutbox.rows[0].customer_sent===3,`Not every order had both admin and customer emails recorded as sent: ${JSON.stringify(allOutbox.rows[0])}.`);

  const deletion=await admin(`/api/admin/products/${productId}/`,{method:'DELETE'});
  assert(deletion.status===200,'Product delete API failed.');
  listed=await readProducts();
  assert(!listed.some(p=>p.id===productId),'Deleted product still appears in admin product list.');

  console.log(`PASS: ${seedWasFresh?'fresh schema and 20-row catalog seed':'existing clean seed baseline'}, admin auth, product CRUD, sanitized upload, price/variant/stock checks, standard/express/free shipping totals, idempotent checkout, exactly-once notifications on retry, SMTP delivery for new orders, cancellation stock restore, status transitions and persistence. Cleanup runs in finally.`);
} finally {
  // This script is hard-gated to a fresh local noreh_smoke_test DB; delete only this run's tagged records.
  if(cleanupAllowed) try {
    await pool.query("DELETE FROM orders WHERE customer->>'email'=ANY($1::text[])",[emails]);
    await pool.query('DELETE FROM products WHERE sku=$1',[sku]);
    const left=await pool.query("SELECT (SELECT count(*)::int FROM orders WHERE customer->>'email'=ANY($1::text[])) orders,(SELECT count(*)::int FROM products WHERE sku=$2) products",[emails,sku]);
    if(left.rows[0].orders||left.rows[0].products)throw new Error('Tagged database fixtures remain after cleanup.');
  } catch(error) { cleanupFailed=true;console.error('Database fixture cleanup failed; remove only this run’s smoke emails/SKU from noreh_smoke_test.',error); }
  const finalUploadFiles=await readdir(uploadDir).catch(()=>[]);
  for(const filename of finalUploadFiles){
    if(!initialUploadFiles.has(filename)&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(filename)) await unlink(path.join(uploadDir,filename)).catch(error=>{if(error.code!=='ENOENT'){cleanupFailed=true;console.error('Uploaded fixture image cleanup failed.',error);}});
  }
  await pool.end();
  if(smtpStarted)await new Promise(resolve=>smtpServer.close(resolve));
  if(cleanupFailed)process.exitCode=1;
}
