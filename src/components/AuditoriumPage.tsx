import React, { useState, useEffect } from 'react';
import { 
  Landmark, Calendar, Clock, Phone, Mail, MapPin, Search, 
  CheckCircle2, ShieldAlert, Info, ArrowRight,
  Tv, Mic, Wifi, Users, ChevronRight, FileText, Check, X, 
  AlertTriangle, Send, Building, LayoutGrid, Coffee, 
  Download, Printer, DollarSign, Layers
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { defaultAuditoriumData } from '../data/specializedPagesDefaults';

interface AuditoriumPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (route: string) => void;
}

export interface RoomOption {
  id: string;
  roomNo: string;
  floorBn: string;
  floorEn: string;
  titleBn: string;
  titleEn: string;
  category: 'auditorium' | 'classroom' | 'gallery' | 'conference';
  capacityBn: string;
  capacityEn: string;
  hasAcOption?: boolean;
  
  // Base Prices (BDT)
  singleShiftNonAc: number;
  singleShiftAc: number;
  doubleShiftNonAc: number;
  doubleShiftAc: number;
  
  // Equipment Costs (per shift BDT)
  soundSystemCost: number;
  multimediaCost: number;
  projectorCost: number;

  // Furniture
  furnitureBn: string;
  furnitureEn: string;
  bannerSizeBn: string;
  bannerSizeEn: string;

  image: string;
  descriptionBn: string;
  descriptionEn: string;
}

export const AuditoriumPage: React.FC<AuditoriumPageProps> = ({ page, language, onNavigate }) => {
  // Live cPanel SQL page state
  const [dbPageData, setDbPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await cpanelApi.getDoc('website_pages', 'auditorium');
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

  const pageData = { ...defaultAuditoriumData, ...page, ...dbPageData };

  // Navigation / View mode: 'all' | 'table' | 'rules'
  const [activeSection, setActiveSection] = useState<'all' | 'table' | 'rules'>('all');
  
  // Filter for Room Cards
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [targetRoom, setTargetRoom] = useState<RoomOption | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [shiftSelection, setShiftSelection] = useState<'morning' | 'evening' | 'both'>('morning');
  const [acSelection, setAcSelection] = useState<boolean>(true);
  const [reqSound, setReqSound] = useState<boolean>(true);
  const [reqMultimedia, setReqMultimedia] = useState<boolean>(false);
  const [reqProjector, setReqProjector] = useState<boolean>(true);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Complete Official BSK Hall Data from PDF Document or from CMS Page Prop
  const defaultRoomsData: RoomOption[] = [
    {
      id: 'r103',
      roomNo: '১০৩',
      floorBn: '২য় তলা',
      floorEn: '2nd Floor',
      titleBn: 'ইস্তেন্দিয়ার জাহিদ হাসান মিলনায়তন',
      titleEn: 'Istendiar Zahid Hasan Auditorium',
      category: 'auditorium',
      capacityBn: '২০০ আসন',
      capacityEn: '200 Seats',
      hasAcOption: false,
      singleShiftNonAc: 12000,
      singleShiftAc: 12000,
      doubleShiftNonAc: 20000,
      doubleShiftAc: 20000,
      soundSystemCost: 2500,
      multimediaCost: 2500,
      projectorCost: 1500,
      furnitureBn: '২০০টি চেয়ার, ২টি টেবিল, ৫টি অতিথি চেয়ার',
      furnitureEn: '200 Chairs, 2 Tables, 5 VIP Guest Chairs',
      bannerSizeBn: '৭ ফুট × ৩ ফুট',
      bannerSizeEn: '7 ft × 3 ft',
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'বিশ্বসাহিত্য কেন্দ্রের প্রধান ও বৃহত্তম মিলনায়তন। সাউন্ডপ্রুফ ডিজাইন, চমৎকার আলোকসজ্জা ও আধুনিক কনফারেন্স ব্যবস্থার সমন্বয়ে বড় সেমিনার, সম্মেলন ও সাংস্কৃতিক অনুষ্ঠানের জন্য সেরা পছন্দ।',
      descriptionEn: 'The flagship and largest auditorium of BSK. Acoustically treated with premium stage setups, ideal for major national conferences, seminars, and literary sessions.'
    },
    {
      id: 'r101',
      roomNo: '১০১',
      floorBn: '২য় তলা',
      floorEn: '2nd Floor',
      titleBn: 'মিলনায়তন-২য় তলা',
      titleEn: 'Auditorium (2nd Floor - R101)',
      category: 'auditorium',
      capacityBn: '৭১ আসন (ফিক্সড)',
      capacityEn: '71 Fixed Seats',
      hasAcOption: false,
      singleShiftNonAc: 8500,
      singleShiftAc: 8500,
      doubleShiftNonAc: 14000,
      doubleShiftAc: 14000,
      soundSystemCost: 1500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '৭১টি ফিক্সড চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      furnitureEn: '71 Fixed Auditorium Seats, 1 Table, 3 Guest Chairs',
      bannerSizeBn: '৮ ফুট × ৪ ফুট',
      bannerSizeEn: '8 ft × 4 ft',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '৭১টি ফিক্সড গ্যালারি চেয়ার বিশিষ্ট থিয়েটার ঘরানার মিলনায়তন। স্বল্প পরিসরের জাতীয় অনুষ্ঠান, নাটক, আলোচনা ও বই প্রকাশনার জন্য অত্যন্ত উপযোগী।',
      descriptionEn: 'Tiered auditorium with fixed plush gallery seating. Perfect for book launches, intimate panel discussions, and lectures.'
    },
    {
      id: 'r301-303',
      roomNo: '৩০১, ৩০২, ৩০৩',
      floorBn: '৩য় তলা',
      floorEn: '3rd Floor',
      titleBn: 'সাধারণ শ্রেণীকক্ষ (৩০১, ৩০২, ৩০৩)',
      titleEn: 'General Classrooms (R301, 302, 303)',
      category: 'classroom',
      capacityBn: '৩০ আসন (প্রতি রুম)',
      capacityEn: '30 Seats each',
      hasAcOption: true,
      singleShiftNonAc: 1500,
      singleShiftAc: 2200,
      doubleShiftNonAc: 2500,
      doubleShiftAc: 4000,
      soundSystemCost: 500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '৩০টি চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      furnitureEn: '30 Chairs, 1 Table, 3 Guest Chairs',
      bannerSizeBn: '৭ ফুট × ৩ ফুট ও ৪ ফুট × ৩ ফুট',
      bannerSizeEn: '7 ft × 3 ft & 4 ft × 3 ft',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'প্রশিক্ষণ কর্মশালা, স্টাডি সার্কেল, ক্লাস ও ছোট পরিসরের প্রাতিষ্ঠানিক মিটিং আয়োজনের জন্য উপযোগী শীতাতপনিয়ন্ত্রিত বা নন-এসি শ্রেণীকক্ষ।',
      descriptionEn: 'Versatile training classrooms equipped for workshops, academic study circles, and corporate training sessions.'
    },
    {
      id: 'r402',
      roomNo: '৪০২',
      floorBn: '৫ম তলা',
      floorEn: '5th Floor',
      titleBn: 'চিত্রশালা / আর্ট গ্যালারি',
      titleEn: 'Art Gallery & Exhibition Hall (R402)',
      category: 'gallery',
      capacityBn: '৪০-৫০টি চিত্র প্রদর্শনী',
      capacityEn: '40-50 Artworks',
      hasAcOption: false,
      singleShiftNonAc: 3500,
      singleShiftAc: 3500,
      doubleShiftNonAc: 6000,
      doubleShiftAc: 6000,
      soundSystemCost: 500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: 'স্পট লাইট, ১৬টি চেয়ার, ৫০টি ছবি ঝুলানোর ট্র্যাকিং ব্যবস্থা',
      furnitureEn: 'Spotlights, 16 Chairs, Hanging Wall Racks for 50 Paintings',
      bannerSizeBn: 'হলরুম প্রবেশমুখ ব্যানার',
      bannerSizeEn: 'Entrance Banner Display',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'চিত্রকলা প্রদর্শনী, আলোকচিত্র প্রদর্শনী, ভাস্কর্য ও শিল্পকর্ম প্রদর্শনীর জন্য বিশেষভাবে নির্মিত আধুনিক স্পটলাইট সমৃদ্ধ আর্ট গ্যালারি (সময়: বিকাল ৩টা - রাত ৮টা)।',
      descriptionEn: 'Professional gallery space equipped with dynamic track spotlighting and hanging hardware for fine art and photography exhibitions.'
    },
    {
      id: 'r401',
      roomNo: '৪০১',
      floorBn: '৫ম তলা',
      floorEn: '5th Floor',
      titleBn: 'সাধারণ মিলনায়তন-৫ম তলা',
      titleEn: 'General Auditorium (5th Floor - R401)',
      category: 'auditorium',
      capacityBn: '৮০ আসন',
      capacityEn: '80 Seats',
      hasAcOption: false,
      singleShiftNonAc: 5500,
      singleShiftAc: 5500,
      doubleShiftNonAc: 10000,
      doubleShiftAc: 10000,
      soundSystemCost: 1000,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '৪০টি চেয়ার, ২টি টেবিল, ৩টি অতিথি চেয়ার',
      furnitureEn: '40 Chairs, 2 Tables, 3 Guest Chairs',
      bannerSizeBn: '৮ ফুট × ৪ ফুট',
      bannerSizeEn: '8 ft × 4 ft',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '৮০ জন ধারণক্ষমতার শান্ত ও মনোরম মিলনায়তন। সাহিত্য সভা, প্রাতিষ্ঠানিক বার্ষিক সভা, কবিতা আবৃত্তি ও সাংস্কৃতিক সন্ধ্যার জন্য উপযুক্ত।',
      descriptionEn: 'Spacious mid-size hall designed for literary symposia, poetry recitals, and organizational AGMs.'
    },
    {
      id: 'r504',
      roomNo: '৫০৪',
      floorBn: '৬ষ্ঠ তলা',
      floorEn: '6th Floor',
      titleBn: 'সাধারণ শ্রেণীকক্ষ-৬ষ্ঠ তলা',
      titleEn: 'General Classroom (6th Floor - R504)',
      category: 'classroom',
      capacityBn: '৩০ আসন',
      capacityEn: '30 Seats',
      hasAcOption: true,
      singleShiftNonAc: 1500,
      singleShiftAc: 2200,
      doubleShiftNonAc: 2500,
      doubleShiftAc: 4000,
      soundSystemCost: 500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '৩০টি চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      furnitureEn: '30 Chairs, 1 Table, 3 Guest Chairs',
      bannerSizeBn: '৭ ফুট × ৩ ফুট ও ৪ ফুট × ৩ ফুট',
      bannerSizeEn: '7 ft × 3 ft & 4 ft × 3 ft',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '৬ষ্ঠ তলার পরিচ্ছন্ন ও নিরিবিলি শ্রেণীকক্ষ। ছাত্রছাত্রী সংগঠন, এনজিও প্রশিক্ষণ ও ওয়ার্কশপের জন্য উপযুক্ত।',
      descriptionEn: 'Quiet upper-floor seminar classroom with modern seating setups.'
    },
    {
      id: 'r505',
      roomNo: '৫০৫',
      floorBn: '৬ষ্ঠ তলা',
      floorEn: '6th Floor',
      titleBn: 'বিশেষ মিলনায়তন-৬ষ্ঠ তলা',
      titleEn: 'Special Auditorium (6th Floor - R505)',
      category: 'auditorium',
      capacityBn: '১০০ আসন',
      capacityEn: '100 Seats',
      hasAcOption: false,
      singleShiftNonAc: 8500,
      singleShiftAc: 8500,
      doubleShiftNonAc: 14000,
      doubleShiftAc: 14000,
      soundSystemCost: 1500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '১০০টি চেয়ার, ২টি টেবিল, ৫টি অতিথি চেয়ার',
      furnitureEn: '100 Chairs, 2 Tables, 5 Guest Chairs',
      bannerSizeBn: '৭ ফুট × ৩ ফুট ও ৪ ফুট × ৩ ফুট',
      bannerSizeEn: '7 ft × 3 ft & 4 ft × 3 ft',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '১০০ জন ধারণক্ষমতার প্রিমিয়াম স্পেশাল অডিটোরিয়াম। জাতীয় পর্যায় সভা, সাংবাদিক সম্মেলন, সেমিনার এবং সাংস্কৃতিক পরিবেশনার জন্য অত্যন্ত জনপ্রিয়।',
      descriptionEn: 'High-demand 100-seater seminar hall featuring elevated dais stage and crystal-clear acoustics.'
    },
    {
      id: 'r605',
      roomNo: '৬০৫',
      floorBn: '৭ম তলা',
      floorEn: '7th Floor',
      titleBn: 'সম্মেলন কক্ষ (কনফারেন্স রুম)',
      titleEn: 'Executive Conference Room (R605)',
      category: 'conference',
      capacityBn: '৫০ আসন (২০ আসন কনফারেন্স টেবিল)',
      capacityEn: '50 Seats (20 Boardroom Table Seats)',
      hasAcOption: false,
      singleShiftNonAc: 11500,
      singleShiftAc: 11500,
      doubleShiftNonAc: 22000,
      doubleShiftAc: 22000,
      soundSystemCost: 0,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '২০ আসন বিশিষ্ট কনফারেন্স টেবিল ও ৫০টি চেয়ার',
      furnitureEn: '20 Boardroom Executive Table Seats + 50 Perimeter Chairs',
      bannerSizeBn: '৮ ফুট × ৪ ফুট',
      bannerSizeEn: '8 ft × 4 ft',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'উচ্চমানের কনফারেন্স টেবিল ও এক্সিকিউটিভ চেয়ার সমৃদ্ধ বিশ্বমানের গভর্নিং বডি মিটিং ও বড় করপোরেট কনফারেন্স রুম।',
      descriptionEn: 'Executive board-level meeting room featuring a massive central mahogany table and executive seating.'
    },
    {
      id: 'r802-803',
      roomNo: '৮০২, ৮০৩',
      floorBn: '৯ম তলা',
      floorEn: '9th Floor',
      titleBn: 'সাধারণ শ্রেণীকক্ষ (৮০২, ৮০৩)',
      titleEn: 'General Classrooms (R802, R803)',
      category: 'classroom',
      capacityBn: '৩০ আসন (প্রতি রুম)',
      capacityEn: '30 Seats each',
      hasAcOption: true,
      singleShiftNonAc: 1500,
      singleShiftAc: 2200,
      doubleShiftNonAc: 2500,
      doubleShiftAc: 4000,
      soundSystemCost: 500,
      multimediaCost: 2000,
      projectorCost: 1500,
      furnitureBn: '৩০টি চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      furnitureEn: '30 Chairs, 1 Table, 3 Guest Chairs',
      bannerSizeBn: '৭ ফুট × ৩ ফুট ও ৪ ফুট × ৩ ফুট',
      bannerSizeEn: '7 ft × 3 ft & 4 ft × 3 ft',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '৯ম তলার মনোরম ভিউ ও শান্ত পরিবেশের শ্রেণীকক্ষ। স্বল্পমেয়াদী কোর্স ও অনলাইন ওয়ার্কশপের জন্য উপযোগী।',
      descriptionEn: 'Ninth-floor training room with abundant natural light and quiet surrounding ambience.'
    }
  ];

  const roomsData: RoomOption[] = (page?.rooms && page.rooms.length > 0) 
    ? page.rooms 
    : (page?.roomsData && page.roomsData.length > 0) 
      ? page.roomsData 
      : defaultRoomsData;

  // Filtered rooms logic
  const filteredRooms = roomsData.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      r.titleBn.toLowerCase().includes(q) ||
      r.titleEn.toLowerCase().includes(q) ||
      r.roomNo.includes(q) ||
      r.floorBn.includes(q) ||
      r.floorEn.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Submit Booking Form to cPanel Database
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !eventTitle) {
      alert(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং অনুষ্ঠানের শিরোনাম পূরণ করুন।' : 'Please fill in your name, mobile number and event title.');
      return;
    }

    setSubmitting(true);
    try {
      await cpanelApi.addDoc('hall_bookings', {
        roomId: targetRoom?.id || 'general',
        roomTitleBn: targetRoom?.titleBn || 'সাধারণ হল বুকিং',
        roomTitleEn: targetRoom?.titleEn || 'General Hall Booking',
        roomNo: targetRoom?.roomNo || '',
        orgName,
        applicantName,
        applicantPhone,
        applicantEmail,
        eventTitle,
        eventDate,
        shiftSelection,
        acSelection,
        reqSound,
        reqMultimedia,
        reqProjector,
        specialNotes,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSubmitting(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingModalOpen(false);
        setOrgName('');
        setApplicantName('');
        setApplicantPhone('');
        setApplicantEmail('');
        setEventTitle('');
        setEventDate('');
        setSpecialNotes('');
      }, 3000);
    } catch (err) {
      console.error('Error booking hall:', err);
      setSubmitting(false);
      alert(language === 'bn' ? 'আবেদন জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে সরাসরি ফোন করুন: 01761496491' : 'Failed to submit booking. Please call directly: 01761496491');
    }
  };

  // Official BSK Booking Rules (18 Points from PDF Page 2)
  const officialRulesBn = [
    'শিক্ষামুখী, রুচিশীল সাংস্কৃতিক অনুষ্ঠান ও প্রশিক্ষণমূলক কার্যক্রমের জন্য বিশ্বসাহিত্য কেন্দ্র মিলনায়তন, শ্রেণীকক্ষ ও নির্ধারিত স্পেসসমূহ খালি থাকা সাপেক্ষে ভাড়া দেওয়া হয়। কোনো প্রকার রাজনৈতিক উদ্দেশ্যে দেওয়া হয় না।',
    'ভাড়া নেওয়ার জন্য প্রতিষ্ঠানের নিজ প্যাডে "পরিচালক, বিশ্বসাহিত্য কেন্দ্র" বরাবরে আবেদন করতে হবে। নীতিমালা অনুযায়ী চূড়ান্ত বরাদ্দ প্রদান করা হবে।',
    'ভাড়া গ্রহণের সময় সময়সূচি ফরমটি পূরণ করে ভাড়ার ৫০% অর্থ অগ্রিম প্রদান করতে হবে। অনুষ্ঠানের ৫ দিন পূর্বে সম্পূর্ণ ভাড়া পরিশোধ করতে হবে।',
    'অনুষ্ঠান শুরুর ৭২ ঘণ্টা পূর্বে বাতিল করলে ২৫%, ৪৮ ঘণ্টা পূর্বে ৫০%, এবং ২৪ ঘণ্টা পূর্বে বাতিল করলে ৭৫% ভাড়ার অর্থ কর্তন করা হবে। ২৪ ঘণ্টার কম সময়ে বুকিং বাতিল করলে কোনো অর্থ ফেরত দেওয়া হবে না।',
    'মিলনায়তন/কক্ষ ভাড়ার সঙ্গে কেন্দ্র থেকে নির্ধারিত আসবাবপত্র (চেয়ার, টেবিল, ডায়াস) সরবরাহ করা হবে।',
    'সাউন্ড সিস্টেম, প্রজেক্টর, টেবিল ও ইন্টারনেট ইত্যাদি ব্যবহারের ক্ষেত্রে হল ভাড়ার অতিরিক্ত ফি প্রদান করতে হবে।',
    'কেন্দ্রের আসবাবপত্র বা যন্ত্রপাতি ক্ষতিগ্রস্ত হলে ভাড়া গ্রহণকারী প্রতিষ্ঠানকে যুক্তিসঙ্গত ক্ষতিপূরণ প্রদান করতে হবে।',
    'নিয়ন্ত্রণ বহির্ভূত বিদ্যুৎ বিভ্রাট বা যান্ত্রিক ত্রুটির জন্য কেন্দ্র কর্তৃপক্ষ দায়ী থাকবে না।',
    'দেয়াল, স্তম্ভ, গ্লাস বা আসবাবপত্রে কোনো প্রকার পেরেক, কস্টেপ, আঠা বা কাঁটা ব্যবহার করা সম্পূর্ণ নিষেধ। ব্যানার কেবল নির্ধারিত ফ্রেমে টাঙাতে হবে।',
    'মাননীয় মন্ত্রী, সচিব বা ভিআইপি অতিথি থাকলে অনুষ্ঠান শুরুর কমপক্ষে ৩ দিন পূর্বে বিশ্বসাহিত্য কেন্দ্রকে লিখিতভাবে অবহিত করতে হবে।',
    'আন্তর্জাতিক বা বিদেশী কূটনৈতিক ব্যক্তিবর্গ উপস্থিত থাকলে স্থানীয় প্রশাসনের অনুমতিপত্রের অনুলিপি জমা দিতে হবে।',
    'রাষ্ট্রবিরোধী, কোনো ধর্মবিশ্বাস বা বিশেষ জনগোষ্ঠীর অনুভূতিতে আঘাত হানে এমন কোনো অনুষ্ঠান পরিচালনা করা যাবে না।',
    'যে উদ্দেশ্যে ঘর ভাড়া নেওয়া হয়েছে কেবল সেই উদ্দেশ্যেই ব্যবহার করা যাবে। নির্ধারিত রুমের বাইরে অন্য কোথাও অনুষ্ঠান বা লাইভ সম্প্রচার করা যাবে না।',
    'মিলনায়তন বা শ্রেণীকক্ষের ভেতরে কোনো প্রকার খাবার আনা বা পরিবেশন করা কঠোরভাবে নিষিদ্ধ।',
    'খাবারের প্রয়োজন হলে বিশ্বসাহিত্য কেন্দ্র ক্যাফেটেরিয়া থেকে কমপক্ষে ৩ দিন পূর্বে নির্ধারিত মূল্যে খাবার বুকিং দিতে হবে।',
    'বিশ্বসাহিত্য কেন্দ্র ভবন প্রাঙ্গণের অভ্যন্তরে কোনো স্থানে ধূমপান করা সম্পূর্ণ নিষিদ্ধ।',
    'বিশেষ প্রয়োজনে বা নিয়ম লঙ্ঘনে কর্তৃপক্ষ যেকোনো সময় বরাদ্দ বাতিল করার সম্পূর্ণ অধিকার রাখে।',
    'বিশ্বসাহিত্য কেন্দ্র কর্তৃপক্ষ প্রয়োজনবোধে যেকোনো নীতিমালায় সংশোধন আনার অধিকার সংরক্ষণ করে।'
  ];

  const officialRulesEn = [
    'Auditoriums and classrooms are allocated for educational, cultural, and training activities. Political events are strictly prohibited.',
    'Application must be submitted on official pad addressed to "Director, Bishwo Shahitto Kendro".',
    '50% advance booking payment is mandatory. The remaining 50% must be paid at least 5 days prior to the event.',
    'Cancellation refunds: 75% refund if cancelled 72h prior, 50% if 48h prior, 25% if 24h prior. No refund for cancellations within 24 hours.',
    'Basic furniture (chairs, stage tables, guest seats) is included with room rent.',
    'Additional fees apply for Sound System, Multimedia Panel, Projector, and Wi-Fi internet.',
    'Renters must compensate for any damage caused to BSK furniture, electronics, or facility property.',
    'BSK authority is not liable for unexpected municipal blackout or technical disruption beyond control.',
    'Strictly NO nails, tape, or glue on walls, glass, or pillars. Banners must be mounted on allocated frames only.',
    'Presence of Ministers, Secretaries, or VIP guests must be notified to BSK at least 3 days in advance.',
    'Presence of foreign diplomats requires local administration permission copy submission.',
    'Anti-state speech or any content hurting religious/cultural sentiments is strictly forbidden.',
    'Rented spaces must be strictly used for the requested purpose only. No unauthorized outdoor live broadcasts.',
    'Outside food is strictly prohibited inside auditoriums or classrooms.',
    'Food catering can be arranged through BSK Cafeteria with a minimum 3-day advance order.',
    'Smoking is strictly prohibited everywhere inside the Bishwo Shahitto Kendro complex.',
    'BSK Authority reserves the right to suspend or cancel any booking without notice.',
    'BSK Authority reserves the right to amend rental rules at any time.'
  ];

  return (
    <div className="space-y-10 w-full animate-fade-in text-left">
      
      {/* 1. OFFICIAL DOCUMENT HEADER & BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2C2214] via-[#1A1207] to-[#0F0A04] text-white border border-[#B8862A]/30 shadow-xl p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,134,42,0.25),transparent_60%)] z-0" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-[#B8862A]/20 text-[#F0CC7A] px-3.5 py-1.5 rounded-full border border-[#B8862A]/40 text-xs font-semibold tracking-wider uppercase font-mono">
              <Landmark className="w-3.5 h-3.5 text-[#F0CC7A]" />
              <span>{language === 'bn' ? (page?.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র, ১৭ ময়মনসিংহ রোড, বাংলামোটর, ঢাকা-১০০০') : (page?.badge_en || 'Bishwo Shahitto Kendro, 17 Mymensingh Road, Banglamotor, Dhaka-1000')}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {language === 'bn' ? (page?.title_bn || 'মিলনায়তন ও অন্যান্য স্পেস ভাড়ার মূল্য তালিকা') : (page?.title_en || 'Auditorium & Facilities Rental Rate Card')}
            </h1>

            <p className="text-sm md:text-base text-stone-200 font-sans leading-relaxed font-light">
              {language === 'bn'
                ? (page?.subtitle_bn || page?.sections?.[0]?.content?.[0] || 'জাতীয় পর্যায় থেকে প্রাতিষ্ঠানিক সেমিনার, শিল্প প্রদর্শনী, কনফারেন্স ও সাংস্কৃতিক আয়োজনের জন্য বিশ্বসাহিত্য কেন্দ্র ভবনের ৯টি আধুনিক মিলনায়তন, আর্ট গ্যালারি, কনফারেন্স রুম ও শ্রেণীকক্ষ। অফিশিয়াল মূল্য তালিকা, আসবাবপত্র স্পেসিফিকেশন ও ভাড়ার ১৮টি লিখিত নীতিমালা।')
                : (page?.subtitle_en || page?.sections?.[0]?.content_en?.[0] || 'State-of-the-art auditoriums, art gallery, executive boardrooms, and training classrooms located at Banglamotor, Dhaka. Soundproofed with central AC and modern multimedia capabilities.')}
            </p>

            {/* Shift Timings & Official Hotline Contacts */}
            <div className="pt-2 flex flex-wrap gap-3 text-xs font-sans">
              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Clock className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'সকাল শিফট: ৯.০০-২.০০ | বিকাল শিফট: ৪.০০-৯.০০'
                    : 'Morning Shift: 9am-2pm | Evening Shift: 4pm-9pm'}
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Phone className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>
                  {language === 'bn' ? 'হল বুকিং:' : 'Hall Booking:'}
                  <a href="tel:01761496491" className="hover:text-[#F0CC7A] font-mono font-bold ml-1 transition-colors">
                    ০১৭৬১-৪৯৬৪৯১
                  </a>
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Coffee className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>
                  {language === 'bn' ? 'ক্যাফেটেরিয়া:' : 'Cafeteria:'}
                  <a href="tel:01761496476" className="hover:text-[#F0CC7A] font-mono font-bold ml-1 transition-colors">
                    ০১৭৬১-৪৯৬৪৭৬
                  </a>
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setActiveSection('table');
                  const el = document.getElementById('official-table-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-2 bg-[#B8862A] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-[#9A6D1F] transition-all shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? 'অফিশিয়াল মূল্য তালিকা (Price Table)' : 'Official Rate Sheet'}</span>
              </button>

              <button
                onClick={() => {
                  setTargetRoom(roomsData[0]);
                  setBookingModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 bg-white text-[#1A1207] px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-stone-100 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? 'সরাসরি বুকিং আবেদন' : 'Submit Booking'}</span>
              </button>
            </div>

          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm lg:max-w-full w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#B8862A]/30 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#B8862A]/40 shadow-2xl bg-[#1A1207]/80 aspect-[4/3] w-full">
                <img 
                  src={page?.hero_image || page?.heroImage || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80"} 
                  alt="BSK Main Auditorium" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[#F0CC7A] font-serif">
                    {language === 'bn' ? '\uD83C\uDFDB️ ইস্তেন্দিয়ার জাহিদ হাসান মিলনায়তন (২০০ আসন)' : '\uD83C\uDFDB️ Istendiar Zahid Hasan Auditorium (200 Seats)'}
                  </p>
                  <p className="text-[10px] text-stone-300 font-sans mt-0.5">
                    {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র ভবন - ২য় তলা, রুম ১০৩' : '2nd Floor, Bishwo Shahitto Kendro'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SECTION TABS CONTROL */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#E8DDD0] pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-[#B8862A] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-[#E8DDD0] hover:border-[#B8862A] hover:text-[#B8862A]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{language === 'bn' ? 'সকল সেকশন একসাথে' : 'All Overview'}</span>
          </button>

          <button
            onClick={() => setActiveSection('table')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSection === 'table'
                ? 'bg-[#B8862A] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-[#E8DDD0] hover:border-[#B8862A] hover:text-[#B8862A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'bn' ? 'অফিশিয়াল মূল্য তালিকা ও আসবাবপত্র' : 'Official Price & Furniture Table'}</span>
          </button>

          <button
            onClick={() => setActiveSection('rules')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSection === 'rules'
                ? 'bg-[#B8862A] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-[#E8DDD0] hover:border-[#B8862A] hover:text-[#B8862A]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'bn' ? '১৮টি ভাড়ার নির্দেশিকা ও নীতিমালা' : '18 Rental Guidelines'}</span>
          </button>
        </div>

        {/* Quick Email & Phone Info Pill */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono bg-[#FAF7F2] border border-[#E8DDD0] px-3.5 py-2 rounded-xl text-stone-700">
          <Mail className="w-3.5 h-3.5 text-[#B8862A]" />
          <span>hallrent@bskbd.org</span>
        </div>
      </div>


      {/* 3. SECTION: OFFICIAL BSK PRICE TABLE (বিশ্বসাহিত্য কেন্দ্রের মিলনায়তন ও অন্যান্য স্পেস ভাড়ার মূল্য তালিকা) */}
      {(activeSection === 'all' || activeSection === 'table') && (
        <div id="official-table-section" className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8DDD0] pb-4 gap-3">
            <div className="space-y-1">
              <span className="bg-[#F7EFE5] text-[#8C6212] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                {language === 'bn' ? 'অফিশিয়াল ডকুমেন্ট' : 'Official Rate Document'}
              </span>
              <h2 className="font-serif text-2xl font-extrabold text-[#1A1207]">
                {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের মিলনায়তন ও অন্যান্য স্পেস ভাড়ার মূল্য তালিকা' : 'BSK Auditorium & Facility Rental Rate Card'}
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                {language === 'bn' 
                  ? 'সকল ভাড়ার সাথে ভ্যাট (VAT) অন্তর্ভুক্ত। কোনো পৃথক ভ্যাট চার্জ প্রযোজ্য হবে না।' 
                  : 'All rates are inclusive of government VAT. No additional taxes will be applied.'}
              </p>
            </div>

            {/* Print/Download button indicator */}
            <div className="flex items-center space-x-2">
              <a 
                href="mailto:hallrent@bskbd.org"
                className="inline-flex items-center space-x-1.5 bg-[#FAF7F2] hover:bg-[#F7EFE5] text-stone-800 border border-[#E8DDD0] px-3 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#B8862A]" />
                <span>{language === 'bn' ? 'অফিসিয়াল কপি মেল করুন' : 'Email Office'}</span>
              </a>
            </div>
          </div>

          {/* Clean BSK Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-[#E8DDD0] shadow-2xs">
            <table className="w-full text-left border-collapse font-sans text-xs">
              
              {/* Table Header */}
              <thead>
                <tr className="bg-[#1A1207] text-[#F0CC7A] font-serif font-bold text-xs border-b border-[#2C2214]">
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center w-12">ক্রঃ নং</th>
                  <th className="p-3.5 border-r border-[#3A2E1D]">মিলনায়তন / রুমের নাম ও বিবরণ</th>
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center">আসন সংখ্যা</th>
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center">১ শিফট ভাড়া (৳)</th>
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center">২ শিফট ভাড়া (৳)</th>
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center">সাউন্ড সিস্টেম (৳)</th>
                  <th className="p-3.5 border-r border-[#3A2E1D] text-center">মাল্টিমিডিয়া (৳)</th>
                  <th className="p-3.5 text-center">প্রজেক্টর (৳)</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-stone-200 text-stone-800 bg-white">
                {roomsData.map((room, idx) => (
                  <tr 
                    key={room.id}
                    className={`hover:bg-[#FAF8F5] transition-colors ${idx % 2 === 1 ? 'bg-[#FCFAF7]' : 'bg-white'}`}
                  >
                    <td className="p-3 text-center font-mono font-bold text-stone-500 border-r border-stone-200">
                      {(idx + 1).toLocaleString('bn-BD')}
                    </td>

                    <td className="p-3 border-r border-stone-200 space-y-0.5">
                      <div className="font-serif font-extrabold text-[#1A1207] text-sm">
                        {language === 'bn' ? room.titleBn : room.titleEn}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {language === 'bn' ? `রুম নং- ${room.roomNo} (${room.floorBn})` : `Room ${room.roomNo} (${room.floorEn})`}
                      </div>
                    </td>

                    <td className="p-3 text-center border-r border-stone-200 font-bold text-[#8C6212] font-mono whitespace-nowrap">
                      {language === 'bn' ? room.capacityBn : room.capacityEn}
                    </td>

                    <td className="p-3 text-center border-r border-stone-200 font-mono font-bold text-[#1A1207]">
                      ৳{room.singleShiftNonAc.toLocaleString('bn-BD')}/-
                      {room.hasAcOption && (
                        <span className="block text-[10px] text-[#B8862A] font-sans font-semibold">
                          (এসি: ৳{room.singleShiftAc.toLocaleString('bn-BD')}/-)
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center border-r border-stone-200 font-mono font-bold text-[#B8862A]">
                      ৳{room.doubleShiftNonAc.toLocaleString('bn-BD')}/-
                      {room.hasAcOption && (
                        <span className="block text-[10px] text-[#8C6212] font-sans font-semibold">
                          (এসি: ৳{room.doubleShiftAc.toLocaleString('bn-BD')}/-)
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center border-r border-stone-200 font-mono text-stone-700">
                      {room.soundSystemCost > 0 ? `৳${room.soundSystemCost.toLocaleString('bn-BD')}/-` : '—'}
                    </td>

                    <td className="p-3 text-center border-r border-stone-200 font-mono text-stone-700">
                      ৳{room.multimediaCost.toLocaleString('bn-BD')}/-
                    </td>

                    <td className="p-3 text-center font-mono text-stone-700">
                      ৳{room.projectorCost.toLocaleString('bn-BD')}/-
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Footnotes & Conditions under Official Table */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DDD0] space-y-2 text-xs font-sans text-stone-700">
            <h4 className="font-serif font-bold text-stone-900 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? 'মূল্য তালিকা সম্পর্কিত বিশেষ দ্রষ্টব্য:' : 'Important Rental Terms & Conditions:'}</span>
            </h4>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-5 list-disc text-stone-600 leading-relaxed">
              <li>{language === 'bn' ? 'উল্লেখিত সকল ভাড়ার সাথে ভ্যাট (VAT) অন্তর্ভুক্ত, ফলে সেবা গ্রহণকারীকে পৃথকভাবে ভ্যাট প্রদান করতে হবে না।' : 'All listed prices are VAT inclusive.'}</li>
              <li>{language === 'bn' ? 'প্রতিটি শিফটের নির্ধারিত সময়ের অতিরিক্ত ব্যবহারের জন্য প্রতি ঘণ্টা ১৫% হারে অতিরিক্ত ভাড়া প্রদান করতে হবে।' : 'Overtime usage will be charged at 15% per additional hour.'}</li>
              <li>{language === 'bn' ? 'কেন্দ্রের বাইরের খাবার আনা বা মিলনায়তন/শ্রেণীকক্ষের ভেতরে খাবার পরিবেশন করা সম্পূর্ণ নিষিদ্ধ।' : 'Outside food inside auditoriums or classrooms is strictly prohibited.'}</li>
              <li>{language === 'bn' ? 'ইন্টারনেট সংযোগ সর্বোচ্চ ৩টি ডিভাইসের জন্য ১,০০০/- টাকা। অতিরিক্ত প্রতিটি ডিভাইসের জন্য ২০০/- টাকা ফি প্রযোজ্য।' : 'Wi-Fi connectivity: BDT 1,000 for up to 3 devices, BDT 200 per extra device.'}</li>
              <li>{language === 'bn' ? 'খাবারের প্রয়োজন হলে বিএসকে ক্যাফেটেরিয়া (ফোন: ০১৭৬১-৪৯৬৪৭৬) থেকে কমপক্ষে ৩ দিন পূর্বে বুকিং দিতে হবে।' : 'Catering orders can be placed with BSK Cafeteria 3 days prior.'}</li>
              <li>{language === 'bn' ? 'বিশেষ প্রয়োজনে কর্তৃপক্ষের অনুমতিক্রমে রুম সেটআপ পরিবর্তন করা হলে অতিরিক্ত ফি প্রযোজ্য হতে পারে।' : 'Custom room setups require advance authorization.'}</li>
            </ul>
          </div>

          {/* Furniture & Banner Specification Table (as per official PDF) */}
          <div className="pt-4 space-y-4">
            <div className="border-b border-[#E8DDD0] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#1A1207]">
                {language === 'bn' ? 'আসবাবপত্র ও ব্যানার ফ্রেম সাইজ তালিকা' : 'Furniture & Banner Frame Specifications'}
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                {language === 'bn' ? 'কক্ষভেদে সরবরাহকৃত চেয়ার-টেবিল ও নির্ধারিত ব্যানার ঝুলানোর ফ্রেমের পরিমাপ।' : 'Official furniture allocation and banner dimensions for each room.'}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E8DDD0]">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-stone-900 font-serif font-bold border-b border-[#E8DDD0]">
                    <th className="p-3 border-r border-[#E8DDD0]">রুমের নাম ও নং</th>
                    <th className="p-3 border-r border-[#E8DDD0]">সরবরাহকৃত আসবাবপত্র (Furniture Provided)</th>
                    <th className="p-3">ব্যানার ফ্রেম সাইজ (Banner Frame Size)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {roomsData.map((room) => (
                    <tr key={room.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-3 border-r border-stone-200 font-serif font-bold text-[#1A1207] whitespace-nowrap">
                        {language === 'bn' ? `${room.titleBn} (রুম ${room.roomNo})` : `${room.titleEn} (R${room.roomNo})`}
                      </td>
                      <td className="p-3 border-r border-stone-200 text-stone-700">
                        {language === 'bn' ? room.furnitureBn : room.furnitureEn}
                      </td>
                      <td className="p-3 font-mono font-semibold text-[#8C6212]">
                        {language === 'bn' ? room.bannerSizeBn : room.bannerSizeEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* 4. SECTION: ROOM CARDS & VISUAL EXPLORER */}
      {(activeSection === 'all') && (
        <div className="space-y-6 pt-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] p-4 rounded-3xl border border-[#E8DDD0]">
            
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {language === 'bn' ? 'মিলনায়তন ও সেমিনার রুম গ্যালারি' : 'Visual Room Gallery'}
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                {language === 'bn' ? 'আপনার অনুষ্ঠানের ধরন অনুযায়ী রুম ফিল্টার করুন' : 'Filter spaces by type and capacity'}
              </p>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', bn: 'সবকটি', en: 'All' },
                { id: 'auditorium', bn: 'মিলনায়তন', en: 'Auditoriums' },
                { id: 'classroom', bn: 'শ্রেণীকক্ষ', en: 'Classrooms' },
                { id: 'gallery', bn: 'চিত্রশালা', en: 'Gallery' },
                { id: 'conference', bn: 'কনফারেন্স', en: 'Conference' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#B8862A] text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-[#B8862A]'
                  }`}
                >
                  {language === 'bn' ? c.bn : c.en}
                </button>
              ))}
            </div>

          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#B8862A] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badge */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img 
                      src={room.image} 
                      alt={room.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[#1A1207]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border border-white/20">
                      {language === 'bn' ? `রুম: ${room.roomNo} (${room.floorBn})` : `Room ${room.roomNo} (${room.floorEn})`}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-[#B8862A] text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
                      {language === 'bn' ? room.capacityBn : room.capacityEn}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-lg font-extrabold text-[#1A1207] group-hover:text-[#B8862A] transition-colors leading-snug">
                      {language === 'bn' ? room.titleBn : room.titleEn}
                    </h3>

                    <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
                      {language === 'bn' ? room.descriptionBn : room.descriptionEn}
                    </p>

                    {/* Rates Box */}
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">{language === 'bn' ? '১ শিফট ভাড়া:' : '1 Shift Rent:'}</span>
                        <span className="font-bold text-[#1A1207]">
                          ৳{room.singleShiftNonAc.toLocaleString('bn-BD')}/-
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-stone-200/60 pt-1">
                        <span className="text-stone-500">{language === 'bn' ? '২ শিফট একসাথে:' : '2 Shift Full Day:'}</span>
                        <span className="font-bold text-[#B8862A]">
                          ৳{room.doubleShiftNonAc.toLocaleString('bn-BD')}/-
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">

                  <button
                    onClick={() => {
                      setTargetRoom(room);
                      setBookingModalOpen(true);
                    }}
                    className="bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'আবেদন করুন' : 'Book Room'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}


      {/* 6. SECTION: OFFICIAL 18 RULES & REGULATIONS */}
      {(activeSection === 'all' || activeSection === 'rules') && (
        <div className="bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          
          <div className="flex items-center space-x-3 border-b border-[#E8DDD0] pb-4">
            <div className="p-3 bg-[#F7EFE5] text-[#8C6212] rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-extrabold text-[#1A1207]">
                {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের মিলনায়তন/কক্ষ ভাড়ার ১৮টি অফিশিয়াল নিয়মাবলী' : 'Bishwo Shahitto Kendro 18 Official Facility Rental Regulations'}
              </h2>
              <p className="text-xs text-stone-600 font-sans mt-0.5">
                {language === 'bn'
                  ? 'বিশ্বসাহিত্য কেন্দ্র মিলনায়তন ভাড়ার লিখিত নীতিমালা অনুযায়ী চূড়ান্ত বরাদ্দ প্রদান করা হয়।'
                  : 'Please review all terms and conditions before submitting hall rental applications.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(language === 'bn' ? officialRulesBn : officialRulesEn).map((rule, idx) => (
              <div 
                key={idx}
                className="p-4 bg-[#FAF8F5] border border-[#E8DDD0] rounded-2xl flex items-start space-x-3 hover:border-[#B8862A] transition-colors"
              >
                <span className="font-mono text-xs font-extrabold bg-[#1A1207] text-[#F0CC7A] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-[#B8862A]/40">
                  {(idx + 1).toLocaleString('bn-BD')}
                </span>
                <p className="text-xs font-sans text-stone-800 leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FAF2E6] border border-[#B8862A]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-xs font-sans gap-3">
            <div className="flex items-center space-x-2 text-stone-800">
              <AlertTriangle className="w-5 h-5 text-[#B8862A] shrink-0" />
              <span>
                {language === 'bn'
                  ? 'যেকোনো নিয়মাবলী সংক্রান্ত সহায়তার জন্য বিএসকে হল বুকিং ডেস্কের নম্বরে যোগাযোগ করুন।'
                  : 'For any policy clarifications, please contact the official BSK Booking Desk.'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <a 
                href="tel:01761496491"
                className="bg-[#B8862A] text-white px-3.5 py-2 rounded-xl font-bold font-mono hover:bg-[#9A6D1F] transition-all shrink-0 inline-flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>০১৭৬১-৪৯৬৪৯১</span>
              </a>
            </div>
          </div>

        </div>
      )}


      {/* 7. ONLINE BOOKING MODAL */}
      {bookingModalOpen && (
        <div 
          onClick={() => setBookingModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E8DDD0] rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative animate-scale-up my-8 cursor-default"
          >
            
            <button 
              onClick={() => setBookingModalOpen(false)}
              className="absolute right-5 top-5 p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="inline-block bg-[#F7EFE5] text-[#8C6212] px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase">
                {language === 'bn' ? 'অফিসিয়াল বুকিং আবেদনপত্র' : 'Official Booking Application'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {targetRoom ? (language === 'bn' ? targetRoom.titleBn : targetRoom.titleEn) : (language === 'bn' ? 'মিলনায়তন বুকিং আবেদন' : 'Hall Booking Request')}
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                {language === 'bn' ? 'তথ্য জমা দিলে বিএসকে হল বুকিং বিভাগ আপনার সাথে সরাসরি যোগাযোগ করবে।' : 'Submit details to request provisional availability.'}
              </p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3 bg-[#FAF2E6] border border-[#B8862A]/30 rounded-2xl text-[#8C6212]">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#B8862A]" />
                <h4 className="font-serif text-lg font-bold">
                  {language === 'bn' ? 'আবেদন সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}
                </h4>
                <p className="text-xs font-sans text-stone-700">
                  {language === 'bn' 
                    ? 'আপনার বুকিং ট্র্যাকিং শুরু হয়েছে। বিএসকে কর্মকর্তা শীঘ্রই প্রদত্ত ফোন নাম্বারে যোগাযোগ করবেন।' 
                    : 'A BSK officer will review availability and contact your provided phone number.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-sans">
                
                {/* Organization Name */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">
                    {language === 'bn' ? 'প্রতিষ্ঠান / সংগঠনের নাম (Organization Name):' : 'Organization Name:'}
                  </label>
                  <input 
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ঢাকা সাহিত্য সংসদ' : 'e.g. Acme Literary Society'}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A]"
                  />
                </div>

                {/* Applicant Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 block">
                      {language === 'bn' ? 'আবেদনকারীর নাম *:' : 'Applicant Name *:'}
                    </label>
                    <input 
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 block">
                      {language === 'bn' ? 'মোবাইল নম্বর *:' : 'Mobile Number *:'}
                    </label>
                    <input 
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#B8862A]"
                    />
                  </div>
                </div>

                {/* Event Title & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 block">
                      {language === 'bn' ? 'অনুষ্ঠানের বিষয়বস্তু / শিরোনাম *:' : 'Event Title / Subject *:'}
                    </label>
                    <input 
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: কবি কাজী নজরুল স্মরণসভা' : 'Event Title'}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 block">
                      {language === 'bn' ? 'অনুষ্ঠানের তারিখ:' : 'Event Date:'}
                    </label>
                    <input 
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-[#B8862A]"
                    />
                  </div>
                </div>

                {/* Shift Selection */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">
                    {language === 'bn' ? 'শিফট চয়ন:' : 'Shift Selection:'}
                  </label>
                  <select
                    value={shiftSelection}
                    onChange={(e: any) => setShiftSelection(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                  >
                    <option value="morning">{language === 'bn' ? 'সকাল শিফট (সকাল ৯:০০ - বেলা ২:০০)' : 'Morning Shift (9am - 2pm)'}</option>
                    <option value="evening">{language === 'bn' ? 'বিকাল শিফট (বিকাল ৪:০০ - রাত ৯:০০)' : 'Evening Shift (4pm - 9pm)'}</option>
                    <option value="both">{language === 'bn' ? 'উভয় শিফট একসাথে (সকাল ৯:০০ - রাত ৯:০০)' : 'Both Shifts Full Day (9am - 9pm)'}</option>
                  </select>
                </div>

                {/* Special Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">
                    {language === 'bn' ? 'বিশেষ কোনো চাহিদা থাকলে লিখুন:' : 'Special Requirements / Notes:'}
                  </label>
                  <textarea 
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ভিআইপি অতিথি থাকবেন, অতিরিক্ত ডায়াস প্রয়োজন ইত্যাদি' : 'Additional requirements...'}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#B8862A]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#B8862A] hover:bg-[#9A6D1F] text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{language === 'bn' ? 'আবেদনপত্র জমা দিন' : 'Submit Application'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
