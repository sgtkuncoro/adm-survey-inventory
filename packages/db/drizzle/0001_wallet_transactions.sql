-- Migration: 0001 - Wallet Transactions
-- Adds wallet transaction tracking

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES survey_sessions(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'credit', 'debit', 'payout'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
