import { createFileRoute, Link } from '@tanstack/react-router';
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
function ClubsGrid() {
  return (
    <section className='py-20'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {CLUBS.map((club) => (
            <Link key={club.slug} to={'/clubs/' as any} params={{ slug: club.slug }} className='group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer'>
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
  return (
    <div>
      <HeroSection />
      <ClubsGrid />
      <CTASection />
    </div>
  );
}