import { createFileRoute, Link } from '@tanstack/react-router';
import { IMAGES } from '@/lib/content';

const CLUBS = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', desc: 'The Wildlife Club connects students with Uganda rich biodiversity. Members participate in nature walks, wildlife surveys, and conservation campaigns. The club fosters awareness of environmental stewardship and the importance of protecting local ecosystems around the Busoga region.', activities: ['Nature walks and wildlife surveys', 'Conservation campaigns in local communities', 'Tree planting drives', 'Guest speakers from Uganda Wildlife Authority'], img: IMAGES.campus },
  { slug: 'arts-culture', name: 'Arts & Culture Club', tagline: 'Express. Create. Celebrate.', desc: 'The Arts & Culture Club is the creative heartbeat of WACOS. Members explore traditional Busoga dance, music, drama, and visual arts. The club performs at school events, inter-school competitions, and community celebrations.', activities: ['Traditional dance and music performances', 'Drama productions and inter-school competitions', 'Visual arts exhibitions', 'Cultural heritage awareness'], img: IMAGES.studentLife },
  { slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.', desc: 'Scouts and Girl Guides build leadership, service, and resilience through structured programmes. Members develop outdoor skills, community awareness, and the discipline to serve others.', activities: ['Outdoor survival and camping skills', 'Community service projects', 'Leadership training', 'First aid certification'], img: IMAGES.giving },
  { slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.', desc: 'Running the school nursery and farm, the Agriculture Club is central to WACOS identity. Students grow seedlings from seed, manage crops, and learn practical agricultural skills. The club supplied 4,000 seedlings for the community reforestation drive.', activities: ['School nursery and farm management', 'Seedling production for community outreach', 'Crop rotation and soil management', 'Agricultural science experiments'], img: IMAGES.campus },
  { slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.', desc: 'The Debate Club sharpens critical thinking and public speaking. Students research, construct arguments, and compete in inter-school tournaments.', activities: ['Weekly practice sessions', 'Inter-school debate tournaments', 'Public speaking workshops', 'Model United Nations simulations'], img: IMAGES.academics },
  { slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.', desc: 'The Writers Club nurtures a love of language. Members write poetry, short stories, essays, and journalism. The club produces the school magazine.', activities: ['School magazine production', 'Creative writing workshops', 'Poetry slams and open mic events', 'Journalism and reporting'], img: IMAGES.studentLife },
  { slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.', desc: 'The Red Cross Club teaches students the principles of humanitarian service. Members learn first aid, disaster preparedness, and health education.', activities: ['First aid training and certification', 'Blood donation drives', 'Health education campaigns', 'Disaster preparedness workshops'], img: IMAGES.giving },
];

export const Route = createFileRoute('/clubs/$slug')({
  head: ({ params }) => ({
    meta: [{ title: params.slug + ' Club' }],
  }),
  component: ClubDetailPage,
});

function ClubDetailPage() {
  const { slug } = Route.useParams();
  const club = CLUBS.find(c => c.slug === slug);
  if (!club) return <div className='py-20 text-center text-stone-500'>Club not found.</div>;
  return (
    <div>
      <section className='relative h-[50vh] min-h-[360px] flex items-end overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={club.img} alt={club.name} className='h-full w-full object-cover object-center' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
        </div>
        <div className='relative z-10 w-full max-w-6xl mx-auto px-6 pb-16'>
          <p className='text-xs font-semibold uppercase tracking-wider text-white/70 mb-2'>{club.tagline}</p>
          <h1 className='font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4'>{club.name}</h1>
        </div>
      </section>

      <nav className='sticky top-0 z-20 bg-white border-b border-stone-200'>
        <div className='max-w-6xl mx-auto px-6 flex gap-6 py-3'>
          <Link to='/clubs' className='whitespace-nowrap text-sm font-medium text-stone-600 hover:text-green-800 transition-colors uppercase tracking-wider'>All Clubs</Link>
          <span className='text-sm font-medium text-green-800 uppercase tracking-wider'>{club.name}</span>
        </div>
      </nav>

      <section className='py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
            <div>
              <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>About</p>
              <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>{club.name}</h2>
              <p className='text-stone-600 text-lg leading-relaxed font-body'>{club.desc}</p>
            </div>
            <div>
              <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Activities</p>
              <div className='space-y-4'>
                {club.activities.map((act) => (
                  <div key={act} className='flex items-start gap-3'>
                    <span className='mt-1 w-2 h-2 rounded-full bg-green-800 shrink-0' />
                    <p className='text-stone-600 text-lg font-body'>{act}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='bg-green-900 py-16'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <h2 className='font-display text-3xl text-white font-bold mb-4'>Want to join {club.name}?</h2>
          <p className='text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body'>Apply to M.M College Wairaka and get involved from day one.</p>
          <a href='/admissions' className='inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors'>Apply Now</a>
        </div>
      </section>
    </div>
  );
}