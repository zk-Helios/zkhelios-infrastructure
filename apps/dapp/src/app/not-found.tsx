import Link from "next/link";
import { LogoMark, Button } from "@zkhelios/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <LogoMark size={56} glow className="text-amber-500" />
      <h2 className="mt-6 font-display text-h3 font-bold text-paper">404</h2>
      <p className="mt-2 text-body text-paper-muted">This page drifted out of orbit.</p>
      <Link href="/" className="mt-7">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}
