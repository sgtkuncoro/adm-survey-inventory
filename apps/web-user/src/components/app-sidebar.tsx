"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Wallet,
  History,
  User,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
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

// User navigation data
const data = {
  navMain: [
    {
      title: "Surveys",
      url: "/surveys",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "My Wallet",
      url: "/wallet",
      icon: Wallet,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Survey Rewards</span>
                  <span className="truncate text-xs">Adbloom</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {/* Footer content */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
