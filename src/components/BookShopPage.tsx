import React, { useState } from 'react';
import { 
  Store, BookOpen, MapPin, Phone, Mail, Clock, FileText, Download, 
  Eye, CheckCircle2, Send, Image as ImageIcon, X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ParsedPage, Language } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeImageUrl } from './imageUtils';

interface BookShopPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto?: (url: string) => void;
  setActivePhotoIndex?: (i: number) => void;
  setActiveAlbumPhotos?: (urls: string[]) => void;
}

export const BookShopPage: React.FC<BookShopPageProps> = ({
  language,
  setActivePhoto,
  setActivePhotoIndex,
  setActiveAlbumPhotos
}) => {
  const isBn = language === 'bn';

  // Contact / Inquiry Form state
  const [inquirerName, setInquirerName] = useState('');
  const [inquirerPhone, setInquirerPhone] = useState('');
  const [bookInterest, setBookInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected Image Lightbox state
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Downloadable Catalogs (from bskbd.org/bookshop)
  const catalogs = [
    {
      id: 'cat-bsk-2023',
      titleBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনীর বইয়ের তালিকা (ক্যাটালগ-২০২৩)',
      titleEn: 'BSK Publications Catalog (2023)',
      fileSizeBn: '৩.৮ মেগাবাইট • পিডিএফ',
      fileSizeEn: '3.8 MB • PDF',
      descBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশিত ৫ শতাধিক কালজয়ী ও ধ্রুপদী বইয়ের সম্পূর্ণ ক্যাটালগ ও মূল্যসূচী।',
      descEn: 'Complete catalogue of over 500 BSK published classics with price list.'
    },
    {
      id: 'cat-bd-discount',
      titleBn: 'বিশেষ ছাড়ের বইয়ের মজুদ তালিকা (বাংলাদেশের বিভিন্ন প্রকাশনা)',
      titleEn: 'Special Discount Stock List (Bangladeshi Publishers)',
      fileSizeBn: '২.৫ মেগাবাইট • পিডিএফ',
      fileSizeEn: '2.5 MB • PDF',
      descBn: 'বাংলাদেশের বিভিন্ন স্বনামধন্য প্রকাশনীর বইয়ের ওপর বিশেষ ছাড়ের হালনাগাদ তালিকা।',
      descEn: 'Updated discount stock details of top Bangladeshi publishing houses.'
    },
    {
      id: 'cat-indian-stock',
      titleBn: 'ভারতীয় বিভিন্ন প্রকাশনার বইয়ের মজুদ তালিকা',
      titleEn: 'Indian Publishers Stock List (Kolkata Imports)',
      fileSizeBn: '২.৯ মেগাবাইট • পিডিএফ',
      fileSizeEn: '2.9 MB • PDF',
      descBn: 'আনন্দ পাবলিশার্স, দে’জ পাবলিশিং সহ পশ্চিমবঙ্গের সেরা প্রকাশনার বিক্রয় কেন্দ্রে সংরক্ষিত বইয়ের তালিকা।',
      descEn: 'Curated list of West Bengal literature imported directly from Kolkata.'
    }
  ];

  // Bookstore Gallery Photos
  const galleryImages = [
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
      const inquiriesRef = collection(db, 'inquiries');
      const newDoc = doc(inquiriesRef);
      await setDoc(newDoc, {
        id: newDoc.id,
        type: 'bookshop_query',
        name: inquirerName.trim(),
        phone: inquirerPhone.trim(),
        notes: bookInterest.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSubmittedSuccess(true);
      setInquirerName('');
      setInquirerPhone('');
      setBookInterest('');
      setTimeout(() => setSubmittedSuccess(false), 4000);
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

  return (
    <div className="w-full bg-[#FFFFFF] text-[#140E06] space-y-8 py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto">
      
      {/* --- 1. HEADER BANNER --- */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2E5942] text-white p-6 sm:p-8 md:p-10 shadow-md">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8862A]/20 border border-[#D4A84B]/40 text-[#F0CC7A] text-xs font-semibold">
            <Store className="w-3.5 h-3.5 text-[#F0CC7A]" />
            <span>{isBn ? 'বিশ্বসাহিত্য কেন্দ্র ভবন • ২য় তলা' : 'BSK Building • 2nd Floor'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FAF7F2] font-serif tracking-tight">
            {isBn ? 'বই বিক্রয় কেন্দ্র' : 'Book Shop'}
          </h1>

          <p className="text-sm sm:text-base text-[#E8DDD0] leading-relaxed text-justify max-w-3xl">
            {isBn 
              ? 'বিশ্বসাহিত্য কেন্দ্রের ভবনের ২য় তলায় নিজস্ব বই বিক্রয় কেন্দ্র। বাংলাদেশের প্রায় সবকটি প্রকাশনার বাছাইকৃত শ্রেষ্ঠ বইগুলোর পাশাপাশি পশ্চিম বাংলার সেরা প্রকাশনীর বাছাই করা বাংলা বই এবং ভারত, যুক্তরাজ্য, যুক্তরাষ্ট্র ইত্যাদি দেশে প্রকাশিত উচ্চমানের ইংরেজি বই হ্রাসকৃত মূল্যে বিক্রয়ের জন্য রাখা হয়েছে এখানে। এ ছাড়াও রয়েছে বিশ্বসাহিত্য কেন্দ্র প্রকাশিত বিশ্বসাহিত্য, বাংলা সাহিত্য ও কিশোর সাহিত্যের পাঁচ শতাধিক ধ্রুপদী বই।'
              : 'Located on the 2nd floor of the Bishwo Shahitto Kendro building. Features selected masterpieces from nearly all top Bangladeshi publishers alongside curated Bengali literature from West Bengal and high-quality English books from India, UK, USA at discounted prices, plus over 500 BSK classics.'}
          </p>
        </div>
      </div>

      {/* --- 2. HIGHLIGHTS & FEATURES --- */}
      <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DDD0] space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-[#140E06] font-serif flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2E5942]" />
          <span>{isBn ? 'বই বিক্রয় কেন্দ্রের মূল আকর্ষণ' : 'Bookstore Highlights'}</span>
        </h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#2B1E0E] leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
            <span>{isBn ? 'বিশ্বসাহিত্য কেন্দ্র প্রকাশিত বিশ্বসাহিত্য, বাংলা সাহিত্য ও কিশোর সাহিত্যের ৫০০-র বেশি ধ্রুপদী গ্রন্থের সংগ্রহ।' : 'Over 500 published classics across world literature, Bengali classics, and juvenile literature.'}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
            <span>{isBn ? 'বাংলাদেশের শীর্ষস্থানীয় প্রকাশনীসমূহের নির্বাচিত ও নতুন প্রকাশিত গ্রন্থ।' : 'Selected and newly published books from top Bangladeshi publishers.'}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
            <span>{isBn ? 'আনন্দ পাবলিশার্স, দে’জ পাবলিশিং সহ পশ্চিমবঙ্গের স্বনামধন্য প্রকাশনার বই।' : 'Books from renowned West Bengal publishers including Ananda Publishers and Dey’s Publishing.'}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
            <span>{isBn ? 'পাঠক ও সদস্যদের জন্য বিশেষ ছাড় ও সুলভ মূল্যে বই ক্রয়ের চমৎকার সুবিধা।' : 'Special discounts and affordable pricing for readers and members.'}</span>
          </li>
          <li className="flex items-start gap-2.5 md:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E5942] shrink-0 mt-0.5" />
            <span>{isBn ? 'শীতাতপ নিয়ন্ত্রিত, শান্ত ও নান্দনিক পরিবেশে ঘুরে দেখে বই নির্বাচনের পরিবেশ।' : 'Air-conditioned, quiet and aesthetically designed browsing environment.'}</span>
          </li>
        </ul>
      </div>

      {/* --- 3. DOWNLOADABLE CATALOGS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#B8862A]" />
          <span>{isBn ? 'বইয়ের তালিকা ও ক্যাটালগ' : 'Catalogs & Stock Lists'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalogs.map((cat) => (
            <div 
              key={cat.id}
              className="bg-white rounded-xl p-4 border border-[#E8DDD0] hover:border-[#B8862A] transition-all flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-[#140E06]">
                  {isBn ? cat.titleBn : cat.titleEn}
                </h4>
                <p className="text-xs text-[#4A3824]">
                  {isBn ? cat.descBn : cat.descEn}
                </p>
                <span className="inline-block text-[11px] text-[#8C7662]">
                  {isBn ? cat.fileSizeBn : cat.fileSizeEn}
                </span>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(isBn ? `${cat.titleBn} ডাউনলোড হচ্ছে...` : `Downloading ${cat.titleEn}...`);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#2E5942] hover:bg-[#224331] text-white text-xs font-semibold transition-all mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. PHOTO GALLERY --- */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#2E5942]" />
          <span>{isBn ? 'বই বিক্রয় কেন্দ্রের আলোকচিত্র' : 'Bookstore Photo Gallery'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {galleryImages.map((img, idx) => (
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-[10px]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 5. CONTACT ADDRESS & INQUIRY AT THE VERY BOTTOM (আলোকচিত্রের নিচে) --- */}
      <div className="pt-6 border-t border-[#E8DDD0] space-y-6">
        <h3 className="text-xl font-bold text-[#140E06] font-serif flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#B8862A]" />
          <span>{isBn ? 'যোগাযোগের ঠিকানা ও বার্তা পাঠান' : 'Contact Details & Inquiry'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Address & Info Box */}
          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#B8862A]/30 space-y-4 shadow-xs">
            <h4 className="text-base font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B8862A]" />
              <span>{isBn ? 'যোগাযোগের ঠিকানা' : 'Contact Address'}</span>
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-[#2B1E0E]">
              <div>
                <span className="font-bold block text-[#140E06]">
                  {isBn ? 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা বিভাগ' : 'BSK Publication Division'}
                </span>
                <p className="text-[#4A3824] mt-0.5">
                  {isBn 
                    ? 'বিশ্বসাহিত্য কেন্দ্র ভবনের ২য় তলা, ১৭ ময়মনসিংহ রোড, বাংলামটর, ঢাকা ১০০০।' 
                    : '2nd Floor, BSK Building, 17 Mymensingh Road, Banglamotor, Dhaka 1000.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8DDD0] space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2E5942] shrink-0" />
                  <span><strong>টিঅ্যান্ডটি:</strong> ৯৬৬০৮১২, ৫৮৬১১৯৪০, ৫৮৬১২৩৭৪</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2E5942] shrink-0" />
                  <span><strong>মোবাইল:</strong> ০১৮৩৯৯০৬৭৫৪, ০১৭১২৫৪১২৬৩</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#2E5942] shrink-0" />
                  <span><strong>ই-মেইল:</strong> bskprokashona@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#B8862A] shrink-0" />
                  <span><strong>সময়সূচী:</strong> প্রতিদিন সকাল ১০:০০ - রাত ৮:০০</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact / Book Query Form */}
          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DDD0] space-y-4 shadow-xs">
            <h4 className="text-base font-bold text-[#140E06] font-serif border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#2E5942]" />
              <span>{isBn ? 'বই সম্পর্কিত বার্তা পাঠান' : 'Send Book Query'}</span>
            </h4>

            {submittedSuccess ? (
              <div className="bg-[#2E5942]/10 border border-[#2E5942]/30 rounded-xl p-4 text-center text-xs text-[#2E5942] font-semibold space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-[#2E5942]" />
                <p>{isBn ? 'আপনার তথ্য সফলভাবে জমা হয়েছে। ধন্যবাদ!' : 'Your message was sent successfully. Thank you!'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                {formError && (
                  <p className="text-xs text-[#8B3A1E] font-medium">{formError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#140E06] mb-1">
                      {isBn ? 'আপনার নাম' : 'Your Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquirerName}
                      onChange={(e) => setInquirerName(e.target.value)}
                      placeholder={isBn ? 'যেমন: আবদুর রহিম' : 'e.g. John Doe'}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DDD0] focus:outline-none focus:border-[#2E5942] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#140E06] mb-1">
                      {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquirerPhone}
                      onChange={(e) => setInquirerPhone(e.target.value)}
                      placeholder={isBn ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DDD0] focus:outline-none focus:border-[#2E5942] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#140E06] mb-1">
                    {isBn ? 'বইয়ের নাম / আপনার বার্তা' : 'Book Title / Message'}
                  </label>
                  <textarea
                    rows={2}
                    value={bookInterest}
                    onChange={(e) => setBookInterest(e.target.value)}
                    placeholder={isBn ? 'যে বই বা তথ্যটি জানতে চান...' : 'Mention book name or query...'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DDD0] focus:outline-none focus:border-[#2E5942] bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#2E5942] hover:bg-[#224331] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'বার্তা পাঠান' : 'Submit Query')}
                </button>
              </form>
            )}
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
                alt="Enlarged gallery view"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
