---
description: Workflow for adding a new feature
---
1. **Plan**: Define data requirements.
2. **Database**:
   - Update schema in `packages/db`.
   - Run `pnpm db:generate` and `pnpm db:migrate`.
3. **Backend (Worker)**:
   - Create Zod validation schema for inputs.
   - Create new route/handler in `apps/worker`.
   - Add tests if applicable.
4. **Frontend (Web)**:
   - Create/Update TanStack Query hooks to consume the new API.
   - Build UI components using shadcn/ui.
   - Integrate form logic with Zod.
5. **Verify**:
   - Test flow end-to-end locally.
