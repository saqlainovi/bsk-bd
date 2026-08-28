import React, { useState, useEffect } from 'react';
import { 
  Coffee, Utensils, Clock, MapPin, CheckCircle2, 
  Image as ImageIcon, Eye, X, Sparkles, Award, Phone, 
  Calendar, HeartHandshake, ChevronRight, MessageSquare,
  Music, Leaf, Sun, Wind, Send, BookOpen
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultCafeData } from '../data/specializedPagesDefaults';

interface CafePageProps {
  page: ParsedPage;
  language: Language;
  onNavigate?: (tab: string) => void;
  setActivePhoto?: (url: string) => void;
  setActivePhotoIndex?: (i: number) => void;
  setActiveAlbumPhotos?: (urls: string[]) => void;
}

export const CafePage: React.FC<CafePageProps> = ({
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
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<'all' | 'hot' | 'cold' | 'snacks'>('all');

  // Booking / Inquiry Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected Image Lightbox fallback
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await cpanelApi.getDoc('website_pages', 'cafe');
        if (data) {
          setDbPageData(data);
        }
      } catch (err) {
        console.error('Failed to fetch cafe page:', err);
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

  const pageData = { ...defaultCafeData, ...page, ...dbPageData, ...(dbPageData?.cafeData || {}) };

  // Default Cafeteria Photo Gallery
  const defaultCafeGallery = [
    {
      url: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      captionBn: "বিশ্বসাহিত্য কেন্দ্র ভবনের ১০ম তলার মনোরম ছাদবাগান ও ওপেন এয়ার ক্যাফে",
      captionEn: "Open Air Rooftop Garden Cafeteria at 10th Floor"
    },
    {
      url: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      captionBn: "সবুজ বাগান ও প্রাকৃতিক আলো-বাতাসপূর্ণ চমৎকার সিটিং লাউঞ্জ",
      captionEn: "Lush Greenery & Scenic Outdoor Seating Lounge"
    },
    {
      url: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      captionBn: "পাঠক ও দর্শনার্থীদের সান্ধ্যকালীন সাহিত্য আড্ডা ও চা-চক্রের পরিবেশ",
      captionEn: "Cosy Literary Adda & Evening Refreshment Atmosphere"
    },
    {
      url: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      captionBn: "রোদ ও বৃষ্টি সুরক্ষিত নান্দনিক ইনডোর ডায়নিং এরিয়া",
      captionEn: "Clean and Aesthetic Indoor Dining Seating"
    },
    {
      url: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
      captionBn: "মুক্তমঞ্চ সংলগ্ন সাংস্কৃতিক মিলনমেলা ও আয়োজন কর্নার",
      captionEn: "Open Cultural Stage & Gathering Corner"
    },
    {
      url: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
      captionBn: "ঢাকার আকাশ ও সূর্যাস্ত উপভোগের চমৎকার ব্যালকনি ভিউ",
      captionEn: "Panoramic Sunset and Skyline Balcony View"
    }
  ];

  const cafeGallery = (pageData.gallery && pageData.gallery.length > 0)
    ? pageData.gallery.map((g: any) => ({
        url: g.image || g.url,
        captionBn: g.caption_bn || g.captionBn || 'ক্যাফেটেরিয়ার ছবি',
        captionEn: g.caption_en || g.captionEn || 'Cafeteria Photo'
      }))
    : defaultCafeGallery;

  const openImageModal = (url: string, index: number) => {
    if (setActivePhoto && setActiveAlbumPhotos) {
      setActiveAlbumPhotos(cafeGallery.map((g: any) => g.url));
      if (setActivePhotoIndex) setActivePhotoIndex(index);
      setActivePhoto(url);
    } else {
      setActiveImageModal(url);
    }
  };

  // Menu items list
  const defaultMenuItems = [
    // Hot Beverages
    { category: 'hot', name_bn: 'স্পেশাল মালাই চা', name_en: 'Special Malai Tea', price: '৳ ৫০', desc_bn: 'খাঁটি দুধের ঘন সর ও সুগন্ধি মসলাযুক্ত চা', desc_en: 'Rich creamy milk tea with aromatic spices' },
    { category: 'hot', name_bn: 'ব্রুড ক্যাপুচিনো কফি', name_en: 'Fresh Brewed Cappuccino', price: '৳ ১৮০', desc_bn: 'তাজা ব্রু করা রোস্টেড কফি বিনের সাথে ক্রিমি ফোম', desc_en: 'Rich espresso with steamed milk foam' },
    { category: 'hot', name_bn: 'আমেরিকানো / এসপ্রেসো', name_en: 'Americano / Espresso Shot', price: '৳ ১৫০', desc_bn: 'তাজা সুবাসিত ব্ল্যাক কফি শট', desc_en: 'Single or double shot of pure aromatic espresso' },
    { category: 'hot', name_bn: 'ভেষজ গ্রিন টি ও আদা-লেবু চা', name_en: 'Herbal Green & Lemon-Ginger Tea', price: '৳ ৬০', desc_bn: 'স্বাস্থ্যসম্মত ভেষজ ও লেমন-জিঞ্জার টি', desc_en: 'Refreshing green tea infused with ginger & lemon' },
    
    // Cold Beverages
    { category: 'cold', name_bn: 'ফ্রেশ লেমনেড ও মিন্ট সোডা', name_en: 'Fresh Mint Lemonade Soda', price: '৳ ৮০', desc_bn: 'তাজা পুদিনা পাতা ও লেবুর প্রাকৃতিক রিফ্রেশার', desc_en: 'Chilled sparkling soda with fresh mint and lime' },
    { category: 'cold', name_bn: 'সিজনাল ফ্রুট জুস', name_en: 'Fresh Seasonal Fruit Juice', price: '৳ ১২০', desc_bn: 'আম, তরমুজ, কমলা ও আনারের তাজা রস', desc_en: '100% pure fresh seasonal fruit juice' },
    { category: 'cold', name_bn: 'আইসড চকোলেট কোল্ড কফি', name_en: 'Iced Chocolate Cold Coffee', price: '৳ ১৬০', desc_bn: 'চকোলেট ব্লেন্ডেড ক্রিমি কোল্ড কফি', desc_en: 'Chilled blended chocolate coffee with cream' },
    
    // Snacks
    { category: 'snacks', name_bn: 'চিকেন রোল ও সমুচা প্ল্যাটার', name_en: 'Chicken Roll & Samosa Platter', price: '৳ ১২০', desc_bn: 'মুচমুচে গরম ও স্বাস্থ্যকর ঘরোয়া স্বাদের নাশতা', desc_en: 'Crispy fried savory snacks with sauce' },
    { category: 'snacks', name_bn: 'ক্লাব স্যান্ডউইচ ও ফ্রেঞ্চ ফ্রাইজ', name_en: 'Club Sandwich & French Fries', price: '৳ ১৬০', desc_bn: 'চিকেন ও মেয়োনিজ ফিলিং স্যান্ডউইচ সাথে ক্রিস্পি ফ্রাইজ', desc_en: 'Toasted club sandwich served with french fries' },
    { category: 'snacks', name_bn: 'হট ভেজিটেবল সিঙাড়া (২ পিস)', name_en: 'Hot Veg Singara (2 Pcs)', price: '৳ ৪০', desc_bn: 'মচমচে বাদাম ও আলুর মসলাদার পুরভরা সিঙাড়া', desc_en: 'Traditional Bengali crispy potato stuffed pastry' },
    { category: 'snacks', name_bn: 'বেকড পেস্ট্রি ও চকোলেট কেক', name_en: 'Bakery Pastry & Chocolate Cake', price: '৳ ১৪০', desc_bn: 'তাজা বেকড পেস্ট্রি স্লাইস ও ডেজার্ট', desc_en: 'Freshly baked delicious cake slice' }
  ];

  const menuItems = (pageData.menu_items && pageData.menu_items.length > 0)
    ? pageData.menu_items
    : defaultMenuItems;

  const filteredMenuItems = selectedMenuCategory === 'all'
    ? menuItems
    : menuItems.filter((item: any) => item.category === selectedMenuCategory);

  // Submit Event Booking Inquiry
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      setFormError(isBn ? 'অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর লিখুন।' : 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await cpanelApi.addDoc('inquiries', {
        type: 'cafe_booking',
        name: guestName.trim(),
        phone: guestPhone.trim(),
        institution: eventType.trim(),
        message: `ইভেন্ট তারিখ: ${eventDate || 'উল্লেখ নেই'}, সম্ভাব্য উপস্থিতি: ${guestCount || 'উল্লেখ নেই'}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSubmittedSuccess(true);
      setGuestName('');
      setGuestPhone('');
      setEventType('');
      setEventDate('');
      setGuestCount('');
      setTimeout(() => setSubmittedSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting query:", err);
      setFormError(isBn ? 'তথ্য পাঠানো সম্ভব হয়নি, পরে চেষ্টা করুন।' : 'Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleText = isBn
    ? (pageData.title_bn || 'ক্যাফেটেরিয়া, মুক্তমঞ্চ ও ছাদবাগান')
    : (pageData.title_en || 'BSK Rooftop Cafe, Garden & Open Stage');

  const subtitleText = isBn
    ? (pageData.subtitle_bn || pageData.about_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবনের ১০ম তলায় অবস্থিত মনোরম ক্যাফেটেরিয়া ও ছাদবাগান। বইয়ের সবুজ জগতে বা সংস্কৃতিচর্চার ফাঁকে কিছুটা সময় প্রশান্তিতে কাটানোর জন্য এটি এক অপূর্ব পরিবেশ। মুক্ত বাতাস, দৃষ্টিনন্দন ছাদবাগান এবং ঢাকার আকাশ উপভোগের চমৎকার সুবিধার সাথে এখানে পাওয়া যায় উন্নতমানের স্বাস্থ্যকর চা, কফি ও নাশতা।')
    : (pageData.subtitle_en || pageData.about_en || 'Located on the 10th floor rooftop of the BSK building. An open-air cafeteria adorned with lush greenery, providing readers and visitors a serene environment for tea, brewed coffee, light refreshments, and cultural conversations.');

  return (
    <div className="w-full text-[#1A1207] space-y-12 animate-fade-in font-sans text-left pb-12">
      
      {/* ── 1. HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1A1207] text-[#FAF7F2] border border-[#B8862A]/30 shadow-2xl p-6 sm:p-10 md:p-14">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8862A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2E5942]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8862A]/20 border border-[#B8862A]/40 text-[#F0CC7A] text-xs font-bold font-sans tracking-wide uppercase">
            <Coffee className="w-4 h-4 text-[#F0CC7A]" />
            <span>{isBn ? (pageData.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন • ১০ম তলা | মনোরম ছাদবাগান ও ক্যাফে') : (pageData.badge_en || 'BSK Building • 10th Floor | Rooftop Garden & Cafe')}</span>
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
                <span className="text-white font-bold">{isBn ? '১০ম তলা (ছাদবাগান)' : '10th Floor Rooftop'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'সময়সূচি' : 'Timings'}</span>
                <span className="text-white font-bold">{isBn ? 'দুপুর ১২টা - রাত ৯টা' : 'Daily 12 PM - 9 PM'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Leaf className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'পরিবেশ' : 'Ambiance'}</span>
                <span className="text-white font-bold">{isBn ? 'সবুজ বাগান ও মুক্তমঞ্চ' : 'Garden & Open Stage'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-xs rounded-xl p-3 flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#F0CC7A] shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-stone-400 block">{isBn ? 'তথ্য ও অনুসন্ধান' : 'Inquiries'}</span>
                <span className="text-white font-bold font-mono">+৮৮০ ২-৯৬৬০৮১২</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#menu"
              className="inline-flex items-center gap-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>{isBn ? 'ক্যাফে মেনু ও খাবার তালিকা' : 'View Food & Drinks Menu'}</span>
            </a>
            <a 
              href="#booking"
              className="inline-flex items-center gap-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{isBn ? 'আড্ডা ও অনুষ্ঠান বুকিং' : 'Book for Adda / Gathering'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. 4 CORE HIGHLIGHTS & PERKS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            valBn: 'মনোরম ছাদবাগান',
            valEn: 'Rooftop Garden',
            lblBn: 'প্রাকৃতিক আলো-বাতাস ও সবুজ গাছপালা',
            lblEn: 'Open Air Lush Greenery',
            subBn: 'ঢাকার কোলাহলমুক্ত স্নিগ্ধ পরিবেশ',
            subEn: 'Peaceful escape in central Dhaka',
            icon: Leaf,
            color: 'bg-[#E6F4EA] text-[#137333]'
          },
          {
            valBn: 'তাজা ব্রুড কফি ও চা',
            valEn: 'Brewed Coffee & Tea',
            lblBn: 'স্পেশাল মালাই চা ও ক্যাপুচিনো',
            lblEn: 'Special Malai Tea & Espresso',
            subBn: 'উচ্চমানের তাজা উপাদানে তৈরি',
            subEn: 'Premium roasted beans & rich tea',
            icon: Coffee,
            color: 'bg-[#F7EFE5] text-[#8C6212]'
          },
          {
            valBn: 'সাংস্কৃতিক মুক্তমঞ্চ',
            valEn: 'Cultural Open Stage',
            lblBn: 'সাহিত্য আড্ডা ও সান্ধ্যকালীন আসর',
            lblEn: 'Literary & Artistic Gathering',
            subBn: 'বুক ক্লাব ও সৃষ্টিশীল আলোচনা',
            subEn: 'Book discussions & poetry sessions',
            icon: Music,
            color: 'bg-[#E8F0FE] text-[#1A73E8]'
          },
          {
            valBn: 'ইনডোর ও আউটডোর',
            valEn: 'Dual Seating Lounge',
            lblBn: 'আরামদায়ক বসার সুব্যবস্থা',
            lblEn: 'Comfortable Ambiance',
            subBn: 'রোদ-বৃষ্টিমুক্ত ক্যাফে কর্নার',
            subEn: 'Weather-safe dining space',
            icon: Wind,
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
                <span className="font-serif text-base md:text-lg font-extrabold text-[#1A1207] block leading-snug">
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

      {/* ── 3. AMBIANCE & EXPERIENCE CARDS ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8DDD0] shadow-xs space-y-6">
        <div className="border-b border-[#E8DDD0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B8862A]" />
              <span>{isBn ? 'ক্যাফেটেরিয়ার বৈশিষ্ট্য ও পরিবেশ' : 'Rooftop Ambiance & Experience'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              {isBn ? 'বইপড়ার ফাঁকে কফির কাপে আড্ডা ও ঢাকার আকাশ উপভোগের মনোরম অভিজ্ঞতা।' : 'Unwind with literature, refreshing beverages and open skies.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              titleBn: 'উন্মুক্ত রুফটপ ও সবুজ ছাদবাগান',
              titleEn: 'Open-Air Rooftop Garden',
              descBn: 'ঢাকার ব্যস্ত শহরের মাঝে মনোরম প্রাকৃতিক আলো-বাতাস ও সবুজ উদ্ভিদে ঘেরা শান্ত পরিবেশ। মুক্ত আকাশের নিচে চা পানের অপূর্ব অনুভূতি।',
              descEn: 'A peaceful rooftop sanctuary adorned with vibrant tropical plants and refreshing breeze.',
              icon: Leaf
            },
            {
              titleBn: 'পাঠক, শিল্পী ও সংস্কৃতিকর্মীদের আড্ডাস্থল',
              titleEn: 'Cultural Adda & Reader Haven',
              descBn: 'পাঠক, তরুণ শিক্ষার্থী, শিল্পী ও সাহিত্যপ্রেমীদের বুদ্ধিভিত্তিক আলোচনা, কবিতা পাঠ ও সামাজিক মেলবন্ধনের অন্যতম জনপ্রিয় স্থান।',
              descEn: 'The favorite cultural hub for writers, artists, and thoughtful youth.',
              icon: HeartHandshake
            },
            {
              titleBn: 'স্বাস্থ্যকর নাশতা, স্ন্যাক্স ও বেভারেজ',
              titleEn: 'Hygienic Refreshments & Snacks',
              descBn: 'উন্নতমানের চা, কফি, জুস ও পরিচ্ছন্ন পরিবেশে প্রস্তুতকৃত মানসম্পন্ন হালকা জলখাবার, স্যান্ডউইচ ও বেকারি কেক।',
              descEn: 'Freshly brewed coffees, herbal infusions, and clean, delicious light snacks.',
              icon: Utensils
            },
            {
              titleBn: 'নান্দনিক ইনডোর ও আউটডোর ব্যালকনি সিটিং',
              titleEn: 'Aesthetic Indoor & Outdoor Seating',
              descBn: 'বৃষ্টি ও রোদ থেকে সুরক্ষিত ইনডোর ডায়নিং এবং উন্মুক্ত আকাশ দেখার ব্যালকনি সিটিং সমন্বিত রুচিশীল পরিবেশ।',
              descEn: 'Cozy indoor dining coupled with panoramic balcony seating.',
              icon: Sun
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] transition duration-300 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl text-[#B8862A] border border-stone-200 shrink-0 shadow-xs">
                  <Icon className="w-5 h-5 text-[#B8862A]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-sm text-[#1A1207]">{isBn ? item.titleBn : item.titleEn}</h3>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">{isBn ? item.descBn : item.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. CATEGORIZED FOOD & BEVERAGES MENU ── */}
      <div id="menu" className="space-y-6">
        <div className="border-b border-[#E8DDD0] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#B8862A]" />
              <span>{isBn ? 'জনপ্রিয় ফুড ও ড্রিংকস মেনু' : 'Food & Beverages Menu'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isBn ? 'সতেজ ও মানসম্মত উপাদানে প্রস্তুতকৃত চা, কফি, পানীয় ও হালকা জলখাবার।' : 'Freshly crafted hot teas, brewed coffees, cold refreshers, and snacks.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0] text-xs font-bold select-none">
            {[
              { id: 'all', labelBn: 'সকল আইটেম', labelEn: 'All Items' },
              { id: 'hot', labelBn: '☕ গরম চা ও কফি', labelEn: 'Hot Beverages' },
              { id: 'cold', labelBn: '🥤 জুস ও কোল্ড ড্রিংকস', labelEn: 'Cold Drinks' },
              { id: 'snacks', labelBn: '🥐 স্ন্যাক্স ও নাশতা', labelEn: 'Snacks & Bakery' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedMenuCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedMenuCategory === cat.id
                    ? 'bg-[#1A1207] text-[#F0CC7A] shadow-xs'
                    : 'text-stone-700 hover:text-black hover:bg-white/60'
                }`}
              >
                {isBn ? cat.labelBn : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems.map((item: any, idx: number) => (
            <div 
              key={idx}
              className="p-5 bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif font-bold text-sm text-[#1A1207] leading-snug">
                    {isBn ? (item.name_bn || item.name) : (item.name_en || item.name_bn || item.name)}
                  </h3>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] text-[#8C6212] font-mono font-bold text-xs rounded-lg border border-[#B8862A]/20 shrink-0">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  {isBn ? (item.desc_bn || item.desc) : (item.desc_en || item.desc_bn || item.desc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. PHOTO GALLERY & ROOFTOP SHOWCASE ── */}
      <div className="space-y-6">
        <div className="border-b border-[#E8DDD0] pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#B8862A]" />
              <span>{isBn ? 'ক্যাফেটেরিয়া ও ছাদবাগান আলোকচিত্র' : 'Rooftop Cafe & Garden Photo Gallery'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isBn ? 'ছাদবাগান, ওপেন ক্যাফে এবং সাংস্কৃতিক আসরের মনোরম দৃশ্য।' : 'Moments and visual highlights from our 10th floor rooftop.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cafeGallery.map((img: any, idx: number) => (
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

      {/* ── 6. INQUIRIES & ADDA BOOKING FORM ── */}
      <div id="booking" className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#E8DDD0] shadow-sm space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="inline-flex p-3 bg-[#B8862A]/10 text-[#8C6212] rounded-2xl mb-1">
            <Calendar className="w-6 h-6 text-[#B8862A]" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207]">
            {isBn ? 'সাহিত্য আড্ডা ও ছোট আয়োজন অনুসন্ধান' : 'Gathering & Event Inquiries'}
          </h2>
          <p className="text-xs md:text-sm text-stone-600 font-sans leading-relaxed">
            {isBn 
              ? 'বুক ক্লাব মিটআপ, সাহিত্য আড্ডা বা ঘরোয়া সাংস্কৃতিক আয়োজনের জন্য ক্যাফে কর্নার ও মুক্তমঞ্চের বুকিং তথ্য জানতে যোগাযোগ করুন।' 
              : 'Submit an inquiry for book club meetups, intimate gatherings, or cultural discussions at our rooftop cafe.'}
          </p>
        </div>

        <form onSubmit={handleSubmitBooking} className="max-w-xl mx-auto space-y-4 pt-2">
          {submittedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isBn ? 'আপনার অনুরোধ সফলভাবে গৃহীত হয়েছে! দ্রুত যোগাযোগ করা হবে।' : 'Your inquiry submitted successfully!'}</span>
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
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={isBn ? 'নাম লিখুন' : 'Enter name'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}</label>
              <input 
                type="tel" 
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder={isBn ? '০১৭XXXXXXXX' : 'Phone number'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#B8862A]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'আয়োজনের ধরণ' : 'Event / Gathering Type'}</label>
              <input 
                type="text" 
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder={isBn ? 'e.g. সাহিত্য আড্ডা / রিডিং ক্লাব' : 'e.g. Book Club / Discussion'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">{isBn ? 'সম্ভাব্য তারিখ ও অতিথি সংখ্যা' : 'Tentative Date & Guests'}</label>
              <input 
                type="text" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder={isBn ? 'e.g. ১৫ই সেপ্টেম্বর, ২০ জন' : 'e.g. 15 Sept, 20 Guests'}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#B8862A]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#B8862A] hover:bg-[#9A6D1F] text-white text-xs md:text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? (isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (isBn ? 'অনুসন্ধান পাঠান' : 'Submit Inquiry')}</span>
            </button>
            <a 
              href="tel:+88029660812"
              className="px-6 py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs md:text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{isBn ? 'সরাসরি ফোন' : 'Call Desk'}</span>
            </a>
          </div>
        </form>
      </div>

    </div>
  );
};
