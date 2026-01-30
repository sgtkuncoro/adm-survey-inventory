# Hono & Cloudflare Workers Rules

## Core Stack
- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Database Access**: Via `packages/db` (Drizzle + Postgres)

## Worker Structure
- **Entry Point**: `src/index.ts`
- **Handlers**: Group routes by feature (e.g., `src/routes/surveys.ts`).
- **Middleware**: Use Hono middleware for auth, logging, and CORS.

## Cloudflare Specifics
- **Compatibility**: ALWAYS check Cloudflare Workers compatibility for any new package. Avoid Node.js native modules (fs, crypto, net) unless supported by `compatibility_flags`.
- **Bindings**: Define types for `Bindings` interface (KV, D1, Postgres connection string) in `src/bindings.d.ts`.
- **Wrangler**: Use `wrangler.toml` for configuration. Manage secrets via `wrangler secret put`.

## Error Handling
- Return structured JSON errors: `{ error: "message", code: "CODE" }`.
- Use correct HTTP status codes (400, 401, 403, 404, 500).
