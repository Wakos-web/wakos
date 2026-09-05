import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { IMAGES } from '@/lib/content';
import { supabase } from '@/lib/supabase';
import campusImg from '@/assets/campus.jpg';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/clubs/$slug/posts/$postId')({
  head: ({ params }) => ({
    meta: [{ title: 'Club Update — M.M College Wairaka' }],
  }),
  component: PostDetailPage,
});

const STATIC_POSTS: Record<string, Record<string, any>> = {
  wildlife: {
    '1': { title: 'Nature walk reveals rare butterfly species on campus', author: 'Club Chairperson', date: 'Sep 01, 2026', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority for their butterfly atlas.', content: 'The Wildlife Club kicked off the new term with a nature walk around the school campus and surrounding wetlands. During the two-hour walk, members documented over 15 butterfly species, including a rare Papilio densissimus spotted near the school lake.\n\nClub chairperson Nadia M. described the moment: "We were walking along the lake edge when someone spotted a large butterfly with distinctive markings. We stopped, photographed it, and later confirmed it was Papilio densissimus, a species not commonly seen in this area."\n\nThe sighting has been shared with the Uganda Wildlife Authority, who are incorporating it into their eastern Uganda butterfly atlas. The club plans to conduct monthly surveys throughout the term to build a comprehensive record of campus biodiversity.\n\n"This is exactly what the Wildlife Club is about," said patron Mr. Moses Okello. "Students learning to observe, document, and contribute to real science."', img: IMAGES.campus },
    '2': { title: 'Tree planting drive targets 500 seedlings along Jinja road', author: 'Patron', date: 'Aug 20, 2026', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary.', content: 'Five hundred indigenous tree seedlings were planted along the school boundary and the road leading to Jinja in a joint effort between the Wildlife Club and Agriculture Club.\n\nSpecies included mahogany, finding, and fruit trees selected to create a living corridor for birds and insects. The seedlings were grown in the school nursery by Agriculture Club members over the previous term.\n\n"This corridor will provide habitat for pollinators and birds," explained Wildlife Club patron Mr. Moses Okello. "It is also a practical lesson in reforestation and ecosystem restoration."\n\nThe planting was completed in a single Saturday morning, with 45 Wildlife Club members and 30 Agriculture Club members working side by side.', img: IMAGES.studentLife },
    '3': { title: 'Guest lecture from UWA ranger on elephant corridor conservation', author: 'Secretary', date: 'Aug 05, 2026', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected.', content: 'Senior Ranger Moses Okello from the Uganda Wildlife Authority visited WACOS to deliver a guest lecture on elephant corridor conservation in eastern Uganda.\n\nThe lecture covered how elephant corridors connect fragmented habitats, allowing elephants to move between protected areas. Students learned about the challenges of human-wildlife conflict and the strategies being used to protect both communities and wildlife.\n\n"Elephants are not just wildlife," Ranger Okello told students. "They are part of the ecosystem that supports our agriculture, our water systems, and our tourism. Protecting their corridors protects us all."\n\nStudents asked probing questions about career paths in conservation and the role of technology in wildlife monitoring. Several students expressed interest in pursuing environmental science after the lecture.', img: IMAGES.giving },
  },
};

function PostDetailPage() {
  const { slug, postId } = Route.useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try Supabase first
    supabase.from('clubs').select('id').eq('slug', slug).single().then(({ data: clubData }) => {
      if (clubData) {
        supabase.from('club_posts').select('*').eq('id', postId).eq('club_id', clubData.id).single().then(({ data }) => {
          if (data) {
            setPost(data);
          } else {
            // Fallback to static
            const staticPost = STATIC_POSTS[slug]?.[postId];
            if (staticPost) setPost(staticPost);
          }
          setLoading(false);
        });
      } else {
        const staticPost = STATIC_POSTS[slug]?.[postId];
        if (staticPost) setPost(staticPost);
        setLoading(false);
      }
    });
  }, [slug, postId]);

  if (loading) return <div className='py-20 flex justify-center'><div className='h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent' /></div>;
  if (!post) return <div className='py-20 text-center text-stone-500'>Post not found.</div>;

  const postDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
  const postImg = post.img || post.image_url;

  return (
    <div>
      {/* Hero */}
      <section className='relative h-[40vh] min-h-[300px] flex items-end overflow-hidden'>
        <div className='absolute inset-0'>
          {postImg ? (
            <img src={postImg} alt={post.title} className='h-full w-full object-cover object-center' />
          ) : (
            <div className='h-full w-full bg-gradient-to-br from-green-800 to-stone-900' />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
        </div>
        <div className='relative z-10 w-full max-w-4xl mx-auto px-6 pb-12'>
          <Link to={`/clubs/${slug}` as any} className='inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4'>
            <ArrowLeft className='h-4 w-4' /> Back to Club
          </Link>
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-xs font-semibold text-green-300 uppercase tracking-wider'>{post.author}</span>
            <span className='text-xs text-white/40'>|</span>
            <span className='text-xs text-white/50'>{postDate}</span>
          </div>
          <h1 className='font-display text-3xl md:text-4xl lg:text-5xl text-white font-bold tracking-tight'>{post.title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className='py-16'>
        <div className='max-w-3xl mx-auto px-6'>
          {post.excerpt && (
            <p className='text-lg text-stone-600 font-body leading-relaxed mb-8 font-medium'>{post.excerpt}</p>
          )}
          {(post.content || post.excerpt) && (
            <div className='prose prose-lg prose-stone max-w-none font-body text-stone-700 leading-relaxed'>
              {(post.content || post.excerpt).split('\n\n').map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {!post.content && !post.excerpt && (
            <p className='text-stone-500 font-body text-lg'>Full content coming soon.</p>
          )}
        </div>
      </section>

      {/* Back link */}
      <section className='py-8 border-t border-stone-200'>
        <div className='max-w-3xl mx-auto px-6'>
          <Link to={`/clubs/${slug}` as any} className='inline-flex items-center gap-2 text-green-800 font-semibold hover:underline'>
            <ArrowLeft className='h-4 w-4' /> Back to {slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Club
          </Link>
        </div>
      </section>
    </div>
  );
}
