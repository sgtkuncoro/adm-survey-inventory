import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@packages/ui", "@packages/supabase"],
};

export default nextConfig;
