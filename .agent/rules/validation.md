# Validation Rules (Zod)

## Core Stack
- **Library**: Zod

## Patterns
- **Environment**: Validate all env vars on startup using Zod schemas.
- **API Inputs**: Validate all request bodies and query params in Hono using `@hono/zod-validator`.
- **Database**: Use `drizzle-zod` to generate schemas from table definitions, then extend/refine them for API DTOs.
- **Forms**: Use Zod schemas with `@tanstack/react-form`.

## Naming
- Suffix schemas with `Schema` (e.g., `loginSchema`, `userProfileSchema`).
- Export inferred types: `export type LoginInput = z.infer<typeof loginSchema>`.
