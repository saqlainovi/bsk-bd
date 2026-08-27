import { ParsedPage, Language } from '../types';
import { 
  FileText, Landmark, Key, HeartHandshake, PhoneCall, Mail, Navigation, 
  MapPin, CheckCircle, HelpCircle, ArrowRight, ShieldAlert, Library, BookOpenCheck,
  Bell, Calendar, ArrowUpRight, Award, BookOpen, Truck, Sparkles, ChevronRight, Music, Image as ImageIcon, Compass, GraduationCap,
  Briefcase, Paperclip, Upload, X, LayoutGrid, List, History, Search, Download, ExternalLink, ChevronLeft, Eye,
  Clock, Info, Users, Coins, Coffee, Utensils, Building2
} from 'lucide-react';
import { 
  Tabs as AriaTabs, 
  TabList as AriaTabList, 
  Tab as AriaTab, 
  TabPanel as AriaTabPanel 
} from 'react-aria-components';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import { cpanelApi } from '../services/cpanelApi';
import { safeCacheData } from './cacheUtils';
import { newsItems as defaultNews, events as defaultEvents, notices as defaultNotices, defaultBlogPosts, defaultCirculars } from '../data/notices_data';
import { fallbackPress, photoAlbums } from '../data/press_data';
import { GoogleMapSection } from './GoogleMapSection';
import { NationwideExcellencePage } from './NationwideExcellencePage';
import { BookFairPage } from './BookFairPage';
import { AalorIshkoolPage } from './AalorIshkoolPage';
import { MobileLibraryPage } from './MobileLibraryPage';
import { CafePage } from './CafePage';
import { AuditoriumPage } from './AuditoriumPage';
import { BuildingPage } from './BuildingPage';
import { BookShopPage } from './BookShopPage';
import { PrimaryTeacherPage } from './PrimaryTeacherPage';
import { BangalirChintaPage } from './BangalirChintaPage';
import OfficialJobApplicationModal from './OfficialJobApplicationModal';
import { defaultPublicationStats, defaultPublicationSeriesList, defaultPublicationCatalogs, defaultPublicationGallery } from '../data/publicationDefaults';

interface PageContentProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string, extraData?: any) => void;
}

export default function PageContent({ page, language, onNavigate }: PageContentProps) {
  const [dbNotices, setDbNotices] = React.useState<any[]>([]);
  const [dbEvents, setDbEvents] = React.useState<any[]>([]);
  const [dbNewsItems, setDbNewsItems] = React.useState<any[]>([]);
  const [dbCirculars, setDbCirculars] = React.useState<any[]>(defaultCirculars);
  const [activeApplyCircular, setActiveApplyCircular] = React.useState<any | null>(null);
  const [activeModalCircular, setActiveModalCircular] = React.useState<any | null>(null);
  const [activeChintaSubject, setActiveChintaSubject] = React.useState<number>(0);

  // Library custom interactive states
  const [catalogSearchOpen, setCatalogSearchOpen] = React.useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = React.useState('');
  const [membershipModalOpen, setMembershipModalOpen] = React.useState(false);
  const [membershipSubmitted, setMembershipSubmitted] = React.useState(false);
  const [membershipSubmitting, setMembershipSubmitting] = React.useState(false);
  const [membershipError, setMembershipError] = React.useState('');
  const [membershipForm, setMembershipForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    duration: '1'
  });

  const [activeServiceIndex, setActiveServiceIndex] = React.useState<number>(0);

  // Organogram interactive states
  const [organogramTab, setOrganogramTab] = React.useState<'chart' | 'leadership' | 'departments'>('chart');
  const [selectedOrgNode, setSelectedOrgNode] = React.useState<string | null>(null);

  // At a Glance interactive categories state
  const [atAGlanceCategory, setAtAGlanceCategory] = React.useState<string>('all');
  const [atAGlanceSearch, setAtAGlanceSearch] = React.useState<string>('');

  // Alor Ishkul states
  const [alorCurriculumTab, setAlorCurriculumTab] = React.useState<string>('all');
  const [alorInquirySubmitted, setAlorInquirySubmitted] = React.useState(false);
  const [alorInquirySubmitting, setAlorInquirySubmitting] = React.useState(false);
  const [alorInquiryForm, setAlorInquiryForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    occupation: '',
    message: ''
  });
  const [alorInquiryError, setAlorInquiryError] = React.useState('');

  const handleAlorInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alorInquiryForm.name.trim() || !alorInquiryForm.phone.trim() || !alorInquiryForm.message.trim()) {
      setAlorInquiryError(language === 'bn' ? 'দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }

    setAlorInquirySubmitting(true);
    setAlorInquiryError('');

    try {
      await cpanelApi.addDoc('inquiries', {
        name: alorInquiryForm.name.trim(),
        phone: alorInquiryForm.phone.trim(),
        email: alorInquiryForm.email.trim(),
        message: alorInquiryForm.message.trim(),
        occupation: alorInquiryForm.occupation.trim(),
        type: 'aalor-ishkool',
        createdAt: new Date().toISOString()
      });
      setAlorInquirySubmitted(true);
    } catch (err: any) {
      console.error("Error submitting Alor Ishkul inquiry:", err);
      setAlorInquiryError(language === 'bn' ? 'সার্ভার ত্রুটি! আবার চেষ্টা করুন।' : 'Server error! Please try again.');
    } finally {
      setAlorInquirySubmitting(false);
    }
  };

  // Press & Media Center states
  const [dbPress, setDbPress] = React.useState<any[]>([]);
  const [dbAlbums, setDbAlbums] = React.useState<any[]>([]);
  const [searchPressQuery, setSearchPressQuery] = React.useState('');
  const [selectedPressCategory, setSelectedPressCategory] = React.useState<'All' | 'Press Release' | 'News' | 'Events' | 'Awards' | 'Publications'>('All');
  const [activePressItem, setActivePressItem] = React.useState<any | null>(null);
  const [selectedPhotoAlbum, setSelectedPhotoAlbum] = React.useState<string>('All');
  const [activePhoto, setActivePhoto] = React.useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = React.useState<number>(0);
  const [activeAlbumPhotos, setActiveAlbumPhotos] = React.useState<string[]>([]);

  // Publications states
  const [pubActiveTab, setPubActiveTab] = React.useState<number>(0);
  const [pubSelectedBook, setPubSelectedBook] = React.useState<any | null>(null);
  const [pubBookSearchQuery, setPubBookSearchQuery] = React.useState<string>('');
  const [pubInquiryForm, setPubInquiryForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [pubInquirySubmitted, setPubInquirySubmitted] = React.useState<boolean>(false);
  const [pubInquirySubmitting, setPubInquirySubmitting] = React.useState<boolean>(false);
  const [pubInquiryError, setPubInquiryError] = React.useState<string>('');

  // Facilities (Building/Halls) states
  const [facSelectedId, setFacSelectedId] = React.useState<string>('room_103');
  const [facActivePhotoIndex, setFacActivePhotoIndex] = React.useState<number>(0);
  const [facSearchQuery, setFacSearchQuery] = React.useState<string>('');
  const [facFloorFilter, setFacFloorFilter] = React.useState<string>('all');
  const [facTypeFilter, setFacTypeFilter] = React.useState<string>('all');
  const [facViewMode, setFacViewMode] = React.useState<'cards' | 'table'>('cards');

  const handlePubInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubInquiryForm.name.trim() || !pubInquiryForm.phone.trim() || !pubInquiryForm.message.trim()) {
      setPubInquiryError(language === 'bn' ? 'দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }
    setPubInquirySubmitting(true);
    setPubInquiryError('');
    try {
      await cpanelApi.addDoc('inquiries', {
        name: pubInquiryForm.name.trim(),
        phone: pubInquiryForm.phone.trim(),
        email: pubInquiryForm.email.trim(),
        subject: pubInquiryForm.subject.trim() || 'Publications Inquiry',
        message: pubInquiryForm.message.trim(),
        type: 'publication',
        createdAt: new Date().toISOString()
      });
      setPubInquirySubmitted(true);
      setPubInquiryForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err: any) {
      console.error("Error submitting publication inquiry:", err);
      setPubInquiryError(language === 'bn' ? 'সার্ভার ত্রুটি! আবার চেষ্টা করুন।' : 'Server error! Please try again.');
    } finally {
      setPubInquirySubmitting(false);
    }
  };

  const handleDownloadPhoto = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `bsk-photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `bsk-photo-${Date.now()}.jpg`);
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const libraryBooks = [
    { id: 1, title: 'গীতাঞ্জলি', author: 'রবীন্দ্রনাথ ঠাকুর', category: 'কাব্যগ্রন্থ', shelf: 'তাক নং: ১০২', titleEn: 'Gitanjali', authorEn: 'Rabindranath Tagore', categoryEn: 'Poetry', shelfEn: 'Shelf 102' },
    { id: 2, title: 'সঞ্চিতা', author: 'কাজী নজরুল ইসলাম', category: 'কাব্যগ্রন্থ', shelf: 'তাক নং: ১০৫', titleEn: 'Sanchita', authorEn: 'Kazi Nazrul Islam', categoryEn: 'Poetry', shelfEn: 'Shelf 105' },
    { id: 3, title: 'চরিত্রহীন', author: 'শরৎচন্দ্র চট্টোপাধ্যায়', category: 'উপন্যাস', shelf: 'তাক নং: ১০৮', titleEn: 'Choritrohin', authorEn: 'Sarat Chandra Chattopadhyay', categoryEn: 'Novel', shelfEn: 'Shelf 108' },
    { id: 4, title: 'দেবদাস', author: 'শরৎচন্দ্র চট্টোপাধ্যায়', category: 'উপন্যাস', shelf: 'তাক নং: ১০৯', titleEn: 'Devdas', authorEn: 'Sarat Chandra Chattopadhyay', categoryEn: 'Novel', shelfEn: 'Shelf 109' },
    { id: 5, title: 'পথের পাঁচালী', author: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', category: 'উপন্যাস', shelf: 'তাক নং: ১১২', titleEn: 'Pather Panchali', authorEn: 'Bibhutibhushan Bandyopadhyay', categoryEn: 'Novel', shelfEn: 'Shelf 112' },
    { id: 6, title: 'আজ হিমুর বিয়ে', author: 'হুমায়ূন আহমেদ', category: 'উপন্যাস', shelf: 'তাক নং: ১২৫', titleEn: 'Aj Himur Biye', authorEn: 'Humayun Ahmed', categoryEn: 'Fiction', shelfEn: 'Shelf 125' },
    { id: 7, title: 'দেয়াল', author: 'হুমায়ূন আহমেদ', category: 'ঐতিহাসিক উপন্যাস', shelf: 'তাক নং: ১২৮', titleEn: 'Deyal', authorEn: 'Humayun Ahmed', categoryEn: 'Historical Fiction', shelfEn: 'Shelf 128' },
    { id: 8, title: 'পদ্মা নদীর মাঝি', author: 'মানিক বন্দ্যোপাধ্যায়', category: 'উপন্যাস', shelf: 'তাক নং: ১৩০', titleEn: 'Padma Nadir Majhi', authorEn: 'Manik Bandyopadhyay', categoryEn: 'Novel', shelfEn: 'Shelf 130' },
    { id: 9, title: 'লালসালু', author: 'সৈয়দ ওয়ালীউল্লাহ', category: 'উপন্যাস', shelf: 'তাক নং: ১৩৫', titleEn: 'Lalsalu', authorEn: 'Syed Waliullah', categoryEn: 'Classic Novel', shelfEn: 'Shelf 135' },
    { id: 10, title: 'ছোটদের গল্পসমগ্র', author: 'সুকুমার রায়', category: 'শিশু-কিশোর', shelf: 'তাক নং: ১৪৫', titleEn: 'Chotoder Golposomogro', authorEn: 'Sukumar Ray', categoryEn: 'Children & Humor', shelfEn: 'Shelf 145' },
    { id: 11, title: 'মহাজাগতিক কিউরেটর', author: 'মুহম্মদ জাফর ইকবাল', category: 'সায়েন্স ফিকশন', shelf: 'তাক নং: ১৫২', titleEn: 'Mohajagoti Curator', authorEn: 'Muhammad Zafar Iqbal', categoryEn: 'Science Fiction', shelfEn: 'Shelf 152' },
    { id: 12, title: 'ব্রাদার্স কারামাজভ', author: 'ফিওদোর দস্তয়েভস্কি', category: 'অনূদিত বিশ্বসাহিত্য', shelf: 'তাক নং: ২০২', titleEn: 'The Brothers Karamazov', authorEn: 'Fyodor Dostoevsky', categoryEn: 'Translated Classics', shelfEn: 'Shelf 202' },
    { id: 13, title: 'শত বছরের নিঃসঙ্গতা', author: 'গ্যাব্রিয়েল গার্সিয়া মার্কেজ', category: 'অনূদিত বিশ্বসাহিত্য', shelf: 'তাক নং: ২০৮', titleEn: 'One Hundred Years of Solitude', authorEn: 'Gabriel García Márquez', categoryEn: 'Translated Classics', shelfEn: 'Shelf 208' },
    { id: 14, title: 'রিপাবলিক', author: 'প্লেটো', category: 'দর্শন', shelf: 'তাক নং: ২৫৫', titleEn: 'The Republic', authorEn: 'Plato', categoryEn: 'Philosophy', shelfEn: 'Shelf 255' },
    { id: 15, title: 'অরিজিন অব স্পিসিস', author: 'চার্লস ডারউইন', category: 'বিজ্ঞান ও বিবর্তন', shelf: 'তাক নং: ৩০১', titleEn: 'The Origin of Species', authorEn: 'Charles Darwin', categoryEn: 'Science & Nature', shelfEn: 'Shelf 301' }
  ];

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipForm.name.trim() || !membershipForm.phone.trim()) {
      setMembershipError(language === 'bn' ? 'অনুগ্রহ করে নাম এবং মোবাইল নম্বর প্রদান করুন।' : 'Please provide name and phone number.');
      return;
    }
    setMembershipSubmitting(true);
    setMembershipError('');
    try {
      await cpanelApi.addDoc('library_applications', {
        ...membershipForm,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setMembershipSubmitted(true);
      setMembershipForm({
        name: '',
        phone: '',
        email: '',
        occupation: '',
        address: '',
        duration: '1'
      });
      setTimeout(() => {
        setMembershipSubmitted(false);
        setMembershipModalOpen(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting membership form:", err);
      setMembershipError(language === 'bn' ? 'দুঃখিত, কোনো ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.');
    } finally {
      setMembershipSubmitting(false);
    }
  };

  // Grid / List View states
  const [noticesViewMode, setNoticesViewMode] = React.useState<'grid' | 'list'>('grid');
  const [eventsViewMode, setEventsViewMode] = React.useState<'grid' | 'list'>('grid');
  const [newsViewMode, setNewsViewMode] = React.useState<'grid' | 'list'>('grid');
  const [recruitmentViewMode, setRecruitmentViewMode] = React.useState<'grid' | 'list'>('grid');
  
  // Mobile Library custom states
  const [activeDivision, setActiveDivision] = React.useState<string>('dhaka');
  const [scheduleSearchQuery, setScheduleSearchQuery] = React.useState<string>('');
  
  // Apply Job form states
  const [applyFormSubmitted, setApplyFormSubmitted] = React.useState(false);
  const [applySubmitting, setApplySubmitting] = React.useState(false);
  const [applyError, setApplyError] = React.useState('');
  const [applyFormData, setApplyFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeUrl: '',
    resumeType: '',
    resumeName: ''
  });

  // Blog states
  const [dbBlogPosts, setDbBlogPosts] = React.useState<any[]>([]);
  const [dbBlogReviews, setDbBlogReviews] = React.useState<any[]>([]);
  const [dbBlogSettings, setDbBlogSettings] = React.useState<any>(null);
  const [activeModalBlogPost, setActiveModalBlogPost] = React.useState<any | null>(null);
  const [blogCategoryFilter, setBlogCategoryFilter] = React.useState<string>('all');
  const [blogSearchQuery, setBlogSearchQuery] = React.useState<string>('');

  // Review submission modal states
  const [reviewModalOpen, setReviewModalOpen] = React.useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = React.useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = React.useState<boolean>(false);
  const [reviewForm, setReviewForm] = React.useState({
    reviewerName: '',
    reviewerRole: '',
    bookTitle: '',
    rating: 5,
    category: 'বই সমালোচনা',
    content: ''
  });

  React.useEffect(() => {
    if (page.id !== 'recruitment' && page.id !== 'notice') return;

    const loadRecruitment = async () => {
      if (page.id !== 'recruitment' && page.id !== 'notice') return;
      try {
        const list = await cpanelApi.getCollection('recruitment_circulars');
        if (list && list.length > 0) {
          setDbCirculars(list);
          safeCacheData('cached_recruitment_circulars', list);
        } else {
          setDbCirculars(defaultCirculars);
        }
      } catch (err) {
        console.warn("cPanel Database recruitment_circulars error:", err);
      }
    };
    loadRecruitment();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'recruitment_circulars') {
        loadRecruitment();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, [page.id]);

  React.useEffect(() => {
    const loadPressAndAlbums = async () => {
      if (page.id !== 'press') return;
      try {
        const pressList = await cpanelApi.getCollection('press');
        pressList.sort((a, b) => {
          const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
          const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
          return dateB - dateA;
        });
        setDbPress(pressList);
        safeCacheData('cached_press', pressList);

        const albumsList = await cpanelApi.getCollection('photo_albums');
        setDbAlbums(albumsList);
        safeCacheData('cached_photo_albums', albumsList);
      } catch (err) {
        console.warn("cPanel Database press fetch error:", err);
      }
    };
    loadPressAndAlbums();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || ['press', 'photo_albums'].includes(e.detail.collection)) {
        loadPressAndAlbums();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, [page.id]);

  React.useEffect(() => {
    const loadBlogData = async () => {
      if (page.id !== 'blog') return;
      try {
        const settings = await cpanelApi.getDoc('blog_settings', 'header');
        if (settings) {
          setDbBlogSettings(settings);
          safeCacheData('cached_blog_settings', settings);
        }

        const posts = await cpanelApi.getCollection('blog_posts');
        setDbBlogPosts(posts);
        safeCacheData('cached_blog_posts', posts);

        const reviews = await cpanelApi.getCollection('blog_reviews');
        setDbBlogReviews(reviews);
        safeCacheData('cached_blog_reviews', reviews);
      } catch (err) {
        console.warn("cPanel Database blog fetch error:", err);
      }
    };
    loadBlogData();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || ['blog_posts', 'blog_reviews', 'blog_settings'].includes(e.detail.collection)) {
        loadBlogData();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, [page.id]);

  React.useEffect(() => {
    const loadNoticesData = async () => {
      if (page.id !== 'notice') return;
      try {
        const nList = await cpanelApi.getCollection('notices');
        setDbNotices(nList);
        const eList = await cpanelApi.getCollection('events');
        setDbEvents(eList);
        const nwList = await cpanelApi.getCollection('news_items');
        setDbNewsItems(nwList);
      } catch (err) {
        console.warn("cPanel Database notices fetch error:", err);
      }
    };
    loadNoticesData();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || ['notices', 'events', 'news_items'].includes(e.detail.collection)) {
        loadNoticesData();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, [page.id]);

  const notices = dbNotices.length > 0 ? dbNotices : defaultNotices;
  const events = dbEvents.length > 0 ? dbEvents : defaultEvents;
  const newsItems = dbNewsItems.length > 0 ? dbNewsItems : defaultNews;

  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [formData, setFormData] = React.useState({ 
    name: '', 
    email: '', 
    message: '', 
    type: 'contact' as 'contact' | 'membership' | 'auditorium' 
  });
  const [activePillarIdx, setActivePillarIdx] = React.useState(0);
  const [aboutSubTab, setAboutSubTab] = React.useState<'mission' | 'history' | 'achievements'>('mission');
  const [aboutGalleryIndex, setAboutGalleryIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setAboutGalleryIndex(0);
  }, [aboutSubTab]);

  const [activeModalNotice, setActiveModalNotice] = React.useState<any | null>(null);
  const [contactBlock, setContactBlock] = React.useState<any>(null);
  const [mediaContactBlock, setMediaContactBlock] = React.useState<any>(null);
  const [pressSettingsBlock, setPressSettingsBlock] = React.useState<any>(null);
  const [pressDownloadsBlock, setPressDownloadsBlock] = React.useState<any>(null);

  React.useEffect(() => {
    const loadBlocks = async () => {
      const contactData = await cpanelApi.getDoc('homepage_blocks', 'contact_info');
      if (contactData) setContactBlock(contactData);

      const mediaData = await cpanelApi.getDoc('homepage_blocks', 'media_contact');
      if (mediaData) setMediaContactBlock(mediaData);

      const pressSetData = await cpanelApi.getDoc('homepage_blocks', 'press_settings');
      if (pressSetData) setPressSettingsBlock(pressSetData);

      const pressDownData = await cpanelApi.getDoc('homepage_blocks', 'press_downloads');
      if (pressDownData) setPressDownloadsBlock(pressDownData);
    };
    loadBlocks();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'homepage_blocks') {
        loadBlocks();
      }
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setErrorText('');

    try {
      await cpanelApi.addDoc('inquiries', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        type: formData.type,
        createdAt: new Date().toISOString()
      });

      setFormSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        message: '', 
        type: 'contact' 
      });

      setTimeout(() => {
        setFormSubmitted(false);
      }, 7000);
    } catch (err) {
      console.error('Error submitting inquiry to cPanel Database:', err);
      const friendlyError = language === 'bn'
        ? 'দুঃখিত, আপনার বার্তাটি পাঠানো সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।'
        : 'Could not send message. Please verify your connection or try again.';
      setErrorText(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultMediaContact = {
    coordinator_title_bn: "মিডিয়া কো-অর্ডিনেটর",
    coordinator_title_en: "Media Liaison Coordinator",
    coordinator_name_bn: "মাহমুদ হাসান রাজু",
    coordinator_name_en: "Mahmud Hasan Raju",
    coordinator_role_bn: "যুগ্ম পরিচালক (তথ্য ও জনসংযোগ)",
    coordinator_role_en: "Joint Director (Public Relations)",
    coordinator_email: "raju@bskbd.org",
    coordinator_phone: "+8801711135432",
    office_label_bn: "কেন্দ্রীয় কার্যালয়:",
    office_label_en: "Central Corporate Desk:",
    office_value_bn: "বিশ্বসাহিত্য কেন্দ্র, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০।",
    office_value_en: "Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000.",
    hours_label_bn: "মিডিয়া ডেস্ক অফিস সময়:",
    hours_label_en: "Media Desks Duty Hours:",
    hours_value_bn: "শনিবার থেকে বুধবার: সকাল ১০:০০ টা থেকে সন্ধ্যা ৬:০০ টা",
    hours_value_en: "Saturday to Wednesday: 10:00 AM to 6:00 PM (GMT +6)",
    note_bn: "মহামারী ও ছুটির দিনে প্রেস ব্রিফিং ভার্চুয়ালি অনুষ্ঠিত হবে।",
    note_en: "Special holiday press briefings scheduled virtually upon email notification."
  };

  const mediaContact = React.useMemo(() => {
    const merged: Record<string, any> = {
      ...defaultMediaContact,
      ...(page.mediaContactData || {}),
      ...(mediaContactBlock || {})
    };
    Object.keys(defaultMediaContact).forEach((key) => {
      if (!merged[key] || (typeof merged[key] === 'string' && !merged[key].trim())) {
        merged[key] = (defaultMediaContact as any)[key];
      }
    });
    return merged;
  }, [page.mediaContactData, mediaContactBlock]);

  return (
    <div className="space-y-8 animate-fade-in text-[#1A1207]">
      {/* Page Header banner */}
      {page.id !== 'press' && page.id !== 'blog' && page.id !== 'central-library' && page.id !== 'mobile-library' && page.id !== 'reading-habit' && page.id !== 'aalor-ishkool' && page.id !== 'nationwide-excellence' && page.id !== 'book-fair' && page.id !== 'bookshop' && page.id !== 'auditorium' && page.id !== 'facilities' && page.id !== 'cafe' && page.id !== 'building' && page.id !== 'publication' && page.id !== 'bangalir_chinta' && page.id !== 'bangalir-chinta' && page.id !== 'trustees' && (
        <div className="border-b border-[#B8862A]/20 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#1A1207] tracking-tight">
                {language === 'bn' ? page.title_bn : page.title_en}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Special conditional layout for At-a-Glance table details with classic literary and editorial design */}
      {page.id === 'ataglance' && page.key_facts && (() => {
        // High-fidelity translations to support seamless English bilingual presentation
        const labelTranslations: Record<string, string> = {
          "প্রতিষ্ঠা": "Year of Establishment",
          "নিবন্ধন": "Government Registration Bureau",
          "অর্থের উৎস (স্থানীয়)": "Funding Sources (Local)",
          "অর্থের উৎস (বিদেশী)": "Funding Sources (Foreign/Development)",
          "বিসাকে-র বৈদেশিক শাখা": "International Branches of BSK",
          "ট্রাস্টি বোর্ডের সদস্য": "Board of Trustees Membership",
          "নিয়মিত কর্মী": "Permanent Full-time Staff",
          "নিয়মিত সেচ্ছাসেবক/ স্কুল সংগঠক": "Active School Organizers & Volunteers",
          "অনিয়মিত সেচ্ছাসেবক": "General Assembly Volunteers",
          "বাৎসরিক বাজেট (টাকা)": "Annual Operational Budget (BDT)",
          "প্রকল্প": "Active Core Programs & Projects",
          "নিবন্ধিত সদস্য (প্রধানত ছাত্র/ছাত্রী) (ক্রমপুঞ্জিত সংখ্যা)": "Registered Readers (Cumulative)",
          "নিবন্ধিত সদস্য (বর্তমান সংখ্যা)": "Active Registered Members (Current)",
          "অন্তর্ভূক্ত স্কুল ও কলেজের সংখ্যা": "Partner Schools & Colleges Network",
          "স্কুল ও কলেজ প্রোগ্রামে বইয়ের সংখ্যা": "Book Reserve (School & College Programs)",
          "মূল লাইব্রেরিতে বইয়ের সংখ্যা": "Central Library Book Reserves",
          "লাইব্রেরি ব্যবহারকারীর সংখ্যা/ প্রতি বছর": "Annual Central Library Visitors",
          "ভ্রাম্যমাণ লাইব্রেরিতে বইয়ের সংখ্যা": "Mobile Library Bus Book Reserve",
          "ভ্রাম্যমাণ লাইব্রেরির সদস্য সংখ্যা": "Mobile Library Registered Readers",
          "অন্তর্ভূক্ত জেলা (দেশভিত্তিক উৎকর্ষ কার্যক্রম)": "Districts Covered (Enrichment Program)",
          "অন্তর্ভূক্ত জেলা (ভ্রাম্যমাণ লাইব্রেরি)": "Districts Covered (Mobile Library Network)",
          "অন্তর্ভূক্ত উপজেলা (ভ্রাম্যমাণ লাইব্রেরি)": "Upazilas Covered (Mobile Library Network)"
        };

        const valueTranslations: Record<string, string> = {
          "১৯৭৮": "1978",
          "সমাজকল্যাণ অধিদপ্তর ও এনজিও বিষয়ক ব্যুরো": "Department of Social Services & NGO Affairs Bureau",
          "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, এনজিও, আর্থিক ও ব্যবসা প্রতিষ্ঠান, ব্যক্তি বিশেষ": "Government of the People's Republic of Bangladesh, Corporate CSR, NGOs, Financial Institutions, and Private Patrons",
          "রাজকীয় নরওয়ে দূতাবাস, রাজকীয় ডেনমার্ক দূতাবাস, বিশ্ব ব্যাংক, মানুষের জন্য ফাউন্ডেশান, রামোন ম্যাগসেসে ফাউন্ডেশান, সাউথ-এশিয়া পার্টনারশীপ, সিটি গ্রুপ ফাউন্ডেশান": "Royal Norwegian Embassy, Royal Danish Embassy, The World Bank, Manusher Jonno Foundation, Ramon Magsaysay Foundation, South Asia Partnership, Citi Foundation",
          "লন্ডন ও নিউইয়র্ক (সীমিত কর্মকান্ড)": "London & New York (Limited cultural programs)",
          "১১": "11 Members",
          "২৯০": "290 Employees",
          "১৪০০০": "14,000 Volunteers",
          "৩০০০": "3,000 Volunteers",
          "৩০০ মিলিয়ন": "300 Million BDT",
          "৯": "9 Core Projects",
          "১৪.২ মিলিয়ন": "14.2 Million",
          "২২,০০,০০০": "2.2 Million Active Readers",
          "১৪,২৬৬": "14,266 Educational Institutions",
          "১০ মিলিয়ন": "10 Million Books",
          "২০০,০০০": "200,000 Volumes",
          "১৫,০০০": "15,000 Visitors",
          "৪৩০,০০০": "430,000 Volumes",
          "৩০০,০০০": "300,000 Active Members",
          "৬৪": "64 (All Districts Nationwide)",
          "৫৮": "58 Districts",
          "২৫০": "250 Upazilas"
        };

        const getFactValue = (label: string, defaultValue: string) => {
          const fact = page.key_facts?.find((f: any) => f.label === label);
          return fact ? fact.value : defaultValue;
        };

        const categories = [
          {
            titleBn: "১. প্রাতিষ্ঠানিক পরিচিতি ও পরিচালনা",
            titleEn: "1. Institutional Identity & Governance",
            icon: Landmark,
            items: [
              { label: "প্রতিষ্ঠা", value: getFactValue("প্রতিষ্ঠা", "১৯৭৮") },
              { label: "নিবন্ধন", value: getFactValue("নিবন্ধন", "সমাজকল্যাণ অধিদপ্তর ও এনজিও বিষয়ক ব্যুরো") },
              { label: "ট্রাস্টি বোর্ডের সদস্য", value: getFactValue("ট্রাস্টি বোর্ডের সদস্য", "১১") },
              { label: "নিয়মিত কর্মী", value: getFactValue("নিয়মিত কর্মী", "২৯০") },
            ]
          },
          {
            titleBn: "২. পাঠক, সদস্য ও ভলান্টিয়ার নেটওয়ার্ক",
            titleEn: "2. Reader & Volunteer Network",
            icon: Users,
            items: [
              { label: "নিবন্ধিত সদস্য (প্রধানত ছাত্র/ছাত্রী) (ক্রমপুঞ্জিত সংখ্যা)", value: getFactValue("নিবন্ধিত সদস্য (প্রধানত ছাত্র/ছাত্রী) (ক্রমপুঞ্জিত সংখ্যা)", "১৪.২ মিলিয়ন") },
              { label: "নিবন্ধিত সদস্য (বর্তমান সংখ্যা)", value: getFactValue("নিবন্ধিত সদস্য (বর্তমান সংখ্যা)", "২২,০০,০০০") },
              { label: "নিয়মিত সেচ্ছাসেবক/ স্কুল সংগঠক", value: getFactValue("নিয়মিত সেচ্ছাসেবক/ স্কুল সংগঠক", "১৪০০০") },
              { label: "অনিয়মিত সেচ্ছাসেবক", value: getFactValue("অনিয়মিত সেচ্ছাসেবক", "৩০০০") },
            ]
          },
          {
            titleBn: "৩. দেশব্যাপী লাইব্রেরি ও ভৌগোলিক পরিধি",
            titleEn: "3. Nationwide Library Footprint",
            icon: MapPin,
            items: [
              { label: "অন্তর্ভূক্ত জেলা (দেশভিত্তিক উৎকর্ষ কার্যক্রম)", value: getFactValue("অন্তর্ভূক্ত জেলা (দেশভিত্তিক উৎকর্ষ কার্যক্রম)", "৬৪") },
              { label: "অন্তর্ভূক্ত জেলা (ভ্রাম্যমাণ লাইব্রেরি)", value: getFactValue("অন্তর্ভূক্ত জেলা (ভ্রাম্যমাণ লাইব্রেরি)", "৫৮") },
              { label: "অন্তর্ভূক্ত উপজেলা (ভ্রাম্যমাণ লাইব্রেরি)", value: getFactValue("অন্তর্ভূক্ত উপজেলা (ভ্রাম্যমাণ লাইব্রেরি)", "২৫০") },
              { label: "অন্তর্ভূক্ত স্কুল ও কলেজের সংখ্যা", value: getFactValue("অন্তর্ভূক্ত স্কুল ও কলেজের সংখ্যা", "১৪,২৬৬") },
            ]
          },
          {
            titleBn: "৪. গ্রন্থ সম্পদ ও লাইব্রেরি ভাণ্ডার",
            titleEn: "4. Book Reserves & Resources",
            icon: BookOpen,
            items: [
              { label: "স্কুল ও college প্রোগ্রামে বইয়ের সংখ্যা", value: getFactValue("স্কুল ও কলেজ প্রোগ্রামে বইয়ের সংখ্যা", "১০ মিলিয়ন") },
              { label: "ভ্রাম্যমাণ লাইব্রেরিতে বইয়ের সংখ্যা", value: getFactValue("ভ্রাম্যমাণ লাইব্রেরিতে বইয়ের সংখ্যা", "৪৩০,০০০") },
              { label: "ভ্রাম্যমাণ লাইব্রেরির সদস্য সংখ্যা", value: getFactValue("ভ্রাম্যমাণ লাইব্রেরির সদস্য সংখ্যা", "৩০০,০০০") },
              { label: "মূল লাইব্রেরিতে বইয়ের সংখ্যা", value: getFactValue("মূল লাইব্রেরিতে বইয়ের সংখ্যা", "২০০,০০০") },
              { label: "লাইব্রেরি ব্যবহারকারীর সংখ্যা/ প্রতি বছর", value: getFactValue("লাইব্রেরি ব্যবহারকারীর সংখ্যা/ প্রতি বছর", "১৫,০০০") },
            ]
          },
          {
            titleBn: "৫. বাজেট, অর্থায়ন ও প্রকল্প",
            titleEn: "5. Budget, Finance & Programs",
            icon: Coins,
            items: [
              { label: "বাৎসরিক বাজেট (টাকা)", value: getFactValue("বাৎসরিক বাজেট (টাকা)", "৩০০ মিলিয়ন") },
              { label: "প্রকল্প", value: getFactValue("প্রকল্প", "৯") },
              { label: "অর্থের উৎস (স্থানীয়)", value: getFactValue("অর্থের উৎস (স্থানীয়)", "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, এনজিও, আর্থিক ও ব্যবসা প্রতিষ্ঠান, ব্যক্তি বিশেষ") },
              { label: "অর্থের উৎস (বিদেশী)", value: getFactValue("অর্থের উৎস (বিদেশী)", "রাজকীয় নরওয়ে দূতাবাস, রাজকীয় ডেনমার্ক দূতাবাস, বিশ্ব ব্যাংক, মানুষের জন্য ফাউন্ডেশান, রামোন ম্যাগসেসে ফাউন্ডেশান, সাউথ-এশিয়া পার্টনারশীপ, সিটি গ্রুপ ফাউন্ডেশান") },
              { label: "বিসাকে-র বৈদেশিক শাখা", value: getFactValue("বিসাকে-র বৈদেশিক শাখা", "লন্ডন ও নিউইয়র্ক (সীমিত কর্মকান্ড)") },
            ]
          }
        ];

        return (
          <div className="w-full text-left animate-fade-in" id="ataglance_container">
            {/* Structured Categories Table */}
            <div className="bg-white border border-[#B8862A]/40 rounded-xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#FAF6F0] border-b-2 border-[#B8862A]">
                      <th className="px-4 py-3 text-xs md:text-sm font-serif font-bold text-[#1A1207] w-14 text-center border-r border-[#B8862A]/30 select-none">
                        {language === 'bn' ? 'নং' : 'Sl.'}
                      </th>
                      <th className="px-4 py-3 text-xs md:text-sm font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/30 min-w-[150px]">
                        {language === 'bn' ? 'বিবরণ / সূচক' : 'Indicator / Metric'}
                      </th>
                      <th className="px-4 py-3 text-xs md:text-sm font-serif font-bold text-[#1A1207] min-w-[250px]">
                        {language === 'bn' ? 'তথ্য / পরিসংখ্যান' : 'Information / Stats'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, categoryIdx) => {
                      const CategoryIcon = category.icon;
                      return (
                        <React.Fragment key={categoryIdx}>
                          {/* Category Banner Row spanning all columns */}
                          <tr className="bg-[#FCFBF7] border-y border-[#B8862A]/30">
                            <td colSpan={3} className="px-4 py-2.5 bg-[#FAF6F0]/80">
                              <div className="flex items-center gap-2 text-[#1A1207]">
                                <CategoryIcon className="h-4 w-4 text-[#B8862A] shrink-0" />
                                <span className="font-serif text-xs md:text-sm font-extrabold tracking-tight">
                                  {language === 'bn' ? category.titleBn : category.titleEn}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Category Items */}
                          {category.items.map((item, itemIdx) => {
                            const labelText = language === 'bn' ? item.label : (labelTranslations[item.label] || item.label);
                            const valueText = language === 'bn' ? item.value : (valueTranslations[item.value] || item.value);
                            return (
                              <tr 
                                key={itemIdx} 
                                className="border-b border-[#B8862A]/20 hover:bg-[#FCFBF7]/50 transition-colors odd:bg-white even:bg-[#FAF6F0]/10"
                              >
                                {/* Serial Number */}
                                <td className="px-4 py-3 text-xs font-mono text-stone-500 text-center border-r border-[#B8862A]/20">
                                  {categoryIdx + 1}.{itemIdx + 1}
                                </td>
                                
                                {/* Label / Metric */}
                                <td className="px-4 py-3 text-xs md:text-sm font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/20 select-text leading-relaxed">
                                  {labelText}
                                </td>
                                
                                {/* Value / Info */}
                                <td className="px-4 py-3 text-xs md:text-sm font-sans font-medium text-stone-900 leading-relaxed select-text">
                                  {valueText}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Rendering standard page sections list */}
      {page.id === 'home' ? (() => {
        const introImageAlign = page.intro_image_align || 'right';
        const introImageWidth = page.intro_image_width || '180px';
        const historyImageAlign = page.history_image_align || 'right';
        const historyImageWidth = page.history_image_width || '150px';
        const achievementsImageAlign = page.achievements_image_align || 'right';
        const achievementsImageWidth = page.achievements_image_width || '150px';
        return (
          <div className="space-y-12">
            
            {/* Introductory highlight */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-[#B8862A]/5 to-transparent border-l-4 border-[#B8862A] px-5 py-5 rounded-r-xl max-w-4xl">
              {page.intro_image && introImageAlign !== 'none' && (introImageAlign === 'left' || introImageAlign === 'center') && (
                <div className={`flex-shrink-0 ${introImageAlign === 'center' ? 'w-full flex justify-center' : ''}`} style={{ width: introImageAlign !== 'center' ? introImageWidth : undefined }}>
                  <img src={page.intro_image} className="rounded-xl shadow-md border border-[#E8DDD0] max-h-60 object-cover w-full" alt="BSK Introduction" referrerPolicy="no-referrer" />
                </div>
              )}
              
              <div className="flex-1 space-y-3">
                <p className="text-sm md:text-base text-stone-800 leading-relaxed font-serif italic whitespace-pre-line">
                  {language === 'bn' 
                    ? (page.intro_text_bn || "“চিত্তের আলোয় দূর হোক অন্ধকার”— মানব চিত্তের সামগ্রিক বিকাশ ও দেশব্যাপী আলোকিত মানুষ গড়ার প্রত্যয়ে গত ৪৬ বছর ধরে এক অনন্য আন্দোলনে ব্রত বিশ্বসাহিত্য কেন্দ্র।")
                    : (page.intro_text_en || "“Let there be light in our minds”— Bishwo Shahitto Kendro is an extraordinary national movement dedicated to enriching humane qualities and cultivating enlightenment for over 46 years.")
                  }
                </p>
              </div>

              {page.intro_image && introImageAlign === 'right' && (
                <div className="flex-shrink-0" style={{ width: introImageWidth }}>
                  <img src={page.intro_image} className="rounded-xl shadow-md border border-[#E8DDD0] max-h-60 object-cover w-full" alt="BSK Introduction" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

          {/* ────── HISTORIC PILLARS: MISSION, HISTORY & ACHIEVEMENTS WITH MINI-GALLERY ────── */}
          <div className="space-y-6 pt-4 text-left">
            <div className="border-b border-[#B8862A]/15 pb-2 text-left">
              <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                <span>{language === 'bn' ? 'সংস্থার ব্রত, ইতিহাস ও অর্জনসমূহ' : 'Our Mission, History & Achievements'}</span>
              </h3>
              <p className="text-xs text-[#6B5135] mt-1 font-serif">
                {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের মূল দর্শন, ৪ দশকের বেশি দীর্ঘ পথচলা এবং প্রাপ্ত অনন্য অর্জনসমূহ জানতে নিচের ট্যাবগুলোতে ক্লিক করুন।' : 'Click the tabs below to explore our core philosophies, 4-decade long history, and stellar milestones.'}
              </p>
            </div>

            <div className="p-1 bg-[#1A1207]/5 border border-[#B8862A]/20 rounded-xl grid grid-cols-3 max-w-2xl">
              <button
                onClick={() => setAboutSubTab('mission')}
                className={`py-2 px-3 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
                  aboutSubTab === 'mission'
                    ? 'bg-[#B8862A] text-stone-950 shadow-sm'
                    : 'text-stone-700 hover:text-[#B8862A] hover:bg-[#B8862A]/5'
                }`}
              >
                {language === 'bn' ? 'ব্রত ও লক্ষ্য' : 'Mission & Vision'}
              </button>
              <button
                onClick={() => setAboutSubTab('history')}
                className={`py-2 px-3 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
                  aboutSubTab === 'history'
                    ? 'bg-[#B8862A] text-stone-950 shadow-sm'
                    : 'text-stone-700 hover:text-[#B8862A] hover:bg-[#B8862A]/5'
                }`}
              >
                {language === 'bn' ? 'ইতিহাস ও যাত্রা' : 'History & Journey'}
              </button>
              <button
                onClick={() => setAboutSubTab('achievements')}
                className={`py-2 px-3 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer ${
                  aboutSubTab === 'achievements'
                    ? 'bg-[#B8862A] text-stone-950 shadow-sm'
                    : 'text-stone-700 hover:text-[#B8862A] hover:bg-[#B8862A]/5'
                }`}
              >
                {language === 'bn' ? 'অর্জিত সম্মান ও পুরস্কার' : 'Achievements'}
              </button>
            </div>

            {/* Side-by-side Layout: Text Content on Left (7 cols), Mini-Gallery on Right (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Description Panel */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs relative overflow-hidden text-left h-full flex flex-col justify-between min-h-[340px]">
                  <AnimatePresence mode="wait">
                    {aboutSubTab === 'mission' && (
                      <motion.div
                        key="mission-sub"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 flex-1"
                      >
                        <div className="flex items-center space-x-2 text-[#B8862A]">
                          <Compass className="h-5 w-5" />
                          <h4 className="font-serif font-bold text-base text-[#1A1207]">
                            {language === 'bn' ? 'জাতীয় চিত্তের আলোকায়ন ও আমাদের ব্রত' : 'Our Vow & National Educational Mission'}
                          </h4>
                        </div>
                        <div className="text-stone-800 text-sm md:text-base leading-relaxed space-y-3 font-sans">
                          <p>
                            {language === 'bn'
                              ? page.sections?.[0]?.content?.[0] || "অনেক ত্যাগ-তিতিক্ষা ও আত্মদানের ভিতর দিয়ে জন্ম নিয়েছে বাংলাদেশ। আজ তার নির্মাণের পর্ব। এই নির্মাণকে অর্থময় করার জন্যে আজ দেশে চাই অনেক সম্পন্ন মানুষ; সেইসব মানুষ যারা উচ্চ-মূল্যবোধসম্পন্ন, আলোকিত, উদার, শক্তিমান ও কার্যকর- যারা জাতীয়-জীবনের বিভিন্ন অঙ্গনে নেতৃত্ব দিয়ে এই জাতিকে সমৃদ্ধির পথে এগিয়ে নিতে পারবে। তাদের আজ পেতে হবে আমাদের বিপুল সংখ্যায়- সারা দেশে, সবখানে। এককে-দশকে নয়; সহস্রে, লক্ষে।"
                              : "Bangladesh was born through immense sacrifice, and now is the era of active nation-building. To make this achievement meaningful, we need enlightened, values-driven, and active human beings across all sectors who can lead our country towards prosperity in immense numbers."
                            }
                          </p>
                          <p className="border-l-2 border-[#B8862A]/30 pl-4 italic text-stone-700 font-serif">
                            {language === 'bn'
                              ? page.sections?.[0]?.content?.[1] || "“সারা দেশের সবখানে পর্যাপ্ত সংখ্যায় এইসব আলোকিত, কার্যকর ও উচ্চমূল্যবোধ সম্পন্ন মানুষ গড়ে তোলার সুযোগ সৃষ্টি করা, জাতীয় শক্তি হিশেবে তাদের সংঘবদ্ধ ও সমুন্নত করা এবং এরই পাশাপাশি দেশের মানুষের চিত্তের সামগ্রিক আলোকায়ন ঘটানো বিশ্বসাহিত্য কেন্দ্রের মূল লক্ষ্য।”"
                              : "“To build enlightened, effective, and values-driven human beings across our country, unifying them as a strong national resource, is the ultimate goal of Bishwo Shahitto Kendro.”"
                            }
                          </p>
                          {(page.sections?.[0]?.content || []).slice(2).map((paraText, pIdx) => (
                            <p key={pIdx}>{paraText}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {aboutSubTab === 'history' && (
                      <motion.div
                        key="history-sub"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 flex-1"
                      >
                        <div className="flex items-center space-x-2 text-[#B8862A]">
                          <History className="h-5 w-5" />
                          <h4 className="font-serif font-bold text-base text-[#1A1207]">
                            {language === 'bn' ? 'একটি ছোট্ট পাঠচক্র থেকে দেশব্যাপী আন্দোলন' : 'From a Tiny Reading Circle to a National Movement'}
                          </h4>
                        </div>
                        
                        <div className={`flex flex-col gap-4 ${page.history_image && historyImageAlign === 'left' ? 'sm:flex-row' : page.history_image && historyImageAlign === 'right' ? 'sm:flex-row-reverse' : 'flex-col'}`}>
                          {page.history_image && historyImageAlign !== 'none' && (
                            <div className={`flex-shrink-0 ${historyImageAlign === 'center' ? 'w-full flex justify-center' : ''}`} style={{ width: historyImageAlign !== 'center' ? historyImageWidth : undefined }}>
                              <img src={page.history_image} className="rounded-xl shadow-xs border border-[#E8DDD0] max-h-56 object-cover w-full" alt="BSK History" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-1 text-stone-800 text-sm md:text-base leading-relaxed space-y-3 font-sans">
                            {(page.sections?.[1]?.content || []).map((paraText, pIdx) => (
                              <p key={pIdx}>{paraText}</p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {aboutSubTab === 'achievements' && (
                      <motion.div
                        key="achievements-sub"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 flex-1"
                      >
                        <div className="flex items-center space-x-2 text-[#B8862A]">
                          <Award className="h-5 w-5" />
                          <h4 className="font-serif font-bold text-base text-[#1A1207]">
                            {language === 'bn' ? 'অর্জিত মাইলফলক ও জাতীয় আন্তর্জাতিক সম্মাননা' : 'Our Significant Milestones & Global Accolades'}
                          </h4>
                        </div>
                        
                        <div className={`flex flex-col gap-4 ${page.achievements_image && achievementsImageAlign === 'left' ? 'sm:flex-row' : page.achievements_image && achievementsImageAlign === 'right' ? 'sm:flex-row-reverse' : 'flex-col'}`}>
                          {page.achievements_image && achievementsImageAlign !== 'none' && (
                            <div className={`flex-shrink-0 ${achievementsImageAlign === 'center' ? 'w-full flex justify-center' : ''}`} style={{ width: achievementsImageAlign !== 'center' ? achievementsImageWidth : undefined }}>
                              <img src={page.achievements_image} className="rounded-xl shadow-xs border border-[#E8DDD0] max-h-56 object-cover w-full" alt="BSK Achievements" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-1 text-stone-800 text-sm md:text-base leading-relaxed space-y-3 font-sans">
                            <p>
                              {language === 'bn'
                                ? page.sections?.[2]?.content?.[0] || "গত ৪ দশকের অধিক সময় ধরে বিশ্বসাহিত্য কেন্দ্র স্কুল ও কলেজের প্রায় ৯০,০০,০০০ (নব্বই লক্ষ) ছাত্রছাত্রী ও সাধারণ পাঠককে সমৃদ্ধ এবং আলোকিত মননশীল কর্মকাণ্ডে সম্পৃক্ত করেছে। বিশ্বসাহিত্য কেন্দ্র ও এর প্রতিষ্ঠাতা অধ্যাপক আবদুল্লাহ আবু সায়ীদ বিভিন্ন মহৎ কর্মের স্বীকৃতিস্বরূপ জাতীয় ও আন্তর্জাতিক পর্যায়ে একাধিক বিরল সম্মানে ভূষিত হয়েছেন।"
                                : "For over 40 years, over 9 million active students and citizens have engaged in our enrichment activities. BSK and its founder Prof. Abdullah Abu Sayeed have been honored with numerous prestigious national and global certifications, including:"
                              }
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                              <div className="p-3 bg-[#B8862A]/5 border border-[#B8862A]/15 rounded-xl">
                                <span className="font-serif font-bold text-[11px] text-[#B8862A] block uppercase tracking-wider">
                                  {language === 'bn' ? 'জ্যান অ্যামোস কমিনিয়াস পদক ২০০৮' : 'UNESCO Comenius Medal 2008'}
                                </span>
                                <p className="text-[11px] text-[#6B5135] mt-1 leading-relaxed">
                                  {language === 'bn'
                                    ? "ইউনেস্কোর সবচেয়ে সম্মানসূচক পদক, যা সাধারণ জনগণের মাঝে বইপড়ার চমৎকার আন্দোলনের স্বীকৃতিস্বরূপ বিশ্বসাহিত্য কেন্দ্রকে প্রদান করা হয়েছে।"
                                    : "The highly elite UNESCO prize awarded to BSK for creating unique and successful habits of mass book reading nationwide."
                                  }
                                </p>
                              </div>
                              <div className="p-3 bg-[#B8862A]/5 border border-[#B8862A]/15 rounded-xl">
                                <span className="font-serif font-bold text-[11px] text-[#B8862A] block uppercase tracking-wider">
                                  {language === 'bn' ? 'র‌্যামন ম্যাগসেসে পুরস্কার ২০০৪' : 'Ramon Magsaysay Award 2004'}
                                </span>
                                <p className="text-[11px] text-[#6B5135] mt-1 leading-relaxed">
                                  {language === 'bn'
                                    ? "বিশ্বসাহিত্য কেন্দ্রের প্রতিষ্ঠাতা ও সভাপতি অধ্যাপক আবদুল্লাহ আবু সায়ীদকে সাহিত্যের প্রতি অনুরাগ ও মননশীলতার প্রসারে প্রদান করা হয়েছে।"
                                    : "Conferred to founder and president Prof. Abdullah Abu Sayeed for outstanding leadership and awakening humane values in people."
                                  }
                                </p>
                              </div>
                            </div>
                            {(page.sections?.[2]?.content || []).slice(1).map((paraText, pIdx) => (
                              <p key={pIdx} className="text-stone-700 text-xs mt-2">{paraText}</p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Mini Gallery Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="relative aspect-[4/3] w-full rounded-2xl border border-[#B8862A]/25 overflow-hidden bg-stone-950 group h-full min-h-[340px] flex flex-col justify-end shadow-md shadow-[#3D2B14]/5">
                  {(() => {
                    const galleries = {
                      mission: page.mission_gallery && page.mission_gallery.length > 0 
                        ? page.mission_gallery 
                        : [
                            {
                              image: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
                              caption_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রমের দেশব্যাপী বইপড়া মূল্যায়ন উৎসব",
                              caption_en: "Elite book assessment and nationwide creative reading award festival"
                            },
                            {
                              image: "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg",
                              caption_bn: "কৈশোরে বইপড়ার আনন্দ ও মনন চর্চায় সক্রিয় ছাত্র-ছাত্রীদের আলো",
                              caption_en: "Students interacting at a national reading habit celebration"
                            },
                            {
                              image: "/assets/IMGS/493897528_1088721239946023_8232102595073591871_n.jpg",
                              caption_bn: "তরুণ প্রজন্মের চিত্তে উচ্চমূল্যবোধসম্পন্ন চেতনা জাগানোর শুভ কর্মযজ্ঞ",
                              caption_en: "Spreading humanitarian values and critical thinking to the youth"
                            }
                          ],
                      history: page.history_gallery && page.history_gallery.length > 0
                        ? page.history_gallery
                        : [
                            {
                              image: "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg",
                              caption_bn: "বিশ্বসাহিত্য কেন্দ্রের স্বপ্নদ্রষ্টা ও প্রতিষ্ঠাতা সভাপতি অধ্যাপক আবদুল্লাহ আবু সায়ীদ স্যার",
                              caption_en: "Founder and dreamer of BSK, Professor Abdullah Abu Sayeed"
                            },
                            {
                              image: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
                              caption_bn: "৪ দশক ধরে চলা ভ্রাম্যমাণ লাইব্রেরি কার্যক্রমের বাস বহর",
                              caption_en: "The legendary library bus fleet taking books straight to citizen doorsteps"
                            },
                            {
                              image: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
                              caption_bn: "একটি ছোট্ট পাঠচক্র থেকে শুরু হয়ে আজ দেশব্যাপী সপ্রাণ সজীব মহতী আন্দোলন",
                              caption_en: "Serving hundreds of thousands of active reading members daily"
                            }
                          ],
                      achievements: page.achievements_gallery && page.achievements_gallery.length > 0
                        ? page.achievements_gallery
                        : [
                            {
                              image: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg",
                              caption_bn: "শ্রেষ্ঠ সংগঠকদের মাঝে সম্মাননা প্রদান ও মুখর সেমিনার",
                              caption_en: "Grand honor ceremonies and national cultural presentations"
                            },
                            {
                              image: "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg",
                              caption_bn: "আলোকিত মানুষ গড়ার উদ্যোগে আন্তর্জাতিক ইউনেস্কো ও ম্যাগসেসে পদকের আলোকচিত্র",
                              caption_en: "Celebrating prestigious national and global certifications awarded to BSK"
                            },
                            {
                              image: "/assets/IMGS/PURNIMA SONDHA/714223583_1412738130877664_111984798886283783_n.jpg",
                              caption_bn: "সুদীর্ঘ ৪৬ বছরের পথচলায় অর্জিত অসাধারণ মাইলফলকসমূহ",
                              caption_en: "Celebrating 46 years of glorious service to Bengali literature and intellect"
                            }
                          ]
                    };

                    const activeList = galleries[aboutSubTab] || [];
                    const activeIndex = aboutGalleryIndex >= activeList.length ? 0 : aboutGalleryIndex;

                    if (activeList.length === 0) {
                      return (
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-stone-500 bg-stone-900">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                          <span className="text-xs">{language === 'bn' ? 'কোনো গ্যালারি ছবি নেই' : 'No Gallery Images'}</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${aboutSubTab}-${activeIndex}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${activeList[activeIndex]?.image})` }}
                          />
                        </AnimatePresence>

                        {/* Top Badge overlay */}
                        <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-black/70 backdrop-blur-xs border border-white/10 rounded-md text-[9px] font-bold text-[#F0CC7A] uppercase tracking-wider font-mono">
                          {language === 'bn' ? 'বাস্তব আলোকচিত্র গ্যালারি' : 'Real-Life Photo Gallery'}
                        </div>

                        {/* Slide controllers top-right */}
                        {activeList.length > 1 && (
                          <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 bg-black/65 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15 text-stone-200">
                            <button
                              onClick={() => setAboutGalleryIndex((prev) => (prev - 1 + activeList.length) % activeList.length)}
                              className="hover:text-[#F0CC7A] p-1 transition cursor-pointer"
                              title="Previous Photo"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[10px] font-mono font-bold px-1 select-none text-white/95">
                              {activeIndex + 1} / {activeList.length}
                            </span>
                            <button
                              onClick={() => setAboutGalleryIndex((prev) => (prev + 1) % activeList.length)}
                              className="hover:text-[#F0CC7A] p-1 transition cursor-pointer"
                              title="Next Photo"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Gradient tint overlay */}
                        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                        {/* Bottom caption block over image */}
                        <div className="relative z-10 p-5 text-left space-y-1 bg-black/35 backdrop-blur-3xs rounded-b-2xl border-t border-white/5">
                          <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#F0CC7A] block">
                            {aboutSubTab === 'mission' ? (language === 'bn' ? 'ব্রত ও লক্ষ্য চিত্র' : 'Mission Showcase') : aboutSubTab === 'history' ? (language === 'bn' ? 'ইতিহাস ও যাত্রা চিত্র' : 'History Showcase') : (language === 'bn' ? 'অর্জন ও সম্মান চিত্র' : 'Achievements Showcase')}
                          </span>
                          <p className="text-white font-serif font-medium text-xs leading-relaxed drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]">
                            {language === 'bn' ? activeList[activeIndex]?.caption_bn : activeList[activeIndex]?.caption_en}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>

          {/* ────── ADDITIONAL DYNAMIC PARAGRAPHS/SECTIONS (extra_sections) ────── */}
          {page.extra_sections && page.extra_sections.length > 0 && (
            <div className="space-y-8 pt-6">
              {page.extra_sections.map((extra, extIdx) => {
                const title = (language === 'bn' ? extra.title_bn : extra.title_en) || '';
                const rawContent = (language === 'bn' ? extra.content_bn : extra.content_en) as any;
                const content = Array.isArray(rawContent) 
                  ? (rawContent as string[]).filter(Boolean) 
                  : (typeof rawContent === 'string' && (rawContent as string).trim() ? [rawContent as string] : []);
                
                if (!title && content.length === 0) return null;

                const imageAlign = extra.image_align || 'right';
                const imageWidth = extra.image_width || 'w-1/3';

                let widthStyle = 'md:w-1/3';
                if (imageWidth === 'w-1/4' || imageWidth === '25%') widthStyle = 'md:w-1/4';
                else if (imageWidth === 'w-1/3' || imageWidth === '33%') widthStyle = 'md:w-1/3';
                else if (imageWidth === 'w-1/2' || imageWidth === '50%') widthStyle = 'md:w-1/2';
                else if (imageWidth === 'w-full' || imageWidth === '100%') widthStyle = 'md:w-full';

                return (
                  <div key={extIdx} className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-xs relative overflow-hidden text-left space-y-4">
                    {title && (
                      <div className="border-b border-[#B8862A]/15 pb-2">
                        <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                          <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                          <span>{title}</span>
                        </h3>
                      </div>
                    )}

                    <div className={`flex flex-col gap-6 ${imageAlign === 'left' ? 'md:flex-row' : imageAlign === 'right' ? 'md:flex-row-reverse' : 'flex-col'}`}>
                      {extra.image && imageAlign !== 'none' && (
                        <div className={`w-full ${widthStyle} flex-shrink-0 self-start ${imageAlign === 'center' ? 'mx-auto max-w-lg' : ''}`}>
                          <img 
                            src={extra.image} 
                            className="rounded-xl shadow-sm border border-[#E8DDD0] max-h-72 w-full object-cover" 
                            alt={title || "Extra paragraph illustration"} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-3 font-sans text-stone-800 text-sm md:text-base leading-relaxed">
                        {content.map((pText, pIdx) => (
                          <p key={pIdx}>{pText}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ────── WHO WE ARE SECTION (আমরা কারা ও পরিচিতি) ────── */}
          <div className="pt-6 space-y-6 text-left">
            <div className="border-b border-[#B8862A]/15 pb-2 text-left">
              <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                <span>
                  {language === 'bn' 
                    ? (page.who_we_are_title_bn || 'আমরা কারা') 
                    : (page.who_we_are_title_en || 'Who We Are')}
                </span>
              </h3>
              <p className="text-xs text-[#6B5135] mt-1 font-serif">
                {language === 'bn' 
                  ? (page.who_we_are_subtitle_bn || 'আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন') 
                  : (page.who_we_are_subtitle_en || 'A transformative nation-building movement cultivating enlightened minds and noble human values')}
              </p>
            </div>

            {/* Main Narrative Card */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden text-left space-y-6">
              {/* Subtle decorative watermark/accent in background */}
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-[#B8862A]/5 rounded-full blur-2xl pointer-events-none" />

              {/* Tag / Motto Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#B8862A]/30 text-[#8B621B] text-xs font-serif font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? 'মূল ব্রত: “আলোকিত মানুষ চাই”' : 'Core Creed: “We Want Enlightened Humans”'}</span>
                </div>
                <span className="text-[11px] font-sans text-stone-500 font-medium">
                  {language === 'bn' ? 'প্রতিষ্ঠা: ১৭ ডিসেম্বর ১৯৭৮' : 'Established: December 17, 1978'}
                </span>
              </div>

              {/* Paragraphs */}
              <div className="space-y-4 font-serif text-stone-800 text-sm md:text-base leading-relaxed">
                {(() => {
                  const paragraphs = (language === 'bn' ? page.who_we_are_paragraphs_bn : page.who_we_are_paragraphs_en) || [
                    language === 'bn'
                      ? "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।"
                      : "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
                    language === 'bn'
                      ? "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।"
                      : "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations."
                  ];
                  return paragraphs.map((pText, pIdx) => (
                    <p key={pIdx} className="text-stone-700 font-sans md:font-serif leading-relaxed">
                      {pText}
                    </p>
                  ));
                })()}
              </div>

              {/* 4 Feature / Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {(() => {
                  const defaultFeatures = [
                    {
                      icon: "BookOpen",
                      title_bn: "দেশব্যাপী বইপড়া কর্মসূচি",
                      title_en: "Nationwide Reading Program",
                      desc_bn: "স্কুল ও কলেজের লক্ষ লক্ষ ছাত্রছাত্রীকে উন্নত মনন ও গভীর বোধের সমৃদ্ধ বই পড়ার ধারায় সম্পৃক্ত রাখা।",
                      desc_en: "Engaging millions of school and college students in cultivating lifelong reading habits and critical thought."
                    },
                    {
                      icon: "Library",
                      title_bn: "ভ্রাম্যমাণ লাইব্রেরি সেবা",
                      title_en: "Mobile Library Fleet",
                      desc_bn: "দেশের ৬৪টি জেলার প্রত্যন্ত অঞ্চলে সাধারণ পাঠকদের ঘরের দোরগোড়ায় বিশ্বসাহিত্যের সেরা গ্রন্থ পৌঁছে দেওয়া।",
                      desc_en: "Bringing curated treasures of world literature directly to community doorsteps across all 64 districts."
                    },
                    {
                      icon: "Users",
                      title_bn: "পাঠচক্র ও উন্মুক্ত আলোচনা",
                      title_en: "Study Circles & Discourse",
                      desc_bn: "দর্শন, সাহিত্য, শিল্পকলা ও বিজ্ঞান ভাবনার গভীর পর্যালোচনায় মুক্তবুদ্ধি ও উচ্চতর রুচি বিকাশ।",
                      desc_en: "Nurturing expansive worldviews, philosophical inquiry, and progressive dialogue through intimate forums."
                    },
                    {
                      icon: "Sparkles",
                      title_bn: "সাংস্কৃতিক উৎকর্ষ ও নেতৃত্ব",
                      title_en: "Cultural Excellence & Leadership",
                      desc_bn: "চলচ্চিত্র, সংগীত ও শিল্পচর্চার মাধ্যমে জাতির আগামীর মননশীল, দায়িত্ববান ও মানবিক নেতৃত্ব তৈরি।",
                      desc_en: "Fostering aesthetic sensibility and compassionate leadership to steer the nation toward enlightenment."
                    }
                  ];
                  const features = page.who_we_are_features && page.who_we_are_features.length > 0
                    ? page.who_we_are_features
                    : defaultFeatures;

                  const getIconComponent = (iconName?: string) => {
                    switch (iconName) {
                      case 'BookOpen': return <BookOpen className="h-5 w-5 text-[#B8862A]" />;
                      case 'Library': return <Library className="h-5 w-5 text-[#B8862A]" />;
                      case 'Users': return <Users className="h-5 w-5 text-[#B8862A]" />;
                      case 'Sparkles': return <Sparkles className="h-5 w-5 text-[#B8862A]" />;
                      case 'Award': return <Award className="h-5 w-5 text-[#B8862A]" />;
                      case 'GraduationCap': return <GraduationCap className="h-5 w-5 text-[#B8862A]" />;
                      default: return <Compass className="h-5 w-5 text-[#B8862A]" />;
                    }
                  };

                  return features.map((feat, fIdx) => (
                    <div 
                      key={fIdx} 
                      className="bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-[#E8DDD0] hover:border-[#B8862A]/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#B8862A]/30 flex items-center justify-center shadow-2xs">
                          {getIconComponent(feat.icon)}
                        </div>
                        <h4 className="font-serif font-bold text-xs md:text-sm text-[#1A1207] leading-snug">
                          {language === 'bn' ? feat.title_bn : feat.title_en}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                        {language === 'bn' ? feat.desc_bn : feat.desc_en}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* ────── OTHER DESCRIPTION INFORMATION (Section 3 in home - Founder Quote) ────── */}
          <div className="pt-6">
            <div className="bg-[#1A1207] text-[#FAF7F2] rounded-2xl p-8 relative overflow-hidden bg-grain shadow-xl border border-[#B8862A]/20 text-center max-w-4xl mx-auto">
              <div className="absolute top-4 left-6 text-6xl text-[#B8862A]/15 font-serif select-none pointer-events-none">“</div>
              
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                {/* Founder Photo Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#B8862A] mx-auto shadow-md bg-stone-900 flex items-center justify-center shrink-0">
                  <img 
                    src={page.founder_avatar || page.sections?.[3]?.image || "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg"} 
                    alt={language === 'bn' ? (page.founder_name_bn || 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ') : (page.founder_name_en || 'Professor Abdullah Abu Sayeed')} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="font-serif text-base md:text-lg leading-relaxed !text-white italic font-medium">
                  {language === 'bn' 
                    ? page.sections?.[3]?.content?.[0] || "“বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি প্রতিষ্ঠান নয়। এটি আজ একটি দেশব্যাপী আন্দোলন। আলোকিত জাতীয় চিত্তের একটি বিনীত নিশ্চয়তা। মানবজ্ঞানের সামগ্রিক চর্চা এবং অনুশীলনের পাশাপাশি হৃদয়ের উৎকর্ষ ও জীবনের বহুবিচিত্র কর্মকাণ্ডের মধ্য দিয়ে উচ্চতর শক্তি ও মনুষ্যত্বে বিকশিত হবার একটি সপ্রাণ পৃথিবী।”"
                    : page.sections?.[3]?.content?.[1] || "“Bishwo Shahitto Kendro is no longer just an institution today. It is now a countrywide movement. An humble guarantee of an enlightened national mind. A living world to grow into higher power and humanity through the practice and exercise of human knowledge, excellence of heart, and diverse walks of life.”"
                  }
                </p>
                
                <div className="pt-2 border-t border-[#B8862A]/25 inline-block">
                  <span className="font-serif text-xs md:text-sm font-bold text-[#F0CC7A] block">
                    {language === 'bn' 
                      ? (page.founder_name_bn || 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ') 
                      : (page.founder_name_en || 'Professor Abdullah Abu Sayeed')}
                  </span>
                  <span className="text-[10px] !text-white/80 font-sans block mt-0.5">
                    {language === 'bn' 
                      ? (page.founder_title_bn || 'প্রতিষ্ঠাতা ও সভাপতি, বিশ্বসাহিত্য কেন্দ্র') 
                      : (page.founder_title_en || 'Founder & President, Bishwo Shahitto Kendro')}
                  </span>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-6 text-6xl text-[#B8862A]/15 font-serif select-none pointer-events-none">”</div>
            </div>
          </div>

        </div>
        );
      })() : page.id === 'trustees' ? (
          <div className="space-y-8 w-full">
            {/* Header / Intro Spotlight */}
            <div className="bg-[#1A1207] text-[#FAF7F2] rounded-2xl p-6 md:p-8 relative overflow-hidden bg-grain shadow-xl border border-[#B8862A]/20">
              <div className="absolute top-4 left-6 text-6xl text-[#B8862A]/15 font-serif select-none pointer-events-none">“</div>
              <div className="relative z-10 space-y-4 max-w-3xl">
                <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#F0CC7A] flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-[#B8862A] rounded-full inline-block" />
                  <span>{language === 'bn' ? page.title_bn : page.title_en}</span>
                </h1>
                
                {page.sections[0] && (
                  <div className="!text-white leading-relaxed text-sm md:text-base font-serif italic space-y-3">
                    {page.sections[0].content
                      .filter(p => p.trim().length > 0 && 
                        (!p.includes(' - ') && 
                         p.trim() !== 'আবদুল্লাহ আবু সায়ীদ' && 
                         p.trim() !== 'মোহাম্মদ ফরিদউদ্দীন' && 
                         p.trim() !== 'মনসুর আহমেদ চৌধুরী' && 
                         p.trim() !== 'aminul' && 
                         p.trim() !== 'আমিনুল ইসলাম ভুঁইয়া'
                        )
                      )
                      .slice(0, 3)
                      .map((pText, pIdx) => (
                        <p key={pIdx}>{pText}</p>
                      ))}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-6 text-6xl text-[#B8862A]/15 font-serif select-none pointer-events-none">”</div>
            </div>

            {/* Trustees Section Container */}
            {(() => {
              const allTrusteeSecs = Array.isArray(page.sections) ? page.sections.filter((sec, idx) => idx > 0 && sec.title && sec.title !== page.title_bn) : [];
              const currentTrustees = allTrusteeSecs.filter(sec => !sec.is_former);
              const formerTrustees = allTrusteeSecs.filter(sec => sec.is_former === true);

              return (
                <div className="space-y-10">
                  {/* Current Trustees */}
                  {currentTrustees.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#E8DDD0] pb-3">
                        <div className="w-2.5 h-6 bg-[#B8862A] rounded-full" />
                        <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#1A1207]">
                          {language === 'bn' ? 'বর্তমান ট্রাস্টিমন্ডলী' : 'Current Board of Trustees'}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {currentTrustees.map((sec, idx) => {
                          const trusteeName = sec.title;
                          let trusteeImg = sec.image || "";
                          if (!trusteeImg) {
                            if (trusteeName.includes("আবদুল্লাহ আবু") || trusteeName.includes("সায়ীদ") || trusteeName.includes("Sayeed")) {
                              trusteeImg = "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg";
                            }
                          }
                          const initialLetter = trusteeName.trim().charAt(0) || 'T';

                          return (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 15 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="bg-white rounded-2xl border border-[#E8DDD0] shadow-md shadow-[#3D2B14]/5 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-lg hover:border-[#B8862A]/30 duration-300"
                            >
                              <div className="md:w-64 shrink-0 bg-[#FAF7F2]/40 border-b md:border-b-0 md:border-r border-[#E8DDD0] p-6 flex flex-col items-center justify-center text-center">
                                <div className="relative group">
                                  {trusteeImg ? (
                                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-[#B8862A] p-1 bg-white shadow-md flex items-center justify-center select-none transition-transform duration-300 group-hover:scale-105">
                                      <img 
                                        src={trusteeImg} 
                                        alt={trusteeName} 
                                        className="w-full h-full object-cover rounded-full"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-[#1A1207] border-2 border-[#B8862A]/60 flex items-center justify-center text-[#F0CC7A] shadow-md relative group-hover:bg-[#2C1F0D] transition-all duration-300 select-none">
                                      <div className="text-4xl font-serif font-extrabold tracking-wider opacity-90">
                                        {initialLetter}
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#B8862A] text-stone-950 border border-[#FAF7F2] shadow-xs font-sans">
                                      {language === 'bn' ? 'ট্রাস্টি সদস্য' : 'Trustee'}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-5">
                                  <h3 className="font-serif font-extrabold text-[#1A1207] text-base md:text-lg leading-snug">
                                    {trusteeName}
                                  </h3>
                                  {sec.period && (
                                    <p className="text-xs text-[#B8862A] font-bold mt-1 font-sans">
                                      {sec.period}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center space-y-4 bg-white">
                                <div className="space-y-3.5">
                                  {sec.content
                                    .filter(p => p !== trusteeName && p.length > 5)
                                    .map((pText, pIdx) => (
                                      <p 
                                        key={pIdx} 
                                        className="text-stone-800 leading-relaxed text-xs md:text-sm font-sans"
                                        style={{ textIndent: pIdx > 0 ? '1.25rem' : '0' }}
                                      >
                                        {pText}
                                      </p>
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Former Trustees / সাবেক ট্রাস্টিবৃন্দ */}
                  {formerTrustees.length > 0 && (
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-6 bg-[#6B5135] rounded-full" />
                          <div>
                            <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#1A1207]">
                              {language === 'bn' ? 'সাবেক ট্রাস্টিবৃন্দ' : 'Former Trustees'}
                            </h2>
                            <p className="text-xs text-stone-500 font-sans mt-0.5">
                              {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের অতীতের দিকপাল ও সম্মানিত ট্রাস্টি সদস্যগণ' : 'Honored former members of the Board of Trustees'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {formerTrustees.map((sec, idx) => {
                          const trusteeName = sec.title;
                          let trusteeImg = sec.image || "";
                          const initialLetter = trusteeName.trim().charAt(0) || 'T';

                          return (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 15 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="bg-[#FAF7F2]/60 rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md hover:border-[#B8862A]/40 duration-300"
                            >
                              <div className="md:w-64 shrink-0 bg-[#F5EFE6] border-b md:border-b-0 md:border-r border-[#E8DDD0] p-6 flex flex-col items-center justify-center text-center">
                                <div className="relative group">
                                  {trusteeImg ? (
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#8B621B]/40 p-1 bg-white shadow-sm flex items-center justify-center select-none">
                                      <img 
                                        src={trusteeImg} 
                                        alt={trusteeName} 
                                        className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-300"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#2A231A] border-2 border-[#B8862A]/40 flex items-center justify-center text-[#E5C378] shadow-sm relative select-none">
                                      <div className="text-3xl font-serif font-extrabold tracking-wider opacity-85">
                                        {initialLetter}
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#8B621B] text-amber-50 border border-[#FAF7F2] shadow-xs font-sans whitespace-nowrap">
                                      {language === 'bn' ? 'সাবেক ট্রাস্টি' : 'Former Trustee'}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-5 space-y-1.5">
                                  <h3 className="font-serif font-extrabold text-[#1A1207] text-base md:text-lg leading-snug">
                                    {trusteeName}
                                  </h3>
                                  {sec.period && (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B8862A]/10 border border-[#B8862A]/30 text-[#8B621B] text-xs font-bold font-sans">
                                      <span>📅</span>
                                      <span>{language === 'bn' ? `সময়কাল: ${sec.period}` : `Tenure: ${sec.period}`}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center space-y-4 bg-white/80">
                                <div className="space-y-3">
                                  {sec.content
                                    .filter(p => p !== trusteeName && p.length > 5)
                                    .map((pText, pIdx) => (
                                      <p 
                                        key={pIdx} 
                                        className="text-stone-700 leading-relaxed text-xs md:text-sm font-sans"
                                        style={{ textIndent: pIdx > 0 ? '1.25rem' : '0' }}
                                      >
                                        {pText}
                                      </p>
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : page.id === 'organogram' ? (
          <div className="space-y-8 w-full">
            {/* Segmented Tab Controls using React Aria */}
            <AriaTabs
              selectedKey={organogramTab}
              onSelectionChange={(key) => {
                setOrganogramTab(key as any);
                setSelectedOrgNode(null);
              }}
              className="w-full"
            >
              <AriaTabList className="flex border-b border-[#E8DDD0] gap-4 md:gap-8 pb-px overflow-x-auto scrollbar-none select-none">
                {[
                  { id: 'chart', bn: 'সাংগঠনিক চার্ট', en: 'Organization Chart' },
                  { id: 'leadership', bn: 'নেতৃত্ব ও প্রশাসন', en: 'Leadership & Administration' },
                  { id: 'departments', bn: 'বিভাগ ও দায়িত্বসমূহ', en: 'Departments & Responsibilities' }
                ].map((tab) => (
                  <AriaTab
                    key={tab.id}
                    id={tab.id}
                    className={({ isSelected }) => `py-3 px-1 border-b-2 text-xs md:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#B8862A]/40 ${
                      isSelected
                        ? 'border-[#B8862A] text-[#1A1207] font-extrabold'
                        : 'border-transparent text-[#6B5135] hover:text-[#1A1207]'
                    }`}
                  >
                    {tab.id === 'chart' && <LayoutGrid className="h-4 w-4" />}
                    {tab.id === 'leadership' && <History className="h-4 w-4" />}
                    {tab.id === 'departments' && <BookOpenCheck className="h-4 w-4" />}
                    <span>{language === 'bn' ? tab.bn : tab.en}</span>
                  </AriaTab>
                ))}
              </AriaTabList>
            </AriaTabs>

            {/* TAB PANES */}
            <AnimatePresence mode="wait">
              {organogramTab === 'chart' && (
                <motion.div
                  key="chart-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Visually stunning Tree Chart */}
                  <div className="p-6 md:p-8 bg-white border border-[#E8DDD0] rounded-2xl shadow-sm shadow-[#3D2B14]/5 relative overflow-hidden flex flex-col items-center">
                    <div className="text-center mb-8 max-w-xl">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#B8862A]/10 text-[#B8862A] border border-[#B8862A]/20">
                        {language === 'bn' ? 'ইন্টারেক্টিভ অর্গানোগ্রাম' : 'Interactive Organogram'}
                      </span>
                      <h3 className="font-serif font-extrabold text-[#1A1207] text-lg md:text-xl mt-2">
                        {language === 'bn' ? 'সাংগঠনিক স্তর ও যোগাযোগ বিন্যাস' : 'Governance & Operational Hierarchy'}
                      </h3>
                      <p className="text-xs text-[#6B5135] mt-1">
                        {language === 'bn' 
                          ? 'যেকোনো স্তরে ক্লিক করে বিস্তারিত দায়িত্বাবলী ও ভূমিকা লক্ষ্য করুন।' 
                          : 'Click any node/block below to view its core responsibilities and operational status.'}
                      </p>
                    </div>

                    {/* Hierarchy Visual Diagram */}
                    <div className="w-full max-w-4xl flex flex-col items-center relative space-y-6">
                      
                      {/* Level 1: Board of Trustees */}
                      <div className="flex flex-col items-center w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOrgNode('trustee')}
                          className={`w-64 md:w-80 p-4 rounded-xl border-2 text-center transition-all shadow-md cursor-pointer ${
                            selectedOrgNode === 'trustee'
                              ? 'bg-[#1A1207] border-[#B8862A] text-white'
                              : 'bg-white border-[#E8DDD0] hover:border-[#B8862A]/60 text-[#1A1207]'
                          }`}
                        >
                          <Landmark className="h-6 w-6 text-[#B8862A] mx-auto mb-2" />
                          <h4 className="font-serif font-extrabold text-xs md:text-sm">
                            {language === 'bn' ? 'ট্রাস্টি বোর্ড (Board of Trustees)' : 'Board of Trustees'}
                          </h4>
                          <p className="text-[10px] opacity-75 mt-1 font-sans">
                            {language === 'bn' ? 'নীতিনির্ধারণ ও দিকনির্দেশনা কমিটি (৯ সদস্য)' : '9-member supreme policy making committee'}
                          </p>
                        </motion.button>
                        
                        {/* Connector line 1 */}
                        <div className="w-0.5 h-6 bg-[#E8DDD0]" />
                      </div>

                      {/* Level 2: President & CEO */}
                      <div className="flex flex-col items-center w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOrgNode('ceo')}
                          className={`w-64 md:w-80 p-4 rounded-xl border-2 text-center transition-all shadow-md cursor-pointer ${
                            selectedOrgNode === 'ceo'
                              ? 'bg-[#1A1207] border-[#B8862A] text-white'
                              : 'bg-[#FAF7F2] border-[#E8DDD0] hover:border-[#B8862A]/60 text-[#1A1207]'
                          }`}
                        >
                          <Award className="h-6 w-6 text-[#B8862A] mx-auto mb-2" />
                          <h4 className="font-serif font-extrabold text-xs md:text-sm">
                            {language === 'bn' ? 'সভাপতি ও প্রধান নির্বাহী (President & CEO)' : 'President & Chief Executive'}
                          </h4>
                          <p className="text-[10px] opacity-75 mt-1 font-sans">
                            {language === 'bn' ? 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ' : 'Professor Abdullah Abu Sayeed'}
                          </p>
                        </motion.button>

                        {/* Connector line 2 */}
                        <div className="w-0.5 h-6 bg-[#E8DDD0]" />
                      </div>

                      {/* Level 3: Joint Director & Advisors */}
                      <div className="flex flex-col items-center w-full relative">
                        {/* T-bar line */}
                        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#E8DDD0]" />
                        
                        <div className="flex gap-4 md:gap-8 justify-center w-full pt-6 relative">
                          {/* Vertical branches from T-bar */}
                          <div className="absolute top-0 left-1/4 w-0.5 h-6 bg-[#E8DDD0] md:block hidden" />
                          <div className="absolute top-0 right-1/4 w-0.5 h-6 bg-[#E8DDD0] md:block hidden" />

                          {/* Advisor Node */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedOrgNode('advisor')}
                            className={`w-48 md:w-60 p-3 rounded-xl border-2 text-center transition-all shadow-sm cursor-pointer ${
                              selectedOrgNode === 'advisor'
                                ? 'bg-[#1A1207] border-[#B8862A] text-white'
                                : 'bg-white border-[#E8DDD0] hover:border-[#B8862A]/60 text-[#1A1207]'
                            }`}
                          >
                            <Sparkles className="h-5 w-5 text-[#B8862A] mx-auto mb-1.5" />
                            <h5 className="font-serif font-bold text-xs">
                              {language === 'bn' ? 'উপদেষ্টা প্যানেল' : 'Advisory Board'}
                            </h5>
                            <p className="text-[9px] opacity-75 mt-0.5 font-sans">
                              {language === 'bn' ? 'কর্মসূচি ও নীতি উপদেষ্টা' : 'Program & Policy Advising'}
                            </p>
                          </motion.button>

                          {/* Director Admin Node */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedOrgNode('director')}
                            className={`w-48 md:w-60 p-3 rounded-xl border-2 text-center transition-all shadow-sm cursor-pointer ${
                              selectedOrgNode === 'director'
                                ? 'bg-[#1A1207] border-[#B8862A] text-white'
                                : 'bg-white border-[#E8DDD0] hover:border-[#B8862A]/60 text-[#1A1207]'
                            }`}
                          >
                            <Briefcase className="h-5 w-5 text-[#B8862A] mx-auto mb-1.5" />
                            <h5 className="font-serif font-bold text-xs">
                              {language === 'bn' ? 'পরিচালক (প্রশাসন ও অর্থ)' : 'Director (Admin & Finance)'}
                            </h5>
                            <p className="text-[9px] opacity-75 mt-0.5 font-sans">
                              {language === 'bn' ? 'জনাব শরিফ হোসেন ভূঞা' : 'Sharif Hossain Bhuiyan'}
                            </p>
                          </motion.button>
                        </div>

                        {/* Connector line 3 */}
                        <div className="w-0.5 h-8 bg-[#E8DDD0]" />
                      </div>

                      {/* Level 4: 5 Main Departments */}
                      <div className="w-full relative">
                        {/* Broad Horizontal T-bar */}
                        <div className="absolute top-0 left-10 right-10 h-0.5 bg-[#E8DDD0] md:block hidden" />

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
                          {[
                            { id: 'dept-reading', title_bn: 'পাঠাভ্যাস কার্যক্রম', title_en: 'Reading Habit', icon: BookOpenCheck, col: 'bg-emerald-50/40 text-emerald-900 border-emerald-100' },
                            { id: 'dept-mobile', title_bn: 'ভ্রাম্যমাণ লাইব্রেরি', title_en: 'Mobile Library', icon: Truck, col: 'bg-indigo-50/40 text-indigo-900 border-indigo-100' },
                            { id: 'dept-pub', title_bn: 'প্রকাশনা ও বিক্রয় সেল', title_en: 'Publications', icon: BookOpen, col: 'bg-amber-50/40 text-amber-900 border-amber-100' },
                            { id: 'dept-admin', title_bn: 'সাধারণ প্রশাসন ও এইচআর', title_en: 'General Admin & HR', icon: HeartHandshake, col: 'bg-rose-50/40 text-rose-900 border-rose-100' },
                            { id: 'dept-finance', title_bn: 'অর্থ ও হিসাব বিভাগ', title_en: 'Finance & Accounts', icon: Landmark, col: 'bg-sky-50/40 text-sky-900 border-sky-100' },
                          ].map((dept, dIdx) => {
                            const Icon = dept.icon;
                            const isSelected = selectedOrgNode === dept.id;
                            return (
                              <div key={dept.id} className="flex flex-col items-center relative">
                                {/* Small vertical connectors to horizontal T-bar */}
                                <div className="absolute -top-6 w-0.5 h-6 bg-[#E8DDD0] md:block hidden" />
                                
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setSelectedOrgNode(dept.id)}
                                  className={`w-full p-3 rounded-xl border text-center transition-all shadow-xs cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#1A1207] border-[#B8862A] text-white'
                                      : `${dept.col} hover:border-[#B8862A]/40`
                                  }`}
                                >
                                  <div className="p-1 bg-white rounded-lg inline-block shadow-xs border border-stone-200/50 mb-1.5">
                                    <Icon className={`h-4 w-4 ${isSelected ? 'text-[#B8862A]' : 'text-stone-700'}`} />
                                  </div>
                                  <h6 className="font-serif font-extrabold text-[10px] md:text-xs leading-tight">
                                    {language === 'bn' ? dept.title_bn : dept.title_en}
                                  </h6>
                                </motion.button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Dynamic node details drawer */}
                    <AnimatePresence>
                      {selectedOrgNode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full mt-10 bg-[#FAF7F2] rounded-xl border border-[#E8DDD0] p-5 relative overflow-hidden text-left animate-fade-in"
                        >
                          <button
                            onClick={() => setSelectedOrgNode(null)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-[#1A1207] transition cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          {/* Trustees Info */}
                          {selectedOrgNode === 'trustee' && (
                            <div className="space-y-2">
                              <h4 className="font-serif font-extrabold text-[#1A1207] text-sm flex items-center gap-2">
                                <Landmark className="h-4 w-4 text-[#B8862A]" />
                                <span>{language === 'bn' ? 'ট্রাস্টি বোর্ড (Board of Trustees)' : 'Board of Trustees'}</span>
                              </h4>
                              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                                {language === 'bn'
                                  ? '৯ জন অত্যন্ত সম্মানিত ট্রাস্টি সদস্য নিয়ে গঠিত ট্রাস্টি বোর্ড। প্রতি তিন মাস অন্তর এদের সমন্বয়ে নীতিনির্ধারণী সাধারণ সভা অনুষ্ঠিত হয় এবং বিসাকে-র সার্বিক কর্মসূচি, বার্ষিক বাজেট এবং নীতি অনুমোদন ও পরিচালনা ব্যবস্থার তত্ত্বাবধান ও অডিট পরিচালনা করা হয়।'
                                  : 'Composed of 9 nationally acclaimed highly respected members. The Trustee Board holds general policy-making meetings every quarter to review progress, approve annual budgets, program designs, and audit compliance.'}
                              </p>
                              <button 
                                onClick={() => onNavigate('trustees')}
                                className="inline-flex items-center text-[10px] font-bold text-[#B8862A] hover:underline gap-1 pt-1.5 cursor-pointer"
                              >
                                <span>{language === 'bn' ? 'সব ট্রাস্টি সদস্য দেখুন' : 'View All Trustees'}</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* CEO Info */}
                          {selectedOrgNode === 'ceo' && (
                            <div className="space-y-2">
                              <h4 className="font-serif font-extrabold text-[#1A1207] text-sm flex items-center gap-2">
                                <Award className="h-4 w-4 text-[#B8862A]" />
                                <span>{language === 'bn' ? 'সভাপতি ও প্রধান নির্বাহী (President & CEO)' : 'President & Chief Executive'}</span>
                              </h4>
                              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                                {language === 'bn'
                                  ? 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ কেন্দ্রের নীতিনির্ধারক ও আন্দোলন পরিচালনাকারী প্রধান কাণ্ডারি। ট্রাস্টি বোর্ডের সভাপতি হিসেবে তিনি সমস্ত স্তরের কর্মসূচি বাস্তবায়ন, তহবিল সংগ্রহ, এবং কেন্দ্রের আদর্শ সমুন্নত রাখতে সরাসরি নির্দেশনা দিয়ে থাকেন।'
                                  : 'Professor Abdullah Abu Sayeed coordinates and leads the nationwide movement. As the President of the Trustee board, he directly monitors the implementation of programs, ensures target achievement and protects the mission of BSK.'}
                              </p>
                              <button 
                                onClick={() => onNavigate('founder')}
                                className="inline-flex items-center text-[10px] font-bold text-[#B8862A] hover:underline gap-1 pt-1.5 cursor-pointer"
                              >
                                <span>{language === 'bn' ? 'প্রতিষ্ঠাতার প্রোফাইল' : 'View Founder Profile'}</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Advisor Info */}
                          {selectedOrgNode === 'advisor' && (
                            <div className="space-y-2">
                              <h4 className="font-serif font-extrabold text-[#1A1207] text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#B8862A]" />
                                <span>{language === 'bn' ? 'উপদেষ্টা প্যানেল (Advisory Board)' : 'Advisory Board'}</span>
                              </h4>
                              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                                {language === 'bn'
                                  ? 'জনাব আমিনুল ইসলাম ভুঁইয়াসহ বিশিষ্ট সরকারি ও বেসরকারি অবসরপ্রাপ্ত শীর্ষ কর্মকর্তা এবং নীতিবিদদের নিয়ে গঠিত উপদেষ্টা দল। তাঁরা কেন্দ্রের দেশব্যাপী কার্যক্রমের প্রাতিষ্ঠানিক বিস্তার, রূপান্তর এবং আইনি সহযোগিতায় নীতিনির্ধারণী পরামর্শ প্রদান করেন।'
                                  : 'Composed of highly experienced retired top administrators and experts including Aminul Islam Bhuiyan. They assist in strategic direction, legal compliance, and governmental communication for seamless expansion.'}
                              </p>
                            </div>
                          )}

                          {/* Director Info */}
                          {selectedOrgNode === 'director' && (
                            <div className="space-y-2">
                              <h4 className="font-serif font-extrabold text-[#1A1207] text-sm flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-[#B8862A]" />
                                <span>{language === 'bn' ? 'পরিচালক - প্রশাসন ও অর্থ (Director)' : 'Director (Admin & Finance)'}</span>
                              </h4>
                              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                                {language === 'bn'
                                  ? 'জনাব শরিফ হোসেন ভূঞা বিশ্বসাহিত্য কেন্দ্রের মূল কর্মকর্তা হিসেবে কেন্দ্রের দৈনন্দিন দাপ্তরিক কাজ, শৃঙ্খলা রক্ষা, বিভাগসমূহের কাজের সমন্বয় সাধন এবং বার্ষিক হিসাব ও বাজেট প্রণয়ন তদারকি করেন।'
                                  : 'Sharif Hossain Bhuiyan manages the daily operations of all departments, coordinates the administrative staff, ensures inter-department communication, and handles resource allocations.'}
                              </p>
                            </div>
                          )}

                          {/* Department Specific Details */}
                          {selectedOrgNode.startsWith('dept-') && (() => {
                            const deptMap: Record<string, { titleBn: string; titleEn: string; detailsBn: string; detailsEn: string }> = {
                              'dept-reading': {
                                titleBn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম',
                                titleEn: 'National Reading Excellence Program',
                                detailsBn: 'স্কুল, কলেজ ও পিটিআই শিক্ষকদের জন্য দেশব্যাপী বই পড়া কার্যক্রম পরিচালনা। প্রতিবছর কয়েক লক্ষ শিক্ষার্থী ও প্রশিক্ষণার্থী এই কর্মসূচির অধীনে আলোকিত জীবনের সন্ধান পায়।',
                                detailsEn: 'Nationwide book reading program for schools, colleges, and teachers training institutes reaching hundreds of thousands of active students every year.'
                              },
                              'dept-mobile': {
                                titleBn: 'ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম',
                                titleEn: 'Mobile Library Program',
                                detailsBn: 'বিশেষভাবে নির্মিত লাইব্রেরি গাড়ির মাধ্যমে দেশের বিভিন্ন জেলা ও প্রত্যন্ত অঞ্চলে সরাসরি মানুষের দোরগোড়ায় বই পৌঁছে দেওয়ার অনন্য কর্মসূচি।',
                                detailsEn: 'Doorstep library service operating specially equipped library vehicles across districts and upazilas throughout Bangladesh.'
                              },
                              'dept-pub': {
                                titleBn: 'প্রকাশনা ও বিক্রয় সেল',
                                titleEn: 'Publications & Sales Cell',
                                detailsBn: 'বাঙালির চিন্তা কর্মসূচি এবং বিশ্বসাহিত্যের চিরায়ত শ্রেষ্ঠ গ্রন্থসমূহের অনুবাদ ও প্রকাশনা এবং দেশব্যাপী ছড়িয়ে দেওয়ার দায়িত্ব পালন করে।',
                                detailsEn: 'Publishing monumental works, classics, translations, and managing distribution channels and bookstore networks across Bangladesh.'
                              },
                              'dept-admin': {
                                titleBn: 'সাধারণ প্রশাসন ও মানবসম্পদ বিভাগ',
                                titleEn: 'General Administration & HR',
                                detailsBn: 'কেন্দ্রের দৈনন্দিন দাপ্তরিক কার্যক্রম, কর্মী নিয়োগ ও ব্যবস্থাপনা, লজিস্টিক সাপোর্ট এবং বিভিন্ন কেন্দ্র ভবনের সার্বিক নিরাপত্তা ও রক্ষণাবেক্ষণ।',
                                detailsEn: 'Overseeing organizational workflow, logistics, human resources, facilities maintenance, and inter-department operational support.'
                              },
                              'dept-finance': {
                                titleBn: 'অর্থ ও হিসাব বিভাগ',
                                titleEn: 'Finance & Accounts Department',
                                detailsBn: 'বার্ষিক বাজেট প্রণয়ন, আয়-ব্যয় অডিট, ব্যাংক লেনদেন, প্রকল্পভিত্তিক আর্থিক হিসাবরক্ষণ ও ট্রাস্টি বোর্ডের আর্থিক প্রতিবেদন তৈরি।',
                                detailsEn: 'Managing financial budgeting, donor accounting, audits, payroll, banking transactions, and quarterly trustee compliance reporting.'
                              }
                            };
                            const deptInfo = deptMap[selectedOrgNode];
                            if (!deptInfo) return null;
                            return (
                              <div className="space-y-2">
                                <h4 className="font-serif font-extrabold text-[#1A1207] text-sm flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-[#B8862A]" />
                                  <span>{language === 'bn' ? deptInfo.titleBn : deptInfo.titleEn}</span>
                                </h4>
                                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                                  {language === 'bn' ? deptInfo.detailsBn : deptInfo.detailsEn}
                                </p>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : page.id === 'publication' ? (
          <div className="space-y-8 w-full animate-fade-in text-left">
            {/* Elegant Hero / Vision Header */}
            <div className="relative overflow-hidden rounded-3xl bg-amber-950 text-white shadow-xl border border-amber-900/40">
              {/* Cover Image Background with Rich Warm Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25"
                style={{ backgroundImage: `url('${page.hero_image || '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg'}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-amber-900/90 to-transparent" />
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans uppercase tracking-widest">
                    {language === 'bn' ? (page.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনী') : (page.badge_en || 'Bishwo Shahitto Kendro Publications')}
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#F0CC7A] leading-tight">
                    {language === 'bn' ? (page.title_bn || 'প্রকাশনা কার্যক্রম') : (page.title_en || 'Publications Program')}
                  </h1>
                  <p className="text-stone-200 leading-relaxed text-sm md:text-base font-serif italic border-l-2 border-[#B8862A] pl-4">
                    {language === 'bn' 
                      ? (page.hero_desc_bn || page.subtitle_bn || 'জাতীয় চিত্তকে দীপায়িত করার লক্ষ্যে কেন্দ্রের আরও একটি কার্যক্রম রয়েছে। এটি হল প্রকাশনা কার্যক্রম। এই কর্মসূচির ভেতর দিয়ে ভাষাসহ পৃথিবীর বিভিন্ন দেশ ও ভাষার শ্রেষ্ঠ বইগুলো প্রকাশ করে ঘরে ঘরে পৌঁছে দেওয়ার পদক্ষেপ নেওয়া হয়েছে।')
                      : (page.hero_desc_en || page.subtitle_en || 'To enlighten the national mind, the center has established an active publication wing. This program translates and publishes the world’s outstanding literary and intellectual classics, making them affordable and accessible to readers across the country.')}
                  </p>
                </div>
                
                {/* Book stacks or quick downloads action right in hero */}
                <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                  <button 
                    onClick={() => onNavigate('bookshop')}
                    className="w-full flex items-center justify-center space-x-2 bg-[#B8862A] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#9A6D1F] active:scale-95 transition-all text-sm shadow-md"
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    <span>{language === 'bn' ? 'বই বিক্রয় কেন্দ্র' : 'Visit Book Shop'}</span>
                  </button>
                  <a 
                    href={page.catalog_url || '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'}
                    download
                    className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold active:scale-95 transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ক্যাটালগ ডাউনলোড' : 'Download Catalog'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats Bento Blocks */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(page.stats && page.stats.length > 0 ? page.stats : defaultPublicationStats).map((stat: any, sIdx: number) => (
                <div key={sIdx} className={`p-5 rounded-2xl border ${stat.color || 'border-amber-100 bg-amber-50/50 text-amber-800'} shadow-xs text-center flex flex-col justify-center space-y-1`}>
                  <div className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
                    {language === 'bn' ? (stat.bnVal || stat.value_bn) : (stat.enVal || stat.value_en)}
                  </div>
                  <div className="text-xs md:text-sm font-medium opacity-80 font-sans text-stone-600">
                    {language === 'bn' ? (stat.bnLbl || stat.label_bn) : (stat.enLbl || stat.label_en)}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Showcase with Filter and Tabs */}
            <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h2 className="font-serif text-lg md:text-2xl font-bold text-[#1A1207] flex items-center space-x-2">
                    <span className="w-2 h-6 bg-[#B8862A] rounded-full inline-block" />
                    <span>{language === 'bn' ? (page.series_section_title_bn || 'আমাদের প্রকাশনা সিরিজসমূহ') : (page.series_section_title_en || 'Our Publication Series')}</span>
                  </h2>
                  <p className="text-xs md:text-sm text-stone-500 mt-1">
                    {language === 'bn' ? (page.series_section_desc_bn || 'সিরিজ নির্বাচন করে বর্ণনা এবং বইয়ের তাক দেখুন') : (page.series_section_desc_en || 'Select a series to explore details and specific bookshelves')}
                  </p>
                </div>
                
                {/* Book Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={pubBookSearchQuery}
                    onChange={(e) => setPubBookSearchQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'বই বা লেখক খুঁজুন...' : 'Search books or authors...'}
                    className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] bg-stone-50/50 text-stone-800"
                  />
                  {pubBookSearchQuery && (
                    <button 
                      onClick={() => setPubBookSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Series Tabs */}
              {(() => {
                const pubSeriesList: any[] = (page.publication_series && page.publication_series.length > 0)
                  ? page.publication_series
                  : defaultPublicationSeriesList;

                const currentTabIdx = Math.min(pubActiveTab, Math.max(0, pubSeriesList.length - 1));
                const activeSeries = pubSeriesList[currentTabIdx] || pubSeriesList[0];

                // Dynamically compile books matching search across all series
                let displayedBooks: any[] = [];
                
                if (pubBookSearchQuery.trim()) {
                  // If searching, compile from all series
                  pubSeriesList.forEach((ser, sIdx) => {
                    (ser.books || []).forEach((b: any) => {
                      if (
                        (b.titleBn || '').toLowerCase().includes(pubBookSearchQuery.toLowerCase()) ||
                        (b.titleEn || '').toLowerCase().includes(pubBookSearchQuery.toLowerCase()) ||
                        (b.authorBn || '').toLowerCase().includes(pubBookSearchQuery.toLowerCase()) ||
                        (b.authorEn || '').toLowerCase().includes(pubBookSearchQuery.toLowerCase())
                      ) {
                        displayedBooks.push({ ...b, seriesIdx: sIdx, seriesTitle: language === 'bn' ? ser.titleBn : ser.titleEn });
                      }
                    });
                  });
                } else if (activeSeries && activeSeries.books) {
                  displayedBooks = activeSeries.books.map((b: any) => ({ ...b, seriesIdx: currentTabIdx, seriesTitle: language === 'bn' ? activeSeries.titleBn : activeSeries.titleEn }));
                }

                return (
                  <div className="space-y-6">
                    {/* Tabs Headers - Hide during search */}
                    {!pubBookSearchQuery && (
                      <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-3">
                        {pubSeriesList.map((ser, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPubActiveTab(idx)}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                              currentTabIdx === idx
                                ? 'bg-[#1A1207] text-[#F0CC7A] shadow-md border border-[#1A1207]'
                                : 'bg-[#FAF7F2] text-stone-600 hover:bg-stone-100 border border-[#E8DDD0]'
                            }`}
                          >
                            <span className="font-serif">
                              {language === 'bn' ? ser.titleBn : ser.titleEn}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Series Detail & Book list wrapper */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Series description (unless searching) */}
                      {!pubBookSearchQuery && activeSeries && (
                        <div className="lg:col-span-5 space-y-4">
                          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DDD0]/80 space-y-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B8862A]/10 text-[#B8862A] border border-[#B8862A]/20">
                              {language === 'bn' ? activeSeries.tagBn : activeSeries.tagEn}
                            </span>
                            <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                              {language === 'bn' ? activeSeries.titleBn : activeSeries.titleEn}
                            </h3>
                            <p className="text-stone-700 text-sm leading-relaxed font-sans text-left">
                              {language === 'bn' ? activeSeries.descBn : activeSeries.descEn}
                            </p>
                            
                            {/* Special Link for Bengali Thought Project */}
                            {(activeSeries.id === 'bangalir-chinta' || currentTabIdx === 3) && (
                              <button
                                onClick={() => onNavigate('bangalir_chinta')}
                                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#B8862A] hover:text-[#9A6D1F] transition-colors pt-2 group"
                              >
                                <span>{language === 'bn' ? 'বাঙালির চিন্তা কর্মসূচি বিস্তারিত দেখুন' : 'Explore Bengali Thought in Detail'}</span>
                                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                          
                          {/* Real Photo Embed alongside description */}
                          <div className="rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-xs relative aspect-video bg-stone-100 group">
                            <img 
                              src={activeSeries.image || page.hero_image || "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg"}
                              alt="Publications display"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                              <p className="text-white text-xs font-serif leading-relaxed drop-shadow-md text-left">
                                {language === 'bn' 
                                  ? (activeSeries.imageCaptionBn || 'কেন্দ্র আয়োজিত গ্রন্থমেলায় বইয়ের সমাহার') 
                                  : (activeSeries.imageCaptionEn || 'A selection of books displayed at our bookstore and exhibitions.')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Right/Full: Book Showcase Shelf */}
                      <div className={`${pubBookSearchQuery ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm md:text-base font-bold text-stone-700 flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-[#B8862A]" />
                            <span>
                              {pubBookSearchQuery 
                                ? (language === 'bn' ? `অনুসন্ধানের ফলাফল (${displayedBooks.length}টি বই)` : `Search Results (${displayedBooks.length} books)`)
                                : (language === 'bn' ? 'বইয়ের তাক / বিশেষ বইসমূহ' : 'Featured Books / Shelf')}
                            </span>
                          </h4>
                          {pubBookSearchQuery && (
                            <button
                              onClick={() => setPubBookSearchQuery('')}
                              className="text-xs font-bold text-[#B8862A] hover:underline"
                            >
                              {language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear Search'}
                            </button>
                          )}
                        </div>

                        {displayedBooks.length === 0 ? (
                          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
                            <p className="text-stone-500 font-sans">
                              {language === 'bn' ? 'দুঃখিত, কোনো বই বা লেখক খুঁজে পাওয়া যায়নি।' : 'Sorry, no books or authors matched your search.'}
                            </p>
                          </div>
                        ) : (
                          /* Books Shelf Grid */
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {displayedBooks.map((book) => (
                              <div
                                key={book.id}
                                onClick={() => setPubSelectedBook(book)}
                                className="group cursor-pointer flex flex-col items-center text-center space-y-3"
                              >
                                {/* Creative 3D Book Cover styling */}
                                <div className="relative w-28 h-40 md:w-32 md:h-44 rounded-r-md shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl overflow-hidden flex flex-col justify-between p-3 text-left">
                                  {/* Absolute book spine and cover elements */}
                                  <div className="absolute inset-0 bg-stone-900/10 mix-blend-multiply" />
                                  {(book.coverImage || book.image || book.img) ? (
                                    <img 
                                      src={book.coverImage || book.image || book.img} 
                                      alt={book.titleBn || 'Book cover'} 
                                      className="absolute inset-0 w-full h-full object-cover rounded-r-md" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className={`absolute inset-0 ${book.coverBg || 'bg-amber-900'}`} />
                                  )}
                                  {/* Highlight spine texture on left */}
                                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />
                                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-white/10" />

                                  {/* Dynamic book cover content */}
                                  <div className="relative z-10 space-y-1">
                                    <div className="text-[7px] text-white/60 tracking-widest font-sans uppercase">
                                      {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র' : 'BSK Publication'}
                                    </div>
                                    <h5 className="text-white text-xs md:text-sm font-serif font-bold leading-snug line-clamp-3">
                                      {language === 'bn' ? book.titleBn : book.titleEn}
                                    </h5>
                                  </div>

                                  <div className="relative z-10 text-[9px] text-white/80 font-sans border-t border-white/20 pt-1 flex items-center justify-between">
                                    <span className="truncate max-w-[70%]">{language === 'bn' ? book.authorBn : book.authorEn}</span>
                                    <span>📖</span>
                                  </div>
                                </div>

                                {/* Title & Author Label */}
                                <div className="space-y-0.5 max-w-[128px]">
                                  <h6 className="font-serif font-bold text-xs md:text-sm text-[#1A1207] line-clamp-1 group-hover:text-[#B8862A] transition-colors text-left sm:text-center w-full">
                                    {language === 'bn' ? book.titleBn : book.titleEn}
                                  </h6>
                                  <p className="text-[10px] md:text-xs text-stone-500 truncate text-left sm:text-center w-full">
                                    {language === 'bn' ? book.authorBn : book.authorEn}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Photo Gallery & Exhibition (if present) */}
            {page.gallery && page.gallery.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? 'ছবি ও প্রকাশনা প্রদর্শনী' : 'Photo Gallery & Exhibitions'}</span>
                  </h3>
                  <span className="text-xs text-stone-500">
                    {page.gallery.length} {language === 'bn' ? 'টি ছবি' : 'Photos'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {page.gallery.map((imgItem: any, gIdx: number) => {
                    const imgSrc = typeof imgItem === 'string' ? imgItem : imgItem.image || imgItem.url;
                    const imgCaption = typeof imgItem === 'object' 
                      ? (language === 'bn' ? (imgItem.caption_bn || imgItem.caption) : (imgItem.caption_en || imgItem.caption))
                      : '';
                    return (
                      <div 
                        key={gIdx}
                        onClick={() => {
                          const allGalleryUrls = page.gallery!.map((g: any) => typeof g === 'string' ? g : g.image || g.url);
                          setActiveAlbumPhotos(allGalleryUrls);
                          setActivePhoto(imgSrc);
                          setActivePhotoIndex(gIdx);
                        }}
                        className="group relative aspect-4/3 rounded-xl overflow-hidden border border-stone-200 cursor-pointer shadow-xs hover:shadow-md transition-all"
                      >
                        <img 
                          src={imgSrc} 
                          alt={imgCaption || `Gallery item ${gIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-white text-xs font-serif line-clamp-2">{imgCaption}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Book Catalog Downloads and Links Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: List of Catalogs */}
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DDD0] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1207] border-b border-[#B8862A]/20 pb-2 mb-3 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? (page.catalogs_title_bn || 'প্রকাশনী ক্যাটালগ ও বইয়ের তালিকা') : (page.catalogs_title_en || 'Catalogs & Book Lists')}</span>
                </h3>
                
                <div className="space-y-3 text-left">
                  {(page.catalogs && page.catalogs.length > 0 ? page.catalogs : defaultPublicationCatalogs).map((cat: any, cIdx: number) => (
                    <a
                      key={cIdx}
                      href={cat.url || page.catalog_url || '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'}
                      download
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 hover:border-[#B8862A] hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center space-x-3 text-left overflow-hidden">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs md:text-sm font-bold text-stone-800 truncate group-hover:text-[#B8862A] transition-colors">
                            {language === 'bn' ? cat.titleBn : cat.titleEn}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {language === 'bn' ? (cat.fileSizeBn || cat.size || '৪.২ মেগাবাইট • পিডিএফ') : (cat.fileSizeEn || cat.size || '4.2 MB • PDF')}
                          </div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-stone-400 group-hover:text-[#B8862A] transition-colors flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Right Column: Contact Address and Info Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DDD0] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1207] border-b border-[#B8862A]/20 pb-2 mb-3 flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? (page.contact_title_bn || 'প্রকাশনা বিভাগের সঙ্গে যোগাযোগ') : (page.contact_title_en || 'Contact Publications Department')}</span>
                </h3>
                
                <div className="space-y-4 text-sm text-stone-700">
                  <div className="flex items-start space-x-3 text-left">
                    <MapPin className="w-5 h-5 text-[#B8862A] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-serif text-[#1A1207] block">
                        {language === 'bn' ? (page.contact_org_bn || 'বিশ্বসাহিত্য কেন্দ্র') : (page.contact_org_en || 'Bishwo Shahitto Kendro')}
                      </strong>
                      <span className="font-sans block text-stone-600">
                        {language === 'bn' 
                          ? (page.contact_address_bn || '১৭ ময়মনসিংহ রোড, বাংলামটর, ঢাকা ১০০০') 
                          : (page.contact_address_en || '17 Mymensingh Road, Banglamotor, Dhaka 1000')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-left">
                    <div className="flex items-center space-x-2">
                      <PhoneCall className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase">{language === 'bn' ? 'ফোন' : 'Telephone'}</div>
                        <div className="text-xs md:text-sm font-bold text-stone-800">{page.contact_phones || '৯৬৬০৮১২, ৫৮৬১১৯৪০'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneCall className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</div>
                        <div className="text-xs md:text-sm font-bold text-stone-800">{page.contact_mobiles || '০১৮৩৯৯০৬৭৫৪, ০১৭১২৫৪১২৬৩'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-stone-100 text-left">
                    <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase">{language === 'bn' ? 'ই-মেইল' : 'Email Address'}</div>
                      <a href={`mailto:${page.contact_email || 'bskprokashona@gmail.com'}`} className="text-xs md:text-sm font-bold text-[#B8862A] hover:underline">
                        {page.contact_email || 'bskprokashona@gmail.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct inquiry form block */}
            <div className="bg-[#FAF7F2] p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207]">
                    {language === 'bn' ? (page.inquiry_title_bn || 'প্রকাশনা বা বই সংক্রান্ত জিজ্ঞাসা') : (page.inquiry_title_en || 'Publications & Book Inquiry')}
                  </h3>
                  <p className="text-xs md:text-sm text-stone-500">
                    {language === 'bn' 
                      ? (page.inquiry_desc_bn || 'যেকোনো বইয়ের প্রাপ্তি বা প্রকাশনা বিষয়ক জিজ্ঞাসার জন্য সরাসরি আমাদের জানান') 
                      : (page.inquiry_desc_en || 'Send us your queries regarding book availability, orders, or translations.')}
                  </p>
                </div>

                {pubInquirySubmitted ? (
                  <div className="p-6 bg-white rounded-xl border border-emerald-100 shadow-xs text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-emerald-800">
                      {language === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {language === 'bn' 
                        ? 'আমাদের প্রকাশনা বিভাগ থেকে আপনার সাথে মোবাইল বা ইমেইলের মাধ্যমে শীঘ্রই যোগাযোগ করা হবে।' 
                        : 'Our publication department will get back to you via email or phone shortly.'}
                    </p>
                    <button
                      onClick={() => setPubInquirySubmitted(false)}
                      className="px-4 py-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePubInquirySubmit} className="space-y-4">
                    {pubInquiryError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-sans text-left flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                        <span>{pubInquiryError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'আপনার নাম' : 'Your Name'} <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={pubInquiryForm.name}
                          onChange={(e) => setPubInquiryForm({ ...pubInquiryForm, name: e.target.value })}
                          className="w-full p-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] text-stone-800"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          required
                          value={pubInquiryForm.phone}
                          onChange={(e) => setPubInquiryForm({ ...pubInquiryForm, phone: e.target.value })}
                          className="w-full p-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'ই-মেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                        <input
                          type="email"
                          value={pubInquiryForm.email}
                          onChange={(e) => setPubInquiryForm({ ...pubInquiryForm, email: e.target.value })}
                          className="w-full p-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] text-stone-800"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'জিজ্ঞাসার বিষয়' : 'Subject of Inquiry'}</label>
                        <input
                          type="text"
                          value={pubInquiryForm.subject}
                          onChange={(e) => setPubInquiryForm({ ...pubInquiryForm, subject: e.target.value })}
                          placeholder={language === 'bn' ? 'যেমন: বইয়ের স্টক, ক্যাটালগ প্রাপ্তি' : 'e.g. Stock Availability, Catalog orders'}
                          className="w-full p-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'আপনার বার্তা / জিজ্ঞাসা' : 'Your Inquiry Message'} <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        rows={4}
                        value={pubInquiryForm.message}
                        onChange={(e) => setPubInquiryForm({ ...pubInquiryForm, message: e.target.value })}
                        className="w-full p-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] text-stone-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={pubInquirySubmitting}
                      className="w-full bg-[#1A1207] hover:bg-[#3D2B14] text-white py-3 rounded-xl text-sm font-bold active:scale-99 transition-all disabled:opacity-50"
                    >
                      {pubInquirySubmitting 
                        ? (language === 'bn' ? 'বার্তা পাঠানো হচ্ছে...' : 'Sending Message...') 
                        : (language === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Individual Book Detail Dialog Modal */}
            <AnimatePresence>
              {pubSelectedBook && (
                <div 
                  onClick={() => setPubSelectedBook(null)}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 text-left cursor-default"
                  >
                    <button
                      onClick={() => setPubSelectedBook(null)}
                      className="absolute right-4 top-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Left: 3D Book Cover styling inside popup */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-32 h-48 rounded-r-md shadow-xl overflow-hidden flex flex-col justify-between p-3 text-left">
                          <div className="absolute inset-0 bg-stone-900/10 mix-blend-multiply" />
                          <div className={`absolute inset-0 ${pubSelectedBook.coverBg}`} />
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />
                          <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-white/10" />

                          <div className="relative z-10 space-y-1">
                            <div className="text-[7px] text-white/60 tracking-widest font-sans uppercase">
                              {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র' : 'BSK Publication'}
                            </div>
                            <h5 className="text-white text-xs md:text-sm font-serif font-bold leading-snug line-clamp-4">
                              {language === 'bn' ? pubSelectedBook.titleBn : pubSelectedBook.titleEn}
                            </h5>
                          </div>

                          <div className="relative z-10 text-[9px] text-white/80 font-sans border-t border-white/20 pt-1 flex items-center justify-between">
                            <span className="truncate max-w-[70%]">{language === 'bn' ? pubSelectedBook.authorBn : pubSelectedBook.authorEn}</span>
                            <span>📖</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Book Meta details */}
                      <div className="flex-grow space-y-3 text-left">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B8862A]/10 text-[#B8862A] border border-[#B8862A]/20">
                          {pubSelectedBook.seriesTitle}
                        </span>
                        <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] leading-snug">
                          {language === 'bn' ? pubSelectedBook.titleBn : pubSelectedBook.titleEn}
                        </h3>
                        <p className="text-xs md:text-sm text-[#B8862A] font-serif font-bold">
                          {language === 'bn' ? `লেখক: ${pubSelectedBook.authorBn}` : `Author: ${pubSelectedBook.authorEn}`}
                        </p>
                        <p className="text-xs text-stone-500 font-sans">
                          {language === 'bn' ? `পৃষ্ঠা সংখ্যা: ${pubSelectedBook.pages || 'N/A'}` : `Pages: ${pubSelectedBook.pages || 'N/A'}`}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-stone-200/60 pt-4 space-y-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি' : 'Brief Summary'}</span>
                        <p className="text-stone-700 text-sm leading-relaxed font-sans text-left">
                          {language === 'bn' ? pubSelectedBook.descBn : pubSelectedBook.descEn}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => {
                            setPubSelectedBook(null);
                            onNavigate('bookshop');
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 bg-[#B8862A] hover:bg-[#9A6D1F] text-white px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm"
                        >
                          <BookOpenCheck className="w-4 h-4" />
                          <span>{language === 'bn' ? 'বই বিক্রয় কেন্দ্রে খুঁজুন' : 'Check at Book Shop'}</span>
                        </button>
                        <button
                          onClick={() => setPubSelectedBook(null)}
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-all text-sm"
                        >
                          {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : page.id === 'central-library' ? (
          <div className="space-y-8 md:space-y-12 w-full animate-fade-in text-left">
            {(() => {
              const getTranslatedText = (text: string, currentLang: 'bn' | 'en'): string => {
                if (!text) return '';
                if (text.includes('--')) {
                  const parts = text.split('--').map(s => s.trim());
                  return currentLang === 'bn' ? parts[0] : (parts[1] || parts[0]);
                }
                return text;
              };

              const sections = page.sections || [];
              
              // 1. About the Library / Mission (Section 1)
              const hasSec0 = sections.length > 0 && sections[0];
              const aboutText = hasSec0 && sections[0].content && sections[0].content[0]
                ? getTranslatedText(sections[0].content[0], language)
                : (language === 'bn'
                  ? 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্র লাইব্রেরিটি দেশ-বিদেশের অমূল্য ও ঐতিহ্যবাহী গ্রন্থের এক বিশাল আধার। পাঠকদের মননশীল ও উন্নত দৃষ্টিভঙ্গি গঠনে এবং তাদের জ্ঞানের দিগন্ত প্রসারিত করতে এই পাঠাগার দীর্ঘ চার দশকেরও বেশি সময় ধরে নিরলস সেবা দিয়ে যাচ্ছে।'
                  : 'The Central Library of Bishwo Shahitto Kendro houses an extraordinary array of global literature and rare academic volumes. Serving for more than four decades, it has shaped thousands of enlightened minds and continues to push intellectual boundaries.');
              
              const missionText = hasSec0 && sections[0].content && sections[0].content[1]
                ? getTranslatedText(sections[0].content[1], language)
                : (language === 'bn'
                  ? 'মানসম্পন্ন সাহিত্য ও মননশীল গ্রন্থের মাধ্যমে মানুষের মনকে প্রসারিত ও আলোকিত করা এবং একটি সংবেদনশীল ও প্রজ্ঞাবান জাতি গড়ে তোলার মূল চালিকাশক্তি হিসেবে কাজ করা।'
                  : 'To cultivate a reading culture and elevate human consciousness through exposure to fine literature, arts, and philosophy, shaping a sensible and enlightened society.');

              const aboutTitle = hasSec0 && sections[0].title
                ? getTranslatedText(sections[0].title, language)
                : (language === 'bn' ? 'লাইব্রেরির পরিচিতি ও লক্ষ্য' : 'About the Central Library');

              // 2. Stats (Section 2)
              const hasSec1 = sections.length > 1 && sections[1];
              const defaultStats = [
                { val: language === 'bn' ? '📚 ৮৫,০০০+' : '📚 85,000+', lbl: language === 'bn' ? 'বইয়ের সংগ্রহ' : 'Books Collection', sub: language === 'bn' ? 'দেশি-বিদেশী দুর্লভ বই' : 'Local & Global Classics', icon: BookOpen },
                { val: language === 'bn' ? '👥 ১৫,০০০+' : '👥 15,000+', lbl: language === 'bn' ? 'সক্রিয় সদস্য' : 'Active Members', sub: language === 'bn' ? 'পাঠক ও গবেষকবৃন্দ' : 'Avid Readers & Scholars', icon: HeartHandshake },
                { val: language === 'bn' ? '🏛️ কেন্দ্রীয় পাঠাগার' : '🏛️ Central Library', lbl: language === 'bn' ? 'প্রধান ভবন' : 'HQ Reading Hall', sub: language === 'bn' ? 'বাংলামোটর, ঢাকা' : 'Banglamotor, Dhaka', icon: Landmark },
                { val: language === 'bn' ? '🕒 সকাল ১০টা - রাত ৮টা' : '🕒 10 AM - 8 PM', lbl: language === 'bn' ? 'সেবা সময়সীমা' : 'Service Hours', sub: language === 'bn' ? 'শনিবার থেকে বৃহস্পতিবার' : 'Saturday to Thursday', icon: Calendar }
              ];
              
              let parsedStats = defaultStats;
              if (hasSec1 && sections[1].content && sections[1].content.length > 0) {
                if (Array.isArray(sections[1].content)) {
                  parsedStats = sections[1].content.map((item, idx) => {
                    const parts = item.split('|').map(s => s.trim());
                    return {
                      val: getTranslatedText(parts[0] || '', language) || (defaultStats[idx]?.val || ''),
                      lbl: getTranslatedText(parts[1] || '', language) || (defaultStats[idx]?.lbl || ''),
                      sub: getTranslatedText(parts[2] || '', language) || (defaultStats[idx]?.sub || ''),
                      icon: defaultStats[idx]?.icon || BookOpen
                    };
                  });
                }
              }

              // 3. Key Features (Section 3)
              const hasSec2 = sections.length > 2 && sections[2];
              const feature1_raw = hasSec2 && sections[2].content && sections[2].content[0]
                ? sections[2].content[0]
                : (language === 'bn'
                  ? 'বইয়ের বিশাল সংগ্রহ: আমাদের সংগ্রহে রয়েছে বাংলা সাহিত্য, অনূদিত বিশ্বসাহিত্য, বিজ্ঞান, ইতিহাস, দর্শন ও চিত্রকলার সুবিন্যস্ত সম্ভার। এছাড়া রয়েছে গবেষণাধর্মী ও দুর্লভ রেফারেন্স গ্রন্থের এক দুর্লভ সংগ্রহশালা।'
                  : 'Pristine Collection: Features rare translations, classic world fiction, historical chronicles, scientific journals, philosophy, art, and children literature, indexed to aid research.');
              const feature2_raw = hasSec2 && sections[2].content && sections[2].content[1]
                ? sections[2].content[1]
                : (language === 'bn'
                  ? 'মনোরম পাঠ পরিবেশ: সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত, কোলাহলমুক্ত ও সুপ্রশস্ত পাঠকক্ষ। প্রাকৃতিক আলো-বাতাস ও মনোরম ইন্টেরিয়র ডিজাইন পাঠকদের অধ্যয়ন ও গবেষণাকে আরও উপভোগ্য ও ফলপ্রসূ করে তোলে।'
                  : 'Aesthetic Environment: Spacious, naturally lit, and air-conditioned reading halls create a tranquil space. Modern desks, comfortable seating, and helpful curators ensure peak focus.');

              const f1_translated = getTranslatedText(feature1_raw, language);
              const f2_translated = getTranslatedText(feature2_raw, language);

              const f1_parts = f1_translated.includes(': ') ? f1_translated.split(': ') : f1_translated.split(':');
              const f2_parts = f2_translated.includes(': ') ? f2_translated.split(': ') : f2_translated.split(':');

              const f1_title = f1_parts[0]?.trim() || (language === 'bn' ? 'বইয়ের বিশাল সংগ্রহ' : 'Pristine Collection');
              const f1_desc = f1_parts.slice(1).join(':').trim() || f1_parts[0]?.trim();
              const f2_title = f2_parts[0]?.trim() || (language === 'bn' ? 'মনোরম পাঠ পরিবেশ' : 'Aesthetic Environment');
              const f2_desc = f2_parts.slice(1).join(':').trim() || f2_parts[0]?.trim();

              // 4. Library Services Gallery (Section 4)
              const hasSec3 = sections.length > 3 && sections[3];
              const defaultServices = [
                {
                  title_bn: 'বই ধার নেওয়া ও কাউন্টার সেবা',
                  title_en: 'Book Lending & Counter Services',
                  icon: BookOpen,
                  desc_bn: 'বিশ্বসাহিত্য কেন্দ্রের লক্ষ লক্ষ বইয়ের সংগ্রহ থেকে পছন্দের বই বাড়িতে নিয়ে পড়ার জন্য সাধারণ ও গবেষণা সদস্যদের জন্য বই ধার নেওয়ার বিশেষ কাউন্টার সেবা।',
                  desc_en: 'Borrow and return classic titles to read in your comfortable home environment from our collection of hundreds of thousands of books.',
                  img: '/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg'
                },
                {
                  title_bn: 'মনোরম ও কোলাহলমুক্ত প্রধান পাঠকক্ষ',
                  title_en: 'Aesthetic Reading Hall',
                  icon: Library,
                  desc_bn: 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত, কোলাহলমুক্ত ও সুপ্রশস্ত প্রধান পাঠকক্ষ। যেখানে মনোরম ইন্টেরিয়র এবং প্রাকৃতিক আলোর সমন্বয়ে পড়ার জন্য নিখুঁত পরিবেশ রয়েছে।',
                  desc_en: 'A quiet, spacious and air-conditioned main reading hall designed with natural light to ensure peak focus for readers and researchers.',
                  img: '/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg'
                },
                {
                  title_bn: 'রেফারেন্স ও গবেষণা আর্কাইভ',
                  title_en: 'Reference & Archives',
                  icon: Award,
                  desc_bn: 'দেশ-বিদেশের দুষ্প্রাপ্য রেফারেন্স গ্রন্থ, বিশ্বকোষ, গবেষণাধর্মী জার্নাল, চিত্রকলা ও মানচিত্রের এক সমৃদ্ধ সংগ্রহ যা উচ্চতর গবেষণা এবং তথ্যানুসন্ধানের চমৎকার সহায়ক।',
                  desc_en: 'A comprehensive repository of rare reference books, encyclopedias, scholarly journals, and fine arts collections to support high-level research.',
                  img: '/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg'
                },
                {
                  title_bn: 'জ্ঞানভিত্তিক কার্যক্রম ও পাঠক সমাবেশ',
                  title_en: 'Enlightenment Assemblies',
                  icon: Sparkles,
                  desc_bn: 'পাঠকদের চিন্তার পরিধি ও মননশীলতা বৃদ্ধির লক্ষ্যে নিয়মিত পাঠচক্র, সাহিত্য আলোচনা সভা, বিশিষ্ট লেখকদের সান্নিধ্য এবং বিষয়ভিত্তিক বইয়ের আকর্ষণীয় প্রদর্শনী।',
                  desc_en: 'Regular reading circles, literary dialogues, meetings with eminent authors, and thematic exhibitions to foster deep intellectual engagement.',
                  img: '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg'
                },
                {
                  title_bn: 'শিশু-কিশোর কর্নার',
                  title_en: 'Children & Youth Section',
                  icon: Compass,
                  desc_bn: 'শিশু-কিশোরদের মনে শৈশব থেকেই বই পড়ার প্রতি ভালোবাসা জন্মানোর লক্ষ্যে তাদের উপযোগী ছবি ও বিচিত্র রূপকথার বই দিয়ে সজ্জিত একটি আকর্ষণীয় ও রঙিন জগৎ।',
                  desc_en: 'A colorful, welcoming space curated with illustrated books, fairy tales, and educational games to instil a lifelong passion for reading in children.',
                  img: '/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg'
                },
                {
                  title_bn: 'তথ্য ও ডিজিটাল সাহায্য সেবা',
                  title_en: 'Reference & Help Desk',
                  icon: HelpCircle,
                  desc_bn: 'পাঠকদের প্রয়োজনীয় বই সহজে ও দ্রুততম সময়ে খুঁজে দিতে সাহায্য করার জন্য দক্ষ ক্যাটালগ ডেস্ক ও আধুনিক তথ্য অনুসন্ধান সেবা।',
                  desc_en: 'Expert curation and catalog assistance helping readers quickly locate target volumes, check availability and conduct academic searches.',
                  img: '/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg'
                }
              ];

              let galleryServices = defaultServices;
              if (page.gallery && Array.isArray(page.gallery) && page.gallery.length > 0) {
                galleryServices = page.gallery.map((g: any, idx: number) => ({
                  title_bn: g.caption_bn || g.title_bn || g.title || defaultServices[idx]?.title_bn || `সেবা #${idx + 1}`,
                  title_en: g.caption_en || g.title_en || defaultServices[idx]?.title_en || `Service #${idx + 1}`,
                  img: g.image || g.img || g.url || defaultServices[idx]?.img || '/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg',
                  desc_bn: g.desc_bn || g.description_bn || defaultServices[idx]?.desc_bn || '',
                  desc_en: g.desc_en || g.description_en || defaultServices[idx]?.desc_en || '',
                  icon: defaultServices[idx]?.icon || BookOpen
                }));
              } else if (hasSec3 && sections[3].content && sections[3].content.length > 0) {
                if (Array.isArray(sections[3].content)) {
                  galleryServices = sections[3].content.map((item, idx) => {
                    const parts = item.split('|').map(s => s.trim());
                    return {
                      title_bn: getTranslatedText(parts[0] || '', 'bn') || (defaultServices[idx]?.title_bn || ''),
                      title_en: getTranslatedText(parts[0] || '', 'en') || (defaultServices[idx]?.title_en || ''),
                      img: parts[1] || (defaultServices[idx]?.img || ''),
                      desc_bn: getTranslatedText(parts[2] || '', 'bn') || (defaultServices[idx]?.desc_bn || ''),
                      desc_en: getTranslatedText(parts[2] || '', 'en') || (defaultServices[idx]?.desc_en || ''),
                      icon: defaultServices[idx]?.icon || BookOpen
                    };
                  });
                }
              }

              const activeSer = galleryServices[activeServiceIndex] || galleryServices[0];

              return (
                <>
                  {/* 1. Hero Section (Enlarged Gallery Image Showcase) */}
                  <div className="relative bg-[#FAF8F3] border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-xs">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#B8862A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 items-center">
                      <div className="lg:col-span-4 space-y-5 text-left">
                        <span className="inline-flex items-center gap-1.5 bg-[#B8862A]/10 text-[#B8862A] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#B8862A]/20">
                          <Library className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? (page.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র') : (page.badge_en || 'Bishwo Shahitto Kendro')}</span>
                        </span>
                        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1207] tracking-tight leading-tight">
                          {language === 'bn' ? (page.title_bn || 'কেন্দ্র লাইব্রেরি') : (page.title_en || 'Central Library HQ')}
                        </h1>
                        <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans">
                          {language === 'bn' 
                            ? (page.subtitle_bn || (sections[0]?.content?.[0] ? getTranslatedText(sections[0].content[0], 'bn') : 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্র লাইব্রেরিটি দেশ-বিদেশের অমূল্য ও ঐতিহ্যবাহী গ্রন্থের এক বিশাল আধার।'))
                            : (page.subtitle_en || (sections[0]?.content?.[0] ? getTranslatedText(sections[0].content[0], 'en') : 'The Central Library of Bishwo Shahitto Kendro houses an extraordinary array of global literature.'))
                          }
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <button 
                            onClick={() => setMembershipModalOpen(true)}
                            className="inline-flex items-center justify-center space-x-2 bg-[#B8862A] text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-[#9A6D1F] transition-all duration-200 shadow-xs cursor-pointer hover:shadow-md"
                          >
                            <HeartHandshake className="w-4 h-4" />
                            <span>{language === 'bn' ? 'সদস্য হতে আবেদন করুন' : 'Apply for Membership'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="lg:col-span-8 relative group">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#B8862A]/20 to-[#E8DDD0] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300" />
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#E8DDD0] bg-stone-100 shadow-lg">
                          <img 
                            src={page.hero_image || "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg"} 
                            alt={language === 'bn' ? page.title_bn : page.title_en} 
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Statistics Section */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {parsedStats.map((st, sidx) => (
                      <div key={sidx} className="bg-white border border-[#E8DDD0] rounded-2xl p-5 text-left space-y-2 hover:border-[#B8862A] hover:shadow-md transition-all duration-300 group">
                        <div className="space-y-1">
                          <div className="font-serif font-extrabold text-base sm:text-lg text-[#1A1207]">
                            {st.val}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-stone-700">
                            {st.lbl}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {st.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. About the Library */}
                  <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-xs">
                    <div className="border-b border-[#E8DDD0] pb-4">
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1A1207] flex items-center space-x-2">
                        <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                        <span>{aboutTitle}</span>
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-sm text-stone-700">
                      <div className="space-y-4">
                        <p className="font-sans text-stone-600">
                          {aboutText}
                        </p>
                        <div className="bg-[#FAF8F3] border-l-4 border-[#B8862A] p-4 rounded-r-xl">
                          <h4 className="font-serif font-bold text-stone-900 mb-1">
                            {language === 'bn' ? 'আমাদের মূল उद्देश्य (Mission)' : 'Our Mission'}
                          </h4>
                          <p className="text-xs text-stone-600">
                            {missionText}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-serif font-bold text-[#1A1207] mb-1.5 flex items-center gap-1.5 text-base">
                            <BookOpenCheck className="w-4 h-4 text-[#B8862A]" />
                            <span>{f1_title}</span>
                          </h4>
                          <p className="text-xs text-stone-600">
                            {f1_desc}
                          </p>
                        </div>
                        <div className="pt-2">
                          <h4 className="font-serif font-bold text-[#1A1207] mb-1.5 flex items-center gap-1.5 text-base">
                            <Sparkles className="w-4 h-4 text-[#B8862A]" />
                            <span>{f2_title}</span>
                          </h4>
                          <p className="text-xs text-stone-600">
                            {f2_desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Library Services Gallery (Enlarged) */}
                  <div className="space-y-6 text-left">
                    <div className="border-b border-[#E8DDD0] pb-3">
                      <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                        <span className="w-1.5 h-5 bg-[#B8862A] rounded-full inline-block" />
                        <span>{language === 'bn' ? 'লাইব্রেরি সেবাসমূহ ও গ্যালারি' : 'Library Services & Photo Gallery'}</span>
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-1">
                        {language === 'bn' 
                          ? 'যেকোনো সেবায় ক্লিক করে বিস্তারিত বিবরণ এবং ছবির গ্যালারি দেখে নিন' 
                          : 'Click any service tile below to explore details and view live photos'}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Featured Large Gallery Photo and Info Display (Enlarged layout) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-xs">
                        {/* Left: Large Image with Overlay Controls */}
                        <div className="lg:col-span-8 relative aspect-video w-full overflow-hidden bg-stone-100 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeServiceIndex}
                              src={activeSer.img}
                              alt={activeSer.title_en}
                              initial={{ opacity: 0, scale: 1.02 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.4 }}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </AnimatePresence>

                          {/* Prev / Next Arrows */}
                          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                            <button
                              onClick={() => {
                                setActiveServiceIndex((prev) => 
                                  prev === 0 ? galleryServices.length - 1 : prev - 1
                                );
                              }}
                              className="w-10 h-10 rounded-full bg-[#1A1207]/70 hover:bg-[#B8862A] text-white flex items-center justify-center pointer-events-auto transition shadow-md cursor-pointer outline-none border-none"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveServiceIndex((prev) => 
                                  prev === galleryServices.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="w-10 h-10 rounded-full bg-[#1A1207]/70 hover:bg-[#B8862A] text-white flex items-center justify-center pointer-events-auto transition shadow-md cursor-pointer outline-none border-none"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Image Counter Badge */}
                          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono rounded-lg border border-white/10">
                            {activeServiceIndex + 1} / {galleryServices.length}
                          </div>
                        </div>

                        {/* Right: Service Description Content (Reduced span to 4) */}
                        <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between space-y-6 text-left">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-9 h-9 rounded-lg bg-[#B8862A]/10 flex items-center justify-center text-[#B8862A]">
                                <activeSer.icon className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#B8862A] tracking-wider uppercase">
                                {language === 'bn' ? 'লাইব্রেরি সেবাসমূহ' : 'Library Services'}
                              </span>
                            </div>

                            <h3 className="font-serif font-extrabold text-stone-900 text-lg md:text-xl leading-tight">
                              {language === 'bn' ? activeSer.title_bn : activeSer.title_en}
                            </h3>

                            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-sans">
                              {language === 'bn' ? activeSer.desc_bn : activeSer.desc_en}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 bg-[#B8862A] rounded-full" />
                              <span>{language === 'bn' ? 'সাপ্তাহিক সেবা দিনসমূহ' : 'Weekly Services'}</span>
                            </div>
                            <span className="font-bold text-[#B8862A]">{language === 'bn' ? 'শনিবার - বৃহস্পতিবার' : 'Sat - Thu'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Miniature Horizontal Photo Gallery (Thumbnails Selector) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {galleryServices.map((ser, sidx) => {
                          const isActive = activeServiceIndex === sidx;
                          return (
                            <button
                              key={sidx}
                              onClick={() => setActiveServiceIndex(sidx)}
                              className={`group text-left border rounded-xl overflow-hidden transition-all duration-300 bg-white shadow-2xs hover:shadow-xs outline-none cursor-pointer flex flex-col ${
                                isActive
                                  ? 'border-[#B8862A] ring-2 ring-[#B8862A]/10 scale-[1.01]'
                                  : 'border-[#E8DDD0] hover:border-[#B8862A]/50'
                              }`}
                            >
                              {/* Miniature Thumbnail Image */}
                              <div className="relative aspect-video w-full overflow-hidden bg-stone-100 border-b border-stone-100">
                                <img
                                  src={ser.img}
                                  alt={ser.title_en}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                {isActive && (
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <div className="px-2 py-0.5 bg-[#B8862A] text-white text-[8px] font-bold rounded-sm tracking-wider uppercase">
                                      {language === 'bn' ? 'চলতি' : 'Active'}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Thumbnail Title */}
                              <div className="p-2.5 flex-1 flex flex-col justify-center">
                                <span className={`text-[10px] font-serif font-bold leading-tight ${isActive ? 'text-[#B8862A]' : 'text-stone-800'}`}>
                                  {language === 'bn' ? ser.title_bn : ser.title_en}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* 5. Book Categories */}
            <div className="space-y-4 text-left">
              <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] flex items-center space-x-2">
                <span className="w-1.5 h-5 bg-[#B8862A] rounded-full inline-block" />
                <span>{language === 'bn' ? 'জনপ্রিয় বইয়ের বিভাগসমূহ' : 'Popular Book Categories'}</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { bn: "বাংলা সাহিত্য", en: "Bengali Literature", count: "২৫,০০০+ বই", countEn: "25,000+ Books" },
                  { bn: "বিশ্ব সাহিত্য", en: "World Literature", count: "১৮,০০০+ বই", countEn: "18,000+ Books" },
                  { bn: "ইতিহাস ও সংস্কৃতি", en: "History & Culture", count: "১২,০০০+ বই", countEn: "12,000+ Books" },
                  { bn: "বিজ্ঞান ও গবেষণা", en: "Science & Research", count: "১০,০০০+ বই", countEn: "10,000+ Books" },
                  { bn: "দর্শন ও চিন্তাধারা", en: "Philosophy & Thought", count: "৮,০০০+ বই", countEn: "8,000+ Books" },
                  { bn: "শিশু-কিশোর সাহিত্য", en: "Children & Youth", count: "১৫,০০০+ বই", countEn: "15,000+ Books" },
                  { bn: "কিশোর ক্লাসিকস", en: "Teen Classics", count: "৯,০০০+ বই", countEn: "9,000+ Books" },
                  { bn: "দুর্লভ সংগ্রহ", en: "Rare Collection", count: "৩,০০০+ বই", countEn: "3,000+ Books" },
                ].map((cat, cIdx) => (
                  <div key={cIdx} className="p-3.5 bg-white border border-[#E8DDD0] rounded-xl text-left hover:border-[#B8862A] transition-colors">
                    <span className="font-serif text-sm font-bold text-[#1A1207] block">
                      {language === "bn" ? cat.bn : cat.en}
                    </span>
                    <span className="text-[10px] text-stone-500 font-sans block mt-0.5">
                      {language === "bn" ? cat.count : cat.countEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : page.id === "reading-habit" ? (
          <div className="space-y-12 w-full animate-fade-in text-left">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF8F5] to-[#FFFDF9] border border-[#B8862A]/15 text-[#1A1207] shadow-xl p-6 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-[#B8862A]/10 text-[#8C6212] px-3.5 py-1.5 rounded-full border border-[#B8862A]/20 text-xs font-semibold tracking-wider uppercase">
                    <BookOpenCheck className="w-3.5 h-3.5 text-[#B8862A]" />
                    <span>{language === 'bn' ? (page.badge_bn || 'দেশব্যাপী আলোর কাফেলা') : (page.badge_en || 'Nationwide Enlightened Society')}</span>
                  </div>
                  
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1207] tracking-tight leading-tight">
                    {language === 'bn' ? (page.title_bn || 'পাঠাভ্যাস উন্নয়ন কর্মসূচি') : (page.title_en || 'Reading Habit Development Program')}
                  </h2>
                  
                  <p className="text-sm md:text-base text-stone-700 leading-relaxed font-sans font-light">
                    {language === 'bn' 
                      ? (page.subtitle_bn || page.sections?.[0]?.content?.[0] || 'কেন্দ্রের পাঠাভ্যাস উন্নয়ন কর্মসূচি শুরু হয়েছে ২০১০ সালে। এই কার্যক্রমটি কেন্দ্রের দেশভিত্তিক উৎকর্ষ কার্যক্রমের ষষ্ঠ থেকে দশম শ্রেণির পাঠক কর্মসূচির অনুরূপ, কিন্তু আকারে অনেক বড়। গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা মন্ত্রণালয়ের পক্ষে বিশ্বসাহিত্য কেন্দ্র এটি দেশব্যাপী অত্যন্ত সফলতার সাথে পরিচালনা করছে।')
                      : (page.subtitle_en || page.sections?.[0]?.content_en?.[0] || 'BSK\'s Reading Habit Development Program started in 2010. It aligns closely with the Elite Book Assessment programs for grades 6 to 10 but operates on a massive nationwide scale, conducted by BSK on behalf of the Ministry of Education.')}
                  </p>

                  <p className="text-sm md:text-base text-stone-700 leading-relaxed font-sans font-light">
                    {language === 'bn'
                      ? (page.sections?.[0]?.content?.[1] || page.hero_desc_bn || 'এই কর্মসূচির মূল উদ্দেশ্য শিক্ষার্থীদের মধ্যে স্বাধীনতা, দেশ ও কৃষ্টি, সাহিত্য-সংস্কৃতির বিষয়ে কিশোর উপযোগী সুখপাঠ্য মননশীল বই পড়ার অভ্যাস গড়ে তোলা; যা তাদের সুস্থ ও উদার মানসিকতার বিকাশ ঘটাবে এবং শিক্ষার প্রকৃত লক্ষ্য অর্জনে সহায়ক হবে।')
                      : (page.sections?.[0]?.content_en?.[1] || page.hero_desc_en || 'The key objective is to cultivate early reading habits with diverse, age-appropriate, and high-value literature that builds a balanced state of mind, strong moral values, and creative thinking among youths.')}
                  </p>

                  {/* Rules buttons */}
                  <div className="flex flex-wrap gap-3.5 pt-2">
                    <a 
                      href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-[#B8862A] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-[#9A6D1F] hover:shadow-lg transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'bn' ? 'কর্মসূচির বিবরণী ও নিয়মাবলি (PDF)' : 'Program Rules & Details (PDF)'}</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Featured Circular Image Frame */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative group max-w-sm w-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#B8862A]/20 to-transparent rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                    
                    {/* Beautiful circle container */}
                    <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#B8862A]/25 shadow-2xl mx-auto bg-stone-100 flex items-center justify-center">
                      <img 
                        src={page.hero_image || "/assets/IMGS/700224535_1396309085853902_3026706898645620199_n.jpg"} 
                        alt={language === 'bn' ? page.title_bn : page.title_en} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-65" />
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-black/45 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-center">
                        <p className="text-[10px] md:text-xs font-semibold text-[#F0CC7A] font-sans">
                          {language === 'bn' ? '📖 তরুণ শিক্ষার্থীদের নতুন বইয়ের আনন্দ' : '📖 Eager students celebrating books'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Interactive Key Performance Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  bnVal: "২৫০+ টি", 
                  enVal: "250+ Upazilas", 
                  bnLbl: "সক্রিয় উপজেলা", 
                  enLbl: "Active Upazilas", 
                  bnSub: "দেশজুড়ে বিস্তৃত কার্যক্রম", 
                  enSub: "Expanding across sub-districts", 
                  icon: MapPin, 
                  color: "bg-[#F7EFE5] text-[#8C6212]" 
                },
                { 
                  bnVal: "১২,৯১৭+ টি", 
                  enVal: "12,917+ Schools", 
                  bnLbl: "স্কুল ও মাদ্রাসা", 
                  enLbl: "Schools & Madrasas", 
                  bnSub: "যার মধ্যে ৩৩% মাদ্রাসা অন্তর্ভুক্ত", 
                  enSub: "Comprising 33% madrasas", 
                  icon: Landmark, 
                  color: "bg-[#E6F4EA] text-[#137333]" 
                },
                { 
                  bnVal: "২০.৯ লক্ষ+", 
                  enVal: "2.09 Million+", 
                  bnLbl: "বার্ষিক নিয়মিত পাঠক", 
                  enLbl: "Annual Active Readers", 
                  bnSub: "৬০% মেয়েদের স্বতঃস্ফূর্ত অংশগ্রহণ", 
                  enSub: "60% female student ratio", 
                  icon: HeartHandshake, 
                  color: "bg-[#E8F0FE] text-[#1A73E8]" 
                },
                { 
                  bnVal: "৮৩ লক্ষ+", 
                  enVal: "8.3 Million+", 
                  bnLbl: "মোট উপকৃত শিক্ষার্থী", 
                  enLbl: "Total Beneficiaries", 
                  bnSub: "২০১০ সাল থেকে এ পর্যন্ত", 
                  enSub: "Empowered since year 2010", 
                  icon: Award, 
                  color: "bg-[#FDF2F2] text-[#C5221F]" 
                }
              ].map((stat, sIndex) => {
                const StatIcon = stat.icon;
                return (
                  <div 
                    key={sIndex}
                    className="p-4 md:p-5 bg-white border border-[#E8DDD0] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center gap-4 hover:border-[#B8862A] hover:shadow-md transition duration-200"
                  >
                    <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                      <StatIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="font-serif text-lg md:text-xl font-extrabold text-[#1A1207] block leading-none">
                        {language === 'bn' ? stat.bnVal : stat.enVal}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 block">
                        {language === 'bn' ? stat.bnLbl : stat.enLbl}
                      </span>
                      <span className="text-[10px] text-stone-500 block leading-tight font-sans">
                        {language === 'bn' ? stat.bnSub : stat.enSub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Deep Narrative Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="p-6 md:p-8 bg-white rounded-2xl border border-[#E8DDD0] shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 text-[#B8862A]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {language === 'bn' ? 'কর্মসূচির গুরুত্ব' : 'Program Impact'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207]">
                    {language === 'bn' ? 'বৃহত্তম বইপড়া আন্দোলন' : 'The Largest Reading Campaign'}
                  </h3>
                  <p className="text-sm md:text-base text-stone-700 font-sans leading-relaxed">
                    {language === 'bn'
                      ? 'পাঠাভ্যাস উন্নয়ন কার্যক্রমটি এই মুহূর্তে বিশ্বসাহিত্য কেন্দ্রের বৃহত্তম এবং অন্যতম মর্যাদাপূর্ণ দেশব্যাপী কর্মসূচি। মাধ্যমিক স্তরের শিক্ষার্থীদের মাঝে নৈতিক মূল্যবোধ, পরিশীলিত দৃষ্টিভঙ্গি এবং সাহিত্য-সংস্কৃতির প্রতি অনুরাগ সৃষ্টিতে এই কার্যক্রম অত্যন্ত সফল ভূমিকা পালন করছে।'
                      : 'The Reading Habit Development Program is currently BSK\'s largest and most expansive nationwide initiative. It plays a highly successful role in instilling moral values, refined perspectives, and a genuine love for arts and culture in secondary level students.'}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-[#FAF7F2] rounded-2xl border border-[#E8DDD0] shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 text-[#137333]">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {language === 'bn' ? 'মাদ্রাসা ও নারী শিক্ষা' : 'Inclusiveness'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1207]">
                    {language === 'bn' ? 'মাদ্রাসা অন্তর্ভুক্তি ও নারী জাগরণ' : 'Madrasa Integration & Female Empowerment'}
                  </h3>
                  <p className="text-sm md:text-base text-stone-700 font-sans leading-relaxed">
                    {language === 'bn'
                      ? 'এই কর্মসূচির অন্যতম বড় বৈশিষ্ট্য হলো সাধারণ স্কুলের পাশাপাশি দেশের প্রায় ৩৩ শতাংশ মাদ্রাসা এই কার্যক্রমে যুক্ত। এছাড়াও বইপড়া কার্যক্রমে মেয়েদের স্বতঃস্ফূর্ত অংশগ্রহণের হার প্রায় ৬০%, যা দেশের নারী শিক্ষা এবং জেন্ডার সমতায় এক নতুন বিপ্লবের সূচনা করেছে।'
                      : 'One of the hallmark traits of the program is its exceptional inclusivity, with over 33% of the target institutions being Madrasas. Furthermore, female students represent over 60% of all participants, driving a silent educational and cultural awakening.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Beautiful Timeline Opportunities */}
            <div className="space-y-6">
              <div className="border-b border-[#E8DDD0] pb-3 text-left">
                <h3 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
                  <BookOpenCheck className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? 'কর্মসূচির মূল সুযোগ ও সুফলসমূহ' : 'Core Opportunities & Deliverables'}</span>
                </h3>
                <p className="text-xs text-[#6B5135] mt-1">
                  {language === 'bn' 
                    ? 'পাঠাভ্যাস উন্নয়ন কর্মসূচির মাধ্যমে সারা দেশে যে সুবর্ণ সুযোগসমূহ তৈরি হয়েছে:'
                    : 'The direct benefits and opportunities created nationwide by this milestone initiative:'}
                </p>
              </div>

              {/* Opportunities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  {
                    titleBn: "১. অনুকূল পরিবেশ সৃষ্টি",
                    titleEn: "1. Favorable Environment",
                    descBn: "প্রকল্পভুক্ত সকল মাধ্যমিক বিদ্যালয়ে ও মাদ্রাসায় ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য চমৎকার বইপড়ার অনুকূল পরিবেশ তৈরি করা হয়।",
                    descEn: "Creating an attractive and healthy reading ecosystem inside schools for secondary students."
                  },
                  {
                    titleBn: "২. সুন্দর সুখপাঠ্য বইয়ের অভ্যাস",
                    titleEn: "2. Good Books Habits",
                    descBn: "বয়স ও মন-উপযোগী অত্যন্ত মানসম্মত সুখপাঠ্য এবং উচ্চতর মূল্যবোধসম্পন্ন বাংলা ও ইংরেজি বই পড়ায় শিক্ষার্থীদের অভ্যস্ত করা হয়।",
                    descEn: "Developing regular habits of reading carefully-selected high-moral books in Bengali and English."
                  },
                  {
                    titleBn: "৩. শিক্ষক ও লাইব্রেরিয়ান প্রশিক্ষণ",
                    titleEn: "3. Professional Training",
                    descBn: "কর্মসূচি যথাযথভাবে পরিচালনার জন্য প্রতিটি শিক্ষা প্রতিষ্ঠানের মনোনীত শিক্ষক ও লাইব্রেরিয়ানকে নিবিড় প্রশিক্ষণ প্রদান করা হয়।",
                    descEn: "Conducting specialized operational training for teachers and librarians in each school."
                  },
                  {
                    titleBn: "৪. সৃজনশীল মূল্যায়ন",
                    titleEn: "4. Creative Assessment",
                    descBn: "পঠিত বইগুলোর চমৎকার ও আনন্দময় মূল্যায়নের মাধ্যমে শিক্ষার্থীদের মেধা, সৃজনশীলতা ও বোঝার ক্ষমতা পরিমাপ করা হয়।",
                    descEn: "Measuring comprehension and moral learning through interactive and non-threatening evaluation games."
                  },
                  {
                    titleBn: "৫. আকর্ষণীয় পুরস্কার বিতরণ",
                    titleEn: "5. Elite Prize Giving",
                    descBn: "মূল্যায়ন শেষে সফল শিক্ষার্থীদের মেধার স্বীকৃতির স্বরূপ দর্শনীয় বইপড়া সনদ এবং আকর্ষণীয় মূল্যবান বই পুরস্বৃত করা হয়।",
                    descEn: "Rewarding high-achieving students with beautiful certificates and precious sets of illustrated books."
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-5 bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#B8862A]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h4 className="font-sans text-sm font-bold text-[#8C6212] leading-snug">
                        {language === 'bn' ? item.titleBn : item.titleEn}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                        {language === 'bn' ? item.descBn : item.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Stunning Wide Feature Image & Photo Gallery Section */}
            <div className="space-y-6">
              <div className="border-b border-[#E8DDD0] pb-3 text-left">
                <h3 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207] flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-[#B8862A]" />
                  <span>{language === 'bn' ? 'কর্মসূচির আলোকচিত্র গ্যালারি' : 'Program Photo Gallery'}</span>
                </h3>
                <p className="text-xs text-[#6B5135] mt-1">
                  {language === 'bn' 
                    ? 'পাঠাভ্যাস উন্নয়ন কর্মসূচির বই মূল্যায়ন পরীক্ষা, উৎসব, কর্মশালা ও পুরস্কারের খণ্ডচিত্র।'
                    : 'Glimpses of books evaluation tests, annual distribution festivals, and workshops.'}
                </p>
              </div>

              {/* Wide Banner Image Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-md aspect-video md:aspect-[21/9] w-full">
                <img 
                  src="/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg" 
                  alt={language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র গ্রন্থাগারে নিবিড় অধ্যয়নরত শিক্ষার্থী দল' : 'Students reading at BSK Library'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 text-left">
                  <p className="text-xs md:text-sm font-bold text-white font-sans">
                    {language === 'bn' ? '🚍  মাধ্যমিক বিদ্যালয় প্রাঙ্গণ ও পাঠাগারসমূহে জ্ঞানের নিরব বিপ্লব' : '🚍 A silent educational revolution in secondary schools'}
                  </p>
                </div>
              </div>

              {/* Grid Gallery with Lightbox support */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  {
                    url: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
                    captionBn: "দেশভিত্তিক উৎকর্ষ ও পাঠাভ্যাস বই মূল্যায়ন পরীক্ষা ও পুরস্কার বিতরণ",
                    captionEn: "Elite book evaluation assessments and creative reading rewards"
                  },
                  {
                    url: "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg",
                    captionBn: "জাতীয় গ্রন্থ ও বই বিতরণ উৎসব প্রাঙ্গণ",
                    captionEn: "Eager students celebrating the books distribution carnival"
                  },
                  {
                    url: "/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg",
                    captionBn: "শিক্ষার্থীদের স্বতঃস্ফূর্ত বইপড়া সেমিনার",
                    captionEn: "Book reading seminars and creative youth workshops"
                  },
                  {
                    url: "/assets/IMGS/716885790_1415634970587980_7564637071825495839_n.jpg",
                    captionBn: "বই বিতরণ ও পাঠকদের উচ্ছ্বসিত সমাবেশ",
                    captionEn: "Magnificent reader assembly and active discussion"
                  },
                  {
                    url: "/assets/IMGS/699105967_1396309219187222_3554275610071392150_n.jpg",
                    captionBn: "শিক্ষকদের পাঠাভ্যাস কর্মসূচি সংক্রান্ত নিবিড় প্রশিক্ষণ কর্মশালা",
                    captionEn: "Enthusiastic teacher and librarian training sessions"
                  },
                  {
                    url: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
                    captionBn: "গ্রন্থাগারে অধ্যয়নরত উৎসुक পাঠকবৃন্দ",
                    captionEn: "Eager secondary students engrossed in library archives"
                  }
                ].map((img, idx, arr) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActivePhoto(img.url);
                      setActivePhotoIndex(idx);
                      setActiveAlbumPhotos(arr.map(a => a.url));
                    }}
                    className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img 
                        src={img.url} 
                        alt={language === 'bn' ? img.captionBn : img.captionEn} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors duration-300">
                        <div className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 text-[#1A1207] rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <Eye className="w-4 h-4 text-[#B8862A]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white text-left">
                      <p className="text-[11px] font-medium text-stone-700 font-sans leading-relaxed line-clamp-2 group-hover:text-[#B8862A] transition-colors">
                        {language === 'bn' ? img.captionBn : img.captionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Contact / Application Box */}
            <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F1ECE4] border border-[#B8862A]/15 text-[#1A1207] rounded-3xl p-6 md:p-10 relative overflow-hidden text-center space-y-4">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-5">
                <BookOpen className="w-64 h-64 text-[#B8862A]" />
              </div>
              <div className="relative z-10 space-y-3 max-w-xl mx-auto">
                <h3 className="font-serif text-xl md:text-2xl font-extrabold text-[#8C6212]">
                  {language === 'bn' ? 'আপনার শিক্ষা প্রতিষ্ঠানে এই কর্মসূচি যুক্ত করতে চান?' : 'Want to Register Your School?'}
                </h3>
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-sans font-light">
                  {language === 'bn'
                    ? 'সরকারি ও বেসরকারি মাধ্যমিক স্তরের বিদ্যালয় ও মাদ্রাসায় পাঠাভ্যাস কর্মসূচি চালুর নিয়মাবলি এবং আবেদন ফরমের জন্য সরাসরি আমাদের ঢাকাস্থ কার্যালয়ে অথবা মেইলে যোগাযোগ করুন।'
                    : 'To register your secondary educational institution or madrasa with the program, download our guideline checklist or get in touch with our representative.'}
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center justify-center space-x-2 bg-[#B8862A] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#9A6D1F] transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Office'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : page.id === 'aalor-ishkool' ? (
          <AalorIshkoolPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : page.id === 'nationwide-excellence' ? (
          <NationwideExcellencePage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : page.id === 'book-fair' ? (
          <BookFairPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : page.id === 'mobile-library' ? (
          <MobileLibraryPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : (page.id === 'facilities' || page.id === 'auditorium') ? (
          <AuditoriumPage page={page} language={language} onNavigate={onNavigate} />
        ) : page.id === 'building' ? (
          <BuildingPage page={page} language={language} onNavigate={onNavigate} />
        ) : page.id === 'cafe' ? (
          <CafePage page={page} language={language} onNavigate={onNavigate} />
        ) : page.id === 'bookshop' ? (
          <BookShopPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : (page.id === 'primary-teacher' || page.id === 'primary_teacher') ? (
          <PrimaryTeacherPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : (page.id === 'bangalir_chinta' || page.id === 'bangalir-chinta') ? (
          <BangalirChintaPage
            page={page}
            language={language}
            onNavigate={onNavigate}
            setActivePhoto={setActivePhoto}
            setActivePhotoIndex={setActivePhotoIndex}
            setActiveAlbumPhotos={setActiveAlbumPhotos}
          />
        ) : (
          <div className="space-y-6 w-full">
            {page.id !== 'press' && page.id !== 'notice' && page.id !== 'blog' && page.id !== 'central-library' && page.id !== 'ataglance' && page.id !== 'auditorium' && page.id !== 'facilities' && page.id !== 'building' && page.id !== 'cafe' && page.id !== 'bookshop' && Array.isArray(page.sections) && page.sections.map((sec, sIdx) => {
              // If section contains zero paragraphs, let's skip or show a notice
              if ((!sec.content || !Array.isArray(sec.content) || sec.content.length === 0) && !sec.title) return null;
              
              if (page.id === 'primary-teacher') {
                const galleryImages = [
                  {
                    url: "/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg",
                    captionBn: "শিক্ষকদের নিয়ে আয়োজিত বইপড়া সেমিনার",
                    captionEn: "Teachers Book Reading Seminar"
                  },
                  {
                    url: "/assets/IMGS/716885790_1415634970587980_7564637071825495839_n.jpg",
                    captionBn: "বই বিতরণ ও আলোচনা সভা",
                    captionEn: "Book Distribution & Discussion Session"
                  },
                  {
                    url: "/assets/IMGS/699105967_1396309219187222_3554275610071392150_n.jpg",
                    captionBn: "প্রশিক্ষণার্থীদের স্বতঃস্ফূর্ত অংশগ্রহণ",
                    captionEn: "Enthusiastic Participation of Trainees"
                  }
                ];

                return (
                  <div key={sIdx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left side: content */}
                    <article className="lg:col-span-8 space-y-4 bg-white p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-sm shadow-[#3D2B14]/5">
                      {sec.title && sec.title !== page.title_bn && (
                        <h2 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center space-x-2">
                          <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                          <span>{sec.title}</span>
                        </h2>
                      )}
                      
                      <div className="space-y-4">
                        {Array.isArray(sec.content) && sec.content.map((pText, pIdx) => (
                          <p 
                            key={pIdx} 
                            className="text-stone-800 leading-relaxed text-sm md:text-base font-sans drop-shadow-none"
                            style={{ textIndent: pIdx > 0 ? '1.5rem' : '0' }}
                          >
                            {pText}
                          </p>
                        ))}
                      </div>
                    </article>

                    {/* Right side: 3 mini galleries */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DDD0]/80 shadow-xs">
                        <h3 className="font-serif font-bold text-sm text-[#1A1207] border-b border-[#B8862A]/20 pb-2 mb-3 flex items-center space-x-2">
                          <span className="w-1 h-4 bg-[#B8862A] rounded-full inline-block" />
                          <span>{language === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery'}</span>
                        </h3>
                        <div className="space-y-3.5">
                          {galleryImages.map((img, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setActivePhoto(img.url);
                                setActivePhotoIndex(idx);
                                setActiveAlbumPhotos(galleryImages.map(gi => gi.url));
                              }}
                              className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-[#E8DDD0] hover:border-[#B8862A] hover:shadow-md transition-all duration-300"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                                <img 
                                  src={img.url} 
                                  alt={language === 'bn' ? img.captionBn : img.captionEn} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors duration-300">
                                  <div className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 text-[#1A1207] rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <Eye className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5 bg-white">
                                <p className="text-[11px] font-medium text-stone-700 font-sans leading-relaxed text-left group-hover:text-[#B8862A] transition-colors line-clamp-2">
                                  {language === 'bn' ? img.captionBn : img.captionEn}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <article key={sIdx} className="space-y-4 bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-sm shadow-[#3D2B14]/5">
                  {sec.title && sec.title !== page.title_bn && (
                    <h2 className="font-serif text-lg md:text-xl font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-6 bg-[#B8862A] rounded-full inline-block" />
                      <span>{sec.title}</span>
                    </h2>
                  )}
                  
                  <div className="space-y-4">
                    {Array.isArray(sec.content) && sec.content.map((pText, pIdx) => (
                      <p 
                        key={pIdx} 
                        className="text-stone-800 leading-relaxed text-sm md:text-base font-sans drop-shadow-none"
                        style={{ textIndent: pIdx > 0 ? '1.5rem' : '0' }}
                      >
                        {pText}
                      </p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )
      }

      {/* Special layouts or CTA sections for specific page IDs to enrich user engagement */}
      {page.id === 'contact' && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 max-w-4xl">
          {/* Detailed contact Info Card */}
          <div className="space-y-4 bg-[#1A1207] text-[#FAF7F2] rounded-2xl p-6 shadow-md border border-[#B8862A]/20 relative bg-grain">
            <h3 className="font-serif font-bold text-lg text-[#F0CC7A]">
              {language === 'bn' ? 'অফিসিয়াল যোগাযোগ কেন্দ্র' : 'HQ Contact Center'}
            </h3>
            <p className="text-xs text-[#FAF7F2]/75">
              {language === 'bn' ? 'কোনো জিজ্ঞাসা বা মতামতের জন্য সরাসরি আমাদের বাংলামোটর সেন্টারে যোগাযোগ করুন অথবা নিচের ফর্মটি পূরণ করুন।' : 'Contact our primary administration team for queries regarding book shops, libraries, and publications.'}
            </p>
            
            <div className="space-y-4 pt-2 text-left">
              <div className="flex items-start space-x-3 text-xs md:text-sm">
                <MapPin className="h-5 w-5 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0CC7A]">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</h4>
                  <p className="text-[#FAF7F2]/90">
                    {language === 'bn' 
                      ? (contactBlock?.address_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।')
                      : (contactBlock?.address_en || 'Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.')
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm">
                <PhoneCall className="h-5 w-5 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0CC7A]">{language === 'bn' ? 'টেলিফোন ও ফোন নম্বর:' : 'Telephone Numbers:'}</h4>
                  <p className="text-[#FAF7F2]/90">{contactBlock?.phones || '+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs md:text-sm">
                <Mail className="h-5 w-5 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F0CC7A]">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</h4>
                  <p className="text-[#FAF7F2]/90">{contactBlock?.emails || 'bskbd@live.com, info@bskbd.org'}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#B8862A]/20 pt-4 flex items-center space-x-2 text-[10px] text-[#F0CC7A] text-left">
              <span className="w-1.5 h-1.5 bg-[#B8862A] rounded-full animate-ping" />
              <span>
                {language === 'bn' 
                  ? (contactBlock?.hours_bn || 'খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)') 
                  : (contactBlock?.hours_en || 'Hours: 9:00 AM - 5:00 PM (Closed Fridays)')
                }
              </span>
            </div>
          </div>

          {/* Electronic Inquiry Feedback Form */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#1A1207] mb-3">
              {language === 'bn' ? 'ইলেকট্রনিক বার্তা ও বুকিং ফর্ম' : 'Electronic Feedback & Inquiry Form'}
            </h3>
            
            {formSubmitted ? (
              <div className="bg-[#2E5942]/10 border border-[#2E5942]/20 text-[#2E5942] p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#2E5942]" />
                  <span className="font-bold">{language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}</span>
                </div>
                <p className="text-xs text-stone-700">
                  {language === 'bn' ? 'আপনার জিজ্ঞাসা ও তথ্য সফলভাবে লাইভ ফায়ারবেস ডেটাবেজে সংরক্ষণ করা হয়েছে! আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।' : 'Thank you! Your information has been securely logged on our Live Firebase Database. We will review and reply shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {errorText && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium">
                    {errorText}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    {language === 'bn' ? 'জিজ্ঞাসার বিষয়/ক্যাটাগরি' : 'Inquiry Topic / Category'}
                  </label>
                  <select
                    value={formData.type}
                    disabled={isSubmitting}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-[#E8DDD0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] disabled:opacity-60"
                  >
                    <option value="contact">{language === 'bn' ? 'সাধারণ যোগাযোগ ও তথ্য (General Inquiry)' : 'General Inquiry & Info'}</option>
                    <option value="membership">{language === 'bn' ? 'লাইব্রেরি সদস্যপদ সংক্রান্ত (Library Membership Inquiry)' : 'Library Membership Request'}</option>
                    <option value="auditorium">{language === 'bn' ? 'মিলনায়তন/অডিটোরিয়াম বুকিং (Auditorium Rental)' : 'Auditorium Booking & Rent'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8DDD0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] disabled:opacity-60"
                    placeholder={language === 'bn' ? 'নাম লিখুন...' : 'e.g., Anisur Rahman'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    {language === 'bn' ? 'আপনার ইমেইল' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8DDD0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] disabled:opacity-60"
                    placeholder={language === 'bn' ? 'ইমেইল লিখুন...' : 'e.g., anis@domain.com'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    {language === 'bn' ? 'বার্তার বিষয়বস্তু' : 'Message Contents'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8DDD0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] disabled:opacity-60"
                    placeholder={language === 'bn' ? 'আপনার বক্তব্য বিস্তারিত লিখুন...' : 'Type your message...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-[#B8862A] text-stone-950 font-extrabold text-xs rounded-lg hover:bg-[#D4A84B] transition shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>{language === 'bn' ? 'বার্তা পাঠান (Live Submit)' : 'Submit to database'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Custom Cards / Locations / Branches Section */}
        {contactBlock?.cards && Array.isArray(contactBlock.cards) && contactBlock.cards.length > 0 && (
          <div className="pt-8 border-t border-[#B8862A]/20 w-full text-left space-y-4">
            <h3 className="font-serif font-extrabold text-lg text-[#1A1207] flex items-center space-x-2">
              <span className="w-1.5 h-5 bg-[#B8862A] inline-block" />
              <span>
                {language === 'bn' ? 'আমাদের অন্যান্য শাখা ও তথ্য কেন্দ্র' : 'Our Branches & Information Centers'}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactBlock.cards.map((card: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white border border-[#E8DDD0] hover:border-[#B8862A]/50 hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col group"
                >
                  {/* Card image or default icon */}
                  {card.imgUrl ? (
                    <div className="h-44 w-full overflow-hidden relative bg-stone-100">
                      <img 
                        src={card.imgUrl} 
                        alt={language === 'bn' ? card.title_bn : card.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-[#FAF7F2] border-b border-[#E8DDD0] flex items-center justify-center text-[#B8862A]">
                      <div className="text-4xl">{card.icon || '📍'}</div>
                    </div>
                  )}
                  
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="font-serif font-bold text-stone-900 text-sm md:text-base">
                        {language === 'bn' ? card.title_bn : card.title_en}
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-sans">
                        {language === 'bn' ? card.desc_bn : card.desc_en}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Map Section */}
        <GoogleMapSection language={language} />
        </div>
      )}


      {page.id === 'recruitment' && (
        <div className="pt-6 space-y-10 text-left font-sans text-stone-800">
          {/* Open Circulars Board */}
          <div className="space-y-6">
            <div className="border-b border-[#E8DDD0] pb-3 flex justify-between items-center">
              <h4 className="font-serif font-bold text-lg md:text-xl text-[#1A1207] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#B8862A]" />
                <span>{language === 'bn' ? 'চলমান নিয়োগ বিজ্ঞপ্তি সমূহ' : 'Open Vacancies'}</span>
              </h4>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-[#6B5135] font-bold">
                  {dbCirculars.filter(c => c.status !== 'expired').length} {language === 'bn' ? 'টি চলমান পদ' : 'active positions'}
                </span>
                
                {/* Grid/List View Toggle */}
                <div className="flex items-center bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg p-0.5" id="recruitment-view-toggle">
                  <button
                    type="button"
                    onClick={() => setRecruitmentViewMode('grid')}
                    className={`p-1 rounded-md transition cursor-pointer ${recruitmentViewMode === 'grid' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    title={language === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecruitmentViewMode('list')}
                    className={`p-1 rounded-md transition cursor-pointer ${recruitmentViewMode === 'list' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    title={language === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {dbCirculars.length === 0 ? (
              <div className="bg-[#FAF7F2]/50 border border-stone-200 rounded-2xl p-12 text-center text-stone-500 max-w-2xl mx-auto space-y-4">
                <p className="text-sm">
                  {language === 'bn' 
                    ? 'এই মুহূর্তে কোনো নতুন নিয়োগ বিজ্ঞপ্তি চলমান নেই। তবে আপনি সবসময় আপনার জীবনবৃত্তান্ত (CV) আমাদের সাধারণ ডাটাবেজের জন্য পাঠাতে পারেন।' 
                    : 'There are no active job circulars right now. However, you can always send an unsolicited resume to our talent database.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {language === 'bn' ? 'যোগাযোগ পেজে যান' : 'Go to Contact Page'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={recruitmentViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                {dbCirculars.map((circ) => {
                  const isExpired = circ.status === 'expired';
                  return (
                    <div 
                      key={circ.id} 
                      className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition duration-200 shadow-xs hover:shadow-md relative overflow-hidden ${
                        isExpired 
                          ? 'border-stone-200 opacity-75' 
                          : 'border-[#E8DDD0] hover:border-[#B8862A]/60'
                      } ${recruitmentViewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}
                    >
                      <div className={`space-y-3 text-left ${recruitmentViewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                            isExpired 
                              ? 'bg-stone-100 text-stone-400 border' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isExpired 
                              ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Closed') 
                              : (language === 'bn' ? 'চলমান আবেদন' : 'Open')}
                          </span>
                          {circ.dept_bn && (
                            <span className="bg-stone-50 text-stone-600 border border-stone-100 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                              💼 {language === 'bn' ? circ.dept_bn : circ.dept_en}
                            </span>
                          )}
                        </div>

                        <h5 className="font-serif font-extrabold text-base md:text-lg text-[#1A1207] leading-tight">
                          {language === 'bn' ? circ.position_bn : circ.position_en}
                        </h5>

                        <div className={recruitmentViewMode === 'list' ? "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-stone-500 font-sans" : "space-y-2"}>
                          <p className="leading-normal">
                            <span className="font-bold text-stone-700">{language === 'bn' ? 'বিজ্ঞপ্তি: ' : 'Notice: '}</span>
                            {language === 'bn' ? circ.title_bn : circ.title_en}
                          </p>

                          {circ.deadline_bn && (
                            <div className="flex items-center gap-1.5 text-xs text-[#8B3A1E] font-medium font-sans">
                              <span>📅</span>
                              <span>
                                <span className="font-bold">{language === 'bn' ? 'শেষ তারিখ: ' : 'Deadline: '}</span>
                                {language === 'bn' ? circ.deadline_bn : circ.deadline_en}
                              </span>
                            </div>
                          )}
                        </div>

                        {circ.desc_bn && recruitmentViewMode !== 'list' && (
                          <div className="bg-stone-50/70 p-3 rounded-xl border border-stone-100/80 max-h-[140px] overflow-y-auto mt-2 text-stone-600 font-sans leading-relaxed text-xs">
                            <p className="whitespace-pre-wrap">
                              {language === 'bn' ? circ.desc_bn : circ.desc_en}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-col sm:flex-row gap-2.5 pt-4 mt-4 border-t border-stone-100 select-none ${
                        recruitmentViewMode === 'list' 
                          ? 'sm:flex-row sm:border-t-0 sm:pt-0 sm:mt-0 sm:w-auto sm:shrink-0 sm:justify-end' 
                          : 'w-full'
                      }`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveModalCircular(circ);
                          }}
                          className={`px-4 py-2 bg-[#FAF7F2] hover:bg-[#E8DDD0] text-[#6B5135] border border-[#E8DDD0] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            recruitmentViewMode === 'list' ? 'sm:flex-none sm:px-4' : 'flex-1'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{language === 'bn' ? 'বিজ্ঞপ্তি বিস্তারিত' : 'View Circular Details'}</span>
                        </button>

                        {circ.fileUrl && (
                          <a
                            href={circ.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              recruitmentViewMode === 'list' ? 'sm:flex-none sm:px-5' : 'flex-1'
                            }`}
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>{language === 'bn' ? 'সার্কুলার ফাইল' : 'View Circular'}</span>
                          </a>
                        )}
                        {circ.applyFileUrl && (
                          <a
                            href={circ.applyFileUrl}
                            download={circ.applyFileName || 'apply_form'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2 bg-amber-50 hover:bg-amber-100 text-[#B8862A] border border-amber-200/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              recruitmentViewMode === 'list' ? 'sm:flex-none sm:px-5' : 'flex-1'
                            }`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{language === 'bn' ? 'আবেদন ফরম' : 'Download Form'}</span>
                          </a>
                        )}
                        {!isExpired && (
                          <>
                            {circ.applyUrl && (
                              <a
                                href={circ.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 text-center cursor-pointer ${
                                  recruitmentViewMode === 'list' ? 'sm:flex-none sm:px-4' : 'flex-1'
                                }`}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>{language === 'bn' ? 'অনলাইন পোর্টাল লিংক' : 'Online Portal'}</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveApplyCircular(circ);
                              }}
                              className={`px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer ${
                                recruitmentViewMode === 'list' ? 'sm:flex-none sm:px-6' : 'flex-1'
                              }`}
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              <span>{language === 'bn' ? 'আবেদন করুন' : 'Apply Now'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Official Job Application Modal */}
          <AnimatePresence>
            {activeApplyCircular && (
              <OfficialJobApplicationModal
                circular={activeApplyCircular}
                language={language}
                onClose={() => setActiveApplyCircular(null)}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Press & Media Center layout */}
      {page.id === 'press' && (
        <div id="press-media-center" className="space-y-12 text-left font-sans pt-4">
          
          {/* Header Description / Banner */}
          <div className="mb-6 bg-[#1A1207] text-[#FAF7F2] border border-[#B8862A]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg">
            {pressSettingsBlock?.banner_image && (
              <>
                <img 
                  src={pressSettingsBlock.banner_image} 
                  alt="Press Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1207]/90 via-[#1A1207]/80 to-[#1A1207]/90 pointer-events-none" />
              </>
            )}
            <div className="space-y-3 max-w-2xl relative z-10">
              <span className="inline-block bg-[#B8862A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                {language === 'bn' 
                  ? (pressSettingsBlock?.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র প্রেস ও মিডিয়া') 
                  : (pressSettingsBlock?.badge_en || 'BSK Press & Media Center')}
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {language === 'bn' 
                  ? (pressSettingsBlock?.title_bn || 'প্রেস ও মিডিয়া সেন্টার') 
                  : (pressSettingsBlock?.title_en || 'Press & Media Center')}
              </h3>
              <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-sans">
                {language === 'bn' 
                  ? (pressSettingsBlock?.desc_bn || 'বিশ্বসাহিত্য কেন্দ্রের সর্বশেষ প্রেস রিলিজ, জাতীয় ও আন্তর্জাতিক মিডিয়া কভারেজ, অফিসিয়াল ডাউনলোড এবং গ্যালারি।') 
                  : (pressSettingsBlock?.desc_en || "All official press releases, nationwide media features, photo archives, and brand assets of Bishwo Shahitto Kendro.")}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 relative z-10">
              <a 
                href={pressSettingsBlock?.btn1_url || "#media-downloads"} 
                className="px-4 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4 text-amber-300" />
                <span>
                  {language === 'bn' 
                    ? (pressSettingsBlock?.btn1_text_bn || 'মিডিয়া কিট ডাউনলোড') 
                    : (pressSettingsBlock?.btn1_text_en || 'Download Media Kit')}
                </span>
              </a>
              <a 
                href={pressSettingsBlock?.btn2_url || "#media-contact"} 
                className="px-4 py-2.5 bg-[#FAF7F2] border border-[#B8862A]/40 text-[#6B5135] hover:bg-[#B8862A]/10 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                {language === 'bn' 
                  ? (pressSettingsBlock?.btn2_text_bn || 'যোগাযোগ করুন') 
                  : (pressSettingsBlock?.btn2_text_en || 'Media Contact')}
              </a>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
              {(['All', 'Press Release', 'News', 'Events', 'Awards', 'Publications'] as const).map((cat) => {
                const labelBn = cat === 'All' ? 'সব কন্টেন্ট' : cat === 'Press Release' ? 'প্রেস রিলিজ' : cat === 'News' ? 'মিডিয়া সংবাদ' : cat === 'Events' ? 'ইভেন্টস' : cat === 'Awards' ? 'পুরস্কার' : 'প্রকাশনা';
                const labelEn = cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedPressCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPressCategory === cat
                        ? 'bg-[#B8862A] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                    }`}
                  >
                    {language === 'bn' ? labelBn : labelEn}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchPressQuery}
                onChange={(e) => setSearchPressQuery(e.target.value)}
                placeholder={language === 'bn' ? 'অনুসন্ধান করুন...' : 'Search Press & Media...'}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#B8862A] focus:bg-white transition"
              />
              {searchPressQuery && (
                <button 
                  onClick={() => setSearchPressQuery('')} 
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout containing Releases and Media News */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {(() => {
              const fallbackPress = [
                {
                  id: "press-1",
                  title_bn: "দেশব্যাপী বইপড়া কর্মসূচির নতুন আবর্তন উদ্বোধন করলেন অধ্যাপক সায়ীদ",
                  title_en: "Professor Sayeed Inaugurates New Cycle of Nationwide Book Reading Program",
                  summary: "সারাদেশে ৬৪টি জেলায় বিশ্বসাহিত্য কেন্দ্রের বইপড়া কর্মসূচির নতুন আবর্তনের শুভ সূচনা করা হয়েছে। এ বছর প্রায় ৪০ লক্ষ শিক্ষার্থী এই মহৎ কর্মসূচির অংশ হবে।",
                  content: "বিশ্বসাহিত্য কেন্দ্রের প্রতিষ্ঠাতা সভাপতি অধ্যাপক আবদুল্লাহ আবু সায়ীদ আজ কেন্দ্র মিলנותনে আয়োজিত এক বর্ণাঢ্য সংবাদ সম্মেলনে দেশব্যাপী বইপড়া কর্মসূচির নতুন আবর্তনের শুভ উদ্বোধন ঘোষণা করেন। এবারের আবর্তনে দেশের ৬৪টি জেলার ৪ হাজার শিক্ষাপ্রতিষ্ঠানের প্রায় ৪০ লক্ষ শিক্ষার্থী যুক্ত হচ্ছে। অধ্যাপক সায়ীদ বলেন, 'জ্ঞানের আলো ছড়িয়ে দেয়ার মাধ্যমেই আমাদের ভবিষ্যৎ প্রজন্ম আলোকিত মানুষে পরিণত হবে।' এই কর্মসূচির মাধ্যমে কেন্দ্র থেকে শিক্ষার্থীদের মাঝে বিনামূল্যে বই বিতরণ করা হচ্ছে।",
                  category: "Press Release",
                  publishedDate: "2026-06-28",
                  author: "মিডিয়া সেল, বিএসকে",
                  status: "published",
                  coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
                  pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                },
                {
                  id: "press-2",
                  title_bn: "প্রথম আলো বিশেষ প্রতিবেদন: ভ্রাম্যমাণ লাইব্রেরির ২৫ বছর পূর্তি ও নতুন দিগন্ত",
                  title_en: "Prothom Alo Special Feature: 25 Years of Mobile Libraries and Future Horizons",
                  summary: "বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরি কার্যক্রমের গৌরবময় ২৫ বছর পূর্তি উপলক্ষে প্রথম আলো পত্রিকায় প্রকাশিত বিশেষ সচিত্র কভারেজ ও সম্পাদকীয় প্রতিবেদন।",
                  content: "বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম ২৫ বছর পূর্ণ করল। প্রথম আলোর বিশেষ প্রতিবেদনে তুলে ধরা হয়েছে কীভাবে এই লাইব্রেরি দেশের প্রত্যন্ত অঞ্চলের মানুষের দ্বারে দ্বারে জ্ঞানের আলো পৌঁছে দিয়েছে। বর্তমানে কেন্দ্রের প্রায় ১০০টি ভ্রাম্যমাণ বাস সক্রিয়ভাবে ৩ লক্ষাধিক পাঠককে নিয়মিত সেবা প্রদান করছে।",
                  category: "News",
                  publishedDate: "2026-06-24",
                  author: "প্রথম আলো প্রতিবেদক",
                  status: "published",
                  mediaSource: "Prothom Alo",
                  newsUrl: "https://www.prothomalo.com",
                  coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600"
                },
                {
                  id: "press-3",
                  title_bn: "The Daily Star: BSK brings book-reading revolution in rural schools",
                  title_en: "The Daily Star: BSK Brings Book-Reading Revolution in Rural Schools",
                  summary: "A feature in The Daily Star documenting BSK's immense social impact in cultivating healthy reading habits among underprivileged rural youth.",
                  content: "An extensive analytical piece published in The Daily Star illustrates the profound and far-reaching impacts of Bishwo Shahitto Kendro's reading initiatives in promoting critical thinking and intellectual growth among underprivileged rural students in primary and secondary schools across Bangladesh.",
                  category: "News",
                  publishedDate: "2026-06-19",
                  author: "The Daily Star Correspondent",
                  status: "published",
                  mediaSource: "The Daily Star",
                  newsUrl: "https://www.thedailystar.net",
                  coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
                },
                {
                  id: "press-4",
                  title_bn: "দেশব্যাপী ৩১ লক্ষ বই বিতরণ উৎসব সফলভাবে সম্পন্ন",
                  title_en: "BSK Completes Distribution of 3.1 Million Selective Books",
                  summary: "সারাদেশের ৬৪ জেলায় নির্বাচিত সেরা কিশোর ক্লাসিক ও বিশ্ব সাহিত্যের বই কিশোর-কিশোরীদের মাঝে সাফল্যের সাথে বিতরণ সম্পন্ন হয়েছে।",
                  content: "বিশ্বসাহিত্য কেন্দ্রের অন্যতম বড় সাফল্য হলো দেশের প্রত্যন্ত অঞ্চলের কিশোর-কিশোরীদের হাতে বিশ্বমানের সাহিত্যের বই পৌঁছে দেয়া। এবারের বার্ষিক কার্যক্রমে ৩১ লক্ষাধিক বই সফলভাবে বিতরণ করা হয়েছে।",
                  category: "Events",
                  publishedDate: "2026-06-15",
                  author: "প্রচার বিভাগ, বিএসকে",
                  status: "published",
                  coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
                },
                {
                  id: "press-5",
                  title_bn: "বিএসকে বার্ষিক পাঠক পুরস্কার উৎসব ও সেরা পাঠক সম্মাননা",
                  title_en: "BSK Hosts Annual Reader Award Ceremony for 10,000 Brilliant Minds",
                  summary: "ঢাকা মহানগরের সেরা ১০,০০০ পাঠক শিক্ষার্থীকে মেধা বৃত্তি ও বিশ্বসাহিত্য কেন্দ্রের আজীবন পাঠক সম্মাননা প্রদান অনুষ্ঠান সম্পন্ন হয়েছে।",
                  content: "বিশ্বসাহিত্য কেন্দ্রের উদ্যোগে আয়োজিত পাঠক মূল্যায়ন পরীক্ষার ফলশ্রুতিতে ঢাকা অঞ্চলের শ্রেষ্ঠ পাঠকদের পুরস্বৃত করা হয়েছে। প্রধান অতিথি হিসেবে উপস্থিত থেকে পুরস্কার তুলে দেন বরেণ্য লেখক ও কবিগণ।",
                  category: "Awards",
                  publishedDate: "2026-06-08",
                  author: "পুরস্কার সেল, বিএসকে",
                  status: "published",
                  coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600"
                }
              ];

              const mergedPress = [...dbPress];
              fallbackPress.forEach(fb => {
                if (!mergedPress.some(p => p.id === fb.id)) {
                  mergedPress.push(fb);
                }
              });

              const filteredPress = mergedPress.filter(item => {
                if (item.status !== 'published') return false;
                if (selectedPressCategory !== 'All' && item.category !== selectedPressCategory) return false;
                if (searchPressQuery.trim() !== '') {
                  const q = searchPressQuery.toLowerCase();
                  const matchBn = item.title_bn?.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q) || item.content?.toLowerCase().includes(q);
                  const matchEn = item.title_en?.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q) || item.content?.toLowerCase().includes(q);
                  return matchBn || matchEn;
                }
                return true;
              });

              const getMediaLogo = (source: string) => {
                switch (source) {
                  case 'Prothom Alo':
                    return <div className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black tracking-tighter border border-red-200 rounded">প্রথম আলো</div>;
                  case 'The Daily Star':
                    return <div className="px-2 py-0.5 bg-blue-950 text-white text-[9px] font-serif font-black tracking-tight rounded">The Daily Star</div>;
                  case 'Kaler Kantho':
                    return <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded border border-indigo-200">কালের কণ্ঠ</div>;
                  case 'Somoy TV':
                    return <div className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-extrabold rounded">SOMOY TV</div>;
                  case 'Channel i':
                    return <div className="px-2 py-0.5 bg-green-700 text-white text-[9px] font-black rounded italic">channel i</div>;
                  default:
                    return <div className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] font-bold rounded border border-stone-200">{source}</div>;
                }
              };

              const staticAlbums = [
                {
                  id: "distribution",
                  name_bn: "বই বিতরণ",
                  name_en: "Book Distribution",
                  cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600",
                  photos: [
                    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800"
                  ]
                },
                {
                  id: "awards",
                  name_bn: "পুরস্কার অনুষ্ঠান",
                  name_en: "Award Ceremony",
                  cover: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
                  photos: [
                    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                  ]
                },
                {
                  id: "seminar",
                  name_bn: "সেমিনার",
                  name_en: "Seminars",
                  cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
                  photos: [
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800"
                  ]
                },
                {
                  id: "circle",
                  name_bn: "পাঠচক্র",
                  name_en: "Study Circles",
                  cover: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
                  photos: [
                    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"
                  ]
                },
                {
                  id: "press_conf",
                  name_bn: "প্রেস কনফারেন্স",
                  name_en: "Press Conferences",
                  cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
                  photos: [
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800"
                  ]
                }
              ];

              const photoAlbums = [...dbAlbums];
              staticAlbums.forEach(fb => {
                if (!photoAlbums.some(a => a.id === fb.id)) {
                  photoAlbums.push(fb);
                }
              });

              return (
                <>
                  {/* Column 1 & 2: Main list of releases / publications */}
                  <div className="xl:col-span-2 space-y-6">
                    <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2 border-b border-stone-100 pb-3">
                      <FileText className="h-5 w-5 text-[#B8862A]" />
                      <span>
                        {selectedPressCategory === 'All' 
                          ? (language === 'bn' ? (pressSettingsBlock?.sec1_title_bn || '১. সর্বশেষ সংবাদ ও প্রেস বিজ্ঞপ্তি') : (pressSettingsBlock?.sec1_title_en || '1. Latest News & Press Releases'))
                          : (language === 'bn' ? `সর্বশেষ: ${selectedPressCategory}` : `Latest: ${selectedPressCategory}`)}
                      </span>
                    </h4>

                    {filteredPress.length === 0 ? (
                      <div className="p-12 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl w-full">
                        <p className="text-stone-400 text-sm italic font-sans">
                          {language === 'bn' ? 'কোনো প্রেস বিজ্ঞপ্তি বা সংবাদ খুঁজে পাওয়া যায়নি।' : 'No matching press items or articles found.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {filteredPress.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                          >
                            {/* Image Banner */}
                            <div className="h-44 bg-stone-100 relative overflow-hidden shrink-0">
                              <img 
                                src={item.coverImage || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600"} 
                                alt={language === 'bn' ? item.title_bn : item.title_en}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-3 left-3 bg-[#B8862A] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs select-none">
                                {item.category}
                              </span>
                              {item.mediaSource && (
                                <div className="absolute top-3 right-3 shadow-md">
                                  {getMediaLogo(item.mediaSource)}
                                </div>
                              )}
                            </div>

                            {/* Card Info */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5 mb-2">
                                  <span className="text-[10px] text-stone-600 font-mono font-bold flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-[#B8862A]" />
                                    {item.publishedDate || "2026-06-28"}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold flex items-center gap-1 bg-[#B8862A]/15 text-[#855D16] px-2 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                </div>
                                <h5 className="font-serif font-bold text-sm text-stone-900 hover:text-[#B8862A] transition line-clamp-2 leading-snug">
                                  {language === 'bn' ? item.title_bn : item.title_en}
                                </h5>
                                <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed font-sans font-medium">
                                  {item.summary || (language === 'bn' ? "বিশ্বসাহিত্য কেন্দ্রের গুরুত্বপূর্ণ বিবরণী।" : "Important media announcement regarding Bishwo Shahitto Kendro.")}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-stone-100 select-none">
                                <button
                                  onClick={() => setActivePressItem(item)}
                                  className="text-xs font-bold text-[#2E5942] hover:text-[#1E3B2C] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{language === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read More'}</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                                
                                {item.pdf && (
                                  <a
                                    id={`pdf-download-${item.id}`}
                                    href={item.pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-[#B8862A] rounded-lg transition"
                                    title={language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Media sidebar */}
                  <div className="xl:col-start-3 xl:row-start-1 space-y-6 w-full mt-8 xl:mt-0">
                    {/* News & Media Coverage List */}
                    <div className="space-y-4">
                      <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Award className="h-5 w-5 text-[#B8862A]" />
                        <span>
                          {language === 'bn' 
                            ? (pressSettingsBlock?.sec2_title_bn || '২. নিউজ ও মিডিয়া কভারেজ') 
                            : (pressSettingsBlock?.sec2_title_en || '2. News & Media Coverage')}
                        </span>
                      </h4>

                      <div className="space-y-4">
                        {mergedPress.filter(item => item.category === 'News').slice(0, 5).map((news) => (
                          <div 
                            key={news.id} 
                            className="bg-[#FAF7F2]/60 p-4 border border-[#B8862A]/10 rounded-2xl hover:bg-[#FAF7F2] transition space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              {news.mediaSource && getMediaLogo(news.mediaSource)}
                              <span className="text-[9px] font-mono text-stone-400">{news.publishedDate}</span>
                            </div>
                            <h5 className="font-serif font-bold text-xs text-[#1A1207] hover:text-[#B8862A] transition line-clamp-2">
                              {language === 'bn' ? news.title_bn : news.title_en}
                            </h5>
                            <div className="flex justify-between items-center select-none pt-1">
                              <button
                                onClick={() => setActivePressItem(news)}
                                className="text-[10px] font-bold text-stone-500 hover:text-[#B8862A] cursor-pointer"
                              >
                                {language === 'bn' ? 'মূল বিষয়' : 'Briefing'}
                              </button>
                              {news.newsUrl && (
                                <a 
                                  href={news.newsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-white hover:bg-[#B8862A]/5 border border-stone-200 rounded-lg text-[10px] font-bold text-[#2E5942] flex items-center gap-1 transition"
                                >
                                  <span>{language === 'bn' ? 'ভিজিট নিউজ' : 'Visit News'}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Official Downloads */}
                    <div id="media-downloads" className="bg-[#2E5942] p-5 rounded-2xl text-white space-y-4 shadow-sm relative overflow-hidden">
                      <div className="absolute -right-12 -bottom-12 opacity-10 rotate-12">
                        <BookOpen className="h-40 w-40" />
                      </div>
                      
                      <div className="space-y-1 relative z-10">
                        <h4 className="font-serif font-bold text-base">
                          {language === 'bn' 
                            ? (pressSettingsBlock?.sec4_title_bn || '৪. ডাউনলোড এবং রিসোর্স') 
                            : (pressSettingsBlock?.sec4_title_en || '4. Official Media Downloads')}
                        </h4>
                        <p className="text-[11px] text-white/75 leading-relaxed font-sans">
                          {language === 'bn' 
                            ? (pressSettingsBlock?.sec4_subtitle_bn || 'সংবাদ ও কভারেজের জন্য বিশ্বসাহিত্য কেন্দ্রের ব্র্যান্ড এসেট এবং মিডিয়া গাইড বুক ডাউনলোড করুন।') 
                            : (pressSettingsBlock?.sec4_subtitle_en || "Download high resolution brand assets, SVG logo elements, and official profile booklet guides.")}
                        </p>
                      </div>

                      <div className="space-y-2 relative z-10 pt-1">
                        {(() => {
                          const defaultDownloads = [
                            { id: 'dl-1', title_bn: 'BSK অফিশিয়াল লোগো (PNG)', title_en: 'BSK Official Logo (PNG)', fileType: 'PNG', fileSize: '1.2 MB', fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png' },
                            { id: 'dl-2', title_bn: 'BSK ভেক্টর লোগো (SVG)', title_en: 'BSK Logo Vector (SVG)', fileType: 'SVG', fileSize: '45 KB', fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png' },
                            { id: 'dl-3', title_bn: 'সাংগঠনিক পরিচিতি ও বিবরণী (PDF)', title_en: 'BSK Profile & Brochure (PDF)', fileType: 'PDF', fileSize: '4.5 MB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
                            { id: 'dl-4', title_bn: 'মিডিয়া কিট এবং রিসোর্স ফাইল (ZIP)', title_en: 'Media Kit Resources (ZIP Bundle)', fileType: 'ZIP', fileSize: '45.8 MB', fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png' }
                          ];
                          let rawItems = pressDownloadsBlock?.items;
                          if (typeof rawItems === 'string') {
                            try { rawItems = JSON.parse(rawItems); } catch (_) { rawItems = []; }
                          }
                          const activeDownloads = (Array.isArray(rawItems) && rawItems.length > 0)
                            ? rawItems
                            : defaultDownloads;

                          return activeDownloads.map((dl: any) => (
                            <a 
                              key={dl.id}
                              href={dl.fileUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              download={dl.title_en || 'download'}
                              className="w-full p-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-between text-xs transition cursor-pointer"
                            >
                              <span className="font-medium">{language === 'bn' ? dl.title_bn : dl.title_en}</span>
                              <span className="text-[9px] font-mono bg-white/15 px-1.5 py-0.5 rounded">{dl.fileType || 'FILE'} • {dl.fileSize || '1 MB'}</span>
                            </a>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Full Photo Album Gallery section */}
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 space-y-6 pt-6 w-full">
                    <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2 border-b border-stone-100 pb-3">
                      <ImageIcon className="h-5 w-5 text-[#B8862A]" />
                      <span>
                        {language === 'bn' 
                          ? (pressSettingsBlock?.sec3_title_bn || '৩. ফটো গ্যালারি ও প্রেস অ্যালবাম') 
                          : (pressSettingsBlock?.sec3_title_en || '3. Photo Gallery & Press Albums')}
                      </span>
                    </h4>

                    {/* Album Selector */}
                    <div className="flex flex-wrap gap-2 select-none">
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoAlbum('All')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                          selectedPhotoAlbum === 'All'
                            ? 'bg-[#2E5942] text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                        }`}
                      >
                        {language === 'bn' ? 'সব অ্যালবাম' : 'All Albums'}
                      </button>
                      {photoAlbums.map((album) => (
                        <button
                          type="button"
                          key={album.id}
                          onClick={() => setSelectedPhotoAlbum(album.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                            selectedPhotoAlbum === album.id
                              ? 'bg-[#2E5942] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                          }`}
                        >
                          {language === 'bn' ? (album.name_bn || album.title_bn || '') : (album.name_en || album.title_en || '')}
                        </button>
                      ))}
                    </div>

                    {/* Grid of Images */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                      {photoAlbums
                        .filter(album => selectedPhotoAlbum === 'All' || album.id === selectedPhotoAlbum)
                        .flatMap(album => {
                          let pList = album.photos || album.images || [];
                          if (typeof pList === 'string') {
                            try { pList = JSON.parse(pList); } catch (_) { pList = []; }
                          }
                          const safeList = Array.isArray(pList) ? pList : [];
                          return safeList.map(photo => ({ photo, album }));
                        })
                        .map((imgObj, idx, arr) => (
                          <div 
                            key={idx} 
                            className="h-36 sm:h-44 bg-stone-100 rounded-xl overflow-hidden relative group shadow-xs hover:shadow-md transition-all border border-stone-200/50"
                          >
                            <img 
                              src={imgObj.photo} 
                              alt="Press Gallery" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Hover Options Overlay - 2 Side Options */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 px-3">
                              {/* Left Option: View */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePhoto(imgObj.photo);
                                  setActivePhotoIndex(idx);
                                  setActiveAlbumPhotos(arr.map(a => a.photo));
                                }}
                                className="p-2 sm:p-3 bg-[#2E5942] hover:bg-[#234432] text-white rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 transform hover:scale-110 shadow-lg cursor-pointer w-16 h-16 sm:w-20 sm:h-20"
                                title={language === 'bn' ? 'দেখুন' : 'View'}
                              >
                                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                <span className="text-[9px] sm:text-[10px] font-bold">{language === 'bn' ? 'দেখুন' : 'View'}</span>
                              </button>

                              {/* Right Option: Download */}
                              <button
                                type="button"
                                onClick={(e) => handleDownloadPhoto(e, imgObj.photo)}
                                className="p-2 sm:p-3 bg-[#B8862A] hover:bg-[#966d21] text-white rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 transform hover:scale-110 shadow-lg cursor-pointer w-16 h-16 sm:w-20 sm:h-20"
                                title={language === 'bn' ? 'ডাউনলোড' : 'Download'}
                              >
                                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                <span className="text-[9px] sm:text-[10px] font-bold">{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                              </button>
                            </div>

                            {/* Tiny Album Label */}
                            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] text-white font-sans opacity-80 group-hover:opacity-0 transition-opacity">
                              {language === 'bn' ? (imgObj.album.name_bn || imgObj.album.title_bn || '') : (imgObj.album.name_en || imgObj.album.title_en || '')}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

            {/* Section 5: Professional Media Contact */}
            <div id="media-contact" className="bg-stone-100 border border-[#B8862A]/20 rounded-2xl p-6 md:p-8 space-y-6 w-full">
              <div className="border-b border-[#E8DDD0] pb-4">
                <h4 className="font-serif font-bold text-lg text-[#1A1207]">
                  {language === 'bn' 
                    ? (pressSettingsBlock?.sec5_title_bn || '৫. মিডিয়া ও প্রেস যোগাযোগ') 
                    : (pressSettingsBlock?.sec5_title_en || '5. Media & Public Relations Contact')}
                </h4>
                <p className="text-xs text-stone-500 mt-1 font-sans">
                  {language === 'bn' 
                    ? (pressSettingsBlock?.sec5_subtitle_bn || 'বিশ্বসাহিত্য কেন্দ্রের যেকোনো কার্যক্রম, সংবাদ বা সাক্ষাৎকার প্রচারের প্রয়োজনে আমাদের জনসংযোগ বিভাগের সাথে সরাসরি যোগাযোগ করুন।') 
                    : (pressSettingsBlock?.sec5_subtitle_en || "For press briefings, interview bookings, activity reporting, or queries regarding BSK operations, contact our media relation desks.")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Media Coordinator Business Card */}
                <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-48">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-[#B8862A]/5 rounded-bl-full" />
                  <div className="space-y-2">
                    <span className="text-[9px] bg-[#B8862A]/10 text-[#B8862A] font-extrabold uppercase px-2 py-0.5 rounded inline-block">
                      {language === 'bn' ? mediaContact.coordinator_title_bn : mediaContact.coordinator_title_en}
                    </span>
                    <h5 className="font-bold text-stone-800 text-sm md:text-base">
                      {language === 'bn' ? mediaContact.coordinator_name_bn : mediaContact.coordinator_name_en}
                    </h5>
                    <p className="text-xs text-stone-500 font-medium font-sans">
                      {language === 'bn' ? mediaContact.coordinator_role_bn : mediaContact.coordinator_role_en}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-xs text-stone-600 font-sans border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#B8862A]" />
                      <span>{mediaContact.coordinator_email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="h-3.5 w-3.5 text-[#B8862A]" />
                      <span>{mediaContact.coordinator_phone}</span>
                    </div>
                  </div>
                </div>

                {/* General Inquiries Details */}
                <div className="space-y-4 font-sans text-xs text-stone-600">
                  <div className="space-y-1">
                    <span className="font-bold text-stone-800">
                      {language === 'bn' ? mediaContact.office_label_bn : mediaContact.office_label_en}
                    </span>
                    <p>
                      {language === 'bn' ? mediaContact.office_value_bn : mediaContact.office_value_en}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-stone-800">
                      {language === 'bn' ? mediaContact.hours_label_bn : mediaContact.hours_label_en}
                    </span>
                    <p>
                      {language === 'bn' ? mediaContact.hours_value_bn : mediaContact.hours_value_en}
                    </p>
                  </div>
                  <div className="space-y-1 text-stone-400 text-[10px]">
                    <p>
                      {language === 'bn' ? mediaContact.note_bn : mediaContact.note_en}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* Press Item Modal Details Popup */}
          <AnimatePresence>
            {activePressItem && (
              <div 
                onClick={() => setActivePressItem(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto select-none cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col shadow-2xl max-h-[90vh] cursor-default"
                >
                  {/* Modal Header */}
                  <div className="bg-[#FAF7F2] p-5 border-b border-[#B8862A]/20 flex justify-between items-center shrink-0">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] bg-[#B8862A] text-white px-2 py-0.5 rounded font-bold uppercase inline-block">
                        {activePressItem.category}
                      </span>
                      <h4 className="font-serif font-bold text-stone-950 text-sm md:text-base line-clamp-1">
                        {language === 'bn' ? activePressItem.title_bn : activePressItem.title_en}
                      </h4>
                    </div>
                    <button
                      onClick={() => setActivePressItem(null)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition shrink-0 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Modal Body scrollable */}
                  <div className="p-6 overflow-y-auto text-left space-y-5 flex-1">
                    {/* Cover image */}
                    <div className="h-56 bg-stone-100 rounded-xl overflow-hidden shadow-xs relative">
                      <img 
                        src={activePressItem.coverImage || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800"} 
                        alt="Press Detail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 font-sans border-b border-stone-100 pb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-[#B8862A]" />
                        {activePressItem.publishedDate}
                      </span>
                      {activePressItem.author && (
                        <span>{language === 'bn' ? 'লেখক/উৎস:' : 'Source:'} <strong>{activePressItem.author}</strong></span>
                      )}
                    </div>

                    {/* Content text */}
                    <div className="text-stone-800 text-sm leading-relaxed font-sans space-y-4 whitespace-pre-wrap">
                      <p className="font-bold text-stone-900 leading-normal text-base bg-[#FAF7F2] p-4 border-l-4 border-[#B8862A] rounded-r-xl">
                        {language === 'bn' ? activePressItem.summary : activePressItem.summary}
                      </p>
                      <p>
                        {activePressItem.content || (language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের এই প্রেস রিলিজে কোনো বাড়তি তথ্য যোগ করা হয়নি।' : 'Detailed brief summary is available for this media release.')}
                      </p>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono text-stone-400">ID: {activePressItem.id}</span>
                    <div className="flex gap-2.5">
                      {activePressItem.newsUrl && (
                        <a 
                          href={activePressItem.newsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-[#2E5942] text-white hover:bg-[#1E3B2C] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{language === 'bn' ? 'নিউজ ভিজিট করুন' : 'Visit Article'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {activePressItem.pdf && (
                        <a 
                          href={activePressItem.pdf}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-stone-100 text-[#B8862A] hover:bg-stone-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>{language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                        </a>
                      )}
                      <button
                        onClick={() => setActivePressItem(null)}
                        className="px-5 py-2 bg-[#B8862A] text-white hover:bg-[#9A6D1E] rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
      {page.id === 'notice' && (
        <div id="recruitment-notices-board" className="space-y-8 text-left">
          <div className="-mt-4 mb-2">
            <p className="text-xs md:text-sm text-[#6B5135]">
              {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী চলমান সকল কার্যক্রম, সংবাদ ও ক্যারিয়ার বিজ্ঞপ্তি সমূহ।' : 'All countrywide library notices, publications news, and live updates.'}
            </p>
          </div>

          {/* Section 1: Today's Notice & Announcement (totto kandro notice bord) */}
          {page.sections && page.sections[0] && (
            <div className="bg-white border border-[#B8862A]/30 rounded-2xl p-6 shadow-sm">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2 border-b border-[#E8DDD0] pb-3 mb-4">
                <span className="w-2.5 h-2.5 bg-[#B8862A] rounded-none animate-pulse shrink-0 inline-block" />
                <span>{page.sections[0].title || (language === 'bn' ? 'আজকের নোটিশ ও ঘোষণা' : "Today's Notice & Announcements")}</span>
              </h4>
              <div className="space-y-3">
                {(Array.isArray(page.sections?.[0]?.content) ? page.sections[0].content : []).map((pText, pIdx) => (
                  <p key={pIdx} className="text-stone-800 leading-relaxed text-sm md:text-base font-sans">
                    {pText}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Central Notice Board */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#E8DDD0] flex items-center justify-between">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#8B3A1E] rounded-none shrink-0" />
                <span>{language === 'bn' ? 'কেন্দ্রীয় নোটিশ বোর্ড' : 'Central Notice Board'}</span>
              </h4>

              {/* Grid/List View Toggle */}
              <div className="flex items-center bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg p-0.5" id="notices-view-toggle">
                <button
                  type="button"
                  onClick={() => setNoticesViewMode('grid')}
                  className={`p-1 rounded-md transition cursor-pointer ${noticesViewMode === 'grid' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                  title={language === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNoticesViewMode('list')}
                  className={`p-1 rounded-md transition cursor-pointer ${noticesViewMode === 'list' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                  title={language === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {noticesViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notices.map((not, index) => (
                  <div 
                    key={'notice-p-' + index}
                    onClick={() => setActiveModalNotice({ ...not, type: 'notice' })}
                    className="p-5 bg-white border border-[#E8DDD0]/80 rounded-xl cursor-pointer hover:border-[#B8862A]/60 flex flex-col justify-between hover:-translate-y-0.5 duration-150 transition shadow-xs hover:shadow-md animate-fade-in"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {not.isUrgent && (
                          <span className="bg-[#8B3A1E] text-white px-2 py-0.5 rounded-none font-bold text-[9px] uppercase tracking-wider">
                            {language === 'bn' ? 'জরুরি' : 'Urgent'}
                          </span>
                        )}
                        {not.isNew && (
                          <span className="bg-[#2E5942] text-white px-2 py-0.5 rounded-none font-bold text-[9px] uppercase tracking-wider">
                            {language === 'bn' ? 'নতুন' : 'New'}
                          </span>
                        )}
                        <span className="text-[11px] text-[#6B5135] font-sans">📅 {language === 'bn' ? not.date_bn : not.date_en}</span>
                      </div>
                      <h5 className="text-sm md:text-base font-bold text-[#1A1207] leading-relaxed hover:text-[#B8862A] transition">
                        {language === 'bn' ? not.title_bn : not.title_en}
                      </h5>
                    </div>
                    <div className="flex items-center text-xs text-[#B8862A] font-bold mt-4 pt-2 border-t border-stone-50 select-none">
                      <span>{language === 'bn' ? 'বিস্তারিত দেখতে ক্লিক করুন' : 'Click to see details'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((not, index) => (
                  <div 
                    key={'notice-p-' + index}
                    onClick={() => setActiveModalNotice({ ...not, type: 'notice' })}
                    className="p-4 bg-white border border-[#E8DDD0]/80 rounded-xl cursor-pointer hover:border-[#B8862A]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:-translate-y-0.5 duration-150 transition shadow-xs hover:shadow-md animate-fade-in text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {not.isUrgent && (
                            <span className="bg-[#8B3A1E] text-white px-2 py-0.5 rounded-none font-bold text-[9px] uppercase tracking-wider">
                              {language === 'bn' ? 'জরুরি' : 'Urgent'}
                            </span>
                          )}
                          {not.isNew && (
                            <span className="bg-[#2E5942] text-white px-2 py-0.5 rounded-none font-bold text-[9px] uppercase tracking-wider">
                              {language === 'bn' ? 'নতুন' : 'New'}
                            </span>
                          )}
                          <span className="text-[11px] text-[#6B5135] font-sans">📅 {language === 'bn' ? not.date_bn : not.date_en}</span>
                        </div>
                        <h5 className="text-sm md:text-base font-bold text-[#1A1207] leading-relaxed hover:text-[#B8862A] transition">
                          {language === 'bn' ? not.title_bn : not.title_en}
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-[#B8862A] font-bold shrink-0 self-start sm:self-center select-none">
                      <span>{language === 'bn' ? 'বিস্তারিত' : 'View Details'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Recruitment Circulars & Career Opportunities (নিয়োগ বিজ্ঞপ্তি) */}
          <div className="space-y-4 pt-2">
            <div className="pb-2 border-b border-[#E8DDD0] flex items-center justify-between">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-[#B8862A]" />
                <span>{language === 'bn' ? 'নিয়োগ বিজ্ঞপ্তি ও ক্যারিয়ার সুযোগসমূহ' : 'Recruitment & Career Circulars'}</span>
              </h4>
              <button
                type="button"
                onClick={() => onNavigate('recruitment')}
                className="text-xs font-bold text-[#2E5942] hover:text-[#1E3B2C] flex items-center gap-1 bg-[#2E5942]/10 hover:bg-[#2E5942]/20 px-3 py-1 rounded-lg transition cursor-pointer"
              >
                <span>{language === 'bn' ? 'সকল নিয়োগ দেখুন' : 'View All Jobs'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {dbCirculars.length === 0 ? (
              <div className="p-6 bg-white border border-[#E8DDD0] rounded-xl text-center text-stone-500 text-xs font-sans">
                {language === 'bn' ? 'বর্তমানে কোনো সক্রিয় নিয়োগ বিজ্ঞপ্তি নেই।' : 'No active job circulars currently.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                {dbCirculars.slice(0, 4).map((circ) => {
                  const isExpired = circ.status === 'expired';
                  return (
                    <div
                      key={'notice-rec-' + circ.id}
                      onClick={() => setActiveModalCircular(circ)}
                      className={`p-5 bg-white border border-[#E8DDD0] rounded-xl cursor-pointer hover:border-[#B8862A]/60 flex flex-col justify-between hover:-translate-y-0.5 transition shadow-xs hover:shadow-md ${
                        isExpired ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                            isExpired ? 'bg-stone-100 text-stone-500' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isExpired ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Closed') : (language === 'bn' ? 'চলমান নিয়োগ' : 'Open Vacancy')}
                          </span>
                          {circ.dept_bn && (
                            <span className="bg-[#FAF7F2] text-[#6B5135] border border-[#E8DDD0] px-2 py-0.5 rounded-full text-[9px] font-bold">
                              💼 {language === 'bn' ? circ.dept_bn : circ.dept_en}
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm md:text-base font-bold text-[#1A1207] leading-snug font-serif">
                          {language === 'bn' ? circ.position_bn : circ.position_en}
                        </h5>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {language === 'bn' ? circ.title_bn : circ.title_en}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-4 pt-2 border-t border-stone-100 text-[#B8862A] font-bold">
                        <span className="text-[11px] text-stone-500">
                          ⏳ {language === 'bn' ? `শেষ তারিখ: ${circ.deadline_bn || 'শীঘ্রই'}` : `Deadline: ${circ.deadline_en || 'Soon'}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveModalCircular(circ);
                            }}
                            className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#E8DDD0] text-[#6B5135] rounded-lg text-[11px] font-bold transition border border-[#E8DDD0] cursor-pointer"
                          >
                            {language === 'bn' ? 'বিবরণ দেখুন' : 'View Circular'}
                          </button>
                          {!isExpired && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveApplyCircular(circ);
                              }}
                              className="px-3 py-1 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <span>{language === 'bn' ? 'আবেদন করুন' : 'Apply Now'}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: New Updates & Seminar Schedule */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#E8DDD0] flex items-center justify-between">
              <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#B8862A]" />
                <span>{language === 'bn' ? 'নতুন আপডেট ও সেমিনার সূচী' : 'Recent Seminars & Updates'}</span>
              </h4>

              {/* Grid/List View Toggle */}
              <div className="flex items-center bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg p-0.5" id="events-view-toggle">
                <button
                  type="button"
                  onClick={() => setEventsViewMode('grid')}
                  className={`p-1 rounded-md transition cursor-pointer ${eventsViewMode === 'grid' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                  title={language === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEventsViewMode('list')}
                  className={`p-1 rounded-md transition cursor-pointer ${eventsViewMode === 'list' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                  title={language === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={eventsViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-3"}>
              {events.map((ev, index) => (
                <div 
                  key={'event-p-' + index}
                  onClick={() => setActiveModalNotice({ ...ev, type: 'event' })}
                  className="p-4 bg-white border border-[#E8DDD0] rounded-xl hover:border-[#B8862A]/60 flex items-start space-x-4 cursor-pointer hover:-translate-y-0.5 transition shadow-xs hover:shadow-md text-left group animate-fade-in"
                >
                  <div className="bg-[#B8862A]/10 text-center p-2.5 rounded-lg border border-[#B8862A]/20 shrink-0 min-w-[64px] flex flex-col justify-center select-none font-serif">
                    <span className="text-lg font-extrabold leading-none text-[#1A1207] block">{language === 'bn' ? ev.day : ev.dayEn}</span>
                    <span className="text-[10px] uppercase font-bold text-[#6B5135] block mt-1">{language === 'bn' ? ev.month : ev.monthEn}</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 leading-normal">
                    <span className="inline-block bg-[#FAF7F2] text-[#B8862A] text-[9px] px-2 py-0.5 rounded border border-[#E8DDD0] font-bold uppercase tracking-wider">
                      {language === 'bn' ? ev.chip_bn : ev.chip_en}
                    </span>
                    <h5 className="text-sm md:text-base font-bold text-[#1A1207] line-clamp-2 leading-snug group-hover:text-[#B8862A] transition-colors">
                      {language === 'bn' ? ev.title_bn : ev.title_en}
                    </h5>
                    <div className="flex flex-col gap-0.5 text-xs text-[#6B5135] mt-2">
                      <span>🕒 {language === 'bn' ? ev.time_bn : ev.time_en}</span>
                      <span className="truncate">🏢 {language === 'bn' ? ev.loc_bn : ev.loc_en}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Blog Section */}
      {page.id === 'blog' && (
        <div id="bsk-blog-section" className="space-y-8 text-left font-sans text-stone-800">
          {/* Header Banner */}
          <div className="bg-[#1A1207] text-[#FAF7F2] p-6 md:p-8 rounded-2xl border border-[#B8862A]/30 relative overflow-hidden shadow-lg">
            {dbBlogSettings?.banner_image && (
              <img 
                src={dbBlogSettings.banner_image} 
                alt="Blog Cover" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" 
              />
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8862A]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="inline-block bg-[#B8862A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                {language === 'bn' 
                  ? (dbBlogSettings?.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র ব্লগ') 
                  : (dbBlogSettings?.badge_en || 'BSK Official Blog')}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold font-serif text-white tracking-tight leading-tight">
                {language === 'bn' 
                  ? (dbBlogSettings?.title_bn || 'সাহিত্যচিন্তা, শিক্ষা ও আলোকদীপ্ত জীবন') 
                  : (dbBlogSettings?.title_en || 'Literature, Education & Enlightened Thought')}
              </h3>
              <p className="text-stone-300 text-xs md:text-sm font-sans leading-relaxed">
                {language === 'bn' 
                  ? (dbBlogSettings?.desc_bn || 'বইপড়া আন্দোলন, বিশ্বসাহিত্য চিন্তন, মানবিক মূল্যবোধ গঠন ও তরুণের চিন্তার বিকাশে কেন্দ্রের প্রকাশিত গুরুত্বপূর্ণ ব্লগ, প্রবন্ধ ও নিবন্ধমালা।') 
                  : (dbBlogSettings?.desc_en || 'Articles, essays and reflections on reading movements, literature, aesthetics, and youth development.')}
              </p>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-[#E8DDD0] shadow-xs">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', bn: 'সকল নিবন্ধ', en: 'All Articles' },
                { id: 'literature', bn: 'সাহিত্য ও চিন্তা', en: 'Literature & Thought' },
                { id: 'education', bn: 'শিক্ষা ও পাঠাভ্যাস', en: 'Education & Reading' },
                { id: 'culture', bn: 'সংস্কৃতি ও ইতিহাস', en: 'Culture & History' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setBlogCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-serif whitespace-nowrap transition cursor-pointer ${
                    blogCategoryFilter === cat.id
                      ? 'bg-[#2E5942] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-stone-700 border border-[#E8DDD0] hover:bg-[#B8862A]/10'
                  }`}
                >
                  {language === 'bn' ? cat.bn : cat.en}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={blogSearchQuery}
                onChange={(e) => setBlogSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'ব্লগ অনুসন্ধান করুন...' : 'Search articles...'}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#B8862A]"
              />
            </div>
          </div>

          {/* Blog Articles Grid */}
          {(() => {
            const allPosts = dbBlogPosts.length > 0 ? dbBlogPosts : defaultBlogPosts;
            const filteredPosts = allPosts.filter(post => {
              const matchCat = blogCategoryFilter === 'all' || 
                (post.category_bn && post.category_bn.includes(blogCategoryFilter)) ||
                (post.category_en && post.category_en.toLowerCase().includes(blogCategoryFilter));
              
              const query = blogSearchQuery.trim().toLowerCase();
              if (!query) return matchCat;

              const titleBn = (post.title_bn || '').toLowerCase();
              const titleEn = (post.title_en || '').toLowerCase();
              const authorBn = (post.author_bn || '').toLowerCase();
              const excerptBn = (post.excerpt_bn || '').toLowerCase();

              return matchCat && (titleBn.includes(query) || titleEn.includes(query) || authorBn.includes(query) || excerptBn.includes(query));
            });

            if (filteredPosts.length === 0) {
              return (
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-10 text-center space-y-3">
                  <p className="text-stone-500 font-serif text-sm">
                    {language === 'bn' ? 'কোনো ব্লগ নিবন্ধ খুঁজে পাওয়া যায়নি।' : 'No blog articles found.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPosts.map((post, idx) => (
                  <article
                    key={post.id || 'blog-' + idx}
                    onClick={() => setActiveModalBlogPost(post)}
                    className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-[#B8862A]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-48 bg-stone-100 overflow-hidden">
                        <img
                          src={post.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'}
                          alt={language === 'bn' ? post.title_bn : post.title_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-[#1A1207]/80 backdrop-blur-md text-[#FAF7F2] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#B8862A]/40">
                          {language === 'bn' ? (post.category_bn || 'সাহিত্য ও চিন্তা') : (post.category_en || 'Literature')}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3 text-[11px] text-[#6B5135] font-sans">
                          <span>📅 {language === 'bn' ? (post.date_bn || '১৫ মে ২০২৪') : (post.date_en || '15 May 2024')}</span>
                          <span>•</span>
                          <span>⏱️ {language === 'bn' ? (post.read_time_bn || '৫ মিনিট পাঠ') : (post.read_time_en || '5 min read')}</span>
                        </div>

                        <h4 className="font-serif font-bold text-base md:text-lg text-[#1A1207] leading-snug group-hover:text-[#B8862A] transition-colors line-clamp-2">
                          {language === 'bn' ? post.title_bn : post.title_en}
                        </h4>

                        <p className="text-stone-600 text-xs md:text-sm leading-relaxed line-clamp-3 font-sans">
                          {language === 'bn' ? post.excerpt_bn : post.excerpt_en}
                        </p>
                      </div>
                    </div>

                    {/* Author & Footer */}
                    <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#B8862A]/20 text-[#1A1207] font-bold text-xs flex items-center justify-center font-serif">
                          {(post.author_bn || 'ব')[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 leading-tight">
                            {language === 'bn' ? (post.author_bn || 'আব্দুল্লাহ আবু সায়ীদ') : (post.author_en || 'Abdullah Abu Sayeed')}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate max-w-[140px]">
                            {language === 'bn' ? (post.author_role_bn || 'বিশ্বসাহিত্য কেন্দ্র') : (post.author_role_en || 'BSK')}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#B8862A] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        {language === 'bn' ? 'পড়ুন' : 'Read'} →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            );
          })()}

          {/* Reviewers & Readers Book Reviews Section */}
          <div className="pt-8 border-t border-[#E8DDD0] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#B8862A]/30 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#B8862A]/10 text-[#B8862A] rounded-md font-serif text-sm">✍️</span>
                  <h4 className="font-serif font-extrabold text-lg text-[#1A1207]">
                    {language === 'bn' ? 'পাঠক ও সমালোচকদের গ্রন্থ পর্যালোচনা' : 'Reader & Reviewer Book Reviews'}
                  </h4>
                </div>
                <p className="text-stone-600 text-xs font-sans">
                  {language === 'bn' 
                    ? 'বিশ্বসাহিত্য কেন্দ্রের বিভিন্ন বই নিয়ে পাঠক, সাহিত্যপ্রেমী ও সমালোচকদের বস্তুনিষ্ঠ অনুভূতি ও পর্যালোচনা।' 
                    : 'Reflections, critiques, and reviews on books and literature by our community readers and reviewers.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReviewSubmitted(false);
                  setReviewModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition shadow-sm hover:scale-102 flex items-center justify-center gap-2 shrink-0 cursor-pointer font-sans"
              >
                <span>✨</span>
                <span>{language === 'bn' ? 'রিভিউ / মতামত জমা দিন' : 'Submit Your Review'}</span>
              </button>
            </div>

            {/* Display Reviews */}
            {(() => {
              const reviewsList = dbBlogReviews.length > 0 ? dbBlogReviews : [
                {
                  id: 'rev-1',
                  reviewerName: 'প্রফেসর ড. আনিসুজ্জামান',
                  reviewerRole: 'বিশিষ্ট শিক্ষাবিদ ও সাহিত্য সমালোচক',
                  bookTitle: 'বিশ্বসাহিত্য কেন্দ্রের বইপড়া আন্দোলন ও আমাদের চেতনা',
                  rating: 5,
                  category: 'বই ও সাহিত্য পর্যালোচনা',
                  content: 'তরুণ প্রজন্মকে আলোকিত মানুষ হিসেবে গড়ে তোলার যে সংগ্রাম বিশ্বসাহিত্য কেন্দ্র চার দশক ধরে চালিয়ে আসছে, তা বাংলাদেশের ইতিহাসে অনন্য। প্রতিটি বই যেন একেকটি আলোকবর্তিকা।',
                  date: '২০ মে ২০২৪'
                },
                {
                  id: 'rev-2',
                  reviewerName: 'নাসরিন সুলতানা',
                  reviewerRole: 'পাঠক ও লাইব্রেরি সদস্য',
                  bookTitle: 'আম আঁটির ভেঁপু - বিভূতিভূষণ বন্দ্যোপাধ্যায়',
                  rating: 5,
                  category: 'পাঠক অনুভূতি',
                  content: 'গ্রামবাংলার শৈশব আর প্রকৃতির অপরূপ বর্ণনা হৃদয়ে স্পর্শ করে যায়। বিশ্বসাহিত্য কেন্দ্রের কিশোর সিরিজের এই সংকলনটি প্রতি বছর নতুন করে পড়া উচিৎ।',
                  date: '১৮ মে ২০২৪'
                },
                {
                  id: 'rev-3',
                  reviewerName: 'তাহমিদ আহমেদ',
                  reviewerRole: 'বিশ্ববিদ্যালয় শিক্ষার্থী',
                  bookTitle: 'সঞ্চয়িতা - রবীন্দ্রনাথ ঠাকুর',
                  rating: 5,
                  category: 'গ্রন্থ সমালোচনা',
                  content: 'রবীন্দ্রনাথের কবিতার গভীরে যে দার্শনিক সত্য আর সৌন্দর্য রয়েছে, কেন্দ্র আয়োজিত চক্রভিত্তিক পাঠ আলোচনায় অংশ নিয়ে তা গভীরভাবে অনুভব করতে পেরেছি।',
                  date: '১২ মে ২০২৪'
                }
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  {reviewsList.map((rev, rIdx) => (
                    <div 
                      key={rev.id || 'rev-' + rIdx} 
                      className="p-5 bg-white border border-[#E8DDD0] rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#B8862A]/60 transition shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="bg-[#FAF7F2] text-[#B8862A] border border-[#E8DDD0] text-[10px] font-bold px-2.5 py-0.5 rounded-full font-serif">
                            {rev.category || (language === 'bn' ? 'বই সমালোচনা' : 'Book Review')}
                          </span>
                          <div className="text-amber-500 text-xs flex gap-0.5">
                            {Array.from({ length: Number(rev.rating) || 5 }).map((_, s) => (
                              <span key={s}>★</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase tracking-wider">
                            {language === 'bn' ? 'সমালোচিত গ্রন্থ:' : 'Book Reviewed:'}
                          </span>
                          <h5 className="font-serif font-bold text-sm md:text-base text-[#1A1207] leading-snug">
                            {rev.bookTitle}
                          </h5>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed italic bg-[#FAF7F2]/60 p-3 rounded-xl border border-stone-100">
                          "{rev.content}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-stone-900 leading-tight">{rev.reviewerName}</p>
                          <p className="text-[10px] text-stone-500">{rev.reviewerRole || 'পাঠক'}</p>
                        </div>
                        <span className="text-[10px] text-stone-400 font-sans">📅 {rev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Review Submission Modal */}
          {reviewModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!reviewSubmitting) setReviewModalOpen(false);
                }}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden font-sans max-h-[85vh] flex flex-col z-10 text-left"
              >
                {/* Modal Header */}
                <div className="bg-[#1A1207] text-[#FAF7F2] p-5 relative border-b border-[#B8862A]/40 flex items-center justify-between font-serif">
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                      <span className="text-amber-400">✍️</span>
                      <span>{language === 'bn' ? 'গ্রন্থ সমালোচনা ও রিভিউ জমা দিন' : 'Submit Book Review'}</span>
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5 font-sans">
                      {language === 'bn' ? 'আপনার পঠিত বই বা বিশ্বসাহিত্য কেন্দ্রের সাহিত্য চিন্তা নিয়ে অনুভূতি শেয়ার করুন' : 'Share your critique and thoughts on books & literature'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!reviewSubmitting) setReviewModalOpen(false);
                    }}
                    className="text-stone-300 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-stone-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 text-xs">
                  {reviewSubmitted ? (
                    <div className="text-center py-8 space-y-4 animate-fade-in">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base text-stone-900">
                          {language === 'bn' ? 'আপনার রিভিউ সফলভাবে জমা হয়েছে!' : 'Review Submitted Successfully!'}
                        </h4>
                        <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                          {language === 'bn'
                            ? 'আপনার মূল্যবান মতামত আমাদের ওয়েবসাইটে প্রকাশিত হবে। ধন্যবাদ।'
                            : 'Thank you for sharing your thoughtful review with our community.'}
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setReviewModalOpen(false);
                            setReviewSubmitted(false);
                          }}
                          className="px-5 py-2 bg-[#2E5942] text-white hover:bg-[#203F2E] rounded-xl font-bold transition shadow-xs cursor-pointer"
                        >
                          {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!reviewForm.reviewerName.trim() || !reviewForm.bookTitle.trim() || !reviewForm.content.trim()) return;
                        setReviewSubmitting(true);
                        try {
                          const reviewData = {
                            reviewerName: reviewForm.reviewerName.trim(),
                            reviewerRole: reviewForm.reviewerRole.trim() || 'পাঠক ও সাহিত্যপ্রেমী',
                            bookTitle: reviewForm.bookTitle.trim(),
                            rating: Number(reviewForm.rating) || 5,
                            category: reviewForm.category || 'বই সমালোচনা',
                            content: reviewForm.content.trim(),
                            date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
                            status: 'approved',
                            createdAt: new Date().toISOString()
                          };
                          await cpanelApi.addDoc('blog_reviews', reviewData);
                          setReviewSubmitted(true);
                          setReviewForm({
                            reviewerName: '',
                            reviewerRole: '',
                            bookTitle: '',
                            rating: 5,
                            category: 'বই সমালোচনা',
                            content: ''
                          });
                        } catch (err) {
                          console.error("Error submitting review:", err);
                          alert(language === 'bn' ? 'রিভিউ জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit review.');
                        } finally {
                          setReviewSubmitting(false);
                        }
                      }} 
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-stone-700 font-bold">
                            {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewForm.reviewerName}
                            onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                            placeholder={language === 'bn' ? 'যেমন: ড. তাহমিদা রহমান' : 'e.g. Dr. Tahmida Rahman'}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:border-[#B8862A] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-stone-700 font-bold">
                            {language === 'bn' ? 'পরিচয় / পেশা' : 'Role / Affiliation'}
                          </label>
                          <input
                            type="text"
                            value={reviewForm.reviewerRole}
                            onChange={(e) => setReviewForm({ ...reviewForm, reviewerRole: e.target.value })}
                            placeholder={language === 'bn' ? 'যেমন: লেখক / বিশ্ববিদ্যালয় শিক্ষক' : 'e.g. Writer / Student'}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:border-[#B8862A] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-stone-700 font-bold">
                            {language === 'bn' ? 'গ্রন্থের নাম / আলোচনার বিষয় *' : 'Book / Subject Title *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewForm.bookTitle}
                            onChange={(e) => setReviewForm({ ...reviewForm, bookTitle: e.target.value })}
                            placeholder={language === 'bn' ? 'যেমন: চোখের বালি - রবীন্দ্রনাথ ঠাকুর' : 'e.g. Chokher Bali'}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:border-[#B8862A] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-stone-700 font-bold">
                            {language === 'bn' ? 'স্টার রেটিং' : 'Star Rating'}
                          </label>
                          <select
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:border-[#B8862A] outline-none font-bold text-amber-600"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (৫ তারকা - অসাধারণ)</option>
                            <option value={4}>⭐⭐⭐⭐ (৪ তারকা - খুব ভালো)</option>
                            <option value={3}>⭐⭐⭐ (৩ তারকা - ভালো)</option>
                            <option value={2}>⭐⭐ (২ তারকা - সাধারণ)</option>
                            <option value={1}>⭐ (১ তারকা - মতামত)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-700 font-bold">
                          {language === 'bn' ? 'আপনার বস্তুনিষ্ঠ রিভিউ / মন্তব্য *' : 'Your Detailed Review / Comments *'}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                          placeholder={language === 'bn' ? 'বইটির বক্তব্য, ভাষা, চরিত্রায়ন বা আপনার অনুভূতি সম্পর্কে বিস্তারিত লিখুন...' : 'Write your detailed book review...'}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:border-[#B8862A] outline-none leading-relaxed"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setReviewModalOpen(false)}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="px-6 py-2 bg-[#2E5942] hover:bg-[#203F2F] text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                          {reviewSubmitting 
                            ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') 
                            : (language === 'bn' ? 'রিভিউ প্রকাশ করুন' : 'Submit Review')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Pop-up Modal for Notices/Events/News */}
      <AnimatePresence>
        {activeModalNotice && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalNotice(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-serif max-h-[85vh] flex flex-col z-10"
            >
              {/* Header block with elegant colors */}
              <div className="bg-[#1A1207] text-[#FAF7F2] p-6 relative border-b border-[#B8862A]/40">
                <button
                  onClick={() => setActiveModalNotice(null)}
                  className="absolute top-4 right-4 text-stone-200 hover:text-white hover:scale-110 transition cursor-pointer p-1"
                >
                  <span className="text-xl font-bold font-sans">✕</span>
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#B8862A] text-white text-[10px] uppercase tracking-wider font-sans font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {activeModalNotice.type === 'notice' && (language === 'bn' ? 'কেন্দ্রীয় নোটিশ' : 'Central Notice')}
                      {activeModalNotice.type === 'event' && (language === 'bn' ? 'সেমিনার ও আপডেট' : 'Seminar & Update')}
                      {activeModalNotice.type === 'news' && (language === 'bn' ? 'সংবাদ ও মিডিয়া' : 'News & Press')}
                    </span>
                    {activeModalNotice.isUrgent && (
                      <span className="bg-red-600 text-white text-[9px] uppercase tracking-wider font-sans font-bold px-2 py-0.5 rounded">
                        {language === 'bn' ? 'জরুরি' : 'Urgent'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-extrabold leading-snug tracking-tight text-white pr-6">
                    {language === 'bn' ? activeModalNotice.title_bn : activeModalNotice.title_en}
                  </h3>

                  {/* Dates/Timings/Location displays */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#FAF7F2]/80 font-sans pt-1">
                    {activeModalNotice.type === 'notice' && (
                      <span>📅 {language === 'bn' ? activeModalNotice.date_bn : activeModalNotice.date_en}</span>
                    )}
                    {activeModalNotice.type === 'event' && (
                      <>
                        <span>📅 {language === 'bn' ? `${activeModalNotice.day} ${activeModalNotice.month}` : `${activeModalNotice.dayEn} ${activeModalNotice.monthEn}`}</span>
                        <span>🕒 {language === 'bn' ? activeModalNotice.time_bn : activeModalNotice.time_en}</span>
                        <span>🏢 {language === 'bn' ? activeModalNotice.loc_bn : activeModalNotice.loc_en}</span>
                      </>
                    )}
                    {activeModalNotice.type === 'news' && (
                      <>
                        <span>📅 {language === 'bn' ? activeModalNotice.date_bn : activeModalNotice.date_en}</span>
                        <span>🏷️ {language === 'bn' ? activeModalNotice.tag_bn : activeModalNotice.tag_en}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Main content */}
              <div className="p-6 overflow-y-auto space-y-6 font-sans text-left text-stone-800">
                {/* Description details */}
                <div className="space-y-3 leading-relaxed text-sm md:text-base">
                  <p className="font-serif text-stone-700 italic border-l-2 border-[#B8862A] pl-3">
                    {language === 'bn' 
                      ? 'বিশ্বসাহিত্য কেন্দ্র এর সম্মানিত পাঠক, শুভানুধ্যায়ী ও দায়িত্বপ্রাপ্ত কর্মকর্তা-কর্মচারীদের অবগতির জন্য বিস্তারিত জানানো যাচ্ছে।' 
                      : 'Honorable readers, well-wishers and authorities of Bishwo Shahitto Kendro are hereby informed with the following details.'}
                  </p>
                  <p className="text-stone-600">
                    {language === 'bn' 
                      ? `${activeModalNotice.title_bn} সংক্রান্ত যাবতীয় নির্দেশনাবলী নিম্নে সংযুক্ত ফাইলে বা ফর্মে প্রদান করা হয়েছে। যেকোনো প্রয়োজনে কেন্দ্র কার্যালয়ে যোগাযোগ করুন।` 
                      : `Detailed guidelines and documents regarding "${activeModalNotice.title_en}" have been attached below. Please contact the central office for further information.`}
                  </p>
                </div>

                {/* File Attachment Display */}
                {activeModalNotice.fileUrl ? (
                  <div className="space-y-3 pt-4 border-t border-stone-200">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-[#B8862A]" />
                      <span>{language === 'bn' ? 'সংযুক্ত ফাইল / সংযুক্তি' : 'Attached Files & Documents'}</span>
                    </h4>

                    {activeModalNotice.fileType === 'image' || (!activeModalNotice.fileType && activeModalNotice.fileUrl.startsWith('data:image/')) ? (
                      <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-100 p-2 text-center group">
                        <img 
                          src={activeModalNotice.fileUrl} 
                          alt="Attachment Preview" 
                          className="max-h-[300px] w-auto mx-auto rounded-lg shadow-sm object-contain group-hover:scale-[1.01] transition-transform duration-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="mt-2 text-xs font-medium text-stone-500 truncate px-2">
                          📸 {activeModalNotice.fileName || (language === 'bn' ? 'সংযুক্ত ছবি.jpg' : 'Attached Image.jpg')}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-red-100 text-red-700 rounded-lg shadow-xs shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-extrabold text-red-950 truncate max-w-[280px] md:max-w-[380px]">
                              {activeModalNotice.fileName || (language === 'bn' ? 'সংযুক্ত ডকুমেন্ট ফাইল.pdf' : 'Attached Document File.pdf')}
                            </p>
                            <p className="text-[10px] text-red-600 font-medium">
                              {activeModalNotice.fileType === 'pdf' ? (language === 'bn' ? 'পিডিএফ ডকুমেন্ট ফাইল' : 'PDF Document File') : (language === 'bn' ? 'সংযুক্ত ফাইল' : 'Attached Document')}
                            </p>
                          </div>
                        </div>
                        <a
                          href={activeModalNotice.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold rounded-lg transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1 hover:scale-102"
                        >
                          <span>{language === 'bn' ? 'ডাউনলোড / ভিউ করুন' : 'Download / View File'}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-400 italic">
                    {language === 'bn' ? 'এই বিজ্ঞপ্তির সাথে কোনো ফাইল সংযুক্ত নেই।' : 'No attached documents or files for this notice.'}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-between items-center gap-3">
                <span className="text-[10px] font-mono text-stone-400">ID: {activeModalNotice.id}</span>
                <div className="flex gap-2">
                  {activeModalNotice.fileUrl && (
                    <a
                      href={activeModalNotice.fileUrl}
                      download={activeModalNotice.fileName || 'notice-file'}
                      className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{language === 'bn' ? 'ফাইল ডাউনলোড' : 'Download'}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveModalNotice(null)}
                    className="px-5 py-2 bg-[#B8862A] text-white hover:bg-[#9A6D1E] rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Pop-up Modal for Blog Posts */}
        {activeModalBlogPost && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalBlogPost(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden font-serif max-h-[88vh] flex flex-col z-10"
            >
              {/* Header image banner if available */}
              <div className="relative h-48 md:h-64 bg-stone-900 overflow-hidden shrink-0">
                <img
                  src={activeModalBlogPost.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'}
                  alt={language === 'bn' ? activeModalBlogPost.title_bn : activeModalBlogPost.title_en}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                
                <button
                  onClick={() => setActiveModalBlogPost(null)}
                  className="absolute top-4 right-4 bg-stone-900/80 text-white hover:bg-stone-900 hover:scale-110 transition cursor-pointer p-2 rounded-full z-20 shadow-lg"
                >
                  <span className="text-base font-bold font-sans">✕</span>
                </button>

                <div className="absolute bottom-4 left-6 right-6 space-y-2 text-white">
                  <span className="bg-[#B8862A] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                    {language === 'bn' ? (activeModalBlogPost.category_bn || 'সাহিত্য ও চিন্তা') : (activeModalBlogPost.category_en || 'Literature')}
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold leading-snug font-serif text-white">
                    {language === 'bn' ? activeModalBlogPost.title_bn : activeModalBlogPost.title_en}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-300 font-sans">
                    <span>✍️ {language === 'bn' ? (activeModalBlogPost.author_bn || 'আব্দুল্লাহ আবু সায়ীদ') : (activeModalBlogPost.author_en || 'Abdullah Abu Sayeed')}</span>
                    <span>•</span>
                    <span>📅 {language === 'bn' ? (activeModalBlogPost.date_bn || '১৫ মে ২০২৪') : (activeModalBlogPost.date_en || '15 May 2024')}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Article Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-5 leading-relaxed font-sans text-stone-800 text-sm md:text-base">
                {(() => {
                  const rawContent = language === 'bn' 
                    ? (activeModalBlogPost.content_bn || activeModalBlogPost.content_en || activeModalBlogPost.excerpt_bn)
                    : (activeModalBlogPost.content_en || activeModalBlogPost.content_bn || activeModalBlogPost.excerpt_en);

                  if (Array.isArray(rawContent)) {
                    return rawContent.map((paragraph: string, pIdx: number) => (
                      <p key={pIdx} className="leading-relaxed text-stone-800 font-serif text-justify whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ));
                  } else if (typeof rawContent === 'string' && rawContent.trim()) {
                    const paragraphs = rawContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
                    if (paragraphs.length > 0) {
                      return paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="leading-relaxed text-stone-800 font-serif text-justify whitespace-pre-wrap">
                          {para}
                        </p>
                      ));
                    }
                    return (
                      <p className="leading-relaxed text-stone-800 font-serif text-justify whitespace-pre-wrap">
                        {rawContent}
                      </p>
                    );
                  }

                  return (
                    <p className="leading-relaxed text-stone-800 font-serif text-justify">
                      {language === 'bn' ? (activeModalBlogPost.excerpt_bn || activeModalBlogPost.title_bn) : (activeModalBlogPost.excerpt_en || activeModalBlogPost.title_en)}
                    </p>
                  );
                })()}

                {/* Author Quote Box */}
                <div className="p-5 bg-white border-l-4 border-[#B8862A] rounded-r-xl shadow-xs space-y-1 font-serif my-4">
                  <p className="text-xs text-[#B8862A] font-bold uppercase tracking-wider">
                    {language === 'bn' ? 'লেখক ও পরিচিতি' : 'About the Author'}
                  </p>
                  <p className="text-stone-900 font-bold text-sm">
                    {language === 'bn' ? (activeModalBlogPost.author_bn || 'আব্দুল্লাহ আবু সায়ীদ') : (activeModalBlogPost.author_en || 'Abdullah Abu Sayeed')}
                  </p>
                  <p className="text-stone-500 text-xs font-sans">
                    {language === 'bn' ? (activeModalBlogPost.author_role_bn || 'বিশ্বসাহিত্য কেন্দ্র') : (activeModalBlogPost.author_role_en || 'Bishwo Shahitto Kendro')}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center">
                <span className="text-xs text-stone-500 font-sans">
                  {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র ডিজিটাল আর্কাইভ' : 'Bishwo Shahitto Kendro Digital Archive'}
                </span>
                <button
                  onClick={() => setActiveModalBlogPost(null)}
                  className="px-5 py-2 bg-[#B8862A] hover:bg-[#9A6D1E] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 10. Catalog Search Modal */}
        {catalogSearchOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCatalogSearchOpen(false);
                setCatalogSearchQuery('');
              }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-serif max-h-[80vh] flex flex-col z-10"
            >
              {/* Header */}
              <div className="bg-[#1A1207] text-[#FAF7F2] p-5 relative border-b border-[#B8862A]/40 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? 'লাইব্রেরি বই অনুসন্ধান' : 'Search Library Catalog'}</span>
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 font-sans">
                    {language === 'bn' ? 'কেন্দ্র লাইব্রেরির ৮৫,০০০+ বইয়ের ক্যাটালগ থেকে অনুসন্ধান করুন' : 'Explore from BSK Central Library collection of 85,000+ volumes'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCatalogSearchOpen(false);
                    setCatalogSearchQuery('');
                  }}
                  className="text-stone-300 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'বইয়ের নাম, লেখক বা বিষয় লিখে খুঁজুন...' : 'Search by book title, author, category...'}
                    className="w-full bg-white border border-[#E8DDD0] rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#B8862A] focus:outline-none transition-colors font-sans"
                    autoFocus
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  {catalogSearchQuery && (
                    <button
                      onClick={() => setCatalogSearchQuery('')}
                      className="absolute right-3.5 top-3 w-5 h-5 flex items-center justify-center text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full text-xs font-sans"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 font-sans mr-1">{language === 'bn' ? 'দ্রুত খুঁজুন:' : 'Suggestions:'}</span>
                  {['সাহিত্য', 'ইতিহাস', 'বিজ্ঞান', 'দর্শন', 'উপন্যাস', 'কাব্য'].map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCatalogSearchQuery(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs transition cursor-pointer font-sans border ${
                        catalogSearchQuery === cat
                          ? 'bg-[#B8862A] text-white border-[#B8862A]'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-[#B8862A]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Book List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-left">
                  {(() => {
                    const filtered = libraryBooks.filter(bk => {
                      const q = catalogSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        bk.title.toLowerCase().includes(q) ||
                        bk.author.toLowerCase().includes(q) ||
                        bk.category.toLowerCase().includes(q) ||
                        bk.titleEn.toLowerCase().includes(q) ||
                        bk.authorEn.toLowerCase().includes(q) ||
                        bk.categoryEn.toLowerCase().includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 text-center text-stone-500 space-y-2">
                          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                          <p className="text-sm font-sans">{language === 'bn' ? 'দুঃখিত, আপনার অনুসন্ধানের সাথে মিলতি কোনো বই পাওয়া যায়নি।' : 'No matching books found for your query.'}</p>
                          <p className="text-xs text-stone-400 font-sans">{language === 'bn' ? 'অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করে দেখুন।' : 'Try searching with a different keyword.'}</p>
                        </div>
                      );
                    }

                    return filtered.map((bk) => (
                      <div key={bk.id} className="p-3.5 bg-white border border-stone-200/60 hover:border-[#B8862A]/40 rounded-xl flex items-center justify-between gap-4 transition duration-150 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="font-serif font-extrabold text-stone-900 text-sm md:text-base">
                            {language === 'bn' ? bk.title : bk.titleEn}
                          </h4>
                          <p className="text-xs text-stone-600 font-sans">
                            ✍️ {language === 'bn' ? bk.author : bk.authorEn}
                          </p>
                          <div className="flex gap-2 pt-0.5 font-sans">
                            <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] border border-stone-200/50 font-medium">
                              {language === 'bn' ? bk.category : bk.categoryEn}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 bg-[#B8862A]/5 border border-[#B8862A]/10 px-3 py-2 rounded-lg text-center min-w-[80px] font-mono">
                          <span className="text-[10px] text-[#B8862A] font-bold block uppercase tracking-wider">{language === 'bn' ? 'অবস্থান' : 'Location'}</span>
                          <span className="text-xs text-stone-800 font-extrabold block mt-0.5">{language === 'bn' ? bk.shelf : bk.shelfEn}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => {
                    setCatalogSearchOpen(false);
                    setCatalogSearchQuery('');
                  }}
                  className="px-5 py-2 bg-[#B8862A] text-white hover:bg-[#9A6D1F] rounded-lg text-xs font-bold transition cursor-pointer font-sans"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 11. Membership Registration Modal */}
        {membershipModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!membershipSubmitting) {
                  setMembershipModalOpen(false);
                  setMembershipSubmitted(false);
                }
              }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden font-serif max-h-[85vh] flex flex-col z-10 text-left"
            >
              {/* Header */}
              <div className="bg-[#1A1207] text-[#FAF7F2] p-5 relative border-b border-[#B8862A]/40 flex items-center justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#B8862A]" />
                    <span>{language === 'bn' ? 'লাইব্রেরি সদস্যপদের আবেদন' : 'Membership Application'}</span>
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 font-sans">
                    {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় লাইব্রেরির সদস্য হওয়ার জন্য ফরমটি পূরণ করুন' : 'Fill up the form to request official membership'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!membershipSubmitting) {
                      setMembershipModalOpen(false);
                      setMembershipSubmitted(false);
                    }
                  }}
                  className="text-stone-300 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 font-sans">
                {membershipSubmitted ? (
                  <div className="text-center py-8 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-700 border border-green-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-serif font-extrabold text-[#1A1207] text-lg">
                        {language === 'bn' ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted Successfully!'}
                      </h4>
                      <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                        {language === 'bn'
                          ? 'আপনার তথ্য আমাদের ডেটাবেজে সফলভাবে সংরক্ষিত হয়েছে। অনুগ্রহ করে আপনার ২ কপি ছবি, ভোটার আইডি/জন্মনিবন্ধন কপি এবং প্রয়োজনীয় জমাদানের ফিসহ বাংলামোটর বিশ্বসাহিত্য কেন্দ্র ভবনের ৭ম তলায় যোগাযোগ করে সদস্য কার্ড সংগ্রহ করুন।'
                          : 'Your records are stored securely in our database. Please visit BSK HQ Building (7th floor) at Banglamotor with your photos, NID copy and deposit fees to pick up your library card.'}
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setMembershipModalOpen(false);
                          setMembershipSubmitted(false);
                        }}
                        className="px-6 py-2.5 bg-[#2E5942] text-white hover:bg-[#203F2E] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        {language === 'bn' ? 'ধন্যবাদ ও বন্ধ করুন' : 'Thank You & Close'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleMembershipSubmit} className="space-y-4 text-xs sm:text-sm">
                    {membershipError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 font-medium">
                        ⚠️ {membershipError}
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-stone-700 font-bold">
                        {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={membershipForm.name}
                        onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })}
                        placeholder={language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="block text-stone-700 font-bold">
                          {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={membershipForm.phone}
                          onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                          placeholder={language === 'bn' ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="block text-stone-700 font-bold">
                          {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={membershipForm.email}
                          onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                          placeholder="example@mail.com"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Occupation */}
                      <div className="space-y-1">
                        <label className="block text-stone-700 font-bold">
                          {language === 'bn' ? 'পেশা' : 'Occupation'}
                        </label>
                        <input
                          type="text"
                          value={membershipForm.occupation}
                          onChange={(e) => setMembershipForm({ ...membershipForm, occupation: e.target.value })}
                          placeholder={language === 'bn' ? 'যেমন: ছাত্র, শিক্ষক, চাকরিজীবী' : 'e.g. Student, Teacher, Engineer'}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all"
                        />
                      </div>

                      {/* Duration */}
                      <div className="space-y-1">
                        <label className="block text-stone-700 font-bold">
                          {language === 'bn' ? 'সদস্যপদের মেয়াদ' : 'Membership Duration'}
                        </label>
                        <select
                          value={membershipForm.duration}
                          onChange={(e) => setMembershipForm({ ...membershipForm, duration: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="1">{language === 'bn' ? '১ বছর (৪০০/- টাকা ফি)' : '1 Year (400 BDT Fee)'}</option>
                          <option value="2">{language === 'bn' ? '২ বছর (৭০০/- টাকা ফি)' : '2 Years (700 BDT Fee)'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label className="block text-stone-700 font-bold">
                        {language === 'bn' ? 'বর্তমান ঠিকানা' : 'Current Address'}
                      </label>
                      <textarea
                        rows={2}
                        value={membershipForm.address}
                        onChange={(e) => setMembershipForm({ ...membershipForm, address: e.target.value })}
                        placeholder={language === 'bn' ? 'আপনার পূর্ণ ঠিকানা লিখুন' : 'Enter your complete address'}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#B8862A] focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Fees Indicator */}
                    <div className="p-3 bg-stone-100 rounded-xl border border-stone-200/50 flex justify-between items-center text-xs">
                      <span className="text-stone-600 font-medium">{language === 'bn' ? 'মোট প্রযোজ্য জমা ফি (ফেরতযোগ্য জামানতসহ):' : 'Total Payable (Including deposit):'}</span>
                      <span className="font-extrabold text-[#B8862A] font-serif">
                        {membershipForm.duration === '1' ? (language === 'bn' ? '১,০০০/- টাকা' : '1,000 BDT') : (language === 'bn' ? '১,৩০০/- টাকা' : '1,300 BDT')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex justify-end gap-3 font-sans">
                      <button
                        type="button"
                        disabled={membershipSubmitting}
                        onClick={() => setMembershipModalOpen(false)}
                        className="px-5 py-2.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={membershipSubmitting}
                        className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#203F2E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-w-[120px]"
                      >
                        {membershipSubmitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'bn' ? 'আবেদন জমা দিন' : 'Submit Application'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Photo Gallery Lightbox */}
      <AnimatePresence>
        {activePhoto && (
          <div 
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] select-none animate-in fade-in duration-200"
          >
            {/* Left arrow */}
            {activePhotoIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIdx = activePhotoIndex - 1;
                  setActivePhotoIndex(prevIdx);
                  if (activeAlbumPhotos && activeAlbumPhotos[prevIdx]) {
                    setActivePhoto(activeAlbumPhotos[prevIdx]);
                  }
                }}
                className="absolute left-4 p-3 bg-white/90 hover:bg-white text-stone-850 rounded-full transition shadow-xl z-[10000] cursor-pointer border border-stone-200"
                title={language === 'bn' ? 'পূর্ববর্তী ছবি' : 'Previous Image'}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main Image container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center relative bg-white p-2 sm:p-3 rounded-2xl shadow-2xl border border-stone-200/80 m-auto"
            >
              <img 
                src={activePhoto} 
                alt="Lightbox Fullview" 
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-xs"
                referrerPolicy="no-referrer"
              />
              {/* Floating Close Button */}
              <button 
                onClick={() => setActivePhoto(null)}
                className="absolute -top-3.5 -right-3.5 p-2 bg-white hover:bg-stone-100 text-stone-800 rounded-full border border-stone-300 shadow-xl transition z-[10000] cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>

            {/* Right arrow */}
            {activeAlbumPhotos && activePhotoIndex < activeAlbumPhotos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx = activePhotoIndex + 1;
                  setActivePhotoIndex(nextIdx);
                  if (activeAlbumPhotos && activeAlbumPhotos[nextIdx]) {
                    setActivePhoto(activeAlbumPhotos[nextIdx]);
                  }
                }}
                className="absolute right-4 p-3 bg-white/90 hover:bg-white text-stone-850 rounded-full transition shadow-xl z-[10000] cursor-pointer border border-stone-200"
                title={language === 'bn' ? 'পরবর্তী ছবি' : 'Next Image'}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Photo Counter */}
            {activeAlbumPhotos && activeAlbumPhotos.length > 0 && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 bg-white/95 backdrop-blur-xs text-stone-800 border border-stone-200 px-4 py-1.5 rounded-full text-xs font-serif font-bold select-none shadow-lg"
              >
                {language === 'bn' 
                  ? `ছবি ${activePhotoIndex + 1} / ${activeAlbumPhotos.length}`
                  : `Photo ${activePhotoIndex + 1} of ${activeAlbumPhotos.length}`}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Pop-up Modal for Job Circular Details (বিজ্ঞপ্তি ও নিয়োগ শর্তাবলী) */}
      <AnimatePresence>
        {activeModalCircular && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalCircular(null)}
              className="absolute inset-0 bg-stone-900/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-[#FAF7F2] border border-[#B8862A]/40 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden font-sans max-h-[90vh] flex flex-col z-10 text-left"
            >
              {/* Header block */}
              <div className="bg-[#1A1207] text-[#FAF7F2] p-6 relative border-b border-[#B8862A]/40">
                <button
                  type="button"
                  onClick={() => setActiveModalCircular(null)}
                  className="absolute top-4 right-4 text-stone-300 hover:text-white hover:scale-110 transition cursor-pointer p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#B8862A] text-stone-950 text-[10px] uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                      {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র নিয়োগ বিজ্ঞপ্তি' : 'BSK Job Circular'}
                    </span>
                    {activeModalCircular.dept_bn && (
                      <span className="bg-white/10 text-stone-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        💼 {language === 'bn' ? activeModalCircular.dept_bn : activeModalCircular.dept_en}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      activeModalCircular.status === 'expired' ? 'bg-stone-700 text-stone-300' : 'bg-emerald-600 text-white'
                    }`}>
                      {activeModalCircular.status === 'expired' ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Closed') : (language === 'bn' ? 'চলমান নিয়োগ' : 'Open')}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl md:text-2xl font-extrabold text-white pr-8 leading-snug">
                    {language === 'bn' ? activeModalCircular.position_bn : activeModalCircular.position_en}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#FAF7F2]/80 font-sans pt-1">
                    <p>
                      <span className="font-bold text-[#B8862A]">{language === 'bn' ? 'বিজ্ঞপ্তি বিষয়: ' : 'Subject: '}</span>
                      {language === 'bn' ? activeModalCircular.title_bn : activeModalCircular.title_en}
                    </p>
                    {activeModalCircular.circular_no && (
                      <p>
                        <span className="font-bold text-stone-400">{language === 'bn' ? 'স্মারক/রেফ নং: ' : 'Ref No: '}</span>
                        {activeModalCircular.circular_no}
                      </p>
                    )}
                    {activeModalCircular.deadline_bn && (
                      <p className="text-amber-400 font-bold">
                        📅 {language === 'bn' ? `আবেদনের শেষ তারিখ: ${activeModalCircular.deadline_bn}` : `Deadline: ${activeModalCircular.deadline_en}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Main content */}
              <div className="p-6 overflow-y-auto space-y-6 font-sans text-stone-800">
                {/* Detailed Description */}
                <div className="space-y-3 leading-relaxed text-sm md:text-base">
                  <h4 className="font-serif font-bold text-base text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#B8862A] inline-block" />
                    <span>{language === 'bn' ? 'নিয়োগের বিবরণ ও প্রয়োজনীয় যোগ্যতা' : 'Circular Details & Requirements'}</span>
                  </h4>
                  
                  {activeModalCircular.desc_bn ? (
                    <div className="bg-white p-5 rounded-2xl border border-[#E8DDD0] shadow-xs text-stone-700 font-sans leading-relaxed text-sm md:text-base space-y-3 whitespace-pre-wrap">
                      {language === 'bn' ? activeModalCircular.desc_bn : activeModalCircular.desc_en}
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-500 text-xs italic text-center">
                      {language === 'bn' ? 'এই বিজ্ঞপ্তির জন্য কোনো পৃথক বিস্তারিত বিবরণ যোগ করা হয়নি। নিচে সংযুক্ত ফাইল ডাউনলোড করুন।' : 'No additional detailed text provided. Please check attached documents below.'}
                    </div>
                  )}
                </div>

                {/* Attached Files & Downloadable Documents */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif font-bold text-base text-[#1A1207] border-b border-[#E8DDD0] pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#B8862A]" />
                    <span>{language === 'bn' ? 'সংযুক্ত নথিপত্র ও আবেদন ফরম' : 'Attached Documents & Application Forms'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModalCircular.fileUrl ? (
                      <a
                        href={activeModalCircular.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 bg-white hover:bg-stone-50 border border-[#E8DDD0] hover:border-[#B8862A] rounded-xl flex items-center gap-3 transition shadow-xs group"
                      >
                        <div className="p-2 bg-amber-50 text-[#B8862A] rounded-lg shrink-0">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {activeModalCircular.fileName || (language === 'bn' ? 'মূল নিয়োগ সার্কুলার (PDF/ছবি)' : 'Official Circular PDF')}
                          </p>
                          <p className="text-[10px] text-[#B8862A] font-medium flex items-center gap-1 mt-0.5">
                            <span>{language === 'bn' ? 'বিজ্ঞপ্তি ফাইলটি দেখুন/ডাউনলোড করুন' : 'View / Download Circular'}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-400 text-xs italic flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-stone-300" />
                        <span>{language === 'bn' ? 'কোনো সার্কুলার ফাইল সংযুক্ত নেই' : 'No circular file attached'}</span>
                      </div>
                    )}

                    {activeModalCircular.applyFileUrl && (
                      <a
                        href={activeModalCircular.applyFileUrl}
                        download={activeModalCircular.applyFileName || 'application_form'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 bg-white hover:bg-stone-50 border border-[#E8DDD0] hover:border-[#2E5942] rounded-xl flex items-center gap-3 transition shadow-xs group"
                      >
                        <div className="p-2 bg-emerald-50 text-[#2E5942] rounded-lg shrink-0">
                          <Download className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {activeModalCircular.applyFileName || (language === 'bn' ? 'ম্যানুয়াল আবেদন ফরম (PDF)' : 'Manual Application Form')}
                          </p>
                          <p className="text-[10px] text-[#2E5942] font-medium flex items-center gap-1 mt-0.5">
                            <span>{language === 'bn' ? 'ফরমটি ডাউনলোড করুন' : 'Download Application Form'}</span>
                            <Download className="h-3 w-3" />
                          </p>
                        </div>
                      </a>
                    )}
                  </div>

                  {activeModalCircular.applyUrl && (
                    <a
                      href={activeModalCircular.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 p-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl flex items-center justify-between text-stone-700 text-xs font-bold transition"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-[#B8862A]" />
                        <span>{language === 'bn' ? 'বাহ্যিক অনলাইন নিয়োগ পোর্টাল লিংক' : 'External Online Portal Link'}</span>
                      </div>
                      <span className="text-[11px] text-[#B8862A] underline truncate max-w-[200px]">{activeModalCircular.applyUrl}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="bg-stone-100 p-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalCircular(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>

                {activeModalCircular.status !== 'expired' && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetCirc = activeModalCircular;
                      setActiveModalCircular(null);
                      setActiveApplyCircular(targetCirc);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <span>{language === 'bn' ? 'অনলাইনে আবেদন করুন' : 'Apply Online Now'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
