import { NextResponse } from "next/server";
import * as db from "@/lib/db";
import * as paystack from "@/lib/paystack";
import { markPaidIfValid } from "@/lib/orders";

export const dynamic = "force-dynamic";

/* Called by the /order-complete page after Paystack redirects back. */
export async function GET(_req, { params }) {
  let order = await db.getOrder(params.reference);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "pending") {
    try { order = (await markPaidIfValid(await paystack.verify(order.reference))) || order; }
    catch (e) { console.error("Verify failed:", e.message); }
  }
  return NextResponse.json({ reference: order.reference, status: order.status, total: order.total, items: order.items });
}
