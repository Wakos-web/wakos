-- Seed co-editor invite rows for the chairperson and secretary listed in each
-- club's leadership so the editor workflow is populated and ready to test.
--
-- Student members only carry initials in the club data, so invite emails use a
-- placeholder pattern (@wacos.ac.ug, matching the alumni seed). The same person
-- across clubs keeps a single email (the UNIQUE constraint is per club+email).
-- Rows are 'pending' and self-activate the first time the email signs in at
-- /clubs/editor with a one-time code. Replace placeholder emails with real
-- student emails whenever they are known.

INSERT INTO club_editors (club_id, name, role_title, email, status, notes)
SELECT c.id, v.name, v.role_title, v.email, 'pending',
       'Seeded from club leadership; replace placeholder email with the student''s real address.'
FROM clubs c
JOIN (VALUES
  ('wildlife',        'Nadia M.', 'Chairperson',  'nadia.m@wacos.ac.ug'),
  ('wildlife',        'Sarah N.', 'Secretary',    'sarah.n@wacos.ac.ug'),
  ('arts-culture',    'Brian K.', 'Chairperson',  'brian.k@wacos.ac.ug'),
  ('arts-culture',    'Nadia M.', 'Drama Captain','nadia.m@wacos.ac.ug'),
  ('scouts-guides',   'Joseph W.','Scout Leader', 'joseph.w@wacos.ac.ug'),
  ('scouts-guides',   'Ali M.',   'Secretary',    'ali.m@wacos.ac.ug'),
  ('agriculture',     'Patrick I.','Chairperson', 'patrick.i@wacos.ac.ug'),
  ('agriculture',     'Sarah K.', 'Secretary',    'sarah.k@wacos.ac.ug'),
  ('debate',          'Brian K.', 'Chairperson',  'brian.k@wacos.ac.ug'),
  ('debate',          'Sarah N.', 'Secretary',    'sarah.n@wacos.ac.ug'),
  ('writers',         'David O.', 'Chairperson',  'david.o@wacos.ac.ug'),
  ('writers',         'Grace N.', 'Secretary',    'grace.n@wacos.ac.ug'),
  ('red-cross',       'Brenda N.','Chairperson',  'brenda.n@wacos.ac.ug'),
  ('red-cross',       'Grace N.', 'Secretary',    'grace.n@wacos.ac.ug'),
  ('entertainment',   'David O.', 'Chairperson',  'david.o@wacos.ac.ug'),
  ('entertainment',   'Nadia M.', 'Events Coordinator', 'nadia.m@wacos.ac.ug'),
  ('home-science',    'Sarah K.', 'Chairperson',  'sarah.k@wacos.ac.ug'),
  ('home-science',    'Brenda N.','Secretary',    'brenda.n@wacos.ac.ug'),
  ('current-affairs', 'Ali M.',   'Chairperson',  'ali.m@wacos.ac.ug'),
  ('current-affairs', 'Joseph W.','Secretary',    'joseph.w@wacos.ac.ug')
) AS v(slug, name, role_title, email)
  ON c.slug = v.slug
ON CONFLICT (club_id, email) DO NOTHING;