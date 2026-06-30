import { Protected } from "@/components/auth/protected";
import { PageHeader } from "@/components/ui/page-header";
import { ProveView } from "@/components/prove/prove-view";

export const metadata = { title: "Prove" };

export default function ProvePage() {
  return (
    <Protected>
      <PageHeader
        title="Prove"
        description="Generate a zero-knowledge proof client-side and verify it on Solana — prove what matters, reveal only what you choose."
      />
      <ProveView />
    </Protected>
  );
}
