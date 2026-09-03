import heroImg from "@/assets/hero.jpg";
import newsRobotics from "@/assets/news-robotics.jpg";
import newsBasketball from "@/assets/news-basketball.jpg";
import newsService from "@/assets/news-service.jpg";
import newsGraduation from "@/assets/news-graduation.jpg";
import campus from "@/assets/campus.jpg";
import academics from "@/assets/academics.jpg";
import athletics from "@/assets/athletics.jpg";
import studentLife from "@/assets/student-life.jpg";
import giving from "@/assets/giving.jpg";

export const SCHOOL_NAME = "M.M College Wairaka";
export const SCHOOL_SHORT = "WACOS";
export const SCHOOL_MOTTO = "We Do It Ourselves";
export const SCHOOL_TAGLINE =
  "Discipline, hard work and self-reliance since 1953";
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
  { label: "About", to: "/about" },
  { label: "Academics", to: "/academics" },
  { label: "Student Life", to: "/student-life" },
  { label: "Athletics", to: "/athletics" },
  { label: "Clubs", to: "/clubs" },
  { label: "Alumni", to: "/alumni" },
  { label: "Giving", to: "/giving" },
  { label: "Campus Stores", to: "/campus-stores" },
] as const;

export const MORE_ITEMS = [
  { label: "Calendar", to: "/calendar" },
  { label: "Contact", to: "/contact" },
] as const;

export const STATS = [
  {
    icon: "map-pin",
    value: "58",
    label: "districts across Uganda from which our students come",
  },
  {
    icon: "globe",
    value: "1,840",
    label: "students enrolled across O-Level and A-Level",
  },
  {
    icon: "award",
    value: "94%",
    label: "of A-Level candidates earned university entry last year",
  },
  {
    icon: "heart-handshake",
    value: "26,000",
    label: "hours of community service worked by students last year",
  },
  {
    icon: "graduation-cap",
    value: "73",
    label: "years of continuous service to the Busoga region",
  },
  {
    icon: "badge-check",
    value: "100%",
    label: "of students take part in a practical skills programme",
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
  { slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.', desc: 'The Home Science Club teaches practical life skills — cooking, nutrition, textiles, and household management. Members learn to prepare nutritious meals, sew and mend clothing, and understand the science behind everyday domestic life. The club connects classroom learning to real-world self-reliance.', activities: ['Cooking and nutrition workshops', 'Textile and fashion design', 'Food preservation techniques', 'Health and hygiene education'], img: 'IMAGES.campus' },
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
