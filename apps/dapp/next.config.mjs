// Served under a sub-path in production (e.g. "/app" behind a single-domain
// reverse proxy). Empty by default so local dev still runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath,
  transpilePackages: ["@zkhelios/ui", "@zkhelios/ui-tokens"],
  webpack: (config) => {
    // Solana wallet-adapter / web3.js pull optional Node deps that aren't used in the browser.
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
