import { NextResponse } from "next/server";
import * as db from "@/lib/db";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

/* Bank details + amount for a transfer order. */
export async function GET(_req, { params }) {
  const o = await db.getOrder(params.reference);
  if (!o || o.method !== "transfer") return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ reference: o.reference, status: o.status, total: o.total, items: o.items, bank: config.bank });
}
