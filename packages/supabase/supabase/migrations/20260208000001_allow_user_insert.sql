-- Migration: Allow users to insert their own profile (enables self-healing for missing rows)
-- Date: 2026-02-08

-- Allow authenticated users to insert a row into public.users ONLY if the id matches their auth.uid()
CREATE POLICY "Users can insert their own profile" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);
