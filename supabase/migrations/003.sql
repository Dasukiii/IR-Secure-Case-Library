/*
  # User Data Isolation Security Enhancements

  1. Summary
    - Strengthens Row Level Security (RLS) policies across all tables
    - Adds missing policies for complete CRUD coverage
    - Implements storage bucket RLS for evidence files
    - Ensures users can only access their own data

  2. Changes
    - profiles: Add INSERT policy
    - next_steps: Replace FOR ALL with separate CRUD policies
    - outcomes: Add WITH CHECK to UPDATE, add DELETE policy
    - timeline_events: Add UPDATE and DELETE policies
    - storage.objects: Add RLS for evidence bucket

  3. Security Notes
    - All policies verify ownership via auth.uid()
    - Related tables check parent case ownership
*/

-- ============================================
-- PROFILES TABLE - Add INSERT policy
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
            ON public.profiles FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- ============================================
-- NEXT STEPS TABLE - Replace FOR ALL policy
-- ============================================
DROP POLICY IF EXISTS "Users can manage next steps for their cases" ON public.next_steps;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'next_steps'
        AND policyname = 'Users can insert next steps for their cases'
    ) THEN
        CREATE POLICY "Users can insert next steps for their cases"
            ON public.next_steps FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = next_steps.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'next_steps'
        AND policyname = 'Users can update next steps for their cases'
    ) THEN
        CREATE POLICY "Users can update next steps for their cases"
            ON public.next_steps FOR UPDATE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = next_steps.case_id
                    AND cases.created_by = auth.uid()
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = next_steps.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'next_steps'
        AND policyname = 'Users can delete next steps for their cases'
    ) THEN
        CREATE POLICY "Users can delete next steps for their cases"
            ON public.next_steps FOR DELETE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = next_steps.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================
-- OUTCOMES TABLE - Fix UPDATE and add DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can update outcomes for their cases" ON public.outcomes;

CREATE POLICY "Users can update outcomes for their cases"
    ON public.outcomes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = outcomes.case_id
            AND cases.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = outcomes.case_id
            AND cases.created_by = auth.uid()
        )
    );

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'outcomes'
        AND policyname = 'Users can delete outcomes for their cases'
    ) THEN
        CREATE POLICY "Users can delete outcomes for their cases"
            ON public.outcomes FOR DELETE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = outcomes.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================
-- TIMELINE EVENTS - Add UPDATE and DELETE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'timeline_events'
        AND policyname = 'Users can update timeline events for their cases'
    ) THEN
        CREATE POLICY "Users can update timeline events for their cases"
            ON public.timeline_events FOR UPDATE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = timeline_events.case_id
                    AND cases.created_by = auth.uid()
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = timeline_events.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'timeline_events'
        AND policyname = 'Users can delete timeline events for their cases'
    ) THEN
        CREATE POLICY "Users can delete timeline events for their cases"
            ON public.timeline_events FOR DELETE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id = timeline_events.case_id
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================
-- STORAGE BUCKET POLICIES FOR EVIDENCE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can view evidence from their cases'
    ) THEN
        CREATE POLICY "Users can view evidence from their cases"
            ON storage.objects FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'evidence'
                AND EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id::text = (storage.foldername(name))[1]
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can upload evidence to their cases'
    ) THEN
        CREATE POLICY "Users can upload evidence to their cases"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id = 'evidence'
                AND EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id::text = (storage.foldername(name))[1]
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can update evidence in their cases'
    ) THEN
        CREATE POLICY "Users can update evidence in their cases"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (
                bucket_id = 'evidence'
                AND EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id::text = (storage.foldername(name))[1]
                    AND cases.created_by = auth.uid()
                )
            )
            WITH CHECK (
                bucket_id = 'evidence'
                AND EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id::text = (storage.foldername(name))[1]
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can delete evidence from their cases'
    ) THEN
        CREATE POLICY "Users can delete evidence from their cases"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (
                bucket_id = 'evidence'
                AND EXISTS (
                    SELECT 1 FROM public.cases
                    WHERE cases.id::text = (storage.foldername(name))[1]
                    AND cases.created_by = auth.uid()
                )
            );
    END IF;
END $$;
