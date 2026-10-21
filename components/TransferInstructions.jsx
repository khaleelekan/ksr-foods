"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { naira } from "@/lib/format";
import { WHATSAPP } from "@/lib/constants";

function Row({ label, value, copy, big }) {
  const [done, setDone] = useState(false);
  return (
    <div className="r">
      <span>{label}</span>
      <strong className={big ? "big" : ""}>{value}</strong>
      {copy && <button onClick={() => navigator.clipboard.writeText(copy).then(() => { setDone(true); setTimeout(() => setDone(false), 1200); })}>{done ? "Copied" : "Copy"}</button>}
    </div>
  );
}

export default function TransferInstructions({ reference }) {
  const [o, setO] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch("/api/orders/transfer/" + encodeURIComponent(reference))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setO).catch(() => setMissing(true));
  }, [reference]);

  async function reported() {
    await fetch(`/api/orders/transfer/${encodeURIComponent(reference)}/reported`, { method: "POST" });
    setO({ ...o, status: "transfer_reported" });
  }

  if (missing) return <main className="container center"><h1>Order not found</h1><p>Please contact us on WhatsApp 0807 702 9452.</p></main>;
  if (!o) return <main className="container center"><h1>Loading your order...</h1></main>;

  const waMsg = `Hello KSR Foods, I have paid ${naira(o.total)} by transfer for order ${o.reference}. Receipt attached.`;
  return (
    <main className="container center">
      <h1>Pay by bank transfer</h1>
      <p>{o.status === "awaiting_transfer" ? "Transfer the exact amount below, then tap the button."
        : o.status === "transfer_reported" ? "Thanks! We'll confirm your payment shortly. Sending your receipt on WhatsApp speeds things up."
        : `Order status: ${o.status.replace("_", " ")}.`}</p>
      <div className="box">
        <Row label="Amount" value={naira(o.total)} copy={String(o.total)} big />
        <Row label="Bank" value={o.bank.name} />
        <Row label="Account number" value={o.bank.number} copy={o.bank.number} />
        <Row label="Account name" value={o.bank.accountName} />
        <Row label="Reference (narration)" value={o.reference} copy={o.reference} />
      </div>
      {o.status === "awaiting_transfer" && <>
        <p><strong>Important:</strong> put the reference in your transfer narration so we can match your payment.</p>
        <button className="btn block" onClick={reported}>I've made the transfer</button>
      </>}
      {o.status === "transfer_reported" && (
        <a className="btn block wa" target="_blank" rel="noopener" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg)}`}>Send receipt on WhatsApp</a>
      )}
      <p style={{ marginTop: 20 }}><Link href="/">Back to shop</Link></p>
    </main>
  );
}
