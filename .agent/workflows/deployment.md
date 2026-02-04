---
description: Standard Operating Procedure for deploying the application.
---

# Deployment Process

Follow these steps to safely deploy updates.

## 1. Pre-Deployment Checks

- [ ] **Linting**: Ensure `pnpm lint` passes.
- [ ] **Types**: Ensure `pnpm type-check` (or `tsc --noEmit`) passes.
- [ ] **Build**: Ensure the project builds locally (`pnpm build`).

## 2. Database Migrations

**WARNING**: Database changes must be applied _before_ or _compatible with_ the new code deployment.

1.  Navigate to `packages/supabase`.
2.  Run `npx supabase db push`.
3.  _Verify_: Check Supabase dashboard to confirm migration success.

## 3. Backend Deployment (Worker)

Deploy the Cloudflare Worker:

```bash
# Deploy to production
pnpm --filter worker deploy
```

## 4. Documentation Deployment

Deploy Storybook (if configured for hosting, e.g., Cloudflare Pages or Chromatic):

```bash
# Build storybook
pnpm --filter docs build-storybook
```

## 5. Post-Deployment Verification

- [ ] **Health Check**: Ping the health endpoint `/`.
- [ ] **Critical Flows**: Manually verify critical paths (e.g., specific API features).
- [ ] **Monitoring**: minimal logs via `wrangler tail` if initial instability is suspected.
