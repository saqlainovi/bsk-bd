import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { 
  Users, BookOpen, GraduationCap, Building, Award, Library, Map as MapIcon, Sparkles, TrendingUp, Calendar, HeartHandshake, CheckCircle, ArrowRight, ArrowUpRight, FileText, Bell, PhoneCall, HelpCircle, Mail, MapPin, ChevronLeft, ChevronRight, BookOpenCheck, X, Grid, MousePointerClick, Compass, ExternalLink
} from 'lucide-react';
import { Language } from '../types';
import websiteContentJson from '../data/website_content.json';
import { normalizeImageUrl } from './imageUtils';
import { motion, AnimatePresence } from 'motion/react';
import Footer from './Footer';
import { cpanelApi } from '../services/cpanelApi';

const cleanTextEmoji = (str?: string) => {
  if (!str) return '';
  return str
    .replace(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\uD83D\uDFE2\uD83D\uDD34⚡\uD83D\uDD25✨⭐\uD83D\uDCCC\uD83D\uDCCD\uD83C\uDFF7️●•↗↘↙↖→←↑↓]/gu, '')
    .trim();
};

// SVG Custom icons
function SchoolIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m4 6 8-4 8 4v10l-8 4-8-4z"/><path d="m12 10 4-2H8z"/><path d="M12 22V10"/></svg>
  );
}

function TruckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="14" y="5" rx="1"/><rect width="7" height="5" x="3" y="9" rx="1"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
  );
}

// 8 key programs
const programs = [
  {
    id: 'nationwide-excellence',
    title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম',
    title_en: 'Nationwide Excellence Program',
    desc_bn: '৬৪ জেলায় দেশভিত্তিক সাহিত্য মূল্যায়ন ও বইপড়া আন্দোলন।',
    desc_en: 'Countrywide elite reading evaluation & movement.',
    tag_bn: '৬৪ জেলা',
    tag_en: '64 Districts',
    colorClass: 'bg-[#8B3A1E] text-orange-100',
    icon: Award,
    bgImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'mobile-library',
    title_bn: 'ভ্রাম্যমাণ লাইব্রেরি',
    title_en: 'Mobile Library Network',
    desc_bn: '৪০০০+ স্কুল ও লোকালয়ে চলমান দ্বীপ্ত লাইব্রেরি।',
    desc_en: 'Reaching 4,000+ local centers via mobile units.',
    tag_bn: '৪০০০+ স্কুল',
    tag_en: '4,000+ Schools',
    colorClass: 'bg-[#2E5942] text-emerald-100',
    icon: TruckIcon,
    bgImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'reading-habit',
    title_bn: 'পাঠাভ্যাস উন্নয়ন',
    title_en: 'Reading Habit Development',
    desc_bn: 'শিক্ষা প্রতিষ্ঠানে নিয়মিত বই পড়ার অভ্যাস ও পুরষ্কার।',
    desc_en: 'Institutional reading encouragement and prizes.',
    tag_bn: 'কর্মসূচি',
    tag_en: 'Program',
    colorClass: 'bg-[#1E4A6B] text-sky-100',
    icon: BookOpen,
    bgImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'book-fair',
    title_bn: 'ভ্রাম্যমাণ বইমেলা',
    title_en: 'Mobile Book Fair',
    desc_bn: 'সারাদেশে ভ্রাম্যমাণ বইমেলা আয়োজন ও মানসম্মত গ্রন্থ প্রদর্শনী।',
    desc_en: 'Nationwide mobile book fair events & exhibitions.',
    tag_bn: 'বাৎসরিক',
    tag_en: 'Annual',
    colorClass: 'bg-[#2E5942] text-emerald-100',
    icon: BookOpen,
    bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'aalor-ishkool',
    title_bn: 'আলোর ইশকুল',
    title_en: 'Aalor Ishkool',
    desc_bn: 'উচ্চতর মননশীলতা ও সাংস্কৃতিক বোধের স্কুল।',
    desc_en: 'Advanced mindset and cultural growth seminars.',
    tag_bn: 'সক্রিয়',
    tag_en: 'Active',
    colorClass: 'bg-[#3D2B14] text-[#F0CC7A]',
    icon: Sparkles,
    bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'aalor-pathshala',
    title_bn: 'আলোর পাঠশালা',
    title_en: 'Aalor Pathshala',
    desc_bn: 'সুবিধাবঞ্চিত এলাকায় কমিউনিটি লার্নিং সেন্টার।',
    desc_en: 'Empowering underprivileged student sectors.',
    tag_bn: 'নতুন',
    tag_en: 'New',
    colorClass: 'bg-[#6B5A1E] text-amber-100',
    icon: SchoolIcon,
    bgImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'bangalir_chinta',
    title_bn: 'বাঙালির চিন্তা কর্মসূচি',
    title_en: 'Bangalir Chinta',
    desc_bn: 'বাঙালি মনীষীদের শ্রেষ্ঠ মননশীল ও চিন্তামূলক প্রবন্ধের সংকলন প্রকাশ কর্মসূচি।',
    desc_en: 'Selected historical and philosophical works and thoughts of Bengal giants.',
    tag_bn: 'ঐতিহাসিক',
    tag_en: 'Historical',
    colorClass: 'bg-[#553E2A] text-orange-100',
    icon: BookOpenCheck,
    bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'primary-teacher',
    title_bn: 'প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি',
    title_en: 'Primary Teachers Reading Program',
    desc_bn: 'প্রাথমিক ও মাধ্যমিক শিক্ষকদের বইপড়া কৃষ্টি।',
    desc_en: 'Enhancement materials for elementary educators.',
    tag_bn: 'শিক্ষক উন্নয়ন',
    tag_en: 'Teachers',
    colorClass: 'bg-[#213547] text-slate-100',
    icon: BookOpen,
    bgImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&auto=format&fit=crop&q=90'
  },
  {
    id: 'publication',
    title_bn: 'প্রকাশনা কার্যক্রম',
    title_en: 'Publications',
    desc_bn: 'ধ্রুপদী ও নোবেলবিজয়ী বিশ্বসাহিত্যের উচ্চমানের বাংলা অনুবাদ প্রকাশনা।',
    desc_en: 'Acclaimed publications of world classics and Bangla translations.',
    tag_bn: '১০০০+ বই',
    tag_en: '1000+ Books',
    colorClass: 'bg-[#4A3B32] text-amber-100',
    icon: BookOpen,
    bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=90'
  }
];

const resolveProgramIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return Sparkles;
    case 'TruckIcon': return TruckIcon;
    case 'Award': return Award;
    case 'BookOpen': return BookOpen;
    case 'SchoolIcon': return SchoolIcon;
    case 'Calendar': return Calendar;
    case 'Library': return Library;
    case 'BookOpenCheck': return BookOpenCheck;
    default: return BookOpen;
  }
};

interface StatCardProps {
  id: string;
  bgImage: string;
  title: string;
  value: string;
  desc: string;
  onClick?: () => void;
}

function StatCard({ id, bgImage, title, value, desc, onClick }: StatCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // relative X
    const y = e.clientY - rect.top;  // relative Y
    setCoords({ x, y });
  };

  // 3D Tilt calculations
  const rotateX = isHovered && cardRef.current
    ? -((coords.y - cardRef.current.clientHeight / 2) / cardRef.current.clientHeight) * 14
    : 0;
  const rotateY = isHovered && cardRef.current
    ? ((coords.x - cardRef.current.clientWidth / 2) / cardRef.current.clientWidth) * 14
    : 0;

  // Background image opacity: default 0.55 (clearly visible), hovers up to 0.75
  const imageOpacity = isHovered ? 0.75 : 0.55;

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      className={`relative overflow-hidden bg-[#FAF7F2] border border-[#B8862A]/30 p-5 rounded-2xl shadow-xs leading-none text-left flex flex-col justify-between transition-all duration-300 ease-out select-none group min-h-[160px] h-full gpu-accelerated ${onClick ? 'cursor-pointer hover:border-[#B8862A] hover:shadow-md' : 'cursor-default'}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background Image Overlay with pristine legibility control and 3D parallax feel */}
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 pointer-events-none select-none mix-blend-multiply gpu-accelerated"
        style={{
          opacity: imageOpacity,
          transform: isHovered ? 'scale(1.1) translateZ(10px)' : 'scale(1) translateZ(0px)',
        }}
        referrerPolicy="no-referrer"
      />

      {/* 3D Glassmorphism Spotlight Effect */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 140px at ${coords.x}px ${coords.y}px, rgba(184, 134, 42, 0.28) 0%, transparent 100%)`,
          }}
        />
      )}

      {/* Content wrapper with perspective */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full" style={{ transform: 'translateZ(15px)' }}>
        <div className="flex items-center justify-between text-black">
          <span className="font-serif font-black text-xs sm:text-[13px] uppercase tracking-wider text-black drop-shadow-[0_1.5px_3px_rgba(255,255,255,1)]">
            {title}
          </span>
        </div>
        <div className="mt-4 mb-2">
          <span className="text-xl md:text-2xl font-serif font-black text-black drop-shadow-[0_1.5px_3px_rgba(255,255,255,1)] leading-tight block">
            {value}
          </span>
        </div>
        <p className="text-[11px] text-black font-extrabold font-sans leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,1)]">
          {desc}
        </p>
      </div>
    </div>
  );
}

interface DashboardProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ language, onNavigate }: DashboardProps) {
  // Database sub-states
  const [dbHeroSlides, setDbHeroSlides] = useState<any[]>([]);
  const [dbRecentActivities, setDbRecentActivities] = useState<any[]>([]);
  const [dbNewsItems, setDbNewsItems] = useState<any[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbNotices, setDbNotices] = useState<any[]>([]);

  // Additional widget blocks sub-states
  const [dbIntroBlock, setDbIntroBlock] = useState<any>(null);
  const [dbStatsBlock, setDbStatsBlock] = useState<any>(null);
  const [dbFounderBlock, setDbFounderBlock] = useState<any>(null);
  const [dbBeliefBlock, setDbBeliefBlock] = useState<any>(null);
  const [dbCtaBlock, setDbCtaBlock] = useState<any>(null);
  const [dbPortalsBlock, setDbPortalsBlock] = useState<any>(null);
  const [dbHomepagePrograms, setDbHomepagePrograms] = useState<any[]>([]);
  const [dbPages, setDbPages] = useState<any[]>([]);
  const [dbGalleryML, setDbGalleryML] = useState<any>(null);
  const [dbGalleryRH, setDbGalleryRH] = useState<any>(null);
  const [dbGalleryCL, setDbGalleryCL] = useState<any>(null);
  const [dbWhoWeAreBlock, setDbWhoWeAreBlock] = useState<any>(null);
  const [dbInfographicBlock, setDbInfographicBlock] = useState<any>(null);
  const [homePageData, setHomePageData] = useState<any>(null);
  const [founderPageData, setFounderPageData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        const heroes = await cpanelApi.getCollection('hero_slides');
        if (Array.isArray(heroes)) {
          const sorted = [...heroes].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setDbHeroSlides(sorted);
        }

        const activities = await cpanelApi.getCollection('recent_activities');
        if (Array.isArray(activities)) {
          const sorted = [...activities].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setDbRecentActivities(sorted);
        }

        const news = await cpanelApi.getCollection('news_items');
        if (Array.isArray(news)) setDbNewsItems(news);

        const evs = await cpanelApi.getCollection('events');
        if (Array.isArray(evs)) setDbEvents(evs);

        const nots = await cpanelApi.getCollection('notices');
        if (Array.isArray(nots)) setDbNotices(nots);

        const blocks = await cpanelApi.getCollection('homepage_blocks');
        if (Array.isArray(blocks)) {
          blocks.forEach((b: any) => {
            if (b.id === 'intro_banner') setDbIntroBlock(b);
            else if (b.id === 'statistics') setDbStatsBlock(b);
            else if (b.id === 'founder') setDbFounderBlock(b);
            else if (b.id === 'central_belief') setDbBeliefBlock(b);
            else if (b.id === 'cta_block') setDbCtaBlock(b);
            else if (b.id === 'portals') setDbPortalsBlock(b);
            else if (b.id === 'gallery_ml') setDbGalleryML(b);
            else if (b.id === 'gallery_rh') setDbGalleryRH(b);
            else if (b.id === 'gallery_cl') setDbGalleryCL(b);
            else if (b.id === 'who_we_are') setDbWhoWeAreBlock(b);
            else if (b.id === 'infographic') setDbInfographicBlock(b);
          });
        }

        const progs = await cpanelApi.getCollection('homepage_programs');
        if (Array.isArray(progs)) {
          const sorted = [...progs].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setDbHomepagePrograms(sorted);
        }

        const pages = await cpanelApi.getCollection('website_pages');
        if (Array.isArray(pages)) {
          setDbPages(pages);
        }

        const homeDoc = await cpanelApi.getDoc('website_pages', 'home');
        if (homeDoc) setHomePageData(homeDoc);

        const founderDoc = await cpanelApi.getDoc('website_pages', 'founder');
        if (founderDoc) setFounderPageData(founderDoc);
      } catch (err) {
        console.warn('Error loading Dashboard content via cpanelApi:', err);
      }
    };

    fetchDashboardContent();

    const handleUpdate = (e: any) => {
      const col = e?.detail?.collection;
      if (
        !col ||
        [
          'hero_slides',
          'recent_activities',
          'news_items',
          'events',
          'notices',
          'homepage_blocks',
          'homepage_programs',
          'website_pages'
        ].includes(col)
      ) {
        fetchDashboardContent();
      }
    };

    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('bsk_db_updated', handleUpdate);
    };
  }, []);

  // Standard static slides fallback used if database hasn't been populated
  const defaultHeroSlides = [
    {
      id: "slide-1",
      badge_bn: "৪৬ বছরের আলোকযাত্রা",
      badge_en: "46 Years of Enlightenment",
      title_bn: "আলোকিত মানুষ গড়ার ৪৬ বছরের অঙ্গীকার",
      title_en: "Building Humane, Complete Minds Since 1978",
      desc_bn: "চিত্ত বিকাশের এক মহতী দেশব্যাপী আন্দোলন।",
      desc_en: "A national movement cultivating minds and values.",
      bgImage: "/assets/IMGS/481260669_1052017186949762_8260665744101041376_n.jpg"
    },
    {
      id: "slide-2",
      badge_bn: "ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম",
      badge_en: "Mobile Library Network",
      title_bn: "বই নিয়ে মানুষের দোরগোড়ায় ভ্রাম্যমাণ লাইব্রেরি",
      title_en: "Taking Books to the Doorsteps of Millions",
      desc_bn: "৩৬০টি উপজেলায় ৩ লক্ষাধিক পাঠকের ঘরে আলো ছড়ানো।",
      desc_en: "Reaching over 300,000 members across 64 districts.",
      bgImage: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg"
    },
    {
      id: "slide-3",
      badge_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম",
      badge_en: "National Excellence Program",
      title_bn: "কৈশোর ও যৌবনে বইপড়ার আনন্দ ও মনন চর্চা",
      title_en: "Cultivating Reading and Excellence in Youth",
      desc_bn: "সৃজনশীল বই পাঠের দেশব্যাপী উৎসাহ প্রদান।",
      desc_en: "Instilling deep interest and analytical thinking in students.",
      bgImage: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg"
    },
    {
      id: "slide-4",
      badge_bn: "আলোর ইশকুল সেমিনার",
      badge_en: "Aalor Ishkool Seminars",
      title_bn: "ধ্রুপদী চিন্তা ও মননচর্চার মিলনমেলা",
      title_en: "Enlightened Seminar Circles and Cultural Growth",
      desc_bn: "সাহিত্য, কবিতা ও দর্শনের এক মুক্ত মঞ্চ।",
      desc_en: "A nurturing hub of intellectual and cultural seminars.",
      bgImage: "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg"
    }
  ];

  // Standard static activities fallback used if database hasn't been populated
  const defaultRecentActivities = [
    {
      id: "act-1",
      title_bn: "উপদেশীয় ধ্রুপদী সঙ্গীত বক্তৃতামালা-২ ( Classical Music Appreciation)",
      title_en: "Sub-Continental Classical Music Appreciation Lectures - Session 2",
      desc_bn: "উপদেশের ধ্রুপদী সঙ্গীত বিষয়ক বিশেষ বক্তৃতামালা ও সঙ্গীতানুষ্ঠান।",
      desc_en: "Special lecture and recital on classical music styles at the main auditorium.",
      date_bn: "৪ অক্টোবর ২০২৪",
      date_en: "Oct 4, 2024",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন, ঢাকা",
      loc_en: "BSK Auditorium, Dhaka",
      category_bn: "আলোর ইশকুল",
      category_en: "Aalor Ishkool",
      image: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg"
    },
    {
      id: "act-2",
      title_bn: "আলোর ইশকুল — পশ্চিমের রবি বিশেষ সন্ধ্যা অনুষ্ঠান",
      title_en: "Aalor Ishkool presents: Rabindranath Tagore Evening Session",
      desc_bn: "রবীন্দ্রনাথ ঠাকুরের পশ্চিমী প্রভাব ও বিশ্ববীক্ষা নিয়ে তাত্ত্বিক আলোচনা সন্ধ্যা।",
      desc_en: "Exploring Tagorian literature and Western echoes in Tagore's creations.",
      date_bn: "২৫ ডিসেম্বর ২০২৩",
      date_en: "Dec 25, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Auditorium",
      category_bn: "সংস্কৃতি ও উৎসব",
      category_en: "Culture",
      image: "/assets/IMGS/493907913_1088721076612706_7469814680062640482_n.jpg"
    },
    {
      id: "act-3",
      title_bn: "৬৪ জেলায় ৩১ লক্ষ নির্বাচিত বই বিতরণ ও উৎসব",
      title_en: "3.1 Million Selective Books Distributed Across 64 Districts",
      desc_bn: "৩০০ উপজেলার ১৫ হাজার শিক্ষাপ্রতিষ্ঠানে বই বিতরণ কার্যক্রম সম্পন্ন।",
      desc_en: "Books distribution festival completed across 15,000 schools.",
      date_bn: "৩ ডিসেম্বর ২০২৩",
      date_en: "Dec 3, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK HQ Premises",
      category_bn: "বই বিতরণ",
      category_en: "Distribution",
      image: "/assets/IMGS/534826832_1175889297895883_7988975073499309288_n.jpg"
    },
    {
      id: "act-4",
      title_bn: "আলোর ইশকুলের উদ্বোধনী অনুষ্ঠান ও প্রথম ক্লাস",
      title_en: "Grand Inaugural Ceremony and First Session of Aalor Ishkool",
      desc_bn: "সৃজনশীল ও সুকুমার মনের তরুণ বিদ্যাপীঠ আলোর ইশকুলের শুভ উদ্বোধন।",
      desc_en: "Welcoming the new batch to study masterworks of global arts.",
      date_bn: "১৭ নভেম্বর ২০২৩",
      date_en: "Nov 17, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Seminar Hall",
      category_bn: "উদ্বোধন",
      category_en: "Launch",
      image: "/assets/IMGS/536274754_1178736097611203_3029242284131290248_n.jpg"
    },
    {
      id: "act-5",
      title_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম: পরীক্ষক ওরিয়েন্টশন কর্মশালা",
      title_en: "National Excellence Program: Evaluators Orientation Workshop",
      desc_bn: "দেশব্যাপী বই মূল্যায়ন কার্যক্রমের পরীক্ষক ও সংগঠক প্রশিক্ষণ কর্মশালা।",
      desc_en: "Workshop for regional evaluators to manage student review matrices.",
      date_bn: "৪ নভেম্বর ২০২৩",
      date_en: "Nov 4, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Headquarters",
      category_bn: "কর্মশালা",
      category_en: "Workshop",
      image: "/assets/IMGS/538932485_1181595997325213_7707590514493828322_n.jpg"
    },
    {
      id: "act-6",
      title_bn: "আলোর ইশকুল ফটোগ্রাফি কোর্স (৯ম আবর্তন) উদ্বোধন",
      title_en: "Aalor Ishkool Photography Course: 9th Batch Vernacular",
      desc_bn: "দৃশ্যকলার মননশীল চর্চাকে বেগবান করতে বিশেষ ফটোগ্রাফি কোর্স উদ্বোধন।",
      desc_en: "Launching its 9th cohort of photography as an expressive art.",
      date_bn: "৩ নভেম্বর ২০২৩",
      date_en: "Nov 3, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Audio-Visual Hall",
      category_bn: "ফটোগ্রাফি",
      category_en: "Photography",
      image: "/assets/IMGS/541757616_1188867436598069_3843590467807414193_n.jpg"
    },
    {
      id: "act-7",
      title_bn: "'বাঙালির চিন্তামূলক রচনা সংগ্রহ' প্রকাশের শুভসূচনা",
      title_en: "Auspicious Launch of: Collection of Bengali Thoughtful Essays",
      desc_bn: "বাঙালির দেড়শত বছরের বুদ্ধিবৃত্তিক সাধনার সার সংগ্রহ প্রকাশনা অনুষ্ঠান।",
      desc_en: "A curated compendium of critical thought essays spanning 150 years.",
      date_bn: "১৪ অক্টোবর ২০২৩",
      date_en: "Oct 14, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Auditorium",
      category_bn: "প্রকাশনা",
      category_en: "Publication",
      image: "/assets/IMGS/542220663_1188866673264812_4072823877481821965_n.jpg"
    },
    {
      id: "act-8",
      title_bn: "বিশ্বসাহিত্য কেন্দ্র আবৃত্তি সংঘের নতুন সদস্য সংগ্রহ ২০২৩",
      title_en: "BSK Recitation Group: New Recruits Enrollment Ceremony",
      desc_bn: "কবিতার আবৃত্তি, শুদ্ধ উচ্চারণ ও বাচিক শিল্পকলা প্রশিক্ষণের শুভ সূচনা।",
      desc_en: "Registering new voices to practice the art of elite poetry oration.",
      date_bn: "২ সেপ্টেম্বর ২০২৩",
      date_en: "Sep 2, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র",
      loc_en: "BSK Central Hall",
      category_bn: "আবৃত্তি",
      category_en: "Oratory",
      image: "/assets/IMGS/543355579_1188867093264770_3674962598515896994_n.jpg"
    }
  ];

  // Resolve dynamic arrays
  const heroSlides = dbHeroSlides.length > 0 ? dbHeroSlides : defaultHeroSlides;
  const recentActivities = dbRecentActivities.length > 0 ? dbRecentActivities : defaultRecentActivities;

  // Carousel 1 & 2 states
  const [currentHeroSlide, setCurrentHeroSlide] = React.useState(0);
  const [actIndex, setActIndex] = React.useState(0);

  // Unified activities gallery for BSK showcasing the different sections in a single grand horizontal slideshow
  const bskUnifiedGallery = [
    {
      image: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      category_bn: "ভ্রাম্যমাণ লাইব্রেরি",
      category_en: "Mobile Library Network",
      caption_bn: "৬৪ জেলায় ৪০০০+ স্পটে চলমান ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম",
      caption_en: "Active mobile library operations expanding to 4,000+ centers",
      route: "mobile-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      category_bn: "ভ্রাম্যমাণ লাইব্রেরি",
      category_en: "Home Deliveries Program",
      caption_bn: "৩ লক্ষাধিক পাঠকের ঘরে বাড়িতে বইয়ের আলো পৌঁছে দেওয়া",
      caption_en: "Delivering books directly to homes of over 300,000 readers",
      route: "mobile-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
      category_bn: "লাইব্রেরি কালেকশন",
      category_en: "HQ World-Class Literature",
      caption_bn: "বিশ্বমানের শ্রেষ্ঠ সাহিত্য নিয়ে গঠিত বইয়ের বিশাল সম্ভার",
      caption_en: "A rich array of world-class classical literature and essays",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
      category_bn: "দেশভিত্তিক উৎকর্ষ",
      category_en: "Elite Book Assessment",
      caption_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রমে বই মূল্যায়ন পরীক্ষা ও উৎসব",
      caption_en: "Elite book evaluation assessments and creative reading rewards",
      route: "reading-habit"
    },
    {
      image: "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg",
      category_bn: "পাঠাভ্যাস উন্নয়ন",
      category_en: "Reading Habits",
      caption_bn: "শত শত শিক্ষাপ্রতিষ্ঠানে ছাত্র-ছাত্রীদের মাঝে বই পড়ার আনন্দ",
      caption_en: "Inspiring book-reading habits throughout hundreds of institutions",
      route: "reading-habit"
    },
    {
      image: "/assets/IMGS/493897528_1088721239946023_8232102595073591871_n.jpg",
      category_bn: "দেশভিত্তিক উৎকর্ষ",
      category_en: "Youth Awakening Mission",
      caption_bn: "নতুন প্রজন্মকে সৃজনশীল চিন্তাধারায় আলোকিত করার মিশন",
      caption_en: "Guiding the next generation toward enlightened global mindsets",
      route: "reading-habit"
    },
    {
      image: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg",
      category_bn: "সাংস্কৃতিক অনুষ্ঠান",
      category_en: "Exquisite Seminars",
      caption_bn: "অডিটোরিয়ামে মননশীল সাহিত্য সভা, সেমিনার ও বিতর্ক প্রতিযোগিতা",
      caption_en: "Debates, core panels, and recitation summits in our auditorium",
      route: "facilities"
    },
    {
      image: "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg",
      category_bn: "আলোর ইশকুল",
      category_en: "Aalor Ishkool Action",
      caption_bn: "আলোর ইশকুল কার্যক্রমে তরুণদের চিত্তের মুক্ত চিন্তা বিকাশ",
      caption_en: "Cultivating beautiful minds with creative seminars in classrooms",
      route: "aalor-ishkool"
    },
    {
      image: "/assets/IMGS/PURNIMA SONDHA/714223583_1412738130877664_111984798886283783_n.jpg",
      category_bn: "সাংস্কৃতিক মেলা",
      category_en: "Creative Art Galleries",
      caption_bn: "চিত্রকলা ও আলোকচিত্র প্রদর্শনীর উৎসবমুখর সাংস্কৃতিক মিলনমেলা",
      caption_en: "Visual art galleries bringing local sub-districts and youth together",
      route: "facilities"
    }
  ];

  const OFFICIAL_PROGRAM_IDS = [
    'nationwide-excellence',
    'mobile-library',
    'reading-habit',
    'book-fair',
    'aalor-ishkool',
    'aalor-pathshala',
    'bangalir_chinta',
    'primary-teacher',
    'publication'
  ];

  const activeProgramsList = React.useMemo(() => {
    const pagesMap = new Map(dbPages.map((page: any) => [page.id, page]));
    const baseMap = new Map(programs.map((p) => [p.id, { ...p }]));

    // 1. Sync hero_image/bgImage from website_pages doc if available
    baseMap.forEach((prog, id) => {
      const pageDoc = pagesMap.get(id) || (id === 'bangalir_chinta' ? pagesMap.get('bangalir-chinta') : null);
      if (pageDoc) {
        const pageImg = pageDoc.hero_image || pageDoc.bgImage || pageDoc.cover_image || pageDoc.image || pageDoc.imageUrl;
        if (pageImg) {
          prog.bgImage = pageImg;
        }
      }
    });

    // 2. Merge dbHomepagePrograms items (highest priority)
    if (dbHomepagePrograms.length > 0) {
      dbHomepagePrograms.forEach((p) => {
        if (p.id) {
          const existing = baseMap.get(p.id) || {
            id: p.id,
            title_bn: p.title_bn || 'নতুন কার্যক্রম',
            title_en: p.title_en || 'New Program',
            desc_bn: p.desc_bn || '',
            desc_en: p.desc_en || '',
            tag_bn: p.tag_bn || '',
            tag_en: p.tag_en || '',
            colorClass: p.colorClass || 'bg-[#2E5942] text-emerald-100',
            icon: resolveProgramIcon(p.iconName || p.icon) || BookOpen,
            bgImage: p.bgImage || p.image || p.imageUrl || p.cover_image || p.hero_image || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1600&auto=format&fit=crop&q=90',
            order: p.order || 99
          };
          const imgToUse = p.bgImage || p.image || p.imageUrl || p.cover_image || p.hero_image || existing.bgImage;

          baseMap.set(p.id, {
            ...existing,
            ...p,
            bgImage: imgToUse,
            icon: resolveProgramIcon(p.iconName || p.icon) || existing.icon
          });
        }
      });
    }

    const result: typeof programs = Array.from(baseMap.values());
    result.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return result;
  }, [dbHomepagePrograms, dbPages]);

  const [hoveredMiniGallery, setHoveredMiniGallery] = React.useState<'A' | 'B' | 'C' | null>(null);
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

  const [mlGalleryIndex, setMlGalleryIndex] = React.useState(0);
  const [readingGalleryIndex, setReadingGalleryIndex] = React.useState(0);
  const [culturalGalleryIndex, setCulturalGalleryIndex] = React.useState(0);

  // Custom Slider implementation for Key 9 Departments
  const programSliderRef = React.useRef<HTMLDivElement>(null);
  const [activeProgramIndex, setActiveProgramIndex] = React.useState(0);
  const [isPlayingPrograms, setIsPlayingPrograms] = React.useState(true);

  const scrollToProgramIndex = (index: number) => {
    const len = activeProgramsList.length || 1;
    const safeIndex = (index + len) % len;
    setActiveProgramIndex(safeIndex);
    if (programSliderRef.current) {
      const container = programSliderRef.current;
      const children = container.children;
      if (children[safeIndex]) {
        const child = children[safeIndex] as HTMLElement;
        container.scrollTo({
          left: child.offsetLeft - (container.clientWidth - child.clientWidth) / 2,
          behavior: 'smooth'
        });
      }
    }
  };

  React.useEffect(() => {
    if (!isPlayingPrograms) return;
    const timer = setInterval(() => {
      const len = activeProgramsList.length || 1;
      scrollToProgramIndex((activeProgramIndex + 1) % len);
    }, 4000); // Cycles automatically from left to right every 4 seconds
    return () => clearInterval(timer);
  }, [activeProgramIndex, isPlayingPrograms, activeProgramsList.length]);

  const handleProgramSliderScroll = () => {
    if (programSliderRef.current) {
      const container = programSliderRef.current;
      const children = container.children;
      let closestIndex = 0;
      let minDiff = Infinity;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.clientWidth / 2;
        const diff = Math.abs(containerCenter - childCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
      setActiveProgramIndex(closestIndex);
    }
  };

  // 3 Mini Gallery datasets (কেন্দ্রীয় লাইব্রেরি, ক্যাফেটেরিয়া, বই বিক্রয় কেন্দ্র)
  const centralLibraryGallery = [
    {
      image: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Central Library HQ",
      caption_bn: "বিশ্বসাহিত্য কেন্দ্র লাইব্রেরি কক্ষের মনোরম বইয়ের সারি",
      caption_en: "A serene aisle of curated global books inside BSK Central Library",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Central Reading space",
      caption_bn: "লাইব্রেরিতে নিবিড় অধ্যয়নরত পাঠক ও সভ্যবৃন্দ",
      caption_en: "Avid members engrossed in deep study at BSK HQ Central Library",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Study and Discovery",
      caption_bn: "জ্ঞানার্জনে মগ্ন পাঠকবৃন্দের বইপড়ার চমৎকার দৃশ্য",
      caption_en: "Readers exploring historical and global literature",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Reading Lounges",
      caption_bn: "পাঠকদের নিরিবিলি বইপড়ার জন্য সাজানো শান্ত পরিবেশ",
      caption_en: "Quiet, comfortable reading zones designed for excellence",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Spacious Archives",
      caption_bn: "মনোমুগ্ধকর লাইব্রেরি স্পেস যা পাঠককে মুগ্ধ করে",
      caption_en: "Scenic library layout housing thousands of classical journals",
      route: "central-library"
    },
    {
      image: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
      category_bn: "কেন্দ্রীয় লাইব্রেরি",
      category_en: "Classical Bookcases",
      caption_bn: "আধুনিক বইয়ের বর্ণিল সংগ্রহ ও পরিপাটি বইয়ের তাকসমূহ",
      caption_en: "Organized archives for researchers and literature lovers",
      route: "central-library"
    }
  ];

  const cafeteriaGallery = [
    {
      image: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      category_bn: "ক্যাফেটেরিয়া",
      category_en: "Cafeteria & Lounge",
      caption_bn: "বিশ্বসাহিত্য কেন্দ্র ভবনের ছাদ সংলগ্ন উন্মুক্ত ক্যাফেটেরিয়া ও মনোরম পরিবেশ",
      caption_en: "Open air rooftop cafeteria with lush green surroundings at BSK Building",
      route: "cafe"
    },
    {
      image: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      category_bn: "ক্যাফেটেরিয়া",
      category_en: "Cafeteria & Lounge",
      caption_bn: "পাঠক ও সংস্কৃতিমনা দর্শনার্থীদের সান্ধ্যকালীন আড্ডা ও চা-চক্রের শান্ত আবহ",
      caption_en: "Aesthetic outdoor terrace for intellectual adda, tea, and dialogue",
      route: "cafe"
    },
    {
      image: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      category_bn: "ক্যাফেটেরিয়া",
      category_en: "Cafeteria & Lounge",
      caption_bn: "পরিচ্ছন্ন, মনোরম ও রুচিশীল ইনডোর সিটিং ব্যবস্থা",
      caption_en: "Clean and aesthetic indoor dining and refreshment space",
      route: "cafe"
    },
    {
      image: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      category_bn: "ক্যাফেটেরিয়া",
      category_en: "Cafeteria & Lounge",
      caption_bn: "সবুজ বাগান ও প্রাকৃতিক আলো-বাতাসপূর্ণ মনোরম ছাদ বারান্দা",
      caption_en: "Lush rooftop garden with refreshing natural breezes",
      route: "cafe"
    }
  ];

  const bookSalesGallery = [
    {
      image: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
      category_bn: "বই বিক্রয় কেন্দ্র",
      category_en: "Book Sales Center",
      caption_bn: "বিশ্বসাহিত্য কেন্দ্র ভবন ২য় তলার সুসজ্জিত আধুনিক বই বিক্রয় কেন্দ্র",
      caption_en: "Spacious bookstore with world classics on 2nd floor of BSK Building",
      route: "bookshop"
    },
    {
      image: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
      category_bn: "বই বিক্রয় কেন্দ্র",
      category_en: "Book Sales Center",
      caption_bn: "দেশি-বিদেশি ধ্রুপদী বই, কেন্দ্রের প্রকাশনা ও বিশেষ ছাড়ের তথ্য কাউন্টার",
      caption_en: "Extensive display of BSK publications and imported Bengali literature",
      route: "bookshop"
    },
    {
      image: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      category_bn: "বই বিক্রয় কেন্দ্র",
      category_en: "Book Sales Center",
      caption_bn: "পাঠকদের সুবিধার্থে বিষয়ভিত্তিক সাজানো বইয়ের সুবিশাল সম্ভার",
      caption_en: "Categorized bookshelves and reader-friendly consulting desk",
      route: "bookshop"
    },
    {
      image: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      category_bn: "বই বিক্রয় কেন্দ্র",
      category_en: "Book Sales Center",
      caption_bn: "শান্ত ও শীতাতপ নিয়ন্ত্রিত আধুনিক পঠন ও বই নির্বাচন পরিবেশ",
      caption_en: "Air-conditioned modern browsing and purchase atmosphere",
      route: "bookshop"
    }
  ];

  const activeCLGallery = dbGalleryCL?.slides?.length > 0 ? dbGalleryCL.slides : centralLibraryGallery;
  const activeCafeGallery = dbGalleryML?.slides?.length > 0 ? dbGalleryML.slides : cafeteriaGallery;
  const activeBookShopGallery = dbGalleryRH?.slides?.length > 0 ? dbGalleryRH.slides : bookSalesGallery;

  const sectionTitle = language === 'bn' 
    ? (dbGalleryML?.section_title_bn || 'আমাদের পরিসেবা') 
    : (dbGalleryML?.section_title_en || 'Our Services');

  const sectionSubtitle = language === 'bn' 
    ? (dbGalleryML?.section_subtitle_bn || '') 
    : (dbGalleryML?.section_subtitle_en || '');

  const clGalleryTitle = language === 'bn'
    ? (dbGalleryCL?.title_bn || 'কেন্দ্রীয় লাইব্রেরি')
    : (dbGalleryCL?.title_en || 'Central Library');

  const cafeGalleryTitle = language === 'bn'
    ? (dbGalleryML?.title_bn || 'ক্যাফেটেরিয়া')
    : (dbGalleryML?.title_en || 'Cafeteria');

  const bookShopGalleryTitle = language === 'bn'
    ? (dbGalleryRH?.title_bn || 'বই বিক্রয় কেন্দ্র')
    : (dbGalleryRH?.title_en || 'Book Sales Center');

  // Auto-advance intervals for individual mini galleries
  React.useEffect(() => {
    if (activeCLGallery.length === 0) return;
    const clTimer = setInterval(() => {
      setCulturalGalleryIndex((prev) => (prev + 1) % activeCLGallery.length);
    }, 4000);
    return () => clearInterval(clTimer);
  }, [activeCLGallery.length]);

  React.useEffect(() => {
    if (activeCafeGallery.length === 0) return;
    const cafeTimer = setInterval(() => {
      setMlGalleryIndex((prev) => (prev + 1) % activeCafeGallery.length);
    }, 4500);
    return () => clearInterval(cafeTimer);
  }, [activeCafeGallery.length]);

  React.useEffect(() => {
    if (activeBookShopGallery.length === 0) return;
    const bsTimer = setInterval(() => {
      setReadingGalleryIndex((prev) => (prev + 1) % activeBookShopGallery.length);
    }, 5000);
    return () => clearInterval(bsTimer);
  }, [activeBookShopGallery.length]);

  // GSAP + SplitType animation refs for Slogan & Intro Quote
  const sloganTitleRef = React.useRef<HTMLSpanElement>(null);
  const sloganQuoteRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (!sloganTitleRef.current || !sloganQuoteRef.current) return;

    let titleSplit: SplitType | null = null;
    let quoteSplit: SplitType | null = null;

    try {
      titleSplit = new SplitType(sloganTitleRef.current, { types: 'words,lines' });
      quoteSplit = new SplitType(sloganQuoteRef.current, { types: 'words,lines' });

      const ctx = gsap.context(() => {
        if (titleSplit?.words && titleSplit.words.length > 0) {
          gsap.fromTo(
            titleSplit.words,
            { opacity: 0, y: 12, filter: 'blur(3px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              stagger: 0.05,
              duration: 0.65,
              ease: 'power2.out',
            }
          );
        }

        if (quoteSplit?.words && quoteSplit.words.length > 0) {
          gsap.fromTo(
            quoteSplit.words,
            { opacity: 0, y: 8, filter: 'blur(2px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              stagger: 0.02,
              duration: 0.5,
              delay: 0.2,
              ease: 'power2.out',
            }
          );
        }
      });

      return () => {
        ctx.revert();
        titleSplit?.revert();
        quoteSplit?.revert();
      };
    } catch (err) {
      console.error('GSAP SplitType error:', err);
    }
  }, [language, dbIntroBlock]);

  const resolveActivityRoute = (act?: { id?: string; route?: string; category_bn?: string; category_en?: string; title_bn?: string; title_en?: string }) => {
    if (!act) return 'central-library';
    if (act.route && act.route !== 'home' && act.route !== 'bsk-history') {
      return act.route;
    }
    const id = (act.id || '').toLowerCase();
    if (id === 'nationwide-excellence' || id === 'nationwide_excellence' || id === 'utkorsho') return 'nationwide-excellence';
    if (id === 'reading-habit' || id === 'reading_habit' || id === 'reading-habit-dev') return 'reading-habit';
    if (id === 'book-fair' || id === 'book_fair' || id === 'boimela') return 'book-fair';
    if (id === 'aalor-ishkool' || id === 'aalor_ishkool') return 'aalor-ishkool';
    if (id === 'aalor-pathshala' || id === 'aalor_pathshala') return 'aalor-pathshala';
    if (id === 'bangalir_chinta' || id === 'bangalir-chinta') return 'bangalir_chinta';
    if (id === 'primary-teacher' || id === 'primary_teacher') return 'primary-teacher';
    if (id === 'publication' || id === 'publications') return 'publication';
    if (id === 'facilities' || id === 'facility') return 'facilities';
    if (id === 'mobile-library' || id === 'mobile_library') return 'mobile-library';
    if (id === 'central-library' || id === 'central_library' || id === 'library') return 'central-library';
    if (id === 'bookshop' || id === 'book-shop') return 'bookshop';

    const cat = ((act.category_bn || '') + ' ' + (act.category_en || '')).toLowerCase();
    const title = ((act.title_bn || '') + ' ' + (act.title_en || '')).toLowerCase();

    if (cat.includes('পাঠাভ্যাস') || title.includes('পাঠাভ্যাস') || cat.includes('reading habit') || title.includes('reading habit')) return 'reading-habit';
    if (cat.includes('দেশভিত্তিক') || cat.includes('utkorsho') || title.includes('দেশভিত্তিক') || title.includes('উৎকর্ষ')) return 'nationwide-excellence';
    if (cat.includes('বইমেলা') || cat.includes('book fair') || cat.includes('boimela') || title.includes('বইমেলা')) return 'book-fair';
    if (cat.includes('ইশকুল') || cat.includes('ishkool') || title.includes('ইশকুল')) return 'aalor-ishkool';
    if (cat.includes('পাঠশালা') || cat.includes('pathshala') || title.includes('পাঠশালা')) return 'aalor-pathshala';
    if (cat.includes('চিন্তা') || cat.includes('chinta') || title.includes('চিন্তা')) return 'bangalir_chinta';
    if (cat.includes('শিক্ষক') || title.includes('শিক্ষক') || cat.includes('teacher') || title.includes('teacher')) return 'primary-teacher';
    if (cat.includes('বিক্রয়') || cat.includes('বিক্রি') || cat.includes('bookshop') || title.includes('বিক্রয়') || title.includes('বিক্রি')) return 'bookshop';
    if (cat.includes('প্রকাশনা') || title.includes('প্রকাশনা') || cat.includes('publication') || title.includes('publication')) return 'publication';
    if (cat.includes('ভ্রাম্যমাণ') || cat.includes('mobile') || title.includes('লাইব্রেরি বাস') || title.includes('বইগাড়ি')) return 'mobile-library';
    if (cat.includes('লাইব্রেরি') || title.includes('লাইব্রেরি') || cat.includes('library') || title.includes('library') || cat.includes('কেন্দ্রীয়') || title.includes('কেন্দ্রীয়')) return 'central-library';
    if (cat.includes('সাংস্কৃতিক') || cat.includes('seminar') || title.includes('সেমিনার')) return 'facilities';
    return 'central-library';
  };

  const resolveImageUrl = (url?: string | null): string => {
    if (!url || typeof url !== 'string' || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.startsWith('./')) {
      return trimmed.substring(1);
    }
    if (!trimmed.startsWith('/')) {
      return '/' + trimmed;
    }
    return trimmed;
  };

  const resolveItemRoute = (item?: any, fallbackRoute?: string) => {
    if (!item) return fallbackRoute || 'central-library';
    if (item.route && item.route !== 'home' && item.route !== 'bsk-history') return item.route;
    const title = (item.title_bn || item.title_en || item.caption_bn || item.caption_en || '').toLowerCase();
    const cat = (item.category_bn || item.category_en || '').toLowerCase();
    if (cat.includes('দেশভিত্তিক') || cat.includes('utkorsho') || title.includes('দেশভিত্তিক') || title.includes('উৎকর্ষ')) return 'nationwide-excellence';
    if (cat.includes('বইমেলা') || cat.includes('book fair') || cat.includes('boimela') || title.includes('বইমেলা')) return 'book-fair';
    if (cat.includes('ভ্রাম্যমাণ') || cat.includes('mobile') || title.includes('লাইব্রেরি বাস') || title.includes('বইগাড়ি')) return 'mobile-library';
    if (cat.includes('কেন্দ্রীয়') || cat.includes('লাইব্রেরি') || cat.includes('library') || title.includes('লাইব্রেরি') || title.includes('কেন্দ্রীয়')) return 'central-library';
    if (cat.includes('পাঠাভ্যাস') || cat.includes('reading') || title.includes('পুরস্কার')) return 'reading-habit';
    if (cat.includes('ইশকুল') || title.includes('ইশকুল')) return 'aalor-ishkool';
    if (cat.includes('পাঠশালা') || title.includes('পাঠশালা')) return 'aalor-pathshala';
    if (cat.includes('চিন্তা') || title.includes('চিন্তা')) return 'bangalir_chinta';
    if (cat.includes('শিক্ষক') || title.includes('শিক্ষক')) return 'primary-teacher';
    if (cat.includes('বিক্রয়') || cat.includes('বিক্রি') || cat.includes('bookshop') || title.includes('বিক্রয়') || title.includes('বিক্রি')) return 'bookshop';
    if (cat.includes('প্রকাশনা') || title.includes('প্রকাশনা')) return 'publication';
    if (cat.includes('সাংস্কৃতিক') || cat.includes('seminar') || title.includes('সেমিনার') || title.includes('বক্তৃতা')) return 'facilities';
    return fallbackRoute || 'central-library';
  };

  React.useEffect(() => {
    if (activeCLGallery.length === 0) return;
    const clTimer = setInterval(() => {
      setCulturalGalleryIndex((prev) => (prev + 1) % activeCLGallery.length);
    }, 5000);
    return () => clearInterval(clTimer);
  }, [activeCLGallery.length]);

  React.useEffect(() => {
    if (heroSlides.length === 0) return;
    const heroTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, [heroSlides.length]);

  React.useEffect(() => {
    if (recentActivities.length === 0) return;
    const actTimer = setInterval(() => {
      nextAct();
    }, 5000);
    return () => clearInterval(actTimer);
  }, [recentActivities.length]);

  React.useEffect(() => {
    if (heroSlides.length > 0 && currentHeroSlide >= heroSlides.length) {
      setCurrentHeroSlide(0);
    }
  }, [heroSlides.length, currentHeroSlide]);

  React.useEffect(() => {
    if (recentActivities.length > 0 && actIndex >= recentActivities.length) {
      setActIndex(0);
    }
  }, [recentActivities.length, actIndex]);

  // Gallery Navigation helpers
  const nextAct = () => {
    if (recentActivities.length === 0) return;
    setActIndex((prev) => (prev + 1) % recentActivities.length);
  };

  const prevAct = () => {
    if (recentActivities.length === 0) return;
    setActIndex((prev) => (prev - 1 + recentActivities.length) % recentActivities.length);
  };

  const getVisibleActivities = () => {
    const visibleCards = [];
    if (recentActivities.length === 0) return [];
    for (let i = 0; i < 3; i++) {
      const item = recentActivities[(actIndex + i) % recentActivities.length];
      if (item) {
        visibleCards.push(item);
      }
    }
    return visibleCards;
  };

  // Helper route resolvers to guarantee accurate internal linking to specific pages
  const resolveHeroSlideRoute = (slide?: { route?: string; title_bn?: string; title_en?: string; badge_bn?: string; badge_en?: string }) => {
    if (!slide) return 'mobile-library';
    if (slide.route && slide.route !== 'home' && slide.route !== 'bsk-history') {
      return slide.route;
    }
    const txt = ((slide.title_bn || '') + ' ' + (slide.badge_bn || '') + ' ' + (slide.title_en || '')).toLowerCase();
    if (txt.includes('ভ্রাম্যমাণ') || txt.includes('mobile')) return 'mobile-library';
    if (txt.includes('উৎকর্ষ') || txt.includes('বইপড়া') || txt.includes('reading')) return 'reading-habit';
    if (txt.includes('ইশকুল') || txt.includes('ishkool') || txt.includes('সেমিনার')) return 'aalor-ishkool';
    if (txt.includes('লাইব্রেরি') || txt.includes('library')) return 'central-library';
    if (txt.includes('পাঠশালা') || txt.includes('pathshala')) return 'aalor-pathshala';
    if (txt.includes('চিন্তা') || txt.includes('chinta')) return 'bangalir_chinta';
    if (txt.includes('শিক্ষক') || txt.includes('teacher')) return 'primary-teacher';
    if (txt.includes('প্রকাশনা') || txt.includes('publication')) return 'publication';
    if (txt.includes('ভবন') || txt.includes('building')) return 'building';
    if (txt.includes('প্রতিষ্ঠাতা') || txt.includes('founder')) return 'founder';
    if (txt.includes('ইতিহাস') || txt.includes('history')) return 'bsk-history';
    if (txt.includes('এক নজরে') || txt.includes('at a glance') || txt.includes('আলোকযাত্রা')) return 'ataglance';
    return 'mobile-library';
  };

  const resolveProgramRoute = (prog?: any) => {
    return resolveActivityRoute(prog);
  };

  const resolveMiniGalleryRoute = (item?: any, fallbackRoute?: string) => {
    return resolveItemRoute(item, fallbackRoute);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1207] font-sans">
      {/* ── SECTION 1: HERO SLIDER (EDITORIAL ORGANIC CURVE HERO) ── */}
      <div 
        className="relative w-full h-[380px] xs:h-[440px] sm:h-[68vh] md:h-[76vh] lg:h-[84vh] xl:h-[88vh] min-h-[380px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[660px] max-h-[880px] bg-stone-950 group select-none overflow-hidden"
      >
        
        {/* Full Image Slide Background - Natural cover fitting on both mobile & desktop */}
        {(() => {
          const currentSlide = heroSlides[currentHeroSlide] || defaultHeroSlides[0];
          const rawImg = currentSlide?.bgImage || currentSlide?.bg_image || currentSlide?.image || currentSlide?.banner_image || '';
          const slideImg = resolveImageUrl(rawImg) || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop';
          return (
            <AnimatePresence mode="wait">
              <motion.img
                key={`${currentHeroSlide}-${slideImg}`}
                src={slideImg}
                alt={currentSlide?.title_bn || 'Hero Slide'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop';
                }}
                initial={{ opacity: 0, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full object-cover object-center hero-slider-img gpu-accelerated pointer-events-none filter contrast-[1.04] saturate-[1.06] brightness-[1.02]"
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>
          );
        })()}

        {/* Deep Contrast Multi-Stop Editorial Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 pointer-events-none z-10" />

        {/* Top-Right Floating Luxury Slide Controls & Indicators */}
        <div 
          className="absolute top-3 right-3 sm:top-8 sm:right-10 z-30 flex items-center space-x-2.5 sm:space-x-4 bg-black/60 backdrop-blur-md border border-white/25 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dots */}
          <div className="flex items-center space-x-1.5">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentHeroSlide === idx ? 'w-4 sm:w-6 bg-[#F0CC7A]' : 'w-1.5 bg-white/40 hover:bg-white/90'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="flex items-center space-x-1 border-l border-white/20 pl-2 sm:pl-3">
            <button
              onClick={() => {
                if (heroSlides.length === 0) return;
                setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
              }}
              className="p-0.5 sm:p-1 rounded-full text-white hover:text-white transition hover:bg-white/20 cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </button>
            <button
              onClick={() => {
                if (heroSlides.length === 0) return;
                setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
              }}
              className="p-0.5 sm:p-1 rounded-full text-white hover:text-white transition hover:bg-white/20 cursor-pointer"
              title="Next"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Floating Banner Caption Overlay */}
        {(() => {
          const currentSlide = heroSlides[currentHeroSlide] || defaultHeroSlides[0];
          return (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-[155px] md:bottom-[185px] lg:bottom-[215px] sm:left-10 md:left-16 z-20 sm:max-w-xl md:max-w-2xl text-left pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroSlide}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-1.5 sm:space-y-3"
                >
                  <div className="inline-block">
                    <span 
                      className="px-2.5 py-1 bg-[#B8862A] !text-white rounded-md text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase shadow-md inline-block"
                      style={{ color: '#ffffff' }}
                    >
                      {language === 'bn' ? (currentSlide?.badge_bn || '') : (currentSlide?.badge_en || '')}
                    </span>
                  </div>
                  
                  <h2 
                    className="font-serif text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold !text-white leading-tight"
                    style={{ 
                      color: '#ffffff',
                      textShadow: '0 2px 14px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)'
                    }}
                  >
                    {language === 'bn' ? (currentSlide?.title_bn || '') : (currentSlide?.title_en || '')}
                  </h2>

                  <p 
                    className="font-sans text-xs sm:text-sm md:text-base/relaxed !text-white max-w-xl hidden sm:block font-medium"
                    style={{ 
                      color: '#ffffff',
                      textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)'
                    }}
                  >
                    {language === 'bn' ? (currentSlide?.desc_bn || '') : (currentSlide?.desc_en || '')}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Desktop-Only Organic Cave-like Curve Cut-out on Bottom-Right Corner */}
        <div className="hidden sm:block absolute -bottom-px inset-x-0 z-20 pointer-events-none h-[175px] md:h-[195px] lg:h-[225px] w-full leading-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 260" 
            className="w-full h-full text-[#FAF7F2] block pointer-events-none filter drop-shadow-[0_-6px_12px_rgba(0,0,0,0.16)]"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M 0,260 L 1440,260 L 1440,0 C 1180,45 920,150 680,198 C 420,235 200,252 0,260 Z" 
              fill="currentColor" 
            />
          </svg>

          {/* Organic Curve Area Text Content - Positioned Snug on Right Edge & Bounded for Desktop */}
          <div 
            className="absolute top-[50%] -translate-y-[50%] right-3.5 md:right-5 lg:right-6 z-30 flex flex-col items-end text-right space-y-1.5 md:space-y-2 pointer-events-auto select-none overflow-hidden max-h-[96%]"
            style={{
              width: 'clamp(280px, 48vw, 680px)',
              maxWidth: 'calc(100% - 16px)',
            }}
          >
            <div className="flex flex-col items-end space-y-1.5 w-full text-right transform-none mb-1">
              <span 
                ref={sloganTitleRef}
                className="font-serif font-black tracking-normal sm:tracking-[0.04em] text-[#1D3E2D] leading-tight sm:leading-snug drop-shadow-2xs inline-block break-words max-w-full text-right"
                style={{
                  fontSize: 'clamp(20px, 2.2vw, 38px)',
                }}
              >
                {language === 'bn' ? 'আলোকিত মানুষ চাই' : 'Seeking Enlightened Souls'}
              </span>
              <div className="flex items-center justify-end w-full pt-0.5">
                <div 
                  className="h-[2.5px] bg-gradient-to-l from-[#B8862A] via-[#C9983B] to-transparent rounded-full opacity-90"
                  style={{ width: 'clamp(120px, 18vw, 280px)', maxWidth: '90%' }}
                />
              </div>
            </div>

            <p 
              ref={sloganQuoteRef}
              className="text-[#1F1915] font-serif font-medium italic tracking-normal break-words w-full text-right pl-3 mt-2 [text-wrap:balance]"
              style={{ 
                fontSize: 'clamp(12px, 1.15vw, 16.5px)',
                lineHeight: 'clamp(1.5, 1.5vw, 1.8)',
                overflowWrap: 'break-word', 
                wordBreak: 'break-word' 
              }}
            >
              {dbIntroBlock ? (
                language === 'bn' ? dbIntroBlock.text_bn : dbIntroBlock.text_en
              ) : (
                language === 'bn' 
                  ? '“বিশ্বসাহিত্য\u00A0কেন্দ্র আজ আর শুধুমাত্র একটি\u00A0প্রতিষ্ঠান\u00A0নয়। এটি আজ একটি\u00A0দেশব্যাপী\u00A0আন্দোলন—আলোকিত\u00A0জাতীয়\u00A0চিত্তের একটি বিনীত\u00A0নিশ্চয়তা।”'
                  : '"Bishwo Shahitto Kendro today is not just an institution. It is a countryscale movement—a humble assurance of an enlightened national mind."'
              )}
            </p>
          </div>
        </div>

      </div>

      {/* ── MOBILE-ONLY SLOGAN & QUOTE INFOGRAPHIC BLOCK ── */}
      <div className="block sm:hidden bg-[#FAF7F2] border-b border-[#E6DEC8] px-5 py-4 space-y-2 relative z-30 shadow-xs">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-end text-right space-y-1.5"
        >
          <div className="flex flex-col items-end space-y-1 w-full text-right">
            <span className="font-serif font-black text-[#1D3E2D] text-lg sm:text-xl leading-tight">
              {language === 'bn' ? 'আলোকিত মানুষ চাই' : 'Seeking Enlightened Souls'}
            </span>
            <div className="h-[2px] bg-gradient-to-l from-[#B8862A] via-[#C9983B] to-transparent rounded-full w-28 opacity-90" />
          </div>

          <p className="text-[#1F1915] font-serif font-medium italic text-xs/relaxed text-right pt-0.5">
            {dbIntroBlock ? (
              language === 'bn' ? dbIntroBlock.text_bn : dbIntroBlock.text_en
            ) : (
              language === 'bn' 
                ? '“বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি প্রতিষ্ঠান নয়। এটি আজ একটি দেশব্যাপী আন্দোলন—আলোকিত জাতীয় চিত্তের একটি বিনীত নিশ্চয়তা।”'
                : '"Bishwo Shahitto Kendro today is not just an institution. It is a countryscale movement—a humble assurance of an enlightened national mind."'
            )}
          </p>
        </motion.div>
      </div>

      {/* Container for the rest of Dashboard content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10 w-full space-y-12 relative z-30 pt-4">

      {/* ── SECTION 0: WHO WE ARE (আমরা কারা - SIMPLE CENTER ALIGNED) ── */}
      {(() => {
        const homeData = homePageData || websiteContentJson.find((p: any) => p.id === 'home') || {};
        const title = language === 'bn' 
          ? (dbWhoWeAreBlock?.title_bn || homeData.who_we_are_title_bn || 'আমরা কারা') 
          : (dbWhoWeAreBlock?.title_en || homeData.who_we_are_title_en || 'Who We Are');
        
        const subtitle = language === 'bn' 
          ? (dbWhoWeAreBlock?.subtitle_bn || homeData.who_we_are_subtitle_bn || 'আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন') 
          : (dbWhoWeAreBlock?.subtitle_en || homeData.who_we_are_subtitle_en || 'A transformative nation-building movement cultivating enlightened minds and noble human values');

        const mottoText = language === 'bn'
          ? (dbWhoWeAreBlock?.motto_bn || 'মূল ব্রত: “আলোকিত মানুষ চাই”')
          : (dbWhoWeAreBlock?.motto_en || 'Core Creed: “We Want Enlightened Humans”');

        const estText = language === 'bn'
          ? (dbWhoWeAreBlock?.established_bn || dbWhoWeAreBlock?.est_bn || 'প্রতিষ্ঠা: ১৭ ডিসেম্বর ১৯৭৮')
          : (dbWhoWeAreBlock?.established_en || dbWhoWeAreBlock?.est_en || 'Established: December 17, 1978');

        const paragraphs: string[] = (language === 'bn' 
          ? (dbWhoWeAreBlock?.paragraphs_bn || homeData.who_we_are_paragraphs_bn) 
          : (dbWhoWeAreBlock?.paragraphs_en || homeData.who_we_are_paragraphs_en)) || [
            language === 'bn'
              ? "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।"
              : "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
            language === 'bn'
              ? "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।"
              : "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations."
          ];

        const bannerImg = dbWhoWeAreBlock?.banner_image || dbWhoWeAreBlock?.image || '';

        const defaultPillars = [
          {
            title_bn: 'দেশব্যাপী বইপড়া কর্মসূচি',
            title_en: 'Nationwide Reading',
            desc_bn: 'স্কুল-কলেজের শিক্ষার্থীদের মাঝে পাঠাভ্যাস ও মননশীলতা গড়ে তোলার প্রয়াস।',
            desc_en: 'Cultivating habitual reading in school and college students.',
            icon: '📚'
          },
          {
            title_bn: 'ভ্রাম্যমাণ লাইব্রেরি সেবা',
            title_en: 'Mobile Library Service',
            desc_bn: 'দেশজুড়ে পাঠকের দোরগোড়ায় সমৃদ্ধ বইয়ের বিশাল সম্ভার পৌঁছে দেওয়া।',
            desc_en: 'Delivering thousands of books right to reader doorsteps.',
            icon: '🚐'
          },
          {
            title_bn: 'পাঠচক্র ও উন্মুক্ত আলোচনা',
            title_en: 'Study Circles & Dialogues',
            desc_bn: 'বিশ্বের শ্রেষ্ঠ সাহিত্য ও দর্শন নিয়ে গভীর অধ্যয়ন এবং মুক্তচিন্তার বিকাশ।',
            desc_en: 'Deep studies in global literature and critical thought.',
            icon: '💡'
          },
          {
            title_bn: 'সাংস্কৃতিক উৎকর্ষ ও নেতৃত্ব',
            title_en: 'Cultural Excellence',
            desc_bn: 'শিল্প, সংগীত, চলচ্চিত্র ও মানবীয় মূল্যবোধে জাগ্রত মানবিক নেতৃত্ব গঠন।',
            desc_en: 'Developing leadership rooted in art and human dignity.',
            icon: '✨'
          }
        ];

        const rawPillars = Array.isArray(dbWhoWeAreBlock?.pillars) && dbWhoWeAreBlock.pillars.length > 0
          ? dbWhoWeAreBlock.pillars
          : defaultPillars;

        return (
          <section className="py-6 md:py-10 text-center animate-fade-in space-y-6">
            <div className="max-w-4xl mx-auto px-4 space-y-4">
              {/* Centered Heading */}
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1207] tracking-tight">
                {title}
              </h2>

              {/* Subtle Decorative Line */}
              <div className="w-16 h-1 bg-[#B8862A] rounded-full mx-auto" />

              {/* Centered Subtitle / Tagline */}
              {subtitle && (
                <p className="text-sm md:text-base font-serif text-[#8B621B] font-medium max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}

              {/* Centered Descriptive Paragraphs */}
              <div className="space-y-4 pt-2">
                {paragraphs.map((pText, pIdx) => (
                  <p 
                    key={pIdx} 
                    className="font-serif text-stone-700 text-sm md:text-base lg:text-lg leading-relaxed text-center max-w-3xl mx-auto"
                  >
                    {pText}
                  </p>
                ))}
              </div>


            </div>
          </section>
        );
      })()}

      {/* ── SECTION 1: ENLARGED FOUNDER & PRESIDENT SPOTLIGHT (PROTHISTATAR BANI) ── */}
      <div className="pt-2 pb-6">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center text-[#1A1207]`}>
          
          {/* Column 1: Founder Image / Frame (Clean & Free - No border box) */}
          <div className={`flex items-center justify-center w-full select-none animate-fade-in ${dbFounderBlock?.image_position === 'right' ? 'md:order-last' : 'md:order-first'}`}>
            <div className="relative w-full max-w-[480px] rounded-2xl overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
              <img 
                src={dbFounderBlock?.image || founderPageData?.founder_avatar || "https://bskbd.org/assets/img/logo_bn2.png"} 
                alt="Prof. Abdullah Abu Sayeed" 
                className="w-full h-auto object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Column 2: Details / Text */}
          <div className={`space-y-5 text-left w-full ${dbFounderBlock?.image_position === 'right' ? 'md:order-first' : 'md:order-last'}`}>
            
            {/* Title / Name & Subtitle */}
            {(() => {
              const nameText = dbFounderBlock
                ? (language === 'bn' ? dbFounderBlock.name_bn : dbFounderBlock.name_en)
                : (language === 'bn' ? (founderPageData?.founder_name_bn || 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ') : (founderPageData?.founder_name_en || 'Prof. Abdullah Abu Sayeed'));
              
              const customSubtitle = dbFounderBlock 
                ? (language === 'bn' ? dbFounderBlock.subtitle_bn : dbFounderBlock.subtitle_en)
                : '';

              if (!nameText && !customSubtitle) return null;

              return (
                <div className="space-y-1.5">
                  {nameText && nameText.trim() && (
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#1A1207] leading-tight">
                      {nameText}
                    </h3>
                  )}
                  {customSubtitle && customSubtitle.trim() && (
                    <p className="text-xs sm:text-sm font-mono text-[#B8862A] uppercase tracking-wide font-bold">
                      {customSubtitle.trim()}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Quote Block (Renders ONLY if quote text exists) */}
            {(() => {
              const quoteText = dbFounderBlock
                ? (language === 'bn' ? dbFounderBlock.quote_bn : dbFounderBlock.quote_en)
                : (language === 'bn' 
                    ? (founderPageData?.founder_quotes?.[0]?.text_bn || '“ক্ষুদ্র মানুষ আর বড় জাতি একসঙ্গে বাস করতে পারে না। যদি বড় জাতি গড়তে চাই, তবে বড় মনের মানুষ তৈরি করতে হবে। বই পড়ার মাধ্যমে মানুষের আত্মার পরিধি বৃদ্ধি পায় আর সেই আলোকিত মানুষই সমাজকে বদলে দিতে সমর্থ হয়।”') 
                    : (founderPageData?.founder_quotes?.[0]?.text_en || '"Small minds and a grand nation cannot coexist. If we want to build a grand nation, we must nurture expanded souls first."'));
              
              if (!quoteText || !quoteText.trim()) return null;

              const authorName = dbFounderBlock
                ? (language === 'bn' ? dbFounderBlock.name_bn : dbFounderBlock.name_en)
                : (language === 'bn' ? (founderPageData?.founder_name_bn || 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ') : (founderPageData?.founder_name_en || 'Prof. Abdullah Abu Sayeed'));

              return (
                <div className="relative border-l-4 border-[#B8862A] pl-5 py-1.5 space-y-2.5 bg-[#FAF7F2]/50 rounded-r-xl pr-4">
                  <p className="font-serif text-sm sm:text-base lg:text-lg text-stone-800 leading-relaxed italic font-medium">
                    {quoteText}
                  </p>
                  {authorName && authorName.trim() && (
                    <div className="text-xs text-stone-500 font-mono font-bold">— {authorName}</div>
                  )}
                </div>
              );
            })()}

            {/* Quote Block (Renders ONLY if show_quote is not false and quote text exists) */}
            {(() => {
              if (dbFounderBlock?.show_quote === false) return null;

              const quoteText = dbFounderBlock
                ? (language === 'bn' ? dbFounderBlock.quote_bn : dbFounderBlock.quote_en)
                : (language === 'bn' 
                    ? (founderPageData?.founder_quotes?.[0]?.text_bn || '“ক্ষুদ্র মানুষ আর বড় জাতি একসঙ্গে বাস করতে পারে না। যদি বড় জাতি গড়তে চাই, তবে বড় মনের মানুষ তৈরি করতে হবে। বই পড়ার মাধ্যমে মানুষের আত্মার পরিধি বৃদ্ধি পায় আর সেই আলোকিত মানুষই সমাজকে বদলে দিতে সমর্থ হয়।”') 
                    : (founderPageData?.founder_quotes?.[0]?.text_en || '"Small minds and a grand nation cannot coexist. If we want to build a grand nation, we must nurture expanded souls first."'));
              
              if (!quoteText || !quoteText.trim()) return null;

              const authorName = dbFounderBlock
                ? (language === 'bn' ? dbFounderBlock.name_bn : dbFounderBlock.name_en)
                : (language === 'bn' ? (founderPageData?.founder_name_bn || 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ') : (founderPageData?.founder_name_en || 'Prof. Abdullah Abu Sayeed'));

              return (
                <div className="relative border-l-4 border-[#B8862A] pl-5 py-1.5 space-y-2.5 bg-[#FAF7F2]/50 rounded-r-xl pr-4">
                  <p className="font-serif text-sm sm:text-base lg:text-lg text-stone-800 leading-relaxed italic font-medium">
                    {quoteText}
                  </p>
                  {authorName && authorName.trim() && (
                    <div className="text-xs text-stone-500 font-mono font-bold">— {authorName}</div>
                  )}
                </div>
              );
            })()}

            {/* Philosophy / Description details (Renders ONLY if show_philosophy is not false) */}
            {(() => {
              if (dbFounderBlock?.show_philosophy === false) return null;

              const phil = language === 'bn' 
                ? (dbFounderBlock?.philosophy_bn || '')
                : (dbFounderBlock?.philosophy_en || dbFounderBlock?.philosophy_bn || '');
              if (!phil || !phil.trim()) return null;
              return (
                <p className="text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
                  {phil}
                </p>
              );
            })()}

            {/* Badges / Awards (Renders ONLY if show_badges is not false) */}
            {(() => {
              if (dbFounderBlock?.show_badges === false) return null;

              const badgesList: string[] = [];
              if (dbFounderBlock) {
                const b1 = (language === 'bn' ? dbFounderBlock.badge1_bn : dbFounderBlock.badge1_en) || '';
                const b2 = (language === 'bn' ? dbFounderBlock.badge2_bn : dbFounderBlock.badge2_en) || '';
                const b3 = (language === 'bn' ? dbFounderBlock.badge3_bn : dbFounderBlock.badge3_en) || '';
                [b1, b2, b3].forEach((b) => {
                  if (b && b.trim()) badgesList.push(b.trim());
                });
              } else if (founderPageData?.founder_badges && Array.isArray(founderPageData.founder_badges)) {
                founderPageData.founder_badges.forEach((b) => {
                  const label = (language === 'bn' ? b.label_bn : b.label_en) || '';
                  if (label.trim()) badgesList.push(label.trim());
                });
              }

              if (badgesList.length === 0) return null;

              return (
                <div className="flex flex-wrap gap-2 pt-1 font-mono">
                  {badgesList.map((bText, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#FAF7F2] text-[#B8862A] border border-[#B8862A]/30 text-[9px] sm:text-[10px] font-bold uppercase rounded">
                      {bText}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* Biography Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2 items-center">
              {(() => {
                if (dbFounderBlock?.show_btn === false) return null;

                const btnTxt = language === 'bn' 
                  ? (dbFounderBlock?.btn_text_bn !== undefined ? dbFounderBlock.btn_text_bn : 'জীবনী ও সাক্ষাৎকার পড়ুন')
                  : (dbFounderBlock?.btn_text_en !== undefined ? dbFounderBlock.btn_text_en : 'Read Biography & Interviews');
                if (!btnTxt || !btnTxt.trim()) return null;
                return (
                  <button
                    onClick={() => onNavigate(dbFounderBlock?.btn_route || 'founder')}
                    className="px-6 py-2.5 bg-[#1A1207] hover:bg-stone-900 text-[#FAF7F2] hover:text-[#B8862A] font-extrabold text-xs transition duration-200 cursor-pointer flex items-center space-x-1.5 rounded-lg shadow-sm"
                  >
                    <span>{btnTxt}</span>
                    <span>→</span>
                  </button>
                );
              })()}
              
              {/* Visitor Indicator Widget (Renders ONLY if show_visitor_counter is not false) */}
              {dbFounderBlock?.show_visitor_counter !== false && Boolean(dbFounderBlock?.visitor_count) && (
                <div className="px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg flex items-center space-x-2 text-[10.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                  <span className="font-mono text-stone-600 font-semibold">
                    {language === 'bn' 
                      ? `${dbFounderBlock.visitor_count} ${dbFounderBlock.visitor_label_bn || 'জন ভিজিটর দেখেছেন'}` 
                      : `Visited by ${dbFounderBlock.visitor_count_en || dbFounderBlock.visitor_count}`}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: KEY 8 DEPARTMENTS & PROGRAMS SEAMLESS CUSTOM SWIPER SLIDER ── */}
      <div 
        className="pt-4 pb-8" 
        onMouseEnter={() => setIsPlayingPrograms(false)} 
        onMouseLeave={() => setIsPlayingPrograms(true)}
      >
        {/* Section Header */}
        <div className="pb-3 mb-6 border-b border-[#E8DDD0]/60 flex justify-between items-center gap-2">
          <h3 className="font-serif text-xl font-extrabold text-[#1A1207] tracking-wide">
            {language === 'bn' ? 'কার্যক্রমসমূহ' : 'Activities'}
          </h3>
        </div>

        {/* Swiper Slider Wrapper Wrapper */}
        <div className="relative flex items-center group/slider">
          {/* Left Chevron Trigger */}
          <button
            onClick={() => { scrollToProgramIndex(activeProgramIndex - 1); setIsPlayingPrograms(false); }}
            className="absolute -left-2 md:-left-4 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#1A0A08]/90 hover:bg-[#B8862A] border border-white/10 hover:border-transparent text-white hover:text-stone-950 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg select-none"
            title="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 stroke-[1.8]" />
          </button>

          {/* Right Chevron Trigger */}
          <button
            onClick={() => { scrollToProgramIndex(activeProgramIndex + 1); setIsPlayingPrograms(false); }}
            className="absolute -right-2 md:-right-4 z-30 h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#1A0A08]/90 hover:bg-[#B8862A] border border-white/10 hover:border-transparent text-white hover:text-stone-950 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg select-none"
            title="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 stroke-[1.8]" />
          </button>

          {/* Multi-item Horizontal Scrolling Area */}
          <div
            ref={programSliderRef}
            onScroll={handleProgramSliderScroll}
            className="w-full flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none py-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeProgramsList.map((program, idx) => {
              const isCurrentActive = activeProgramIndex === idx;
              const programId = (program.id || '').toLowerCase();
              const programObj = program as any;
              const targetRoute = (programObj.route && programObj.route !== 'home' && programObj.route !== 'bsk-history')
                ? programObj.route
                : (
                    programId === 'nationwide-excellence' || programId === 'nationwide_excellence' || programId === 'utkorsho' ? 'nationwide-excellence' :
                    programId === 'reading-habit' || programId === 'reading-habit-dev' || programId === 'reading_habit' ? 'reading-habit' :
                    programId === 'book-fair' || programId === 'book_fair' || programId === 'boimela' ? 'book-fair' :
                    programId === 'mobile-library' || programId === 'mobile_library' ? 'mobile-library' :
                    programId === 'central-library' || programId === 'central_library' ? 'central-library' :
                    programId === 'aalor-ishkool' || programId === 'aalor_ishkool' ? 'aalor-ishkool' :
                    programId === 'aalor-pathshala' || programId === 'aalor_pathshala' ? 'aalor-pathshala' :
                    programId === 'bangalir_chinta' || programId === 'bangalir-chinta' ? 'bangalir_chinta' :
                    programId === 'primary-teacher' || programId === 'primary_teacher' ? 'primary-teacher' :
                    programId === 'publication' || programId === 'publications' ? 'publication' :
                    programId === 'facilities' || programId === 'facility' ? 'facilities' :
                    resolveProgramRoute(program)
                  );

              return (
                <div
                  key={program.id + '-slide-' + idx}
                  onClick={() => onNavigate(targetRoute)}
                  className={`group/card shrink-0 w-[190px] sm:w-[210px] md:w-[230px] snap-center cursor-pointer select-none bg-transparent flex flex-col justify-start text-center ${
                    isCurrentActive ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-80'
                  } transition-all duration-300`}
                >
                  {/* Centered Top Title (Exactly as বিজ্ঞানচিন্তা in screenshots) */}
                  <div className="font-serif text-[13px] md:text-[14px] font-bold text-[#1A1207] group-hover/card:text-[#B8862A] transition-all duration-200 tracking-wide mb-2 min-h-[36px] flex items-center justify-center leading-tight">
                    {language === 'bn' ? program.title_bn : program.title_en}
                  </div>

                  {/* Highly Polished Portrait Image Area - Beautifully Framed with Rounded Borders (Taller aspect ratio for spectacular presentation) */}
                  <div className="relative aspect-[2/3] w-full rounded-xl border border-[#B8862A]/35 overflow-hidden transition-all duration-300 group-hover/card:border-[#B8862A]/70">
                    {/* Scalable background photo */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-106"
                      style={{ backgroundImage: `url(${program.bgImage})` }}
                    />
                    
                    {/* Subtle bottom-only vignette to keep images 100% bright, vivid and clear */}
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none" />

                    {/* Bottom detail card info */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent text-left flex flex-col justify-end space-y-1.5 transition-transform duration-300">
                      <p className="!text-white text-[11.5px] sm:text-[12px]/relaxed font-medium line-clamp-3 font-sans !text-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {language === 'bn' ? program.desc_bn : program.desc_en}
                      </p>
                      
                      <div className="flex items-center justify-between !text-white group-hover/card:!text-[#F0CC7A] text-[10.5px] font-bold tracking-wider font-sans uppercase leading-none pt-1.5 border-t border-white/30">
                        <span className="!text-white group-hover/card:!text-[#F0CC7A]">{language === 'bn' ? 'কার্যক্রম বিস্তারিত' : 'View Details'}</span>
                        <span className="transform group-hover/card:translate-x-1.5 transition-transform text-[#F0CC7A]">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot Slides Indicators */}
        <div className="flex justify-center items-center space-x-1.5 mt-4 relative z-10">
          {activeProgramsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { scrollToProgramIndex(idx); setIsPlayingPrograms(false); }}
              className={`h-1 cursor-pointer transition-all duration-300 rounded-full ${
                activeProgramIndex === idx 
                  ? 'w-5 bg-[#B8862A]' 
                  : 'w-1.5 bg-stone-300 hover:bg-stone-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── SECTION 2: UPCOMING ACTIVITIES GALLERY HERO SLIDER (CAROUSEL 2) - আসন্ন কার্যক্রমসমূহ ও ব্যানার ২ ── */}
      <div className="pt-2 pb-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-2 border-b border-[#E8DDD0]/30">
          <div>
            <h3 className="font-serif text-xl font-extrabold text-[#1A1207] tracking-wide flex items-center gap-2">
              <span className="text-[#B8862A]">●</span>
              {language === 'bn' 
                ? (dbGalleryRH?.title_bn || 'আসন্ন কার্যক্রমসমূহ') 
                : (dbGalleryRH?.title_en || 'Upcoming Activities')}
            </h3>
            {Boolean(language === 'bn' ? dbGalleryRH?.section_subtitle_bn : dbGalleryRH?.section_subtitle_en) && (
              <p className="text-xs text-[#6B5135] font-sans mt-0.5">
                {language === 'bn' ? dbGalleryRH?.section_subtitle_bn : dbGalleryRH?.section_subtitle_en}
              </p>
            )}
          </div>
          

        </div>

        {/* Gallery Slider Outer Card Frame - FULL SLIDE IMAGE SLIDER */}
        <div 
          id="recent-activities-carousel" 
          onClick={() => {
            const act = recentActivities[actIndex];
            onNavigate(resolveActivityRoute(act));
          }}
          className="group/act relative w-full h-[350px] sm:h-[420px] md:h-[500px] lg:h-[560px] border border-[#B8862A]/20 rounded-2xl bg-stone-900 select-none shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer overflow-hidden"
        >
          {/* Full Background Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={actIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${recentActivities[actIndex]?.image || ''})` }}
            />
          </AnimatePresence>

          {/* Subtle Bottom Gradient Shadow Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

          {/* Side Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevAct();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-[#B8862A] backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shadow-lg opacity-80 group-hover/act:opacity-100"
            title={language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextAct();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-[#B8862A] backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shadow-lg opacity-80 group-hover/act:opacity-100"
            title={language === 'bn' ? 'পরবর্তী' : 'Next'}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Bottom Left Slide Dots */}
          <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6 z-20 flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-md">
              {recentActivities.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    actIndex === idx ? 'w-8 bg-[#F0CC7A]' : 'w-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Right Image Caption Overlay Box */}
          {(() => {
            const act = recentActivities[actIndex];
            const captionText = language === 'bn'
              ? (act?.caption_bn || act?.title_bn || act?.desc_bn)
              : (act?.caption_en || act?.title_en || act?.desc_en);

            if (!captionText) return null;

            return (
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-6 z-20 max-w-[70%] sm:max-w-md md:max-w-lg bg-black/75 backdrop-blur-md border border-white/20 rounded-xl p-2.5 sm:p-3.5 text-white shadow-xl pointer-events-auto flex flex-col items-end text-right gap-1 transition-all">
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {Boolean(language === 'bn' ? act?.category_bn : act?.category_en) && (
                    <span className="px-2 py-0.5 bg-[#B8862A] text-white rounded text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                      {language === 'bn' ? act?.category_bn : act?.category_en}
                    </span>
                  )}
                  {Boolean(language === 'bn' ? act?.date_bn : act?.date_en) && (
                    <span className="text-[10px] text-stone-300 font-mono hidden xs:inline-block">
                      {language === 'bn' ? act?.date_bn : act?.date_en}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium font-serif leading-snug text-stone-100 drop-shadow-sm line-clamp-2">
                  {captionText}
                </p>
              </div>
            );
          })()}
        </div>
      </div>



      {/* ── SECTION 4: ACTIVE PROGRAM GALLERIES (3 Mini Galleries with Interactive Click-to-Expand Animation) ── */}
      {(() => {
        const miniGalleries = [
          {
            key: 'A' as const,
            title: clGalleryTitle,
            index: culturalGalleryIndex,
            setIndex: setCulturalGalleryIndex,
            slides: activeCLGallery,
            defaultRoute: 'central-library',
          },
          {
            key: 'B' as const,
            title: cafeGalleryTitle,
            index: mlGalleryIndex,
            setIndex: setMlGalleryIndex,
            slides: activeCafeGallery,
            defaultRoute: 'cafe',
          },
          {
            key: 'C' as const,
            title: bookShopGalleryTitle,
            index: readingGalleryIndex,
            setIndex: setReadingGalleryIndex,
            slides: activeBookShopGallery,
            defaultRoute: 'bookshop',
          },
        ];

        return (
          <div className="space-y-4 text-left pt-2 pb-2">
            <div className="pb-3 border-b border-[#E8DDD0]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-extrabold text-[#1A1207] flex items-center gap-2">
                  <span>{sectionTitle}</span>
                </h3>
                <p className="text-[10px] text-stone-500 font-sans">
                  {sectionSubtitle}
                </p>
              </div>

              {hoveredMiniGallery !== null && (
                <button
                  onClick={() => setHoveredMiniGallery(null)}
                  className="px-3 py-1.5 bg-[#B8862A]/15 hover:bg-[#B8862A] text-[#B8862A] hover:text-stone-950 border border-[#B8862A]/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সকল ৩টি গ্যালারি একসাথে দেখুন' : 'View All 3 Galleries'}</span>
                </button>
              )}
            </div>

            {/* 3 Horizontal Mini Galleries Container */}
            <div className="space-y-6">
              {hoveredMiniGallery === null ? (
                /* DEFAULT 3 EQUAL COLUMNS */
                <motion.div 
                  layout
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {miniGalleries.map((gall) => (
                    <motion.div
                      key={gall.key}
                      layout
                      initial={{ y: 0, scale: 1 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={() => setHoveredMiniGallery(gall.key)}
                      className="space-y-2 group/gallContainer cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm md:text-xs xl:text-sm font-bold text-[#B8862A] uppercase tracking-wider font-mono">
                        <span>{gall.title}</span>
                        <span className="text-stone-400">
                          {gall.index + 1} / {gall.slides.length}
                        </span>
                      </div>

                      <div 
                        className="group/mg relative h-[520px] rounded-2xl overflow-hidden flex flex-col justify-between text-white select-none bg-stone-900 leading-none border border-[#B8862A]/30 group-hover/gallContainer:border-[#B8862A] shadow-md group-hover/gallContainer:shadow-xl transition-all duration-300"
                      >
                        <div className="absolute inset-0 z-0">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={gall.index}
                              initial={{ opacity: 0, scale: 1.02 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/mg:scale-105"
                              style={{ backgroundImage: `url(${gall.slides[gall.index]?.image})` }}
                            />
                          </AnimatePresence>
                          
                          {/* Category & Click-to-expand Indicator Badge */}
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                            <div className="px-2.5 py-1 bg-black/60 backdrop-blur-xs border border-white/10 rounded-md text-[10px] font-extrabold text-[#F0CC7A] uppercase tracking-wider font-mono">
                              <span>{cleanTextEmoji(language === 'bn' ? (gall.slides[gall.index]?.category_bn || 'কার্যক্রম') : (gall.slides[gall.index]?.category_en || 'Activity'))}</span>
                            </div>
                            <div className="px-2 py-1 bg-[#B8862A] text-stone-950 rounded-md text-[9.5px] font-bold font-mono flex items-center gap-1 shadow-md animate-pulse">
                              <MousePointerClick className="w-3 h-3" />
                              <span>{language === 'bn' ? 'ক্লিক করে বিস্তার দেখুন' : 'Click to Expand'}</span>
                            </div>
                          </div>

                          {/* Elegant subtle bottom overlay */}
                          <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />
                        </div>

                        {/* Chevrons */}
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none opacity-0 group-hover/mg:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              gall.setIndex((prev: number) => (prev - 1 + gall.slides.length) % gall.slides.length);
                            }}
                            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-stone-200 hover:text-white flex items-center justify-center pointer-events-auto cursor-pointer shadow-md"
                            title="Previous"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              gall.setIndex((prev: number) => (prev + 1) % gall.slides.length);
                            }}
                            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-stone-200 hover:text-white flex items-center justify-center pointer-events-auto cursor-pointer shadow-md"
                            title="Next"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Bottom Caption and Dots */}
                        <div className="relative z-20 p-4 mt-auto space-y-2.5">
                          <p className="text-[12.5px] sm:text-sm md:text-[12px] lg:text-[13px] xl:text-sm/relaxed font-sans font-medium text-stone-100 drop-shadow-md line-clamp-2">
                            {language === 'bn' ? gall.slides[gall.index]?.caption_bn : gall.slides[gall.index]?.caption_en}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-white/15">
                            <div className="flex space-x-1">
                              {gall.slides.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    gall.setIndex(idx);
                                  }}
                                  className={`h-1 transition-all duration-200 cursor-pointer ${
                                    gall.index === idx ? 'w-4 bg-[#F0CC7A]' : 'w-1 bg-white/35'
                                  }`}
                                  title={`Slide ${idx + 1}`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setHoveredMiniGallery(gall.key);
                              }}
                              className="text-[11px] sm:text-xs text-[#F0CC7A] hover:text-white font-extrabold flex items-center space-x-0.5 cursor-pointer uppercase tracking-wider transition-colors"
                            >
                              <span>{language === 'bn' ? 'বড় করে দেখুন' : 'Expand'}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* CLICKED EXPANDED STATE: Active gallery expands taking side space, other 2 move below! */
                <div className="space-y-6">
                  {/* TOP: Expanded Gallery */}
                  {(() => {
                    const activeGall = miniGalleries.find((g) => g.key === hoveredMiniGallery)!;
                    const activeSlide = activeGall.slides[activeGall.index];

                    return (
                      <motion.div
                        key={'expanded-' + activeGall.key}
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className="bg-[#1A0A08] border-2 border-[#B8862A] rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 text-white grid grid-cols-1 md:grid-cols-12 gap-6 relative"
                      >
                        {/* Close button top right */}
                        <button
                          onClick={() => setHoveredMiniGallery(null)}
                          className="absolute top-3 right-3 z-30 p-1.5 bg-black/60 hover:bg-[#B8862A] text-stone-300 hover:text-stone-950 rounded-full border border-white/20 transition-all cursor-pointer"
                          title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Left 7 Columns: Photo Slider View */}
                        <div 
                          onClick={() => activeSlide?.image && setLightboxImage(activeSlide.image)}
                          className="md:col-span-7 relative h-[480px] sm:h-[560px] md:h-[620px] rounded-xl overflow-hidden group/exp shadow-2xl cursor-pointer"
                          title={language === 'bn' ? 'ছবিটি বড় করে দেখতে ক্লিক করুন' : 'Click to view full image'}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeGall.index}
                              initial={{ opacity: 0, scale: 1.05 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${activeSlide?.image})` }}
                            />
                          </AnimatePresence>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                          {/* Top Left Tag */}
                          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/75 backdrop-blur-md border border-[#B8862A]/40 rounded-lg text-xs font-bold text-[#F0CC7A] uppercase tracking-wider font-mono">
                            {cleanTextEmoji(language === 'bn' ? (activeSlide?.category_bn || 'কার্যক্রম') : (activeSlide?.category_en || 'Activity'))}
                          </div>

                          {/* Chevrons */}
                          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                activeGall.setIndex((prev: number) => (prev - 1 + activeGall.slides.length) % activeGall.slides.length);
                              }}
                              className="h-10 w-10 rounded-full bg-black/70 hover:bg-[#B8862A] text-white hover:text-stone-950 flex items-center justify-center pointer-events-auto cursor-pointer transition-all shadow-lg"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                activeGall.setIndex((prev: number) => (prev + 1) % activeGall.slides.length);
                              }}
                              className="h-10 w-10 rounded-full bg-black/70 hover:bg-[#B8862A] text-white hover:text-stone-950 flex items-center justify-center pointer-events-auto cursor-pointer transition-all shadow-lg"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Bottom Slide Dots */}
                          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5">
                            {activeGall.slides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  activeGall.setIndex(idx);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                  activeGall.index === idx ? 'w-6 bg-[#F0CC7A]' : 'w-2 bg-white/40 hover:bg-white/80'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Right 5 Columns: Side Text Details Occupying Space ("side er jayga dokhol kore nibe") */}
                        <div className="md:col-span-5 flex flex-col justify-between space-y-4 text-left p-4 sm:p-5 bg-black/80 rounded-xl border border-[#B8862A]/30 backdrop-blur-md min-h-[480px] sm:min-h-[560px] md:min-h-[620px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-[#B8862A]/40 pb-2.5">
                              <span className="text-xs font-mono font-bold text-[#F0CC7A] uppercase tracking-widest">
                                {activeGall.title}
                              </span>
                            </div>

                            <h4 className="text-lg sm:text-xl font-serif font-extrabold text-white leading-snug flex items-center gap-2">
                              <span>{cleanTextEmoji(language === 'bn' ? (activeSlide?.category_bn || activeGall.title) : (activeSlide?.category_en || activeGall.title))}</span>
                            </h4>

                            <p 
                              className="text-sm sm:text-base/relaxed font-sans leading-relaxed font-semibold bg-stone-900/90 p-4 rounded-xl border border-white/20 shadow-inner"
                              style={{ color: activeSlide?.text_color || activeSlide?.caption_color || '#FFFFFF' }}
                            >
                              {language === 'bn' ? activeSlide?.caption_bn : activeSlide?.caption_en}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center gap-3 mt-auto">
                            <button
                              onClick={() => onNavigate(resolveMiniGalleryRoute(activeSlide, activeGall.defaultRoute))}
                              className="flex-1 py-3 px-4 bg-[#B8862A] hover:bg-[#a07422] text-stone-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                            >
                              <span>{language === 'bn' ? 'বিস্তারিত তথ্য দেখুন' : 'View Full Details'}</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* BOTTOM: The Other 2 Non-Expanded Galleries Shift Down Below ("baki 2 ta niche chole jabe") */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">
                      <span>{language === 'bn' ? 'অন্যান্য গ্যালারিসমূহ (ক্লিক করে বিস্তার করুন)' : 'Other Galleries (Click to Expand)'}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {miniGalleries
                        .filter((g) => g.key !== hoveredMiniGallery)
                        .map((gall) => (
                          <motion.div
                            key={'other-' + gall.key}
                            initial={{ opacity: 0.8, y: 20, scale: 0.96 }}
                            animate={{ opacity: 0.95, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 240, damping: 22 }}
                            onClick={() => setHoveredMiniGallery(gall.key)}
                            className="space-y-2 cursor-pointer group/otherGall"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-[#B8862A] uppercase tracking-wider font-mono">
                              <span>{gall.title}</span>
                              <span className="text-stone-400">
                                {gall.index + 1} / {gall.slides.length}
                              </span>
                            </div>

                            <div 
                              className="relative h-[220px] rounded-xl overflow-hidden flex flex-col justify-end text-white bg-stone-900 border border-stone-200 group-hover/otherGall:border-[#B8862A] shadow-md transition-all group-hover/otherGall:shadow-xl"
                            >
                              <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/otherGall:scale-105"
                                style={{ backgroundImage: `url(${gall.slides[gall.index]?.image})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                              <div className="relative z-10 p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 bg-[#B8862A] text-stone-950 font-mono text-[9px] font-extrabold uppercase rounded">
                                    {cleanTextEmoji(language === 'bn' ? (gall.slides[gall.index]?.category_bn || 'কার্যক্রম') : (gall.slides[gall.index]?.category_en || 'Activity'))}
                                  </span>
                                  <span className="px-2 py-0.5 bg-black/70 text-[#F0CC7A] font-mono text-[9px] font-bold rounded flex items-center gap-1 border border-white/10">
                                    <MousePointerClick className="w-2.5 h-2.5" />
                                    {language === 'bn' ? 'উপরে আনুন' : 'Expand'}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-100 font-sans font-medium line-clamp-1">
                                  {language === 'bn' ? gall.slides[gall.index]?.caption_bn : gall.slides[gall.index]?.caption_en}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}



      {/* ── SECTION 5: 4 FULL IMAGE HIGHLIGHTS GRID ── */}
      {(() => {
        const infoDoc = dbInfographicBlock || {};
        const headerTitle = language === 'bn' 
          ? (infoDoc.header_title_bn || '') 
          : (infoDoc.header_title_en || '');

        // Check if a single full-section banner image is uploaded (full width, no border, no margin)
        const fullBannerUrl = infoDoc.section_image || infoDoc.banner_image || infoDoc.image;
        if (fullBannerUrl) {
          return (
            <div className="w-full rounded-2xl overflow-hidden shadow-xs bg-white animate-fade-in border-0 p-0 m-0">
              <img 
                src={fullBannerUrl} 
                alt={headerTitle || 'Infographic Banner'}
                className="w-full h-auto object-cover block border-0 p-0 m-0 rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          );
        }

        const defaultImgs = [
          "/assets/IMGS/482986950_1054527260032088_5237943853609018055_n.jpg",
          "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg",
          "/assets/IMGS/493897528_1088721239946023_8232102595073591871_n.jpg",
          "/assets/IMGS/534826832_1175889297895883_7988975073499309288_n.jpg"
        ];

        const rawItems = Array.isArray(infoDoc.items) && infoDoc.items.length > 0 ? infoDoc.items : [{}, {}, {}, {}];
        const items = [0, 1, 2, 3].map((idx) => {
          const item = rawItems[idx] || {};
          return {
            ...item,
            image: item.image || item.imgUrl || item.img || defaultImgs[idx]
          };
        });

        return (
          <div className="rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-sm bg-white animate-fade-in">
            {/* 4 Full Image Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
              {items.map((item: any, idx: number) => {
                const imgSrc = item.image || defaultImgs[idx];
                return (
                  <div 
                    key={idx} 
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-[#E8DDD0] shadow-xs hover:shadow-md transition-all duration-300 group"
                  >
                    <img 
                      src={imgSrc} 
                      alt={`BSK Showcase 0${idx + 1}`}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── SECTION 6: CENTRAL BELIEF / ABOUT BAND ── */}
      <div className="border-t border-[#B8862A]/20 py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-[#1A1207] text-left animate-fade-in">
        <div className="md:col-span-8 space-y-3">
          <h3 className="font-serif font-extrabold text-[#B8862A] text-lg md:text-xl">
            {dbBeliefBlock ? (
              language === 'bn' ? (dbBeliefBlock.title_bn || 'বিশ্বসাহিত্য কেন্দ্র — একটি দেশব্যাপী আন্দোলন') : (dbBeliefBlock.title_en || 'Bishwo Shahitto Kendro — A National Awakening')
            ) : (
              language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র — একটি দেশব্যাপী আন্দোলন' : 'Bishwo Shahitto Kendro — A National Awakening'
            )}
          </h3>
          <p className="text-[11.5px] md:text-[12.5px] text-[#5C4033] leading-relaxed font-sans font-medium">
            {dbBeliefBlock ? (
              language === 'bn' 
                ? (dbBeliefBlock.desc_bn || dbBeliefBlock.quote_bn || 'বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি সাধারণ লাইব্রেরি বা সভার কামরা নয়। এটি বাংলা ভাষাভাষী মানুষের চিত্তের সামগ্রিক ইতিবাচক পরিবর্তনের জন্য দেশব্যাপী জাতীয় ক্যারেক্টার ও চরিত্র তৈরি করার বিনীত প্রয়াস।') 
                : (dbBeliefBlock.desc_en || dbBeliefBlock.quote_en || 'Our movement stretches to accommodate every village school and local municipal body through continuous book reading assessments and high intellectual assemblies.')
            ) : (
              language === 'bn'
                ? 'বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি সাধারণ লাইব্রেরি বা সভার কামরা নয়। এটি বাংলা ভাষাভাষী মানুষের চিত্তের সামগ্রিক ইতিবাচক পরিবর্তনের জন্য দেশব্যাপী জাতীয় ক্যারেক্টার ও চরিত্র তৈরি করার বিনীত প্রয়াস।'
                : 'Our movement stretches to accommodate every village school and local municipal body through continuous book reading assessments and high intellectual assemblies.'
            )}
          </p>
          <button 
            onClick={() => {
              const targetRoute = (dbBeliefBlock?.btnRoute && dbBeliefBlock.btnRoute !== 'bsk-history') ? dbBeliefBlock.btnRoute : 'home';
              onNavigate(targetRoute);
            }}
            className="px-4 py-1.5 border border-[#B8862A]/40 text-[10.5px] font-bold text-[#B8862A] hover:bg-[#B8862A]/5 hover:text-[#1A1207] rounded transition mt-2 cursor-pointer"
          >
            {dbBeliefBlock ? (
              language === 'bn' ? (dbBeliefBlock.btnText_bn || 'আমাদের অর্জন ও ইতিহাস →') : (dbBeliefBlock.btnText_en || 'Core History & Milestones →')
            ) : (
              language === 'bn' ? 'আমাদের অর্জন ও ইতিহাস →' : 'Core History & Milestones →'
            )}
          </button>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-[#B8862A]/20 pt-6 md:pt-0 md:pl-6 leading-none">
          <div>
            <span className="text-xl md:text-2xl font-serif text-[#B8862A] font-extrabold block">
              {dbBeliefBlock?.stat1_val || '৪৬+'}
            </span>
            <span className="text-[9px] text-stone-500 font-mono mt-1 block">
              {dbBeliefBlock ? (
                language === 'bn' ? dbBeliefBlock.stat1_lbl_bn : dbBeliefBlock.stat1_lbl_en
              ) : (
                language === 'bn' ? 'বছরের গৌরবময় সংগ্রাম' : 'Years of Legacy'
              )}
            </span>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-serif text-[#B8862A] font-extrabold block">
              {dbBeliefBlock?.stat2_val || '৫০+'}
            </span>
            <span className="text-[9px] text-stone-500 font-mono mt-1 block">
              {dbBeliefBlock ? (
                language === 'bn' ? dbBeliefBlock.stat2_lbl_bn : dbBeliefBlock.stat2_lbl_en
              ) : (
                language === 'bn' ? 'দাতা ও সহযোগী' : 'Global Donors'
              )}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl md:text-2xl font-serif text-[#B8862A] font-extrabold block">
              {dbBeliefBlock?.stat3_val || '১.২ কোটি+'}
            </span>
            <span className="text-[9px] text-stone-500 font-mono mt-1 block">
              {dbBeliefBlock ? (
                language === 'bn' ? dbBeliefBlock.stat3_lbl_bn : dbBeliefBlock.stat3_lbl_en
              ) : (
                language === 'bn' ? 'বিতরণকৃত গ্রন্থসমূহ' : 'Circulated Books'
              )}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl md:text-2xl font-serif text-[#B8862A] font-extrabold block">
              {dbBeliefBlock?.stat4_val || '১২টি'}
            </span>
            <span className="text-[9px] text-stone-500 font-mono mt-1 block">
              {dbBeliefBlock ? (
                language === 'bn' ? dbBeliefBlock.stat4_lbl_bn : dbBeliefBlock.stat4_lbl_en
              ) : (
                language === 'bn' ? 'সক্রিয় বুদ্ধিজীবী ধারা' : 'Core Programs'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 7: CALL TO ACTION (CTA) — RIGHT ABOVE THE FOOTER ── */}
      <div className="bg-[#B8862A]/10 border-l-4 border-[#B8862A] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative rounded-r-2xl text-left bg-grain animate-fade-in shadow-xs">
        <div className="space-y-1 text-left">
          <h3 className="font-serif font-extrabold text-[#1A1207] text-md md:text-lg">
            {dbCtaBlock ? (
              language === 'bn' ? dbCtaBlock.title_bn : dbCtaBlock.title_en
            ) : (
              language === 'bn' ? 'আলোকিত মানুষ গড়ার এই দেশব্যাপী মহতী যাত্রায় যোগ দিন' : 'Embark Upon the Enlightening Literary Journey'
            )}
          </h3>
          <p className="text-[11.5px] text-[#5C4033] font-medium">
            {dbCtaBlock ? (
              language === 'bn' ? dbCtaBlock.desc_bn : dbCtaBlock.desc_en
            ) : (
              language === 'bn' ? 'সদস্য হয়ে বিশ্বসাহিত্য কেন্দ্রের কার্যক্রমে অংশগ্রহণ করুন — বই পড়ুন, নিজেকে আলোকিত করুন।' : 'Become a lifetime registered regular reader, volunteer or advocate.'
            )}
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button 
            onClick={() => {
              const route = (dbCtaBlock?.btn1Route && dbCtaBlock.btn1Route !== 'contact') ? dbCtaBlock.btn1Route : 'central-library';
              onNavigate(route);
            }}
            className="px-4 py-2 bg-stone-950 hover:bg-stone-900 text-[#F0CC7A] font-extrabold text-[10.5px] rounded transition shadow-sm cursor-pointer"
          >
            {dbCtaBlock ? (
              language === 'bn' ? dbCtaBlock.btn1Text_bn : dbCtaBlock.btn1Text_en
            ) : (
              language === 'bn' ? 'সদস্য হতে আবেদন করুন' : 'Apply for Membership'
            )}
          </button>
          <button 
            onClick={() => {
              const route = (dbCtaBlock?.btn2Route && dbCtaBlock.btn2Route !== 'contact') ? dbCtaBlock.btn2Route : 'donation';
              onNavigate(route);
            }}
            className="px-4 py-2 bg-[#FAF7F2] hover:bg-stone-200 border border-[#E8DDD0] text-[#1A1207] font-extrabold text-[10.5px] rounded transition shadow-sm cursor-pointer"
          >
            {dbCtaBlock ? (
              language === 'bn' ? dbCtaBlock.btn2Text_bn : dbCtaBlock.btn2Text_en
            ) : (
              language === 'bn' ? 'সহযোগিতা / অনুদান দিন' : 'Support BSK'
            )}
          </button>
        </div>
      </div>

      {/* ── FULLSCREEN LIGHTBOX PHOTO POPUP ── */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] bg-stone-950/90 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 p-2 cursor-default flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-[#B8862A] text-white hover:text-stone-950 p-2 rounded-full transition cursor-pointer z-20 border border-white/20 shadow-lg"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImage}
                alt="Full size view"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FOOTER INFO ── */}
      <Footer language={language} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
