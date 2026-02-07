-- Migration: Add address fields to users table
-- Date: 2026-02-08

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;
