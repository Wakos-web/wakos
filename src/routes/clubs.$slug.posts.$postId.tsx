import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, Image as ImageIcon, Video as VideoIcon, PlayCircle } from 'lucide-react';

export const Route = createFileRoute('/clubs/$slug/posts/$postId')({
  head: ({ params }) => ({
    meta: [{ title: 'Club Story — M.M College Wairaka' }],
  }),
  component: PostDetailPage,
});

type MediaItem = {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  caption: string | null;
  sort_order: number;
};

type Story = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  img?: string;
  date?: string;
  created_at?: string;
};

const STATIC_POSTS: Record<string, Record<string, any>> = {
  wildlife: {
    '1': { title: 'Nature walk reveals rare butterfly species on campus', author: 'Club Chairperson', date: 'Sep 01, 2026', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority for their butterfly atlas.', content: 'The Wildlife Club kicked off the new term with a nature walk around the school campus and surrounding wetlands. During the two-hour walk, members documented over 15 butterfly species, including a rare Papilio densissimus spotted near the school lake.\n\nClub chairperson Nadia M. described the moment: "We were walking along the lake edge when someone spotted a large butterfly with distinctive markings. We stopped, photographed it, and later confirmed it was Papilio densissimus, a species not commonly seen in this area."\n\nThe sighting has been shared with the Uganda Wildlife Authority, who are incorporating it into their eastern Uganda butterfly atlas. The club plans to conduct monthly surveys throughout the term to build a comprehensive record of campus biodiversity.\n\n"This is exactly what the Wildlife Club is about," said patron Mr. Moses Okello. "Students learning to observe, document, and contribute to real science."', img: '/mwosa.jpeg' },
    '2': { title: 'Tree planting drive targets 500 seedlings along Jinja road', author: 'Patron', date: 'Aug 20, 2026', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary.', content: 'Five hundred indigenous tree seedlings were planted along the school boundary and the road leading to Jinja in a joint effort between the Wildlife Club and Agriculture Club.\n\nSpecies included mahogany, finding, and fruit trees selected to create a living corridor for birds and insects. The seedlings were grown in the school nursery by Agriculture Club members over the previous term.\n\n"This corridor will provide habitat for pollinators and birds," explained Wildlife Club patron Mr. Moses Okello. "It is also a practical lesson in reforestation and ecosystem restoration."\n\nThe planting was completed in a single Saturday morning, with 45 Wildlife Club members and 30 Agriculture Club members working side by side.', img: '/hero-poster.png' },
    '3': { title: 'Guest lecture from UWA ranger on elephant corridor conservation', author: 'Secretary', date: 'Aug 05, 2026', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected.', content: 'Senior Ranger Moses Okello from the Uganda Wildlife Authority visited WACOS to deliver a guest lecture on elephant corridor conservation in eastern Uganda.\n\nThe lecture covered how elephant corridors connect fragmented habitats, allowing elephants to move between protected areas. Students learned about the challenges of human-wildlife conflict and the strategies being used to protect both communities and wildlife.\n\n"Elephants are not just wildlife," Ranger Okello told students. "They are part of the ecosystem that supports our agriculture, our water systems, and our tourism. Protecting their corridors protects us all."\n\nStudents asked probing questions about career paths in conservation and the role of technology in wildlife monitoring. Several students expressed interest in pursuing environmental science after the lecture.', img: '/mwosa.jpeg' },
  },
};

/* Reveal-on-scroll wrapper: content fades/rises into view as it enters the
 * viewport, one animated container per photo/video. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'} ${className}`}
    >
      {children}
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  if (item.media_type === 'video') {
    return (
      <figure className="mb-6 break-inside-avoid overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative group">
          <video
            src={item.media_url}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video object-cover bg-black"
          />
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            <PlayCircle className="h-3.5 w-3.5" /> Video
          </span>
        </div>
        {item.caption && (
          <figcaption className="px-4 py-3 text-sm text-stone-600 font-body leading-relaxed">{item.caption}</figcaption>
        )}
      </figure>
    );
  }
  return (
    <figure className="mb-6 break-inside-avoid overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden">
        <img src={item.media_url} alt={item.caption || ''} loading="lazy" className="w-full object-cover" />
      </div>
      {item.caption && (
        <figcaption className="px-4 py-3 text-sm text-stone-600 font-body leading-relaxed">{item.caption}</figcaption>
      )}
    </figure>
  );
}

function PostDetailPage() {
  const { slug, postId } = Route.useParams();
  const [post, setPost] = useState<Story | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubName, setClubName] = useState(slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  useEffect(() => {
    setLoading(true);
    // Try Supabase first
    supabase.from('clubs').select('id, name').eq('slug', slug).single().then(({ data: clubData }) => {
      if (clubData) {
        setClubName(clubData.name);
        Promise.all([
          supabase.from('club_posts').select('*').eq('id', postId).eq('club_id', clubData.id).single(),
          supabase.from('club_post_media').select('*').eq('post_id', postId).eq('active', true).order('sort_order', { ascending: true }),
        ]).then(([pRes, mRes]) => {
          if (pRes.data) {
            setPost(pRes.data as Story);
            if (mRes.data) setMedia(mRes.data as MediaItem[]);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl font-bold text-stone-900 mb-2">Story not found</p>
        <p className="text-stone-500 mb-6">This club update may have been unpublished or removed.</p>
        <Link to={`/clubs/${slug}` as any} className="inline-flex items-center gap-2 rounded-full bg-green-800 px-6 py-3 text-sm font-semibold text-white hover:bg-green-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {clubName}
        </Link>
      </div>
    );
  }

  const postDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
  const cover = post.image_url || post.img || (media.find((m) => m.media_type === 'image')?.media_url ?? null);
  const paragraphs = (post.content || post.excerpt || '').split('\n\n').filter(Boolean);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Story header */}
      <section className="relative overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-20" />}
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/70 to-green-900/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-16">
          <Link to={`/clubs/${slug}` as any} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to {clubName}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-green-200">
              <Calendar className="h-3.5 w-3.5" /> {postDate || 'This term'}
            </span>
            {post.author && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-green-200">{post.author}</span>
            )}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-white/85 font-body leading-relaxed max-w-3xl">{post.excerpt}</p>
          )}
          {media.length > 0 && (
            <p className="mt-6 text-sm text-white/60">
              {media.length} {media.length === 1 ? 'photo or video' : 'photos & videos'} in this story
            </p>
          )}
        </div>
      </section>

      {/* Masonry gallery of animated, captioned media */}
      {media.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {media.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 90}>
                <MediaCard item={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Story text */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        {paragraphs.length > 0 && (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-5">The story</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-stone-700 font-body leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
        )}
        {paragraphs.length === 0 && media.length === 0 && (
          <p className="text-stone-500 font-body text-lg">Full content coming soon.</p>
        )}
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3">Want to be part of the next story?</h2>
          <p className="text-stone-600 font-body max-w-2xl mx-auto mb-8">
            Join {clubName} and start making memories worth sharing from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/clubs/${slug}` as any} className="inline-flex items-center justify-center gap-2 rounded-full bg-green-800 px-8 py-3.5 text-sm font-bold text-white hover:bg-green-900 transition-colors">
              Visit the club
            </Link>
            <Link to="/clubs" className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-8 py-3.5 text-sm font-bold text-stone-700 hover:border-green-800 hover:text-green-800 transition-colors">
              <ArrowLeft className="h-4 w-4" /> All clubs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}