import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Library, List, ExternalLink, Sparkles, 
  Award, CheckCircle2, ChevronRight, BookMarked, UserCheck, 
  FileText, Image as ImageIcon, Send, Phone, MapPin, Globe
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultBangalirChintaData } from '../data/specializedPagesDefaults';

interface BangalirChintaPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto: (url: string) => void;
  setActivePhotoIndex: (i: number) => void;
  setActiveAlbumPhotos: (urls: string[]) => void;
}

export const BangalirChintaPage: React.FC<BangalirChintaPageProps> = ({
  page,
  language,
  onNavigate,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos
}) => {
  const [activeChintaSubject, setActiveChintaSubject] = useState(0);

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await cpanelApi.getDoc('website_pages', 'bangalir-chinta') || await cpanelApi.getDoc('website_pages', 'bangalir_chinta');
        if (data) {
          setDbPageData(data);
        }
      } catch (err) {
        console.error('Failed to fetch bangalir-chinta page doc:', err);
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

  const customData = { 
    ...defaultBangalirChintaData, 
    ...(page as any),
    ...(page as any).bangalirChintaData, 
    ...(page as any).bangalir_chinta_data, 
    ...dbPageData,
    ...(dbPageData?.bangalirChintaData || {})
  };

  const badgeText = language === 'bn'
    ? (customData.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা প্রকল্প')
    : (customData.badge_en || 'BSK Major Publishing Project');

  const heroTitle = language === 'bn'
    ? (customData.hero_title_bn || (page.title_bn && page.title_bn !== 'বাঙালির চিন্তা কর্মসূচি' ? page.title_bn : defaultBangalirChintaData.hero_title_bn))
    : (customData.hero_title_en || (page.title_en && page.title_en !== 'Bengali Thought Program' ? page.title_en : defaultBangalirChintaData.hero_title_en));

  const heroSubtitle = language === 'bn'
    ? (customData.hero_subtitle_bn || page.subtitle_bn || defaultBangalirChintaData.hero_subtitle_bn)
    : (customData.hero_subtitle_en || page.subtitle_en || defaultBangalirChintaData.hero_subtitle_en);

  const heroImage = customData.cover_image || customData.hero_image || page.hero_image || page.cover_image || defaultBangalirChintaData.cover_image;

  // Metric Stats
  const stats = {
    vols: customData.stats_vols || "২০৯টি",
    volsLabel: language === 'bn' ? (customData.stats_vols_label_bn || "মোট খণ্ড") : (customData.stats_vols_label_en || "Total Volumes"),
    subjects: customData.stats_subjects || "১৬টি",
    subjectsLabel: language === 'bn' ? (customData.stats_subjects_label_bn || "বিষয়ভিত্তিক শাখা") : (customData.stats_subjects_label_en || "Thematic Subjects"),
    price: customData.collection_price || "১,৯০,০০০ টাকা",
    priceLabel: language === 'bn' ? (customData.stats_price_label_bn || "বিশেষ সেট মূল্য") : (customData.stats_price_label_en || "Set Special Price"),
    websiteUrl: customData.website_url || "https://bcrs.bskbd.org"
  };

  // Section & Showcase Labels
  const bookTopLabel = language === 'bn' 
    ? (customData.book_top_label_bn || "বাঙালির চিন্তামূলক রচনা") 
    : (customData.book_top_label_en || "Bengali Thoughtful Writings");

  const bookFooterLabel = language === 'bn'
    ? (customData.book_footer_label_bn || "বিশ্বসাহিত্য কেন্দ্র")
    : (customData.book_footer_label_en || "Bishwo Shahitto Kendro");

  const subjectCounterLabel = language === 'bn'
    ? (customData.subject_counter_label_bn || "বিষয়")
    : (customData.subject_counter_label_en || "SUBJECT");

  const editorLabel = language === 'bn'
    ? (customData.editor_label_bn || "সম্পাদনা ও সংকলন")
    : (customData.editor_label_en || "Edited & Compiled By");

  const browseHeading = language === 'bn'
    ? (customData.browse_heading_bn || "বিষয়ভিত্তিক সংকলনসমূহ ব্রাউজ করুন")
    : (customData.browse_heading_en || "Browse Thematic Collections");

  const browseSubtitle = language === 'bn'
    ? (customData.browse_subtitle_bn || "যেকোনো বিষয়ে ক্লিক করে তার বিস্তারিত বিবরণ ও সংকলক পরিচিতি জানুন")
    : (customData.browse_subtitle_en || "Click any subject tile to view volume details and editorial summary");

  const subjectsBadgeSuffix = language === 'bn'
    ? (customData.subjects_badge_suffix_bn || "টি বিষয়")
    : (customData.subjects_badge_suffix_en || "Subjects");

  const orderSectionTitle = language === 'bn'
    ? (customData.order_section_title_bn || "সংগ্রহ ও অর্ডারের নিয়মাবলী")
    : (customData.order_section_title_en || "Collection & Order Information");

  const collectionInfo = language === 'bn'
    ? (customData.collection_info_bn || defaultBangalirChintaData.collection_info_bn)
    : (customData.collection_info_en || defaultBangalirChintaData.collection_info_en);

  const orderHotline = customData.order_hotline || "০১৭৩০০০০০১৪, ০১৮১৯২৫৫৫৮১";
  const orderHotlineLabel = language === 'bn' 
    ? (customData.order_hotline_label_bn || "অর্ডার হেল্পলাইন:") 
    : (customData.order_hotline_label_en || "Order Helpline:");

  const salesCenterInfo = language === 'bn'
    ? (customData.sales_center_info_bn || "বিশ্বসাহিত্য কেন্দ্র প্রকাশনা ও বিক্রয় সেল (১৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০) থেকে সরাসরি সংগ্রহ করা যাবে।")
    : (customData.sales_center_info_en || "Available directly from BSK Publication and Sales Cell, 14 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka-1000.");

  const websiteBtnText = language === 'bn'
    ? (customData.website_btn_bn || "বাঙালির চিন্তা অফিশিয়াল ওয়েবসাইট ভিজিট করুন")
    : (customData.website_btn_en || "Visit Official Bangalir Chinta Website");

  const chintaSubjects = (Array.isArray(customData.subjects) && customData.subjects.length > 0)
    ? customData.subjects
    : defaultBangalirChintaData.subjects;

  const activeSubject = chintaSubjects[activeChintaSubject] || chintaSubjects[0] || defaultBangalirChintaData.subjects[0];

  const sections = Array.isArray(customData.sections) ? customData.sections : (Array.isArray(page.sections) ? page.sections : []);

  return (
    <div className="space-y-8 w-full text-left">
      {/* Hero / Vision Header */}
      <div className="bg-[#1A1207] text-[#FAF7F2] rounded-2xl p-6 md:p-10 relative overflow-hidden bg-grain shadow-xl border border-[#B8862A]/30">
        {/* Background Cover Image with Overlay */}
        {heroImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
        )}
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
          <BookOpen className="w-36 h-36 text-[#B8862A]" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#B8862A]/20 text-[#F0CC7A] border border-[#B8862A]/40 font-sans uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F0CC7A] leading-tight">
            {heroTitle}
          </h1>

          <p className="text-stone-300 leading-relaxed text-sm md:text-base font-serif italic border-l-3 border-[#B8862A] pl-4 py-1">
            {heroSubtitle}
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-[#3D2B14] border border-[#B8862A]/40 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-sm">
              <Library className="h-6 w-6 text-[#B8862A]" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">{stats.volsLabel}</div>
                <div className="font-bold text-base text-[#F0CC7A] font-mono">{stats.vols}</div>
              </div>
            </div>

            <div className="bg-[#3D2B14] border border-[#B8862A]/40 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-sm">
              <List className="h-6 w-6 text-[#B8862A]" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">{stats.subjectsLabel}</div>
                <div className="font-bold text-base text-[#F0CC7A] font-mono">{stats.subjects}</div>
              </div>
            </div>

            <div className="bg-[#3D2B14] border border-[#B8862A]/40 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-sm">
              <Award className="h-6 w-6 text-[#B8862A]" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">{stats.priceLabel}</div>
                <div className="font-bold text-base text-[#F0CC7A]">{stats.price}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Showcase & Selection Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Active Subject Card Showcase */}
          <div className="lg:col-span-5 bg-white border border-[#E8DDD0] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-5">
              {/* 3D-like Book Cover Container */}
              <div className="flex justify-center py-4">
                <div className="relative group perspective">
                  {/* Book shadow */}
                  <div className="absolute -inset-1 bg-black/10 rounded-r-lg blur-md group-hover:blur-lg transition-all duration-300 transform -rotate-2 translate-x-2 translate-y-1" />
                  
                  {/* Book Mockup */}
                  <div 
                    className={`relative w-48 h-68 rounded-r-lg ${activeSubject.coverImage ? 'bg-stone-900' : (activeSubject.coverColor || 'bg-gradient-to-br from-[#4E2F1D] to-[#3D2517]')} text-white p-5 flex flex-col justify-between border-l-4 border-black/40 shadow-xl transform transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-102 overflow-hidden`}
                  >
                    {/* If custom cover image is uploaded, display high-clarity book cover */}
                    {activeSubject.coverImage ? (
                      <>
                        <img 
                          src={activeSubject.coverImage} 
                          alt={activeSubject.title}
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                      </>
                    ) : null}

                    {/* Spine reflection */}
                    <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-white/20 to-transparent z-20 pointer-events-none" />
                    
                    <div className="relative z-10 space-y-1.5 text-center pt-2">
                      <span className="text-[9px] font-bold text-[#F0CC7A] tracking-widest uppercase block border-b border-white/20 pb-1.5 font-sans drop-shadow-md">
                        {bookTopLabel}
                      </span>
                    </div>

                    <div className="relative z-10 text-center py-4 space-y-1 flex-1 flex flex-col justify-center">
                      <h4 className="font-serif font-extrabold text-lg tracking-wide text-white leading-snug drop-shadow-lg">
                        {language === 'bn' ? activeSubject.title : (activeSubject.en || activeSubject.title)}
                      </h4>
                      {activeSubject.en && (
                        <span className="text-[10px] font-mono text-[#F0CC7A] tracking-wider block drop-shadow-md font-bold">
                          {activeSubject.en}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1 text-center pb-2">
                      <div className="text-[10px] text-[#F0CC7A] font-bold drop-shadow-md">
                        {language === 'bn' ? (activeSubject.vols || activeSubject.volsEn) : (activeSubject.volsEn || activeSubject.vols)}
                      </div>
                      <div className="text-[8px] text-stone-200 leading-tight drop-shadow-md">
                        {bookFooterLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Details */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-1 bg-[#B8862A]/10 text-[#B8862A] text-[11px] font-bold rounded-md uppercase tracking-wider border border-[#B8862A]/20 font-mono">
                    {language === 'bn' ? (activeSubject.vols || activeSubject.volsEn) : (activeSubject.volsEn || activeSubject.vols)}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    {subjectCounterLabel} {activeChintaSubject + 1} / {chintaSubjects.length}
                  </span>
                </div>
                
                <h3 className="font-serif font-extrabold text-xl text-[#1A1207] border-b border-stone-100 pb-2">
                  {language === 'bn' ? activeSubject.title : `${activeSubject.en || activeSubject.title} Thought`}
                </h3>
                
                {(activeSubject.editor || activeSubject.editorEn) && (
                  <div className="space-y-1 bg-[#FAF8F3] border border-[#E8DDD0]/50 rounded-xl p-3 text-xs">
                    <div className="text-[#B8862A] font-bold">{editorLabel}</div>
                    <div className="font-serif font-bold text-stone-800 text-sm">
                      {language === 'bn' ? (activeSubject.editor || activeSubject.editorEn) : (activeSubject.editorEn || activeSubject.editor)}
                    </div>
                  </div>
                )}

                <p className="text-stone-700 leading-relaxed text-xs md:text-sm font-sans pt-1">
                  {language === 'bn' ? (activeSubject.desc || activeSubject.descEn) : (activeSubject.descEn || activeSubject.desc)}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Grid of Subjects */}
          <div className="lg:col-span-7 bg-white border border-[#E8DDD0] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-extrabold text-stone-900 text-sm md:text-base flex items-center gap-2">
                    <Library className="w-4 h-4 text-[#B8862A]" />
                    <span>{browseHeading}</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                    {browseSubtitle}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#B8862A] bg-[#B8862A]/10 px-2.5 py-1 rounded-full font-mono shrink-0">
                  {chintaSubjects.length} {subjectsBadgeSuffix}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {chintaSubjects.map((sub: any, idx: number) => {
                  const isActive = activeChintaSubject === idx;
                  return (
                    <button
                      key={'sub-grid-' + (sub.id || idx)}
                      onClick={() => setActiveChintaSubject(idx)}
                      className={`p-3 rounded-xl text-left transition-all border outline-none cursor-pointer flex flex-col justify-between min-h-[105px] group ${
                        isActive
                          ? 'bg-[#B8862A] text-white border-[#B8862A] shadow-md scale-[1.02]'
                          : 'bg-[#FAF8F3] text-[#1A1207] border-[#E8DDD0] hover:bg-stone-50 hover:border-[#B8862A]/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className={`font-serif font-extrabold text-xs sm:text-sm leading-snug ${isActive ? 'text-white' : 'text-[#1A1207] group-hover:text-[#B8862A]'}`}>
                          {language === 'bn' ? sub.title : (sub.en || sub.title)}
                        </div>
                        {sub.en && (
                          <div className={`text-[9px] font-sans ${isActive ? 'text-stone-200' : 'text-stone-500'}`}>
                            {language === 'bn' ? sub.en : sub.title}
                          </div>
                        )}
                      </div>
                      
                      <div className={`text-[10px] font-mono font-bold self-end ${isActive ? 'text-[#FAF8F3]' : 'text-[#B8862A]'}`}>
                        {language === 'bn' ? (sub.vols || sub.volsEn) : (sub.volsEn || sub.vols)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Pricing, Hotline & External Link Block */}
      <div className="bg-[#F9F6F0] border border-[#E8DDD0] rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xs">
        <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center justify-center gap-2">
          <BookMarked className="w-5 h-5 text-[#B8862A]" />
          <span>{orderSectionTitle}</span>
        </h3>

        <p className="text-sm text-stone-700 max-w-3xl mx-auto leading-relaxed">
          {collectionInfo}
        </p>

        {/* Helpline & Location info chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          {orderHotline && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E8DDD0] text-xs font-bold text-stone-800 shadow-2xs">
              <Phone className="w-3.5 h-3.5 text-[#B8862A]" />
              <span className="text-stone-500">{orderHotlineLabel}</span>
              <span className="font-mono text-[#B8862A]">{orderHotline}</span>
            </div>
          )}
          {salesCenterInfo && (
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E8DDD0] text-xs text-stone-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#2E5942]" />
              <span>{salesCenterInfo}</span>
            </div>
          )}
        </div>

        {stats.websiteUrl && (
          <div className="pt-3">
            <a 
              href={stats.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-[#B8862A] text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-[#9A6D1F] transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{websiteBtnText}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Dynamic Sections (If Admin added extra text or document paragraphs) */}
      {sections.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-stone-200">
          <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2E5942]" />
            <span>{language === 'bn' ? 'অতিরিক্ত তথ্য ও বিবরণ' : 'Additional Information'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((sec: any, sIdx: number) => (
              <div key={sIdx} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                {sec.title && (
                  <h4 className="font-serif font-bold text-base text-[#1A1207] border-b pb-2">
                    {sec.title}
                  </h4>
                )}
                {sec.image && (
                  <div className="w-full h-48 md:h-56 rounded-xl overflow-hidden my-2 border border-stone-200">
                    <img 
                      src={sec.image} 
                      alt={sec.title || 'Section Image'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2 text-stone-700 text-sm leading-relaxed">
                  {Array.isArray(sec.content) ? (
                    sec.content.map((pText: string, pIdx: number) => (
                      <p key={pIdx}>{pText}</p>
                    ))
                  ) : (
                    <p>{sec.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
