# @packages/db

Production-ready database package using Drizzle ORM with PostgreSQL.

## Setup

### Local Development

1. Start the database:
   ```bash
   docker compose up -d
   ```

2. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/survey_inventory"
   ```

3. Apply migrations:
   ```bash
   pnpm db:push
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate migrations from schema changes |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:push` | Push schema directly to database (dev only) |
| `pnpm db:studio` | Open Drizzle Studio for visual DB management |
| `pnpm db:pull` | Introspect existing database to generate schema |

## Usage

```typescript
import { db, eq, surveyProviders } from "@packages/db";

// Query all active providers
const providers = await db
  .select()
  .from(surveyProviders)
  .where(eq(surveyProviders.isActive, true));

// Insert a new provider
await db.insert(surveyProviders).values({
  name: "Example Provider",
  slug: "example-provider",
});
```

## Schema

The schema is organized into logical modules:

- `providers.ts` - Survey provider configuration
- `surveys.ts` - External surveys, quotas, qualifications
- `users.ts` - User profiles, sessions, eligibility cache
- `sync.ts` - Sync job logs, qualification legend

## Migrations

SQL migration files are stored in `drizzle/`:

| File | Description |
|------|-------------|
| `0000_init_schema.sql` | Core tables and indexes |
| `0001_wallet_transactions.sql` | Wallet transaction tracking |
| `0002_seed_mc_provider.sql` | Morning Consult provider seed |

To run migrations programmatically:
```bash
pnpm migrate:run
```
