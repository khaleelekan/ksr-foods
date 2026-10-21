import { NextResponse } from "next/server";
import * as db from "@/lib/db";

const STATUSES = ["pending", "awaiting_transfer", "transfer_reported", "paid", "processing", "delivered", "cancelled"];

export async function PATCH(req, { params }) {
  const { status } = await req.json().catch(() => ({}));
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const order = await db.setOrderStatus(params.reference, status);
  return order ? NextResponse.json(order) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
