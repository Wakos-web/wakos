-- Giving backend: cards, stats, donation accounts, mobile money, contact person
-- Migration 007

-- 1. Ways of giving cards (the 6 cards on /giving)
CREATE TABLE IF NOT EXISTS giving_ways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Gift',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Impact stats (the numbers strip on /giving)
CREATE TABLE IF NOT EXISTS giving_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bank donation accounts (manual transfers)
CREATE TABLE IF NOT EXISTS donation_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  branch TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mobile money donation numbers (manual send)
CREATE TABLE IF NOT EXISTS mobile_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,          -- MTN / Airtel / others
  number TEXT NOT NULL,
  account_name TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Giving contact person (for other donations: in-kind, scholarships, etc.)
CREATE TABLE IF NOT EXISTS giving_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  title TEXT,
  phone TEXT,
  email TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: ways of giving (matches the current /giving cards)
INSERT INTO giving_ways (title, description, tag, sort_order) VALUES
('Trust Fund Contribution', 'UGX 10,000 per month, less than a mobile phone bill, funds laboratory renovation, dormitory repair, and student bursaries. Join the Trust Fund and see exactly where your money goes.', 'Monthly', 1),
('Bursary Support', 'Fund a bright student future. Bursaries are awarded competitively at the end of each term based on exam results. Last year, alumni-funded bursaries supported 211 students through fees and boarding.', 'Per Student', 2),
('Laboratory Renovation', 'Help equip and maintain the Physics, Chemistry, and Biology laboratories. The alumni have already renovated two labs through the Trust Fund.', 'Project', 3),
('Infrastructure Projects', 'Contribute to dormitory rehabilitation, classroom renovation, and the ongoing asbestos removal programme. Your name can be on a laboratory, a classroom, a future.', 'Capital', 4),
('Scholarships', 'Establish a scholarship in your name or class year. Fund a bright student education. Last year, 211 students received alumni-funded bursaries. Your scholarship could be the reason the next generation succeeds.', 'Named', 5),
('In-Kind Gifts', 'Donate books, equipment, furniture, or materials directly to the college. The Resource Centre and laboratories always need updated materials.', 'Goods', 6)
ON CONFLICT DO NOTHING;

-- Seed: impact stats
INSERT INTO giving_stats (value, label, sort_order) VALUES
('211', 'Students on bursary last year', 1),
('2', 'Labs renovated by Trust Fund', 2),
('4,000', 'Seedlings planted by students', 3),
('73', 'Years of continuous service', 4)
ON CONFLICT DO NOTHING;

-- Seed: bank account (placeholder to be updated by the school)
INSERT INTO donation_accounts (bank_name, account_name, account_number, currency, branch, note, sort_order) VALUES
('Centenary Bank', 'M.M College Wairaka Development Fund', 'XXXXXXXXXX', 'UGX', 'Jinja Main Branch', 'Use the school bank slip and reference your name and purpose.', 1)
ON CONFLICT DO NOTHING;

-- Seed: mobile money (placeholder)
INSERT INTO mobile_donations (provider, number, account_name, note, sort_order) VALUES
('MTN MoMo', '0700 000 000', 'M.M College Wairaka', 'Send and confirm with the contact person below.', 1),
('Airtel Money', '0700 000 000', 'M.M College Wairaka', 'Send and confirm with the contact person below.', 2)
ON CONFLICT DO NOTHING;

-- Seed: contact person (placeholder)
INSERT INTO giving_contact (person_name, title, phone, email, note) VALUES
('MMCWOSA Giving Coordinator', 'Alumni Giving & Trust Fund', '+256 332 277 476', 'info@mmcollegewairaka.sc.ug', 'For scholarships, in-kind gifts, and any other donations, contact us directly.')
ON CONFLICT DO NOTHING;

-- RLS: public can read everything (public info), only service role (admin proxy) writes
ALTER TABLE giving_ways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read giving_ways" ON giving_ways FOR SELECT USING (true);
CREATE POLICY "public read giving_stats" ON giving_stats FOR SELECT USING (true);
CREATE POLICY "public read donation_accounts" ON donation_accounts FOR SELECT USING (true);
CREATE POLICY "public read mobile_donations" ON mobile_donations FOR SELECT USING (true);
CREATE POLICY "public read giving_contact" ON giving_contact FOR SELECT USING (true);

-- The admin dashboard writes through the service-role proxy which bypasses RLS.
-- For safety, allow anon inserts (pledges/updates flow) only where needed later;
-- admin writes go through service role.