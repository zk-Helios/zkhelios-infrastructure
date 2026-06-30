import { TxDetail } from "@/components/explorer/tx-detail";

export const metadata = { title: "Transaction · Explorer" };

export default function Page({ params }: { params: { signature: string } }) {
  return <TxDetail signature={decodeURIComponent(params.signature)} />;
}
