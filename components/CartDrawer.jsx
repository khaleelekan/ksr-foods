"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { naira } from "@/lib/format";
import { WHATSAPP } from "@/lib/constants";

export default function CartDrawer() {
  const { items, change, remove, clear, total, open, setOpen } = useCart();
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "" });
  const [busy, setBusy] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const filled = Object.values(f).every((v) => v.trim());

  async function checkout(method) {
    if (!items.length) return alert("Your cart is empty.");
    if (!filled) return alert("Please fill in your name, phone, email and address.");
    setBusy(method);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, customer: f, items: items.map((i) => ({ id: i.id, label: i.label, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order");
      if (method === "transfer") { clear(); setOpen(false); router.push("/transfer/" + data.reference); }
      else window.location.href = data.authorization_url;
    } catch (e) { alert(e.message); setBusy(""); }
  }

  function whatsapp() {
    if (!items.length) return alert("Your cart is empty.");
    const lines = items.map((i) => `• ${i.name} (${i.label}) x${i.qty} = ${naira(i.price * i.qty)}`);
    const msg = `Hello KSR Foods, I'd like to order:\n\n${lines.join("\n")}\n\nTotal: ${naira(total)}\n\nName: ${f.name || "-"}\nDelivery address: ${f.address || "-"}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <>
      <div className={"overlay" + (open ? " show" : "")} onClick={() => setOpen(false)} />
      <aside className={"drawer" + (open ? " open" : "")} aria-label="Shopping cart">
        <div className="drawer-head"><h2>Your cart</h2><button onClick={() => setOpen(false)} aria-label="Close cart">✕</button></div>
        <div className="drawer-body">
          {items.length ? items.map((i) => (
            <div className="line" key={i.key}>
              <div><strong>{i.name}</strong><div className="meta">{i.label} · {naira(i.price)}</div></div>
              <strong>{naira(i.price * i.qty)}</strong>
              <div className="qty">
                <button onClick={() => change(i.key, -1)}>−</button><span>{i.qty}</span><button onClick={() => change(i.key, 1)}>+</button>
                <button className="rm" onClick={() => remove(i.key)}>Remove</button>
              </div>
            </div>
          )) : <p className="empty">Your cart is empty.</p>}
        </div>
        <div className="drawer-foot">
          <div className="total"><span>Total</span><strong>{naira(total)}</strong></div>
          <input placeholder="Your name" value={f.name} onChange={set("name")} />
          <input type="tel" placeholder="Phone number" value={f.phone} onChange={set("phone")} />
          <input type="email" placeholder="Email (for payment receipt)" value={f.email} onChange={set("email")} />
          <textarea rows={2} placeholder="Delivery address" value={f.address} onChange={set("address")} />
          <button className="btn block" disabled={!!busy} onClick={() => checkout("paystack")}>{busy === "paystack" ? "Please wait..." : "Pay online (Paystack)"}</button>
          <button className="btn block tr" disabled={!!busy} onClick={() => checkout("transfer")}>{busy === "transfer" ? "Please wait..." : "Pay by bank transfer"}</button>
          <button className="btn block wa" onClick={whatsapp}>Order on WhatsApp instead</button>
          <small>Prices may change at the point of payment.</small>
        </div>
      </aside>
    </>
  );
}
