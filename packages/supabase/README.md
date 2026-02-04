# Database Migrations

This package manages the database schema using the Supabase CLI.

## Directory Structure

- `supabase/migrations/`: Contains SQL migration files.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed locally or via `npx`.
- Access to the project's `DATABASE_URL` or project reference.

## Commands

### Initialize (already done)

```bash
npx supabase init
```

### Link to Remote Project

First, link your local package to your Supabase project:

```bash
npx supabase link --project-ref qoyqmotcxxbswsaucovt
```

### Apply Migrations to Remote

Once linked, push your migrations:

```bash
npx supabase db push
```

### Dry Run / Local Preview

If you have Docker running:

```bash
npx supabase start
```

### Generate Migration from SQL

If you add new SQL files manually:

```bash
npx supabase migration new [migration_name]
```

## Manual Application

If you don't want to use the CLI to push, you can always find the latest schema in:
`supabase/migrations/20240202000000_init_schema.sql`

> [!IMPORTANT]
> The Supabase CLI requires the folder to be named exactly `supabase/migrations` (within the root of where you run the commands) to automatically detect and apply them.
