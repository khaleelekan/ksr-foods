"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { naira } from "@/lib/format";

export default function PaymentStatus({ reference }) {
  const { clear } = useCart();
  const [o, setO] = useState(null);
  const [err, setErr] = useState(!reference);

  useEffect(() => {
    if (!reference) return;
    fetch("/api/orders/verify/" + encodeURIComponent(reference))
      .then((r) => r.json())
      .then((d) => { setO(d); if (d.status === "paid") clear(); })
      .catch(() => setErr(true));
  }, [reference]); // eslint-disable-line

  return (
    <main className="container" style={{ maxWidth: 560, textAlign: "center" }}>
      {err ? <><h1>Could not check payment</h1><p>Please contact us on WhatsApp 0807 702 9452{reference ? ` with reference ${reference}` : ""}.</p></>
        : !o ? <h1>Checking your payment...</h1>
        : o.status === "paid" ? <><h1>Payment received. Thank you!</h1><p>Order {o.reference} ({naira(o.total)}) is confirmed. We'll contact you about delivery.</p></>
        : <><h1>Payment not confirmed</h1><p>Order {reference} is "{o.status}". If you were debited, message us on WhatsApp 0807 702 9452 with this reference.</p></>}
      <p style={{ marginTop: 20 }}><Link className="btn" href="/">Back to shop</Link></p>
    </main>
  );
}
