import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { AppFooter } from "./app-footer";

/** Top-level layout: sidebar + topbar + scrollable content + status footer. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-section px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
