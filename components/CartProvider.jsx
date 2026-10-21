"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { CART_KEY } from "@/lib/constants";

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(CART_KEY)) || []); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {} }, [items, ready]);

  const add = (p, v) => setItems((cur) => {
    const key = p.id + "|" + v.label;
    return cur.some((i) => i.key === key)
      ? cur.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      : [...cur, { key, id: p.id, name: p.name, label: v.label, price: v.price, qty: 1 }];
  });
  const change = (key, d) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  const remove = (key) => setItems((cur) => cur.filter((i) => i.key !== key));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return <Ctx.Provider value={{ items, add, change, remove, clear, count, total, open, setOpen }}>{children}</Ctx.Provider>;
}
