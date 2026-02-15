-- Performance Groups Schema for Elite tier
-- Private study groups with performance comparison (no raw grades shared)

-- Performance groups table
CREATE TABLE IF NOT EXISTS public.performance_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.performance_groups
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS invite_code TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.performance_groups ENABLE ROW LEVEL SECURITY;

-- Anyone can view groups they're a member of (checked via group_members)
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.performance_groups;
CREATE POLICY "Users can view groups they belong to"
  TO authenticated
  ON public.performance_groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Users can create new groups
DROP POLICY IF EXISTS "Users can create groups" ON public.performance_groups;
CREATE POLICY "Users can create groups"
  TO authenticated
  ON public.performance_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only group creator can update group details
DROP POLICY IF EXISTS "Group creators can update groups" ON public.performance_groups;
CREATE POLICY "Group creators can update groups"
  TO authenticated
  ON public.performance_groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Only group creator can delete groups
DROP POLICY IF EXISTS "Group creators can delete groups" ON public.performance_groups;
CREATE POLICY "Group creators can delete groups"
  TO authenticated
  ON public.performance_groups FOR DELETE
  USING (auth.uid() = created_by);

-- Group members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.performance_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE IF EXISTS public.group_members
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of groups they belong to
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members"
  TO authenticated
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Users can join groups (insert their own membership)
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups"
  TO authenticated
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave groups (delete their own membership)
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups"
  TO authenticated
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly performance snapshots (for trend tracking and comparison)
CREATE TABLE IF NOT EXISTS public.weekly_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.performance_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  performance_index INTEGER NOT NULL CHECK (performance_index >= 0 AND performance_index <= 100),
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id, week_start)
);

ALTER TABLE IF EXISTS public.weekly_snapshots
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS week_start DATE,
  ADD COLUMN IF NOT EXISTS performance_index INTEGER,
  ADD COLUMN IF NOT EXISTS percentile INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.weekly_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can view snapshots for groups they belong to
DROP POLICY IF EXISTS "Users can view group snapshots" ON public.weekly_snapshots;
CREATE POLICY "Users can view group snapshots"
  TO authenticated
  ON public.weekly_snapshots FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own snapshots
DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.weekly_snapshots;
CREATE POLICY "Users can insert own snapshots"
  TO authenticated
  ON public.weekly_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own snapshots (for same week updates)
DROP POLICY IF EXISTS "Users can update own snapshots" ON public.weekly_snapshots;
CREATE POLICY "Users can update own snapshots"
  TO authenticated
  ON public.weekly_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_groups_invite_code
  ON public.performance_groups(invite_code);

CREATE INDEX IF NOT EXISTS idx_performance_groups_created_by
  ON public.performance_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id
  ON public.group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id
  ON public.group_members(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_unique
  ON public.group_members(group_id, user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_snapshots_group_id
  ON public.weekly_snapshots(group_id);

CREATE INDEX IF NOT EXISTS idx_weekly_snapshots_user_id
  ON public.weekly_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_snapshots_week_start
  ON public.weekly_snapshots(week_start DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_snapshots_unique
  ON public.weekly_snapshots(group_id, user_id, week_start);

-- Trigger for performance_groups updated_at
DROP TRIGGER IF EXISTS update_performance_groups_updated_at ON public.performance_groups;
CREATE TRIGGER update_performance_groups_updated_at
  BEFORE UPDATE ON public.performance_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars (0,O,1,I)
  code TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 8-character code
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;

-- Function to join group by invite code
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find group by invite code
  SELECT id INTO v_group_id
  FROM public.performance_groups
  WHERE invite_code = p_invite_code;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Add user to group (ON CONFLICT DO NOTHING handles duplicate joins)
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, v_user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;

-- Function to record weekly snapshot (upsert)
CREATE OR REPLACE FUNCTION public.record_weekly_snapshot(
  p_group_id UUID,
  p_week_start DATE,
  p_performance_index INTEGER,
  p_percentile INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_snapshot_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user is member of group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  -- Upsert snapshot
  INSERT INTO public.weekly_snapshots (
    group_id,
    user_id,
    week_start,
    performance_index,
    percentile
  ) VALUES (
    p_group_id,
    v_user_id,
    p_week_start,
    p_performance_index,
    p_percentile
  )
  ON CONFLICT (group_id, user_id, week_start) DO UPDATE SET
    performance_index = EXCLUDED.performance_index,
    percentile = EXCLUDED.percentile
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.record_weekly_snapshot(UUID, DATE, INTEGER, INTEGER) TO authenticated;
