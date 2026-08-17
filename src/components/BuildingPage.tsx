import React, { useState } from 'react';
import { 
  Building2, Landmark, MapPin, Layers, CheckCircle2, 
  Sparkles, Clock, Phone, Mail, ArrowRight, ShieldCheck, 
  Coffee, BookOpen, Tv, Users, Image as ImageIcon, ExternalLink,
  ChevronRight, Calendar
} from 'lucide-react';
import { ParsedPage, Language } from '../types';

interface BuildingPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (route: string) => void;
}

export const BuildingPage: React.FC<BuildingPageProps> = ({ page, language, onNavigate }) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const floorData = [
    {
      floorNo: 0,
      floorBn: 'ভূগর্ভস্থ ও নিচতলা',
      floorEn: 'Ground Floor & Basement',
      titleBn: 'প্রধান অভ্যর্থনা, মূল বইয়ের দোকান ও পার্কিং',
      titleEn: 'Main Reception, Central Bookshop & Parking',
      icon: Landmark,
      featuresBn: [
        'বিশ্বসাহিত্য কেন্দ্র তথ্য ও মূল অভ্যর্থনা কেন্দ্র',
        'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় বিক্রয়কেন্দ্র (দেশ-বিদেশের বিরল বইয়ের সংগ্রহ)',
        'নিরাপদ কার ও মোটরসাইকেল পার্কিং সুবিধা',
        'প্রতিবন্ধী ও প্রবীণদের জন্য হুইলচেয়ার র‍্যাম্প'
      ],
      featuresEn: [
        'Main Information Desk & Central Reception',
        'BSK Flagship Bookshop with curated literature collection',
        'Underground visitor & staff vehicle parking',
        'Wheelchair accessible ramp entrance'
      ],
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80'
    },
    {
      floorNo: 2,
      floorBn: '২য় তলা',
      floorEn: '2nd Floor',
      titleBn: 'প্রধান মিলনায়তন ও গ্যালারি হল',
      titleEn: 'Main Auditoriums (R103 & R101)',
      icon: Users,
      featuresBn: [
        'ইস্তেন্দিয়ার জাহিদ হাসান মিলনায়তন (২০০ আসন, আধুনিক স্টেজ ও সাউন্ডপ্রুফ)',
        'গ্যালারি মিলনায়তন-১০১ (৭১টি ফিক্সড গ্যালারি আসন)',
        'সম্মেলন, বড় সেমিনার, নাটক ও বই উন্মোচনের উপযুক্ত পরিবেশ'
      ],
      featuresEn: [
        'Istendiar Zahid Hasan Auditorium (200 seats, acoustics & stage setup)',
        'Tiered Gallery Auditorium R101 (71 fixed seats)',
        'Ideal for national seminars, symposia, and theatrical readings'
      ],
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'auditorium'
    },
    {
      floorNo: 3,
      floorBn: '৩য় তলা',
      floorEn: '3rd Floor',
      titleBn: 'সাধারণ শ্রেণীকক্ষ ও কর্মশালা রুম',
      titleEn: 'Training Classrooms (R301, 302, 303)',
      icon: BookOpen,
      featuresBn: [
        'শ্রেণীকক্ষ ৩০১, ৩০২ ও ৩০৩ (প্রতিটিতে ৩০ আসন)',
        'শীতাতপ নিয়ন্ত্রিত (AC) ও মাল্টিমিডিয়া প্রজেক্টর সুবিধা',
        'পাঠচক্র, এনজিও ও প্রাতিষ্ঠানিক ট্রেনিং এর জন্য প্রস্তুত'
      ],
      featuresEn: [
        'General Classrooms 301, 302 & 303 (30 seats each)',
        'Air-conditioned options with high-definition projection',
        'Designed for workshops, study circles, and corporate training'
      ],
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'auditorium'
    },
    {
      floorNo: 4,
      floorBn: '৪র্থ তলা',
      floorEn: '4th Floor',
      titleBn: 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় পাঠাগার',
      titleEn: 'BSK Central Library & Reading Room',
      icon: BookOpen,
      featuresBn: [
        'বিশাল পাঠকক্ষ ও উন্মুক্ত বইয়ের র্যাক ব্যবস্থা',
        'দেশী-বিদেশী দুর্লভ বই, গবেষণা পত্রিকা ও সাময়িকী',
        'অনলাইন ক্যাটালগ ও নিরিবিলি অধ্যয়ন পরিবেশ'
      ],
      featuresEn: [
        'Spacious reading hall with open shelf access',
        'Extensive collection of classical literature and journals',
        'Quiet study zone with digital indexing'
      ],
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'central-library'
    },
    {
      floorNo: 5,
      floorBn: '৫ম তলা',
      floorEn: '5th Floor',
      titleBn: 'চিত্রশালা (আর্ট গ্যালারি) ও সাধারণ মিলনায়তন',
      titleEn: 'Art Gallery (R402) & General Hall (R401)',
      icon: ImageIcon,
      featuresBn: [
        'আর্ট গ্যালারি ৪০২ (স্পটলাইট ও চিত্রকর্ম প্রদর্শনী গ্যালারি)',
        'সাধারণ মিলনায়তন ৪০১ (৮০ আসন)',
        'চিত্রকলা, আলোকচিত্র প্রদর্শনী ও সাহিত্য আড্ডার জন্য আদর্শ'
      ],
      featuresEn: [
        'Art Gallery 402 with dynamic track lighting hardware',
        'General Auditorium 401 (80 seats)',
        'Specialized for art exhibitions, photography showcases & discussions'
      ],
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'auditorium'
    },
    {
      floorNo: 6,
      floorBn: '৬ষ্ঠ তলা',
      floorEn: '6th Floor',
      titleBn: 'বিশেষ মিলনায়তন ও অতিরিক্ত সেমিনার হল',
      titleEn: 'Special Auditorium (R505) & Rooms',
      icon: Users,
      featuresBn: [
        'বিশেষ মিলনায়তন ৫০৫ (১০০ আসন, উচ্চমানের আসন ও ডায়াস)',
        'সাধারণ শ্রেণীকক্ষ ৫০৪ (৩০ আসন)',
        'সাংবাদিক সম্মেলন ও প্রাতিষ্ঠানিক সভার প্রিয় স্থান'
      ],
      featuresEn: [
        'Special Auditorium 505 (100 seats with elevated dais)',
        'Classroom 504 (30 seats)',
        'Preferred choice for press conferences & academic symposia'
      ],
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'auditorium'
    },
    {
      floorNo: 7,
      floorBn: '৭ম তলা',
      floorEn: '7th Floor',
      titleBn: 'এক্সিকিউটিভ কনফারেন্স রুম ও ট্রাস্টি কার্যালয়',
      titleEn: 'Executive Boardroom (R605) & Trustee Office',
      icon: Landmark,
      featuresBn: [
        'কনফারেন্স রুম ৬০৫ (২০ আসন কনফারেন্স টেবিল + ৫০ আসন)',
        'বিশ্বসাহিত্য কেন্দ্র ব্যবস্থাপনা ও ট্রাস্টি বোর্ড অফিস',
        'উচ্চমানের করপোরেট মিটিং ও নীতি-নির্ধারণী বৈঠকের জন্য নির্ধারিত'
      ],
      featuresEn: [
        'Executive Conference Room 605 (20 boardroom seats + 50 total)',
        'BSK Executive Management & Trustee Board Offices',
        'Equipped for executive board meetings and policy summits'
      ],
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'auditorium'
    },
    {
      floorNo: 8,
      floorBn: '৮ম তলা',
      floorEn: '8th Floor',
      titleBn: 'আলোর পাঠশালা ও অডিও-ভিজ্যুয়াল কার্যক্রম',
      titleEn: 'Aalor Ishkool & Media Studio',
      icon: Tv,
      featuresBn: [
        'আলোর পাঠশালা কার্যক্রম পরিচালনা কেন্দ্র',
        'ডিজিটাল কন্টেন্ট রেকর্ডিং ও মাল্টিমিডিয়া স্টুডিও',
        'দেশব্যাপী আলোকিত মানুষ গড়ার ডিজিটাল অবকাঠামো'
      ],
      featuresEn: [
        'Aalor Ishkool coordination and learning center',
        'Digital broadcasting & multimedia recording studio',
        'National headquarters for educational content production'
      ],
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'aalor-ishkool'
    },
    {
      floorNo: 9,
      floorBn: '৯ম তলা',
      floorEn: '9th Floor & Rooftop',
      titleBn: 'ওপেন এয়ার ক্যাফেটেরিয়া ও রুফটপ গার্ডেন',
      titleEn: 'BSK Open-Air Rooftop Cafe & Terrace',
      icon: Coffee,
      featuresBn: [
        'সবুজ প্রাকৃতিক পরিবেশে সুন্দর ওপেন এয়ার ক্যাফেটেরিয়া',
        'স্বাস্থ্যকর নাস্তা, কফি, চা ও স্ন্যাক্স পরিবেশন',
        'অনুষ্ঠানের ক্যাটারিং অর্ডার ও বইপ্রেমীদের রিফ্রেশমেন্ট আড্ডা'
      ],
      featuresEn: [
        'Open-air garden cafeteria surrounded by lush greenery',
        'Fresh snacks, hot tea/coffee and dining catering services',
        'Popular rooftop gathering space for intellectuals and readers'
      ],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      actionRoute: 'cafe'
    }
  ];

  const buildingSpecs = [
    {
      titleBn: 'পরিবেশবান্ধব ও সবুজ স্থাপত্য',
      titleEn: 'Eco-Friendly Green Architecture',
      descBn: 'প্রাকৃতিক আলো-বাতাসের সর্বোচ্চ ব্যবহার এবং ভবনের প্রতি তলায় বিস্তৃত সবুজ উদ্ভিদের মনোরম পরিবেশ।',
      descEn: 'Architecturally designed for natural daylight and cross ventilation with vertical greenery.'
    },
    {
      titleBn: 'কেন্দ্রীয় এসি ও সাউন্ডপ্রুফ হল',
      titleEn: 'Central AC & Soundproof Auditoriums',
      descBn: 'সাউন্ডপ্রুফ একোস্টিক ডিজাইন, ভিআইপি ডায়াস ও প্রিমিয়াম স্টেজ সুবিধা সম্পন্ন অডিটোরিয়াম।',
      descEn: 'Acoustically insulated halls equipped with stage lighting and central climate control.'
    },
    {
      titleBn: 'সার্বক্ষণিক বিদ্যুৎ ও নিরাপত্তা',
      titleEn: '24/7 Power Backup & Security',
      descBn: 'ভারী জেনারেটর ব্যাকআপ, ডিজিটাল সিকিউরিটি সিসিটিভি এবং সর্বাধুনিক অগ্নি নির্বাপক ব্যবস্থা।',
      descEn: 'Industrial auto-generator back-up, round-the-clock CCTV surveillance and fire alarms.'
    },
    {
      titleBn: 'সার্বজনীন সুগম্যতা (Accessibility)',
      titleEn: 'Universal Wheelchair Access',
      descBn: 'প্রতিবন্ধী, প্রবীণ ও বিশেষ চাহিদাসম্পন্ন দর্শনার্থীদের জন্য র‍্যাম্প ও আধুনিক লিফট ব্যবস্থা।',
      descEn: 'Dedicated wheelchair entrance ramps, wide elevators, and accessible restrooms.'
    }
  ];

  return (
    <div className="space-y-12 w-full animate-fade-in text-left font-sans">
      
      {/* 1. HERO BANNER FOR BSK BUILDING */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2C2214] via-[#1A1207] to-[#0F0A04] text-white border border-[#B8862A]/30 shadow-xl p-6 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,134,42,0.25),transparent_60%)] z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-[#B8862A]/20 text-[#F0CC7A] px-3.5 py-1.5 rounded-full border border-[#B8862A]/40 text-xs font-semibold tracking-wider uppercase font-mono">
              <Building2 className="w-3.5 h-3.5 text-[#F0CC7A]" />
              <span>{language === 'bn' ? (page?.badge_bn || '১৭ ময়মনসিংহ রোড, বাংলামোটর, ঢাকা-১০০০') : (page?.badge_en || '17 Mymensingh Road, Banglamotor, Dhaka-1000')}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {language === 'bn' ? (page?.title_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন') : (page?.title_en || 'Bishwo Shahitto Kendro Building')}
            </h1>

            <p className="text-sm md:text-base text-stone-200 leading-relaxed font-light">
              {language === 'bn'
                ? (page?.subtitle_bn || page?.sections?.[0]?.content?.[0] || 'ঢাকার বাংলামোটরে অবস্থিত বিশ্বসাহিত্য কেন্দ্রের বহুতল পরিবেশবান্ধব ও সর্বাধুনিক স্থাপত্য ভবনের বিস্তারিত পরিচিতি। ভবনে রয়েছে কেন্দ্রীয় পাঠাগার, ৯টি শীতাতপনিয়ন্ত্রিত মিলনায়তন, চিত্রশালা, ওপেন এয়ার ক্যাফেটেরিয়া এবং বুকশপ।')
                : (page?.subtitle_en || page?.sections?.[0]?.content_en?.[0] || 'Welcome to the iconic Bishwo Shahitto Kendro complex located at Banglamotor, Dhaka. A landmark 10-story cultural & educational hub equipped with state-of-the-art auditoriums, central library, art gallery, and rooftop cafe.')}
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <MapPin className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>{language === 'bn' ? 'বাংলামোটর, ঢাকা' : 'Banglamotor, Dhaka'}</span>
              </div>

              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Layers className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>{language === 'bn' ? '১০-তলা বিশিষ্ট বহুতল ভবন' : '10-Story Landmark Building'}</span>
              </div>

              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Clock className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>{language === 'bn' ? 'খোলা: সকাল ৯:০০ - রাত ৯:০০' : 'Open: 9:00 AM - 9:00 PM'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('auditorium')}
                className="inline-flex items-center space-x-2 bg-[#B8862A] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-[#9A6D1F] transition-all shadow-md cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'অডিটোরিয়াম ও রুম বুকিং' : 'Auditorium Booking & Rent'}</span>
              </button>

              <button
                onClick={() => onNavigate('central-library')}
                className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#F0CC7A]" />
                <span>{language === 'bn' ? 'কেন্দ্রীয় পাঠাগার' : 'Central Library'}</span>
              </button>

              <button
                onClick={() => onNavigate('cafe')}
                className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-[#F0CC7A]" />
                <span>{language === 'bn' ? 'রুফটপ ক্যাফেটেরিয়া' : 'Rooftop Cafe'}</span>
              </button>
            </div>

          </div>

          {/* Hero Building Exterior Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#B8862A]/30 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#B8862A]/40 shadow-2xl bg-[#1A1207]/80 aspect-[4/3] w-full">
                <img 
                  src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80" 
                  alt="BSK Building Exterior" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[#F0CC7A] font-serif">
                    {language === 'bn' ? '🏢 বিশ্বসাহিত্য কেন্দ্র প্রধান ভবন, ঢাকা' : '🏢 Bishwo Shahitto Kendro Complex, Dhaka'}
                  </p>
                  <p className="text-[10px] text-stone-300 font-sans mt-0.5">
                    {language === 'bn' ? 'বাংলামোটর, ঢাকা-১০০০' : '17 Mymensingh Road, Banglamotor'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. BUILDING ARCHITECTURAL SPECIFICATIONS */}
      <div className="space-y-6">
        <div className="border-b border-[#E8DDD0] pb-3">
          <h2 className="font-serif text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
            <span className="w-2 h-6 bg-[#B8862A] inline-block rounded-xs" />
            <span>{language === 'bn' ? 'ভবনের বৈশিষ্ট্য ও নাগরিক সুবিধাসমূহ' : 'Building Architecture & Key Amenities'}</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {language === 'bn' ? 'আধুনিক নকশা, নিরাপদ পরিবেশ ও পরিবেশবান্ধব প্রযুক্তির এক অপূর্ব সমন্বয়।' : 'State-of-the-art infrastructure designed for safety, sustainability, and elegance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {buildingSpecs.map((spec, idx) => (
            <div 
              key={idx}
              className="bg-white border border-[#E8DDD0] hover:border-[#B8862A] p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center text-[#B8862A] font-bold">
                {idx + 1}
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-sm">
                {language === 'bn' ? spec.titleBn : spec.titleEn}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                {language === 'bn' ? spec.descBn : spec.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FLOOR-BY-FLOOR DIRECTORY (তলাভিত্তিক পরিচিতি) */}
      <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DDD0] pb-4 gap-3">
          <div>
            <span className="bg-[#F7EFE5] text-[#8C6212] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
              {language === 'bn' ? 'তলাভিত্তিক ডিরেক্টরি' : 'Floor Directory'}
            </span>
            <h2 className="font-serif text-2xl font-extrabold text-[#1A1207] mt-1">
              {language === 'bn' ? 'ভবনের তলাভিত্তিক পরিচিতি ও বিস্তারিত' : 'Floor-by-Floor Layout Directory'}
            </h2>
          </div>
          
          <div className="text-xs text-stone-500 font-mono">
            {language === 'bn' ? 'মোট ৯টি মূল তলা বিবরণ' : '9 Functional Floor Levels'}
          </div>
        </div>

        {/* Floor Cards Grid */}
        <div className="space-y-4">
          {floorData.map((fl) => {
            const IconComp = fl.icon;
            const isSelected = selectedFloor === fl.floorNo;

            return (
              <div 
                key={fl.floorNo}
                className={`border rounded-2xl transition-all overflow-hidden bg-white ${
                  isSelected ? 'border-[#B8862A] ring-2 ring-[#B8862A]/10 shadow-md' : 'border-[#E8DDD0] hover:border-[#B8862A]/50'
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5]/60 border-b border-[#E8DDD0]/50">
                  
                  <div className="flex items-start md:items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1A1207] text-[#F0CC7A] flex flex-col items-center justify-center font-bold shrink-0 shadow-xs border border-[#B8862A]/30">
                      <IconComp className="w-5 h-5 text-[#F0CC7A]" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold bg-[#F7EFE5] text-[#8C6212] border border-[#B8862A]/30 px-2.5 py-0.5 rounded-full">
                          {language === 'bn' ? fl.floorBn : fl.floorEn}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1207]">
                        {language === 'bn' ? fl.titleBn : fl.titleEn}
                      </h3>
                    </div>
                  </div>

                  {/* Right side buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {fl.actionRoute && (
                      <button
                        onClick={() => onNavigate(fl.actionRoute!)}
                        className="inline-flex items-center space-x-1.5 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Explore'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedFloor(isSelected ? null : fl.floorNo)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSelected 
                        ? (language === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Collapse') 
                        : (language === 'bn' ? 'সুবিধাসমূহ দেখুন' : 'Show Features')}
                    </button>
                  </div>

                </div>

                {/* Expanded Floor Features */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <h4 className="text-xs font-bold font-serif text-[#1A1207] uppercase tracking-wider text-stone-500">
                      {language === 'bn' ? 'এই তলার প্রধান সেবাসমূহ:' : 'Key Services & Amenities:'}
                    </h4>

                    <ul className="space-y-2">
                      {(language === 'bn' ? fl.featuresBn : fl.featuresEn).map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-stone-700 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-4">
                    <div className="rounded-xl overflow-hidden border border-[#E8DDD0] shadow-2xs h-36 relative group">
                      <img 
                        src={fl.image} 
                        alt={fl.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. AUDITORIUM RENTAL REDIRECT BANNER */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F7EFE5] border-2 border-[#B8862A]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center space-x-2 bg-[#B8862A]/15 text-[#8C6212] px-3 py-1 rounded-full text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মিলনায়তন বুকিং সেবা' : 'Auditorium Booking Service'}</span>
          </div>
          <h3 className="font-serif text-2xl font-extrabold text-[#1A1207]">
            {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র ভবনের কোনো রুম বা মিলনায়তন ভাড়া নিতে চান?' : 'Looking to Rent an Auditorium or Classroom in BSK Building?'}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'সেমিনার, ওয়ার্কশপ, প্রদর্শনী ও সাংস্কৃতিক আয়োজনের জন্য ৯টি আধুনিক মিলনায়তন ও শ্রেণীকক্ষের অফিশিয়াল মূল্য তালিকা, আসবাবপত্র তথ্য ও অনলাইন বুকিংয়ের জন্য মিলনায়তন পেজে ভিজিট করুন।'
              : 'View complete rental rate cards, seat capacity specs, equipment pricing, and online booking options on the dedicated Auditorium page.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('auditorium')}
          className="inline-flex items-center space-x-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-6 py-3 rounded-2xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>{language === 'bn' ? 'মিলনায়তন বুকিং পেজে যান' : 'Go to Auditorium Page'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
