export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Docs sidebar structure. */
export const NAV: NavGroup[] = [
  {
    title: "Introduction",
    items: [
      { label: "What is zkHelios", href: "/" },
      { label: "Quickstart", href: "/quickstart" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { label: "Architecture", href: "/concepts/architecture" },
      { label: "Proof system", href: "/concepts/proof-system" },
      { label: "Account model", href: "/concepts/account-model" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Generate a balance proof", href: "/guides/balance-proof" },
      { label: "Build a custom circuit", href: "/guides/custom-circuit" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "TypeScript SDK", href: "/reference/sdk" },
      { label: "Program reference", href: "/reference/program" },
      { label: "REST API", href: "/reference/api" },
      { label: "Circuits", href: "/reference/circuits" },
    ],
  },
  {
    title: "Resources",
    items: [{ label: "FAQ", href: "/faq" }],
  },
];

/** Flattened, ordered list for prev/next navigation. */
export const FLAT = NAV.flatMap((g) => g.items);
