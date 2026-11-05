import { Pool } from 'pg';
import { legacyProductImageBySlug, products as catalog } from '@/lib/products';
import { availableProductSizes } from '@/lib/product-sizes';

const globalForPool = globalThis as unknown as { norehPool?: Pool };
export const pool = globalForPool.norehPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});
if (process.env.NODE_ENV !== 'production') globalForPool.norehPool = pool;

let initialized: Promise<void> | undefined;
export function initializeDatabase() {
  if (!process.env.DATABASE_URL) return Promise.reject(new Error('DATABASE_URL is required'));
  if (!initialized) {
    const setup = (async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Serialize DDL and seeding across worker processes as well as requests.
        await client.query("SELECT pg_advisory_xact_lock(hashtext('noreh-schema-v1'))");
        await client.query(`CREATE TABLE IF NOT EXISTS products (
          id text PRIMARY KEY, name text NOT NULL, slug text UNIQUE NOT NULL, description text NOT NULL DEFAULT '',
          category text NOT NULL, gender text NOT NULL DEFAULT 'women', collection text NOT NULL DEFAULT '', brand text NOT NULL DEFAULT 'Noreh.pk',
          price integer NOT NULL CHECK(price >= 0), sale_price integer CHECK(sale_price >= 0), images jsonb NOT NULL DEFAULT '[]',
          colors jsonb NOT NULL DEFAULT '[]', sizes jsonb NOT NULL DEFAULT '[]', stock integer NOT NULL DEFAULT 0 CHECK(stock >= 0),
          sku text NOT NULL UNIQUE, rating numeric NOT NULL DEFAULT 5, review_count integer NOT NULL DEFAULT 0, reviews jsonb NOT NULL DEFAULT '[]',
          tags jsonb NOT NULL DEFAULT '[]', featured boolean NOT NULL DEFAULT false, is_new_arrival boolean NOT NULL DEFAULT false,
          is_best_seller boolean NOT NULL DEFAULT false, material text NOT NULL DEFAULT '', care_instructions text NOT NULL DEFAULT '',
          shipping_info text NOT NULL DEFAULT '', return_policy text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS orders (
          id bigserial PRIMARY KEY, order_number text UNIQUE NOT NULL, idempotency_key text,
          customer jsonb NOT NULL, shipping jsonb NOT NULL, payment_method text NOT NULL, delivery_method text NOT NULL,
          items jsonb NOT NULL, subtotal integer NOT NULL, shipping_total integer NOT NULL, tax integer NOT NULL,
          total integer NOT NULL, status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
        )`);
        // Upgrade databases created by earlier versions without requiring a manual reset.
        await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text');
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique ON orders(idempotency_key)');
        await client.query('CREATE TABLE IF NOT EXISTS app_metadata (key text PRIMARY KEY, value text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())');

        // Migration ledger: this code version is the baseline for databases created before migrations were tracked.
        await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
        await client.query("INSERT INTO schema_migrations(version) VALUES('001_core_schema') ON CONFLICT DO NOTHING");
        const outboxMigration = await client.query("SELECT 1 FROM schema_migrations WHERE version='002_order_email_outbox'");
        if (!outboxMigration.rowCount) {
          await client.query(`CREATE TABLE order_notifications (
            order_number text PRIMARY KEY REFERENCES orders(order_number) ON DELETE CASCADE,
            recipient text NOT NULL, payload jsonb NOT NULL,
            attempts integer NOT NULL DEFAULT 0 CHECK(attempts >= 0),
            last_error text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
          )`);
          await client.query("INSERT INTO schema_migrations(version) VALUES('002_order_email_outbox')");
        }
        const customerEmailMigration = await client.query("SELECT 1 FROM schema_migrations WHERE version='003_customer_order_email'");
        if (!customerEmailMigration.rowCount) {
          await client.query('ALTER TABLE order_notifications ADD COLUMN IF NOT EXISTS customer_sent_at timestamptz');
          await client.query('ALTER TABLE order_notifications ADD COLUMN IF NOT EXISTS customer_attempts integer NOT NULL DEFAULT 0 CHECK(customer_attempts >= 0)');
          await client.query('ALTER TABLE order_notifications ADD COLUMN IF NOT EXISTS customer_last_error text');
          await client.query("INSERT INTO schema_migrations(version) VALUES('003_customer_order_email')");
        }

        const seeded = await client.query("SELECT 1 FROM app_metadata WHERE key='catalog-seed-v1'");
        if (!seeded.rowCount) {
          const { rows } = await client.query('SELECT count(*)::int AS count FROM products');
          if (rows[0].count === 0) {
            for (const p of catalog) await client.query(
              `INSERT INTO products(id,name,slug,description,category,gender,collection,brand,price,sale_price,images,colors,sizes,stock,sku,rating,review_count,reviews,tags,featured,is_new_arrival,is_best_seller,material,care_instructions,shipping_info,return_policy)
               VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) ON CONFLICT DO NOTHING`,
              [p.id,p.name,p.slug,p.description,p.category,p.gender,p.collection,p.brand,p.price,p.salePrice ?? null,JSON.stringify(p.images),JSON.stringify(p.colors),JSON.stringify(p.sizes),p.stock,p.sku,p.rating,p.reviewCount,JSON.stringify(p.reviews),JSON.stringify(p.tags),p.featured,p.isNewArrival,p.isBestSeller,p.material,p.careInstructions,p.shippingInfo,p.returnPolicy]
            );
          }
          // Record completion even for an intentionally pre-populated/empty catalog.
          await client.query("INSERT INTO app_metadata(key,value) VALUES('catalog-seed-v1','complete') ON CONFLICT DO NOTHING");
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      } finally { client.release(); }
    })();
    initialized = setup.catch(error => { initialized = undefined; throw error; });
  }
  return initialized;
}

export function fromRow(r: any) {
  const storedImages = Array.isArray(r.images) ? r.images : [];
  const seededSku = typeof r.sku === 'string' ? /^NR-(\d{4})$/.exec(r.sku) : null;
  const skuImage = seededSku && Number(seededSku[1]) >= 1 && Number(seededSku[1]) <= 20
    ? `/products/suit-${seededSku[1]}.jpg`
    : undefined;
  const legacyFallback = legacyProductImageBySlug[r.slug] || skuImage || '/products/suit-01.jpg';
  const images = storedImages.map((image: unknown) => image === '/products/suit-.jpg' ? legacyFallback : image);
  return { id:r.id,name:r.name,slug:r.slug,description:r.description,category:r.category,gender:r.gender,collection:r.collection,brand:r.brand,price:r.price,salePrice:r.sale_price ?? undefined,images,colors:r.colors,sizes:availableProductSizes({ category:r.category, sizes:r.sizes }),stock:r.stock,sku:r.sku,rating:Number(r.rating),reviewCount:r.review_count,reviews:r.reviews,tags:r.tags,featured:r.featured,isNewArrival:r.is_new_arrival,isBestSeller:r.is_best_seller,material:r.material,careInstructions:r.care_instructions,shippingInfo:r.shipping_info,returnPolicy:r.return_policy };
}
