const posts = {
  wildlife: [
    { title: 'Nature walk reveals rare butterfly species on campus', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority.', author: 'Club Chairperson', date: '2026-09-01' },
    { title: 'Tree planting drive targets 500 seedlings along Jinja road', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary.', author: 'Patron', date: '2026-08-20' },
    { title: 'Guest lecture from UWA ranger on elephant corridor conservation', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected.', author: 'Secretary', date: '2026-08-05' },
  ],
  'arts-culture': [
    { title: 'Busoga cultural night draws record attendance', excerpt: 'Over 300 students and parents attended our annual cultural night with traditional Busoga dance and Lusoga poetry.', author: 'Club Chairperson', date: '2026-09-03' },
    { title: 'Drama team wins best ensemble at Jinja regional festival', excerpt: 'Our five-member drama team took the best ensemble award at the Busoga region arts festival.', author: 'Drama Captain', date: '2026-08-18' },
    { title: 'Visual arts exhibition opens in the school library', excerpt: 'Twelve students displayed paintings, charcoal drawings, and mixed-media pieces exploring identity and community.', author: 'Arts Prefect', date: '2026-08-01' },
  ],
  'scouts-guides': [
    { title: 'Annual camping expedition heads to Source of the Nile', excerpt: 'Forty scouts and guides set off for a three-day expedition at the Source of the Nile.', author: 'Scout Master', date: '2026-09-05' },
    { title: 'First aid certification training completes for 60 students', excerpt: 'In partnership with the Red Cross, 60 scouts and guides completed a two-day first aid certification course.', author: 'Patron', date: '2026-08-22' },
    { title: 'Guides lead community clean-up in Wairaka trading centre', excerpt: 'Twenty-five Girl Guides spent Saturday morning clearing drainage and collecting litter.', author: 'Guide Captain', date: '2026-08-08' },
  ],
  agriculture: [
    { title: 'School nursery distributes 2,000 seedlings to Wairaka families', excerpt: 'The Agriculture Club distributed 2,000 fruit and timber seedlings grown in the school nursery.', author: 'Club Chairperson', date: '2026-09-02' },
    { title: 'Students harvest first crop from drip irrigation demo plot', excerpt: 'The club drip irrigation demo plot produced its first harvest of tomatoes and sukuma wiki.', author: 'Patron', date: '2026-08-15' },
    { title: 'Agriculture students attend Jinja district farming expo', excerpt: 'Fifteen club members attended the annual Jinja District Agricultural Expo.', author: 'Secretary', date: '2026-08-03' },
  ],
  debate: [
    { title: 'WACOS debate team reaches national championships', excerpt: 'After sweeping the Busoga regional qualifiers, our debate team qualified for the UNEB National Schools Debate Championships.', author: 'Debate Coach', date: '2026-09-04' },
    { title: 'Public speaking workshop builds confidence in Form 3 students', excerpt: 'Twenty Form 3 students completed a four-week public speaking workshop.', author: 'Club Chairperson', date: '2026-08-19' },
    { title: 'Model UN simulation tackles African Union trade policy', excerpt: 'Students represented 12 African nations in a Model AU simulation focused on the African Continental Free Trade Area.', author: 'Secretary', date: '2026-08-06' },
  ],
  writers: [
    { title: 'New school magazine "The Wairaka Voice" launches', excerpt: 'The inaugural edition features 24 pages of student writing including poetry, short fiction, and photo essays.', author: 'Editor-in-Chief', date: '2026-09-01' },
    { title: 'Poetry slam night sees 18 students perform original work', excerpt: 'The open mic poetry slam drew 18 performers and an audience of over 100.', author: 'Club Chairperson', date: '2026-08-21' },
    { title: 'Writers Club partners with Jinja Public Library for book drive', excerpt: 'Club members collected and donated 350 books to the Jinja Public Library.', author: 'Secretary', date: '2026-08-07' },
  ],
  'red-cross': [
    { title: 'Annual blood drive collects 120 units for Jinja Regional Hospital', excerpt: 'Our annual blood donation drive collected 120 units in partnership with the Uganda Blood Transfusion Service.', author: 'Club Chairperson', date: '2026-09-03' },
    { title: 'First aid training equips 80 students with life-saving skills', excerpt: 'Red Cross trainers led a two-day first aid course for 80 students.', author: 'Patron', date: '2026-08-18' },
    { title: 'Health education week reaches 1,500 primary school pupils', excerpt: 'Club members visited five primary schools in Wairaka sub-county to teach hygiene and health education.', author: 'Secretary', date: '2026-08-04' },
  ],
  entertainment: [
    { title: 'Sold-out talent show raises funds for school library', excerpt: 'The annual talent show drew a full house with 22 acts and raised UGX 3.2 million.', author: 'Club Chairperson', date: '2026-09-02' },
    { title: 'Music team records first student album at Wairaka Studios', excerpt: 'Eight musicians recorded a 10-track album featuring original compositions.', author: 'Music Director', date: '2026-08-16' },
    { title: 'Comedy night draws laughs and lessons on school values', excerpt: 'The comedy night featured clean humour about school life and growing up in Uganda.', author: 'Secretary', date: '2026-08-02' },
  ],
  'home-science': [
    { title: 'Students cook up a storm at inter-school culinary challenge', excerpt: 'Four WACOS students competed against 12 schools and won second place overall.', author: 'Club Chairperson', date: '2026-09-04' },
    { title: 'Nutrition workshop teaches meal planning on a budget', excerpt: 'Guest nutritionist Sarah Namukasa led a workshop on planning nutritious meals.', author: 'Patron', date: '2026-08-20' },
    { title: 'Fashion and textile students showcase upcycled designs', excerpt: 'Fifteen students displayed garments made from recycled fabrics.', author: 'Secretary', date: '2026-08-08' },
  ],
  'current-affairs': [
    { title: 'Mock parliament debates national budget priorities', excerpt: 'Students role-played as MPs debating Uganda national budget allocation.', author: 'Club Chairperson', date: '2026-09-05' },
    { title: 'Weekly news quiz sees Form 2 team take the lead', excerpt: 'The current affairs quiz covered East African Community trade and climate policy.', author: 'Quiz Master', date: '2026-08-23' },
    { title: 'Guest speaker from Parliament shares path to public service', excerpt: 'MP James Kalenzi spoke to 200 students about civic engagement and youth in democracy.', author: 'Secretary', date: '2026-08-09' },
  ],
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

  let total = 0;
  for (const [slug, clubPosts] of Object.entries(posts)) {
    const clubId = clubMap[slug];
    if (!clubId) { console.log('SKIP:', slug); continue; }

    for (const post of clubPosts) {
      const sql = `INSERT INTO club_posts (club_id, title, excerpt, author, published, created_at) VALUES ('${clubId}', '${escape(post.title)}', '${escape(post.excerpt)}', '${escape(post.author)}', true, '${post.date}T12:00:00Z');`;
      const r = await fetch(API, { method: 'POST', headers: AUTH, body: JSON.stringify({ query: sql }) });
      const d = await r.json();
      if (d.error) console.log('ERROR', slug, post.title.substring(0, 30), d.error.message);
      else total++;
    }
    console.log('OK:', slug, clubPosts.length, 'posts');
  }
  console.log('Total posts seeded:', total);
}

seed();
