-- Elite tier system schema
-- Adds tier column to users table and subscription tracking

-- Add tier column to users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'elite'));

-- Create index for tier queries
CREATE INDEX IF NOT EXISTS idx_users_tier
  ON public.users(tier);

-- Subscriptions table (for Elite tier management)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'elite')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_provider TEXT, -- 'stripe', 'manual', etc.
  payment_provider_id TEXT, -- External subscription ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  TO authenticated
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (payment webhooks)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  TO service_role
  ON public.subscriptions FOR ALL
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON public.subscriptions(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_unique
  ON public.subscriptions(user_id);

-- Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync user tier from active subscription
CREATE OR REPLACE FUNCTION public.sync_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users.tier based on subscription status
  IF NEW.status = 'active' THEN
    UPDATE public.users
    SET tier = NEW.tier
    WHERE id = NEW.user_id;
  ELSE
    -- Revert to free tier if subscription is not active
    UPDATE public.users
    SET tier = 'free'
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync tier on subscription changes
DROP TRIGGER IF EXISTS sync_tier_on_subscription_change ON public.subscriptions;
CREATE TRIGGER sync_tier_on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_tier();

-- Function to check if subscription is valid
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_active BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_active;

  RETURN COALESCE(v_active, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_subscription_active(UUID) TO authenticated;

-- RPC function to get user's tier features
CREATE OR REPLACE FUNCTION public.get_tier_features(p_tier TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_tier TEXT;
  v_features JSONB;
BEGIN
  -- Use provided tier or look up user's tier
  IF p_tier IS NOT NULL THEN
    v_tier := p_tier;
  ELSE
    SELECT tier INTO v_tier
    FROM public.users
    WHERE id = auth.uid();

    IF v_tier IS NULL THEN
      v_tier := 'free';
    END IF;
  END IF;

  -- Return tier features as JSONB
  IF v_tier = 'elite' THEN
    v_features := jsonb_build_object(
      'historyDays', 90,
      'canJoinGroups', true,
      'hasDetailedBreakdown', true,
      'hasMonthlyReport', true
    );
  ELSE
    v_features := jsonb_build_object(
      'historyDays', 7,
      'canJoinGroups', false,
      'hasDetailedBreakdown', false,
      'hasMonthlyReport', false
    );
  END IF;

  RETURN v_features;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_tier_features(TEXT) TO authenticated;
