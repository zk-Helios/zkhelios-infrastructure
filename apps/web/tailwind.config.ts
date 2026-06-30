import type { Config } from "tailwindcss";
import preset from "@zkhelios/ui-tokens/tailwind";
import animate from "tailwindcss-animate";

const config: Config = {
  presets: [preset as Config],
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    // Shared UI primitives now live here — scan so their classes aren't purged.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "amber-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(245,165,36,0.18) 0%, rgba(245,165,36,0) 70%)",
        "hex-fade": "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 90%)",
      },
    },
  },
  plugins: [animate],
};

export default config;
