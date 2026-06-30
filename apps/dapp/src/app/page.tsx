import { Protected } from "@/components/auth/protected";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <Protected>
      <PageHeader
        title="Dashboard"
        description="Your SOL + token balances, active proofs, and live Solana network activity."
      />
      <DashboardView />
    </Protected>
  );
}
