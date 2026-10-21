# KSR Foods Store (Next.js + Postgres)

Storefront + Paystack + bank transfer + WhatsApp + admin dashboard in one Next.js 14 app.
Data (products, prices, orders) is stored in Postgres. Tables are created and seeded automatically on first run.

## Deploy on Vercel
1. Push this folder to a GitHub repo and import it into Vercel.
2. In the Vercel project: Storage > Marketplace > **Neon (Postgres)** > add it to the project.
   Vercel sets `DATABASE_URL` for you. (Vercel Postgres is now provided through Neon.)
3. Project Settings > Environment Variables, add:
   `PAYSTACK_SECRET_KEY`, `ADMIN_PASSWORD`, `BASE_URL` (your https domain),
   `BANK_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_NAME`
4. Deploy. Open `/admin` once and visit the shop: the database fills itself with your products.
5. Paystack > Settings > API Keys & Webhooks > Webhook URL: `https://YOUR-DOMAIN/api/paystack/webhook`
6. Test with `sk_test_...`, then switch `PAYSTACK_SECRET_KEY` to `sk_live_...` and redeploy.

## Run locally
1. Node.js 18.17+, then `npm install`
2. Copy `.env.example` to `.env.local` (use your Neon connection string from the Neon dashboard, or `vercel env pull`)
3. `npm run dev` then open http://localhost:3000 (admin: /admin)

## Structure
- `app/` pages (shop, `transfer/[reference]`, `order-complete`, `admin`) and API routes (`app/api/...`)
- `components/` UI: Shop, ProductCard, CartDrawer, CartProvider, TransferInstructions, PaymentStatus, AdminPanel
- `lib/db.js` all database access (tables, seeding, queries); `lib/paystack.js`; `lib/orders.js` pricing + payment checks
- `middleware.js` password-protects `/admin` and `/api/admin`
- `data/products.seed.json` starting catalog, loaded into the database once. After that, edit prices in /admin.
- `public/images/` product photos

## Notes
- Payment is only marked paid in the database when Paystack's amount equals the order total, checked in SQL.
- Bank transfer: customer taps "I've made the transfer", order shows "transfer reported" in /admin,
  you check your bank and set it to "paid".
- To add a new product or photo: add the image to `public/images/`, then add the product row in the
  database (or ask for an "add product" screen in the admin).
# ksr-foods
