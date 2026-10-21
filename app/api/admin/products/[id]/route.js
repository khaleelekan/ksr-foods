import { NextResponse } from "next/server";
import * as db from "@/lib/db";

/* body: { available: bool, variants: [{label, price|null}] } (labels must already exist) */
export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const p = await db.updateProduct(params.id, body);
  return p ? NextResponse.json(p) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
