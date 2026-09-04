import { createFileRoute } from '@tanstack/react-router';
import { IMAGES, SCHOOL_NAME } from '@/lib/content';

export const Route = createFileRoute('/alumni')({
  head: () => ({
    meta: [{ title: 'Alumni ,  M.M College Wairaka' },{ name: 'description', content: 'Reconnect with WACOS. MMCWOSA, the Trust Fund, and 73 years of alumni who keep the college alive.' }],
    links: [{ rel: 'canonical', href: '/alumni' }],
  }),
  component: AlumniPage,
});

const NAV = [
  { title: 'Connect', desc: 'Reconnect with old classmates and the college community.', href: '#connect' },
  { title: 'Support Wairaka', desc: 'Contribute to the Trust Fund and help rebuild the college.', href: '#support' },
  { title: 'Events', desc: 'Annual homecoming, reunions, and alumni gatherings.', href: '#events' },
  { title: 'MMCWOSA', desc: 'The M.M. College Wairaka Old Students Association.', href: '#mmcwosa' },
  { title: 'Trust Fund', desc: 'The Wairaka Trust Fund supporting infrastructure and development.', href: '#trust' },
  { title: 'Directory', desc: 'Find and connect with fellow old students.', href: '#directory' },
];

const FEATURED = [
  { name: 'Joshua Cheptegei', role: 'Olympic Gold Medallist & World Champion', desc: 'Came to WACOS on a sports scholarship. Became one of Uganda most successful international distance runners. Olympic gold. World champion. Pillar Honour recipient. WACOS made him. He made WACOS proud.', img: IMAGES.athletics },
  { name: 'Faith Alupo', role: 'Woman MP, Pallisa District', desc: 'Studied at WACOS, graduated 2003. Became Member of Parliament for Pallisa District. The discipline and hard work she learned at WACOS prepared her for public service.', img: IMAGES.studentLife },
];
function HeroSection() {
  return (
    <section className='relative h-[50vh] min-h-[360px] flex items-end overflow-hidden'>
      <div className='absolute inset-0'>
        <img src={IMAGES.giving} alt='WACOS alumni' className='h-full w-full object-cover object-center' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
      </div>
      <div className='relative z-10 w-full max-w-6xl mx-auto px-6 pb-16'>
        <h1 className='font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4'>Alumni</h1>
        <p className='text-lg md:text-xl text-white/80 max-w-2xl font-body'>You built this school with your fees, your labour, your sacrifice. Now it is time to come home. Over seven decades of graduates, one community.</p>
      </div>
    </section>
  );
}

function NavCards() {
  return (
    <section className='py-12 bg-white border-b border-stone-200'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {NAV.map((item) => (
            <a key={item.title} href={item.href} className='group rounded-2xl bg-stone-50 border border-stone-200 p-6 hover:border-green-800 hover:shadow-md transition-all'>
              <h3 className='font-display text-lg font-bold text-stone-900 group-hover:text-green-800 transition-colors mb-2'>{item.title}</h3>
              <p className='text-sm text-stone-500 font-body'>{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
function FeaturedAlumni() {
  return (
    <section id='connect' className='py-20'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='text-center mb-12'>
          <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Notable Alumni</p>
          <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>From Wairaka to the World</h2>
        </div>
        <div className='space-y-12'>
          {FEATURED.map((person, i) => (
            <div key={person.name} className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div className='relative overflow-hidden rounded-2xl aspect-[4/3]'>
                <img src={person.img} alt={person.name} className='absolute inset-0 h-full w-full object-cover' loading='lazy' />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                <div className='absolute bottom-0 left-0 p-6'>
                  <p className='text-xs font-semibold uppercase tracking-wider text-white/70'>{person.role}</p>
                </div>
              </div>
              <div className='flex flex-col justify-center'>
                <h3 className='font-display text-2xl md:text-3xl text-stone-900 font-bold mb-4'>{person.name}</h3>
                <p className='text-stone-600 text-lg leading-relaxed font-body'>{person.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}function MMCWOSASection() {
  return (
    <section id='mmcwosa' className='py-20 bg-stone-50'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Alumni Association</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>MMCWOSA</h2>
            <p className='text-stone-600 text-lg leading-relaxed font-body mb-4'>MMCWOSA is more than an alumni association. It is the engine behind the college revival. When the labs needed renovation, alumni did it. When students needed bursaries, alumni funded them. This is what "We Do It Ourselves" means ,  even after you leave.</p>
            <p className='text-stone-600 text-lg leading-relaxed font-body mb-4'>Every October, old students return to Wairaka. They encourage current students, reconnect with staff, and prove that the WACOS bond does not expire. Will you be there this year?</p>
            <p className='text-stone-600 text-lg leading-relaxed font-body'>MMCWOSA also created the Wairaka Business Directory, a marketing platform where former students can market their products, services, and businesses to one another and the wider public.</p>
          </div>
          <div className='relative overflow-hidden rounded-2xl aspect-[4/3]'>
            <img src={IMAGES.campus} alt='MMCWOSA alumni gathering' className='absolute inset-0 h-full w-full object-cover' loading='lazy' />
            <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
            <div className='absolute bottom-0 left-0 p-6'>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/70'>Community</p>
              <p className='mt-1 font-display text-lg font-semibold text-white'>Old students return every October</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}function TrustFundSection() {
  return (
    <section id='trust' className='py-20'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='relative overflow-hidden rounded-2xl aspect-[4/3] order-2 lg:order-1'>
            <img src={IMAGES.giving} alt='Wairaka Trust Fund projects' className='absolute inset-0 h-full w-full object-cover' loading='lazy' />
            <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
            <div className='absolute bottom-0 left-0 p-6'>
              <p className='text-xs font-semibold uppercase tracking-wider text-white/70'>Infrastructure</p>
              <p className='mt-1 font-display text-lg font-semibold text-white'>Physics, Chemistry labs renovated</p>
            </div>
          </div>
          <div className='order-1 lg:order-2'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Support Wairaka</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>Wairaka Trust Fund</h2>
            <p className='text-stone-600 text-lg leading-relaxed font-body mb-4'>Launched in 2020, the Wairaka Trust Fund was created because alumni refused to let their school deteriorate. The minimum contribution is UGX 10,000 per month ,  less than a phone bill. Already, the fund has renovated two laboratories. Your contribution continues the work.</p>
            <p className='text-stone-600 text-lg leading-relaxed font-body mb-4'>The fund has already supported the renovation of the Physics Laboratory, Chemistry Laboratory, and student washrooms. Every contribution goes directly to rebuilding the college.</p>
            <div className='grid grid-cols-3 gap-4 mt-8'>
              <div className='rounded-xl bg-stone-50 border border-stone-200 p-4 text-center'>
                <p className='font-display text-2xl font-bold text-green-800'>2020</p>
                <p className='text-xs text-stone-500'>Trust Fund launched</p>
              </div>
              <div className='rounded-xl bg-stone-50 border border-stone-200 p-4 text-center'>
                <p className='font-display text-2xl font-bold text-green-800'>10K</p>
                <p className='text-xs text-stone-500'>UGX per member monthly</p>
              </div>
              <div className='rounded-xl bg-stone-50 border border-stone-200 p-4 text-center'>
                <p className='font-display text-2xl font-bold text-green-800'>3</p>
                <p className='text-xs text-stone-500'>Facilities renovated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}function EventsSection() {
  return (
    <section id="events" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Events</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Come Home to Wairaka</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-8 border border-stone-200">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-2">Annual</p>
            <h3 className="font-display text-xl font-bold text-stone-900 mb-3">Alumni Homecoming</h3>
            <p className="text-stone-600 font-body leading-relaxed">Every October, the gates open and old students come home. This is not just a reunion ,  it is a reminder of what WACOS gave you and what you can give back.</p>
            <p className="text-sm text-stone-400 mt-4">October annually</p>
          </div>
          <div className="rounded-2xl bg-white p-8 border border-stone-200">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-2">Ongoing</p>
            <h3 className="font-display text-xl font-bold text-stone-900 mb-3">Business Directory</h3>
            <p className="text-stone-600 font-body leading-relaxed">The Wairaka Business Directory provides a marketing platform for former students to promote their products and services to one another and the wider public.</p>
            <p className="text-sm text-stone-400 mt-4">Open to all alumni</p>
          </div>
        </div>
      </div>
    </section>
  );
}function DirectorySection() {
  return (
    <section id="directory" className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Directory</p>
        <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6">Find Fellow Old Students</h2>
        <p className="text-stone-600 text-lg font-body max-w-2xl mx-auto mb-8">The Wairaka Business Directory connects alumni with each other and with the wider public. Find a former classmate. Promote your business. Stay connected to the community that shaped you.</p>
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-12">
          <p className="text-stone-400 font-body">The alumni directory is coming soon. Stay connected through MMCWOSA for updates.</p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Stay Connected</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">The school you attended is being rebuilt ,  by alumni who remember what it gave them. Join MMCWOSA, contribute to the Trust Fund, and help rebuild the college that made you who you are.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/giving" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Support Wairaka</a>
          <a href="/contact" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Contact Us</a>
        </div>
      </div>
    </section>
  );
}

function AlumniPage() {
  return (
    <div>
      <HeroSection />
      <NavCards />
      <FeaturedAlumni />
      <MMCWOSASection />
      <TrustFundSection />
      <EventsSection />
      <DirectorySection />
      <CTASection />
    </div>
  );
}