import TransferInstructions from "@/components/TransferInstructions";

export const metadata = { title: "Pay by transfer | KSR Foods" };
export default function Page({ params }) {
  return <TransferInstructions reference={params.reference} />;
}
