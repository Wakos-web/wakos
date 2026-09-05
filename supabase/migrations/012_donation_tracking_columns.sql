-- Giving: donation tracking columns
-- Migration 012: the thank-you form on /giving records how a gift was sent so
-- the donation box can be reconciled. Add payment method + transaction
-- reference/message columns (name/email are optional on the form).

ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS transaction_ref TEXT;