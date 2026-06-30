import type { Config } from "tailwindcss";
import preset from "@zkhelios/ui-tokens/tailwind";
import animate from "tailwindcss-animate";

const config: Config = {
  presets: [preset as Config],
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    // Pull in classNames from the shared UI package so they're not purged.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "amber-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(245,165,36,0.14) 0%, rgba(245,165,36,0) 70%)",
      },
    },
  },
  plugins: [animate],
};

export default config;
