import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/app/staff/:path*',
        destination: '/app/teachers/:path*',
        permanent: true,
      },
      {
        source: '/app/staff',
        destination: '/app/teachers',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
