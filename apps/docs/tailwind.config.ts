import type { Config } from "tailwindcss";
import preset from "@zkhelios/ui-tokens/tailwind";
import animate from "tailwindcss-animate";

const config: Config = {
  presets: [preset as Config],
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [animate],
};

export default config;
