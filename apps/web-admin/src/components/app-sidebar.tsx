"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  LifeBuoy,
  Target,
  ClipboardList,
  Users,
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

// Admin navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
    },
    {
      title: "Missions",
      url: "/missions",
    },
    {
      title: "Survey Inventory",
      url: "/surveys",
      isActive: true,
      items: [
        {
          title: "All Surveys",
          url: "/surveys",
        },
        {
          title: "Survey Provider",
          url: "/providers",
          isActive: true,
        },
        {
          title: "Sync Jobs",
          url: "/sync-jobs",
        },
        {
          title: "API Logs",
          url: "/logs",
        },
      ],
    },
    {
      title: "Members",
      url: "/members",
    },
  ],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Survey Inventory</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             {/* User menu placeholder */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
