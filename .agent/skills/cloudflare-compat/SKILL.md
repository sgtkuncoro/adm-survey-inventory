---
name: cloudflare-compat
description: Check code for Cloudflare Workers compatibility, ensuring no unsupported Node.js APIs are used.
---

# Cloudflare Worker Compatibility Skill

When implementing functionality for the Hono backend, ALWAYS verify:

1. **Node.js APIs**: Workers runtime does NOT support all Node.js APIs.
   - Avoid: `fs`, `child_process`, `net`.
   - Allowed with `compatibility_flags`: `nodejs_compat` allows `Buffer`, `crypto`, `AsyncLocalStorage`.
   - Use the `node:` prefix for imports (e.g., `import { Buffer } from "node:buffer";`).

2. **Edge Constraints**:
   - Execution time limits (usually 10ms-30s depending on plan).
   - Bundle size limits.

3. **External Requests**:
   - Use standard `fetch()`.
   - Ensure `async/await` is used correctly for I/O.

4. **Environment Variables**:
   - Access via `c.env` in Hono context, NOT `process.env`.
