import {
  LayoutDashboard,
  ShieldCheck,
  BadgeCheck,
  Receipt,
  Compass,
  Settings,
} from "lucide-react";

export const APP_NAME = "zkHelios";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Prove", href: "/prove", icon: ShieldCheck },
  { label: "Verify", href: "/verify", icon: BadgeCheck },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Explorer", href: "/explorer", icon: Compass },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

/** RPC provider label shown in the footer. */
export const RPC_PROVIDER = process.env.NEXT_PUBLIC_RPC_URL_MAINNET?.includes("helius")
  ? "Helius"
  : "Solana RPC";
