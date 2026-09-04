import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { IMAGES } from '@/lib/content';
import campusImg from '@/assets/campus.jpg';
import athleticsImg from '@/assets/athletics.jpg';
import studentLifeImg from '@/assets/student-life.jpg';
import academicsImg from '@/assets/academics.jpg';
import newsServiceImg from '@/assets/news-service.jpg';
import givingImg from '@/assets/giving.jpg';
import newsRoboticsImg from '@/assets/news-robotics.jpg';
import newsBasketballImg from '@/assets/news-basketball.jpg';
import newsGraduationImg from '@/assets/news-graduation.jpg';
import heroImg from '@/assets/hero.jpg';

const AVATARS = [campusImg, athleticsImg, studentLifeImg, academicsImg, newsServiceImg, givingImg, newsRoboticsImg, newsBasketballImg, newsGraduationImg, heroImg];

type Person = { name: string; role: string; year?: string; joined?: string; img?: string };

const CLUBS = [
  {
    slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.',
    overview: 'We connect students with Uganda\'s biodiversity. Every walk, every survey, every campaign is a lesson no textbook can teach. This is where future conservationists are made.',
    stats: { members: 45, events: 8, years: 15, alumni: 200 },
    img: campusImg,
    patron: { name: 'Mr. Moses Okello', role: 'Science Teacher', joined: '2018', img: academicsImg },
    executives: [
      { name: 'Nadia M.', role: 'Chairperson', year: 'S4', joined: '2023', img: studentLifeImg },
      { name: 'David K.', role: 'Vice Chair', year: 'S4', joined: '2023', img: athleticsImg },
      { name: 'Sarah N.', role: 'Secretary', year: 'S3', joined: '2024', img: newsServiceImg },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Nature walks and wildlife surveys', 'Conservation campaigns', 'Tree planting drives', 'Guest speakers from UWA'],
  },
  {
    slug: 'arts-culture', name: 'Arts & Culture Club', tagline: 'Express. Create. Celebrate.',
    overview: 'We are the creative heartbeat of WACOS. Traditional dance, music, drama, visual arts, and cultural heritage live here. If you feel it, we help you express it.',
    stats: { members: 38, events: 12, years: 20, alumni: 350 },
    img: studentLifeImg,
    patron: { name: 'Ms. Florence Auma', role: 'Arts Teacher', joined: '2016', img: studentLifeImg },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Drama Captain', year: 'S4', joined: '2023', img: campusImg },
      { name: 'David O.', role: 'Music Director', year: 'S4', joined: '2023', img: athleticsImg },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Traditional dance and music', 'Drama productions', 'Visual arts exhibitions', 'Cultural heritage awareness'],
  },
  {
    slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.',
    overview: 'Leadership, service, and resilience through structured outdoor programmes. We prepare students not just for exams, but for life.',
    stats: { members: 60, events: 10, years: 25, alumni: 500 },
    img: givingImg,
    patron: { name: 'Mr. Peter Wasswa', role: 'Senior Teacher', joined: '2015', img: athleticsImg },
    executives: [
      { name: 'Joseph W.', role: 'Scout Leader', year: 'S5', joined: '2022', img: campusImg },
      { name: 'Brenda N.', role: 'Guide Captain', year: 'S5', joined: '2022', img: newsServiceImg },
      { name: 'Ali M.', role: 'Secretary', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Patrick I.', year: 'S3', joined: '2024' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Outdoor survival and camping', 'Community service projects', 'Leadership training', 'First aid certification'],
  },
  {
    slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.',
    overview: 'Running the school nursery and farm, we are central to the WACOS identity. Students grow seedlings from seed, manage crops, and feed the community. This is the motto in action.',
    stats: { members: 50, events: 6, years: 30, alumni: 600 },
    img: campusImg,
    patron: { name: 'Mr. James Okello', role: 'Agriculture Teacher', joined: '2017', img: athleticsImg },
    executives: [
      { name: 'Patrick I.', role: 'Chairperson', year: 'S5', joined: '2022', img: campusImg },
      { name: 'Sarah K.', role: 'Secretary', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'Moses W.', role: 'Farm Manager', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
    activities: ['School nursery and farm management', 'Seedling production', 'Crop rotation experiments', 'Agricultural science'],
  },
  {
    slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.',
    overview: 'Critical thinking and public speaking sharpened through research, argument construction, and competition. We produce lawyers, politicians, and leaders who can hold their own anywhere.',
    stats: { members: 35, events: 14, years: 18, alumni: 300 },
    img: academicsImg,
    patron: { name: 'Mr. Samuel Balikowa', role: 'History Teacher', joined: '2019', img: athleticsImg },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Vice Chair', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Sarah N.', role: 'Secretary', year: 'S4', joined: '2023', img: newsServiceImg },
    ],
    members: [
      { name: 'David K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Weekly practice sessions', 'Inter-school tournaments', 'Public speaking workshops', 'Model UN simulations'],
  },
  {
    slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.',
    overview: 'A love of language nurtured through poetry, short stories, essays, and journalism. We publish. We perform. We find our voice.',
    stats: { members: 30, events: 8, years: 12, alumni: 180 },
    img: studentLifeImg,
    patron: { name: 'Ms. Janet Nakato', role: 'English Teacher', joined: '2020', img: studentLifeImg },
    executives: [
      { name: 'Sarah N.', role: 'Editor-in-Chief', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'David O.', role: 'Chairperson', year: 'S4', joined: '2023', img: athleticsImg },
      { name: 'Grace N.', role: 'Secretary', year: 'S3', joined: '2024', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Ali M.', year: 'S2', joined: '2025' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['School magazine production', 'Creative writing workshops', 'Poetry slams', 'Journalism and reporting'],
  },
  {
    slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.',
    overview: 'Humanitarian service taught through first aid, disaster preparedness, and health education. We save lives before we leave school.',
    stats: { members: 55, events: 10, years: 22, alumni: 450 },
    img: givingImg,
    patron: { name: 'Sr. Grace Nakamya', role: 'School Nurse', joined: '2017', img: newsServiceImg },
    executives: [
      { name: 'Brenda N.', role: 'Chairperson', year: 'S5', joined: '2022', img: givingImg },
      { name: 'Ali M.', role: 'Vice Chair', year: 'S4', joined: '2023', img: academicsImg },
      { name: 'Grace N.', role: 'Secretary', year: 'S4', joined: '2023', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['First aid training', 'Blood donation drives', 'Health education campaigns', 'Disaster preparedness'],
  },
  {
    slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.',
    overview: 'Where talent meets stage. Talent shows, music, comedy, cultural events. We plan it. We perform it. We own it.',
    stats: { members: 42, events: 15, years: 10, alumni: 250 },
    img: studentLifeImg,
    patron: { name: 'Mr. David Ssemwanga', role: 'Music Teacher', joined: '2021', img: athleticsImg },
    executives: [
      { name: 'David O.', role: 'Chairperson', year: 'S5', joined: '2022', img: athleticsImg },
      { name: 'Nadia M.', role: 'Events Coordinator', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Brian K.', role: 'MC Lead', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Talent shows and open mic nights', 'Music and dance performances', 'Comedy and drama sketches', 'Event planning'],
  },
  {
    slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.',
    overview: 'Practical life skills that matter. Cooking, nutrition, textiles, household management. We learn what keeps families healthy and homes running.',
    stats: { members: 28, events: 8, years: 14, alumni: 220 },
    img: campusImg,
    patron: { name: 'Ms. Harriet Nabirye', role: 'Home Science Teacher', joined: '2019', img: studentLifeImg },
    executives: [
      { name: 'Sarah K.', role: 'Chairperson', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'Brenda N.', role: 'Secretary', year: 'S4', joined: '2023', img: givingImg },
      { name: 'Grace N.', role: 'Treasurer', year: 'S3', joined: '2024', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
    activities: ['Cooking and nutrition workshops', 'Textile and fashion design', 'Food preservation', 'Health and hygiene education'],
  },
  {
    slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.',
    overview: 'National and global events discussed, debated, and understood. Politics, economics, science, social issues. We produce citizens who know what is happening and why it matters.',
    stats: { members: 32, events: 10, years: 8, alumni: 150 },
    img: academicsImg,
    patron: { name: 'Mr. Francis Mugalu', role: 'Social Studies Teacher', joined: '2020', img: athleticsImg },
    executives: [
      { name: 'Ali M.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Research Lead', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Joseph W.', role: 'Secretary', year: 'S4', joined: '2023', img: athleticsImg },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Grace N.', year: 'S4', joined: '2022' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Weekly news discussions', 'Mock parliament simulations', 'Guest speakers and panels', 'Model AU and UN programmes'],
  },
];

type ClubPost = { id: number; title: string; date: string; author: string; excerpt: string; img: string };

const CLUB_POSTS: Record<string, ClubPost[]> = {
  wildlife: [
    { id: 1, title: 'Nature walk reveals rare butterfly species on campus', date: 'Sep 01, 2026', author: 'Club Chairperson', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority.', img: IMAGES.campus },
    { id: 2, title: 'Tree planting drive targets 500 seedlings along Jinja road', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary.', img: IMAGES.studentLife },
    { id: 3, title: 'Guest lecture from UWA ranger on elephant corridor conservation', date: 'Aug 05, 2026', author: 'Secretary', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected.', img: IMAGES.giving },
  ],
  'arts-culture': [
    { id: 1, title: 'Busoga cultural night draws record attendance', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Over 300 students and parents attended our annual cultural night with traditional Busoga dance and Lusoga poetry.', img: IMAGES.studentLife },
    { id: 2, title: 'Drama team wins best ensemble at Jinja regional festival', date: 'Aug 18, 2026', author: 'Drama Captain', excerpt: 'Our five-member drama team took the best ensemble award at the Busoga region arts festival.', img: IMAGES.campus },
    { id: 3, title: 'Visual arts exhibition opens in the school library', date: 'Aug 01, 2026', author: 'Arts Prefect', excerpt: 'Twelve students displayed paintings, charcoal drawings, and mixed-media pieces exploring identity and community.', img: IMAGES.giving },
  ],
  'scouts-guides': [
    { id: 1, title: 'Annual camping expedition heads to Source of the Nile', date: 'Sep 05, 2026', author: 'Scout Master', excerpt: 'Forty scouts and guides set off for a three-day expedition at the Source of the Nile.', img: IMAGES.giving },
    { id: 2, title: 'First aid certification training completes for 60 students', date: 'Aug 22, 2026', author: 'Patron', excerpt: 'In partnership with the Red Cross, 60 scouts and guides completed a two-day first aid certification course.', img: IMAGES.studentLife },
    { id: 3, title: 'Guides lead community clean-up in Wairaka trading centre', date: 'Aug 08, 2026', author: 'Guide Captain', excerpt: 'Twenty-five Girl Guides spent Saturday morning clearing drainage and collecting litter.', img: IMAGES.campus },
  ],
  agriculture: [
    { id: 1, title: 'School nursery distributes 2,000 seedlings to Wairaka families', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The Agriculture Club distributed 2,000 fruit and timber seedlings grown in the school nursery.', img: IMAGES.campus },
    { id: 2, title: 'Students harvest first crop from drip irrigation demo plot', date: 'Aug 15, 2026', author: 'Patron', excerpt: 'The club\'s drip irrigation demo plot produced its first harvest of tomatoes and sukuma wiki.', img: IMAGES.studentLife },
    { id: 3, title: 'Agriculture students attend Jinja district farming expo', date: 'Aug 03, 2026', author: 'Secretary', excerpt: 'Fifteen club members attended the annual Jinja District Agricultural Expo.', img: IMAGES.giving },
  ],
  debate: [
    { id: 1, title: 'WACOS debate team reaches national championships', date: 'Sep 04, 2026', author: 'Debate Coach', excerpt: 'After sweeping the Busoga regional qualifiers, our debate team qualified for the UNEB National Schools Debate Championships.', img: IMAGES.academics },
    { id: 2, title: 'Public speaking workshop builds confidence in Form 3 students', date: 'Aug 19, 2026', author: 'Club Chairperson', excerpt: 'Twenty Form 3 students completed a four-week public speaking workshop.', img: IMAGES.campus },
    { id: 3, title: 'Model UN simulation tackles African Union trade policy', date: 'Aug 06, 2026', author: 'Secretary', excerpt: 'Students represented 12 African nations in a Model AU simulation focused on the African Continental Free Trade Area.', img: IMAGES.studentLife },
  ],
  writers: [
    { id: 1, title: 'New school magazine "The Wairaka Voice" launches', date: 'Sep 01, 2026', author: 'Editor-in-Chief', excerpt: 'The inaugural edition features 24 pages of student writing including poetry, short fiction, and photo essays.', img: IMAGES.studentLife },
    { id: 2, title: 'Poetry slam night sees 18 students perform original work', date: 'Aug 21, 2026', author: 'Club Chairperson', excerpt: 'The open mic poetry slam drew 18 performers and an audience of over 100.', img: IMAGES.campus },
    { id: 3, title: 'Writers Club partners with Jinja Public Library for book drive', date: 'Aug 07, 2026', author: 'Secretary', excerpt: 'Club members collected and donated 350 books to the Jinja Public Library.', img: IMAGES.giving },
  ],
  'red-cross': [
    { id: 1, title: 'Annual blood drive collects 120 units for Jinja Regional Hospital', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Our annual blood donation drive collected 120 units in partnership with the Uganda Blood Transfusion Service.', img: IMAGES.giving },
    { id: 2, title: 'First aid training equips 80 students with life-saving skills', date: 'Aug 18, 2026', author: 'Patron', excerpt: 'Red Cross trainers led a two-day first aid course for 80 students.', img: IMAGES.studentLife },
    { id: 3, title: 'Health education week reaches 1,500 primary school pupils', date: 'Aug 04, 2026', author: 'Secretary', excerpt: 'Club members visited five primary schools in Wairaka sub-county to teach hygiene and health education.', img: IMAGES.campus },
  ],
  entertainment: [
    { id: 1, title: 'Sold-out talent show raises funds for school library', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The annual talent show drew a full house with 22 acts and raised UGX 3.2 million.', img: IMAGES.studentLife },
    { id: 2, title: 'Music team records first student album at Wairaka Studios', date: 'Aug 16, 2026', author: 'Music Director', excerpt: 'Eight musicians recorded a 10-track album featuring original compositions.', img: IMAGES.campus },
    { id: 3, title: 'Comedy night draws laughs and lessons on school values', date: 'Aug 02, 2026', author: 'Secretary', excerpt: 'The comedy night featured clean humour about school life and growing up in Uganda.', img: IMAGES.giving },
  ],
  'home-science': [
    { id: 1, title: 'Students cook up a storm at inter-school culinary challenge', date: 'Sep 04, 2026', author: 'Club Chairperson', excerpt: 'Four WACOS students competed against 12 schools and won second place overall.', img: IMAGES.campus },
    { id: 2, title: 'Nutrition workshop teaches meal planning on a budget', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'Guest nutritionist Sarah Namukasa led a workshop on planning nutritious meals.', img: IMAGES.studentLife },
    { id: 3, title: 'Fashion and textile students showcase upcycled designs', date: 'Aug 08, 2026', author: 'Secretary', excerpt: 'Fifteen students displayed garments made from recycled fabrics.', img: IMAGES.giving },
  ],
  'current-affairs': [
    { id: 1, title: 'Mock parliament debates national budget priorities', date: 'Sep 05, 2026', author: 'Club Chairperson', excerpt: 'Students role-played as MPs debating Uganda\'s national budget allocation.', img: IMAGES.academics },
    { id: 2, title: 'Weekly news quiz sees Form 2 team take the lead', date: 'Aug 23, 2026', author: 'Quiz Master', excerpt: 'The current affairs quiz covered East African Community trade and climate policy.', img: IMAGES.campus },
    { id: 3, title: 'Guest speaker from Parliament shares path to public service', date: 'Aug 09, 2026', author: 'Secretary', excerpt: 'MP James Kalenzi spoke to 200 students about civic engagement and youth in democracy.', img: IMAGES.studentLife },
  ],
};

export const Route = createFileRoute('/clubs/$slug')({
  head: ({ params }) => ({
    meta: [{ title: params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Club — M.M College Wairaka' }],
  }),
  component: ClubDetailPage,
});

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}function getAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATARS[Math.abs(hash) % AVATARS.length];
}

function MemberAvatar({ person, size = 'md' }: { person: Person; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm';
  const img = person.img || getAvatar(person.name);
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm`}>
      <img src={img} alt={person.name} className='w-full h-full object-cover' loading='lazy' />
    </div>
  );
}

function ClubDetailPage() {
  const { slug } = Route.useParams();
  const club = CLUBS.find(c => c.slug === slug);
  const posts = CLUB_POSTS[slug] || [];
  const [showAllMembers, setShowAllMembers] = useState(false);

  if (!club) return <div className='py-20 text-center text-stone-500'>Club not found.</div>;

  const visibleMembers = showAllMembers ? club.members : club.members.slice(0, 8);

  return (
    <div>
      {/* 1. Hero with stat chips */}
      <section className='relative h-[50vh] min-h-[360px] flex items-end overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={club.img} alt={club.name} className='h-full w-full object-cover object-center' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
        </div>
        <div className='relative z-10 w-full max-w-6xl mx-auto px-6 pb-12'>
          <p className='text-xs font-semibold uppercase tracking-wider text-white/60 mb-2'>{club.tagline}</p>
          <h1 className='font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4'>{club.name}</h1>
          <div className='flex flex-wrap gap-3'>
            <span className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full'>
              <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' /></svg>
              {club.stats.members} members
            </span>
            <span className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full'>
              Est. {new Date().getFullYear() - club.stats.years}
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className='sticky top-0 z-20 bg-white border-b border-stone-200'>
        <div className='max-w-6xl mx-auto px-6 flex gap-6 py-3'>
          <Link to='/clubs' className='whitespace-nowrap text-sm font-medium text-stone-600 hover:text-green-800 transition-colors uppercase tracking-wider'>All Clubs</Link>
          <span className='text-sm font-medium text-green-800 uppercase tracking-wider'>{club.name}</span>
        </div>
      </nav>

      {/* 2. Overview */}
      <section className='py-16'>
        <div className='max-w-3xl mx-auto px-6 text-center'>
          <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>What We Stand For</p>
          <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>Our Mission</h2>
          <p className='text-stone-600 text-lg leading-relaxed font-body'>{club.overview}</p>
        </div>
      </section>

      {/* 3. Stats bar */}
      <section className='py-12 bg-green-900'>
        <div className='max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.members} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Active Members</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.events} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Events This Year</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.years} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Years Active</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.alumni} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Alumni Worldwide</p>
          </div>
        </div>
      </section>

      {/* 4. Leadership */}
      <section className='py-16'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Leadership</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>Who runs this club</h2>
          </div>

          {/* Patron */}
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4'>Patron</p>
            <div className='rounded-2xl bg-stone-50 border border-stone-200 p-6 flex items-center gap-5'>
              <MemberAvatar person={club.patron} size='md' />
              <div>
                <p className='font-display text-xl font-bold text-stone-900'>{club.patron.name}</p>
                <p className='text-sm text-stone-500'>{club.patron.role}</p>
                <p className='text-xs text-green-800 font-medium mt-1'>Patron since {club.patron.joined}</p>
              </div>
            </div>
          </div>

          {/* Executives */}
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4'>Executives</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {club.executives.map((ex) => (
                <div key={ex.name} className='rounded-2xl bg-white border border-stone-200 p-5 flex items-center gap-4'>
                  <MemberAvatar person={ex} size='md' />
                  <div>
                    <p className='font-display text-lg font-bold text-stone-900'>{ex.name}</p>
                    <p className='text-sm text-green-800 font-medium'>{ex.role}</p>
                    <p className='text-xs text-stone-400'>{ex.year} · Since {ex.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs font-semibold uppercase tracking-wider text-stone-500'>Members ({club.members.length})</p>
              {club.members.length > 8 && (
                <button onClick={() => setShowAllMembers(!showAllMembers)} className='text-sm font-semibold text-green-800 hover:underline'>
                  {showAllMembers ? 'Show less' : `View all ${club.members.length}`}
                </button>
              )}
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {visibleMembers.map((m) => (
                <div key={m.name} className='rounded-xl bg-white border border-stone-200 p-4 flex items-center gap-3'>
                  <MemberAvatar person={m} size='sm' />
                  <div className='min-w-0'>
                    <p className='text-sm font-bold text-stone-900 truncate'>{m.name}</p>
                    <p className='text-xs text-stone-400'>{m.year} · Since {m.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Updates */}
      <section className='py-16 bg-stone-50'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Latest Updates</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>What we have been up to</h2>
          </div>
          <div className='space-y-6'>
            {posts.map((post) => (
              <article key={post.id} className='group rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-md transition-shadow'>
                <div className='md:flex'>
                  <div className='md:w-1/3 relative overflow-hidden bg-gradient-to-br from-green-50 to-stone-100 flex flex-col items-center justify-center min-h-[12rem]'>
                    <svg className='w-10 h-10 text-green-800/30 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                    <span className='text-xs text-green-800/40 font-medium uppercase tracking-wider'>Photo coming soon</span>
                  </div>
                  <div className='md:w-2/3 p-6'>
                    <div className='flex items-center gap-3 mb-3'>
                      <span className='text-xs font-semibold text-green-800 uppercase tracking-wider'>{post.author}</span>
                      <span className='text-xs text-stone-400'>|</span>
                      <span className='text-xs text-stone-500'>{post.date}</span>
                    </div>
                    <h3 className='font-display text-xl font-bold text-stone-900 mb-2 group-hover:text-green-800 transition-colors'>{post.title}</h3>
                    <p className='text-stone-600 font-body leading-relaxed'>{post.excerpt}</p>
                    <span className='inline-flex items-center gap-1 mt-3 text-sm font-semibold text-green-800 group-hover:gap-2 transition-all'>Read more</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Activities sidebar (compact) */}
      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='rounded-2xl bg-stone-50 border border-stone-200 p-8'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-4'>Activities</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {club.activities.map((act) => (
                <div key={act} className='flex items-start gap-2'>
                  <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-green-800 shrink-0' />
                  <span className='text-stone-600 font-body'>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Compact 3-tier CTA */}
      <section className='py-12 border-t border-stone-200'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <a href='/admissions' className='group rounded-2xl bg-green-900 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-green-300'>For Students</span>
              <p className='font-display text-lg font-bold text-white mt-2 group-hover:underline'>Want to lead? Apply Now</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-white/70 group-hover:text-white transition-colors'>Apply <span>&rarr;</span></span>
            </a>
            <a href='/contact' className='group rounded-2xl bg-white border border-green-800 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-green-800'>For Alumni</span>
              <p className='font-display text-lg font-bold text-stone-900 mt-2 group-hover:underline'>Come back as a mentor</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-green-800/70 group-hover:text-green-800 transition-colors'>Get involved <span>&rarr;</span></span>
            </a>
            <a href='/giving' className='group rounded-2xl bg-amber-50 border border-amber-200 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-amber-700'>Sponsorship</span>
              <p className='font-display text-lg font-bold text-stone-900 mt-2 group-hover:underline'>Fund this club</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-amber-700/70 group-hover:text-amber-700 transition-colors'>Support <span>&rarr;</span></span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
