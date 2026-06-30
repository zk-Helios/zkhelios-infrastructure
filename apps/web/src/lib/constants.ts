/**
 * On-brand site content. No lorem ipsum — every string here is real copy.
 * Positioning: zkHelios is a Solana dApp with zero-knowledge proofs.
 */

export const SITE = {
  name: "zkHelios",
  tagline: "Zero-Knowledge proofs. Solana speed.",
  description:
    "zkHelios brings privacy-preserving verification to Solana. Prove what matters, reveal only what you choose — with Groth16 proofs verified on-chain.",
  url: "https://zkhelios.app",
} as const;

export const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "Technology", href: "#technology" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Developers", href: "#developers" },
  { label: "Docs", href: "/docs" },
] as const;

export const BACKERS = [
  "Helios Capital",
  "Photon Ventures",
  "Aurora Labs",
  "Meridian",
  "Solstice DAO",
  "Corona Fund",
] as const;

export const STATS = [
  { label: "Proofs verified", value: 2_480_000, suffix: "+", format: "compact" },
  { label: "Avg. verification time", value: 412, suffix: "ms", format: "int" },
  { label: "Active users", value: 38_400, suffix: "+", format: "compact" },
  { label: "Total value protected", value: 142, suffix: "M", format: "int", prefix: "$" },
] as const;

export const FEATURES = [
  {
    title: "Light-Speed Verification",
    description:
      "On-chain proof verification settles in a single Solana slot — ~400ms blocks mean your proof is final almost as fast as you can generate it.",
    icon: "zap",
    asset: "/assets/zkrollup.png",
  },
  {
    title: "Solar Privacy",
    description:
      "Groth16 SNARKs are verified directly on-chain via Solana's alt_bn128 syscalls. Public inputs stay public; everything else stays yours.",
    icon: "shield",
    asset: "/assets/zkidentity.png",
  },
  {
    title: "Composable",
    description:
      "An Anchor IDL and a typed TypeScript SDK let any program or dApp verify zkHelios proofs via CPI. Privacy as a primitive, not a silo.",
    icon: "boxes",
    asset: "/assets/zkml.png",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Commit",
    description:
      "Client-side: you select what to prove and commit to your private inputs. Secrets never leave your device.",
  },
  {
    step: "02",
    title: "Prove",
    description:
      "Off-chain compute: snarkjs generates a Groth16 proof in your browser (or a worker) in seconds — no secrets revealed.",
  },
  {
    step: "03",
    title: "Verify on-chain",
    description:
      "On-chain result: the zkHelios Anchor program verifies the proof in ~200k CU and writes an attestation to a PDA on Solana.",
  },
] as const;

export const USE_CASES = [
  {
    title: "Private token transfers",
    description: "Move SOL or SPL tokens while keeping amounts and balances confidential.",
    asset: "/assets/zkbridge.png",
  },
  {
    title: "Anonymous credentials",
    description: "Prove you hold a credential or role without revealing your identity or wallet.",
    asset: "/assets/zkidentity.png",
  },
  {
    title: "Sybil-resistant airdrops",
    description: "Prove one-person-one-claim eligibility without doxxing the recipient set.",
    asset: "/assets/provider-node.png",
  },
  {
    title: "Private DAO voting",
    description: "Prove membership and cast a vote without exposing how you voted or what you hold.",
    asset: "/assets/zkrollup.png",
  },
  {
    title: "KYC without doxxing",
    description: "Prove age, jurisdiction, or accreditation while keeping documents fully private.",
    asset: "/assets/proof-card.png",
  },
] as const;

export const ECOSYSTEM = [
  { name: "HelioSwap", category: "Private DEX", asset: "/assets/zkrollup.png" },
  { name: "Shade", category: "Private Payments", asset: "/assets/zkidentity.png" },
  { name: "Photon", category: "Wallet", asset: "/assets/provider-node.png" },
  { name: "Corona AI", category: "zkML", asset: "/assets/zkml.png" },
  { name: "Aurora", category: "Lending", asset: "/assets/proof-card.png" },
  { name: "Meridian", category: "Identity", asset: "/assets/zkidentity.png" },
  { name: "Solstice", category: "DAO Tooling", asset: "/assets/provider-node.png" },
  { name: "Flare", category: "Perps", asset: "/assets/zkrollup.png" },
  { name: "Penumbra", category: "Privacy SDK", asset: "/assets/zkidentity.png" },
  { name: "Radiance", category: "NFT", asset: "/assets/proof-card.png" },
  { name: "Zenith Pay", category: "Payments", asset: "/assets/zkbridge.png" },
  { name: "Eclipse", category: "Oracles", asset: "/assets/provider-node.png" },
] as const;

export const ROADMAP = [
  {
    phase: "Genesis",
    quarter: "Devnet",
    status: "shipped",
    title: "Devnet launch",
    points: ["Verifier program live", "5 standard circuits", "TypeScript SDK alpha"],
  },
  {
    phase: "Dawn",
    quarter: "Audit",
    status: "shipped",
    title: "Security & audit",
    points: ["External audit", "Bug bounty (Immunefi)", "Devnet soak"],
  },
  {
    phase: "Zenith",
    quarter: "Mainnet",
    status: "active",
    title: "Mainnet beta",
    points: ["Mainnet-beta deploy", "Squads multisig authority", "Prover marketplace"],
  },
  {
    phase: "Eclipse",
    quarter: "SDK v2",
    status: "planned",
    title: "SDK v2 + CPI",
    points: ["Composable CPI verifier", "Custom circuit registry", "Rust SDK"],
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Prove", href: "/app/prove" },
      { label: "Verify", href: "/app/verify" },
      { label: "Explorer", href: "/app/explorer" },
      { label: "Launch App", href: "/app" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "TypeScript SDK", href: "/docs/sdk" },
      { label: "Program Reference", href: "/docs/program" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    heading: "Ecosystem",
    links: [
      { label: "Projects", href: "#ecosystem" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Grants", href: "/grants" },
      { label: "Bug Bounty", href: "/security" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Brand Kit", href: "/brand" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;
