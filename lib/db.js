/* Postgres storage (works with Vercel's Neon integration, or any Postgres).
   Tables are created and seeded automatically on first use.
   Set DATABASE_URL (Vercel sets it for you when you add the Neon integration). */
import { Pool } from "pg";
import seed from "@/data/products.seed.json";

const g = globalThis; // reuse the pool across hot reloads / warm serverless calls

function pool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!g.__ksrPool) g.__ksrPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10000 });
  return g.__ksrPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key text PRIMARY KEY, value jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY, position int NOT NULL, name text NOT NULL, category text NOT NULL,
  image text, description text, available boolean NOT NULL DEFAULT true, variants jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS orders (
  reference text PRIMARY KEY, items jsonb NOT NULL, total integer NOT NULL, customer jsonb NOT NULL,
  method text NOT NULL, status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz, reported_at timestamptz);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);`;

async function setup() {
  const p = pool();
  await p.query(SCHEMA);
  const { rows } = await p.query("SELECT count(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    // ON CONFLICT DO NOTHING keeps this safe if two requests seed at once
    await p.query("INSERT INTO meta (key, value) VALUES ('categories', $1), ('notes', $2) ON CONFLICT DO NOTHING",
      [JSON.stringify(seed.CATEGORIES), JSON.stringify(seed.STORE_NOTES)]);
    for (const [i, x] of seed.PRODUCTS.entries()) {
      await p.query(
        "INSERT INTO products (id, position, name, category, image, description, variants) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING",
        [x.id, i, x.name, x.category, x.image || null, x.desc || null, JSON.stringify(x.variants)]);
    }
  }
}
function ready() {
  if (!g.__ksrReady) g.__ksrReady = setup().catch((e) => { g.__ksrReady = null; throw e; });
  return g.__ksrReady;
}
async function q(text, params) { await ready(); return pool().query(text, params); }

const toProduct = (r) => ({ id: r.id, name: r.name, category: r.category, image: r.image || undefined, desc: r.description || undefined, available: r.available, variants: r.variants });
const toOrder = (r) => r && ({
  reference: r.reference, items: r.items, total: r.total, customer: r.customer, method: r.method, status: r.status,
  createdAt: r.created_at, paidAt: r.paid_at, reportedAt: r.reported_at,
});

/* ----- catalog ----- */
export async function getMeta() {
  const { rows } = await q("SELECT key, value FROM meta");
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { categories: m.categories || ["All"], notes: m.notes || [] };
}
export async function listProducts({ onlyAvailable = false } = {}) {
  const { rows } = await q(`SELECT * FROM products ${onlyAvailable ? "WHERE available" : ""} ORDER BY position`);
  return rows.map(toProduct);
}
/* patch: { available?: bool, variants?: [{label, price|null}] } (only existing labels change) */
export async function updateProduct(id, patch) {
  await ready();
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const cur = await c.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [id]);
    if (!cur.rows.length) { await c.query("ROLLBACK"); return null; }
    const row = cur.rows[0];
    const variants = row.variants.map((v) => {
      const nv = (patch.variants || []).find((x) => x.label === v.label);
      if (!nv) return v;
      const price = nv.price === null || nv.price === "" ? null : Number(nv.price);
      return price === null || (Number.isFinite(price) && price >= 0) ? { ...v, price } : v;
    });
    const available = typeof patch.available === "boolean" ? patch.available : row.available;
    const { rows } = await c.query("UPDATE products SET available=$2, variants=$3 WHERE id=$1 RETURNING *", [id, available, JSON.stringify(variants)]);
    await c.query("COMMIT");
    return toProduct(rows[0]);
  } catch (e) { await c.query("ROLLBACK").catch(() => {}); throw e; }
  finally { c.release(); }
}

/* ----- orders ----- */
export async function createOrder(o) {
  await q("INSERT INTO orders (reference, items, total, customer, method, status) VALUES ($1,$2,$3,$4,$5,$6)",
    [o.reference, JSON.stringify(o.items), o.total, JSON.stringify(o.customer), o.method, o.status]);
}
export async function getOrder(reference) {
  const { rows } = await q("SELECT * FROM orders WHERE reference = $1", [reference]);
  return toOrder(rows[0]);
}
export async function listOrders() {
  const { rows } = await q("SELECT * FROM orders ORDER BY created_at DESC LIMIT 500");
  return rows.map(toOrder);
}
export async function setOrderStatus(reference, status) {
  const { rows } = await q("UPDATE orders SET status = $2 WHERE reference = $1 RETURNING *", [reference, status]);
  return toOrder(rows[0]);
}
export async function markTransferReported(reference) {
  const { rows } = await q(
    `UPDATE orders SET status = CASE WHEN status = 'awaiting_transfer' THEN 'transfer_reported' ELSE status END,
       reported_at = CASE WHEN status = 'awaiting_transfer' THEN now() ELSE reported_at END
     WHERE reference = $1 AND method = 'transfer' RETURNING *`, [reference]);
  return toOrder(rows[0]);
}
/* Atomic: only a pending order whose total matches what Paystack charged becomes paid. */
export async function markPaid(reference, amountKobo) {
  const { rows } = await q(
    "UPDATE orders SET status='paid', paid_at=now() WHERE reference=$1 AND status='pending' AND total*100 = $2 RETURNING *",
    [reference, amountKobo]);
  return rows.length ? toOrder(rows[0]) : getOrder(reference);
}
