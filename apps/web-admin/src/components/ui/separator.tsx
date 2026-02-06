import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
    asChild?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, asChild = false, ...props },
    ref
  ) => {
      const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation === "vertical" ? "vertical" : undefined}
        className={cn(separatorVariants({ orientation, className }))}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
