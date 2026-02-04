---
name: supabase-cloudflare
description: Best practices for using the Supabase Client (via shared package) within Cloudflare Workers and Next.js (SSR).
---

# Supabase Shared Package Usage

This skill uses the shared package `@packages/supabase` to manage Supabase clients, ensuring consistent type safety and configuration across the monorepo (Workers + Planned Next.js App).

## 1. Shared Package Pattern

**Do not** initialize `@supabase/supabase-js` directly. Use the factory functions from `@packages/supabase`.

### Structure

- **Package**: `packages/supabase`
- **Exports**:
  - \`createWorkerClient(env, headers)\`: For Cloudflare Workers (Hono).
  - \`createAdminClient(env)\`: For Service Role (Background tasks).
  - \`createBrowserClient(env)\`: For Client Components (`use client`).
  - \`createServerClient(env, cookieAdapter)\`: For Server Components (RSC).

## 2. Usage in Hono (Worker)

### Bindings & Initialization

Initialize per-request to inject Authorization headers.

\`\`\`typescript
import { createWorkerClient } from '@packages/supabase';

app.get('/api', async (c) => {
const supabase = createWorkerClient(c.env, {
Authorization: c.req.header('Authorization')!
});
// ...
});
\`\`\`

## 3. Usage in Next.js (SSR / App Router)

### Server Components

Pass the cookie adapter from \`next/headers\`.

\`\`\`typescript
import { createServerClient } from '@packages/supabase';
import { cookies } from 'next/headers';

export async function getUser() {
const cookieStore = cookies();

const supabase = createServerClient(
process.env as any, // or env validator
{
getAll: () => cookieStore.getAll(),
setAll: (cookiesToSet) => {
try {
cookiesToSet.forEach(({ name, value, options }) =>
cookieStore.set(name, value, options)
);
} catch {
// The `setAll` method was called from a Server Component.
// This can be ignored if you have middleware refreshing
// user sessions.
}
}
}
);

return await supabase.auth.getUser();
}
\`\`\`

## 4. Type Generation

Run the generation script to update types in the shared package.

\`\`\`bash
pnpm db:generate:types
\`\`\`
