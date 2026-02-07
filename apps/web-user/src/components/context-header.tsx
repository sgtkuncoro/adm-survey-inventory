"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";

export function ContextHeader() {
  const pathname = usePathname();
  
  // Clean up pathname to get title
  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[segments.length - 1] || "Dashboard";
  
  const title = currentSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-6 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out dark:bg-black/20 dark:border-white/5">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 hover:bg-white/10 transition-colors" />
        <Separator orientation="vertical" className="mr-2 h-6 bg-border/40" />
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-left-4 duration-500">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-foreground text-muted-foreground transition-colors">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/10 hover:text-foreground text-muted-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
