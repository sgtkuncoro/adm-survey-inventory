---
name: atomic-design
description: Guidelines for implementing Atomic Design principles across apps/web-admin and components/ui.
---

# Atomic Design Pattern

This project follows the **Atomic Design** methodology to ensure reusability, consistency, and scalability across the `apps/web-admin` frontend and `components/ui`.

## 1. Hierarchy & Location

| Level         | Description                                        | Monorepo Location                                         | Examples                                                       |
| :------------ | :------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------- |
| **Atoms**     | Basic building blocks. Indivisible.                | `components/ui`                                         | Button, Input, Icon, Label, Badge.                             |
| **Molecules** | Groups of atoms functioning together.              | `components/ui`                                         | SearchInput (Input + Icon), FormField (Label + Input + Error). |
| **Organisms** | Complex sections forming distinct interface parts. | `apps/web-admin/src/organisms` <br> _(planned for `apps/web`)_ | Navbar, Sidebar, DataTable, UserProfileCard.                   |
| **Templates** | Page layouts without data (wireframes).            | `apps/web-admin/src/templates` <br> _(planned for `apps/web`)_ | DashboardLayout, AuthLayout, SettingsGrid.                     |
| **Pages**     | Templates instances with real data.                | `apps/web-admin/app/(routes)` <br> _(planned)_                  | `page.tsx`, `layout.tsx`.                                      |

## 2. Implementation Rules

### A. Atoms (`components/ui`)

- **No Business Logic**: Purely presentational.
- **Priority**: ALWAYS use existing Shadcn UI components over HTML primitives or other libraries.
- **Props**: Accept `className` (merged via `cn()`) and primitive data.
- **State**: Local UI state only (e.g., hover, active).
- **Dependencies**: Only other atoms or utility libs (Tailwind, Radix).
- **Icons**: Use `lucide-react`. Do NOT use `react-icons` or SVG directly unless absolutely necessary.

```tsx
// components/ui/button.tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
```

### B. Molecules (`components/ui` or `apps/web-admin/src/components`)

- **Composition**: Do simple layouts of Atoms.
- **Responsibility**: handle "doing one thing well" (e.g., a search bar).
- **Reusable**: Should not depend on specific app context (like a user ID) if in `components/ui`.

```tsx
// components/ui/search-bar.tsx
export function SearchBar() {
  return (
    <div className="flex">
      <Input />
      <Button>
        <SearchIcon />
      </Button>
    </div>
  );
}
```

### C. Organisms (`apps/web-admin/src/components/organisms`)

- **Context Aware**: Can connect to specialized context or business logic hooks.
- **Complex**: Composed of multiple molecules.
- **Example**: A `SurveyList` organism might import `SurveyCard` molecules and use a `useSurveys()` hook.

### D. Templates (`apps/web-admin/src/components/templates`)

- **Grid/Layout**: Defines the structure (Sidebar + Header + Content Area).
- ** Slots**: Uses `children` or named props (`headerSlot`, `sidebarSlot`) to accept Organisms.

## 3. Workflow

1.  **New Feature Request**: "Add a User Settings Page".
2.  **Breakdown**:
    - **Page**: `apps/web-admin/app/settings/page.tsx`.
    - **Template**: `SettingsLayout` (Sidebar + Content).
    - **Organisms**: `ProfileForm`, `NotificationSettings`.
    - **Molecules**: `AvatarUpload`, `ToggleSwitchWithLabel`.
    - **Atoms**: `Toggle`, `Button`, `Label`.
3.  **Check**: Is there a Shadcn UI component for this? Yes -> Use it / Install it. No -> Build Atom in `components/ui`.
