/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@zkhelios/ui", "@zkhelios/ui-tokens"],
  webpack: (config) => {
    // Solana wallet-adapter / web3.js pull optional Node deps that aren't used in the browser.
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
