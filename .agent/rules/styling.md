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

## Shared UI Library (@packages/ui)

- **Primary Source**: ALWAYS use `@packages/ui` for core components (Button, Input, Card, etc.).
- **Missing Components**: If a component is needed but not in `@packages/ui`, you MUST create it in `@packages/ui` first, then import it.
- **Do Not**: Do not create ad-hoc UI components in `apps/web/components/ui` unless they are highly specific and not reusable (Molecules/Organisms). Basic Atoms must go to `@packages/ui`.
- **Installation**: Use shadcn/ui components by installing/copying them into `packages/ui`.

## Icons

- Import from `lucide-react`.
- `import { IconName } from "lucide-react"`.
