-- Giving: link each Ways of Giving card to its own bank/mobile accounts.
--
-- giving_ways.slug            -> stable key per card (trust_fund, bursary, ...)
-- donation_accounts.way_slug  -> which way a bank account serves (NULL = general, shown on every card as fallback)
-- mobile_donations.way_slug   -> same for mobile money numbers

ALTER TABLE giving_ways ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE donation_accounts ADD COLUMN IF NOT EXISTS way_slug TEXT;
ALTER TABLE mobile_donations ADD COLUMN IF NOT EXISTS way_slug TEXT;

-- Canonical slugs for the six seeded ways (case-insensitive title match).
UPDATE giving_ways SET slug = 'trust_fund'
  WHERE lower(title) LIKE 'trust fund%' AND (slug IS NULL OR slug = '');
UPDATE giving_ways SET slug = 'bursary'
  WHERE lower(title) LIKE 'bursary%' AND (slug IS NULL OR slug = '');
UPDATE giving_ways SET slug = 'laboratory'
  WHERE lower(title) LIKE 'laboratory%' AND (slug IS NULL OR slug = '');
UPDATE giving_ways SET slug = 'infrastructure'
  WHERE lower(title) LIKE 'infrastructure%' AND (slug IS NULL OR slug = '');
UPDATE giving_ways SET slug = 'scholarship'
  WHERE lower(title) LIKE 'scholarship%' AND (slug IS NULL OR slug = '');
UPDATE giving_ways SET slug = 'in_kind'
  WHERE lower(title) LIKE 'in-kind%' AND (slug IS NULL OR slug = '');

-- Only one row per slug.
CREATE UNIQUE INDEX IF NOT EXISTS giving_ways_slug_key
  ON giving_ways (slug) WHERE slug IS NOT NULL;

-- The Trust Fund is the only way with its own bank account today (the seeded
-- Centenary "Development Fund" account). Every other card falls back to the
-- general accounts / mobile money numbers unless the admin links specific ones.
UPDATE donation_accounts SET way_slug = 'trust_fund'
  WHERE lower(account_name) LIKE '%development fund%' AND (way_slug IS NULL OR way_slug = '');

-- Mobile money numbers stay general (NULL) so every card shows them until the
-- admin attaches a dedicated number to a specific way.
