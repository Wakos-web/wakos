const SUPABASE_URL = 'https://cykaheepeqcgmveckuru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON';

const articles = [
  {
    slug: 'science-club-national-fair',
    title: 'Science Club Takes Second at the National Science Fair',
    date: 'Aug 24, 2026',
    category: 'STEM',
    image: '/assets/news-robotics.jpg',
    excerpt: 'A solar-powered irrigation prototype built in the WACOS workshop earned second place among ninety schools in Kampala.',
    body: [
      'The M.M College Wairaka Science Club returned from the National Schools Science Fair in Kampala with a second-place finish, placing ahead of eighty-eight other schools with a solar-powered drip irrigation controller designed for smallholder farms.',
      'The prototype was built entirely in the college workshop over two terms, using salvaged components and a microcontroller donated by an old student.',
      '"We kept failing at the pump timing until we stopped copying designs from the internet and measured our own soil," said club chairperson Brenda Nabirye, S6.',
      'The team now plans to trial three units on farms neighbouring the school before the next fair.'
    ]
  },
  {
    slug: 'asbestos-removal-complete',
    title: 'Asbestos Removal Programme Reaches Major Milestone',
    date: 'Aug 15, 2026',
    category: 'Infrastructure',
    image: '/assets/news-service.jpg',
    excerpt: 'The alumni-funded asbestos removal programme has cleared three major buildings, making campus safer for students and staff.',
    body: [
      'The Wairaka Trust Fund asbestos removal programme has reached a significant milestone, with three major campus buildings now completely cleared of hazardous materials.',
      'The programme, funded entirely by alumni contributions through the Trust Fund, began in 2024 after a safety audit identified asbestos in roofing materials across several older buildings.',
      '"This is what \'We Do It Ourselves\' looks like in practice," said Trust Fund Coordinator Moses Wamboga. "The alumni identified the problem, funded the solution, and hired certified contractors to do the work safely."',
      'Phase two targets the remaining four buildings, with completion expected by the end of 2026. The total project cost is estimated at UGX 45 million, with 60–70% already raised through monthly Trust Fund contributions.'
    ]
  },
  {
    slug: 'agriculture-club-reforestation',
    title: 'Agriculture Club Leads Community Reforestation Drive',
    date: 'Aug 09, 2026',
    category: 'Outreach',
    image: '/assets/news-service.jpg',
    excerpt: 'Students plant 4,000 seedlings along the Wairaka stretch, restoring tree cover lost to decades of deforestation.',
    body: [
      'More than four hundred students joined households around the college on Saturday to plant 4,000 tree seedlings raised in the school nursery, part of a five-year drive to restore tree cover along the Wairaka stretch.',
      'The nursery is run entirely by the Agriculture Club, which grows seedlings from seed collected by students during the holidays.',
      '"The motto is not decoration," said deputy head teacher Grace Kadondi. "We do it ourselves means the seedlings are ours, the labour is ours, and the shade will be the community\'s."',
      'A second planting is scheduled for the start of next term. The club aims to plant 10,000 seedlings annually, with species selected for rapid growth and soil stability.'
    ]
  },
  {
    slug: 'debate-team-regional-winners',
    title: 'Debate Team Wins Eastern Regional Championships',
    date: 'Jul 28, 2026',
    category: 'Academics',
    image: '/assets/academics.jpg',
    excerpt: 'The WACOS debate team defeated fifteen schools to claim the Eastern Regional debating title for the first time.',
    body: [
      'The M.M College Wairaka debate team made history by winning the Eastern Regional Schools Debate Championship, defeating fifteen schools including established powerhouses Jinja College and Busoga College Mwiri.',
      'The team of four S5 students argued passionately for the motion "This house believes technology does more harm than good in developing countries," ultimately winning on points of argumentation and rebuttal.',
      '"We trained three times a week for two months," said team captain Ahmed Muwonge. "Our coach, Mr. Okello, pushed us to research every angle of the argument."',
      'The victory earns WACOS a place at the National Schools Debate Championship in October, where they will compete against the best teams from across Uganda.'
    ]
  },
  {
    slug: 'red-cross-blood-drive',
    title: 'Red Cross Club Hosts Annual Blood Drive',
    date: 'Jul 15, 2026',
    category: 'Community',
    image: '/assets/news-service.jpg',
    excerpt: 'Students and staff donate over 200 units of blood in the club\'s biggest drive yet, supporting Jinja Regional Hospital.',
    body: [
      'The WACOS Red Cross Club hosted its annual blood donation drive last week, collecting over 200 units of blood from students, staff, and community members.',
      'The drive, organised in partnership with the Uganda Blood Transfusion Service, saw 180 students donate for the first time, with many describing the experience as "empowering."',
      '"When you donate blood, you\'re not just giving a unit, you\'re giving someone a chance at life," said club chairperson Patricia Auma. "That\'s what service means at WACOS."',
      'The collected blood will be distributed to Jinja Regional Hospital and surrounding health centres, addressing chronic shortages in the region.'
    ]
  },
  {
    slug: 'writers-club-magazine-launch',
    title: 'Writers Club Launches New School Magazine "The Wairaka Voice"',
    date: 'Jul 02, 2026',
    category: 'Arts',
    image: '/assets/student-life.jpg',
    excerpt: 'The inaugural issue of "The Wairaka Voice" features student poetry, fiction, and investigative journalism on campus issues.',
    body: [
      'The WACOS Writers Club has launched "The Wairaka Voice," a new school magazine featuring original poetry, short fiction, essays, and investigative journalism produced entirely by students.',
      'The 48-page inaugural issue includes a special feature on the school\'s 73-year history, interviews with alumni, and an investigative piece on water access in surrounding communities.',
      '"We wanted to create something that captures the real WACOS experience," said editor-in-chief Catherine Nabwire, S6. "Not just the achievements, but the daily life, the struggles, and the dreams of our students."',
      'The magazine will be published termly, with copies distributed to students, staff, and alumni. Digital versions will be available on the school website.'
    ]
  },
  {
    slug: 'old-students-reunion-2026',
    title: 'Old Students Reunion Brings Together Six Decades of WACOS Graduates',
    date: 'Jun 20, 2026',
    category: 'Alumni',
    image: '/assets/news-graduation.jpg',
    excerpt: 'Over 300 alumni from the 1960s to 2020s gathered at the school grounds for the annual reunion celebration.',
    body: [
      'More than 300 alumni spanning six decades returned to the Wairaka campus last weekend for the annual Old Students Reunion, celebrating the school\'s 73-year legacy.',
      'The event featured speeches from head teacher Samuel Balikowa, Trust Fund Coordinator Moses Wamboga, and guest of honour Joshua Cheptegei, who encouraged current students to embrace the school motto.',
      '"When I sat in those classrooms, I never imagined I would stand here as an Olympic champion," Cheptegei told the gathering. "But the discipline I learned at WACOS made everything possible."',
      'The reunion also saw the launch of the Trust Fund\'s new "Class of 2026" giving campaign, encouraging recent graduates to begin monthly contributions of UGX 10,000.'
    ]
  },
  {
    slug: 'netball-team-inter-school-victory',
    title: 'Netball Team Triumphs in Inter-School Tournament',
    date: 'Jun 10, 2026',
    category: 'Athletics',
    image: '/assets/news-basketball.jpg',
    excerpt: 'The WACOS netball team defeated five schools to win the Jinja District Inter-School Netball Tournament.',
    body: [
      'The M.M College Wairaka netball team claimed victory at the Jinja District Inter-School Netball Tournament, defeating five schools in a commanding display of skill and teamwork.',
      'Captain Grace Nambogo led from the front, scoring 12 goals in the final against Jinja College to secure a 35-28 victory.',
      '"We trained every morning at 6am before classes," said coach Sarah Nakamya. "The girls showed incredible dedication and sportsmanship throughout the tournament."',
      'The team will represent Jinja District at the Eastern Regional Netball Championships in September.'
    ]
  },
  {
    slug: 'laboratory-renovation-update',
    title: 'Physics and Chemistry Laboratories Fully Renovated',
    date: 'May 28, 2026',
    category: 'Infrastructure',
    image: '/assets/academics.jpg',
    excerpt: 'Alumni-funded renovations have transformed the science laboratories with new equipment and modern safety features.',
    body: [
      'The Physics and Chemistry laboratories at M.M College Wairaka have been fully renovated through the Trust Fund, bringing the facilities up to UNEB examination standards.',
      'The renovation included new workbenches, safety equipment, chemical storage cabinets, and modern analytical instruments. The total investment was UGX 35 million, funded entirely by alumni contributions.',
      '"When I was a student here, we did experiments with broken equipment and makeshift tools," said alumni donor Patrick Isabirye. "Now our children have proper facilities. That\'s progress."',
      'The Biology laboratory renovation is scheduled for next term, with the Trust Fund seeking an additional UGX 20 million to complete the project.'
    ]
  },
  {
    slug: 'entertainment-club-talent-show',
    title: 'Entertainment Club Hosts Sold-Out Talent Show "WACOS Has Talent"',
    date: 'May 15, 2026',
    category: 'Arts',
    image: '/assets/student-life.jpg',
    excerpt: 'Over 500 students and parents packed the school hall for an evening of music, dance, comedy, and drama performances.',
    body: [
      'The WACOS Entertainment Club hosted its inaugural "WACOS Has Talent" show last Friday, with over 500 students and parents filling the school hall for an evening of extraordinary performances.',
      'The show featured 18 acts ranging from traditional Busoga dance to contemporary music, stand-up comedy, and a dramatic interpretation of the school\'s founding story.',
      '"This is what happens when you give students a stage," said club patron Mr. Wasswa. "They surprise you every time."',
      'Winner Jennifer Akello, S4, performed a powerful spoken word piece about growing up in rural Uganda, earning a standing ovation from the audience.'
    ]
  },
  {
    slug: 'current-affairs-mock-parliament',
    title: 'Current Affairs Club Hosts Mock Parliament Session',
    date: 'May 02, 2026',
    category: 'Academics',
    image: '/assets/academics.jpg',
    excerpt: 'Students role-play as MPs debating education funding, healthcare, and youth employment in a simulated parliamentary session.',
    body: [
      'The WACOS Current Affairs Club hosted a mock parliament session last week, with students role-playing as Members of Parliament debating critical national issues including education funding, healthcare access, and youth employment.',
      'The session, modelled after the real Parliament of Uganda, saw students argue passionately for and against motions on free education, universal healthcare, and job creation programmes.',
      '"Understanding how government works is essential for active citizenship," said club patron Mr. Mugisha. "These students are learning to think critically about the issues that affect their communities."',
      'The best speaker, Patrick Ochieng of S5, was awarded a certificate and a copy of the Ugandan Constitution.'
    ]
  },
  {
    slug: 'football-busoga-championship',
    title: 'Wairaka Wins the Busoga Schools Football Championship',
    date: 'Aug 18, 2026',
    category: 'Athletics',
    image: '/assets/news-basketball.jpg',
    excerpt: 'Down a goal at half time, the school side came back to win 3–1 in front of a packed home crowd.',
    body: [
      'The M.M College Wairaka first eleven lifted the Busoga Schools Football Championship on Saturday, recovering from a one-goal half-time deficit to beat Jinja College 3–1 at the school grounds.',
      'Striker Joseph Waiswa scored twice in twelve second-half minutes, with midfielder Ali Mugoya sealing the result late.',
      '"The crowd carried us," said coach Patrick Isabirye. "By the seventieth minute the other side could not hear each other speak."',
      'The team advances to the regional playoffs in October.'
    ]
  },
  {
    slug: 'community-farm-outreach',
    title: 'Students Plant 4,000 Seedlings in Wairaka Community Drive',
    date: 'Aug 09, 2026',
    category: 'Outreach',
    image: '/assets/news-service.jpg',
    excerpt: 'Senior students spent the first Saturday of term working alongside neighbouring households on a reforestation drive.',
    body: [
      'More than four hundred students joined households around the college on Saturday to plant 4,000 tree seedlings raised in the school nursery, part of a five-year drive to restore tree cover along the Wairaka stretch.',
      'The nursery is run entirely by the Agriculture Club, which grows seedlings from seed collected by students during the holidays.',
      '"The motto is not decoration," said deputy head teacher Grace Kadondi. "We do it ourselves means the seedlings are ours, the labour is ours, and the shade will be the community\'s."',
      'A second planting is scheduled for the start of next term.'
    ]
  },
  {
    slug: 'graduation-class-of-2026',
    title: 'Class of 2026 Sent Off: "Go and Do It Yourselves"',
    date: 'Jul 02, 2026',
    category: 'Community',
    image: '/assets/news-graduation.jpg',
    excerpt: '312 candidates received their results and a charge to carry the school motto into the world.',
    body: [
      'M.M College Wairaka sent off 312 candidates last Friday in a ceremony that combined celebration with a clear charge to carry the school motto into the world.',
      'Head teacher Samuel Balikowa told graduates that the discipline and self-reliance they learned at Wairaka would serve them well in university and beyond.',
      '"You are not leaving this school with just certificates," he said. "You are leaving with the ability to do it yourselves, wherever life takes you."',
      'Guest of honour Joshua Cheptegei, a former student and Olympic champion, urged the graduates to give back to their school and community.'
    ]
  },
  {
    slug: 'home-science-cook-off',
    title: 'Home Science Club Hosts Inter-Class Cook-Off',
    date: 'Apr 18, 2026',
    category: 'Community',
    image: '/assets/student-life.jpg',
    excerpt: 'S3 team wins with a three-course meal using only locally sourced ingredients.',
    body: [
      'The Home Science Club hosted its first inter-class cook-off last week, with teams from S2 to S5 competing to prepare a three-course meal using only locally sourced ingredients.',
      'The S3 team, led by chairperson Sarah Kizza, won the competition with a menu of matooke soup, smoked fish with groundnut sauce, and a dessert of fresh fruit with honey.',
      '"We wanted to show that Ugandan cuisine can be elegant and delicious," said Sarah. "Everything on our menu was sourced within five kilometres of the school."',
      'The judges, including local chef Moses Wamboga, praised the creativity and presentation of all teams.'
    ]
  }
];

async function seed() {
  for (const article of articles) {
    const { error } = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(article)
    }).then(r => r.json());
    
    if (error) {
      console.log(`Error seeding ${article.slug}:`, error.message);
    } else {
      console.log(`Seeded: ${article.slug}`);
    }
  }
  console.log('Done!');
}

seed();
