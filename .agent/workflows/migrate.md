---
description: Manage Database Migrations
---
# Database Migrations

## 1. Schema Changes
Modify the schema files in `packages/db/src/schema/*.ts`.

## 2. Generate Migration
Create the SQL migration file based on your schema changes:

```bash
pnpm db:generate
```
*Prompt checking: Ensure the generated SQL in `packages/db/drizzle` looks correct.*

## 3. Apply Local Migration
Apply the changes to your local development database:

```bash
pnpm db:migrate
```

## 4. Troubleshooting
If the database state is inconsistent with the migration history:
```bash
# DANGER: This wipes the database!
pnpm db:reset
```
