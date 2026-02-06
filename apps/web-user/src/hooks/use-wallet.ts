import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/utils/supabase/client";

export function useWallet() {
  return useQuery({
    queryKey: ["user", "wallet"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Not authenticated");

      // Fetch user balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", session.user.id)
        .single();
        
      if (userError) throw userError;

      // Fetch transactions
      const { data: transactions, error: txError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      return {
        balance: user?.wallet_balance || 0,
        transactions: transactions || []
      };
    }
  });
}
