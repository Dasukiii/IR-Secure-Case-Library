-- Migration Script for Case Detail Enhancements
-- Run this to update existing database schema
-- Created: 2026-01-13

-- ============================================
-- ADD AI CONTENT COLUMNS TO CASES TABLE
-- ============================================
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS ai_summary_generated_at TIMESTAMPTZ;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS ai_risk_analysis TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS ai_risk_analysis_generated_at TIMESTAMPTZ;

-- ============================================
-- ADD SOURCE AND COMPLETED_AT TO NEXT_STEPS
-- ============================================
ALTER TABLE public.next_steps ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.next_steps ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Add check constraint for source column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'next_steps_source_check'
    ) THEN
        ALTER TABLE public.next_steps 
        ADD CONSTRAINT next_steps_source_check 
        CHECK (source IN ('manual', 'ai'));
    END IF;
END $$;

-- ============================================
-- CREATE SUPABASE STORAGE BUCKET FOR EVIDENCE
-- ============================================
-- Note: Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket Name: evidence
-- Public: Yes (or configure as needed)

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================
-- 1. Added ai_summary and ai_risk_analysis columns to cache AI-generated content
-- 2. Added source column to next_steps to track AI vs manual steps
-- 3. Added completed_at column to track when steps were completed
