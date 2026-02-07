# Coding Standards & Clean Code

## Unused Code Policy

-   **Zero Tolerance for Unused Code**: You MUST ALWAYS remove unused variables, functions, and imports.
-   **Imports**: When refactoring or modifying files, check the import section. If a module is no longer used, remove it immediately.
-   **Variables**: Do not leave `const`, `let`, or function arguments that are never accessed. Prefix with `_` only if strictly required by function signature, but prefer removal.
-   **Commented Out Code**: Do not commit commented-out code. Delete it.
