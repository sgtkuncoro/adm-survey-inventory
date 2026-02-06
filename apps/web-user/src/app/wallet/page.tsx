"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DollarSign, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const { data: wallet, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">Failed to load wallet data. Please try again.</div>;
  }

  const balance = wallet?.balance?.toFixed(2) || "0.00";
  const transactions = wallet?.transactions || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

      {/* Balance Card */}
      <Card className="mb-8 bg-black text-white dark:bg-zinc-900 border-none shadow-xl">
         <CardContent className="p-8">
            <div className="text-zinc-400 text-sm font-medium mb-1">Current Balance</div>
            <div className="text-5xl font-bold flex items-center">
               <span className="text-zinc-500 mr-2 text-3xl">$</span>
               {balance}
            </div>
            <div className="mt-6 flex gap-3">
               <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-zinc-200 transition-colors">
                  Cash Out
               </button>
            </div>
         </CardContent>
      </Card>

      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <Card>
         <CardContent className="p-0">
            {transactions.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">
                  No transactions yet. Start a survey to earn!
               </div>
            ) : (
               <div className="divide-y">
                  {transactions.map((tx: any) => (
                     <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-full ${tx.amount_dollars > 0 ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-600"}`}>
                              {tx.amount_dollars > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                           </div>
                           <div>
                              <div className="font-medium text-sm">{tx.description || "Transaction"}</div>
                              <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                 <Clock className="w-3 h-3 mr-1" />
                                 {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                              </div>
                           </div>
                        </div>
                        <div className={`font-semibold ${tx.amount_dollars > 0 ? "text-green-600" : ""}`}>
                           {tx.amount_dollars > 0 ? "+" : ""}{tx.amount_dollars.toFixed(2)}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </CardContent>
      </Card>
      <div className="mt-8 text-center text-xs text-muted-foreground">
         <p>Payments are processed securely via our partners.</p>
      </div>
    </div>
  );
}
