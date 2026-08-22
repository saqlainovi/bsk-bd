import React, { useState } from 'react';
import { 
  Coffee, Utensils, Clock, MapPin, Sparkles, CheckCircle2, 
  Image as ImageIcon, Eye, X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ParsedPage, Language } from '../types';
import { normalizeImageUrl } from './imageUtils';

interface CafePageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto?: (url: string) => void;
  setActivePhotoIndex?: (i: number) => void;
  setActiveAlbumPhotos?: (urls: string[]) => void;
}

export const CafePage: React.FC<CafePageProps> = ({
  language,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos
}) => {
  const isBn = language === 'bn';
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Cafeteria Photo Gallery
  const cafeGallery = [
    {
      url: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      captionBn: "বিশ্বসাহিত্য কেন্দ্র ভবনের ছাদ সংলগ্ন উন্মুক্ত ক্যাফেটেরিয়া",
      captionEn: "Open Air Rooftop Cafeteria at BSK Building"
    },
    {
      url: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
      captionBn: "সবুজ বাগান ও প্রাকৃতিক আলো-বাতাসপূর্ণ চমৎকার বসার ব্যবস্থা",
      captionEn: "Lush Greenery & Scenic Outdoor Seating"
    },
    {
      url: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
      captionBn: "পাঠক ও দর্শনার্থীদের সান্ধ্যকালীন আড্ডা ও চা-চক্রের পরিবেশ",
      captionEn: "Cosy Refreshment & Evening Adda Space"
    },
    {
      url: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
      captionBn: "পরিচ্ছন্ন ও নান্দনিক ইনডোর সিটিং এরিয়া",
      captionEn: "Clean and Aesthetic Indoor Dining Seating"
    }
  ];

  const openImageModal = (url: string, index: number) => {
    if (setActivePhoto && setActiveAlbumPhotos) {
      setActiveAlbumPhotos(cafeGallery.map(g => g.url));
      if (setActivePhotoIndex) setActivePhotoIndex(index);
      setActivePhoto(url);
    } else {
      setActiveImageModal(url);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] text-[#140E06] space-y-8 py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto">
      
      {/* --- 1. HEADER BANNER --- */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2E5942] text-white p-6 sm:p-8 md:p-10 shadow-md">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8862A]/20 border border-[#D4A84B]/40 text-[#F0CC7A] text-xs font-semibold">
            <Coffee className="w-3.5 h-3.5 text-[#F0CC7A]" />
            <span>{isBn ? 'বিশ্বসাহিত্য কেন্দ্র ভবন • ১০ম তলা (রুফটপ)' : 'BSK Building • 10th Floor Rooftop'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FAF7F2] font-serif tracking-tight">
            {isBn ? 'ক্যাফেটেরিয়া' : 'BSK Cafeteria'}
          </h1>

          <p className="text-sm sm:text-base text-[#E8DDD0] leading-relaxed text-justify max-w-3xl">
            {isBn 
              ? 'বিশ্বসাহিত্য কেন্দ্র ভবনের ১০ম তলায় অবস্থিত মনোরম ক্যাফেটেরিয়া ও ছাদবাগান। বইয়ের সবুজ জগতে বা সংস্কৃতিচর্চার ফাঁকে কিছুটা সময় প্রশান্তিতে কাটানোর জন্য এটি এক অপূর্ব পরিবেশ। প্রকাশ্য মনোরম বাতাস, দৃষ্টিনন্দন ছাদবাগান এবং ঢাকার আকাশ উপভোগের চমৎকার সুবিধার সাথে এখানে পাওয়া যায় উন্নতমানের স্বাস্থ্যকর হালকা নাশতা, চা ও কফি।'
              : 'Located on the 10th floor rooftop of BSK complex. An open-air cafeteria adorned with lush greenery, providing readers and visitors a serene environment for tea, coffee, light refreshments and cultural conversations.'}
          </p>
        </div>
      </div>

      {/* --- 2. ENVIRONMENT & HIGHLIGHTS --- */}
      <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DDD0] space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-[#140E06] font-serif flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#B8862A]" />
          <span>{isBn ? 'ক্যাফেটেরিয়ার বৈশিষ্ট্য ও পরিবেশ' : 'Cafeteria Highlights & Ambiance'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#2B1E0E] leading-relaxed">
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E8DDD0]">
            <CheckCircle2 className="w-5 h-5 text-[#2E5942] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#140E06] mb-0.5">
                {isBn ? 'উন্মুক্ত রুফটপ ও ছাদবাগান' : 'Open-Air Rooftop Garden'}
              </strong>
              <p className="text-xs text-[#4A3824]">
                {isBn ? 'ঢাকার ব্যস্ত শহরের মাঝে মনোরম প্রাকৃতিক আলো-বাতাস ও সবুজ উদ্ভিদে ঘেরা শান্ত পরিবেশ।' : 'Peaceful rooftop setting with open sky and vibrant plant decor in central Dhaka.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E8DDD0]">
            <CheckCircle2 className="w-5 h-5 text-[#2E5942] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#140E06] mb-0.5">
                {isBn ? 'পাঠক ও সংস্কৃতিকর্মীদের আড্ডাস্থল' : 'Cultural Adda & Reader Haven'}
              </strong>
              <p className="text-xs text-[#4A3824]">
                {isBn ? 'পাঠক, তরুণ শিক্ষার্থী, শিল্পী ও সাহিত্যপ্রেমীদের বুদ্ধিভিত্তিক আলোচনা ও সামাজিক মেলবন্ধন।' : 'Favored gathering spot for readers, students, artists, and literary enthusiasts.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E8DDD0]">
            <CheckCircle2 className="w-5 h-5 text-[#2E5942] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#140E06] mb-0.5">
                {isBn ? 'স্বাস্থ্যকর নাশতা ও পানীয়' : 'Hygienic Refreshments'}
              </strong>
              <p className="text-xs text-[#4A3824]">
                {isBn ? 'উন্নতমানের চা, কফি, জুস ও পরিচ্ছন্ন পরিবেশে প্রস্তুতকৃত মানসম্পন্ন হালকা জলখাবার।' : 'Quality tea, espresso coffee, fresh juices, and hygienically prepared light snacks.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E8DDD0]">
            <CheckCircle2 className="w-5 h-5 text-[#2E5942] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#140E06] mb-0.5">
                {isBn ? 'নান্দনিক ইনডোর ও আউটডোর বসার সুবিধা' : 'Aesthetic Indoor & Outdoor Seating'}
              </strong>
              <p className="text-xs text-[#4A3824]">
                {isBn ? 'বৃষ্টি ও রোদ থেকে সুরক্ষিত ইনডোর ডায়নিং এবং উন্মুক্ত আকাশ দেখার ব্যালকনি সিটিং।' : 'Weather-safe indoor dining along with scenic balcony seating.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. PHOTO GALLERY --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#2E5942]" />
          <span>{isBn ? 'ক্যাফেটেরিয়ার আলোকচিত্র' : 'Cafeteria Photo Gallery'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {cafeGallery.map((img, idx) => (
            <div
              key={idx}
              onClick={() => openImageModal(img.url, idx)}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DDD0] cursor-pointer hover:shadow-md transition-all"
            >
              <img
                src={normalizeImageUrl(img.url)}
                alt={img.captionBn}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target && !target.src.includes('logo_bn2.png')) {
                    target.src = 'https://bskbd.org/assets/img/logo_bn2.png';
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center text-white text-xs">
                <div className="space-y-1">
                  <Eye className="w-5 h-5 mx-auto" />
                  <p className="text-[11px] font-medium leading-tight">{isBn ? img.captionBn : img.captionEn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. LOCATION & TIMING INFO BOX --- */}
      <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#B8862A]/30 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#B8862A]" />
          <span>{isBn ? 'অবস্থান ও সময়সূচী' : 'Location & Operating Hours'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#2B1E0E]">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
              <div>
                <strong>{isBn ? 'ঠিকানা:' : 'Location:'}</strong>
                <p className="text-[#4A3824]">
                  {isBn 
                    ? 'বিশ্বসাহিত্য কেন্দ্র ভবন (১০ম তলা / রুফটপ), ১৭ ময়মনসিংহ রোড, বাংলামটর, ঢাকা ১০০০।' 
                    : '10th Floor (Rooftop), BSK Building, 17 Mymensingh Road, Banglamotor, Dhaka 1000.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
              <div>
                <strong>{isBn ? 'খোলা থাকার সময়সূচী:' : 'Operating Hours:'}</strong>
                <p className="text-[#4A3824]">
                  {isBn ? 'প্রতিদিন দুপুর ১২:০০ টা থেকে রাত ৮:৩০ টা পর্যন্ত (সাপ্তাহিক ছুটির দিন সহ খোলা)।' : 'Open daily from 12:00 PM to 8:30 PM (including weekends).' }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeImageModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden p-2">
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={activeImageModal}
                alt="Cafeteria photo"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
