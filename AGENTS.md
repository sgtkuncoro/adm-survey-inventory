# AGENTS.md

## Project Overview

This is a **Survey Inventory System** for ShopperArmy, designed to integrate with external survey API providers (starting with **Morning Consult**). It pulls survey inventory, calculates user eligibility, and manages payouts.

**Architecture:**

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Hono framework on Cloudflare Workers (`apps/worker`)
- **Database**: PostgreSQL via Supabase (`packages/supabase`)
- **Documentation**: OpenAPI/Swagger (`/ui`) + Storybook (`apps/docs`)
- **Frontend**: Next.js 15 (Planned in `apps/web`)

## Current Implementation Status

### ✅ Completed (Backend Foundation)

- **Database Schema**: Supabase migrations for providers, sessions, eligibility, and transactions.
- **Security**: Ed25519 signing for entry URLs & redirect signature verification.
- **Integration**: Morning Consult API Client (Inventory + Eligibility).
- **Automation**: Scheduled cron job (`syncSurveyInventory`) for daily inventory sync.
- **Business Logic**: Eligibility calculation engine & wallet transaction recording.

### 🔄 In Progress / Planned (Frontend)

- **Admin UI**: Provider configuration (Key generation, Redirects).
- **User UI**: Survey Mission Card, Offer Modal, Redirect Result Pages.
- **App**: Next.js web application integration.

## Key Architecture Decisions

### 1. Survey Ingestion & Caching

- **Source of Truth**: External API (Morning Consult).
- **Sync Strategy**: Scheduled Cron Job (every 60 mins).
- **Eligibility**: Per-user caching (TTL 60s) in `user_survey_eligibility`.

### 2. Security & Fraud Prevention

- **Ed25519 URL Signing**: All entry URLs are signed. Private keys encrypted at rest.
- **Signature Verification**: Redirects are verified against MC's public key.
- **Idempotency**: Wallet transactions are recorded once per session ID.

### 3. Payout Calculation

- **Formula**: `user_payout = (CPI_cents * user_payout_pct) / 100`.
- **Thresholds**: Minimum CPI > $2.00 (configurable per provider).

## Workspace Structure

```
apps/
  docs/           # Storybook documentation & Design System
  worker/         # Hono API on Cloudflare Workers (The Core)
  web-admin/      # Next.js Admin Application (Planned)
  web-user/       # Next.js User Application (Planned)

packages/
  supabase/       # Supabase client, migrations, generated types
  config-tailwind/ # Shared Tailwind CSS v4 specific to monorepo
  tsconfig/       # Shared TypeScript configs
  eslint-config/  # Shared ESLint configs
```

## Developer Guide

### Prerequisites

- Node.js (v20+) & pnpm
- Supabase CLI & Docker (for local DB)
- Wrangler (for Cloudflare)

### Quick Start

```bash
# 1. Install
pnpm install

# 2. Start Local Database
cd packages/supabase && npx supabase start

# 3. Run Dev Server
pnpm dev
# - Worker: http://localhost:8787
# - Swagger: http://localhost:8787/ui
# - Storybook: http://localhost:6006
```

### Key Workflows (See `.agent/workflows/`)

- **New Feature**: `feature-implementation.md`
- **Database Change**: `database-change.md`
- **Deployment**: `deployment.md`
- **Bug Fix**: `bug-fix.md`
- **Dev Environment**: `development-environment.md`

### Available Skills (See `.agent/skills/`)

- **tailwind-monorepo**: Best practices for Tailwind v4 in Turborepo (Compiled Styles).
- **hono-openapi**: Guidelines for type-safe APIs with Hono and Zod.
- **cloudflare-compat**: Checks for Cloudflare Workers compatibility.
- **atomic-design**: Principles for structuring components.
- **supabase-cloudflare**: Using Supabase with Cloudflare Workers.

## Critical Rules

1.  **Cloudflare Compat**: NEVER use Node.js native modules (fs, crypto) without `nodejs_compat`.
2.  **Supabase Auth**: ALWAYS use `auth.uid()` in RLS policies.
3.  **Type Safety**: ALWAYS use generated types from `packages/supabase` and `TypedSupabaseClient`.
4.  **Security**: NEVER expose private keys. Provide connection strings via environment variables.
5.  **Styling**: Use local shadcn/ui components in `components/ui`. Using `@packages/config-tailwind` for design tokens is optional but recommended.
6.  **Architecture**: Packages MUST NOT depend on Apps. Avoid circular dependency between packages.
7.  **Database**: ALWAYS use `snake_case` for database tables and columns.


## Environment Variables

### Worker (`apps/worker/.dev.vars` / Secrets)

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ENCRYPTION_KEY=... # 32-byte hex for AES-256
```

## Useful References

- `.resources/MC_SURVEY_INTEGRATION_SPEC.md`: Detailed Morning Consult spec.
- `.tasks/`: Detailed task breakdown.
