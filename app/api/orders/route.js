import crypto from "crypto";
import { NextResponse } from "next/server";
import * as db from "@/lib/db";
import { config } from "@/lib/config";
import * as paystack from "@/lib/paystack";
import { buildOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

/* Create order. body.method: "paystack" (default) or "transfer" */
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const method = body.method === "transfer" ? "transfer" : "paystack";
  if (method === "transfer" && !config.bank.number)
    return NextResponse.json({ error: "Bank transfer is not available right now." }, { status: 503 });

  const built = await buildOrder(body);
  if (built.error) return NextResponse.json({ error: built.error }, { status: 400 });
  const { customer, items, total } = built;

  const reference = "KSR-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex");
  await db.createOrder({ reference, items, total, customer, method, status: method === "transfer" ? "awaiting_transfer" : "pending" });

  if (method === "transfer") return NextResponse.json({ reference, total });

  try {
    const tx = await paystack.initialize({ email: customer.email, amountNaira: total, reference, metadata: { name: customer.name, phone: customer.phone } });
    return NextResponse.json({ reference, authorization_url: tx.authorization_url });
  } catch (e) {
    console.error("Paystack init failed:", e.message);
    return NextResponse.json({ error: "Could not start payment. Please try again or choose bank transfer / WhatsApp." }, { status: 502 });
  }
}
