"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Target,
  Users,
  ListTodo,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavSecondary } from "@/components/ui/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { NavUser } from "@/components/nav-user"

import { usePathname } from "next/navigation"

// ... existing imports

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
  const pathname = usePathname();

  // Admin navigation data with dynamic active state
  const navMain = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      url: "/",
      isActive: pathname === "/",
    },
    {
      icon: Target,
      title: "Missions",
      url: "/missions",
      isActive: pathname.startsWith("/missions"),
    },
    {
      icon: ListTodo,
      title: "Survey Inventory",
      url: "/surveys",
      isActive: pathname.startsWith("/surveys") || pathname.startsWith("/providers") || pathname.startsWith("/sync-jobs") || pathname.startsWith("/logs"),
      items: [
        {
          title: "All",
          url: "/surveys",
          isActive: pathname === "/surveys",
        },
        {
          title: "Provider",
          url: "/providers",
          isActive: pathname.startsWith("/providers"),
        },
        {
          title: "Sync",
          url: "/sync-jobs",
          isActive: pathname.startsWith("/sync-jobs"),
        },
        {
          title: "Logs",
          url: "/logs",
          isActive: pathname.startsWith("/logs"),
        },
      ],
    },
    {
      icon: Users,
      title: "Members",
      url: "/members",
      isActive: pathname.startsWith("/members"),
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ListTodo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Survey Inventory</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={[]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
         {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
