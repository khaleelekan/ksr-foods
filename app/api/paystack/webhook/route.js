import { validSignature } from "@/lib/paystack";
import { markPaidIfValid } from "@/lib/orders";

/* Paystack dashboard > Settings > API Keys & Webhooks > Webhook URL:
   https://YOUR-DOMAIN/api/paystack/webhook */
export async function POST(req) {
  const raw = await req.text(); // raw body is needed to check the signature
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) return new Response(null, { status: 401 });
  const event = JSON.parse(raw);
  if (event.event === "charge.success") await markPaidIfValid(event.data);
  return new Response(null, { status: 200 });
}
