---
description: Standard Operating Procedure for implementing new features across the full stack.
---

# Feature Implementation Workflow

Follow this process to deliver high-quality, fully integrated features.

## Phase 1: Design & API Modeling [PLANNING]

1.  **Requirement Analysis**: Understand the user goal. Check `AGENTS.md` and `task.md`.
2.  **API Design**:
    - Define the URL path (e.g., `/api/surveys/:id/complete`).
    - Define Request/Response schemas using Zod.
    - _Action_: Draft the `createRoute` definition in a scratchpad or implementation plan.

## Phase 2: Database Layer [EXECUTION]

// turbo 3. **Schema Change** (If required): - Follow the **Database Change Workflow** (`.agent/workflows/database-change.md`). - **Goal**: Have migration applied and TypeScript types generated in `@packages/supabase`.

## Phase 3: Backend Implementation [EXECUTION]

4.  **Route Implementation**:
    - Create/Update the route file in `apps/worker/src/routes/`.
    - Use `OpenAPIHono` and `createRoute`.
    - Implement the handler logic using `@packages/supabase` client.
    - **Validation**: Ensure `request.body` and `responses` validation matches the Zod schema.

5.  **Service Logic**:
    - If logic is complex, extract to `src/lib/<context>/`.
    - _Strict Rule_: Keep route handlers thin. Move business logic to separate functions.

## Phase 4: Frontend Implementation [EXECUTION]

6.  **Component Check**:
    - **Rule**: Check `local shadcn/ui components` for existing components first.
    - **Action**: If a base component (Atom) is missing, create it in `components/ui/src` (e.g., `components/ui/src/badge.tsx`).
    - **Forbidden**: Do NOT creating ad-hoc atoms in `apps/web`.

7.  **Feature UI**:
    - **Reference**: Read `.agent/skills/tailwind-monorepo/SKILL.md` for styling rules.
    - Build the page or feature component in `apps/web`.
    - Import atoms from `local shadcn/ui components`.
    - **Icons**: MUST use `lucide-react`. Do not use any other icon library.
    - Only build complex, non-reusable components locally in `apps/web`.

8.  **Storybook (Optional)**:
    - Use `apps/docs` if you need to visualize isolated components.

## Phase 5: Verification [VERIFICATION]

9.  **Manual Verification**:
    - Use a tool like `curl` or the Swagger UI (`/ui`) to hit the local worker URL.
    - Verify success paths and error states (400, 401, 404).

10. **Code Review Self-Check**:
    - [ ] Are environment variables typed?
    - [ ] Is RLS enabled on new tables?
    - [ ] Are no Node.js native modules used (Cloudflare compat)?
    - [ ] Are types generated?
