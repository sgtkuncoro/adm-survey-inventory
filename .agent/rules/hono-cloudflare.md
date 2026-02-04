# Hono & Cloudflare Workers Rules

## Core Stack

- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Database Access**: Via `@packages/supabase` (Supabase Client).
- **Documentation**: OpenAPI 3.0 via `@hono/zod-openapi` and Scalar.

## Worker Structure

- **Entry Point**: `src/index.ts` (Exports handlers for `fetch` and `scheduled`).
- **Handlers**: Group routes by feature (e.g., `src/routes/surveys.ts`) using `OpenAPIHono`.
- **Middleware**: Use Hono middleware for CORS and Supabase client injection.
- **Scheduled Jobs**: Use the `scheduled` handler for cron tasks (e.g., survey ingestion).

## Cloudflare Specifics

- **Compatibility**: ALWAYS check Cloudflare Workers compatibility for any new package. Avoid Node.js native modules unless supported by `nodejs_compat`.
- **Bindings**: Define types for `Bindings` interface in `src/index.ts` or a shared types file.
- **Wrangler**: Use `wrangler.toml` for configuration.

## Error Handling

- Return structured JSON errors: `{ error: "message", code: "CODE" }`.
- Use correct HTTP status codes (400, 401, 403, 404, 500).
