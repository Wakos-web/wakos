import { createFileRoute, Link, Outlet, useMatch } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { IMAGES } from '@/lib/content';
import { SocialLinksRow } from '@/components/social-links';
import { Video, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import campusImg from '@/assets/campus.jpg';
import athleticsImg from '@/assets/athletics.jpg';
import studentLifeImg from '@/assets/student-life.jpg';
import academicsImg from '@/assets/academics.jpg';
import newsServiceImg from '@/assets/news-service.jpg';
import givingImg from '@/assets/giving.jpg';
import newsRoboticsImg from '@/assets/news-robotics.jpg';
import newsBasketballImg from '@/assets/news-basketball.jpg';
import newsGraduationImg from '@/assets/news-graduation.jpg';
import heroImg from '@/assets/hero.jpg';

function ClubApplicationForm({ club, slug }: { club: any; slug: string }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !className.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('club_applications').insert({
      club_id: slug,
      club_name: club.name,
      student_name: name.trim(),
      class_level: className.trim(),
      reason: reason.trim(),
      experience: experience.trim(),
      status: 'pending'
    });
    setSaving(false);
    if (!error) {
      setSubmitted(true);
      setName(''); setClassName(''); setReason(''); setExperience('');
    }
  };

  return (
    <section className='py-12 bg-white'>
      <div className='max-w-2xl mx-auto px-6'>
        {!showForm && !submitted && (
          <button onClick={() => setShowForm(true)} className='w-full rounded-2xl bg-green-50 border-2 border-dashed border-green-300 p-8 text-center hover:border-green-500 hover:bg-green-100 transition-all'>
            <p className='font-display text-xl font-bold text-green-900'>Want to join {club.name}?</p>
            <p className='text-sm text-green-700 mt-2'>Apply now and become part of our team</p>
          </button>
        )}
        {submitted && (
          <div className='rounded-2xl bg-green-50 border border-green-200 p-8 text-center'>
            <p className='font-display text-xl font-bold text-green-900'>Application Submitted!</p>
            <p className='text-sm text-green-700 mt-2'>Thank you for your interest. The club patron will review your application.</p>
            <button onClick={() => { setSubmitted(false); setShowForm(false); }} className='mt-4 text-sm font-semibold text-green-800 hover:underline'>Submit another</button>
          </div>
        )}
        {showForm && !submitted && (
          <form onSubmit={handleSubmit} className='rounded-2xl bg-white border border-stone-200 p-8 space-y-5'>
            <h3 className='font-display text-xl font-bold text-stone-900'>Apply to {club.name}</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>Your Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='e.g. John Mukasa' />
              </div>
              <div>
                <label className='block text-sm font-medium text-stone-700 mb-1'>Class Level *</label>
                <select value={className} onChange={e => setClassName(e.target.value)} required className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500'>
                  <option value=''>Select class</option>
                  <option>S1</option><option>S2</option><option>S3</option><option>S4</option><option>S5</option><option>S6</option>
                </select>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Why do you want to join?</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Tell us why you are interested...' />
            </div>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Previous experience (optional)</label>
              <textarea value={experience} onChange={e => setExperience(e.target.value)} rows={2} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Any relevant skills or experience...' />
            </div>
            <div className='flex gap-3'>
              <button type='submit' disabled={saving} className='px-6 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors'>{saving ? 'Submitting...' : 'Submit Application'}</button>
              <button type='button' onClick={() => setShowForm(false)} className='px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors'>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function MentorshipForm({ club, open, onClose }: { club: any; open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [expertise, setExpertise] = useState('');
  const [availability, setAvailability] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('mentorship_requests').insert({
      mentor_name: name.trim(),
      mentor_email: email.trim(),
      mentor_phone: phone.trim() || null,
      club_interest: club?.name || '',
      graduation_year: gradYear.trim() || null,
      expertise: expertise.trim() || null,
      availability: availability.trim() || null,
      message: message.trim() || null,
      status: 'pending'
    });
    setSaving(false);
    if (!error) {
      setSubmitted(true);
      setName(''); setEmail(''); setPhone(''); setGradYear(''); setExpertise(''); setAvailability(''); setMessage('');
    }
  };

  if (!open) return null;

  return (
    <div className='mt-6 max-w-2xl mx-auto'>
      {submitted ? (
        <div className='rounded-2xl bg-green-50 border border-green-200 p-8 text-center'>
          <p className='font-display text-xl font-bold text-green-900'>Mentor application submitted!</p>
          <p className='text-sm text-green-700 mt-2'>Thank you for offering to mentor. The {club?.name} patron and MMCWOSA will be in touch.</p>
          <button onClick={() => { setSubmitted(false); onClose(); }} className='mt-4 text-sm font-semibold text-green-800 hover:underline'>Submit another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='rounded-2xl bg-white border border-stone-200 p-8 space-y-5'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-display text-xl font-bold text-stone-900'>Become a mentor</h3>
              <p className='text-sm text-stone-500 mt-1'>Mentoring {club?.name} students</p>
            </div>
            <button type='button' onClick={onClose} className='text-stone-400 hover:text-stone-600' aria-label='Close'>✕</button>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='e.g. John Mukasa' />
            </div>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Email *</label>
              <input type='email' value={email} onChange={e => setEmail(e.target.value)} required className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='john@example.com' />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Phone (optional)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='+256 700 000000' />
            </div>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-1'>Graduation Year (optional)</label>
              <input value={gradYear} onChange={e => setGradYear(e.target.value)} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='e.g. 2015' />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>Your expertise (optional)</label>
            <input value={expertise} onChange={e => setExpertise(e.target.value)} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='e.g. Law, Engineering, Business, Coaching' />
          </div>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>Availability (optional)</label>
            <input value={availability} onChange={e => setAvailability(e.target.value)} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='e.g. One Saturday per term, or online' />
          </div>
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-1'>Message to the club (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className='w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='What would you love to share with the students?' />
          </div>
          <div className='flex gap-3'>
            <button type='submit' disabled={saving} className='px-6 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors'>{saving ? 'Submitting...' : 'Submit Mentor Application'}</button>
            <button type='button' onClick={onClose} className='px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors'>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

const AVATARS = [campusImg, athleticsImg, studentLifeImg, academicsImg, newsServiceImg, givingImg, newsRoboticsImg, newsBasketballImg, newsGraduationImg, heroImg];

type Person = { name: string; role: string; year?: string; joined?: string; img?: string };

const CLUBS = [
  {
    slug: 'wildlife', name: 'Wildlife Club', tagline: 'Protect. Observe. Conserve.',
    overview: 'We connect students with Uganda\'s biodiversity. Every walk, every survey, every campaign is a lesson no textbook can teach. This is where future conservationists are made.',
    stats: { members: 45, events: 8, years: 15, alumni: 200 },
    img: campusImg,
    patron: { name: 'Mr. Moses Okello', role: 'Science Teacher', joined: '2018', img: academicsImg },
    executives: [
      { name: 'Nadia M.', role: 'Chairperson', year: 'S4', joined: '2023', img: studentLifeImg },
      { name: 'David K.', role: 'Vice Chair', year: 'S4', joined: '2023', img: athleticsImg },
      { name: 'Sarah N.', role: 'Secretary', year: 'S3', joined: '2024', img: newsServiceImg },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Nature walks and wildlife surveys', 'Conservation campaigns', 'Tree planting drives', 'Guest speakers from UWA'],
  },
  {
    slug: 'arts-culture', name: 'Arts & Culture Club', tagline: 'Express. Create. Celebrate.',
    overview: 'We are the creative heartbeat of WACOS. Traditional dance, music, drama, visual arts, and cultural heritage live here. If you feel it, we help you express it.',
    stats: { members: 38, events: 12, years: 20, alumni: 350 },
    img: studentLifeImg,
    patron: { name: 'Ms. Florence Auma', role: 'Arts Teacher', joined: '2016', img: studentLifeImg },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Drama Captain', year: 'S4', joined: '2023', img: campusImg },
      { name: 'David O.', role: 'Music Director', year: 'S4', joined: '2023', img: athleticsImg },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Traditional dance and music', 'Drama productions', 'Visual arts exhibitions', 'Cultural heritage awareness'],
  },
  {
    slug: 'scouts-guides', name: 'Scouts & Girl Guides', tagline: 'Prepared. Responsible. Service.',
    overview: 'Leadership, service, and resilience through structured outdoor programmes. We prepare students not just for exams, but for life.',
    stats: { members: 60, events: 10, years: 25, alumni: 500 },
    img: givingImg,
    patron: { name: 'Mr. Peter Wasswa', role: 'Senior Teacher', joined: '2015', img: athleticsImg },
    executives: [
      { name: 'Joseph W.', role: 'Scout Leader', year: 'S5', joined: '2022', img: campusImg },
      { name: 'Brenda N.', role: 'Guide Captain', year: 'S5', joined: '2022', img: newsServiceImg },
      { name: 'Ali M.', role: 'Secretary', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Patrick I.', year: 'S3', joined: '2024' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Outdoor survival and camping', 'Community service projects', 'Leadership training', 'First aid certification'],
  },
  {
    slug: 'agriculture', name: 'Agriculture Club', tagline: 'Grow. Learn. Sustain.',
    overview: 'Running the school nursery and farm, we are central to the WACOS identity. Students grow seedlings from seed, manage crops, and feed the community. This is the motto in action.',
    stats: { members: 50, events: 6, years: 30, alumni: 600 },
    img: campusImg,
    patron: { name: 'Mr. James Okello', role: 'Agriculture Teacher', joined: '2017', img: athleticsImg },
    executives: [
      { name: 'Patrick I.', role: 'Chairperson', year: 'S5', joined: '2022', img: campusImg },
      { name: 'Sarah K.', role: 'Secretary', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'Moses W.', role: 'Farm Manager', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
    activities: ['School nursery and farm management', 'Seedling production', 'Crop rotation experiments', 'Agricultural science'],
  },
  {
    slug: 'debate', name: 'Debate Club', tagline: 'Think. Argue. Persuade.',
    overview: 'Critical thinking and public speaking sharpened through research, argument construction, and competition. We produce lawyers, politicians, and leaders who can hold their own anywhere.',
    stats: { members: 35, events: 14, years: 18, alumni: 300 },
    img: academicsImg,
    patron: { name: 'Mr. Samuel Balikowa', role: 'History Teacher', joined: '2019', img: athleticsImg },
    executives: [
      { name: 'Brian K.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Vice Chair', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Sarah N.', role: 'Secretary', year: 'S4', joined: '2023', img: newsServiceImg },
    ],
    members: [
      { name: 'David K.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Weekly practice sessions', 'Inter-school tournaments', 'Public speaking workshops', 'Model UN simulations'],
  },
  {
    slug: 'writers', name: 'Writers Club', tagline: 'Write. Read. Share.',
    overview: 'A love of language nurtured through poetry, short stories, essays, and journalism. We publish. We perform. We find our voice.',
    stats: { members: 30, events: 8, years: 12, alumni: 180 },
    img: studentLifeImg,
    patron: { name: 'Ms. Janet Nakato', role: 'English Teacher', joined: '2020', img: studentLifeImg },
    executives: [
      { name: 'Sarah N.', role: 'Editor-in-Chief', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'David O.', role: 'Chairperson', year: 'S4', joined: '2023', img: athleticsImg },
      { name: 'Grace N.', role: 'Secretary', year: 'S3', joined: '2024', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'Ali M.', year: 'S2', joined: '2025' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['School magazine production', 'Creative writing workshops', 'Poetry slams', 'Journalism and reporting'],
  },
  {
    slug: 'red-cross', name: 'Red Cross Club', tagline: 'Care. Respond. Serve.',
    overview: 'Humanitarian service taught through first aid, disaster preparedness, and health education. We save lives before we leave school.',
    stats: { members: 55, events: 10, years: 22, alumni: 450 },
    img: givingImg,
    patron: { name: 'Sr. Grace Nakamya', role: 'School Nurse', joined: '2017', img: newsServiceImg },
    executives: [
      { name: 'Brenda N.', role: 'Chairperson', year: 'S5', joined: '2022', img: givingImg },
      { name: 'Ali M.', role: 'Vice Chair', year: 'S4', joined: '2023', img: academicsImg },
      { name: 'Grace N.', role: 'Secretary', year: 'S4', joined: '2023', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['First aid training', 'Blood donation drives', 'Health education campaigns', 'Disaster preparedness'],
  },
  {
    slug: 'entertainment', name: 'Entertainment Club', tagline: 'Perform. Inspire. Entertain.',
    overview: 'Where talent meets stage. Talent shows, music, comedy, cultural events. We plan it. We perform it. We own it.',
    stats: { members: 42, events: 15, years: 10, alumni: 250 },
    img: studentLifeImg,
    patron: { name: 'Mr. David Ssemwanga', role: 'Music Teacher', joined: '2021', img: athleticsImg },
    executives: [
      { name: 'David O.', role: 'Chairperson', year: 'S5', joined: '2022', img: athleticsImg },
      { name: 'Nadia M.', role: 'Events Coordinator', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Brian K.', role: 'MC Lead', year: 'S4', joined: '2023', img: academicsImg },
    ],
    members: [
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Ali M.', year: 'S2', joined: '2025' },
      { name: 'Grace N.', year: 'S4', joined: '2022' }, { name: 'Joseph W.', year: 'S3', joined: '2024' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Talent shows and open mic nights', 'Music and dance performances', 'Comedy and drama sketches', 'Event planning'],
  },
  {
    slug: 'home-science', name: 'Home Science Club', tagline: 'Cook. Create. Care.',
    overview: 'Practical life skills that matter. Cooking, nutrition, textiles, household management. We learn what keeps families healthy and homes running.',
    stats: { members: 28, events: 8, years: 14, alumni: 220 },
    img: campusImg,
    patron: { name: 'Ms. Harriet Nabirye', role: 'Home Science Teacher', joined: '2019', img: studentLifeImg },
    executives: [
      { name: 'Sarah K.', role: 'Chairperson', year: 'S4', joined: '2023', img: newsServiceImg },
      { name: 'Brenda N.', role: 'Secretary', year: 'S4', joined: '2023', img: givingImg },
      { name: 'Grace N.', role: 'Treasurer', year: 'S3', joined: '2024', img: campusImg },
    ],
    members: [
      { name: 'Nadia M.', year: 'S4', joined: '2023' }, { name: 'Brian K.', year: 'S3', joined: '2024' },
      { name: 'David K.', year: 'S2', joined: '2025' }, { name: 'Ali M.', year: 'S3', joined: '2024' },
      { name: 'Joseph W.', year: 'S3', joined: '2024' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S2', joined: '2025' }, { name: 'Sarah N.', year: 'S2', joined: '2025' },
    ],
    activities: ['Cooking and nutrition workshops', 'Textile and fashion design', 'Food preservation', 'Health and hygiene education'],
  },
  {
    slug: 'current-affairs', name: 'Current Affairs Club', tagline: 'Read. Discuss. Understand.',
    overview: 'National and global events discussed, debated, and understood. Politics, economics, science, social issues. We produce citizens who know what is happening and why it matters.',
    stats: { members: 32, events: 10, years: 8, alumni: 150 },
    img: academicsImg,
    patron: { name: 'Mr. Francis Mugalu', role: 'Social Studies Teacher', joined: '2020', img: athleticsImg },
    executives: [
      { name: 'Ali M.', role: 'Chairperson', year: 'S5', joined: '2022', img: academicsImg },
      { name: 'Nadia M.', role: 'Research Lead', year: 'S4', joined: '2023', img: campusImg },
      { name: 'Joseph W.', role: 'Secretary', year: 'S4', joined: '2023', img: athleticsImg },
    ],
    members: [
      { name: 'Brian K.', year: 'S3', joined: '2024' }, { name: 'David K.', year: 'S2', joined: '2025' },
      { name: 'Sarah N.', year: 'S3', joined: '2024' }, { name: 'Grace N.', year: 'S4', joined: '2022' },
      { name: 'Brenda N.', year: 'S2', joined: '2025' }, { name: 'Patrick I.', year: 'S4', joined: '2022' },
      { name: 'Moses W.', year: 'S3', joined: '2024' }, { name: 'Sarah K.', year: 'S2', joined: '2025' },
    ],
    activities: ['Weekly news discussions', 'Mock parliament simulations', 'Guest speakers and panels', 'Model AU and UN programmes'],
  },
];

type ClubPost = { id: number; title: string; date: string; author: string; excerpt: string; img: string };

const CLUB_POSTS: Record<string, ClubPost[]> = {
  wildlife: [
    { id: 1, title: 'Nature walk reveals rare butterfly species on campus', date: 'Sep 01, 2026', author: 'Club Chairperson', excerpt: 'During our opening term walk, members spotted a Papilio densissimus near the school lake. The sighting was documented and shared with the Uganda Wildlife Authority.', img: IMAGES.campus },
    { id: 2, title: 'Tree planting drive targets 500 seedlings along Jinja road', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'In partnership with the Agriculture Club, Wildlife members planted 500 indigenous seedlings along the school boundary.', img: IMAGES.studentLife },
    { id: 3, title: 'Guest lecture from UWA ranger on elephant corridor conservation', date: 'Aug 05, 2026', author: 'Secretary', excerpt: 'Senior Ranger Moses Okello visited WACOS to explain how elephant corridors in eastern Uganda are being protected.', img: IMAGES.giving },
  ],
  'arts-culture': [
    { id: 1, title: 'Busoga cultural night draws record attendance', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Over 300 students and parents attended our annual cultural night with traditional Busoga dance and Lusoga poetry.', img: IMAGES.studentLife },
    { id: 2, title: 'Drama team wins best ensemble at Jinja regional festival', date: 'Aug 18, 2026', author: 'Drama Captain', excerpt: 'Our five-member drama team took the best ensemble award at the Busoga region arts festival.', img: IMAGES.campus },
    { id: 3, title: 'Visual arts exhibition opens in the school library', date: 'Aug 01, 2026', author: 'Arts Prefect', excerpt: 'Twelve students displayed paintings, charcoal drawings, and mixed-media pieces exploring identity and community.', img: IMAGES.giving },
  ],
  'scouts-guides': [
    { id: 1, title: 'Annual camping expedition heads to Source of the Nile', date: 'Sep 05, 2026', author: 'Scout Master', excerpt: 'Forty scouts and guides set off for a three-day expedition at the Source of the Nile.', img: IMAGES.giving },
    { id: 2, title: 'First aid certification training completes for 60 students', date: 'Aug 22, 2026', author: 'Patron', excerpt: 'In partnership with the Red Cross, 60 scouts and guides completed a two-day first aid certification course.', img: IMAGES.studentLife },
    { id: 3, title: 'Guides lead community clean-up in Wairaka trading centre', date: 'Aug 08, 2026', author: 'Guide Captain', excerpt: 'Twenty-five Girl Guides spent Saturday morning clearing drainage and collecting litter.', img: IMAGES.campus },
  ],
  agriculture: [
    { id: 1, title: 'School nursery distributes 2,000 seedlings to Wairaka families', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The Agriculture Club distributed 2,000 fruit and timber seedlings grown in the school nursery.', img: IMAGES.campus },
    { id: 2, title: 'Students harvest first crop from drip irrigation demo plot', date: 'Aug 15, 2026', author: 'Patron', excerpt: 'The club\'s drip irrigation demo plot produced its first harvest of tomatoes and sukuma wiki.', img: IMAGES.studentLife },
    { id: 3, title: 'Agriculture students attend Jinja district farming expo', date: 'Aug 03, 2026', author: 'Secretary', excerpt: 'Fifteen club members attended the annual Jinja District Agricultural Expo.', img: IMAGES.giving },
  ],
  debate: [
    { id: 1, title: 'WACOS debate team reaches national championships', date: 'Sep 04, 2026', author: 'Debate Coach', excerpt: 'After sweeping the Busoga regional qualifiers, our debate team qualified for the UNEB National Schools Debate Championships.', img: IMAGES.academics },
    { id: 2, title: 'Public speaking workshop builds confidence in Form 3 students', date: 'Aug 19, 2026', author: 'Club Chairperson', excerpt: 'Twenty Form 3 students completed a four-week public speaking workshop.', img: IMAGES.campus },
    { id: 3, title: 'Model UN simulation tackles African Union trade policy', date: 'Aug 06, 2026', author: 'Secretary', excerpt: 'Students represented 12 African nations in a Model AU simulation focused on the African Continental Free Trade Area.', img: IMAGES.studentLife },
  ],
  writers: [
    { id: 1, title: 'New school magazine "The Wairaka Voice" launches', date: 'Sep 01, 2026', author: 'Editor-in-Chief', excerpt: 'The inaugural edition features 24 pages of student writing including poetry, short fiction, and photo essays.', img: IMAGES.studentLife },
    { id: 2, title: 'Poetry slam night sees 18 students perform original work', date: 'Aug 21, 2026', author: 'Club Chairperson', excerpt: 'The open mic poetry slam drew 18 performers and an audience of over 100.', img: IMAGES.campus },
    { id: 3, title: 'Writers Club partners with Jinja Public Library for book drive', date: 'Aug 07, 2026', author: 'Secretary', excerpt: 'Club members collected and donated 350 books to the Jinja Public Library.', img: IMAGES.giving },
  ],
  'red-cross': [
    { id: 1, title: 'Annual blood drive collects 120 units for Jinja Regional Hospital', date: 'Sep 03, 2026', author: 'Club Chairperson', excerpt: 'Our annual blood donation drive collected 120 units in partnership with the Uganda Blood Transfusion Service.', img: IMAGES.giving },
    { id: 2, title: 'First aid training equips 80 students with life-saving skills', date: 'Aug 18, 2026', author: 'Patron', excerpt: 'Red Cross trainers led a two-day first aid course for 80 students.', img: IMAGES.studentLife },
    { id: 3, title: 'Health education week reaches 1,500 primary school pupils', date: 'Aug 04, 2026', author: 'Secretary', excerpt: 'Club members visited five primary schools in Wairaka sub-county to teach hygiene and health education.', img: IMAGES.campus },
  ],
  entertainment: [
    { id: 1, title: 'Sold-out talent show raises funds for school library', date: 'Sep 02, 2026', author: 'Club Chairperson', excerpt: 'The annual talent show drew a full house with 22 acts and raised UGX 3.2 million.', img: IMAGES.studentLife },
    { id: 2, title: 'Music team records first student album at Wairaka Studios', date: 'Aug 16, 2026', author: 'Music Director', excerpt: 'Eight musicians recorded a 10-track album featuring original compositions.', img: IMAGES.campus },
    { id: 3, title: 'Comedy night draws laughs and lessons on school values', date: 'Aug 02, 2026', author: 'Secretary', excerpt: 'The comedy night featured clean humour about school life and growing up in Uganda.', img: IMAGES.giving },
  ],
  'home-science': [
    { id: 1, title: 'Students cook up a storm at inter-school culinary challenge', date: 'Sep 04, 2026', author: 'Club Chairperson', excerpt: 'Four WACOS students competed against 12 schools and won second place overall.', img: IMAGES.campus },
    { id: 2, title: 'Nutrition workshop teaches meal planning on a budget', date: 'Aug 20, 2026', author: 'Patron', excerpt: 'Guest nutritionist Sarah Namukasa led a workshop on planning nutritious meals.', img: IMAGES.studentLife },
    { id: 3, title: 'Fashion and textile students showcase upcycled designs', date: 'Aug 08, 2026', author: 'Secretary', excerpt: 'Fifteen students displayed garments made from recycled fabrics.', img: IMAGES.giving },
  ],
  'current-affairs': [
    { id: 1, title: 'Mock parliament debates national budget priorities', date: 'Sep 05, 2026', author: 'Club Chairperson', excerpt: 'Students role-played as MPs debating Uganda\'s national budget allocation.', img: IMAGES.academics },
    { id: 2, title: 'Weekly news quiz sees Form 2 team take the lead', date: 'Aug 23, 2026', author: 'Quiz Master', excerpt: 'The current affairs quiz covered East African Community trade and climate policy.', img: IMAGES.campus },
    { id: 3, title: 'Guest speaker from Parliament shares path to public service', date: 'Aug 09, 2026', author: 'Secretary', excerpt: 'MP James Kalenzi spoke to 200 students about civic engagement and youth in democracy.', img: IMAGES.studentLife },
  ],
};

export const Route = createFileRoute('/clubs/$slug')({
  head: ({ params }) => ({
    meta: [{ title: params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Club — M.M College Wairaka' }],
  }),
  component: ClubDetailPage,
});

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}function getAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATARS[Math.abs(hash) % AVATARS.length] ?? "";
}

function MemberAvatar({ person, size = 'md' }: { person: Person; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm';
  const img = person.img || getAvatar(person.name);
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm`}>
      <img src={img} alt={person.name} className='w-full h-full object-cover' loading='lazy' />
    </div>
  );
}

const PORTRAIT_COLORS = ['#FACC15', '#2563EB', '#EC4899', '#EF4444', '#F97316', '#10B981', '#8B5CF6', '#06B6D4', '#F43F5E', '#14B8A6'];

function PortraitCard({ person, index, size = 'lg' }: { person: Person; index: number; size?: 'lg' | 'md' | 'sm' }) {
  const img = person.img || getAvatar(person.name);
  const color = PORTRAIT_COLORS[index % PORTRAIT_COLORS.length];
  // bg circle is only 16px larger than photo (8px offset each side) — tight peek of color
  const dims = size === 'lg' ? { circle: 'w-36 h-36 sm:w-44 sm:h-44', bg: 'w-40 h-40 sm:w-48 sm:h-48', name: 'text-base sm:text-lg', role: 'text-xs sm:text-sm', gap: 'mt-2 sm:mt-3' }
    : size === 'md' ? { circle: 'w-28 h-28 sm:w-32 sm:h-32', bg: 'w-32 h-32 sm:w-36 sm:h-36', name: 'text-sm', role: 'text-xs', gap: 'mt-2' }
    : { circle: 'w-20 h-20 sm:w-24 sm:h-24', bg: 'w-24 h-24 sm:w-28 sm:h-28', name: 'text-[11px] sm:text-xs', role: 'text-[9px] sm:text-[10px]', gap: 'mt-1 sm:mt-1.5' };

  // Offset the bg circle slightly up-left so color peeks at top-left corner only
  return (
    <div className='flex flex-col items-center cursor-pointer group hover:-translate-y-2 transition-all duration-300'>
      <div className='relative' style={{ paddingBottom: '4px' }}>
        {/* Colored circle behind — offset up and left, clipped so it doesn't bleed into the name */}
        <div className={`absolute -top-1 -left-1 ${dims.bg} rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`} style={{ backgroundColor: color, opacity: 0.85 }} />
        {/* Photo circle */}
        <div className={`relative ${dims.circle} rounded-full overflow-hidden shadow-lg ring-2 ring-white transition-all duration-300 group-hover:shadow-2xl group-hover:ring-4`}>          
          <img src={img} alt={person.name} className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500' loading='lazy' />
        </div>
      </div>
      {/* Name + Role label below — extra margin to stay clear of colored circle */}
      <div className={'text-center ' + dims.gap + ' transition-all duration-300 pt-1'}>
        <p className={'font-display font-bold text-stone-900 group-hover:text-green-800 transition-colors duration-300 ' + dims.name}>{person.name}</p>
        <p className={dims.role + ' text-green-800 font-medium'}>{person.role}</p>
        {person.year && <p className='text-xs text-stone-500 mt-0.5'>{person.year}{person.joined ? ' · Since ' + person.joined : ''}</p>}
      </div>
    </div>
  );
}

function ClubDetailPage() {
  // The club story route (/clubs/$slug/posts/$postId) is a child of this
  // route. All hooks below must run unconditionally (React hook-order rule),
  // so the story check happens only AFTER every hook has run.
  const isStoryRoute = useMatch({ from: "/clubs/$slug/posts/$postId", shouldThrow: false });
  const { slug } = Route.useParams();
  const [dbClub, setDbClub] = useState<any>(null);
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [postMedia, setPostMedia] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  useEffect(() => {
    var onScroll = function() { setShowBackToTop(window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return function() { window.removeEventListener('scroll', onScroll); };
  }, []);

  // Reload when the browser restores this page from the back/forward cache
  // (bfcache) — a stale DOM shows old cards with dead links after a deploy.
  useEffect(() => {
    const onPageshow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', onPageshow);
    return () => window.removeEventListener('pageshow', onPageshow);
  }, []);

  useEffect(() => {
    supabase.from('clubs').select('*').eq('slug', slug).single().then(({ data: clubData }) => {
      if (clubData) {
        setDbClub(clubData);
        Promise.all([
          supabase.from('club_members').select('*').eq('club_id', clubData.id).order('sort_order'),
          supabase.from('club_posts').select('*').eq('club_id', clubData.id).eq('published', true).order('created_at', { ascending: false }),
        ]).then(async ([membersRes, postsRes]) => {
          if (membersRes.data) setDbMembers(membersRes.data);
          supabase.from('social_links').select('*').eq('entity_type', 'club').eq('entity_id', slug).eq('active', true).order('sort_order', { ascending: true }).then(({ data }) => {
            if (data?.length) setSocials(data);
          });
          if (postsRes.data) {
            setDbPosts(postsRes.data);
            // Pull each post's story media so cards can show the cover image
            // and a photo/video count (Pinterest-style preview).
            const ids = postsRes.data.map((p: any) => p.id);
            if (ids.length > 0) {
              const { data: media } = await supabase
                .from('club_post_media')
                .select('*')
                .in('post_id', ids)
                .eq('active', true)
                .order('sort_order', { ascending: true });
              if (media) {
                const byPost: Record<string, any[]> = {};
                media.forEach((m: any) => {
                  (byPost[m.post_id] = byPost[m.post_id] || []).push(m);
                });
                setPostMedia(byPost);
              }
            }
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  const localClub = CLUBS.find(c => c.slug === slug);
  const club = dbClub ? {
    ...localClub,
    ...dbClub,
    img: localClub?.img || campusImg,
    stats: { members: dbClub.members_count || 0, events: dbClub.events_count || 0, years: dbClub.years_active || 0, alumni: dbClub.alumni_count || 0 },
    patron: dbMembers.find((m: any) => m.role === 'Patron') || localClub?.patron || null,
    executives: dbMembers.filter((m: any) => m.role !== 'Patron' && m.role !== 'Member').slice(0, 3),
    members: dbMembers.filter((m: any) => m.role === 'Member'),
    activities: dbClub.activities && dbClub.activities.length > 0 ? dbClub.activities : (localClub?.activities || []),
  } : localClub;
  // Only render real DB posts. Sample fallback cards (numeric ids like posts/1)
  // used to render during SSR/hydration and linked to dead pages — never show them.
  const posts = dbPosts;

  // The club story route is a child of this route. When it is active,
  // render ONLY the story — this page's own content is for the club itself.
  // Placed after every hook so SPA navigation keeps a stable hook order.
  if (isStoryRoute) return <Outlet />;

  if (!club) return <div className='py-20 text-center text-stone-500'>Club not found.</div>;

  const clubMembers = club.members || [];
  const visibleMembers = showAllMembers ? clubMembers : clubMembers.slice(0, 8);

  return (
    <div>
      {/* 1. Hero with stat chips */}
      <section className='relative h-[50vh] min-h-[360px] flex items-end overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={club.img} alt={club.name} className='h-full w-full object-cover object-center' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
        </div>
        <Link to='/clubs/editor' className='absolute top-5 right-5 z-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 hover:bg-black/60 hover:text-white transition-colors'>
          Club editors sign in
        </Link>
        <div className='relative z-10 w-full max-w-6xl mx-auto px-6 pb-12'>
          <p className='text-xs font-semibold uppercase tracking-wider text-white/60 mb-2'>{club.tagline}</p>
          <h1 className='font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4'>{club.name}</h1>
          {socials.length > 0 && (
            <div className='mb-4'>
              <SocialLinksRow links={socials} tone='dark' className='justify-start' />
            </div>
          )}
          <div className='flex flex-wrap gap-3'>
            <span className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full'>
              <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' /></svg>
              {club.stats?.members || club.members_count || 0} members
            </span>
            <span className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full'>
              Est. {new Date().getFullYear() - (club.stats?.years || club.years_active || 0)}
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className='sticky top-0 z-20 bg-white border-b border-stone-200'>
        <div className='max-w-6xl mx-auto px-6 flex gap-6 py-3'>
          <Link to='/clubs' className='whitespace-nowrap text-sm font-medium text-stone-600 hover:text-green-800 transition-colors uppercase tracking-wider'>All Clubs</Link>
          <span className='text-sm font-medium text-green-800 uppercase tracking-wider'>{club.name}</span>
        </div>
      </nav>

      {/* 2. Overview */}
      <section className='py-16'>
        <div className='max-w-3xl mx-auto px-6 text-center'>
          <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>What We Stand For</p>
          <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6'>Our Mission</h2>
          <p className='text-stone-600 text-lg leading-relaxed font-body'>{club.overview}</p>
        </div>
      </section>

      {/* 3. Stats bar */}
      {club.stats && (
      <section className='py-12 bg-green-900'>
        <div className='max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.members || club.members_count || 0} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Active Members</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.events || club.events_count || 0} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Events This Year</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.years || club.years_active || 0} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Years Active</p>
          </div>
          <div>
            <p className='font-display text-4xl md:text-5xl font-bold text-white'><AnimatedNumber target={club.stats.alumni || club.alumni_count || 0} /></p>
            <p className='text-sm text-white/60 mt-1 font-body'>Alumni Worldwide</p>
          </div>
        </div>
      </section>
      )}

      {/* 4. Leadership */}
      <section className='py-16'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Leadership</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>Who runs this club</h2>
          </div>

          {/* Patron */}
          {club.patron && (
          <div className='mb-10'>
            <p className='text-xs font-semibold uppercase tracking-wider text-stone-500 mb-6 text-center'>Patron</p>
            <div className='flex justify-center'>
              <PortraitCard person={club.patron} index={0} size='lg' />
            </div>
          </div>
          )}

          {/* Executives */}
          {club.executives && club.executives.length > 0 && (
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-wider text-stone-500 mb-6 text-center'>Executives</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 justify-items-center'>
              {club.executives.map((ex: any, i: number) => (
                <PortraitCard key={ex.name} person={ex} index={i + 1} size='md' />
              ))}
            </div>
          </div>
          )}

          {/* Members */}
          <div>
            <div className='text-center mb-6'>
              <p className='text-xs font-semibold uppercase tracking-wider text-stone-500'>Members ({clubMembers.length})</p>
              {clubMembers.length > 8 && (
                <button onClick={() => setShowAllMembers(!showAllMembers)} className='text-sm font-semibold text-green-800 hover:underline mt-1'>
                  {showAllMembers ? 'Show less' : `View all ${clubMembers.length}`}
                </button>
              )}
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 justify-items-center'>
              {visibleMembers.map((m: any, i: number) => (
                <PortraitCard key={m.name} person={m} index={i + 4} size='sm' />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Updates */}
      <section className='py-16 bg-stone-50'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-3'>Latest Updates</p>
            <h2 className='font-display text-3xl md:text-4xl text-stone-900 font-bold'>What we have been up to</h2>
          </div>
          <div className='grid sm:grid-cols-2 gap-6'>
            {loading && posts.length === 0 && (
              <div className='col-span-full grid sm:grid-cols-2 gap-6'>
                {[0, 1].map((n) => (
                  <div key={n} className='rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden animate-pulse'>
                    <div className='aspect-[4/3] bg-stone-200' />
                    <div className='p-5 space-y-3'>
                      <div className='h-4 bg-stone-200 rounded w-3/4' />
                      <div className='h-3 bg-stone-200 rounded w-full' />
                      <div className='h-3 bg-stone-200 rounded w-2/3' />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && posts.length === 0 && (
              <p className='col-span-full text-center text-stone-500 py-8 font-body'>
                No updates yet — check back soon.
              </p>
            )}
            {posts.map((post) => {
              const postDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
              const media = postMedia[post.id] || [];
              const coverImg = post.img || post.image_url || media.find((m: any) => m.media_type === 'image')?.media_url || null;
              const hasVideo = media.some((m: any) => m.media_type === 'video');
              return (
                <Link key={post.id} to={`/clubs/${slug}/posts/${post.id}` as any} className='block group rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:border-green-800 hover:shadow-lg transition-all flex flex-col'>
                  <div className='relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-stone-100'>
                    {coverImg ? (
                      <img src={coverImg} alt={post.title} loading='lazy' className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' />
                    ) : (
                      <div className='h-full w-full flex flex-col items-center justify-center'>
                        <svg className='w-10 h-10 text-green-800/30 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                        <span className='text-xs text-green-800/40 font-medium uppercase tracking-wider'>Photo coming soon</span>
                      </div>
                    )}
                    {media.length > 0 && (
                      <span className='absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-white'>
                        {hasVideo && <Video className='h-3 w-3' />}
                        {media.filter((m: any) => m.media_type === 'image').length} {hasVideo ? 'photos + video' : 'photos'}
                      </span>
                    )}
                  </div>
                  <div className='flex flex-1 flex-col p-6'>
                    <div className='flex items-center gap-3 mb-3'>
                      <span className='text-xs font-semibold text-green-800 uppercase tracking-wider'>{post.author}</span>
                      <span className='text-xs text-stone-400'>|</span>
                      <span className='text-xs text-stone-500'>{postDate}</span>
                    </div>
                    <h3 className='font-display text-lg font-bold text-stone-900 mb-2 group-hover:text-green-800 transition-colors'>{post.title}</h3>
                    <p className='text-sm text-stone-600 font-body leading-relaxed line-clamp-3 flex-1'>{post.excerpt}</p>
                    <span className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 group-hover:gap-2.5 transition-all'>
                      View full story <ArrowRight className='h-4 w-4' />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Activities sidebar (compact) */}
      <section className='py-12'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='rounded-2xl bg-stone-50 border border-stone-200 p-8'>
            <p className='text-sm font-semibold text-green-800 uppercase tracking-widest mb-4'>Activities</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {club.activities.map((act: any) => (
                <div key={act} className='flex items-start gap-2'>
                  <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-green-800 shrink-0' />
                  <span className='text-stone-600 font-body'>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Apply to Club */}
      <ClubApplicationForm club={club} slug={slug} />

      {/* 8. Compact 3-tier CTA */}
      <section className='py-12 border-t border-stone-200'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <a href='/admissions' className='group rounded-2xl bg-green-900 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-green-300'>For Students</span>
              <p className='font-display text-lg font-bold text-white mt-2 group-hover:underline'>Want to lead? Apply Now</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-white/70 group-hover:text-white transition-colors'>Apply <span>&rarr;</span></span>
            </a>
            <button onClick={() => setMentorOpen(true)} className='group rounded-2xl bg-white border border-green-800 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-green-800'>For Alumni</span>
              <p className='font-display text-lg font-bold text-stone-900 mt-2 group-hover:underline'>Come back as a mentor</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-green-800/70 group-hover:text-green-800 transition-colors'>Get involved <span>&rarr;</span></span>
            </button>
            <a href='/giving' className='group rounded-2xl bg-amber-50 border border-amber-200 p-6 text-left hover:shadow-lg transition-shadow'>
              <span className='text-xs font-semibold uppercase tracking-wider text-amber-700'>Sponsorship</span>
              <p className='font-display text-lg font-bold text-stone-900 mt-2 group-hover:underline'>Fund this club</p>
              <span className='inline-flex items-center gap-1 mt-3 text-sm text-amber-700/70 group-hover:text-amber-700 transition-colors'>Support <span>&rarr;</span></span>
            </a>
          </div>
          <MentorshipForm club={club} open={mentorOpen} onClose={() => setMentorOpen(false)} />
        </div>
      </section>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className='fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-green-900 text-white shadow-lg hover:bg-green-800 hover:shadow-xl transition-all flex items-center justify-center'
          aria-label='Back to top'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={2.5} stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5' />
          </svg>
        </button>
      )}
    </div>
  );
}
