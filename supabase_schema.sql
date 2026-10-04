-- ======================================================================
-- DAKPOST PLI: SINGLE TABLE FOR BIRTHDAY NOTIFICATIONS
-- Stores only what the postal agent enters in the website form.
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.policyholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    policy_category TEXT NOT NULL DEFAULT 'PLI', -- 'PLI' or 'RPLI'
    policy_type TEXT NOT NULL,                  -- Scheme name (Santosh, Suraksha, etc.)
    date_of_birth DATE NOT NULL,                -- Used to trigger birthday wishes
    email TEXT NOT NULL,                        -- Customer email for birthday greeting
    policy_opening_date DATE,                   -- Commencement date
    phone TEXT,                                 -- Customer phone / WhatsApp
    last_birthday_wish_sent TIMESTAMPTZ,        -- Timestamp when greeting was sent
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fast Index for Birthday Queries (matches day and month)
CREATE INDEX IF NOT EXISTS idx_policyholders_dob ON public.policyholders (
    EXTRACT(MONTH FROM date_of_birth),
    EXTRACT(DAY FROM date_of_birth)
);

-- Enable Row Level Security (RLS) & Allow access
ALTER TABLE public.policyholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on policyholders" ON public.policyholders FOR ALL USING (true) WITH CHECK (true);
