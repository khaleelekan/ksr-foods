import { NextResponse } from "next/server";
import * as db from "@/lib/db";

/* Customer taps "I've made the transfer". You still confirm it in /admin. */
export async function POST(_req, { params }) {
  const o = await db.markTransferReported(params.reference);
  return o ? NextResponse.json({ status: o.status }) : NextResponse.json({ error: "Order not found" }, { status: 404 });
}
