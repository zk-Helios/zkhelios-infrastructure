import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { VerifyView } from "@/components/verify/verify-view";

export const metadata = { title: "Verify" };

// Verify is public — no auth gate. Anyone can verify a shared proof.
export default function VerifyPage() {
  return (
    <>
      <PageHeader
        title="Verify"
        description="Verify any proof by account, signature, or pasted JSON — on-chain status or in-browser re-verification."
      />
      <Suspense fallback={<div className="skeleton h-48 w-full rounded-lg" />}>
        <VerifyView />
      </Suspense>
    </>
  );
}
