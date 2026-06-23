import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from other devices on the local network
  // (e.g. your phone) without Next.js blocking its HMR/font/dev resources.
  allowedDevOrigins: ["192.168.1.37", "localhost"],
};

export default nextConfig;
