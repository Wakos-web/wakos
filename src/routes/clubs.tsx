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
const STUDENT_VOICES = [
  {
    name: 'Nadia M., S4',
    club: 'Wildlife Club',
    quote: 'I never thought I would enjoy camping until Wildlife Club took us to Murchison. Now I want to study conservation.',
    type: 'image' as const,
  },
  {
    name: 'Brian K., S5',
    club: 'Debate Club',
    quote: 'Debate taught me to think before I speak. My teachers say I am a different student now.',
    type: 'video' as const,
  },
  {
    name: 'Sarah N., S3',
    club: 'Red Cross Club',
    quote: 'When we did the blood drive, I realised I could help save lives while still in school. That changed everything for me.',
    type: 'image' as const,
  },
  {
    name: 'David O., S6',
    club: 'Entertainment Club',
    quote: 'The talent show was the first time I performed on stage. Three hundred people watched. I was terrified. I loved every second.',
    type: 'video' as const,
  },
];

function ChatBubble({ voice, align }: { voice: typeof STUDENT_VOICES[0]; align: 'left' | 'right' }) {
  const isRight = align === 'right';
  return (
    <div className={`flex ${isRight ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 mb-4`}>
      {/* Avatar */}
      <div className='w-10 h-10 rounded-full bg-green-800 flex items-center justify-center shrink-0 shadow-md'>
        <span className='text-sm font-bold text-white'>{voice.name.charAt(0)}</span>
      </div>
      {/* Chat bubble */}
      <div className={`relative max-w-[280px] ${isRight ? 'mr-1' : 'ml-1'}`}>
        {/* Bubble tail */}
        <div
          className={`absolute bottom-0 w-4 h-4 bg-white border-b border-stone-200 ${isRight ? 'right-[-7px] border-r rounded-bl-lg' : 'left-[-7px] border-l rounded-br-lg'}`}
          style={{ clipPath: isRight ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(100% 0, 100% 100%, 0 0)' }}
        />
        <div className='relative bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-[0_4px_16px_rgb(0,0,0,0.06)]'>
          <p className='text-stone-700 font-body text-sm leading-relaxed italic'>{voice.quote}</p>
          <div className='mt-3 flex items-center gap-2'>
            <span className='text-xs font-bold text-green-800'>{voice.name}</span>
            <span className='text-xs text-stone-400'>\u00b7</span>
            <span className='text-xs text-stone-400'>{voice.club}</span>
          </div>
          {/* Media placeholder icon */}
          <div className='mt-3 rounded-xl bg-gradient-to-br from-green-50 via-stone-50 to-green-50 h-20 flex items-center justify-center border border-stone-100'>
            {voice.type === 'video' ? (
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-green-800/80 flex items-center justify-center'>
                  <svg className='w-3 h-3 text-white ml-0.5' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'/></svg>
                </div>
                <span className='text-xs text-green-800/60 font-medium'>Video</span>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5 text-green-800/30' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z' />
                </svg>
                <span className='text-xs text-green-800/60 font-medium'>Photo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClubsOverview() {
  return (
    <section className='py-20 bg-stone-50'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
          {/* Left: Overview text */}
          <div>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Why Clubs Matter</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>Where tomorrow's leaders are shaped today</h2>
            <div className='font-body text-stone-700 leading-relaxed space-y-5'>
              <p>At Wairaka, education does not end when the last bell rings. Our clubs are where students learn to lead, organise, and solve real problems. Every club is run by students, for students. They elect their own leaders, plan their own activities, manage their own budgets, and present their own results. That is not extracurricular. That is preparation for life.</p>
              <p>Every club has a <strong>teacher patron</strong> who guides without controlling. The patron ensures continuity, connects the club to resources, and holds students accountable. But the direction belongs to the students. They own it. That ownership is what makes the difference.</p>
              <p>What makes Wairaka clubs unique is the <strong>alumni network</strong> that surrounds them. Former members come back. They mentor new recruits. They share what they learned. They fund activities. They show students that the skills they are building today are the same skills that built careers, businesses, and communities after Wairaka.</p>
              <p>A student who joins a club at Wairaka does not just join a group. They join a <strong>lineage</strong>. The Wildlife Club has produced conservationists. The Debate Club has produced lawyers. The Red Cross Club has produced healthcare workers. <strong>What you do here shapes who you become</strong>.</p>
            </div>
          </div>
          {/* Right: Chat bubbles */}
          <div className='lg:sticky lg:top-24'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Student Voices</p>
            <h3 className='font-display text-xl text-stone-900 font-bold mb-6'>Hear from the students themselves</h3>
            <div className='space-y-2'>
              {STUDENT_VOICES.map((voice, i) => (
                <ChatBubble key={i} voice={voice} align={i % 2 === 0 ? 'left' : 'right'} />
              ))}
            </div>
          </div>
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
        </>
      )}
      <Outlet />
    </div>
  );
}