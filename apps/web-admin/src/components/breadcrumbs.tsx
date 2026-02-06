"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const segments = pathname.split('/').filter(Boolean);

  const formatTitle = (segment: string) => {
    // Handle UUIDs or IDs gracefully - maybe truncate or specific mapping?
    // For now, simple capitalization
    if (segment.length > 20) return segment.slice(0, 8) + "..."; // Shorten IDs
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="w-4 h-4"/>
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const title = formatTitle(segment);

        return (
          <Fragment key={href}>
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{title}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {title}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
