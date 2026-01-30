---
name: html-to-shadcn
description: Guidelines for converting raw HTML/CSS into Shadcn UI and Tailwind components.
---

# Skill: HTML to Shadcn/Tailwind Component Conversion

This skill guides the process of converting raw HTML/CSS designs into production-ready, enterprise-grade React components using **shadcn/ui** and **Tailwind CSS**.

## 1. Analysis & Decomposition
Before coding, analyze the HTML structure to identify component boundaries.
- **Atoms**: Basic elements (Buttons, Inputs, Badges). *Map directly to `components/ui`*.
- **Molecules**: Combinations of atoms (Search Bar, User Card). *Create in `components/features`*.
- **Organisms**: Complex sections (Sidebar, Data Table). *Create in `components/layout` or `components/features`*.
- **Templates**: Page layouts.

## 2. Shadcn/Radix Mapping Strategy
Map standard HTML tags to accessible Shadcn components first.

| HTML Element | Shadcn Component | Notes |
| :--- | :--- | :--- |
| `<button>` | `<Button>` | Use `variant` (default, outline, ghost, destructive) instead of custom standard styles. |
| `<input>` | `<Input>` | Ensure `type` and `placeholder` are passed. |
| `<select>` | `<Select>` | detailed composition with `SelectTrigger`, `SelectContent`. |
| `<div>` (modal) | `<Dialog>` / `<Sheet>` | Use for overlays. |
| `<table>` | `<Table>` | Use `TableHeader`, `TableRow`, `TableCell` etc. |
| `<ul>`/`<li>` (menu) | `<DropdownMenu>` | Or `<NavigationMenu>` for top nav. |
| `<span>` (label) | `<Badge>` | If used as a status indicator. |

## 3. Implementation Rules (Enterprise Level)

### A. Component Definition
Always use `forwardRef` and strictly typed props for reusability.

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants if the component has visual states
const itemVariants = cva(
  "flex items-center gap-2 p-2 rounded-md transition-colors", 
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
        false: "hover:bg-muted",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

// 2. Extend HTML attributes for flexibility
interface NavItemProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  icon?: React.ReactNode
  label: string
}

// 3. Forward Ref for accessibility and library compatibility
const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(
  ({ className, active, icon, label, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(itemVariants({ active }), className)} // 4. ALWAYS use cn() to merge classes
        {...props} 
      >
        {icon && <span className="h-4 w-4">{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
    )
  }
)
NavItem.displayName = "NavItem" // 5. Set display name

export { NavItem }
```

### B. Tailwind Conversion
- **Do not use arbitrary values** (e.g., `w-[235px]`) unless strictly necessary. Use design tokens (`w-64`, `w-full`).
- **Use CSS Variables** for colors (`bg-primary` not `bg-blue-600`) to support theming/dark mode.
- **Layouts**: Prefer `flex` and `grid` over floats or absolute positioning.
- **Spacing**: Use standard spacing scale (`p-4`, `gap-2`).

### C. Accessibility (a11y)
- If converting a non-semantic `<div>` button, switch to `<Button>` or add `role="button"` and `tabIndex={0}` (plus keyboard handlers).
- Ensure all interactive elements have visible focus states (`focus-visible:ring-2`).
- Copy `aria-*` attributes from the original HTML if valid, or let Radix primitives handle them.

## 4. Workflows

### Scenario: Converting a "Card"
1.  **Identify**: It has a header, title, content, and footer.
2.  **Map**: Use `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` from `@/components/ui/card`.
3.  **Refactor**:
    ```tsx
    // Raw HTML
    <div class="box shadow-lg p-4 rounded border">
      <h3 class="bold text-lg">Title</h3>
      <p class="text-gray-500">Desc</p>
    </div>

    // Shadcn Conversion
    <Card> // implicit border, rounded, bg-card
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Desc</CardDescription>
      </CardHeader>
    </Card>
    ```

### Scenario: Converting a "Sidebar Link"
1.  **Identify**: Interactive item, likely needs `next/link` functionality.
2.  **Map**: Create a `SidebarItem` component (as shown in implementation rules) or use `Button` with `variant="ghost"`.
3.  **Compose**: Wrap with `Link` from `next/link` at the usage site, pass `href`.
