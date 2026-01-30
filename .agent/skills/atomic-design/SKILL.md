---
name: atomic-design
description: Guidelines for implementing Atomic Design principles across apps/web and packages/ui.
---

# Atomic Design Pattern

This project follows the **Atomic Design** methodology to ensure reusability, consistency, and scalability across the `apps/web` frontend and `packages/ui` shared library.

## 1. Hierarchy & Location

| Level | Description | Monorepo Location | Examples |
| :--- | :--- | :--- | :--- |
| **Atoms** | Basic building blocks. Indivisible. | `packages/ui/src/components` | Button, Input, Icon, Label, Badge. |
| **Molecules** | Groups of atoms functioning together. | `packages/ui/src/components` | SearchInput (Input + Icon), FormField (Label + Input + Error). |
| **Organisms** | Complex sections forming distinct interface parts. | `apps/web/components/organisms` <br> *(or `packages/ui` if truly global)* | Navbar, Sidebar, DataTable, UserProfileCard. |
| **Templates** | Page layouts without data (wireframes). | `apps/web/components/templates` | DashboardLayout, AuthLayout, SettingsGrid. |
| **Pages** | Templates instances with real data. | `apps/web/app/(routes)` | `page.tsx`, `layout.tsx`. |

## 2. Implementation Rules

### A. Atoms (`packages/ui`)
-   **No Business Logic**: Purely presentational.
-   **Props**: Accept `className` (merged via `cn()`) and primitive data.
-   **State**: Local UI state only (e.g., hover, active).
-   **Dependencies**: Only other atoms or utility libs (Tailwind, Radix).

```tsx
// packages/ui/src/components/button.tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
```

### B. Molecules (`packages/ui` or `apps/web/components`)
-   **Composition**: Do simple layouts of Atoms.
-   **Responsibility**: handle "doing one thing well" (e.g., a search bar).
-   **Reusable**: Should not depend on specific app context (like a user ID) if in `packages/ui`.

```tsx
// packages/ui/src/components/search-bar.tsx
export function SearchBar() {
  return (
    <div className="flex">
      <Input />
      <Button><SearchIcon /></Button>
    </div>
  )
}
```

### C. Organisms (`apps/web/components/organisms`)
-   **Context Aware**: Can connect to specialized context or business logic hooks.
-   **Complex**: Composed of multiple molecules.
-   **Example**: A `SurveyList` organism might import `SurveyCard` molecules and use a `useSurveys()` hook.

### D. Templates (`apps/web/components/templates`)
-   **Grid/Layout**: Defines the structure (Sidebar + Header + Content Area).
-   ** Slots**: Uses `children` or named props (`headerSlot`, `sidebarSlot`) to accept Organisms.

## 3. Workflow
1.  **New Feature Request**: "Add a User Settings Page".
2.  **Breakdown**:
    -   **Page**: `app/settings/page.tsx`.
    -   **Template**: `SettingsLayout` (Sidebar + Content).
    -   **Organisms**: `ProfileForm`, `NotificationSettings`.
    -   **Molecules**: `AvatarUpload`, `ToggleSwitchWithLabel`.
    -   **Atoms**: `Toggle`, `Button`, `Label`.
3.  **Check**: Do we have the Atoms? Yes -> Build Molecules. No -> Build Atom in `packages/ui` first.
