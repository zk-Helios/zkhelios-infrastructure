import { PageHeader } from "@/components/ui/page-header";
import { ExplorerHome } from "@/components/explorer/explorer-home";

export const metadata = { title: "Explorer" };

// Explorer is public — no auth gate.
export default function ExplorerPage() {
  return (
    <>
      <PageHeader title="Explorer" description="Search proofs, transactions, addresses, and programs on the zkHelios network." />
      <ExplorerHome />
    </>
  );
}
