/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@zkhelios/ui", "@zkhelios/ui-tokens"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
