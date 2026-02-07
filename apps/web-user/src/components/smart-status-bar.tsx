"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, Bell, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export function SmartStatusBar({ user }: { user?: { name: string; email: string; avatar: string; walletBalance?: number; pendingTasks?: number; completionPercentage?: number } }) {
  const pathname = usePathname();
  const { open } = useSidebar();
  
  // Clean up pathname to get title
  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[segments.length - 1] || "Dashboard";
  
  const title = currentSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Mock data - would normally come from props or store
  const walletBalance = user?.walletBalance || 0.00;
  const pendingTasks = user?.pendingTasks || 0;
  const progressPercentage = user?.completionPercentage || 0;
  const timeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.name || "User";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 px-6 pt-4 pb-2">
      <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
        <SidebarTrigger className={cn("hover:bg-accent transition-colors", !open && "opacity-100")} />
        
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">
            {timeGreeting()}, {displayName}
          </span>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-6 animate-in slide-in-from-right-4 duration-500 delay-100">
        {/* Progress Widget */}
        <div className="hidden md:flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile">
                  <div className="relative h-10 w-10 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                    <svg className="h-full w-full -rotate-90 text-muted/20" viewBox="0 0 36 36">
                      <path className="stroke-current" fill="none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <svg className="absolute h-full w-full -rotate-90 text-green-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" viewBox="0 0 36 36">
                      <path 
                        className="stroke-current transition-all duration-1000 ease-out" 
                        strokeDasharray={`${progressPercentage}, 100`}
                        fill="none" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-foreground">{progressPercentage}%</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                {progressPercentage < 100 ? (
                  <p>Complete your profile</p>
                ) : (
                  <p>Profile Complete!</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
           <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
             {pendingTasks} Pending Tasks
           </span>
        </div>

        {/* Action Pill */}
        <div className="flex items-center gap-1 bg-background border border-border/100 shadow-none rounded-full p-1 pl-4 pr-1">
          <div className="flex items-center gap-2 mr-3">
             <span className="text-sm font-medium text-muted-foreground">Wallet:</span>
             <span className="text-sm font-bold text-foreground flex items-center gap-1">
               ${walletBalance.toFixed(2)}
               <TrendingUp className="h-3 w-3 text-green-500" />
             </span>
          </div>
          
          <div className="h-4 w-px bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted transition-colors">
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full hover:bg-muted transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
          </Button>
        </div>
      </div>
    </header>
  );
}
