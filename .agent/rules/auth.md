# Authentication Rules

## Core Stack
- **Library**: better-auth (for Next.js and Hono compatibility)
- **Session Management**: JWT or Database Sessions (Postgres adapter recommended).

## Implementation
- **Client**: Use `better-auth/client` hooks (e.g., `useSession`, `signIn`, `signOut`).
- **Middleware**: Protect routes in `middleware.ts` (Next.js) or Hono middleware (Worker).
- **Hono**: Use `c.get("user")` or similar context injected by auth middleware to access user info.

## Security
- Do not expose sensitive user data (password hashes, PPI) to the client.
- Always validate session on API routes before performing actions.
- Use HTTP-only cookies for session tokens.
