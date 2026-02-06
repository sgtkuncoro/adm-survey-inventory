-- Migration: Add unique constraints for sync idempotency
ALTER TABLE public.quota_qualifications 
ADD CONSTRAINT quota_qualifications_quota_id_question_id_key 
UNIQUE (quota_id, question_id);

-- Optional: Ensure qualification_legend also has uniqueness (it has slug/question_id usually)
-- init_schema.sql: UNIQUE(provider_id, question_id) was already there for qualification_legend?
-- Wait, let me check init_schema again.
