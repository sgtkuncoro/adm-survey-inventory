import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SmartStatusBar } from "@/components/smart-status-bar"

import { createSupabaseServer } from "@/utils/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: dbUser } = user ? await supabase
    .from("users")
    .select("wallet_balance, full_name, avatar_url, date_of_birth, gender, country, zip_code")
    .eq("id", user.id)
    .single() : { data: null };

  const { data: eligibilityData } = user ? await supabase
    .from("user_survey_eligibility")
    .select("eligible_bids")
    .eq("user_id", user.id) : { data: null };

  const pendingTasks = eligibilityData 
    ? eligibilityData.reduce((acc, curr) => acc + (Array.isArray(curr.eligible_bids) ? curr.eligible_bids.length : 0), 0)
    : 0;

  // Calculate profile completion
  const completionFields = [
    dbUser?.full_name,
    dbUser?.date_of_birth,
    dbUser?.gender,
    dbUser?.country,
    dbUser?.zip_code
  ];
  const filledFields = completionFields.filter(f => f !== null && f !== undefined && f !== "").length;
  // If no DB record exists yet (new signup before trigger), assume basic auth fields exist (email app metadata) so maybe 20%? 
  // But let's stick to DB data. 
  // Base completion is 0. If name is present (from auth sync), it's 20%.
  
  const completionPercentage = Math.round((filledFields / completionFields.length) * 100);

  const userData = user ? {
    name: dbUser?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: dbUser?.avatar_url || user.user_metadata?.avatar_url || '',
    walletBalance: dbUser?.wallet_balance || 0,
    pendingTasks,
    completionPercentage,
  } : undefined;

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset className="!shadow-none">
        <SmartStatusBar user={userData} />
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
