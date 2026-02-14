-- Block Progress migration (assessments status + block_id)

ALTER TABLE IF EXISTS public.assessments
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS block_id TEXT;

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

CREATE INDEX IF NOT EXISTS idx_assessments_user_block
  ON public.assessments(user_id, block_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assessments_user_block_item
  ON public.assessments(user_id, block_id, course, item);

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
