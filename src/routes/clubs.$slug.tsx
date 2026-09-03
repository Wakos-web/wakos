import { createFileRoute, Link } from '@tanstack/react-router';
import { IMAGES } from '@/lib/content';

const CLUBS = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', desc: 'The Wildlife Club connects students with Uganda rich biodiversity. Members participate in nature walks, wildlife surveys, and conservation campaigns.', activities: ['Nature walks and wildlife surveys', 'Conservation campaigns in local communities', 'Tree planting drives', 'Guest speakers from Uganda Wildlife Authority'], img: IMAGES.campus },
  { slug: 'arts-culture', name: 'Arts & Culture Club', tagline: 'Express. Create. Celebrate.', desc: 'The Arts & Culture Club is the creative heartbeat of WACOS. Members explore traditional Busoga dance, music, drama, and visual arts.', activities: ['Traditional dance and music performances', 'Drama productions and inter-school competitions', 'Visual arts exhibitions', 'Cultural heritage awareness'], img: IMAGES.studentLife },
  { slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.', desc: 'Scouts and Girl Guides build leadership, service, and resilience through structured programmes.', activities: ['Outdoor survival and camping skills', 'Community service projects', 'Leadership training', 'First aid certification'], img: IMAGES.giving },
  { slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.', desc: 'Running the school nursery and farm, the Agriculture Club is central to WACOS identity. Students grow seedlings from seed and manage crops.', activities: ['School nursery and farm management', 'Seedling production for community outreach', 'Crop rotation and soil management', 'Agricultural science experiments'], img: IMAGES.campus },
  { slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.', desc: 'The Debate Club sharpens critical thinking and public speaking. Students research, construct arguments, and compete in inter-school tournaments.', activities: ['Weekly practice sessions', 'Inter-school debate tournaments', 'Public speaking workshops', 'Model United Nations simulations'], img: IMAGES.academics },
  { slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.', desc: 'The Writers Club nurtures a love of language. Members write poetry, short stories, essays, and journalism.', activities: ['School magazine production', 'Creative writing workshops', 'Poetry slams and open mic events', 'Journalism and reporting'], img: IMAGES.studentLife },
  { slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.', desc: 'The Red Cross Club teaches students the principles of humanitarian service. Members learn first aid, disaster preparedness, and health education.', activities: ['First aid training and certification', 'Blood donation drives', 'Health education campaigns', 'Disaster preparedness workshops'], img: IMAGES.giving },
  { slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.', desc: 'The Entertainment Club is where talent meets stage. Members organise talent shows, music performances, comedy nights, and cultural events.', activities: ['Talent shows and open mic nights', 'Music and dance performances', 'Comedy and drama sketches', 'Event planning and MC duties'], img: IMAGES.studentLife },
  { slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.', desc: 'The Home Science Club teaches practical life skills including cooking, nutrition, textiles, and household management.', activities: ['Cooking and nutrition workshops', 'Textile and fashion design', 'Food preservation techniques', 'Health and hygiene education'], img: IMAGES.campus },
  { slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.', desc: 'The Current Affairs Club keeps students informed about national and global events. Members discuss politics, economics, science, and social issues.', activities: ['Weekly news discussion sessions', 'Mock parliament and governance simulations', 'Guest speakers and panels', 'Model African Union and UN programmes'], img: IMAGES.academics },
];

const SAMPLE_POSTS = [
  { id: 1, title: 'Club kicks off the new term with exciting plans', date: 'Sep 01, 2026', author: 'Club Chairperson', excerpt: 'Members gathered at the start of term to outline activities, elect leaders, and set goals for the year ahead.', img: IMAGES.campus },
  { id: 2, title: 'Weekly meeting highlights and key takeaways', date: 'Aug 25, 2026', author: 'Secretary', excerpt: 'This week members explored new techniques, shared ideas, and practised skills that will be showcased at the upcoming inter-school event.', img: IMAGES.studentLife },
  { id: 3, title: 'Photo gallery from last month field activity', date: 'Aug 12, 2026', author: 'Media Team', excerpt: 'A visual recap of our recent outing where members put theory into practice and engaged with the local community.', img: IMAGES.giving },
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
      <section className='py-12'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
            <div className='lg:col-span-2'>
              <h2 className='font-display text-2xl font-bold text-stone-900 mb-6'>Latest Updates</h2>
              <div className='space-y-8'>
                {SAMPLE_POSTS.map((post) => (
                  <article key={post.id} className='group rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow'>
                    <div className='md:flex'>
                      <div className='md:w-1/3 relative overflow-hidden'>
                        <img src={post.img} alt={post.title} className='h-48 md:h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' loading='lazy' />
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
              <div className='mt-8 text-center'>
                <p className='text-stone-400 text-sm'>More posts coming soon. Club members will be able to publish updates directly.</p>
              </div>
            </div>
            <aside className='lg:col-span-1'>
              <div className='sticky top-20 space-y-6'>
                <div className='rounded-2xl bg-stone-50 border border-stone-200 p-6'>
                  <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>About</p>
                  <p className='text-stone-600 font-body leading-relaxed'>{club.desc}</p>
                </div>

                <div className='rounded-2xl bg-stone-50 border border-stone-200 p-6'>
                  <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Activities</p>
                  <ul className='space-y-3'>
                    {club.activities.map((act) => (
                      <li key={act} className='flex items-start gap-2'>
                        <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-green-800 shrink-0' />
                        <span className='text-stone-600 text-sm font-body'>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='rounded-2xl bg-green-900 p-6 text-center'>
                  <p className='text-white font-display text-lg font-bold mb-2'>Want to join?</p>
                  <p className='text-white/70 text-sm mb-4 font-body'>Apply to M.M College Wairaka and get involved from day one.</p>
                  <a href='/admissions' className='inline-block bg-white text-green-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-stone-100 transition-colors'>Apply Now</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}