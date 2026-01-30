# Database & Drizzle ORM Rules

## Core Stack
- **Database**: PostgreSQL (Neon, Supabase, or Hyperdrive)
- **ORM**: Drizzle ORM
- **Driver**: `postgres.js` or Cloudflare-compatible driver (e.g., `@neondatabase/serverless`).

## Schema Management
- **Location**: Define all schemas in `packages/db/src/schema`.
- **Exports**: Export all tables in `packages/db/src/schema/index.ts`.
- **Naming**: Use snake_case for table columns, camelCase for TS keys (if using logic to map). simpler to match DB.
- **Relations**: Define relations using Drizzle's relations API.

## Migrations
- **Generate**: `pnpm db:generate` (runs `drizzle-kit generate`).
- **Push/Migrate**:
    - Local: `pnpm db:migrate` (runs migration script).
    - Production: CI pipeline should run migrations.

## Type Safety
- **Inference**: Use `typeof schema.tableName.$inferSelect` for types.
- **Validation**: Combine Drizzle Zod extension (`drizzle-zod`) for generating Zod-based validation schemas from DB definitions.
