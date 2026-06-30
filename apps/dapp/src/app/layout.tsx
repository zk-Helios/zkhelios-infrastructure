import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { NoiseOverlay } from "@zkhelios/ui";
import { fontVariables } from "@/lib/fonts";
import { Providers } from "./providers";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.zkhelios.app"),
  title: { default: "zkHelios dApp", template: "%s · zkHelios" },
  description: "Bridge assets and generate zero-knowledge proofs on zkHelios.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark`} suppressHydrationWarning>
      <body className="min-h-screen">
        <NoiseOverlay opacity={0.04} />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#FAFAFA" },
          }}
        />
      </body>
    </html>
  );
}
