import React, { useState, useEffect } from 'react';
import { 
  Library, BookOpen, Clock, HeartHandshake, Award, ShieldCheck, 
  CheckCircle2, Search, Download, Bookmark, FileText, ChevronRight, X, Sparkles, Building, ArrowRight
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultCentralLibraryData } from '../data/specializedPagesDefaults';

interface CentralLibraryPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (route: string) => void;
}

export const CentralLibraryPage: React.FC<CentralLibraryPageProps> = ({ page, language, onNavigate }) => {
  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(0);

  // Interactive Modals
  const [catalogSearchOpen, setCatalogSearchOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [membershipSubmitted, setMembershipSubmitted] = useState(false);
  const [membershipSubmitting, setMembershipSubmitting] = useState(false);
  const [membershipError, setMembershipError] = useState('');
  const [membershipForm, setMembershipForm] = useState({
    name: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    duration: '1'
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        const data = await cpanelApi.getDoc('website_pages', 'central-library');
        if (data && isMounted) {
          setDbPageData(data);
        }
      } catch (e) {
        console.warn('Central library live sync notice:', e);
      }
    };
    fetchPage();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'website_pages') {
        fetchPage();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bsk_db_updated', handleUpdate);
    };
  }, []);

  const pageData = {
    ...defaultCentralLibraryData,
    ...(page?.centralLibraryData || {}),
    ...page,
    ...(dbPageData?.centralLibraryData || {}),
    ...dbPageData
  };

  // 1. Hero Fields
  const heroBadge = language === 'bn' 
    ? (pageData.hero_badge_bn || pageData.badge_bn || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_badge_bn || pageData.centralLibraryData.badge_bn)) || 'বিশ্বসাহিত্য কেন্দ্র') 
    : (pageData.hero_badge_en || pageData.badge_en || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_badge_en || pageData.centralLibraryData.badge_en)) || 'Bishwo Shahitto Kendro');

  const heroTitle = language === 'bn'
    ? (pageData.hero_title_bn || pageData.title_bn || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_title_bn || pageData.centralLibraryData.title_bn)) || 'কেন্দ্রীয় লাইব্রেরি')
    : (pageData.hero_title_en || pageData.title_en || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_title_en || pageData.centralLibraryData.title_en)) || 'Central Library HQ');

  const heroSubtitle = language === 'bn'
    ? (pageData.hero_subtitle_bn || pageData.subtitle_bn || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_subtitle_bn || pageData.centralLibraryData.subtitle_bn)) || '১৯৭৮ সাল থেকে রুচিশীল ও মননশীল পাঠক তৈরির নির্ভরযোগ্য ঠিকানা')
    : (pageData.hero_subtitle_en || pageData.subtitle_en || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_subtitle_en || pageData.centralLibraryData.subtitle_en)) || 'A haven for book lovers and researchers since 1978');

  const heroDesc = language === 'bn'
    ? (pageData.hero_desc_bn || (pageData.centralLibraryData && pageData.centralLibraryData.hero_desc_bn) || 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্র লাইব্রেরিটি দেশ-বিদেশের অমূল্য ও ঐতিহ্যবাহী গ্রন্থের এক বিশাল আধার। পাঠকদের মননশীল ও উন্নত দৃষ্টিভঙ্গি গঠনে এবং তাদের জ্ঞানের দিগন্ত প্রসারিত করতে এই পাঠাগার দীর্ঘ চার দশকেরও বেশি সময় ধরে নিরলস সেবা দিয়ে যাচ্ছে।')
    : (pageData.hero_desc_en || (pageData.centralLibraryData && pageData.centralLibraryData.hero_desc_en) || 'The Central Library of Bishwo Shahitto Kendro houses an extraordinary array of global literature and rare academic volumes.');

  const heroImage = pageData.hero_image || pageData.heroImage || (pageData.centralLibraryData && (pageData.centralLibraryData.hero_image || pageData.centralLibraryData.heroImage)) || '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg';

  const applyBtnLabel = language === 'bn'
    ? (pageData.apply_btn_label_bn || (pageData.centralLibraryData && pageData.centralLibraryData.apply_btn_label_bn) || 'সদস্য হতে আবেদন করুন')
    : (pageData.apply_btn_label_en || (pageData.centralLibraryData && pageData.centralLibraryData.apply_btn_label_en) || 'Apply for Membership');

  // 2. Stats
  const rawStats = pageData.stats || (pageData.centralLibraryData && pageData.centralLibraryData.stats) || defaultCentralLibraryData.stats;
  const parsedStats = Array.isArray(rawStats) ? rawStats.map((st: any) => ({
    val: language === 'bn' ? (st.val || st.val_bn || '') : (st.val_en || st.val || ''),
    lbl: language === 'bn' ? (st.lbl || st.lbl_bn || '') : (st.lbl_en || st.lbl || ''),
    sub: language === 'bn' ? (st.sub || st.sub_bn || '') : (st.sub_en || st.sub || '')
  })) : [];

  // 3. About & Mission
  const aboutHeading = language === 'bn'
    ? (pageData.about_heading_bn || (pageData.centralLibraryData && pageData.centralLibraryData.about_heading_bn) || 'লাইব্রেরির পরিচিতি ও লক্ষ্য')
    : (pageData.about_heading_en || (pageData.centralLibraryData && pageData.centralLibraryData.about_heading_en) || 'About the Central Library');

  const aboutText = language === 'bn'
    ? (pageData.about_text_bn || (pageData.centralLibraryData && pageData.centralLibraryData.about_text_bn) || 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্র লাইব্রেরিটি দেশ-বিদেশের অমূল্য ও ঐতিহ্যবাহী গ্রন্থের এক বিশাল আধার। পাঠকদের মননশীল ও উন্নত দৃষ্টিভঙ্গি গঠনে এবং তাদের জ্ঞানের দিগন্ত প্রসারিত করতে এই পাঠাগার দীর্ঘ চার দশকেরও বেশি সময় ধরে নিরলস সেবা দিয়ে যাচ্ছে।')
    : (pageData.about_text_en || (pageData.centralLibraryData && pageData.centralLibraryData.about_text_en) || 'The Central Library of Bishwo Shahitto Kendro houses an extraordinary array of global literature and rare academic volumes.');

  const missionTitle = language === 'bn'
    ? (pageData.mission_title_bn || (pageData.centralLibraryData && pageData.centralLibraryData.mission_title_bn) || 'আমাদের মূল উদ্দেশ্য (Mission)')
    : (pageData.mission_title_en || (pageData.centralLibraryData && pageData.centralLibraryData.mission_title_en) || 'Our Mission');

  const missionText = language === 'bn'
    ? (pageData.mission_text_bn || (pageData.centralLibraryData && pageData.centralLibraryData.mission_text_bn) || 'মানসম্পন্ন সাহিত্য ও মননশীল গ্রন্থের মাধ্যমে মানুষের মনকে প্রসারিত ও আলোকিত করা এবং একটি সংবেদনশীল ও প্রজ্ঞাবান জাতি গড়ে তোলার মূল চালিকাশক্তি হিসেবে কাজ করা।')
    : (pageData.mission_text_en || (pageData.centralLibraryData && pageData.centralLibraryData.mission_text_en) || 'To cultivate a reading culture and elevate human consciousness through exposure to fine literature, arts, and philosophy.');

  const f1Title = language === 'bn' ? (pageData.feature1_title_bn || (pageData.centralLibraryData && pageData.centralLibraryData.feature1_title_bn) || 'বইয়ের বিশাল সংগ্রহ') : (pageData.feature1_title_en || 'Pristine Collection');
  const f1Desc = language === 'bn' ? (pageData.feature1_desc_bn || (pageData.centralLibraryData && pageData.centralLibraryData.feature1_desc_bn) || 'আমাদের সংগ্রহে রয়েছে বাংলা সাহিত্য, অনূদিত বিশ্বসাহিত্য, বিজ্ঞান, ইতিহাস, দর্শন ও চিত্রকলার সুবিন্যস্ত সম্ভার।') : (pageData.feature1_desc_en || 'Features rare translations, classic world fiction, historical chronicles, scientific journals, philosophy, art, and children literature.');

  const f2Title = language === 'bn' ? (pageData.feature2_title_bn || (pageData.centralLibraryData && pageData.centralLibraryData.feature2_title_bn) || 'মনোরম পাঠ পরিবেশ') : (pageData.feature2_title_en || 'Aesthetic Environment');
  const f2Desc = language === 'bn' ? (pageData.feature2_desc_bn || (pageData.centralLibraryData && pageData.centralLibraryData.feature2_desc_bn) || 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত, কোলাহলমুক্ত ও সুপ্রশস্ত পাঠকক্ষ। প্রাকৃতিক আলো-বাতাস ও মনোরম ইন্টেরিয়র ডিজাইন পাঠকদের অধ্যয়নকে ফলপ্রসূ করে তোলে।') : (pageData.feature2_desc_en || 'Spacious, naturally lit, and air-conditioned reading halls create a tranquil space. Modern desks and comfortable seating.');

  // 4. Services
  const rawServices = pageData.services || (pageData.centralLibraryData && pageData.centralLibraryData.services) || defaultCentralLibraryData.services;
  const galleryServices = Array.isArray(rawServices) ? rawServices.map((ser: any, idx: number) => ({
    title_bn: ser.title_bn || `সেবা #${idx + 1}`,
    title_en: ser.title_en || `Service #${idx + 1}`,
    img: ser.img || ser.image || '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg',
    desc_bn: ser.desc_bn || '',
    desc_en: ser.desc_en || '',
    schedule_bn: ser.schedule_bn || 'শনিবার - বৃহস্পতিবার',
    schedule_en: ser.schedule_en || 'Sat - Thu',
    icon: BookOpen
  })) : [];

  const activeSer = galleryServices[activeServiceIndex] || galleryServices[0] || {
    title_bn: 'কেন্দ্রীয় পাঠাগার সেবা',
    title_en: 'Central Library Service',
    img: '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg',
    desc_bn: '',
    desc_en: '',
    schedule_bn: 'শনিবার - বৃহস্পতিবার',
    schedule_en: 'Sat - Thu',
    icon: BookOpen
  };

  // 5. Categories
  const rawCategories = pageData.categories || (pageData.centralLibraryData && pageData.centralLibraryData.categories) || defaultCentralLibraryData.categories;

  // 6. Membership Rules & Plans
  const membershipRulesTitle = language === 'bn'
    ? (pageData.membership_rules_title_bn || (pageData.centralLibraryData && pageData.centralLibraryData.membership_rules_title_bn) || 'গ্রন্থাগারের সদস্যপদ লাভ ও নিয়মাবলী')
    : (pageData.membership_rules_title_en || (pageData.centralLibraryData && pageData.centralLibraryData.membership_rules_title_en) || 'Library Membership & Rules');

  const membershipRules = language === 'bn'
    ? (pageData.membership_rules_bn || (pageData.centralLibraryData && pageData.centralLibraryData.membership_rules_bn) || defaultCentralLibraryData.membership_rules_bn)
    : (pageData.membership_rules_en || (pageData.centralLibraryData && pageData.centralLibraryData.membership_rules_en) || defaultCentralLibraryData.membership_rules_en);

  const membershipPlans = pageData.membershipPlans || (pageData.centralLibraryData && pageData.centralLibraryData.membershipPlans) || defaultCentralLibraryData.membershipPlans;

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembershipSubmitting(true);
    setMembershipError('');
    try {
      await cpanelApi.addDoc('inquiries', {
        type: 'library_membership',
        ...membershipForm,
        submittedAt: new Date().toISOString()
      });
      setMembershipSubmitted(true);
    } catch (err: any) {
      setMembershipError(err.message || 'Error submitting membership form');
    } finally {
      setMembershipSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 w-full animate-fade-in text-left font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="relative bg-[#FAF8F3] border border-[#E8DDD0] rounded-3xl overflow-hidden shadow-xs">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#B8862A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 items-center">
          
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 bg-[#B8862A]/10 text-[#B8862A] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#B8862A]/20 font-mono">
              <Library className="w-3.5 h-3.5" />
              <span>{heroBadge}</span>
            </span>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1207] tracking-tight leading-tight">
              {heroTitle}
            </h1>

            <p className="text-stone-700 text-xs md:text-sm leading-relaxed font-sans font-medium">
              {heroSubtitle}
            </p>

            <p className="text-stone-500 text-xs leading-relaxed font-sans">
              {heroDesc}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => setMembershipModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2 bg-[#B8862A] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-[#9A6D1F] transition-all shadow-xs cursor-pointer hover:shadow-md"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{applyBtnLabel}</span>
              </button>

              <button 
                onClick={() => setCatalogSearchOpen(true)}
                className="inline-flex items-center justify-center space-x-2 bg-white text-stone-800 border border-[#E8DDD0] px-5 py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-stone-50 hover:border-[#B8862A] transition-all shadow-2xs cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? 'ক্যাটালগ অনুসন্ধান' : 'Search Catalog'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#B8862A]/20 to-[#E8DDD0] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
            <div className="relative aspect-video min-h-[240px] md:min-h-[280px] w-full rounded-2xl overflow-hidden border-2 border-[#B8862A]/30 bg-stone-900 shadow-xl flex items-center justify-center">
              <img 
                src={heroImage} 
                alt={heroTitle} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-102 block"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg';
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. 4 STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {parsedStats.map((st: any, sidx: number) => (
          <div key={sidx} className="bg-white border border-[#E8DDD0] rounded-2xl p-5 text-left space-y-2 hover:border-[#B8862A] hover:shadow-md transition-all duration-300 group shadow-2xs">
            <div className="space-y-1">
              <div className="font-serif font-extrabold text-lg sm:text-xl text-[#1A1207]">
                {st.val}
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-700">
                {st.lbl}
              </div>
              <div className="text-[11px] text-stone-500">
                {st.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ABOUT & MISSION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-2xs">
          <div>
            <span className="text-[#8C6212] bg-[#F7EFE5] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              {language === 'bn' ? 'ঐতিহ্য ও লক্ষ্য' : 'Heritage & Mission'}
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1A1207] mt-2">
              {aboutHeading}
            </h2>
          </div>

          <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans">
            {aboutText}
          </p>

          <div className="border-t border-[#E8DDD0] pt-5 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1A1207] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8862A]" />
              <span>{missionTitle}</span>
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed italic bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DDD0]/60">
              "{missionText}"
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF8F5] border border-[#E8DDD0] rounded-2xl p-6 text-left space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#1A1207] text-[#F0CC7A] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-[#F0CC7A]" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm">
              {f1Title}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              {f1Desc}
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E8DDD0] rounded-2xl p-6 text-left space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#1A1207] text-[#F0CC7A] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#F0CC7A]" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm">
              {f2Title}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              {f2Desc}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 6 SERVICES & GALLERY */}
      <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-[#E8DDD0] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
              <span className="w-2 h-6 bg-[#B8862A] inline-block rounded-xs" />
              <span>{language === 'bn' ? (pageData.services_heading_bn || 'লাইব্রেরি সেবাসমূহ ও গ্যালারি') : (pageData.services_heading_en || 'Library Services & Photo Gallery')}</span>
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              {language === 'bn' ? (pageData.services_sub_bn || 'যেকোনো সেবায় ক্লিক করে বিস্তারিত বিবরণ এবং ছবির গ্যালারি দেখে নিন') : (pageData.services_sub_en || 'Click any service tile below to explore details and view live photos')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#FAF7F2] text-[#8C6212] px-3 py-1.5 rounded-full border border-[#B8862A]/20">
            {language === 'bn' ? `মোট ${galleryServices.length}টি প্রধান সেবা` : `${galleryServices.length} Core Services`}
          </span>
        </div>

        {/* Active Service Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DDD0]">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono bg-[#1A1207] text-[#F0CC7A] px-3 py-1 rounded-full">
                {language === 'bn' ? `সেবা #${activeServiceIndex + 1}` : `Service #${activeServiceIndex + 1}`}
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'bn' ? activeSer.schedule_bn : activeSer.schedule_en}
              </span>
            </div>

            <h4 className="font-serif text-xl font-bold text-[#1A1207]">
              {language === 'bn' ? activeSer.title_bn : activeSer.title_en}
            </h4>

            <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-sans">
              {language === 'bn' ? activeSer.desc_bn : activeSer.desc_en}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E8DDD0] shadow-sm relative group">
              <img 
                src={activeSer.img} 
                alt={activeSer.title_en} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg';
                }}
              />
            </div>
          </div>
        </div>

        {/* Service Selector Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {galleryServices.map((ser: any, idx: number) => {
            const isSelected = activeServiceIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveServiceIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-full space-y-2 ${
                  isSelected ? 'bg-[#1A1207] text-[#F0CC7A] border-[#1A1207] shadow-sm' : 'bg-white text-stone-800 border-[#E8DDD0] hover:border-[#B8862A] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-stone-100/20 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="text-xs font-bold font-serif leading-snug">
                  {language === 'bn' ? ser.title_bn : ser.title_en}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. 8 BOOK CATEGORIES */}
      <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-[#E8DDD0] pb-3">
          <h3 className="font-serif text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-[#B8862A]" />
            <span>{language === 'bn' ? (pageData.categories_heading_bn || 'জনপ্রিয় বইয়ের বিভাগসমূহ') : (pageData.categories_heading_en || 'Popular Book Categories')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {rawCategories.map((cat: any, cidx: number) => (
            <div key={cidx} className="bg-[#FAF8F5] border border-[#E8DDD0] hover:border-[#B8862A] p-4 rounded-2xl space-y-2 shadow-2xs hover:shadow-sm transition-all text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-white text-[#8C6212] px-2 py-0.5 rounded-md border border-[#E8DDD0]">
                  {language === 'bn' ? (cat.count_bn || cat.count) : (cat.count_en || cat.count_bn || cat.count)}
                </span>
                <Bookmark className="w-3.5 h-3.5 text-[#B8862A]" />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                {language === 'bn' ? (cat.name_bn || cat.name) : (cat.name_en || cat.name)}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* 6. MEMBERSHIP RULES & 3 TIERS */}
      <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 space-y-8 shadow-2xs">
        
        {/* Rules Box */}
        <div className="space-y-4 text-left">
          <div className="border-b border-[#E8DDD0] pb-3 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#B8862A]" />
            <h3 className="font-serif text-2xl font-extrabold text-[#1A1207]">
              {membershipRulesTitle}
            </h3>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DDD0] text-xs text-stone-700 leading-relaxed whitespace-pre-line font-sans">
            {membershipRules}
          </div>
        </div>

        {/* 3 Pricing / Membership Tiers */}
        <div className="space-y-4 text-left">
          <h4 className="font-serif text-lg font-bold text-[#1A1207]">
            {language === 'bn' ? 'সদস্যপদ প্ল্যান ও বিবরণ' : 'Membership Plans & Categories'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {membershipPlans.map((plan: any, pidx: number) => (
              <div 
                key={pidx} 
                className="bg-white border-2 border-[#E8DDD0] hover:border-[#B8862A] p-6 rounded-3xl space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase bg-[#F7EFE5] text-[#8C6212] px-2.5 py-1 rounded-full">
                      {language === 'bn' ? `ক্যাটাগরি #${pidx + 1}` : `Category #${pidx + 1}`}
                    </span>
                    <Award className="w-4 h-4 text-[#B8862A]" />
                  </div>

                  <h5 className="font-serif text-lg font-bold text-[#1A1207]">
                    {language === 'bn' ? plan.nameBn : plan.nameEn}
                  </h5>

                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DDD0]/70 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>{language === 'bn' ? 'ফি:' : 'Fee:'}</span>
                      <span className="font-bold text-[#1A1207]">{language === 'bn' ? plan.feeBn : plan.feeEn}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>{language === 'bn' ? 'বই কোটা:' : 'Book Quota:'}</span>
                      <span className="font-bold text-[#1A1207]">{language === 'bn' ? plan.booksBn : plan.booksEn}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>{language === 'bn' ? 'জামানত:' : 'Deposit:'}</span>
                      <span className="font-bold text-[#1A1207]">{language === 'bn' ? plan.depositBn : plan.depositEn}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMembershipModalOpen(true)}
                  className="w-full py-2.5 bg-[#B8862A] hover:bg-[#9A6D1F] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer text-center"
                >
                  {language === 'bn' ? 'এই প্ল্যানে আবেদন করুন' : 'Apply for this Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. DOWNLOADS & CATALOG SEARCH BANNER */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F7EFE5] border-2 border-[#B8862A]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-[#B8862A]/15 text-[#8C6212] px-3 py-1 rounded-full text-xs font-bold font-mono">
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ক্যাটালগ ও আবেদন ফরম' : 'Catalogs & Application Forms'}</span>
          </div>
          <h3 className="font-serif text-2xl font-extrabold text-[#1A1207]">
            {language === 'bn' ? 'অনলাইন ও অফলাইন সদস্যপদ নির্দেশিকা' : 'Online & Offline Membership Guidelines'}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 max-w-2xl leading-relaxed font-sans">
            {language === 'bn'
              ? 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় পাঠাগারের সদস্য হতে আপনি সরাসরি অনলাইনে ফরম পূরণ করতে পারেন অথবা অফলাইন ফরম ডাউনলোড করে পাঠাগার কাউন্টারে জমা দিতে পারেন।'
              : 'You can apply directly online or download the offline application form to submit at the central library reception desk.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => setMembershipModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-5 py-3 rounded-2xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{language === 'bn' ? 'অনলাইনে আবেদন করুন' : 'Apply Online'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MEMBERSHIP APPLICATION MODAL */}
      {membershipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#E8DDD0] space-y-5 text-left relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setMembershipModalOpen(false); setMembershipSubmitted(false); }}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase bg-[#F7EFE5] text-[#8C6212] px-2.5 py-1 rounded-full">
                {language === 'bn' ? 'সদস্যপদ আবেদন' : 'Membership Application'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'কেন্দ্রীয় লাইব্রেরি সদস্য ফরম' : 'Central Library Membership Form'}
              </h3>
            </div>

            {membershipSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-900 text-base">
                  {language === 'bn' ? 'আপনার আবেদন সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
                </h4>
                <p className="text-xs text-emerald-700">
                  {language === 'bn' 
                    ? 'আমাদের লাইব্রেরি টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।' 
                    : 'Our library administration team will contact you shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => { setMembershipModalOpen(false); setMembershipSubmitted(false); }}
                  className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleMembershipSubmit} className="space-y-3.5 text-xs">
                {membershipError && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                    {membershipError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'} *</label>
                  <input 
                    type="text" 
                    required 
                    value={membershipForm.name}
                    onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-[#FAF8F5]" 
                    placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter full name'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *</label>
                    <input 
                      type="tel" 
                      required 
                      value={membershipForm.phone}
                      onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-[#FAF8F5]" 
                      placeholder="017xxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">{language === 'bn' ? 'ইমেইল (যদি থাকে)' : 'Email'}</label>
                    <input 
                      type="email" 
                      value={membershipForm.email}
                      onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-[#FAF8F5]" 
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{language === 'bn' ? 'পেশা / শিক্ষাপ্রতিষ্ঠান' : 'Occupation / Institution'}</label>
                  <input 
                    type="text" 
                    value={membershipForm.occupation}
                    onChange={(e) => setMembershipForm({ ...membershipForm, occupation: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-[#FAF8F5]" 
                    placeholder={language === 'bn' ? 'পেশা বা প্রতিষ্ঠানের নাম' : 'Occupation'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ঠিকানা' : 'Address'}</label>
                  <textarea 
                    rows={2} 
                    value={membershipForm.address}
                    onChange={(e) => setMembershipForm({ ...membershipForm, address: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-[#FAF8F5]" 
                    placeholder={language === 'bn' ? 'বর্তমান ঠিকানা' : 'Address'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={membershipSubmitting}
                  className="w-full py-3 bg-[#B8862A] hover:bg-[#9A6D1F] text-white font-bold rounded-xl transition shadow-md cursor-pointer text-xs"
                >
                  {membershipSubmitting ? (language === 'bn' ? 'আবেদন জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'আবেদন নিশ্চিত করুন' : 'Submit Application')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CATALOG SEARCH MODAL */}
      {catalogSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#E8DDD0] space-y-5 text-left relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setCatalogSearchOpen(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase bg-[#F7EFE5] text-[#8C6212] px-2.5 py-1 rounded-full">
                {language === 'bn' ? 'ডিজিটাল ক্যাটালগ' : 'Digital Catalog'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'গ্রন্থাগার বই অনুসন্ধান' : 'Search Library Catalog'}
              </h3>
            </div>

            <div className="relative">
              <input
                type="text"
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'বইয়ের নাম বা লেখকের নাম লিখুন...' : 'Type book title or author name...'}
                className="w-full p-3 pl-10 border border-[#E8DDD0] rounded-2xl bg-[#FAF8F5] text-xs font-sans focus:outline-none focus:border-[#B8862A]"
              />
              <Search className="w-4 h-4 text-[#B8862A] absolute left-3.5 top-3.5" />
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DDD0] text-center space-y-2">
              <BookOpen className="w-8 h-8 text-[#B8862A] mx-auto opacity-60" />
              <p className="text-xs text-stone-600 font-sans">
                {language === 'bn' 
                  ? 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্রীয় পাঠাগারের ৮৫,০০০+ বইয়ের ডিজিটাল ইনডেক্সিং কার্যক্রমে সহযোগিতা করার জন্য লাইব্রেরি কাউন্টারে যোগাযোগ করুন।'
                  : 'Contact the central library desk for live shelf inquiry and physical volume indexing.'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
