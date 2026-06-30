import type { Config } from "tailwindcss";
import { colors, fontSize, shadows, radii } from "./index";

/**
 * Shared Tailwind preset built from the zkHelios design tokens.
 * Apps extend this so the dApp and marketing site stay pixel-consistent.
 */
const preset = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
        ink: colors.ink,
        paper: {
          DEFAULT: colors.paper.DEFAULT,
          muted: colors.paper.muted,
          faint: colors.paper.faint,
        },
        status: colors.status,
        // semantic aliases
        background: colors.ink[900],
        surface: colors.ink[800],
        border: colors.ink[400],
        brand: colors.amber[500],
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: fontSize as unknown as Record<string, [string, { lineHeight: string }]>,
      boxShadow: shadows,
      borderRadius: radii,
      maxWidth: {
        section: "80rem", // 1280px content container
      },
      keyframes: {
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 12px rgba(245,165,36,0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 4px rgba(245,165,36,0.3))" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
