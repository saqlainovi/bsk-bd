import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, CheckCircle2, Award, Calendar, 
  Users, Mail, Phone, Search, ChevronRight, Eye, 
  School, Landmark, Library, HeartHandshake, HelpCircle, 
  FileText, Send, Star, ArrowRight, BookMarked
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultPrimaryTeacherData } from '../data/specializedPagesDefaults';

interface PrimaryTeacherPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto: (url: string) => void;
  setActivePhotoIndex: (i: number) => void;
  setActiveAlbumPhotos: (urls: string[]) => void;
}

export const PrimaryTeacherPage: React.FC<PrimaryTeacherPageProps> = ({
  page,
  language,
  onNavigate,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'workflow' | 'gallery' | 'faq' | 'contact'>('overview');
  const [searchBook, setSearchBook] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await cpanelApi.getDoc('website_pages', 'primary-teacher');
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

  const pageData = { 
    ...defaultPrimaryTeacherData, 
    ...page, 
    ...((page as any).primaryTeacherData || {}),
    ...dbPageData,
    ...((dbPageData as any)?.primaryTeacherData || {})
  };

  // Inquiry Form State
  const [form, setForm] = useState({ name: '', ptiName: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const heroTitle = language === 'bn'
    ? (pageData.title_bn || pageData.hero_title_bn || "প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি")
    : (pageData.title_en || pageData.hero_title_en || "Primary Teachers Reading Program");

  const heroSubtitle = language === 'bn'
    ? (pageData.hero_subtitle_bn || "ভবিষ্যৎ প্রজন্মের বাতিঘর প্রাথমিক শিক্ষকদের চিন্তার পরিধি প্রসারিত ও সংবেদনশীল মন গঠনে ২০১০ সাল থেকে পরিচালিত দেশব্যাপী অনন্য পাঠ আন্দোলন।")
    : (pageData.hero_subtitle_en || "A nationwide reading movement initiated in 2010 jointly with the Directorate of Primary Education to enrich the minds and vision of primary school educators.");

  const heroImage = pageData.cover_image || pageData.hero_image || "/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg";

  // Badges & Buttons
  const badgeInitiative = language === 'bn'
    ? (pageData.badge_initiative_bn || "যৌথ উদ্যোগ: বিসাকে ও প্রাথমিক শিক্ষা অধিদপ্তর (DPE)")
    : (pageData.badge_initiative_en || "Joint Initiative: BSK & DPE");

  const badgeEst = language === 'bn'
    ? (pageData.badge_est_bn || "স্থাপিত ২০১০ সাল")
    : (pageData.badge_est_en || "Est. 2010");

  const btnBooksLabel = language === 'bn'
    ? (pageData.btn_books_bn || "পড়ার বইসমূহ দেখুন")
    : (pageData.btn_books_en || "Explore Program Books");

  const btnContactLabel = language === 'bn'
    ? (pageData.btn_contact_bn || "যোগাযোগ ও তথ্য কেন্দ্র")
    : (pageData.btn_contact_en || "Inquiry Desk");

  // Statistics Counters
  const stats = {
    ptiCount: pageData.stats_pti || "৬৭টি",
    ptiLabel: language === 'bn' ? (pageData.stats_pti_label_bn || "পিটিআই (PTI) সেন্টারে সক্রিয়") : (pageData.stats_pti_label_en || "Active PTI Centers"),
    teachersCount: pageData.stats_teachers || "১২,০০০+",
    teachersLabel: language === 'bn' ? (pageData.stats_teachers_label_bn || "বার্ষিক শিক্ষক অংশগ্রহণকারী") : (pageData.stats_teachers_label_en || "Annual Educator Trainees"),
    booksCount: pageData.stats_books || "১২টি",
    booksLabel: language === 'bn' ? (pageData.stats_books_label_bn || "বাছাইকৃত পাঠ্য গ্রন্থমালা") : (pageData.stats_books_label_en || "Selected Core Books"),
    startYear: pageData.stats_year || "২০১০",
    yearLabel: language === 'bn' ? (pageData.stats_year_label_bn || "সফল পরিচালনার বর্ষ") : (pageData.stats_year_label_en || "Continuously Operating")
  };

  const bookList = Array.isArray(pageData.books) && pageData.books.length > 0
    ? pageData.books
    : (defaultPrimaryTeacherData.books || []);

  // Filter books
  const filteredBooks = bookList.filter((b: any) => {
    const q = searchBook.toLowerCase();
    const tBn = (b.titleBn || b.title_bn || '').toLowerCase();
    const tEn = (b.titleEn || b.title_en || '').toLowerCase();
    const aBn = (b.authorBn || b.author_bn || '').toLowerCase();
    return tBn.includes(q) || tEn.includes(q) || aBn.includes(q);
  });

  const workflowList = Array.isArray(pageData.workflow_steps) && pageData.workflow_steps.length > 0
    ? pageData.workflow_steps
    : (defaultPrimaryTeacherData.workflow_steps || []);

  const galleryList = Array.isArray(pageData.gallery) && pageData.gallery.length > 0
    ? pageData.gallery
    : (defaultPrimaryTeacherData.gallery || []);

  const faqList = Array.isArray(pageData.faqs) && pageData.faqs.length > 0
    ? pageData.faqs
    : (defaultPrimaryTeacherData.faqs || []);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম ও ফোন নম্বর পূরণ করুন।' : 'Please fill in your name and phone number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await cpanelApi.addDoc('contact_submissions', {
        category: 'Primary Teacher Program Inquiry',
        name: form.name,
        ptiName: form.ptiName,
        phone: form.phone,
        email: form.email,
        message: form.message,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setForm({ name: '', ptiName: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      setError(language === 'bn' ? 'তথ্য প্রেরণে সমস্যা হয়েছে। পরবর্তীতে আবার চেষ্টা করুন।' : 'Submission failed. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#1A1207] pb-12 font-sans">
      
      {/* HERO BANNER SECTION */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#B8862A]/30 bg-[#1A1207]">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={heroImage} 
            alt="Primary Teachers Program" 
            className="w-full h-full object-cover filter brightness-75 scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1207] via-[#1A1207]/80 to-transparent z-0" />
        
        <div className="relative z-10 p-6 md:p-12 space-y-6 text-[#FAF7F2]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#2E5942] text-[#E2F0D9] text-xs font-bold font-serif rounded-full shadow-sm flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              <span>{badgeInitiative}</span>
            </span>
            <span className="px-3 py-1 bg-[#B8862A]/30 border border-[#B8862A]/50 text-[#F0CC7A] text-xs font-bold rounded-full">
              {badgeEst}
            </span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              {heroTitle}
            </h1>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed font-sans font-light">
              {heroSubtitle}
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('books')}
              className="px-5 py-2.5 bg-[#B8862A] hover:bg-[#9A6D1F] text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{btnBooksLabel}</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Mail className="w-4 h-4" />
              <span>{btnContactLabel}</span>
            </button>
          </div>
        </div>

        {/* METRICS / STATS BAR */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#B8862A]/20 border-t border-white/10">
          <div className="bg-[#1A1207]/90 p-4 text-center backdrop-blur-md space-y-1">
            <div className="flex items-center justify-center text-[#F0CC7A] mb-1">
              <School className="w-5 h-5" />
            </div>
            <p className="font-serif text-xl md:text-2xl font-bold text-white">{stats.ptiCount}</p>
            <p className="text-[11px] text-stone-400 font-sans">{stats.ptiLabel}</p>
          </div>

          <div className="bg-[#1A1207]/90 p-4 text-center backdrop-blur-md space-y-1">
            <div className="flex items-center justify-center text-[#F0CC7A] mb-1">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-serif text-xl md:text-2xl font-bold text-white">{stats.teachersCount}</p>
            <p className="text-[11px] text-stone-400 font-sans">{stats.teachersLabel}</p>
          </div>

          <div className="bg-[#1A1207]/90 p-4 text-center backdrop-blur-md space-y-1">
            <div className="flex items-center justify-center text-[#F0CC7A] mb-1">
              <BookMarked className="w-5 h-5" />
            </div>
            <p className="font-serif text-xl md:text-2xl font-bold text-white">{stats.booksCount}</p>
            <p className="text-[11px] text-stone-400 font-sans">{stats.booksLabel}</p>
          </div>

          <div className="bg-[#1A1207]/90 p-4 text-center backdrop-blur-md space-y-1">
            <div className="flex items-center justify-center text-[#F0CC7A] mb-1">
              <Award className="w-5 h-5" />
            </div>
            <p className="font-serif text-xl md:text-2xl font-bold text-white">{stats.startYear}</p>
            <p className="text-[11px] text-stone-400 font-sans">{stats.yearLabel}</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8DDD0] scrollbar-none">
        {[
          { id: 'overview', nameBn: 'কর্মসূচি পরিচিতি', nameEn: 'Program Overview', icon: BookOpen },
          { id: 'books', nameBn: `বইয়ের তালিকা ও সিলেবাস (${bookList.length})`, nameEn: `Book List & Titles (${bookList.length})`, icon: BookMarked },
          { id: 'workflow', nameBn: 'বাস্তবায়ন ও মূল্যায়ন', nameEn: 'Execution Workflow', icon: CheckCircle2 },
          { id: 'gallery', nameBn: `আলোকচিত্র গ্যালারি (${galleryList.length})`, nameEn: `Photo Gallery (${galleryList.length})`, icon: Eye },
          { id: 'faq', nameBn: 'সাধারণ জিজ্ঞাসা (FAQ)', nameEn: 'FAQs & Guidelines', icon: HelpCircle },
          { id: 'contact', nameBn: 'যোগাযোগ ও হেল্পডেস্ক', nameEn: 'Inquiry Desk', icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold font-serif whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-[#2E5942] text-white shadow-md' 
                  : 'bg-white text-stone-700 hover:bg-[#FAF7F2] border border-[#E8DDD0]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0CC7A]' : 'text-stone-500'}`} />
              <span>{language === 'bn' ? tab.nameBn : tab.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-6">
            <article className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-[#E8DDD0] pb-4">
                <div className="p-2.5 bg-[#FAF7F2] text-[#2E5942] rounded-xl border border-[#B8862A]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg md:text-xl font-bold text-[#1A1207]">
                    {language === 'bn' ? (pageData.vision_title_bn || 'কর্মসূচির দর্শন ও গুরুত্ব') : (pageData.vision_title_en || 'Program Vision & Philosophy')}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'bn' ? (pageData.vision_subtitle_bn || 'আলোকিত প্রাথমিক শিক্ষকই পারেন ভবিষ্যৎ বাংলাদেশকে সুন্দর করে গড়ে তুলতে') : (pageData.vision_subtitle_en || 'Empowering primary educators with broad vision')}
                  </p>
                </div>
              </div>

              {/* Dynamic Sections or Default Text */}
              <div className="space-y-4 text-stone-800 leading-relaxed text-sm md:text-base">
                {Array.isArray(page.sections) && page.sections.length > 0 ? (
                  page.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      {sec.title && sec.title !== page.title_bn && (
                        <h3 className="font-serif text-base md:text-lg font-bold text-[#2E5942] pt-2">
                          {sec.title}
                        </h3>
                      )}
                      {Array.isArray(sec.content) && sec.content.map((para, pIdx) => (
                        <p key={pIdx} className="text-justify font-sans leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  <>
                    <p className="text-justify font-sans leading-relaxed">
                      শিক্ষকের মনকে রুচিস্নিগ্ধ ও উন্নত করে তোলা গেলে ছাত্রসমাজও তার স্পর্শে সম্পন্ন হয়ে উঠতে পারে—বিশেষ করে প্রাথমিক শিক্ষার দিনগুলোতে। এই লক্ষ্য সামনে রেখে ২০১০ সাল থেকে প্রাথমিক শিক্ষা অধিদপ্তরের সংগে যৌথ-উদ্যোগে প্রতিবছর দেশের ৬৭টি পিটিআই-এর ১২ হাজার প্রশিক্ষণার্থীর সবার জন্য ১২টি করে বইপড়ানোর কর্মসূচি হাতে নেয়া হয়েছে।
                    </p>
                    <p className="text-justify font-sans leading-relaxed">
                      বইপড়ার প্রাপ্তি হিশেবে পরীক্ষার নম্বর ছাড়াও অংশগ্রহণকারীদের বই উপহার পাবার সুযোগ রয়েছে। অনুপ্রেরণামুলক, কল্পনাসমৃদ্ধ ও চিত্তাকর্ষক এই উপন্যাস ও গল্পের বইগুলো শিক্ষকদের ও তাঁদের ভবিষ্যৎ শিক্ষার্থীদের মনকে প্রভাবিত করবে এ আশা কেন্দ্রের রয়েছে।
                    </p>
                  </>
                )}
              </div>

              {/* Highlight Quote Box */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border-l-4 border-[#B8862A] shadow-xs space-y-2">
                <p className="font-serif italic text-sm md:text-base text-stone-800 font-medium leading-relaxed">
                  {language === 'bn' 
                    ? (pageData.quote_text_bn || "“একটি শিশুর সবচেয়ে বড় বাতিঘর তার প্রাথমিক শিক্ষক। সেই শিক্ষক যদি চিন্তা, অনুভূতি ও মূল্যবোধে আলোকিত হন, তবে গোটা সমাজ রূপান্তরিত হতে বাধ্য।”")
                    : (pageData.quote_text_en || "\"The greatest beacon in a child's life is their primary teacher. If that teacher is enlightened in thought and values, the entire society will transform.\"")}
                </p>
                <p className="text-xs font-bold text-[#2E5942] font-serif">
                  {language === 'bn'
                    ? (pageData.quote_author_bn || "— আবদুল্লাহ আবু সায়ীদ (প্রতিষ্ঠাতা, বিশ্বসাহিত্য কেন্দ্র)")
                    : (pageData.quote_author_en || "— Abdullah Abu Sayeed (Founder, Bishwo Shahitto Kendro)")}
                </p>
              </div>
            </article>

            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs flex items-start gap-3.5">
                <div className="p-2.5 bg-[#2E5942]/10 text-[#2E5942] rounded-xl shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#1A1207]">
                    {language === 'bn' ? (pageData.feature1_title_bn || '১২টি রুচিশীল উৎকৃষ্ট বই') : (pageData.feature1_title_en || '12 Curated Books')}
                  </h4>
                  <p className="text-xs text-stone-600 font-sans leading-normal">
                    {language === 'bn' ? (pageData.feature1_desc_bn || 'উপন্যাস, গল্প, ইতিহাস ও শিক্ষাদানের নান্দনিক বই সম্বলিত বিশেষ সংগ্রহ।') : (pageData.feature1_desc_en || 'Carefully chosen novels, history, and teaching guides.')}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs flex items-start gap-3.5">
                <div className="p-2.5 bg-[#B8862A]/10 text-[#B8862A] rounded-xl shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#1A1207]">
                    {language === 'bn' ? (pageData.feature2_title_bn || 'একাডেমিক নম্বর ও উপহার') : (pageData.feature2_title_en || 'Credits & Book Prizes')}
                  </h4>
                  <p className="text-xs text-stone-600 font-sans leading-normal">
                    {language === 'bn' ? (pageData.feature2_desc_bn || 'মূল্যায়ন পরীক্ষার সফলতায় নম্বরসহ সুন্দর বই উপহার প্রাপ্তির ব্যবস্থা।') : (pageData.feature2_desc_en || 'Academic credit marks and gift book packages.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
                <Library className="w-4 h-4 text-[#2E5942]" />
                <span>{language === 'bn' ? (pageData.summary_title_bn || 'এক নজরে কর্মসূচি') : (pageData.summary_title_en || 'Program Summary')}</span>
              </h3>
              
              <ul className="space-y-3 text-xs text-stone-700 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                  <span><strong>{language === 'bn' ? 'অংশগ্রহণকারী:' : 'Participants:'}</strong> {language === 'bn' ? (pageData.summary_participants_bn || 'সকল পিটিআই প্রশিক্ষণার্থী শিক্ষক') : (pageData.summary_participants_en || 'All PTI Educator Trainees')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                  <span><strong>{language === 'bn' ? 'বাস্তবায়ন স্থান:' : 'Location:'}</strong> {language === 'bn' ? (pageData.summary_location_bn || 'বাংলাদেশের ৬৭টি সরকারি-বেসরকারি পিটিআই') : (pageData.summary_location_en || 'All 67 PTIs nationwide')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                  <span><strong>{language === 'bn' ? 'যৌথ পরিচালনায়:' : 'Organizers:'}</strong> {language === 'bn' ? (pageData.summary_organizers_bn || 'বিশ্বসাহিত্য কেন্দ্র ও প্রাথমিক শিক্ষা অধিদপ্তর') : (pageData.summary_organizers_en || 'BSK & Directorate of Primary Education')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                  <span><strong>{language === 'bn' ? 'বার্ষিক সময়সীমা:' : 'Annual Cycle:'}</strong> {language === 'bn' ? (pageData.summary_cycle_bn || 'পিটিআই শিক্ষাবর্ষ অনুযায়ী ১ বছর') : (pageData.summary_cycle_en || '1 Year PTI Academic Session')}</span>
                </li>
              </ul>

              <button
                onClick={() => setActiveTab('contact')}
                className="w-full py-2.5 bg-[#2E5942] hover:bg-[#1f3e2e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? (pageData.summary_btn_label_bn || 'পিটিআই সমন্বয় হেল্পডেস্ক') : (pageData.summary_btn_label_en || 'PTI Coordinator Desk')}</span>
              </button>
            </div>

            {/* Photo Preview Mini Box */}
            {galleryList.length > 0 && (
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DDD0] space-y-3">
                <h4 className="font-serif font-bold text-xs text-[#1A1207] flex items-center justify-between">
                  <span>{language === 'bn' ? 'ছবি ও ভিডিও স্মারক' : 'Photo Memory'}</span>
                  <button 
                    onClick={() => setActiveTab('gallery')}
                    className="text-[11px] text-[#2E5942] hover:underline font-bold"
                  >
                    {language === 'bn' ? 'সবগুলো দেখুন →' : 'View All →'}
                  </button>
                </h4>
                
                <div 
                  onClick={() => {
                    setActivePhoto(galleryList[0].url);
                    setActivePhotoIndex(0);
                    setActiveAlbumPhotos(galleryList.map((g: any) => g.url));
                  }}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-[#E8DDD0] relative aspect-video shadow-xs"
                >
                  <img 
                    src={galleryList[0].url} 
                    alt={galleryList[0].captionBn || 'Gallery Cover'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BOOKS & TITLES */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1207] flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-[#2E5942]" />
                <span>{language === 'bn' ? (pageData.books_heading_bn || 'কর্মসূচিতে পঠিত বইসমূহ') : (pageData.books_heading_en || 'Selected Reading List')}</span>
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {language === 'bn' ? (pageData.books_subtitle_bn || 'প্রশিক্ষণার্থী শিক্ষকদের জন্য নির্ধারিত বাছাইকৃত বই') : (pageData.books_subtitle_en || 'Curated books for trainee primary school educators')}
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                placeholder={language === 'bn' ? 'বই বা লেখকের নাম খুঁজুন...' : 'Search book or author...'}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
              />
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredBooks.map((book: any, idx: number) => (
              <div 
                key={book.id || idx}
                className="bg-white p-5 rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-28 h-36 rounded-xl overflow-hidden bg-stone-100 border border-[#E8DDD0] shrink-0 shadow-sm mx-auto sm:mx-0">
                  <img 
                    src={book.cover || "/assets/IMGS/482961231_1052017300283084_4946044543018534392_n.jpg"} 
                    alt={book.titleBn || book.title_bn} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-2 flex-1 text-left">
                  <span className="px-2 py-0.5 bg-[#2E5942]/10 text-[#2E5942] text-[10px] font-bold rounded-md inline-block font-mono">
                    Book #{idx + 1}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#1A1207] leading-tight">
                    {language === 'bn' ? (book.titleBn || book.title_bn) : (book.titleEn || book.title_en || book.titleBn)}
                  </h3>
                  <p className="text-xs font-semibold text-[#B8862A] font-serif">
                    {language === 'bn' ? (book.authorBn || book.author_bn) : (book.authorEn || book.author_en || book.authorBn)}
                  </p>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3 pt-1">
                    {language === 'bn' ? (book.descBn || book.desc_bn) : (book.descEn || book.desc_en || book.descBn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#1A1207] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2E5942]" />
              <span>{language === 'bn' ? (pageData.workflow_heading_bn || 'বাস্তবায়ন ও মূল্যায়ন পর্যায়সমূহ') : (pageData.workflow_heading_en || 'Program Execution & Evaluation Steps')}</span>
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              {language === 'bn' ? (pageData.workflow_subtitle_bn || 'পিটিআই সমাপনী বর্ষে বইপড়া পরিচালনার পূর্ণাঙ্গ প্রক্রিয়া') : (pageData.workflow_subtitle_en || 'Step-by-step methodology followed across all 67 PTIs')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowList.map((st: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E5942] text-[#F0CC7A] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {st.step || `০${i + 1}`}
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-serif font-bold text-base text-[#1A1207]">
                    {language === 'bn' ? (st.titleBn || st.title_bn) : (st.titleEn || st.title_en || st.titleBn)}
                  </h3>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">
                    {language === 'bn' ? (st.descBn || st.desc_bn) : (st.descEn || st.desc_en || st.descBn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs">
            <h2 className="font-serif text-lg font-bold text-[#1A1207] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#2E5942]" />
              <span>{language === 'bn' ? (pageData.gallery_heading_bn || 'আলোকচিত্র গ্যালারি') : (pageData.gallery_heading_en || 'Photo Archives & Gallery')}</span>
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              {language === 'bn' ? (pageData.gallery_subtitle_bn || 'পিটিআই সেমিনার, বই উপহার বিতরণ ও শিক্ষকদের অংশগ্রহণের স্থিরচিত্র') : (pageData.gallery_subtitle_en || 'Visual moments from PTI seminars and book distribution ceremonies')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryList.map((item: any, idx: number) => (
              <div 
                key={idx}
                onClick={() => {
                  setActivePhoto(item.url);
                  setActivePhotoIndex(idx);
                  setActiveAlbumPhotos(galleryList.map((g: any) => g.url));
                }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img 
                    src={item.url} 
                    alt={language === 'bn' ? (item.captionBn || item.caption_bn) : (item.captionEn || item.caption_en)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                    <div className="opacity-0 group-hover:opacity-100 p-2.5 bg-white text-[#1A1207] rounded-full shadow-lg transition">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs text-stone-700 font-sans font-medium line-clamp-2 text-left group-hover:text-[#2E5942] transition">
                    {language === 'bn' ? (item.captionBn || item.caption_bn) : (item.captionEn || item.caption_en || item.captionBn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: FAQS */}
      {activeTab === 'faq' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs text-left mb-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1207] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#2E5942]" />
              <span>{language === 'bn' ? (pageData.faq_heading_bn || 'সাধারণ জিজ্ঞাসা ও নির্দেশিকা') : (pageData.faq_heading_en || 'Frequently Asked Questions')}</span>
            </h2>
          </div>

          {faqList.map((faq: any, idx: number) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-serif font-bold text-sm md:text-base text-[#1A1207] flex items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 transition cursor-pointer"
                >
                  <span>{language === 'bn' ? (faq.qBn || faq.question_bn) : (faq.qEn || faq.question_en || faq.qBn)}</span>
                  <span className="text-stone-400 font-sans font-bold text-lg">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs md:text-sm text-stone-600 font-sans leading-relaxed border-t border-[#E8DDD0]/50 bg-[#FAF7F2]/30 text-left">
                    {language === 'bn' ? (faq.aBn || faq.answer_bn) : (faq.aEn || faq.answer_en || faq.aBn)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT 6: CONTACT & INQUIRY */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-5 bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs text-left">
            <h3 className="font-serif font-bold text-base text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2E5942]" />
              <span>{language === 'bn' ? (pageData.contact_title_bn || 'পিটিআই ডেস্কে যোগাযোগ') : (pageData.contact_title_en || 'PTI Program Desk')}</span>
            </h3>

            <div className="space-y-3 text-xs text-stone-700 font-sans">
              <p className="flex items-start gap-2.5">
                <Landmark className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                <span><strong>{language === 'bn' ? 'কেন্দ্রীয় কার্যালয়:' : 'Headquarters:'}</strong> {language === 'bn' ? (pageData.contact_hq_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৪ নম্বর সংগ্রাহক রোড, বাংলামোটর, ঢাকা।') : (pageData.contact_hq_en || 'Bishwo Shahitto Kendro Bhaban, 14 Shongrahok Road, Banglamotor, Dhaka.')}</span>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                <span><strong>{language === 'bn' ? 'ইমেইল:' : 'Email:'}</strong> {pageData.contact_email || 'primary@bskbd.org'}</span>
              </p>
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                <span><strong>{language === 'bn' ? 'ফোন / হটলাইন:' : 'Phone:'}</strong> {pageData.contact_phone || '+৮৮০-২-৯৬৬১১৮৮ (এক্সটেনশন: ১০৮)'}</span>
              </p>
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs text-left space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1207] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#2E5942]" />
              <span>{language === 'bn' ? (pageData.inquiry_title_bn || 'পিটিআই বা শিক্ষক অনুসন্ধানী তথ্য বার্তা') : (pageData.inquiry_title_en || 'Send Inquiry Message')}</span>
            </h3>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1">
                <p className="font-bold font-serif">{language === 'bn' ? 'ধন্যবাদ! আপনার বার্তা সফলভাবে জমা হয়েছে।' : 'Thank you! Your message has been sent.'}</p>
                <p>{language === 'bn' ? 'আমাদের পিটিআই ডেস্ক থেকে দ্রুত আপনার সাথে যোগাযোগ করা হবে।' : 'Our PTI program desk will get back to you shortly.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                    </label>
                    <input 
                      type="text" 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {language === 'bn' ? 'পিটিআই-এর নাম (PTI Name)' : 'PTI Name'}
                    </label>
                    <input 
                      type="text" 
                      value={form.ptiName}
                      onChange={(e) => setForm({ ...form, ptiName: e.target.value })}
                      placeholder="e.g. ঢাকা পিটিআই"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input 
                      type="tel" 
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                    </label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    {language === 'bn' ? 'আপনার বার্তা / প্রশ্ন' : 'Message / Inquiry'}
                  </label>
                  <textarea 
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2E5942]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#2E5942] hover:bg-[#1f3e2e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...') : (language === 'bn' ? 'বার্তা পাঠান' : 'Submit Inquiry')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
