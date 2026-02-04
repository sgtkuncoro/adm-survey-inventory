---
description: Standard Operating Procedure for managing database schemas and migrations.
---

# Database Change Workflow

Follow this process for any changes to the database structure.

## Phase 1: Migration Creation [EXECUTION]

1.  **Draft Migration**:
    - Use the Supabase CLI to create a timestamped SQL file.
    - _Command_: `npx supabase migration new <descriptive_name>` (Run in `packages/supabase`).

2.  **Write SQL**:
    - Edit the generated file in `packages/supabase/supabase/migrations/`.
    - **Rules**:
      - Use `snake_case` for everything (tables, columns, functions).
      - ALWAYS enable Row Level Security (RLS).
      - `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
      - Add Policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

## Phase 2: Application [EXECUTION]

3.  **Local Reset**:
    - Reset the local database to apply the new schema.
    - // turbo
    - _Command_: `npx supabase db reset` (in `packages/supabase`).

4.  **Type Generation**:
    - Update the shared TypeScript types.
    - // turbo
    - _Command_: `pnpm types:generate` (in `packages/supabase`).

## Phase 3: Verification [VERIFICATION]

5.  **Check RLS**:
    - Ensure you cannot access the table without a policy (default deny).
    - Verify policies work as expected for authenticated vs anonymous users.

## Phase 4: Deployment [DEPLOYMENT]

6.  **Push to Remote**:
    - When ready to deploy.
    - _Command_: `npx supabase db push` (in `packages/supabase`).
