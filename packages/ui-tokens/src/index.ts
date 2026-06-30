/**
 * zkHelios design tokens — single source of truth for the brand.
 *
 * These are consumed by the Tailwind preset (see ./tailwind-preset.ts) and can
 * be imported directly in TS for canvas/SVG/inline-style use where Tailwind
 * classes aren't available. Reused across apps/web and apps/dapp.
 */

export const colors = {
  /** Solar amber — the primary brand color. */
  amber: {
    50: "#FEF6E7",
    100: "#FDEAC4",
    200: "#FBD489",
    300: "#F9BF4F",
    400: "#F7B137",
    500: "#F5A524", // primary
    600: "#D4881A",
    700: "#A66713",
    800: "#73470D",
    900: "#3D2606",
  },
  /** Pure black → charcoal surfaces. */
  ink: {
    900: "#000000", // pure black, page base
    800: "#0A0A0A", // charcoal, raised surface
    700: "#111111",
    600: "#161616",
    500: "#1C1C1C",
    400: "#2A2A2A", // hairline borders
    300: "#3A3A3A",
  },
  /** Accent white + muted text. */
  paper: {
    DEFAULT: "#FAFAFA",
    muted: "#A1A1AA",
    faint: "#71717A",
  },
  status: {
    online: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
  },
} as const;

export const fonts = {
  display: "var(--font-space-grotesk)",
  body: "var(--font-inter)",
  mono: "var(--font-jetbrains-mono)",
} as const;

/** Type scale (rem) tuned for a cypherpunk display feel. */
export const fontSize = {
  caption: ["0.8125rem", { lineHeight: "1.2rem", letterSpacing: "0.02em" }],
  body: ["1rem", { lineHeight: "1.65rem" }],
  lead: ["1.25rem", { lineHeight: "1.9rem" }],
  h6: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
  h5: ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
  h4: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
  h3: ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
  h2: ["3rem", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
  h1: ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
  display: ["clamp(3.5rem, 9vw, 7rem)", { lineHeight: "0.98", letterSpacing: "-0.045em" }],
} as const;

/** Glow + elevation shadows. */
export const shadows = {
  "glow-sm": "0 0 16px -2px rgba(245,165,36,0.35)",
  glow: "0 0 32px -4px rgba(245,165,36,0.45)",
  "glow-lg": "0 0 64px -8px rgba(245,165,36,0.5)",
  card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 32px -12px rgba(0,0,0,0.8)",
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.625rem",
  lg: "1rem",
  xl: "1.5rem",
} as const;

export const motion = {
  /** Standard transition window per brand guidelines: 200–300ms ease-out. */
  duration: { fast: 0.2, base: 0.25, slow: 0.3 },
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

export const tokens = { colors, fonts, fontSize, shadows, radii, motion };
export default tokens;
