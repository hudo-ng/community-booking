/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    disableTsconfigModification: true, // 👈 prevents Next.js from adding .next/types again
  },
  typescript: {
    ignoreBuildErrors: false, // still enforce type checking
  },
};

export default nextConfig;
