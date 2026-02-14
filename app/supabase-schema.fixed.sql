-- LevelUp Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'nl' CHECK (preferred_language IN ('nl', 'en'))
);

-- Ensure users table has expected columns (idempotent)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'nl';

ALTER TABLE IF EXISTS public.users
  ALTER COLUMN email DROP NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data"
  TO authenticated
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data"
  TO authenticated
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  TO authenticated
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- User state table (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.user_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Ensure user_state table has expected columns (idempotent)
ALTER TABLE IF EXISTS public.user_state
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS state JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

-- Users can only access their own state
DROP POLICY IF EXISTS "Users can view own state" ON public.user_state;
CREATE POLICY "Users can view own state"
  TO authenticated
  ON public.user_state FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own state" ON public.user_state;
CREATE POLICY "Users can insert own state"
  TO authenticated
  ON public.user_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own state" ON public.user_state;
CREATE POLICY "Users can update own state"
  TO authenticated
  ON public.user_state FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own state" ON public.user_state;
CREATE POLICY "Users can delete own state"
  TO authenticated
  ON public.user_state FOR DELETE
  USING (auth.uid() = user_id);

-- Events table (analytics foundation)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure events table has expected columns (idempotent)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can only insert and view their own events
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
CREATE POLICY "Users can insert own events"
  TO authenticated
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own events" ON public.events;
CREATE POLICY "Users can view own events"
  TO authenticated
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

-- Integrations registry
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.integrations
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'disconnected',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own integrations" ON public.integrations;
CREATE POLICY "Users can view own integrations"
  TO authenticated
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integrations" ON public.integrations;
CREATE POLICY "Users can insert own integrations"
  TO authenticated
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own integrations" ON public.integrations;
CREATE POLICY "Users can update own integrations"
  TO authenticated
  ON public.integrations FOR UPDATE
  USING (auth.uid() = user_id);

-- Calendar sources
CREATE TABLE IF NOT EXISTS public.calendar_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  ics_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.calendar_sources
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS ics_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.calendar_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar sources" ON public.calendar_sources;
CREATE POLICY "Users can view own calendar sources"
  TO authenticated
  ON public.calendar_sources FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calendar sources" ON public.calendar_sources;
CREATE POLICY "Users can insert own calendar sources"
  TO authenticated
  ON public.calendar_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own calendar sources" ON public.calendar_sources;
CREATE POLICY "Users can delete own calendar sources"
  TO authenticated
  ON public.calendar_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Assessments (CSV import)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course TEXT NOT NULL,
  item TEXT NOT NULL,
  score NUMERIC,
  weight NUMERIC,
  assessed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  block_id TEXT,
  source TEXT NOT NULL DEFAULT 'pdf',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.assessments
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS item TEXT,
  ADD COLUMN IF NOT EXISTS score NUMERIC,
  ADD COLUMN IF NOT EXISTS weight NUMERIC,
  ADD COLUMN IF NOT EXISTS assessed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS block_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'assessments_status_check'
  ) THEN
    ALTER TABLE public.assessments
      ADD CONSTRAINT assessments_status_check
      CHECK (status IN ('passed', 'failed', 'pending'));
  END IF;
END $$;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments"
  TO authenticated
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
CREATE POLICY "Users can insert own assessments"
  TO authenticated
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessments;
CREATE POLICY "Users can update own assessments"
  TO authenticated
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- LMS deadlines
CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'on-track',
  source TEXT NOT NULL,
  course_id TEXT,
  course_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title, due_at)
);

ALTER TABLE IF EXISTS public.deadlines
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'on-track',
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS course_id TEXT,
  ADD COLUMN IF NOT EXISTS course_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own deadlines" ON public.deadlines;
CREATE POLICY "Users can view own deadlines"
  TO authenticated
  ON public.deadlines FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own deadlines" ON public.deadlines;
CREATE POLICY "Users can insert own deadlines"
  TO authenticated
  ON public.deadlines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own deadlines" ON public.deadlines;
CREATE POLICY "Users can update own deadlines"
  TO authenticated
  ON public.deadlines FOR UPDATE
  USING (auth.uid() = user_id);

-- Grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT,
  current_score NUMERIC,
  predicted_score NUMERIC,
  required_score NUMERIC,
  source TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE IF EXISTS public.grades
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS course_id TEXT,
  ADD COLUMN IF NOT EXISTS course_name TEXT,
  ADD COLUMN IF NOT EXISTS current_score NUMERIC,
  ADD COLUMN IF NOT EXISTS predicted_score NUMERIC,
  ADD COLUMN IF NOT EXISTS required_score NUMERIC,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
CREATE POLICY "Users can view own grades"
  TO authenticated
  ON public.grades FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own grades" ON public.grades;
CREATE POLICY "Users can insert own grades"
  TO authenticated
  ON public.grades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own grades" ON public.grades;
CREATE POLICY "Users can update own grades"
  TO authenticated
  ON public.grades FOR UPDATE
  USING (auth.uid() = user_id);

-- LTI launch context
CREATE TABLE IF NOT EXISTS public.lti_launches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  issuer TEXT NOT NULL,
  deployment_id TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.lti_launches
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS issuer TEXT,
  ADD COLUMN IF NOT EXISTS deployment_id TEXT,
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.lti_launches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lti launches" ON public.lti_launches;
CREATE POLICY "Users can view own lti launches"
  TO authenticated
  ON public.lti_launches FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lti launches" ON public.lti_launches;
CREATE POLICY "Users can insert own lti launches"
  TO authenticated
  ON public.lti_launches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lti_context_id TEXT,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS lti_context_id TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Drop legacy unique constraint on lti_context_id if present (per-user courses)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_lti_context_id_key'
  ) THEN
    ALTER TABLE public.courses DROP CONSTRAINT courses_lti_context_id_key;
  END IF;
END $$;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own courses" ON public.courses;
CREATE POLICY "Users can view own courses"
  TO authenticated
  ON public.courses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
CREATE POLICY "Users can insert own courses"
  TO authenticated
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
CREATE POLICY "Users can update own courses"
  TO authenticated
  ON public.courses FOR UPDATE
  USING (auth.uid() = user_id);

-- Push subscriptions (web push)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE IF EXISTS public.push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS p256dh TEXT,
  ADD COLUMN IF NOT EXISTS auth TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  TO authenticated
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  TO authenticated
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  TO authenticated
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_state_user_id
  ON public.user_state(user_id);

CREATE INDEX IF NOT EXISTS idx_user_state_created_at
  ON public.user_state(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at
  ON public.events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_type
  ON public.events(type);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id
  ON public.integrations(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_sources_user_id
  ON public.calendar_sources(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_sources_user_url
  ON public.calendar_sources(user_id, ics_url);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_id
  ON public.deadlines(user_id);

CREATE INDEX IF NOT EXISTS idx_grades_user_id
  ON public.grades(user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id
  ON public.assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_user_course
  ON public.assessments(user_id, course);

CREATE INDEX IF NOT EXISTS idx_assessments_user_block
  ON public.assessments(user_id, block_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assessments_user_block_item
  ON public.assessments(user_id, block_id, course, item);

CREATE INDEX IF NOT EXISTS idx_lti_launches_user_id
  ON public.lti_launches(user_id);

CREATE INDEX IF NOT EXISTS idx_courses_context_id
  ON public.courses(lti_context_id);

CREATE INDEX IF NOT EXISTS idx_courses_user_id
  ON public.courses(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_user_context
  ON public.courses(user_id, lti_context_id);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_course
  ON public.deadlines(user_id, course_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grades_user_course_unique
  ON public.grades(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions(user_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_state updated_at
DROP TRIGGER IF EXISTS update_user_state_updated_at ON public.user_state;
CREATE TRIGGER update_user_state_updated_at
  BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC Function to calculate user's percentile for this week
-- This calculates percentile based on momentum scores across all active users
CREATE OR REPLACE FUNCTION public.calculate_user_percentile(user_score INTEGER)
RETURNS INTEGER AS $$
DECLARE
  percentile INTEGER;
  scores_below INTEGER;
  total_scores INTEGER;
BEGIN
  -- Calculate how many users have scores below the user's score
  -- This is a simplified implementation for MVP
  -- In production, you'd want to maintain a weekly_scores materialized view

  WITH user_scores AS (
    SELECT
      user_id,
      -- Extract simple score from state JSONB
      -- This is a placeholder - adjust based on actual state structure
      COALESCE(
        (state->'xp'->>'totalXP')::INTEGER,
        0
      ) as score
    FROM public.user_state
    WHERE updated_at >= NOW() - INTERVAL '7 days'
  )
  SELECT
    COUNT(*) FILTER (WHERE score < user_score),
    COUNT(*)
  INTO scores_below, total_scores
  FROM user_scores;

  -- Avoid division by zero
  IF total_scores = 0 OR total_scores = 1 THEN
    RETURN NULL;
  END IF;

  -- Calculate percentile (0-100)
  percentile := ROUND((scores_below::DECIMAL / total_scores) * 100);

  RETURN percentile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_user_percentile(INTEGER) TO authenticated;
