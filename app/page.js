import * as db from "@/lib/db";
import Shop from "@/components/Shop";

export const dynamic = "force-dynamic"; // always show current prices

export default async function Home() {
  const [meta, products] = await Promise.all([db.getMeta(), db.listProducts({ onlyAvailable: true })]);
  return (
    <>
      <section className="hero">
        <h1>So Fast, So Yummy!</h1>
        <p>Quality Nigerian staples: poundo flours, rice, beans, oils, honey and garri.</p>
        <a className="btn" href="#shop">Shop now</a>
      </section>
      <main id="shop" className="container">
        <Shop products={products} categories={meta.categories} />
        <ul className="notes">{meta.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </main>
    </>
  );
}
