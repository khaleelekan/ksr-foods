import { NextResponse } from "next/server";
import * as db from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await db.listProducts()); }
