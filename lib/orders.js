import * as db from "./db";

const clean = (v, max = 200) => String(v || "").trim().slice(0, max);
export { clean };

/* Validate the request and price the cart from the server catalog (never trust the browser). */
export async function buildOrder(body) {
  const c = body.customer || {};
  const customer = { name: clean(c.name), phone: clean(c.phone, 30), email: clean(c.email), address: clean(c.address, 400) };
  if (Object.values(customer).some((v) => !v) || !/^\S+@\S+\.\S+$/.test(customer.email))
    return { error: "Please provide a valid name, phone, email and address." };
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) return { error: "Your cart is empty." };

  const catalog = await db.listProducts({ onlyAvailable: true });
  const items = [];
  for (const it of body.items) {
    const p = catalog.find((x) => x.id === it.id);
    const v = p && p.variants.find((x) => x.label === it.label);
    const qty = Number(it.qty);
    if (!v || v.price === null || !Number.isInteger(qty) || qty < 1 || qty > 100)
      return { error: `"${clean(it.id, 60)}" is unavailable. Please refresh and try again.` };
    items.push({ id: p.id, name: p.name, label: v.label, price: v.price, qty });
  }
  return { customer, items, total: items.reduce((s, i) => s + i.price * i.qty, 0) };
}

/* Mark paid only if Paystack says success AND the amount matches ours (checked in SQL). Safe to call twice. */
export async function markPaidIfValid(tx) {
  if (tx.status !== "success") return db.getOrder(tx.reference);
  return db.markPaid(tx.reference, tx.amount);
}
