"use client";
import { useCallback, useEffect, useState } from "react";
import { naira } from "@/lib/format";

const STATUSES = ["pending", "awaiting_transfer", "transfer_reported", "paid", "processing", "delivered", "cancelled"];
const api = (path, opts = {}) => fetch("/api/admin" + path, { ...opts, headers: { "Content-Type": "application/json" } }).then((r) => r.json());

function Orders() {
  const [orders, setOrders] = useState(null);
  const load = useCallback(() => api("/orders").then(setOrders), []);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (ref, status) => { await api("/orders/" + ref, { method: "PATCH", body: JSON.stringify({ status }) }); load(); };
  if (!orders) return <p>Loading...</p>;
  if (!orders.length) return <p>No orders yet.</p>;
  return orders.map((o) => (
    <div className="abox" key={o.reference}>
      <div className="row"><strong>{o.reference}</strong><span className={"tag " + o.status}>{o.status.replace("_", " ")}</span>
        <small>{o.method === "transfer" ? "bank transfer" : "Paystack"}</small><strong>{naira(o.total)}</strong><small>{new Date(o.createdAt).toLocaleString()}</small></div>
      <p>{o.items.map((i) => `${i.name} (${i.label}) x${i.qty}`).join(", ")}</p>
      <small>{o.customer.name} · {o.customer.phone} · {o.customer.email}<br />{o.customer.address}</small>
      <div className="row" style={{ marginTop: 8 }}>
        <select value={o.status} onChange={(e) => setStatus(o.reference, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
    </div>
  ));
}

function ProductRow({ p }) {
  const [available, setAvailable] = useState(p.available !== false);
  const [prices, setPrices] = useState(Object.fromEntries(p.variants.map((v) => [v.label, v.price ?? ""])));
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await api("/products/" + p.id, { method: "PUT", body: JSON.stringify({ available, variants: p.variants.map((v) => ({ label: v.label, price: prices[v.label] === "" ? null : Number(prices[v.label]) })) }) });
    setSaved(true); setTimeout(() => setSaved(false), 1200);
  };
  return (
    <div className="abox">
      <div className="row"><strong>{p.name}</strong><label><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> In stock</label></div>
      <div className="row">
        {p.variants.map((v) => (
          <label key={v.label}>{v.label} <input type="number" placeholder="ask" value={prices[v.label]} onChange={(e) => setPrices({ ...prices, [v.label]: e.target.value })} /></label>
        ))}
        <button className="save" onClick={save}>{saved ? "Saved ✓" : "Save"}</button>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState(null);
  useEffect(() => { api("/products").then(setProducts); }, []);
  return products ? products.map((p) => <ProductRow key={p.id} p={p} />) : <p>Loading...</p>;
}

export default function AdminPanel() {
  const [tab, setTab] = useState("orders");
  return (
    <main className="container">
      <div className="row" style={{ marginBottom: 16 }}>
        <button className={"chip" + (tab === "orders" ? " active" : "")} onClick={() => setTab("orders")}>Orders</button>
        <button className={"chip" + (tab === "products" ? " active" : "")} onClick={() => setTab("products")}>Products &amp; prices</button>
      </div>
      {tab === "orders" ? <Orders /> : <Products />}
    </main>
  );
}
