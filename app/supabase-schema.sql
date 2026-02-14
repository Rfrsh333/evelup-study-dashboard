-- LevelUp Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'nl' CHECK (preferred_language IN ('nl', 'en'))
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- User state table (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.user_state (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

-- Users can only access their own state
CREATE POLICY "Users can view own state"
  ON public.user_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state"
  ON public.user_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON public.user_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own state"
  ON public.user_state FOR DELETE
  USING (auth.uid() = user_id);

-- Events table (analytics foundation)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can only insert and view their own events
CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id_timestamp
  ON public.events(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_events_type
  ON public.events(event_type);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
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
