import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { Pool } from 'pg';
import sharp from 'sharp';
import { SMTPServer } from 'smtp-server';

const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const runId = randomUUID();
const sku = `ADMIN-UI-${runId}`;
const customerEmail = `admin-ui-${runId}@example.test`;
const databaseUrl = process.env.DATABASE_URL;
const uploadDir = process.env.UPLOAD_DIR;
const smtpPort = Number(process.env.SMTP_PORT || 2526);
const receivedEmails = [];
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

if (process.env.ALLOW_DESTRUCTIVE_SMOKE !== 'YES') throw new Error('Refusing to run without ALLOW_DESTRUCTIVE_SMOKE=YES. Use only the isolated smoke database.');
if (!databaseUrl || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set test-only DATABASE_URL and admin credentials.');
if (!uploadDir || !path.isAbsolute(uploadDir) || !/noreh[-_]smoke[-_]uploads/i.test(uploadDir)) throw new Error('UPLOAD_DIR must be a dedicated absolute noreh-smoke-uploads path.');
const dbUrl = new URL(databaseUrl);
const databaseName = decodeURIComponent(dbUrl.pathname.replace(/^\//, ''));
if (!['localhost', '127.0.0.1', '[::1]'].includes(dbUrl.hostname) || databaseName.toLowerCase() !== 'noreh_smoke_test') {
  throw new Error('Refusing database access: only a loopback noreh_smoke_test database is allowed.');
}

const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined });
const initialUploads = new Set(await readdir(uploadDir).catch(() => []));
let productId;
let cleanupAllowed = false;
let smtpStarted = false;
let browser;
let stage = 'database baseline';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const waitFor = async (predicate, message, timeout = 10000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(message);
};

try {
  const before = await pool.query(`SELECT to_regclass('public.products') products,to_regclass('public.orders') orders,to_regclass('public.app_metadata') metadata`);
  const schema = before.rows[0];
  if (!schema.products && !schema.orders && !schema.metadata) cleanupAllowed = true;
  else {
    assert(schema.products && schema.orders && schema.metadata, 'Smoke DB is partially initialized. Use a fresh isolated noreh_smoke_test database.');
    const baseline = await pool.query("SELECT (SELECT count(*)::int FROM products) products,(SELECT count(*)::int FROM orders) orders,(SELECT value FROM app_metadata WHERE key='catalog-seed-v1') seed");
    assert(baseline.rows[0].products === 20 && baseline.rows[0].orders === 0 && baseline.rows[0].seed === 'complete', 'Smoke DB is not at the clean 20 product / zero order baseline.');
    cleanupAllowed = true;
  }
  await new Promise((resolve, reject) => smtpServer.listen(smtpPort, '127.0.0.1', error => error ? reject(error) : resolve()));
  smtpStarted = true;

  stage = 'launching browser';
  const executablePath = process.env.EDGE_PATH || [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].find(candidate => existsSync(candidate));
  if (!executablePath) throw new Error('Install Microsoft Edge or Chrome, or set EDGE_PATH to its executable.');
  browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  stage = 'admin sign-in';
  await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL);
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: 'Overview' }).waitFor({ state: 'visible' });
  assert(await page.getByText('20', { exact: true }).count() > 0, 'Dashboard overview did not load product data.');

  stage = 'product create and image upload';
  await page.getByRole('button', { name: 'Products' }).click();
  await page.getByRole('button', { name: 'Add product' }).click();
  const name = `Noreh admin UI ${runId.slice(0, 8)}`;
  await page.getByLabel('Product name *').fill(name);
  await page.getByLabel('SKU *').fill(sku);
  await page.getByLabel('Regular price (PKR) *').fill('2400');
  await page.getByLabel('Stock on hand *').fill('3');
  await page.getByLabel('Available sizes').fill('');
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#876b55' } }).png().toBuffer();
  await page.getByLabel('Choose images').setInputFiles({ name: 'admin-smoke.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: 'Remove image 1' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Save product' }).click();
  await page.getByRole('table').getByText(name, { exact: true }).waitFor({ state: 'visible' });

  stage = 'product edit and inventory';
  let row = page.locator('tr').filter({ hasText: sku });
  await row.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Product name *').fill(`${name} updated`);
  await page.getByRole('button', { name: 'Save product' }).click();
  await page.getByRole('table').getByText(`${name} updated`, { exact: true }).waitFor({ state: 'visible' });

  row = page.locator('tr').filter({ hasText: sku });
  await row.getByLabel(`Stock for ${name} updated`).fill('7');
  await row.getByRole('button', { name: 'Save', exact: true }).click();
  await waitFor(async () => (await row.getByLabel(`Stock for ${name} updated`).inputValue()) === '7', 'Inventory value did not refresh after saving.');

  stage = 'creating and managing a test order';
  const catalogResponse = await context.request.get(`${base}/api/admin/products`);
  assert(catalogResponse.ok(), 'Could not read the created product through the admin API.');
  const createdProduct = (await catalogResponse.json()).find(product => product.sku === sku);
  assert(createdProduct && createdProduct.images.length === 1, 'Product image or product record was not saved.');
  productId = createdProduct.id;
  const checkout = await context.request.post(`${base}/api/checkout`, { data: {
    idempotencyKey: randomUUID(),
    customer: { name: 'Admin UI Test Customer', email: customerEmail, phone: '+923000000001' },
    shipping: { address: '1 Test Road', city: 'Lahore', postal: '54000', country: 'Pakistan' },
    deliveryMethod: 'standard', paymentMethod: 'cod',
    items: [{ productId, quantity: 1, expectedUnitPrice: createdProduct.price, size: '', color: '' }],
  } });
  assert(checkout.status() === 201, `Checkout fixture failed (${checkout.status()}): ${await checkout.text()}`);
  const order = await checkout.json();
  await waitFor(() => receivedEmails.some(message => message.includes(order.orderNumber) && message.includes(customerEmail)), 'Customer order confirmation email was not delivered through the capture SMTP server.');
  const confirmationMessage = receivedEmails.find(message => message.includes(order.orderNumber) && message.includes(customerEmail));
  assert(confirmationMessage && confirmationMessage.includes('1 Test Road') && confirmationMessage.includes('Cash on Delivery'), 'Customer confirmation did not include delivery details and payment method.');

  stage = 'order details, status, and notification';
  await page.getByRole('button', { name: 'Refresh' }).click();
  await page.getByRole('button', { name: 'Orders' }).click();
  const orderRow = page.getByRole('row').filter({ hasText: order.orderNumber });
  await orderRow.waitFor({ state: 'visible' });
  await orderRow.getByRole('button', { name: 'View details' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Admin UI Test Customer', { exact: true }).waitFor({ state: 'visible' });
  await dialog.getByText(name + ' updated', { exact: true }).waitFor({ state: 'visible' });
  await dialog.getByLabel(`Status for order ${order.orderNumber}`).selectOption('processing');
  await waitFor(async () => await dialog.getByLabel(`Status for order ${order.orderNumber}`).inputValue() === 'processing', 'Order status did not update.');
  await dialog.getByRole('button', { name: 'Retry email' }).click();
  await page.getByRole('status').filter({ hasText: 'Notification for' }).waitFor({ state: 'visible' });
  await dialog.getByLabel(`Status for order ${order.orderNumber}`).selectOption('cancelled');
  await waitFor(async () => await dialog.getByLabel(`Status for order ${order.orderNumber}`).inputValue() === 'cancelled', 'Order cancellation did not update.');
  await dialog.getByRole('button', { name: 'Done' }).click();

  stage = 'product deletion and mobile navigation';
  await page.getByRole('button', { name: 'Products' }).click();
  row = page.locator('tr').filter({ hasText: sku });
  await waitFor(async () => (await row.getByLabel(`Stock for ${name} updated`).inputValue()) === '7', 'Cancelled order did not restore stock in the dashboard.');
  page.once('dialog', dialogPrompt => dialogPrompt.accept());
  await row.getByRole('button', { name: `Delete ${name} updated` }).click();
  await page.getByRole('status').filter({ hasText: 'Product deleted' }).waitFor({ state: 'visible' });
  const removed = await context.request.get(`${base}/api/admin/products`);
  assert(!(await removed.json()).some(product => product.sku === sku), 'Deleted product is still present in the API.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('navigation', { name: 'Admin sections' }).getByRole('button', { name: 'Orders' }).click();
  await page.getByRole('heading', { name: 'Orders' }).first().waitFor({ state: 'visible' });
  assert(pageErrors.length === 0, `Browser reported runtime errors: ${pageErrors.join('; ')}`);

  stage = 'storefront checkout payment options';
  const checkoutPage = await context.newPage();
  await checkoutPage.addInitScript(cart => localStorage.setItem('me-cart', JSON.stringify(cart)), [{
    productId: 'p1', name: 'Embroidered Lawn Suit - Maroon', slug: 'embroidered-lawn-suit-maroon',
    price: 4500, image: '/products/suit-01.jpg', size: 'Unstitched', color: 'Maroon', quantity: 1, stock: 10,
  }]);
  await checkoutPage.goto(`${base}/checkout`, { waitUntil: 'domcontentloaded' });
  await checkoutPage.getByText('Payment Method', { exact: true }).waitFor({ state: 'visible' });
  assert(await checkoutPage.getByText('Cash on Delivery', { exact: true }).count() === 1, 'Checkout does not display COD as its only payment option.');
  for (const unsupported of ['Credit / Debit Card', 'Bank Transfer', 'JazzCash', 'Easypaisa']) {
    assert(await checkoutPage.getByText(unsupported, { exact: true }).count() === 0, `Checkout still displays unsupported payment: ${unsupported}.`);
  }
  await checkoutPage.close();
  console.log('PASS: admin sign-in, overview, product create/edit/image upload, inventory, order details/status/cancellation, notification retry, product deletion, mobile navigation, and COD-only storefront checkout UI.');
} catch (error) {
  console.error(`Admin UI smoke failed during ${stage}.`, error);
  throw error;
} finally {
  await browser?.close().catch(() => undefined);
  if (cleanupAllowed) {
    const schema = await pool.query("SELECT to_regclass('public.orders') orders,to_regclass('public.products') products");
    if (schema.rows[0].orders && schema.rows[0].products) {
      await pool.query("DELETE FROM orders WHERE customer->>'email'=$1", [customerEmail]);
      await pool.query('DELETE FROM products WHERE sku=$1', [sku]);
      const remaining = await pool.query("SELECT (SELECT count(*)::int FROM orders WHERE customer->>'email'=$1) orders,(SELECT count(*)::int FROM products WHERE sku=$2) products", [customerEmail, sku]);
      if (remaining.rows[0].orders || remaining.rows[0].products) throw new Error('Admin UI smoke fixtures remain in the isolated database.');
    }
  }
  const finalUploads = await readdir(uploadDir).catch(() => []);
  for (const filename of finalUploads) {
    if (!initialUploads.has(filename) && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(filename)) {
      await unlink(path.join(uploadDir, filename)).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  await pool.end();
  if (smtpStarted) await new Promise(resolve => smtpServer.close(resolve));
}
