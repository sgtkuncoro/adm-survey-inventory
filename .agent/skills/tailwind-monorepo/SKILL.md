---
name: tailwind-monorepo
description: Best practices for managing Tailwind CSS v4 in a Turborepo monorepo with Shared UI and Config.
---

# Tailwind CSS v4 in Turborepo (Best Practice)

This guide outlines the standard operating procedure for managing styles across `apps/web` (Next.js) and `components/ui` using Tailwind CSS v4. It strictly follows the architecture where the UI package compiles its own styles, and the application consumers import that artifact.

## 1. Architecture

### Shared Configuration Package (`packages/config-tailwind`)

- **Purpose**: Source of truth for design tokens (Theme variables, keyframes).
- **Exports**: `theme.css`.
- **Content**:
  ```css
  @import "tailwindcss";
  @theme {
    --color-primary: hsl(var(--primary));
  }
  :root { ... variables ... }
  ```

### Shared UI Package (`components/ui`)

- **Purpose**: Reusable components.
- **Config**: Imports `@packages/config-tailwind/theme.css`.
- **Build**: Compiles its own CSS to `dist/globals.css` using `tailwindcss`.
- **Exports**:
  - JS/TS components via `.`
  - Compiled CSS via `./globals.css` -> `./dist/globals.css`

### Application (`apps/web`)

- **Configuration**:
  - **Imports Config**: `@import "@packages/config-tailwind/theme.css";` (for local app utility classes).
  - **Imports UI Styles**: `@import "local shadcn/ui components/globals.css";` (for shared component styles).
- **NO Scanning**: **DO NOT** use `@source` to scan the UI package source files. This is fragile and relies on internal implementation details.

## 2. Setup

### Configuration Package (`packages/config-tailwind/package.json`)

You must export the theme file with the `style` condition for Tailwind/PostCSS resolution.

```json
{
  "exports": {
    ".": {
      "import": "./theme.css",
      "style": "./theme.css",
      "default": "./theme.css"
    },
    "./theme.css": {
      "import": "./theme.css",
      "style": "./theme.css",
      "default": "./theme.css"
    }
  }
}
```

### UI Package (`components/ui/package.json`)

Must have scripts to build styles and export the compiled output.

```json
{
  "scripts": {
    "build:styles": "tailwindcss -i ./src/globals.css -o ./dist/globals.css",
    "dev:styles": "tailwindcss -i ./src/globals.css -o ./dist/globals.css --watch"
  },
  "exports": {
    "./globals.css": {
      "import": "./dist/globals.css",
      "style": "./dist/globals.css",
      "default": "./dist/globals.css"
    }
  }
}
```

## 3. Usage in App (`globals.css`)

```css
@import "tailwindcss";
@import "@packages/config-tailwind/theme.css";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@plugin "tailwindcss-animate";

```

## 4. Development Workflow

### Adding a New Color

1.  Add variable to `packages/config-tailwind/theme.css`.
2.  Run `pnpm build:styles` in `components/ui` if used there.

### Changing UI Components

1.  Modify component in `components/ui`.
2.  If classes are added, ensure `components/ui` watcher is running (`pnpm dev:styles`) or rebuild styles.
