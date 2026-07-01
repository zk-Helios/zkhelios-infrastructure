// Served under a sub-path in production (e.g. "/docs" behind a single-domain
// reverse proxy). Empty by default so local dev still runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath,
  transpilePackages: ["@zkhelios/ui", "@zkhelios/ui-tokens"],
};

export default nextConfig;
