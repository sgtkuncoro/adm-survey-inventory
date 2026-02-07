---
name: clean-code
description: Guidelines for maintaining a clean codebase by removing unused elements.
---

# Clean Code Skills

## Context
This project enforces a strict "no unused code" policy. This skill defines how to identify and remove unused elements.

## 1. Unused Imports
- **Detection**:
    - Use ESLint/TypeScript errors (e.g., 'xyz' is defined but never used).
    - Visually check the import block after deleting code.
- **Action**: Delete the import specifier. If the import line becomes empty, delete the line.

## 2. Unused Variables
- **Detection**:
    - ESLint errors/warnings.
    - Grayed out text in IDEs.
- **Action**:
    - If a variable is assigned but not read, remove it.
    - If a function call's return value is not used, remove the assignment (just call the function).

## 3. Workflow
1.  **Modify Code**: Implement feature or fix bug.
2.  **Review**: Scroll up to imports.
3.  **Cleanup**: Remove any red/yellow squiggly lines related to usage.
4.  **Verify**: Build/Lint.
