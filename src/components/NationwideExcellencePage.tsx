import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, Users, MapPin, Sparkles, CheckCircle2, ChevronRight, ChevronLeft,
  Download, Phone, Mail, FileText, Send, Eye, ShieldCheck, GraduationCap, 
  Trophy, BookCheck, ArrowRight, Compass, Heart, Share2, Camera, Image as ImageIcon, X
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultNationwideExcellenceData } from '../data/specializedPagesDefaults';

interface NationwideExcellencePageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto: (url: string) => void;
  setActivePhotoIndex: (i: number) => void;
  setActiveAlbumPhotos: (urls: string[]) => void;
}

export const NationwideExcellencePage: React.FC<NationwideExcellencePageProps> = ({
  page,
  language,
  onNavigate,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos,
}) => {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', institute: '', message: '' });
  const [galleryPage, setGalleryPage] = useState(1);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await cpanelApi.getDoc('website_pages', 'nationwide-excellence');
      if (data) {
        setDbPageData(data);
      }
    };
    fetchPage();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'website_pages') {
        fetchPage();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, []);

  const pageData = { ...defaultNationwideExcellenceData, ...page, ...dbPageData };

  // Default Stats fallback if not provided in page
  const defaultStats = [
    { value: '১৫,০০,০০০+', label_bn: 'অংশগ্রহণকারী শিক্ষার্থী', label_en: 'Active Student Readers', subtext_bn: 'দেশব্যাপী প্রতি বছর', subtext_en: 'Nationwide annually' },
    { value: '২,১০০+', label_bn: 'শিক্ষা প্রতিষ্ঠান', label_en: 'Partner Institutions', subtext_bn: 'স্কুল, কলেজ ও মাদ্রাসা', subtext_en: 'Schools, Colleges & Madrasahs' },
    { value: '৬৪টি', label_bn: 'জেলা কভারেজ', label_en: 'Districts Covered', subtext_bn: 'সমগ্র বাংলাদেশে', subtext_en: 'Across All Bangladesh' },
    { value: '৪৫ বছর+', label_bn: 'অনবদ্য পথচলা', label_en: 'Years of Excellence', subtext_bn: '১৯৭৯ সাল থেকে নিরবচ্ছিন্ন', subtext_en: 'Unbroken Since 1979' },
  ];

  const statsList = page.stats && page.stats.length > 0 ? page.stats : defaultStats;

  // Default Highlights
  const defaultHighlights = [
    {
      id: '1',
      title_bn: 'বই পড়া ও মূল্যায়ন উৎসব',
      title_en: 'Book Reading & Evaluation Festival',
      desc_bn: 'শিক্ষার্থীদের মাঝে বয়স ও মান উপযোগী চমৎকার বিশ্বসাহিত্যের বই বিতরণ এবং বছর শেষে উৎসাহমূলক সাহিত্য মূল্যায়নের মাধ্যমে কৃতি পাঠকদের পুরস্কৃত করা।',
      desc_en: 'Distributing curated world classics tailored for young minds, followed by annual literary evaluation tests and rewarding top readers.',
      image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'
    },
    {
      id: '2',
      title_bn: 'শিক্ষক সেমিনার ও নির্দেশনা সভা',
      title_en: 'Teacher Guidance & Seminars',
      desc_bn: 'শিক্ষা প্রতিষ্ঠানের দায়িত্বপ্রাপ্ত সংগঠক শিক্ষকদের জন্য বিশেষ প্রশিক্ষণ, বইপাঠ পরিচালনা নির্দেশিকা এবং সাহিত্য অনুরাগী সমাজ গঠনের কর্মশালা।',
      desc_en: 'Specialized training workshops and guidebooks for organizer teachers to effectively mentor reading circles in schools.',
      image: '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg'
    },
    {
      id: '3',
      title_bn: 'সেরা পাঠক বই পুরস্কার ও পদক',
      title_en: 'Best Reader Awards & Medals',
      desc_bn: 'মূল্যায়ন পরীক্ষায় কৃতিত্ব অর্জনকারী মেধা অনুযায়ী স্বাগত, শুভেচ্ছা, অভিনন্দন ও সেরা পাঠক পুরস্কারের সাথে আকর্ষণীয় মেডেল ও সনদপত্র প্রদান।',
      desc_en: 'Awarding Swagato, Shubechha, Abhinandan & Best Reader medals along with certificates and precious books to meritorious readers.',
      image: '/assets/IMGS/716885790_1415634970587980_7564637071825495839_n.jpg'
    },
    {
      id: '4',
      title_bn: 'শ্রেণিকক্ষ পাঠাভ্যাস প্রতিযোগিতা',
      title_en: 'Classroom Reading Competitions',
      desc_bn: 'শ্রেণিকক্ষে যৌথ আলোচনা, বই পর্যালোচনা ও স্বতঃস্ফূর্ত উপস্থিত বক্তৃতার মাধ্যমে তরুণ প্রজন্মের চিন্তা ও বোধশক্তি প্রখর করা।',
      desc_en: 'Sharping young intellect through guided group discussions, book reviews, and impromptu speech competitions.',
      image: '/assets/IMGS/699105967_1396309219187222_3554275610071392150_n.jpg'
    }
  ];

  const highlightsList = page.highlights && page.highlights.length > 0 ? page.highlights : defaultHighlights;

  // Default Levels
  const defaultLevels = [
    {
      id: 'l1',
      level_bn: 'ষষ্ঠ - অষ্টম শ্রেণি (জুনিয়র স্তর)',
      level_en: 'Grade 6 - 8 (Junior Level)',
      target_group_bn: 'মাধ্যমিক বিদ্যালয় ও মাদ্রাসা শিক্ষার্থী',
      target_group_en: 'Secondary school & madrasah students',
      books_count: '৬ - ৮টি সেরা বই/বছর',
      desc_bn: 'ছোট গল্প, অ্যাডভেঞ্চার, রূপকথা ও নীতিশিক্ষা বিষয়ক ক্লাসিক সাহিত্য সম্ভার দিয়ে কিশোর বয়সে বই পড়ার আনন্দ ও ভালো লাগা সৃষ্টি করা।',
      desc_en: 'Instilling the joy of reading with adventure classics, fables and inspirational morality tales for young minds.',
      reward_bn: 'সনদপত্র, আকর্ষণীয় উপহার বই ও ব্রোঞ্জ পদক',
      reward_en: 'Certificates, gift books & bronze medals'
    },
    {
      id: 'l2',
      level_bn: 'নবম - দশম শ্রেণি (মাধ্যমিক স্তর)',
      level_en: 'Grade 9 - 10 (Secondary Level)',
      target_group_bn: 'নবম ও দশম শ্রেণির শিক্ষার্থী',
      target_group_en: '9th & 10th Grade students',
      books_count: '৮ - ১০টি ক্লাসিক বই/বছর',
      desc_bn: 'দেশি ও বিদেশি শ্রেষ্ঠ উপন্যাস, মহীয়সী জীবনী ও বিজ্ঞানচিন্তার বই পাঠ দিয়ে যুক্তিভিত্তিক চিন্তাভাবনা ও সাহিত্য চেতনা জাগ্রত করা।',
      desc_en: 'Cultivating critical thinking with world novels, biographies of visionary legends, and popular science works.',
      reward_bn: 'সনদপত্র, মূল্যবান সাহিত্য গ্রন্থসমগ্র ও সিলভার পদক',
      reward_en: 'Certificates, book sets & silver medals'
    },
    {
      id: 'l3',
      level_bn: 'একাদশ - দ্বাদশ শ্রেণি (উচ্চ মাধ্যমিক স্তর)',
      level_en: 'Grade 11 - 12 (Higher Secondary)',
      target_group_bn: 'কলেজ ও ক্যাডেট কলেজ শিক্ষার্থী',
      target_group_en: 'College & Cadet College students',
      books_count: '১০ - ১২টি দর্শন ও সাহিত্য গ্রন্থ',
      desc_bn: 'বাঙালি চিন্তা, ইতিহাস, বিশ্বদর্শন ও গভীর মানবিক মননশীল বই দিয়ে উচ্চতর মূল্যবোধ এবং নেতৃত্ব প্রদানের মনস্তত্ত্ব তৈরি।',
      desc_en: 'Deepening human values, Bengali intellectual history, and leadership traits through profound philosophical literature.',
      reward_bn: 'সনদপত্র, বার্ষিক সম্মাননা বই ও গোল্ডেন স্মারক পদক',
      reward_en: 'Certificates, crests & golden honor medals'
    },
    {
      id: 'l4',
      level_bn: 'বিশ্ববিদ্যালয় ও ডিগ্রি স্তর',
      level_en: 'University & Degree Level',
      target_group_bn: 'স্নাতক ও টিটিসি/পিটিআই শিক্ষকগণ',
      target_group_en: 'Undergraduate students & Teacher Trainees',
      books_count: 'বিশেষায়িত মহাবিশ্ব ও জ্ঞানকোষ পাঠ',
      desc_bn: 'সমাজ, রাষ্ট্র, শিল্পকলা ও জ্ঞানবিজ্ঞানের মৌলিক গ্রন্থ পাঠ এবং সেমিনার আলোচনার মধ্য দিয়ে আলোকিত ব্যক্তিত্ব গড়ে তোলা।',
      desc_en: 'Nurturing enlightened citizenship through seminal books on philosophy, art, economics, and statecraft.',
      reward_bn: 'উচ্চতর সম্মাননা স্মারক, সেরা পাঠক ক্রেস্ট ও জাতীয় সনদ',
      reward_en: 'National Certificate, Crest & Lifetime Membership'
    }
  ];

  const levelsList = page.levels && page.levels.length > 0 ? page.levels : defaultLevels;

  // Default Gallery
  const defaultGallery = [
    {
      image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg',
      caption_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রমে শিক্ষার্থীদের স্বতঃস্ফূর্ত বইপড়া পরীক্ষা',
      caption_en: 'Enthusiastic students taking part in annual evaluation test'
    },
    {
      image: '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg',
      caption_bn: 'দায়িত্বপ্রাপ্ত শিক্ষকদের নিয়ে আয়োজিত জেলাপর্যায়ের সেমিনার',
      caption_en: 'District-level teacher orientation workshop'
    },
    {
      image: '/assets/IMGS/716885790_1415634970587980_7564637071825495839_n.jpg',
      caption_bn: 'বার্ষিক পুরস্কার বিতরণ উৎসবে মেধা তালিকায় উত্তীর্ণ শিক্ষার্থীদের উল্লাস',
      caption_en: 'Celebration of meritorious students at the Annual Award Ceremony'
    },
    {
      image: '/assets/IMGS/699105967_1396309219187222_3554275610071392150_n.jpg',
      caption_bn: 'স্কুল প্রাঙ্গণে শিক্ষার্থীদের সাহিত্য আড্ডা ও দলগত বই আলোচনা',
      caption_en: 'Literary discussion circle in school campus'
    },
    {
      image: '/assets/IMGS/494104444_1090181333133347_985621833236065192_n.jpg',
      caption_bn: 'উৎকর্ষ কার্যক্রমের আওতায় বই বিতরণ ও পাঠচক্র পরিচালনা',
      caption_en: 'Book distribution & reading circle activity'
    },
    {
      image: '/assets/IMGS/693917772_1392667546218056_8903455754459059189_n.jpg',
      caption_bn: 'পাঠক শিক্ষার্থীদের সংবর্ধনা ও স্মারক পদক প্রদান',
      caption_en: 'Felicitation and crest distribution to student readers'
    },
    {
      image: '/assets/IMGS/493897528_1088721239946023_8232102595073591871_n.jpg',
      caption_bn: 'জেলা ও উপজেলা পর্যায়ে বইপড়া প্রতিযোগিতা পরিচালনা',
      caption_en: 'District and Upazila level reading competition'
    },
    {
      image: '/assets/IMGS/698457938_1393645529453591_8748925284783113710_n.jpg',
      caption_bn: 'বিশ্বসাহিত্য কেন্দ্রের লাইব্রেরি প্রাঙ্গণে নিয়মিত পাঠাভ্যাস',
      caption_en: 'Regular reading session at Bishwo Shahitto Kendro library'
    },
    {
      image: '/assets/IMGS/636792032_1327499952734816_1369042483557244944_n.jpg',
      caption_bn: 'উৎকর্ষ কার্যক্রমের আওতায় যৌথ সাংস্কৃতিক ও সাহিত্য উৎসব',
      caption_en: 'Joint cultural & literary festival under Excellence Program'
    },
    {
      image: '/assets/IMGS/493997499_1088721116612702_8600397232748374826_n.jpg',
      caption_bn: 'কেন্দ্রীয় অডিটোরিয়ামে কৃতি পাঠকদের জাতীয় পুরস্কার প্রদান',
      caption_en: 'National Award Ceremony at Central Auditorium'
    },
    {
      image: '/assets/IMGS/700224535_1396309085853902_3026706898645620199_n.jpg',
      caption_bn: 'অভিভাবক ও সংগঠক শিক্ষকদের উপস্থিতিতে অভিজ্ঞতা বিনিময় সভা',
      caption_en: 'Experience sharing session with parents and teachers'
    },
    {
      image: '/assets/IMGS/704592434_1402462221905255_5801819563949487266_n.jpg',
      caption_bn: 'আলোকিত মানুষ গড়ার আন্দোলনে তরুণ শিক্ষার্থীদের স্বতঃস্ফূর্ত অংশগ্রহণ',
      caption_en: 'Youth participation in enlightened human building movement'
    }
  ];

  const galleryList = page.excellence_gallery && page.excellence_gallery.length > 0 ? page.excellence_gallery : defaultGallery;

  // Gallery Pagination Calculation
  const itemsPerPage = 8;
  const totalGalleryPages = Math.ceil(galleryList.length / itemsPerPage) || 1;
  const safeGalleryPage = Math.min(Math.max(1, galleryPage), totalGalleryPages);
  const galleryStartIndex = (safeGalleryPage - 1) * itemsPerPage;
  const paginatedGallery = galleryList.slice(galleryStartIndex, galleryStartIndex + itemsPerPage);

  // Default Side Mini Gallery
  const defaultSideMiniGallery = [
    {
      image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg',
      caption_bn: 'পরীক্ষাকেন্দ্রে বইপড়া মূল্যায়নে শিক্ষার্থীবৃন্দ',
      caption_en: 'Students in evaluation exam hall'
    },
    {
      image: '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg',
      caption_bn: 'সংগঠক শিক্ষকদের জেলা ভিত্তিক আড্ডা ও কর্মশালা',
      caption_en: 'District level teacher workshops'
    },
    {
      image: '/assets/IMGS/716885790_1415634970587980_7564637071825495839_n.jpg',
      caption_bn: 'উৎসবে কৃতি পাঠকদের পদক পরিয়ে দেওয়া হচ্ছে',
      caption_en: 'Awarding medals to meritorious readers'
    }
  ];

  const sideMiniGalleryList = page.side_mini_gallery && page.side_mini_gallery.length > 0 
    ? page.side_mini_gallery 
    : defaultSideMiniGallery;

  // Default Downloads
  const defaultDownloads = [
    {
      id: 'd1',
      title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম গাইডবুক ও নিয়মাবলী (২০২৪)',
      title_en: 'Nationwide Excellence Program Guidebook & Rules (2024)',
      file_size: '৩.৮ মেগাবাইট (PDF)',
      file_url: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'
    },
    {
      id: 'd2',
      title_bn: 'শিক্ষা প্রতিষ্ঠান সদস্যভুক্তি ফরম (স্কুল/কলেজ)',
      title_en: 'Institutional Membership Application Form',
      file_size: '১.২ মেগাবাইট (PDF)',
      file_url: '/assets/IMGS/PURNIMA SONDHA/alor.jpg'
    },
    {
      id: 'd3',
      title_bn: 'বার্ষিক বই তালিকা ও স্তরভিত্তিক পাঠ্যসূচি',
      title_en: 'Annual Recommended Book List & Syllabus',
      file_size: '২.৪ মেগাবাইট (PDF)',
      file_url: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'
    }
  ];

  const downloadsList = page.downloads && page.downloads.length > 0 ? page.downloads : defaultDownloads;

  // Default Coordinator
  const defaultCoordinator = {
    name_bn: 'জনাব শরিফ হোসেন ভূঞা',
    name_en: 'Sharif Hossain Bhuiyan',
    designation_bn: 'পরিচালক ও প্রধান সমন্বয়ক, দেশভিত্তিক উৎকর্ষ কার্যক্রম',
    designation_en: 'Director & Chief Coordinator, Nationwide Excellence Program',
    phone: '+৮৮০-২-৯৬৬১০৭৮, ০১৭১২৫৪১২৬৩',
    email: 'excellence.bsk@gmail.com',
    office_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন (৪র্থ তলা), ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০',
    office_en: 'Bishwo Shahitto Kendro (4th Floor), 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka-1000'
  };

  const coordinator = page.coordinator || defaultCoordinator;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) return;
    try {
      await cpanelApi.addDoc('inquiries', {
        name: inquiryForm.name,
        phone: inquiryForm.phone,
        institution: inquiryForm.institute || '',
        message: inquiryForm.message || '',
        type: 'nationwide_excellence',
        source: 'Nationwide Excellence Program',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving inquiry:', err);
    }
    setInquirySubmitted(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full space-y-8 font-sans text-left animate-fade-in pb-12">
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-[#B8862A]/25 shadow-xl bg-[#1A1207] text-white">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-25 bg-cover bg-center filter blur-xs scale-105"
          style={{ backgroundImage: `url(${page.hero_image || page.bgImage || page.cover_image || page.image || '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1207] via-[#1A1207]/90 to-transparent z-0" />

        <div className="relative z-10 p-6 md:p-10 lg:p-12 space-y-4">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-extrabold leading-tight text-amber-50">
              {language === 'bn' ? (page.title_bn || 'দেশভিত্তিক উৎকর্ষ কার্যক্রম') : (page.title_en || 'Nationwide Excellence Program')}
            </h1>
            <p className="text-sm md:text-lg text-stone-300 font-sans leading-relaxed">
              {language === 'bn' 
                ? (page.subtitle_bn || 'মানুষ তার স্বপ্নের সমান বড় — তরুণ প্রজন্মের মননশীলতা বিকাশ ও আলোকিত মানুষ গড়ার বৃহত্তম সাহিত্য আন্দোলন।') 
                : (page.subtitle_en || 'Building enlightened human beings by nurturing intellect, creativity, and world literature among youth across Bangladesh.')}
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => scrollToSection('sec-inquiry')}
              className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white font-serif font-bold text-xs md:text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer border border-[#2E5942]/30"
            >
              <GraduationCap className="w-4 h-4 text-[#F0CC7A]" />
              <span>{language === 'bn' ? 'কার্যক্রমে অংশ নিন / তথ্য পাঠান' : 'Participate / Join Program'}</span>
            </button>
            <button
              onClick={() => scrollToSection('sec-downloads')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-stone-100 font-serif font-bold text-xs md:text-sm rounded-xl transition backdrop-blur-md flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Download className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? 'ব্রোশিওর ও ফরম ডাউনলোড' : 'Download Guide & Forms'}</span>
            </button>
          </div>
        </div>

        {/* Hero Image Visual in corner */}
        {page.hero_image && (
          <div className="hidden lg:block absolute right-8 bottom-6 top-6 w-72 rounded-2xl overflow-hidden border-2 border-[#B8862A]/40 shadow-2xl z-10 group">
            <img 
              src={page.hero_image} 
              alt={language === 'bn' ? page.title_bn : page.title_en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] text-amber-200 font-serif font-bold">
                {language === 'bn' ? 'বই পড়া উৎসবের স্মরণীয় মুহূর্ত' : 'Memorable moment of book reading festival'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsList.map((st, idx) => (
          <div 
            key={idx}
            className="bg-white p-4 md:p-5 rounded-2xl border border-[#E8DDD0] shadow-xs hover:border-[#B8862A]/60 transition-all text-left space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-[#B8862A] group-hover:scale-105 transition-transform">
                {st.value}
              </span>
              <span className="p-2 bg-[#2E5942]/10 text-[#2E5942] rounded-xl">
                {idx === 0 ? <Users className="w-5 h-5" /> : idx === 1 ? <BookOpen className="w-5 h-5" /> : idx === 2 ? <MapPin className="w-5 h-5" /> : <Award className="w-5 h-5" />}
              </span>
            </div>
            <h4 className="font-serif font-bold text-xs md:text-sm text-[#1A1207]">
              {language === 'bn' ? st.label_bn : st.label_en}
            </h4>
            {(st.subtext_bn || st.subtext_en) && (
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? st.subtext_bn : st.subtext_en}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 3. FULL PAGE STACKED LAYOUT */}
      <div className="w-full space-y-10">
          
        {/* SECTION 1: OVERVIEW & MISSION */}
        <section id="sec-overview" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#B8862A]/25 pb-2">
            <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? '১. পরিচিতি ও উদ্দেশ্য' : '1. Overview & Mission'}
            </h2>
          </div>

          {Array.isArray(page.sections) && page.sections.length > 0 ? (
            <div className="space-y-4">
              {page.sections.map((sec, sIdx) => (
                <div key={sIdx} className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-3">
                  {sec.title && (
                    <h3 className="font-serif text-lg font-bold text-[#1A1207] flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-[#B8862A] rounded-full inline-block" />
                      <span>{sec.title}</span>
                    </h3>
                  )}
                  <div className="space-y-3 font-sans text-stone-800 text-sm md:text-base leading-relaxed">
                    {Array.isArray(sec.content) && sec.content.map((pText, pIdx) => (
                      <p key={pIdx} style={{ textIndent: pIdx > 0 ? '1.5rem' : '0' }}>
                        {pText}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs text-stone-700 space-y-3">
              <p className="text-sm leading-relaxed">
                {language === 'bn' 
                  ? 'বিশ্বসাহিত্য কেন্দ্রের দেশভিত্তিক উৎকর্ষ কার্যক্রম বাংলাদেশের কোটি কিশোর-তরুণকে বইপড়া ও বিশ্বসংস্কৃতির সাথে পরিচয় করিয়ে দেয়ার অনন্য ঐতিহাসিক আন্দোলন। ১৯৭১৯ সালে শুরু হওয়া এই বহুমাত্রিক কার্যক্রম আজ দেশের হাজার হাজার স্কুল ও কলেজে ছড়িয়ে পড়েছে।'
                  : 'The Nationwide Excellence Program of Bishwo Shahitto Kendro is an iconic movement connecting millions of young minds to global literature and enlightened thought since 1979.'}
              </p>
            </div>
          )}

          {/* Core Objectives Card */}
          <div className="bg-[#FAF7F2] p-6 md:p-8 rounded-2xl border border-[#E8DDD0] space-y-4 text-left">
            <div className="flex items-center gap-2.5 border-b border-[#B8862A]/20 pb-2">
              <span className="w-1.5 h-5 bg-[#B8862A] rounded-full inline-block shrink-0" />
              <h3 className="font-serif font-bold text-base md:text-lg text-[#1A1207]">
                {language === 'bn' ? 'কার্যক্রমের মূল উদ্দেশ্যসমূহ' : 'Core Objectives'}
              </h3>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs md:text-sm text-stone-700 font-sans pt-1">
              {[
                { bn: 'কিশোর ও তরুণদের বই পড়ার নিয়মিত অভ্যাস গড়ে তোলা', en: 'Inculcating habit of reading books daily among teenagers' },
                { bn: 'বিশ্বসাহিত্যের সেরা মানবতাবাদী বই পাঠের সুযোগ দেওয়া', en: 'Providing access to the world’s greatest humanist classics' },
                { bn: 'যুক্তিনিষ্ঠ স্বাধীন চিন্তা ও নান্দনিক দৃষ্টিভঙ্গি তৈরি', en: 'Fostering analytical logic and aesthetic perception' },
                { bn: 'শ্রেণিকক্ষের বাইরে মেধা ও সৃজনশীলতার মুক্ত বিকাশ', en: 'Expanding intellect and leadership beyond classrooms' },
                { bn: 'শিক্ষকদের মেধা ও মননে নতুন ভাবনার উন্মেষ ঘটানো', en: 'Empowering teachers with innovative mentoring ideas' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                  <span>{language === 'bn' ? item.bn : item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION 2: CORE HIGHLIGHTS */}
        <section id="sec-highlights" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#B8862A]/25 pb-2">
            <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? '২. কার্যক্রমের মূল বৈশিষ্ট্যসমূহ' : '2. Core Program Highlights'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlightsList.map((hl) => (
              <div 
                key={hl.id}
                onClick={() => setSelectedHighlight(hl)}
                className="bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                {hl.image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                    <img 
                      src={hl.image} 
                      alt={language === 'bn' ? hl.title_bn : hl.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-3 left-3 bg-[#2E5942] text-white text-[10px] font-serif font-bold px-2.5 py-1 rounded-lg border border-white/20">
                      {language === 'bn' ? 'প্রধান বৈশিষ্ট্য' : 'Key Feature'}
                    </span>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#1A1207] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-[#2E5942]" />
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-extrabold text-base text-[#1A1207] group-hover:text-[#B8862A] transition-colors">
                      {language === 'bn' ? hl.title_bn : hl.title_en}
                    </h3>
                    <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3">
                      {language === 'bn' ? hl.desc_bn : hl.desc_en}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#2E5942] font-bold">
                    <span className="flex items-center gap-1 text-[#2E5942] group-hover:text-[#B8862A] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'বিস্তারিত দেখতে চাপুন' : 'Click to view details'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B8862A]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: CLASS-WISE LEVELS */}
        <section id="sec-levels" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#B8862A]/25 pb-2">
            <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? '৩. শ্রেণিভিত্তিক পাঠ্যসূচি ও স্তরসমূহ' : '3. Class-wise Levels & Recommended Syllabus'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {levelsList.map((lvl) => (
              <div 
                key={lvl.id}
                className="bg-white p-5 rounded-2xl border-2 border-[#E8DDD0] hover:border-[#B8862A] shadow-xs transition-all space-y-3 text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase bg-[#B8862A]/15 text-[#B8862A] px-2.5 py-0.5 rounded-full">
                        {language === 'bn' ? lvl.target_group_bn : lvl.target_group_en}
                      </span>
                      <h3 className="font-serif font-extrabold text-base text-[#1A1207]">
                        {language === 'bn' ? lvl.level_bn : lvl.level_en}
                      </h3>
                    </div>
                    <div className="p-2 bg-[#2E5942]/10 text-[#2E5942] rounded-xl text-center shrink-0">
                      <BookCheck className="w-4 h-4 mx-auto" />
                      <span className="text-[9px] font-bold block mt-0.5">{lvl.books_count}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {language === 'bn' ? lvl.desc_bn : lvl.desc_en}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0]/80 space-y-1 mt-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">
                    {language === 'bn' ? 'বার্ষিক পুরস্কার ও স্বীকৃতি:' : 'Annual Awards & Recognition:'}
                  </span>
                  <p className="text-xs font-bold text-[#2E5942] font-serif flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#B8862A] shrink-0" />
                    <span>{language === 'bn' ? lvl.reward_bn : lvl.reward_en}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PHOTO GALLERY WITH PAGINATION */}
        <section id="sec-gallery" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B8862A]/25 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                {language === 'bn' ? '৪. ছবি গ্যালারি' : '4. Photo Gallery'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-[#2E5942] bg-[#2E5942]/10 px-3 py-1 rounded-full border border-[#2E5942]/20">
                {language === 'bn' 
                  ? `ছবি ${galleryStartIndex + 1} - ${Math.min(galleryStartIndex + itemsPerPage, galleryList.length)} (মোট ${galleryList.length}টি)`
                  : `Photos ${galleryStartIndex + 1} - ${Math.min(galleryStartIndex + itemsPerPage, galleryList.length)} of ${galleryList.length}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedGallery.map((item, idx) => {
              const globalIdx = galleryStartIndex + idx;
              return (
                <div 
                  key={globalIdx}
                  onClick={() => {
                    setActivePhoto(item.image);
                    setActivePhotoIndex(globalIdx);
                    setActiveAlbumPhotos(galleryList.map(g => g.image));
                  }}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DDD0] hover:border-[#B8862A] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                    <img 
                      src={item.image} 
                      alt={language === 'bn' ? item.caption_bn : item.caption_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                      <div className="opacity-0 group-hover:opacity-100 p-2 bg-white text-[#1A1207] rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                        <Eye className="w-4 h-4 text-[#2E5942]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white flex-1 flex items-center">
                    <p className="text-xs text-stone-700 font-sans line-clamp-2 leading-snug group-hover:text-[#B8862A] transition-colors">
                      {language === 'bn' ? item.caption_bn : item.caption_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalGalleryPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8DDD0]">
              <div className="text-xs text-stone-600 font-serif">
                {language === 'bn' 
                  ? `পৃষ্ঠা ${safeGalleryPage} / ${totalGalleryPages}`
                  : `Page ${safeGalleryPage} of ${totalGalleryPages}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeGalleryPage === 1}
                  onClick={() => {
                    const prev = safeGalleryPage - 1;
                    setGalleryPage(prev);
                    document.getElementById('sec-gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-serif flex items-center gap-1 transition ${
                    safeGalleryPage === 1
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                      : 'bg-white text-[#1A1207] hover:bg-[#FAF7F2] border border-[#E8DDD0] hover:border-[#B8862A] shadow-2xs cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'bn' ? 'আগের পৃষ্ঠা' : 'Previous'}</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalGalleryPages }).map((_, pIdx) => {
                    const pageNum = pIdx + 1;
                    const isActive = pageNum === safeGalleryPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setGalleryPage(pageNum);
                          document.getElementById('sec-gallery')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-serif font-bold transition flex items-center justify-center cursor-pointer ${
                          isActive
                            ? 'bg-[#2E5942] text-white shadow-xs'
                            : 'bg-white text-stone-700 border border-[#E8DDD0] hover:border-[#B8862A] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={safeGalleryPage === totalGalleryPages}
                  onClick={() => {
                    const next = safeGalleryPage + 1;
                    setGalleryPage(next);
                    document.getElementById('sec-gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-serif flex items-center gap-1 transition ${
                    safeGalleryPage === totalGalleryPages
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                      : 'bg-white text-[#1A1207] hover:bg-[#FAF7F2] border border-[#E8DDD0] hover:border-[#B8862A] shadow-2xs cursor-pointer'
                  }`}
                >
                  <span>{language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: DOWNLOADS */}
        <section id="sec-downloads" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#B8862A]/25 pb-2">
            <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? '৫. ফরম ও ডকুমেন্ট ডাউনলোড' : '5. Forms & Downloads'}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-3">
            {downloadsList.map((dl) => (
              <div 
                key={dl.id}
                className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0] hover:border-[#B8862A] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs md:text-sm text-[#1A1207]">
                      {language === 'bn' ? dl.title_bn : dl.title_en}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-sans mt-0.5">{dl.file_size}</p>
                  </div>
                </div>

                <a 
                  href={dl.file_url}
                  download
                  className="px-3.5 py-1.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CONTACT & INQUIRY FORM */}
        <section id="sec-inquiry" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#B8862A]/25 pb-2">
            <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? '৬. সমন্বয় সেল ও তথ্য আদান-প্রদান' : '6. Coordination Cell & Registration Inquiry'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Coordinator Info */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-4 text-left">
              <div className="border-b border-[#B8862A]/20 pb-3">
                <span className="text-[10px] font-bold text-[#B8862A] bg-[#B8862A]/10 px-2 py-0.5 rounded-full uppercase">
                  {language === 'bn' ? 'কেন্দ্রীয় সমন্বয় সেল' : 'Central Coordination Cell'}
                </span>
                <h3 className="font-serif font-extrabold text-base text-[#1A1207] mt-1">
                  {language === 'bn' ? coordinator.name_bn : coordinator.name_en}
                </h3>
                <p className="text-xs text-[#2E5942] font-bold font-sans">
                  {language === 'bn' ? coordinator.designation_bn : coordinator.designation_en}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-stone-700 font-sans">
                <div className="flex items-start gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200">
                  <MapPin className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
                    <span>{language === 'bn' ? coordinator.office_bn : coordinator.office_en}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200">
                  <Phone className="w-4 h-4 text-[#2E5942] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">{language === 'bn' ? 'ফোন:' : 'Phone:'}</span>
                    <span className="font-bold">{coordinator.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200">
                  <Mail className="w-4 h-4 text-[#B8862A] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">{language === 'bn' ? 'ই-মেইল:' : 'Email:'}</span>
                    <a href={`mailto:${coordinator.email}`} className="font-bold text-[#2E5942] hover:underline">
                      {coordinator.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-7 bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-4 text-left">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1207]">
                  {language === 'bn' ? 'কার্যক্রমে অংশগ্রহণের আগ্রহ বা আবেদন' : 'Program Inquiry / Interest Form'}
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  {language === 'bn' 
                    ? 'আপনার প্রতিষ্ঠানে বইপড়া আন্দোলন শুরু করতে তথ্য ও বার্তা পাঠান' 
                    : 'Submit details to introduce book reading movement in your school'}
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="p-5 bg-white rounded-xl border border-emerald-200 text-center space-y-2 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-emerald-900 text-sm">
                    {language === 'bn' ? 'আপনার তথ্য সফলভাবে জমা হয়েছে!' : 'Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-stone-600 font-sans">
                    {language === 'bn' 
                      ? 'আমাদের সমন্বয় সেল থেকে দ্রুতই যোগাযোগ করা হবে।' 
                      : 'Our coordination cell will contact you shortly.'}
                  </p>
                  <button
                    onClick={() => { setInquirySubmitted(false); setInquiryForm({ name: '', phone: '', institute: '', message: '' }); }}
                    className="px-3.5 py-1.5 bg-[#2E5942] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Submit Another'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}</label>
                      <input 
                        type="text" 
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder={language === 'bn' ? 'যেমন: অধ্যাপক শফিকুল ইসলাম' : 'e.g. Prof. Rafiqul Islam'}
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#2E5942]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
                      <input 
                        type="text" 
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="01710000000"
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#2E5942]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'শিক্ষা প্রতিষ্ঠানের নাম ও ঠিকানা' : 'Institution Name & Address'}</label>
                    <input 
                      type="text" 
                      value={inquiryForm.institute}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, institute: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: ঢাকা সরকারি হাই স্কুল' : 'e.g. Dhaka Govt. High School'}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#2E5942]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'আপনার বার্তা বা অনুসন্ধান' : 'Your Query or Message'}</label>
                    <textarea 
                      rows={2.5}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder={language === 'bn' ? 'আমাদের স্কুলে কার্যক্রমটি চালুর জন্য...' : 'We want to launch reading program...'}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#2E5942]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white font-serif font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F0CC7A]" />
                    <span>{language === 'bn' ? 'বার্তাসমূহ জমা দিন' : 'Submit Application Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* HIGHLIGHT DETAIL MODAL POPUP */}
      {selectedHighlight && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedHighlight(null)}
        >
          <div 
            className="bg-white max-w-2xl w-full max-h-[90vh] rounded-3xl overflow-y-auto shadow-2xl border border-[#E8DDD0] relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            {selectedHighlight.image ? (
              <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-stone-100">
                <img 
                  src={selectedHighlight.image} 
                  alt={language === 'bn' ? selectedHighlight.title_bn : selectedHighlight.title_en}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                <button
                  onClick={() => setSelectedHighlight(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition cursor-pointer"
                  title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B8862A] text-white px-2.5 py-1 rounded-lg">
                    {language === 'bn' ? 'কার্যক্রমের মূল বৈশিষ্ট্য' : 'Core Highlight'}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mt-2 leading-tight drop-shadow-sm">
                    {language === 'bn' ? selectedHighlight.title_bn : selectedHighlight.title_en}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#FAF7F2] border-b border-[#E8DDD0] flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B8862A] text-white px-2.5 py-1 rounded-lg">
                    {language === 'bn' ? 'কার্যক্রমের মূল বৈশিষ্ট্য' : 'Core Highlight'}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A1207] mt-2">
                    {language === 'bn' ? selectedHighlight.title_bn : selectedHighlight.title_en}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedHighlight(null)}
                  className="p-2 bg-stone-200 hover:bg-stone-300 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5 text-stone-700" />
                </button>
              </div>
            )}

            {/* Modal Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#1A1207]">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ:' : 'Detailed Overview:'}
                </h4>
                <p className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed">
                  {language === 'bn' ? selectedHighlight.desc_bn : selectedHighlight.desc_en}
                </p>
              </div>

              {/* Feature Points */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DDD0] space-y-3">
                <h5 className="font-serif font-bold text-sm text-[#1A1207]">
                  {language === 'bn' ? 'মূল আকর্ষণ ও সুফলসমূহ:' : 'Key Highlights & Benefits:'}
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-sans">
                  {((selectedHighlight.id === '1' || selectedHighlight.title_bn?.includes('বই পড়া')) ? [
                    { bn: 'বয়স ও মান উপযোগী চমৎকার ক্লাসিক ও মানবতাবাদী বিশ্বসাহিত্য বিতরণ', en: 'Providing age-appropriate world classics and humanist books' },
                    { bn: 'এক শিক্ষাবর্ষব্যাপী ধারাবাহিক বই পাঠ ও দলগত আলোচনা চর্চা', en: 'Year-long continuous reading and interactive discussions' },
                    { bn: 'উৎসবমুখর পরিবেশে বার্ষিক সাহিত্য মূল্যায়ন পরীক্ষা অনুষ্ঠান', en: 'Festive annual book reading evaluation examination' },
                    { bn: 'কৃতী পাঠকদের জাতীয় ও আঞ্চলিক পর্যায়ে সম্মাননা ও পদক প্রদান', en: 'Awarding national & regional medals to outstanding readers' }
                  ] : (selectedHighlight.id === '2' || selectedHighlight.title_bn?.includes('শিক্ষক')) ? [
                    { bn: 'সংগঠক শিক্ষকদের জন্য বিশেষ পাঠাগার পরিচালনা প্রশিক্ষণ ও কর্মশালা', en: 'Special library management workshops for teacher mentors' },
                    { bn: 'শ্রেণিকক্ষে শিক্ষার্থীদের স্বতঃস্ফূর্ত অংশগ্রহণ বৃদ্ধির কৌশল গাইডলাইন', en: 'Guidelines for spontaneous student participation in classrooms' },
                    { bn: 'শিক্ষা প্রতিষ্ঠানে সাহিত্য অনুরাগী সমৃদ্ধ পরিবেশ গড়ে তোলার উদ্দীপনা', en: 'Fostering literary enthusiasm across partner educational institutes' }
                  ] : (selectedHighlight.id === '3' || selectedHighlight.title_bn?.includes('সেরা পাঠক')) ? [
                    { bn: 'মূল্যায়ন ফলাফলের ভিত্তিতে ৪টি মেধা স্তরে (স্বাগত, শুভেচ্ছা, অভিনন্দন, সেরা পাঠক) পুরস্কার', en: 'Awards across 4 merit categories based on evaluation test score' },
                    { bn: 'বিজয়ী পাঠকদের নিজস্ব গৃহ-লাইব্রেরি তৈরির জন্য আকর্ষণীয় বই সেট উপহার', en: 'Gift book sets to help meritorious students build personal home libraries' },
                    { bn: 'অভিভাবক ও শিক্ষকদের উপস্থিতিতে কেন্দ্রীয় অডিটোরিয়ামে জাতীয় পুরস্কার প্রদান', en: 'National award ceremony in central auditorium in presence of mentors' }
                  ] : [
                    { bn: 'শ্রেণিকক্ষে সহপাঠীদের সাথে যৌথ বই পর্যালোচনা ও স্বাধীন মতামত প্রকাশ', en: 'Group book reviews and open expression of analytical opinions' },
                    { bn: 'উপস্থিত বক্তৃতা, বিতর্ক ও সাহিত্য পাঠাগার কার্যক্রমের নিয়মিত চর্চা', en: 'Regular practice of extempore speeches and literary circle meets' },
                    { bn: 'শিক্ষার্থীদের মধ্যে যুক্তিনিষ্ঠ চিন্তা ও নান্দনিক জীবনবোধ তৈরি', en: 'Developing analytical logic and aesthetic values among youth' }
                  ]).map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                      <span>{language === 'bn' ? pt.bn : pt.en}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHighlight(null);
                    document.getElementById('sec-inquiry')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-serif font-bold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#F0CC7A]" />
                  <span>{language === 'bn' ? 'কার্যক্রমে অংশ নেওয়ার আবেদন করুন' : 'Apply for Program Participation'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedHighlight(null)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-serif font-bold rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close Window'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
