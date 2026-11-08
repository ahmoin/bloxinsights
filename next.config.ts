import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.rbxcdn.com",
      },
    ],
    // Serve images straight from their source instead of Vercel's optimizer.
    // Every unique Roblox thumbnail (rbxcdn.com) counted as a transformation, which
    // used up the Hobby plan's 5K/month quota for the whole account. Roblox's CDN
    // already serves these thumbnails pre-sized, so optimizing them gained little.
    unoptimized: true,
  },
};

export default nextConfig;
