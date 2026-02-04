# Authentication Rules

## Core Stack

- **Provider**: Supabase Auth (GoTrue)
- **Session Management**: Supabase GoTrue sessions (access tokens + refresh tokens).
- **Identity**: Users are identified by `auth.uid()` in the database.

## Implementation

- **Client**: Use the Supabase Client SDK (`auth` module) for login, signup, and session management.
- **Middleware**:
  - Worker: Injected Supabase client handles session/user retrieval.
  - Next.js: Use Supabase SSR helper to manage cookies and protected routes.
- **Hono**: Access user info via `c.get("user")` if using an auth middleware that populates it from the Supabase session.

## Security

- **RLS Integration**: ALWAYS use `auth.uid() = user_id` in RLS policies to enforce ownership.
- **JWT Verification**: Ensure the JWT is valid before processing requests on the worker.
- **Service Role**: NEVER use the service role key on the client side. ONLY use it in background tasks or admin-only routes on the worker.
