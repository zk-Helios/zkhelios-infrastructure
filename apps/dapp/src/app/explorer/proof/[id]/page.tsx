import { ProofDetail } from "@/components/explorer/proof-detail";

export const metadata = { title: "Proof · Explorer" };

export default function Page({ params }: { params: { id: string } }) {
  return <ProofDetail id={decodeURIComponent(params.id)} />;
}
