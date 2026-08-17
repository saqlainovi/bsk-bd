import React, { useState } from 'react';
import { 
  BookOpen, MapPin, Sparkles, CheckCircle2,
  Download, Phone, Mail, FileText, Send, Eye, ShieldCheck,
  Trophy, ArrowRight, Compass, Camera, Calendar, Clock, Store, X
} from 'lucide-react';
import { ParsedPage, Language } from '../types';

interface BookFairPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto: (url: string) => void;
  setActivePhotoIndex: (i: number) => void;
  setActiveAlbumPhotos: (urls: string[]) => void;
}

export const BookFairPage: React.FC<BookFairPageProps> = ({
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
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);

  // Stats list from CMS or empty
  const statsList = page.stats && page.stats.length > 0 ? page.stats : [];

  // Highlights list from CMS or empty
  const highlightsList = (page as any).highlights && (page as any).highlights.length > 0 
    ? (page as any).highlights 
    : [];

  // Book Fair Venues / Schedule from CMS or empty
  const schedulesList = (page as any).schedules && (page as any).schedules.length > 0
    ? (page as any).schedules
    : [];

  // Book Categories & Discount Highlights from CMS or empty
  const categoriesList = (page as any).categories && (page as any).categories.length > 0 
    ? (page as any).categories 
    : [];

  // Why Unique from CMS or empty
  const whyUniqueList = (page as any).why_unique && (page as any).why_unique.length > 0 
    ? (page as any).why_unique 
    : [];

  // Gallery Images from CMS or empty
  const galleryList = (page as any).gallery && (page as any).gallery.length > 0 
    ? (page as any).gallery 
    : [];

  // Downloads List from CMS or empty
  const downloadsList = (page as any).downloads && (page as any).downloads.length > 0
    ? (page as any).downloads
    : [];

  const photosPerPage = 6;
  const totalGalleryPages = Math.ceil(galleryList.length / photosPerPage) || 1;
  const currentGalleryPhotos = galleryList.slice((galleryPage - 1) * photosPerPage, galleryPage * photosPerPage);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) return;
    setInquirySubmitted(true);
  };

  return (
    <div className="space-y-12 text-left pb-12 animate-in fade-in duration-300 w-full">
      
      {/* FULL SCALE TOP BANNER / HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1207] via-[#2A1F10] to-[#120B04] text-white p-6 sm:p-10 border border-[#B8862A]/30 shadow-2xl w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8862A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2E5942]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 w-full">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#B8862A]/20 border border-[#B8862A]/40 px-3.5 py-1.5 rounded-full text-xs font-serif font-bold text-[#F0CC7A] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F0CC7A]" />
              <span>{language === 'bn' ? (page.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র • দেশব্যাপী মানসম্মত গ্রন্থ প্রসার আন্দোলন') : (page.badge_en || 'Bishwo Shahitto Kendro • Book Fair Movement')}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-amber-50 leading-tight">
              {language === 'bn' ? (page.title_bn || 'বইমেলা ও গ্রন্থ উৎসব') : (page.title_en || 'Book Fair & Literary Festival')}
            </h1>

            <p className="font-sans text-stone-300 text-sm sm:text-base leading-relaxed max-w-4xl">
              {language === 'bn' 
                ? (page.subtitle_bn || 'জ্ঞানের আলো ছড়িয়ে দিতে রাজধানী ঢাকাসহ দেশের বিভাগ, জেলা ও উপজেলায় আনন্দময় বইমেলার উৎসব এবং বিশ্বমানের বই পাঠকের হাতের নাগালে পৌঁছে দেওয়ার সার্বিক প্রচেষ্টা।') 
                : (page.subtitle_en || 'Organizing vibrant book fairs and literary exhibitions across Bangladesh to make world-class books accessible to every book lover.')}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => document.getElementById('sec-schedule')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-[#B8862A] hover:bg-[#A07322] text-[#1A1207] font-serif font-bold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'bn' ? 'মেলার সময়সূচি ও স্থান' : 'Fair Schedule & Venues'}</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById('sec-inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
              >
                <Store className="w-4 h-4 text-[#F0CC7A]" />
                <span>{language === 'bn' ? 'স্টল বরাদ্দ ও যোগাযোগ' : 'Stall Booking & Inquiry'}</span>
              </button>
            </div>
          </div>

          {/* Full Scale Banner Image below hero text if uploaded */}
          {page.hero_image && (
            <div className="relative group rounded-2xl overflow-hidden border-2 border-[#B8862A]/40 shadow-2xl bg-black/40 h-64 sm:h-80 md:h-96 w-full">
              <img 
                src={page.hero_image} 
                alt={language === 'bn' ? page.title_bn : page.title_en} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="bg-[#2E5942] text-white text-[10px] font-serif font-bold px-3 py-1 rounded-md border border-white/20 inline-block">
                  {language === 'bn' ? 'বইমেলা প্রাঙ্গণ' : 'Book Fair Event'}
                </span>
                <p className="font-serif text-sm sm:text-base font-bold text-stone-200">
                  {language === 'bn' ? page.title_bn : page.title_en}
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid - Full Width if items exist */}
          {statsList.length > 0 && (
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center w-full">
              {statsList.map((st: any, idx: number) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#F0CC7A]">
                    {st.value}
                  </p>
                  <p className="font-serif text-xs sm:text-sm font-bold text-amber-100">
                    {language === 'bn' ? st.label_bn : st.label_en}
                  </p>
                  <p className="text-[10px] sm:text-xs text-stone-400 font-sans">
                    {language === 'bn' ? st.subtext_bn : st.subtext_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STACKED FULL-SCALE CONTENT SECTIONS */}
      <div className="space-y-12 w-full">
        
        {/* SECTION 1: OVERVIEW (Full Width Top-to-Bottom) */}
        <section id="sec-overview" className="space-y-6 w-full">
          <div className="flex items-center gap-3 border-b border-[#B8862A]/25 pb-3">
            <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? 'বইমেলা কার্যক্রমের পরিচিতি ও ইতিহাস' : 'Overview & History of BSK Book Fair'}
            </h2>
          </div>

          {/* Overview Main Card - Full Width */}
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#E8DDD0] space-y-4 w-full shadow-xs">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1A1207] border-b border-[#B8862A]/20 pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#B8862A]" />
              <span>{language === 'bn' ? (page.overview_title_bn || 'বইমেলাঃ আলোর স্পর্শে আলোকিত সমাজ') : (page.overview_title_en || 'Book Fair: Spreading the Light of Wisdom')}</span>
            </h3>
            
            <div className="font-sans text-sm sm:text-base text-stone-700 leading-relaxed space-y-4">
              <p>
                {language === 'bn' 
                  ? (page.overview_p1_bn || 'বিশ্বসাহিত্য কেন্দ্র ১৯৭৯ সালে যাত্রা শুরুর পর থেকেই সাধারণ পাঠকদের হাতে মানসম্মত ও হৃদয়স্পর্শী কালজয়ী সাহিত্য পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ। সেই ধারায় বইমেলা কার্যক্রম কেন্দ্রের অন্যতম প্রাণবন্ত সামাজিক আন্দোলন।') 
                  : (page.overview_p1_en || 'Since its inception in 1979, Bishwo Shahitto Kendro has been committed to making classic world literature accessible to everyone. The book fair movement is one of its most dynamic social outreach efforts.')}
              </p>
              <p>
                {language === 'bn' 
                  ? (page.overview_p2_bn || 'প্রতি বছর দেশের বিভিন্ন বিভাগীয় শহর, জেলা সদর এবং মফস্বল এলাকায় অত্যন্ত আকর্ষণীয় সাজসজ্জায় এই বইমেলাগুলোর আয়োজন করা হয়। যেখানে দেশি-বিদেশি কালজয়ী ক্লাসিক বই, শিশুসাহিত্য, কিশোর উপন্যাস ও বিজ্ঞান সাময়িকী বিশেষ মেলা ডিসকাউন্টে প্রদর্শিত ও বিক্রি হয়।') 
                  : (page.overview_p2_en || 'Every year, colorful book fairs are arranged in major cities, district centers, and sub-districts, presenting translated world classics, children books, and scientific magazines with exclusive discounts.')}
              </p>
            </div>
          </div>

          {/* Why Book Fair Unique Card - Placed Below in Full Scale */}
          {whyUniqueList.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-5 w-full">
              <div className="flex items-center gap-3 border-b border-[#E8DDD0] pb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2E5942]/10 flex items-center justify-center text-[#2E5942]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#1A1207]">
                    {language === 'bn' ? 'কেন বিশ্বসাহিত্য কেন্দ্রের বইমেলা অনন্য?' : 'Why is BSK Book Fair Unique?'}
                  </h4>
                  <p className="text-xs text-stone-500 font-sans">
                    {language === 'bn' ? 'গ্রন্থপ্রেমী ও সাধারণ পাঠকদের জন্য বিশেষ সুবিধা ও গুণগত বৈশিষ্ট্যসমূহ' : 'Special advantages and qualitative features for book lovers'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm font-sans text-stone-700">
                {whyUniqueList.map((wu: any, wuIdx: number) => (
                  <div key={wuIdx} className="p-4 bg-[#FAF7F2] rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-[#2E5942] font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{language === 'bn' ? wu.title_bn : wu.title_en}</span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      {language === 'bn' ? wu.desc_bn : wu.desc_en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: CORE HIGHLIGHTS */}
        {highlightsList.length > 0 && (
          <section id="sec-highlights" className="space-y-6 w-full">
            <div className="flex items-center gap-3 border-b border-[#B8862A]/25 pb-3">
              <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'বইমেলার মূল আকর্ষণ ও উৎসব বৈশিষ্ট্যসমূহ' : 'Key Features & Fair Attractions'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              {highlightsList.map((hl: any) => (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      <span className="absolute bottom-3 left-3 bg-[#B8862A] text-white text-[10px] font-serif font-bold px-2.5 py-1 rounded-lg border border-white/20">
                        {language === 'bn' ? 'আকর্ষণীয় ফিচার' : 'Key Highlight'}
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

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#2E5942] font-bold">
                      <span className="flex items-center gap-1 group-hover:text-[#B8862A] transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'বিস্তারিত দেখতে চাপুন' : 'Click for details'}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B8862A]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: FAIR SCHEDULE & VENUES */}
        {schedulesList.length > 0 && (
          <section id="sec-schedule" className="space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-[#B8862A]/25 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                  {language === 'bn' ? 'বইমেলার সময়সূচি ও স্থানসমূহ' : 'Fair Schedule & Venue Directory'}
                </h2>
              </div>
              <span className="text-xs font-serif text-[#2E5942] font-bold bg-[#2E5942]/10 px-3 py-1 rounded-full">
                {language === 'bn' ? 'হালনাগাদ তালিকা' : 'Updated List'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {schedulesList.map((item: any) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedVenue(item)}
                  className="bg-white p-6 rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold text-white px-2.5 py-0.5 rounded-md ${item.badge_color || 'bg-[#B8862A]'}`}>
                        {language === 'bn' ? item.status_bn : item.status_en}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#1A1207] group-hover:text-[#B8862A] transition-colors mt-1">
                        {language === 'bn' ? item.title_bn : item.title_en}
                      </h3>
                    </div>
                    <div className="p-2 bg-[#FAF7F2] rounded-xl border border-stone-200 shrink-0 text-[#B8862A]">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 font-sans">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2E5942] shrink-0" />
                      <span className="font-bold">{language === 'bn' ? item.date_bn : item.date_en}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{language === 'bn' ? item.time_bn : item.time_en}</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 text-stone-600">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      <span>{language === 'bn' ? item.venue_bn : item.venue_en}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#2E5942]">
                    <span className="flex items-center gap-1 group-hover:text-[#B8862A] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সম্পূর্ণ সময়সূচি ও দিকনির্দেশনা' : 'Full details & directions'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B8862A]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: BOOK CATEGORIES & DISCOUNT HIGHLIGHTS */}
        {categoriesList.length > 0 && (
          <section id="sec-categories" className="space-y-6 w-full">
            <div className="flex items-center gap-3 border-b border-[#B8862A]/25 pb-3">
              <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'বইয়ের ক্যাটাগরি ও বিশেষ ছাড়ের সুবিধা' : 'Exhibition Categories & Discount Offers'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {categoriesList.map((cat: any, cIdx: number) => {
                const IconComponent = cat.icon || BookOpen;
                return (
                  <div key={cIdx} className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DDD0] space-y-3 relative overflow-hidden group hover:border-[#B8862A] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-[#2E5942] text-white rounded-xl shadow-xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="bg-[#B8862A] text-white text-xs font-serif font-bold px-2.5 py-1 rounded-lg">
                        {cat.discount}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-sm text-[#1A1207]">
                        {language === 'bn' ? cat.title_bn : cat.title_en}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans">
                        {cat.books}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 5: PHOTO GALLERY */}
        {galleryList.length > 0 && (
          <section id="sec-gallery" className="space-y-6 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B8862A]/25 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                  {language === 'bn' ? 'বইমেলা ও মেধা উৎসব গ্যালারি' : 'Book Fair Photo Gallery'}
                </h2>
              </div>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'bn' ? `মোট ${galleryList.length}টি স্মরণীয় মুহূর্ত` : `${galleryList.length} moments`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              {currentGalleryPhotos.map((item: any, idx: number) => {
                const realIndex = (galleryPage - 1) * photosPerPage + idx;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActivePhoto(item.image);
                      setActivePhotoIndex(realIndex);
                      setActiveAlbumPhotos(galleryList.map((g: any) => g.image));
                    }}
                    className="group relative rounded-2xl overflow-hidden border border-[#E8DDD0] bg-stone-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer aspect-4/3"
                  >
                    <img 
                      src={item.image} 
                      alt={language === 'bn' ? item.caption_bn : item.caption_en} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                      <Camera className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-serif text-xs font-bold leading-tight line-clamp-2">
                        {language === 'bn' ? item.caption_bn : item.caption_en}
                      </p>
                      <span className="text-[10px] text-amber-200 mt-1 block">
                        {language === 'bn' ? 'বড় করে দেখতে চাপুন' : 'Click to enlarge'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalGalleryPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={galleryPage === 1}
                  onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <span>{language === 'bn' ? 'আগের পৃষ্ঠা' : 'Previous'}</span>
                </button>

                <span className="text-xs font-serif font-bold text-stone-600">
                  {galleryPage} / {totalGalleryPages}
                </span>

                <button
                  type="button"
                  disabled={galleryPage === totalGalleryPages}
                  onClick={() => setGalleryPage(p => Math.min(totalGalleryPages, p + 1))}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <span>{language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next'}</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 6: DOWNLOADS */}
        {downloadsList.length > 0 && (
          <section id="sec-downloads" className="space-y-6 w-full">
            <div className="flex items-center gap-3 border-b border-[#B8862A]/25 pb-3">
              <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'ফরম ও ডকুমেন্ট ডাউনলোড' : 'Forms & Downloads'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {downloadsList.map((dl: any) => (
                <div key={dl.id} className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#B8862A]/10 flex items-center justify-center text-[#B8862A]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-[#1A1207]">
                      {language === 'bn' ? dl.title_bn : dl.title_en}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {dl.file_size}
                    </p>
                  </div>

                  <a 
                    href={dl.url || '#'}
                    download
                    className="w-full py-2 bg-[#FAF7F2] hover:bg-[#B8862A] text-[#1A1207] hover:text-white border border-[#E8DDD0] text-xs font-serif font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডাউনলোড করুন' : 'Download'}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: STALL BOOKING & INQUIRY FORM (Placed vertically in Full Scale) */}
        <section id="sec-inquiry" className="space-y-6 w-full">
          <div className="flex items-center gap-3 border-b border-[#B8862A]/25 pb-3">
            <span className="w-2 h-7 bg-[#B8862A] rounded-full inline-block shrink-0" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207]">
              {language === 'bn' ? 'স্টল বরাদ্দ ও সমন্বয় সেল যোগাযোগ' : 'Stall Booking & Fair Coordination Cell'}
            </h2>
          </div>

          <div className="space-y-6 w-full">
            {/* Coordination Cell Info Box - Full Width */}
            <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#E8DDD0] space-y-4 w-full shadow-xs">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1207] border-b border-[#B8862A]/20 pb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? 'বইমেলা কেন্দ্রীয় অফিস ও যোগাযোগ ক্ষেত্র' : 'Central Fair Coordination Secretariat'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-stone-700 font-sans">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    {language === 'bn' ? 'অফিসের ঠিকানা' : 'Office Address'}
                  </p>
                  <div className="flex items-start gap-2 pt-1 text-stone-600">
                    <MapPin className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                    <span>{language === 'bn' ? (page.coordination_cell?.office_bn || page.coordinator?.office_bn || '১৪/১ প্রমিজ প্লেস, বাংলামোটর, ঢাকা-১০০০') : (page.coordination_cell?.office_en || page.coordinator?.office_en || '14/1 Promise Place, Banglamotor, Dhaka-1000')}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    {language === 'bn' ? 'ফোন ও মোবাইল' : 'Phone & Mobile'}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-stone-600">
                    <Phone className="w-4 h-4 text-[#2E5942] shrink-0" />
                    <span>{page.coordination_cell?.phone || page.coordinator?.phone || '+৮৮০-২-৯৬৬১০৭৮, ০১৭২০০০০০০০'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-stone-600">
                    <Mail className="w-4 h-4 text-[#2E5942] shrink-0" />
                    <span>{page.coordination_cell?.email || page.coordinator?.email || 'bookfair.bsk@gmail.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry & Stall Booking Form - Full Width below office info */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-5 w-full">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1207] border-b border-[#E8DDD0] pb-2">
                {language === 'bn' ? 'বইমেলায় অংশগ্রহণ বা স্টল আবেদনের জন্য বার্তা পাঠান' : 'Submit Fair Inquiry or Stall Request'}
              </h3>

              {inquirySubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-lg text-emerald-900">
                    {language === 'bn' ? 'আপনার বার্তাটি সফলভাবে পৌঁছায়ছে!' : 'Message Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-800 font-sans">
                    {language === 'bn' ? 'বইমেলা সমন্বয়কারী দল শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করবেন।' : 'Our fair coordination team will reach out to you shortly.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setInquirySubmitted(false); setInquiryForm({ name: '', phone: '', institute: '', message: '' }); }}
                    className="mt-2 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition cursor-pointer"
                  >
                    {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Submit Another Request'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}</label>
                      <input 
                        type="text" 
                        required 
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder={language === 'bn' ? 'যেমন: প্রকাশনী / প্রতিষ্ঠান প্রধান' : 'Name of Publisher / Individual'}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
                      <input 
                        type="tel" 
                        required 
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="017xxxxxxxx"
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রতিষ্ঠানের নাম / ঠিকানা' : 'Organization / Publisher Name'}</label>
                    <input 
                      type="text" 
                      value={inquiryForm.institute}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, institute: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: অনিন্দ্য প্রকাশনী, ঢাকা' : 'e.g. Acme Publications'}
                      className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 block">{language === 'bn' ? 'বার্তা বা স্টল বরাদ্দের চাহিদা' : 'Your Inquiry / Message'}</label>
                    <textarea 
                      rows={3}
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder={language === 'bn' ? 'বইমেলায় স্টল সম্পর্কিত তথ্য জানতে চাই...' : 'I want details regarding stall booking...'}
                      className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#2E5942] hover:bg-[#203F2F] text-white font-serif font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4 text-[#F0CC7A]" />
                    <span>{language === 'bn' ? 'বার্তাটি পাঠিয়ে দিন' : 'Send Inquiry Message'}</span>
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
                    {language === 'bn' ? 'বইমেলা আকর্ষণ' : 'Book Fair Highlight'}
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
                    {language === 'bn' ? 'বইমেলা আকর্ষণ' : 'Book Fair Highlight'}
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

            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#1A1207]">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ:' : 'Detailed Overview:'}
                </h4>
                <p className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed">
                  {language === 'bn' ? selectedHighlight.desc_bn : selectedHighlight.desc_en}
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DDD0] space-y-3">
                <h5 className="font-serif font-bold text-sm text-[#1A1207]">
                  {language === 'bn' ? 'মূল সুবিধা ও আয়োজনসমূহ:' : 'Key Features & Provisions:'}
                </h5>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-sans">
                  {[
                    { bn: 'দেশি-বিদেশি কালজয়ী প্রকাশনা সহজলভ্য করা', en: 'Ensuring availability of classic national & international books' },
                    { bn: 'বিশেষ মেলা ডিসকাউন্টে বই ক্রয়ের অপূর্ব সুযোগ', en: 'Exclusive fair discounts for students & book lovers' },
                    { bn: 'লেখক-পাঠক সরাসরি মতবিনিময় ও মেধা উৎসব', en: 'Direct author interactions and literary competitions' },
                    { bn: 'শিশু প্রাঙ্গণে আনন্দময় সাংস্কৃতিক পরিবেশনা', en: 'Cultural performances and poetry recitations in children corners' }
                  ].map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
                      <span>{language === 'bn' ? pt.bn : pt.en}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
                  <span>{language === 'bn' ? 'স্টল বা যোগাযোগের আবেদন করুন' : 'Apply for Stall or Inquiry'}</span>
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

      {/* VENUE DETAIL MODAL POPUP */}
      {selectedVenue && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedVenue(null)}
        >
          <div 
            className="bg-white max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E8DDD0] relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1A1207] text-white p-6 relative">
              <span className={`text-[10px] font-bold text-white px-2.5 py-0.5 rounded-md ${selectedVenue.badge_color || 'bg-[#B8862A]'}`}>
                {language === 'bn' ? selectedVenue.status_bn : selectedVenue.status_en}
              </span>
              <h3 className="font-serif text-xl font-bold mt-2 text-amber-50">
                {language === 'bn' ? selectedVenue.title_bn : selectedVenue.title_en}
              </h3>
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DDD0] space-y-3 text-xs text-stone-700 font-sans">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#2E5942] shrink-0" />
                  <span className="font-bold text-stone-900">{language === 'bn' ? selectedVenue.date_bn : selectedVenue.date_en}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{language === 'bn' ? selectedVenue.time_bn : selectedVenue.time_en}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>{language === 'bn' ? selectedVenue.venue_bn : selectedVenue.venue_en}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#1A1207]">
                  {language === 'bn' ? 'মেলার বিস্তারিত বিবরণ:' : 'Venue Details:'}
                </h4>
                <p className="font-sans text-stone-700 text-xs sm:text-sm leading-relaxed">
                  {language === 'bn' ? selectedVenue.details_bn : selectedVenue.details_en}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVenue(null);
                    document.getElementById('sec-inquiry')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-serif font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F0CC7A]" />
                  <span>{language === 'bn' ? 'সমন্বয় সেল যোগাযোগ' : 'Contact Coordinator'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVenue(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
