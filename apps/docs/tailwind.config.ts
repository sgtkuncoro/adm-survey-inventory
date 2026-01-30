import type { Config } from "tailwindcss"
import { config as uiConfig } from "@packages/ui/tailwind.config"

const config = {
  // Use the shared config as a preset
  presets: [uiConfig],
  content: [
    './src/**/*.{ts,tsx}',
    // We still need to include the UI package for tailwind to scan class names used there
    // even if the preset has it, paths might be relative.
    // Safe to include it explicitly relative to this file.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config

export default config
