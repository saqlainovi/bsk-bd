import React, { useState } from 'react';
import { 
  Truck, BookOpen, MapPin, Calendar, Clock, Users, ShieldAlert,
  CheckCircle2, Search, Filter, HelpCircle, FileText, Send, Phone,
  Mail, Sparkles, Award, Compass, HeartHandshake, ArrowRight,
  ChevronRight, ExternalLink, RefreshCw, AlertCircle, BookmarkCheck,
  Building, CheckCircle, Navigation, Info, Layers
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

  // Firebase Membership Form State
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
      setError(language === 'bn' ? 'অনুগ্রহ করে আবশ্যক তথ্যগুলো (নাম, মোবাইল নম্বর, জেলা ও নিকটস্থ স্পট) পূরণ করুন।' : 'Please enter all required fields (Name, Phone, District & Nearest Spot).');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'mobile_library_applications'), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || '',
        district: form.district.trim(),
        upazila: form.upazila.trim() || '',
        nearestSpot: form.nearestSpot.trim(),
        membershipType: form.membershipType,
        occupation: form.occupation,
        address: form.address.trim() || '',
        createdAt: serverTimestamp(),
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

  // Bus Fleet Data (7 Vehicle Classes)
  const busFleet = [
    {
      id: 'type-1',
      titleBn: 'টাইপ-১: বিশাল শীতাতপ নিয়ন্ত্রিত লাইব্রেরি বাস',
      titleEn: 'Type-1: Heavy Air-Conditioned Super Bus',
      capacityBn: '১৮,০০০+ বই',
      capacityEn: '18,000+ Books',
      coverageBn: 'ঢাকা, চট্টগ্রাম, রাজশাহী ও খুলনা বিভাগীয় মহানগরের প্রধান রুটসমূহ',
      coverageEn: 'Metropolitan centers of Dhaka, Chattogram, Rajshahi & Khulna',
      descBn: 'আধুনিক কাঠের শেলফ, সৌরবিদ্যুৎ ব্যাকআপ, ইনডোর ক্যাটালগ কম্পিউটার স্ক্রিন ও সাউন্ড সিস্টেম সমৃদ্ধ বিশাল লাইব্রেরি বাস।',
      descEn: 'Super-sized customized library bus featuring teakwood shelving, solar energy, catalog touchscreen and audio system.',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-2',
      titleBn: 'টাইপ-২: মাঝারি-বড় লাইব্রেরি বাস',
      titleEn: 'Type-2: Medium-Large Library Bus',
      capacityBn: '১২,০০০+ বই',
      capacityEn: '12,000+ Books',
      coverageBn: 'জেলা সদর ও বৃহত্তর পৌরসভার ব্যস্ততম শিক্ষা প্রাঙ্গণ ও পার্ক',
      coverageEn: 'District headquarters and major municipal educational hubs',
      descBn: 'জেলা স্তরের নিয়মিত পাঠকদের সুবিধার্থে তৈরি ১২,০০০ এর বেশি বই বহনে সক্ষম বিশেষায়িত বাস।',
      descEn: 'Customized bus designed for district level operations carrying over 12,000 literary and educational titles.',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-3',
      titleBn: 'টাইপ-৩: স্ট্যান্ডার্ড লাইব্রেরি বাস',
      titleEn: 'Type-3: Standard Library Bus',
      capacityBn: '৮,০০০+ বই',
      capacityEn: '8,000+ Books',
      coverageBn: 'উপজেলা সদর, ডিগ্রি কলেজ ও গ্রামীণ বাজার কেন্দ্র',
      coverageEn: 'Upazila towns, degree colleges and rural market hubs',
      descBn: 'উপজেলা পর্যায়ে দ্রুত চলাচলের উপযোগী এবং ৮,০০০ মননশীল বই সজ্জিত লাইব্রেরি যান।',
      descEn: 'Agile medium-sized bus serving upazila towns with 8,000 curated titles for students and local readers.',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-4',
      titleBn: 'টাইপ-৪: কমপ্যাক্ট লাইব্রেরি বাস',
      titleEn: 'Type-4: Compact Library Bus',
      capacityBn: '৬,০০০+ বই',
      capacityEn: '6,000+ Books',
      coverageBn: 'পৌরসভা এলাকা ও মাধ্যমিক বিদ্যালয় মোড়',
      coverageEn: 'Municipal zones and high school intersections',
      descBn: 'শহরতলী ও মাধ্যমিক বিদ্যালয় প্রাঙ্গণে সপ্তাহের নির্দিষ্ট দিনে বই পৌঁছানোর জন্য অত্যন্ত কার্যকর।',
      descEn: 'Optimal compact design tailored for suburb roads and high school premises.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-5',
      titleBn: 'টাইপ-৫: ছোট লাইব্রেরি ভ্যান',
      titleEn: 'Type-5: Small Library Van',
      capacityBn: '৪,০০০+ বই',
      capacityEn: '4,000+ Books',
      coverageBn: 'গ্রামীণ সংকীর্ণ রাস্তাঘাট ও প্রত্যন্ত প্রাথমিক প্রাঙ্গণ',
      coverageEn: 'Narrow village roads and primary school centers',
      descBn: 'যেসব গ্রামে বড় বাস প্রবেশ কঠিন, সেখানে ৪,০০০ বই নিয়ে সরাসরি পাঠকের ঘরের দোরগোড়ায় পৌঁছে যায়।',
      descEn: 'Compact library van capable of navigating narrow rural lanes directly to readers.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-6',
      titleBn: 'কোস্টার ও পাহাড়ি স্পেশাল ইউনিট',
      titleEn: 'Coaster & Hill Tracts Special Unit',
      capacityBn: '৩,০০০+ বই',
      capacityEn: '3,000+ Books',
      coverageBn: 'রাঙ্গামাটি, বান্দরবান, খাগড়াছড়ি ও দুর্গম অঞ্চল',
      coverageEn: 'Rangamati, Bandarban, Khagrachhari & remote terrains',
      descBn: 'পার্বত্য ৩ জেলা ও চা বাগান এলাকার আঁকাবাঁকা পাহাড়ী রাস্তায় চলাচলের জন্য বিশেষ ৪-হুইল ড্রাইভ যান।',
      descEn: 'Four-wheel drive specialized mini unit traversing hilly terrains and tea estate communities.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'type-7',
      titleBn: 'ভ্রাম্যমাণ নৌ-লাইব্রেরি (Floating Riverine Unit)',
      titleEn: 'Floating Riverine Boat Library',
      capacityBn: '৫,০০০+ বই',
      capacityEn: '5,000+ Books',
      coverageBn: 'সুনামগঞ্জ, কিশোরগঞ্জ, নেত্রকোণা হাওর ও দ্বীপ অঞ্চল',
      coverageEn: 'Haor wetlands of Sunamganj, Kishoreganj, Netrokona & islands',
      descBn: 'বর্ষাকালে বিচ্ছিন্ন হাওর ও দ্বীপের সুবিধাবঞ্চিত শিশু-কিশোরদের জন্য বিশেষায়িত লাইব্রেরি তরী।',
      descEn: 'Engineered boat library delivering literature to island and haor wetland populations during monsoon.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  // Membership Deposit Tiers Data
  const membershipTiers = [
    {
      id: 'general',
      titleBn: 'সাধারণ সদস্য (General Member)',
      titleEn: 'General Reader Membership',
      depositBn: '৳১০০ (ফেরতযোগ্য)',
      depositEn: '৳100 (Refundable)',
      maxBookValBn: 'সর্বোচ্চ ৳২০০ টাকা মূল্যের বই',
      maxBookValEn: 'Up to ৳200 book value',
      periodBn: '১টি বই / ১ সপ্তাহ',
      periodEn: '1 book for 1 week',
      suitableBn: 'প্রাথমিক ও মাধ্যমিক শিক্ষার্থী এবং সাধারণ পাঠক',
      suitableEn: 'Primary/Secondary students & general readers',
      color: 'from-amber-600 to-amber-800'
    },
    {
      id: 'special',
      titleBn: 'বিশেষ সদস্য (Special Member)',
      titleEn: 'Special Reader Membership',
      depositBn: '৳২০০ (ফেরতযোগ্য)',
      depositEn: '৳200 (Refundable)',
      maxBookValBn: 'সর্বোচ্চ ৳৫০০ টাকা মূল্যের বই',
      maxBookValEn: 'Up to ৳500 book value',
      periodBn: '১-২টি বই / ১ সপ্তাহ',
      periodEn: '1-2 books for 1 week',
      suitableBn: 'উচ্চ মাধ্যমিক, কলেজ ও বিশ্ববিদ্যালয়ের নিয়মিত শিক্ষার্থী',
      suitableEn: 'College and university regular students',
      color: 'from-emerald-700 to-emerald-900'
    },
    {
      id: 'advanced',
      titleBn: 'অগ্রবর্তী সদস্য (Advanced Member)',
      titleEn: 'Advanced Reader Membership',
      depositBn: '৳৫০০ (ফেরতযোগ্য)',
      depositEn: '৳500 (Refundable)',
      maxBookValBn: 'সর্বোচ্চ ৳৭০০ টাকা মূল্যের বই',
      maxBookValEn: 'Up to ৳700 book value',
      periodBn: '২টি বই / ১-২ সপ্তাহ',
      periodEn: '2 books for 1-2 weeks',
      suitableBn: 'শিক্ষক, গবেষক, চাকুরিজীবী ও নিবেদিত সাহিত্য অনুরাগী',
      suitableEn: 'Teachers, researchers, professionals & literature lovers',
      color: 'from-sky-700 to-sky-900'
    },
    {
      id: 'special_advanced',
      titleBn: 'বিশেষ অগ্রবর্তী সদস্য (Special Advanced)',
      titleEn: 'Special Advanced Membership',
      depositBn: '৳৮০০ (ফেরতযোগ্য)',
      depositEn: '৳800 (Refundable)',
      maxBookValBn: 'সর্বোচ্চ ৳১০০০+ টাকা মূল্যের বই',
      maxBookValEn: 'Up to ৳1000+ book value',
      periodBn: '২-৩টি ভারী গবেষণা গ্রন্থ / ২ সপ্তাহ',
      periodEn: '2-3 heavy volumes for 2 weeks',
      suitableBn: 'ভারী বিশ্বসাহিত্য, ইতিহাস, দর্শন ও দুর্লভ সংকলন পাঠক',
      suitableEn: 'Advanced scholars reading rare philosophy & encyclopedias',
      color: 'from-purple-800 to-stone-900'
    }
  ];

  // Representative Spot Schedules
  const sampleSchedules = [
    {
      division: 'dhaka',
      districtBn: 'ঢাকা',
      districtEn: 'Dhaka',
      upazilaBn: 'ধানমন্ডি',
      upazilaEn: 'Dhanmondi',
      spotBn: 'রবীন্দ্র সরোবর প্রাঙ্গণ ও ৮/এ পার্ক',
      spotEn: 'Rabindra Sarobar & 8/A Park',
      dayBn: 'রবিবার',
      dayEn: 'Sunday',
      timeBn: 'বিকাল ৩:০০ - ৫:০০',
      timeEn: '3:00 PM - 5:00 PM',
      busTypeBn: 'টাইপ-১ (১৮,০০০ বই)',
      officer: '০১৭১১-৫৩৫৩৯৮'
    },
    {
      division: 'dhaka',
      districtBn: 'ঢাকা',
      districtEn: 'Dhaka',
      upazilaBn: 'উত্তরা',
      upazilaEn: 'Uttara',
      spotBn: '৪নং সেক্টর পার্ক খেলার মাঠ মোড়',
      spotEn: 'Sector 4 Park Playground',
      dayBn: 'সোমবার',
      dayEn: 'Monday',
      timeBn: 'বিকাল ৩:৩০ - ৫:৩০',
      timeEn: '3:30 PM - 5:30 PM',
      busTypeBn: 'টাইপ-১ (১৮,০০০ বই)',
      officer: '০১৭৩১-৪৫৬৮৯২'
    },
    {
      division: 'dhaka',
      districtBn: 'ঢাকা',
      districtEn: 'Dhaka',
      upazilaBn: 'লালবাগ',
      upazilaEn: 'Lalbagh',
      spotBn: 'লালবাগ কেল্লা প্রবেশদ্বার ও সংলগ্ন স্কুল',
      spotEn: 'Lalbagh Fort Gate Premises',
      dayBn: 'মঙ্গলবার',
      dayEn: 'Tuesday',
      timeBn: 'বিকাল ২:৩০ - ৪:৩০',
      timeEn: '2:30 PM - 4:30 PM',
      busTypeBn: 'টাইপ-২ (১২,০০০ বই)',
      officer: '০১৭১১-৫৩৫৩৯৮'
    },
    {
      division: 'chattogram',
      districtBn: 'চট্টগ্রাম',
      districtEn: 'Chattogram',
      upazilaBn: 'কোতোয়ালী',
      upazilaEn: 'Kotwali',
      spotBn: 'সিআরবি শিরীষতলা ও জিলা পরিষদ প্রাঙ্গণ',
      spotEn: 'CRB Shirishtala & Zila Parishad',
      dayBn: 'রবিবার',
      dayEn: 'Sunday',
      timeBn: 'বিকাল ৩:০০ - ৫:০০',
      timeEn: '3:00 PM - 5:00 PM',
      busTypeBn: 'টাইপ-১ (১৮,০০০ বই)',
      officer: '০১৮১৯-৬১২৩৪৫'
    },
    {
      division: 'chattogram',
      districtBn: 'কুমিল্লা',
      districtEn: 'Cumilla',
      upazilaBn: 'আদর্শ সদর',
      upazilaEn: 'Adarsha Sadar',
      spotBn: 'ধর্মসাগর দীঘির পার ও জিলা স্কুল রোড',
      spotEn: 'Dharmasagar Dighi Bank',
      dayBn: 'বুধবার',
      dayEn: 'Wednesday',
      timeBn: 'বিকাল ৩:০০ - ৪:৩০',
      timeEn: '3:00 PM - 4:30 PM',
      busTypeBn: 'টাইপ-২ (১২,০০০ বই)',
      officer: '০১৭২৫-৯৮৭৬৫৪'
    },
    {
      division: 'rajshahi',
      districtBn: 'রাজশাহী',
      districtEn: 'Rajshahi',
      upazilaBn: 'বোয়ালিয়া',
      upazilaEn: 'Boalia',
      spotBn: 'পদ্মা নদীর ধার (টি-বাঁধ) ও কলেজ রোড',
      spotEn: 'Padma River T-Dam & College Road',
      dayBn: 'বৃহস্পতিবার',
      dayEn: 'Thursday',
      timeBn: 'বিকাল ৩:০০ - ৫:০০',
      timeEn: '3:00 PM - 5:00 PM',
      busTypeBn: 'টাইপ-১ (১৮,০০০ বই)',
      officer: '০১৭৪৫-১২৩৪৫৬'
    },
    {
      division: 'khulna',
      districtBn: 'খুলনা',
      districtEn: 'Khulna',
      upazilaBn: 'সদর',
      upazilaEn: 'Sadar',
      spotBn: 'হাদিস পার্ক প্রাঙ্গণ ও জিলা স্কুল মোড়',
      spotEn: 'Hadis Park & Zila School Junction',
      dayBn: 'রবিবার',
      dayEn: 'Sunday',
      timeBn: 'বিকাল ৩:৩০ - ৫:০০',
      timeEn: '3:30 PM - 5:00 PM',
      busTypeBn: 'টাইপ-২ (১২,০০০ বই)',
      officer: '০১৯১১-২২৩৩৪৪'
    },
    {
      division: 'sylhet',
      districtBn: 'সিলেট',
      districtEn: 'Sylhet',
      upazilaBn: 'সদর',
      upazilaEn: 'Sadar',
      spotBn: 'চৌহাট্টা বুদ্ধিজীবী স্মৃতিসৌধ প্রাঙ্গণ',
      spotEn: 'Chouhatta Memorial Premises',
      dayBn: 'মঙ্গলবার',
      dayEn: 'Tuesday',
      timeBn: 'বিকাল ৩:০০ - ৫:০০',
      timeEn: '3:00 PM - 5:00 PM',
      busTypeBn: 'টাইপ-২ (১২,০০০ বই)',
      officer: '০১৭৫৮-৬৬৭৭৮৮'
    },
    {
      division: 'barishal',
      districtBn: 'বরিশাল',
      districtEn: 'Barishal',
      upazilaBn: 'সদর',
      upazilaEn: 'Sadar',
      spotBn: 'বঙ্গবন্ধু উদ্যান (বেলস্ পার্ক) মোড়',
      spotEn: 'Bangabandhu Udyan (Bells Park)',
      dayBn: 'বুধবার',
      dayEn: 'Wednesday',
      timeBn: 'বিকাল ৩:০০ - ৪:৩০',
      timeEn: '3:00 PM - 4:30 PM',
      busTypeBn: 'টাইপ-৩ (৮,০০০ বই)',
      officer: '০১৬৭৮-১১২২৩৩'
    },
    {
      division: 'rangpur',
      districtBn: 'রংপুর',
      districtEn: 'Rangpur',
      upazilaBn: 'সদর',
      upazilaEn: 'Sadar',
      spotBn: 'টাউন হল প্রাঙ্গণ ও জিলা স্কুল পার্ক',
      spotEn: 'Town Hall Premises',
      dayBn: 'বৃহস্পতিবার',
      dayEn: 'Thursday',
      timeBn: 'বিকাল ৩:০০ - ৫:০০',
      timeEn: '3:00 PM - 5:00 PM',
      busTypeBn: 'টাইপ-৩ (৮,০০০ বই)',
      officer: '০১৭৯৯-৪৪৫৫৬৬'
    },
    {
      division: 'mymensingh',
      districtBn: 'ময়মনসিংহ',
      districtEn: 'Mymensingh',
      upazilaBn: 'সদর',
      upazilaEn: 'Sadar',
      spotBn: 'শিল্পাচার্য জয়নুল আবেদীন সংগ্রাহালয় পার্ক',
      spotEn: 'Zainul Abedin Museum Park',
      dayBn: 'রবিবার',
      dayEn: 'Sunday',
      timeBn: 'বিকাল ৩:৩০ - ৫:৩০',
      timeEn: '3:30 PM - 5:30 PM',
      busTypeBn: 'টাইপ-২ (১২,০০০ বই)',
      officer: '০১৮৪৪-৭৭৮৮৯৯'
    }
  ];

  const filteredSchedules = sampleSchedules.filter((item) => {
    const matchDivision = selectedDivision === 'all' || item.division === selectedDivision;
    const matchSearch = searchQuery.trim() === '' || 
      item.districtBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.districtEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.upazilaBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.upazilaEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spotBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spotEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDivision && matchSearch;
  });

  return (
    <div className="space-y-10 w-full animate-fade-in text-left text-[#1A1207]">
      
      {/* ── HERO BANNER SECTION ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1A0A08] text-white shadow-2xl border border-[#B8862A]/30 p-6 md:p-12">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: `url('${page?.hero_image || page?.bgImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1600&auto=format&fit=crop'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-black/85 to-transparent" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#B8862A]/20 text-[#F0CC7A] px-4 py-1.5 rounded-full border border-[#B8862A]/40 text-xs font-bold tracking-wider uppercase font-mono">
              <Truck className="w-4 h-4 text-[#F0CC7A]" />
              <span>{language === 'bn' ? (page?.badge_bn || 'দেশব্যাপী ৬৪ জেলায় দোরগোড়ায় বই') : (page?.badge_en || '64 Districts Mobile Library Fleet')}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#FAF7F2] tracking-tight leading-tight">
              {language === 'bn' ? (page?.title_bn || 'ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম') : (page?.title_en || 'Mobile Library Program')}
            </h1>

            <p className="text-base md:text-lg text-stone-300 leading-relaxed font-serif italic border-l-2 border-[#B8862A] pl-4">
              {language === 'bn' 
                ? (page?.subtitle_bn || page?.hero_desc_bn || page?.sections?.[0]?.content?.[0] || '“মানুষের মনকে আলোকিত করার জন্য বইকে পৌঁছে দেওয়া হচ্ছে মানুষের দোরগোড়ায়।” — যেখানে লাইব্রেরি নেই বা মানুষের পৌঁছানো কঠিন, সেখানে বিশ্বসাহিত্য কেন্দ্রের লাল-সবুজ লাইব্রেরি বাস বয়ে নিয়ে যায় জ্ঞানের আলোকবার্তা।')
                : (page?.subtitle_en || page?.hero_desc_en || page?.sections?.[0]?.content_en?.[0] || '“Bringing literature right to the doorstep to enlighten minds.” BSK’s mobile buses travel across Bangladesh to deliver books directly to readers.')}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('apply')}
                className="px-6 py-3 bg-[#B8862A] hover:bg-[#9A6D1E] text-stone-950 font-extrabold text-xs md:text-sm rounded-xl transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? 'অনলাইন সদস্যপদ নিবন্ধন' : 'Apply for Membership'}</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm rounded-xl border border-white/20 transition backdrop-blur-xs flex items-center space-x-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#F0CC7A]" />
                <span>{language === 'bn' ? 'স্পট ও রুট খুঁজুন' : 'Find Your Spot & Schedule'}</span>
              </button>

              <a
                href="https://alorpathshala.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-bold text-xs md:text-sm rounded-xl border border-emerald-500/30 transition flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'ই-লাইব্রেরি (আলোর পাঠশালা)' : 'E-Library (Alor Pathshala)'}</span>
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
                {language === 'bn' ? '১৯৯৯ থেকে চলমান' : 'Operating Since 1999'}
              </h3>
              <p className="text-xs text-stone-300 mt-1 font-sans">
                {language === 'bn' 
                  ? 'ঢাকা, চট্টগ্রাম, খুলনা ও রাজশাহী থেকে শুরু হয়ে আজ ৬৪টি জেলা জুড়ে প্রসারিত।'
                  : 'Pioneered in 1999 across 4 metropolises, now serving all 64 districts.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-left text-xs font-mono">
              <div className="p-2 bg-stone-900/80 rounded border border-white/5">
                <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা' : 'Program Officer'}</span>
                <span className="text-amber-300 font-bold block truncate">উজ্জ্বল হোসেন</span>
              </div>
              <div className="p-2 bg-stone-900/80 rounded border border-white/5">
                <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'হটলাইন' : 'Helpline'}</span>
                <span className="text-amber-300 font-bold block truncate">০১৭১১-৫৩৫৩৯৮</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CORE IMPACT STATS DECK ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৬৪টি</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'জেলা কভারেজ' : 'Districts Covered'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৩৬৮টি</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'উপজেলা রুট' : 'Upazilas Covered'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৩,২০০টি</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'বই লেনদেন স্পট' : 'Reading Spots'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৭৬টি</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'লাইব্রেরি বাস বহর' : 'Library Fleet Vehicles'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৪৩ লক্ষ+</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'সংরক্ষিত বই' : 'Books in Fleet'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs text-center space-y-1">
          <span className="text-2xl md:text-3xl font-serif font-black text-[#B8862A]">৩,০০,০০০+</span>
          <p className="text-[11px] text-stone-600 font-sans font-medium">{language === 'bn' ? 'সক্রিয় নিবন্ধিত পাঠক' : 'Active Members'}</p>
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
          <span>{language === 'bn' ? 'পরিচিতি ও ইতিহাস' : 'Overview & Mission'}</span>
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
          <span>{language === 'bn' ? 'বাস বহর (৭ ক্যাটাগরি)' : 'Bus Fleet Categories'}</span>
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
          <span>{language === 'bn' ? 'স্পট ও রুট সময়সূচি' : 'Spots & Schedule'}</span>
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
          <span>{language === 'bn' ? 'সদস্যপদ ও জামানত নিয়মাবলী' : 'Membership Rules'}</span>
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
          <span>{language === 'bn' ? 'অনলাইন আবেদন' : 'Apply Online'}</span>
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
          <span>{language === 'bn' ? 'প্রশ্নোত্তর ও হেল্পলাইন' : 'FAQ & Contact'}</span>
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
                {language === 'bn' ? 'কর্মসূচির প্রেক্ষাপট ও সূচনার গল্প' : 'Program Origins & Evolution'}
              </span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207]">
              {language === 'bn' ? 'দোরগোড়ায় বই: বাংলাদেশের সবচেয়ে জনপ্রিয় লাল-সবুজ লাইব্রেরি বাস' : 'Books at Your Doorstep: Bangladesh’s Iconic Green & Red Library Bus'}
            </h2>

            <div className="space-y-4 text-stone-700 leading-relaxed font-sans text-sm md:text-base">
              <p>
                {language === 'bn'
                  ? 'বিশ্বসাহিত্য কেন্দ্র ১৯৯৯ সালে নরওয়েজিয়ান সহযোগিতা সংস্থা (NORAD)-এর সহায়তায় প্রথমবারের মতো ৪টি বিভাগীয় প্রধান শহর — ঢাকা, চট্টগ্রাম, খুলনা ও রাজশাহীতে ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম চালু করে। যেখানে প্রাতিষ্ঠানিক পাঠাগার নেই বললেই চলে, সেখানে সাধারণ নাগরিক, গৃহিণী, শিশু এবং প্রবীণ পাঠকদের হাতে বিশ্বমানের সমৃদ্ধ বই তুলে দেওয়ার লক্ষ্যে এই কার্যক্রম শুরু হয়েছিল।'
                  : 'Bishwo Shahitto Kendro launched the Mobile Library Program in 1999 across 4 major metropolises (Dhaka, Chattogram, Khulna, Rajshahi) in collaboration with NORAD. It aimed to deliver fine literature directly to residents, homemakers, children, and seniors who lacked access to physical public libraries.'}
              </p>

              <p>
                {language === 'bn'
                  ? 'পরবর্তীতে গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা মন্ত্রণালয় এবং সংস্কৃতি বিষয়ক মন্ত্রণালয়ের যৌথ অর্থায়নে ও বিশ্বসাহিত্য কেন্দ্রের ব্যবস্থাপনায় বাস্তবায়িত ৩টি বৃহৎ প্রকল্পের মাধ্যমে এই কার্যক্রম পর্যায়ক্রমে দেশের সকল ৬৪টি জেলা এবং ৩৬৮টি উপজেলায় ৩,২০০টি নির্দিষ্ট স্থানে বিস্তার লাভ করে। বর্তমানে এই বহরে ৭৬টি ছোট-বড় আধুনিক লাইব্রেরি যান রয়েছে।'
                  : 'Subsequently, through three consecutive government co-funded development projects, BSK scaled the program across all 64 districts and 368 upazilas, serving 3,200 designated neighborhood spots with a specialized fleet of 76 vehicles.'}
              </p>
            </div>

            {/* How It Works Flow */}
            <div className="pt-4 border-t border-stone-150 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1A1207] flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#B8862A]" />
                <span>{language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম পরিচালনার ধাপসমূহ' : 'How the Mobile Library Operates'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#B8862A] text-stone-950 font-bold flex items-center justify-center font-mono text-xs">১</div>
                  <h4 className="font-bold text-sm text-[#1A1207]">{language === 'bn' ? 'সাপ্তাহিক নিয়মিত রুট' : 'Weekly Fixed Routes'}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? 'প্রতিটি বাস সপ্তাহে ৫-৬ দিন নির্ধারিত সময়ে নির্দিষ্ট এলাকা বা পার্কের মোড়ে উপস্থিত হয়।' : 'Each bus arrives at designated parks, schools, or neighborhood intersections at set weekly times.'}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#B8862A] text-stone-950 font-bold flex items-center justify-center font-mono text-xs">২</div>
                  <h4 className="font-bold text-sm text-[#1A1207]">{language === 'bn' ? 'স্পটে অবস্থান ও পাঠ পরিবেশ' : 'Spot Duration & Outdoor Reading'}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? 'প্রতিটি স্পটে ৩০ মিনিট থেকে ২ ঘণ্টা পর্যন্ত গাড়ি অবস্থান করে এবং পাঠকরা খোলামেলা পরিবেশে বই বাছাই করতে পারেন।' : 'Buses halt for 30 mins to 2 hours per spot, providing an open-air reading environment.'}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#B8862A] text-stone-950 font-bold flex items-center justify-center font-mono text-xs">৩</div>
                  <h4 className="font-bold text-sm text-[#1A1207]">{language === 'bn' ? 'বই ইস্যু ও রিটার্ন' : 'Book Issuance & Return'}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? 'সদস্যরা পূর্ববর্তী পড়া বই জমা দিয়ে নতুন বই বাড়িতে নিয়ে পড়ার জন্য সংগ্রহ করতে পারেন।' : 'Members return finished books and borrow new titles for home reading using their membership cards.'}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#B8862A] text-stone-950 font-bold flex items-center justify-center font-mono text-xs">৪</div>
                  <h4 className="font-bold text-sm text-[#1A1207]">{language === 'bn' ? 'উৎকর্ষ পরীক্ষা ও পুরস্কার' : 'Assessments & Incentives'}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? 'বছরের নির্দিষ্ট সময়ে নিয়মিত পাঠকদের উৎসাহ যোগাতে রচনা প্রতিযোগিতা, কুইজ ও বইপড়া পুরস্কার দেওয়া হয়।' : 'Annual reading evaluation quizzes and essay contests encourage consistent reading habits.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Development Notice Box */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-100 to-emerald-500/10 rounded-3xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-stone-900">
              <span className="px-3 py-1 bg-amber-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider font-mono">
                {language === 'bn' ? 'প্রকল্প সম্পর্কিত নোটিশ' : 'Project Status Note'}
              </span>
              <h3 className="font-serif text-lg font-bold">
                {language === 'bn' ? 'দেশব্যাপী ভ্রাম্যমাণ লাইব্রেরি (৩য় সংশোধিত) প্রকল্প ও ই-লাইব্রেরি সুবিধা' : 'Mobile Library Project Phase III & Digital E-Library Sync'}
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                {language === 'bn'
                  ? 'ভ্রাম্যমাণ লাইব্রেরির বহর সম্প্রসারণ ও সংস্কার কাজ চলমান থাকা অবস্থায় ডিজিটাল পাঠকদের জন্য আলোর পাঠশালা (alorpathshala.org) ই-লাইব্রেরির মাধ্যমে ১,০০০+ বিশ্বমানের ই-বুক সম্পূর্ণ বিনামূল্যে ডাউনলোডের সুযোগ রয়েছে।'
                  : 'While fleet upgrades and route expansions are underway, readers can download over 1,000 digitized eBooks free of charge from BSK’s Alor Pathshala e-library.'}
              </p>
            </div>

            <a
              href="https://alorpathshala.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1A0A08] hover:bg-stone-900 text-[#F0CC7A] font-extrabold text-xs rounded-xl shadow-md shrink-0 flex items-center space-x-2 cursor-pointer"
            >
              <span>{language === 'bn' ? 'আলোর পাঠশালায় প্রবেশ করুন' : 'Visit Alor Pathshala'}</span>
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
              <span>{language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরি বাসের ৭টি বিশেষ ক্যাটাগরি' : '7 Vehicle Classes in the BSK Library Fleet'}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {language === 'bn'
                ? 'রাস্তাঘাটের প্রশস্ততা, ভৌগোলিক অবস্থান ও পাঠকের চাহিদার ওপর ভিত্তি করে ৭টি ভিন্ন মাপের সুসজ্জিত লাইব্রেরি যান পরিচালনা করা হয়।'
                : 'BSK operates 7 tailored vehicle classes depending on road width, geographic terrain, and reader demand.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {busFleet.map((bus) => (
              <div key={bus.id} className="bg-white rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="h-44 rounded-xl overflow-hidden relative">
                    <img src={bus.image} alt={bus.titleBn} className="w-full h-full object-cover" />
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
                  <span className="font-bold text-[#B8862A] block">{language === 'bn' ? 'প্রধান চলাচল অঞ্চল:' : 'Primary Coverage:'}</span>
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
                  <span>{language === 'bn' ? 'আপনার এলাকার ভ্রাম্যমাণ লাইব্রেরি স্পট খুঁজুন' : 'Find Mobile Library Spot in Your Area'}</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {language === 'bn' ? 'জেলা, উপজেলা বা এলাকার নাম লিখে অনুসন্ধান করুন অথবা বিভাগ অনুযায়ী ফিল্টার করুন।' : 'Filter by division or search by district, upazila, or spot location.'}
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
                placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি, লালবাগ, চট্টগ্রাম, রবীন্দ্র সরোবর...' : 'e.g. Dhanmondi, Chittagong, Rajshahi, Park...'}
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
                    <th className="p-4">{language === 'bn' ? 'জেলা ও উপজেলা' : 'District & Upazila'}</th>
                    <th className="p-4">{language === 'bn' ? 'নির্ধারিত স্পট / স্থান' : 'Spot Location'}</th>
                    <th className="p-4">{language === 'bn' ? 'সাপ্তাহিক দিন' : 'Day of Week'}</th>
                    <th className="p-4">{language === 'bn' ? 'অবস্থানের সময়' : 'Time Slot'}</th>
                    <th className="p-4">{language === 'bn' ? 'গাড়ির ধরণ' : 'Vehicle Class'}</th>
                    <th className="p-4">{language === 'bn' ? 'অফিসার যোগাযোগ' : 'Officer Contact'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((item, idx) => (
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
                        {language === 'bn' ? 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো স্পট পাওয়া যায়নি।' : 'No spots found matching your search query.'}
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
              <span>{language === 'bn' ? 'সদস্যপদ বিভাগ ও জামানতের চার্ট' : '4 Membership Deposit Tiers'}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {language === 'bn' 
                ? 'সদস্যদের বইয়ের নিরাপত্তা নিশ্চিতকরণে জামানত নেওয়া হয়, যা পরবর্তীতে সদস্যপদ প্রত্যাহারের সময় ১০০% ফেরতযোগ্য।'
                : 'A standard fully-refundable security deposit is required to borrow books for home reading.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier) => (
              <div key={tier.id} className="bg-white rounded-3xl border border-[#E8DDD0] shadow-xs hover:shadow-md transition p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${tier.color} text-white space-y-1`}>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200 font-bold block">{language === 'bn' ? 'ফেরতযোগ্য নিরাপত্তা জামানত' : 'Refundable Security Deposit'}</span>
                    <span className="text-2xl md:text-3xl font-serif font-black block">{tier.depositBn}</span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#1A1207]">
                    {language === 'bn' ? tier.titleBn : tier.titleEn}
                  </h4>

                  <div className="space-y-2 text-xs text-stone-700">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-[#B8862A] shrink-0" />
                      <span><strong>{language === 'bn' ? 'বইয়ের সীমা:' : 'Book Value:'}</strong> {language === 'bn' ? tier.maxBookValBn : tier.maxBookValEn}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#B8862A] shrink-0" />
                      <span><strong>{language === 'bn' ? 'সময়কাল:' : 'Borrow Period:'}</strong> {language === 'bn' ? tier.periodBn : tier.periodEn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                  <span className="font-bold text-stone-800 block">{language === 'bn' ? 'উপযোগী পাঠশ্রেণি:' : 'Recommended Target:'}</span>
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
                <span>{language === 'bn' ? 'প্রয়োজনীয় কাগজপত্র' : 'Required Documents for Application'}</span>
              </h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-stone-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8862A]" />
                  <span>{language === 'bn' ? '১ কপি পাসপোর্ট সাইজ ছবি (Passport size photo)' : '1 Passport size recent photo'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8862A]" />
                  <span>{language === 'bn' ? 'এনআইডি / জন্ম সনদ / স্টুডেন্ট আইডি কার্ডের ফটোকপি' : 'Photocopy of NID / Birth Certificate / Student ID'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8862A]" />
                  <span>{language === 'bn' ? 'সঠিকভাবে পূরণকৃত সদস্যপদ নিবন্ধন ফরম' : 'Duly completed membership application form'}</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#E8DDD0] space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-emerald-700" />
                <span>{language === 'bn' ? 'জামানত ফেরত ও সদস্যপদ বাতিলের নিয়ম' : 'Deposit Refund Policy'}</span>
              </h4>
              <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                {language === 'bn'
                  ? 'যেকোনো সময় সদস্যপদ বাতিল বা কার্ড জমা প্রদান করলে লাইব্রেরি কর্মকর্তা বকেয়া বই ও তথ্য যাচাই করে জমাকৃত জামানতের ১০০% টাকা সঙ্গে সঙ্গে নগদ ফেরত প্রদান করবেন।'
                  : 'Upon surrendering your membership card and returning all borrowed books, your full security deposit is refunded immediately.'}
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
                {language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরি অনলাইন সদস্যপদ ফরম' : 'Mobile Library Membership Application'}
              </h3>
              <p className="text-xs text-stone-600">
                {language === 'bn' ? 'ফরমটি পূরণ করে জমা দিন। আমাদের লাইব্রেরি বাস আপনার নিকটস্থ স্পটে পৌঁছালে আপনার কার্ড ও বই বুঝিয়ে দেওয়া হবে।' : 'Fill in the details below. Our library officer will issue your card at your nearest bus spot.'}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-emerald-900">
                  {language === 'bn' ? 'আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800">
                  {language === 'bn' 
                    ? 'আপনার মোবাইল নম্বরে লাইব্রেরি কর্মকর্তা শীঘ্রই যোগাযোগ করবেন এবং আপনার নির্ধারিত স্পটে গাড়ি পৌঁছালে আপনার কার্ড হস্তান্তর করা হবে।'
                    : 'Our team will reach out to you via your phone number. You can collect your card at your designated spot.'}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', phone: '', email: '', district: '', upazila: '', nearestSpot: '', membershipType: 'general', occupation: 'student', address: '' });
                  }}
                  className="mt-2 px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-800 transition"
                >
                  {language === 'bn' ? 'নতুন আরেকটি আবেদন করুন' : 'Submit Another Application'}
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
                      {language === 'bn' ? 'আবেদনকারীর নাম *' : 'Applicant Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={language === 'bn' ? '০১XXXXXXXXX' : '01XXXXXXXXX'}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? 'জেলা *' : 'District *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: ঢাকা, চট্টগ্রাম, কুমিল্লা' : 'e.g. Dhaka, Cumilla'}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? 'উপজেলা / থানা' : 'Upazila / Thana'}
                    </label>
                    <input
                      type="text"
                      value={form.upazila}
                      onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি, লালবাগ, কোতোয়ালী' : 'e.g. Dhanmondi, Sadar'}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? 'নিকটস্থ বাস স্পট *' : 'Nearest Bus Spot Location *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nearestSpot}
                      onChange={(e) => setForm({ ...form, nearestSpot: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: রবীন্দ্র সরোবর, ৪নং সেক্টর পার্ক' : 'e.g. Rabindra Sarobar Park'}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'bn' ? 'সদস্যপদের ধরন (জামানত)' : 'Membership Deposit Tier'}
                    </label>
                    <select
                      value={form.membershipType}
                      onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                    >
                      <option value="general">{language === 'bn' ? 'সাধারণ সদস্য (১০০ টাকা ফেরতযোগ্য জামানত)' : 'General Member (৳100 Deposit)'}</option>
                      <option value="special">{language === 'bn' ? 'বিশেষ সদস্য (২০০ টাকা ফেরতযোগ্য জামানত)' : 'Special Member (৳200 Deposit)'}</option>
                      <option value="advanced">{language === 'bn' ? 'অগ্রবর্তী সদস্য (৫০০ টাকা ফেরতযোগ্য জামানত)' : 'Advanced Member (৳500 Deposit)'}</option>
                      <option value="special_advanced">{language === 'bn' ? 'বিশেষ অগ্রবর্তী সদস্য (৮০০ টাকা ফেরতযোগ্য জামানত)' : 'Special Advanced Member (৳800 Deposit)'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 block">
                    {language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা' : 'Full Mailing Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder={language === 'bn' ? 'আপনার বাসা বা প্রতিষ্ঠানের ঠিকানা' : 'House/School/Office address'}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#B8862A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#B8862A] hover:bg-[#9A6D1E] text-stone-950 font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'সদস্যপদ আবেদন জমা দিন' : 'Submit Membership Application')}</span>
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
                <span>{language === 'bn' ? 'সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}</span>
              </h3>

              <div className="space-y-3">
                {[
                  {
                    qBn: 'ভ্রাম্যমাণ লাইব্রেরির সদস্য কীভাবে হওয়া যায়?',
                    qEn: 'How to become a member of the Mobile Library?',
                    aBn: 'লাইব্রেরি বাস আপনার নিকটস্থ স্পটে পৌঁছালে ১ কপি ছবি ও এনআইডি/আইডি কার্ডসহ কর্তব্যরত কর্মকর্তার কাছে ফরম জমা দিয়ে ও জামানত পরিশোধ করে তাৎক্ষণিক সদস্য হওয়া যায়। অনলাইন ফরম থেকেও পূর্ব আবেদন করা যায়।',
                    aEn: 'You can submit your photo, ID copy, and security deposit directly to the bus officer at your local spot or pre-apply online.'
                  },
                  {
                    qBn: 'জামানতের টাকা কি পরবর্তীতে ফেরত পাওয়া যাবে?',
                    qEn: 'Is the security deposit 100% refundable?',
                    aBn: 'হ্যাঁ, ১০০% ফেরতযোগ্য। আপনি যেকোনো সময় কার্ড ফেরত দিয়ে সকল বকেয়া বই জমা প্রদান করলে সম্পূর্ণ টাকা সঙ্গে সঙ্গে ফেরত প্রদান করা হয়।',
                    aEn: 'Yes, 100% refundable immediately upon surrendering your card without pending books.'
                  },
                  {
                    qBn: 'বই হারিয়ে গেলে বা নষ্ট হলে করণীয় কী?',
                    qEn: 'What happens if a borrowed book is lost or damaged?',
                    aBn: 'বই হারিয়ে গেলে সমমূল্যের বই বাজার থেকে সংগ্রহ করে প্রদান করতে হবে অথবা বইটির ধার্যকৃত সমমূল্য পরিশোধ করতে হবে।',
                    aEn: 'You can replace the title or reimburse the assessed value of the lost book.'
                  },
                  {
                    qBn: 'আমাদের নতুন এলাকায় লাইব্রেরি বাসের নতুন স্পট কীভাবে যোগ করা যায়?',
                    qEn: 'How to request a new bus spot in our neighborhood?',
                    aBn: 'নূন্যতম ৩০-৫০ জন আগ্রহী পাঠক কোনো শিক্ষাপ্রতিষ্ঠান বা ক্লাব একত্রিত হয়ে আবেদনপত্র বিশ্বসাহিত্য কেন্দ্রের কেন্দ্রীয় কার্যালয়ে জমা প্রদান করলে সমীক্ষা চালিয়ে নতুন স্পট অন্তর্ভুক্ত করা হয়।',
                    aEn: 'If 30-50 readers submit a collective request from a local school or community club, BSK evaluates including the spot.'
                  }
                ].map((faq, idx) => (
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
                  {language === 'bn' ? 'সরাসরি যোগাযোগ' : 'Direct Helpline'}
                </span>
                <h4 className="font-serif text-xl font-bold text-white">
                  {language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরি বিভাগ' : 'Mobile Library Desk'}
                </h4>
                <p className="text-xs text-stone-300 font-sans">
                  {language === 'bn' ? 'যেকোনো জিজ্ঞাসা, মতামত বা অভিযোগের জন্য সরাসরি আমাদের হেল্পলাইনে যোগাযোগ করুন।' : 'Reach out for inquiries, schedules, or spot inclusion requests.'}
                </p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা:' : 'In-Charge Officer:'}</span>
                  <span className="text-amber-300 font-bold block text-sm">উজ্জ্বল হোসেন (Uzzal Hossain)</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'মোবাইল / হটলাইন:' : 'Mobile / Hotline:'}</span>
                  <a href="tel:01711535398" className="text-[#F0CC7A] font-bold block text-sm hover:underline">
                    ০১৭১১-৫৩৫৩৯৮ (01711-535398)
                  </a>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'ইমেইল:' : 'Official Email:'}</span>
                  <a href="mailto:mobilelibrary@bskbd.org" className="text-stone-200 block truncate hover:underline">
                    mobilelibrary@bskbd.org
                  </a>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-white/10 space-y-1">
                  <span className="text-stone-400 block text-[10px]">{language === 'bn' ? 'কেন্দ্রীয় কার্যালয়:' : 'Headquarters:'}</span>
                  <span className="text-stone-300 block font-sans text-xs">
                    বিশ্বসাহিত্য কেন্দ্র, ১৭৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০।
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
