"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="site-header">
      <Link className="brand" href="/"><img src="/images/logo.jpeg" alt="KSR Foods logo" /><span>KSR Foods</span></Link>
      <button className="cart-btn" onClick={() => setOpen(true)}>🛒 Cart <span>{count}</span></button>
    </header>
  );
}
