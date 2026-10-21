import crypto from "crypto";
import { config } from "./config";

const BASE = "https://api.paystack.co";

async function call(p, opts = {}) {
  const res = await fetch(BASE + p, {
    ...opts,
    headers: { Authorization: "Bearer " + config.paystackSecret, "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.status) throw new Error(json.message || "Paystack error");
  return json.data;
}

export const initialize = ({ email, amountNaira, reference, metadata }) =>
  call("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email, reference, metadata,
      amount: Math.round(amountNaira * 100), // kobo
      callback_url: config.baseUrl + "/order-complete",
    }),
  });

export const verify = (reference) => call("/transaction/verify/" + encodeURIComponent(reference));

export function validSignature(rawBody, signature) {
  if (!config.paystackSecret || !signature || !rawBody) return false;
  const expected = crypto.createHmac("sha512", config.paystackSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
