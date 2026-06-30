import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/constants";
import { SmoothScroll } from "@/components/shared/smooth-scroll";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["zero-knowledge", "Solana", "privacy", "ZK proofs", "Groth16", "SNARK", "Anchor"],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark`} suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden">
        <NoiseOverlay />
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0A0A0A",
              border: "1px solid #2A2A2A",
              color: "#FAFAFA",
            },
          }}
        />
      </body>
    </html>
  );
}
