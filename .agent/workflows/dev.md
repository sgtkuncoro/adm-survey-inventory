---
description: Start the development environment
---
1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Start Development Server**:
   Run the full monorepo development mode:
   // turbo-all
   ```bash
   pnpm dev
   ```
   This will start both the Next.js frontend (usually port 3000) and the Hono worker (usually port 8787).

3. **Database Studio**:
   To view and edit database data visually:
   ```bash
   pnpm db:studio
   ```

4. **Specific App Development**:
   To run only one app (e.g., web):
   ```bash
   pnpm --filter web dev
   ```
