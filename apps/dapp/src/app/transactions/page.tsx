import { Protected } from "@/components/auth/protected";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionsView } from "@/components/transactions/transactions-view";

export const metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <Protected>
      <PageHeader
        title="Transactions"
        description="Your Solana transaction history — filterable by signature, type, and status, exportable to CSV."
      />
      <TransactionsView />
    </Protected>
  );
}
