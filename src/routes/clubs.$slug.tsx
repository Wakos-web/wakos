import { createFileRoute, Link } from '@tanstack/react-router';
import { IMAGES } from '@/lib/content';

const CLUBS = [
  { slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.', desc: 'The Wildlife Club connects students with Uganda\'s rich biodiversity. Members participate in nature walks, wildlife surveys, and conservation campaigns.', activities: ['Nature walks and wildlife surveys', 'Conservation campaigns in local communities', 'Tree planting drives', 'Guest speakers from Uganda Wildlife Authority'], img: IMAGES.campus },
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

type ClubPost = { id: number; title: string; date: string; author: string; excerpt: string; img: string };

const CLUB_POSTS: Record<string, ClubPost[]> = {
  wildlife: [
    { id: 1, title: 'Nature walk reveals rare butterfly species on campus', date: 'Sep 01, 2026', author: 'Club Chairperson', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority for their butterfly atlas.', img: IMAGES.campus },
    { id: 2, title: 'Tree planting drive targets 500 seedlings along Jinja road', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary. Species included mahogany, finding, and fruit trees to create a living corridor for birds and insects.', img: IMAGES.studentLife },
    { id: 3, title: 'Guest lecture from UWA ranger on elephant corridor conservation', date: 'Aug 05, 2026', author: 'Secretary', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected. Students asked questions about human-wildlife conflict and learned about career paths in conservation.', img: IMAGES.giving },
  ],
  'arts-culture': [
    { id: 1, title: 'Busoga cultural night draws record attendance', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Over 300 students and parents attended our annual cultural night. Performances included traditional Busoga dance, Lusoga poetry, and a drama piece about the founding of WACOS in 1953.', img: IMAGES.studentLife },
    { id: 2, title: 'Drama team wins best ensemble at Jinja regional festival', date: 'Aug 18, 2026', author: 'Drama Captain', excerpt: 'Our five-member drama team took the best ensemble award at the Busoga region arts festival. The judges praised the group\'s use of Lusoga dialogue and original choreography.', img: IMAGES.campus },
    { id: 3, title: 'Visual arts exhibition opens in the school library', date: 'Aug 01, 2026', author: 'Arts Prefect', excerpt: 'Twelve students displayed paintings, charcoal drawings, and mixed-media pieces exploring themes of identity, community, and environmental stewardship. The exhibition runs through September.', img: IMAGES.giving },
  ],
  'scouts-guides': [
    { id: 1, title: 'Annual camping expedition heads to Source of the Nile', date: 'Sep 05, 2026', author: 'Scout Master', excerpt: 'Forty scouts and guides set off for a three-day expedition at the Source of the Nile. Activities included campfire cooking, orienteering, and a community clean-up at Bujagali.', img: IMAGES.giving },
    { id: 2, title: 'First aid certification training completes for 60 students', date: 'Aug 22, 2026', author: 'Patron', excerpt: 'In partnership with the Red Cross, 60 scouts and guides completed a two-day first aid certification course. Skills covered wound care, CPR, and emergency response protocols.', img: IMAGES.studentLife },
    { id: 3, title: 'Guides lead community clean-up in Wairaka trading centre', date: 'Aug 08, 2026', author: 'Guide Captain', excerpt: 'Twenty-five Girl Guides spent Saturday morning clearing drainage and collecting litter in the Wairaka trading centre. Local leaders praised the initiative and pledged continued support.', img: IMAGES.campus },
  ],
  agriculture: [
    { id: 1, title: 'School nursery distributes 2,000 seedlings to Wairaka families', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The Agriculture Club distributed 2,000 fruit and timber seedlings grown in the school nursery. Each family received mango, avocado, and mahogany seedlings as part of our community reforestation drive.', img: IMAGES.campus },
    { id: 2, title: 'Students harvest first crop from drip irrigation demo plot', date: 'Aug 15, 2026', author: 'Patron', excerpt: 'The club\'s drip irrigation demo plot produced its first harvest of tomatoes and sukuma wiki. The system, funded by the alumni trust, demonstrates water-efficient farming for semi-arid areas.', img: IMAGES.studentLife },
    { id: 3, title: 'Agriculture students attend Jinja district farming expo', date: 'Aug 03, 2026', author: 'Secretary', excerpt: 'Fifteen club members attended the annual Jinja District Agricultural Expo. Students learned about modern farming techniques, visited livestock displays, and met with agricultural officers.', img: IMAGES.giving },
  ],
  debate: [
    { id: 1, title: 'WACOS debate team reaches national championships', date: 'Sep 04, 2026', author: 'Debate Coach', excerpt: 'After sweeping the Busoga regional qualifiers, our debate team qualified for the UNEB National Schools Debate Championships. The motion on universal secondary education drew strong arguments from both sides.', img: IMAGES.academics },
    { id: 2, title: 'Public speaking workshop builds confidence in Form 3 students', date: 'Aug 19, 2026', author: 'Club Chairperson', excerpt: 'Twenty Form 3 students completed a four-week public speaking workshop covering voice projection, argument structure, and stage presence. Students practised with impromptu speeches and prepared orations.', img: IMAGES.campus },
    { id: 3, title: 'Model UN simulation tackles African Union trade policy', date: 'Aug 06, 2026', author: 'Secretary', excerpt: 'Students represented 12 African nations in a Model AU simulation focused on the African Continental Free Trade Area. Delegates drafted resolutions, negotiated compromises, and presented joint statements.', img: IMAGES.studentLife },
  ],
  writers: [
    { id: 1, title: 'New school magazine "The Wairaka Voice" launches its first edition', date: 'Sep 01, 2026', author: 'Editor-in-Chief', excerpt: 'The inaugural edition of The Wairaka Voice features 24 pages of student writing including poetry, short fiction, opinion pieces, and photo essays. The magazine is free to all students and available at the campus store.', img: IMAGES.studentLife },
    { id: 2, title: 'Poetry slam night sees 18 students perform original work', date: 'Aug 21, 2026', author: 'Club Chairperson', excerpt: 'The open mic poetry slam drew 18 performers and an audience of over 100. Winners were selected by audience applause and a panel of three teachers. Topics ranged from identity to environmental justice.', img: IMAGES.campus },
    { id: 3, title: 'Writers Club partners with Jinja Public Library for book drive', date: 'Aug 07, 2026', author: 'Secretary', excerpt: 'Club members collected and donated 350 books to the Jinja Public Library. The drive, themed "Read to Lead," aimed to improve access to reading material for primary school students in the area.', img: IMAGES.giving },
  ],
  'red-cross': [
    { id: 1, title: 'Annual blood drive collects 120 units for Jinja Regional Hospital', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Our annual blood donation drive collected 120 units in partnership with the Uganda Blood Transfusion Service. Students, teachers, and parents all participated. This is the highest collection in five years.', img: IMAGES.giving },
    { id: 2, title: 'First aid training equips 80 students with life-saving skills', date: 'Aug 18, 2026', author: 'Patron', excerpt: 'Red Cross trainers led a two-day first aid course for 80 students covering CPR, choking response, fracture management, and burns treatment. Each participant received a certificate.', img: IMAGES.studentLife },
    { id: 3, title: 'Health education week reaches 1,500 primary school pupils', date: 'Aug 04, 2026', author: 'Secretary', excerpt: 'Club members visited five primary schools in Wairaka sub-county to teach hygiene, malaria prevention, and HIV awareness. Materials were donated by the Uganda Red Cross Society.', img: IMAGES.campus },
  ],
  entertainment: [
    { id: 1, title: 'Sold-out talent show raises funds for school library', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The annual talent show drew a full house with 22 acts including singing, dancing, comedy, and spoken word. The event raised UGX 3.2 million for the school library renovation fund.', img: IMAGES.studentLife },
    { id: 2, title: 'Music team records first student album at Wairaka Studios', date: 'Aug 16, 2026', author: 'Music Director', excerpt: 'Eight musicians recorded a 10-track album featuring original compositions in Lusoga, English, and Luganda. The album will be released digitally and sold at the campus store.', img: IMAGES.campus },
    { id: 3, title: 'Comedy night draws laughs and lessons on school values', date: 'Aug 02, 2026', author: 'Secretary', excerpt: 'The comedy night featured clean humour about school life, family, and growing up in Uganda. The event was part of the school\'s wellness week and promoted positive mental health through laughter.', img: IMAGES.giving },
  ],
  'home-science': [
    { id: 1, title: 'Students cook up a storm at inter-school culinary challenge', date: 'Sep 04, 2026', author: 'Club Chairperson', excerpt: 'Four WACOS students competed against 12 schools at the Busoga Region Home Science Challenge. Our team prepared a three-course meal using local ingredients and won second place overall.', img: IMAGES.campus },
    { id: 2, title: 'Nutrition workshop teaches meal planning on a budget', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'Guest nutritionist Sarah Namukasa (Class of 2000) led a workshop on planning nutritious meals for families on limited budgets. Students practised creating weekly meal plans using market-available foods.', img: IMAGES.studentLife },
    { id: 3, title: 'Fashion and textile students showcase upcycled designs', date: 'Aug 08, 2026', author: 'Secretary', excerpt: 'Fifteen students displayed garments made from recycled fabrics and second-hand materials. The "Waste to Wear" exhibition promoted sustainability and creative reuse of textiles.', img: IMAGES.giving },
  ],
  'current-affairs': [
    { id: 1, title: 'Mock parliament debates national budget priorities', date: 'Sep 05, 2026', author: 'Club Chairperson', excerpt: 'Students role-played as MPs debating Uganda\'s national budget allocation. Topics included education funding, healthcare, and infrastructure. The "Speaker" maintained order throughout the heated session.', img: IMAGES.academics },
    { id: 2, title: 'Weekly news quiz sees Form 2 team take the lead', date: 'Aug 23, 2026', author: 'Quiz Master', excerpt: 'The current affairs quiz covered East African Community trade, climate policy, and local government elections. Form 2 Green scored 87 out of 100, leading the term-long competition.', img: IMAGES.campus },
    { id: 3, title: 'Guest speaker from Parliament shares path to public service', date: 'Aug 09, 2026', author: 'Secretary', excerpt: 'MP James Kalenzi (Jinja District) spoke to 200 students about civic engagement, the role of youth in democracy, and how education shapes future leaders. Students asked probing questions for over 30 minutes.', img: IMAGES.studentLife },
  ],
};

export const Route = createFileRoute('/clubs/$slug')({
  head: ({ params }) => ({
    meta: [{ title: params.slug + ' Club' }],
  }),
  component: ClubDetailPage,
});

function ClubDetailPage() {
  const { slug } = Route.useParams();
  const club = CLUBS.find(c => c.slug === slug);
  const posts = CLUB_POSTS[slug] || [];
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
                {posts.map((post) => (
                  <article key={post.id} className='group rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow'>
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
