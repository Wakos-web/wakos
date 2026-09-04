const clubs = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', overview: 'We connect students with Uganda biodiversity. Every walk, every survey, every campaign is a lesson no textbook can teach. This is where future conservationists are made.', members: 45, events: 8, years: 15, alumni: 200 },
  { slug: 'arts-culture', name: 'Arts & Culture Club', tagline: 'Express. Create. Celebrate.', overview: 'We are the creative heartbeat of WACOS. Traditional dance, music, drama, visual arts, and cultural heritage live here. If you feel it, we help you express it.', members: 38, events: 12, years: 20, alumni: 350 },
  { slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.', overview: 'Leadership, service, and resilience through structured outdoor programmes. We prepare students not just for exams, but for life.', members: 60, events: 10, years: 25, alumni: 500 },
  { slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.', overview: 'Running the school nursery and farm, we are central to the WACOS identity. Students grow seedlings from seed, manage crops, and feed the community.', members: 50, events: 6, years: 30, alumni: 600 },
  { slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.', overview: 'Critical thinking and public speaking sharpened through research, argument construction, and competition. We produce lawyers, politicians, and leaders.', members: 35, events: 14, years: 18, alumni: 300 },
  { slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.', overview: 'A love of language nurtured through poetry, short stories, essays, and journalism. We publish. We perform. We find our voice.', members: 30, events: 8, years: 12, alumni: 180 },
  { slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.', overview: 'Humanitarian service taught through first aid, disaster preparedness, and health education. We save lives before we leave school.', members: 55, events: 10, years: 22, alumni: 450 },
  { slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.', overview: 'Where talent meets stage. Talent shows, music, comedy, cultural events. We plan it. We perform it. We own it.', members: 42, events: 15, years: 10, alumni: 250 },
  { slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.', overview: 'Practical life skills that matter. Cooking, nutrition, textiles, household management. We learn what keeps families healthy.', members: 28, events: 8, years: 14, alumni: 220 },
  { slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.', overview: 'National and global events discussed, debated, and understood. Politics, economics, science, social issues. We produce informed citizens.', members: 32, events: 10, years: 8, alumni: 150 },
];

const members = {
  wildlife: {
    patron: { name: 'Mr. Moses Okello', role: 'Patron', year: 'Teacher', joined: '2018' },
    executives: [
      { name: 'Nadia M.', role: 'Chairperson', year: 'S4', joined: '2023' },
      { name: 'David K.', role: 'Vice Chair', year: 'S4', joined: '2023' },
      { name: 'Sarah N.', role: 'Secretary', year: 'S3', joined: '2024' },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  'arts-culture': {
    patron: { name: 'Ms. Florence Auma', role: 'Patron', year: 'Teacher', joined: '2016' },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Nadia M.', role: 'Drama Captain', year: 'S4', joined: '2023' },
      { name: 'David O.', role: 'Music Director', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  'scouts-guides': {
    patron: { name: 'Mr. Peter Wasswa', role: 'Patron', year: 'Teacher', joined: '2015' },
    executives: [
      { name: 'Joseph W.', role: 'Scout Leader', year: 'S5', joined: '2022' },
      { name: 'Brenda N.', role: 'Guide Captain', year: 'S5', joined: '2022' },
      { name: 'Ali M.', role: 'Secretary', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Patrick I.', year: 'S3', joined: '2024' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  agriculture: {
    patron: { name: 'Mr. James Okello', role: 'Patron', year: 'Teacher', joined: '2017' },
    executives: [
      { name: 'Patrick I.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Sarah K.', role: 'Secretary', year: 'S4', joined: '2023' },
      { name: 'Moses W.', role: 'Farm Manager', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
  },
  debate: {
    patron: { name: 'Mr. Samuel Balikowa', role: 'Patron', year: 'Teacher', joined: '2019' },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Nadia M.', role: 'Vice Chair', year: 'S4', joined: '2023' },
      { name: 'Sarah N.', role: 'Secretary', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'David K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  writers: {
    patron: { name: 'Ms. Janet Nakato', role: 'Patron', year: 'Teacher', joined: '2020' },
    executives: [
      { name: 'Sarah N.', role: 'Editor-in-Chief', year: 'S4', joined: '2023' },
      { name: 'David O.', role: 'Chairperson', year: 'S4', joined: '2023' },
      { name: 'Grace N.', role: 'Secretary', year: 'S3', joined: '2024' },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Ali M.', year: 'S2', joined: '2025' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  'red-cross': {
    patron: { name: 'Sr. Grace Nakamya', role: 'Patron', year: 'Nurse', joined: '2017' },
    executives: [
      { name: 'Brenda N.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Ali M.', role: 'Vice Chair', year: 'S4', joined: '2023' },
      { name: 'Grace N.', role: 'Secretary', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  entertainment: {
    patron: { name: 'Mr. David Ssemwanga', role: 'Patron', year: 'Teacher', joined: '2021' },
    executives: [
      { name: 'David O.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Nadia M.', role: 'Events Coordinator', year: 'S4', joined: '2023' },
      { name: 'Brian K.', role: 'MC Lead', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
  'home-science': {
    patron: { name: 'Ms. Harriet Nabirye', role: 'Patron', year: 'Teacher', joined: '2019' },
    executives: [
      { name: 'Sarah K.', role: 'Chairperson', year: 'S4', joined: '2023' },
      { name: 'Brenda N.', role: 'Secretary', year: 'S4', joined: '2023' },
      { name: 'Grace N.', role: 'Treasurer', year: 'S3', joined: '2024' },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
  },
  'current-affairs': {
    patron: { name: 'Mr. Francis Mugalu', role: 'Patron', year: 'Teacher', joined: '2020' },
    executives: [
      { name: 'Ali M.', role: 'Chairperson', year: 'S5', joined: '2022' },
      { name: 'Nadia M.', role: 'Research Lead', year: 'S4', joined: '2023' },
      { name: 'Joseph W.', role: 'Secretary', year: 'S4', joined: '2023' },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Grace N.', year: 'S4', joined: '2022' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
  },
};

function escape(s) { return s.replace(/'/g, "''"); }

async function seed() {
  const API = 'https://api.supabase.com/v1/projects/cykaheepeqcgmveckuru/database/query';
  const AUTH = { 'Authorization': 'Bearer YOUR_SUPABASE_ACCESS_TOKEN', 'Content-Type': 'application/json' };

  // Get club IDs
  const res = await fetch(API, { method: 'POST', headers: AUTH, body: JSON.stringify({ query: 'SELECT id, slug FROM clubs' }) });
  const clubRows = await res.json();
  const clubMap = {};
  clubRows.forEach(r => clubMap[r.slug] = r.id);

  // Seed members for each club
  let total = 0;
  for (const slug of Object.keys(members)) {
    const clubId = clubMap[slug];
    if (!clubId) { console.log('SKIP:', slug); continue; }
    const data = members[slug];
    const all = [data.patron, ...data.executives, ...data.members.map(m => ({ ...m, role: 'Member' }))];
    const values = all.map((p, i) => `('${clubId}', '${escape(p.name)}', '${escape(p.role)}', '${escape(p.year || '')}', '${escape(p.joined || '')}', ${i})`).join(', ');
    const sql = `INSERT INTO club_members (club_id, name, role, year, joined, sort_order) VALUES ${values};`;
    const r = await fetch(API, { method: 'POST', headers: AUTH, body: JSON.stringify({ query: sql }) });
    const d = await r.json();
    if (d.error) console.log('ERROR', slug, d.error.message);
    else { total += all.length; console.log('OK:', slug, all.length, 'members'); }
  }
  console.log('Total members seeded:', total);
}

seed();
