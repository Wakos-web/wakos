-- MWOSA: M.M. College Wairaka Old Students Association page backend
-- Migration 015

-- 1. Association stats (milestones strip: years, funds, projects)
CREATE TABLE IF NOT EXISTS mwosa_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quick links shown on the page (Pulse, directory, business, etc.)
CREATE TABLE IF NOT EXISTS mwosa_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'link',
  category TEXT NOT NULL DEFAULT 'quick',   -- 'quick' | 'channel'
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project / milestone updates (progress the association has made)
CREATE TABLE IF NOT EXISTS mwosa_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  update_date TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mwosa_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mwosa_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mwosa_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read mwosa_stats" ON mwosa_stats FOR SELECT USING (true);
CREATE POLICY "public read mwosa_links" ON mwosa_links FOR SELECT USING (true);
CREATE POLICY "public read mwosa_updates" ON mwosa_updates FOR SELECT USING (true);

-- Seed: stats (previous milestones + current contributions)
INSERT INTO mwosa_stats (value, label, sort_order) VALUES
('2020', 'Wairaka Trust Fund launched by the alumni executive', 1),
('UGX 10,000', 'minimum monthly contribution per old student', 2),
('3', 'major projects completed: Physics Lab, Chemistry Lab and student washrooms', 3),
('Oct', 'every year alumni return to encourage students and share experiences', 4);

-- Seed: quick links (Pulse, directory, business — explained on the page)
INSERT INTO mwosa_links (label, url, description, icon, category, sort_order) VALUES
('Alumni Pulse', '/alumni', 'A live chat and class-notes feed where WACOS alumni post updates, memories, reunions and achievements. The fastest way to hear what your classmates are doing today.', 'message', 'quick', 1),
('Alumni Directory', '/alumni/directory/register', 'The verified register of old boys and old girls. Register your profile so classmates can find you, and search by graduation year, profession or location.', 'users', 'quick', 2),
('Business Directory', '/alumni/directory/businesses', 'The Wairaka Business Directory markets alumni products, services and businesses to one another and the wider public. Support your own — buy from an old student.', 'building', 'quick', 3);

-- Seed: "Whats Up" channels by decade (discover OB and OG by graduation year)
INSERT INTO mwosa_links (label, url, description, icon, category, sort_order) VALUES
('Class of 2020s', '/alumni/directory?year=2020', 'The newest old boys and old girls — just out of WACOS and building their first careers.', 'sparkles', 'channel', 1),
('Class of 2010s', '/alumni/directory?year=2010', 'Professionals and young families — teachers, engineers, medics, entrepreneurs.', 'briefcase', 'channel', 2),
('Class of 2000s', '/alumni/directory?year=2000', 'Established careers and growing businesses across Uganda and beyond.', 'trending', 'channel', 3),
('Class of 1990s', '/alumni/directory?year=1990', 'Leaders in government, education, agriculture and industry.', 'landmark', 'channel', 4),
('Class of 1980s', '/alumni/directory?year=1980', 'The generation that kept Wairaka''s name alive through hard times.', 'award', 'channel', 5),
('Class of 1970s', '/alumni/directory?year=1970', 'The elders of the association — founders of MMCWOSA and the Trust Fund.', 'crown', 'channel', 6);

-- Seed: progress updates (from the knowledge base: Trust Fund + projects)
INSERT INTO mwosa_updates (title, body, update_date, sort_order) VALUES
('Wairaka Trust Fund established', 'The alumni executive founded the Wairaka Trust Fund after rehabilitation projects, including the college library, were put on hold for lack of funds before COVID-19. The agreed minimum contribution is UGX 10,000 per old student per month.', 'September 2020', 1),
('Physics Laboratory renovated', 'Through the Trust Fund, the alumni renovated the Physics Laboratory — a core requirement for science students at WACOS.', '', 2),
('Chemistry Laboratory renovated', 'The Chemistry Laboratory was renovated and equipped to support practical learning for both O-Level and A-Level students.', '', 3),
('Student washrooms renovated', 'The Trust Fund renovated the student washrooms, restoring dignity and cleanliness to daily boarding life.', '', 4);

-- 4. Page content sections (editable from Admin > Page Content)
INSERT INTO page_content (page, section, title, content, published) VALUES
('mwosa', 'hero', 'MWOSA Hero', '{"description": "We Do It Ourselves. The bond between WACOS old boys and old girls lasts long after graduation — and together we are rebuilding our school."}', true),
('mwosa', 'overview', 'Who We Are', '{"description": "M.M. College Wairaka Old Students Association (MMCWOSA) is the alumni body of our school. It is not merely a social association — it is actively involved in the school development. Through alumni activities, fundraising, the Wairaka Trust Fund, student encouragement, rehabilitation projects and networking, old students of every generation stay connected to the school and to each other."}', true)
ON CONFLICT (page, section) DO NOTHING;

-- Note: the school also identifies continuous rebuilding of the college as the
-- fund's purpose; admin can add more updates from the dashboard.