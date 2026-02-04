---
description: Guide on how to start and run the development environment.
---

# Development Environment Setup

## 1. Prerequisites

- **Node.js**: (Use version defined in `.nvmrc` or `package.json`).
- **Package Manager**: `pnpm` (Corepack enabled or installed globally).
- **Supabase CLI**: Required for local DB (`npm i -g supabase` or use `npx`).
- **Docker**: Required for local Supabase.

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Local Infrastructure (Database)

Start the local Supabase stack. This provides Postgres, Auth, and Storage locally.

```bash
cd packages/supabase
npx supabase start
```

_Note: This runs in the background. Use `npx supabase stop` to shut down._

## 4. Run Application

Start the development servers for all apps (Worker + Docs).

```bash
pnpm dev
# or
// turbo-all
pnpm dev --filter worker
pnpm dev --filter docs
```

- **Worker API**: `http://localhost:8787`
- **Storybook**: `http://localhost:6006`

## 5. Environment Variables

- Check `.env.example` in each app.
- Create `.dev.vars` for Cloudflare Workers local development if needed (though `pnpm dev` usually handles this via `.env`).
