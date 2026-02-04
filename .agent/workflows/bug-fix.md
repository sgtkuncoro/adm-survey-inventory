---
description: Standard Operating Procedure for reproducing, analyzing, and fixing bugs.
---

# Bug Fix Workflow

Follow this method to systematically resolve issues.

## Phase 1: Reproduction [PLANNING]

1.  **Isolate the Issue**:
    - Identify the specific input or state that causes the failure.
    - Identify the environment (Local, Worker, User).

2.  **Create Reproduction Case**:
    - Create a script or simple HTTP request (curl) that consistently triggers the bug.
    - _Goal_: Fail first.

## Phase 2: Analysis [PLANNING]

3.  **Trace**:
    - Follow the execution path in the code.
    - Check logs (Cloudflare Worker logs or `wrangler tail`).
4.  **Hypothesis**:
    - Formulate a hypothesis for the root cause (e.g., "Missing RLS policy", "Incorrect Zod schema", "Type mismatch").

## Phase 3: Resolution [EXECUTION]

5.  **Implement Fix**:
    - Apply changes to the code.
    - **Constraint**: Check for regressions. Does this break existing functionality?

## Phase 4: Verification [VERIFICATION]

6.  **Run Reproduction**:
    - Run the script from Phase 1. It should now pass.
7.  **Run Full Suite**:
    - Run project tests to ensure no side effects.
