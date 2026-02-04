# Database & Supabase Rules

## Core Stack

- **Database**: PostgreSQL (Supabase)
- **Management**: Supabase CLI for migrations and schema sync.
- **Client**: Supabase Client SDK (`@supabase/supabase-js`).

## Schema Management

- **Location**: Define all schemas via SQL migrations in `packages/supabase/supabase/migrations`.
- **Naming**: Use snake_case for all table names and columns.
- **Foreign Keys**: Enforce referential integrity at the database level.
- **Types**: Use Supabase CLI to generate TypeScript types from the database:
  - Run `pnpm types:generate` in `packages/supabase`.

## Migrations

- **New Migration**: `npx supabase migration new <name>`
- **Local Dev**: Use `npx supabase start` and `npx supabase db reset`.
- **Production Push**: `npx supabase db push` (from CI/CD or authorized admin).

## Type Safety

- **Typed Client**: Use `TypedSupabaseClient` from `@packages/supabase`.
- **Inference**: Use generated types for `Tables<"table_name">` and `Enums<"enum_name">`.

## Security

- **Row Level Security (RLS)**: ALWAYS enable RLS on every table.
- **Policies**: Define policies in the migration files to restrict access based on user identity (`auth.uid()`).
