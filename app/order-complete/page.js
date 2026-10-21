import PaymentStatus from "@/components/PaymentStatus";

export const metadata = { title: "Order status | KSR Foods" };
export default function Page({ searchParams }) {
  return <PaymentStatus reference={searchParams.reference || searchParams.trxref} />;
}
