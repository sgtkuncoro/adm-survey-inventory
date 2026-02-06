import type { Config } from "tailwindcss";
import { config as sharedConfig } from "@packages/config-tailwind/tailwind.config";

const config = {
  // Use the shared config as a preset
  presets: [sharedConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    // We are NOT including @packages/ui here anymore as we migrate to local options
  ],
} satisfies Config;

export default config;
