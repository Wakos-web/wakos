import heroImg from "@/assets/hero.jpg";
import newsRobotics from "@/assets/news-robotics.jpg";
import newsBasketball from "@/assets/news-basketball.jpg";
import newsService from "@/assets/news-service.jpg";
import newsGraduation from "@/assets/news-graduation.jpg";
import newsAcademics from "@/assets/academics.jpg";
import newsStudentLife from "@/assets/student-life.jpg";
import campus from "@/assets/campus.jpg";
import academics from "@/assets/academics.jpg";
import athletics from "@/assets/athletics.jpg";
import studentLife from "@/assets/student-life.jpg";
import giving from "@/assets/giving.jpg";

export const SCHOOL_NAME = "M.M College Wairaka";
export const SCHOOL_SHORT = "WACOS";
export const SCHOOL_MOTTO = "We Do It Ourselves";
export const SCHOOL_TAGLINE =
  "Where your child becomes someone ,  since 1953";
export const LOGO_URL = "/wacos-logo.png";
export const HERO_VIDEO = "/hero-video.mp4";
export const HERO_POSTER = "/hero-poster.png";

export const IMAGES = {
  hero: heroImg,
  campus,
  academics,
  athletics,
  studentLife,
  giving,
};

export const NAV_ITEMS = [
  { label: "About", to: "/about", children: [
    { label: "Overview", to: "/about" },
    { label: "Our Identity", to: "/about#identity" },
    { label: "Mission", to: "/about#mission" },
    { label: "History", to: "/about#history" },
    { label: "Core Values", to: "/about#values" },
    { label: "Leadership", to: "/about#leadership" },
    { label: "Facilities", to: "/about#facilities" },
  ] },
  { label: "Academics", to: "/academics", children: [
    { label: "Overview", to: "/academics" },
    { label: "O-Level", to: "/academics#olevel" },
    { label: "A-Level", to: "/academics#alevel" },
    { label: "Departments", to: "/academics#departments" },
    { label: "Resources", to: "/academics#resources" },
  ] },
  { label: "Student Life", to: "/student-life", children: [
    { label: "Overview", to: "/student-life" },
    { label: "Residential Life", to: "/student-life#residential" },
    { label: "Clubs & Societies", to: "/student-life#clubs" },
    { label: "Sports", to: "/student-life#sports" },
    { label: "Community Service", to: "/student-life#service" },
    { label: "Arts & Culture", to: "/student-life#arts" },
    { label: "Wellness", to: "/student-life#wellness" },
  ] },
  { label: "Athletics", to: "/athletics", children: [
    { label: "Overview", to: "/athletics" },
    { label: "Sports", to: "/athletics#sports" },
    { label: "Highlights", to: "/athletics#highlights" },
    { label: "Notable Athletes", to: "/athletics#athletes" },
  ] },
  { label: "Clubs", to: "/clubs", children: [
    { label: "All Clubs", to: "/clubs" },
    { label: "Wildlife Club", to: "/clubs/wildlife" },
    { label: "Arts & Culture", to: "/clubs/arts-culture" },
    { label: "Scouts & Guides", to: "/clubs/scouts-guides" },
    { label: "Agriculture", to: "/clubs/agriculture" },
    { label: "Debate Club", to: "/clubs/debate" },
    { label: "Writers Club", to: "/clubs/writers" },
    { label: "Red Cross", to: "/clubs/red-cross" },
    { label: "Entertainment", to: "/clubs/entertainment" },
    { label: "Home Science", to: "/clubs/home-science" },
    { label: "Current Affairs", to: "/clubs/current-affairs" },
  ] },
  { label: "Alumni", to: "/alumni", children: [
    { label: "Pulse", to: "/alumni" },
    { label: "Alumni Directory", to: "/alumni/directory" },
    { label: "Business Directory", to: "/alumni/directory/businesses" },
    { label: "Upcoming Events", to: "/alumni#events" },
  ] },
  { label: "Giving", to: "/giving", children: [
    { label: "Overview", to: "/giving" },
    { label: "Ways to Give", to: "/giving#ways" },
    { label: "Our Impact", to: "/giving#impact" },
    { label: "FAQ", to: "/giving#faq" },
  ] },
  { label: "Campus Stores", to: "/campus-stores", children: [
    { label: "All Stories", to: "/campus-stores" },
    { label: "Latest News", to: "/campus-stores" },
    { label: "STEM", to: "/campus-stores" },
    { label: "Athletics", to: "/campus-stores" },
    { label: "Outreach", to: "/campus-stores" },
    { label: "Community", to: "/campus-stores" },
  ] },
] as const;

export const MORE_ITEMS = [
  { label: "Calendar", to: "/calendar" },
  { label: "Contact", to: "/contact" },
] as const;

export const STATS = [
  {
    icon: "map-pin",
    value: "58",
    label: "families travel from across Uganda to bring their children here",
  },
  {
    icon: "globe",
    value: "1,840",
    label: "students choosing discipline, hard work and self-reliance",
  },
  {
    icon: "award",
    value: "94%",
    label: "of A-Level students went on to university last year",
  },
  {
    icon: "heart-handshake",
    value: "26,000",
    label: "hours of community service your child will contribute before graduating",
  },
  {
    icon: "graduation-cap",
    value: "73",
    label: "years of proven results ,  your child is next",
  },
  {
    icon: "badge-check",
    value: "100%",
    label: "of students graduate with practical skills, not just a certificate",
  },
];

export const CLUBS = [
  { slug: "wildlife", name: "Wildlife Club", tagline: "Protect. Observe. Conserve.", desc: "The Wildlife Club connects students with Uganda’s rich biodiversity. Members participate in nature walks, wildlife surveys, and conservation campaigns. The club fosters awareness of environmental stewardship and the importance of protecting local ecosystems around the Busoga region.", activities: ["Nature walks and wildlife surveys", "Conservation campaigns in local communities", "Tree planting drives", "Guest speakers from Uganda Wildlife Authority"], img: "IMAGES.campus" },
  { slug: "arts-culture", name: "Arts & Culture Club", tagline: "Express. Create. Celebrate.", desc: "The Arts & Culture Club is the creative heartbeat of WACOS. Members explore traditional Busoga dance, music, drama, and visual arts. The club performs at school events, inter-school competitions, and community celebrations, keeping cultural heritage alive while building confidence and creativity.", activities: ["Traditional dance and music performances", "Drama productions and inter-school competitions", "Visual arts exhibitions", "Cultural heritage awareness"], img: "IMAGES.studentLife" },
  { slug: "scouts-guides", name: "Scouts & Girl Guides", tagline: "Prepared. Responsible. Service.", desc: "Scouts and Girl Guides build leadership, service, and resilience through structured programmes. Members develop outdoor skills, community awareness, and the discipline to serve others. The programme connects students to a global movement while rooting them in local community needs.", activities: ["Outdoor survival and camping skills", "Community service projects", "Leadership training", "First aid certification"], img: "IMAGES.giving" },
  { slug: "agriculture", name: "Agriculture Club", tagline: "Grow. Learn. Sustain.", desc: "Running the school nursery and farm, the Agriculture Club is central to WACOS identity. Students grow seedlings from seed, manage crops, and learn practical agricultural skills that connect directly to the school’s founding identity as a farm school. The club supplied 4,000 seedlings for the community reforestation drive.", activities: ["School nursery and farm management", "Seedling production for community outreach", "Crop rotation and soil management", "Agricultural science experiments"], img: "IMAGES.campus" },
  { slug: "debate", name: "Debate Club", tagline: "Think. Argue. Persuade.", desc: "The Debate Club sharpens critical thinking and public speaking. Students research, construct arguments, and compete in inter-school tournaments. The club builds the confidence to speak clearly, think independently, and engage respectfully with differing viewpoints.", activities: ["Weekly practice sessions", "Inter-school debate tournaments", "Public speaking workshops", "Model United Nations simulations"], img: "IMAGES.academics" },
  { slug: "writers", name: "Writers Club", tagline: "Write. Read. Share.", desc: "The Writers Club nurtures a love of language. Members write poetry, short stories, essays, and journalism. The club produces the school magazine and provides a platform for students to find their voice through the written word.", activities: ["School magazine production", "Creative writing workshops", "Poetry slams and open mic events", "Journalism and reporting"], img: "IMAGES.studentLife" },
  { slug: "red-cross", name: "Red Cross Club", tagline: "Care. Respond. Serve.", desc: "The Red Cross Club teaches students the principles of humanitarian service. Members learn first aid, disaster preparedness, and health education. The club organises blood drives, health camps, and community outreach programmes that directly serve the Wairaka community.", activities: ["First aid training and certification", "Blood donation drives", "Health education campaigns", "Disaster preparedness workshops"], img: "IMAGES.giving" },
  { slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.', desc: 'The Entertainment Club is where talent meets stage. Members organise talent shows, music performances, comedy nights, and cultural events. The club gives students a platform to express themselves, build confidence, and entertain the school community.', activities: ['Talent shows and open mic nights', 'Music and dance performances', 'Comedy and drama sketches', 'Event planning and MC duties'], img: 'IMAGES.studentLife' },
  { slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.', desc: 'The Home Science Club teaches practical life skills ,  cooking, nutrition, textiles, and household management. Members learn to prepare nutritious meals, sew and mend clothing, and understand the science behind everyday domestic life. The club connects classroom learning to real-world self-reliance.', activities: ['Cooking and nutrition workshops', 'Textile and fashion design', 'Food preservation techniques', 'Health and hygiene education'], img: 'IMAGES.campus' },
  { slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.', desc: 'The Current Affairs Club keeps students informed about national and global events. Members discuss politics, economics, science, and social issues. The club builds informed citizens who can think critically about the world around them.', activities: ['Weekly news discussion sessions', 'Mock parliament and governance simulations', 'Guest speakers and panels', 'Model African Union and UN programmes'], img: 'IMAGES.academics' }
];


export type Article = {
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "science-club-national-fair",
    title: "Science Club Takes Second at the National Science Fair",
    date: "Aug 24, 2026",
    category: "STEM",
    image: newsRobotics,
    excerpt:
      "A solar-powered irrigation prototype built in the WACOS workshop earned second place among ninety schools in Kampala.",
    body: [
      "The M.M College Wairaka Science Club returned from the National Schools Science Fair in Kampala with a second-place finish, placing ahead of eighty-eight other schools with a solar-powered drip irrigation controller designed for smallholder farms.",
      "The prototype was built entirely in the college workshop over two terms, using salvaged components and a microcontroller donated by an old student.",
      "\u201CWe kept failing at the pump timing until we stopped copying designs from the internet and measured our own soil,\u201D said club chairperson Brenda Nabirye, S6.",
      "The team now plans to trial three units on farms neighbouring the school before the next fair.",
    ],
  },
  {
    slug: "asbestos-removal-complete",
    title: "Asbestos Removal Programme Reaches Major Milestone",
    date: "Aug 15, 2026",
    category: "Infrastructure",
    image: newsService,
    excerpt:
      "The alumni-funded asbestos removal programme has cleared three major buildings, making campus safer for students and staff.",
    body: [
      "The Wairaka Trust Fund asbestos removal programme has reached a significant milestone, with three major campus buildings now completely cleared of hazardous materials.",
      "The programme, funded entirely by alumni contributions through the Trust Fund, began in 2024 after a safety audit identified asbestos in roofing materials across several older buildings.",
      "\u201CThis is what \u2018We Do It Ourselves\u2019 looks like in practice,\u201D said Trust Fund Coordinator Moses Wamboga. \u201CThe alumni identified the problem, funded the solution, and hired certified contractors to do the work safely.\u201D",
      "Phase two targets the remaining four buildings, with completion expected by the end of 2026. The total project cost is estimated at UGX 45 million, with 60\u201370\u2013% already raised through monthly Trust Fund contributions.",
    ],
  },
  {
    slug: "agriculture-club-reforestation",
    title: "Agriculture Club Leads Community Reforestation Drive",
    date: "Aug 09, 2026",
    category: "Outreach",
    image: newsService,
    excerpt:
      "Students plant 4,000 seedlings along the Wairaka stretch, restoring tree cover lost to decades of deforestation.",
    body: [
      "More than four hundred students joined households around the college on Saturday to plant 4,000 tree seedlings raised in the school nursery, part of a five-year drive to restore tree cover along the Wairaka stretch.",
      "The nursery is run entirely by the Agriculture Club, which grows seedlings from seed collected by students during the holidays.",
      "\u201CThe motto is not decoration,\u201D said deputy head teacher Grace Kadondi. \u201CWe do it ourselves means the seedlings are ours, the labour is ours, and the shade will be the community\u2019s.\u201D",
      "A second planting is scheduled for the start of next term. The club aims to plant 10,000 seedlings annually, with species selected for rapid growth and soil stability.",
    ],
  },
  {
    slug: "debate-team-regional-winners",
    title: "Debate Team Wins Eastern Regional Championships",
    date: "Jul 28, 2026",
    category: "Academics",
    image: newsAcademics,
    excerpt:
      "The WACOS debate team defeated fifteen schools to claim the Eastern Regional debating title for the first time.",
    body: [
      "The M.M College Wairaka debate team made history by winning the Eastern Regional Schools Debate Championship, defeating fifteen schools including established powerhouses Jinja College and Busoga College Mwiri.",
      "The team of four S5 students argued passionately for the motion \u201CThis house believes technology does more harm than good in developing countries,\u201D ultimately winning on points of argumentation and rebuttal.",
      "\u201CWe trained three times a week for two months,\u201D said team captain Ahmed Muwonge. \u201COur coach, Mr. Okello, pushed us to research every angle of the argument.\u201D",
      "The victory earns WACOS a place at the National Schools Debate Championship in October, where they will compete against the best teams from across Uganda.",
    ],
  },
  {
    slug: "red-cross-blood-drive",
    title: "Red Cross Club Hosts Annual Blood Drive",
    date: "Jul 15, 2026",
    category: "Community",
    image: newsService,
    excerpt:
      "Students and staff donate over 200 units of blood in the club\u2019s biggest drive yet, supporting Jinja Regional Hospital.",
    body: [
      "The WACOS Red Cross Club hosted its annual blood donation drive last week, collecting over 200 units of blood from students, staff, and community members.",
      "The drive, organised in partnership with the Uganda Blood Transfusion Service, saw 180 students donate for the first time, with many describing the experience as \u201Cempowering.\u201D",
      "\u201CWhen you donate blood, you\u2019re not just giving a unit, you\u2019re giving someone a chance at life,\u201D said club chairperson Patricia Auma. \u201CThat\u2019s what service means at WACOS.\u201D",
      "The collected blood will be distributed to Jinja Regional Hospital and surrounding health centres, addressing chronic shortages in the region.",
    ],
  },
  {
    slug: "writers-club-magazine-launch",
    title: "Writers Club Launches New School Magazine \u201CThe Wairaka Voice\u201D",
    date: "Jul 02, 2026",
    category: "Arts",
    image: newsStudentLife,
    excerpt:
      "The inaugural issue of \u201CThe Wairaka Voice\u201D features student poetry, fiction, and investigative journalism on campus issues.",
    body: [
      "The WACOS Writers Club has launched \u201CThe Wairaka Voice,\u201D a new school magazine featuring original poetry, short fiction, essays, and investigative journalism produced entirely by students.",
      "The 48-page inaugural issue includes a special feature on the school\u2019s 73-year history, interviews with alumni, and a investigative piece on water access in surrounding communities.",
      "\u201CWe wanted to create something that captures the real WACOS experience,\u201D said editor-in-chief Catherine Nabwire, S6. \u201CNot just the achievements, but the daily life, the struggles, and the dreams of our students.\u201D",
      "The magazine will be published termly, with copies distributed to students, staff, and alumni. Digital versions will be available on the school website.",
    ],
  },
  {
    slug: "old-students-reunion-2026",
    title: "Old Students Reunion Brings Together Six Decades of WACOS Graduates",
    date: "Jun 20, 2026",
    category: "Alumni",
    image: newsGraduation,
    excerpt:
      "Over 300 alumni from the 1960s to 2020s gathered at the school grounds for the annual reunion celebration.",
    body: [
      "More than 300 alumni spanning six decades returned to the Wairaka campus last weekend for the annual Old Students Reunion, celebrating the school\u2019s 73-year legacy.",
      "The event featured speeches from head teacher Samuel Balikowa, Trust Fund Coordinator Moses Wamboga, and guest of honour Joshua Cheptegei, who encouraged current students to embrace the school motto.",
      "\u201CWhen I sat in those classrooms, I never imagined I would stand here as an Olympic champion,\u201D Cheptegei told the gathering. \u201CBut the discipline I learned at WACOS made everything possible.\u201D",
      "The reunion also saw the launch of the Trust Fund\u2019s new \u201CClass of 2026\u201D giving campaign, encouraging recent graduates to begin monthly contributions of UGX 10,000.",
    ],
  },
  {
    slug: "netball-team-inter-school-victory",
    title: "Netball Team Triumphs in Inter-School Tournament",
    date: "Jun 10, 2026",
    category: "Athletics",
    image: newsBasketball,
    excerpt:
      "The WACOS netball team defeated five schools to win the Jinja District Inter-School Netball Tournament.",
    body: [
      "The M.M College Wairaka netball team claimed victory at the Jinja District Inter-School Netball Tournament, defeating five schools in a commanding display of skill and teamwork.",
      "Captain Grace Nambogo led from the front, scoring 12 goals in the final against Jinja College to secure a 35-28 victory.",
      "\u201CWe trained every morning at 6am before classes,\u201D said coach Sarah Nakamya. \u201CThe girls showed incredible dedication and sportsmanship throughout the tournament.\u201D",
      "The team will represent Jinja District at the Eastern Regional Netball Championships in September.",
    ],
  },
  {
    slug: "laboratory-renovation-update",
    title: "Physics and Chemistry Laboratories Fully Renovated",
    date: "May 28, 2026",
    category: "Infrastructure",
    image: newsAcademics,
    excerpt:
      "Alumni-funded renovations have transformed the science laboratories with new equipment and modern safety features.",
    body: [
      "The Physics and Chemistry laboratories at M.M College Wairaka have been fully renovated through the Trust Fund, bringing the facilities up to UNEB examination standards.",
      "The renovation included new workbenches, safety equipment, chemical storage cabinets, and modern analytical instruments. The total investment was UGX 35 million, funded entirely by alumni contributions.",
      "\u201CWhen I was a student here, we did experiments with broken equipment and makeshift tools,\u201D said alumni donor Patrick Isabirye. \u201CNow our children have proper facilities. That\u2019s progress.\u201D",
      "The Biology laboratory renovation is scheduled for next term, with the Trust Fund seeking an additional UGX 20 million to complete the project.",
    ],
  },
  {
    slug: "entertainment-club-talent-show",
    title: "Entertainment Club Hosts Sold-Out Talent Show \u201CWACOS Has Talent\u201D",
    date: "May 15, 2026",
    category: "Arts",
    image: newsStudentLife,
    excerpt:
      "Over 500 students and parents packed the school hall for an evening of music, dance, comedy, and drama performances.",
    body: [
      "The WACOS Entertainment Club hosted its inaugural \u201CWACOS Has Talent\u201D show last Friday, with over 500 students and parents filling the school hall for an evening of extraordinary performances.",
      "The show featured 18 acts ranging from traditional Busoga dance to contemporary music, stand-up comedy, and a dramatic interpretation of the school\u2019s founding story.",
      "\u201CThis is what happens when you give students a stage,\u201D said club patron Mr. Wasswa. \u201CThey surprise you every time.\u201D",
      "Winner Jennifer Akello, S4, performed a powerful spoken word piece about growing up in rural Uganda, earning a standing ovation from the audience.",
    ],
  },
  {
    slug: "current-affairs-mock-parliament",
    title: "Current Affairs Club Hosts Mock Parliament Session",
    date: "May 02, 2026",
    category: "Academics",
    image: newsAcademics,
    excerpt:
      "Students role-play as MPs debating education funding, healthcare, and youth employment in a simulated parliamentary session.",
    body: [
      "The WACOS Current Affairs Club hosted a mock parliament session last week, with students role-playing as Members of Parliament debating critical national issues including education funding, healthcare access, and youth employment.",
      "The session, modelled after the real Parliament of Uganda, saw students argue passionately for and against motions on free education, universal healthcare, and job creation programmes.",
      "\u201CUnderstanding how government works is essential for active citizenship,\u201D said club patron Mr. Mugisha. \u201CThese students are learning to think critically about the issues that affect their communities.\u201D",
      "The best speaker, Patrick Ochieng of S5, was awarded a certificate and a copy of the Ugandan Constitution.",
    ],
  },
  {
    slug: "football-busoga-championship",
    title: "Wairaka Wins the Busoga Schools Football Championship",
    date: "Aug 18, 2026",
    category: "Athletics",
    image: newsBasketball,
    excerpt:
      "Down a goal at half time, the school side came back to win 3\u20131 in front of a packed home crowd.",
    body: [
      "The M.M College Wairaka first eleven lifted the Busoga Schools Football Championship on Saturday, recovering from a one-goal half-time deficit to beat Jinja College 3\u20131 at the school grounds.",
      "Striker Joseph Waiswa scored twice in twelve second-half minutes, with midfielder Ali Mugoya sealing the result late.",
      "\u201CThe crowd carried us,\u201D said coach Patrick Isabirye. \u201CBy the seventieth minute the other side could not hear each other speak.\u201D",
      "The team advances to the regional playoffs in October.",
    ],
  },
  {
    slug: "community-farm-outreach",
    title: "Students Plant 4,000 Seedlings in Wairaka Community Drive",
    date: "Aug 09, 2026",
    category: "Outreach",
    image: newsService,
    excerpt:
      "Senior students spent the first Saturday of term working alongside neighbouring households on a reforestation drive.",
    body: [
      "More than four hundred students joined households around the college on Saturday to plant 4,000 tree seedlings raised in the school nursery, part of a five-year drive to restore tree cover along the Wairaka stretch.",
      "The nursery is run entirely by the Agriculture Club, which grows seedlings from seed collected by students during the holidays.",
      "\u201CThe motto is not decoration,\u201D said deputy head teacher Grace Kadondi. \u201CWe do it ourselves means the seedlings are ours, the labour is ours, and the shade will be the community's.\u201D",
      "A second planting is scheduled for the start of next term.",
    ],
  },
  {
    slug: "graduation-class-of-2026",
    title: "Class of 2026 Sent Off: \u201CGo and Do It Yourselves\u201D",
    date: "Jul 02, 2026",
    category: "Community",
    image: newsGraduation,
    excerpt:
      "Three hundred and twelve candidates were sent off in a ceremony attended by old students spanning six decades.",
    body: [
      "Three hundred and twelve S6 candidates were formally sent off in a ceremony at the college grounds attended by parents, staff, and old students from as far back as the 1968 cohort.",
      "Head teacher Samuel Balikowa urged leavers to treat the school motto as an instruction rather than a slogan.",
      "\u201CNobody is coming to build your district for you,\u201D he told the class. \u201CYou were taught to do it yourselves. Now go and do it.\u201D",
      "The class will sit final national examinations in November before dispersing to universities and technical institutes across the country.",
    ],
  },
];

export const TEAMS = [
  { sport: "Football", season: "Term 1 & 2", level: "First XI / Junior" },
  { sport: "Netball", season: "Term 1", level: "Senior / Junior" },
  { sport: "Athletics", season: "Term 2", level: "Track & Field" },
  { sport: "Volleyball", season: "Term 2", level: "Senior / Junior" },
  { sport: "Basketball", season: "Term 3", level: "Senior" },
  { sport: "Cricket", season: "Term 3", level: "Senior" },
  { sport: "Swimming", season: "Term 1", level: "Open" },
  { sport: "Rugby", season: "Term 2", level: "Senior" },
];
