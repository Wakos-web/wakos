import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { IMAGES } from '@/lib/content';

const CLUBS = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', img: IMAGES.campus },
  { slug: 'arts-culture', name: 'Arts & Culture', tagline: 'Express. Create. Celebrate.', img: IMAGES.studentLife },
  { slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.', img: IMAGES.giving },
  { slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.', img: IMAGES.campus },
  { slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.', img: IMAGES.academics },
  { slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.', img: IMAGES.studentLife },
  { slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.', img: IMAGES.giving },
  { slug: "entertainment", name: "Entertainment Club", tagline: "Perform. Inspire. Entertain.", img: IMAGES.studentLife },
  { slug: "home-science", name: "Home Science Club", tagline: "Cook. Create. Care.", img: IMAGES.campus },
  { slug: "current-affairs", name: "Current Affairs Club", tagline: "Read. Discuss. Understand.", img: IMAGES.academics }
];
export const Route = createFileRoute('/clubs')({
  head: () => ({
    meta: [{ title: 'Clubs' },{ name: 'description', content: 'Student clubs and societies at M.M College Wairaka.' }],
    links: [{ rel: 'canonical', href: '/clubs' }],
  }),
  component: ClubsPage,
});

function HeroSection() {
  return (
    <section className='relative h-[50vh] min-h-[360px] flex items-end overflow-hidden'>
      <div className='absolute inset-0'>
        <img src={IMAGES.studentLife} alt='WACOS clubs' className='h-full w-full object-cover object-center' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
      </div>
      <div className='relative z-10 w-full max-w-6xl mx-auto px-6 pb-16'>
        <h1 className='font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4'>Clubs</h1>
        <p className='text-lg md:text-xl text-white/80 max-w-2xl font-body'>Lead, organise, and do. Every club is an opportunity to take responsibility.</p>
      </div>
    </section>
  );
}
function ClubsOverview() {
  return (
    <section className='py-20 bg-stone-50'>
      <div className='max-w-4xl mx-auto px-6'>
        <div className='text-center mb-12'>
          <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Why Clubs Matter</p>
          <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>Where tomorrow's leaders are shaped today</h2>
        </div>
        <div className='prose prose-lg prose-stone max-w-none font-body text-stone-700 leading-relaxed space-y-6'>
          <p>
            At Wairaka, education does not end when the last bell rings. Our clubs are where students learn to lead, organise, and solve real problems. Every club is run by students, for students. They elect their own leaders, plan their own activities, manage their own budgets, and present their own results. That is not extracurricular. That is preparation for life.
          </p>
          <p>
            Every club has a <strong>teacher patron</strong> who guides without controlling. The patron ensures continuity, connects the club to resources, and holds students accountable. But the direction belongs to the students. They own it. That ownership is what makes the difference.
          </p>
          <p>
            What makes Wairaka clubs unique is the <strong>alumni network</strong> that surrounds them. Former members come back. They mentor new recruits. They share what they learned. They fund activities. They show students that the skills they are building today, right now, in these clubs, are the same skills that built careers, businesses, and communities after Wairaka. That is not motivation. That is proof.
          </p>
          <p>
            A student who joins a club at Wairaka does not just join a group. They join a <strong>lineage</strong>. The Wildlife Club has produced conservationists. The Debate Club has produced lawyers and politicians. The Red Cross Club has produced healthcare workers. The Agriculture Club has produced agronomists and farm owners. The pattern is clear: <strong>what you do here shapes who you become</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

function ClubsGrid() {
  return (
    <section className='py-20'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {CLUBS.map((club) => (
            <Link key={club.slug} to='/clubs/$slug' params={{ slug: club.slug }} className='group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer'>
              <img src={club.img} alt={club.name} className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' loading='lazy' />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-6'>
                <p className='text-xs font-semibold uppercase tracking-wider text-white/70 mb-1'>{club.tagline}</p>
                <h2 className='font-display text-2xl text-white font-bold'>{club.name}</h2>
                <span className='inline-flex items-center gap-1 mt-3 text-sm text-white/80 group-hover:text-white transition-colors'>Learn more</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const STUDENT_VOICES = [
  {
    name: 'Nadia M., S4',
    club: 'Wildlife Club',
    quote: 'I never thought I would enjoy camping until Wildlife Club took us to Murchison. Now I want to study conservation.',
    type: 'image' as const,
    caption: 'Nadia during the Wildlife Club camping expedition to Murchison Falls National Park',
  },
  {
    name: 'Brian K., S5',
    club: 'Debate Club',
    quote: 'Debate taught me to think before I speak. My teachers say I am a different student now.',
    type: 'video' as const,
    caption: 'Brian presenting at the Eastern Regional Debate Championships',
  },
  {
    name: 'Sarah N., S3',
    club: 'Red Cross Club',
    quote: 'When we did the blood drive, I realised I could help save lives while still in school. That changed everything for me.',
    type: 'image' as const,
    caption: 'Sarah and fellow Red Cross volunteers during the annual blood drive',
  },
  {
    name: 'David O., S6',
    club: 'Entertainment Club',
    quote: 'The talent show was the first time I performed on stage. Three hundred people watched. I was terrified. I loved every second.',
    type: 'video' as const,
    caption: 'David performing at the sold-out Entertainment Club talent show',
  },
];

function StudentVoices() {
  return (
    <section className='py-20 bg-stone-50'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='text-center mb-12'>
          <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Student Voices</p>
          <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>Hear from the students themselves</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {STUDENT_VOICES.map((voice, i) => (
            <div key={i} className='rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgb(0,77,0,0.12)] transition-shadow'>
              {/* 3D Bubble Frame Placeholder */}
              <div className='relative mx-6 mt-6 rounded-2xl overflow-hidden'
                style={{
                  boxShadow: '0 12px 40px -8px rgba(0,77,0,0.25), 0 4px 12px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 6px rgba(0,77,0,0.08)',
                  transform: 'perspective(800px) rotateX(2deg)',
                  transformOrigin: 'center bottom',
                }}>
                <div className='aspect-video bg-gradient-to-br from-green-50 via-stone-100 to-green-100 flex flex-col items-center justify-center relative'>
                  {/* Bubble shine effect */}
                  <div className='absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl' />
                  {voice.type === 'video' ? (
                    <>
                      <div className='relative z-10 w-16 h-16 rounded-full bg-green-800/90 flex items-center justify-center shadow-lg backdrop-blur-sm'>
                        <svg className='w-6 h-6 text-white ml-1' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'/></svg>
                      </div>
                      <p className='relative z-10 mt-3 text-xs font-semibold uppercase tracking-wider text-green-800/70'>Video placeholder</p>
                    </>
                  ) : (
                    <>
                      <svg className='relative z-10 w-12 h-12 text-green-800/30' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z' />
                      </svg>
                      <p className='relative z-10 mt-3 text-xs font-semibold uppercase tracking-wider text-green-800/70'>Photo placeholder</p>
                    </>
                  )}
                </div>
              </div>
              {/* Caption */}
              <div className='px-6 pt-3'>
                <p className='text-xs text-stone-400 italic'>{voice.caption}</p>
              </div>
              {/* Quote */}
              <div className='p-6 pt-4'>
                <div className='flex items-start gap-3'>
                  <svg className='w-8 h-8 text-green-800/20 shrink-0 mt-1' fill='currentColor' viewBox='0 0 24 24'><path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z'/></svg>
                  <div>
                    <p className='text-stone-700 font-body leading-relaxed italic'>{voice.quote}</p>
                    <div className='mt-4 flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center'>
                        <span className='text-sm font-bold text-green-800'>{voice.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className='text-sm font-bold text-stone-900'>{voice.name}</p>
                        <p className='text-xs text-stone-500'>{voice.club}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className='bg-green-900 py-16'>
      <div className='max-w-4xl mx-auto px-6 text-center'>
        <h2 className='font-display text-3xl md:text-4xl text-white font-bold mb-4'>Find your club</h2>
        <p className='text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body'>Join a club, lead a project, and discover what you are capable of.</p>
        <a href='/admissions' className='inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors'>Apply Now</a>
      </div>
    </section>
  );
}

function ClubsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === '/clubs';
  return (
    <div>
      {isRoot && (
        <>
          <HeroSection />
          <ClubsOverview />
          <ClubsGrid />
          <StudentVoices />
          <CTASection />
        </>
      )}
      <Outlet />
    </div>
  );
}