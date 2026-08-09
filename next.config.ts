import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.thesportsdb.com',
        pathname: '/images/media/team/badge/**',
      },
    ],
  },
};

export default nextConfig;
