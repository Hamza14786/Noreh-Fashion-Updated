# Noreh.pk

Next.js storefront with a Node.js admin API and PostgreSQL-backed catalog and orders. Static export and static-only hosting are not supported.

## Requirements

- Node.js 20.11 or later (needed for the documented `--env-file` command).
- PostgreSQL 14 or later, local or managed.
- A Node.js host with writable persistent storage for uploaded product images. Do not deploy this local-disk upload implementation to an ephemeral/serverless filesystem.

## Local setup

1. Create a database and a dedicated owner role. For a local PostgreSQL installation, open `psql -U postgres` and run, replacing the example password with a unique one:

   ```sql
   CREATE ROLE noreh LOGIN PASSWORD 'replace-with-a-database-password';
   CREATE DATABASE noreh OWNER noreh;
   ```

2. Copy the environment template and edit it. PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   notepad .env.local
   ```

   Set `DATABASE_URL`, a real `ADMIN_EMAIL`, an `ADMIN_PASSWORD` generated with a password manager (at least 16 characters), and an independent random `ADMIN_SESSION_SECRET` of at least 32 characters. For example, generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Keep `.env.local` private; it is git-ignored. The admin account is bootstrapped from these server-only environment variables, not from a public registration route or a database default. The sample file deliberately contains blank admin credentials; login fails closed until they are set.

3. Install and start the app:

   ```sh
   # Stop any existing Next.js process before replacing node_modules.
   npm ci
   npm run dev
   ```

4. Visit `http://localhost:3000/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Schema setup and the one-time catalog seed run on the first database-backed request.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string, such as `postgresql://noreh:<url-encoded-password>@localhost:5432/noreh`. The database role must own the database or have permission to create and alter tables, indexes, and rows.
- `DATABASE_SSL`: `false` for local PostgreSQL; set `true` when a managed database requires TLS and presents a certificate trusted by Node.js.
- `ADMIN_EMAIL`: the one configured administrator's sign-in email.
- `ADMIN_PASSWORD`: the administrator password (minimum 16 characters). Store it in the deployment secret manager; it is compared server-side and is never sent to the browser.
- `ADMIN_SESSION_SECRET`: independent random signing secret (minimum 32 characters). Changing it invalidates existing admin sessions. Password changes alone do not invalidate sessions already issued.
- `UPLOAD_DIR`: optional absolute path for the image files. Defaults to `<working-directory>/.data/uploads`. This directory must be writable and persist across deploys/restarts, and shared by all app instances that serve product images.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`: optional SMTP delivery settings. Set `SMTP_HOST`, `SMTP_FROM`, and either `ORDER_NOTIFICATION_EMAIL` or `ADMIN_EMAIL` to enable new-order messages. `SMTP_USER` and `SMTP_PASSWORD` must either both be set or both be blank. Use port 465 with `SMTP_SECURE=true` for implicit TLS, or a STARTTLS provider such as port 587 with `SMTP_SECURE=false`.
- `ORDER_NOTIFICATION_EMAIL`: optional mailbox for new-order notifications; defaults to `ADMIN_EMAIL`.
- `BASE_URL`: optional base URL used only by the integration smoke test (defaults to `http://localhost:3000`).
- `ALLOW_DESTRUCTIVE_SMOKE`: set to exactly `YES` only for the integration smoke test after verifying it points to the local `noreh_smoke_test` database. The script refuses remote hosts or other database names.

## Database initialization and catalog seeding

On the first database-backed request, the app takes a PostgreSQL advisory lock and applies the versioned `001_core_schema` baseline, `002_order_email_outbox`, and `003_customer_order_email` migrations in one transaction, creating/upgrading the `products`, `orders`, `app_metadata`, `schema_migrations`, and `order_notifications` tables plus the unique order idempotency index. Existing data is retained. The initializer retries after a transient failure rather than caching a rejected initialization promise for the lifetime of the process.

The catalog seed is one-time, recorded by `app_metadata.catalog-seed-v1`. If the products table is empty and the marker does not exist, the original local catalog is inserted. If the database already contains products, it is preserved and the seed is marked complete. Deleting all products later does not cause the original catalog to reappear. Back up PostgreSQL before deploying schema changes; no catalog or order data is reset by this initializer.

## Authentication and public routes

The admin session is an eight-hour HMAC-signed, HTTP-only, `SameSite=Strict` cookie; it is `Secure` in production. All product mutations, image upload, admin order reads/status changes, and overview data require a valid session. The `/admin` page itself is public so it can show the sign-in form, but it does not include protected data; dashboard data is fetched from protected APIs.

Intentionally public routes are admin login/logout/session status, `GET /api/products`, `POST /api/checkout`, and the UUID-addressed product image route. Login has a small per-process attempt limit. In production, put the app behind a trusted reverse proxy that overwrites forwarded client IP headers and enable shared rate limiting at the proxy/edge for `/api/admin/login` and `/api/checkout`; in-memory login limits are not shared across multiple server processes. Use HTTPS. Admin state-changing routes require the strict same-site HTTP-only session cookie; do not loosen its cookie policy.

## Orders, stock, and payment

Checkout sends product IDs, expected unit prices, and quantities; expected prices are comparison values only and never determine the charged/order price. The server reads current prices, variants, and stock from PostgreSQL, calculates subtotal, shipping (PKR 250 standard, free above PKR 5,000; PKR 500 express), and 8% tax rounded to a whole PKR, then decrements stock and creates the order in one transaction. If a displayed price changed, checkout asks the customer to review the refreshed total before submitting again. Product rows are locked in stable ID order. The checkout uses a unique idempotency key, so retrying the same cart after a response timeout returns the original order without decrementing stock twice. Inventory is restored once when a `pending` or `processing` order is cancelled; shipped/completed orders cannot be cancelled through this endpoint, and cancelled orders cannot be reopened. Cash on Delivery is the only checkout payment method; the API rejects unsupported payment method values. No card processor is connected and no card details are collected or sent.

When SMTP is configured, checkout writes a notification to the transactional outbox with the order, then sends separate admin and customer emails after the order commits. The customer confirmation includes the order number, line items, total breakdown, delivery address and method, contact phone, and Cash on Delivery payment method. SMTP failure never turns a successfully placed order into a checkout error; admin and customer delivery statuses/errors are tracked independently in `order_notifications` and can be retried by an authorized admin with `POST /api/admin/orders/:orderNumber/notification`. An idempotent checkout retry also attempts any unsent email. Email delivery is at-least-once if a process stops after an SMTP server accepts a message but before PostgreSQL records its sent timestamp.

The `003_customer_order_email` migration adds independent delivery tracking for customer confirmations without removing or rewriting existing order data. Existing product records that still contain the old `/products/suit-.jpg` placeholder are returned by catalog/admin reads with the matching local catalog image based on product slug or original catalog SKU; this mapping does not update the database, so existing data is preserved without reseeding or a data migration.

## Image storage

Authenticated uploads are capped at 5 MB, decoded with Sharp with a 40-megapixel limit, orientation-corrected, resized to at most 3000 × 3000, stripped of source metadata, and re-encoded as WebP. Files are stored under `UPLOAD_DIR`, outside Next's build-time `public` asset index, and served by a runtime route that accepts only UUID WebP names. For production, mount durable writable storage at `UPLOAD_DIR` and retain it across deploys. If using multiple instances, mount the same shared volume on each. Netlify/Vercel-style ephemeral function storage is not compatible with this implementation without replacing the storage adapter with durable object storage.

## Verification

Run static checks from the project directory:

```sh
npm run typecheck
npm run build
npm audit --omit=dev
```

### Disposable PostgreSQL integration setup

Do not point these tests at production, staging, or a database containing customer data. The integration script accepts only a loopback PostgreSQL host and database named exactly `noreh_smoke_test`, and also requires `ALLOW_DESTRUCTIVE_SMOKE=YES`. It refuses to start if that database is neither fresh nor at the clean seeded baseline.

1. Select a local PostgreSQL service. On this workstation PostgreSQL 17 listens on port `5432` and PostgreSQL 18 on `5433`. Connect as a PostgreSQL superuser (for example, use the matching `psql` executable and `-p 5432` or `-p 5433`) and create a dedicated test-only role and database. Replace the password with a randomly generated password; keep it separate from all other databases.

   ```sql
   CREATE ROLE noreh_smoke LOGIN PASSWORD 'replace-with-a-unique-test-password';
   CREATE DATABASE noreh_smoke_test OWNER noreh_smoke;
   ```

   The role must own this database so the app can create and alter its test tables. If PostgreSQL asks for the superuser password and you do not have it, stop here and ask the database administrator to create this role/database; do not change either existing PostgreSQL service's authentication settings.

2. Create the smoke-test environment file (it is git-ignored):

   ```powershell
   Copy-Item .env.smoke.example .env.smoke.local
   notepad .env.smoke.local
   ```

   Set `DATABASE_URL` to `postgresql://noreh_smoke:<URL-encoded-test-password>@127.0.0.1:5432/noreh_smoke_test` (use port `5433` if selecting PostgreSQL 18), `DATABASE_SSL=false`, a unique test admin password of at least 16 characters, an independent session secret of at least 32 characters, and an absolute `UPLOAD_DIR` ending in `noreh-smoke-uploads`. Set `ALLOW_DESTRUCTIVE_SMOKE=YES` only after checking the URL host and database name. Do not put production credentials in this file.

3. Stop any existing Next.js process before installing or replacing dependencies. Then run `npm ci`, start the app using the smoke environment, and leave that terminal running:

   ```sh
   npm run dev:smoke
   ```

4. In a second terminal in the project directory, run:

```sh
npm run smoke:upload
npm run smoke:integration
npm run smoke:admin-ui
```

`smoke:upload` checks cookie flags, unauthenticated upload rejection, valid image sanitization/serving, and invalid image rejection; it removes UUID-named images created during its run. `smoke:integration` checks first-run schema initialization and the 20-row catalog seed (or verifies that clean seed baseline on repeat runs), admin auth, product create/read/update/delete, image upload and cleanup, legacy image placeholder compatibility without a database rewrite, COD-only payment validation, standard/express/free-shipping totals, tax, stale-price and oversell rejection, duplicate checkout retry, stock decrement/restoration, terminal cancellation, order status persistence through processing/shipped/completed, and admin plus customer SMTP messages with independent outbox status.

`smoke:admin-ui` uses installed Microsoft Edge or Chrome in headless mode to exercise the actual `/admin` interface against the disposable database. It checks sign-in, overview, product create/edit and image upload, inventory changes, order details/status/cancellation, notification retry, product deletion, mobile navigation, and the COD-only storefront checkout payment UI. The script runs a local SMTP capture server, uses tagged fixtures, and cleans its order, product, and generated image. Keep the smoke SMTP settings in `.env.smoke.local`; never copy them into production configuration.

The integration script requires either a new empty database or the clean post-run baseline of exactly 20 catalog products, the seed marker, and zero orders. It uses random per-run SKU/email/key values. Its `finally` cleanup deletes only orders bearing those generated customer emails, its generated product SKU, and UUID-named images created during that run in the configured smoke upload directory. It leaves the app's 20 seeded catalog rows and seed marker, which are the baseline being verified. If the process is force-killed or cleanup reports a failure, do not point it at another database; recreate `noreh_smoke_test` from scratch before rerunning.

Verification performed for this revision: `smoke:upload`, `smoke:integration`, and `smoke:admin-ui` passed against a temporary, loopback-only PostgreSQL 17 cluster and dedicated temporary upload directory. The cluster was initialized solely for these tests, not copied from another database. Tests returned the database to the clean seeded baseline (20 products, zero orders, seed marker `complete`) and removed the temporary cluster, upload directory, and credentials. These results do not constitute a test against staging or production infrastructure.

## Production deployment

Use a persistent Node.js VM/container or equivalent host, not static hosting. Configure the database and admin secrets in the host's secret manager, configure durable writable `UPLOAD_DIR`, ensure all instances share that directory, and configure the trusted proxy/edge to overwrite forwarded IP headers and rate-limit `/api/admin/login` and `/api/checkout`. Then deploy with:

```sh
npm ci
npm run typecheck
npm run build
npm start
```

Expose the app through HTTPS and monitor PostgreSQL backups, disk capacity, and application logs. The repository's existing Netlify configuration is retained for the original storefront, but it does not provide durable uploads and is not a supported deployment target for this backend as written.

## API summary

- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`
- `GET /api/admin/overview`, `GET|POST /api/admin/products`, `PUT|DELETE /api/admin/products/:id`
- `POST /api/admin/upload`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:orderNumber`
- `POST /api/admin/orders/:orderNumber/notification` (retry a queued notification)
- `GET /api/products`, `POST /api/checkout`
