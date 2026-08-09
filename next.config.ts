import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.archive.org" },
      { protocol: "http", hostname: "web.archive.org" },
      { protocol: "https", hostname: "images.guns.com" },
      { protocol: "https", hostname: "img.reliablegun.com" },
      { protocol: "https", hostname: "images.gunsinternational.com" },
      { protocol: "https", hostname: "gunsinternational.com" },
    ],
  },
};

export default nextConfig;
