-- IR Secure Case Library - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ER', 'IR')),
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Pending', 'Closed')),
  description TEXT,
  parties TEXT[] DEFAULT '{}',
  key_dates JSONB DEFAULT '{}',
  -- AI-generated content (cached)
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,
  ai_risk_analysis TEXT,
  ai_risk_analysis_generated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Cases policies (users can only see cases they created)
CREATE POLICY "Users can view their own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- TIMELINE_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'creation', 'update', 'evidence_uploaded', 'note_added', 
    'status_change', 'meeting', 'investigation', 'resolution'
  )),
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Timeline policies
CREATE POLICY "Users can view timeline for their cases"
  ON public.timeline_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = timeline_events.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add timeline events to their cases"
  ON public.timeline_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = timeline_events.case_id 
      AND cases.created_by = auth.uid()
    )
  );

-- ============================================
-- EVIDENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'document', 'image', 'video', 'audio', 'email', 'report', 'other'
  )),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- Evidence policies
CREATE POLICY "Users can view evidence for their cases"
  ON public.evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = evidence.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add evidence to their cases"
  ON public.evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = evidence.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete evidence from their cases"
  ON public.evidence FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = evidence.case_id 
      AND cases.created_by = auth.uid()
    )
  );

-- ============================================
-- OUTCOMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL UNIQUE,
  outcome_type TEXT,
  resolution_date DATE,
  settlement_notes TEXT,
  what_worked TEXT,
  what_to_improve TEXT,
  lesson_tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

-- Outcomes policies
CREATE POLICY "Users can view outcomes for their cases"
  ON public.outcomes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = outcomes.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create outcomes for their cases"
  ON public.outcomes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = outcomes.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update outcomes for their cases"
  ON public.outcomes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = outcomes.case_id 
      AND cases.created_by = auth.uid()
    )
  );

-- ============================================
-- NEXT STEPS / CHECKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.next_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.next_steps ENABLE ROW LEVEL SECURITY;

-- Next steps policies
CREATE POLICY "Users can view next steps for their cases"
  ON public.next_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = next_steps.case_id 
      AND cases.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage next steps for their cases"
  ON public.next_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = next_steps.case_id 
      AND cases.created_by = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON public.cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_type ON public.cases(type);
CREATE INDEX IF NOT EXISTS idx_cases_severity ON public.cases(severity);
CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON public.timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_case_id ON public.outcomes(case_id);
CREATE INDEX IF NOT EXISTS idx_next_steps_case_id ON public.next_steps(case_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_outcomes_updated_at
  BEFORE UPDATE ON public.outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
