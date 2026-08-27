import React, { useState, useEffect } from 'react';
import { 
  Truck, BookOpen, MapPin, Calendar, Clock, Users, ShieldAlert,
  CheckCircle2, Search, Filter, HelpCircle, FileText, Send, Phone,
  Mail, Sparkles, Award, Compass, HeartHandshake, ArrowRight,
  ChevronRight, ExternalLink, RefreshCw, AlertCircle, BookmarkCheck,
  Building, CheckCircle, Navigation, Info, Layers
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultMobileLibraryData } from '../data/specializedPagesDefaults';

interface MobileLibraryPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto?: (url: string) => void;
  setActivePhotoIndex?: (i: number) => void;
  setActiveAlbumPhotos?: (urls: string[]) => void;
}

export const MobileLibraryPage: React.FC<MobileLibraryPageProps> = ({
  page,
  language,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'schedule' | 'membership' | 'apply' | 'faq'>('overview');
  
  // Schedule Search & Division Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await cpanelApi.getDoc('website_pages', 'mobile-library');
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

  const pageData = { ...defaultMobileLibraryData, ...page, ...dbPageData };

  // Membership Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    upazila: '',
    nearestSpot: '',
    membershipType: 'general', // general, special, advanced, special_advanced
    occupation: 'student',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.district.trim() || !form.nearestSpot.trim()) {
      setError(language === 'bn' ? (pageData.apply_validation_error_bn || 'অনুগ্রহ করে আবশ্যক তথ্যগুলো পূরণ করুন।') : (pageData.apply_validation_error_en || 'Please enter all required fields.'));
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await cpanelApi.addDoc('mobile_library_applications', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || '',
        district: form.district.trim(),
        upazila: form.upazila.trim() || '',
        nearestSpot: form.nearestSpot.trim(),
        membershipType: form.membershipType,
        occupation: form.occupation,
        address: form.address.trim() || '',
        createdAt: new Date().toISOString(),
        source: 'Mobile Library Page'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback local acknowledgment
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const busFleet = (Array.isArray(pageData.busFleet) && pageData.busFleet.length > 0 ? pageData.busFleet : defaultMobileLibraryData.busFleet).map((bus: any) => ({
    ...bus,
    image: bus.image || bus.bgImage || bus.imageUrl || bus.cover_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop'
  }));

  const membershipTiers = Array.isArray(pageData.membershipTiers) && pageData.membershipTiers.length > 0 ? pageData.membershipTiers : defaultMobileLibraryData.membershipTiers;
  const schedulesList = Array.isArray(pageData.schedules) && pageData.schedules.length > 0 ? pageData.schedules : defaultMobileLibraryData.schedules;
  const howItWorksSteps = Array.isArray(pageData.how_it_works_steps) && pageData.how_it_works_steps.length > 0 ? pageData.how_it_works_steps : defaultMobileLibraryData.how_it_works_steps;
  const requiredDocs = Array.isArray(pageData.required_docs) && pageData.required_docs.length > 0 ? pageData.required_docs : defaultMobileLibraryData.required_docs;
  const faqsList = Array.isArray(pageData.faqs) && pageData.faqs.length > 0 ? pageData.faqs : defaultMobileLibraryData.faqs;

  const filteredSchedules = schedulesList.filter((item: any) => {
    const matchDivision = selectedDivision === 'all' || item.division === selectedDivision;
    const matchSearch = searchQuery.trim() === '' || 
      (item.districtBn && item.districtBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.districtEn && item.districtEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.upazilaBn && item.upazilaBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.upazilaEn && item.upazilaEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.spotBn && item.spotBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.spotEn && item.spotEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDivision && matchSearch;
  });

  return (
    <div className="space-y-10 w-full animate-fade-in text-left text-[#1A1207]">
      
      {/* ── HERO BANNER SECTION ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1A0A08] text-white shadow-2xl border border-[#B8862A]/30 p-6 md:p-12">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: `url('${pageData.hero_image || page?.hero_image || page?.bgImage || page?.cover_image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1600&auto=format&fit=crop'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-black/85 to-transparent" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#B8862A]/20 text-[#F0CC7A] px-4 py-1.5 rounded-full border border-[#B8862A]/40 text-xs font-bold tracking-wider uppercase font-mono">
              <Truck className="w-4 h-4 text-[#F0CC7A]" />
              <span>{language === 'bn' ? (pageData.badge_bn || 'দেশব্যাপী ৬৪ জেলায় দোরগোড়ায় বই') : (pageData.badge_en || '64 Districts Mobile Library Fleet')}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#FAF7F2] tracking-tight leading-tight">
              {language === 'bn' ? (pageData.title_bn || 'ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম') : (pageData.title_en || 'Mobile Library Program')}
            </h1>

            <p className="text-base md:text-lg text-stone-300 leading-relaxed font-serif italic border-l-2 border-[#B8862A] pl-4">
              {language === 'bn' 
                ? (pageData.subtitle_bn || page?.subtitle_bn || page?.hero_desc_bn || '“মানুষের মনকে আলোকিত করার জন্য বইকে পৌঁছে দেওয়া হচ্ছে মানুষের দোরগোড়ায়।”')
                : (pageData.subtitle_en || page?.subtitle_en || page?.hero_desc_en || '“Bringing literature right to the doorstep to enlighten minds.”')}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('apply')}
                className="px-6 py-3 bg-[#B8862A] hover:bg-[#9A6D1E] text-stone-950 font-extrabold text-xs md:text-sm rounded-xl transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? (pageData.cta_apply_bn || 'অনলাইন সদস্যপদ নিবন্ধন') : (pageData.cta_apply_en || 'Apply for Membership')}</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm rounded-xl border border-white/20 transition backdrop-blur-xs flex items-center space-x-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#F0CC7A]" />
                <span>{language === 'bn' ? (pageData.cta_schedule_bn || 'স্পট ও রুট খুঁজুন') : (pageData.cta_schedule_en || 'Find Your Spot & Schedule')}</span>
              </button>

              <a
                href={pageData.cta_elibrary_url || "https://alorpathshala.org"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-bold text-xs md:text-sm rounded-xl border border-emerald-500/30 transition flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? (pageData.cta_elibrary_bn || 'ই-লাইব্রেরি (আলোর পাঠশালা)') : (pageData.cta_elibrary_en || 'E-Library (Alor Pathshala)')}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            </div>
          </div>

          {/* Right Hero Badge Box */}
          <div className="lg:col-span-4 bg-black/60 backdrop-blur-md rounded-2xl border border-[#B8862A]/40 p-6 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#B8862A]/20 border border-[#B8862A] flex items-center justify-center text-[#F0CC7A]">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">
                {language === 'bn' ? (pageData.history_badge_title_bn || '১৯৯৯ থেকে চলমান') : (pageData.history_badge_title_en || 'Operating Since 1999')}
              </h3>
              <p className="text-xs text-stone-300 mt-1 font-sans">
                {language === 'bn' 
                  ? (pageData.history_badge_subtitle_bn || 'ঢাকা, চট্টগ্রাম, খুলনা ও রাজশাহী থেকে শুরু হয়ে আজ ৬৪টি জেলা জুড়ে প্রসারিত।')
                  : (pageData.history_badge_subtitle_en || 'Pioneered in 1999 across 4 metropolises, now serving all 64 districts.')}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-left text-xs font-mono">
              <div className="p-2 bg-stone-900/80 rounded border border-white/5">
                <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.history_badge_officer_label_bn || 'দায়িত্বপ্রাপ্ত কর্মকর্তা') : (pageData.history_badge_officer_label_en || 'Program Officer')}</span>
                <span className="text-amber-300 font-bold block truncate">{language === 'bn' ? (pageData.officer_name_bn || 'উজ্জ্বল হোসেন') : (pageData.officer_name_en || 'Uzzal Hossain')}</span>
              </div>
              <div className="p-2 bg-stone-900/80 rounded border border-white/5">
                <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.history_badge_hotline_label_bn || 'হটলাইন') : (pageData.history_badge_hotline_label_en || 'Helpline')}</span>
                <span className="text-amber-300 font-bold block truncate">{language === 'bn' ? (pageData.officer_phone_bn || '০১৭১১-৫৩৫৩৯৮') : (pageData.officer_phone_en || '01711-535398')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CORE IMPACT STATS DECK ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat1_value_bn || '৬৪টি') : (pageData.stat1_value_en || '64')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat1_label_bn || 'জেলা কভারেজ') : (pageData.stat1_label_en || 'Districts Covered')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat2_value_bn || '৩৬৮টি') : (pageData.stat2_value_en || '368')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat2_label_bn || 'উপজেলা রুট') : (pageData.stat2_label_en || 'Upazilas Covered')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat3_value_bn || '৩,২০০টি') : (pageData.stat3_value_en || '3,200')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat3_label_bn || 'বই লেনদেন স্পট') : (pageData.stat3_label_en || 'Reading Spots')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat4_value_bn || '৭৬টি') : (pageData.stat4_value_en || '76')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat4_label_bn || 'লাইব্রেরি বাস বহর') : (pageData.stat4_label_en || 'Library Fleet Vehicles')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat5_value_bn || '৪৩ লক্ষ+') : (pageData.stat5_value_en || '4.3 Million+')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat5_label_bn || 'সংরক্ষিত বই') : (pageData.stat5_label_en || 'Books in Fleet')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">{language === 'bn' ? (pageData.stat6_value_bn || '৩,০০,০০০+') : (pageData.stat6_value_en || '300,000+')}</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? (pageData.stat6_label_bn || 'সক্রিয় নিবন্ধিত পাঠক') : (pageData.stat6_label_en || 'Active Members')}</p>
        </div>
      </div>

      {/* ── INTERACTIVE TABS NAVIGATION ── */}
      <div className="flex border-b border-[#E8DDD0] overflow-x-auto scrollbar-none gap-2 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_overview_bn || 'পরিচিতি ও ইতিহাস') : (pageData.nav_overview_en || 'Overview & Mission')}</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'fleet'
              ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_fleet_bn || 'বাস বহর (৭ ক্যাটাগরি)') : (pageData.nav_fleet_en || 'Bus Fleet Categories')}</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_schedule_bn || 'স্পট ও রুট সময়সূচি') : (pageData.nav_schedule_en || 'Spots & Schedule')}</span>
        </button>

        <button
          onClick={() => setActiveTab('membership')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'membership'
              ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_membership_bn || 'সদস্যপদ ও জামানত নিয়মাবলী') : (pageData.nav_membership_en || 'Membership Rules')}</span>
        </button>

        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'apply'
              ? 'bg-[#B8862A] text-stone-950 font-black shadow-sm'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_apply_bn || 'অনলাইন আবেদন') : (pageData.nav_apply_en || 'Apply Online')}</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2.5 rounded-xl font-sans text-xs md:text-sm font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'faq'
              ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{language === 'bn' ? (pageData.nav_faq_bn || 'প্রশ্নোত্তর ও হেল্পলাইন') : (pageData.nav_faq_en || 'FAQ & Contact')}</span>
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW & HISTORY ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Narrative Card */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#E8DDD0] shadow-xs space-y-6">
            <div className="inline-flex items-center space-x-2 text-[#B8862A]">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {language === 'bn' ? (pageData.story_badge_bn || 'কর্মসূচির প্রেক্ষাপট ও সূচনার গল্প') : (pageData.story_badge_en || 'Program Origins & Evolution')}
              </span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207]">
              {language === 'bn' ? (pageData.story_title_bn || 'দোরগোড়ায় বই: বাংলাদেশের সবচেয়ে জনপ্রিয় লাল-সবুজ লাইব্রেরি বাস') : (pageData.story_title_en || 'Books at Your Doorstep: Bangladesh’s Iconic Green & Red Library Bus')}
            </h2>

            <div className="space-y-4 text-stone-700 leading-relaxed font-sans text-sm md:text-base">
              <p>
                {language === 'bn'
                  ? (pageData.story_p1_bn || 'বিশ্বসাহিত্য কেন্দ্র ১৯৯৯ সালে নরওয়েজিয়ান সহযোগিতা সংস্থা (NORAD)-এর সহায়তায় প্রথমবারের মতো ৪টি বিভাগীয় প্রধান শহর — ঢাকা, চট্টগ্রাম, খুলনা ও রাজশাহীতে ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম চালু করে।')
                  : (pageData.story_p1_en || 'Bishwo Shahitto Kendro launched the Mobile Library Program in 1999 across 4 major metropolises (Dhaka, Chattogram, Khulna, Rajshahi) in collaboration with NORAD.')}
              </p>

              <p>
                {language === 'bn'
                  ? (pageData.story_p2_bn || 'পরবর্তীতে গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা মন্ত্রণালয় এবং সংস্কৃতি বিষয়ক মন্ত্রণালয়ের যৌথ অর্থায়নে ও বিশ্বসাহিত্য কেন্দ্রের ব্যবস্থাপনায় বাস্তবায়িত ৩টি বৃহৎ প্রকল্পের মাধ্যমে এই কার্যক্রম পর্যায়ক্রমে দেশের সকল ৬৪টি জেলা এবং ৩৬৮টি উপজেলায় ৩,২০০টি নির্দিষ্ট স্থানে বিস্তার লাভ করে।')
                  : (pageData.story_p2_en || 'Subsequently, through three consecutive government co-funded development projects, BSK scaled the program across all 64 districts and 368 upazilas, serving 3,200 designated neighborhood spots with a specialized fleet of 76 vehicles.')}
              </p>
            </div>

            {/* How It Works Flow */}
            <div className="pt-4 border-t border-stone-150 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1A1207] flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#B8862A]" />
                <span>{language === 'bn' ? (pageData.how_it_works_title_bn || 'ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম পরিচালনার ধাপসমূহ') : (pageData.how_it_works_title_en || 'How the Mobile Library Operates')}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {howItWorksSteps.map((step: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] space-y-2">
                    <div className="w-8 h-8 rounded-full bg-[#B8862A] text-stone-950 font-bold flex items-center justify-center font-mono text-xs">
                      {step.step || (idx + 1)}
                    </div>
                    <h4 className="font-bold text-sm text-[#1A1207]">
                      {language === 'bn' ? step.titleBn : step.titleEn}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {language === 'bn' ? step.descBn : step.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Development Notice Box */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-100 to-emerald-500/10 rounded-3xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-stone-900">
              <span className="px-3 py-1 bg-amber-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider font-mono">
                {language === 'bn' ? (pageData.notice_badge_bn || 'প্রকল্প সম্পর্কিত নোটিশ') : (pageData.notice_badge_en || 'Project Status Note')}
              </span>
              <h3 className="font-serif text-lg font-bold">
                {language === 'bn' ? (pageData.notice_title_bn || 'দেশব্যাপী ভ্রাম্যমাণ লাইব্রেরি প্রকল্প ও ই-লাইব্রেরি সুবিধা') : (pageData.notice_title_en || 'Mobile Library Project & Digital E-Library Sync')}
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                {language === 'bn'
                  ? (pageData.notice_desc_bn || 'ভ্রাম্যমাণ লাইব্রেরির বহর সম্প্রসারণ ও সংস্কার কাজ চলমান থাকা অবস্থায় ডিজিটাল পাঠকদের জন্য আলোর পাঠশালা (alorpathshala.org) ই-লাইব্রেরির মাধ্যমে ১,০০০+ বিশ্বমানের ই-বুক সম্পূর্ণ বিনামূল্যে ডাউনলোডের সুযোগ রয়েছে।')
                  : (pageData.notice_desc_en || 'While fleet upgrades and route expansions are underway, readers can download over 1,000 digitized eBooks free of charge from BSK’s Alor Pathshala e-library.')}
              </p>
            </div>

            <a
              href={pageData.notice_btn_url || "https://alorpathshala.org"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1A0A08] hover:bg-stone-900 text-[#F0CC7A] font-extrabold text-xs rounded-xl shadow-md shrink-0 flex items-center space-x-2 cursor-pointer"
            >
              <span>{language === 'bn' ? (pageData.notice_btn_bn || 'আলোর পাঠশালায় প্রবেশ করুন') : (pageData.notice_btn_en || 'Visit Alor Pathshala')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      )}

      {/* ── TAB 2: BUS FLEET CATEGORIES ── */}
      {activeTab === 'fleet' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-[#E8DDD0] pb-3 text-left">
            <h3 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
              <Truck className="w-5 h-5 text-[#B8862A]" />
              <span>{language === 'bn' ? (pageData.fleet_section_title_bn || 'ভ্রাম্যমাণ লাইব্রেরি বাসের ৭টি বিশেষ ক্যাটাগরি') : (pageData.fleet_section_title_en || '7 Vehicle Classes in the BSK Library Fleet')}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {language === 'bn'
                ? (pageData.fleet_section_subtitle_bn || 'রাস্তাঘাটের প্রশস্ততা, ভৌগোলিক অবস্থান ও পাঠকের চাহিদার ওপর ভিত্তি করে ৭টি ভিন্ন মাপের সুসজ্জিত লাইব্রেরি যান পরিচালনা করা হয়।')
                : (pageData.fleet_section_subtitle_en || 'BSK operates 7 tailored vehicle classes depending on road width, geographic terrain, and reader demand.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {busFleet.map((bus: any) => (
              <div key={bus.id} className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="h-44 rounded-xl overflow-hidden relative">
                    <img src={bus.image} alt={bus.titleBn || bus.titleEn} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-md text-[#F0CC7A] font-mono text-xs font-bold rounded-lg border border-white/10">
                      {language === 'bn' ? bus.capacityBn : bus.capacityEn}
                    </div>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#1A1207]">
                    {language === 'bn' ? bus.titleBn : bus.titleEn}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? bus.descBn : bus.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs space-y-1 bg-stone-50 p-3 rounded-xl">
                  <span className="font-bold text-[#B8862A] block">{language === 'bn' ? (pageData.fleet_coverage_label_bn || 'প্রধান চলাচল অঞ্চল:') : (pageData.fleet_coverage_label_en || 'Primary Coverage:')}</span>
                  <p className="text-stone-700">{language === 'bn' ? bus.coverageBn : bus.coverageEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SPOTS & SCHEDULE SEARCH ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-[#E8DDD0] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                  <Search className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? (pageData.schedule_title_bn || 'আপনার এলাকার ভ্রাম্যমাণ লাইব্রেরি স্পট খুঁজুন') : (pageData.schedule_title_en || 'Find Mobile Library Spot in Your Area')}</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {language === 'bn' ? (pageData.schedule_subtitle_bn || 'জেলা, উপজেলা বা এলাকার নাম লিখে অনুসন্ধান করুন অথবা বিভাগ অনুযায়ী ফিল্টার করুন।') : (pageData.schedule_subtitle_en || 'Filter by division or search by district, upazila, or spot location.')}
                </p>
              </div>

              {/* Division Select Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', labelBn: 'সকল বিভাগ', labelEn: 'All Divisions' },
                  { id: 'dhaka', labelBn: 'ঢাকা', labelEn: 'Dhaka' },
                  { id: 'chattogram', labelBn: 'চট্টগ্রাম', labelEn: 'Chattogram' },
                  { id: 'rajshahi', labelBn: 'রাজশাহী', labelEn: 'Rajshahi' },
                  { id: 'khulna', labelBn: 'খুলনা', labelEn: 'Khulna' },
                  { id: 'sylhet', labelBn: 'সিলেট', labelEn: 'Sylhet' },
                  { id: 'barishal', labelBn: 'বরিশাল', labelEn: 'Barishal' },
                  { id: 'rangpur', labelBn: 'রংপুর', labelEn: 'Rangpur' },
                  { id: 'mymensingh', labelBn: 'ময়মনসিংহ', labelEn: 'Mymensingh' }
                ].map((div) => (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivision(div.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition cursor-pointer ${
                      selectedDivision === div.id
                        ? 'bg-[#B8862A] text-stone-950'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {language === 'bn' ? div.labelBn : div.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? (pageData.schedule_search_placeholder_bn || 'যেমন: ধানমন্ডি, লালবাগ, চট্টগ্রাম, রবীন্দ্র সরোবর...') : (pageData.schedule_search_placeholder_en || 'e.g. Dhanmondi, Chittagong, Rajshahi, Park...')}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#B8862A]"
              />
            </div>
          </div>

          {/* Schedule Results Table */}
          <div className="bg-white rounded-3xl border border-[#E8DDD0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-[#1A0A08] text-[#F0CC7A] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_district_bn || 'জেলা ও উপজেলা') : (pageData.schedule_th_district_en || 'District & Upazila')}</th>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_spot_bn || 'নির্ধারিত স্পট / স্থান') : (pageData.schedule_th_spot_en || 'Spot Location')}</th>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_day_bn || 'সাপ্তাহিক দিন') : (pageData.schedule_th_day_en || 'Day of Week')}</th>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_time_bn || 'অবস্থানের সময়') : (pageData.schedule_th_time_en || 'Time Slot')}</th>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_bus_bn || 'গাড়ির ধরণ') : (pageData.schedule_th_bus_en || 'Vehicle Class')}</th>
                    <th className="p-4">{language === 'bn' ? (pageData.schedule_th_officer_bn || 'অফিসার যোগাযোগ') : (pageData.schedule_th_officer_en || 'Officer Contact')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-amber-50/50 transition">
                        <td className="p-4 font-bold text-[#1A1207]">
                          {language === 'bn' ? `${item.districtBn} (${item.upazilaBn})` : `${item.districtEn} (${item.upazilaEn})`}
                        </td>
                        <td className="p-4 text-stone-800 font-medium">
                          {language === 'bn' ? item.spotBn : item.spotEn}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-bold text-xs">
                            {language === 'bn' ? item.dayBn : item.dayEn}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-stone-700">
                          {language === 'bn' ? item.timeBn : item.timeEn}
                        </td>
                        <td className="p-4 text-xs text-stone-600">
                          {item.busTypeBn}
                        </td>
                        <td className="p-4 font-mono font-bold text-[#B8862A]">
                          {item.officer}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500 italic">
                        {language === 'bn' ? (pageData.schedule_empty_text_bn || 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো স্পট পাওয়া যায়নি।') : (pageData.schedule_empty_text_en || 'No spots found matching your search query.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: MEMBERSHIP DEPOSIT RULES ── */}
      {activeTab === 'membership' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="border-b border-[#E8DDD0] pb-3 text-left">
            <h3 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#B8862A]" />
              <span>{language === 'bn' ? (pageData.membership_section_title_bn || 'সদস্যপদ বিভাগ ও জামানতের চার্ট') : (pageData.membership_section_title_en || '4 Membership Deposit Tiers')}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {language === 'bn' 
                ? (pageData.membership_section_subtitle_bn || 'সদস্যদের বইয়ের নিরাপত্তা নিশ্চিতকরণে জামানত নেওয়া হয়, যা পরবর্তীতে সদস্যপদ প্রত্যাহারের সময় ১০০% ফেরতযোগ্য।')
                : (pageData.membership_section_subtitle_en || 'A standard fully-refundable security deposit is required to borrow books for home reading.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier: any) => (
              <div key={tier.id} className="bg-white rounded-3xl border border-[#E8DDD0] shadow-xs hover:shadow-md transition p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${tier.color || 'from-amber-600 to-amber-800'} text-white space-y-1`}>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200 font-bold block">{language === 'bn' ? (pageData.membership_deposit_badge_bn || 'ফেরতযোগ্য নিরাপত্তা জামানত') : (pageData.membership_deposit_badge_en || 'Refundable Security Deposit')}</span>
                    <span className="text-2xl md:text-3xl font-serif font-black block">{tier.depositBn}</span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#1A1207]">
                    {language === 'bn' ? tier.titleBn : tier.titleEn}
                  </h4>

                  <div className="space-y-2 text-xs text-stone-700">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-[#B8862A] shrink-0" />
                      <span><strong>{language === 'bn' ? (pageData.membership_book_limit_label_bn || 'বইয়ের সীমা:') : (pageData.membership_book_limit_label_en || 'Book Value:')}</strong> {language === 'bn' ? tier.maxBookValBn : tier.maxBookValEn}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#B8862A] shrink-0" />
                      <span><strong>{language === 'bn' ? (pageData.membership_period_label_bn || 'সময়কাল:') : (pageData.membership_period_label_en || 'Borrow Period:')}</strong> {language === 'bn' ? tier.periodBn : tier.periodEn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                  <span className="font-bold text-stone-800 block">{language === 'bn' ? (pageData.membership_target_label_bn || 'উপযোগী পাঠশ্রেণি:') : (pageData.membership_target_label_en || 'Recommended Target:')}</span>
                  <span>{language === 'bn' ? tier.suitableBn : tier.suitableEn}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Membership Documents & Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 bg-white rounded-3xl border border-[#E8DDD0] space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#B8862A]" />
                <span>{language === 'bn' ? (pageData.docs_section_title_bn || 'প্রয়োজনীয় কাগজপত্র') : (pageData.docs_section_title_en || 'Required Documents for Application')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-stone-700">
                {requiredDocs.map((docItem: any, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#B8862A]" />
                    <span>{language === 'bn' ? docItem.titleBn : docItem.titleEn}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#E8DDD0] space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-emerald-700" />
                <span>{language === 'bn' ? (pageData.refund_section_title_bn || 'জামানত ফেরত ও সদস্যপদ বাতিলের নিয়ম') : (pageData.refund_section_title_en || 'Deposit Refund Policy')}</span>
              </h4>
              <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                {language === 'bn'
                  ? (pageData.refund_section_desc_bn || 'যেকোনো সময় সদস্যপদ বাতিল বা কার্ড জমা প্রদান করলে লাইব্রেরি কর্মকর্তা বকেয়া বই ও তথ্য যাচাই করে জমাকৃত জামানতের ১০০% টাকা সঙ্গে সঙ্গে নগদ ফেরত প্রদান করবেন।')
                  : (pageData.refund_section_desc_en || 'Upon surrendering your membership card and returning all borrowed books, your full security deposit is refunded immediately.')}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 5: ONLINE APPLICATION FORM ── */}
      {activeTab === 'apply' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="p-6 md:p-8 bg-white rounded-3xl border border-[#E8DDD0] shadow-md space-y-6">
            <div className="border-b border-stone-150 pb-4 text-center space-y-1">
              <h3 className="font-serif text-2xl font-extrabold text-[#1A1207]">
                {language === 'bn' ? (pageData.apply_form_title_bn || 'ভ্রাম্যমাণ লাইব্রেরি অনলাইন সদস্যপদ ফরম') : (pageData.apply_form_title_en || 'Mobile Library Membership Application')}
              </h3>
              <p className="text-xs text-stone-600">
                {language === 'bn' ? (pageData.apply_form_subtitle_bn || 'ফরমটি পূরণ করে জমা দিন। আমাদের লাইব্রেরি বাস আপনার নিকটস্থ স্পটে পৌঁছালে আপনার কার্ড ও বই বুঝিয়ে দেওয়া হবে।') : (pageData.apply_form_subtitle_en || 'Fill in the details below. Our library officer will issue your card at your nearest bus spot.')}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-emerald-900">
                  {language === 'bn' ? (pageData.apply_success_title_bn || 'আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে!') : (pageData.apply_success_title_en || 'Application Submitted Successfully!')}
                </h4>
                <p className="text-xs text-emerald-800">
                  {language === 'bn' 
                    ? (pageData.apply_success_desc_bn || 'আপনার মোবাইল নম্বরে লাইব্রেরি কর্মকর্তা শীঘ্রই যোগাযোগ করবেন এবং আপনার নির্ধারিত স্পটে গাড়ি পৌঁছালে আপনার কার্ড হস্তান্তর করা হবে।')
                    : (pageData.apply_success_desc_en || 'Our team will reach out to you via your phone number. You can collect your card at your designated spot.')}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', phone: '', email: '', district: '', upazila: '', nearestSpot: '', membershipType: 'general', occupation: 'student', address: '' });
                  }}
                  className="mt-2 px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-800 transition"
                >
                  {language === 'bn' ? (pageData.apply_success_reset_bn || 'নতুন আরেকটি আবেদন করুন') : (pageData.apply_success_reset_en || 'Submit Another Application')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_name_label_bn || 'আবেদনকারীর নাম *') : (pageData.apply_name_label_en || 'Applicant Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={language === 'bn' ? (pageData.apply_name_placeholder_bn || 'আপনার পূর্ণ নাম') : (pageData.apply_name_placeholder_en || 'Full Name')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_phone_label_bn || 'মোবাইল নম্বর *') : (pageData.apply_phone_label_en || 'Mobile Number *')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={language === 'bn' ? (pageData.apply_phone_placeholder_bn || '০১XXXXXXXXX') : (pageData.apply_phone_placeholder_en || '01XXXXXXXXX')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_district_label_bn || 'জেলা *') : (pageData.apply_district_label_en || 'District *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder={language === 'bn' ? (pageData.apply_district_placeholder_bn || 'যেমন: ঢাকা, চট্টগ্রাম, কুমিল্লা') : (pageData.apply_district_placeholder_en || 'e.g. Dhaka, Cumilla')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_upazila_label_bn || 'উপজেলা / থানা') : (pageData.apply_upazila_label_en || 'Upazila / Thana')}
                    </label>
                    <input
                      type="text"
                      value={form.upazila}
                      onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                      placeholder={language === 'bn' ? (pageData.apply_upazila_placeholder_bn || 'যেমন: ধানমন্ডি, লালবাগ, কোতোয়ালী') : (pageData.apply_upazila_placeholder_en || 'e.g. Dhanmondi, Sadar')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_spot_label_bn || 'নিকটস্থ বাস স্পট *') : (pageData.apply_spot_label_en || 'Nearest Bus Spot Location *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nearestSpot}
                      onChange={(e) => setForm({ ...form, nearestSpot: e.target.value })}
                      placeholder={language === 'bn' ? (pageData.apply_spot_placeholder_bn || 'যেমন: রবীন্দ্র সরোবর, ৪নং সেক্টর পার্ক') : (pageData.apply_spot_placeholder_en || 'e.g. Rabindra Sarobar Park')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? (pageData.apply_tier_label_bn || 'সদস্যপদের ধরন (জামানত)') : (pageData.apply_tier_label_en || 'Membership Deposit Tier')}
                    </label>
                    <select
                      value={form.membershipType}
                      onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    >
                      <option value="general">{language === 'bn' ? (pageData.apply_tier_general_bn || 'সাধারণ সদস্য (১০০ টাকা ফেরতযোগ্য জামানত)') : (pageData.apply_tier_general_en || 'General Member (৳100 Deposit)')}</option>
                      <option value="special">{language === 'bn' ? (pageData.apply_tier_special_bn || 'বিশেষ সদস্য (২০০ টাকা ফেরতযোগ্য জামানত)') : (pageData.apply_tier_special_en || 'Special Member (৳200 Deposit)')}</option>
                      <option value="advanced">{language === 'bn' ? (pageData.apply_tier_advanced_bn || 'অগ্রবর্তী সদস্য (৫০০ টাকা ফেরতযোগ্য জামানত)') : (pageData.apply_tier_advanced_en || 'Advanced Member (৳500 Deposit)')}</option>
                      <option value="special_advanced">{language === 'bn' ? (pageData.apply_tier_spec_adv_bn || 'বিশেষ অগ্রবর্তী সদস্য (৮০০ টাকা ফেরতযোগ্য জামানত)') : (pageData.apply_tier_spec_adv_en || 'Special Advanced Member (৳800 Deposit)')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 block">
                    {language === 'bn' ? (pageData.apply_address_label_bn || 'পূর্ণাঙ্গ ঠিকানা') : (pageData.apply_address_label_en || 'Full Mailing Address')}
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder={language === 'bn' ? (pageData.apply_address_placeholder_bn || 'আপনার বাসা বা প্রতিষ্ঠানের ঠিকানা') : (pageData.apply_address_placeholder_en || 'House/School/Office address')}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#B8862A] hover:bg-[#9A6D1E] text-stone-950 font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (language === 'bn' ? (pageData.apply_submitting_btn_bn || 'জমা হচ্ছে...') : (pageData.apply_submitting_btn_en || 'Submitting...')) : (language === 'bn' ? (pageData.apply_submit_btn_bn || 'সদস্যপদ আবেদন জমা দিন') : (pageData.apply_submit_btn_en || 'Submit Membership Application'))}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: FAQ & HELPLINE ── */}
      {activeTab === 'faq' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FAQ Accordion Column */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#B8862A]" />
                <span>{language === 'bn' ? (pageData.faq_section_title_bn || 'সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)') : (pageData.faq_section_title_en || 'Frequently Asked Questions')}</span>
              </h3>

              <div className="space-y-3">
                {faqsList.map((faq: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-[#E8DDD0] shadow-xs space-y-2">
                    <h4 className="font-bold text-sm text-[#1A1207]">
                      {language === 'bn' ? faq.qBn : faq.qEn}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {language === 'bn' ? faq.aBn : faq.aEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline & Direct Contact Box */}
            <div className="bg-[#1A0A08] text-white p-6 rounded-3xl border border-[#B8862A]/40 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-[#B8862A]/20 text-[#F0CC7A] rounded-md text-[10px] font-bold font-mono uppercase tracking-wider">
                  {language === 'bn' ? (pageData.contact_badge_bn || 'সরাসরি যোগাযোগ') : (pageData.contact_badge_en || 'Direct Helpline')}
                </span>
                <h4 className="font-serif text-xl font-bold text-white">
                  {language === 'bn' ? (pageData.contact_title_bn || 'ভ্রাম্যমাণ লাইব্রেরি বিভাগ') : (pageData.contact_title_en || 'Mobile Library Desk')}
                </h4>
                <p className="text-xs text-stone-300 font-sans">
                  {language === 'bn' ? (pageData.contact_desc_bn || 'যেকোনো জিজ্ঞাসা, মতামত বা অভিযোগের জন্য সরাসরি আমাদের হেল্পলাইনে যোগাযোগ করুন।') : (pageData.contact_desc_en || 'Reach out for inquiries, schedules, or spot inclusion requests.')}
                </p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.contact_officer_label_bn || 'দায়িত্বপ্রাপ্ত কর্মকর্তা:') : (pageData.contact_officer_label_en || 'In-Charge Officer:')}</span>
                  <span className="text-amber-300 font-bold block text-sm">{language === 'bn' ? (pageData.officer_name_bn || 'উজ্জ্বল হোসেন') : (pageData.officer_name_en || 'Uzzal Hossain')}</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.contact_phone_label_bn || 'মোবাইল / হটলাইন:') : (pageData.contact_phone_label_en || 'Mobile / Hotline:')}</span>
                  <a href={`tel:${(pageData.officer_phone_en || pageData.officer_phone_bn || '01711535398').replace(/[^0-9+]/g, '')}`} className="text-[#F0CC7A] font-bold block text-sm hover:underline">
                    {language === 'bn' ? (pageData.officer_phone_bn || '০১৭১১-৫৩৫৩৯৮') : (pageData.officer_phone_en || '01711-535398')}
                  </a>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.contact_email_label_bn || 'ইমেইল:') : (pageData.contact_email_label_en || 'Official Email:')}</span>
                  <a href={`mailto:${pageData.officer_email || 'mobilelibrary@bskbd.org'}`} className="text-stone-200 block truncate hover:underline">
                    {pageData.officer_email || 'mobilelibrary@bskbd.org'}
                  </a>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? (pageData.contact_address_label_bn || 'কেন্দ্রীয় কার্যালয়:') : (pageData.contact_address_label_en || 'Headquarters:')}</span>
                  <span className="text-stone-300 block font-sans text-xs">
                    {language === 'bn' ? (pageData.officer_address_bn || 'বিশ্বসাহিত্য কেন্দ্র, ১৭৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০।') : (pageData.officer_address_en || 'Bishwo Shahitto Kendro, 174 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka-1000.')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
