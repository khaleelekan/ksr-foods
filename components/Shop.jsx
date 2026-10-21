"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";

export default function Shop({ products, categories }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = products.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="toolbar">
        <input id="search" type="search" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          {categories.map((c) => <button key={c} className={"chip" + (c === cat ? " active" : "")} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <div className="grid">
        {list.length ? list.map((p) => <ProductCard key={p.id} p={p} />) : <p className="empty">No products found.</p>}
      </div>
    </>
  );
}
