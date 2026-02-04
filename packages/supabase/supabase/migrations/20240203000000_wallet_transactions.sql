-- Migration: Create Wallet Transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.survey_sessions(id) ON DELETE SET NULL,
    amount_dollars NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL, -- e.g., 'survey_payout', 'referral', 'withdrawal'
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);
