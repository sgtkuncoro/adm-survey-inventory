# Architecture & Monorepo Structure

## Workspace Structure

This project uses Turborepo with pnpm workspaces.

- `apps/worker`: Hono application on Cloudflare Workers (Backend API)
- `apps/docs`: Storybook documentation and design system (Current UI focus)
- `apps/web`: Next.js 15 application (Planned Frontend)
- `packages/supabase`: Supabase migrations, client initialization, and type generation
- `packages/ui`: Shared UI components (shadcn/ui), Tailwind configuration
- `packages/utils`: Shared utility functions (date formatting, calculation logic)
- `packages/tsconfig`: Shared TypeScript configurations
- `packages/eslint-config`: Shared ESLint configurations

## Dependency Flow

- **Strict Direction**: `apps` depend on `packages`. `packages` should NOT depend on `apps`.
- **Sibling Dependencies**: `packages` can depend on other `packages` (e.g., `packages/db` might use `packages/utils`), but avoid circular dependencies.

## Shared Configuration

- **Tailwind**: Tailwind config is central in `packages/ui` or `packages/config` and extended by apps.
- **TypeScript**: Base `tsconfig.json` in `packages/tsconfig`. Apps extend `base` or `next` configs.

## Environment Variables

- **Type Safety**: Use `zod` to validate environment variables in both apps.
- **Access**: CI/CD secrets handling differs between Cloudflare (Wrangler secrets) and Vercel/Next.js.
