import React, { useState, useEffect } from 'react';
import { 
  Store, BookOpen, MapPin, Phone, Mail, Clock, FileText, Download, 
  Eye, CheckCircle2, Send, Image as ImageIcon, X, Sparkles, Award,
  Truck, ShieldCheck, HeartHandshake, ChevronRight, MessageSquare,
  ShoppingBag, Library, Search
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultBookShopData } from '../data/specializedPagesDefaults';

interface BookShopPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate?: (tab: string) => void;
  setActivePhoto?: (url: string) => void;
  setActivePhotoIndex?: (i: number) => void;
  setActiveAlbumPhotos?: (urls: string[]) => void;
}

export const BookShopPage: React.FC<BookShopPageProps> = ({
  page,
  language,
  onNavigate,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos
}) => {
  const isBn = language === 'bn';

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await cpanelApi.getDoc('website_pages', 'bookshop');
        if (data) {
          setDbPageData(data);
        }
      } catch (err) {
        console.error('Failed to fetch bookshop page:', err);
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

  const pageData = { ...defaultBookShopData, ...page, ...dbPageData, ...(dbPageData?.bookShopData || {}) };

  // Contact / Inquiry Form state
  const [inquirerName, setInquirerName] = useState('');
  const [inquirerPhone, setInquirerPhone] = useState('');
  const [inquirerAddress, setInquirerAddress] = useState('');
  const [bookInterest, setBookInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected Image Lightbox fallback
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Downloadable Catalogs
  const defaultCatalogs = [
    {
      id: 'cat-bsk-2024',
      titleBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনীর বইয়ের তালিকা (ক্যাটালগ-২০২৪)',
      titleEn: 'BSK Publications Complete Catalog (2024)',
      fileSizeBn: '৩.৮ MB • PDF',
      fileSizeEn: '3.8 MB • PDF',
      descBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশিত ৫ শতাধিক কালজয়ী ও ধ্রুপদী বইয়ের সম্পূর্ণ ক্যাটালগ ও মূল্যসূচী।',
      descEn: 'Complete catalogue of over 500 BSK published classics with price list.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'cat-bd-discount',
      titleBn: 'বিশেষ ছাড়ের বইয়ের মজুদ তালিকা (বাংলাদেশি প্রকাশনা)',
      titleEn: 'Special Discount Stock List (Bangladeshi Publishers)',
      fileSizeBn: '২.৫ MB • PDF',
      fileSizeEn: '2.5 MB • PDF',
      descBn: 'বাংলাদেশের বিভিন্ন স্বনামধন্য প্রকাশনীর বইয়ের ওপর বিশেষ ছাড়ের হালনাগাদ তালিকা।',
      descEn: 'Updated discount stock details of top Bangladeshi publishing houses.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'cat-indian-stock',
      titleBn: 'ভারতীয় বিভিন্ন প্রকাশনার বইয়ের মজুদ তালিকা (কলকাতা)',
      titleEn: 'Indian Publishers Stock List (Kolkata Imports)',
      fileSizeBn: '২.৯ MB • PDF',
      fileSizeEn: '2.9 MB • PDF',
      descBn: 'আনন্দ পাবলিশার্স, দে’জ পাবলিশিং সহ পশ্চিমবঙ্গের সেরা প্রকাশনার বিক্রয় কেন্দ্রে সংরক্ষিত বইয়ের তালিকা।',
      descEn: 'Curated list of West Bengal literature imported directly from Kolkata.',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const catalogs = (pageData.downloads && pageData.downloads.length > 0)
    ? pageData.downloads.map((d: any) => ({
        id: d.id || String(Math.random()),
        titleBn: d.title_bn || d.titleBn || 'ক্যাটালগ ও বইয়ের তালিকা',
        titleEn: d.title_en || d.titleEn || 'Catalog & Stock List',
        fileSizeBn: d.file_size || d.fileSizeBn || 'PDF Document',
        fileSizeEn: d.file_size || d.fileSizeEn || 'PDF Document',
        descBn: d.desc_bn || d.descBn || 'বইয়ের পূর্ণাঙ্গ তালিকা ও মূল্যসূচী।',
        descEn: d.desc_en || d.descEn || 'Complete book list and catalog.',
        url: d.file_url || d.url || '#'
      }))
    : defaultCatalogs;

  // Bookstore Gallery Photos
  const defaultGalleryImages = [
    {
      url: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      captionBn: "বিশ্বসাহিত্য কেন্দ্র ভবন ২য় তলার সুসজ্জিত বই বিক্রয় কেন্দ্র",
      captionEn: "Spacious Bookstore on 2nd Floor of BSK Building"
    },
    {
      url: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      captionBn: "দেশি-বিদেশি ধ্রুপদী বইয়ের মনোরম প্রদর্শনী",
      captionEn: "Extensive Display of Local & Foreign Classics"
    },
    {
      url: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      captionBn: "পাঠকদের সুবিধার্থে বিষয়ভিত্তিক সাজানো বইয়ের র্যাক",
      captionEn: "Categorized Bookshelves for Convenience"
    },
    {
      url: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      captionBn: "শান্ত ও শীতাতপ নিয়ন্ত্রিত পঠন পরিবেশ",
      captionEn: "Air-conditioned Browsing Atmosphere"
    },
    {
      url: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
      captionBn: "বই পরামর্শক ও সহায়ক সার্ভিস ডেক্স",
      captionEn: "Book Consultants & Customer Help Desk"
    },
    {
      url: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
      captionBn: "কেন্দ্রের প্রকাশনা ও বিশেষ ছাড়ের তথ্য কেন্দ্র",
      captionEn: "BSK Publications & Discount Information Counter"
    }
  ];

  const galleryImages = (pageData.gallery && pageData.gallery.length > 0)
    ? pageData.gallery.map((g: any) => ({
        url: g.image || g.url,
        captionBn: g.caption_bn || g.captionBn || 'বই বিক্রয় কেন্দ্রের ছবি',
        captionEn: g.caption_en || g.captionEn || 'Bookstore Photo'
      }))
    : defaultGalleryImages;

  // Submit Inquiry Form
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirerName.trim() || !inquirerPhone.trim()) {
      setFormError(isBn ? 'অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর লিখুন।' : 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await cpanelApi.addDoc('inquiries', {
        type: 'bookshop_query',
        name: inquirerName.trim(),
        phone: inquirerPhone.trim(),
        institution: inquirerAddress.trim(),
        message: bookInterest.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSubmittedSuccess(true);
      setInquirerName('');
      setInquirerPhone('');
      setInquirerAddress('');
      setBookInterest('');
      setTimeout(() => setSubmittedSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting query:", err);
      setFormError(isBn ? 'তথ্য পাঠানো সম্ভব হয়নি, পরে চেষ্টা করুন।' : 'Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageModal = (url: string, index: number) => {
    if (setActivePhoto && setActiveAlbumPhotos) {
      setActiveAlbumPhotos(galleryImages.map(g => g.url));
      if (setActivePhotoIndex) setActivePhotoIndex(index);
      setActivePhoto(url);
    } else {
      setActiveImageModal(url);
    }
  };

  const titleText = isBn
    ? (pageData.title_bn && pageData.title_bn !== 'বই বিক্রয় কেন্দ্র test' ? pageData.title_bn : 'বই বিপণন ও বিক্রয়কেন্দ্র')
    : (pageData.title_en || 'BSK Book Shop & Sales Center');

  const subtitleText = isBn
    ? (pageData.subtitle_bn && pageData.subtitle_bn !== 'test' ? pageData.subtitle_bn : 'বিশ্বসাহিত্য কেন্দ্রের ভবনের ২য় তলায় অবস্থিত নিজস্ব বই বিক্রয় কেন্দ্র। বিশ্বসাহিত্য কেন্দ্র প্রকাশিত পাঁচ শতাধিক কালজয়ী ধ্রুপদী বইয়ের পাশাপাশি বাংলাদেশ ও কলকাতার শীর্ষ প্রকাশনীর বাছাইকৃত সেরা সাহিত্য ও মননশীল গ্রন্থ হ্রাসকৃত মূল্যে পাওয়া যায়।')
    : (pageData.subtitle_en || 'Located on the 2nd floor of Bishwo Shahitto Kendro building. Features over 500 BSK published classics alongside selected masterpieces from top publishers in Bangladesh and West Bengal at attractive discount rates.');

  return (
    <div className="w-full text-[#1A1207] space-y-12 animate-fade-in font-sans text-left pb-12">
      
      {/* ── 1. HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1A1207] text-[#FAF7F2] border border-[#B8862A]/30 shadow-2xl p-6 sm:p-10 md:p-14">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8862A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2E5942]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8862A]/20 border border-[#B8862A]/40 text-[#F0CC7A] text-xs font-bold font-sans tracking-wide uppercase">
            <Store className="w-4 h-4 text-[#F0CC7A]" />
            <span>{isBn ? (pageData.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন • ২য় তলা | বই বিক্রয় কেন্দ্র') : (pageData.badge_en || 'BSK Building • 2nd Floor | Book Shop')}</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F0CC7A] tracking-tight leading-tight">
            {titleText}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-base md:text-lg text-stone-300 font-sans font-light leading-relaxed">
            {subtitleText}
          </p>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'অবস্থান' : 'Location'}</span>
                <span className="text-white font-bold">{isBn ? '২য় তলা, বাংলামোটর' : '2nd Floor, Dhaka'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'সময়সূচি' : 'Timings'}</span>
                <span className="text-white font-bold">{isBn ? 'প্রতিদিন ১০টা - ৮টা' : 'Daily 10 AM - 8 PM'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Award className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'বিশেষ ছাড়' : 'BSK Discount'}</span>
                <span className="text-white font-bold">{isBn ? '২৫% ফ্ল্যাট ছাড়' : '25% Flat Discount'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'হটলাইন' : 'Hotline'}</span>
                <span className="text-white font-bold font-mono">+৮৮০১৭৩০০৫৫৮০২</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#catalogs"
              className="inline-flex items-center gap-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isBn ? 'বইয়ের ক্যাটালগ ডাউনলোড' : 'Download Book Catalogs'}</span>
            </a>
            <a 
              href="https://wa.me/8801730055802"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে বই অর্ডার' : 'Order via WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. 4 CORE METRICS & ADVANTAGES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            valBn: '৫০০+ টি',
            valEn: '500+ Classics',
            lblBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা',
            lblEn: 'BSK Published Classics',
            subBn: 'চিরায়ত অনুবাদ ও কিশোর সাহিত্য',
            subEn: 'World classics & juvenile titles',
            icon: BookOpen,
            color: 'bg-[#F7EFE5] text-[#8C6212]'
          },
          {
            valBn: '২৫% ছাড়',
            valEn: '25% Discount',
            lblBn: 'সকল পাঠকের জন্য বিশেষ ছাড়',
            lblEn: 'Flat Special Discount',
            subBn: 'কেন্দ্র প্রকাশিত সকল বইয়ে প্রযোজ্য',
            subEn: 'Applicable on all BSK publications',
            icon: Award,
            color: 'bg-[#E6F4EA] text-[#137333]'
          },
          {
            valBn: '১০০+ প্রকাশনী',
            valEn: '100+ Publishers',
            lblBn: 'দেশি ও বিদেশি প্রকাশনা কর্নার',
            lblEn: 'Local & Kolkata Imports',
            subBn: 'আনন্দ, দে’জ, প্রথমা ও ঐতিহ্য',
            subEn: 'Top publishers under one roof',
            icon: Library,
            color: 'bg-[#E8F0FE] text-[#1A73E8]'
          },
          {
            valBn: 'সারাদেশে ডেলিভারি',
            valEn: 'Courier Delivery',
            lblBn: 'হোম ডেলিভারি ও কুরিয়ার সেবা',
            lblEn: 'Nationwide Courier Service',
            subBn: 'ঘরে বসেই সহজে বই প্রাপ্তি',
            subEn: 'Fast doorstep book delivery',
            icon: Truck,
            color: 'bg-[#FDF2F2] text-[#C5221F]'
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="p-5 bg-white border border-[#E8DDD0] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center gap-4 hover:border-[#B8862A] hover:shadow-md transition duration-300"
            >
              <div className={`p-3.5 rounded-xl shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="font-serif text-lg md:text-xl font-extrabold text-[#1A1207] block leading-none">
                  {isBn ? stat.valBn : stat.valEn}
                </span>
                <span className="text-xs font-bold text-stone-800 block">
                  {isBn ? stat.lblBn : stat.lblEn}
                </span>
                <span className="text-[10px] text-stone-500 block leading-tight">
                  {isBn ? stat.subBn : stat.subEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. FEATURED CORNERS & HIGHLIGHTS ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8DDD0] shadow-xs space-y-6">
        <div className="border-b border-[#E8DDD0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B8862A]" />
              <span>{isBn ? 'বই বিক্রয় কেন্দ্রের বিশেষ কর্নার ও সংকলন' : 'Featured Corners & Collections'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              {isBn ? 'পাঠকদের সুবিধার্থে প্রতিটি বিষয়ের বই অত্যন্ত সুবিন্যস্তভাবে সাজানো।' : 'Thoughtfully categorized book sections for seamless browsing.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              titleBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা কর্নার',
              titleEn: 'BSK Classics Collection',
              descBn: 'প্লেটো, এরিস্টটল, শেক্সপিয়র, টলস্টয়, দস্তয়েভস্কি সহ বিশ্বসাহিত্যের ধ্রুপদী অনুবাদ ও বাঙালির চিন্তামূলক রচনার পূর্ণাঙ্গ সম্ভার।',
              descEn: 'Timeless world literature translations, classic philosophical works, and juvenile series.',
              tagBn: '২৫% স্থায়ী ছাড়',
              tagEn: '25% Flat Discount',
              tagCol: 'bg-amber-100 text-amber-900 border-amber-300'
            },
            {
              titleBn: 'কলকাতা ও ভারতীয় প্রকাশনা কর্নার',
              titleEn: 'Kolkata & Indian Imports',
              descBn: 'আনন্দ পাবলিশার্স, দে’জ পাবলিশিং, পত্রভারতী সহ পশ্চিমবঙ্গের শীর্ষ প্রকাশনীর সেরা উপন্যাস, কবিতা ও গবেষণাধর্মী বই।',
              descEn: 'Curated titles from premier West Bengal publishers imported directly.',
              tagBn: 'বিশেষ আমদানি',
              tagEn: 'Direct Import',
              tagCol: 'bg-blue-100 text-blue-900 border-blue-300'
            },
            {
              titleBn: 'বাংলাদেশের শীর্ষ প্রকাশনা কর্নার',
              titleEn: 'Top Bangladeshi Publishers',
              descBn: 'প্রথমা, অন্যপ্রকাশ, অনুপম, সময়, ঐতিহ্য, কথাপ্রকাশ ও মাওলা ব্রাদার্স সহ দেশের নন্দিত প্রকাশনীর নতুন ও বেস্টসেলার বই।',
              descEn: 'Best-selling fiction, non-fiction, and academic titles from Bangladesh.',
              tagBn: 'বাছাইকৃত সংগ্রহ',
              tagEn: 'Curated Picks',
              tagCol: 'bg-emerald-100 text-emerald-900 border-emerald-300'
            },
            {
              titleBn: 'শিশু-কিশোর ও আর্ট/কমিকস কর্নার',
              titleEn: 'Children & Graphic Novels',
              descBn: 'টিনটিন, অ্যাস্টেরিক্স, ফেলুদা, প্রফেসর শঙ্কু, ঠাকুরমার ঝুলি ও সচিত্র শিশুকিশোর সাহিত্যের বিশাল রঙিন জগৎ।',
              descEn: 'Vibrant collection of illustrated classics, comics, and creative activity books.',
              tagBn: 'শিশু-কিশোর প্রিয়',
              tagEn: 'Youth Favorite',
              tagCol: 'bg-purple-100 text-purple-900 border-purple-300'
            }
          ].map((corner, cIdx) => (
            <div 
              key={cIdx}
              className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${corner.tagCol}`}>
                  {isBn ? corner.tagBn : corner.tagEn}
                </span>
                <h3 className="font-serif font-bold text-sm text-[#1A1207] leading-snug">
                  {isBn ? corner.titleBn : corner.titleEn}
                </h3>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {isBn ? corner.descBn : corner.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. DOWNLOADABLE CATALOGS & PRICE LISTS ── */}
      <div id="catalogs" className="space-y-6">
        <div className="border-b border-[#E8DDD0] pb-3">
          <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#B8862A]" />
            <span>{isBn ? 'বইয়ের তালিকা ও ক্যাটালগ ডাউনলোড' : 'Download Book Catalogs & Price Lists'}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isBn ? 'বই নির্বাচন ও ঘরে বসে অর্ডারের জন্য প্রয়োজনীয় ক্যাটালগের PDF কপি সংরক্ষণ করুন।' : 'Download updated PDF catalogues to browse book lists and pricing.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {catalogs.map((cat: any) => (
            <div 
              key={cat.id}
              className="p-6 bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 bg-[#FAF7F2] rounded-xl text-[#B8862A] border border-[#B8862A]/20">
                    <FileText className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                    {isBn ? cat.fileSizeBn : cat.fileSizeEn}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-[#1A1207] leading-snug">
                  {isBn ? cat.titleBn : cat.titleEn}
                </h3>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {isBn ? cat.descBn : cat.descEn}
                </p>
              </div>

              <a 
                href={cat.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'ক্যাটালগ ডাউনলোড (PDF)' : 'Download PDF Catalog'}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. PHOTO GALLERY & AMBIANCE ── */}
      <div className="space-y-6">
        <div className="border-b border-[#E8DDD0] pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#B8862A]" />
              <span>{isBn ? 'বুকশপ ও পাঠ পরিবেশ আলোকচিত্র' : 'Bookstore Photo Gallery'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isBn ? 'বিশ্বসাহিত্য কেন্দ্র ভবন ২য় তলার বুকশপ ও মনোরম অন্দরমহলের চিত্র।' : 'Glimpses of our curated shelves and peaceful browsing atmosphere.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img: any, idx: number) => (
            <div 
              key={idx}
              onClick={() => openImageModal(img.url, idx)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                <img 
                  src={img.url} 
                  alt={isBn ? img.captionBn : img.captionEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 text-[#1A1207] rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <Eye className="w-4 h-4 text-[#B8862A]" />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white">
                <p className="text-xs font-bold text-stone-800 truncate font-sans group-hover:text-[#B8862A] transition">
                  {isBn ? img.captionBn : img.captionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. DIRECT ORDER & INQUIRY FORM ── */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#E8DDD0] shadow-sm space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="inline-flex p-3 bg-[#B8862A]/10 text-[#8C6212] rounded-2xl mb-1">
            <ShoppingBag className="w-6 h-6 text-[#B8862A]" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207]">
            {isBn ? 'ঘরে বসে বই অর্ডার ও তথ্য অনুসন্ধান' : 'Home Delivery & Order Request'}
          </h2>
          <p className="text-xs md:text-sm text-stone-600 font-sans leading-relaxed">
            {isBn 
              ? 'পছন্দের বইয়ের নাম বা তালিকা লিখে পাঠান। আমাদের বিক্রয় প্রতিনিধি আপনার সাথে যোগাযোগ করে কুরিয়ারে বই পাঠিয়ে দেবেন।' 
              : 'Submit your requested book titles or query. Our representative will contact you for delivery.'}
          </p>
        </div>

        <form onSubmit={handleSubmitInquiry} className="max-w-xl mx-auto space-y-4 pt-2">
          {submittedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isBn ? 'আপনার অর্ডারের তথ্য সফলভাবে গৃহীত হয়েছে! শীঘ্রই প্রতিনিধি যোগাযোগ করবেন।' : 'Your order request submitted successfully!'}</span>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'আপনার নাম *' : 'Your Name *'}</label>
              <input 
                type="text" 
                value={inquirerName}
                onChange={(e) => setInquirerName(e.target.value)}
                placeholder={isBn ? 'নাম লিখুন' : 'Enter name'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}</label>
              <input 
                type="tel" 
                value={inquirerPhone}
                onChange={(e) => setInquirerPhone(e.target.value)}
                placeholder={isBn ? '০১৭XXXXXXXX' : 'Phone number'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#B8862A]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}</label>
            <input 
              type="text" 
              value={inquirerAddress}
              onChange={(e) => setInquirerAddress(e.target.value)}
              placeholder={isBn ? 'বাড়ি/রোড, এলাকা, জেলা' : 'Street address & city'}
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'বইয়ের নাম / অর্ডারের বিবরণ' : 'Book Titles / Order Details'}</label>
            <textarea 
              rows={3}
              value={bookInterest}
              onChange={(e) => setBookInterest(e.target.value)}
              placeholder={isBn ? 'যে যে বই কিনতে চান তার নাম ও কপি সংখ্যা লিখুন...' : 'List the book titles you wish to order...'}
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#B8862A] hover:bg-[#9A6D1F] text-white text-xs md:text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? (isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (isBn ? 'অর্ডার অনুরোধ পাঠান' : 'Submit Order Request')}</span>
            </button>
            <a 
              href="https://wa.me/8801730055802"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs md:text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </form>
      </div>

    </div>
  );
};
