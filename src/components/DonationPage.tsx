import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Gift, 
  Building, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  Send, 
  ArrowLeft, 
  PhoneCall, 
  Mail, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  Sparkles,
  Award,
  Globe
} from 'lucide-react';
import { Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultDonationData } from '../data/specializedPagesDefaults';

interface DonationPageProps {
  language: Language;
  onNavigate: (tabId: string) => void;
}

export const DonationPage: React.FC<DonationPageProps> = ({ language, onNavigate }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationCategory, setDonationCategory] = useState<string>('mobile-library');
  const [paymentMethod, setPaymentMethod] = useState<'mfs' | 'bank' | 'cheque'>('mfs');
  const [copiedBankAcc, setCopiedBankAcc] = useState<boolean>(false);
  const [copiedBkash, setCopiedBkash] = useState<boolean>(false);

  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await cpanelApi.getDoc('website_pages', 'donation');
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

  const pageData = { ...defaultDonationData, ...dbPageData };

  // Form states
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const amounts = [500, 1000, 2500, 5000, 10000];

  const handleCopy = (text: string, type: 'bank' | 'mfs') => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBankAcc(true);
      setTimeout(() => setCopiedBankAcc(false), 2000);
    } else {
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const effectiveAmount = selectedAmount === 'custom' ? customAmount : selectedAmount;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in text-left">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center space-x-2 text-stone-600 hover:text-[#B8862A] text-xs md:text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Dashboard'}</span>
        </button>
        <span className="text-xs font-mono text-[#B8862A] bg-[#B8862A]/10 px-3 py-1 rounded-full font-bold">
          {language === 'bn' ? 'স্বচ্ছ ও সামাজিক উন্নয়ন基金' : 'Transparent Non-Profit Support'}
        </span>
      </div>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1C3E2D] via-[#2A543D] to-[#122A1E] p-8 md:p-12 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-[#B8862A]/90 text-[#FAF7F2] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'bn' ? 'সহযোগিতা ও অনুদান' : 'Support & Donation'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FAF7F2] leading-tight">
            {language === 'bn'
              ? 'আলোকিত মানুষ গড়ার মহতী যাত্রায় আপনার হাত বাড়িয়ে দিন'
              : 'Empower the Journey of Building Enlightened Souls'}
          </h1>
          <p className="text-stone-200 text-sm md:text-base leading-relaxed font-sans pt-1">
            {language === 'bn'
              ? 'বিগত চার দশকেরও বেশি সময় ধরে বিশ্বসাহিত্য কেন্দ্র দেশব্যাপী বই পড়ার আলো ছড়িয়ে দিচ্ছে। আপনার প্রতিটি অনুদান একজন শিশুর হাতে নতুন বই তুলে দিতে এবং প্রত্যন্ত অঞ্চলে ভ্রাম্যমাণ লাইব্রেরির চাকা সচল রাখতে সরাসরি সাহায্য করে।'
              : 'For over four decades, Bishwo Shahitto Kendro has been igniting the passion for reading across Bangladesh. Your generous support directly funds mobile libraries, free book distribution to rural students, and cultural enlightenment programs.'}
          </p>
        </div>
      </div>

      {/* Impact Numbers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-5 rounded-2xl space-y-1">
          <BookOpen className="w-6 h-6 text-[#B8862A]" />
          <p className="text-2xl font-serif font-extrabold text-[#1A1207] pt-2">১.২ কোটি+</p>
          <p className="text-xs text-stone-600 font-sans">{language === 'bn' ? 'শিক্ষার্থীদের সংবর্ধিত ও বই প্রদান' : 'Books Circulated to Students'}</p>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-5 rounded-2xl space-y-1">
          <Globe className="w-6 h-6 text-[#B8862A]" />
          <p className="text-2xl font-serif font-extrabold text-[#1A1207] pt-2">১৫,০০০+</p>
          <p className="text-xs text-stone-600 font-sans">{language === 'bn' ? 'স্কুল, কলেজ ও ক্লাব সংযোগ' : 'Partner Schools & Colleges'}</p>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-5 rounded-2xl space-y-1">
          <Sparkles className="w-6 h-6 text-[#B8862A]" />
          <p className="text-2xl font-serif font-extrabold text-[#1A1207] pt-2">৭৬টি</p>
          <p className="text-xs text-stone-600 font-sans">{language === 'bn' ? 'সক্রিয় ভ্রাম্যমাণ লাইব্রেরি যান' : 'Active Mobile Library Units'}</p>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E8DDD0] p-5 rounded-2xl space-y-1">
          <Award className="w-6 h-6 text-[#B8862A]" />
          <p className="text-2xl font-serif font-extrabold text-[#1A1207] pt-2">১০০%</p>
          <p className="text-xs text-stone-600 font-sans">{language === 'bn' ? 'স্বচ্ছতা ও সামাজিক প্রভাব' : 'Audited Non-Profit Impact'}</p>
        </div>
      </div>

      {/* Main Donation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column (Interactive Donation Builder) */}
        <div className="lg:col-span-7 bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#1A1207]">
                {language === 'bn' ? 'আপনার অনুদানের জন্য আন্তরিক ধন্যবাদ!' : 'Thank You for Your Generous Support!'}
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {language === 'bn'
                  ? `আপনার ৳${effectiveAmount} অনুদানের প্রস্তাবটি নিবন্ধিত হয়েছে। ট্রানজেকশন নম্বর (${trxId || 'N/A'}) যাচাইপূর্বক ধন্যবাদ বার্তা আপনার ইমেইল/মোবাইলে পাঠানো হবে।`
                  : `Your pledge of BDT ${effectiveAmount} has been received. Our account desk will verify the Transaction ID (${trxId || 'N/A'}) and issue an official receipt.`}
              </p>
              <button 
                onClick={() => { setSubmitted(false); setTrxId(''); }}
                className="mt-4 px-6 py-2.5 bg-[#1C3E2D] text-white rounded-xl text-xs font-bold hover:bg-[#2A543D] transition cursor-pointer"
              >
                {language === 'bn' ? 'পুনরায় অনুদান দিন' : 'Make Another Donation'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1207] flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '১. অনুদানের পরিমাণ নির্বাচন করুন' : '1. Select Donation Amount'}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'bn' ? 'আপনি ইচ্ছামতো যেকোনো অংকের অনুদান প্রদান করতে পারেন' : 'Choose a preset or enter a custom amount'}
                </p>

                {/* Amount buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mt-3">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs md:text-sm font-bold transition cursor-pointer ${
                        selectedAmount === amt
                          ? 'border-[#B8862A] bg-[#B8862A]/10 text-[#1A1207] shadow-xs'
                          : 'border-[#E8DDD0] bg-[#FAF7F2] text-stone-700 hover:border-[#B8862A]/50'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAmount('custom')}
                    className={`py-2.5 px-3 rounded-xl border text-xs md:text-sm font-bold transition cursor-pointer ${
                      selectedAmount === 'custom'
                        ? 'border-[#B8862A] bg-[#B8862A]/10 text-[#1A1207] shadow-xs'
                        : 'border-[#E8DDD0] bg-[#FAF7F2] text-stone-700 hover:border-[#B8862A]/50'
                    }`}
                  >
                    {language === 'bn' ? 'অন্যান্য' : 'Custom'}
                  </button>
                </div>

                {selectedAmount === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      required
                      placeholder={language === 'bn' ? 'অনুদানের পরিমাণ লিখুন (টাকায়)' : 'Enter custom amount (BDT)'}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full p-3 border border-[#E8DDD0] rounded-xl text-sm bg-[#FAF7F2] focus:bg-white focus:border-[#B8862A] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Purpose/Category */}
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1207] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '২. অনুদানের খাত / উদ্দেশ্য' : '2. Purpose of Donation'}</span>
                </h2>
                <select
                  value={donationCategory}
                  onChange={(e) => setDonationCategory(e.target.value)}
                  className="w-full mt-2 p-3 border border-[#E8DDD0] rounded-xl text-xs md:text-sm bg-[#FAF7F2] text-[#1A1207] focus:outline-none focus:border-[#B8862A]"
                >
                  <option value="mobile-library">{language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরিতে নতুন বই ক্রয় ও রিফুয়েলিং' : 'Mobile Library Book Purchasing & Refueling'}</option>
                  <option value="reading-prizes">{language === 'bn' ? 'স্কুল-কলেজ শিক্ষার্থীদের বইপড়া পুরস্কার ও সংবর্ধনা' : 'School Reading Contest Prizes & Medals'}</option>
                  <option value="central-library">{language === 'bn' ? 'কেন্দ্রীয় পাঠাগারের দুর্লভ বই ও ডিজিটাল আর্কাইভ সংরক্ষণ' : 'Central Library Rare Books Preservation'}</option>
                  <option value="general-fund">{language === 'bn' ? 'সাধারণ সামাজিক অনুদান ফান্ড (জেনারেল ফান্ড)' : 'General Non-Profit Development Fund'}</option>
                </select>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1207] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '৩. মূল্য পরিশোধের মাধ্যম' : '3. Select Payment Method'}</span>
                </h2>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mfs')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'mfs'
                        ? 'border-[#B8862A] bg-[#B8862A]/10 text-[#1A1207]'
                        : 'border-[#E8DDD0] bg-[#FAF7F2] text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#B8862A]" />
                    <span className="text-xs font-bold">{language === 'bn' ? 'বিকাশ / নগদ / রকেট' : 'mFS (bkash/Nagad)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'bank'
                        ? 'border-[#B8862A] bg-[#B8862A]/10 text-[#1A1207]'
                        : 'border-[#E8DDD0] bg-[#FAF7F2] text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Building className="w-5 h-5 text-[#B8862A]" />
                    <span className="text-xs font-bold">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cheque')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'cheque'
                        ? 'border-[#B8862A] bg-[#B8862A]/10 text-[#1A1207]'
                        : 'border-[#E8DDD0] bg-[#FAF7F2] text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-[#B8862A]" />
                    <span className="text-xs font-bold">{language === 'bn' ? 'চেক / পে-অর্ডার' : 'Cheque / Pay Order'}</span>
                  </button>
                </div>

                {/* Details box based on method */}
                <div className="mt-4 p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-2xl text-xs text-stone-700 space-y-2">
                  {paymentMethod === 'mfs' && (
                    <div className="space-y-2">
                      <p className="font-bold text-[#1A1207]">
                        {language === 'bn' ? 'বিকাশ / নগদ / রকেট মার্চেন্ট নম্বর:' : 'mFS Merchant Account Number:'}
                      </p>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E8DDD0] font-mono text-sm font-bold text-[#B8862A]">
                        <span>01711-223344 (Marchant)</span>
                        <button
                          type="button"
                          onClick={() => handleCopy('01711223344', 'mfs')}
                          className="px-2.5 py-1 bg-[#B8862A]/10 text-[#B8862A] rounded-md text-xs hover:bg-[#B8862A]/20 transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBkash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBkash ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-normal">
                        {language === 'bn' 
                          ? '* বিকাশ/নগদ অ্যাপের "Make Payment" অথবা "Send Money" সুবিধা ব্যবহার করে ট্রানজেকশন সম্পন্ন করার পর ট্রানজেকশন আইডিটি নিচে পূরণ করুন।'
                          : '* Use bkash/Nagad Make Payment or Send Money option, then enter the Transaction ID below.'}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="space-y-1.5">
                      <p className="font-bold text-[#1A1207]">{language === 'bn' ? 'ব্যাংক হিসাব বিবরণী:' : 'Bank Account Details:'}</p>
                      <div className="bg-white p-3 rounded-xl border border-[#E8DDD0] space-y-1 font-mono text-[11.5px]">
                        <p><strong className="font-sans font-semibold text-stone-900">Account Name:</strong> Bishwo Shahitto Kendro</p>
                        <p><strong className="font-sans font-semibold text-stone-900">Account No:</strong> 01221010004561</p>
                        <p><strong className="font-sans font-semibold text-stone-900">Bank:</strong> Prime Bank Limited</p>
                        <p><strong className="font-sans font-semibold text-stone-900">Branch:</strong> Banglamotor Branch, Dhaka</p>
                        <p><strong className="font-sans font-semibold text-stone-900">Routing No:</strong> 170260485</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('01221010004561', 'bank')}
                        className="mt-1 px-3 py-1 bg-[#B8862A]/10 text-[#B8862A] rounded-md text-xs font-bold hover:bg-[#B8862A]/20 transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBankAcc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBankAcc ? 'একাউন্ট নম্বর কপি হয়েছে' : 'একাউন্ট নম্বর কপি করুন'}</span>
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'cheque' && (
                    <div className="space-y-1">
                      <p className="font-bold text-[#1A1207]">{language === 'bn' ? 'চেক/পে-অর্ডার প্রাপকের নাম:' : 'Cheque / Pay Order Payee Name:'}</p>
                      <p className="bg-white p-2.5 rounded-xl border border-[#E8DDD0] font-bold text-stone-800">
                        "Bishwo Shahitto Kendro"
                      </p>
                      <p className="text-[11px] text-stone-500 pt-1">
                        {language === 'bn'
                          ? 'চেক বা পে-অর্ডার সরাসরি বিশ্বসাহিত্য কেন্দ্র ভবনে (১৪ কাজি নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০) জমা দেওয়া যাবে।'
                          : 'You can deposit cheques directly at HQ: 14 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka-1000.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Donor Information */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xl font-serif font-bold text-[#1A1207] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '৪. আপনার তথ্য প্রদান করুন' : '4. Donor Information'}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter full name'}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID / Ref)' : 'Transaction ID / Ref'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9J87XX45"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#B8862A] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'bn' ? 'কোনো বার্তা বা মন্তব্য (ঐচ্ছিক)' : 'Message or Note (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={language === 'bn' ? 'বিশেষ কোনো বার্তা লিখতে পারেন...' : 'Write any specific note...'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#B8862A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#1C3E2D] hover:bg-[#122A1E] text-[#FAF7F2] font-extrabold text-sm md:text-base rounded-2xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-5 h-5 text-[#B8862A]" />
                <span>
                  {language === 'bn' 
                    ? `৳${effectiveAmount || '০'} অনুদান জমা নিশ্চিত করুন` 
                    : `Confirm BDT ${effectiveAmount || '0'} Donation`}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Column (Trust, Audits, Direct Contact) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E8DDD0] rounded-3xl p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#B8862A] uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'স্বচ্ছতা ও সামাজিক দায়বদ্ধতা' : 'Trust & Transparency'}</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'কেন বিশ্বসাহিত্য কেন্দ্রে অনুদান দেবেন?' : 'Why Donate to Bishwo Shahitto Kendro?'}
              </h3>
            </div>

            <ul className="space-y-3 text-xs md:text-sm text-stone-700 font-sans">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <span>
                  {language === 'bn' 
                    ? 'এনজিও বিষয়কম ব্যুরো নিবন্ধিত (নিবন্ধন নং- ১৩৯) সমাজসেবামূলক অলাভজনক প্রতিষ্ঠান।' 
                    : 'Registered non-profit with NGO Affairs Bureau (Registration No. 139).'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <span>
                  {language === 'bn' 
                    ? 'প্রতিটি আর্থিক বছর শেষে আন্তর্জাতিক মানসম্পন্ন চার্টার্ড একাউন্টেন্টস ফার্ম দ্বারা অডিট নিশ্চিত করা হয়।' 
                    : 'Annual audit guaranteed by reputed Chartered Accountant firms.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <span>
                  {language === 'bn' 
                    ? 'আপনার প্রদত্ত অনুদানের অর্থ সরাসরি প্রান্তিক শিক্ষার্থীদের বিনামূল্যে বই প্রদান ও পাঠাভ্যাস গঠনে ব্যবহৃত হয়।' 
                    : '100% of contributions directly support book purchasing & youth reading programs.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Support Contact */}
          <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 space-y-4">
            <h4 className="font-serif font-bold text-base text-[#1A1207]">
              {language === 'bn' ? 'অনুদানের ব্যাপারে কোনো প্রশ্ন বা তথ্য জানতে:' : 'For Donation Enquiries:'}
            </h4>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-center gap-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0]">
                <PhoneCall className="w-4 h-4 text-[#B8862A] shrink-0" />
                <div>
                  <p className="font-semibold">{language === 'bn' ? 'অনুদানের হেল্পলাইন:' : 'Donation Helpline:'}</p>
                  <p className="font-mono text-stone-900 font-bold">02-9660235, 01711-223344</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0]">
                <Mail className="w-4 h-4 text-[#B8862A] shrink-0" />
                <div>
                  <p className="font-semibold">{language === 'bn' ? 'ইমেইল যোগাযোগ:' : 'Email Support:'}</p>
                  <p className="font-mono text-stone-900 font-bold">donate@bskbd.org</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
