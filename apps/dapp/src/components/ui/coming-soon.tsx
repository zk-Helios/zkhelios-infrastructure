import { Construction } from "lucide-react";
import { EmptyState } from "./empty-state";

/** Placeholder body for routes scaffolded now and built in a later session. */
export function ComingSoon({ session, feature }: { session: string; feature: string }) {
  return (
    <EmptyState
      icon={Construction}
      title={`${feature} arrives in ${session}`}
      description="This route is scaffolded with the shell, auth, and layout in place. The full experience lands in an upcoming build session."
    />
  );
}
