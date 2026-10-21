"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { naira } from "@/lib/format";
import { WHATSAPP } from "@/lib/constants";

export default function ProductCard({ p }) {
  const { add, setOpen } = useCart();
  const [i, setI] = useState(0);
  const v = p.variants[i];
  const askPrice = v.price === null;

  const onAdd = () => {
    if (askPrice) {
      const msg = `Hello KSR Foods, what is the price of ${p.name} (${v.label})?`;
      return window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    add(p, v); setOpen(true);
  };

  return (
    <article className="card">
      <div className="pic">{p.image ? <img src={`/images/${p.image}`} alt={p.name} loading="lazy" /> : "🛍️"}</div>
      <div className="body">
        <h3>{p.name}</h3>
        {p.desc && <p className="desc">{p.desc}</p>}
        {p.variants.length === 1 ? <p className="desc">{v.label}</p> : (
          <select value={i} onChange={(e) => setI(+e.target.value)} aria-label="Choose size">
            {p.variants.map((x, j) => <option key={x.label} value={j}>{x.label}{x.price ? ` - ${naira(x.price)}` : ""}</option>)}
          </select>
        )}
        <div className="price">{askPrice ? "Price on request" : naira(v.price)}</div>
        <button className="btn" onClick={onAdd}>{askPrice ? "Ask for price" : "Add to cart"}</button>
      </div>
    </article>
  );
}
