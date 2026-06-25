import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from other devices on the local network
  // (e.g. your phone) without Next.js blocking its HMR/font/dev resources.
  allowedDevOrigins: ["192.168.1.37", "localhost"],
  async headers() {
    return [
      {
        // The service worker must never be cached so updates roll out instantly.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
