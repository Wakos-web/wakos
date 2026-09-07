-- 027: business contact fields on alumni_businesses.
-- `email` (business contact, never shown as text — only behind the envelope
-- button) already exists. Add `whatsapp` for the WhatsApp chat button; the
-- raw value the owner typed is stored, and the UI normalises it into a
-- wa.me link when the button is tapped.
ALTER TABLE public.alumni_businesses
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;
