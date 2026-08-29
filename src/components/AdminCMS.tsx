import { cpanelApi } from '../services/cpanelApi';
import { DatabaseHealthDashboard } from './DatabaseHealthDashboard';
import React, { useState, useEffect } from 'react';
import { 
  Lock, Layout, Image as ImageIcon, FileText, Plus, Edit2, Trash2, Save, X, RefreshCw, 
  CheckCircle, ArrowLeft, Upload, AlertCircle, Eye, Globe2, BookOpen, Compass, Info,
  Bell, Calendar, Mail, Briefcase, Paperclip, ArrowUpRight, UserCheck, Download, Sparkles,
  Award, History, PlusCircle, ImagePlus, Quote, GraduationCap, Phone, Pencil, ShieldCheck,
  Sliders, Database, Landmark, Building2, Edit
} from 'lucide-react';
import { 
  db, auth, OperationType, handleFirestoreError,
  collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, getDoc,
  signInAnonymously, signOut, GoogleAuthProvider, signInWithPopup,
  verifyAdminCredentials, uploadImageToServer
} from '../firebase';
import { Language } from '../types';
import ImageResizer from './ImageResizer';
import PressCMS from './PressCMS';
import { BangalirChintaCMSEditor } from './BangalirChintaCMSEditor';
import { MobileLibraryCMSEditor } from './MobileLibraryCMSEditor';
import { PrimaryTeacherCMSEditor } from './PrimaryTeacherCMSEditor';
import { ReadingHabitCMSEditor } from './ReadingHabitCMSEditor';
import { AalorIshkoolCMSEditor } from './AalorIshkoolCMSEditor';
import { AalorPathshalaCMSEditor } from './AalorPathshalaCMSEditor';
import { BookFairCMSEditor } from './BookFairCMSEditor';
import { NationwideExcellenceCMSEditor } from './NationwideExcellenceCMSEditor';
import { CentralLibraryCMSEditor } from './CentralLibraryCMSEditor';
import { AuditoriumCMSEditor } from './AuditoriumCMSEditor';
import { BuildingCMSEditor } from './BuildingCMSEditor';
import { CafeCMSEditor } from './CafeCMSEditor';
import { BookShopCMSEditor } from './BookShopCMSEditor';
import { PublicationCMSEditor } from './PublicationCMSEditor';
import { OrganogramCMSEditor } from './OrganogramCMSEditor';
import {
  defaultCentralLibraryData,
  defaultAalorIshkoolData,
  defaultAuditoriumData,
  defaultBangalirChintaData,
  defaultBookFairData,
  defaultBookShopData,
  defaultBuildingData,
  defaultCafeData,
  defaultDonationData,
  defaultMobileLibraryData,
  defaultNationwideExcellenceData,
  defaultPrimaryTeacherData
} from '../data/specializedPagesDefaults';
import {
  defaultPublicationStats,
  defaultPublicationSeriesList,
  defaultPublicationCatalogs,
  defaultPublicationGallery
} from '../data/publicationDefaults';
import websiteContentRaw from '../data/website_content.json';

function formatToBanglaDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate();
  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const month = monthNamesBn[date.getMonth()];
  const year = date.getFullYear();
  
  const toBanglaNum = (num: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).split('').map(char => bnNums[parseInt(char)] || char).join('');
  };
  
  return `${toBanglaNum(day)} ${month} ${toBanglaNum(year)} খ্রিষ্টাব্দ`;
}

function formatToEnglishDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate();
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNamesEn[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

interface AdminCMSProps {
  language: Language;
  onClose: () => void;
}

// Interfaces
interface HeroSlide {
  id: string;
  badge_bn: string;
  badge_en: string;
  title_bn: string;
  title_en: string;
  desc_bn: string;
  desc_en: string;
  caption_bn?: string;
  caption_en?: string;
  bgImage: string;
  order: number;
}

interface RecentActivity {
  id: string;
  title_bn: string;
  title_en: string;
  desc_bn: string;
  desc_en: string;
  date_bn: string;
  date_en: string;
  loc_bn: string;
  loc_en: string;
  category_bn: string;
  category_en: string;
  caption_bn?: string;
  caption_en?: string;
  image: string;
  order: number;
}

interface WebsitePage {
  id: string;
  title_bn: string;
  title_en: string;
  html_title: string;
  sections: Array<{
    title: string;
    content: string[];
  }>;
}

// Passcode to access Admin Mode (configurable via environment variable)
const adminVarKey = "VITE_ADMIN_PASSCODE";
const ADMIN_PASSCODE = (import.meta as any).env[adminVarKey] || "5656";

// Helper to recursively remove undefined fields so Firestore setDoc does not throw errors
const removeUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefinedFields(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
};

// Helper to downscale and compress images before converting to Base64 to avoid Firestore document limits and speed up rendering
function compressImage(file: File, maxW = 600, maxH = 600, quality = 0.55): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
      img.src = ev.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function AdminCMS({ language, onClose }: AdminCMSProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasPasscode, setHasPasscode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bsk_admin_passcode_verified') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [user, setUser] = useState(auth.currentUser);
  const [passcode, setPasscode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'hero' | 'activities' | 'blocks' | 'stats' | 'programs' | 'galleries' | 'movement' | 'about_management' | 'programs_cms' | 'facilities_cms' | 'downloads_cms' | 'notice_board' | 'contact' | 'recruitment' | 'press_cms' | 'blog_cms' | 'database_cms'>('about_management');

  // Firestore DB status
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [noticesList, setNoticesList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activeNoticeSubTab, setActiveNoticeSubTab] = useState<'central' | 'event' | 'news' | 'today_desc'>('central');
  const [editingNoticeItem, setEditingNoticeItem] = useState<any | null>(null);
  
  // Blog CMS states
  const [blogPostsList, setBlogPostsList] = useState<any[]>([]);
  const [blogReviewsList, setBlogReviewsList] = useState<any[]>([]);
  const [activeBlogSubTab, setActiveBlogSubTab] = useState<'posts' | 'reviews'>('posts');
  const [editingBlogPost, setEditingBlogPost] = useState<any | null>(null);
  const [isSavingBlogPost, setIsSavingBlogPost] = useState<boolean>(false);
  
  // States for Today's Notice description block
  const [todayNoticeTitle, setTodayNoticeTitle] = useState<string>('');
  const [todayNoticeContent, setTodayNoticeContent] = useState<string>('');
  const [isSavingTodayNotice, setIsSavingTodayNotice] = useState<boolean>(false);
  
  // Recruitment (Niyog) Section CMS states
  const [circularsList, setCircularsList] = useState<any[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [editingCircular, setEditingCircular] = useState<any | null>(null);
  const [activeRecruitmentSubTab, setActiveRecruitmentSubTab] = useState<'circulars' | 'applications' | 'intro'>('circulars');
  
  const [loading, setLoading] = useState<boolean>(true);

  // Inquiries and Contact block states
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [activeInboxFilter, setActiveInboxFilter] = useState<'all' | 'book_fair' | 'mobile_library' | 'contact' | 'alor'>('all');
  const [contactInfoBlock, setContactInfoBlock] = useState<any>(null);

  // Contact Custom Cards States
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [isCardFormOpen, setIsCardFormOpen] = useState<boolean>(false);
  const [cardForm, setCardForm] = useState<any>({
    title_bn: '',
    title_en: '',
    desc_bn: '',
    desc_en: '',
    imgUrl: '',
    icon: '📍'
  });

  // Additional fine-grain widgets CMS states
  const [whoWeAreBlock, setWhoWeAreBlock] = useState<any>(null);
  const [infographicBlock, setInfographicBlock] = useState<any>(null);
  const [introBlock, setIntroBlock] = useState<any>(null);
  const [statsBlock, setStatsBlock] = useState<any>(null);
  const [founderBlock, setFounderBlock] = useState<any>(null);
  const [beliefBlock, setBeliefBlock] = useState<any>(null);
  const [ctaBlock, setCtaBlock] = useState<any>(null);
  const [portalsBlock, setPortalsBlock] = useState<any>(null);
  const [homepagePrograms, setHomepagePrograms] = useState<any[]>([]);
  const [galleryML, setGalleryML] = useState<any>(null);
  const [galleryRH, setGalleryRH] = useState<any>(null);
  const [galleryCL, setGalleryCL] = useState<any>(null);

  // Selected subblock in Tab 4
  const [activeSubBlock, setActiveSubBlock] = useState<'who_we_are' | 'founder' | 'infographic' | 'intro' | 'belief' | 'cta' | 'portals'>('who_we_are');
  // Selected gallery type in Tab 7
  const [activeGalleryType, setActiveGalleryType] = useState<'cl' | 'ml' | 'rh'>('cl');

  // Editing state
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingActivity, setEditingActivity] = useState<RecentActivity | null>(null);
  const [editingPage, setEditingPage] = useState<WebsitePage | null>(null);
  const [hasCustomMediaContact, setHasCustomMediaContact] = useState<boolean>(false);
  const [previewLanguage, setPreviewLanguage] = useState<'bn' | 'en' | null>(null);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<string>('');
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true); // Defaults to true once components snapshot successfully
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    message_bn: string;
    message_en: string;
    onConfirm: () => void;
  } | null>(null);

  const requireConfirmation = (message_bn: string, message_en: string, onConfirm: () => void) => {
    setConfirmModal({ message_bn, message_en, onConfirm });
  };

  // Resizer state modal trigger configuration
  const [resizerOpen, setResizerOpen] = useState<boolean>(false);
  const [resizerPreset, setResizerPreset] = useState<'banner' | 'landscape' | 'square' | 'portrait' | 'any'>('landscape');
  const [onResizerSave, setOnResizerSave] = useState<(resizedBase64: string) => void>(() => () => {});
  const [isDirectUploading, setIsDirectUploading] = useState<boolean>(false);

  const openImageResizer = (preset: 'banner' | 'landscape' | 'square' | 'portrait' | 'any', callback: (resizedUrl: string) => void) => {
    setResizerPreset(preset);
    setOnResizerSave(() => async (resizedBase64: string) => {
      try {
        const uploadedUrl = await uploadImageToServer(resizedBase64);
        callback(uploadedUrl || resizedBase64);
      } catch (_) {
        callback(resizedBase64);
      }
    });
    setResizerOpen(true);
  };

  // Direct 1-Click Image Uploader (Zero crop, full resolution 100% untouched)
  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (imgUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsDirectUploading(true);
      const serverUrl = await uploadImageToServer(file);
      if (serverUrl) {
        callback(serverUrl);
      } else {
        // Fallback convert to direct base64
        const reader = new FileReader();
        reader.onload = (evt) => {
          const b64 = evt.target?.result as string;
          if (b64) callback(b64);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Direct upload error:", err);
    } finally {
      setIsDirectUploading(false);
      e.target.value = '';
    }
  };

  // Track auth user state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Update isAuthenticated state if passcode was verified on client or auth is ready
  useEffect(() => {
    if (user && !user.isAnonymous) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(hasPasscode);
    }
  }, [hasPasscode, user]);

  // Sync and track whether a custom media_contact exists in Firestore
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(doc(db, 'homepage_blocks', 'media_contact'), (docSnap) => {
      setHasCustomMediaContact(docSnap.exists());
    }, (error) => {
      console.warn("Error checking media_contact existence in AdminCMS:", error);
    });
    return () => unsub();
  }, [isAuthenticated, db]);

  // Fetch Firestore content if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    // 1. Hero Slides
    const qHero = query(collection(db, 'hero_slides'), orderBy('order', 'asc'));
    const unsubHero = onSnapshot(qHero, (snapshot) => {
      const slides: HeroSlide[] = [];
      snapshot.forEach((doc) => {
        slides.push(doc.data() as HeroSlide);
      });
      setHeroSlides(slides);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hero_slides');
      setLoading(false);
    });

    // 2. Recent Activities
    const qAct = query(collection(db, 'recent_activities'), orderBy('order', 'asc'));
    const unsubAct = onSnapshot(qAct, (snapshot) => {
      const acts: RecentActivity[] = [];
      snapshot.forEach((doc) => {
        acts.push(doc.data() as RecentActivity);
      });
      setRecentActivities(acts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'recent_activities');
      setLoading(false);
    });

    // 3. Website Pages
    const unsubPages = onSnapshot(collection(db, 'website_pages'), (snapshot) => {
      const pgs: WebsitePage[] = [];
      snapshot.forEach((doc) => {
        pgs.push(doc.data() as WebsitePage);
      });
      // Merge with default websiteContentRaw so we always have all pages in state
      const mergedPages = (websiteContentRaw as any[]).map((defaultPage) => {
        const match = pgs.find(p => p.id === defaultPage.id);
        return match ? match : JSON.parse(JSON.stringify(defaultPage));
      });
      setPages(mergedPages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'website_pages');
      setLoading(false);
    });

    // 4. Homepage Blocks (CMS text config docs: who_we_are, infographic, intro_banner, statistics, founder, central_belief, cta_block, gallery_ml, gallery_rh, gallery_cl)
    const unsubBlocks = onSnapshot(collection(db, 'homepage_blocks'), (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id === 'who_we_are') setWhoWeAreBlock(data);
        else if (doc.id === 'infographic') setInfographicBlock(data);
        else if (doc.id === 'intro_banner') setIntroBlock(data);
        else if (doc.id === 'statistics') setStatsBlock(data);
        else if (doc.id === 'founder') setFounderBlock(data);
        else if (doc.id === 'central_belief') setBeliefBlock(data);
        else if (doc.id === 'cta_block') setCtaBlock(data);
        else if (doc.id === 'portals') setPortalsBlock(data);
        else if (doc.id === 'gallery_ml') setGalleryML(data);
        else if (doc.id === 'gallery_rh') setGalleryRH(data);
        else if (doc.id === 'gallery_cl') setGalleryCL(data);
      });
    }, (error) => {
      console.warn("Firestore homepage_blocks snapshot error:", error);
    });

    // 5. Homepage Central Slider Programs
    const qProgs = query(collection(db, 'homepage_programs'), orderBy('order', 'asc'));
    const unsubProgs = onSnapshot(qProgs, (snapshot) => {
      const progs: any[] = [];
      snapshot.forEach((doc) => {
        progs.push(doc.data());
      });
      setHomepagePrograms(progs);
    }, (error) => {
      console.warn("Firestore homepage_programs snapshot error:", error);
    });

    // 6. Notices (Admin Manager)
    const unsubNoticesAdmin = onSnapshot(collection(db, 'notices'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setNoticesList(list);
      setIsDbConnected(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notices');
    });

    // 7. Events (Admin Manager)
    const unsubEventsAdmin = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setEventsList(list);
      setIsDbConnected(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
    });

    // 8. News Items (Admin Manager)
    const unsubNewsAdmin = onSnapshot(collection(db, 'news_items'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setNewsList(list);
      setIsDbConnected(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'news_items');
    });

    // 9. Contact Info (Admin Manager)
    const unsubContactInfo = onSnapshot(doc(db, 'homepage_blocks', 'contact_info'), (docSnap) => {
      if (docSnap.exists()) {
        setContactInfoBlock(docSnap.data());
      }
    }, (error) => {
      console.warn("Firestore contact_info document error:", error);
    });

    // 10. Inquiries (Admin Manager)
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      // Sort descending by createdAt or fallback
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setInquiries(list);
    }, (error) => {
      console.warn("Firestore inquiries snapshot error:", error);
    });

    // 11. Recruitment Circulars (Admin Manager)
    const unsubCircularsAdmin = onSnapshot(collection(db, 'recruitment_circulars'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setCircularsList(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'recruitment_circulars');
    });

    // 12. Job Applications (Admin Manager)
    const unsubApplicationsAdmin = onSnapshot(collection(db, 'job_applications'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      // Sort descending by createdAt
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setApplicationsList(list);
    }, (error) => {
      console.warn("Firestore job_applications snapshot error:", error);
    });

    // 13. Blog Posts (Admin Manager)
    const unsubBlogPostsAdmin = onSnapshot(collection(db, 'blog_posts'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setBlogPostsList(list);
    }, (error) => {
      console.warn("Firestore blog_posts snapshot error in AdminCMS:", error);
    });

    // 14. Blog Reviews (Admin Manager)
    const unsubBlogReviewsAdmin = onSnapshot(collection(db, 'blog_reviews'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setBlogReviewsList(list);
    }, (error) => {
      console.warn("Firestore blog_reviews snapshot error in AdminCMS:", error);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubHero();
      unsubAct();
      unsubPages();
      unsubBlocks();
      unsubProgs();
      unsubNoticesAdmin();
      unsubEventsAdmin();
      unsubNewsAdmin();
      unsubContactInfo();
      unsubInquiries();
      unsubCircularsAdmin();
      unsubApplicationsAdmin();
      unsubBlogPostsAdmin();
      unsubBlogReviewsAdmin();
    };
  }, [isAuthenticated]);

  // Synchronize Today's Notice states from fetched website pages
  useEffect(() => {
    const noticePage = pages.find(p => p.id === 'notice');
    if (noticePage && noticePage.sections && noticePage.sections[0]) {
      setTodayNoticeTitle(noticePage.sections[0].title || 'আজকের নোটিশ ও ঘোষণা');
      setTodayNoticeContent(noticePage.sections[0].content?.[0] || '');
    }
  }, [pages]);

  // Handle Sign In with PIN and authenticate against server
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    try {
      const result = await verifyAdminCredentials({ passcode });
      if (result.success) {
        setHasPasscode(true);
      } else {
        setErrorMsg(result.error || (language === 'bn' ? 'ভুল পিন নম্বর! আবার চেষ্টা করুন।' : 'Incorrect Pin! Please try again.'));
      }
    } catch (err: any) {
      setErrorMsg(language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Google sign in helper
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      setActionStatus(
        language === 'bn'
          ? `গুগল দিয়ে সফলভাবে লগইন হয়েছে! হ্যালো, ${result.user.displayName || result.user.email}`
          : `Signed in successfully via Google! Welcome, ${result.user.displayName || result.user.email}`
      );
      setTimeout(() => setActionStatus(''), 4000);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg(
          language === 'bn'
            ? 'সাইন-ইন উইন্ডোটি বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'The sign-in window was closed before completion. Please try again.'
        );
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg(
          language === 'bn'
            ? 'আপনার ব্রাউজারে পপ-আপ ব্লক করা আছে। অনুগ্রহ করে পপ-আপ সক্রিয় করে আবার চেষ্টা করুন।'
            : 'Popups are blocked by your browser. Please allow popups and try again.'
        );
      } else {
        setErrorMsg(
          language === 'bn'
            ? `গুগল সাইন-ইন ব্যর্থ হয়েছে: ${err.message}`
            : `Google Sign-in failed: ${err.message}`
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    try {
      sessionStorage.removeItem('bsk_admin_passcode_verified');
    } catch (_) {}
    setHasPasscode(false);
    setPasscode('');
  };

  // Convert uploaded image file to lightweight Base64 string for Firestore representation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'activity') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (type === 'hero' && editingHero) {
        setEditingHero({ ...editingHero, bgImage: finalUrl });
      } else if (type === 'activity' && editingActivity) {
        setEditingActivity({ ...editingActivity, image: finalUrl });
      }
      setPreviewImage(finalUrl);
    } catch (err) {
      console.error("Image upload failed: ", err);
    }
  };

  // Default hardcoded initializers in case user desires to bootstrap or soft reset
  const defaultHeroSlides: HeroSlide[] = [
    {
      id: "slide-1",
      badge_bn: "৪৬ বছরের আলোকযাত্রা",
      badge_en: "46 Years of Enlightenment",
      title_bn: "আলোকিত মানুষ গড়ার ৪৬ বছরের অঙ্গীকার",
      title_en: "Building Humane, Complete Minds Since 1978",
      desc_bn: "চিত্ত বিকাশের এক মহতী দেশব্যাপী আন্দোলন।",
      desc_en: "A national movement cultivating minds and values.",
      bgImage: "/assets/IMGS/481260669_1052017186949762_8260665744101041376_n.jpg",
      order: 1
    },
    {
      id: "slide-2",
      badge_bn: "ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম",
      badge_en: "Mobile Library Network",
      title_bn: "বই নিয়ে মানুষের দোরগোড়ায় ভ্রাম্যমাণ লাইব্রেরি",
      title_en: "Taking Books to the Doorsteps of Millions",
      desc_bn: "৩৬০টি উপজেলায় ৩ লক্ষাধিক পাঠকের ঘরে আলো ছড়ানো।",
      desc_en: "Reaching over 300,000 members across 64 districts.",
      bgImage: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      order: 2
    },
    {
      id: "slide-3",
      badge_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম",
      badge_en: "National Excellence Program",
      title_bn: "কৈশোর ও যৌবনে বইপড়ার আনন্দ ও মনন চর্চা",
      title_en: "Cultivating Reading and Excellence in Youth",
      desc_bn: "সৃজনশীল বই পাঠের দেশব্যাপী উৎসাহ প্রদান।",
      desc_en: "Instilling deep interest and analytical thinking in students.",
      bgImage: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
      order: 3
    },
    {
      id: "slide-4",
      badge_bn: "আলোর ইशকুল সেমিনার",
      badge_en: "Aalor Ishkool Seminars",
      title_bn: "ধ্রুপদী চিন্তা ও মননচর্চার মিলনমেলা",
      title_en: "Enlightened Seminar Circles and Cultural Growth",
      desc_bn: "সাহিত্য, কবিতা ও দর্শনের এক মুক্ত মঞ্চ।",
      desc_en: "A nurturing hub of intellectual and cultural seminars.",
      bgImage: "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg",
      order: 4
    }
  ];

  const defaultRecentActivities: RecentActivity[] = [
    {
      id: "act-1",
      title_bn: "উপদেশীয় ধ্রুপদী সঙ্গীত বক্তৃতামালা-২ ( Classical Music Appreciation)",
      title_en: "Sub-Continental Classical Music Appreciation Lectures - Session 2",
      desc_bn: "উপদেশের ধ্রুপদী সঙ্গীত বিষয়ক বিশেষ বক্তৃতামালা ও সঙ্গীতানুষ্ঠান।",
      desc_en: "Special lecture and recital on classical music styles at the main auditorium.",
      date_bn: "৪ অক্টোবর ২০২৪",
      date_en: "Oct 4, 2024",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন, ঢাকা",
      loc_en: "BSK Auditorium, Dhaka",
      category_bn: "আলোর ইشকুল",
      category_en: "Aalor Ishkool",
      image: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg",
      order: 1
    },
    {
      id: "act-2",
      title_bn: "আলোর ইশকুল — পশ্চিমের রবি বিশেষ সন্ধ্যা অনুষ্ঠান",
      title_en: "Aalor Ishkool presents: Rabindranath Tagore Evening Session",
      desc_bn: "রবীন্দ্রনাথ ঠাকুরের পশ্চিমী প্রভাব ও বিশ্ববীক্ষা নিয়ে তাত্ত্বিক আলোচনা সন্ধ্যা।",
      desc_en: "Exploring Tagorian literature and Western echoes in Tagore's creations.",
      date_bn: "২৫ ডিসেম্বর ২০২৩",
      date_en: "Dec 25, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Auditorium",
      category_bn: "সংস্কৃতি ও উৎসব",
      category_en: "Culture",
      image: "/assets/IMGS/493907913_1088721076612706_7469814680062640482_n.jpg",
      order: 2
    },
    {
      id: "act-3",
      title_bn: "৬৪ জেলায় ৩১ লক্ষ নির্বাচিত বই বিতরণ ও উৎসব",
      title_en: "3.1 Million Selective Books Distributed Across 64 Districts",
      desc_bn: "৩০০ উপজেলার ১৫ হাজার শিক্ষাপ্রতিষ্ঠানে বই বিতরণ কার্যক্রম সম্পন্ন।",
      desc_en: "Books distribution festival completed across 15,000 schools.",
      date_bn: "৩ ডিসেম্বর ২০২৩",
      date_en: "Dec 3, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK HQ Premises",
      category_bn: "বই বিতরণ",
      category_en: "Distribution",
      image: "/assets/IMGS/534826832_1175889297895883_7988975073499309288_n.jpg",
      order: 3
    }
  ];

  // Check DB Connection manually
  const checkDbConnection = async () => {
    setCheckingDb(true);
    setActionStatus(language === 'bn' ? 'ডাটাবেস কানেকশন পরীক্ষা করা হচ্ছে...' : 'Testing database connection...');
    try {
      const testCol = collection(db, 'website_pages');
      await getDocs(testCol);
      setIsDbConnected(true);
      setActionStatus(language === 'bn' ? 'সফল! ডাটাবেস সম্পূর্ণ সচল এবং সংযুক্ত রয়েছে। 🟢' : 'Success! Database is active and connected. 🟢');
    } catch (error) {
      console.error("Database connection error:", error);
      setIsDbConnected(false);
      setActionStatus(language === 'bn' ? 'ত্রুটি! ডাটাবেস সংযোগে সমস্যা পাওয়া গিয়েছে। 🔴' : 'Error! Database connection failure. 🔴');
    } finally {
      setCheckingDb(false);
      setTimeout(() => setActionStatus(''), 5000);
    }
  };

  // Bootstrap Database
  const handleBootstrapDB = async () => {
    requireConfirmation(
      'আপনি কি ডেমো ডাটা দিয়ে ডাটাবেজ চালু করতে চান?',
      'Do you want to initialize the database with standard default BSK data?',
      async () => {
        setActionStatus(language === 'bn' ? 'ডাটাবেস লোড হচ্ছে...' : 'Initializing BSK Database...');
        try {
          // Seed Hero Slides
          for (const slide of defaultHeroSlides) {
            await setDoc(doc(db, 'hero_slides', slide.id), slide);
          }
          // Seed Recent Activities
          for (const act of defaultRecentActivities) {
            await setDoc(doc(db, 'recent_activities', act.id), act);
          }
          
          // Seed Website Pages
          if (websiteContentRaw && Array.isArray(websiteContentRaw)) {
            for (const page of websiteContentRaw) {
              await setDoc(doc(db, 'website_pages', page.id), page);
            }
          }

          // Seed Default Programs
          const defaultProgs = [
            {
              id: 'nationwide-excellence', route: 'nationwide-excellence', title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম', title_en: 'Nationwide Excellence Program',
              desc_bn: '৬৪ জেলায় দেশভিত্তিক সাহিত্য মূল্যায়ন ও বইপড়া আন্দোলন।', desc_en: 'Countrywide elite reading evaluation & movement.',
              tag_bn: '৬৪ জেলা', tag_en: '64 Districts',
              colorClass: 'bg-[#8B3A1E] text-orange-100', icon: 'Award',
              bgImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80', order: 1
            },
            {
              id: 'mobile-library', route: 'mobile-library', title_bn: 'ভ্রাম্যমাণ লাইব্রেরি', title_en: 'Mobile Library Network',
              desc_bn: '৪০০০+ স্কুল ও লোকালয়ে চলমান দ্বীপ্ত লাইব্রেরি।', desc_en: 'Reaching 4,000+ local centers via mobile units.',
              tag_bn: '৪০০০+ স্কুল', tag_en: '4,000+ Schools',
              colorClass: 'bg-[#2E5942] text-emerald-100', icon: 'Truck',
              bgImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80', order: 2
            },
            {
              id: 'reading-habit', route: 'reading-habit', title_bn: 'পাঠাভ্যাস উন্নয়ন', title_en: 'Reading Habit Program',
              desc_bn: 'শিক্ষা প্রতিষ্ঠানে নিয়মিত বই পড়ার অভ্যাস ও পুরষ্কার।', desc_en: 'Institutional reading encouragement and prizes.',
              tag_bn: 'কর্মসূচি', tag_en: 'Program',
              colorClass: 'bg-[#1E4A6B] text-sky-100', icon: 'BookOpen',
              bgImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', order: 3
            },
            {
              id: 'book-fair', route: 'book-fair', title_bn: 'ভ্রাম্যমাণ বইমেলা', title_en: 'Mobile Book Fair',
              desc_bn: 'সারাদেশে ভ্রাম্যমাণ বইমেলা আয়োজন ও মানসম্মত গ্রন্থ প্রদর্শনী।', desc_en: 'Nationwide mobile book fair events & exhibitions.',
              tag_bn: 'বাৎসরিক', tag_en: 'Annual',
              colorClass: 'bg-[#2E5942] text-emerald-100', icon: 'BookOpen',
              bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', order: 4
            },
            {
              id: 'aalor-ishkool', route: 'aalor-ishkool', title_bn: 'আলোর ইশকুল', title_en: 'Aalor Ishkool',
              desc_bn: 'উচ্চতর মননশীলতা ও সাংস্কৃতিক বোধের স্কুল।', desc_en: 'Advanced mindset and cultural growth seminars.',
              tag_bn: 'সক্রিয়', tag_en: 'Active',
              colorClass: 'bg-[#3D2B14] text-[#F0CC7A]', icon: 'Sparkles',
              bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80', order: 5
            },
            {
              id: 'aalor-pathshala', route: 'aalor-pathshala', title_bn: 'আলোর পাঠশালা', title_en: 'Aalor Pathshala',
              desc_bn: 'সুবিধাবঞ্চিত এলাকায় কমিউনিটি লার্নিং সেন্টার।', desc_en: 'Empowering underprivileged student sectors.',
              tag_bn: 'নতুন', tag_en: 'New',
              colorClass: 'bg-[#6B5A1E] text-amber-100', icon: 'SchoolIcon',
              bgImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80', order: 6
            },
            {
              id: 'bangalir_chinta', route: 'bangalir_chinta', title_bn: 'বাঙালির চিন্তা', title_en: 'Bangalir Chinta',
              desc_bn: 'বাঙালি মনীষীদের শ্রেষ্ঠ মননশীল ও চিন্তামূলক প্রবন্ধের সংকলন প্রকাশ কর্মসূচি।', desc_en: 'Selected historical and philosophical works and thoughts of Bengal giants.',
              tag_bn: 'ঐতিহাসিক', tag_en: 'Historical',
              colorClass: 'bg-[#553E2A] text-orange-100', icon: 'BookOpenCheck',
              bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80', order: 7
            },
            {
              id: 'primary-teacher', route: 'primary-teacher', title_bn: 'প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি', title_en: 'Primary Teachers Reading Program',
              desc_bn: 'প্রাথমিক ও মাধ্যমিক শিক্ষকদের বইপড়া কৃষ্টি।', desc_en: 'Enhancement materials for elementary educators.',
              tag_bn: 'শিক্ষক উন্নয়ন', tag_en: 'Teachers',
              colorClass: 'bg-[#213547] text-slate-100', icon: 'PenTool',
              bgImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80', order: 8
            },
            {
              id: 'publication', route: 'publication', title_bn: 'প্রকাশনা কার্যক্রম', title_en: 'Publications',
              desc_bn: 'ধ্রুপদী ও নোবেলবিজয়ী বিশ্বসাহিত্যের উচ্চমানের বাংলা অনুবাদ প্রকাশনা।', desc_en: 'Acclaimed publications of world classics and Bangla translations.',
              tag_bn: '১০০০+ বই', tag_en: '1000+ Books',
              colorClass: 'bg-[#4A3B32] text-amber-100', icon: 'BookOpen',
              bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', order: 9
            }
          ];
          for (const p of defaultProgs) {
            await setDoc(doc(db, 'homepage_programs', p.id), p);
          }

          // Seed Default Notices
          const defaultNotices = [
            {
              id: "notice-1",
              title_bn: "একাদশ ও দ্বাদশ শ্রেণীর দেশভিত্তিক বইপড়া কর্মসূচির ফরম সংগ্রহ ও জমাদান",
              title_en: "Enrollment Forms Collection for College Level Reading Program",
              isUrgent: true,
              isNew: true,
              date_bn: "৩০ সেপ্টেম্বর ২০২৪",
              date_en: "Sep 30, 2024"
            },
            {
              id: "notice-2",
              title_bn: "কেন্দ্রীয় লাইব্রেরি সদস্যপদের বার্ষিক ফি পরিশোধের সময়সীমা বৃদ্ধি",
              title_en: "Extension of BSK HQ Central Library Annual Membership Fee Deadline",
              isUrgent: false,
              isNew: true,
              date_bn: "১৫ সেপ্টেম্বর ২০২৪",
              date_en: "Sep 15, 2024"
            }
          ];
          for (const notice of defaultNotices) {
            await setDoc(doc(db, 'notices', notice.id), notice);
          }

          // Seed Default Events
          const defaultEvents = [
            {
              id: "event-1",
              day: "০৪",
              dayEn: "04",
              month: "অক্টোবর",
              monthEn: "OCT",
              chip_bn: "সঙ্গীত",
              chip_en: "Music",
              title_bn: "উপমহাদেশীয় ধ্রুপদী সঙ্গীত বক্তৃতামালা - ২",
              title_en: "Classical Music Appreciation Lecture Series - Session 2",
              time_bn: "সন্ধ্যা ৬:০০ টা",
              time_en: "6:00 PM",
              loc_bn: "কেন্দ্রীয় মিলনায়তন, ঢাকা",
              loc_en: "Central Auditorium, Dhaka"
            },
            {
              id: "event-2",
              day: "২৫",
              dayEn: "25",
              month: "ডিসেম্বর",
              monthEn: "DEC",
              chip_bn: "আলোচনা",
              chip_en: "Discussion",
              title_bn: "আলোর ইশকুল: পশ্চিমের রবি বিশেষ সন্ধ্যা",
              title_en: "Aalor Ishkool: Rabindranath Tagore Evening Session",
              time_bn: "সন্ধ্যা ৫:৩০ মিনিট",
              time_en: "5:30 PM",
              loc_bn: "মিলনায়তন, বাংলামোটর",
              loc_en: "Auditorium, Banglamotor"
            }
          ];
          for (const ev of defaultEvents) {
            await setDoc(doc(db, 'events', ev.id), ev);
          }

          // Seed Default News Items
          const defaultNewsItems = [
            {
              id: "news-1",
              icon: "📢",
              tag_bn: "সংবাদ",
              tag_en: "News",
              date_bn: "৪ অক্টোবর ২০২৪",
              date_en: "Oct 4, 2024",
              title_bn: "আসন্ন শুক্রবার আলোর ইশকুলের সেমিনার ও ধ্রুপদী বক্তৃতামালা",
              title_en: "Aalor Ishkool: Sub-Continental Music Appreciation Lecture This Friday"
            },
            {
              id: "news-2",
              icon: "🏆",
              tag_bn: "পুরস্কার",
              tag_en: "Award",
              date_bn: "৩ ডিসেম্বর ২০২৩",
              date_en: "Dec 3, 2023",
              title_bn: "দেশব্যাপী ৩১ লক্ষ বই বিতরণ উৎসব সফলভাবে সম্পন্ন",
              title_en: "3.1 Million Selective Books Successfully Distributed Across 64 Districts"
            }
          ];
          for (const news of defaultNewsItems) {
            await setDoc(doc(db, 'news_items', news.id), news);
          }

          // Seed Default Contact Info (homepage_blocks)
          await setDoc(doc(db, 'homepage_blocks', 'contact_info'), {
            address_bn: "বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।",
            address_en: "Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.",
            phones: "+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১",
            emails: "bskbd@live.com, info@bskbd.org",
            hours_bn: "খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)",
            hours_en: "Hours: 9:00 AM - 5:00 PM (Closed Fridays)",
            cards: []
          });

          // Seed Default Press Release (press)
          await setDoc(doc(db, 'press', 'press-1'), {
            id: "press-1",
            title_bn: "বিশ্বসাহিত্য কেন্দ্রের সুবর্ণ জয়ন্তী উদযাপিত",
            title_en: "BSK Celebrates Golden Jubilee",
            summary: "সুবর্ণ জয়ন্তী উপলক্ষে বিশেষ সাহিত্য সেমিনার অনুষ্ঠিত হয়েছে।",
            content: "ঢাকা ও দেশজুড়ে ব্যাপক উৎসাহের সাথে বিশ্বসাহিত্য কেন্দ্রের ৫০ বছর পূর্তি এবং সুবর্ণ জয়ন্তী উদযাপিত হয়েছে।",
            coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
            pdf: "",
            category: "Press Release",
            publishedDate: "2024-09-04",
            author: "বিএসকে মিডিয়া সেল",
            status: "published",
            mediaSource: "দৈনিক প্রথম আলো",
            newsUrl: "",
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Seed Default Photo Album (photo_albums)
          await setDoc(doc(db, 'photo_albums', 'album-1'), {
            id: "album-1",
            name_bn: "ভ্রাম্যমাণ বইমেলা কার্যক্রম ২০২৪",
            name_en: "Mobile Book Fair Activity 2024",
            desc_bn: "ভ্রাম্যমাণ বইমেলা কার্যক্রমের কিছু খণ্ডচিত্র",
            desc_en: "Glimpses of mobile library book distribution events",
            cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80",
            photos: [
              "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80"
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Seed Default Recruitment Circular (recruitment_circulars)
          await setDoc(doc(db, 'recruitment_circulars', 'circular-1'), {
            id: "circular-1",
            title_bn: "সহকারী লাইব্রেরিয়ান নিয়োগ বিজ্ঞপ্তি",
            title_en: "Assistant Librarian Recruitment Circular",
            position_bn: "সহকারী লাইব্রেরিয়ান",
            position_en: "Assistant Librarian",
            dept_bn: "ভ্রাম্যমাণ লাইব্রেরি বিভাগ",
            dept_en: "Mobile Library Department",
            deadline_bn: "১৫ অক্টোবর ২০২৪",
            deadline_en: "October 15, 2024",
            desc_bn: "বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরি কার্যক্রমে সহকারী লাইব্রেরিয়ান পদে আগ্রহী প্রার্থীদের নিকট থেকে দরখাস্ত আহ্বান করা হচ্ছে।",
            desc_en: "Applications are invited from eligible candidates for the post of Assistant Librarian in the BSK Mobile Library program.",
            status: "active",
            fileUrl: "",
            fileType: "",
            fileName: "",
            applyUrl: "",
            applyFileUrl: "",
            applyFileName: ""
          });

          // Seed Default Job Application (job_applications)
          await setDoc(doc(db, 'job_applications', 'app-1'), {
            id: "app-1",
            name: "মাহমুদ হাসান",
            email: "mahmud.h@example.com",
            phone: "০১৭০০০০০০০০",
            coverLetter: "আমি সহকারী লাইব্রেরিয়ান পদের জন্য আবেদন করছি।",
            resumeUrl: "",
            resumeType: "",
            resumeName: "",
            circularId: "circular-1",
            jobTitleBn: "সহকারী লাইব্রেরিয়ান",
            jobTitleEn: "Assistant Librarian",
            createdAt: new Date()
          });

          // Seed Default Inquiry (inquiries)
          await setDoc(doc(db, 'inquiries', 'inq-1'), {
            id: "inq-1",
            name: "আব্দুর রহমান",
            email: "arahman@example.com",
            message: "ভ্রাম্যমাণ লাইব্রেরির সদস্য কীভাবে হওয়া যায়?",
            type: "contact",
            createdAt: new Date()
          });

          setActionStatus(language === 'bn' ? 'ডাটাবেস সফলভাবে প্রস্তুত হয়েছে !' : 'Database successfully seeded!');
          setTimeout(() => setActionStatus(''), 2500);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'bootstrap');
          setActionStatus(language === 'bn' ? 'ডাটাবেস সেটআপে ত্রুটি হয়েছে! অনুগ্রহ করে আবার চেষ্টা করুন বা সিকিউরিটি রুল চেক করুন।' : 'Error setting up database! Please retry or verify security rules.');
          setTimeout(() => setActionStatus(''), 6000);
        }
      }
    );
  };

  // Hero slide CRUD
  const saveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero) return;
    try {
      setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Slide...');
      await setDoc(doc(db, 'hero_slides', editingHero.id), editingHero);
      setEditingHero(null);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Saved Successfully!');
      setTimeout(() => setActionStatus(''), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `hero_slides/${editingHero.id}`);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    requireConfirmation(
      'এই ব্যানার স্লাইডটি ডিলিট করতে চান?',
      'Are you sure you want to delete this slide?',
      async () => {
        try {
          await deleteDoc(doc(db, 'hero_slides', id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `hero_slides/${id}`);
        }
      }
    );
  };

  const createNewHero = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: HeroSlide = {
      id: newId,
      badge_bn: 'নতুন আপডেট',
      badge_en: 'New Announcement',
      title_bn: 'নতুন ব্যানার শিরোনাম',
      title_en: 'New Slide Title',
      desc_bn: 'দেশব্যাপী বড় বইপড়া আন্দোলন',
      desc_en: 'National reading circles program development',
      bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80',
      order: heroSlides.length + 1
    };
    setEditingHero(newSlide);
    setPreviewImage(newSlide.bgImage);
  };

  // Recent activity CRUD
  const saveRecentActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    try {
      setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Activity...');
      await setDoc(doc(db, 'recent_activities', editingActivity.id), editingActivity);
      setEditingActivity(null);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Activity Saved Successfully!');
      setTimeout(() => setActionStatus(''), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `recent_activities/${editingActivity.id}`);
    }
  };

  const deleteRecentActivity = async (id: string) => {
    requireConfirmation(
      'এই কার্যক্রমটি মুছে ফেলতে চান?',
      'Are you sure you want to delete this activity?',
      async () => {
        try {
          await deleteDoc(doc(db, 'recent_activities', id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `recent_activities/${id}`);
        }
      }
    );
  };

  const createNewActivity = () => {
    const newId = `act-${Date.now()}`;
    const newAct: RecentActivity = {
      id: newId,
      title_bn: 'নতুন কার্যক্রমের নাম',
      title_en: 'New Activity Title',
      desc_bn: 'সংক্ষিপ্ত বিবরণী এখানে লিখুন।',
      desc_en: 'Brief description goes here.',
      date_bn: '১১ জুন ২০২৬',
      date_en: 'June 11, 2526',
      loc_bn: 'বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা',
      loc_en: 'BSK Premises, Dhaka',
      category_bn: 'কার্যক্রম',
      category_en: 'Program',
      caption_bn: '',
      caption_en: '',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      order: recentActivities.length + 1
    };
    setEditingActivity(newAct);
    setPreviewImage(newAct.image);
  };

  // Website Page Overrides CRUD
  const savePageOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      setSaving(true);
      setActionStatus(language === 'bn' ? 'পৃষ্ঠা সংরক্ষণ করা হচ্ছে...' : 'Saving Page...');
      const cleanedPage = removeUndefinedFields(editingPage);

      if (cleanedPage.id === 'press_contact') {
        // Save custom media contact block data to homepage_blocks/media_contact
        await setDoc(doc(db, 'homepage_blocks', 'media_contact'), cleanedPage.mediaContactData || {});
        await cpanelApi.setDoc('homepage_blocks', 'media_contact', cleanedPage.mediaContactData || {});
        window.dispatchEvent(new CustomEvent('bsk_db_updated', { detail: { collection: 'homepage_blocks' } }));
      } else {
        await setDoc(doc(db, 'website_pages', cleanedPage.id), cleanedPage);
        await cpanelApi.setDoc('website_pages', cleanedPage.id, cleanedPage);
        window.dispatchEvent(new CustomEvent('bsk_db_updated', { detail: { collection: 'website_pages' } }));
      }
      setPages(prevPages => {
        const idx = prevPages.findIndex(p => p.id === cleanedPage.id);
        if (idx >= 0) {
          const next = [...prevPages];
          next[idx] = cleanedPage;
          return next;
        }
        return [...prevPages, cleanedPage];
      });
      setEditingPage(null);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Page Override Saved!');
      setTimeout(() => setActionStatus(''), 3000);
    } catch (e: any) {
      console.error("Save Page Error:", e);
      const userErrMsg = e?.message || (language === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে!' : 'Failed to save page!');
      setActionStatus(`❌ ${userErrMsg}`);
      setTimeout(() => setActionStatus(''), 6000);
      handleFirestoreError(e, OperationType.WRITE, editingPage.id === 'press_contact' ? 'homepage_blocks/media_contact' : `website_pages/${editingPage.id}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper to dynamically modify a section name/paragraphs in state
  const updateSectionText = (secIndex: number, textIndex: number, value: string) => {
    if (!editingPage) return;
    const updatedSections = [...editingPage.sections];
    updatedSections[secIndex].content[textIndex] = value;
    setEditingPage({ ...editingPage, sections: updatedSections });
  };

  const handleSectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, secIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        const updatedSections = [...editingPage.sections];
        updatedSections[secIdx].image = finalUrl;
        setEditingPage({ ...editingPage, sections: updatedSections });
      }
    } catch (err) {
      console.error("Section image upload failed: ", err);
    }
  };

  // Helper to handle custom fields for home page
  const handleHomeFieldChange = (field: string, value: any) => {
    if (!editingPage) return;
    setEditingPage({ ...editingPage, [field]: value });
  };

  const handleHomeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'intro_image' | 'history_image' | 'achievements_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        setEditingPage({ ...editingPage, [field]: finalUrl });
      }
    } catch (err) {
      console.error("Home image upload failed: ", err);
    }
  };

  const handleFounderAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        setEditingPage({ ...editingPage, founder_avatar: finalUrl });
      }
    } catch (err) {
      console.error("Founder avatar upload failed: ", err);
    }
  };

  const handleExcellenceHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        setEditingPage({ ...editingPage, hero_image: finalUrl });
      }
    } catch (err) {
      console.error("Hero image upload failed: ", err);
    }
  };

  const handleExcellenceHighlightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        const hls = [...(editingPage.highlights || [])];
        if (hls[idx]) {
          hls[idx].image = finalUrl;
          setEditingPage({ ...editingPage, highlights: hls });
        }
      }
    } catch (err) {
      console.error("Highlight image upload failed: ", err);
    }
  };

  const handleExcellenceGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        const gal = [...(editingPage.excellence_gallery || [])];
        if (gal[idx]) {
          gal[idx].image = finalUrl;
          setEditingPage({ ...editingPage, excellence_gallery: gal });
        }
      }
    } catch (err) {
      console.error("Gallery image upload failed: ", err);
    }
  };

  const handleExcellenceSideGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (editingPage) {
        const gal = [...(editingPage.side_mini_gallery || [])];
        if (gal[idx]) {
          gal[idx].image = finalUrl;
          setEditingPage({ ...editingPage, side_mini_gallery: gal });
        }
      }
    } catch (err) {
      console.error("Side mini gallery image upload failed: ", err);
    }
  };

  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    galleryName: 'mission_gallery' | 'history_gallery' | 'achievements_gallery',
    itemIdx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (!editingPage) return;
      const currentGallery = [...(editingPage[galleryName] || [])];
      if (currentGallery[itemIdx]) {
        currentGallery[itemIdx] = {
          ...currentGallery[itemIdx],
          image: finalUrl
        };
        setEditingPage({ ...editingPage, [galleryName]: currentGallery });
      }
    } catch (err) {
      console.error("Gallery image upload failed: ", err);
    }
  };

  const handleExtraSectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, extIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file);
      if (!editingPage) return;
      const currentExtras = [...(editingPage.extra_sections || [])];
      if (currentExtras[extIdx]) {
        currentExtras[extIdx] = {
          ...currentExtras[extIdx],
          image: finalUrl
        };
        setEditingPage({ ...editingPage, extra_sections: currentExtras });
      }
    } catch (err) {
      console.error("Extra section image upload failed: ", err);
    }
  };

  const handleBookFairGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || await compressImage(file, 600, 600, 0.55);
      const currentGallery = [...(editingPage.gallery || [])];
      while (currentGallery.length <= idx) {
        currentGallery.push({ image: '', caption_bn: 'স্মরণীয় মুহূর্ত', caption_en: 'Memorable Moment' });
      }
      currentGallery[idx] = {
        ...currentGallery[idx],
        image: finalUrl
      };
      setEditingPage({ ...editingPage, gallery: currentGallery });
    } catch (err) {
      console.error("Book fair gallery image upload failed: ", err);
    }
    e.target.value = '';
  };

  const handleBookFairDownloadFileUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dls = [...(editingPage.downloads || [])];
      if (dls[idx]) {
        dls[idx] = {
          ...dls[idx],
          url: event.target?.result as string,
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB (${file.name.split('.').pop()?.toUpperCase()})`
        };
        setEditingPage({ ...editingPage, downloads: dls });
      }
    };
    reader.readAsDataURL(file);
  };

  // Save specific block document in homepage_blocks
  const saveHomepageBlock = async (docId: string, data: any) => {
    try {
      setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving changes...');
      await setDoc(doc(db, 'homepage_blocks', docId), data);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Saved Successfully!');
      setTimeout(() => setActionStatus(''), 2000);
    } catch (e) {
      console.error("Error saving block doc:", docId, e);
      alert(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে।' : 'Error saving to database.');
    }
  };

  // Programs Slider CRUD
  const saveProgramRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Program...');
      const cleanProg = removeUndefinedFields(editingProgram);
      await setDoc(doc(db, 'homepage_programs', cleanProg.id), cleanProg);
      await cpanelApi.setDoc('homepage_programs', cleanProg.id, cleanProg);
      setHomepagePrograms(prev => {
        const idx = (prev || []).findIndex(p => p.id === cleanProg.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = cleanProg;
          return next;
        }
        return [...(prev || []), cleanProg];
      });
      window.dispatchEvent(new CustomEvent('bsk_db_updated', { detail: { collection: 'homepage_programs' } }));
      setEditingProgram(null);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Program Saved Successfully!');
      setTimeout(() => setActionStatus(''), 2000);
    } catch (e) {
      console.error("Error saving program:", e);
      alert(language === 'bn' ? 'সংরক্ষণে সমস্যা হয়েছে।' : 'Error writing program to database.');
    }
  };

  const deleteProgramRecord = async (id: string) => {
    requireConfirmation(
      'এই কার্যক্রমটি স্থায়ীভাবে মুছে ফেলতে চান?',
      'Are you sure you want to delete this program from slider?',
      async () => {
        try {
          await deleteDoc(doc(db, 'homepage_programs', id));
          await cpanelApi.deleteDoc('homepage_programs', id);
          setHomepagePrograms(prev => (prev || []).filter(p => p.id !== id));
          window.dispatchEvent(new CustomEvent('bsk_db_updated', { detail: { collection: 'homepage_programs' } }));
          setActionStatus(language === 'bn' ? 'সফলভাবে মুছে ফেলা হয়েছে!' : 'Deleted successfully!');
          setTimeout(() => setActionStatus(''), 2000);
        } catch (e) {
          console.error("Error deleting program:", e);
        }
      }
    );
  };

  const createNewProgram = () => {
    const newId = `prog-${Date.now()}`;
    const newProg = {
      id: newId,
      title_bn: 'নতুন কার্যক্রম',
      title_en: 'New Program Title',
      desc_bn: 'সংক্ষিপ্ত বিবরণ বিবরণী এখানে লিখুন।',
      desc_en: 'Write program detail here.',
      tag_bn: 'সক্রিয়',
      tag_en: 'Active',
      colorClass: 'bg-[#3D2B14] text-[#F0CC7A]', 
      icon: 'Sparkles', 
      bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      order: homepagePrograms.length + 1
    };
    setEditingProgram(newProg);
    setPreviewImage(newProg.bgImage);
  };

  // --- MODULE 9 Notice Board CRUD ---
  const saveTodayNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTodayNotice(true);
      setActionStatus(language === 'bn' ? 'আজকের নোটিশ সংরক্ষণ করা হচ্ছে...' : "Saving Today's Notice...");
      
      const noticePage = pages.find(p => p.id === 'notice');
      if (!noticePage) {
        throw new Error('Notice page configuration not found.');
      }
      
      const updatedSections = [...(noticePage.sections || [])];
      if (!updatedSections[0]) {
        updatedSections[0] = {
          title: todayNoticeTitle,
          content: [todayNoticeContent]
        };
      } else {
        updatedSections[0] = {
          ...updatedSections[0],
          title: todayNoticeTitle,
          content: [todayNoticeContent]
        };
      }
      
      const updatedPage = {
        ...noticePage,
        sections: updatedSections,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'website_pages', 'notice'), updatedPage);
      setActionStatus('');
      alert(language === 'bn' ? 'সফলভাবে আজকের নোটিশ সংরক্ষণ করা হয়েছে!' : "Today's Notice saved successfully!");
    } catch (err: any) {
      console.error(err);
      setActionStatus('Error saving notice');
      alert('Error: ' + err.message);
    } finally {
      setIsSavingTodayNotice(false);
    }
  };

  const saveNoticeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoticeItem) return;
    try {
      setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Item...');
      const colName = activeNoticeSubTab === 'central' ? 'notices' : activeNoticeSubTab === 'event' ? 'events' : 'news_items';
      await setDoc(doc(db, colName, editingNoticeItem.id), editingNoticeItem);

      // Instant local state update
      if (colName === 'notices') {
        setNotices(prev => {
          const idx = prev.findIndex(n => n.id === editingNoticeItem.id);
          if (idx >= 0) { const next = [...prev]; next[idx] = editingNoticeItem; return next; }
          return [editingNoticeItem, ...prev];
        });
      } else if (colName === 'events') {
        setEvents(prev => {
          const idx = prev.findIndex(n => n.id === editingNoticeItem.id);
          if (idx >= 0) { const next = [...prev]; next[idx] = editingNoticeItem; return next; }
          return [editingNoticeItem, ...prev];
        });
      } else if (colName === 'news_items') {
        setNewsItems(prev => {
          const idx = prev.findIndex(n => n.id === editingNoticeItem.id);
          if (idx >= 0) { const next = [...prev]; next[idx] = editingNoticeItem; return next; }
          return [editingNoticeItem, ...prev];
        });
      }

      setEditingNoticeItem(null);
      setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Item Saved Successfully!');
      setTimeout(() => setActionStatus(''), 3000);
      try {
        window.dispatchEvent(new CustomEvent('bsk_db_updated', { detail: { collection: colName } }));
      } catch (evErr) {}
    } catch (err: any) {
      console.error(err);
      setActionStatus(language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে!' : 'Error saving item');
      setTimeout(() => setActionStatus(''), 5000);
    }
  };

  const deleteNoticeItem = async (colName: 'notices' | 'events' | 'news_items', id: string) => {
    requireConfirmation(
      'আপনি কি নিশ্চিতভাবে এই আইটেমটি ডিলিট করতে চান?',
      'Are you sure you want to delete this notice item?',
      async () => {
        try {
          await deleteDoc(doc(db, colName, id));
        } catch (e) {
          console.error("Error deleting document from Firestore:", e);
        }
      }
    );
  };

  const createNewNoticeItem = () => {
    const id = `item-${Date.now()}`;
    if (activeNoticeSubTab === 'central') {
      setEditingNoticeItem({
        id,
        title_bn: 'নতুন নোটিশ শিরোনাম',
        title_en: 'New Notice Title',
        date_bn: '২৫ জুন ২০২৬',
        date_en: '25 Jun 2026',
        isUrgent: false,
        isNew: true,
        fileUrl: '',
        fileType: '',
        fileName: ''
      });
    } else if (activeNoticeSubTab === 'event') {
      setEditingNoticeItem({
        id,
        title_bn: 'নতুন আপডেট ও সেমিনার',
        title_en: 'New Update or Seminar',
        day: '২৫',
        dayEn: '25',
        month: 'জুন',
        monthEn: 'Jun',
        chip_bn: 'সেমিনার',
        chip_en: 'Seminar',
        time_bn: 'বিকাল ৪:০০ টা',
        time_en: '4:00 PM',
        loc_bn: 'প্রধান কার্যালয়, ঢাকা',
        loc_en: 'Head Office, Dhaka',
        fileUrl: '',
        fileType: '',
        fileName: ''
      });
    } else {
      setEditingNoticeItem({
        id,
        title_bn: 'নতুন সংবাদপত্র ও মিডিয়া কাভারেজ',
        title_en: 'New Newspaper & Media Coverage',
        tag_bn: 'সংবাদ',
        tag_en: 'News',
        date_bn: '২৫ জুন ২০২৬',
        date_en: '25 Jun 2026',
        icon: '📰',
        fileUrl: '',
        fileType: '',
        fileName: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FAF7F2] flex flex-col font-serif select-text overflow-hidden bg-grain">
      
      {/* Top CMS Header bar (only displayed when authenticated to avoid cluttering login) */}
      {isAuthenticated && (
        <div className="bg-[#2E5942] text-white px-6 py-4 flex items-center justify-between border-b border-[#B8862A]/25 shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <Layout className="h-6 w-6 text-[#F0CC7A] animate-pulse" />
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-wide">
                {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র - কন্টেন্ট ম্যানেজমেন্ট সিস্টেম' : 'BSK Admin Content Management System'}
              </h1>
              <p className="text-[10px] text-stone-200 font-sans tracking-wide">
                {language === 'bn' ? 'ড্যাশবোর্ড, ব্যানার ও কার্যক্রম নিয়ন্ত্রণ ব্যবস্থা' : 'Control center for banners, events and pages info'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full border border-[#F0CC7A]" referrerPolicy="no-referrer" />
                )}
                <span className="text-[11px] text-[#F0CC7A] font-sans font-semibold hidden md:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut(auth);
                    try {
                      sessionStorage.removeItem('bsk_admin_passcode_verified');
                    } catch (_) {}
                    setHasPasscode(false);
                  }}
                  className="p-1 px-2.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] text-[10px] font-sans font-bold rounded-lg border border-white/10 hover:text-white transition cursor-pointer"
                >
                  {language === 'bn' ? 'লগআউট' : 'Sign Out'}
                </button>
              </div>
            ) : hasPasscode ? (
              <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
                <span className="text-[11px] text-[#F0CC7A] font-sans font-semibold hidden md:inline">
                  {language === 'bn' ? 'পিন দিয়ে যুক্ত' : 'PIN Verified'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem('bsk_admin_passcode_verified');
                    } catch (_) {}
                    setHasPasscode(false);
                  }}
                  className="p-1 px-2.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] text-[10px] font-sans font-bold rounded-lg border border-white/10 hover:text-white transition cursor-pointer"
                >
                  {language === 'bn' ? 'লগআউট' : 'Sign Out'}
                </button>
              </div>
            ) : null}

            <button 
              onClick={onClose}
              className="p-1 px-3 bg-red-800/10 hover:bg-red-800/30 text-red-200 text-xs font-sans font-bold border border-red-500/20 rounded-lg hover:text-white transition cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Exit CMS'}
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && actionStatus && (
        <div className="bg-[#B8862A]/90 text-stone-950 text-center py-2 text-xs font-bold font-sans animate-bounce shrink-0 shadow-lg">
          {actionStatus}
        </div>
      )}

      {/* LOGIN ACCESS SCREEN */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 relative">
          
          {/* Standing Exit Button at Corner */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#EEDBC5]/50 text-[#1C3E2D]/80 transition cursor-pointer border border-[#B8862A]/20 bg-[#FAF7F2] shadow-sm"
            title={language === 'bn' ? 'বন্ধ করুন' : 'Exit'}
          >
            <X className="h-5 w-5" />
          </button>

          <form 
            onSubmit={handleLogin}
            className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-[#B8862A]/30 shadow-2xl space-y-6 relative"
          >
            <div className="text-center space-y-3">
              <div className="p-3 bg-[#2E5942]/10 rounded-full inline-block text-[#2E5942] border border-[#2E5942]/20 shadow-inner">
                <Lock className="h-8 w-8 text-[#B8862A]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black font-serif text-[#1C3E2D] tracking-tight">
                {language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস পিন কোড' : 'Admin Portal Login'}
              </h2>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                {language === 'bn' 
                  ? 'স্লাইডার পরিবর্তন বা নতুন কার্যপ্রক্রিয়া যুক্ত করার জন্য পিন লিখুন।' 
                  : 'Enter secure admin PIN to unlock live website content editing.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block font-sans">
                {language === 'bn' ? 'PIN নম্বর লিখুন' : 'Authorization PIN'}
              </label>
              <input 
                type="password"
                placeholder={language === 'bn' ? 'যেমন: ৫৬৫৬' : 'e.g. 5656'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#B8862A]/25 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#2E5942] bg-[#FAF4EA]/40 text-stone-950 placeholder-stone-400 font-bold"
                required
              />
              <div className="flex justify-between items-center px-1 text-[10px]">
                <p className="text-[#B8862A] font-sans flex items-center gap-1">
                  <span>💡</span>
                  <span>{language === 'bn' ? 'টেস্ট পিন: ৫৬৫৬' : 'Test Pin: 5656'}</span>
                </p>
                <span className="text-[#2E5942] font-mono tracking-wider font-bold">
                  SECURE_SESSION
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 text-red-850 text-xs rounded-xl flex items-center gap-2.5 border border-red-250 font-sans shadow-xs animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
                <span className="leading-relaxed font-semibold">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying PIN...'}</span>
                </>
              ) : (
                <span>{language === 'bn' ? 'প্রবেশ করুন' : 'Unlock Portal'}</span>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-150"></div>
              <span className="flex-shrink mx-3 text-[10px] text-stone-400 font-sans uppercase tracking-widest select-none">
                {language === 'bn' ? 'অথবা' : 'OR'}
              </span>
              <div className="flex-grow border-t border-stone-150"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-sans text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Globe2 className="h-4 w-4 text-blue-600" />
              <span>{language === 'bn' ? 'গুগল দিয়ে প্রবেশ করুন' : 'Sign in with Google'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* CMS PANEL MAIN WORKSPACE */
        <div className="flex-1 flex overflow-hidden">
          
          {/* Side Tabs Navigation bar */}
          <nav className="w-64 bg-stone-100 border-r border-[#E8DDD0] flex flex-col justify-between shrink-0 font-sans overflow-y-auto">
            <div className="p-3 space-y-4">
              
              {/* MODULE 1: ABOUT & MANAGEMENT */}
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-[#2E5942] uppercase tracking-wider px-2.5 py-1 bg-[#2E5942]/10 rounded-lg flex items-center gap-1.5 font-serif">
                  <Info className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '১. পরিচিতি ও ব্যবস্থাপনা' : '1. About & Management'}</span>
                </div>
                <button
                  onClick={() => { setActiveTab('about_management'); setEditingPage(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'about_management' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'কেন্দ্র পরিচিতি ও পেজসমূহ' : 'About BSK Pages'}</span>
                </button>
              </div>

              {/* MODULE 2: PROGRAMS */}
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-[#2E5942] uppercase tracking-wider px-2.5 py-1 bg-[#2E5942]/10 rounded-lg flex items-center gap-1.5 font-serif">
                  <BookOpen className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '২. কার্যক্রমসমূহ' : '2. Programs & Activities'}</span>
                </div>
                <button
                  onClick={() => { setActiveTab('programs_cms'); setEditingPage(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'programs_cms' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'কার্যক্রম পেজ এডিটর (৯টি)' : '9 Programs Pages'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('programs'); setEditingProgram(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'programs' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'কেন্দ্রীয় কার্যক্রম স্লাইডার' : 'Programs Central Slider'}</span>
                </button>
              </div>

              {/* MODULE 3: FACILITIES & SERVICES */}
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-[#2E5942] uppercase tracking-wider px-2.5 py-1 bg-[#2E5942]/10 rounded-lg flex items-center gap-1.5 font-serif">
                  <Landmark className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '৩. সুযোগ-সুবিধা ও সেবা' : '3. Facilities & Services'}</span>
                </div>
                <button
                  onClick={() => { setActiveTab('facilities_cms'); setEditingPage(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'facilities_cms' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'লাইব্রেরি, হল, ভবন, ক্যাফে' : 'Library, Halls & Cafe'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('galleries'); setEditingProgram(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'galleries' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? '৩টি পরিসেবা গ্যালারি স্লাইড' : '3 Mini-Galleries'}</span>
                </button>
              </div>

              {/* MODULE 4: HOMEPAGE BANNERS & BLOCKS */}
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-[#2E5942] uppercase tracking-wider px-2.5 py-1 bg-[#2E5942]/10 rounded-lg flex items-center gap-1.5 font-serif">
                  <Layout className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '৪. হোমপেজ কন্টেন্ট ও ব্যানার' : '4. Homepage Banners & Blocks'}</span>
                </div>
                <button
                  onClick={() => { setActiveTab('hero'); setEditingHero(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'hero' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Layout className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? '১ম হিরো ব্যানার স্লাইডার' : '1st Hero Slider'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('blocks'); setEditingProgram(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'blocks' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Globe2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'আমরা কারা, বাণী ও ইনফোগ্রাফ' : 'Who We Are & Blocks'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('activities'); setEditingActivity(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'activities' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'আসন্ন কার্যক্রমসমূহ' : 'Upcoming Activities'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('stats'); setEditingProgram(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'stats' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'মূল পরিসংখ্যান' : 'Key Statistics'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('movement'); setActiveSubBlock('belief'); setEditingProgram(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'movement' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'দেশব্যাপী আন্দোলন ও CTA' : 'Movement & CTA'}</span>
                </button>
              </div>

              {/* MODULE 5: MEDIA, NOTICES & DATABASE */}
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-[#2E5942] uppercase tracking-wider px-2.5 py-1 bg-[#2E5942]/10 rounded-lg flex items-center gap-1.5 font-serif">
                  <Bell className="h-3.5 w-3.5 text-[#B8862A]" />
                  <span>{language === 'bn' ? '৫. নোটিশ, মিডিয়া ও ডেটাবেজ' : '5. Media, Notices & Database'}</span>
                </div>
                <button
                  onClick={() => { setActiveTab('notice_board'); setEditingNoticeItem(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'notice_board' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'তথ্যকেন্দ্র ও নোটিশ বোর্ড' : 'Notice Board'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('press_cms'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'press_cms' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'প্রেস ও মিডিয়া ডেস্ক' : 'Press & Media'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('recruitment'); setEditingCircular(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'recruitment' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'নিয়োগ বিজ্ঞপ্তি ও আবেদন' : 'Careers & Niyog'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('contact'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'contact' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? `📩 বার্তা ও আবেদন ইনবক্স (${inquiries.length})` : `📩 Messages Inbox (${inquiries.length})`}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('blog_cms'); setEditingBlogPost(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'blog_cms' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'ব্লগ নিবন্ধ ও রিভিউ' : 'Blog & Reviews'}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('database_cms'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    activeTab === 'database_cms' 
                      ? 'bg-[#2E5942] text-white shadow-md' 
                      : 'text-stone-700 hover:bg-[#2E5942]/5'
                  }`}
                >
                  <Database className="h-3.5 w-3.5 shrink-0 text-[#B8862A]" />
                  <span>{language === 'bn' ? 'MySQL ডাটাবেস এক্সপ্লোরার' : 'MySQL DB Explorer'}</span>
                </button>
              </div>

            </div>

            {/* Logout button */}
            <div className="p-4 border-t border-[#E8DDD0] space-y-2">
              <div className="p-2.5 bg-[#2E5942]/5 border border-[#2E5942]/10 rounded-xl space-y-1 text-center">
                <span className="text-[9px] text-[#2E5942] font-semibold flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-[#B8862A]" />
                  {language === 'bn' ? 'সরাসরি যুক্ত' : 'Real-time Linked'}
                </span>
                <p className="text-[8px] text-stone-500 font-sans leading-tight">
                  {language === 'bn' ? 'যেকোনো আপডেট সাথে সাথে ওয়েবসাইটে আপডেট হবে' : 'Updates propagate in real-time instantly'}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold rounded-lg transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="h-3 w-3" />
                <span>{language === 'bn' ? 'লগআউট করুন' : 'Log Out Admin'}</span>
              </button>
            </div>
          </nav>

          {/* Area Workspace Panel */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-stone-50/50 p-6">
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-10 w-10 text-[#B8862A] animate-spin" />
                <p className="text-sm text-stone-600 font-sans">
                  {language === 'bn' ? 'ডাটাবেস লোড হচ্ছে...' : 'Saturating cloud state buffers...'}
                </p>
              </div>
            ) : (
              <div className="max-w-4xl w-full mx-auto space-y-6">
                
                {/* TAB 1: HERO SLIDE CONTROLS */}
                {activeTab === 'hero' && (
                  <div className="space-y-4">
                    {!editingHero ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">
                              {language === 'bn' ? 'প্রথম ব্যানার স্লাইডার সমুহ' : 'Homepage Top Banner Carousel'}
                            </h3>
                            <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                              {language === 'bn' 
                                ? 'হোমপেজে ঘূর্ণাবর্ত ব্যানার গুলোর লেখা ও ছবি এখানে ম্যানেজ করুন।' 
                                : 'Instantly modify banner slides, badge texts, display headers, backgrounds, etc.'}
                            </p>
                          </div>
                          <button
                            onClick={createNewHero}
                            className="bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{language === 'bn' ? 'নতুন স্লাইড' : 'Add Banner Slide'}</span>
                          </button>
                        </div>

                        {heroSlides.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-[#E8DDD0] space-y-3">
                            <Layout className="h-12 w-12 text-stone-300 mx-auto" />
                            <h4 className="text-sm font-bold text-stone-800">{language === 'bn' ? 'ডাটাবেস সম্পূর্ণ ফাকা!' : 'Database Collections Empty'}</h4>
                            <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
                              {language === 'bn' 
                                ? 'নতুন ব্যানার স্লাইড তৈরি করতে উপরের বাটনে ক্লিক করুন।' 
                                : 'Please click the button above to add a new banner slide.'}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {heroSlides.map((slide) => (
                              <div 
                                key={slide.id} 
                                className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                              >
                                <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${slide.bgImage})` }}>
                                  <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-between text-white">
                                    <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 font-sans text-[8px] font-extrabold uppercase tracking-widest rounded-none">
                                      {slide.badge_bn}
                                    </span>
                                    <h4 className="text-sm font-bold line-clamp-2 leading-snug drop-shadow-sm font-serif">
                                      {language === 'bn' ? slide.title_bn : slide.title_en}
                                    </h4>
                                  </div>
                                </div>
                                <div className="p-4 flex items-center justify-between border-t border-stone-100 bg-stone-50/50">
                                  <span className="text-[10px] font-sans font-semibold text-stone-600 bg-stone-200/50 px-2.5 py-0.5 rounded-full">
                                    🎯 {language === 'bn' ? `ক্রম: ${slide.order}` : `Priority Order: ${slide.order}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => { setEditingHero(slide); setPreviewImage(slide.bgImage); }}
                                      className="p-1 px-2.5 bg-[#B8862A]/10 hover:bg-[#B8862A]/20 text-[#B8862A] text-xs font-sans font-bold rounded-lg border border-[#B8862A]/20 transition cursor-pointer"
                                    >
                                      {language === 'bn' ? 'এডিট করুন' : 'Edit'}
                                    </button>
                                    <button 
                                      onClick={() => deleteHeroSlide(slide.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg hover:text-red-700 transition cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* EDIT HERO SLIDE WORKSPACE */
                      <form onSubmit={saveHeroSlide} className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <button 
                            type="button"
                            onClick={() => setEditingHero(null)}
                            className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to list'}</span>
                          </button>
                          <h4 className="font-bold text-stone-950 font-serif">
                            {language === 'bn' ? 'ব্যানার তথ্য সংশোধন উইন্ডো' : 'Edit Hero Slide Details'}
                          </h4>
                          <div></div>
                        </div>

                        {/* Top banner visual simulation */}
                        <div className="relative h-40 bg-cover bg-center rounded-xl overflow-hidden border" style={{ backgroundImage: `url(${previewImage})` }}>
                          <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end text-white">
                            <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 text-[8px] font-extrabold uppercase rounded-none leading-none mb-1">
                              {editingHero.badge_bn || 'ব্যানার ব্যাজ'}
                            </span>
                            <h2 className="text-base font-bold font-serif line-clamp-1">{editingHero.title_bn || 'শিরোনাম'}</h2>
                            <p className="text-[10px] text-stone-300 leading-none mt-1 font-sans line-clamp-1">{editingHero.desc_bn || 'বিবরণী...'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* BN text items */}
                          <div className="p-4 bg-[#FAF7F2]/50 border border-[#E8DDD0]/50 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#2E5942] border-b pb-1">
                              🇧🇩 {language === 'bn' ? 'বাংলা সংস্করণ কপি' : 'Bengali Translations Copy'}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ লেখা' : 'Banner Badge Text'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.badge_bn}
                                onChange={(e) => setEditingHero({ ...editingHero, badge_bn: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম' : 'Header Title (BN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.title_bn}
                                onChange={(e) => setEditingHero({ ...editingHero, title_bn: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত তথ্য' : 'Brief Desc (BN)'}</label>
                              <textarea 
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingHero.desc_bn}
                                onChange={(e) => setEditingHero({ ...editingHero, desc_bn: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* EN text items */}
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-stone-600 border-b pb-1">
                              🇬🇧 {language === 'bn' ? 'ইংরেজি সংস্করণ কপি' : 'English Translations Copy'}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ ইংরেজি' : 'Badge Eng'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.badge_en}
                                onChange={(e) => setEditingHero({ ...editingHero, badge_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম ইংরেজি' : 'Title Eng'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.title_en}
                                onChange={(e) => setEditingHero({ ...editingHero, title_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'বিবরণ ইংরেজি' : 'Desc Eng'}</label>
                              <textarea 
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingHero.desc_en}
                                onChange={(e) => setEditingHero({ ...editingHero, desc_en: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image settings and Image upload system */}
                        <div className="p-4 border rounded-xl space-y-4 bg-stone-50/50">
                          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                            <span>{language === 'bn' ? 'স্লাইডার ব্যাকগ্রাউন্ড ইমেজ (URL অথবা আপলোড)' : 'Slider Background Image (Web URL or local file upload)'}</span>
                            <span className="text-[10px] text-[#B8862A] font-normal leading-none font-sans">
                              * Firestore stores as direct data string or high performance URL
                            </span>
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">{language === 'bn' ? 'ইমেজ লিঙ্ক বা ফাইল পাথ' : 'Image Link / Server Path'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono bg-white"
                                value={editingHero.bgImage}
                                onChange={(e) => {
                                  setEditingHero({ ...editingHero, bgImage: e.target.value });
                                  setPreviewImage(e.target.value);
                                }}
                                placeholder="./uploads/... অথবা https://..."
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">{language === 'bn' ? 'পিসি থেকে ছবি আপলোড করুন' : 'Upload Image from Computer'}</label>
                              <div className="flex gap-2">
                                <label className="flex-1 border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2.5 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 hover:border-[#2E5942] transition duration-150 flex flex-col items-center justify-center space-y-0.5 cursor-pointer group">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden"
                                    disabled={isDirectUploading}
                                    onChange={(e) => handleDirectImageUpload(e, (url) => {
                                      setEditingHero({ ...editingHero, bgImage: url });
                                      setPreviewImage(url);
                                    })}
                                  />
                                  <Upload className={`h-4 w-4 text-[#2E5942] ${isDirectUploading ? 'animate-spin' : 'group-hover:scale-110'} transition duration-150`} />
                                  <span className="text-[10px] font-bold font-sans text-[#2E5942]">
                                    {isDirectUploading 
                                      ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                                      : (language === 'bn' ? 'ফুল ছবি আপলোড (নো ক্রপ)' : 'Full Image Upload (No Crop)')}
                                  </span>
                                  <span className="text-[8px] text-stone-500 font-sans">100% Original High-Res</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => openImageResizer('banner', (resizedUrl) => {
                                    setEditingHero({ ...editingHero, bgImage: resizedUrl });
                                    setPreviewImage(resizedUrl);
                                  })}
                                  className="px-3 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-sans font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
                                  title="Open Crop/Resize Tool"
                                >
                                  <Sliders className="h-3.5 w-3.5 text-[#B8862A]" />
                                  <span>{language === 'bn' ? 'রিসাইজার' : 'Resizer'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'স্লাইড অগ্রাধিকার ক্রম (priority)' : 'Horizontal priority order sequence'}</label>
                              <input 
                                type="number"
                                className="w-24 px-3 py-1 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.order}
                                onChange={(e) => setEditingHero({ ...editingHero, order: parseInt(e.target.value) || 0 })}
                                required
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => setEditingHero(null)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-semibold rounded-lg transition cursor-pointer"
                              >
                                {language === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                              <button 
                                type="submit"
                                className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-sans font-bold rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>{language === 'bn' ? 'আপডেট সেভ করুন' : 'Apply Layout Update'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}


                {/* TAB 2: RECENT ACTIVITIES CRUD */}
                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    {!editingActivity ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">
                              {language === 'bn' ? 'আসন্ন কার্যক্রমসমূহ ও ব্যানার ২' : 'Upcoming Activities & 2nd Carousel'}
                            </h3>
                            <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                              {language === 'bn' 
                                ? 'হোমপেজে থাকা ২য় ক্যারোসেল আসন্ন কার্যক্রমগুলি যুক্ত ও এডিট করুন।' 
                                : 'Draft, edit or delete countrywide library achievements and events displayed below.'}
                            </p>
                          </div>
                          <button
                            onClick={createNewActivity}
                            className="bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{language === 'bn' ? 'নতুন কার্যক্রম' : 'Add Activity Record'}</span>
                          </button>
                        </div>

                        {recentActivities.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-[#E8DDD0] space-y-3">
                            <Layout className="h-12 w-12 text-stone-300 mx-auto" />
                            <h4 className="text-sm font-bold text-stone-800">{language === 'bn' ? 'ডাটাবেস সম্পূর্ণ ফাকা!' : 'No activities found'}</h4>
                            <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
                              {language === 'bn' 
                                ? 'নতুন কার্যক্রম তৈরি করতে উপরের বাটনে ক্লিক করুন।' 
                                : 'Please click the button above to add a new activity record.'}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentActivities.map((act) => (
                              <div 
                                key={act.id} 
                                className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                              >
                                <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${act.image})` }}>
                                  <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-between text-white">
                                    <span className="self-start px-2 py-0.5 bg-[#2E5942] text-white font-sans text-[8px] font-extrabold uppercase tracking-widest rounded-none border border-[#B8862A]/40">
                                      {act.category_bn}
                                    </span>
                                    <h4 className="text-sm font-bold line-clamp-2 leading-snug drop-shadow-sm font-serif">
                                      {language === 'bn' ? act.title_bn : act.title_en}
                                    </h4>
                                  </div>
                                </div>
                                <div className="p-4 space-y-2 border-t border-stone-100 bg-stone-50/50">
                                  <div className="text-[10px] text-stone-500 font-sans flex items-center justify-between">
                                    <span>📅 {act.date_bn}</span>
                                    <span>📍 {act.loc_bn}</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                                    <span className="text-[10px] font-sans font-semibold text-stone-600">
                                      🎯 {language === 'bn' ? `ক্রম: ${act.order}` : `Priority: ${act.order}`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => { setEditingActivity(act); setPreviewImage(act.image); }}
                                        className="p-1 px-2.5 bg-[#B8862A]/10 hover:bg-[#B8862A]/20 text-[#B8862A] text-xs font-sans font-bold rounded-lg border border-[#B8862A]/20 transition cursor-pointer"
                                      >
                                        {language === 'bn' ? 'এডিট করুন' : 'Edit'}
                                      </button>
                                      <button 
                                        onClick={() => deleteRecentActivity(act.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg hover:text-red-700 transition cursor-pointer"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* EDIT RECENT ACTIVITY DETAILS FORM */
                      <form onSubmit={saveRecentActivity} className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <button 
                            type="button"
                            onClick={() => setEditingActivity(null)}
                            className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to list'}</span>
                          </button>
                          <h4 className="font-bold text-stone-950 font-serif">
                            {language === 'bn' ? 'কার্যক্রম বিবরণী সংশোধন' : 'Edit Activity Record'}
                          </h4>
                          <div></div>
                        </div>

                        {/* Visual simulation */}
                        <div className="relative h-40 bg-cover bg-center rounded-xl overflow-hidden border" style={{ backgroundImage: `url(${previewImage})` }}>
                          <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end text-white">
                            <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 text-[8px] font-extrabold uppercase rounded-none leading-none mb-1">
                              {editingActivity.category_bn || 'ক্যাটাগরি'}
                            </span>
                            <h2 className="text-base font-bold font-serif line-clamp-1">{editingActivity.title_bn || 'কার্যক্রমের নাম'}</h2>
                            <p className="text-[9px] text-stone-300 mt-2 font-sans">{editingActivity.loc_bn || 'বিশ্বসাহিত্য কেন্দ্র'} | {editingActivity.date_bn}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* BN Inputs */}
                          <div className="p-4 bg-[#FAF7F2]/50 border border-[#E8DDD0]/50 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#2E5942] border-b pb-1">
                              🇧🇩 {language === 'bn' ? 'বাংলা কপি এডিট' : 'Bengali Translations'}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'কার্যক্রমের ক্যাটাগরি' : 'Category Name (BN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.category_bn}
                                onChange={(e) => setEditingActivity({ ...editingActivity, category_bn: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'কার্যক্রমের নাম' : 'Activity Title (BN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.title_bn}
                                onChange={(e) => setEditingActivity({ ...editingActivity, title_bn: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'তারিখ' : 'Date string (BN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.date_bn}
                                onChange={(e) => setEditingActivity({ ...editingActivity, date_bn: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'স্থান / লোকেশন' : 'Location desc (BN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.loc_bn}
                                onChange={(e) => setEditingActivity({ ...editingActivity, loc_bn: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'কার্যক্রমের খুঁটিনাটি বিবরণী' : 'Brief desc paragraphs (BN)'}</label>
                              <textarea 
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingActivity.desc_bn}
                                onChange={(e) => setEditingActivity({ ...editingActivity, desc_bn: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-[#B8862A] block">{language === 'bn' ? 'স্লাইডারের ছবির ক্যাপশন (বাংলা)' : 'Slider Image Caption (BN)'}</label>
                              <input 
                                type="text"
                                placeholder={language === 'bn' ? 'স্লাইডারের নিচে ডান কোণে প্রদর্শিত ছবির ক্যাপশন' : 'Caption shown at bottom-right of slider image'}
                                className="w-full px-3 py-1.5 border border-[#B8862A]/30 rounded-lg text-xs bg-amber-50/20"
                                value={editingActivity.caption_bn || ''}
                                onChange={(e) => setEditingActivity({ ...editingActivity, caption_bn: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* EN Inputs */}
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-stone-600 border-b pb-1">
                              🇬🇧 {language === 'bn' ? 'ইংরেজি কপি এডিট' : 'English Translations'}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ক্যাটাগরি Eng' : 'Category Name (EN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.category_en}
                                onChange={(e) => setEditingActivity({ ...editingActivity, category_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'নাম Eng' : 'Activity Title (EN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.title_en}
                                onChange={(e) => setEditingActivity({ ...editingActivity, title_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'তারিখ Eng' : 'Date string (EN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.date_en}
                                onChange={(e) => setEditingActivity({ ...editingActivity, date_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'স্থান Eng' : 'Location desc (EN)'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.loc_en}
                                onChange={(e) => setEditingActivity({ ...editingActivity, loc_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'বিবরণ Eng' : 'Brief desc paragraphs (EN)'}</label>
                              <textarea 
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingActivity.desc_en}
                                onChange={(e) => setEditingActivity({ ...editingActivity, desc_en: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-[#B8862A] block">{language === 'bn' ? 'স্লাইডারের ছবির ক্যাপশন (ইংরেজি)' : 'Slider Image Caption (EN)'}</label>
                              <input 
                                type="text"
                                placeholder={language === 'bn' ? 'Caption shown at bottom-right of slider image' : 'Caption shown at bottom-right of slider image'}
                                className="w-full px-3 py-1.5 border border-[#B8862A]/30 rounded-lg text-xs bg-amber-50/20"
                                value={editingActivity.caption_en || ''}
                                onChange={(e) => setEditingActivity({ ...editingActivity, caption_en: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Activity image systems */}
                        <div className="p-4 border rounded-xl space-y-4 bg-stone-50/50">
                          <label className="text-xs font-bold text-stone-800 block">
                            {language === 'bn' ? 'কার্যক্রমের ছবি লিংক / আপলোড' : 'Activity Cover Photo (Web URL / Local File Upload)'}
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">{language === 'bn' ? 'ইমেজ লিঙ্ক বা ফাইল পাথ' : 'Image Link / Server Path'}</label>
                              <input 
                                type="text"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono bg-white"
                                value={editingActivity.image}
                                onChange={(e) => {
                                  setEditingActivity({ ...editingActivity, image: e.target.value });
                                  setPreviewImage(e.target.value);
                                }}
                                placeholder="./uploads/... অথবা https://..."
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">{language === 'bn' ? 'পিসি থেকে ছবি আপলোড করুন' : 'Upload Image from Computer'}</label>
                              <div className="flex gap-2">
                                <label className="flex-1 border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2.5 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 hover:border-[#2E5942] transition duration-150 flex flex-col items-center justify-center space-y-0.5 cursor-pointer group">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden"
                                    disabled={isDirectUploading}
                                    onChange={(e) => handleDirectImageUpload(e, (url) => {
                                      setEditingActivity({ ...editingActivity, image: url });
                                      setPreviewImage(url);
                                    })}
                                  />
                                  <Upload className={`h-4 w-4 text-[#2E5942] ${isDirectUploading ? 'animate-spin' : 'group-hover:scale-110'} transition duration-150`} />
                                  <span className="text-[10px] font-bold font-sans text-[#2E5942]">
                                    {isDirectUploading 
                                      ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                                      : (language === 'bn' ? 'ফুল ছবি আপলোড (নো ক্রপ)' : 'Full Image Upload (No Crop)')}
                                  </span>
                                  <span className="text-[8px] text-stone-500 font-sans">100% Original High-Res</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => openImageResizer('landscape', (resizedUrl) => {
                                    setEditingActivity({ ...editingActivity, image: resizedUrl });
                                    setPreviewImage(resizedUrl);
                                  })}
                                  className="px-3 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-sans font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
                                  title="Open Crop/Resize Tool"
                                >
                                  <Sliders className="h-3.5 w-3.5 text-[#B8862A]" />
                                  <span>{language === 'bn' ? 'রিসাইজার' : 'Resizer'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'অগ্রাধিকার ক্রম (priority order)' : 'Display priority seq'}</label>
                              <input 
                                type="number"
                                className="w-24 px-3 py-1 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.order}
                                onChange={(e) => setEditingActivity({ ...editingActivity, order: parseInt(e.target.value) || 0 })}
                                required
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => setEditingActivity(null)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-semibold rounded-lg transition cursor-pointer"
                              >
                                {language === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                              <button 
                                type="submit"
                                className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-sans font-bold rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>{language === 'bn' ? 'কার্যক্রম সেভ করুন' : 'Confirm Save Record'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}


                {/* TAB 8: ABOUT & MANAGEMENT COPIES */}
                {activeTab === 'about_management' && (
                  <div className="space-y-4">
                    {!editingPage ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <h3 className="text-lg font-bold text-stone-900 font-serif">
                            {language === 'bn' ? '৮. পরিচিতি ও ব্যবস্থাপনা পেজ কন্টেন্ট' : '8. About & Management Page Contents'}
                          </h3>
                          <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                            {language === 'bn' 
                              ? 'মেন্যুর "পরিচিতি ও ব্যবস্থাপনা" অংশের পেজগুলোর বিবরণ ও তথ্য এডিট করুন।' 
                              : 'Customize static page texts, paragraphs and details for BSK About & Management section.'}
                          </p>
                        </div>

                        {/* List of default pages to select & edit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'home', name_bn: 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি (সাথে ব্রত, লক্ষ্য, ইতিহাস ও অর্জন)', name_en: 'About BSK (with Mission, History & Achievements)' },
                            { id: 'mission', name_bn: 'ব্রত, লক্ষ্য ও উদ্দেশ্য', name_en: 'Mission & Vision' },
                            { id: 'founder', name_bn: 'প্রতিষ্ঠাতা ও সভাপতি', name_en: 'Founder Profile' },
                            { id: 'ataglance', name_bn: 'এক নজরে কেন্দ্র', name_en: 'BSK at a Glance' },
                            { id: 'trustees', name_bn: 'ট্রাস্টি বোর্ড', name_en: 'Board of Trustees' },
                            { id: 'organogram', name_bn: 'প্রশাসনিক কাঠামো ও অর্গানোগ্রাম', name_en: 'Administrative Structure' },
                            { id: 'press_contact', name_bn: 'মিডিয়া ও প্রেস যোগাযোগ (সেকশন ৫)', name_en: 'Media & Press Contact (Section 5)' }
                          ].map((pageInfo) => {
                            // Find if we already customized this page in Firestore
                            const isOverridden = pageInfo.id === 'press_contact'
                              ? hasCustomMediaContact
                              : pages.some(p => p.id === pageInfo.id);
                            
                            return (
                              <div 
                                key={pageInfo.id}
                                className="bg-white p-4 justify-between flex items-center border border-[#E8DDD0] rounded-xl shadow-xs hover:border-[#B8862A] hover:bg-[#FAF7F2]/20 transition"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[#2E5942]" />
                                    <span>{pageInfo.name_bn}</span>
                                  </h4>
                                  <p className="text-[10px] font-sans text-stone-500 flex items-center gap-1.5">
                                    <span className="font-mono text-stone-400">ID: {pageInfo.id}</span>
                                    {isOverridden ? (
                                      <span className="text-[#2E5942] font-semibold bg-[#2E5942]/10 px-1.5 py-0.5 rounded-sm">
                                        ✓ {language === 'bn' ? 'কাস্টমাইজড' : 'Custom Live'}
                                      </span>
                                    ) : (
                                      <span className="text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                        {language === 'bn' ? 'ডিফল্ট কপি' : 'Using Local Default'}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <button 
                                  onClick={() => {
                                    // Start editing - fallback to default structure from websiteContentRaw if not yet saved in Firestore
                                    if (pageInfo.id === 'press_contact') {
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
                                      
                                      getDoc(doc(db, 'homepage_blocks', 'media_contact')).then((docSnap) => {
                                        const data = docSnap.exists() ? docSnap.data() : defaultMediaContact;
                                        setEditingPage({
                                          id: 'press_contact',
                                          title_bn: pageInfo.name_bn,
                                          title_en: pageInfo.name_en,
                                          mediaContactData: data,
                                          sections: []
                                        } as any);
                                      }).catch(() => {
                                        setEditingPage({
                                          id: 'press_contact',
                                          title_bn: pageInfo.name_bn,
                                          title_en: pageInfo.name_en,
                                          mediaContactData: defaultMediaContact,
                                          sections: []
                                        } as any);
                                      });
                                    } else {
                                      const ex = pages.find(p => p.id === pageInfo.id);
                                      if (ex) {
                                        setEditingPage(JSON.parse(JSON.stringify(ex)));
                                      } else {
                                        // Get default from static json imported
                                        import('../data/website_content.json').then((mod) => {
                                          const raw = mod.default.find(p => p.id === pageInfo.id);
                                          if (raw) {
                                            setEditingPage(JSON.parse(JSON.stringify(raw)));
                                          } else {
                                            // Create empty
                                            setEditingPage({
                                              id: pageInfo.id,
                                              title_bn: pageInfo.name_bn,
                                              title_en: pageInfo.name_en,
                                              html_title: pageInfo.name_bn,
                                              sections: [{ title: 'পরিচিতি', content: ['প্রথম অনুচ্ছেদ বিবরণী।'] }]
                                            });
                                          }
                                        });
                                      }
                                    }
                                  }}
                                  className="p-1.5 px-3 bg-[#2E5942]/10 hover:bg-[#2E5942]/20 text-[#2E5942] rounded-lg text-xs font-sans font-bold border border-[#2E5942]/15 transition cursor-pointer"
                                >
                                  {language === 'bn' ? 'লেখাসমূহ এডিট' : 'Edit Copy'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* EDIT WEBSITE PAGE FORM WITH REAL-TIME PREVIEW */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT: EDITING FORM */}
                        <div className="lg:col-span-7">
                          <form onSubmit={savePageOverride} className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6">
                            <div className="flex items-center justify-between border-b pb-3">
                              <button 
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                <span>{language === 'bn' ? 'ফিরে যান' : 'Back to pages list'}</span>
                              </button>
                              <h4 className="font-bold text-stone-950 font-serif">
                                {language === 'bn' ? `"${editingPage.title_bn}" পেজ কপি সংশোধন` : `Edit Copy for: ${editingPage.title_en}`}
                              </h4>
                              <div></div>
                            </div>

                            {/* Title Overrides and custom section edit fields */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান পেজ টাইটেল (বাংলা)' : 'Main Page Title (BN)'}</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_bn}
                                    onChange={(e) => setEditingPage({ ...editingPage, title_bn: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান পেজ টাইটেল (ইংরেজি)' : 'Main Page Title (EN)'}</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_en}
                                    onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="text-[10px] font-extrabold uppercase text-[#2E5942] tracking-wider border-b pb-1 flex justify-between items-center">
                                  <span>{language === 'bn' ? 'অনুচ্ছেদসমূহ ও বিশদ বিবরণীমালা' : 'Page Sections & Document Paragraphs'}</span>
                                  <span className="text-[9px] text-[#B8862A] lowercase font-sans font-semibold">
                                    {language === 'bn' ? '*রিয়েল-টাইম লাইভ পরিবর্তন ডানে দেখতে পাবেন' : '*live updates will preview on the right'}
                                  </span>
                                </div>

                                {editingPage.id === 'press_contact' ? (
                                  <div className="space-y-6">
                                    {/* Media Contact Fields */}
                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4 text-[#2E5942]" />
                                        <span>{language === 'bn' ? '১. মিডিয়া কো-অর্ডিনেটর বিবরণী' : '1. Media Liaison Coordinator Details'}</span>
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'পদবী টাইটেল (বাংলা)' : 'Coordinator Title (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_title_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_title_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'পদবী টাইটেল (ইংরেজি)' : 'Coordinator Title (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_title_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_title_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কো-অর্ডিনেটর নাম (বাংলা)' : 'Coordinator Name (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_name_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_name_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কো-অর্ডিনেটর নাম (ইংরেজি)' : 'Coordinator Name (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_name_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_name_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ভুমিকা / রোল (বাংলা)' : 'Coordinator Role (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_role_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_role_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ভুমিকা / রোল (ইংরেজি)' : 'Coordinator Role (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_role_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_role_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                                          <input
                                            type="email"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_email || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_email: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.coordinator_phone || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                coordinator_phone: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Globe2 className="h-4 w-4 text-[#2E5942]" />
                                        <span>{language === 'bn' ? '২. কেন্দ্রীয় কার্যালয় ও সময়সূচি' : '2. Corporate Desk & Schedule'}</span>
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কার্যালয় লেবেল (বাংলা)' : 'Office Label (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.office_label_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                office_label_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কার্যালয় লেবেল (ইংরেজি)' : 'Office Label (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.office_label_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                office_label_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কার্যালয় ঠিকানা (বাংলা)' : 'Office Address (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.office_value_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                office_value_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'কার্যালয় ঠিকানা (ইংরেজি)' : 'Office Address (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.office_value_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                office_value_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অফিস সময় লেবেল (বাংলা)' : 'Duty Hours Label (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.hours_label_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                hours_label_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অফিস সময় লেবেল (ইংরেজি)' : 'Duty Hours Label (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.hours_label_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                hours_label_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অফিস সময় টেক্সট (বাংলা)' : 'Duty Hours (BN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.hours_value_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                hours_value_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অফিস সময় টেক্সট (ইংরেজি)' : 'Duty Hours (EN)'}</label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.hours_value_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                hours_value_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Info className="h-4 w-4 text-[#2E5942]" />
                                        <span>{language === 'bn' ? '৩. অতিরিক্ত মন্তব্য ও নোট' : '3. Additional Notes'}</span>
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বিশেষ দ্রষ্টব্য / মন্তব্য (বাংলা)' : 'Additional Note (BN)'}</label>
                                          <textarea
                                            rows={2}
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.note_bn || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                note_bn: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বিশেষ দ্রষ্টব্য / মন্তব্য (ইংরেজি)' : 'Additional Note (EN)'}</label>
                                          <textarea
                                            rows={2}
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={(editingPage as any).mediaContactData?.note_en || ''}
                                            onChange={(e) => setEditingPage({
                                              ...editingPage,
                                              mediaContactData: {
                                                ...(editingPage as any).mediaContactData,
                                                note_en: e.target.value
                                              }
                                            } as any)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : editingPage.id === 'home' ? (
                                  <div className="space-y-6">
                                    {/* 1. INTRO HIGHLIGHT PANEL */}
                                    <div className="p-4 bg-gradient-to-r from-[#B8862A]/5 to-transparent border-l-4 border-[#B8862A] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-[#B8862A]" />
                                        <span>{language === 'bn' ? '১. পরিচিতি অংশ কাস্টমাইজেশন (গোল্ডেন লাইনের নিচে)' : '1. Intro Highlight Customization (Below Golden Line)'}</span>
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ভূমিকা টেক্সট (বাংলা)' : 'Intro Text (BN)'}</label>
                                          <textarea
                                            rows={3}
                                            value={editingPage.intro_text_bn || ''}
                                            onChange={(e) => handleHomeFieldChange('intro_text_bn', e.target.value)}
                                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans"
                                            placeholder="চিত্তের আলোয় দূর হোক অন্ধকার..."
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ভূমিকা টেক্সট (ইংরেজি)' : 'Intro Text (EN)'}</label>
                                          <textarea
                                            rows={3}
                                            value={editingPage.intro_text_en || ''}
                                            onChange={(e) => handleHomeFieldChange('intro_text_en', e.target.value)}
                                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans"
                                            placeholder="Let there be light in our minds..."
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/60 p-3 rounded-lg border border-stone-200/50">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ভূমিকা ইমেজ (আপলোড)' : 'Intro Image'}</label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleHomeImageUpload(e, 'intro_image')}
                                            className="w-full text-[10px]"
                                          />
                                          {editingPage.intro_image && (
                                            <div className="mt-2 relative inline-block">
                                              <img src={editingPage.intro_image} className="h-14 rounded-md border border-[#E8DDD0] object-cover" />
                                              <button
                                                type="button"
                                                onClick={() => handleHomeFieldChange('intro_image', '')}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ইমেজ অ্যালাইনমেন্ট' : 'Image Alignment'}</label>
                                          <select
                                            value={editingPage.intro_image_align || 'right'}
                                            onChange={(e) => handleHomeFieldChange('intro_image_align', e.target.value)}
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="right">Right</option>
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="none">None (Hide)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ইমেজের প্রস্থ (উদাঃ 180px)' : 'Image Width (e.g. 180px)'}</label>
                                          <input
                                            type="text"
                                            value={editingPage.intro_image_width || '180px'}
                                            onChange={(e) => handleHomeFieldChange('intro_image_width', e.target.value)}
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs"
                                            placeholder="180px"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* 2. TAB 1: MISSION/VOW (ব্রত ও লক্ষ্য) */}
                                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                                      <div className="border-b pb-1 flex justify-between items-center">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <Compass className="h-4 w-4" />
                                          <span>{language === 'bn' ? '২. ব্রত ও লক্ষ্য কাস্টমাইজেশন' : '2. Mission & Vow Customization'}</span>
                                        </h5>
                                      </div>
                                      
                                      {editingPage.sections[0] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম' : 'Section Title'}</label>
                                            <input
                                              type="text"
                                              value={editingPage.sections[0].title || ''}
                                              onChange={(e) => {
                                                const updated = [...editingPage.sections];
                                                updated[0].title = e.target.value;
                                                setEditingPage({ ...editingPage, sections: updated });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">{language === 'bn' ? 'ব্রত ও লক্ষ্যের প্যারাগ্রাফ সমূহ' : 'Vow Paragraphs'}</span>
                                            {editingPage.sections[0].content.map((pText, pIdx) => (
                                              <div key={pIdx} className="space-y-1">
                                                <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                  <span>{language === 'bn' ? `প্যারাগ্রাফ #${pIdx + 1}` : `Paragraph #${pIdx + 1}`}</span>
                                                  {editingPage.sections[0].content.length > 1 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updatedSecs = [...editingPage.sections];
                                                        updatedSecs[0].content = updatedSecs[0].content.filter((_, idx) => idx !== pIdx);
                                                        setEditingPage({ ...editingPage, sections: updatedSecs });
                                                      }}
                                                      className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                      {language === 'bn' ? 'মুছুন' : 'Remove'}
                                                    </button>
                                                  )}
                                                </div>
                                                <textarea
                                                  rows={3}
                                                  value={pText}
                                                  onChange={(e) => {
                                                    const updatedSecs = [...editingPage.sections];
                                                    updatedSecs[0].content[pIdx] = e.target.value;
                                                    setEditingPage({ ...editingPage, sections: updatedSecs });
                                                  }}
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                />
                                              </div>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [...editingPage.sections];
                                                updatedSecs[0].content.push("");
                                                setEditingPage({ ...editingPage, sections: updatedSecs });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              + {language === 'bn' ? 'প্যারাগ্রাফ যোগ করুন' : 'Add Paragraph'}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* MINI GALLERY FOR MISSION */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>{language === 'bn' ? 'ব্রত ও লক্ষ্য স্লাইড গ্যালারি (একাধিক ছবি)' : 'Vow Slide Gallery (Multiple Images)'}</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [...(editingPage.mission_gallery || [])];
                                              current.push({ image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', caption_bn: '', caption_en: '' });
                                              setEditingPage({ ...editingPage, mission_gallery: current });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            + {language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add Photo'}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(editingPage.mission_gallery || []).map((gItem, gIdx) => (
                                            <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (editingPage.mission_gallery || []).filter((_, idx) => idx !== gIdx);
                                                  setEditingPage({ ...editingPage, mission_gallery: current });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                                title={language === 'bn' ? 'ছবি মুছুন' : 'Delete photo'}
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ছবি ফাইল' : 'Image file'}</label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleGalleryImageUpload(e, 'mission_gallery', gIdx)}
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img src={gItem.image} className="h-12 w-full object-cover rounded-md border" />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.mission_gallery || [])];
                                                        current[gIdx].caption_bn = e.target.value;
                                                        setEditingPage({ ...editingPage, mission_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.mission_gallery || [])];
                                                        current[gIdx].caption_en = e.target.value;
                                                        setEditingPage({ ...editingPage, mission_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(editingPage.mission_gallery || []).length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === 'bn' ? 'গ্যালারিতে কোনো ছবি যোগ করা হয়নি।' : 'No custom photos added in gallery.'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 3. TAB 2: HISTORY (ইতিহাস ও যাত্রা) */}
                                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                                      <div className="border-b pb-1">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <History className="h-4 w-4" />
                                          <span>{language === 'bn' ? '৩. ইতিহাস ও যাত্রা কাস্টমাইজেশন' : '3. History & Journey Customization'}</span>
                                        </h5>
                                      </div>

                                      {editingPage.sections[1] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম' : 'Section Title'}</label>
                                            <input
                                              type="text"
                                              value={editingPage.sections[1].title || ''}
                                              onChange={(e) => {
                                                const updated = [...editingPage.sections];
                                                updated[1].title = e.target.value;
                                                setEditingPage({ ...editingPage, sections: updated });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">{language === 'bn' ? 'ইতিহাস ও যাত্রার প্যারাগ্রাফ সমূহ' : 'History Paragraphs'}</span>
                                            {editingPage.sections[1].content.map((pText, pIdx) => (
                                              <div key={pIdx} className="space-y-1">
                                                <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                  <span>{language === 'bn' ? `প্যারাগ্রাফ #${pIdx + 1}` : `Paragraph #${pIdx + 1}`}</span>
                                                  {editingPage.sections[1].content.length > 1 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updatedSecs = [...editingPage.sections];
                                                        updatedSecs[1].content = updatedSecs[1].content.filter((_, idx) => idx !== pIdx);
                                                        setEditingPage({ ...editingPage, sections: updatedSecs });
                                                      }}
                                                      className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                      {language === 'bn' ? 'মুছুন' : 'Remove'}
                                                    </button>
                                                  )}
                                                </div>
                                                <textarea
                                                  rows={3}
                                                  value={pText}
                                                  onChange={(e) => {
                                                    const updatedSecs = [...editingPage.sections];
                                                    updatedSecs[1].content[pIdx] = e.target.value;
                                                    setEditingPage({ ...editingPage, sections: updatedSecs });
                                                  }}
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                />
                                              </div>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [...editingPage.sections];
                                                updatedSecs[1].content.push("");
                                                setEditingPage({ ...editingPage, sections: updatedSecs });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              + {language === 'bn' ? 'প্যারাগ্রাফ যোগ করুন' : 'Add Paragraph'}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* SECTION LEVEL IMAGE CUSTOMIZATION */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 rounded-lg border border-stone-200">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন ইমেজ (আপলোড)' : 'Section Image'}</label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleHomeImageUpload(e, 'history_image')}
                                            className="w-full text-[9px]"
                                          />
                                          {editingPage.history_image && (
                                            <div className="mt-1 relative inline-block">
                                              <img src={editingPage.history_image} className="h-12 rounded border object-cover" />
                                              <button
                                                type="button"
                                                onClick={() => handleHomeFieldChange('history_image', '')}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অ্যালাইনমেন্ট' : 'Alignment'}</label>
                                          <select
                                            value={editingPage.history_image_align || 'left'}
                                            onChange={(e) => handleHomeFieldChange('history_image_align', e.target.value)}
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                            <option value="center">Center</option>
                                            <option value="none">None (Hide)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'প্রস্থ (উদাঃ 150px)' : 'Width (e.g. 150px)'}</label>
                                          <input
                                            type="text"
                                            value={editingPage.history_image_width || '150px'}
                                            onChange={(e) => handleHomeFieldChange('history_image_width', e.target.value)}
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs"
                                          />
                                        </div>
                                      </div>

                                      {/* MINI GALLERY FOR HISTORY */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>{language === 'bn' ? 'ইতিহাস ও যাত্রা স্লাইড গ্যালারি' : 'History Slide Gallery'}</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [...(editingPage.history_gallery || [])];
                                              current.push({ image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600', caption_bn: '', caption_en: '' });
                                              setEditingPage({ ...editingPage, history_gallery: current });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            + {language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add Photo'}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(editingPage.history_gallery || []).map((gItem, gIdx) => (
                                            <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (editingPage.history_gallery || []).filter((_, idx) => idx !== gIdx);
                                                  setEditingPage({ ...editingPage, history_gallery: current });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ছবি ফাইল' : 'Image file'}</label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleGalleryImageUpload(e, 'history_gallery', gIdx)}
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img src={gItem.image} className="h-12 w-full object-cover rounded-md border" />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.history_gallery || [])];
                                                        current[gIdx].caption_bn = e.target.value;
                                                        setEditingPage({ ...editingPage, history_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.history_gallery || [])];
                                                        current[gIdx].caption_en = e.target.value;
                                                        setEditingPage({ ...editingPage, history_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(editingPage.history_gallery || []).length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === 'bn' ? 'গ্যালারিতে কোনো ছবি যোগ করা হয়নি।' : 'No custom photos added in gallery.'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 4. TAB 3: ACHIEVEMENTS (অর্জিত সম্মান ও পুরস্কার) */}
                                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                                      <div className="border-b pb-1">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <Award className="h-4 w-4" />
                                          <span>{language === 'bn' ? '৪. অর্জিত সম্মান ও পুরস্কার কাস্টমাইজেশন' : '4. Achievements & Honors Customization'}</span>
                                        </h5>
                                      </div>

                                      {editingPage.sections[2] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম' : 'Section Title'}</label>
                                            <input
                                              type="text"
                                              value={editingPage.sections[2].title || ''}
                                              onChange={(e) => {
                                                const updated = [...editingPage.sections];
                                                updated[2].title = e.target.value;
                                                setEditingPage({ ...editingPage, sections: updated });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">{language === 'bn' ? 'সম্মান ও পুরস্কারের প্যারাগ্রাফ সমূহ' : 'Achievements Paragraphs'}</span>
                                            {editingPage.sections[2].content.map((pText, pIdx) => (
                                              <div key={pIdx} className="space-y-1">
                                                <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                  <span>{language === 'bn' ? `প্যারাগ্রাফ #${pIdx + 1}` : `Paragraph #${pIdx + 1}`}</span>
                                                  {editingPage.sections[2].content.length > 1 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updatedSecs = [...editingPage.sections];
                                                        updatedSecs[2].content = updatedSecs[2].content.filter((_, idx) => idx !== pIdx);
                                                        setEditingPage({ ...editingPage, sections: updatedSecs });
                                                      }}
                                                      className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                      {language === 'bn' ? 'মুছুন' : 'Remove'}
                                                    </button>
                                                  )}
                                                </div>
                                                <textarea
                                                  rows={3}
                                                  value={pText}
                                                  onChange={(e) => {
                                                    const updatedSecs = [...editingPage.sections];
                                                    updatedSecs[2].content[pIdx] = e.target.value;
                                                    setEditingPage({ ...editingPage, sections: updatedSecs });
                                                  }}
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                />
                                              </div>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [...editingPage.sections];
                                                updatedSecs[2].content.push("");
                                                setEditingPage({ ...editingPage, sections: updatedSecs });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              + {language === 'bn' ? 'প্যারাগ্রাফ যোগ করুন' : 'Add Paragraph'}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* SECTION LEVEL IMAGE CUSTOMIZATION FOR ACHIEVEMENTS */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 rounded-lg border border-stone-200">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন ইমেজ (আপলোড)' : 'Section Image'}</label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleHomeImageUpload(e, 'achievements_image')}
                                            className="w-full text-[9px]"
                                          />
                                          {editingPage.achievements_image && (
                                            <div className="mt-1 relative inline-block">
                                              <img src={editingPage.achievements_image} className="h-12 rounded border object-cover" />
                                              <button
                                                type="button"
                                                onClick={() => handleHomeFieldChange('achievements_image', '')}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অ্যালাইনমেন্ট' : 'Alignment'}</label>
                                          <select
                                            value={editingPage.achievements_image_align || 'left'}
                                            onChange={(e) => handleHomeFieldChange('achievements_image_align', e.target.value)}
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                            <option value="center">Center</option>
                                            <option value="none">None (Hide)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-[#1A1207] block">{language === 'bn' ? 'প্রস্থ (উদাঃ 150px)' : 'Width (e.g. 150px)'}</label>
                                          <input
                                            type="text"
                                            value={editingPage.achievements_image_width || '150px'}
                                            onChange={(e) => handleHomeFieldChange('achievements_image_width', e.target.value)}
                                            className="w-full px-2 py-1 border border-[#E8DDD0] rounded-md text-xs"
                                          />
                                        </div>
                                      </div>

                                      {/* MINI GALLERY FOR ACHIEVEMENTS */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>{language === 'bn' ? 'অর্জিত সম্মান ও পুরস্কার স্লাইড গ্যালারি' : 'Achievements Slide Gallery'}</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [...(editingPage.achievements_gallery || [])];
                                              current.push({ image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600', caption_bn: '', caption_en: '' });
                                              setEditingPage({ ...editingPage, achievements_gallery: current });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            + {language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add Photo'}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(editingPage.achievements_gallery || []).map((gItem, gIdx) => (
                                            <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (editingPage.achievements_gallery || []).filter((_, idx) => idx !== gIdx);
                                                  setEditingPage({ ...editingPage, achievements_gallery: current });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ছবি ফাইল' : 'Image file'}</label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleGalleryImageUpload(e, 'achievements_gallery', gIdx)}
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img src={gItem.image} className="h-12 w-full object-cover rounded-md border" />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.achievements_gallery || [])];
                                                        current[gIdx].caption_bn = e.target.value;
                                                        setEditingPage({ ...editingPage, achievements_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [...(editingPage.achievements_gallery || [])];
                                                        current[gIdx].caption_en = e.target.value;
                                                        setEditingPage({ ...editingPage, achievements_gallery: current });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(editingPage.achievements_gallery || []).length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === 'bn' ? 'গ্যালারিতে কোনো ছবি যোগ করা হয়নি।' : 'No custom photos added in gallery.'}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 5. TAB 5: DYNAMIC EXTRA SECTIONS / ADDITIONAL PARAGRAPHS */}
                                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                                      <div className="border-b pb-1 flex justify-between items-center">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <PlusCircle className="h-4 w-4" />
                                          <span>{language === 'bn' ? '৫. নতুন অনুচ্ছেদ বা কাস্টম প্যারাগ্রাফ সমূহ' : '5. Dynamic Additional Paragraphs & Custom Sections'}</span>
                                        </h5>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const current = [...(editingPage.extra_sections || [])];
                                            current.push({
                                              title_bn: '',
                                              title_en: '',
                                              content_bn: [''],
                                              content_en: [''],
                                              image: '',
                                              image_align: 'right',
                                              image_width: 'w-1/3'
                                            });
                                            setEditingPage({ ...editingPage, extra_sections: current });
                                          }}
                                          className="text-[9.5px] bg-[#2E5942] text-white hover:bg-[#1E3B2C] px-2.5 py-1 rounded-md font-bold cursor-pointer transition flex items-center gap-0.5"
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>{language === 'bn' ? 'নতুন অনুচ্ছেদ যোগ করুন' : 'Add New Paragraph Section'}</span>
                                        </button>
                                      </div>

                                      <div className="space-y-4">
                                        {(editingPage.extra_sections || []).map((extra, extIdx) => (
                                          <div key={extIdx} className="bg-white p-4 rounded-xl border border-stone-200 relative space-y-4">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const current = (editingPage.extra_sections || []).filter((_, idx) => idx !== extIdx);
                                                setEditingPage({ ...editingPage, extra_sections: current });
                                              }}
                                              className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 transition cursor-pointer p-1"
                                              title={language === 'bn' ? 'অনুচ্ছেদ মুছুন' : 'Delete Section'}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>

                                            <span className="font-bold text-[10px] text-[#B8862A] uppercase block">
                                              {language === 'bn' ? `কাস্টম অনুচ্ছেদ #${extIdx + 1}` : `Custom Section #${extIdx + 1}`}
                                            </span>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'শিরোনাম / সারণী (বাংলা)' : 'Title / Header (BN)'}</label>
                                                <input
                                                  type="text"
                                                  value={extra.title_bn}
                                                  onChange={(e) => {
                                                    const current = [...(editingPage.extra_sections || [])];
                                                    current[extIdx].title_bn = e.target.value;
                                                    setEditingPage({ ...editingPage, extra_sections: current });
                                                  }}
                                                  className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-xs"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'শিরোনাম / সারণী (ইংরেজি)' : 'Title / Header (EN)'}</label>
                                                <input
                                                  type="text"
                                                  value={extra.title_en}
                                                  onChange={(e) => {
                                                    const current = [...(editingPage.extra_sections || [])];
                                                    current[extIdx].title_en = e.target.value;
                                                    setEditingPage({ ...editingPage, extra_sections: current });
                                                  }}
                                                  className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-xs"
                                                />
                                              </div>
                                            </div>

                                            {/* Extra Section Content - BN */}
                                            <div className="space-y-2.5">
                                              <span className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'প্যারাগ্রাফ সমূহ (বাংলা)' : 'Paragraphs (BN)'}</span>
                                              {(extra.content_bn || []).map((pbText, pbIdx) => (
                                                <div key={pbIdx} className="space-y-1">
                                                  <div className="flex justify-between items-center text-[8.5px] text-stone-400">
                                                    <span>BN Para #{pbIdx + 1}</span>
                                                    {extra.content_bn.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const current = [...(editingPage.extra_sections || [])];
                                                          current[extIdx].content_bn = current[extIdx].content_bn.filter((_, idx) => idx !== pbIdx);
                                                          setEditingPage({ ...editingPage, extra_sections: current });
                                                        }}
                                                        className="text-red-500"
                                                      >
                                                        Remove
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={2}
                                                    value={pbText}
                                                    onChange={(e) => {
                                                      const current = [...(editingPage.extra_sections || [])];
                                                      current[extIdx].content_bn[pbIdx] = e.target.value;
                                                      setEditingPage({ ...editingPage, extra_sections: current });
                                                    }}
                                                    className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = [...(editingPage.extra_sections || [])];
                                                  current[extIdx].content_bn.push('');
                                                  setEditingPage({ ...editingPage, extra_sections: current });
                                                }}
                                                className="text-[9px] bg-stone-100 hover:bg-stone-200 border px-2 py-0.5 rounded text-stone-700 font-bold font-sans cursor-pointer"
                                              >
                                                + Add BN Para
                                              </button>
                                            </div>

                                            {/* Extra Section Content - EN */}
                                            <div className="space-y-2.5">
                                              <span className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'প্যারাগ্রাফ সমূহ (ইংরেজি)' : 'Paragraphs (EN)'}</span>
                                              {(extra.content_en || []).map((peText, peIdx) => (
                                                <div key={peIdx} className="space-y-1">
                                                  <div className="flex justify-between items-center text-[8.5px] text-stone-400">
                                                    <span>EN Para #{peIdx + 1}</span>
                                                    {extra.content_en.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const current = [...(editingPage.extra_sections || [])];
                                                          current[extIdx].content_en = current[extIdx].content_en.filter((_, idx) => idx !== peIdx);
                                                          setEditingPage({ ...editingPage, extra_sections: current });
                                                        }}
                                                        className="text-red-500"
                                                      >
                                                        Remove
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={2}
                                                    value={peText}
                                                    onChange={(e) => {
                                                      const current = [...(editingPage.extra_sections || [])];
                                                      current[extIdx].content_en[peIdx] = e.target.value;
                                                      setEditingPage({ ...editingPage, extra_sections: current });
                                                    }}
                                                    className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = [...(editingPage.extra_sections || [])];
                                                  current[extIdx].content_en.push('');
                                                  setEditingPage({ ...editingPage, extra_sections: current });
                                                }}
                                                className="text-[9px] bg-stone-100 hover:bg-stone-200 border px-2 py-0.5 rounded text-stone-700 font-bold font-sans cursor-pointer"
                                              >
                                                + Add EN Para
                                              </button>
                                            </div>

                                            {/* Image upload & settings for Extra Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60">
                                              <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'অনুচ্ছেদ ইমেজ' : 'Section Image'}</label>
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => handleExtraSectionImageUpload(e, extIdx)}
                                                  className="text-[9px] w-full"
                                                />
                                                {extra.image && (
                                                  <div className="mt-1 relative inline-block">
                                                    <img src={extra.image} className="h-10 rounded border object-cover" />
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const current = [...(editingPage.extra_sections || [])];
                                                        current[extIdx].image = '';
                                                        setEditingPage({ ...editingPage, extra_sections: current });
                                                      }}
                                                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                                                    >
                                                      <X className="h-2.5 w-2.5" />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ইমেজ অ্যালাইনমেন্ট' : 'Alignment'}</label>
                                                <select
                                                  value={extra.image_align || 'right'}
                                                  onChange={(e) => {
                                                    const current = [...(editingPage.extra_sections || [])];
                                                    current[extIdx].image_align = e.target.value as any;
                                                    setEditingPage({ ...editingPage, extra_sections: current });
                                                  }}
                                                  className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs bg-white"
                                                >
                                                  <option value="right">Right</option>
                                                  <option value="left">Left</option>
                                                  <option value="center">Center</option>
                                                  <option value="none">None</option>
                                                </select>
                                              </div>

                                              <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'ইমেজ প্রস্থ' : 'Width ratio'}</label>
                                                <select
                                                  value={extra.image_width || 'w-1/3'}
                                                  onChange={(e) => {
                                                    const current = [...(editingPage.extra_sections || [])];
                                                    current[extIdx].image_width = e.target.value;
                                                    setEditingPage({ ...editingPage, extra_sections: current });
                                                  }}
                                                  className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs bg-white"
                                                >
                                                  <option value="w-1/4">25% (Small)</option>
                                                  <option value="w-1/3">33% (Default)</option>
                                                  <option value="w-1/2">50% (Medium)</option>
                                                  <option value="w-full">100% (Full block)</option>
                                                </select>
                                              </div>
                                            </div>
                                          </div>
                                        ))}

                                        {(editingPage.extra_sections || []).length === 0 && (
                                          <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                            {language === 'bn' ? 'কোনো অতিরিক্ত অনুচ্ছেদ বা প্যারাগ্রাফ যোগ করা হয়নি।' : 'No additional paragraphs added yet.'}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* 6. TAB 4: FOUNDER PRESIDENT QUOTE (প্রতিষ্ঠাতা সভাপতি বাণী) */}
                                    <div className="p-4 bg-[#FAF7F2] border border-[#B8862A]/20 rounded-xl space-y-4">
                                      <div className="border-b pb-1">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <Quote className="h-4 w-4" />
                                          <span>{language === 'bn' ? '৬. প্রতিষ্ঠাতা সভাপতি বাণী কাস্টমাইজেশন' : '6. Founder President Quote Customization'}</span>
                                        </h5>
                                      </div>

                                      {(() => {
                                        const sec3 = editingPage.sections[3] || { title: 'বাণী', content: ['', ''] };
                                        return (
                                          <div className="space-y-3">
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বাণী টেক্সট (বাংলা)' : 'Quote Paragraph (Bangla)'}</label>
                                              <textarea
                                                rows={4}
                                                value={sec3.content && sec3.content[0] || ''}
                                                onChange={(e) => {
                                                  const updated = [...editingPage.sections];
                                                  while (updated.length <= 3) {
                                                    updated.push({ title: 'বাণী', content: ['', ''] });
                                                  }
                                                  updated[3] = {
                                                    ...updated[3],
                                                    content: [e.target.value, updated[3].content?.[1] || '']
                                                  };
                                                  setEditingPage({ ...editingPage, sections: updated });
                                                }}
                                                className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বাণী টেক্সট (ইংরেজি)' : 'Quote Paragraph (English)'}</label>
                                              <textarea
                                                rows={4}
                                                value={sec3.content && sec3.content[1] || ''}
                                                onChange={(e) => {
                                                  const updated = [...editingPage.sections];
                                                  while (updated.length <= 3) {
                                                    updated.push({ title: 'বাণী', content: ['', ''] });
                                                  }
                                                  updated[3] = {
                                                    ...updated[3],
                                                    content: [updated[3].content?.[0] || '', e.target.value]
                                                  };
                                                  setEditingPage({ ...editingPage, sections: updated });
                                                }}
                                                className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                              />
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  /* STANDARD PAGE BUILDER FOR OTHER PAGES */
                                  <>
                                    {editingPage.id === 'ataglance' ? (
                                      <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-xl p-5 space-y-6">
                                        <div className="border-b border-[#B8862A]/20 pb-3">
                                          <h4 className="font-serif font-bold text-sm text-[#1A1207] flex items-center gap-1.5 text-stone-800">
                                            <Sparkles className="h-4.5 w-4.5 text-[#B8862A]" />
                                            <span>{language === 'bn' ? 'এক নজরে বিশ্বসাহিত্য কেন্দ্র তথ্য কাস্টমাইজেশন' : 'At a Glance Metrics Customization'}</span>
                                          </h4>
                                          <p className="text-[11px] text-stone-500 font-sans mt-1 leading-relaxed">
                                            {language === 'bn' 
                                              ? 'নিচের তালিকা থেকে প্রতিটি বিষয়ের তথ্য ও পরিসংখ্যান সংশোধন করুন। ডান পাশের উইন্ডোতে রিয়েল-টাইমে পরিবর্তন দেখতে পাবেন।'
                                              : 'Update values and metrics in the table below. The real-time live preview on the right will update immediately.'}
                                          </p>
                                        </div>

                                        <div className="space-y-4">
                                          {/* Title fields */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'পেজ শিরোনাম (বাংলা)' : 'Page Title (BN)'}</label>
                                              <input 
                                                type="text"
                                                value={editingPage.title_bn || ''}
                                                onChange={(e) => setEditingPage({ ...editingPage, title_bn: e.target.value })}
                                                className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'পেজ শিরোনাম (ইংরেজি)' : 'Page Title (EN)'}</label>
                                              <input 
                                                type="text"
                                                value={editingPage.title_en || ''}
                                                onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value })}
                                                className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                              />
                                            </div>
                                          </div>

                                          {/* Facts Table Editor */}
                                          <div className="border border-[#B8862A]/20 rounded-xl overflow-hidden bg-white shadow-xs">
                                            <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
                                              <table className="w-full text-left border-collapse font-sans text-xs">
                                                <thead className="sticky top-0 bg-[#FAF6F0] z-10 border-b border-[#B8862A]/30">
                                                  <tr>
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] w-12 text-center border-r border-[#B8862A]/20">#</th>
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/20 min-w-[140px]">{language === 'bn' ? 'সূচক / বিবরণ' : 'Metric Name'}</th>
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] min-w-[200px]">{language === 'bn' ? 'তথ্য / পরিসংখ্যান' : 'Stats / Value'}</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {(editingPage.key_facts || []).map((fact: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-stone-100 hover:bg-[#FCFBF7]">
                                                      <td className="px-3 py-2 text-center text-stone-400 font-mono border-r border-[#B8862A]/10">
                                                        {idx + 1}
                                                      </td>
                                                      <td className="px-3 py-2 font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/10 leading-relaxed max-w-[160px] truncate" title={fact.label}>
                                                        {fact.label}
                                                      </td>
                                                      <td className="px-3 py-2">
                                                        <textarea 
                                                          rows={1}
                                                          value={fact.value || ''}
                                                          onChange={(e) => {
                                                            const updatedFacts = [...(editingPage.key_facts || [])];
                                                            updatedFacts[idx] = { ...fact, value: e.target.value };
                                                            setEditingPage({ ...editingPage, key_facts: updatedFacts });
                                                          }}
                                                          className="w-full px-2.5 py-1 border border-stone-200 focus:outline-hidden focus:border-[#B8862A] rounded-md text-xs font-sans text-stone-900 bg-white resize-none"
                                                        />
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        {editingPage.id === 'founder' && (
                                          <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-xl p-5 space-y-6">
                                        <h4 className="font-serif font-bold text-sm text-[#1A1207] flex items-center gap-1.5 border-b pb-2 text-stone-800">
                                          <Sparkles className="h-4.5 w-4.5 text-[#B8862A]" />
                                          <span>{language === 'bn' ? 'প্রতিষ্ঠাতা ও সভাপতি পরিচিতি পেইজ কাস্টমাইজেশন' : 'Founder Profile Page Customization'}</span>
                                        </h4>

                                        {/* Avatar and Basic Details */}
                                        <div className="space-y-4">
                                          <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                            {language === 'bn' ? '১. অবতার ফটো ও সাধারণ পরিচিতি' : '1. Avatar Photo & Basic Info'}
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg border border-stone-200">
                                            <div className="col-span-1 flex flex-col items-center space-y-2">
                                              <div className="w-20 h-20 rounded-full border border-stone-200 overflow-hidden flex items-center justify-center bg-stone-50">
                                                {editingPage.founder_avatar ? (
                                                  <img src={editingPage.founder_avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                  <span className="text-[10px] text-stone-400">No Image</span>
                                                )}
                                              </div>
                                              <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFounderAvatarUpload} 
                                                className="w-full text-[10px]" 
                                              />
                                            </div>
                                            <div className="col-span-3 space-y-3">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (BN)'}</label>
                                                  <input 
                                                    type="text" 
                                                    value={editingPage.founder_name_bn || ''} 
                                                    onChange={(e) => setEditingPage({ ...editingPage, founder_name_bn: e.target.value })} 
                                                    className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                    placeholder="অধ্যাপক আবদুল্লাহ আবু সায়ীদ"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (EN)'}</label>
                                                  <input 
                                                    type="text" 
                                                    value={editingPage.founder_name_en || ''} 
                                                    onChange={(e) => setEditingPage({ ...editingPage, founder_name_en: e.target.value })} 
                                                    className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                    placeholder="Prof. Abdullah Abu Sayeed"
                                                  />
                                                </div>
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি বিবরণী (বাংলা)' : 'Bio Subtitle (BN)'}</label>
                                                <textarea 
                                                  rows={2}
                                                  value={editingPage.founder_bio_bn || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_bio_bn: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="বাংলাদেশের প্রখ্যাত বহুভাষাবিদ..."
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি বিবরণী (ইংরেজি)' : 'Bio Subtitle (EN)'}</label>
                                                <textarea 
                                                  rows={2}
                                                  value={editingPage.founder_bio_en || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_bio_en: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="A legendary writer..."
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Dynamic Badges */}
                                        <div className="space-y-4">
                                          <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                            {language === 'bn' ? '২. সম্মাননা ও পদক ব্যাজসমূহ' : '2. Honor Badges'}
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[0, 1, 2].map((idx) => {
                                              const currentBadges = editingPage.founder_badges || [
                                                { label_bn: "রেমন ম্যাগসেসে ২০০৪", label_en: "Ramon Magsaysay 2004" },
                                                { label_bn: "একুশে পদক ২০০৫", label_en: "Ekushey Padak 2005" },
                                                { label_bn: "ইউনেস্কো কমেনিয়াস ২০০৮", label_en: "Unesco Comenius 2008" }
                                              ];
                                              const b = currentBadges[idx] || { label_bn: "", label_en: "" };
                                              return (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
                                                  <span className="text-[9px] font-bold text-[#B8862A] uppercase block">Badge #{idx+1}</span>
                                                  <div className="space-y-1">
                                                    <input 
                                                      type="text" 
                                                      value={b.label_bn} 
                                                      onChange={(e) => {
                                                        const updated = [...currentBadges];
                                                        updated[idx] = { ...b, label_bn: e.target.value };
                                                        setEditingPage({ ...editingPage, founder_badges: updated });
                                                      }} 
                                                      className="w-full p-1.5 border border-stone-200 rounded text-xs"
                                                      placeholder="বাংলা লেবেল"
                                                    />
                                                    <input 
                                                      type="text" 
                                                      value={b.label_en} 
                                                      onChange={(e) => {
                                                        const updated = [...currentBadges];
                                                        updated[idx] = { ...b, label_en: e.target.value };
                                                        setEditingPage({ ...editingPage, founder_badges: updated });
                                                      }} 
                                                      className="w-full p-1.5 border border-stone-200 rounded text-xs"
                                                      placeholder="English Label"
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Ramon Magsaysay Citation details */}
                                        <div className="space-y-4">
                                          <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                            {language === 'bn' ? '৩. রেমন ম্যাগসেসে পুরস্কার সাইটেশন' : '3. Ramon Magsaysay Award Citation'}
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-stone-200">
                                            <div className="space-y-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
                                                <input 
                                                  type="text" 
                                                  value={editingPage.founder_magsaysay_title_bn || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_magsaysay_title_bn: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="রেমন ম্যাগসেসে পুরস্কার (২০০৪)"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সাইটেশন টেক্সট (বাংলা)' : 'Citation Text (BN)'}</label>
                                                <textarea 
                                                  rows={3}
                                                  value={editingPage.founder_magsaysay_text_bn || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_magsaysay_text_bn: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (EN)'}</label>
                                                <input 
                                                  type="text" 
                                                  value={editingPage.founder_magsaysay_title_en || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_magsaysay_title_en: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="Ramon Magsaysay Citation"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সাইটেশন টেক্সট (ইংরেজি)' : 'Citation Text (EN)'}</label>
                                                <textarea 
                                                  rows={3}
                                                  value={editingPage.founder_magsaysay_text_en || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_magsaysay_text_en: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* UNESCO Comenius Honor citation details */}
                                        <div className="space-y-4">
                                          <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                            {language === 'bn' ? '৪. ইউনেস্কো কমেনিয়াস পদক সাইটেশন' : '4. UNESCO Comenius Award Citation'}
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-stone-200">
                                            <div className="space-y-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
                                                <input 
                                                  type="text" 
                                                  value={editingPage.founder_unesco_title_bn || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_unesco_title_bn: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="ইউনেস্কো কমেনিয়াস পদক (২০০৮)"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সাইটেশন টেক্সট (বাংলা)' : 'Citation Text (BN)'}</label>
                                                <textarea 
                                                  rows={3}
                                                  value={editingPage.founder_unesco_text_bn || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_unesco_text_bn: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (EN)'}</label>
                                                <input 
                                                  type="text" 
                                                  value={editingPage.founder_unesco_title_en || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_unesco_title_en: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                  placeholder="UNESCO Comenius Honor"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সাইটেশন টেক্সট (ইংরেজি)' : 'Citation Text (EN)'}</label>
                                                <textarea 
                                                  rows={3}
                                                  value={editingPage.founder_unesco_text_en || ''} 
                                                  onChange={(e) => setEditingPage({ ...editingPage, founder_unesco_text_en: e.target.value })} 
                                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Inspirational Quotes */}
                                        <div className="space-y-4">
                                          <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                            {language === 'bn' ? '৫. অনন্য বাণী ও জীবনদর্শন (Quotes)' : '5. Inspirational Quotes'}
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[0, 1].map((idx) => {
                                              const currentQuotes = editingPage.founder_quotes || [
                                                { text_bn: "“ক্ষুদ্র মানুষ আর বড় জাতি একসঙ্গে হতে পারে না। যদি বড় জাতি গড়তে চাই, তবে বড় মনের মানুষ তৈরি করতে হবে।”", text_en: "“Small minds and a grand nation cannot coexist. If we want to build a grand nation, we must nurture expanded souls first.”" },
                                                { text_bn: "“বই পড়লে মানুষ ধনী হয় না কিন্তু মননের ঐশ্বর্যে সে রাজপ্রাসাদের অধিকারীকেও ছাড়িয়ে যেতে পারে।”", text_en: "“Reading books might not make someone financially wealthy, but the riches of their mind can easily surpass a king’s palace.”" }
                                              ];
                                              const q = currentQuotes[idx] || { text_bn: "", text_en: "" };
                                              return (
                                                <div key={idx} className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
                                                  <span className="text-[10px] font-bold text-[#B8862A] uppercase block">Quote #{idx+1}</span>
                                                  <div className="space-y-2">
                                                    <div className="space-y-1">
                                                      <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'বাণী (বাংলা)' : 'Quote (BN)'}</label>
                                                      <textarea 
                                                        rows={2}
                                                        value={q.text_bn} 
                                                        onChange={(e) => {
                                                          const updated = [...currentQuotes];
                                                          updated[idx] = { ...q, text_bn: e.target.value };
                                                          setEditingPage({ ...editingPage, founder_quotes: updated });
                                                        }} 
                                                        className="w-full p-2 border border-stone-200 rounded text-xs font-serif"
                                                      />
                                                    </div>
                                                    <div className="space-y-1">
                                                      <label className="text-[9px] font-bold text-stone-500 block">{language === 'bn' ? 'বাণী (ইংরেজি)' : 'Quote (EN)'}</label>
                                                      <textarea 
                                                        rows={2}
                                                        value={q.text_en} 
                                                        onChange={(e) => {
                                                          const updated = [...currentQuotes];
                                                          updated[idx] = { ...q, text_en: e.target.value };
                                                          setEditingPage({ ...editingPage, founder_quotes: updated });
                                                        }} 
                                                        className="w-full p-2 border border-stone-200 rounded text-xs font-serif"
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="space-y-3 mt-6">
                                      <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#2E5942] pl-1.5 ml-1">
                                        {editingPage.id === 'founder' 
                                          ? (language === 'bn' ? '৬. জীবনী ও আদর্শিক দর্শন (বই ও বিস্তারিত বিবরণ)' : '6. Biography & Details')
                                          : (language === 'bn' ? 'অনুচ্ছেদসমূহ ও বিশদ বিবরণীমালা' : 'Page Sections & Document Paragraphs')
                                        }
                                      </h5>
                                      <div className="space-y-4">
                                        {(editingPage?.sections || []).map((section, secIdx) => (
                                          <div key={secIdx} className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-3 relative group/sec">
                                            <div className="flex items-center justify-between border-b pb-1 mb-1.5 text-xs font-bold text-[#1A1207] font-serif">
                                              <span>{sectionsLabels(secIdx, language, section.title)}</span>
                                              <div className="flex items-center gap-2">
                                                {secIdx > 0 && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const updatedSections = editingPage.sections.filter((_, sI) => sI !== secIdx);
                                                      setEditingPage({ ...editingPage, sections: updatedSections });
                                                    }}
                                                    className="text-[10px] text-red-600 hover:text-red-800 font-bold transition flex items-center gap-0.5 cursor-pointer"
                                                    title={language === 'bn' ? 'অনুচ্ছেদ মুছুন' : 'Delete Section'}
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                                                  </button>
                                                )}
                                                <span className="text-[10px] font-mono font-medium text-stone-500">ID: {secIdx + 1}</span>
                                              </div>
                                            </div>

                                            {/* Editable Section/Member Title (always editable to enable full content configuration) */}
                                            <div className="space-y-1 mb-3">
                                              <label className="text-[9.5px] font-bold text-stone-600 block">
                                                {editingPage.id === 'trustees' 
                                                  ? (secIdx === 0 
                                                      ? (language === 'bn' ? 'প্রধান সেকশন শিরোনাম (উদাঃ ট্রাস্টি বোর্ড)' : 'Main Section Title (e.g., Board of Trustees)')
                                                      : (language === 'bn' ? 'ট্রাস্টি মেম্বারের নাম (শিরোনাম)' : 'Trustee Name (Section Title)'))
                                                  : editingPage.id === 'organogram'
                                                    ? (secIdx === 0
                                                        ? (language === 'bn' ? 'মুখবন্ধ / ভূমিকা (উদাঃ প্রশাসনিক কাঠামো পরিচিতি)' : 'Preface / Introduction Title')
                                                        : (section.title?.startsWith('বিভাগ')
                                                            ? (language === 'bn' ? 'বিভাগের নাম (উদাঃ বিভাগ: ভ্রাম্যমাণ লাইব্রেরি)' : 'Department Title (e.g. Department: Mobile Library)')
                                                            : (language === 'bn' ? 'কর্মকর্তার নাম ও পদবী (উদাঃ জনাব শরিফ হোসেন - পরিচালক)' : 'Officer Name & Designation')))
                                                    : (language === 'bn' ? 'অনুচ্ছেদের শিরোনাম' : 'Section Subtitle')}
                                              </label>
                                              <input
                                                type="text"
                                                value={section.title || ''}
                                                onChange={(e) => {
                                                  const updatedSections = [...editingPage.sections];
                                                  updatedSections[secIdx].title = e.target.value;
                                                  setEditingPage({ ...editingPage, sections: updatedSections });
                                                }}
                                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-sans leading-normal text-stone-800 focus:outline-hidden focus:border-[#2E5942] bg-white shadow-xs"
                                              />
                                            </div>

                                            {/* Photo/Avatar upload specifically for trustees */}
                                            {editingPage.id === 'trustees' && secIdx > 0 && (
                                              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#B8862A]/20 space-y-4 mb-3">
                                                {/* Trustee Category & Tenure */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#B8862A]/15">
                                                  <div>
                                                    <label className="text-[10px] font-bold text-stone-700 block font-serif mb-1">
                                                      {language === 'bn' ? 'ট্রাস্টি টাইপ / ক্যাটাগরি' : 'Trustee Category'}
                                                    </label>
                                                    <div className="flex rounded-lg overflow-hidden border border-stone-300 p-0.5 bg-white">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedSections = [...editingPage.sections];
                                                          delete updatedSections[secIdx].is_former;
                                                          setEditingPage({ ...editingPage, sections: updatedSections });
                                                        }}
                                                        className={`flex-1 py-1 px-2 text-[10.5px] font-bold rounded-md transition ${
                                                          !section.is_former 
                                                            ? 'bg-[#2E5942] text-white shadow-xs' 
                                                            : 'text-stone-600 hover:bg-stone-100'
                                                        }`}
                                                      >
                                                        {language === 'bn' ? 'বর্তমান ট্রাস্টি' : 'Current Trustee'}
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedSections = [...editingPage.sections];
                                                          updatedSections[secIdx].is_former = true;
                                                          setEditingPage({ ...editingPage, sections: updatedSections });
                                                        }}
                                                        className={`flex-1 py-1 px-2 text-[10.5px] font-bold rounded-md transition ${
                                                          section.is_former 
                                                            ? 'bg-[#8B621B] text-white shadow-xs' 
                                                            : 'text-stone-600 hover:bg-stone-100'
                                                        }`}
                                                      >
                                                        {language === 'bn' ? 'সাবেক ট্রাস্টি' : 'Former Trustee'}
                                                      </button>
                                                    </div>
                                                  </div>

                                                  <div>
                                                    <label className="text-[10px] font-bold text-stone-700 block font-serif mb-1">
                                                      {language === 'bn' ? 'সময়কাল / Tenure (উদাঃ ১৯৭৮ - ২০২০)' : 'Tenure Period (e.g. 1978 - 2020)'}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={section.period || ''}
                                                      placeholder={language === 'bn' ? 'উদাঃ ১৯৭৮ - ২০২০' : 'e.g. 1978 - 2020'}
                                                      onChange={(e) => {
                                                        const updatedSections = [...editingPage.sections];
                                                        updatedSections[secIdx].period = e.target.value;
                                                        setEditingPage({ ...editingPage, sections: updatedSections });
                                                      }}
                                                      className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-sans text-stone-800 focus:outline-hidden focus:border-[#2E5942] bg-white shadow-xs"
                                                    />
                                                  </div>
                                                </div>

                                                <label className="text-[10px] font-bold text-stone-700 block font-serif">
                                                  {language === 'bn' ? 'ট্রাস্টি মেম্বারের ছবি (Photo/Avatar)' : 'Trustee Member Photo'}
                                                </label>
                                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                                  <div className="w-16 h-16 rounded-full overflow-hidden border border-[#B8862A] bg-white flex items-center justify-center shrink-0">
                                                    {section.image ? (
                                                      <img 
                                                        src={section.image} 
                                                        className="w-full h-full object-cover" 
                                                        alt="Trustee"
                                                      />
                                                    ) : (
                                                      <div className="text-[10px] text-stone-400 font-bold">No Image</div>
                                                    )}
                                                  </div>
                                                  <div className="space-y-1.5 w-full">
                                                    <div className="flex gap-2">
                                                      <label className="px-3 py-1.5 bg-white border border-[#2E5942] text-[#2E5942] hover:bg-[#2E5942]/5 rounded-lg text-[10.5px] font-bold font-sans transition cursor-pointer flex items-center gap-1">
                                                        <Upload className="h-3.5 w-3.5" />
                                                        <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}</span>
                                                        <input 
                                                          type="file" 
                                                          accept="image/*" 
                                                          className="hidden" 
                                                          onChange={(e) => handleSectionImageUpload(e, secIdx)} 
                                                        />
                                                      </label>
                                                      {section.image && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const updatedSections = [...editingPage.sections];
                                                            delete updatedSections[secIdx].image;
                                                            setEditingPage({ ...editingPage, sections: updatedSections });
                                                          }}
                                                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[10.5px] font-bold font-sans transition cursor-pointer"
                                                        >
                                                          {language === 'bn' ? 'ছবি মুছুন' : 'Remove Image'}
                                                        </button>
                                                      )}
                                                    </div>
                                                    <p className="text-[9px] text-stone-500">
                                                      {language === 'bn' ? 'প্রস্তাবিত সাইজ: স্কয়ার (1:1), সর্বোচ্চ ২ মেগাবাইট।' : 'Recommended size: Square (1:1), max 2MB.'}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            <div className="space-y-3">
                                              {(section?.content || []).map((paragraph, paraIdx) => (
                                                <div key={paraIdx} className="space-y-1">
                                                  <div className="flex justify-between items-center">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === 'bn' ? `প্যারাগ্রাফ নং ${paraIdx + 1}` : `Paragraph #${paraIdx + 1}`}
                                                    </label>
                                                    {section.content.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedContent = section.content.filter((_, pI) => pI !== paraIdx);
                                                          const updatedSections = [...editingPage.sections];
                                                          updatedSections[secIdx].content = updatedContent;
                                                          setEditingPage({ ...editingPage, sections: updatedSections });
                                                        }}
                                                        className="text-[9px] text-red-500 hover:text-red-700 font-bold cursor-pointer font-sans"
                                                        title={language === 'bn' ? 'প্যারাগ্রাফ মুছুন' : 'Remove Paragraph'}
                                                      >
                                                        {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={4}
                                                    value={paragraph}
                                                    onChange={(e) => {
                                                      const updatedContent = [...section.content];
                                                      updatedContent[paraIdx] = e.target.value;
                                                      const updatedSections = [...editingPage.sections];
                                                      updatedSections[secIdx].content = updatedContent;
                                                      setEditingPage({ ...editingPage, sections: updatedSections });
                                                    }}
                                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-sans leading-relaxed text-stone-800 focus:outline-hidden focus:border-[#2E5942] bg-white shadow-xs"
                                                  />
                                                </div>
                                              ))}
                                            </div>

                                            {/* Add Paragraph Button inside Section */}
                                            <div className="pt-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updatedSections = [...editingPage.sections];
                                                  updatedSections[secIdx].content = [...updatedSections[secIdx].content, ""];
                                                  setEditingPage({ ...editingPage, sections: updatedSections });
                                                }}
                                                className="text-[10px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans transition cursor-pointer"
                                              >
                                                + {language === 'bn' ? 'প্যারাগ্রাফ যোগ করুন' : 'Add Paragraph'}
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>)}</>
                                )}

                                {/* Add Section & Submit Actions */}
                                {editingPage.id !== 'home' && editingPage.id !== 'ataglance' && (
                                  <div className="flex flex-wrap gap-3 pt-3">
                                    {editingPage.id === 'trustees' ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingPage({
                                              ...editingPage,
                                              sections: [
                                                ...editingPage.sections,
                                                { title: language === 'bn' ? 'নতুন বর্তমান ট্রাস্টি' : 'New Current Trustee', content: [""] }
                                              ]
                                            });
                                          }}
                                          className="px-3.5 py-2 border border-dashed border-[#2E5942] text-[#2E5942] hover:bg-[#2E5942]/10 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1.5 bg-white shadow-2xs"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          <span>{language === 'bn' ? '+ নতুন বর্তমান ট্রাস্টি যোগ করুন' : '+ Add Current Trustee'}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingPage({
                                              ...editingPage,
                                              sections: [
                                                ...editingPage.sections,
                                                { title: language === 'bn' ? 'নতুন সাবেক ট্রাস্টি' : 'New Former Trustee', is_former: true, period: language === 'bn' ? '১৯৭৮ - ২০২৪' : '1978 - 2024', content: [""] }
                                              ]
                                            });
                                          }}
                                          className="px-3.5 py-2 border border-dashed border-[#8B621B] text-[#8B621B] hover:bg-[#8B621B]/10 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1.5 bg-amber-50/40 shadow-2xs"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          <span>{language === 'bn' ? '+ নতুন সাবেক ট্রাস্টি যোগ করুন' : '+ Add Former Trustee'}</span>
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPage({
                                            ...editingPage,
                                            sections: [
                                              ...editingPage.sections,
                                              { title: language === 'bn' ? 'নতুন অনুচ্ছেদ' : 'New Section', content: [""] }
                                            ]
                                          });
                                        }}
                                        className="px-3.5 py-2 border border-dashed border-[#2E5942]/40 text-[#2E5942] hover:bg-[#2E5942]/5 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>{language === 'bn' ? 'নতুন সেকশন যোগ করুন' : 'Add New Section'}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t pt-4 flex items-center justify-between">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPage(null)}
                                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                                >
                                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই পেজের ডিফল্ট কন্টেন্ট ফিরে পেতে চান?' : 'Are you sure you want to reset this page to default content?')) {
                                      const mod = await import('../data/website_content.json');
                                      const raw = mod.default.find(p => p.id === editingPage.id);
                                      if (raw) {
                                        setEditingPage(JSON.parse(JSON.stringify(raw)));
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer transition"
                                >
                                  {language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Default'}
                                </button>
                              </div>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-[#2E5942] text-white rounded-xl text-xs font-bold shadow-md hover:scale-102 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {saving ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span>{language === 'bn' ? 'পৃষ্ঠা সংরক্ষণ করুন' : 'Save Page Content'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* RIGHT: REAL-TIME PREVIEW PANEL */}
                        <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-4">
                          {(() => {
                            const activePreviewLang = previewLanguage || language;
                            return (
                              <div className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md overflow-hidden flex flex-col">
                                {/* Browser Header Bar */}
                                <div className="bg-stone-100 border-b border-[#E8DDD0] px-4 py-3 flex items-center justify-between gap-3 select-none">
                                  {/* macOS style Window Buttons */}
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                                  </div>
                                  
                                  {/* Mock Address Bar */}
                                  <div className="bg-white border border-stone-200 text-stone-500 rounded-md px-3 py-1 text-[11px] font-mono flex items-center gap-1.5 flex-1 max-w-xs md:max-w-md truncate justify-center select-all">
                                    <span className="text-[#2E5942] font-semibold">https://</span>
                                    <span>bskbd.org/{activePreviewLang}/pages/{editingPage.id}</span>
                                  </div>

                                  {/* Live Language Toggler inside mock frame */}
                                  <div className="flex items-center bg-stone-200 p-0.5 rounded-lg border border-stone-300 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewLanguage('bn')}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                        activePreviewLang === 'bn'
                                          ? 'bg-white text-[#1A1207] shadow-xs'
                                          : 'text-stone-600 hover:text-stone-900'
                                      }`}
                                    >
                                      বাংলা
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewLanguage('en')}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                        activePreviewLang === 'en'
                                          ? 'bg-white text-[#1A1207] shadow-xs'
                                          : 'text-stone-600 hover:text-stone-900'
                                      }`}
                                    >
                                      EN
                                    </button>
                                  </div>
                                </div>

                                <div className="p-4 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                                  <span className="text-[10px] font-sans text-stone-500 font-medium">
                                    {language === 'bn' ? 'রিয়েল-টাইম লাইভ কন্টেন্ট ভিউয়ার' : 'Real-Time Content Canvas'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                    <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-green-600">
                                      {language === 'bn' ? 'লাইভ সংযুক্ত' : 'Live Connected'}
                                    </span>
                                  </div>
                                </div>

                                {/* Scrollable Preview Frame */}
                                <div className="max-h-[70vh] overflow-y-auto p-4 bg-[#FAF7F2]/30 space-y-6 scrollbar-thin">
                                  {editingPage.id === 'press_contact' ? (
                                    <div className="space-y-6 w-full text-[#1A1207]">
                                      <div className="bg-white border border-[#E8DDD0] rounded-xl p-5 shadow-xs space-y-4">
                                        <div className="border-b border-stone-100 pb-3">
                                          <h4 className="font-serif font-bold text-sm text-[#2E5942]">
                                            {activePreviewLang === 'bn' ? 'মিডিয়া ও প্রেস জনসংযোগ সেকশন' : 'Media & Public Relations Section'}
                                          </h4>
                                          <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                                            {activePreviewLang === 'bn' ? 'প্রেস পেজ সেকশন ৫ প্রিভিউ' : 'Press Page Section 5 Preview'}
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Coordinator Contact Card */}
                                          <div className="p-4 bg-[#2E5942]/5 border border-[#2E5942]/10 rounded-lg space-y-2">
                                            <div className="text-[9px] font-bold text-[#2E5942] uppercase tracking-wider">
                                              {activePreviewLang === 'bn' 
                                                ? ((editingPage as any).mediaContactData?.coordinator_title_bn || 'মিডিয়া কো-অর্ডিনেটর')
                                                : ((editingPage as any).mediaContactData?.coordinator_title_en || 'Media Liaison Coordinator')
                                              }
                                            </div>
                                            <div className="font-serif font-extrabold text-sm text-stone-900">
                                              {activePreviewLang === 'bn'
                                                ? ((editingPage as any).mediaContactData?.coordinator_name_bn || '')
                                                : ((editingPage as any).mediaContactData?.coordinator_name_en || '')
                                              }
                                            </div>
                                            <div className="text-[10px] text-stone-600 font-sans">
                                              {activePreviewLang === 'bn'
                                                ? ((editingPage as any).mediaContactData?.coordinator_role_bn || '')
                                                : ((editingPage as any).mediaContactData?.coordinator_role_en || '')
                                              }
                                            </div>
                                            <div className="pt-2 border-t border-[#2E5942]/10 space-y-1 font-mono text-[10px] text-stone-700">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[#2E5942] font-semibold">Email:</span>
                                                <span>{(editingPage as any).mediaContactData?.coordinator_email || ''}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[#2E5942] font-semibold">Phone:</span>
                                                <span>{(editingPage as any).mediaContactData?.coordinator_phone || ''}</span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Desk / Hours Card */}
                                          <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-lg space-y-3 text-[10px]">
                                            <div className="space-y-0.5">
                                              <div className="font-bold text-stone-700">
                                                {activePreviewLang === 'bn'
                                                  ? ((editingPage as any).mediaContactData?.office_label_bn || 'কেন্দ্রীয় কার্যালয়:')
                                                  : ((editingPage as any).mediaContactData?.office_label_en || 'Central Corporate Desk:')
                                                }
                                              </div>
                                              <div className="text-stone-600">
                                                {activePreviewLang === 'bn'
                                                  ? ((editingPage as any).mediaContactData?.office_value_bn || '')
                                                  : ((editingPage as any).mediaContactData?.office_value_en || '')
                                                }
                                              </div>
                                            </div>

                                            <div className="space-y-0.5">
                                              <div className="font-bold text-stone-700">
                                                {activePreviewLang === 'bn'
                                                  ? ((editingPage as any).mediaContactData?.hours_label_bn || 'মিডিয়া ডেস্ক অফিস সময়:')
                                                  : ((editingPage as any).mediaContactData?.hours_label_en || 'Media Desks Duty Hours:')
                                                }
                                              </div>
                                              <div className="text-stone-600">
                                                {activePreviewLang === 'bn'
                                                  ? ((editingPage as any).mediaContactData?.hours_value_bn || '')
                                                  : ((editingPage as any).mediaContactData?.hours_value_en || '')
                                                }
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {((editingPage as any).mediaContactData?.note_bn || (editingPage as any).mediaContactData?.note_en) && (
                                          <div className="p-3 bg-[#B8862A]/5 border border-[#B8862A]/10 rounded-lg text-[10px] text-stone-700 leading-relaxed italic">
                                            {activePreviewLang === 'bn'
                                              ? ((editingPage as any).mediaContactData?.note_bn || '')
                                              : ((editingPage as any).mediaContactData?.note_en || '')
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : editingPage.id === 'trustees' ? (
                                    <div className="space-y-6 w-full">
                                      {/* Header / Intro Spotlight */}
                                      <div className="bg-[#1A1207] text-[#FAF7F2] rounded-xl p-4 md:p-5 relative overflow-hidden shadow-md border border-[#B8862A]/20">
                                        <div className="absolute top-2 left-4 text-4xl text-[#B8862A]/15 font-serif select-none pointer-events-none">“</div>
                                        <div className="relative z-10 space-y-2">
                                          <h1 className="font-serif text-base md:text-lg font-bold text-[#F0CC7A] flex items-center gap-2">
                                            <span className="w-1 h-5 bg-[#B8862A] rounded-full inline-block" />
                                            <span>{activePreviewLang === 'bn' ? editingPage.title_bn : editingPage.title_en}</span>
                                          </h1>
                                          
                                          {editingPage.sections[0] && (
                                            <div className="text-stone-300 leading-relaxed text-[11px] font-serif italic space-y-1 text-left">
                                              {editingPage.sections[0].content
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
                                      </div>

                                      {/* Trustees Grid */}
                                      {(() => {
                                        const allTrusteeSecs = editingPage.sections.filter((sec, idx) => idx > 0 && sec.title && sec.title !== editingPage.title_bn);
                                        const currentTrustees = allTrusteeSecs.filter(sec => !sec.is_former);
                                        const formerTrustees = allTrusteeSecs.filter(sec => sec.is_former === true);

                                        return (
                                          <div className="space-y-6">
                                            {/* Current Trustees */}
                                            {currentTrustees.length > 0 && (
                                              <div className="space-y-3">
                                                <div className="text-xs font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-1 flex items-center gap-2 font-serif">
                                                  <span className="w-1.5 h-3.5 bg-[#B8862A] rounded-full inline-block" />
                                                  <span>{activePreviewLang === 'bn' ? 'বর্তমান ট্রাস্টিমন্ডলী' : 'Current Trustees'}</span>
                                                </div>
                                                <div className="space-y-3">
                                                  {(currentTrustees || []).map((sec, idx) => {
                                                    const trusteeName = sec.title;
                                                    let trusteeImg = sec.image || "";
                                                    if (!trusteeImg) {
                                                      if (trusteeName.includes("আবদুল্লাহ") || trusteeName.includes("সায়ীদ") || trusteeName.includes("Sayeed")) {
                                                        trusteeImg = "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg";
                                                      }
                                                    }
                                                    const initialLetter = trusteeName.trim().charAt(0) || 'T';

                                                    return (
                                                      <div 
                                                        key={idx}
                                                        className="bg-white rounded-xl border border-[#E8DDD0] shadow-2xs overflow-hidden flex flex-col md:flex-row p-3.5 gap-3"
                                                      >
                                                        <div className="flex flex-col items-center text-center shrink-0 w-full md:w-32">
                                                          <div className="relative">
                                                            {trusteeImg ? (
                                                              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#B8862A] p-0.5 bg-white shadow-2xs">
                                                                <img 
                                                                  src={trusteeImg} 
                                                                  alt={trusteeName} 
                                                                  className="w-full h-full object-cover rounded-full"
                                                                  referrerPolicy="no-referrer"
                                                                />
                                                              </div>
                                                            ) : (
                                                              <div className="w-16 h-16 rounded-full bg-[#1A1207] border border-[#B8862A]/60 flex items-center justify-center text-[#F0CC7A] shadow-2xs">
                                                                <div className="text-lg font-serif font-extrabold">
                                                                  {initialLetter}
                                                                </div>
                                                              </div>
                                                            )}
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold tracking-wider uppercase bg-[#B8862A] text-stone-950 border border-white">
                                                                {activePreviewLang === 'bn' ? 'ট্রাস্টি' : 'Trustee'}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div className="mt-2">
                                                            <h4 className="font-serif font-bold text-[#1A1207] text-xs leading-snug">
                                                              {trusteeName}
                                                            </h4>
                                                          </div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center space-y-1.5 border-t md:border-t-0 md:border-l border-stone-100 pt-2.5 md:pt-0 md:pl-3">
                                                          {sec.content
                                                            .filter(p => p !== trusteeName && p.length > 5)
                                                            .map((pText, pIdx) => (
                                                              <p key={pIdx} className="text-stone-700 text-[10px] md:text-[11px] leading-relaxed font-sans text-left">
                                                                {pText}
                                                              </p>
                                                            ))}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}

                                            {/* Former Trustees */}
                                            {formerTrustees.length > 0 && (
                                              <div className="space-y-3 pt-2">
                                                <div className="text-xs font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-1 flex items-center gap-2 font-serif">
                                                  <span className="w-1.5 h-3.5 bg-[#8B621B] rounded-full inline-block" />
                                                  <span>{activePreviewLang === 'bn' ? 'সাবেক ট্রাস্টিবৃন্দ' : 'Former Trustees'}</span>
                                                </div>
                                                <div className="space-y-3">
                                                  {(formerTrustees || []).map((sec, idx) => {
                                                    const trusteeName = sec.title;
                                                    let trusteeImg = sec.image || "";
                                                    const initialLetter = trusteeName.trim().charAt(0) || 'T';

                                                    return (
                                                      <div 
                                                        key={idx}
                                                        className="bg-[#FAF7F2]/80 rounded-xl border border-[#E8DDD0] shadow-2xs overflow-hidden flex flex-col md:flex-row p-3.5 gap-3"
                                                      >
                                                        <div className="flex flex-col items-center text-center shrink-0 w-full md:w-32">
                                                          <div className="relative">
                                                            {trusteeImg ? (
                                                              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#8B621B]/50 p-0.5 bg-white shadow-2xs">
                                                                <img 
                                                                  src={trusteeImg} 
                                                                  alt={trusteeName} 
                                                                  className="w-full h-full object-cover rounded-full grayscale"
                                                                  referrerPolicy="no-referrer"
                                                                />
                                                              </div>
                                                            ) : (
                                                              <div className="w-16 h-16 rounded-full bg-[#2A231A] border border-[#B8862A]/40 flex items-center justify-center text-[#E5C378] shadow-2xs">
                                                                <div className="text-lg font-serif font-extrabold">
                                                                  {initialLetter}
                                                                </div>
                                                              </div>
                                                            )}
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold tracking-wider uppercase bg-[#8B621B] text-amber-50 border border-white whitespace-nowrap">
                                                                {activePreviewLang === 'bn' ? 'সাবেক' : 'Former'}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div className="mt-2 space-y-1">
                                                            <h4 className="font-serif font-bold text-[#1A1207] text-xs leading-snug">
                                                              {trusteeName}
                                                            </h4>
                                                            {sec.period && (
                                                              <span className="inline-block px-1.5 py-0.5 bg-[#B8862A]/10 text-[#8B621B] rounded text-[9px] font-bold font-sans">
                                                                {sec.period}
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-center space-y-1.5 border-t md:border-t-0 md:border-l border-stone-200 pt-2.5 md:pt-0 md:pl-3">
                                                          {sec.content
                                                            .filter(p => p !== trusteeName && p.length > 5)
                                                            .map((pText, pIdx) => (
                                                              <p key={pIdx} className="text-stone-700 text-[10px] md:text-[11px] leading-relaxed font-sans text-left">
                                                                {pText}
                                                              </p>
                                                            ))}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ) : editingPage.id === 'organogram' ? (
                                    <div className="space-y-4 w-full text-left">
                                      {/* Quick Preview Header */}
                                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#B8862A] bg-stone-100 py-1 px-2.5 rounded-md text-center border border-stone-200">
                                        {activePreviewLang === 'bn' ? 'সাংগঠনিক কাঠামো প্রিভিউ (অটো-ক্যাটাগরি)' : 'Administrative Hierarchy Preview (Auto-Categorized)'}
                                      </div>

                                      {/* Leadership Preview */}
                                      <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-[#1A1207] border-b border-stone-200 pb-1 flex items-center gap-1">
                                          <span className="w-1.5 h-3 bg-[#B8862A] rounded-full inline-block" />
                                          <span>{activePreviewLang === 'bn' ? 'নেতৃত্ব ও প্রশাসন' : 'Leadership & Admin'}</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                          {editingPage.sections
                                            .filter((sec, idx) => idx > 0 && !sec.title?.startsWith('বিভাগ'))
                                            .map((sec, idx) => {
                                              const leaderName = sec.title?.split(' - ')[0] || sec.title || '';
                                              const designation = sec.title?.split(' - ')[1] || '';
                                              let leaderImg = sec.image || '';
                                              if (!leaderImg && (leaderName.includes('আবদুল্লাহ') || leaderName.includes('সায়ীদ'))) {
                                                leaderImg = "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg";
                                              }
                                              const initialLetter = leaderName.trim().charAt(0) || 'L';
                                              
                                              return (
                                                <div key={idx} className="bg-white rounded-lg p-3 border border-stone-200 flex gap-3 text-left">
                                                  <div className="shrink-0">
                                                    {leaderImg ? (
                                                      <img src={leaderImg} alt="" className="w-11 h-11 rounded-full object-cover border border-[#B8862A]" referrerPolicy="no-referrer" />
                                                    ) : (
                                                      <div className="w-11 h-11 rounded-full bg-[#1A1207] text-[#F0CC7A] flex items-center justify-center text-[10px] font-serif font-bold border border-[#B8862A]/50">
                                                        {initialLetter}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-[#1A1207] text-xs font-serif truncate">{leaderName}</h4>
                                                    {designation && <p className="text-[9px] text-[#B8862A] font-bold">{designation}</p>}
                                                    {(sec?.content || []).map((pTxt, pI) => (
                                                      <p key={pI} className="text-[10px] text-stone-600 mt-1 font-sans line-clamp-2">{pTxt}</p>
                                                    ))}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>

                                      {/* Departments Preview */}
                                      <div className="space-y-3 pt-2">
                                        <h3 className="text-xs font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-1 flex items-center gap-1">
                                          <span className="w-1.5 h-3 bg-[#B8862A] rounded-full inline-block" />
                                          <span>{activePreviewLang === 'bn' ? 'বিভাগ ও দায়িত্বসমূহ' : 'Departments & Duties'}</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                          {editingPage.sections
                                            .filter((sec, idx) => idx > 0 && sec.title?.startsWith('বিভাগ'))
                                            .map((sec, idx) => {
                                              const deptTitle = sec.title?.replace('বিভাগ: ', '').replace('Department: ', '') || '';
                                              return (
                                                <div key={idx} className="bg-white rounded-lg p-3 border border-stone-200 text-left space-y-2">
                                                  <h4 className="font-bold text-xs text-[#1A1207] font-serif">{deptTitle}</h4>
                                                  {(sec?.content || []).map((pText, pIdx) => {
                                                    const isResponsibilities = pText.includes('দায়িত্বসমূহ:') || pText.includes('দায়িত্বসমূহ:') || pText.includes('Responsibilities:');
                                                    if (isResponsibilities) {
                                                      const parts = pText.split(':');
                                                      const bullets = (parts[1] || '').split(/[,|;]/).map(b => b.trim()).filter(b => b.length > 0);
                                                      return (
                                                        <div key={pIdx} className="space-y-1">
                                                          <p className="text-[10px] font-bold text-stone-700">{parts[0]}:</p>
                                                          <ul className="list-disc pl-4 text-[10px] text-stone-600 space-y-0.5">
                                                            {(bullets || []).map((b, bI) => <li key={bI}>{b}</li>)}
                                                          </ul>
                                                        </div>
                                                      );
                                                    }
                                                    return <p key={pIdx} className="text-[10px] text-stone-600 font-sans leading-relaxed">{pText}</p>;
                                                  })}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    </div>
                                  ) : editingPage.id === 'ataglance' ? (
                                    /* CUSTOM TABLE PREVIEW TO MATCH REDESIGNED MAIN PAGE */
                                    <div className="space-y-4 w-full text-left">
                                      <div className="border-b border-[#B8862A]/20 pb-2 text-left">
                                        <h1 className="font-serif text-sm font-bold text-[#1A1207] flex items-center gap-1.5">
                                          <span className="w-1 h-4 bg-[#B8862A] rounded-full inline-block" />
                                          <span>{activePreviewLang === 'bn' ? editingPage.title_bn : editingPage.title_en}</span>
                                        </h1>
                                      </div>
                                      
                                      {(() => {
                                        // Reuse the exact same translations and category structure as the main page
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
                                          const fact = editingPage.key_facts?.find((f: any) => f.label === label);
                                          return fact ? fact.value : defaultValue;
                                        };

                                        const previewCategories = [
                                          {
                                            titleBn: "১. প্রাতিষ্ঠানিক পরিচিতি ও পরিচালনা",
                                            titleEn: "1. Institutional Identity & Governance",
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
                                            items: [
                                              { label: "স্কুল ও কলেজ প্রোগ্রামে বইয়ের সংখ্যা", value: getFactValue("স্কুল ও কলেজ প্রোগ্রামে বইয়ের সংখ্যা", "১০ মিলিয়ন") },
                                              { label: "ভ্রাম্যমাণ লাইব্রেরিতে বইয়ের সংখ্যা", value: getFactValue("ভ্রাম্যমাণ লাইব্রেরিতে বইয়ের সংখ্যা", "৪৩০,০০০") },
                                              { label: "ভ্রাম্যমাণ লাইব্রেরির সদস্য সংখ্যা", value: getFactValue("ভ্রাম্যমাণ লাইব্রেরির সদস্য সংখ্যা", "৩০০,০০০") },
                                              { label: "মূল লাইব্রেরিতে বইয়ের সংখ্যা", value: getFactValue("মূল লাইব্রেরিতে বইয়ের সংখ্যা", "২০০,০০০") },
                                              { label: "লাইব্রেরি ব্যবহারকারীর সংখ্যা/ প্রতি বছর", value: getFactValue("লাইব্রেরি ব্যবহারকারীর সংখ্যা/ প্রতি বছর", "১৫,০০০") },
                                            ]
                                          },
                                          {
                                            titleBn: "৫. বাজেট, অর্থায়ন ও প্রকল্প",
                                            titleEn: "5. Budget, Finance & Programs",
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
                                          <div className="bg-white border border-[#B8862A]/40 rounded-xl overflow-hidden shadow-3xs text-[11px]">
                                            <table className="w-full text-left border-collapse font-sans">
                                              <thead>
                                                <tr className="bg-[#FAF6F0] border-b-2 border-[#B8862A]">
                                                  <th className="px-3 py-2 font-serif font-bold text-[#1A1207] w-12 text-center border-r border-[#B8862A]/30">
                                                    {activePreviewLang === 'bn' ? 'নং' : 'Sl.'}
                                                  </th>
                                                  <th className="px-3 py-2 font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/30 min-w-[100px]">
                                                    {activePreviewLang === 'bn' ? 'বিবরণ / সূচক' : 'Indicator'}
                                                  </th>
                                                  <th className="px-3 py-2 font-serif font-bold text-[#1A1207]">
                                                    {activePreviewLang === 'bn' ? 'তথ্য / পরিসংখ্যান' : 'Stats'}
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {previewCategories.map((category, categoryIdx) => (
                                                  <React.Fragment key={categoryIdx}>
                                                    <tr className="bg-[#FCFBF7] border-y border-[#B8862A]/30">
                                                      <td colSpan={3} className="px-3 py-1.5 bg-[#FAF6F0]/80">
                                                        <span className="font-serif text-[10px] font-extrabold tracking-tight text-[#1A1207]">
                                                          {activePreviewLang === 'bn' ? category.titleBn : category.titleEn}
                                                        </span>
                                                      </td>
                                                    </tr>
                                                    {(category?.items || []).map((item, itemIdx) => {
                                                      const labelText = activePreviewLang === 'bn' ? item.label : (labelTranslations[item.label] || item.label);
                                                      const valueText = activePreviewLang === 'bn' ? item.value : (valueTranslations[item.value] || item.value);
                                                      return (
                                                        <tr key={itemIdx} className="border-b border-[#B8862A]/20 hover:bg-[#FCFBF7]/50 odd:bg-white even:bg-[#FAF6F0]/10">
                                                          <td className="px-3 py-2 text-[10px] font-mono text-stone-500 text-center border-r border-[#B8862A]/20">
                                                            {categoryIdx + 1}.{itemIdx + 1}
                                                          </td>
                                                          <td className="px-3 py-2 text-[11px] font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/20 leading-relaxed">
                                                            {labelText}
                                                          </td>
                                                          <td className="px-3 py-2 text-[11px] font-sans font-medium text-[#1A1207] leading-relaxed">
                                                            {valueText}
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </React.Fragment>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ) : (
                                    // General page live preview
                                    <div className="space-y-4">
                                      <div className="border-b border-[#E8DDD0] pb-2 text-left">
                                        <h1 className="font-serif text-sm font-bold text-[#1A1207] flex items-center gap-1.5">
                                          <span className="w-1 h-4 bg-[#B8862A] rounded-full inline-block" />
                                          <span>{activePreviewLang === 'bn' ? editingPage.title_bn : editingPage.title_en}</span>
                                        </h1>
                                      </div>
                                      <div className="space-y-3">
                                        {(editingPage?.sections || []).map((sec, sIdx) => {
                                          if ((!sec.content || sec.content.length === 0) && !sec.title) return null;
                                          return (
                                            <div key={sIdx} className="space-y-2 bg-white p-3 rounded-xl border border-[#E8DDD0] shadow-xs text-left">
                                              {sec.title && sec.title !== editingPage.title_bn && (
                                                <h3 className="font-serif text-[11px] font-bold text-[#1A1207] border-b border-[#E8DDD0]/60 pb-1 flex items-center gap-1">
                                                  <span className="w-1 h-3 bg-[#B8862A] rounded-full inline-block" />
                                                  <span>{sec.title}</span>
                                                </h3>
                                              )}
                                              {sec.image && (
                                                <div className="w-full max-h-36 rounded-lg overflow-hidden border border-stone-100 bg-stone-50 flex justify-center items-center">
                                                  <img src={sec.image} className="max-w-full max-h-31 object-contain" alt="Section content" referrerPolicy="no-referrer" />
                                                </div>
                                              )}
                                              <div className="space-y-1.5 text-left">
                                                {(sec?.content || []).map((pText, pIdx) => (
                                                  <p key={pIdx} className="text-stone-700 text-[10px] leading-relaxed font-sans">
                                                    {pText}
                                                  </p>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* TAB 9: PROGRAMS PAGE COPIES */}
                {activeTab === 'facilities_cms' && (
                  <div className="space-y-4">
                    {!editingPage ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <h3 className="text-lg font-bold text-stone-900 font-serif">
                            {language === 'bn' ? '৩. সুযোগ-সুবিধা ও সেবাসমূহ পেজ এডিটর' : '3. Facilities & Services Pages Editor'}
                          </h3>
                          <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                            {language === 'bn' 
                              ? 'কেন্দ্রীয় লাইব্রেরি, অডিটোরিয়াম ও সেমিনার কক্ষ, বিশ্বসাহিত্য কেন্দ্র ভবন, ক্যাফেটেরিয়া ও বই শপের তথ্য ও পেজ কনটেন্ট এডিট করুন।' 
                              : 'Edit Central Library, Auditorium & Seminar Halls, BSK Central Building, Cafeteria Menu and Book Shop pages.'}
                          </p>
                        </div>

                        {/* List of facilities pages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'central-library', name_bn: 'কেন্দ্রীয় লাইব্রেরি সেবা', name_en: 'Central Library Services' },
                            { id: 'auditorium', name_bn: 'অডিটোরিয়াম ও সেমিনার হল', name_en: 'Auditoriums & Seminar Halls' },
                            { id: 'building', name_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন', name_en: 'BSK Central Building' },
                            { id: 'cafe', name_bn: 'ক্যাফেটেরিয়া ও ফুড মেনু', name_en: 'BSK Book Cafe' },
                            { id: 'bookshop', name_bn: 'বই বিক্রয় কেন্দ্র / বুকশপ', name_en: 'BSK Book Shop' }
                          ].map((pageInfo) => {
                            const isOverridden = pages.some(p => p.id === pageInfo.id);
                            return (
                              <div 
                                key={pageInfo.id}
                                className="bg-white p-4 justify-between flex items-center border border-[#E8DDD0] rounded-xl shadow-xs hover:border-[#B8862A] hover:bg-[#FAF7F2]/20 transition"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-[#2E5942]" />
                                    <span>{pageInfo.name_bn}</span>
                                  </h4>
                                  <p className="text-[10px] font-sans text-stone-500 flex items-center gap-1.5">
                                    <span className="font-mono text-stone-400">ID: {pageInfo.id}</span>
                                    {isOverridden ? (
                                      <span className="text-[#2E5942] font-semibold bg-[#2E5942]/10 px-1.5 py-0.5 rounded-sm">
                                        ✓ {language === 'bn' ? 'কাস্টমাইজড' : 'Custom Live'}
                                      </span>
                                    ) : (
                                      <span className="text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                        {language === 'bn' ? 'ডিফল্ট কপি' : 'Using Local Default'}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const defaultsMap: Record<string, any> = {
                                      'central-library': defaultCentralLibraryData || {},
                                      'auditorium': defaultAuditoriumData || {},
                                      'building': defaultBuildingData || {},
                                      'cafe': defaultCafeData || {},
                                      'bookshop': defaultBookShopData || {}
                                    };

                                    const match = pages.find(p => p.id === pageInfo.id);
                                    const rawJson = (websiteContentRaw as any[]).find(p => p.id === pageInfo.id) || {};
                                    const specialDefaults = defaultsMap[pageInfo.id] || {};

                                    const merged = {
                                      id: pageInfo.id,
                                      title_bn: pageInfo.name_bn,
                                      title_en: pageInfo.name_en,
                                      ...rawJson,
                                      ...specialDefaults,
                                      ...(match || {})
                                    };
                                    setEditingPage(JSON.parse(JSON.stringify(merged)));
                                  }}
                                  className="px-3.5 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Editing page sub-form */
                      editingPage && (
                        <div className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-md space-y-6 animate-fade-in font-sans text-left">
                          <div className="flex items-center justify-between border-b pb-4">
                            <div>
                              <h3 className="text-base font-bold text-stone-900 font-serif">
                                {language === 'bn' ? `সম্পাদনা: "${editingPage.title_bn || editingPage.id}"` : `Edit: "${editingPage.title_en || editingPage.id}"`}
                              </h3>
                              <span className="text-xs font-mono text-[#B8862A]">ID: {editingPage.id}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingPage(null)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer"
                            >
                              ← {language === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to list'}
                            </button>
                          </div>

                          <form onSubmit={savePageOverride} className="space-y-6">
                            {/* Render Specialized Editor according to page ID */}
                            {editingPage.id === 'central-library' && (
                              <CentralLibraryCMSEditor
                                editingPage={editingPage}
                                setEditingPage={setEditingPage}
                                language={language}
                                uploadImageToServer={uploadImageToServer}
                              />
                            )}

                            {editingPage.id === 'auditorium' && (
                              <AuditoriumCMSEditor
                                editingPage={editingPage}
                                setEditingPage={setEditingPage}
                                language={language}
                                uploadImageToServer={uploadImageToServer}
                              />
                            )}

                            {editingPage.id === 'building' && (
                              <BuildingCMSEditor
                                editingPage={editingPage}
                                setEditingPage={setEditingPage}
                                language={language}
                                uploadImageToServer={uploadImageToServer}
                              />
                            )}

                            {editingPage.id === 'cafe' && (
                              <CafeCMSEditor
                                editingPage={editingPage}
                                setEditingPage={setEditingPage}
                                language={language}
                                uploadImageToServer={uploadImageToServer}
                              />
                            )}

                            {editingPage.id === 'bookshop' && (
                              <BookShopCMSEditor
                                editingPage={editingPage}
                                setEditingPage={setEditingPage}
                                language={language}
                                uploadImageToServer={uploadImageToServer}
                              />
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t">
                              <button
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                              >
                                {language === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                                <span>{saving ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'পেজ তথ্য সংরক্ষণ করুন' : 'Save Page Changes')}</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeTab === 'programs_cms' && (
                  <div className="space-y-4">
                    {!editingPage ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <h3 className="text-lg font-bold text-stone-900 font-serif">
                            {language === 'bn' ? '৯. পরিষেবা, ভবন ও কার্যক্রম পেজসমূহ' : '9. Services, Building & Programs Pages'}
                          </h3>
                          <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                            {language === 'bn' 
                              ? 'অডিটোরিয়াম, ক্যাফেটেরিয়া, ভবন, প্রকাশনা, বই শপ ও কেন্দ্রটির সকল কার্যক্রমের বিবরণ ও তথ্য এডিট করুন।' 
                              : 'Customize static page texts, auditoriums, cafe menu, building details & BSK programs.'}
                          </p>
                        </div>

                        {/* List of default pages to select & edit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'nationwide-excellence', name_bn: '১. দেশভিত্তিক উৎকর্ষ কার্যক্রম', name_en: 'Nationwide Excellence Program' },
                            { id: 'reading-habit', name_bn: '২. পাঠাভ্যাস উন্নয়ন কর্মসূচি', name_en: 'Reading Habit Development' },
                            { id: 'mobile-library', name_bn: '৩. ভ্রাম্যমাণ লাইব্রেরি', name_en: 'Mobile Library' },
                            { id: 'book-fair', name_bn: '৪. ভ্রাম্যমাণ বইমেলা', name_en: 'Mobile Book Fair' },
                            { id: 'aalor-ishkool', name_bn: '৫. আলোর ইশকুল', name_en: 'Aalor Ishkool' },
                            { id: 'aalor-pathshala', name_bn: '৬. আলোর পাঠশালা', name_en: 'Aalor Pathshala' },
                            { id: 'bangalir_chinta', name_bn: '৭. বাঙালির চিন্তামূলক রচনা', name_en: 'Bengali Thought Program' },
                            { id: 'primary-teacher', name_bn: '৮. প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি', name_en: 'Primary Teachers Program' },
                            { id: 'publication', name_bn: '৯. প্রকাশনা ও প্রকাশনী', name_en: 'Publications' }
                          ].map((pageInfo) => {
                            // Find if we already customized this page in Firestore
                            const isOverridden = pages.some(p => p.id === pageInfo.id);
                            
                            return (
                              <div 
                                key={pageInfo.id}
                                className="bg-white p-4 justify-between flex items-center border border-[#E8DDD0] rounded-xl shadow-xs hover:border-[#B8862A] hover:bg-[#FAF7F2]/20 transition"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-[#2E5942]" />
                                    <span>{pageInfo.name_bn}</span>
                                  </h4>
                                  <p className="text-[10px] font-sans text-stone-500 flex items-center gap-1.5">
                                    <span className="font-mono text-stone-400">ID: {pageInfo.id}</span>
                                    {isOverridden ? (
                                      <span className="text-[#2E5942] font-semibold bg-[#2E5942]/10 px-1.5 py-0.5 rounded-sm">
                                        ✓ {language === 'bn' ? 'কাস্টমাইজড' : 'Custom Live'}
                                      </span>
                                    ) : (
                                      <span className="text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                        {language === 'bn' ? 'ডিফল্ট কপি' : 'Using Local Default'}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <button 
                                  onClick={() => {
                                    const defaultsMap: Record<string, any> = {
                                      'aalor-ishkool': defaultAalorIshkoolData,
                                      'auditorium': defaultAuditoriumData,
                                      'facilities': defaultAuditoriumData,
                                      'bangalir_chinta': defaultBangalirChintaData,
                                      'bangalir-chinta': defaultBangalirChintaData,
                                      'book-fair': defaultBookFairData,
                                      'bookshop': defaultBookShopData,
                                      'building': defaultBuildingData,
                                      'cafe': defaultCafeData,
                                      'donation': defaultDonationData,
                                      'mobile-library': defaultMobileLibraryData,
                                      'nationwide-excellence': defaultNationwideExcellenceData,
                                      'primary-teacher': defaultPrimaryTeacherData,
                                      'primary_teacher': defaultPrimaryTeacherData,
                                      'publication': {
                                        stats: defaultPublicationStats,
                                        publication_series: defaultPublicationSeriesList,
                                        catalogs: defaultPublicationCatalogs,
                                        gallery: defaultPublicationGallery
                                      }
                                    };

                                    const rawJson = (websiteContentRaw as any[]).find(p => p.id === pageInfo.id) || {};
                                    const specialDefaults = defaultsMap[pageInfo.id] || {};
                                    const ex = pages.find(p => p.id === pageInfo.id) || {};

                                    const merged = {
                                      id: pageInfo.id,
                                      title_bn: pageInfo.name_bn,
                                      title_en: pageInfo.name_en,
                                      ...rawJson,
                                      ...specialDefaults,
                                      ...ex
                                    };

                                    setEditingPage(JSON.parse(JSON.stringify(merged)));
                                  }}
                                  className="p-1.5 px-3 bg-[#2E5942]/10 hover:bg-[#2E5942]/20 text-[#2E5942] rounded-lg text-xs font-sans font-bold border border-[#2E5942]/15 transition cursor-pointer"
                                >
                                  {language === 'bn' ? 'লেখাসমূহ এডিট' : 'Edit Copy'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* EDIT WEBSITE PAGE FORM WITH REAL-TIME PREVIEW */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT: EDITING FORM */}
                        <div className="lg:col-span-7">
                          <form onSubmit={savePageOverride} className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6">
                            <div className="flex items-center justify-between border-b pb-3">
                              <button 
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                <span>{language === 'bn' ? 'ফিরে যান' : 'Back to pages list'}</span>
                              </button>
                              <h4 className="font-bold text-stone-950 font-serif">
                                {language === 'bn' ? `"${editingPage.title_bn}" পেজ কন্টেন্ট সংশোধন` : `Edit Copy for: ${editingPage.title_en}`}
                              </h4>
                              <div></div>
                            </div>

                            {/* Title Overrides and custom section edit fields */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান পেজ টাইটেল (বাংলা)' : 'Main Page Title (BN)'}</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_bn}
                                    onChange={(e) => setEditingPage({ ...editingPage, title_bn: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান পেজ টাইটেল (ইংরেজি)' : 'Main Page Title (EN)'}</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_en}
                                    onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>

                              {/* Specialized CMS Editors for All 9 Core Programs */}
                              {editingPage.id === 'nationwide-excellence' && (
                                <NationwideExcellenceCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {(editingPage.id === 'reading-habit' || editingPage.id === 'reading_habit') && (
                                <ReadingHabitCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {editingPage.id === 'mobile-library' && (
                                <MobileLibraryCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {editingPage.id === 'book-fair' && (
                                <BookFairCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {(editingPage.id === 'aalor-ishkool' || editingPage.id === 'aalor_ishkool') && (
                                <AalorIshkoolCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {(editingPage.id === 'aalor-pathshala' || editingPage.id === 'aalor_pathshala') && (
                                <AalorPathshalaCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {(editingPage.id === 'bangalir_chinta' || editingPage.id === 'bangalir-chinta') && (
                                <BangalirChintaCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {(editingPage.id === 'primary-teacher' || editingPage.id === 'primary_teacher') && (
                                <PrimaryTeacherCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}

                              {editingPage.id === 'publication' && (
                                <PublicationCMSEditor
                                  editingPage={editingPage}
                                  setEditingPage={setEditingPage}
                                  language={language}
                                  uploadImageToServer={uploadImageToServer}
                                />
                              )}
                            </div>

                            <div className="border-t pt-4 flex items-center justify-between">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPage(null)}
                                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                                >
                                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই পেজের ডিফল্ট কন্টেন্ট ফিরে পেতে চান?' : 'Are you sure you want to reset this page to default content?')) {
                                      const mod = await import('../data/website_content.json');
                                      const raw = mod.default.find(p => p.id === editingPage.id);
                                      if (raw) {
                                        setEditingPage(JSON.parse(JSON.stringify(raw)));
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer transition"
                                >
                                  {language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Default'}
                                </button>
                              </div>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-[#2E5942] text-white rounded-xl text-xs font-bold shadow-md hover:scale-102 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {saving ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span>{language === 'bn' ? 'পৃষ্ঠা সংরক্ষণ করুন' : 'Save Page Content'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* RIGHT: REAL-TIME PREVIEW PANEL */}
                        <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-4">
                          {(() => {
                            const activePreviewLang = previewLanguage || language;
                            return (
                              <div className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md overflow-hidden flex flex-col">
                                {/* Browser Header Bar */}
                                <div className="bg-stone-100 border-b border-[#E8DDD0] px-4 py-3 flex items-center justify-between gap-3 select-none">
                                  {/* macOS style Window Buttons */}
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                                  </div>
                                  
                                  {/* Mock Address Bar */}
                                  <div className="bg-white border border-stone-200 text-stone-500 rounded-md px-3 py-1 text-[11px] font-mono flex items-center gap-1.5 flex-1 max-w-xs md:max-w-md truncate justify-center select-all">
                                    <span className="text-[#2E5942] font-semibold">https://</span>
                                    <span>bskbd.org/{activePreviewLang}/programs/{editingPage.id}</span>
                                  </div>

                                  {/* Live Language Toggler inside mock frame */}
                                  <div className="flex items-center bg-stone-200 p-0.5 rounded-lg border border-stone-300 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewLanguage('bn')}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                        activePreviewLang === 'bn'
                                          ? 'bg-white text-[#1A1207] shadow-xs'
                                          : 'text-stone-600 hover:text-stone-900'
                                      }`}
                                    >
                                      বাংলা
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewLanguage('en')}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                        activePreviewLang === 'en'
                                          ? 'bg-white text-[#1A1207] shadow-xs'
                                          : 'text-stone-600 hover:text-stone-900'
                                      }`}
                                    >
                                      EN
                                    </button>
                                  </div>
                                </div>

                                <div className="p-4 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                                  <span className="text-[10px] font-sans text-stone-500 font-medium">
                                    {language === 'bn' ? 'রিয়েল-টাইম লাইভ কন্টেন্ট ভিউয়ার' : 'Real-Time Content Canvas'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                    <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-green-600">
                                      {language === 'bn' ? 'লাইভ সংযুক্ত' : 'Live Connected'}
                                    </span>
                                  </div>
                                </div>

                                {/* Scrollable Preview Frame */}
                                <div className="max-h-[70vh] overflow-y-auto p-4 bg-[#FAF7F2]/30 space-y-6 scrollbar-thin">
                                  {/* General page live preview */}
                                  <div className="space-y-4">
                                    <div className="border-b border-[#E8DDD0] pb-2 text-left">
                                      <h1 className="font-serif text-sm font-bold text-[#1A1207] flex items-center gap-1.5">
                                        <span className="w-1 h-4 bg-[#B8862A] rounded-full inline-block" />
                                        <span>{activePreviewLang === 'bn' ? editingPage.title_bn : editingPage.title_en}</span>
                                      </h1>
                                    </div>
                                    <div className="space-y-3">
                                      {(editingPage?.sections || []).map((sec, sIdx) => {
                                        if ((!sec.content || sec.content.length === 0) && !sec.title) return null;
                                        return (
                                          <div key={sIdx} className="space-y-2 bg-white p-3 rounded-xl border border-[#E8DDD0] shadow-xs text-left">
                                            {sec.title && sec.title !== editingPage.title_bn && (
                                              <h3 className="font-serif text-[11px] font-bold text-[#1A1207] border-b border-[#E8DDD0]/60 pb-1 flex items-center gap-1">
                                                <span className="w-1 h-3 bg-[#B8862A] rounded-full inline-block" />
                                                <span>{sec.title}</span>
                                              </h3>
                                            )}
                                            {sec.image && (
                                              <div className="w-full max-h-36 rounded-lg overflow-hidden border border-stone-100 bg-stone-50 flex justify-center items-center">
                                                <img src={sec.image} className="max-w-full max-h-31 object-contain" alt="Section content" referrerPolicy="no-referrer" />
                                              </div>
                                            )}
                                            <div className="space-y-1.5 text-left">
                                              {(sec?.content || []).map((pText, pIdx) => (
                                                <p key={pIdx} className="text-stone-700 text-[10px] leading-relaxed font-sans">
                                                  {pText}
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* TAB 4: HOMEPAGE TEXTS & CONTENT BLOCKS */}
                {activeTab === 'blocks' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs">
                      <h3 className="text-lg font-bold text-stone-900 font-serif">
                        {language === 'bn' ? '৪. হোমপেজ টেক্সট, ব্রত ও কন্টেন্ট ব্লকসমূহ' : '4. Homepage Blocks, Creed & Text Config'}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-1">
                        {language === 'bn' 
                          ? 'আমরা কারা, মূল ব্রত, প্রতিষ্ঠাতা বাণী, ইনফোগ্রাফ স্তম্ভ এবং পোর্টাল লিংকসমূহের কনটেন্ট কাস্টমাইজ করুন।' 
                          : 'Customize Who We Are, Core Creed Motto, Founder tribute toggles, Infograph pillars, and Portal links.'}
                      </p>

                      {/* Sub Tabs Selection bar */}
                      <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                        {[
                          { id: 'who_we_are', label_bn: 'আমরা কারা ও মূল ব্রত', label_en: 'Who We Are & Creed' },
                          { id: 'founder', label_bn: 'প্রতিষ্ঠাতা স্পটলাইট ও টগলস', label_en: 'Founder Tribute & Toggles' },
                          { id: 'infographic', label_bn: 'ইনফোগ্রাফ ও ৪টি স্তম্ভ', label_en: 'Infograph & 4 Pillars' },
                          { id: 'intro', label_bn: 'কোট ব্যানার', label_en: 'Quote Banner' },
                          { id: 'portals', label_bn: 'নেভিগেশন পোর্টাল লিংকসমূহ', label_en: 'Navigation Portal Links' }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setActiveSubBlock(sub.id as any)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              activeSubBlock === sub.id 
                                ? 'bg-[#2E5942] text-white shadow-xs' 
                                : 'bg-stone-100 text-[#2E5942] hover:bg-stone-200'
                            }`}
                          >
                            {language === 'bn' ? sub.label_bn : sub.label_en}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUB-BLOCK 1: WHO WE ARE & CORE CREED */}
                    {activeSubBlock === 'who_we_are' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-5 animate-fade-in font-sans">
                        <div className="border-b pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-stone-900 font-serif text-base flex items-center gap-2">
                              <span>🏛️</span>
                              <span>{language === 'bn' ? '“আমরা কারা” ও মূল ব্রত কন্টেন্ট এডিটর' : 'Who We Are & Core Creed Editor'}</span>
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {language === 'bn' ? 'হোমপেজ ও ব্রত-লক্ষ্য-উদ্দেশ্য পেজে এই তথ্য সরাসরি প্রদর্শিত হবে।' : 'Renders on Homepage Who We Are section and About Creed pages.'}
                            </p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const defaults = {
                                title_bn: "আমরা কারা",
                                title_en: "Who We Are",
                                subtitle_bn: "আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন",
                                subtitle_en: "A transformative nation-building movement cultivating enlightened minds and noble human values",
                                motto_bn: "মূল ব্রত: “আলোকিত মানুষ চাই”",
                                motto_en: "Core Creed: “We Want Enlightened Humans”",
                                established_bn: "প্রতিষ্ঠা: ১৭ ডিসেম্বর ১৯৭৮",
                                established_en: "Established: December 17, 1978",
                                paragraphs_bn: [
                                  "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।",
                                  "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।"
                                ],
                                paragraphs_en: [
                                  "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
                                  "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations."
                                ],
                                banner_image: "",
                                pillars: [
                                  {
                                    title_bn: 'দেশব্যাপী বইপড়া কর্মসূচি',
                                    title_en: 'Nationwide Reading',
                                    desc_bn: 'স্কুল-কলেজের শিক্ষার্থীদের মাঝে পাঠাভ্যাস ও মননশীলতা গড়ে তোলার প্রয়াস।',
                                    desc_en: 'Cultivating habitual reading in school and college students.',
                                    icon: '📚'
                                  },
                                  {
                                    title_bn: 'ভ্রাম্যমাণ লাইব্রেরি সেবা',
                                    title_en: 'Mobile Library Service',
                                    desc_bn: 'দেশজুড়ে পাঠকের দোরগোড়ায় সমৃদ্ধ বইয়ের বিশাল সম্ভার পৌঁছে দেওয়া।',
                                    desc_en: 'Delivering thousands of books right to reader doorsteps.',
                                    icon: '🚐'
                                  },
                                  {
                                    title_bn: 'পাঠচক্র ও উন্মুক্ত আলোচনা',
                                    title_en: 'Study Circles & Dialogues',
                                    desc_bn: 'বিশ্বের শ্রেষ্ঠ সাহিত্য ও দর্শন নিয়ে গভীর অধ্যয়ন এবং মুক্তচিন্তার বিকাশ।',
                                    desc_en: 'Deep studies in global literature and critical thought.',
                                    icon: '💡'
                                  },
                                  {
                                    title_bn: 'সাংস্কৃতিক উৎকর্ষ ও নেতৃত্ব',
                                    title_en: 'Cultural Excellence',
                                    desc_bn: 'শিল্প, সংগীত, চলচ্চিত্র ও মানবীয় মূল্যবোধে জাগ্রত মানবিক নেতৃত্ব গঠন।',
                                    desc_en: 'Developing leadership rooted in art and human dignity.',
                                    icon: '✨'
                                  }
                                ]
                              };
                              setWhoWeAreBlock(defaults);
                              saveHomepageBlock('who_we_are', defaults);
                            }}
                            className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2.5 py-1.5 font-bold rounded-lg hover:bg-[#B8862A]/20 transition cursor-pointer"
                          >
                            {language === 'bn' ? 'ডিফল্ট লেখা লোড করুন' : 'Load Default Who We Are'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (বাংলা)' : 'Main Title (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.title_bn || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, title_bn: e.target.value })}
                              placeholder="আমরা কারা"
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (ইংরেজি)' : 'Main Title (English)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.title_en || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, title_en: e.target.value })}
                              placeholder="Who We Are"
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উপশিরোনাম / স্লোগান (বাংলা)' : 'Subtitle / Tagline (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.subtitle_bn || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, subtitle_bn: e.target.value })}
                              placeholder="আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন"
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উপশিরোনাম / স্লোগান (ইংরেজি)' : 'Subtitle / Tagline (English)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.subtitle_en || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, subtitle_en: e.target.value })}
                              placeholder="A transformative nation-building movement cultivating enlightened minds"
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-emerald-800 block">✨ {language === 'bn' ? 'মূল ব্রত ব্যাজ লেখা (বাংলা)' : 'Core Motto Badge (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.motto_bn || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, motto_bn: e.target.value })}
                              placeholder="মূল ব্রত: “আলোকিত মানুষ চাই”"
                              className="w-full p-2.5 border border-emerald-300 rounded-lg bg-emerald-50/40"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-emerald-800 block">✨ {language === 'bn' ? 'মূল ব্রত ব্যাজ লেখা (ইংরেজি)' : 'Core Motto Badge (English)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.motto_en || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, motto_en: e.target.value })}
                              placeholder="Core Creed: “We Want Enlightened Humans”"
                              className="w-full p-2.5 border border-emerald-300 rounded-lg bg-emerald-50/40"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-amber-800 block">🏛️ {language === 'bn' ? 'প্রতিষ্ঠা তারিখ ব্যাজ (বাংলা)' : 'Established Date Badge (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.established_bn || whoWeAreBlock?.est_bn || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, established_bn: e.target.value, est_bn: e.target.value })}
                              placeholder="প্রতিষ্ঠা: ১৭ ডিসেম্বর ১৯৭৮"
                              className="w-full p-2.5 border border-amber-300 rounded-lg bg-amber-50/40"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-amber-800 block">🏛️ {language === 'bn' ? 'প্রতিষ্ঠা তারিখ ব্যাজ (ইংরেজি)' : 'Established Date Badge (English)'}</label>
                            <input 
                              type="text" 
                              value={whoWeAreBlock?.established_en || whoWeAreBlock?.est_en || ''} 
                              onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, established_en: e.target.value, est_en: e.target.value })}
                              placeholder="Established: December 17, 1978"
                              className="w-full p-2.5 border border-amber-300 rounded-lg bg-amber-50/40"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? '১ম অনুচ্ছেদ বিবরণী (বাংলা)' : 'Paragraph 1 (Bangla)'}</label>
                            <textarea 
                              rows={3} 
                              value={whoWeAreBlock?.paragraphs_bn?.[0] || ''} 
                              onChange={(e) => {
                                const arr = [...(whoWeAreBlock?.paragraphs_bn || ['', ''])];
                                arr[0] = e.target.value;
                                setWhoWeAreBlock({ ...whoWeAreBlock, paragraphs_bn: arr });
                              }}
                              placeholder="বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান..."
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? '১ম অনুচ্ছেদ বিবরণী (ইংরেজি)' : 'Paragraph 1 (English)'}</label>
                            <textarea 
                              rows={3} 
                              value={whoWeAreBlock?.paragraphs_en?.[0] || ''} 
                              onChange={(e) => {
                                const arr = [...(whoWeAreBlock?.paragraphs_en || ['', ''])];
                                arr[0] = e.target.value;
                                setWhoWeAreBlock({ ...whoWeAreBlock, paragraphs_en: arr });
                              }}
                              placeholder="Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement..."
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? '২য় অনুচ্ছেদ বিবরণী (বাংলা)' : 'Paragraph 2 (Bangla)'}</label>
                            <textarea 
                              rows={3} 
                              value={whoWeAreBlock?.paragraphs_bn?.[1] || ''} 
                              onChange={(e) => {
                                const arr = [...(whoWeAreBlock?.paragraphs_bn || ['', ''])];
                                arr[1] = e.target.value;
                                setWhoWeAreBlock({ ...whoWeAreBlock, paragraphs_bn: arr });
                              }}
                              placeholder="আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”..."
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? '২য় অনুচ্ছেদ বিবরণী (ইংরেজি)' : 'Paragraph 2 (English)'}</label>
                            <textarea 
                              rows={3} 
                              value={whoWeAreBlock?.paragraphs_en?.[1] || ''} 
                              onChange={(e) => {
                                const arr = [...(whoWeAreBlock?.paragraphs_en || ['', ''])];
                                arr[1] = e.target.value;
                                setWhoWeAreBlock({ ...whoWeAreBlock, paragraphs_en: arr });
                              }}
                              placeholder="Guided by our defining creed “We Want Enlightened Humans”..."
                              className="w-full p-2.5 border rounded-lg"
                            />
                          </div>

                          {/* Banner Image Upload */}
                          <div className="space-y-1 md:col-span-2 border-t pt-3">
                            <label className="font-bold text-stone-700 block">🖼️ {language === 'bn' ? 'সেকশন ব্যানার ছবি (ঐচ্ছিক)' : 'Section Banner Image (Optional)'}</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={whoWeAreBlock?.banner_image || whoWeAreBlock?.image || ''} 
                                onChange={(e) => setWhoWeAreBlock({ ...whoWeAreBlock, banner_image: e.target.value, image: e.target.value })}
                                placeholder="/assets/IMGS/..."
                                className="flex-1 p-2.5 border rounded-lg font-mono text-xs"
                              />
                              <label className="px-3.5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={isDirectUploading}
                                  onChange={(e) => handleDirectImageUpload(e, (url) => {
                                    setWhoWeAreBlock({ ...whoWeAreBlock, banner_image: url, image: url });
                                  })}
                                />
                                <Upload className={`h-3.5 w-3.5 ${isDirectUploading ? 'animate-spin' : ''}`} />
                                <span>{isDirectUploading ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (language === 'bn' ? 'ছবি আপলোড' : 'Upload Image')}</span>
                              </label>
                            </div>
                          </div>

                          {/* 4 Pillars Mini-Cards */}
                          <div className="space-y-3 md:col-span-2 border-t pt-4">
                            <h5 className="font-bold text-stone-900 text-xs font-serif flex items-center gap-2">
                              <span>🌟</span>
                              <span>{language === 'bn' ? '৪টি প্রধান ইনফোগ্রাফ স্তম্ভ/কার্ডসমূহ' : '4 Core Infograph Pillars'}</span>
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[0, 1, 2, 3].map((idx) => {
                                const currentPillars = whoWeAreBlock?.pillars || [
                                  { title_bn: 'দেশব্যাপী বইপড়া কর্মসূচি', title_en: 'Nationwide Reading', desc_bn: 'স্কুল-কলেজের শিক্ষার্থীদের মাঝে পাঠাভ্যাস ও মননশীলতা গড়ে তোলার প্রয়াস।', desc_en: 'Cultivating habitual reading in school and college students.', icon: '📚' },
                                  { title_bn: 'ভ্রাম্যমাণ লাইব্রেরি সেবা', title_en: 'Mobile Library Service', desc_bn: 'দেশজুড়ে পাঠকের দোরগোড়ায় সমৃদ্ধ বইয়ের বিশাল সম্ভার পৌঁছে দেওয়া।', desc_en: 'Delivering thousands of books right to reader doorsteps.', icon: '🚐' },
                                  { title_bn: 'পাঠচক্র ও উন্মুক্ত আলোচনা', title_en: 'Study Circles & Dialogues', desc_bn: 'বিশ্বের শ্রেষ্ঠ সাহিত্য ও দর্শন নিয়ে গভীর অধ্যয়ন এবং মুক্তচিন্তার বিকাশ।', desc_en: 'Deep studies in global literature and critical thought.', icon: '💡' },
                                  { title_bn: 'সাংস্কৃতিক উৎকর্ষ ও নেতৃত্ব', title_en: 'Cultural Excellence', desc_bn: 'শিল্প, সংগীত, চলচ্চিত্র ও মানবীয় মূল্যবোধে জাগ্রত মানবিক নেতৃত্ব গঠন।', desc_en: 'Developing leadership rooted in art and human dignity.', icon: '✨' }
                                ];
                                const pil = currentPillars[idx] || {};

                                const updatePillar = (key: string, val: string) => {
                                  const updated = JSON.parse(JSON.stringify(currentPillars));
                                  if (!updated[idx]) updated[idx] = {};
                                  updated[idx][key] = val;
                                  setWhoWeAreBlock({ ...whoWeAreBlock, pillars: updated });
                                };

                                return (
                                  <div key={idx} className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-[10px] font-bold text-[#B8862A]">কার্ড #{idx + 1}</span>
                                      <input 
                                        type="text" 
                                        value={pil.icon || '🌟'} 
                                        onChange={(e) => updatePillar('icon', e.target.value)}
                                        className="w-10 text-center p-1 text-sm border rounded bg-white"
                                        title="Icon / Emoji"
                                      />
                                    </div>
                                    <input 
                                      type="text" 
                                      value={pil.title_bn || ''} 
                                      onChange={(e) => updatePillar('title_bn', e.target.value)}
                                      placeholder="শিরোনাম (বাংলা)"
                                      className="w-full p-2 text-xs border rounded bg-white"
                                    />
                                    <input 
                                      type="text" 
                                      value={pil.title_en || ''} 
                                      onChange={(e) => updatePillar('title_en', e.target.value)}
                                      placeholder="Title (English)"
                                      className="w-full p-2 text-xs border rounded bg-white"
                                    />
                                    <textarea 
                                      rows={2} 
                                      value={pil.desc_bn || ''} 
                                      onChange={(e) => updatePillar('desc_bn', e.target.value)}
                                      placeholder="সংক্ষিপ্ত বিবরণী (বাংলা)"
                                      className="w-full p-2 text-xs border rounded bg-white"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        <div className="pt-3 border-t flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveHomepageBlock('who_we_are', whoWeAreBlock || {})}
                            className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>{language === 'bn' ? '“আমরা কারা” পরিবর্তন সংরক্ষণ করুন' : 'Save Who We Are Content'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-BLOCK 2: FOUNDER TRIBUTE & TOGGLES */}
                    {activeSubBlock === 'founder' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-5 animate-fade-in font-sans">
                        <div className="border-b pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-stone-900 font-serif text-base flex items-center gap-2">
                              <span>👤</span>
                              <span>{language === 'bn' ? 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ প্রোফাইল ও টগল কন্ট্রোল' : 'Founder Tribute Profile & Toggle Controls'}</span>
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {language === 'bn' ? 'বাটন, ভিজিটর কাউন্টার এবং ব্যাজসমূহ অন/অফ করার সুবিধা।' : 'Manage visibility of biography button, visitor counters, and tags.'}
                            </p>
                          </div>
                          {!founderBlock && (
                            <button 
                              type="button"
                              onClick={() => {
                                const defaults = {
                                  name_bn: "অধ্যাপক আবদুল্লাহ আবু সায়ীদ",
                                  name_en: "Prof. Abdullah Abu Sayeed",
                                  subtitle_bn: "",
                                  subtitle_en: "",
                                  quote_bn: "“মানুষ তার স্বপ্নের সমান বড়।”",
                                  quote_en: "“A human is as grand as their dreams.”",
                                  philosophy_bn: "বিংশ শতাব্দীর শেষভাগে বাংলাদেশে বইপড়া আন্দোলনের জোয়ার এনে আলোকিত মানুষ গড়ার কারিগর অধ্যাপক আবদুল্লাহ আবু সায়ীদ। তাঁর নেতৃত্বে দেশজুড়ে লাখ লাখ কিশোর ও তরুণ হৃদয়ে বিশ্বমানের চিন্তা ও মনুষ্যত্বের দীপাবলি প্রজ্বলন করা সম্ভব হচ্ছে। শিক্ষাদান ও সামাজিক জাগরণে তাঁর অবদানের জন্য ২০০৪ সালে সম্মানজনক র‍্যামন ম্যাগসেসে পুরস্কার এবং ২০০৫ সালে বাংলাদেশ সরকারের একুশে পদকে ভূষিত হন।",
                                  philosophy_en: "Prof. Abdullah Abu Sayeed, an esteemed visionary, initiated a nationwide reading movement in late 20th century Bangladesh. Under his stellar guidance, millions of adolescent minds discover critical reading routines. For his services to societal enlightenment, he was awarded the Magsaysay Award in 2004 and the Ekushey Padak in 2005.",
                                  badge1_bn: "র‍্যামন ম্যাগসেসে পুরস্কার (২০০৪)",
                                  badge1_en: "Ramon Magsaysay Award (2004)",
                                  badge2_bn: "একুশে পদক (২০০৫)",
                                  badge2_en: "Ekushey Padak (2005)",
                                  badge3_bn: "বাংলা একাডেমি ফেলো",
                                  badge3_en: "Bangla Academy Fellow",
                                  image: "/assets/IMGS/ABOUT_PAGE_FOUNDER/p_abu_sayed.jpg",
                                  show_btn: true,
                                  btn_text_bn: "জীবনী ও সাক্ষাৎকার পড়ুন",
                                  btn_text_en: "Read Biography & Interviews",
                                  btn_route: "founder",
                                  show_visitor_counter: true,
                                  visitor_count: "১৫,৩২০+",
                                  visitor_label_bn: "জন ভিজিটর দেখেছেন",
                                  show_badges: true,
                                  show_quote: true,
                                  show_philosophy: true,
                                  image_position: "left"
                                };
                                setFounderBlock(defaults);
                                saveHomepageBlock('founder', defaults);
                              }}
                              className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2.5 py-1.5 font-bold rounded-lg hover:bg-[#B8862A]/20 transition"
                            >
                              {language === 'bn' ? 'ডিফল্ট ডাটা সচল করুন' : 'Load Default Founder Bio'}
                            </button>
                          )}
                        </div>

                        {/* TOGGLE CONTROLS BAR */}
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {/* Toggle 1: Biography Button */}
                          <label className="flex items-center gap-3 p-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#2E5942] transition">
                            <input 
                              type="checkbox" 
                              checked={founderBlock?.show_btn !== false} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, show_btn: e.target.checked })}
                              className="h-4 w-4 rounded text-[#2E5942] focus:ring-[#2E5942]"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'বাটন প্রদর্শন (On/Off)' : 'Show Action Button'}</span>
                              <span className="text-[10px] text-stone-500 block">{language === 'bn' ? '“জীবনী পড়ুন” বাটন অন/অফ' : 'Toggle biography link button'}</span>
                            </div>
                          </label>

                          {/* Toggle 2: Visitor Counter */}
                          <label className="flex items-center gap-3 p-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#2E5942] transition">
                            <input 
                              type="checkbox" 
                              checked={founderBlock?.show_visitor_counter !== false} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, show_visitor_counter: e.target.checked })}
                              className="h-4 w-4 rounded text-[#2E5942] focus:ring-[#2E5942]"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'ভিজিটর কাউন্টার (On/Off)' : 'Show Visitor Counter'}</span>
                              <span className="text-[10px] text-stone-500 block">{language === 'bn' ? '“১৫,৩২০+ ভিজিটর” বক্স অন/অফ' : 'Toggle live visitor counter'}</span>
                            </div>
                          </label>

                          {/* Toggle 3: Badges */}
                          <label className="flex items-center gap-3 p-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#2E5942] transition">
                            <input 
                              type="checkbox" 
                              checked={founderBlock?.show_badges !== false} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, show_badges: e.target.checked })}
                              className="h-4 w-4 rounded text-[#2E5942] focus:ring-[#2E5942]"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'সম্মাননা ব্যাজ (On/Off)' : 'Show Awards Badges'}</span>
                              <span className="text-[10px] text-stone-500 block">{language === 'bn' ? 'ম্যাগসেসে ও পদক ব্যাজ অন/অফ' : 'Toggle award tag pills'}</span>
                            </div>
                          </label>

                          {/* Toggle 4: Quote Box */}
                          <label className="flex items-center gap-3 p-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#2E5942] transition">
                            <input 
                              type="checkbox" 
                              checked={founderBlock?.show_quote !== false} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, show_quote: e.target.checked })}
                              className="h-4 w-4 rounded text-[#2E5942] focus:ring-[#2E5942]"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'প্রধান উক্তি বক্স (On/Off)' : 'Show Quote Box'}</span>
                              <span className="text-[10px] text-stone-500 block">{language === 'bn' ? 'বড় উক্তি কোটেশন অন/অফ' : 'Toggle highlighted quote'}</span>
                            </div>
                          </label>

                          {/* Toggle 5: Philosophy Description */}
                          <label className="flex items-center gap-3 p-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#2E5942] transition">
                            <input 
                              type="checkbox" 
                              checked={founderBlock?.show_philosophy !== false} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, show_philosophy: e.target.checked })}
                              className="h-4 w-4 rounded text-[#2E5942] focus:ring-[#2E5942]"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'পরিচিতি অনুচ্ছেদ (On/Off)' : 'Show Bio Text'}</span>
                              <span className="text-[10px] text-stone-500 block">{language === 'bn' ? 'বিস্তারিত পরিচিতি অন/অফ' : 'Toggle narrative paragraph'}</span>
                            </div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.name_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, name_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.name_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, name_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'পদবী (বাংলা)' : 'Subtitle (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.subtitle_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, subtitle_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'পদবী (ইংরেজি)' : 'Subtitle (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.subtitle_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, subtitle_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.btn_text_bn !== undefined ? founderBlock.btn_text_bn : 'জীবনী ও সাক্ষাৎকার পড়ুন'} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, btn_text_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'বাটন টেক্সট (ইংরেজি)' : 'Button Text (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.btn_text_en !== undefined ? founderBlock.btn_text_en : 'Read Biography & Interviews'} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, btn_text_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'দর্শনার্থী/ভিউয়ার সংখ্যা' : 'Visitor count'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.visitor_count || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, visitor_count: e.target.value })}
                              placeholder="১৫,৩২০+"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'দর্শনার্থী লেবেল (বাংলা)' : 'Visitor Label (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.visitor_label_bn || 'জন ভিজিটর দেখেছেন'} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, visitor_label_bn: e.target.value })}
                              placeholder="জন ভিজিটর দেখেছেন"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান উক্তি (বাংলা)' : 'Quote (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.quote_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, quote_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান উক্তি (ইংরেজি)' : 'Quote (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.quote_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, quote_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'দর্শন ও পরিচিতি নোট (বাংলা)' : 'Philosophy details (Bangla)'}</label>
                            <textarea 
                              rows={3} 
                              value={founderBlock?.philosophy_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, philosophy_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'দর্শন ও পরিচিতি নোট (ইংরেজি)' : 'Philosophy details (English)'}</label>
                            <textarea 
                              rows={3} 
                              value={founderBlock?.philosophy_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, philosophy_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ ১ (বাংলা)' : 'Badge 1 (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.badge1_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, badge1_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ ১ (ইংরেজি)' : 'Badge 1 (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.badge1_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, badge1_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ ২ (বাংলা)' : 'Badge 2 (Bangla)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.badge2_bn || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, badge2_bn: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ ২ (ইংরেজি)' : 'Badge 2 (English)'}</label>
                            <input 
                              type="text" 
                              value={founderBlock?.badge2_en || ''} 
                              onChange={(e) => setFounderBlock({ ...founderBlock, badge2_en: e.target.value })}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'হোমপেজে ছবির অবস্থান' : 'Portrait Image Position'}</label>
                            <select
                              value={founderBlock?.image_position || 'left'}
                              onChange={(e) => setFounderBlock({ ...founderBlock, image_position: e.target.value })}
                              className="w-full p-2 border rounded-lg bg-white"
                            >
                              <option value="left">{language === 'bn' ? 'বামে (ডিফল্ট)' : 'Left (Default)'}</option>
                              <option value="right">{language === 'bn' ? 'ডানে' : 'Right'}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রতিষ্ঠাতার প্রতিকৃতি ছবি' : 'Portrait Image'}</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={founderBlock?.image || ''} 
                                onChange={(e) => setFounderBlock({ ...founderBlock, image: e.target.value })}
                                className="flex-1 p-2 border rounded-lg text-xs font-mono"
                              />
                              <label className="px-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={isDirectUploading}
                                  onChange={(e) => handleDirectImageUpload(e, (url) => {
                                    setFounderBlock({ ...founderBlock, image: url });
                                  })}
                                />
                                <Upload className={`h-3.5 w-3.5 ${isDirectUploading ? 'animate-spin' : ''}`} />
                                <span>{isDirectUploading ? '...' : (language === 'bn' ? 'আপলোড' : 'Upload')}</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveHomepageBlock('founder', founderBlock || {})}
                            className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>{language === 'bn' ? 'প্রতিষ্ঠাতা প্রোফাইল সংরক্ষণ করুন' : 'Save Founder Profile'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-BLOCK 3: INFOGRAPHIC & 4 SHOWCASE CARDS */}
                    {activeSubBlock === 'infographic' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-5 animate-fade-in font-sans">
                        <div className="border-b pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-stone-900 font-serif text-base flex items-center gap-2">
                              <span>📊</span>
                              <span>{language === 'bn' ? 'ইনফোগ্রাফ ও ৪টি কার্যক্রম ফটো হাইলাইটস' : 'Infographic & 4-Photo Showcase Grid'}</span>
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {language === 'bn' ? 'হোমপেজে প্রদর্শিত ৪টি বড় ছবি বা ফুল-উইডথ ইনফোগ্রাফ ব্যানার পরিবর্তন করুন।' : 'Update the 4-photo showcase grid or single wide infograph banner.'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন শিরোনাম (বাংলা)' : 'Header Title (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={infographicBlock?.header_title_bn || ''} 
                                onChange={(e) => setInfographicBlock({ ...infographicBlock, header_title_bn: e.target.value })}
                                placeholder="বিশ্বসাহিত্য কেন্দ্র ফটো হাইলাইটস"
                                className="w-full p-2.5 border rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন শিরোনাম (ইংরেজি)' : 'Header Title (English)'}</label>
                              <input 
                                type="text" 
                                value={infographicBlock?.header_title_en || ''} 
                                onChange={(e) => setInfographicBlock({ ...infographicBlock, header_title_en: e.target.value })}
                                placeholder="BSK Activity Showcase"
                                className="w-full p-2.5 border rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Full Section Wide Banner Image */}
                          <div className="p-4 bg-stone-50 border rounded-xl space-y-2">
                            <label className="font-bold text-stone-800 block flex items-center gap-2">
                              <span>🖼️</span>
                              <span>{language === 'bn' ? 'ফুল-উইডথ ইনফোগ্রাফ ব্যানার ছবি (১টি বড় ছবি দিলে ৪টি কার্ডের জায়গায় এটি আসবে)' : 'Full Wide Infograph Banner (Replaces 4-grid if set)'}</span>
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={infographicBlock?.section_image || infographicBlock?.banner_image || ''} 
                                onChange={(e) => setInfographicBlock({ ...infographicBlock, section_image: e.target.value, banner_image: e.target.value })}
                                placeholder="https://... বা /assets/IMGS/..."
                                className="flex-1 p-2 border rounded-lg font-mono text-xs bg-white"
                              />
                              <label className="px-3.5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden"
                                  disabled={isDirectUploading}
                                  onChange={(e) => handleDirectImageUpload(e, (url) => {
                                    setInfographicBlock({ ...infographicBlock, section_image: url, banner_image: url });
                                  })}
                                />
                                <Upload className={`h-3.5 w-3.5 ${isDirectUploading ? 'animate-spin' : ''}`} />
                                <span>{isDirectUploading ? '...' : (language === 'bn' ? 'আপলোড' : 'Upload')}</span>
                              </label>
                            </div>
                          </div>

                          {/* 4 Individual Image Slots */}
                          <div className="space-y-3 pt-2">
                            <h5 className="font-bold text-stone-800 text-xs font-serif">{language === 'bn' ? '৪টি আলাদা ফটো স্লাইড স্লট:' : '4 Showcase Photo Grid Slots:'}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[0, 1, 2, 3].map((sIdx) => {
                                const defaultShowcases = [
                                  "/assets/IMGS/482986950_1054527260032088_5237943853609018055_n.jpg",
                                  "/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg",
                                  "/assets/IMGS/493897528_1088721239946023_8232102595073591871_n.jpg",
                                  "/assets/IMGS/534826832_1175889297895883_7988975073499309288_n.jpg"
                                ];
                                const rawItems = Array.isArray(infographicBlock?.items) ? infographicBlock.items : [];
                                const item = rawItems[sIdx] || { image: defaultShowcases[sIdx] };

                                const updateSlotImg = (url: string) => {
                                  const copy = [...rawItems];
                                  while (copy.length <= sIdx) copy.push({});
                                  copy[sIdx] = { ...copy[sIdx], image: url };
                                  setInfographicBlock({ ...infographicBlock, items: copy });
                                };

                                return (
                                  <div key={sIdx} className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-[10px] font-bold text-[#B8862A]">ফটো স্লট #{sIdx + 1}</span>
                                    </div>
                                    <img src={item.image || defaultShowcases[sIdx]} className="w-full h-32 object-cover rounded-lg border bg-white" alt="Showcase" />
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={item.image || ''} 
                                        onChange={(e) => updateSlotImg(e.target.value)}
                                        placeholder="Image URL"
                                        className="flex-1 p-1.5 text-[11px] border rounded bg-white font-mono"
                                      />
                                      <label className="px-2.5 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1">
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden"
                                          disabled={isDirectUploading}
                                          onChange={(e) => handleDirectImageUpload(e, (url) => updateSlotImg(url))}
                                        />
                                        <Upload className="h-3 w-3" />
                                        <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        <div className="pt-3 border-t flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveHomepageBlock('infographic', infographicBlock || {})}
                            className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>{language === 'bn' ? 'ইনফোগ্রাফ পরিবর্তন সংরক্ষণ করুন' : 'Save Infograph Changes'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-BLOCK 4: INTRO QUOTE */}
                    {activeSubBlock === 'intro' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4 animate-fade-in font-sans">
                        <div className="border-b pb-2 flex justify-between items-center">
                          <h4 className="font-bold text-stone-900 font-serif">{language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র আজ... বানী' : 'BSK Movement Intro Quote'}</h4>
                          {!introBlock && (
                            <button 
                              type="button"
                              onClick={() => {
                                const defaults = {
                                  text_bn: "“বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি প্রতিষ্ঠান নয়। এটি আজ একটি দেশব্যাপী আন্দোলন। আলোকিত জাতীয় চিত্তের একটি বিনীত নিশ্চয়তা। মানবজ্ঞানের সামগ্রিক চর্চা এবং অনুশীলনের পাশাপাশি হৃদয়ের উৎকর্ষ ও জীবনের বহুবিচিত্র কর্মকাণ্ডের মধ্য দিয়ে উচ্চতর শক্তি ও মনুষ্যত্বে বিকশিত হবার একটি সপ্রাণ পৃথিবী।”",
                                  text_en: "“Bishwo Shahitto Kendro today is not just an institution. It is a countryscale movement. A humble assurance of an enlightened national mind. A living world of developing higher potential and humanity through holistic practice of human knowledge, as well as the excellence of heart and diverse activities of life.”"
                                };
                                setIntroBlock(defaults);
                                saveHomepageBlock('intro_banner', defaults);
                              }}
                              className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2 py-1 font-bold rounded-md hover:bg-[#B8862A]/20 transition"
                            >
                              {language === 'bn' ? 'ডিফল্ট লেখা লোড করুন' : 'Load Default Quote'}
                            </button>
                          )}
                        </div>

                        <div className="space-y-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ভূমিকা বাণী (বাংলা)' : 'Introductory Quote (Bangla)'}</label>
                            <textarea
                              rows={4}
                              value={introBlock?.text_bn || ''}
                              onChange={(e) => setIntroBlock({ ...introBlock, text_bn: e.target.value })}
                              placeholder="বাংলায় সুন্দর বাণীটি লিখুন..."
                              className="w-full p-3 border border-stone-200 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ভূমিকা বাণী (ইংরেজি)' : 'Introductory Quote (English)'}</label>
                            <textarea
                              rows={4}
                              value={introBlock?.text_en || ''}
                              onChange={(e) => setIntroBlock({ ...introBlock, text_en: e.target.value })}
                              placeholder="Write the English translated quote..."
                              className="w-full p-3 border border-stone-200 rounded-xl"
                            />
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => saveHomepageBlock('intro_banner', introBlock || { text_bn: '', text_en: '' })}
                              className="px-4 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>{language === 'bn' ? 'রক্ষণ করুন' : 'Save Banner Quote'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-BLOCK 5: PORTALS */}
                    {activeSubBlock === 'portals' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-6 animate-fade-in font-sans">
                        <div className="border-b pb-2 flex justify-between items-center">
                          <h4 className="font-bold text-stone-900 font-serif">
                            {language === 'bn' ? 'নেভিগেশন পোর্টাল লিংকসমূহ এবং স্টাইলিং' : 'Navigation Portal Links & Styling'}
                          </h4>
                          <button 
                            type="button"
                            onClick={() => {
                              const defaults = {
                                bcrs: {
                                  title_bn: 'বাঙালির চিন্তা',
                                  title_en: 'BCRS',
                                  tooltip_bn: 'বাঙালির চিন্তামূলক রচনা সংগ্রহ',
                                  tooltip_en: 'Bengali Thoughtful Writings Collection',
                                  url: 'https://bcrs.bskbd.org/',
                                  bgImage: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg',
                                  opacity: 70,
                                  logo: ''
                                },
                                alor: {
                                  title_bn: 'আলোর পাঠশালা',
                                  title_en: 'Alor Pathshala',
                                  tooltip_bn: 'আলোকিত পাঠশালা',
                                  tooltip_en: 'Alor Pathshala',
                                  url: 'https://alorpathshala.org/',
                                  bgImage: '/assets/IMGS/PURNIMA SONDHA/alor.jpg',
                                  opacity: 70,
                                  logo: ''
                                }
                              };
                              setPortalsBlock(defaults);
                              saveHomepageBlock('portals', defaults);
                            }}
                            className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2 py-1 font-bold rounded-md hover:bg-[#B8862A]/20 transition cursor-pointer"
                          >
                            {language === 'bn' ? 'ডিফল্ট পোর্টাল কন্টেন্ট লোড করুন' : 'Load Default Portals Content'}
                          </button>
                        </div>

                        {/* Two Columns for the two portals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                          
                          {/* PORTAL 1: BCRS */}
                          <div className="p-4 rounded-xl border border-[#B8862A]/20 bg-stone-50/50 space-y-4">
                            <div className="border-b pb-1.5 flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[#B8862A]">১. বাঙালির চিন্তা (BCRS)</span>
                            </div>

                            <div className="space-y-3.5">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.bcrs?.title_bn || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.bcrs) updated.bcrs = {};
                                      updated.bcrs.title_bn = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.bcrs?.title_en || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.bcrs) updated.bcrs = {};
                                      updated.bcrs.title_en = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'টুলটিপ বা বিবরণ (বাংলা)' : 'Tooltip / Subtitle (Bangla)'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.bcrs?.tooltip_bn || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.bcrs) updated.bcrs = {};
                                    updated.bcrs.tooltip_bn = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'টুলটিপ বা বিবরণ (ইংরেজি)' : 'Tooltip / Subtitle (English)'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.bcrs?.tooltip_en || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.bcrs) updated.bcrs = {};
                                    updated.bcrs.tooltip_en = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পোর্টাল লিংক ইউআরএল' : 'Portal URL'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.bcrs?.url || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.bcrs) updated.bcrs = {};
                                    updated.bcrs.url = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              {/* BG Image and file upload */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'ব্যাকগ্রাউন্ড ইমেজ (ইউআরএল বা পিসি ফাইল)' : 'Background Image (URL or PC File)'}</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.bcrs?.bgImage || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.bcrs) updated.bcrs = {};
                                      updated.bcrs.bgImage = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    placeholder="/assets/IMGS/..."
                                    className="flex-1 text-xs p-2 border border-stone-200 rounded-lg bg-white font-mono" 
                                  />
                                  <label className="px-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden"
                                      disabled={isDirectUploading}
                                      onChange={(e) => handleDirectImageUpload(e, (url) => {
                                        const updated = { ...portalsBlock };
                                        if (!updated.bcrs) updated.bcrs = {};
                                        updated.bcrs.bgImage = url;
                                        setPortalsBlock(updated);
                                      })}
                                    />
                                    <Upload className="h-3 w-3" />
                                    <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                                  </label>
                                </div>
                              </div>

                              {/* Contrast overlay opacity slider */}
                              <div className="space-y-1.5 p-2.5 bg-stone-100 rounded-lg border">
                                <div className="flex justify-between items-center text-[11px] font-bold text-stone-600">
                                  <span>{language === 'bn' ? 'অন্ধকার ওভারলে অপাসিটি:' : 'Contrast Overlay Opacity:'}</span>
                                  <span className="text-[#B8862A] font-sans font-bold">{portalsBlock?.bcrs?.opacity ?? 70}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="10" 
                                  max="95" 
                                  value={portalsBlock?.bcrs?.opacity ?? 70} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.bcrs) updated.bcrs = {};
                                    updated.bcrs.opacity = parseInt(e.target.value);
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full accent-[#2E5942] cursor-pointer" 
                                />
                              </div>
                            </div>
                          </div>

                          {/* PORTAL 2: ALOR PATHSHALA */}
                          <div className="p-4 rounded-xl border border-[#B8862A]/20 bg-stone-50/50 space-y-4">
                            <div className="border-b pb-1.5 flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[#2E5942]">২. আলোর পাঠশালা</span>
                            </div>

                            <div className="space-y-3.5">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.alor?.title_bn || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.alor) updated.alor = {};
                                      updated.alor.title_bn = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.alor?.title_en || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.alor) updated.alor = {};
                                      updated.alor.title_en = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'টুলটিপ বা বিবরণ (বাংলা)' : 'Tooltip / Subtitle (Bangla)'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.alor?.tooltip_bn || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.alor) updated.alor = {};
                                    updated.alor.tooltip_bn = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'টুলটিপ বা বিবরণ (ইংরেজি)' : 'Tooltip / Subtitle (English)'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.alor?.tooltip_en || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.alor) updated.alor = {};
                                    updated.alor.tooltip_en = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'পোর্টাল লিংক ইউআরএল' : 'Portal URL'}</label>
                                <input 
                                  type="text" 
                                  value={portalsBlock?.alor?.url || ''} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.alor) updated.alor = {};
                                    updated.alor.url = e.target.value;
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-white" 
                                />
                              </div>

                              {/* BG Image and file upload */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-600 block">{language === 'bn' ? 'ব্যাকগ্রাউন্ড ইমেজ (ইউআরএল বা পিসি ফাইল)' : 'Background Image (URL or PC File)'}</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={portalsBlock?.alor?.bgImage || ''} 
                                    onChange={(e) => {
                                      const updated = { ...portalsBlock };
                                      if (!updated.alor) updated.alor = {};
                                      updated.alor.bgImage = e.target.value;
                                      setPortalsBlock(updated);
                                    }}
                                    placeholder="/assets/IMGS/..."
                                    className="flex-1 text-xs p-2 border border-stone-200 rounded-lg bg-white font-mono" 
                                  />
                                  <label className="px-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden"
                                      disabled={isDirectUploading}
                                      onChange={(e) => handleDirectImageUpload(e, (url) => {
                                        const updated = { ...portalsBlock };
                                        if (!updated.alor) updated.alor = {};
                                        updated.alor.bgImage = url;
                                        setPortalsBlock(updated);
                                      })}
                                    />
                                    <Upload className="h-3 w-3" />
                                    <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                                  </label>
                                </div>
                              </div>

                              {/* Contrast overlay opacity slider */}
                              <div className="space-y-1.5 p-2.5 bg-stone-100 rounded-lg border">
                                <div className="flex justify-between items-center text-[11px] font-bold text-stone-600">
                                  <span>{language === 'bn' ? 'অন্ধকার ওভারলে অপাসিটি:' : 'Contrast Overlay Opacity:'}</span>
                                  <span className="text-[#B8862A] font-sans font-bold">{portalsBlock?.alor?.opacity ?? 70}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="10" 
                                  max="95" 
                                  value={portalsBlock?.alor?.opacity ?? 70} 
                                  onChange={(e) => {
                                    const updated = { ...portalsBlock };
                                    if (!updated.alor) updated.alor = {};
                                    updated.alor.opacity = parseInt(e.target.value);
                                    setPortalsBlock(updated);
                                  }}
                                  className="w-full accent-[#2E5942] cursor-pointer" 
                                />
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Save Button */}
                        <div className="pt-3 border-t flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveHomepageBlock('portals', portalsBlock || {})}
                            className="px-5 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>{language === 'bn' ? 'পোর্টাল পরিবর্তনসমূহ সংরক্ষণ করুন' : 'Save Portal Modifications'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: KEY STATISTICS DECK */}
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 font-serif">
                            {language === 'bn' ? '৫. প্রধান ৪টি পরিসংখ্যান ও কভার ছবি' : '5. Key 4 core Statistics Deck & Cover Photos'}
                          </h3>
                          <p className="text-xs text-stone-500 font-sans mt-0.5">
                            {language === 'bn' 
                              ? 'হোমপেজে দ্বিতীয় কারোসেল এর নিচে প্রদর্শিত সংরক্ষিত বইয়ের সংখ্যা এবং ব্যাকগ্রাউন্ড চিত্রসমূহ পরিবর্তন করুন।' 
                              : 'Modify values, slogans, labels and high contrast background images of the 4 key metrics.'}
                          </p>
                        </div>
                        {!statsBlock && (
                          <button 
                            type="button"
                            onClick={() => {
                              const defaults = {
                                card1_title_bn: "সংরক্ষিত গ্রন্থ সংখ্যা", card1_title_en: "Books Archived",
                                card1_value_bn: "৩,৫০,০০০+", card1_value_en: "350,000+",
                                card1_desc_bn: "প্রধান লাইব্রেরি ঢাকা কেন্দ্রে রক্ষিত বিশিষ্ট বিশ্বসাহিত্য গ্রন্থশ্রেণি", card1_desc_en: "Comprehensive classical literature housed in Dhaka Center archives",
                                card1_bgImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
                                card2_title_bn: "অংশগ্রহণকারী ইনস্টিটিউট", card2_title_en: "Academic Partners",
                                card2_value_bn: "১৫,০০০+", card2_value_en: "15,000+",
                                card2_desc_bn: "দেশজুড়ে মাধ্যমিক বিদ্যালয় ও কলেজের শিক্ষাঙ্গন নেটওয়ার্ক", card2_desc_en: "Secondary school and college networks nationwide",
                                card2_bgImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
                                card3_title_bn: "নিবন্ধিত সদস্যবৃন্দ", card3_title_en: "Enlisted Readers",
                                card3_value_bn: "৩০,০০,০০০+", card3_value_en: "3,000,000+",
                                card3_desc_bn: "প্রতিবছর বইপড়া কৃষ্টিতে সচল লাইব্রেরি পাঠকবৃন্দ", card3_desc_en: "Active avid participants enrolled in reading programs annually",
                                card3_bgImage: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&auto=format&fit=crop&q=80",
                                card4_title_bn: "উৎকর্ষ পদক বিতরণী", card4_title_en: "Excellence Medals",
                                card4_value_bn: "৩০,০০০+", card4_value_en: "30,000+",
                                card4_desc_bn: "সৃজনশীল সাহিত্য মূল্যায়নে শ্রেষ্ঠত্ব লাভ করা তরুণ পাঠক", card4_desc_en: "Top performing students awarded prestigious medals annually",
                                card4_bgImage: "https://images.unsplash.com/photo-1531844251246-9a1bfaae0d76?w=600&auto=format&fit=crop&q=80"
                              };
                              setStatsBlock(defaults);
                              saveHomepageBlock('statistics', defaults);
                            }}
                            className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2 py-1 font-bold rounded-md hover:bg-[#B8862A]/20 transition"
                          >
                            {language === 'bn' ? 'ডিফল্ট ৪টি কার্ড লোড করুন' : 'Load Default 4 Cards'}
                          </button>
                        )}
                      </div>
                      <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl">
                        <span className="text-[10px] text-[#B8862A] font-bold block">🖼️ {language === 'bn' ? 'ছবি সুপারিশকৃত সাইজ: ৪০০x৩০০ পিক্সেল (৪:৩ ল্যান্ডস্কেপ অনুপাত, হালকা ব্লার করা ছবির পরামর্শ দেওয়া হয়)' : 'Recommended stats image size: 400x300 px (4:3 aspect ratio, light or clean images preferred for high contrast text readability)'}</span>
                      </div>
                    </div>

                    {/* Core Cards Loop form editor */}
                    <div className="space-y-6">
                      {[1, 2, 3, 4].map((num) => {
                        const cardPrefix = `card${num}_`;
                        return (
                          <div key={num} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4 font-sans text-xs">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-xs font-extrabold text-[#2E5942] uppercase tracking-wider">{language === 'bn' ? `কার্ড ${num} এর তথ্য পরিবর্তন` : `Core Statistic Card #${num}`}</span>
                              <span className="text-[9px] font-mono text-stone-400">ID: stat_card_{num}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}title_bn`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}title_bn`]: e.target.value })}
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}title_en`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}title_en`]: e.target.value })}
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংখ্যা/মান (বাংলা)' : 'Numeric Value (Bangla)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}value_bn`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}value_bn`]: e.target.value })}
                                  placeholder="যেমন: ৩,৫০,০০০+"
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংখ্যা/মান (ইংরেজি)' : 'Numeric Value (English)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}value_en`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}value_en`]: e.target.value })}
                                  placeholder="e.g. 350,000+"
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>

                              <div className="space-y-1.5 md:col-span-2">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত স্লোগান বা ডেসক্রিপশন (বাংলা)' : 'Short Slogan/Description (Bangla)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}desc_bn`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}desc_bn`]: e.target.value })}
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>
                              <div className="space-y-1.5 md:col-span-2">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত স্লোগান বা ডেসক্রিপশন (ইংরেজি)' : 'Short Slogan/Description (English)'}</label>
                                <input 
                                  type="text" 
                                  value={statsBlock?.[`${cardPrefix}desc_en`] || ''} 
                                  onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}desc_en`]: e.target.value })}
                                  className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                />
                              </div>

                              <div className="space-y-1.5 md:col-span-2">
                                <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাকগ্রাউন্ড কভার কার্ড ইমেজ লিংক' : 'Card Background cover Image URL'}</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={statsBlock?.[`${cardPrefix}bgImage`] || ''} 
                                    onChange={(e) => setStatsBlock({ ...statsBlock, [`${cardPrefix}bgImage`]: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="flex-1 p-2 border border-stone-200 rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openImageResizer('landscape', (resizedUrl) => {
                                      setStatsBlock({ ...statsBlock, [`${cardPrefix}bgImage`]: resizedUrl });
                                    })}
                                    className="px-3 bg-[#2E5942] hover:bg-[#1C3E2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    <Upload className="h-4 w-4" />
                                    <span>{language === 'bn' ? 'আপলোড' : 'Upload & Resize'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Unified Statistics save button */}
                      <div className="bg-white p-4 rounded-xl shadow-xs border flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-sans">{language === 'bn' ? '* উপরের ৪টি পরিসংখ্যান কার্ডেরই যেকোনো এডিট সম্পন্ন করার পর রিয়েল-টাইমে কার্যকর করতে ডানে ক্লিক করুন।' : '* Update statistics card metrics and save them permanently.'}</span>
                        <button
                          type="button"
                          onClick={() => saveHomepageBlock('statistics', statsBlock || {})}
                          className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>{language === 'bn' ? 'অনলাইন ডাটাবেসে সংরক্ষণ' : 'Saturate Stats Core'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {/* TAB 6: HOMEPAGE CENTRAL PROGRAMS SLIDER */}
                {activeTab === 'programs' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 font-serif">
                          {language === 'bn' ? '৬. কার্যক্রমসমূহ (কেন্দ্রীয় হরাইজন্টাল স্লাইডার)' : '6. BSK Core Programs Swiper'}
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          {language === 'bn' 
                            ? 'সক্রিয় কার্যক্রমের তালিকা (যেমন আলোর ইশকুল, ভ্রাম্যমাণ লাইব্রেরি, ইত্যাদি) যুক্ত, এডিট, মিটিয়ে ফেলা অথবা নতুন রেন্ডার করুন।' 
                            : 'Manage horizontal scrolling program banners on the homepage.'}
                        </p>
                        <span className="text-[10px] text-[#B8862A] font-mono block mt-2">🖼️ {language === 'bn' ? 'সুপারিশকৃত ব্যানার কভার সাইজ: ৩০০x৪০০ পিক্সেল (পোর্ট্রেট ৩:৪ অনুপাত)' : 'Recommended banner aspect ratio: 300x400 pixels portrait ratio'}</span>
                      </div>
                      
                      {!editingProgram && (
                        <button 
                          type="button"
                          onClick={createNewProgram}
                          className="p-2 px-4 bg-[#2E5942] hover:bg-[#1C3E2D] text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start md:self-auto"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{language === 'bn' ? 'নতুন কার্যক্রম যোগ করুন' : 'Add New Program'}</span>
                        </button>
                      )}
                    </div>

                    {!editingProgram ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const defaultList = [
                            {
                              id: 'nationwide-excellence', title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম', title_en: 'Nationwide Excellence Program',
                              desc_bn: '৬৪ জেলায় দেশভিত্তিক সাহিত্য মূল্যায়ন ও বইপড়া আন্দোলন।', desc_en: 'Countrywide elite reading evaluation & movement.',
                              tag_bn: '৬৪ জেলা', tag_en: '64 Districts',
                              colorClass: 'bg-[#8B3A1E] text-orange-100', icon: 'Award',
                              bgImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1600&auto=format&fit=crop&q=90', order: 1
                            },
                            {
                              id: 'mobile-library', title_bn: 'ভ্রাম্যমাণ লাইব্রেরি', title_en: 'Mobile Library Network',
                              desc_bn: '৪০০০+ স্কুল ও লোকালয়ে চলমান দ্বীপ্ত লাইব্রেরি।', desc_en: 'Reaching 4,000+ local centers via mobile units.',
                              tag_bn: '৪০০০+ স্কুল', tag_en: '4,000+ Schools',
                              colorClass: 'bg-[#2E5942] text-emerald-100', icon: 'Truck',
                              bgImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=90', order: 2
                            },
                            {
                              id: 'reading-habit', title_bn: 'পাঠাভ্যাস উন্নয়ন', title_en: 'Reading Habit Development',
                              desc_bn: 'শিক্ষা প্রতিষ্ঠানে নিয়মিত বই পড়ার অভ্যাস ও পুরষ্কার।', desc_en: 'Institutional reading encouragement and prizes.',
                              tag_bn: 'কর্মসূচি', tag_en: 'Program',
                              colorClass: 'bg-[#1E4A6B] text-sky-100', icon: 'BookOpen',
                              bgImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=90', order: 3
                            },
                            {
                              id: 'book-fair', title_bn: 'ভ্রাম্যমাণ বইমেলা', title_en: 'Mobile Book Fair',
                              desc_bn: 'সারাদেশে ভ্রাম্যমাণ বইমেলা আয়োজন ও মানসম্মত গ্রন্থ প্রদর্শনী।', desc_en: 'Nationwide mobile book fair events & exhibitions.',
                              tag_bn: 'বাৎসরিক', tag_en: 'Annual',
                              colorClass: 'bg-[#2E5942] text-emerald-100', icon: 'BookOpen',
                              bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=90', order: 4
                            },
                            {
                              id: 'aalor-ishkool', title_bn: 'আলোর ইশকুল', title_en: 'Aalor Ishkool',
                              desc_bn: 'উচ্চতর মননশীলতা ও সাংস্কৃতিক বোধের স্কুল।', desc_en: 'Advanced mindset and cultural growth seminars.',
                              tag_bn: 'সক্রিয়', tag_en: 'Active',
                              colorClass: 'bg-[#3D2B14] text-[#F0CC7A]', icon: 'Sparkles',
                              bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=90', order: 5
                            },
                            {
                              id: 'aalor-pathshala', title_bn: 'আলোর পাঠশালা', title_en: 'Aalor Pathshala',
                              desc_bn: 'সুবিধাবঞ্চিত এলাকায় কমিউনিটি লার্নিং সেন্টার।', desc_en: 'Empowering underprivileged student sectors.',
                              tag_bn: 'নতুন', tag_en: 'New',
                              colorClass: 'bg-[#6B5A1E] text-amber-100', icon: 'SchoolIcon',
                              bgImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=90', order: 6
                            },
                            {
                              id: 'bangalir_chinta', title_bn: 'বাঙালির চিন্তা কর্মসূচি', title_en: 'Bangalir Chinta',
                              desc_bn: 'বাঙালি মনীষীদের শ্রেষ্ঠ মননশীল ও চিন্তামূলক প্রবন্ধের সংকলন প্রকাশ কর্মসূচি।', desc_en: 'Selected historical and philosophical works and thoughts of Bengal giants.',
                              tag_bn: 'ঐতিহাসিক', tag_en: 'Historical',
                              colorClass: 'bg-[#553E2A] text-orange-100', icon: 'BookOpenCheck',
                              bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&auto=format&fit=crop&q=90', order: 7
                            },
                            {
                              id: 'primary-teacher', title_bn: 'প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি', title_en: 'Primary Teachers Reading Program',
                              desc_bn: 'প্রাথমিক ও মাধ্যমিক শিক্ষকদের বইপড়া কৃষ্টি।', desc_en: 'Enhancement materials for elementary educators.',
                              tag_bn: 'শিক্ষক উন্নয়ন', tag_en: 'Teachers',
                              colorClass: 'bg-[#213547] text-slate-100', icon: 'BookOpen',
                              bgImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&auto=format&fit=crop&q=90', order: 8
                            },
                            {
                              id: 'publication', title_bn: 'প্রকাশনা কার্যক্রম', title_en: 'Publications',
                              desc_bn: 'ধ্রুপদী ও নোবেলবিজয়ী বিশ্বসাহিত্যের উচ্চমানের বাংলা অনুবাদ প্রকাশনা।', desc_en: 'Acclaimed publications of world classics and Bangla translations.',
                              tag_bn: '১০০০+ বই', tag_en: '1000+ Books',
                              colorClass: 'bg-[#4A3B32] text-amber-100', icon: 'BookOpen',
                              bgImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=90', order: 9
                            }
                          ];

                          const displayList = defaultList.map((def) => { const custom = (homepagePrograms || []).find((p) => p.id === def.id); return custom ? { ...def, ...custom } : def; }); const extraProgs = (homepagePrograms || []).filter((p) => !defaultList.some((def) => def.id === p.id)); const fullDisplayList = [...displayList, ...extraProgs].sort((a, b) => (a.order || 0) - (b.order || 0));

                          return fullDisplayList.map((prog) => (
                            <div key={prog.id} className="bg-white p-4 border border-[#E8DDD0] rounded-2xl flex gap-4 shadow-xs items-start font-sans hover:border-[#2E5942]/40 transition">
                              <img src={prog.bgImage} className="w-16 h-20 object-cover rounded-xl border shrink-0 bg-stone-100 shadow-inner" alt={prog.title_bn} />
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-stone-900 truncate font-serif">{language === 'bn' ? prog.title_bn : prog.title_en}</h4>
                                <p className="text-[11px] text-stone-500 leading-normal line-clamp-2">{language === 'bn' ? prog.desc_bn : prog.desc_en}</p>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono font-semibold">ক্রম: {prog.order}</span>
                                  <span className="text-[9px] bg-[#2E5942]/10 text-[#2E5942] px-1.5 py-0.5 rounded font-semibold">{prog.tag_bn || prog.tag_en}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => { setEditingProgram(JSON.parse(JSON.stringify(prog))); setPreviewImage(prog.bgImage); }}
                                  className="p-1.5 px-3 bg-[#B8862A]/10 hover:bg-[#B8862A]/20 border border-[#B8862A]/30 text-[#B8862A] text-xs font-bold rounded-lg transition cursor-pointer"
                                >
                                  {language === 'bn' ? 'এডিট' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProgramRecord(prog.id)}
                                  className="p-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-lg transition cursor-pointer"
                                >
                                  {language === 'bn' ? 'মুছুন' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      /* EDITING PROGRAM FORM */
                      <form onSubmit={saveProgramRecord} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-lg space-y-4 font-sans text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <button type="button" onClick={() => setEditingProgram(null)} className="flex items-center gap-1 font-bold text-stone-600 hover:text-stone-900">
                            <ArrowLeft className="h-4 w-4" />
                            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to slider list'}</span>
                          </button>
                          <h4 className="font-extrabold text-[#2E5942]">{language === 'bn' ? `"${editingProgram.title_bn}" স্লট সেশন এডিট` : `Configure Program Content Slot`}</h4>
                          <span className="font-mono text-stone-400">ID: {editingProgram.id}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যক্রমের নাম (বাংলা)' : 'Program Title (Bangla)'}</label>
                            <input type="text" value={editingProgram.title_bn} onChange={(e) => setEditingProgram({ ...editingProgram, title_bn: e.target.value })} className="w-full p-2 border rounded-lg" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যক্রমের নাম (ইংরেজি)' : 'Program Title (English)'}</label>
                            <input type="text" value={editingProgram.title_en} onChange={(e) => setEditingProgram({ ...editingProgram, title_en: e.target.value })} className="w-full p-2 border rounded-lg" required />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত টেক্সট বিবরণী (বাংলা)' : 'Short Description (Bangla)'}</label>
                            <textarea rows={2} value={editingProgram.desc_bn} onChange={(e) => setEditingProgram({ ...editingProgram, desc_bn: e.target.value })} className="w-full p-2 border rounded-lg" required />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত টেক্সট বিবরণী (ইংরেজি)' : 'Short Description (English)'}</label>
                            <textarea rows={2} value={editingProgram.desc_en} onChange={(e) => setEditingProgram({ ...editingProgram, desc_en: e.target.value })} className="w-full p-2 border rounded-lg" required />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্ড ট্যাগ (বাংলা)' : 'Tag Label (Bangla)'}</label>
                            <input type="text" value={editingProgram.tag_bn} onChange={(e) => setEditingProgram({ ...editingProgram, tag_bn: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="যেমন: নতুন, সক্রিয়" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্ড ট্যাগ (ইংরেজি)' : 'Tag Label (English)'}</label>
                            <input type="text" value={editingProgram.tag_en} onChange={(e) => setEditingProgram({ ...editingProgram, tag_en: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="e.g. New, Active" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ক্রমিক সংখ্যা (অর্ডার)' : 'Sort placement Order score'}</label>
                            <input type="number" value={editingProgram.order} onChange={(e) => setEditingProgram({ ...editingProgram, order: Number(e.target.value) })} className="w-full p-2 border rounded-lg" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'আইকন ইন্ডিকেটর' : 'Lucide Icon name placeholder'}</label>
                            <select value={editingProgram.icon} onChange={(e) => setEditingProgram({ ...editingProgram, icon: e.target.value })} className="w-full p-2 border rounded-lg bg-white select-none">
                              {['Sparkles', 'Truck', 'Award', 'BookOpen', 'SchoolIcon', 'Library', 'Calendar', 'BookOpenCheck', 'Users', 'Map'].map(ic => (
                                <option key={ic} value={ic}>{ic}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাকগ্রাউন্ড ব্যানার ছবি URL' : 'Banner Background Image URL'}</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={editingProgram.bgImage} 
                                onChange={(e) => { 
                                  setEditingProgram({ ...editingProgram, bgImage: e.target.value }); 
                                  setPreviewImage(e.target.value); 
                                }} 
                                className="flex-1 p-2 border border-stone-200 rounded-lg text-xs" 
                              />
                              <button
                                type="button"
                                onClick={() => openImageResizer('landscape', (resizedUrl) => {
                                  setEditingProgram({ ...editingProgram, bgImage: resizedUrl });
                                  setPreviewImage(resizedUrl);
                                })}
                                className="px-3 bg-[#2E5942] hover:bg-[#1C3E2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <Upload className="h-4 w-4" />
                                <span>{language === 'bn' ? 'আপলোড' : 'Upload & Resize'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {previewImage && (
                          <div className="p-3 border rounded-xl bg-stone-50 text-center space-y-1">
                            <span className="text-[10px] font-bold text-stone-500">Image Preview</span>
                            <img src={previewImage} onError={() => setPreviewImage('')} className="mx-auto rounded-lg max-h-36 object-contain" />
                          </div>
                        )}

                        <div className="pt-3 border-t flex justify-end gap-3">
                          <button type="button" onClick={() => setEditingProgram(null)} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-600">{language === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                          <button type="submit" className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-lg shadow-md font-bold flex items-center gap-1">
                            <Save className="h-3.5 w-3.5" />
                            <span>{language === 'bn' ? 'কার্যক্রম সেভ করুন' : 'Confirm Save program'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}


                {/* TAB 7: HOMEPAGE GALLERY SLIDES (OTHER ACTIVITIES) */}
                {activeTab === 'galleries' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs">
                      <h3 className="text-lg font-bold text-stone-900 font-serif">
                        {language === 'bn' ? '৭. আমাদের কার্যক্রম (৩টি গ্যালারি স্লাইডসমূহ)' : '7. Homepage Galleries (Our Activities lists)'}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">
                        {language === 'bn' 
                          ? 'ভ্রাম্যমাণ লাইব্রেরি, দেশভিত্তিক উৎকর্ষ, এবং সাংস্কৃতিক মিলনমেলার নিচে চলমান ফটো গ্যালারি তিনটির স্লাইড পরিবর্তন করুন।' 
                          : 'Change slides image paths and translated caption texts for the three mini-galleries.'}
                      </p>

                      <div className="flex gap-2.5 mt-4 border-t pt-4 overflow-x-auto">
                        {[
                          { id: 'ml', default_bn: 'ভবন পরিচিতি', default_en: 'Building Tour', db_doc: galleryML },
                          { id: 'rh', default_bn: 'আসন্ন কার্যক্রমসমূহ', default_en: 'Upcoming Activities', db_doc: galleryRH },
                          { id: 'cl', default_bn: 'কেন্দ্রীয় লাইব্রেরি', default_en: 'Central Library', db_doc: galleryCL }
                        ].map((gal) => {
                          const labelBn = gal.db_doc?.title_bn || gal.default_bn;
                          const labelEn = gal.db_doc?.title_en || gal.default_en;
                          return (
                            <button
                              key={gal.id}
                              type="button"
                              onClick={() => setActiveGalleryType(gal.id as any)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                                activeGalleryType === gal.id 
                                  ? 'bg-[#2E5942] text-white animate-fade-in' 
                                  : 'bg-stone-100 text-[#2E5942] hover:bg-stone-200'
                              }`}
                            >
                              {language === 'bn' ? labelBn : labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Photo Gallery items listing/editing widget */}
                    {(() => {
                      // Dynamically pull currently selected gallery document data of Firebase
                      let activeGallDoc = activeGalleryType === 'ml' ? galleryML : activeGalleryType === 'rh' ? galleryRH : galleryCL;
                      let docIdentifier = activeGalleryType === 'ml' ? 'gallery_ml' : activeGalleryType === 'rh' ? 'gallery_rh' : 'gallery_cl';
                      
                      // Pre-fill fallback if nothing is stored in Firestore yet
                      if (!activeGallDoc && docIdentifier === 'gallery_ml') {
                        activeGallDoc = {
                          slides: [
                            { image: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg", category_bn: "ভ্রাম্যমাণ লাইব্রেরি", category_en: "Mobile Library Network", caption_bn: "বিশ্বসাহিত্য কেন্দ্র লাইব্রেরি কক্ষের মনোরম বইয়ের সারি", caption_en: "A serene aisle of curated global books inside BSK Library", route: "mobile-library" },
                            { image: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg", category_bn: "ভ্রাম্যমাণ লাইব্রেরি", category_en: "Central Reading space", caption_bn: "লাইব্রেরিতে নিবিড় অধ্যয়নরত পাঠক ও সভ্যবৃন্দ", caption_en: "Avid members engrossed in deep study at BSK HQ", route: "mobile-library" }
                          ]
                        };
                      } else if (!activeGallDoc && docIdentifier === 'gallery_rh') {
                        activeGallDoc = {
                          slides: [
                            { image: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg", category_bn: "দেশভিত্তিক উৎকর্ষ", category_en: "Elite Book Assessment", caption_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রমে বই মূল্যায়ন পরীক্ষা ও পুরস্কার", caption_en: "Elite book evaluation assessments and creative reading rewards", route: "reading-habit" }
                          ]
                        };
                      } else if (!activeGallDoc) {
                        activeGallDoc = {
                          slides: [
                            { image: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg", category_bn: "সাংস্কৃতিক অনুষ্ঠান", category_en: "Purnima Sondha Seminar", caption_bn: "বিশ্বসাহিত্য কেন্দ্র আয়োজিত ঐতিহ্যবাহী 'পূর্ণিমা সন্ধ্যা'", caption_en: "The highly acclaimed 'Purnima Sondha' literary and musical series", route: "facilities" }
                          ]
                        };
                      }

                      const handleUpdateSlide = (field: string, slideIdx: number, val: string, shouldAutoSave = false) => {
                        const copy = JSON.parse(JSON.stringify(activeGallDoc));
                        if (copy.slides && copy.slides[slideIdx]) {
                          copy.slides[slideIdx][field] = val;
                          if (activeGalleryType === 'ml') setGalleryML(copy);
                          else if (activeGalleryType === 'rh') setGalleryRH(copy);
                          else setGalleryCL(copy);

                          if (shouldAutoSave) {
                            saveHomepageBlock(docIdentifier, copy);
                          }
                        }
                      };

                      const handleUpdateField = (field: string, val: string) => {
                        const copy = JSON.parse(JSON.stringify(activeGallDoc));
                        copy[field] = val;
                        if (activeGalleryType === 'ml') setGalleryML(copy);
                        else if (activeGalleryType === 'rh') setGalleryRH(copy);
                        else setGalleryCL(copy);
                      };

                      const handleAddSlide = () => {
                        const copy = JSON.parse(JSON.stringify(activeGallDoc));
                        if (!copy.slides) copy.slides = [];
                        copy.slides.push({
                          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                          category_bn: "আমাদের কার্যক্রম",
                          category_en: "Our Activity",
                          caption_bn: "নতুন ছবির বিবরণী এখানে লিখুন",
                          caption_en: "New caption text details here",
                          route: "books"
                        });
                        if (activeGalleryType === 'ml') setGalleryML(copy);
                        else if (activeGalleryType === 'rh') setGalleryRH(copy);
                        else setGalleryCL(copy);
                        saveHomepageBlock(docIdentifier, copy);
                      };

                      const handleRemoveSlide = (idx: number) => {
                        requireConfirmation(
                          'এই স্লাইডটি মুছে ফেলতে চান?',
                          'Are you sure you want to remove this photogallery slide?',
                          () => {
                            const copy = JSON.parse(JSON.stringify(activeGallDoc));
                            if (copy.slides) {
                              copy.slides.splice(idx, 1);
                              if (activeGalleryType === 'ml') setGalleryML(copy);
                              else if (activeGalleryType === 'rh') setGalleryRH(copy);
                              else setGalleryCL(copy);
                              saveHomepageBlock(docIdentifier, copy);
                            }
                          }
                        );
                      };

                       return (
                        <div className="space-y-6 animate-fade-in">
                          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#B8862A]/10 text-xs flex justify-between items-center bg-grain font-serif">
                            <span className="font-extrabold text-[#2E5942] uppercase tracking-wide">
                              {language === 'bn' ? `সম্পাদনা তালিকা: ${docIdentifier}` : `Current Document Editor: ${docIdentifier}`}
                            </span>
                            <span className="text-[10px] text-[#B8862A] font-mono">🖼️ {language === 'bn' ? 'সাপোর্টেড ছবির সাইজ: ৪০০x৫০০ পিক্সেল' : 'Recommended gallery slide size: 400x500 px'}</span>
                          </div>

                          {/* Dynamic Customization Card for Section & Tab Names */}
                          <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs space-y-4 font-sans text-xs">
                            <h4 className="text-sm font-extrabold text-[#2E5942] font-serif border-b pb-2 flex items-center gap-1.5">
                              <span>🏷️</span>
                              <span>{language === 'bn' ? 'গ্যালারি ও ট্যাব নাম পরিবর্তন' : 'Gallery & Tab Rename Settings'}</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'এই ট্যাবের নাম (বাংলা)' : 'This Tab Name (BN)'}</label>
                                <input
                                  type="text"
                                  value={activeGallDoc.title_bn || (activeGalleryType === 'ml' ? 'ভবন পরিচিতি' : activeGalleryType === 'rh' ? 'আসন্ন কার্যক্রমসমূহ' : 'কেন্দ্রীয় লাইব্রেরি')}
                                  onChange={(e) => handleUpdateField('title_bn', e.target.value)}
                                  className="w-full p-2 border rounded font-medium text-stone-800"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'এই ট্যাবের নাম (ইংরেজি)' : 'This Tab Name (EN)'}</label>
                                <input
                                  type="text"
                                  value={activeGallDoc.title_en || (activeGalleryType === 'ml' ? 'Building Tour' : activeGalleryType === 'rh' ? 'Upcoming Activities' : 'Central Library')}
                                  onChange={(e) => handleUpdateField('title_en', e.target.value)}
                                  className="w-full p-2 border rounded font-medium text-stone-800"
                                />
                              </div>
                            </div>

                            {/* Section Header Editor - only show when ml (primary) is active */}
                            {activeGalleryType === 'ml' && (
                              <div className="border-t pt-4 space-y-4">
                                <h4 className="text-sm font-extrabold text-[#2E5942] font-serif border-b pb-1 flex items-center gap-1.5">
                                  <span>🌍</span>
                                  <span>{language === 'bn' ? 'প্রধান সেকশন শিরোনাম ও উপশিরোনাম' : 'Main Section Header & Subtitle'}</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'প্রধান শিরোনাম (বাংলা)' : 'Main Title (BN)'}</label>
                                    <input
                                      type="text"
                                      value={activeGallDoc.section_title_bn || 'আমাদের কার্যক্রম'}
                                      onChange={(e) => handleUpdateField('section_title_bn', e.target.value)}
                                      className="w-full p-2 border rounded font-medium text-stone-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'প্রধান শিরোনাম (ইংরেজি)' : 'Main Title (EN)'}</label>
                                    <input
                                      type="text"
                                      value={activeGallDoc.section_title_en || 'Our Activities'}
                                      onChange={(e) => handleUpdateField('section_title_en', e.target.value)}
                                      className="w-full p-2 border rounded font-medium text-stone-800"
                                    />
                                  </div>
                                  <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'উপশিরোনাম (বাংলা)' : 'Subtitle (BN)'}</label>
                                    <input
                                      type="text"
                                      value={activeGallDoc.section_subtitle_bn || 'বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী চলমান অন্যান্য প্রধান কার্যক্রম ও পরিচিতি।'}
                                      onChange={(e) => handleUpdateField('section_subtitle_bn', e.target.value)}
                                      className="w-full p-2 border rounded font-medium text-stone-800"
                                    />
                                  </div>
                                  <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-stone-500">{language === 'bn' ? 'উপশিরোনাম (ইংরেজি)' : 'Subtitle (EN)'}</label>
                                    <input
                                      type="text"
                                      value={activeGallDoc.section_subtitle_en || 'Glimpses of other countrywide projects and headquarters.'}
                                      onChange={(e) => handleUpdateField('section_subtitle_en', e.target.value)}
                                      className="w-full p-2 border rounded font-medium text-stone-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            {(activeGallDoc?.slides || []).map((slide: any, sIdx: number) => (
                              <div key={sIdx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md font-sans text-xs flex flex-col md:flex-row gap-5 relative">
                                <div className="absolute top-4 right-4 z-10">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSlide(sIdx)}
                                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 rounded text-[9px] font-bold"
                                  >
                                    ✕ {language === 'bn' ? 'মুছুন' : 'Delete'}
                                  </button>
                                </div>

                                <div className="w-full md:w-44 space-y-2 shrink-0">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">Slide #{sIdx + 1} Preview</span>
                                  <img src={slide.image} className="w-full h-32 md:h-48 rounded-xl object-cover bg-stone-50 border shadow-xs" />
                                  <div className="flex flex-col gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Image URL link"
                                      value={slide.image}
                                      onChange={(e) => handleUpdateSlide('image', sIdx, e.target.value)}
                                      className="w-full p-1.5 text-[9px] font-mono border rounded"
                                    />
                                    <div className="flex gap-1.5">
                                      <label className="flex-1 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-[10px] font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden"
                                          disabled={isDirectUploading}
                                          onChange={(e) => handleDirectImageUpload(e, (url) => {
                                            handleUpdateSlide('image', sIdx, url, true);
                                          })}
                                        />
                                        <Upload className={`h-3 w-3 ${isDirectUploading ? 'animate-spin' : ''}`} />
                                        <span>
                                          {isDirectUploading 
                                            ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                                            : (language === 'bn' ? 'ফুল ছবি আপলোড' : 'Full Image Upload')}
                                        </span>
                                      </label>

                                      <button
                                        type="button"
                                        onClick={() => openImageResizer('portrait', (resizedUrl) => {
                                          handleUpdateSlide('image', sIdx, resizedUrl, true);
                                        })}
                                        className="px-2 py-1.5 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                        title="Crop / Resize"
                                      >
                                        <Sliders className="h-3 w-3 text-[#B8862A]" />
                                        <span>{language === 'bn' ? 'রিসাইজার' : 'Resizer'}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 space-y-3 pt-4 md:pt-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-stone-500">Category Tag (BN)</label>
                                      <input type="text" value={slide.category_bn} onChange={(e) => handleUpdateSlide('category_bn', sIdx, e.target.value)} className="w-full p-2 border rounded" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-stone-500">Category Tag (EN)</label>
                                      <input type="text" value={slide.category_en} onChange={(e) => handleUpdateSlide('category_en', sIdx, e.target.value)} className="w-full p-2 border rounded" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2.5">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-stone-500">Caption / Slogan Label (BN)</label>
                                      <input type="text" value={slide.caption_bn} onChange={(e) => handleUpdateSlide('caption_bn', sIdx, e.target.value)} className="w-full p-2 border rounded" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-stone-500">Caption / Slogan Label (EN)</label>
                                      <input type="text" value={slide.caption_en} onChange={(e) => handleUpdateSlide('caption_en', sIdx, e.target.value)} className="w-full p-2 border rounded" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-stone-500">Menu Tab Route redirection ID</label>
                                      <input type="text" placeholder="e.g. mobile-library, books" value={slide.route} onChange={(e) => handleUpdateSlide('route', sIdx, e.target.value)} className="w-full p-2 border rounded font-mono text-xs" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="flex flex-col md:flex-row gap-3">
                              <button
                                type="button"
                                onClick={handleAddSlide}
                                className="p-3 bg-stone-100 hover:bg-stone-200 text-[#2E5942] rounded-xl text-xs font-bold border border-[#2E5942]/10 transition cursor-pointer text-center flex-1"
                              >
                                + {language === 'bn' ? 'আরেকটি নতুন স্লাইড যোগ করুন' : 'Insert another photo slide'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => saveHomepageBlock(docIdentifier, activeGallDoc)}
                                className="p-3 px-6 bg-[#2E5942] hover:bg-[#1C3E2D] text-white rounded-xl text-xs font-bold transition cursor-pointer text-center shadow-md flex items-center justify-center gap-1 shrink-0"
                              >
                                <Save className="h-4 w-4" />
                                <span>{language === 'bn' ? 'গ্যালারি স্লাইডগুলো সেভ করুন' : 'Confirm Save Gallery'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 8: MOVEMENT & CTA */}
                {activeTab === 'movement' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs">
                      <h3 className="text-lg font-bold text-stone-900 font-serif">
                        {language === 'bn' ? '৮. দেশব্যাপী আন্দোলন ও CTA' : '8. Movement & CTA'}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-1">
                        {language === 'bn' 
                          ? 'দেশব্যাপী আন্দোলন পরিসংখ্যান প্যানেল (সেকশন ৬) এবং নিচে যুক্ত কল টু অ্যাকশন প্যানেল (সেকশন ৭) এডিট সারণী।' 
                          : 'Update movement details with statistics and home call to action panel.'}
                      </p>

                      {/* Sub Tabs Selection bar */}
                      <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                        {[
                          { id: 'belief', label_bn: 'দেশব্যাপী আন্দোলন (Sec 6)', label_en: 'Core Belief (Sec 6)' },
                          { id: 'cta', label_bn: 'কল টু অ্যাকশন (Sec 7)', label_en: 'Join Call To Action (Sec 7)' }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setActiveSubBlock(sub.id as any)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              activeSubBlock === sub.id 
                                ? 'bg-[#2E5942] text-white' 
                                : 'bg-stone-100 text-[#2E5942] hover:bg-stone-200'
                            }`}
                          >
                            {language === 'bn' ? sub.label_bn : sub.label_en}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subblock: Central Belief band (Section 6) */}
                    {activeSubBlock === 'belief' && (() => {
                      const activeBelief = beliefBlock || {
                        title_bn: "বিশ্বসাহিত্য কেন্দ্র — একটি দেশব্যাপী আন্দোলন",
                        title_en: "Bishwo Shahitto Kendro — A National Awakening",
                        desc_bn: "বিশ্বসাহিত্য কেন্দ্র আজ আর শুধুমাত্র একটি সাধারণ লাইব্রেরি বা সভার কামরা নয়। এটি বাংলা ভাষাভাষী মানুষের চিত্তের সামগ্রিক ইতিবাচক পরিবর্তনের জন্য দেশব্যাপী জাতীয় ক্যারেক্টার ও চরিত্র তৈরি করার বিনীত প্রয়াস।",
                        desc_en: "Our movement stretches to accommodate every village school and local municipal body through continuous book reading assessments and high intellectual assemblies.",
                        btnText_bn: "আমাদের অর্জন ও ইতিহাস →",
                        btnText_en: "Core History & Milestones →",
                        btnRoute: "bsk-history",
                        stat1_val: "৪৬+",
                        stat1_lbl_bn: "বছরের গৌরবময় সংগ্রাম",
                        stat1_lbl_en: "Years of Legacy",
                        stat2_val: "৫০+",
                        stat2_lbl_bn: "দাতা ও সহযোগী",
                        stat2_lbl_en: "Global Donors",
                        stat3_val: "১.২ কোটি+",
                        stat3_lbl_bn: "বিতরণকৃত গ্রন্থসমূহ",
                        stat3_lbl_en: "Circulated Books",
                        stat4_val: "১২টি",
                        stat4_lbl_bn: "সক্রিয় বুদ্ধিজীবী ধারা",
                        stat4_lbl_en: "Core Programs"
                      };

                      return (
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-stone-900 font-serif">{language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র — দেশব্যাপী আন্দোলন (সেকশন ৬)' : 'Central Belief & Movement Band'}</h4>
                              <span className="text-[10px] text-stone-500 font-sans block">{language === 'bn' ? 'এই সেকশনে বাম পাশে টেক্সট ও নিচে ৪ টি গোল্ডেন স্ট্যাট প্রদর্শিত হয়।' : 'This corresponds to the dark banner block with gold stat boxes on the homepage.'}</span>
                            </div>
                            {!beliefBlock && (
                              <button 
                                type="button"
                                onClick={() => {
                                  setBeliefBlock(activeBelief);
                                  saveHomepageBlock('central_belief', activeBelief);
                                }}
                                className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2 py-1 font-bold rounded-md hover:bg-[#B8862A]/20 transition"
                              >
                                {language === 'bn' ? 'ডিফল্ট ডাটা সচল করুন' : 'Load Default Belief Copy'}
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={activeBelief.title_bn || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, title_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                              <input 
                                type="text" 
                                value={activeBelief.title_en || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, title_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উপ-বিবরণী (বাংলা)' : 'Description (Bangla)'}</label>
                              <textarea 
                                rows={3} 
                                value={activeBelief.desc_bn || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, desc_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উপ-বিবরণী (ইংরেজি)' : 'Description (English)'}</label>
                              <textarea 
                                rows={3} 
                                value={activeBelief.desc_en || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, desc_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'বাটন লেবেল (বাংলা)' : 'Button Label (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={activeBelief.btnText_bn || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, btnText_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'বাটন লেবেল (ইংরেজি)' : 'Button Label (English)'}</label>
                              <input 
                                type="text" 
                                value={activeBelief.btnText_en || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, btnText_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'বাটন ক্লিক রাউট (মেনু ট্যাব আইডি)' : 'Button Redirect Route Target'}</label>
                              <input 
                                type="text" 
                                value={activeBelief.btnRoute || ''} 
                                onChange={(e) => setBeliefBlock({ ...activeBelief, btnRoute: e.target.value })}
                                placeholder="e.g. home, council, books"
                                className="w-full p-2 border border-stone-200 rounded-lg font-mono text-xs"
                              />
                            </div>

                            <div className="md:col-span-2 pt-2 border-t mt-2">
                              <span className="text-[10px] font-black uppercase text-[#B8862A] block tracking-wider mb-2">{language === 'bn' ? 'পরিসংখ্যানসমূহ (৪ টি গোল্ড মেটাল বক্স)' : 'Statisitcs Numbers (4 Gold Stat Boxes)'}</span>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                  <span className="text-[10px] font-bold text-stone-500">Stat 1</span>
                                  <input type="text" placeholder="Value (e.g. ৪৬+)" value={activeBelief.stat1_val || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat1_val: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="BN Label" value={activeBelief.stat1_lbl_bn || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat1_lbl_bn: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="EN Label" value={activeBelief.stat1_lbl_en || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat1_lbl_en: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                </div>
                                <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                  <span className="text-[10px] font-bold text-stone-500">Stat 2</span>
                                  <input type="text" placeholder="Value (e.g. ৫০+)" value={activeBelief.stat2_val || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat2_val: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="BN Label" value={activeBelief.stat2_lbl_bn || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat2_lbl_bn: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="EN Label" value={activeBelief.stat2_lbl_en || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat2_lbl_en: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                </div>
                                <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                  <span className="text-[10px] font-bold text-stone-500">Stat 3</span>
                                  <input type="text" placeholder="Value (e.g. ১.২ কোটি+)" value={activeBelief.stat3_val || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat3_val: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="BN Label" value={activeBelief.stat3_lbl_bn || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat3_lbl_bn: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="EN Label" value={activeBelief.stat3_lbl_en || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat3_lbl_en: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                </div>
                                <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
                                  <span className="text-[10px] font-bold text-stone-500">Stat 4</span>
                                  <input type="text" placeholder="Value" value={activeBelief.stat4_val || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat4_val: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="BN Label" value={activeBelief.stat4_lbl_bn || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat4_lbl_bn: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                  <input type="text" placeholder="EN Label" value={activeBelief.stat4_lbl_en || ''} onChange={(e) => setBeliefBlock({ ...activeBelief, stat4_lbl_en: e.target.value })} className="w-full p-1.5 border text-xs rounded-md bg-white" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => saveHomepageBlock('central_belief', activeBelief)}
                              className="px-4 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>{language === 'bn' ? 'রক্ষণ করুন' : 'Save Statistics Band'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Subblock: CTA Block (Section 7) */}
                    {activeSubBlock === 'cta' && (() => {
                      const activeCta = ctaBlock || {
                        title_bn: "আলোকিত মানুষের এই দেশব্যাপী মহতী যাত্রায় যোগ দিন",
                        title_en: "Join This Noble Nationwide Journey of Enriched Lives",
                        desc_bn: "সদস্য হয়ে বিশ্বসাহিত্য কেন্দ্রের কার্যক্রমে অংশগ্রহণ করুন — বই পড়ুন, নিজেকে আলোকিত করুন।",
                        desc_en: "Become a lifetime registered regular reader, volunteer or advocate.",
                        btn1Text_bn: "সদস্য হতে আবেদন করুন",
                        btn1Text_en: "Apply for Membership",
                        btn1Route: "contact",
                        btn2Text_bn: "সহযোগিতা / অনুদান দিন",
                        btn2Text_en: "Support BSK",
                        btn2Route: "contact"
                      };

                      return (
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <h4 className="font-bold text-stone-900 font-serif">{language === 'bn' ? 'কল টু অ্যাকশন ব্যানার (সেকশন ৭ - পাদলেখ সংলগ্ন)' : 'Homepage Call To Action (Section 7)'}</h4>
                            {!ctaBlock && (
                              <button 
                                type="button"
                                onClick={() => {
                                  setCtaBlock(activeCta);
                                  saveHomepageBlock('cta_block', activeCta);
                                }}
                                className="text-[10px] bg-[#B8862A]/10 text-[#B8862A] px-2 py-1 font-bold rounded-md hover:bg-[#B8862A]/20 transition"
                              >
                                {language === 'bn' ? 'ডিফল্ট ডাটা সচল করুন' : 'Load Default CTA Copy'}
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যানার শিরোনাম (বাংলা)' : 'CTA Banner Title (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.title_bn || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, title_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যানার শিরোনাম (ইংরেজি)' : 'CTA Banner Title (English)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.title_en || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, title_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যানার বিবরণী (বাংলা)' : 'CTA Description (Bangla)'}</label>
                              <textarea 
                                rows={2} 
                                value={activeCta.desc_bn || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, desc_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ব্যানার বিবরণী (ইংরেজি)' : 'CTA Description (English)'}</label>
                              <textarea 
                                rows={2} 
                                value={activeCta.desc_en || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, desc_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সবুজ বাটন লেখা (বাংলা)' : 'Primary Button (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn1Text_bn || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn1Text_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সবুজ বাটন লেখা (ইংরেজি)' : 'Primary Button (English)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn1Text_en || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn1Text_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সবুজ বাটন ক্লিক রাউট' : 'Primary Redirect route'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn1Route || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn1Route: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg font-mono text-[11px]"
                              />
                            </div>
                            <div className="h-4"></div>

                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সীমান্ত বাটন লেখা (বাংলা)' : 'Secondary Button (Bangla)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn2Text_bn || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn2Text_bn: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সীমান্ত বাটন লেখা (ইংরেজি)' : 'Secondary Button (English)'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn2Text_en || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn2Text_en: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সীমান্ত বাটন ক্লিক রাউট' : 'Secondary Redirect route'}</label>
                              <input 
                                type="text" 
                                value={activeCta.btn2Route || ''} 
                                onChange={(e) => setCtaBlock({ ...activeCta, btn2Route: e.target.value })}
                                className="w-full p-2 border border-stone-200 rounded-lg font-mono text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => saveHomepageBlock('cta_block', activeCta)}
                              className="px-4 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>{language === 'bn' ? 'রক্ষণ করুন' : 'Save CTA Fields'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}


                {/* TAB 9: NOTICE BOARD CONTENT MANAGER */}
                {activeTab === 'notice_board' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                            <Bell className="h-5 w-5 text-[#B8862A]" />
                            <span>{language === 'bn' ? '৯. তথ্যকেন্দ্র ও নোটিশ বোর্ড নিয়ন্ত্রণ' : '9. Notice Board Content Panel'}</span>
                          </h3>
                          <p className="text-xs text-stone-500 font-sans mt-1">
                            {language === 'bn' 
                              ? 'ওয়েবসাইটের তথ্যকেন্দ্র ও নোটিশ বোর্ডের আজকের নোটিশ, केंद्रीय নোটিশ, নতুন আপডেট, সেমিনার এবং সংবাদ সাময়িকী নিয়ন্ত্রণ করুন।' 
                              : 'Manage today\'s notices, central notices, new updates, seminars, and newspapers media feed.'}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {/* Manual Database Connection Checker */}
                          <button
                            type="button"
                            onClick={checkDbConnection}
                            disabled={checkingDb}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                              checkingDb 
                                ? 'bg-stone-100 text-stone-400 border-stone-200'
                                : isDbConnected 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                            <span>
                              {checkingDb 
                                ? (language === 'bn' ? 'সংযোগ পরীক্ষা হচ্ছে...' : 'Checking...') 
                                : isDbConnected 
                                  ? (language === 'bn' ? 'কানেকশন: সচল 🟢' : 'DB Connected 🟢') 
                                  : (language === 'bn' ? 'কানেকশন: অফলাইন 🔴' : 'DB Offline 🔴')
                              }
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={createNewNoticeItem}
                            className="px-4 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded-lg hover:scale-102 transition shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{language === 'bn' ? 'নতুন যুক্ত করুন' : 'Add New Item'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Sub-tabs Selection Bar */}
                      <div className="flex flex-wrap gap-2 mt-6 border-t pt-4">
                        {[
                          { id: 'central', label_bn: '১. কেন্দ্রীয় নোটিশ বোর্ড', label_en: '1. Central Notices' },
                          { id: 'event', label_bn: '২. নতুন আপডেট ও সেমিনার', label_en: '2. Seminar & Updates' },
                          { id: 'news', label_bn: '৩. সংবাদ সাময়িকী ও মিডিয়া', label_en: '3. Press Newspaper' },
                          { id: 'today_desc', label_bn: '৪. আজকের নোটিশ বক্স', label_en: "4. Today's Notice Box" }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => { setActiveNoticeSubTab(sub.id as any); setEditingNoticeItem(null); }}
                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeNoticeSubTab === sub.id 
                                ? 'bg-[#2E5942] text-white shadow-xs' 
                                : 'bg-stone-100 text-[#2E5942] hover:bg-stone-200'
                            }`}
                          >
                            {sub.id === 'central' && <FileText className="h-3.5 w-3.5" />}
                            {sub.id === 'event' && <Calendar className="h-3.5 w-3.5" />}
                            {sub.id === 'news' && <Bell className="h-3.5 w-3.5" />}
                            {sub.id === 'today_desc' && <Sparkles className="h-3.5 w-3.5" />}
                            <span>{language === 'bn' ? sub.label_bn : sub.label_en}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* EDITING DIALOG / FORM */}
                    {editingNoticeItem && (
                      <div className="bg-[#FAF7F2] p-6 rounded-2xl border-2 border-[#B8862A]/40 shadow-md">
                        <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-3 mb-4">
                          <h4 className="font-serif font-extrabold text-[#1A1207] text-sm md:text-base flex items-center gap-2">
                            <span className="p-1 bg-[#B8862A]/10 text-[#B8862A] rounded-md">✍️</span>
                            <span>
                              {language === 'bn' 
                                ? `${editingNoticeItem.id.startsWith('item-') ? 'নতুন' : 'সম্পাদনা'} - তথ্য ও নোটিশ ফরম` 
                                : `${editingNoticeItem.id.startsWith('item-') ? 'Create' : 'Edit'} - Notice & Entry Form`}
                            </span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setEditingNoticeItem(null)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Left Column: Form Inputs (7-cols) */}
                          <div className="lg:col-span-7">
                            <form onSubmit={saveNoticeItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs text-left">
                              {activeNoticeSubTab === 'central' && (
                                <>
                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'নোটিশের শিরোনাম (বাংলা)' : 'Notice Title (Bangla)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-1 focus:ring-[#B8862A] bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'নোটিশের শিরোনাম (ইংরেজি)' : 'Notice Title (English)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-1 focus:ring-[#B8862A] bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রকাশের তারিখ (বাংলা)' : 'Publication Date (Bangla)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.date_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, date_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'প্রকাশের তারিখ (ইংরেজি)' : 'Publication Date (English)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.date_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, date_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="flex items-center gap-6 pt-3 md:col-span-2 border-t border-dashed">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                                      <input
                                        type="checkbox"
                                        checked={!!editingNoticeItem.isUrgent}
                                        onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, isUrgent: e.target.checked })}
                                        className="rounded border-stone-300 text-[#8B3A1E] focus:ring-[#8B3A1E] h-4 w-4 cursor-pointer"
                                      />
                                      <span>⚠️ {language === 'bn' ? 'জরুরি নোটিশ চিহ্নিত করুন' : 'Mark as Urgent'}</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                                      <input
                                        type="checkbox"
                                        checked={!!editingNoticeItem.isNew}
                                        onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, isNew: e.target.checked })}
                                        className="rounded border-stone-300 text-[#B8862A] focus:ring-[#B8862A] h-4 w-4 cursor-pointer"
                                      />
                                      <span>✨ {language === 'bn' ? 'নতুন নোটিশ চিহ্নিত করুন' : 'Mark as New'}</span>
                                    </label>
                                  </div>
                                </>
                              )}

                              {activeNoticeSubTab === 'event' && (
                                <>
                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সেমিনার বা ইভেন্টের শিরোনাম (বাংলা)' : 'Event / Seminar Title (Bangla)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সেমিনার বা ইভেন্টের শিরোনাম (ইংরেজি)' : 'Event / Seminar Title (English)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখের দিন (বাংলা - যেমন: ২৫)' : 'Date Day (Bangla - e.g. 25)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.day || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, day: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখের দিন (ইংরেজি - যেমন: 25)' : 'Date Day (English - e.g. 25)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.dayEn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, dayEn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখের মাস (বাংলা - যেমন: জুন)' : 'Date Month (Bangla - e.g. Jun)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.month || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, month: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখের মাস (ইংরেজি - যেমন: Jun)' : 'Date Month (English - e.g. Jun)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.monthEn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, monthEn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ক্যাটাগরি চিপ (বাংলা - যেমন: সেমিনার)' : 'Category Chip (Bangla - e.g. Seminar)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.chip_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, chip_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ক্যাটাগরি চিপ (ইংরেজি - যেমন: Seminar)' : 'Category Chip (English - e.g. Seminar)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.chip_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, chip_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সময়সূচী (বাংলা)' : 'Timings (Bangla)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.time_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, time_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সময়সূচী (ইংরেজি)' : 'Timings (English)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.time_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, time_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'স্থান / ভেন্যু (বাংলা)' : 'Venue (Bangla)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.loc_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, loc_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'স্থান / ভেন্যু (ইংরেজি)' : 'Venue (English)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.loc_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, loc_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>
                                </>
                              )}

                              {activeNoticeSubTab === 'news' && (
                                <>
                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংবাদ শিরোনাম (বাংলা)' : 'News Title (Bangla)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'সংবাদ শিরোনাম (ইংরেজি)' : 'News Title (English)'}</label>
                                    <textarea
                                      rows={2}
                                      required
                                      value={editingNoticeItem.title_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, title_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উৎস বা ট্যাগ (বাংলা - যেমন: মিডিয়া)' : 'Source Tag (Bangla - e.g. Media)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.tag_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, tag_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'উৎস বা ট্যাগ (ইংরেজি - যেমন: Press)' : 'Source Tag (English - e.g. Press)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.tag_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, tag_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখ (বাংলা)' : 'Date (Bangla)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.date_bn || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, date_bn: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'তারিখ (ইংরেজি)' : 'Date (English)'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editingNoticeItem.date_en || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, date_en: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">{language === 'bn' ? 'আইকন বা ইমোজি (যেমন: 📰, 📺, 🎥)' : 'Icon / Emoji (e.g. 📰, 📺, 🎥)'}</label>
                                    <input
                                      type="text"
                                      value={editingNoticeItem.icon || ''}
                                      onChange={(e) => setEditingNoticeItem({ ...editingNoticeItem, icon: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-800 text-xs"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Attached Files & Documents (Images / PDFs) Section */}
                              <div className="md:col-span-2 border-t border-dashed border-stone-200 pt-4 mt-2 space-y-3">
                                <h4 className="font-bold text-xs text-[#B8862A] uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText className="h-4 w-4" />
                                  <span>{language === 'bn' ? 'সংযুক্ত ফাইল (ছবি অথবা পিডিএফ)' : 'File Attachment (Image / PDF)'}</span>
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                                  {/* Left: Raw Upload & Dynamic Image Cropper helper */}
                                  <div className="space-y-2 text-left">
                                    <label className="font-bold text-stone-700 block">
                                      {language === 'bn' ? 'কম্পিউটার থেকে ফাইল আপলোড করুন' : 'Upload from Computer'}
                                    </label>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                      {/* Standard Raw File Drop / Picker for PDFs and direct files up to 950KB */}
                                      <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-3 flex flex-col items-center justify-center bg-white hover:bg-stone-50/50 hover:border-[#B8862A] transition duration-150 text-center min-h-[90px]">
                                        <input
                                          type="file"
                                          accept="image/*,application/pdf"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              if (file.size > 950 * 1024) {
                                                alert(language === 'bn' ? 'ফাইল সাইজ অবশ্যই ৯৫০ কেবির কম হতে হবে।' : 'File size must be under 950 KB.');
                                                return;
                                              }
                                              const reader = new FileReader();
                                              reader.onload = () => {
                                                setEditingNoticeItem({
                                                  ...editingNoticeItem,
                                                  fileUrl: reader.result as string,
                                                  fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
                                                  fileName: file.name
                                                });
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="h-4 w-4 text-stone-400 mb-1 pointer-events-none" />
                                        <span className="text-[9px] text-stone-500 font-sans pointer-events-none leading-snug">
                                          {language === 'bn' ? 'পিডিএফ বা সরাসরি ছোট ফাইল (সর্বোচ্চ ৯৫০ KB)' : 'Upload PDF / Raw file (Max 950 KB)'}
                                        </span>
                                      </div>

                                      {/* Crop & compression optimized helper button for images */}
                                      <button
                                        type="button"
                                        onClick={() => openImageResizer('any', (resizedUrl) => {
                                          setEditingNoticeItem({
                                            ...editingNoticeItem,
                                            fileUrl: resizedUrl,
                                            fileType: 'image',
                                            fileName: 'uploaded_notice_image.jpg'
                                          });
                                        })}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#B8862A] hover:bg-[#9A6D1E] text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer"
                                      >
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>{language === 'bn' ? 'ছবি আপলোড ও কাটুন (যেকোনো সাইজ)' : 'Upload & Crop Image (Any Size)'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Right: Direct URL configuration and Clear Action */}
                                  <div className="space-y-3 flex flex-col justify-between text-left">
                                    <div className="space-y-1.5">
                                      <label className="font-bold text-stone-700 block">
                                        {language === 'bn' ? 'অথবা সরাসরি ফাইলের ওয়েব লিঙ্ক (URL) দিন' : 'Or enter direct web file link (URL)'}
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="https://example.com/document.pdf"
                                        value={editingNoticeItem.fileUrl || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          let type = '';
                                          if (val.toLowerCase().endsWith('.pdf') || val.includes('pdf')) {
                                            type = 'pdf';
                                          } else if (val.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) || val.includes('image')) {
                                            type = 'image';
                                          }
                                          setEditingNoticeItem({
                                            ...editingNoticeItem,
                                            fileUrl: val,
                                            fileType: type || 'pdf',
                                            fileName: val.substring(val.lastIndexOf('/') + 1) || 'web_attached_document'
                                          });
                                        }}
                                        className="w-full p-2 border border-stone-200 rounded-lg bg-white text-stone-800 text-[11px]"
                                      />
                                    </div>

                                    {/* Uploaded file information / status */}
                                    {editingNoticeItem.fileUrl ? (
                                      <div className="p-2 bg-stone-100 rounded-lg border flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1 flex items-center gap-2 text-left">
                                          <span className="text-sm shrink-0">
                                            {editingNoticeItem.fileType === 'image' ? '📸' : '📄'}
                                          </span>
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-stone-700 truncate">
                                              {editingNoticeItem.fileName || (language === 'bn' ? 'সংযুক্ত ফাইল' : 'Attached File')}
                                            </p>
                                            <p className="text-[8px] font-mono text-stone-500 uppercase">
                                              {editingNoticeItem.fileType || 'unknown'} • {editingNoticeItem.fileUrl.startsWith('data:') ? 'base64 uploaded' : 'web linked'}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setEditingNoticeItem({
                                            ...editingNoticeItem,
                                            fileUrl: '',
                                            fileType: '',
                                            fileName: ''
                                          })}
                                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-stone-200 transition cursor-pointer shrink-0"
                                          title={language === 'bn' ? 'ফাইল মুছে ফেলুন' : 'Remove attached file'}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-stone-400 italic text-center p-2 border border-dashed border-stone-200 rounded-lg">
                                        {language === 'bn' ? 'কোনো ফাইল সংযুক্ত নেই (ঐচ্ছিক)' : 'No file attached yet (Optional)'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>

                          {/* Right Column: Dynamic Real-time notice preview in original BSK gold/cream theme (5-cols) */}
                          <div className="lg:col-span-5 h-full flex flex-col text-left">
                            <div className="bg-[#FAF7F2] border-2 border-[#B8862A]/25 rounded-2xl p-4 space-y-4 sticky top-4 shadow-sm">
                              <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-2">
                                <span className="text-[10px] font-bold text-[#B8862A] uppercase tracking-wider font-sans flex items-center gap-1">
                                  <span className="w-2 h-2 bg-[#B8862A] rounded-full animate-ping" />
                                  <span>{language === 'bn' ? 'লাইভ প্রিভিউ (ক্লিক করলে যেমন দেখাবে)' : 'Notice Live Preview (Modal replica)'}</span>
                                </span>
                              </div>

                              {/* Realistic Preview replica of website notice modal (No Green, strictly BSK themes) */}
                              <div className="border border-[#B8862A]/35 bg-[#FAF7F2] rounded-xl overflow-hidden shadow-md flex flex-col font-serif">
                                {/* Preview Header - styled exactly like the PageContent BSK modal */}
                                <div className="bg-[#1A1207] text-[#FAF7F2] p-4 relative border-b border-[#B8862A]/40 text-left">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="bg-[#B8862A] text-white text-[9px] uppercase tracking-wider font-sans font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                                        {activeNoticeSubTab === 'central' && (language === 'bn' ? 'কেন্দ্রীয় নোটিশ' : 'Central Notice')}
                                        {activeNoticeSubTab === 'event' && (language === 'bn' ? 'সেমিনার ও আপডেট' : 'Seminar & Update')}
                                        {activeNoticeSubTab === 'news' && (language === 'bn' ? 'সংবাদ ও মিডিয়া' : 'News & Press')}
                                      </span>
                                      {editingNoticeItem.isUrgent && (
                                        <span className="bg-red-600 text-white text-[8px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.5 rounded shadow-xs">
                                          {language === 'bn' ? 'জরুরি' : 'Urgent'}
                                        </span>
                                      )}
                                      {editingNoticeItem.isNew && (
                                        <span className="bg-[#B8862A] text-white text-[8px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.5 rounded shadow-xs">
                                          {language === 'bn' ? 'নতুন' : 'New'}
                                        </span>
                                      )}
                                    </div>

                                    <h3 className="text-xs md:text-sm font-extrabold leading-snug text-white pr-4">
                                      {language === 'bn' ? (editingNoticeItem.title_bn || 'নোটিশের শিরোনাম') : (editingNoticeItem.title_en || 'Notice Title')}
                                    </h3>

                                    {/* Subtitle/Meta dates display */}
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-[#FAF7F2]/80 font-sans pt-0.5 border-t border-white/10 mt-1">
                                      {activeNoticeSubTab === 'central' && (
                                        <span>📅 {language === 'bn' ? (editingNoticeItem.date_bn || 'তারিখ') : (editingNoticeItem.date_en || 'Date')}</span>
                                      )}
                                      {activeNoticeSubTab === 'event' && (
                                        <>
                                          <span>📅 {language === 'bn' ? `${editingNoticeItem.day || '২৫'} ${editingNoticeItem.month || 'জুন'}` : `${editingNoticeItem.dayEn || '25'} ${editingNoticeItem.monthEn || 'Jun'}`}</span>
                                          <span>🕒 {language === 'bn' ? (editingNoticeItem.time_bn || 'সময়') : (editingNoticeItem.time_en || 'Time')}</span>
                                          <span>🏢 {language === 'bn' ? (editingNoticeItem.loc_bn || 'স্থান') : (editingNoticeItem.loc_en || 'Location')}</span>
                                        </>
                                      )}
                                      {activeNoticeSubTab === 'news' && (
                                        <>
                                          <span>📅 {language === 'bn' ? (editingNoticeItem.date_bn || 'তারিখ') : (editingNoticeItem.date_en || 'Date')}</span>
                                          <span>🏷️ {language === 'bn' ? (editingNoticeItem.tag_bn || 'ট্যাগ') : (editingNoticeItem.tag_en || 'Tag')}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Preview Body */}
                                <div className="p-3.5 space-y-3.5 font-sans text-stone-800 text-[11px] text-left">
                                  <div className="space-y-1.5 leading-relaxed">
                                    <p className="font-serif text-stone-700 italic border-l-2 border-[#B8862A] pl-2 text-[10px]">
                                      {language === 'bn' 
                                        ? 'বিশ্বসাহিত্য কেন্দ্র এর সম্মানিত পাঠক ও শুভানুধ্যায়ীদের অবগতির জন্য বিস্তারিত জানানো যাচ্ছে।' 
                                        : 'Honorable readers and well-wishers of Bishwo Shahitto Kendro are hereby informed with the following details.'}
                                    </p>
                                    <p className="text-stone-600 leading-normal text-[10px]">
                                      {language === 'bn' 
                                        ? `${editingNoticeItem.title_bn || 'নোটিশ শিরোনাম'} সংক্রান্ত বিস্তারিত নির্দেশনাবলী নিম্নে সংযুক্ত ফাইলে প্রদান করা হয়েছে। যেকোনো প্রয়োজনে যোগাযোগ করুন।` 
                                        : `Detailed guidelines and documents regarding "${editingNoticeItem.title_en || 'Notice Title'}" have been attached below.`}
                                    </p>
                                  </div>

                                  {/* Preview Attachment Block */}
                                  {editingNoticeItem.fileUrl ? (
                                    <div className="space-y-1.5 pt-2.5 border-t border-stone-200">
                                      <h4 className="text-[9px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                        📎 <span>{language === 'bn' ? 'সংযুক্ত ফাইল' : 'Attached File'}</span>
                                      </h4>

                                      {editingNoticeItem.fileType === 'image' || (!editingNoticeItem.fileType && editingNoticeItem.fileUrl.startsWith('data:image/')) ? (
                                        <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-100 p-1 text-center">
                                          <img 
                                            src={editingNoticeItem.fileUrl} 
                                            alt="Notice Attachment Preview" 
                                            className="max-h-[110px] w-auto mx-auto rounded shadow-xs object-contain"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="mt-1 text-[8px] font-mono text-stone-500 truncate px-1">
                                            {editingNoticeItem.fileName || 'attached_image.jpg'}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="p-2 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between gap-1.5 shadow-xs">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="p-1.5 bg-red-100 text-red-700 rounded text-[9px] font-bold shrink-0">PDF</span>
                                            <div className="text-left min-w-0 leading-none">
                                              <p className="text-[9px] font-extrabold text-red-950 truncate max-w-[120px]">
                                                {editingNoticeItem.fileName || 'guideline_document.pdf'}
                                              </p>
                                              <p className="text-[7px] text-red-600 font-medium">
                                                {language === 'bn' ? 'ডকুমেন্ট ফাইল' : 'Document File'}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="px-2 py-1 bg-red-600 text-white font-sans text-[8px] font-bold rounded shadow-xs">
                                            {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="pt-2.5 border-t border-stone-200 text-center text-[9px] text-stone-400 italic">
                                      {language === 'bn' ? 'কোনো ফাইল সংযুক্ত নেই।' : 'No file attachments connected.'}
                                    </div>
                                  )}
                                </div>

                                {/* Preview Footer */}
                                <div className="bg-stone-50 p-2 border-t border-stone-100 flex justify-between items-center gap-2 text-[9px]">
                                  <span className="font-mono text-stone-400">ID: {editingNoticeItem.id.substring(0, 12)}</span>
                                  <button
                                    type="button"
                                    className="px-2.5 py-1 bg-[#B8862A] text-white rounded text-[8px] font-bold"
                                  >
                                    {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Save / Cancel triggers bar */}
                        <div className="flex justify-end gap-2 border-t border-stone-200 pt-4 mt-6">
                          <button
                            type="button"
                            onClick={() => setEditingNoticeItem(null)}
                            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold transition cursor-pointer text-xs"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                          <button
                            onClick={saveNoticeItem}
                            className="px-5 py-2 bg-[#B8862A] hover:bg-[#9A6D1E] text-white rounded-lg font-bold hover:scale-102 transition shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Notice Item'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LIST VIEW PANEL OF DOCUMENTS */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                      <div className="bg-[#B8862A]/5 border-b border-stone-100 p-4 font-serif font-bold text-xs text-[#B8862A] tracking-wider uppercase">
                        {language === 'bn' ? 'বিদ্যমান নোটিশ সমূহ' : 'Existing List Entries'}
                      </div>

                      {activeNoticeSubTab === 'central' && (
                        <div className="divide-y divide-stone-100">
                          {noticesList.length === 0 ? (
                            <div className="p-8 text-center text-stone-400 text-xs font-sans">
                              {language === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি। নতুন নোটিশ যোগ করুন।' : 'No notices found. Add a new notice above.'}
                            </div>
                          ) : (
                            noticesList.map((not) => (
                              <div key={not.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/50 transition font-sans">
                                <div className="space-y-1.5 text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] text-stone-500 font-mono">📅 {language === 'bn' ? not.date_bn : not.date_en}</span>
                                    {not.isUrgent && <span className="bg-[#8B3A1E] text-white px-1.5 py-0.5 rounded text-[8px] font-bold">URGENT</span>}
                                    {not.isNew && <span className="bg-[#B8862A] text-white px-1.5 py-0.5 rounded text-[8px] font-bold">NEW</span>}
                                    {not.fileUrl && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5">
                                        📎 ATTACHMENT ({not.fileType || 'file'})
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs md:text-sm font-extrabold text-stone-900 leading-snug truncate">
                                    {language === 'bn' ? not.title_bn : not.title_en}
                                  </h4>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoticeItem(not)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteNoticeItem('notices', not.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeNoticeSubTab === 'event' && (
                        <div className="divide-y divide-stone-100">
                          {eventsList.length === 0 ? (
                            <div className="p-8 text-center text-stone-400 text-xs font-sans">
                              {language === 'bn' ? 'কোনো আপডেট বা সেমিনার পাওয়া যায়নি।' : 'No events or updates found. Add a new seminar above.'}
                            </div>
                          ) : (
                            eventsList.map((ev) => (
                              <div key={ev.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/50 transition font-sans">
                                <div className="space-y-1.5 text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="bg-[#B8862A]/10 text-[#B8862A] text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                      {language === 'bn' ? ev.chip_bn : ev.chip_en}
                                    </span>
                                    <span className="text-[10px] text-[#6B5135] font-semibold">
                                      🕒 {language === 'bn' ? `${ev.day} ${ev.month} • ${ev.time_bn}` : `${ev.dayEn} ${ev.monthEn} • ${ev.time_en}`}
                                    </span>
                                    {ev.fileUrl && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5">
                                        📎 ATTACHMENT ({ev.fileType || 'file'})
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs md:text-sm font-extrabold text-stone-900 leading-snug truncate">
                                    {language === 'bn' ? ev.title_bn : ev.title_en}
                                  </h4>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoticeItem(ev)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteNoticeItem('events', ev.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeNoticeSubTab === 'news' && (
                        <div className="divide-y divide-stone-100">
                          {newsList.length === 0 ? (
                            <div className="p-8 text-center text-stone-400 text-xs font-sans">
                              {language === 'bn' ? 'কোনো সংবাদপত্র বা মিডিয়া কাভারেজ পাওয়া যায়নি।' : 'No news or press coverage found.'}
                            </div>
                          ) : (
                            newsList.map((news) => (
                              <div key={news.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/50 transition font-sans">
                                <div className="space-y-1.5 text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm shrink-0">{news.icon || "📰"}</span>
                                    <span className="bg-[#FAF7F2] text-[#B8862A] text-[9px] px-1.5 py-0.5 border border-[#E8DDD0] rounded font-bold uppercase">
                                      {language === 'bn' ? news.tag_bn : news.tag_en}
                                    </span>
                                    <span className="text-[10px] text-stone-500">📅 {language === 'bn' ? news.date_bn : news.date_en}</span>
                                    {news.fileUrl && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5">
                                        📎 ATTACHMENT ({news.fileType || 'file'})
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs md:text-sm font-extrabold text-stone-900 leading-snug truncate">
                                    {language === 'bn' ? news.title_bn : news.title_en}
                                  </h4>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoticeItem(news)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteNoticeItem('news_items', news.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeNoticeSubTab === 'today_desc' && (
                        <div className="bg-[#FAF7F2] p-6 rounded-2xl border-2 border-[#B8862A]/40 shadow-md max-w-2xl mx-auto">
                          <form onSubmit={saveTodayNotice} className="space-y-4 font-sans text-xs text-left">
                            <div>
                              <h4 className="font-serif font-extrabold text-[#1A1207] text-sm md:text-base mb-2">
                                {language === 'bn' ? '৪. আজকের নোটিশ বক্স সম্পাদনা' : "4. Edit Today's Notice Box"}
                              </h4>
                              <p className="text-[11px] text-stone-500 mb-4">
                                {language === 'bn' 
                                  ? 'তথ্যকেন্দ্র ও নোটিশ বোর্ডের একদম ওপরে প্রদর্শিত আজকের মূল নোটিশটি এখান থেকে সরাসরি সংশোধন করুন।' 
                                  : "Update the primary highlighted notice box displayed at the very top of the notices page."}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">
                                {language === 'bn' ? 'নোটিশ বক্সের শিরোনাম' : 'Notice Box Title'}
                              </label>
                              <input 
                                type="text"
                                required
                                value={todayNoticeTitle}
                                onChange={(e) => setTodayNoticeTitle(e.target.value)}
                                className="w-full p-2.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 bg-white"
                                placeholder={language === 'bn' ? 'যেমন: আজকের নোটিশ ও ঘোষণা' : "e.g., Today's Notice & Announcements"}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700 block">
                                {language === 'bn' ? 'নোটিশের মূল বার্তা / বিষয়বস্তু' : 'Notice Content Text'}
                              </label>
                              <textarea
                                required
                                rows={6}
                                value={todayNoticeContent}
                                onChange={(e) => setTodayNoticeContent(e.target.value)}
                                className="w-full p-2.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 bg-white leading-relaxed"
                                placeholder={language === 'bn' ? 'নোটিশের মূল বিষয়বস্তু এখানে লিখুন...' : 'Write the main body of the notice here...'}
                              />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-stone-200/50 mt-4">
                              <button
                                type="submit"
                                disabled={isSavingTodayNotice}
                                className="px-5 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-md hover:scale-102 hover:bg-[#203F2F] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>{isSavingTodayNotice ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'রক্ষণ করুন' : 'Save Notice')}</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 10: CONTACT & INQUIRIES CONTENT MANAGER */}
                {activeTab === 'contact' && (
                  <div className="space-y-6 animate-fade-in text-stone-800">
                    {/* Part A: Edit Contact Info (Address, Phones, Emails, etc.) */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                            <Mail className="h-5 w-5 text-[#B8862A]" />
                            <span>{language === 'bn' ? '১০. যোগাযোগ তথ্য ও বার্তা নিয়ন্ত্রণ' : '10. Contact Info & Inquiries'}</span>
                          </h3>
                          <p className="text-xs text-stone-500 font-sans mt-1">
                            {language === 'bn' 
                              ? 'ওয়েবসাইটের প্রধান কার্যালয়ের যোগাযোগ ঠিকানা, ফোন নম্বর, ইমেইল এবং কর্মঘণ্টা নিয়ন্ত্রণ করুন।' 
                              : 'Manage main HQ contact address, phone numbers, emails, and business hours.'}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info Editing Form */}
                      <div className="mt-6 border-t border-stone-100 pt-6">
                        <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-4 font-sans">
                          {language === 'bn' ? 'প্রধান কার্যালয়ের সাধারণ তথ্যসমূহ' : 'HQ General Contact Details'}
                        </h4>
                        
                        {(() => {
                          const currentVal = contactInfoBlock || {
                            address_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।',
                            address_en: 'Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.',
                            phones: '+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১',
                            emails: 'bskbd@live.com, info@bskbd.org',
                            hours_bn: 'খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)',
                            hours_en: 'Hours: 9:00 AM - 5:00 PM (Closed Fridays)'
                          };

                          return (
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const updated = {
                                  ...currentVal,
                                  address_bn: fd.get('address_bn')?.toString().trim() || currentVal.address_bn,
                                  address_en: fd.get('address_en')?.toString().trim() || currentVal.address_en,
                                  phones: fd.get('phones')?.toString().trim() || currentVal.phones,
                                  emails: fd.get('emails')?.toString().trim() || currentVal.emails,
                                  hours_bn: fd.get('hours_bn')?.toString().trim() || currentVal.hours_bn,
                                  hours_en: fd.get('hours_en')?.toString().trim() || currentVal.hours_en,
                                };
                                try {
                                  await setDoc(doc(db, 'homepage_blocks', 'contact_info'), updated);
                                  alert(language === 'bn' ? 'যোগাযোগের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Contact details updated successfully!');
                                } catch (err) {
                                  console.error("Error saving contact_info block:", err);
                                  alert(language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save details.');
                                }
                              }}
                              className="space-y-4 text-xs font-sans text-left"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ঠিকানা (বাংলা):' : 'Address (Bangla):'}</label>
                                  <textarea 
                                    name="address_bn"
                                    defaultValue={currentVal.address_bn}
                                    rows={2}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ঠিকানা (ইংরেজি):' : 'Address (English):'}</label>
                                  <textarea 
                                    name="address_en"
                                    defaultValue={currentVal.address_en}
                                    rows={2}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ফোন নম্বরসমূহ (কমা দিয়ে আলাদা করুন):' : 'Phone Numbers (comma separated):'}</label>
                                  <input 
                                    type="text"
                                    name="phones"
                                    defaultValue={currentVal.phones}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ইমেইলসমূহ (কমা দিয়ে আলাদা করুন):' : 'Email Addresses (comma separated):'}</label>
                                  <input 
                                    type="text"
                                    name="emails"
                                    defaultValue={currentVal.emails}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'কর্মঘণ্টা (বাংলা):' : 'Working Hours (Bangla):'}</label>
                                  <input 
                                    type="text"
                                    name="hours_bn"
                                    defaultValue={currentVal.hours_bn}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'কর্মঘণ্টা (ইংরেজি):' : 'Working Hours (English):'}</label>
                                  <input 
                                    type="text"
                                    name="hours_en"
                                    defaultValue={currentVal.hours_en}
                                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#2E5942] focus:bg-white outline-none text-stone-800"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-102 transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  <span>{language === 'bn' ? 'তথ্য হালনাগাদ করুন' : 'Update Details'}</span>
                                </button>
                              </div>
                            </form>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Part B: Custom Contact & Info Cards (e.g., Regional Branches, Book Shops) */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                        <div>
                          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider font-sans">
                            {language === 'bn' ? 'অতিরিক্ত যোগাযোগ ও শাখা কার্ডসমূহ' : 'Custom Contact & Branch Cards'}
                          </h4>
                          <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                            {language === 'bn' 
                              ? 'এখানে আপনি আঞ্চলিক কার্যালয়, লাইব্রেরি কেন্দ্র বা বিশেষ বুক শপের জন্য নতুন কার্ড ছবি বা আইকনসহ যোগ করতে পারেন।' 
                              : 'Add or edit regional branches, libraries, book shops or other specific divisions here with images or icons.'}
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setCardForm({
                              title_bn: '',
                              title_en: '',
                              desc_bn: '',
                              desc_en: '',
                              imgUrl: '',
                              icon: '📍'
                            });
                            setEditingCardIndex(null);
                            setIsCardFormOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded-lg hover:scale-102 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{language === 'bn' ? 'নতুন কার্ড যুক্ত করুন' : 'Add New Card'}</span>
                        </button>
                      </div>

                      {/* Active card editing/adding form */}
                      {isCardFormOpen && (
                        <div className="p-4 mb-5 bg-[#FAF7F2] border border-[#B8862A]/20 rounded-xl space-y-4 text-xs text-stone-800 text-left font-sans animate-fade-in">
                          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                            <h5 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#B8862A]" />
                              {editingCardIndex === null 
                                ? (language === 'bn' ? 'নতুন কার্ডের তথ্য' : 'New Card Details') 
                                : (language === 'bn' ? `কার্ড সংশোধন (#${editingCardIndex + 1})` : `Edit Card (#${editingCardIndex + 1})`)}
                            </h5>
                            <button 
                              onClick={() => setIsCardFormOpen(false)}
                              className="text-stone-400 hover:text-stone-600 p-0.5 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700">{language === 'bn' ? 'কার্ডের শিরোনাম (বাংলা):' : 'Card Title (Bangla):'}</label>
                              <input 
                                type="text"
                                value={cardForm.title_bn}
                                onChange={(e) => setCardForm({ ...cardForm, title_bn: e.target.value })}
                                placeholder={language === 'bn' ? 'যেমন: চট্টগ্রাম আঞ্চলিক কেন্দ্র' : 'e.g., Chattogram Regional Center'}
                                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#2E5942] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700">{language === 'bn' ? 'কার্ডের শিরোনাম (ইংরেজি):' : 'Card Title (English):'}</label>
                              <input 
                                type="text"
                                value={cardForm.title_en}
                                onChange={(e) => setCardForm({ ...cardForm, title_en: e.target.value })}
                                placeholder="e.g., Chattogram Regional Branch"
                                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#2E5942] outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700">{language === 'bn' ? 'কার্ডের বিবরণ/ঠিকানা (বাংলা):' : 'Description/Address (Bangla):'}</label>
                              <textarea 
                                rows={3}
                                value={cardForm.desc_bn}
                                onChange={(e) => setCardForm({ ...cardForm, desc_bn: e.target.value })}
                                placeholder={language === 'bn' ? 'শাখার ঠিকানা, ফোন নম্বর ও বিস্তারিত বিবরণ...' : 'Branch address, contact phone and details...'}
                                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#2E5942] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-stone-700">{language === 'bn' ? 'কার্ডের বিবরণ/ঠিকানা (ইংরেজি):' : 'Description/Address (English):'}</label>
                              <textarea 
                                rows={3}
                                value={cardForm.desc_en}
                                onChange={(e) => setCardForm({ ...cardForm, desc_en: e.target.value })}
                                placeholder="Branch address, manager name, contact numbers etc..."
                                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#2E5942] outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-200/50 pt-3">
                            {/* Card Image Options */}
                            <div className="space-y-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্ডের জন্য ছবি (ঐচ্ছিক):' : 'Card Image URL (Optional):'}</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={cardForm.imgUrl}
                                  onChange={(e) => setCardForm({ ...cardForm, imgUrl: e.target.value })}
                                  placeholder="https://example.com/image.jpg"
                                  className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => openImageResizer('landscape', (resizedUrl) => {
                                    setCardForm({ ...cardForm, imgUrl: resizedUrl });
                                  })}
                                  className="px-3 bg-[#2E5942] hover:bg-[#1C3E2D] text-white font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                                </button>
                              </div>
                              {cardForm.imgUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img src={cardForm.imgUrl} className="h-10 w-16 object-cover rounded border" />
                                  <button 
                                    type="button"
                                    onClick={() => setCardForm({ ...cardForm, imgUrl: '' })}
                                    className="text-red-500 hover:underline text-[10px]"
                                  >
                                    {language === 'bn' ? 'ছবি বাতিল করুন' : 'Remove Image'}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card Icon Picker if no image */}
                            <div className="space-y-2">
                              <label className="font-bold text-stone-700 block">{language === 'bn' ? 'আইকন নির্বাচন করুন (ছবি না থাকলে):' : 'Select Icon (If no image):'}</label>
                              <div className="flex items-center gap-2 flex-wrap">
                                {['📍', '📞', '✉️', '🏢', '📖', '🎓', '🏛️', '🌟', '💼', '📌'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setCardForm({ ...cardForm, icon: emoji })}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg border transition ${
                                      cardForm.icon === emoji ? 'border-[#B8862A] bg-amber-50' : 'border-stone-200 bg-white hover:bg-stone-50'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 border-t border-stone-200/50 pt-3">
                            <button
                              type="button"
                              onClick={() => setIsCardFormOpen(false)}
                              className="px-3 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-lg hover:bg-stone-300 transition"
                            >
                              {language === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!cardForm.title_bn && !cardForm.title_en) {
                                  alert(language === 'bn' ? 'দয়া করে একটি শিরোনাম দিন।' : 'Please specify a card title.');
                                  return;
                                }
                                const currentCards = Array.isArray(contactInfoBlock?.cards) ? [...contactInfoBlock.cards] : [];
                                if (editingCardIndex === null) {
                                  currentCards.push(cardForm);
                                } else {
                                  currentCards[editingCardIndex] = cardForm;
                                }
                                try {
                                  const updatedDoc = {
                                    ...(contactInfoBlock || {
                                      address_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।',
                                      address_en: 'Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.',
                                      phones: '+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১',
                                      emails: 'bskbd@live.com, info@bskbd.org',
                                      hours_bn: 'খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)',
                                      hours_en: 'Hours: 9:00 AM - 5:00 PM (Closed Fridays)'
                                    }),
                                    cards: currentCards
                                  };
                                  await setDoc(doc(db, 'homepage_blocks', 'contact_info'), updatedDoc);
                                  setIsCardFormOpen(false);
                                  alert(language === 'bn' ? 'শাখা কার্ড সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Branch card saved successfully!');
                                } catch (err) {
                                  console.error("Error updating cards:", err);
                                  alert(language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save card.');
                                }
                              }}
                              className="px-4 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg hover:scale-102 transition flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>{language === 'bn' ? 'কার্ড সংরক্ষণ করুন' : 'Save Card'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display current list of cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {contactInfoBlock?.cards && Array.isArray(contactInfoBlock.cards) && contactInfoBlock.cards.length > 0 ? (
                          (contactInfoBlock?.cards || []).map((card: any, idx: number) => (
                            <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between text-left space-y-3 font-sans text-xs">
                              <div>
                                {card.imgUrl ? (
                                  <img src={card.imgUrl} className="h-24 w-full object-cover rounded-lg border border-stone-200 mb-2" />
                                ) : (
                                  <div className="h-24 w-full bg-[#FAF7F2] border border-stone-200 rounded-lg flex items-center justify-center text-2xl mb-2 text-[#B8862A]">
                                    {card.icon || '📍'}
                                  </div>
                                )}
                                <h5 className="font-bold text-stone-900 line-clamp-1">{language === 'bn' ? card.title_bn : card.title_en}</h5>
                                <p className="text-stone-500 line-clamp-2 mt-1">{language === 'bn' ? card.desc_bn : card.desc_en}</p>
                              </div>

                              <div className="flex items-center justify-between border-t border-stone-200/50 pt-2">
                                <span className="text-[10px] text-stone-400 font-mono font-bold">#{idx + 1}</span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCardForm(card);
                                      setEditingCardIndex(idx);
                                      setIsCardFormOpen(true);
                                    }}
                                    className="p-1.5 text-stone-600 hover:text-[#2E5942] bg-white border border-stone-200 rounded-lg cursor-pointer"
                                    title="Edit Card"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (confirm(language === 'bn' ? 'আপনি কি এই শাখা কার্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this card?')) {
                                        const filtered = contactInfoBlock.cards.filter((_: any, i: number) => i !== idx);
                                        try {
                                          await setDoc(doc(db, 'homepage_blocks', 'contact_info'), {
                                            ...contactInfoBlock,
                                            cards: filtered
                                          });
                                          alert(language === 'bn' ? 'কার্ড সফলভাবে মুছে ফেলা হয়েছে!' : 'Card deleted successfully!');
                                        } catch (err) {
                                          console.error("Error deleting card:", err);
                                        }
                                      }
                                    }}
                                    className="p-1.5 text-stone-600 hover:text-red-600 bg-white border border-stone-200 rounded-lg cursor-pointer"
                                    title="Delete Card"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-stone-400 font-sans">
                            {language === 'bn' ? 'এখনো কোনো অতিরিক্ত কার্ড যোগ করা হয়নি।' : 'No custom info/branch cards added yet.'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part C: LIVE PREVIEW OF THE WEBSITE CONTACT PAGE */}
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs text-left">
                      <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-[#B8862A] animate-pulse" />
                          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider font-sans">
                            {language === 'bn' ? 'লাইভ প্রিভিউ (ওয়েবসাইট ভিউ)' : 'Live Preview (Website View)'}
                          </h4>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border border-amber-200">
                          {language === 'bn' ? 'সরাসরি ফলাফল' : 'Realtime Sync'}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DDD0] space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Col 1: Main Contact Card Preview */}
                          <div className="bg-[#1A1207] text-[#FAF7F2] rounded-2xl p-5 shadow-md border border-[#B8862A]/20 text-xs">
                            <h3 className="font-serif font-bold text-base text-[#F0CC7A] mb-1.5">
                              {language === 'bn' ? 'অফিসিয়াল যোগাযোগ কেন্দ্র' : 'HQ Contact Center'}
                            </h3>
                            <p className="text-[11px] text-[#FAF7F2]/75 mb-4">
                              {language === 'bn' ? 'কোনো জিজ্ঞাসা বা মতামতের জন্য সরাসরি আমাদের বাংলামোটর সেন্টারে যোগাযোগ করুন অথবা নিচের ফর্মটি পূরণ করুন।' : 'Contact our primary administration team for queries regarding book shops, libraries, and publications.'}
                            </p>
                            
                            <div className="space-y-3 pt-1 text-left">
                              <div className="flex items-start gap-2 text-[11px]">
                                <span className="text-[#B8862A] font-bold">📍</span>
                                <div>
                                  <h5 className="font-bold text-[#F0CC7A]">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</h5>
                                  <p className="text-[#FAF7F2]/90">
                                    {language === 'bn' 
                                      ? (contactInfoBlock?.address_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।')
                                      : (contactInfoBlock?.address_en || 'Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.')
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2 text-[11px]">
                                <span className="text-[#B8862A] font-bold">📞</span>
                                <div>
                                  <h5 className="font-bold text-[#F0CC7A]">{language === 'bn' ? 'টেলিফোন ও ফোন নম্বর:' : 'Telephone Numbers:'}</h5>
                                  <p className="text-[#FAF7F2]/90">{contactInfoBlock?.phones || '+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১'}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2 text-[11px]">
                                <span className="text-[#B8862A] font-bold">✉️</span>
                                <div>
                                  <h5 className="font-bold text-[#F0CC7A]">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</h5>
                                  <p className="text-[#FAF7F2]/90">{contactInfoBlock?.emails || 'bskbd@live.com, info@bskbd.org'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-[#B8862A]/20 mt-4 pt-3 flex items-center space-x-2 text-[10px] text-[#F0CC7A]">
                              <span className="w-1.5 h-1.5 bg-[#B8862A] rounded-full animate-ping" />
                              <span>
                                {language === 'bn' 
                                  ? (contactInfoBlock?.hours_bn || 'খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)') 
                                  : (contactInfoBlock?.hours_en || 'Hours: 9:00 AM - 5:00 PM (Closed Fridays)')
                                }
                              </span>
                            </div>
                          </div>

                          {/* Col 2: Electronic Form Preview Placeholder */}
                          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 text-xs text-stone-800 text-left">
                            <h3 className="font-serif font-bold text-sm text-[#1A1207] mb-2">
                              {language === 'bn' ? 'ইলেকট্রনিক বার্তা ও বুকিং ফর্ম' : 'Electronic Feedback & Inquiry Form'}
                            </h3>
                            <p className="text-[10px] text-stone-500 mb-3">
                              {language === 'bn' ? 'ওয়েবসাইট ভিজিটররা এই ফর্ম ব্যবহার করে সরাসরি বার্তা পাঠান।' : 'Visitors can use this form to contact you in real-time.'}
                            </p>
                            <div className="space-y-2 pointer-events-none opacity-60">
                              <div className="h-6 bg-stone-100 rounded border border-stone-200 flex items-center px-2 text-[10px] text-stone-400">
                                {language === 'bn' ? 'সাধারণ যোগাযোগ ও তথ্য (General Inquiry)' : 'General Inquiry & Info'}
                              </div>
                              <div className="h-6 bg-stone-100 rounded border border-stone-200 flex items-center px-2 text-[10px] text-stone-400">
                                {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                              </div>
                              <div className="h-6 bg-stone-100 rounded border border-stone-200 flex items-center px-2 text-[10px] text-stone-400">
                                {language === 'bn' ? 'আপনার ইমেইল' : 'Email Address'}
                              </div>
                              <div className="h-10 bg-stone-100 rounded border border-stone-200 flex items-start p-2 text-[10px] text-stone-400">
                                {language === 'bn' ? 'বার্তার বিষয়বস্তু...' : 'Type your message...'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2 inside Preview: Custom Cards Preview */}
                        {contactInfoBlock?.cards && Array.isArray(contactInfoBlock.cards) && contactInfoBlock.cards.length > 0 && (
                          <div className="pt-4 border-t border-[#B8862A]/20 text-left space-y-3">
                            <h5 className="font-serif font-extrabold text-xs text-stone-800 flex items-center space-x-1.5">
                              <span className="w-1.5 h-3.5 bg-[#B8862A] inline-block" />
                              <span>
                                {language === 'bn' ? 'আমাদের অন্যান্য শাখা ও তথ্য কেন্দ্র' : 'Our Branches & Information Centers'}
                              </span>
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {(contactInfoBlock?.cards || []).map((card: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden flex flex-col group text-xs text-stone-800"
                                >
                                  {card.imgUrl ? (
                                    <div className="h-24 w-full overflow-hidden relative bg-stone-100">
                                      <img 
                                        src={card.imgUrl} 
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-24 w-full bg-[#FAF7F2] border-b border-[#E8DDD0] flex items-center justify-center text-xl text-[#B8862A]">
                                      {card.icon || '📍'}
                                    </div>
                                  )}
                                  
                                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                                    <h6 className="font-serif font-bold text-stone-900 text-[11px] line-clamp-1">
                                      {language === 'bn' ? card.title_bn : card.title_en}
                                    </h6>
                                    <p className="text-[10px] text-stone-500 leading-normal line-clamp-3">
                                      {language === 'bn' ? card.desc_bn : card.desc_en}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part D: Inquiries / Submissions Inbox */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-stone-900 font-serif flex items-center gap-2">
                            <span>📩</span>
                            <span>{language === 'bn' ? 'আগত বার্তা, সদস্যপদ ও স্টল আবেদন ইনবক্স' : 'Inquiries, Memberships & Stall Applications Inbox'}</span>
                          </h4>
                          <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                            {language === 'bn' ? 'বইমেলা স্টল আবেদন, ভ্রাম্যমাণ লাইব্রেরি সদস্যপদ ও সাধারণ যোগাযোগের সকল মেসেজ এখানে জমা হয়।' : 'All stall bookings, member requests, and general messages are stored here.'}
                          </p>
                        </div>
                        <span className="bg-[#2E5942]/10 text-[#2E5942] text-xs px-3 py-1 rounded-full font-mono font-bold self-start sm:self-auto">
                          {inquiries.length} {language === 'bn' ? 'টি মোট বার্তা' : 'Total Messages'}
                        </span>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          { id: 'all', label_bn: `সব বার্তা (${inquiries.length})`, label_en: `All (${inquiries.length})` },
                          { id: 'book_fair', label_bn: `🎪 বইমেলা স্টল আবেদন (${(inquiries || []).filter(i => i.type === 'book_fair_inquiry' || i.type === 'stall').length})`, label_en: '🎪 Book Fair Stall' },
                          { id: 'mobile_library', label_bn: `🚐 ভ্রাম্যমাণ লাইব্রেরি সদস্যপদ (${(inquiries || []).filter(i => i.type === 'mobile_library_membership' || i.type === 'mobile_library_inquiry').length})`, label_en: '🚐 Mobile Library' },
                          { id: 'alor', label_bn: `🎓 আলোর ইশকুল (${(inquiries || []).filter(i => i.type === 'alor_inquiry').length})`, label_en: '🎓 Aalor Ishkool' },
                          { id: 'contact', label_bn: `✉️ সাধারণ যোগাযোগ (${(inquiries || []).filter(i => i.type === 'contact' || !i.type).length})`, label_en: '✉️ General Contact' }
                        ].map((fTab) => (
                          <button
                            key={fTab.id}
                            type="button"
                            onClick={() => setActiveInboxFilter(fTab.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              activeInboxFilter === fTab.id
                                ? 'bg-[#2E5942] text-white shadow-xs'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {language === 'bn' ? fTab.label_bn : fTab.label_en}
                          </button>
                        ))}
                      </div>

                      {/* Messages List */}
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 pt-2">
                        {(() => {
                          const filtered = (inquiries || []).filter((inq) => {
                            if (activeInboxFilter === 'all') return true;
                            if (activeInboxFilter === 'book_fair') return inq.type === 'book_fair_inquiry' || inq.type === 'stall';
                            if (activeInboxFilter === 'mobile_library') return inq.type === 'mobile_library_membership' || inq.type === 'mobile_library_inquiry';
                            if (activeInboxFilter === 'alor') return inq.type === 'alor_inquiry';
                            if (activeInboxFilter === 'contact') return inq.type === 'contact' || !inq.type;
                            return true;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="p-12 text-center text-stone-400 text-xs font-sans bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো বার্তা পাওয়া যায়নি।' : 'No messages found in this category.'}
                              </div>
                            );
                          }

                          return filtered.map((inq) => {
                            const dateStr = inq.createdAt?.seconds 
                              ? new Date(inq.createdAt.seconds * 1000).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')
                              : (language === 'bn' ? 'আজ' : 'Just now');
                            
                            const isBookFair = inq.type === 'book_fair_inquiry' || inq.type === 'stall';
                            const isMobileLib = inq.type === 'mobile_library_membership' || inq.type === 'mobile_library_inquiry';
                            const isAlor = inq.type === 'alor_inquiry';

                            return (
                              <div key={inq.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 font-sans text-xs hover:border-[#B8862A] transition">
                                <div className="space-y-2 text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-stone-900 text-sm">{inq.name}</span>
                                    {inq.phone && (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                                        📞 {inq.phone}
                                      </span>
                                    )}
                                    {inq.email && (
                                      <span className="text-stone-500 font-mono">({inq.email})</span>
                                    )}
                                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase ${
                                      isBookFair ? 'bg-amber-100 text-amber-900 border-amber-300' :
                                      isMobileLib ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                      isAlor ? 'bg-purple-100 text-purple-900 border-purple-300' :
                                      'bg-stone-200 text-stone-800 border-stone-300'
                                    }`}>
                                      {isBookFair ? (language === 'bn' ? '🎪 বইমেলা স্টল আবেদন' : 'Book Fair Stall') :
                                       isMobileLib ? (language === 'bn' ? '🚐 ভ্রাম্যমাণ সদস্যপদ' : 'Mobile Library') :
                                       isAlor ? (language === 'bn' ? '🎓 আলোর ইশকুল' : 'Aalor Ishkool') :
                                       (language === 'bn' ? '✉️ সাধারণ যোগাযোগ' : 'General Contact')}
                                    </span>
                                    <span className="text-stone-400 font-mono text-[10px]">📅 {dateStr}</span>
                                  </div>

                                  {inq.institution && (
                                    <div className="text-[11px] text-stone-600 font-medium">
                                      🏛️ <span className="font-bold text-stone-700">{language === 'bn' ? 'প্রতিষ্ঠান / ঠিকানা:' : 'Institution / Address:'}</span> {inq.institution}
                                    </div>
                                  )}

                                  {inq.message && (
                                    <div className="text-stone-800 leading-relaxed bg-white p-3 border border-stone-200 rounded-xl whitespace-pre-wrap font-sans text-left">
                                      <span className="font-bold text-stone-500 block text-[10px] uppercase mb-1">{language === 'bn' ? 'বার্তার বিবরণ:' : 'Message Content:'}</span>
                                      {inq.message}
                                    </div>
                                  )}
                                </div>
                                <div className="shrink-0 pt-1">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই বার্তাটি ডিলিট করতে চান?' : 'Are you sure you want to delete this message?')) {
                                        try {
                                          await deleteDoc(doc(db, 'inquiries', inq.id));
                                        } catch (err) {
                                          console.error("Error deleting inquiry:", err);
                                        }
                                      }
                                    }}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                                    title="Delete Submission"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: CENTRALIZED DOWNLOADS MANAGER */}
                {activeTab === 'downloads_cms' && (
                  <div className="space-y-6 animate-fade-in font-sans">
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/20 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#B8862A]" />
                          <span>{language === 'bn' ? 'ফরম ও ডকুমেন্ট ডাউনলোড ম্যানেজার' : 'Downloadable Documents & Forms Manager'}</span>
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          {language === 'bn' 
                            ? 'ওয়েবসাইটের দেশভিত্তিক উৎকর্ষ, পাঠাভ্যাস, বইমেলা ও সাধারণ পেজের সকল ডাউনলোড ফাইল বা PDF সহজে যুক্ত ও এডিট করুন।' 
                            : 'Manage all downloadable PDF application forms, guidelines, and documents across the site.'}
                        </p>
                      </div>
                    </div>

                    {/* Information cards showing where each download form belongs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'nationwide-excellence', title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম', desc_bn: 'গাইডবুক, নিয়মাবলী ও শিক্ষা প্রতিষ্ঠান সদস্যভুক্তি ফরম' },
                        { id: 'reading-habit', title_bn: 'পাঠাভ্যাস উন্নয়ন কর্মসূচি', desc_bn: 'কর্মসূচি নির্দেশিকা, সিলেবাস ও অংশগ্রহণ ফরম' },
                        { id: 'book-fair', title_bn: 'ভ্রাম্যমাণ বইমেলা', desc_bn: 'বইমেলা সহায়িকা ও স্টল আবেদন নির্দেশিকা' }
                      ].map((sec) => (
                        <div key={sec.id} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 shadow-xs hover:border-[#2E5942] transition">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-stone-100 rounded-lg text-[#2E5942]"><FileText className="h-4 w-4" /></span>
                            <h4 className="font-bold text-stone-900 text-xs font-serif">{sec.title_bn}</h4>
                          </div>
                          <p className="text-[11px] text-stone-500">{sec.desc_bn}</p>
                          <button
                            type="button"
                            onClick={() => {
                              const match = pages.find(p => p.id === sec.id);
                              if (match) {
                                setEditingPage(JSON.parse(JSON.stringify(match)));
                              } else {
                                const defPage = (websiteContentRaw as any[]).find(p => p.id === sec.id) || { id: sec.id, title_bn: sec.title_bn };
                                setEditingPage(JSON.parse(JSON.stringify(defPage)));
                              }
                              setActiveTab('programs_cms');
                            }}
                            className="w-full mt-2 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition text-center cursor-pointer shadow-xs"
                          >
                            {language === 'bn' ? 'ফাইল ও ফরম এডিট করুন →' : 'Edit Forms & Files →'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'recruitment' && (
                  <div className="space-y-6 animate-fade-in text-stone-800">
                    {/* Header */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-[#B8862A]" />
                            <span>{language === 'bn' ? '১১. নিয়োগ বিজ্ঞপ্তি ও ক্যারিয়ার সুযোগ নিয়ন্ত্রণ' : '11. Recruitment & Careers CMS'}</span>
                          </h3>
                          <p className="text-xs text-stone-500 font-sans mt-1">
                            {language === 'bn' 
                              ? 'বিশ্বসাহিত্য কেন্দ্রের নিয়োগ বিজ্ঞপ্তি সমূহ পরিচালনা করুন এবং প্রার্থীদের আবেদনপত্র সমূহের ইনবক্স নিয়ন্ত্রণ করুন।' 
                              : 'Manage job circulars, descriptions, positions, deadlines, and view candidate resume applications.'}
                          </p>
                        </div>
                      </div>

                      {/* Sub-tabs bar */}
                      <div className="flex border-b border-stone-100 mt-6 select-none font-sans text-xs">
                        <button
                          type="button"
                          onClick={() => { setActiveRecruitmentSubTab('circulars'); setEditingCircular(null); }}
                          className={`px-4 py-2.5 font-bold border-b-2 transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                            activeRecruitmentSubTab === 'circulars'
                              ? 'border-[#B8862A] text-[#B8862A]'
                              : 'border-transparent text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>{language === 'bn' ? 'নিয়োগ সার্কুলারসমূহ' : 'Job Circulars'}</span>
                          <span className="bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 font-mono">
                            {circularsList.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveRecruitmentSubTab('applications'); setEditingCircular(null); }}
                          className={`px-4 py-2.5 font-bold border-b-2 transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                            activeRecruitmentSubTab === 'applications'
                              ? 'border-[#B8862A] text-[#B8862A]'
                              : 'border-transparent text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>{language === 'bn' ? 'আবেদনকারীদের ইনবক্স' : 'Applicants Inbox'}</span>
                          <span className="bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 font-mono">
                            {applicationsList.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveRecruitmentSubTab('intro'); setEditingCircular(null); }}
                          className={`px-4 py-2.5 font-bold border-b-2 transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                            activeRecruitmentSubTab === 'intro'
                              ? 'border-[#B8862A] text-[#B8862A]'
                              : 'border-transparent text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>{language === 'bn' ? 'পেজ কন্টেন্ট ও বিবরণী' : 'Page Intro Text'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtab content 1: Circulars Manager */}
                    {activeRecruitmentSubTab === 'circulars' && (
                      <div className="space-y-6">
                        {editingCircular ? (
                          /* Circular Editing Form */
                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-fade-in">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                              <h4 className="font-serif font-bold text-sm text-[#1A1207] flex items-center gap-1.5">
                                <Plus className="h-4 w-4 text-[#B8862A]" />
                                <span>
                                  {editingCircular.id 
                                    ? (language === 'bn' ? 'নিয়োগ সার্কুলার সম্পাদনা করুন' : 'Edit Job Circular')
                                    : (language === 'bn' ? 'নতুন সার্কুলার তৈরি করুন' : 'Create New Circular')}
                                </span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => setEditingCircular(null)}
                                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {language === 'bn' ? 'ফিরে যান' : 'Back to List'}
                              </button>
                            </div>

                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              if (!editingCircular.title_bn?.trim() || !editingCircular.title_en?.trim() || !editingCircular.position_bn?.trim() || !editingCircular.position_en?.trim()) {
                                setActionStatus(language === 'bn' ? 'দয়া করে শিরোনাম এবং পদের নাম নিশ্চিত করুন।' : 'Please specify title and position fields.');
                                setTimeout(() => setActionStatus(''), 3000);
                                return;
                              }
                              try {
                                setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...');
                                let docId = editingCircular.id;
                                if (!docId) {
                                  docId = 'circ_' + Date.now();
                                }
                                const payload = {
                                  id: docId,
                                  title_bn: editingCircular.title_bn?.trim() || '',
                                  title_en: editingCircular.title_en?.trim() || '',
                                  position_bn: editingCircular.position_bn?.trim() || '',
                                  position_en: editingCircular.position_en?.trim() || '',
                                  dept_bn: editingCircular.dept_bn?.trim() || '',
                                  dept_en: editingCircular.dept_en?.trim() || '',
                                  deadline_bn: editingCircular.deadline_bn?.trim() || '',
                                  deadline_en: editingCircular.deadline_en?.trim() || '',
                                  desc_bn: editingCircular.desc_bn?.trim() || '',
                                  desc_en: editingCircular.desc_en?.trim() || '',
                                  status: editingCircular.status || 'active',
                                  fileUrl: editingCircular.fileUrl || '',
                                  fileType: editingCircular.fileType || '',
                                  fileName: editingCircular.fileName || '',
                                  applyUrl: editingCircular.applyUrl || '',
                                  applyFileUrl: editingCircular.applyFileUrl || '',
                                  applyFileName: editingCircular.applyFileName || ''
                                };
                                await setDoc(doc(db, 'recruitment_circulars', docId), payload);
                                setActionStatus(language === 'bn' ? 'বিজ্ঞপ্তিটি সফলভাবে সংরক্ষিত হয়েছে!' : 'Circular saved successfully!');
                                setTimeout(() => setActionStatus(''), 2000);
                                setEditingCircular(null);
                              } catch (err) {
                                console.error("Error saving recruitment circular:", err);
                                setActionStatus(language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save job circular.');
                                setTimeout(() => setActionStatus(''), 3000);
                              }
                            }} className="space-y-4 text-xs font-sans text-left">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'সার্কুলার শিরোনাম (বাংলা):' : 'Circular Title (Bangla):'}</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: বিশ্বসাহিত্য কেন্দ্রে নিয়োগ বিজ্ঞপ্তি"
                                    value={editingCircular.title_bn || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, title_bn: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 bg-[#FAF7F2]/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] rounded-xl text-[#1A1207]"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'সার্কুলার শিরোনাম (ইংরেজি):' : 'Circular Title (English):'}</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. BSK Recruitment Notice"
                                    value={editingCircular.title_en || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, title_en: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 bg-[#FAF7F2]/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] rounded-xl text-[#1A1207]"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'পদের নাম (বাংলা):' : 'Position Name (Bangla):'}</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: লাইব্রেরি অ্যাসিস্ট্যান্ট"
                                    value={editingCircular.position_bn || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, position_bn: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 bg-[#FAF7F2]/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] rounded-xl text-[#1A1207]"
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'পদের নাম (ইংরেজি):' : 'Position Name (English):'}</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Library Assistant"
                                    value={editingCircular.position_en || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, position_en: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 bg-[#FAF7F2]/50 focus:bg-white focus:ring-1 focus:ring-[#B8862A] rounded-xl text-[#1A1207]"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ডিপার্টমেন্ট / বিভাগ (বাংলা):' : 'Department / Sector (Bangla):'}</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: ভ্রাম্যমাণ লাইব্রেরি প্রকল্প"
                                    value={editingCircular.dept_bn || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, dept_bn: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ডিপার্টমেন্ট / বিভাগ (ইংরেজি):' : 'Department / Sector (English):'}</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Mobile Library Program"
                                    value={editingCircular.dept_en || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, dept_en: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100/50">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-[#2E5942] flex items-center gap-1">
                                    <span>📅</span>
                                    <span>{language === 'bn' ? 'ক্যালেন্ডার শেষ তারিখ:' : 'Set Deadline via Calendar:'}</span>
                                  </label>
                                  <input
                                    type="date"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val) {
                                        const bnDate = formatToBanglaDate(val);
                                        const enDate = formatToEnglishDate(val);
                                        setEditingCircular({
                                          ...editingCircular,
                                          deadline_bn: bnDate,
                                          deadline_en: enDate
                                        });
                                      }
                                    }}
                                    className="w-full p-2 border border-stone-200 rounded-xl bg-white text-xs font-semibold cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'শেষ তারিখ (বাংলা):' : 'Deadline (Bangla):'}</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: ৩০ জুন ২০২৬ খ্রিষ্টাব্দ"
                                    value={editingCircular.deadline_bn || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, deadline_bn: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'শেষ তারিখ (ইংরেজি):' : 'Deadline (English):'}</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 30 June 2026"
                                    value={editingCircular.deadline_en || ''}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, deadline_en: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-stone-700">{language === 'bn' ? 'ক্যারিয়ার স্ট্যাটাস:' : 'Recruitment Status:'}</label>
                                  <select
                                    value={editingCircular.status || 'active'}
                                    onChange={(e) => setEditingCircular({ ...editingCircular, status: e.target.value })}
                                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white font-bold"
                                  >
                                    <option value="active">{language === 'bn' ? 'চলমান (Active)' : 'Active Circular'}</option>
                                    <option value="expired">{language === 'bn' ? 'মেয়াদোত্তীর্ণ (Expired)' : 'Expired / Closed'}</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">{language === 'bn' ? 'বিস্তারিত বিবরণ, যোগ্যতা ও নির্দেশনাবলী (বাংলা):' : 'Detailed Description & Qualifications (Bangla):'}</label>
                                <textarea
                                  rows={5}
                                  placeholder="পদের বিস্তারিত যোগ্যতা, বয়সসীমা, বেতন ও আবেদনের নির্দেশনাবলী এখানে উল্লেখ করুন।"
                                  value={editingCircular.desc_bn || ''}
                                  onChange={(e) => setEditingCircular({ ...editingCircular, desc_bn: e.target.value })}
                                  className="w-full p-3 border border-stone-200 rounded-xl bg-white font-sans text-xs"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">{language === 'bn' ? 'বিস্তারিত বিবরণ, যোগ্যতা ও নির্দেশনাবলী (ইংরেজি):' : 'Detailed Description & Qualifications (English):'}</label>
                                <textarea
                                  rows={5}
                                  placeholder="Enter detailed job descriptions, responsibilities, salary range, qualifications and instructions."
                                  value={editingCircular.desc_en || ''}
                                  onChange={(e) => setEditingCircular({ ...editingCircular, desc_en: e.target.value })}
                                  className="w-full p-3 border border-stone-200 rounded-xl bg-white font-sans text-xs"
                                />
                              </div>

                              {/* Attachment Controls */}
                              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2 text-left">
                                  <label className="font-bold text-stone-700 block">
                                    {language === 'bn' ? 'বিজ্ঞপ্তির সংযুক্ত ফাইল আপলোড' : 'Upload Attached PDF/Circular Image'}
                                  </label>
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-3 flex flex-col items-center justify-center bg-white hover:bg-stone-50 hover:border-[#B8862A] transition text-center min-h-[90px]">
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 950 * 1024) {
                                              alert(language === 'bn' ? 'ফাইল সাইজ ৯৫০ কেবির কম হতে হবে।' : 'File size must be under 950 KB.');
                                              return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              setEditingCircular({
                                                ...editingCircular,
                                                fileUrl: reader.result as string,
                                                fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
                                                fileName: file.name
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                      <Upload className="h-4 w-4 text-stone-400 mb-1" />
                                      <span className="text-[9px] text-stone-500 font-sans">
                                        {language === 'bn' ? 'পিডিএফ বা ইমেজ ফাইল (সর্বোচ্চ ৯৫০ KB)' : 'PDF or Image File (Max 950 KB)'}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => openImageResizer('any', (resizedUrl) => {
                                        setEditingCircular({
                                          ...editingCircular,
                                          fileUrl: resizedUrl,
                                          fileType: 'image',
                                          fileName: 'job_circular_image.jpg'
                                        });
                                      })}
                                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#B8862A] hover:bg-[#9A6D1E] text-white rounded-lg text-[9px] font-bold shadow-xs transition"
                                    >
                                      <Upload className="h-3 w-3" />
                                      <span>{language === 'bn' ? 'ছবি আপলোড ও রিসাইজ করুন' : 'Upload & Resize Image'}</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-3 flex flex-col justify-between text-left">
                                  <div className="space-y-1.5">
                                    <label className="font-bold text-stone-700 block">
                                      {language === 'bn' ? 'অথবা সরাসরি ওয়েব লিংক দিন' : 'Or enter direct web URL link'}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="https://example.com/circular.pdf"
                                      value={editingCircular.fileUrl || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        let type = '';
                                        if (val.toLowerCase().endsWith('.pdf') || val.includes('pdf')) {
                                          type = 'pdf';
                                        } else if (val.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) || val.includes('image')) {
                                          type = 'image';
                                        }
                                        setEditingCircular({
                                          ...editingCircular,
                                          fileUrl: val,
                                          fileType: type || 'pdf',
                                          fileName: val.substring(val.lastIndexOf('/') + 1) || 'circular_attachment'
                                        });
                                      }}
                                      className="w-full p-2 border border-stone-200 rounded-lg bg-white font-mono text-[10px]"
                                    />
                                  </div>

                                  {editingCircular.fileUrl ? (
                                    <div className="p-2 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-between gap-2">
                                      <div className="min-w-0 flex-1 flex items-center gap-1.5 text-left">
                                        <span className="text-sm">{editingCircular.fileType === 'image' ? '📸' : '📄'}</span>
                                        <div className="min-w-0">
                                          <p className="text-[10px] font-bold text-stone-700 truncate">{editingCircular.fileName || 'Attached File'}</p>
                                          <p className="text-[8px] font-mono text-stone-500 truncate uppercase">
                                            {editingCircular.fileType || 'file'} • {editingCircular.fileUrl.startsWith('data:') ? 'base64 data' : 'web path'}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCircular({ ...editingCircular, fileUrl: '', fileType: '', fileName: '' })}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-stone-200 transition shrink-0"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-stone-400 italic text-center mt-auto pb-2">
                                      {language === 'bn' ? 'কোনো ফাইল সংযুক্ত করা হয়নি।' : 'No attached files currently.'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Application Process Controls */}
                              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4 mt-2">
                                <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1">
                                  <span>⚙️</span>
                                  <span>{language === 'bn' ? 'আবেদন প্রক্রিয়া নিয়ন্ত্রণ (ঐচ্ছিক)' : 'Application Process Controls (Optional)'}</span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Custom Application URL Link */}
                                  <div className="space-y-1.5 text-left">
                                    <label className="font-bold text-stone-700 block">
                                      {language === 'bn' ? 'সরাসরি আবেদনের অনলাইন লিংক (যেমন: গুগল ফর্ম বা বাহ্যিক লিংক):' : 'Direct Apply Online Link (e.g. Google Form or external portal URL):'}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="https://forms.gle/..."
                                      value={editingCircular.applyUrl || ''}
                                      onChange={(e) => setEditingCircular({ ...editingCircular, applyUrl: e.target.value })}
                                      className="w-full p-2.5 border border-stone-200 rounded-xl bg-white font-mono text-xs"
                                    />
                                    <p className="text-[9px] text-stone-500">
                                      {language === 'bn' 
                                        ? 'এটি দিলে প্রার্থীরা "আবেদন করুন" বাটনে ক্লিক করলে সরাসরি এই লিংকে চলে যাবে।' 
                                        : 'If specified, clicking "Apply Now" will redirect candidates directly to this link.'}
                                    </p>
                                  </div>

                                  {/* Attached Application Form File (Blank Form to Download) */}
                                  <div className="space-y-1.5 text-left">
                                    <label className="font-bold text-stone-700 block">
                                      {language === 'bn' ? 'অফলাইন আবেদন ফরম সংযুক্ত ফাইল (ডাউনলোড করার জন্য):' : 'Offline Blank Application Form File (for candidate download):'}
                                    </label>
                                    <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-3 flex flex-col items-center justify-center bg-white hover:bg-stone-50 hover:border-[#2E5942] transition text-center min-h-[70px]">
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 950 * 1024) {
                                              setActionStatus(language === 'bn' ? 'আবেদন ফরমের সাইজ ৯৫০ কেবির কম হতে হবে।' : 'File size must be under 950 KB.');
                                              setTimeout(() => setActionStatus(''), 3000);
                                              return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              setEditingCircular({
                                                ...editingCircular,
                                                applyFileUrl: reader.result as string,
                                                applyFileName: file.name
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                      <Upload className="h-4 w-4 text-stone-400 mb-1" />
                                      <span className="text-[9px] text-stone-500 font-sans">
                                        {editingCircular.applyFileName || (language === 'bn' ? 'আবেদন ফরম (PDF বা ইমেজ আপলোড করুন)' : 'Upload blank apply form (PDF or Image)')}
                                      </span>
                                    </div>
                                    {editingCircular.applyFileUrl && (
                                      <div className="flex justify-between items-center bg-stone-100 p-1.5 rounded-lg border text-[10px]">
                                        <span className="truncate font-bold max-w-[200px]">{editingCircular.applyFileName || 'Apply Form'}</span>
                                        <button
                                          type="button"
                                          onClick={() => setEditingCircular({ ...editingCircular, applyFileUrl: '', applyFileName: '' })}
                                          className="text-red-500 hover:text-red-700 font-bold px-1"
                                        >
                                          {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Submit Buttons */}
                              <div className="flex gap-2.5 pt-4 justify-end border-t border-stone-100 mt-5 select-none">
                                <button
                                  type="button"
                                  onClick={() => setEditingCircular(null)}
                                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                                >
                                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                                <button
                                  type="submit"
                                  className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
                                >
                                  <Save className="h-4 w-4" />
                                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Circular'}</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          /* Circular List View */
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider font-sans">
                                {language === 'bn' ? 'চলমান নিয়োগ বিজ্ঞপ্তি তালিকা' : 'Active Recruitment Board'}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setEditingCircular({
                                  title_bn: '',
                                  title_en: '',
                                  position_bn: '',
                                  position_en: '',
                                  dept_bn: '',
                                  dept_en: '',
                                  deadline_bn: '',
                                  deadline_en: '',
                                  desc_bn: '',
                                  desc_en: '',
                                  status: 'active',
                                  fileUrl: '',
                                  fileType: '',
                                  fileName: '',
                                  applyUrl: '',
                                  applyFileUrl: '',
                                  applyFileName: ''
                                })}
                                className="px-4 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer hover:scale-102"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>{language === 'bn' ? 'নতুন নিয়োগ সার্কুলার যোগ করুন' : 'Add New Circular'}</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              {circularsList.length === 0 ? (
                                <div className="p-12 text-center bg-white border rounded-2xl text-stone-400 text-xs font-sans">
                                  {language === 'bn' ? 'কোনো নিয়োগ সার্কুলার পাওয়া যায়নি। নতুন সার্কুলার যোগ করতে উপরের বাটনে ক্লিক করুন।' : 'No job circulars found. Click the button above to add one.'}
                                </div>
                              ) : (
                                circularsList.map((circ) => (
                                  <div key={circ.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="text-left space-y-2 flex-1 min-w-0 font-sans">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                                          circ.status === 'expired' 
                                            ? 'bg-stone-100 text-stone-500 border border-stone-200' 
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}>
                                          {circ.status === 'expired' 
                                            ? (language === 'bn' ? 'মেয়াদ শেষ' : 'Expired') 
                                            : (language === 'bn' ? 'চলমান' : 'Active')}
                                        </span>
                                        {circ.dept_bn && (
                                          <span className="bg-stone-50 border text-stone-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                            💼 {language === 'bn' ? circ.dept_bn : circ.dept_en}
                                          </span>
                                        )}
                                        {circ.fileUrl && (
                                          <span className="bg-amber-50 text-[#B8862A] border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5">
                                            <Paperclip className="h-2.5 w-2.5" />
                                            <span>{language === 'bn' ? 'সংযুক্তি' : 'Attachment'}</span>
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="font-serif font-bold text-[#1A1207] text-md leading-snug">
                                        {language === 'bn' ? circ.position_bn : circ.position_en}
                                      </h5>
                                      <p className="text-xs text-stone-500 font-sans leading-normal">
                                        <span className="font-bold text-stone-700">{language === 'bn' ? 'শিরোনাম: ' : 'Title: '}</span>
                                        {language === 'bn' ? circ.title_bn : circ.title_en}
                                      </p>
                                      {circ.deadline_bn && (
                                        <p className="text-xs text-stone-500 font-sans leading-normal">
                                          <span className="font-bold text-red-700">📅 {language === 'bn' ? 'আবেদনের শেষ তারিখ: ' : 'Deadline: '}</span>
                                          {language === 'bn' ? circ.deadline_bn : circ.deadline_en}
                                        </p>
                                      )}
                                      {circ.desc_bn && (
                                        <p className="text-[11px] text-stone-600 font-sans line-clamp-2 leading-relaxed bg-stone-50 p-2 border border-stone-100 rounded-lg">
                                          {language === 'bn' ? circ.desc_bn : circ.desc_en}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center select-none">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCircular(circ)}
                                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                        title="Edit Circular"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          requireConfirmation(
                                            'আপনি কি নিশ্চিতভাবে এই সার্কুলারটি ডিলিট করতে চান?',
                                            'Are you sure you want to delete this job circular?',
                                            async () => {
                                              try {
                                                await deleteDoc(doc(db, 'recruitment_circulars', circ.id));
                                                setActionStatus(language === 'bn' ? 'সার্কুলারটি সফলভাবে মুছে ফেলা হয়েছে!' : 'Circular deleted successfully!');
                                                setTimeout(() => setActionStatus(''), 2000);
                                              } catch (err) {
                                                console.error("Error deleting circular:", err);
                                                setActionStatus(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Error deleting circular.');
                                                setTimeout(() => setActionStatus(''), 3000);
                                              }
                                            }
                                          );
                                        }}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                        title="Delete Circular"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subtab content 2: Applications Inbox */}
                    {activeRecruitmentSubTab === 'applications' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider font-sans">
                            {language === 'bn' ? 'আবেদনকারী প্রার্থীদের তালিকা' : 'Job Applicants Inbox'}
                          </h4>
                          <span className="bg-stone-100 text-stone-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono">
                            {applicationsList.length} {language === 'bn' ? 'টি আবেদনপত্র' : 'submissions'}
                          </span>
                        </div>

                        <div className="space-y-4">
                          {applicationsList.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-stone-400 text-xs font-sans">
                              {language === 'bn' ? 'এখন পর্যন্ত কোনো আবেদন জমা পড়েনি।' : 'No job applications received yet.'}
                            </div>
                          ) : (
                            applicationsList.map((app) => {
                              const dateStr = app.createdAt?.seconds
                                ? new Date(app.createdAt.seconds * 1000).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')
                                : (language === 'bn' ? 'আজ' : 'Just now');

                              return (
                                <div key={app.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start gap-4">
                                  <div className="text-left space-y-3 flex-1 min-w-0 font-sans text-xs">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-stone-900 text-sm md:text-md">{app.name}</span>
                                      <span className="text-stone-400 font-mono">({app.email})</span>
                                      <span className="bg-[#2E5942]/10 text-[#2E5942] border border-[#2E5942]/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                                        🎯 {language === 'bn' ? 'পদের নাম: ' : 'Job: '}{app.jobTitleEn}
                                      </span>
                                      <span className="text-stone-400 font-mono text-[10px]">📅 {dateStr}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                      <div>
                                        <p className="text-stone-500 font-bold">{language === 'bn' ? '📞 ফোন নম্বর:' : '📞 Phone Number:'}</p>
                                        <p className="text-stone-800 font-mono font-bold">{app.phone || 'N/A'}</p>
                                      </div>
                                      {app.resumeUrl && (
                                        <div>
                                          <p className="text-stone-500 font-bold">{language === 'bn' ? '📄 জীবনবৃত্তান্ত (CV / Resume):' : '📄 CV / Resume Link:'}</p>
                                          <a
                                            href={app.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5 mt-0.5 underline hover:scale-102 transition-transform duration-100 origin-left"
                                          >
                                            <span>{language === 'bn' ? 'সিভি ফাইল ডাউনলোড করুন' : 'View / Download CV Resume'}</span>
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                          </a>
                                        </div>
                                      )}
                                    </div>

                                    {app.coverLetter && (
                                      <div className="space-y-1">
                                        <p className="text-stone-500 font-bold">{language === 'bn' ? '📝 কভার লেটার / আবেদনপত্র:' : '📝 Cover Letter / Remarks:'}</p>
                                        <p className="text-stone-700 leading-relaxed bg-[#FAF7F2] p-4 border border-stone-100 rounded-xl whitespace-pre-wrap">
                                          {app.coverLetter}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 pt-1 self-end md:self-start">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই প্রার্থীর আবেদনপত্রটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this applicant submission?')) {
                                          try {
                                            await deleteDoc(doc(db, 'job_applications', app.id));
                                            alert(language === 'bn' ? 'আবেদনটি মুছে ফেলা হয়েছে!' : 'Application deleted successfully!');
                                          } catch (err) {
                                            console.error("Error deleting application:", err);
                                          }
                                        }
                                      }}
                                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                                      title="Delete Application"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                    {activeRecruitmentSubTab === 'intro' && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                        <div className="flex justify-between items-center border-b pb-3">
                          <h4 className="font-bold text-[#1A1207] font-serif text-sm md:text-base">
                            {language === 'bn' ? 'নিয়োগ পেজের মূল পরিচিতি কন্টেন্ট ও নির্দেশনাবলী' : 'Recruitment Page Main Intro Content & Instructions'}
                          </h4>
                          <p className="text-xs text-stone-500 font-sans">
                            {language === 'bn' ? 'পেজে প্রদর্শিত ভূমিকা ও আবেদন প্রক্রিয়া বিবরণী' : 'Introduction text and application guidelines'}
                          </p>
                        </div>

                        {/* Editable form for the recruitment page intro copy */}
                        <div className="space-y-4">
                          {(() => {
                            // Find the website_pages recruitment page config
                            const recruitmentPage = pages.find(p => p.id === 'recruitment');
                            if (!recruitmentPage) {
                              return (
                                <div className="text-center py-4 text-xs text-stone-500">
                                  {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading page configuration...'}
                                </div>
                              );
                            }

                            // We will display textareas for editing sections[0].content list
                            const firstSection = recruitmentPage.sections && recruitmentPage.sections[0];
                            if (!firstSection) {
                              return (
                                <div className="text-center py-4 text-xs text-stone-500">
                                  {language === 'bn' ? 'কোনো অনুচ্ছেদ পাওয়া যায়নি।' : 'No content section found.'}
                                </div>
                              );
                            }

                            return (
                              <form 
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  try {
                                    setActionStatus(language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...');
                                    await setDoc(doc(db, 'website_pages', 'recruitment'), recruitmentPage);
                                    setActionStatus(language === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Saved successfully!');
                                    setTimeout(() => setActionStatus(''), 2000);
                                  } catch (err) {
                                    console.error(err);
                                    setActionStatus(language === 'bn' ? 'ব্যর্থ হয়েছে!' : 'Failed to save!');
                                    setTimeout(() => setActionStatus(''), 2000);
                                  }
                                }}
                                className="space-y-4"
                              >
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-[#1A1207] block">
                                    {language === 'bn' ? 'পেজের শিরোনাম (বাংলা)' : 'Page Title (Bengali)'}
                                  </label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] outline-none"
                                    value={recruitmentPage.title_bn || ''}
                                    onChange={(e) => {
                                      const updated = pages.map(p => {
                                        if (p.id === 'recruitment') {
                                          return { ...p, title_bn: e.target.value };
                                        }
                                        return p;
                                      });
                                      setPages(updated);
                                    }}
                                    required
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-[#1A1207] block">
                                    {language === 'bn' ? 'পেজের শিরোনাম (ইংরেজি)' : 'Page Title (English)'}
                                  </label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] outline-none"
                                    value={recruitmentPage.title_en || ''}
                                    onChange={(e) => {
                                      const updated = pages.map(p => {
                                        if (p.id === 'recruitment') {
                                          return { ...p, title_en: e.target.value };
                                        }
                                        return p;
                                      });
                                      setPages(updated);
                                    }}
                                    required
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-[#1A1207] block">
                                    {language === 'bn' ? 'সেকশন শিরোনাম' : 'Section Title'}
                                  </label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] outline-none"
                                    value={firstSection.title || ''}
                                    onChange={(e) => {
                                      const updatedSections = [...recruitmentPage.sections];
                                      updatedSections[0] = { ...updatedSections[0], title: e.target.value };
                                      const updated = pages.map(p => {
                                        if (p.id === 'recruitment') {
                                          return { ...p, sections: updatedSections };
                                        }
                                        return p;
                                      });
                                      setPages(updated);
                                    }}
                                    required
                                  />
                                </div>

                                <div className="space-y-3 pt-2">
                                  <label className="text-xs font-bold text-[#1A1207] block">
                                    {language === 'bn' ? 'অনুচ্ছেদসমূহ (Paragraphs):' : 'Paragraphs:'}
                                  </label>
                                  {(firstSection?.content || []).map((pText: string, pIdx: number) => (
                                    <div key={pIdx} className="space-y-1.5 relative">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-stone-500 font-mono">
                                          {language === 'bn' ? `অনুচ্ছেদ ${pIdx + 1}` : `Paragraph ${pIdx + 1}`}
                                        </span>
                                        {firstSection.content.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedContent = firstSection.content.filter((_: any, idx: number) => idx !== pIdx);
                                              const updatedSections = [...recruitmentPage.sections];
                                              updatedSections[0] = { ...updatedSections[0], content: updatedContent };
                                              const updated = pages.map(p => {
                                                if (p.id === 'recruitment') {
                                                  return { ...p, sections: updatedSections };
                                                }
                                                return p;
                                              });
                                              setPages(updated);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-[10px] font-sans font-bold cursor-pointer"
                                          >
                                            {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                                          </button>
                                        )}
                                      </div>
                                      <textarea
                                        rows={4}
                                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#B8862A] focus:border-[#B8862A] outline-none font-sans"
                                        value={pText}
                                        onChange={(e) => {
                                          const updatedContent = [...firstSection.content];
                                          updatedContent[pIdx] = e.target.value;
                                          const updatedSections = [...recruitmentPage.sections];
                                          updatedSections[0] = { ...updatedSections[0], content: updatedContent };
                                          const updated = pages.map(p => {
                                            if (p.id === 'recruitment') {
                                              return { ...p, sections: updatedSections };
                                            }
                                            return p;
                                          });
                                          setPages(updated);
                                        }}
                                        required
                                      />
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedContent = [...firstSection.content, ""];
                                      const updatedSections = [...recruitmentPage.sections];
                                      updatedSections[0] = { ...updatedSections[0], content: updatedContent };
                                      const updated = pages.map(p => {
                                        if (p.id === 'recruitment') {
                                          return { ...p, sections: updatedSections };
                                        }
                                        return p;
                                      });
                                      setPages(updated);
                                    }}
                                    className="py-1 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-sans font-bold border border-stone-200 transition cursor-pointer"
                                  >
                                    + {language === 'bn' ? 'নতুন অনুচ্ছেদ যোগ করুন' : 'Add New Paragraph'}
                                  </button>
                                </div>

                                <div className="pt-4 flex justify-end">
                                  <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#2E5942] hover:bg-[#234432] text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                  >
                                    <Save className="h-4 w-4" />
                                    <span>{language === 'bn' ? 'তথ্য ও বিবরণী সংরক্ষণ করুন' : 'Save Intro Text'}</span>
                                  </button>
                                </div>
                              </form>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'press_cms' && (
                  <PressCMS 
                    language={language}
                    db={db}
                    openImageResizer={openImageResizer}
                  />
                )}

                {activeTab === 'blog_cms' && (
                  <div className="space-y-6 font-sans text-left">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div>
                        <h3 className="text-lg font-serif font-extrabold text-[#1A1207] flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-[#B8862A]" />
                          <span>{language === 'bn' ? '১৪. ব্লগ নিবন্ধ ও সমালোচক রিভিউ পরিচালনা' : '14. Blog Posts & Reviewer Reviews'}</span>
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {language === 'bn' ? 'অফিসিয়াল সাহিত্য ব্লগ পোস্ট সম্পাদনা এবং পাঠক-সমালোচকদের রিভিউজ সরাসরি নিয়ন্ত্রণ করুন' : 'Manage official blog posts and reader/reviewer book reviews'}
                        </p>
                      </div>

                      {/* Sub-tabs */}
                      <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl shrink-0">
                        <button
                          type="button"
                          onClick={() => { setActiveBlogSubTab('posts'); setEditingBlogPost(null); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeBlogSubTab === 'posts' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {language === 'bn' ? 'ব্লগ নিবন্ধমালা (' + blogPostsList.length + ')' : 'Blog Posts (' + blogPostsList.length + ')'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveBlogSubTab('reviews'); setEditingBlogPost(null); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeBlogSubTab === 'reviews' ? 'bg-[#2E5942] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {language === 'bn' ? 'সমালোচক রিভিউ (' + blogReviewsList.length + ')' : 'Reviews (' + blogReviewsList.length + ')'}
                        </button>
                      </div>
                    </div>

                    {/* Subtab 1: Blog Posts Management */}
                    {activeBlogSubTab === 'posts' && (
                      <div className="space-y-6">
                        {/* Top Add Button */}
                        {!editingBlogPost && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBlogPost({
                                  id: 'blog-' + Date.now(),
                                  title_bn: '',
                                  title_en: '',
                                  author_bn: 'আব্দুল্লাহ আবু সায়ীদ',
                                  author_role_bn: 'বিশ্বসাহিত্য কেন্দ্র',
                                  category_bn: 'সাহিত্য ও চিন্তা',
                                  category_en: 'Literature',
                                  excerpt_bn: '',
                                  excerpt_en: '',
                                  content_bn: '',
                                  image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
                                  read_time_bn: '৫ মিনিট পাঠ',
                                  date_bn: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                                });
                              }}
                              className="px-4 py-2 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                              <span>{language === 'bn' ? 'নতুন ব্লগ নিবন্ধ যোগ করুন' : 'Add New Blog Post'}</span>
                            </button>
                          </div>
                        )}

                        {/* Editor Form */}
                        {editingBlogPost && (
                          <div className="bg-white border border-[#B8862A]/40 rounded-2xl p-6 shadow-md space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                              <h4 className="font-serif font-bold text-base text-[#1A1207]">
                                {editingBlogPost.id ? (language === 'bn' ? 'ব্লগ নিবন্ধ সম্পাদনা' : 'Edit Blog Post') : (language === 'bn' ? 'নতুন নিবন্ধ তৈরি' : 'Create Blog Post')}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setEditingBlogPost(null)}
                                className="text-stone-400 hover:text-stone-700 font-bold text-xs"
                              >
                                ✕ {language === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                            </div>

                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (!editingBlogPost.title_bn || !editingBlogPost.excerpt_bn) return;
                                setIsSavingBlogPost(true);
                                try {
                                  const docRef = doc(collection(db, 'blog_posts'), editingBlogPost.id);
                                  await setDoc(docRef, {
                                    ...editingBlogPost,
                                    updatedAt: serverTimestamp()
                                  });
                                  setEditingBlogPost(null);
                                  alert(language === 'bn' ? 'ব্লগ নিবন্ধ সফলভাবে সংরক্ষিত হয়েছে!' : 'Blog post saved successfully!');
                                } catch (err) {
                                  console.error("Error saving blog post:", err);
                                  alert(language === 'bn' ? 'নিবন্ধ সংরক্ষণে সমস্যা হয়েছে।' : 'Error saving blog post.');
                                } finally {
                                  setIsSavingBlogPost(false);
                                }
                              }}
                              className="space-y-4 text-xs"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="block font-bold text-stone-700">নিবন্ধের শিরোনাম (বাংলা) *</label>
                                  <input
                                    type="text"
                                    required
                                    value={editingBlogPost.title_bn || ''}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title_bn: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-bold text-stone-700">Title (English)</label>
                                  <input
                                    type="text"
                                    value={editingBlogPost.title_en || ''}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title_en: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <label className="block font-bold text-stone-700">লেখকের নাম (বাংলা)</label>
                                  <input
                                    type="text"
                                    value={editingBlogPost.author_bn || ''}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, author_bn: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-bold text-stone-700">লেখকের পদবি/পরিচিতি</label>
                                  <input
                                    type="text"
                                    value={editingBlogPost.author_role_bn || ''}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, author_role_bn: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-bold text-stone-700">ক্যাটাগরি</label>
                                  <select
                                    value={editingBlogPost.category_bn || 'সাহিত্য ও চিন্তা'}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category_bn: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  >
                                    <option value="সাহিত্য ও চিন্তা">সাহিত্য ও চিন্তা</option>
                                    <option value="শিক্ষা ও পাঠাভ্যাস">শিক্ষা ও পাঠাভ্যাস</option>
                                    <option value="সংস্কৃতি ও ইতিহাস">সংস্কৃতি ও ইতিহাস</option>
                                    <option value="বইপড়া আন্দোলন">বইপড়া আন্দোলন</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block font-bold text-stone-700">সংক্ষিপ্ত ভূমিকা / সারসংক্ষেপ (বাংলা) *</label>
                                <textarea
                                  required
                                  rows={2}
                                  value={editingBlogPost.excerpt_bn || ''}
                                  onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt_bn: e.target.value })}
                                  className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block font-bold text-stone-700">বিস্তারিত নিবন্ধের মূল বক্তব্য / অনুচ্ছেদসমূহ</label>
                                <textarea
                                  rows={5}
                                  value={editingBlogPost.content_bn || ''}
                                  onChange={(e) => setEditingBlogPost({ ...editingBlogPost, content_bn: e.target.value })}
                                  placeholder="সম্পূর্ণ আর্টিকেলের তথ্য ও অনুচ্ছেদ লিখুন..."
                                  className="w-full border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                />
                              </div>

                              {/* Image upload preview */}
                              <div className="space-y-1">
                                <label className="block font-bold text-stone-700">ফিচার ইমেজ ইউআরএল বা ছবি আপলোড</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    value={editingBlogPost.image || ''}
                                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, image: e.target.value })}
                                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#B8862A]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openImageResizer('landscape', (base64) => {
                                        setEditingBlogPost({ ...editingBlogPost, image: base64 });
                                      });
                                    }}
                                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl border border-stone-200 transition shrink-0 cursor-pointer"
                                  >
                                    📸 {language === 'bn' ? 'ছবি নির্বাচন' : 'Upload Image'}
                                  </button>
                                </div>
                                {editingBlogPost.image && (
                                  <div className="mt-2 h-24 w-40 rounded-xl overflow-hidden border border-stone-200">
                                    <img src={editingBlogPost.image} alt="Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                                <button
                                  type="button"
                                  onClick={() => setEditingBlogPost(null)}
                                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200"
                                >
                                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSavingBlogPost}
                                  className="px-6 py-2 bg-[#2E5942] text-white font-bold rounded-xl hover:bg-[#203F2F] shadow-sm disabled:opacity-50"
                                >
                                  {isSavingBlogPost ? 'সংরক্ষিত হচ্ছে...' : 'সংরক্ষণ করুন'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* List of existing posts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {blogPostsList.map((post) => (
                            <div key={post.id} className="p-4 bg-white border border-stone-200 rounded-2xl flex items-start justify-between gap-4 shadow-xs hover:border-[#B8862A]">
                              <div className="flex items-start gap-3 min-w-0">
                                <img src={post.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200" />
                                <div className="space-y-1 min-w-0">
                                  <span className="bg-[#FAF7F2] text-[#B8862A] border border-[#E8DDD0] text-[9px] font-bold px-2 py-0.5 rounded-full font-serif">
                                    {post.category_bn || 'সাহিত্য'}
                                  </span>
                                  <h5 className="font-serif font-bold text-sm text-stone-900 truncate">{post.title_bn}</h5>
                                  <p className="text-[11px] text-stone-500 truncate">{post.author_bn} • {post.date_bn}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingBlogPost(post)}
                                  className="p-1.5 text-stone-600 hover:text-[#B8862A] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                  title="সম্পাদনা করুন"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmModal({
                                      message_bn: `আপনি কি "${post.title_bn}" ব্লগ পোস্টটি মুছে ফেলতে চান?`,
                                      message_en: `Are you sure you want to delete this blog post?`,
                                      onConfirm: async () => {
                                        try {
                                          await deleteDoc(doc(db, 'blog_posts', post.id));
                                          alert("ব্লগ পোস্ট সফলভাবে মুছে ফেলা হয়েছে।");
                                        } catch (err) {
                                          console.error("Error deleting blog post:", err);
                                        }
                                      }
                                    });
                                  }}
                                  className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subtab 2: Reviewer Reviews Management */}
                    {activeBlogSubTab === 'reviews' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <h4 className="font-serif font-bold text-stone-900 text-sm">
                              {language === 'bn' ? 'পাঠক ও সমালোচকদের জমাকৃত রিভিউ ইনবক্স' : 'Submitted Reviews Inbox'}
                            </h4>
                            <p className="text-xs text-stone-500">
                              {language === 'bn' ? 'ওয়েবসাইট থেকে ব্যবহারকারী ও লেখকদের জমাকৃত রিভিউসমূহ' : 'Manage reader & reviewer critiques'}
                            </p>
                          </div>
                          <span className="text-xs font-bold bg-[#B8862A]/10 text-[#B8862A] px-3 py-1 rounded-full">
                            মোট {blogReviewsList.length} টি রিভিউ
                          </span>
                        </div>

                        {blogReviewsList.length === 0 ? (
                          <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center text-xs text-stone-500 font-serif">
                            এখনো কোনো রিভিউ জমা হয়নি।
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {blogReviewsList.map((rev) => (
                              <div key={rev.id} className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3 shadow-xs">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                  <div>
                                    <h5 className="font-bold text-stone-900 text-sm">{rev.reviewerName}</h5>
                                    <p className="text-[10px] text-stone-500">{rev.reviewerRole} • 📅 {rev.date}</p>
                                  </div>
                                  <div className="text-amber-500 text-xs font-bold">
                                    {'★'.repeat(Number(rev.rating) || 5)}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] text-[#B8862A] font-bold uppercase block">গ্রন্থ: {rev.bookTitle}</span>
                                  <p className="text-xs text-stone-700 italic bg-[#FAF7F2] p-3 rounded-xl border border-stone-100">
                                    "{rev.content}"
                                  </p>
                                </div>

                                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        const newStatus = rev.status === 'approved' ? 'pending' : 'approved';
                                        await setDoc(doc(db, 'blog_reviews', rev.id), { ...rev, status: newStatus });
                                      } catch (e) {
                                        console.error("Error updating review status:", e);
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                                      rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {rev.status === 'approved' ? '✓ প্রকাশিত (Approved)' : '⏳ স্থগিত (Pending)'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        message_bn: `আপনি কি "${rev.reviewerName}" এর রিভিউটি মুছে ফেলতে চান?`,
                                        message_en: `Delete review from ${rev.reviewerName}?`,
                                        onConfirm: async () => {
                                          try {
                                            await deleteDoc(doc(db, 'blog_reviews', rev.id));
                                          } catch (e) {
                                            console.error("Error deleting review:", e);
                                          }
                                        }
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                                  >
                                    মুছে ফেলুন
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 15: DATABASE MANAGEMENT & MYSQL BACKUP */}
                {activeTab === 'database_cms' && (
                  <div className="space-y-6 font-sans text-left">
                    <DatabaseHealthDashboard language={language} />
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div>
                        <h3 className="text-lg font-serif font-extrabold text-[#1A1207] flex items-center gap-2">
                          <Database className="h-5 w-5 text-[#B8862A]" />
                          <span>{language === 'bn' ? '১৫. ডাটাবেস ব্যবস্থাপনা ও cPanel / MySQL ব্যাকআপ' : '15. Database Management & MySQL Export'}</span>
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {language === 'bn' 
                            ? 'আপনার ওয়েবসাইটের সর্বমোট ২২টি ডাটাবেস টেবিল, cPanel / phpMyAdmin ইম্পোর্ট ডাম্প ও ব্যাকআপ ফাইল নিয়ন্ত্রণ করুন' 
                            : 'Manage 22 full database tables, cPanel/phpMyAdmin dumps & live database state'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={checkDbConnection}
                          disabled={checkingDb}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer border ${
                            checkingDb 
                              ? 'bg-stone-100 text-stone-400 border-stone-200' 
                              : isDbConnected 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                          <span>
                            {checkingDb 
                              ? (language === 'bn' ? 'পরীক্ষা হচ্ছে...' : 'Testing...') 
                              : isDbConnected 
                                ? (language === 'bn' ? 'ডাটাবেস কানেকশন: সচল 🟢' : 'DB Connected 🟢') 
                                : (language === 'bn' ? 'ডাটাবেস কানেকশন: অফলাইন 🔴' : 'DB Offline 🔴')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Card 1: MySQL Dump bskbd_new.sql */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b pb-3 border-stone-100">
                          <div className="p-2.5 bg-[#2E5942]/10 text-[#2E5942] rounded-xl">
                            <Download className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-serif font-extrabold text-stone-900 text-sm md:text-base">
                              {language === 'bn' ? 'phpMyAdmin / MySQL ডাটাবেস ডাম্প (bskbd_new.sql)' : 'phpMyAdmin MySQL Dump (bskbd_new.sql)'}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              {language === 'bn' ? 'cPanel-এর phpMyAdmin-এ সরাসরি ইম্পোর্ট করার জন্য উপযোগী পূর্ণাঙ্গ SQL ফাইল' : 'Ready to import into cPanel phpMyAdmin with 22 structured tables'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DDD0] space-y-2">
                          <span className="text-[10px] font-bold text-[#8C6212] uppercase tracking-wider block">
                            {language === 'bn' ? 'ডাটাবেসে অন্তর্ভুক্ত ২২টি টেবিল:' : 'Included Database Tables (22 Total):'}
                          </span>
                          <p className="text-[11px] font-mono text-stone-700 leading-relaxed bg-white p-2.5 rounded-lg border border-stone-200">
                            bsk_admin_users, bsk_blog_reviews, bsk_documents, bsk_events, bsk_hero_slides, bsk_homepage_blocks, bsk_inquiries, bsk_job_applications, bsk_media_files, bsk_news, bsk_notices, bsk_photo_albums, bsk_press, bsk_programs, bsk_recent_activities, bsk_recruitment_circulars, bsk_settings, bsk_website_pages, hero_slides, inquiries, notices, website_pages
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          <a
                            href="/bskbd_new.sql"
                            download="bskbd_new.sql"
                            className="flex-1 py-2.5 bg-[#2E5942] hover:bg-[#234734] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                          >
                            <Download className="h-4 w-4" />
                            <span>{language === 'bn' ? 'bskbd_new.sql ফাইল ডাউনলোড করুন' : 'Download bskbd_new.sql File'}</span>
                          </a>
                        </div>
                      </div>

                      {/* Card 2: Live Seed & Bootstrap */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b pb-3 border-stone-100">
                          <div className="p-2.5 bg-[#B8862A]/10 text-[#B8862A] rounded-xl">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-serif font-extrabold text-stone-900 text-sm md:text-base">
                              {language === 'bn' ? 'অনলাইন ক্লাউড ডাটাবেস লোডার' : 'Cloud / Firestore Seed & Bootstrap'}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              {language === 'bn' ? 'লাইভ ক্লাউড ডাটাবেসে বিশ্বসাহিত্য কেন্দ্রের প্রমিত সকল কন্টেন্ট নতুন করে লোড করুন' : 'Populate BSK standard default content into the live Cloud database'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DDD0] space-y-2">
                          <span className="text-[10px] font-bold text-[#8C6212] uppercase tracking-wider block">
                            {language === 'bn' ? 'স্বয়ংক্রিয় সেটআপ সুবিধা:' : 'Automatic Setup Actions:'}
                          </span>
                          <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside font-medium">
                            <li>{language === 'bn' ? 'হোমপেজ ব্যানার স্লাইডার ও কার্যক্রম ডাটা লোড' : 'Seed homepage banners & activities'}</li>
                            <li>{language === 'bn' ? 'সকল পেজের মৌলিক টেক্সট কপি রেডি রাখা' : 'Initialize all page texts & custom sections'}</li>
                            <li>{language === 'bn' ? 'অডিটোরিয়াম, ক্যাফেটেরিয়া, লাইব্রেরি ও বুক শপ কন্টেন্ট' : 'Populate halls, cafe, library & bookshop info'}</li>
                          </ul>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleBootstrapDB}
                            className="w-full py-2.5 bg-[#B8862A] hover:bg-[#966b1e] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>{language === 'bn' ? 'ক্লাউড ডাটাবেস সম্পূর্ণ বুটস্ট্র্যাপ করুন' : 'Seed BSK Cloud Database Now'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instructions Box */}
                    <div className="bg-[#2E5942]/5 border-2 border-[#2E5942]/20 rounded-2xl p-5 space-y-3">
                      <h4 className="font-serif font-extrabold text-[#2E5942] text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#B8862A]" />
                        <span>{language === 'bn' ? 'cPanel / phpMyAdmin-ইম্পোর্ট গাইড' : 'How to Import this Database into cPanel / phpMyAdmin?'}</span>
                      </h4>
                      <ol className="text-xs text-stone-700 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                        <li>{language === 'bn' ? 'cPanel ড্যাশবোর্ডে প্রবেশ করে phpMyAdmin অপশনে যান।' : 'Log into your cPanel dashboard and open phpMyAdmin.'}</li>
                        <li>{language === 'bn' ? 'বামের ডাটাবেস তালিকা থেকে bskbd_new বা আপনার তৈরি ডাটাবেস সিলেক্ট করুন।' : 'Select your database (bskbd_new) from the left sidebar.'}</li>
                        <li>{language === 'bn' ? 'উপরের "Import" ট্যাবে ক্লিক করে "Choose File" থেকে bskbd_new.sql ফাইলটি আপলোড করুন।' : 'Click the "Import" tab at the top and choose the downloaded bskbd_new.sql file.'}</li>
                        <li>{language === 'bn' ? 'নিচের "Go" বাটনে ক্লিক করলেই কয়েক সেকেন্ডের মধ্যে ২২টি টেবিল এবং যাবতীয় তথ্য ইম্পোর্ট হয়ে যাবে।' : 'Click the "Go" button to automatically create all 22 tables and import data.'}</li>
                      </ol>
                    </div>
                  </div>
                )}


              </div>
            )}

          </div>

        </div>
      )}

      {/* Persistent global ImageResizer Modal interface overlay */}
      <ImageResizer 
        isOpen={resizerOpen}
        onClose={() => setResizerOpen(false)}
        onSave={onResizerSave}
        language={language}
        aspectRatioPreset={resizerPreset}
      />

      {/* Reusable Custom Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#B8862A]/20 shadow-2xl p-6 max-w-sm w-full space-y-4 font-sans text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-serif font-extrabold text-[#1A1207] text-md md:text-lg">
                {language === 'bn' ? 'সতর্কবার্তা ও নিশ্চিতকরণ' : 'Verification Notice'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-sans font-medium">
                {language === 'bn' ? confirmModal.message_bn : confirmModal.message_en}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {language === 'bn' ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    confirmModal.onConfirm();
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setConfirmModal(null);
                  }
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple translation display utilities for section header names
function sectionsLabels(idx: number, lang: Language, title: string) {
  if (lang === 'bn') {
    return `অনুচ্ছেদ অনুবিভাগ - "${title || 'পরিচিতি'}"`;
  }
  return `Section Subtitle - "${title || 'Intro'}"`;
}
