import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
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

const CLUBS = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', imgs: [campusImg, athleticsImg, newsServiceImg] },
  { slug: 'arts-culture', name: 'Arts & Culture', tagline: 'Express. Create. Celebrate.', imgs: [studentLifeImg, campusImg, givingImg] },
  { slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.', imgs: [givingImg, athleticsImg, newsServiceImg] },
  { slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.', imgs: [campusImg, studentLifeImg, newsServiceImg] },
  { slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.', imgs: [academicsImg, campusImg, studentLifeImg] },
  { slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.', imgs: [studentLifeImg, academicsImg, campusImg] },
  { slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.', imgs: [givingImg, newsServiceImg, athleticsImg] },
  { slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.', imgs: [studentLifeImg, newsBasketballImg, campusImg] },
  { slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.', imgs: [campusImg, givingImg, academicsImg] },
  { slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.', imgs: [academicsImg, newsGraduationImg, studentLifeImg] },
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
    img: campusImg,
  },
  {
    name: 'Brian K., S5',
    club: 'Debate Club',
    quote: 'Debate taught me to think before I speak. My teachers say I am a different student now.',
    type: 'video' as const,
    img: academicsImg,
  },
  {
    name: 'Sarah N., S3',
    club: 'Red Cross Club',
    quote: 'When we did the blood drive, I realised I could help save lives while still in school. That changed everything for me.',
    type: 'image' as const,
    img: newsServiceImg,
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
          {/* Media */}
          <div className='mt-3 rounded-xl overflow-hidden relative h-24 border border-stone-100'>
            <img src={voice.img} alt={voice.club + ' activity'} className='w-full h-full object-cover' loading='lazy' />
            {voice.type === 'video' && (
              <div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
                <div className='w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg'>
                  <svg className='w-4 h-4 text-green-900 ml-0.5' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'/></svg>
                </div>
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

function OrbCarousel({ imgs, name }: { imgs: string[]; name: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % imgs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [imgs.length]);

  return (
    <div className='absolute inset-0 flex items-center justify-center overflow-hidden'>
      {/* Background glow */}
      <div className='absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/90 to-stone-900/95' />

      {/* Orbit ring (subtle) */}
      <div className='absolute w-[65%] h-[65%] rounded-full border border-white/10' />

      {/* Main orb (large, centered) */}
      <div className='relative w-[50%] aspect-square rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.12),0_0_60px_rgba(0,77,0,0.25)] transition-all duration-700'
        style={{ transform: 'scale(1)' }}>
        {imgs.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            loading='lazy'
          />
        ))}
        {/* Shine effect */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none' />
      </div>

      {/* Satellite orbs (small, orbiting) */}
      {imgs.map((img, i) => {
        if (i === current) return null;
        const angle = i * (360 / imgs.length) + (current * 120);
        const rad = (angle * Math.PI) / 180;
        const radius = 42;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={i}
            className='absolute w-[18%] aspect-square rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-700'
            style={{
              transform: `translate(${x}%, ${y}%) scale(0.85)`,
              opacity: 0.7,
            }}>
            <img src={img} alt={name} className='w-full h-full object-cover' loading='lazy' />
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none' />
          </div>
        );
      })}

      {/* Dot indicators */}
      <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10'>
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2 hover:bg-white/60'}`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ClubsGrid() {
  return (
    <section className='py-12'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
          {CLUBS.map((club) => (
            <Link key={club.slug} to='/clubs/$slug' params={{ slug: club.slug }} className='group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer'>
              <OrbCarousel imgs={club.imgs} name={club.name} />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10' />
              <div className='absolute bottom-0 left-0 right-0 p-3 z-10'>
                <p className='text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-0.5'>{club.tagline}</p>
                <h2 className='font-display text-sm text-white font-bold leading-tight'>{club.name}</h2>
                <span className='inline-flex items-center gap-1 mt-2 text-xs text-white/80 group-hover:text-white transition-colors'>Learn more</span>
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