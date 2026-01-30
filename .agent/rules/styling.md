# Styling & UI Rules

## Core Stack
- **Framework**: Tailwind CSS (v4 is future-proof, but check current project version, likely v3.4+).
- **Component Library**: shadcn/ui (radix-ui based).
- **Icons**: Lucide React.

## Best Practices
- **Utility First**: Use utility classes for loading, layout, and spacing.
- **Components**: For complex, reusable UI elements, encapsulate in React components.
- **Theme**: Use CSS variables in `global.css` for colors (e.g., `--primary`, `--secondary`). Define these in the Tailwind config to support dark mode.
- **Tailwind Merge**: Use `cn()` utility (clsx + tailwind-merge) for conditional class names.

## Shadcn UI
- **Installation**: Use CLI or copy-paste into `packages/ui` to share across apps if needed, or keeping in `apps/web` is fine if mono-repo UI package isn't fully set up yet. IF `packages/ui` exists, place core components there.
- **Customization**: Edit the component file directly to adapt to design requirements.

## Icons
- Import from `lucide-react`.
- `import { IconName } from "lucide-react"`.
