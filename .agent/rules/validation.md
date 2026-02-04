# Validation Rules (Zod)

## Core Stack

- **Library**: Zod

## Patterns

- **Environment**: Validate all env vars on startup using Zod schemas.
- **API Inputs**: Validate all request bodies and query params in Hono using `@hono/zod-openapi`.
- **Database**: Use generated TypeScript types from Supabase CLI. Extend them with Zod for API validation if needed.
- **Forms**: Use Zod schemas with `@tanstack/react-form`.

## Naming

- Suffix schemas with `Schema` (e.g., `loginSchema`, `userProfileSchema`).
- Export inferred types: `export type LoginInput = z.infer<typeof loginSchema>`.
