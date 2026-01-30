---
description: Deploy the application to Staging or Production
---
# Deployment Workflow

This project uses Cloudflare for deployment.

## Prerequisites
- Cloudflare Account
- Wrangler installed (`npm install -g wrangler`)
- Authenticated Wrangler (`wrangler login`)

## Database Migrations
**Always** run migrations before deploying code.

```bash
# Run migrations against the production database
pnpm db:migrate:prod
```

## Backend (Cloudflare Worker)
Deploy the Hono API worker:

```bash
# Deploy to staging (if environments configured in wrangler.toml)
pnpm --filter worker deploy --env staging

# Deploy to production
pnpm --filter worker deploy --env production
```

## Frontend (Next.js)
If deploying to Cloudflare Pages:

```bash
# Build the application
pnpm --filter web build

# Deploy to Cloudflare Pages
pnpm --filter web deploy
```

*Note: In a CI/CD environment (GitHub Actions), these steps should be automated using the `cloudflare/wrangler-action`.*
