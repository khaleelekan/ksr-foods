/* Server-side settings from environment variables. Never import in client components. */
export const config = {
  baseUrl: (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, ""),
  paystackSecret: process.env.PAYSTACK_SECRET_KEY || "",
  bank: {
    name: process.env.BANK_NAME || "",
    number: process.env.BANK_ACCOUNT_NUMBER || "",
    accountName: process.env.BANK_ACCOUNT_NAME || "",
  },
};
