import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network devices to access Next.js dev resources without being blocked by CORS
  allowedDevOrigins: ['192.168.1.3', '192.168.1.5'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      },
    ]
  },
};
export default nextConfig;
