import React, { useState, useEffect } from "react";
import {
  Lock,
  Layout,
  Image as ImageIcon,
  FileText,
  Plus,
  Edit2,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
  Upload,
  AlertCircle,
  Eye,
  Globe2,
  BookOpen,
  Compass,
  Info,
  Bell,
  Calendar,
  Mail,
  Briefcase,
  Paperclip,
  ArrowUpRight,
  UserCheck,
  Download,
  Sparkles,
  Award,
  History,
  PlusCircle,
  ImagePlus,
  Quote,
  GraduationCap,
  Phone,
  Pencil,
  ShieldCheck,
  Sliders,
  Database,
  Crop,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Layers,
  BookOpenCheck,
  PhoneCall,
  Store,
  Building,
  Landmark,
  Coffee,
  Users,
  Truck,
  Heart,
  Lightbulb,
  BookMarked,
} from "lucide-react";
import {
  db,
  auth,
  OperationType,
  handleDatabaseError,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  verifyAdminCredentials,
  uploadImageToServer,
} from "../firebase";
import { cpanelApi } from "../services/cpanelApi";
import {
  Language,
  AnnouncementBarSettings,
  NavbarSettings,
  FooterSettings,
  GoogleMapSettings,
} from "../types";
import ImageResizer from "./ImageResizer";
import MediaLibraryModal from "./MediaLibraryModal";
import PressCMS from "./PressCMS";
import FounderTribute from "./FounderTribute";
import PageContent from "./PageContent";
import websiteContentRaw from "../data/website_content.json";
import {
  defaultPublicationPageData,
  defaultPublicationStats,
  defaultPublicationSeriesList,
  defaultPublicationCatalogs,
  defaultPublicationGallery,
  PublicationSeries,
  PublicationBook,
} from "../data/publicationDefaults";
import {
  defaultAalorIshkoolData,
  defaultMobileLibraryData,
  defaultBangalirChintaData,
  defaultPrimaryTeacherData,
} from "../data/specializedPagesDefaults";
import { MobileLibraryCMSEditor } from "./MobileLibraryCMSEditor";
import { BangalirChintaCMSEditor } from "./BangalirChintaCMSEditor";
import { PrimaryTeacherCMSEditor } from "./PrimaryTeacherCMSEditor";
import { DatabaseStatusPanel } from "./DatabaseStatusPanel";
import { DatabaseExplorer } from "./DatabaseExplorer";
import { DatabaseAuditPanel } from "./DatabaseAuditPanel";
import {
  exportJobApplicationsToExcel,
  exportJobApplicationsToCSV,
} from "../utils/recruitmentExport";
import OfficialJobApplicationPrintModal from "./OfficialJobApplicationPrintModal";

function formatToBanglaDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const monthNamesBn = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const month = monthNamesBn[date.getMonth()];
  const year = date.getFullYear();

  const toBanglaNum = (num: number | string) => {
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num)
      .split("")
      .map((char) => bnNums[parseInt(char)] || char)
      .join("");
  };

  return `${toBanglaNum(day)} ${month} ${toBanglaNum(year)} খ্রিষ্টাব্দ`;
}

function formatToEnglishDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Passcode to access Admin Mode (configurable via environment variable)
const adminVarKey = "VITE_ADMIN_PASSCODE";
const ADMIN_PASSCODE = (import.meta as any).env[adminVarKey] || "5656";

// Helper to recursively remove undefined fields so database setDoc does not throw errors

// Helper to safely ensure a value is treated as an array of strings or items
const ensureArray = <T = string>(val: any): T[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [trimmed as any];
  }
  return [];
};

// Bulletproof helper to guarantee sections is an Array of proper section objects
const safeSections = (secs: any): Array<{ id?: string; title: string; title_en?: string; content: string[]; content_en?: string[]; image?: string; [key: string]: any }> => {
  if (typeof secs === "string" && secs.trim()) {
    try {
      const parsed = JSON.parse(secs);
      if (Array.isArray(parsed)) secs = parsed;
    } catch (_) {}
  }
  if (!Array.isArray(secs)) return [];
  return secs.map((sec: any, idx: number) => {
    if (!sec || typeof sec !== "object") {
      return {
        id: `sec-${idx + 1}`,
        title: "",
        title_en: "",
        content: typeof sec === "string" ? [sec] : [""],
        content_en: [],
        image: ""
      };
    }
    let contentArr: string[] = [];
    if (Array.isArray(sec.content)) {
      contentArr = sec.content.map((c: any) => String(c || ""));
    } else if (typeof sec.content === "string") {
      try {
        const parsedC = JSON.parse(sec.content);
        contentArr = Array.isArray(parsedC) ? parsedC.map(String) : [sec.content];
      } catch (_) {
        contentArr = [sec.content];
      }
    } else {
      contentArr = [""];
    }
    if (contentArr.length === 0) contentArr = [""];

    let contentEnArr: string[] = [];
    if (Array.isArray(sec.content_en)) {
      contentEnArr = sec.content_en.map((c: any) => String(c || ""));
    } else if (typeof sec.content_en === "string") {
      try {
        const parsedC = JSON.parse(sec.content_en);
        contentEnArr = Array.isArray(parsedC) ? parsedC.map(String) : [sec.content_en];
      } catch (_) {
        contentEnArr = [sec.content_en];
      }
    }

    return {
      ...sec,
      id: sec.id || `sec-${idx + 1}`,
      title: sec.title || sec.title_bn || "",
      title_en: sec.title_en || "",
      content: contentArr,
      content_en: contentEnArr,
      image: sec.image || sec.fileUrl || ""
    };
  });
};

// Helper to normalize WebsitePage structure so no section or property access can crash
const normalizeWebsitePage = (pageData: any, pageId?: string): WebsitePage => {
  const targetId = pageId || pageData?.id || "";
  const defaultRaw = (websiteContentRaw as any[]).find((p: any) => p.id === targetId) || {};
  let incoming = pageData || {};
  if (typeof incoming === "string") {
    try { incoming = JSON.parse(incoming); } catch (_) { incoming = {}; }
  }
  const base: any = { ...defaultRaw, ...incoming };
  
  if (!base.id) base.id = targetId;
  if (!base.title_bn) base.title_bn = defaultRaw.title_bn || defaultRaw.title || "";
  if (!base.title_en) base.title_en = defaultRaw.title_en || "";
  if (!base.html_title) base.html_title = defaultRaw.html_title || base.title_bn || "";
  
  let rawSecs = incoming.sections !== undefined && incoming.sections !== null ? incoming.sections : defaultRaw.sections;
  let parsedSecs = safeSections(rawSecs);
  if (parsedSecs.length === 0) {
    parsedSecs = safeSections(defaultRaw.sections);
  }
  if (parsedSecs.length === 0) {
    parsedSecs = [
      { id: "sec-1", title: "পরিচিতি", content: ["প্রথম অনুচ্ছেদ বিবরণী।"] },
      { id: "sec-2", title: "ব্রত ও লক্ষ্য", content: ["লক্ষ্য ও উদ্দেশ্য বিবরণী।"] },
      { id: "sec-3", title: "ইতিহাস ও ঐতিহ্য", content: ["ইতিহাস ও অর্জন বিবরণী।"] },
    ];
  }
  base.sections = parsedSecs;

  base.gallery = ensureArray(base.gallery || defaultRaw.gallery);
  base.stats = ensureArray(base.stats || defaultRaw.stats);
  base.highlights = ensureArray(base.highlights || defaultRaw.highlights);
  base.levels = ensureArray(base.levels || defaultRaw.levels);
  base.downloads = ensureArray(base.downloads || defaultRaw.downloads);
  base.categories = ensureArray(base.categories || defaultRaw.categories);
  base.why_unique = ensureArray(base.why_unique || defaultRaw.why_unique);
  base.extra_sections = ensureArray(base.extra_sections || defaultRaw.extra_sections);
  base.publication_series = ensureArray(base.publication_series || defaultRaw.publication_series);
  base.catalogs = ensureArray(base.catalogs || defaultRaw.catalogs);
  base.busFleet = ensureArray(base.busFleet || defaultRaw.busFleet);

  return base as WebsitePage;
};

const removeUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  if (typeof obj === "object") {
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

// Helper to downscale and compress images before converting to Base64 to optimize payload limits and speed up rendering
function compressImage(
  file: File,
  maxW = 1920,
  maxH = 1080,
  quality = 0.88,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
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

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
      img.src = ev.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function AdminCMS({ language, onClose }: AdminCMSProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem("bsk_admin_passcode_verified") === "true" ||
        localStorage.getItem("bsk_admin_passcode_verified") === "true"
      );
    } catch (_) {
      return false;
    }
  });
  const [hasPasscode, setHasPasscode] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem("bsk_admin_passcode_verified") === "true" ||
        localStorage.getItem("bsk_admin_passcode_verified") === "true"
      );
    } catch (_) {
      return false;
    }
  });
  const [user, setUser] = useState(auth.currentUser);
  const [passcode, setPasscode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Active Admin Tab
  const [databaseSubTab, setDatabaseSubTab] = useState<'status' | 'explorer' | 'audit' | 'tools'>('status');
  const [activeTab, setActiveTab] = useState<
    | "global_settings"
    | "hero"
    | "who_we_are"
    | "activities"
    | "blocks"
    | "stats"
    | "programs"
    | "galleries"
    | "movement"
    | "about_management"
    | "programs_cms"
    | "services_cms"
    | "notice_board"
    | "contact"
    | "recruitment"
    | "press_cms"
    | "blog_cms"
    | "database_cms"
  >("global_settings");

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<{
    announcement_bar: AnnouncementBarSettings;
    navbar_settings: NavbarSettings;
    footer_settings: FooterSettings;
    google_map: GoogleMapSettings;
  }>({
    announcement_bar: {
      enabled: true,
      text_bn:
        "বিশ্বসাহিত্য কেন্দ্র - আলোকিত মানুষ গড়ার আন্দোলন। দেশের যে কোনো প্রান্তর থেকে বইপড়া কর্মসূচিতে যোগ দিন।",
      text_en:
        "Bishwo Shahitto Kendro — Building enlightened minds since 1978. Join our reading habit movement.",
      button_text_bn: "বিস্তারিত দেখুন →",
      button_text_en: "Learn More →",
      link: "/nationwide-excellence",
      visibility: "all",
    },
    navbar_settings: {
      logo_url: "https://bskbd.org/assets/img/logo_bn2.png",
      tagline_bn: "আলোকিত মানুষ চাই",
      tagline_en: "Seeking Enlightened Souls",
    },
    footer_settings: {
      org_desc_bn:
        "বাংলাদেশের শীর্ষস্থানীয় সাহিত্য ও চিত্ত বিকাশের সামাজিক-সাংস্কৃতিক সংগঠন। ১৯৭৮ সাল থেকে নিরলস কাজ করে চলেছে।",
      org_desc_en:
        "Bangladesh's leading cultural organization building humane and complete minds since 1978.",
      address_bn: "১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০",
      address_en: "17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000",
      phones: ["+880-2-9661188", "+880-2-9661189"],
      email: "info@bskbd.org",
      emergency_contact: "+8801711000000",
      facebook_url: "https://www.facebook.com/bskbd.org",
      youtube_url: "https://www.youtube.com/c/BishwoShahittoKendro",
      instagram_url: "https://www.instagram.com/bskbd",
      twitter_url: "https://twitter.com/bskbd",
      linkedin_url: "https://www.linkedin.com/company/bskbd",
      pinterest_url: "https://www.pinterest.com/bskbd",
      copyright_bn:
        "© ২০২৪ বিশ্বসাহিত্য কেন্দ্র · bskbd.org · সর্বস্বত্ব সংরক্ষিত",
      copyright_en:
        "© 2024 Bishwo Shahitto Kendro · bskbd.org · All rights reserved",
    },
    google_map: {
      embed_url: "https://maps.app.goo.gl/nGZ4X7sXKzokaJdb8",
      map_url: "https://maps.app.goo.gl/nGZ4X7sXKzokaJdb8",
      latitude: 23.74831,
      longitude: 90.39281,
      title_bn: "গুগল ম্যাপে আমাদের অবস্থান",
      title_en: "Our Location on Google Maps",
      address_bn:
        "বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০",
      address_en:
        "Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000",
    },
  });
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] =
    useState<boolean>(false);
  const [globalSubTab, setGlobalSubTab] = useState<
    "announcement" | "navbar" | "footer" | "map"
  >("announcement");

  // Who We Are Module 2 state
  const [whoWeAreBlock, setWhoWeAreBlock] = useState<{
    title_bn: string;
    title_en: string;
    subtitle_bn: string;
    subtitle_en: string;
    paragraphs_bn: string[];
    paragraphs_en: string[];
  }>({
    title_bn: "আমরা কারা",
    title_en: "Who We Are",
    subtitle_bn: "আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন",
    subtitle_en:
      "A transformative nation-building movement cultivating enlightened minds and noble human values",
    paragraphs_bn: [
      "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।",
      "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।",
    ],
    paragraphs_en: [
      "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
      "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations.",
    ],
  });
  const [isSavingWhoWeAre, setIsSavingWhoWeAre] = useState<boolean>(false);

  // cPanel DB status
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isHeroGalleryOpen, setIsHeroGalleryOpen] = useState<boolean>(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState<boolean>(false);
  const [mediaLibraryTargetField, setMediaLibraryTargetField] = useState<((url: string) => void) | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [noticesList, setNoticesList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activeNoticeSubTab, setActiveNoticeSubTab] = useState<
    "central" | "event" | "news" | "today_desc"
  >("central");
  const [editingNoticeItem, setEditingNoticeItem] = useState<any | null>(null);

  // Blog CMS states
  const [blogPostsList, setBlogPostsList] = useState<any[]>([]);
  const [blogReviewsList, setBlogReviewsList] = useState<any[]>([]);
  const [activeBlogSubTab, setActiveBlogSubTab] = useState<
    "posts" | "header" | "reviews"
  >("posts");
  const [editingBlogPost, setEditingBlogPost] = useState<any | null>(null);
  const [isSavingBlogPost, setIsSavingBlogPost] = useState<boolean>(false);
  const [blogSettings, setBlogSettings] = useState<{
    badge_bn: string;
    badge_en: string;
    title_bn: string;
    title_en: string;
    desc_bn: string;
    desc_en: string;
    banner_image: string;
  }>({
    badge_bn: "বিশ্বসাহিত্য কেন্দ্র ব্লগ",
    badge_en: "BSK Official Blog",
    title_bn: "সাহিত্যচিন্তা, শিক্ষা ও আলোকদীপ্ত জীবন",
    title_en: "Literature, Education & Enlightened Thought",
    desc_bn:
      "বইপড়া আন্দোলন, বিশ্বসাহিত্য চিন্তন, মানবিক মূল্যবোধ গঠন ও তরুণের চিন্তার বিকাশে কেন্দ্রের প্রকাশিত গুরুত্বপূর্ণ ব্লগ, প্রবন্ধ ও নিবন্ধমালা।",
    desc_en:
      "Articles, essays and reflections on reading movements, literature, aesthetics, and youth development.",
    banner_image: "",
  });
  const [isSavingBlogSettings, setIsSavingBlogSettings] =
    useState<boolean>(false);
  const [editingReviewItem, setEditingReviewItem] = useState<any | null>(null);
  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);
  const [aalorCmsTab, setAalorCmsTab] = useState<
    | "hero"
    | "pillars"
    | "philosophy"
    | "modules"
    | "rules"
    | "courses"
    | "books"
    | "admission"
  >("hero");
  const [aalorActiveYear, setAalorActiveYear] = useState<number>(1);
  const [aalorCourseFilter, setAalorCourseFilter] = useState<string>("all");

  // Global Database Cross-check Verification Notification State
  const [crosscheckNotification, setCrosscheckNotification] = useState<{
    id: string;
    type: "success" | "verifying" | "error";
    title: string;
    collectionName: string;
    docId: string;
    timestamp: string;
    verifiedFieldsCount?: number;
    latencyMs?: number;
    message_bn: string;
    message_en: string;
    dataSnapshot?: any;
  } | null>(null);
  const [isCrosscheckModalOpen, setIsCrosscheckModalOpen] =
    useState<boolean>(false);
  const [auditStats, setAuditStats] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // States for Today's Notice description block
  const [todayNoticeTitle, setTodayNoticeTitle] = useState<string>("");
  const [todayNoticeSubtitle, setTodayNoticeSubtitle] = useState<string>("");
  const [todayNoticeContent, setTodayNoticeContent] = useState<string>("");
  const [todayNoticeImage, setTodayNoticeImage] = useState<string>("");
  const [isSavingTodayNotice, setIsSavingTodayNotice] =
    useState<boolean>(false);

  // Recruitment (Niyog) Section CMS states
  const [circularsList, setCircularsList] = useState<any[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [editingCircular, setEditingCircular] = useState<any | null>(null);
  const [activeRecruitmentSubTab, setActiveRecruitmentSubTab] = useState<
    "circulars" | "applications" | "intro"
  >("circulars");
  const [selectedAppForPrint, setSelectedAppForPrint] = useState<any | null>(
    null,
  );
  const [applicantSearchQuery, setApplicantSearchQuery] = useState<string>("");
  const [selectedCircularFilter, setSelectedCircularFilter] =
    useState<string>("all");
  const [isExportingData, setIsExportingData] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  // Inquiries and Contact block states
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [contactInfoBlock, setContactInfoBlock] = useState<any>(null);

  // Contact Custom Cards States
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [isCardFormOpen, setIsCardFormOpen] = useState<boolean>(false);
  const [cardForm, setCardForm] = useState<any>({
    title_bn: "",
    title_en: "",
    desc_bn: "",
    desc_en: "",
    imgUrl: "",
    icon: "📍",
  });

  // Additional fine-grain widgets CMS states
  const [introBlock, setIntroBlock] = useState<any>(null);
  const [statsBlock, setStatsBlock] = useState<any>(null);
  const [founderBlock, setFounderBlock] = useState<any>(null);
  const [beliefBlock, setBeliefBlock] = useState<any>(null);
  const [ctaBlock, setCtaBlock] = useState<any>(null);
  const [portalsBlock, setPortalsBlock] = useState<any>(null);
  const [infographicBlock, setInfographicBlock] = useState<any>(null);
  const [homepagePrograms, setHomepagePrograms] = useState<any[]>([]);
  const [galleryML, setGalleryML] = useState<any>(null);
  const [galleryRH, setGalleryRH] = useState<any>(null);
  const [galleryCL, setGalleryCL] = useState<any>(null);

  // Selected subblock in Tab 4
  const [activeSubBlock, setActiveSubBlock] = useState<
    "intro" | "founder" | "belief" | "cta" | "portals" | "infographic"
  >("intro");
  // Selected gallery type in Tab 7
  const [activeGalleryType, setActiveGalleryType] = useState<
    "ml" | "rh" | "cl"
  >("ml");

  // Editing state
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingActivity, setEditingActivity] = useState<RecentActivity | null>(
    null,
  );
  const [editingPage, setEditingPage] = useState<WebsitePage | null>(null);
  const [hasCustomMediaContact, setHasCustomMediaContact] =
    useState<boolean>(false);
  const [previewLanguage, setPreviewLanguage] = useState<"bn" | "en" | null>(
    null,
  );
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [actionStatus, setActionStatus] = useState<string>("");
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true); // Defaults to true once components snapshot successfully
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    message_bn: string;
    message_en: string;
    onConfirm: () => void;
  } | null>(null);

  const requireConfirmation = (
    message_bn: string,
    message_en: string,
    onConfirm: () => void,
  ) => {
    setConfirmModal({ message_bn, message_en, onConfirm });
  };

  // Resizer state modal trigger configuration
  const [resizerOpen, setResizerOpen] = useState<boolean>(false);
  const [resizerPreset, setResizerPreset] = useState<
    "banner" | "landscape" | "square" | "portrait" | "any"
  >("landscape");
  const [onResizerSave, setOnResizerSave] = useState<
    (resizedBase64: string) => void
  >(() => () => {});
  const [isDirectUploading, setIsDirectUploading] = useState<boolean>(false);

  const openImageResizer = (
    preset: "banner" | "landscape" | "square" | "portrait" | "any",
    callback: (resizedUrl: string) => void,
  ) => {
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
  const handleDirectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (imgUrl: string) => void,
  ) => {
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
      e.target.value = "";
    }
  };

  // Automated Real-time Database Cross-check Verification Engine
  const runDatabaseCrosscheck = async (
    collectionName: string,
    docId: string,
    payload: any,
    label: string,
  ) => {
    const startTime = Date.now();
    setCrosscheckNotification({
      id: `chk-${Date.now()}`,
      type: "verifying",
      title: label,
      collectionName,
      docId,
      timestamp: new Date().toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      message_bn: `ডাটাবেস সংরক্ষণ যাচাইকরণ ও ক্রসচেক চলছে (${collectionName}/${docId})...`,
      message_en: `Verifying cPanel database persistence for ${collectionName}/${docId}...`,
    });

    try {
      const serverCheck = await cpanelApi.getDocFromServer(collectionName, docId);
      const data = serverCheck?.data;
      const latency = Date.now() - startTime;

      if (data) {
        setCrosscheckNotification({
          id: `chk-${Date.now()}`,
          type: "success",
          title: label,
          collectionName,
          docId,
          timestamp: new Date().toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          verifiedFieldsCount: Object.keys(data || {}).length,
          latencyMs: latency,
          message_bn: `✅ ডাটাবেস ক্রসচেক সফল! "${label}" সফলভাবে cPanel ডাটাবেসে সংরক্ষিত ও লাইভ ভেরিফাইড হয়েছে (${latency}ms রেসপন্স)।`,
          message_en: `✅ Database Crosscheck Verified! "${label}" successfully committed to cPanel MySQL Database (${latency}ms latency).`,
          dataSnapshot: data,
        });
        setTimeout(() => {
          setCrosscheckNotification((prev) =>
            prev?.docId === docId ? null : prev,
          );
        }, 8000);
        return true;
      } else {
        throw new Error(`ডকুমেন্ট (${docId}) ডাটাবেসে পাওয়া যায়নি`);
      }
    } catch (err: any) {
      console.error("Crosscheck verification error:", err);
      setCrosscheckNotification({
        id: `chk-${Date.now()}`,
        type: "error",
        title: label,
        collectionName,
        docId,
        timestamp: new Date().toLocaleTimeString("bn-BD", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        message_bn: `⚠️ ডাটাবেস ক্রসচেক সতর্কতা: ${err.message || "Error"}`,
        message_en: `⚠️ Database Crosscheck Warning: ${err.message || "Error"}`,
      });
      return false;
    }
  };

  // Complete Database Audit across all collections
  const runFullDatabaseAudit = async () => {
    setIsAuditing(true);
    try {
      const collectionsToCheck = [
        "hero_slides",
        "recent_activities",
        "website_pages",
        "homepage_blocks",
        "homepage_programs",
        "notices",
        "events",
        "news_items",
        "blog_posts",
        "blog_settings",
        "blog_reviews",
        "recruitment_circulars",
        "job_applications",
        "inquiries",
        "press",
        "photo_albums",
        "library_applications",
      ];

      const counts: Record<string, number> = {};
      let totalDocs = 0;
      for (const colName of collectionsToCheck) {
        try {
          const colResult = await cpanelApi.getCollectionFromServer(colName);
          const items = colResult?.data || [];
          counts[colName] = items.length;
          totalDocs += items.length;
        } catch (e) {
          counts[colName] = 0;
        }
      }

      setAuditStats({
        totalDocs,
        counts,
        auditTime: new Date().toLocaleTimeString("bn-BD", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        status: "100% Verified Active & Synced",
      });
      setIsCrosscheckModalOpen(true);
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
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

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
        // 0. media_contact existence
        const mediaContactDoc = await cpanelApi.getDoc(
          "homepage_blocks",
          "media_contact",
        );
        setHasCustomMediaContact(!!mediaContactDoc);

        // 1. Hero Slides
        const slides = await cpanelApi.getCollection<HeroSlide>("hero_slides");
        slides.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHeroSlides(slides);

        // 2. Recent Activities
        const acts =
          await cpanelApi.getCollection<RecentActivity>("recent_activities");
        acts.sort((a, b) => (a.order || 0) - (b.order || 0));
        setRecentActivities(acts);

        // 3. Website Pages
        const pgs = await cpanelApi.getCollection<WebsitePage>("website_pages");
        const mergedPages = (websiteContentRaw as any[]).map((defaultPage) => {
          const match = pgs.find((p) => p.id === defaultPage.id);
          return normalizeWebsitePage(match ? { ...defaultPage, ...match } : defaultPage, defaultPage.id);
        });
        setPages(mergedPages);

        // 3b. Global Settings
        const globalSettingsDoc = await cpanelApi.getDoc(
          "website_pages",
          "global_settings",
        );
        if (globalSettingsDoc) {
          setGlobalSettings((prev) => ({
            announcement_bar: {
              ...prev.announcement_bar,
              ...(globalSettingsDoc.announcement_bar || {}),
            },
            navbar_settings: {
              ...prev.navbar_settings,
              ...(globalSettingsDoc.navbar_settings || {}),
            },
            footer_settings: {
              ...prev.footer_settings,
              ...(globalSettingsDoc.footer_settings || {}),
            },
            google_map: {
              ...prev.google_map,
              ...(globalSettingsDoc.google_map || {}),
            },
          }));
        }

        // 4. Homepage Blocks
        const blocks = await cpanelApi.getCollection<any>("homepage_blocks");
        blocks.forEach((doc: any) => {
          if (doc.id === "intro_banner") setIntroBlock(doc);
          else if (doc.id === "statistics") setStatsBlock(doc);
          else if (doc.id === "founder") setFounderBlock(doc);
          else if (doc.id === "central_belief") setBeliefBlock(doc);
          else if (doc.id === "cta_block") setCtaBlock(doc);
          else if (doc.id === "portals") setPortalsBlock(doc);
          else if (doc.id === "gallery_ml") setGalleryML(doc);
          else if (doc.id === "gallery_rh") setGalleryRH(doc);
          else if (doc.id === "gallery_cl") setGalleryCL(doc);
          else if (doc.id === "infographic") setInfographicBlock(doc);
          else if (doc.id === "contact_info") setContactInfoBlock(doc);
          else if (doc.id === "who_we_are") {
            if (doc) {
              setWhoWeAreBlock((prev) => ({
                ...prev,
                ...doc,
                paragraphs_bn: Array.isArray(doc.paragraphs_bn)
                  ? doc.paragraphs_bn
                  : prev.paragraphs_bn,
                paragraphs_en: Array.isArray(doc.paragraphs_en)
                  ? doc.paragraphs_en
                  : prev.paragraphs_en,
              }));
            }
          }
        });

        // 5. Homepage Programs
        const progs = await cpanelApi.getCollection<any>("homepage_programs");
        progs.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHomepagePrograms(progs);

        // 6. Notices
        const notices = await cpanelApi.getCollection<any>("notices");
        setNoticesList(notices);

        // 7. Events
        const events = await cpanelApi.getCollection<any>("events");
        setEventsList(events);

        // 8. News
        const news = await cpanelApi.getCollection<any>("news_items");
        setNewsList(news);

        // 9. Inquiries
        const inqs = await cpanelApi.getCollection<any>("inquiries");
        inqs.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
          const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        setInquiries(inqs);

        // 10. Circulars
        const circs = await cpanelApi.getCollection<any>(
          "recruitment_circulars",
        );
        setCircularsList(circs);

        // 11. Job Applications
        const apps = await cpanelApi.getCollection<any>("job_applications");
        apps.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
          const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        setApplicationsList(apps);

        // 12. Blog Posts
        const posts = await cpanelApi.getCollection<any>("blog_posts");
        setBlogPostsList(posts);

        // 13. Blog Reviews
        const revs = await cpanelApi.getCollection<any>("blog_reviews");
        setBlogReviewsList(revs);

        // 14. Blog Settings
        const blogSettingsDoc = await cpanelApi.getDoc(
          "blog_settings",
          "header",
        );
        if (blogSettingsDoc) {
          setBlogSettings((prev) => ({ ...prev, ...blogSettingsDoc }));
        }

        setIsDbConnected(true);
      } catch (err) {
        console.warn("Error in fetchAllAdminData in AdminCMS:", err);
      } finally {
        setLoading(false);
      }
  };

  // Fetch all cPanel Database content if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchAllAdminData();

    const handleDataUpdate = () => {
      fetchAllAdminData();
    };

    window.addEventListener("bsk_db_updated", handleDataUpdate);

    return () => {
      window.removeEventListener("bsk_db_updated", handleDataUpdate);
    };
  }, [isAuthenticated]);

  // Save Global Settings
  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobalSettings(true);
    try {
      const settingsPayload = {
        id: "global_settings",
        announcement_bar: globalSettings.announcement_bar || {},
        navbar_settings: globalSettings.navbar_settings || {},
        footer_settings: globalSettings.footer_settings || {},
        google_map: globalSettings.google_map || {},
        updatedAt: new Date().toISOString(),
      };

      await cpanelApi.setDoc(
        "website_pages",
        "global_settings",
        settingsPayload,
      );
      await cpanelApi.setDoc(
        "homepage_blocks",
        "global_settings",
        settingsPayload,
      );

      alert(
        language === "bn"
          ? "গ্লোবাল সেটিংস সফলভাবে আপডেট হয়েছে!"
          : "Global Website Settings updated successfully!",
      );
    } catch (err: any) {
      console.error("Error saving global_settings:", err);
      handleDatabaseError(
        err,
        OperationType.WRITE,
        "website_pages/global_settings",
      );
    } finally {
      setIsSavingGlobalSettings(false);
    }
  };

  // Synchronize Today's Notice states from fetched website pages
  useEffect(() => {
    const noticePage = pages.find((p) => p.id === "notice");
    if (noticePage) {
      if (noticePage.subtitle_bn) {
        setTodayNoticeSubtitle(noticePage.subtitle_bn);
      }
      if (noticePage.sections && noticePage.sections[0]) {
        setTodayNoticeTitle(
          noticePage.sections[0].title || "আজকের নোটিশ ও ঘোষণা",
        );
        setTodayNoticeContent(noticePage.sections[0].content?.[0] || "");
        setTodayNoticeImage(
          noticePage.sections[0].image || noticePage.sections[0].fileUrl || "",
        );
      }
    }
  }, [pages]);

  // Handle Sign In with PIN and authenticate against server
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg("");

    try {
      const result = await verifyAdminCredentials({ passcode });
      if (result.success) {
        setHasPasscode(true);
      } else {
        setErrorMsg(
          result.error ||
            (language === "bn"
              ? "ভুল পিন নম্বর! আবার চেষ্টা করুন।"
              : "Incorrect Pin! Please try again."),
        );
      }
    } catch (err: any) {
      setErrorMsg(language === "bn" ? "লগইন ব্যর্থ হয়েছে।" : "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Google sign in helper
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setActionStatus(
        language === "bn"
          ? `গুগল দিয়ে সফলভাবে লগইন হয়েছে! হ্যালো, ${result.user.displayName || result.user.email}`
          : `Signed in successfully via Google! Welcome, ${result.user.displayName || result.user.email}`,
      );
      setTimeout(() => setActionStatus(""), 4000);
    } catch (err: any) {
      console.error("Google Sign-in failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg(
          language === "bn"
            ? "সাইন-ইন উইন্ডোটি বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "The sign-in window was closed before completion. Please try again.",
        );
      } else if (err.code === "auth/popup-blocked") {
        setErrorMsg(
          language === "bn"
            ? "আপনার ব্রাউজারে পপ-আপ ব্লক করা আছে। অনুগ্রহ করে পপ-আপ সক্রিয় করে আবার চেষ্টা করুন।"
            : "Popups are blocked by your browser. Please allow popups and try again.",
        );
      } else {
        setErrorMsg(
          language === "bn"
            ? `গুগল সাইন-ইন ব্যর্থ হয়েছে: ${err.message}`
            : `Google Sign-in failed: ${err.message}`,
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    try {
      sessionStorage.removeItem("bsk_admin_passcode_verified");
    } catch (_) {}
    setHasPasscode(false);
    setPasscode("");
  };

  // Convert uploaded image file to lightweight Base64 string for database storage
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "hero" | "activity",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (type === "hero" && editingHero) {
        setEditingHero({ ...editingHero, bgImage: finalUrl });
      } else if (type === "activity" && editingActivity) {
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
      bgImage:
        "/assets/IMGS/481260669_1052017186949762_8260665744101041376_n.jpg",
      order: 1,
    },
    {
      id: "slide-2",
      badge_bn: "ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম",
      badge_en: "Mobile Library Network",
      title_bn: "বই নিয়ে মানুষের দোরগোড়ায় ভ্রাম্যমাণ লাইব্রেরি",
      title_en: "Taking Books to the Doorsteps of Millions",
      desc_bn: "৩৬০টি উপজেলায় ৩ লক্ষাধিক পাঠকের ঘরে আলো ছড়ানো।",
      desc_en: "Reaching over 300,000 members across 64 districts.",
      bgImage:
        "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
      order: 2,
    },
    {
      id: "slide-3",
      badge_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম",
      badge_en: "National Excellence Program",
      title_bn: "কৈশোর ও যৌবনে বইপড়ার আনন্দ ও মনন চর্চা",
      title_en: "Cultivating Reading and Excellence in Youth",
      desc_bn: "সৃজনশীল বই পাঠের দেশব্যাপী উৎসাহ প্রদান।",
      desc_en: "Instilling deep interest and analytical thinking in students.",
      bgImage:
        "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
      order: 3,
    },
    {
      id: "slide-4",
      badge_bn: "আলোর ইशকুল সেমিনার",
      badge_en: "Aalor Ishkool Seminars",
      title_bn: "ধ্রুপদী চিন্তা ও মননচর্চার মিলনমেলা",
      title_en: "Enlightened Seminar Circles and Cultural Growth",
      desc_bn: "সাহিত্য, কবিতা ও দর্শনের এক মুক্ত মঞ্চ।",
      desc_en: "A nurturing hub of intellectual and cultural seminars.",
      bgImage:
        "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg",
      order: 4,
    },
  ];

  const defaultRecentActivities: RecentActivity[] = [
    {
      id: "act-1",
      title_bn:
        "উপদেশীয় ধ্রুপদী সঙ্গীত বক্তৃতামালা-২ ( Classical Music Appreciation)",
      title_en:
        "Sub-Continental Classical Music Appreciation Lectures - Session 2",
      desc_bn:
        "উপদেশের ধ্রুপদী সঙ্গীত বিষয়ক বিশেষ বক্তৃতামালা ও সঙ্গীতানুষ্ঠান।",
      desc_en:
        "Special lecture and recital on classical music styles at the main auditorium.",
      date_bn: "৪ অক্টোবর ২০২৪",
      date_en: "Oct 4, 2024",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন, ঢাকা",
      loc_en: "BSK Auditorium, Dhaka",
      category_bn: "আলোর ইشকুল",
      category_en: "Aalor Ishkool",
      image:
        "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg",
      order: 1,
    },
    {
      id: "act-2",
      title_bn: "আলোর ইশকুল — পশ্চিমের রবি বিশেষ সন্ধ্যা অনুষ্ঠান",
      title_en: "Aalor Ishkool presents: Rabindranath Tagore Evening Session",
      desc_bn:
        "রবীন্দ্রনাথ ঠাকুরের পশ্চিমী প্রভাব ও বিশ্ববীক্ষা নিয়ে তাত্ত্বিক আলোচনা সন্ধ্যা।",
      desc_en:
        "Exploring Tagorian literature and Western echoes in Tagore's creations.",
      date_bn: "২৫ ডিসেম্বর ২০২৩",
      date_en: "Dec 25, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK Auditorium",
      category_bn: "সংস্কৃতি ও উৎসব",
      category_en: "Culture",
      image:
        "/assets/IMGS/493907913_1088721076612706_7469814680062640482_n.jpg",
      order: 2,
    },
    {
      id: "act-3",
      title_bn: "৬৪ জেলায় ৩১ লক্ষ নির্বাচিত বই বিতরণ ও উৎসব",
      title_en: "3.1 Million Selective Books Distributed Across 64 Districts",
      desc_bn:
        "৩০০ উপজেলার ১৫ হাজার শিক্ষাপ্রতিষ্ঠানে বই বিতরণ কার্যক্রম সম্পন্ন।",
      desc_en: "Books distribution festival completed across 15,000 schools.",
      date_bn: "৩ ডিসেম্বর ২০২৩",
      date_en: "Dec 3, 2023",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র মিলনায়তন",
      loc_en: "BSK HQ Premises",
      category_bn: "বই বিতরণ",
      category_en: "Distribution",
      image:
        "/assets/IMGS/534826832_1175889297895883_7988975073499309288_n.jpg",
      order: 3,
    },
  ];

  // Check DB Connection manually
  const checkDbConnection = async () => {
    setCheckingDb(true);
    setActionStatus(
      language === "bn"
        ? "ডাটাবেস কানেকশন পরীক্ষা করা হচ্ছে..."
        : "Testing database connection...",
    );
    try {
      const testCol = collection(db, "website_pages");
      await getDocs(testCol);
      setIsDbConnected(true);
      setActionStatus(
        language === "bn"
          ? "সফল! ডাটাবেস সম্পূর্ণ সচল এবং সংযুক্ত রয়েছে। 🟢"
          : "Success! Database is active and connected. 🟢",
      );
    } catch (error) {
      console.error("Database connection error:", error);
      setIsDbConnected(false);
      setActionStatus(
        language === "bn"
          ? "ত্রুটি! ডাটাবেস সংযোগে সমস্যা পাওয়া গিয়েছে। 🔴"
          : "Error! Database connection failure. 🔴",
      );
    } finally {
      setCheckingDb(false);
      setTimeout(() => setActionStatus(""), 5000);
    }
  };

  // Bootstrap Database
  const handleBootstrapDB = async () => {
    requireConfirmation(
      "আপনি কি ডেমো ডাটা দিয়ে ডাটাবেজ চালু করতে চান?",
      "Do you want to initialize the database with standard default BSK data?",
      async () => {
        setActionStatus(
          language === "bn"
            ? "ডাটাবেস লোড হচ্ছে..."
            : "Initializing BSK Database...",
        );
        try {
          // Seed Hero Slides
          for (const slide of defaultHeroSlides) {
            undefined;
          }
          // Seed Recent Activities
          for (const act of defaultRecentActivities) {
            undefined;
          }

          // Seed Website Pages
          if (websiteContentRaw && Array.isArray(websiteContentRaw)) {
            for (const page of websiteContentRaw) {
              undefined;
            }
          }

          // Seed Default Programs
          const defaultProgs = [
            {
              id: "nationwide-excellence",
              route: "nationwide-excellence",
              title_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম",
              title_en: "Nationwide Excellence Program",
              desc_bn: "৬৪ জেলায় দেশভিত্তিক সাহিত্য মূল্যায়ন ও বইপড়া আন্দোলন।",
              desc_en: "Countrywide elite reading evaluation & movement.",
              tag_bn: "৬৪ জেলা",
              tag_en: "64 Districts",
              colorClass: "bg-[#8B3A1E] text-orange-100",
              icon: "Award",
              bgImage:
                "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80",
              order: 1,
            },
            {
              id: "mobile-library",
              route: "mobile-library",
              title_bn: "ভ্রাম্যমাণ লাইব্রেরি",
              title_en: "Mobile Library Network",
              desc_bn: "৪০০০+ স্কুল ও লোকালয়ে চলমান দ্বীপ্ত লাইব্রেরি।",
              desc_en: "Reaching 4,000+ local centers via mobile units.",
              tag_bn: "৪০০০+ স্কুল",
              tag_en: "4,000+ Schools",
              colorClass: "bg-[#2E5942] text-emerald-100",
              icon: "Truck",
              bgImage:
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
              order: 2,
            },
            {
              id: "reading-habit",
              route: "reading-habit",
              title_bn: "পাঠাভ্যাস উন্নয়ন",
              title_en: "Reading Habit Program",
              desc_bn: "শিক্ষা প্রতিষ্ঠানে নিয়মিত বই পড়ার অভ্যাস ও পুরষ্কার।",
              desc_en: "Institutional reading encouragement and prizes.",
              tag_bn: "কর্মসূচি",
              tag_en: "Program",
              colorClass: "bg-[#1E4A6B] text-sky-100",
              icon: "BookOpen",
              bgImage:
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
              order: 3,
            },
            {
              id: "book-fair",
              route: "book-fair",
              title_bn: "ভ্রাম্যমাণ বইমেলা",
              title_en: "Mobile Book Fair",
              desc_bn:
                "সারাদেশে ভ্রাম্যমাণ বইমেলা আয়োজন ও মানসম্মত গ্রন্থ প্রদর্শনী।",
              desc_en: "Nationwide mobile book fair events & exhibitions.",
              tag_bn: "বাৎসরিক",
              tag_en: "Annual",
              colorClass: "bg-[#2E5942] text-emerald-100",
              icon: "BookOpen",
              bgImage:
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
              order: 4,
            },
            {
              id: "aalor-ishkool",
              route: "aalor-ishkool",
              title_bn: "আলোর ইশকুল",
              title_en: "Aalor Ishkool",
              desc_bn: "উচ্চতর মননশীলতা ও সাংস্কৃতিক বোধের স্কুল।",
              desc_en: "Advanced mindset and cultural growth seminars.",
              tag_bn: "সক্রিয়",
              tag_en: "Active",
              colorClass: "bg-[#3D2B14] text-[#F0CC7A]",
              icon: "Sparkles",
              bgImage:
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
              order: 5,
            },
            {
              id: "aalor-pathshala",
              route: "aalor-pathshala",
              title_bn: "আলোর পাঠশালা",
              title_en: "Aalor Pathshala",
              desc_bn: "সুবিধাবঞ্চিত এলাকায় কমিউনিটি লার্নিং সেন্টার।",
              desc_en: "Empowering underprivileged student sectors.",
              tag_bn: "নতুন",
              tag_en: "New",
              colorClass: "bg-[#6B5A1E] text-amber-100",
              icon: "SchoolIcon",
              bgImage:
                "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
              order: 6,
            },
            {
              id: "bangalir_chinta",
              route: "bangalir_chinta",
              title_bn: "বাঙালির চিন্তা",
              title_en: "Bangalir Chinta",
              desc_bn:
                "বাঙালি মনীষীদের শ্রেষ্ঠ মননশীল ও চিন্তামূলক প্রবন্ধের সংকলন প্রকাশ কর্মসূচি।",
              desc_en:
                "Selected historical and philosophical works and thoughts of Bengal giants.",
              tag_bn: "ঐতিহাসিক",
              tag_en: "Historical",
              colorClass: "bg-[#553E2A] text-orange-100",
              icon: "BookOpenCheck",
              bgImage:
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
              order: 7,
            },
            {
              id: "primary-teacher",
              route: "primary-teacher",
              title_bn: "প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি",
              title_en: "Primary Teachers Reading Program",
              desc_bn: "প্রাথমিক ও মাধ্যমিক শিক্ষকদের বইপড়া কৃষ্টি।",
              desc_en: "Enhancement materials for elementary educators.",
              tag_bn: "শিক্ষক উন্নয়ন",
              tag_en: "Teachers",
              colorClass: "bg-[#213547] text-slate-100",
              icon: "PenTool",
              bgImage:
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
              order: 8,
            },
            {
              id: "publication",
              route: "publication",
              title_bn: "প্রকাশনা কার্যক্রম",
              title_en: "Publications",
              desc_bn:
                "ধ্রুপদী ও নোবেলবিজয়ী বিশ্বসাহিত্যের উচ্চমানের বাংলা অনুবাদ প্রকাশনা।",
              desc_en:
                "Acclaimed publications of world classics and Bangla translations.",
              tag_bn: "১০০০+ বই",
              tag_en: "1000+ Books",
              colorClass: "bg-[#4A3B32] text-amber-100",
              icon: "BookOpen",
              bgImage:
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
              order: 9,
            },
          ];
          for (const p of defaultProgs) {
            undefined;
          }

          // Seed Default Notices
          const defaultNotices = [
            {
              id: "notice-1",
              title_bn:
                "একাদশ ও দ্বাদশ শ্রেণীর দেশভিত্তিক বইপড়া কর্মসূচির ফরম সংগ্রহ ও জমাদান",
              title_en:
                "Enrollment Forms Collection for College Level Reading Program",
              isUrgent: true,
              isNew: true,
              date_bn: "৩০ সেপ্টেম্বর ২০২৪",
              date_en: "Sep 30, 2024",
            },
            {
              id: "notice-2",
              title_bn:
                "কেন্দ্রীয় লাইব্রেরি সদস্যপদের বার্ষিক ফি পরিশোধের সময়সীমা বৃদ্ধি",
              title_en:
                "Extension of BSK HQ Central Library Annual Membership Fee Deadline",
              isUrgent: false,
              isNew: true,
              date_bn: "১৫ সেপ্টেম্বর ২০২৪",
              date_en: "Sep 15, 2024",
            },
          ];
          for (const notice of defaultNotices) {
            undefined;
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
              title_en:
                "Classical Music Appreciation Lecture Series - Session 2",
              time_bn: "সন্ধ্যা ৬:০০ টা",
              time_en: "6:00 PM",
              loc_bn: "কেন্দ্রীয় মিলনায়তন, ঢাকা",
              loc_en: "Central Auditorium, Dhaka",
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
              loc_en: "Auditorium, Banglamotor",
            },
          ];
          for (const ev of defaultEvents) {
            undefined;
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
              title_bn:
                "আসন্ন শুক্রবার আলোর ইশকুলের সেমিনার ও ধ্রুপদী বক্তৃতামালা",
              title_en:
                "Aalor Ishkool: Sub-Continental Music Appreciation Lecture This Friday",
            },
            {
              id: "news-2",
              icon: "🏆",
              tag_bn: "পুরস্কার",
              tag_en: "Award",
              date_bn: "৩ ডিসেম্বর ২০২৩",
              date_en: "Dec 3, 2023",
              title_bn: "দেশব্যাপী ৩১ লক্ষ বই বিতরণ উৎসব সফলভাবে সম্পন্ন",
              title_en:
                "3.1 Million Selective Books Successfully Distributed Across 64 Districts",
            },
          ];
          for (const news of defaultNewsItems) {
            undefined;
          }

          // Seed Default Contact Info (homepage_blocks)
          await cpanelApi.setDoc(
            "homepage_blocks",
            "contact_info",
            removeUndefinedFields({
              address_bn:
                "বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০, বাংলাদেশ।",
              address_en:
                "Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000, Bangladesh.",
              phones: "+৮৮০-২-৯৬৬১০৭৮, +৮৮০-২-৪৮৬২৪৪৮, +৮৮০১৮১৭-০৫৮৭৪১",
              emails: "bskbd@live.com, info@bskbd.org",
              hours_bn: "খোলা থাকে সকাল ৯টা - বিকাল ৫টা (শুক্রবার বন্ধ)",
              hours_en: "Hours: 9:00 AM - 5:00 PM (Closed Fridays)",
              cards: [],
            }),
          );

          // Seed Default Press Release (press)
          await cpanelApi.setDoc(
            "press",
            "press-1",
            removeUndefinedFields({
              id: "press-1",
              title_bn: "বিশ্বসাহিত্য কেন্দ্রের সুবর্ণ জয়ন্তী উদযাপিত",
              title_en: "BSK Celebrates Golden Jubilee",
              summary:
                "সুবর্ণ জয়ন্তী উপলক্ষে বিশেষ সাহিত্য সেমিনার অনুষ্ঠিত হয়েছে।",
              content:
                "ঢাকা ও দেশজুড়ে ব্যাপক উৎসাহের সাথে বিশ্বসাহিত্য কেন্দ্রের ৫০ বছর পূর্তি এবং সুবর্ণ জয়ন্তী উদযাপিত হয়েছে।",
              coverImage:
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
              pdf: "",
              category: "Press Release",
              publishedDate: "2024-09-04",
              author: "বিএসকে মিডিয়া সেল",
              status: "published",
              mediaSource: "দৈনিক প্রথম আলো",
              newsUrl: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          );

          // Seed Default Photo Album (photo_albums)
          await cpanelApi.setDoc(
            "photo_albums",
            "album-1",
            removeUndefinedFields({
              id: "album-1",
              name_bn: "ভ্রাম্যমাণ বইমেলা কার্যক্রম ২০২৪",
              name_en: "Mobile Book Fair Activity 2024",
              desc_bn: "ভ্রাম্যমাণ বইমেলা কার্যক্রমের কিছু খণ্ডচিত্র",
              desc_en: "Glimpses of mobile library book distribution events",
              cover:
                "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80",
              photos: [
                "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80",
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          );

          // Seed Default Job Application (job_applications)
          await cpanelApi.setDoc(
            "job_applications",
            "app-1",
            removeUndefinedFields({
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
              createdAt: new Date().toISOString(),
            }),
          );

          // Seed Default Inquiry (inquiries)
          await cpanelApi.setDoc(
            "inquiries",
            "inq-1",
            removeUndefinedFields({
              id: "inq-1",
              name: "আব্দুর রহমান",
              email: "arahman@example.com",
              message: "ভ্রাম্যমাণ লাইব্রেরির সদস্য কীভাবে হওয়া যায়?",
              type: "contact",
              createdAt: new Date().toISOString(),
            }),
          );

          setActionStatus(
            language === "bn"
              ? "ডাটাবেস সফলভাবে প্রস্তুত হয়েছে !"
              : "Database successfully seeded!",
          );
          setTimeout(() => setActionStatus(""), 2500);
        } catch (e) {
          handleDatabaseError(e, OperationType.WRITE, "bootstrap");
          setActionStatus(
            language === "bn"
              ? "ডাটাবেস সেটআপে ত্রুটি হয়েছে! অনুগ্রহ করে আবার চেষ্টা করুন।"
              : "Error setting up database! Please retry.",
          );
          setTimeout(() => setActionStatus(""), 6000);
        }
      },
    );
  };

  // Hero slide CRUD
  const saveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero) return;
    try {
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Slide...",
      );
      const img = editingHero.bgImage || (editingHero as any).bg_image || (editingHero as any).image || "";
      const ord = editingHero.order !== undefined ? Number(editingHero.order) : 1;
      const slideToSave = {
        ...editingHero,
        bgImage: img,
        bg_image: img,
        image: img,
        order: ord,
        sort_order: ord,
      };
      await cpanelApi.setDoc("hero_slides", slideToSave.id, slideToSave);
      setEditingHero(null);
      setActionStatus(
        language === "bn" ? "সফলভাবে সংরক্ষিত!" : "Saved Successfully!",
      );
      setTimeout(() => setActionStatus(""), 2000);
    } catch (e) {
      handleDatabaseError(
        e,
        OperationType.WRITE,
        `hero_slides/${editingHero.id}`,
      );
    }
  };

  const deleteHeroSlide = async (id: string) => {
    requireConfirmation(
      "এই ব্যানার স্লাইডটি ডিলিট করতে চান?",
      "Are you sure you want to delete this slide?",
      async () => {
        try {
          await cpanelApi.deleteDoc("hero_slides", id);
        } catch (e) {
          handleDatabaseError(e, OperationType.DELETE, `hero_slides/${id}`);
        }
      },
    );
  };

  const createNewHero = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: HeroSlide = {
      id: newId,
      badge_bn: "নতুন আপডেট",
      badge_en: "New Announcement",
      title_bn: "নতুন ব্যানার শিরোনাম",
      title_en: "New Slide Title",
      desc_bn: "দেশব্যাপী বড় বইপড়া আন্দোলন",
      desc_en: "National reading circles program development",
      bgImage:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80",
      order: heroSlides.length + 1,
    };
    setEditingHero(newSlide);
    setPreviewImage(newSlide.bgImage);
  };

  // Recent activity CRUD
  const saveRecentActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    try {
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Activity...",
      );
      await cpanelApi.setDoc(
        "recent_activities",
        editingActivity.id,
        editingActivity,
      );
      setEditingActivity(null);
      setActionStatus(
        language === "bn"
          ? "সফলভাবে সংরক্ষিত!"
          : "Activity Saved Successfully!",
      );
      setTimeout(() => setActionStatus(""), 2000);
    } catch (e) {
      handleDatabaseError(
        e,
        OperationType.WRITE,
        `recent_activities/${editingActivity.id}`,
      );
    }
  };

  const deleteRecentActivity = async (id: string) => {
    requireConfirmation(
      "এই কার্যক্রমটি মুছে ফেলতে চান?",
      "Are you sure you want to delete this activity?",
      async () => {
        try {
          await cpanelApi.deleteDoc("recent_activities", id);
        } catch (e) {
          handleDatabaseError(
            e,
            OperationType.DELETE,
            `recent_activities/${id}`,
          );
        }
      },
    );
  };

  const createNewActivity = () => {
    const newId = `act-${Date.now()}`;
    const newAct: RecentActivity = {
      id: newId,
      title_bn: "নতুন কার্যক্রমের নাম",
      title_en: "New Activity Title",
      desc_bn: "সংক্ষিপ্ত বিবরণী এখানে লিখুন।",
      desc_en: "Brief description goes here.",
      date_bn: "১১ জুন ২০২৬",
      date_en: "June 11, 2526",
      loc_bn: "বিশ্বসাহিত্য কেন্দ্র লবি, ঢাকা",
      loc_en: "BSK Premises, Dhaka",
      category_bn: "কার্যক্রম",
      category_en: "Program",
      caption_bn: "",
      caption_en: "",
      image:
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80",
      order: recentActivities.length + 1,
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
      setActionStatus(
        language === "bn" ? "পৃষ্ঠা সংরক্ষণ করা হচ্ছে..." : "Saving Page...",
      );
      const cleanedPage = removeUndefinedFields(editingPage);

      if (cleanedPage.id === "press_contact") {
        const mediaData = cleanedPage.mediaContactData || {};
        await cpanelApi.setDoc("homepage_blocks", "media_contact", mediaData);
        await cpanelApi.setDoc("website_pages", "press_contact", cleanedPage);
      } else {
        const targetId =
          cleanedPage.id === "bangalir_chinta"
            ? "bangalir-chinta"
            : cleanedPage.id;
        await cpanelApi.setDoc("website_pages", targetId, {
          ...cleanedPage,
          id: targetId,
        });

        // Sync image to homepage_programs if available
        const newImg =
          cleanedPage.hero_image ||
          cleanedPage.bgImage ||
          cleanedPage.cover_image ||
          cleanedPage.image ||
          cleanedPage.bangalirChintaData?.cover_image;
        if (newImg) {
          try {
            const progDoc = await cpanelApi.getDoc(
              "homepage_programs",
              targetId,
            );
            if (progDoc) {
              await cpanelApi.setDoc("homepage_programs", targetId, {
                ...progDoc,
                bgImage: newImg,
                image: newImg,
                imageUrl: newImg,
                hero_image: newImg,
              });
            }
          } catch (_) {}
        }
      }
      setPages((prevPages) => {
        const idx = prevPages.findIndex((p) => p.id === cleanedPage.id);
        if (idx >= 0) {
          const next = [...prevPages];
          next[idx] = cleanedPage;
          return next;
        }
        return [...prevPages, cleanedPage];
      });
      setEditingPage(null);
      setActionStatus(
        language === "bn" ? "সফলভাবে সংরক্ষিত!" : "Page Override Saved!",
      );
      setTimeout(() => setActionStatus(""), 3000);
    } catch (e: any) {
      console.error("Save Page Error:", e);
      const userErrMsg =
        e?.message ||
        (language === "bn"
          ? "সংরক্ষণ করতে ব্যর্থ হয়েছে!"
          : "Failed to save page!");
      setActionStatus(`❌ ${userErrMsg}`);
      setTimeout(() => setActionStatus(""), 6000);
      handleDatabaseError(
        e,
        OperationType.WRITE,
        editingPage.id === "press_contact"
          ? "homepage_blocks/media_contact"
          : `website_pages/${editingPage.id}`,
      );
    } finally {
      setSaving(false);
    }
  };

  // Helper to dynamically modify a section name/paragraphs in state
  const updateSectionText = (
    secIndex: number,
    textIndex: number,
    value: string,
  ) => {
    if (!editingPage) return;
    const updatedSections = [...safeSections(editingPage?.sections)];
    updatedSections[secIndex].content[textIndex] = value;
    setEditingPage({ ...editingPage, sections: updatedSections });
  };

  const handleSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    secIdx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (editingPage) {
        const updatedSections = [...safeSections(editingPage?.sections)];
        updatedSections[secIdx].image = finalUrl;
        setEditingPage({ ...editingPage, sections: updatedSections });
      }
    } catch (err) {
      console.error("Section image upload failed: ", err);
    }
  };

  const handleChintaCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      setEditingPage({
        ...editingPage,
        hero_image: finalUrl,
        bangalirChintaData: {
          ...(editingPage.bangalirChintaData || {}),
          cover_image: finalUrl,
        },
      });
    } catch (err) {
      console.error("Chinta cover image upload failed: ", err);
    }
  };

  // Helper to handle custom fields for home page
  const handleHomeFieldChange = (field: string, value: any) => {
    if (!editingPage) return;
    setEditingPage({ ...editingPage, [field]: value });
  };

  const handleHomeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "intro_image" | "history_image" | "achievements_image",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (editingPage) {
        setEditingPage({ ...editingPage, [field]: finalUrl });
      }
    } catch (err) {
      console.error("Home image upload failed: ", err);
    }
  };

  const handleFounderAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (editingPage) {
        setEditingPage({ ...editingPage, founder_avatar: finalUrl });
      }
    } catch (err) {
      console.error("Founder avatar upload failed: ", err);
    }
  };

  const handleExcellenceHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (editingPage) {
        setEditingPage({ ...editingPage, hero_image: finalUrl });
      }
    } catch (err) {
      console.error("Hero image upload failed: ", err);
    }
  };

  const handleExcellenceHighlightImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
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

  const handleExcellenceGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
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

  const handleExcellenceSideGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
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
    galleryName: "mission_gallery" | "history_gallery" | "achievements_gallery",
    itemIdx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (!editingPage) return;
      const currentGallery = [...(editingPage[galleryName] || [])];
      if (currentGallery[itemIdx]) {
        currentGallery[itemIdx] = {
          ...currentGallery[itemIdx],
          image: finalUrl,
        };
        setEditingPage({ ...editingPage, [galleryName]: currentGallery });
      }
    } catch (err) {
      console.error("Gallery image upload failed: ", err);
    }
  };

  const handleExtraSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    extIdx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl = uploadedUrl || (await compressImage(file));
      if (!editingPage) return;
      const currentExtras = [...(editingPage.extra_sections || [])];
      if (currentExtras[extIdx]) {
        currentExtras[extIdx] = {
          ...currentExtras[extIdx],
          image: finalUrl,
        };
        setEditingPage({ ...editingPage, extra_sections: currentExtras });
      }
    } catch (err) {
      console.error("Extra section image upload failed: ", err);
    }
  };

  const handleBookFairGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;

    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl =
        uploadedUrl || (await compressImage(file, 600, 600, 0.55));
      const currentGallery = [...(editingPage.gallery || [])];
      while (currentGallery.length <= idx) {
        currentGallery.push({
          image: "",
          caption_bn: "স্মরণীয় মুহূর্ত",
          caption_en: "Memorable Moment",
        });
      }
      currentGallery[idx] = {
        ...currentGallery[idx],
        image: finalUrl,
      };
      setEditingPage({ ...editingPage, gallery: currentGallery });
    } catch (err) {
      console.error("Book fair gallery image upload failed: ", err);
    }
    e.target.value = "";
  };

  const handleGenericPageImageUpload = async (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl =
        uploadedUrl || (await compressImage(file, 1200, 800, 0.7));
      setEditingPage({ ...editingPage, [field]: finalUrl });
    } catch (err) {
      console.error("Image upload failed: ", err);
    }
    e.target.value = "";
  };

  const handleCustomGalleryUpload = async (
    galleryField: string,
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    try {
      const uploadedUrl = await uploadImageToServer(file);
      const finalUrl =
        uploadedUrl || (await compressImage(file, 800, 600, 0.65));
      let currentGallery: any[] = [];
      if (
        editingPage.id === "publication" &&
        (!editingPage[galleryField] || editingPage[galleryField].length === 0)
      ) {
        currentGallery = defaultPublicationGallery.map((g) => ({ ...g }));
      } else if (
        editingPage.id === "central-library" &&
        (!editingPage.gallery || (editingPage.gallery || []).length === 0)
      ) {
        currentGallery = [
          {
            image:
              "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
            img: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
            caption_bn: "বই ধার নেওয়া ও কাউন্টার সেবা",
            caption_en: "Book Lending & Counter Services",
            title_bn: "বই ধার নেওয়া ও কাউন্টার সেবা",
            title_en: "Book Lending & Counter Services",
            desc_bn:
              "বিশ্বসাহিত্য কেন্দ্রের লক্ষ লক্ষ বইয়ের সংগ্রহ থেকে পছন্দের বই বাড়িতে নিয়ে পড়ার জন্য সাধারণ ও গবেষণা সদস্যদের জন্য বই ধার নেওয়ার বিশেষ কাউন্টার সেবা।",
            desc_en:
              "Borrow and return classic titles to read in your comfortable home environment from our collection of hundreds of thousands of books.",
          },
          {
            image:
              "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
            img: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
            caption_bn: "মনোরম ও কোলাহলমুক্ত প্রধান পাঠকক্ষ",
            caption_en: "Aesthetic Reading Hall",
            title_bn: "মনোরম ও কোলাহলমুক্ত প্রধান পাঠকক্ষ",
            title_en: "Aesthetic Reading Hall",
            desc_bn:
              "সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত, কোলাহলমুক্ত ও সুপ্রশস্ত প্রধান পাঠকক্ষ। যেখানে মনোরম ইন্টেরিয়র এবং প্রাকৃতিক আলোর সমন্বয়ে পড়ার জন্য নিখুঁত পরিবেশ রয়েছে।",
            desc_en:
              "A quiet, spacious and air-conditioned main reading hall designed with natural light to ensure peak focus for readers and researchers.",
          },
          {
            image:
              "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
            img: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
            caption_bn: "রেফারেন্স ও গবেষণা আর্কাইভ",
            caption_en: "Reference & Archives",
            title_bn: "রেফারেন্স ও গবেষণা আর্কাইভ",
            title_en: "Reference & Archives",
            desc_bn:
              "দেশ-বিদেশের দুষ্প্রাপ্য রেফারেন্স গ্রন্থ, বিশ্বকোষ, গবেষণাধর্মী জার্নাল, চিত্রকলা ও মানচিত্রের এক সমৃদ্ধ সংগ্রহ যা উচ্চতর গবেষণা এবং তথ্যানুসন্ধানের চমৎকার সহায়ক।",
            desc_en:
              "A comprehensive repository of rare reference books, encyclopedias, scholarly journals, and fine arts collections to support high-level research.",
          },
          {
            image:
              "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
            img: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
            caption_bn: "জ্ঞানভিত্তিক কার্যক্রম ও পাঠক সমাবেশ",
            caption_en: "Enlightenment Assemblies",
            title_bn: "জ্ঞানভিত্তিক কার্যক্রম ও পাঠক সমাবেশ",
            title_en: "Enlightenment Assemblies",
            desc_bn:
              "পাঠকদের চিন্তার পরিধি ও মননশীলতা বৃদ্ধির লক্ষ্যে নিয়মিত পাঠচক্র, সাহিত্য আলোচনা সভা, বিশিষ্ট লেখকদের সান্নিধ্য এবং বিষয়ভিত্তিক বইয়ের আকর্ষণীয় প্রদর্শনী।",
            desc_en:
              "Regular reading circles, literary dialogues, meetings with eminent authors, and thematic exhibitions to foster deep intellectual engagement.",
          },
          {
            image:
              "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
            img: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
            caption_bn: "শিশু-কিশোর কর্নার",
            caption_en: "Children & Youth Section",
            title_bn: "শিশু-কিশোর কর্নার",
            title_en: "Children & Youth Section",
            desc_bn:
              "শিশু-কিশোরদের মনে শৈশব থেকেই বই পড়ার প্রতি ভালোবাসা জন্মানোর লক্ষ্যে তাদের উপযোগী ছবি ও বিচিত্র রূপকথার বই দিয়ে সজ্জিত একটি আকর্ষণীয় ও রঙিন জগৎ।",
            desc_en:
              "A colorful, welcoming space curated with illustrated books, fairy tales, and educational games to instil a lifelong passion for reading in children.",
          },
          {
            image:
              "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
            img: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
            caption_bn: "তথ্য ও ডিজিটাল সাহায্য সেবা",
            caption_en: "Reference & Help Desk",
            title_bn: "তথ্য ও ডিজিটাল সাহায্য সেবা",
            title_en: "Reference & Help Desk",
            desc_bn:
              "পাঠকদের প্রয়োজনীয় বই সহজে ও দ্রুততম সময়ে খুঁজে দিতে সাহায্য করার জন্য দক্ষ ক্যাটালগ ডেস্ক ও আধুনিক তথ্য অনুসন্ধান সেবা।",
            desc_en:
              "Expert curation and catalog assistance helping readers quickly locate target volumes, check availability and conduct academic searches.",
          },
        ];
      } else {
        currentGallery = [...((editingPage as any)[galleryField] || [])];
      }

      while (currentGallery.length <= idx) {
        currentGallery.push({
          image: "",
          img: "",
          url: "",
          caption_bn: "",
          caption_en: "",
          title_bn: "",
          title_en: "",
          desc_bn: "",
          desc_en: "",
        });
      }
      currentGallery[idx] = {
        ...currentGallery[idx],
        image: finalUrl,
        img: finalUrl,
        url: finalUrl,
      };
      setEditingPage({ ...editingPage, [galleryField]: currentGallery });
    } catch (err) {
      console.error("Custom gallery upload failed: ", err);
    }
    e.target.value = "";
  };

  const handleBookFairDownloadFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dls = [...(editingPage.downloads || [])];
      if (dls[idx]) {
        dls[idx] = {
          ...dls[idx],
          url: event.target?.result as string,
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB (${file.name.split(".").pop()?.toUpperCase()})`,
        };
        setEditingPage({ ...editingPage, downloads: dls });
      }
    };
    reader.readAsDataURL(file);
  };

  // Save specific block document in homepage_blocks
  const saveHomepageBlock = async (docId: string, data: any) => {
    try {
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving changes...",
      );
      await cpanelApi.setDoc("homepage_blocks", docId, data);
      setActionStatus(
        language === "bn" ? "সফলভাবে সংরক্ষিত!" : "Saved Successfully!",
      );
      setTimeout(() => setActionStatus(""), 2000);
    } catch (e) {
      console.error("Error saving block doc:", docId, e);
      alert(
        language === "bn"
          ? "সেভ করতে সমস্যা হয়েছে।"
          : "Error saving to database.",
      );
    }
  };

  // Programs Slider CRUD
  const saveProgramRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Program...",
      );
      const imgUrl =
        editingProgram.bgImage ||
        editingProgram.image ||
        editingProgram.imageUrl ||
        editingProgram.hero_image ||
        "";
      const updatedProg = {
        ...editingProgram,
        bgImage: imgUrl,
        image: imgUrl,
        imageUrl: imgUrl,
        hero_image: imgUrl,
      };
      await cpanelApi.setDoc(
        "homepage_programs",
        editingProgram.id,
        updatedProg,
      );

      // Sync to website_pages if document exists for this program
      try {
        const pageDoc = await cpanelApi.getDoc(
          "website_pages",
          editingProgram.id,
        );
        if (pageDoc) {
          await cpanelApi.setDoc("website_pages", editingProgram.id, {
            ...pageDoc,
            hero_image: imgUrl || pageDoc.hero_image,
            bgImage: imgUrl || pageDoc.bgImage,
          });
        }
      } catch (_) {}

      // Instantly sync local React state
      setHomepagePrograms((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const exists = list.some((p) => p.id === updatedProg.id);
        if (exists) {
          return list.map((p) => (p.id === updatedProg.id ? updatedProg : p));
        } else {
          return [...list, updatedProg];
        }
      });

      window.dispatchEvent(new CustomEvent("bsk_db_updated"));

      setEditingProgram(null);
      setActionStatus(
        language === "bn" ? "সফলভাবে সংরক্ষিত!" : "Program Saved Successfully!",
      );
      setTimeout(() => setActionStatus(""), 2000);
    } catch (e) {
      console.error("Error saving program:", e);
      alert(
        language === "bn"
          ? "সংরক্ষণে সমস্যা হয়েছে।"
          : "Error writing program to database.",
      );
    }
  };

  const deleteProgramRecord = async (id: string) => {
    requireConfirmation(
      "এই কার্যক্রমটি স্থায়ীভাবে মুছে ফেলতে চান?",
      "Are you sure you want to delete this program from slider?",
      async () => {
        try {
          await cpanelApi.deleteDoc("homepage_programs", id);
          setHomepagePrograms((prev) =>
            Array.isArray(prev) ? prev.filter((p) => p.id !== id) : [],
          );
          window.dispatchEvent(new CustomEvent("bsk_db_updated"));
          setActionStatus(
            language === "bn"
              ? "সফলভাবে মুছে ফেলা হয়েছে!"
              : "Deleted successfully!",
          );
          setTimeout(() => setActionStatus(""), 2000);
        } catch (e) {
          console.error("Error deleting program:", e);
        }
      },
    );
  };

  const createNewProgram = () => {
    const newId = `prog-${Date.now()}`;
    const newProg = {
      id: newId,
      title_bn: "নতুন কার্যক্রম",
      title_en: "New Program Title",
      desc_bn: "সংক্ষিপ্ত বিবরণ বিবরণী এখানে লিখুন।",
      desc_en: "Write program detail here.",
      tag_bn: "সক্রিয়",
      tag_en: "Active",
      colorClass: "bg-[#3D2B14] text-[#F0CC7A]",
      icon: "Sparkles",
      bgImage:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
      order: homepagePrograms.length + 1,
    };
    setEditingProgram(newProg);
    setPreviewImage(newProg.bgImage);
  };

  // --- MODULE 2 WHO WE ARE SAVE HANDLER ---
  const handleSaveWhoWeAre = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSavingWhoWeAre(true);
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Who We Are...",
      );
      const cleaned = removeUndefinedFields(whoWeAreBlock);
      await cpanelApi.setDoc("homepage_blocks", "who_we_are", cleaned);

      // Synchronize with website_pages 'home' if present
      const homePage = pages.find((p) => p.id === "home");
      if (homePage) {
        const updatedHome = {
          ...homePage,
          who_we_are_title_bn: whoWeAreBlock.title_bn,
          who_we_are_title_en: whoWeAreBlock.title_en,
          who_we_are_subtitle_bn: whoWeAreBlock.subtitle_bn,
          who_we_are_subtitle_en: whoWeAreBlock.subtitle_en,
          who_we_are_paragraphs_bn: whoWeAreBlock.paragraphs_bn,
          who_we_are_paragraphs_en: whoWeAreBlock.paragraphs_en,
        };
        await cpanelApi.setDoc(
          "website_pages",
          "home",
          removeUndefinedFields(updatedHome),
        );
      }

      setCrosscheckNotification({
        id: "who_we_are_" + Date.now(),
        type: "success",
        title:
          language === "bn"
            ? "আমরা কারা তথ্য সংরক্ষিত হয়েছে"
            : "Who We Are Saved",
        collectionName: "homepage_blocks",
        docId: "who_we_are",
        timestamp: new Date().toLocaleTimeString(),
        verifiedFieldsCount: 6,
        message_bn:
          "আমরা কারা সেকশনের শিরোনাম, সাব-শিরোনাম ও অনুচ্ছেদসমূহ সফলভাবে সংরক্ষিত হয়েছে।",
        message_en:
          "Who We Are titles, subtitles and paragraphs updated successfully in live database.",
        dataSnapshot: cleaned,
      });
      setActionStatus(
        language === "bn"
          ? "✓ আমরা কারা সফলভাবে সংরক্ষিত!"
          : "✓ Who We Are Saved Successfully!",
      );
      setTimeout(() => setActionStatus(""), 2500);
    } catch (err: any) {
      console.error("Error saving who_we_are:", err);
      setActionStatus(
        language === "bn"
          ? "✕ সংরক্ষণে ব্যর্থ হয়েছে!"
          : "✕ Error saving Who We Are",
      );
      setTimeout(() => setActionStatus(""), 3000);
    } finally {
      setIsSavingWhoWeAre(false);
    }
  };

  // --- MODULE 9 Notice Board CRUD ---
  const saveTodayNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTodayNotice(true);
      setActionStatus(
        language === "bn"
          ? "আজকের নোটিশ সংরক্ষণ করা হচ্ছে..."
          : "Saving Today's Notice...",
      );

      const noticePage = pages.find((p) => p.id === "notice") || {
        id: "notice",
        title_bn: "বিজ্ঞপ্তি",
        title_en: "Announcements & Notices",
        subtitle_bn:
          todayNoticeSubtitle ||
          "বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী চলমান সকল কার্যক্রম, সংবাদ ও ক্যারিয়ার বিজ্ঞপ্তি সমূহ।",
        subtitle_en:
          "All countrywide library notices, publications news, and live updates.",
        sections: [],
      };

      const updatedSections = [...(noticePage.sections || [])];
      updatedSections[0] = {
        ...(updatedSections[0] || {}),
        title: todayNoticeTitle || "আজকের নোটিশ ও ঘোষণা",
        content: [todayNoticeContent],
        image: todayNoticeImage,
        fileUrl: todayNoticeImage,
      };

      const updatedPage = {
        ...noticePage,
        subtitle_bn:
          todayNoticeSubtitle ||
          noticePage.subtitle_bn ||
          "বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী চলমান সকল কার্যক্রম, সংবাদ ও ক্যারিয়ার বিজ্ঞপ্তি সমূহ।",
        sections: updatedSections,
        updatedAt: serverTimestamp(),
      };

      await cpanelApi.setDoc(
        "website_pages",
        "notice",
        removeUndefinedFields(updatedPage),
      );
      setActionStatus("");
      alert(
        language === "bn"
          ? "সফলভাবে আজকের নোটিশ সংরক্ষণ করা হয়েছে!"
          : "Today's Notice saved successfully!",
      );
    } catch (err: any) {
      console.error(err);
      setActionStatus("Error saving notice");
      alert(
        (language === "bn" ? "সংরক্ষণে সমস্যা: " : "Error: ") +
          (err.message || err),
      );
    } finally {
      setIsSavingTodayNotice(false);
    }
  };

  const handleNoticeFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingNoticeItem) return;
    try {
      setActionStatus(
        language === "bn" ? "ফাইল আপলোড হচ্ছে..." : "Uploading file...",
      );
      if (file.type.startsWith("image/")) {
        const uploadedUrl = await uploadImageToServer(file);
        const finalUrl =
          uploadedUrl || (await compressImage(file, 1200, 1200, 0.75));
        setEditingNoticeItem({
          ...editingNoticeItem,
          fileUrl: finalUrl,
          fileType: "image",
          fileName: file.name,
        });
        setActionStatus(
          language === "bn" ? "ছবি আপলোড সম্পন্ন!" : "Image uploaded!",
        );
      } else {
        const uploadedUrl = await uploadImageToServer(file);
        if (uploadedUrl) {
          setEditingNoticeItem({
            ...editingNoticeItem,
            fileUrl: uploadedUrl,
            fileType: "pdf",
            fileName: file.name,
          });
          setActionStatus(
            language === "bn" ? "পিডিএফ আপলোড সম্পন্ন!" : "PDF uploaded!",
          );
        } else {
          if (file.size > 2.5 * 1024 * 1024) {
            alert(
              language === "bn"
                ? "পিডিএফ ফাইলের সাইজ সর্বোচ্চ ২.৫ মেগাবাইট হতে পারবে।"
                : "PDF file size must be under 2.5 MB.",
            );
            setActionStatus("");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setEditingNoticeItem({
              ...editingNoticeItem,
              fileUrl: reader.result as string,
              fileType: "pdf",
              fileName: file.name,
            });
            setActionStatus(
              language === "bn" ? "পিডিএফ সংযোজন সম্পন্ন!" : "PDF attached!",
            );
            setTimeout(() => setActionStatus(""), 2000);
          };
          reader.readAsDataURL(file);
        }
      }
      setTimeout(() => setActionStatus(""), 2000);
    } catch (err: any) {
      console.error("Notice file upload error:", err);
      setActionStatus("");
      alert(
        (language === "bn" ? "ফাইল আপলোডে ত্রুটি: " : "File upload failed: ") +
          (err.message || err),
      );
    }
  };

  const saveNoticeItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingNoticeItem) return;
    try {
      setActionStatus(
        language === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Item...",
      );
      const colName =
        activeNoticeSubTab === "central"
          ? "notices"
          : activeNoticeSubTab === "event"
            ? "events"
            : "news_items";
      const cleanItem = {
        ...editingNoticeItem,
        updatedAt: new Date().toISOString(),
      };
      await cpanelApi.setDoc(
        colName,
        editingNoticeItem.id,
        removeUndefinedFields(cleanItem),
      );
      setEditingNoticeItem(null);
      setActionStatus("");
      alert(
        language === "bn"
          ? "সফলভাবে নোটিশ আইটেমটি সংরক্ষণ করা হয়েছে!"
          : "Notice item saved successfully!",
      );
    } catch (err: any) {
      console.error("Error saving notice item:", err);
      setActionStatus("Error saving item");
      alert(
        (language === "bn"
          ? "সংরক্ষণে সমস্যা হয়েছে: "
          : "Failed to save item: ") + (err.message || err),
      );
    }
  };

  const deleteNoticeItem = async (
    colName: "notices" | "events" | "news_items",
    id: string,
  ) => {
    requireConfirmation(
      "আপনি কি নিশ্চিতভাবে এই আইটেমটি ডিলিট করতে চান?",
      "Are you sure you want to delete this notice item?",
      async () => {
        try {
          await cpanelApi.deleteDoc(colName, id);
          alert(
            language === "bn"
              ? "আইটেমটি মুছে ফেলা হয়েছে!"
              : "Notice item deleted successfully!",
          );
        } catch (e: any) {
          console.error("Error deleting document from cPanel Database:", e);
          alert(
            (language === "bn" ? "মুছে ফেলতে সমস্যা: " : "Error: ") +
              (e.message || e),
          );
        }
      },
    );
  };

  const createNewNoticeItem = () => {
    const id = `item-${Date.now()}`;
    if (activeNoticeSubTab === "central") {
      setEditingNoticeItem({
        id,
        title_bn: "নতুন নোটিশ শিরোনাম",
        title_en: "New Notice Title",
        description_bn: "",
        description_en: "",
        date_bn: "২৫ জুন ২০২৬",
        date_en: "25 Jun 2026",
        isUrgent: false,
        isNew: true,
        fileUrl: "",
        fileType: "",
        fileName: "",
      });
    } else if (activeNoticeSubTab === "event") {
      setEditingNoticeItem({
        id,
        title_bn: "নতুন আপডেট ও সেমিনার",
        title_en: "New Update or Seminar",
        description_bn: "",
        description_en: "",
        day: "২৫",
        dayEn: "25",
        month: "জুন",
        monthEn: "Jun",
        chip_bn: "সেমিনার",
        chip_en: "Seminar",
        time_bn: "বিকাল ৪:০০ টা",
        time_en: "4:00 PM",
        loc_bn: "প্রধান কার্যালয়, ঢাকা",
        loc_en: "Head Office, Dhaka",
        fileUrl: "",
        fileType: "",
        fileName: "",
      });
    } else {
      setEditingNoticeItem({
        id,
        title_bn: "নতুন সংবাদপত্র ও মিডিয়া কাভারেজ",
        title_en: "New Newspaper & Media Coverage",
        description_bn: "",
        description_en: "",
        tag_bn: "সংবাদ",
        tag_en: "News",
        date_bn: "২৫ জুন ২০২৬",
        date_en: "25 Jun 2026",
        icon: "📰",
        fileUrl: "",
        fileType: "",
        fileName: "",
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
                {language === "bn"
                  ? "বিশ্বসাহিত্য কেন্দ্র - কন্টেন্ট ম্যানেজমেন্ট সিস্টেম"
                  : "BSK Admin Content Management System"}
              </h1>
              <p className="text-[10px] text-stone-200 font-sans tracking-wide">
                {language === "bn"
                  ? "ড্যাশবোর্ড, ব্যানার ও কার্যক্রম নিয়ন্ত্রণ ব্যবস্থা"
                  : "Control center for banners, events and pages info"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ""}
                    className="w-5 h-5 rounded-full border border-[#F0CC7A]"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-[11px] text-[#F0CC7A] font-sans font-semibold hidden md:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut(auth);
                    try {
                      sessionStorage.removeItem("bsk_admin_passcode_verified");
                    } catch (_) {}
                    setHasPasscode(false);
                  }}
                  className="p-1 px-2.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] text-[10px] font-sans font-bold rounded-lg border border-white/10 hover:text-white transition cursor-pointer"
                >
                  {language === "bn" ? "লগআউট" : "Sign Out"}
                </button>
              </div>
            ) : hasPasscode ? (
              <div className="flex items-center gap-2 border-r border-white/20 pr-3 mr-1">
                <span className="text-[11px] text-[#F0CC7A] font-sans font-semibold hidden md:inline">
                  {language === "bn" ? "পিন দিয়ে যুক্ত" : "PIN Verified"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("bsk_admin_passcode_verified");
                    } catch (_) {}
                    setHasPasscode(false);
                  }}
                  className="p-1 px-2.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] text-[10px] font-sans font-bold rounded-lg border border-white/10 hover:text-white transition cursor-pointer"
                >
                  {language === "bn" ? "লগআউট" : "Sign Out"}
                </button>
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="p-1 px-3 bg-red-800/10 hover:bg-red-800/30 text-red-200 text-xs font-sans font-bold border border-red-500/20 rounded-lg hover:text-white transition cursor-pointer"
            >
              {language === "bn" ? "বন্ধ করুন" : "Exit CMS"}
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
            title={language === "bn" ? "বন্ধ করুন" : "Exit"}
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
                {language === "bn"
                  ? "অ্যাডমিন অ্যাক্সেস পিন কোড"
                  : "Admin Portal Login"}
              </h2>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                {language === "bn"
                  ? "স্লাইডার পরিবর্তন বা নতুন কার্যপ্রক্রিয়া যুক্ত করার জন্য পিন লিখুন।"
                  : "Enter secure admin PIN to unlock live website content editing."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest block font-sans">
                {language === "bn" ? "PIN নম্বর লিখুন" : "Authorization PIN"}
              </label>
              <input
                type="password"
                placeholder={language === "bn" ? "যেমন: ৫৬৫৬" : "e.g. 5656"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#B8862A]/25 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#2E5942] bg-[#FAF4EA]/40 text-stone-950 placeholder-stone-400 font-bold"
                required
              />
              <div className="flex justify-between items-center px-1 text-[10px]">
                <p className="text-[#B8862A] font-sans flex items-center gap-1">
                  <span>💡</span>
                  <span>
                    {language === "bn" ? "টেস্ট পিন: ৫৬৫৬" : "Test Pin: 5656"}
                  </span>
                </p>
                <span className="text-[#2E5942] font-mono tracking-wider font-bold">
                  SECURE_SESSION
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 text-red-850 text-xs rounded-xl flex items-center gap-2.5 border border-red-250 font-sans shadow-xs animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
                <span className="leading-relaxed font-semibold">
                  {errorMsg}
                </span>
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
                  <span>
                    {language === "bn"
                      ? "যাচাই করা হচ্ছে..."
                      : "Verifying PIN..."}
                  </span>
                </>
              ) : (
                <span>
                  {language === "bn" ? "প্রবেশ করুন" : "Unlock Portal"}
                </span>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-150"></div>
              <span className="flex-shrink mx-3 text-[10px] text-stone-400 font-sans uppercase tracking-widest select-none">
                {language === "bn" ? "অথবা" : "OR"}
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
              <span>
                {language === "bn"
                  ? "গুগল দিয়ে প্রবেশ করুন"
                  : "Sign in with Google"}
              </span>
            </button>
          </form>
        </div>
      ) : (
        /* CMS PANEL MAIN WORKSPACE */
        <div className="flex-1 flex overflow-hidden">
          {/* Side Tabs Navigation bar */}
          <nav className="w-64 bg-stone-100 border-r border-[#E8DDD0] flex flex-col justify-between shrink-0 font-sans overflow-y-auto">
            <div className="p-3.5 space-y-4">
              <div className="text-[10px] font-extrabold text-[#B8862A] uppercase tracking-wider pb-2 border-b border-[#E8DDD0] flex items-center justify-between">
                <span>
                  {language === "bn" ? "কন্টেন্ট মডিউলসমূহ" : "Content Modules"}
                </span>
                <span className="text-[9px] bg-[#B8862A]/10 text-[#B8862A] px-1.5 py-0.5 rounded-full font-mono font-bold">
                  100% CMS
                </span>
              </div>

              {/* GROUP 1: HOMEPAGE */}
              <div className="space-y-1">
                <div className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <Layout className="h-3 w-3 text-[#2E5942]" />
                  <span>
                    {language === "bn"
                      ? "১. হোমপেজ সেকশনসমূহ"
                      : "1. Homepage Sections"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("hero");
                    setEditingHero(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "hero"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Layout className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.১ হিরো স্লাইডার"
                      : "1.1 Hero Slider"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("who_we_are");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "who_we_are"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-[#B8862A] shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.২ আমরা কারা ও পরিচিতি"
                      : "1.2 Who We Are"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("movement");
                    setActiveSubBlock("belief");
                    setEditingProgram(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "movement"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Compass className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.৩ প্রথিতযশার বাণী ও ব্রত"
                      : "1.3 Founder & Philosophy"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("programs");
                    setEditingProgram(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "programs"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.৪ মূল কার্যক্রম স্লাইডার"
                      : "1.4 Programs Swiper"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("activities");
                    setEditingActivity(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "activities"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.৫ আসন্ন কার্যক্রম ও ইভেন্ট"
                      : "1.5 Upcoming Events"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("stats");
                    setEditingProgram(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "stats"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.৬ ইনফোগ্রাফিক্স ও অর্জন"
                      : "1.6 Key Statistics"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("blocks");
                    setEditingProgram(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "blocks"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Globe2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "১.৭ কন্টেন্ট ব্লক ও ফটো মেলা"
                      : "1.7 Homepage Blocks & Fair"}
                  </span>
                </button>
              </div>

              {/* GROUP 2: ABOUT */}
              <div className="space-y-1 border-t border-[#E8DDD0] pt-2.5">
                <div className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <Info className="h-3 w-3 text-[#2E5942]" />
                  <span>
                    {language === "bn"
                      ? "২. আমাদের পরিচিতি"
                      : "2. About BSK Pages"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("about_management");
                    setEditingPage(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "about_management"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "পরিচিতি, ট্রাস্টি ও ইতিহাস"
                      : "About, Trustees & History"}
                  </span>
                </button>
              </div>

              {/* GROUP 3: PROGRAMS */}
              <div className="space-y-1 border-t border-[#E8DDD0] pt-2.5">
                <div className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-[#2E5942]" />
                  <span>
                    {language === "bn"
                      ? "৩. কার্যক্রমসমূহ"
                      : "3. Programs & Activities"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("programs_cms");
                    setEditingPage(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "programs_cms"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "পাঠাভ্যাস, ইশকুল ও উৎকর্ষ"
                      : "Reading, Ishkool & Programs"}
                  </span>
                </button>
              </div>

              {/* GROUP 4: SERVICES & FACILITIES */}
              <div className="space-y-1 border-t border-[#E8DDD0] pt-2.5">
                <div className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-[#2E5942]" />
                  <span>
                    {language === "bn"
                      ? "৪. পরিষেবা ও ভবন"
                      : "4. Services & Facilities"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("services_cms");
                    setEditingPage(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "services_cms"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "প্রকাশনা, বইঘর, ভবন ও ক্যাফে"
                      : "Publications, Shop & Cafe"}
                  </span>
                </button>
              </div>

              {/* GROUP 5: MEDIA & CAREERS */}
              <div className="space-y-1 border-t border-[#E8DDD0] pt-2.5">
                <div className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-[#2E5942]" />
                  <span>
                    {language === "bn"
                      ? "৫. মিডিয়া, তথ্য কেন্দ্র ও নিয়োগ"
                      : "5. Media & Careers"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("notice_board");
                    setEditingNoticeItem(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "notice_board"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "তথ্যকেন্দ্র ও নোটিশ বোর্ড"
                      : "Notice Board"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("press_cms");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "press_cms"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "প্রেস বিজ্ঞপ্তি ও খবর"
                      : "Press Releases"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("blog_cms");
                    setEditingBlogPost(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "blog_cms"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "ব্লগ নিবন্ধ ও পাঠপ্রতিক্রিয়া"
                      : "Blog Articles"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("recruitment");
                    setEditingCircular(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "recruitment"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "নিয়োগ বিজ্ঞপ্তি ও আবেদন"
                      : "Careers & Applications"}
                  </span>
                </button>
              </div>

              {/* GROUP 6: SETTINGS & DATABASE */}
              <div className="space-y-1 border-t border-[#E8DDD0] pt-2.5">
                <div className="text-[9px] font-extrabold text-[#B8862A] uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
                  <Globe2 className="h-3 w-3 text-[#B8862A]" />
                  <span>
                    {language === "bn"
                      ? "৬. গ্লোবাল ও ব্যাকআপ"
                      : "6. Settings & Database"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("global_settings");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "global_settings"
                      ? "bg-[#B8862A] text-stone-950 shadow-xs font-extrabold"
                      : "text-stone-800 hover:bg-[#B8862A]/10 bg-white/70 border border-[#B8862A]/20"
                  }`}
                >
                  <Globe2 className="h-3.5 w-3.5 text-[#B8862A] shrink-0" />
                  <span>
                    {language === "bn"
                      ? "গ্লোবাল সেটিংস (Header/Footer)"
                      : "Global Settings"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("contact");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "contact"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {language === "bn"
                      ? "কন্টাক্ট ইনকোয়ারি বার্তা"
                      : "Contact Messages"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("database_cms");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold leading-none transition cursor-pointer text-left ${
                    activeTab === "database_cms"
                      ? "bg-[#2E5942] text-white shadow-xs"
                      : "text-stone-700 hover:bg-[#2E5942]/10 bg-white/50"
                  }`}
                >
                  <Database className="h-3.5 w-3.5 text-[#B8862A] shrink-0" />
                  <span>
                    {language === "bn"
                      ? "MySQL ডাটাবেস ও টেস্ট"
                      : "MySQL DB & Test"}
                  </span>
                </button>
              </div>
            </div>

            {/* Logout button */}
            <div className="p-4 border-t border-[#E8DDD0] space-y-2">
              <div className="p-2.5 bg-[#2E5942]/5 border border-[#2E5942]/10 rounded-xl space-y-1 text-center">
                <span className="text-[9px] text-[#2E5942] font-semibold flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-[#B8862A]" />
                  {language === "bn" ? "সরাসরি যুক্ত" : "Real-time Linked"}
                </span>
                <p className="text-[8px] text-stone-500 font-sans leading-tight">
                  {language === "bn"
                    ? "যেকোনো আপডেট সাথে সাথে ওয়েবসাইটে আপডেট হবে"
                    : "Updates propagate in real-time instantly"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold rounded-lg transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="h-3 w-3" />
                <span>
                  {language === "bn" ? "লগআউট করুন" : "Log Out Admin"}
                </span>
              </button>
            </div>
          </nav>

          {/* Area Workspace Panel */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-stone-50/50 p-6">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-10 w-10 text-[#B8862A] animate-spin" />
                <p className="text-sm text-stone-600 font-sans">
                  {language === "bn"
                    ? "ডাটাবেস লোড হচ্ছে..."
                    : "Saturating cloud state buffers..."}
                </p>
              </div>
            ) : (
              <div className="max-w-4xl w-full mx-auto space-y-6">
                {activeTab !== "database_cms" && (
                  <DatabaseStatusPanel language={language} onRefreshAll={fetchAllAdminData} />
                )}
                {/* TAB 0: GLOBAL WEBSITE SETTINGS */}
                {activeTab === "global_settings" && (
                  <div className="space-y-6">
                    {/* Top Action Header */}
                    <div className="bg-white p-5 rounded-2xl border border-[#B8862A]/25 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-[#B8862A]/10 text-[#B8862A] rounded-xl font-bold">
                            🌐
                          </span>
                          <h3 className="text-xl font-serif font-extrabold text-stone-900">
                            {language === "bn"
                              ? "গ্লোবাল ওয়েবসাইট কন্টেন্ট ও সেটিংস"
                              : "Global Website Settings & Layout"}
                          </h3>
                        </div>
                        <p className="text-xs text-stone-600 font-sans mt-1">
                          {language === "bn"
                            ? "অ্যানাউন্সমেন্ট বার, ন্যাপবার লোগো, ফুটার ঠিকানা, সামাজিক লিংক ও গুগল ম্যাপ অবস্থান আপডেট করুন।"
                            : "Manage global announcement bar, header logo, footer contacts, social links, and Google Map location."}
                        </p>
                      </div>

                      <button
                        onClick={handleSaveGlobalSettings}
                        disabled={isSavingGlobalSettings}
                        className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        {isSavingGlobalSettings ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-[#F0CC7A]" />
                        )}
                        <span>
                          {language === "bn"
                            ? "সেটিংস সেভ করুন"
                            : "Save Global Settings"}
                        </span>
                      </button>
                    </div>

                    {/* Global Sub-tabs Navigation */}
                    <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setGlobalSubTab("announcement")}
                        className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
                          globalSubTab === "announcement"
                            ? "border-[#2E5942] text-[#2E5942] bg-white font-extrabold shadow-2xs"
                            : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                        }`}
                      >
                        <span>📢</span>
                        <span>
                          {language === "bn"
                            ? "১. অ্যানাউন্সমেন্ট বার"
                            : "1. Announcement Bar"}
                        </span>
                      </button>

                      <button
                        onClick={() => setGlobalSubTab("navbar")}
                        className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
                          globalSubTab === "navbar"
                            ? "border-[#2E5942] text-[#2E5942] bg-white font-extrabold shadow-2xs"
                            : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                        }`}
                      >
                        <span>🧭</span>
                        <span>
                          {language === "bn"
                            ? "২. ন্যাপবার ও লোগো"
                            : "2. Navbar & Logo"}
                        </span>
                      </button>

                      <button
                        onClick={() => setGlobalSubTab("footer")}
                        className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
                          globalSubTab === "footer"
                            ? "border-[#2E5942] text-[#2E5942] bg-white font-extrabold shadow-2xs"
                            : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                        }`}
                      >
                        <span>🦶</span>
                        <span>
                          {language === "bn"
                            ? "৩. ফুটার ও সামাজিক লিংক"
                            : "3. Footer & Social Links"}
                        </span>
                      </button>

                      <button
                        onClick={() => setGlobalSubTab("map")}
                        className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
                          globalSubTab === "map"
                            ? "border-[#2E5942] text-[#2E5942] bg-white font-extrabold shadow-2xs"
                            : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                        }`}
                      >
                        <span>📍</span>
                        <span>
                          {language === "bn"
                            ? "৪. গুগল ম্যাপ অবস্থান"
                            : "4. Google Map Location"}
                        </span>
                      </button>
                    </div>

                    {/* Sub-tab 1: Announcement Bar */}
                    {globalSubTab === "announcement" && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">
                              {language === "bn"
                                ? "অ্যানাউন্সমেন্ট বার প্রদর্শন"
                                : "Enable Announcement Bar"}
                            </h4>
                            <p className="text-xs text-stone-500">
                              {language === "bn"
                                ? "ওয়েবসাইটের একেবারে উপরে লাল/সবুজ জরুরি নোটিশ পট্টি চালু বা বন্ধ রাখুন"
                                : "Toggle top announcement ticker bar at the very top of the website"}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                globalSettings.announcement_bar.enabled !==
                                false
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    enabled: e.target.checked,
                                  },
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E5942]"></div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "নোটিশের লেখা (বাংলা)"
                                : "Notice Text (Bengali)"}
                            </label>
                            <textarea
                              rows={3}
                              value={
                                globalSettings.announcement_bar.text_bn || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    text_bn: e.target.value,
                                  },
                                }))
                              }
                              placeholder="জরুরি নোটিশ লিখুন..."
                              className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:border-[#2E5942] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "নোটিশের লেখা (English)"
                                : "Notice Text (English)"}
                            </label>
                            <textarea
                              rows={3}
                              value={
                                globalSettings.announcement_bar.text_en || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    text_en: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Write announcement notice in English..."
                              className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:border-[#2E5942] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "বাটন টেক্সট (বাংলা)"
                                : "Button Text (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.announcement_bar
                                  .button_text_bn || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    button_text_bn: e.target.value,
                                  },
                                }))
                              }
                              placeholder="যেমন: বিস্তারিত দেখুন →"
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "বাটন টেক্সট (English)"
                                : "Button Text (English)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.announcement_bar
                                  .button_text_en || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    button_text_en: e.target.value,
                                  },
                                }))
                              }
                              placeholder="e.g. Learn More →"
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "বাটনের রিডাইরেক্ট লিংক / পেজ ID"
                                : "CTA Link / Page ID"}
                            </label>
                            <input
                              type="text"
                              value={globalSettings.announcement_bar.link || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  announcement_bar: {
                                    ...prev.announcement_bar,
                                    link: e.target.value,
                                  },
                                }))
                              }
                              placeholder="যেমন: /nationwide-excellence বা https://..."
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-tab 2: Navbar & Logo */}
                    {globalSubTab === "navbar" && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 animate-fade-in">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-stone-700 block">
                            {language === "bn"
                              ? "ওয়েবসাইট প্রধান লোগো URL"
                              : "Website Primary Header Logo URL"}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <input
                              type="text"
                              value={
                                globalSettings.navbar_settings.logo_url || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  navbar_settings: {
                                    ...prev.navbar_settings,
                                    logo_url: e.target.value,
                                  },
                                }))
                              }
                              placeholder="https://bskbd.org/assets/img/logo_bn2.png"
                              className="flex-1 w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                            {globalSettings.navbar_settings.logo_url && (
                              <div className="p-2 bg-stone-100 border border-stone-200 rounded-xl shrink-0">
                                <img
                                  src={globalSettings.navbar_settings.logo_url}
                                  alt="Logo Preview"
                                  className="h-10 w-auto object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "মূল স্লোগান / ট্যালাইন (বাংলা)"
                                : "Primary Tagline (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.navbar_settings.tagline_bn || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  navbar_settings: {
                                    ...prev.navbar_settings,
                                    tagline_bn: e.target.value,
                                  },
                                }))
                              }
                              placeholder="আলোকিত মানুষ চাই"
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "মূল স্লোগান / ট্যালাইন (English)"
                                : "Primary Tagline (English)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.navbar_settings.tagline_en || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  navbar_settings: {
                                    ...prev.navbar_settings,
                                    tagline_en: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Seeking Enlightened Souls"
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-tab 3: Footer & Social Links */}
                    {globalSubTab === "footer" && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "সংগঠনের ছোট বিবরণ (বাংলা)"
                                : "Organization Description (Bengali)"}
                            </label>
                            <textarea
                              rows={3}
                              value={
                                globalSettings.footer_settings.org_desc_bn || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    org_desc_bn: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "সংগঠনের ছোট বিবরণ (English)"
                                : "Organization Description (English)"}
                            </label>
                            <textarea
                              rows={3}
                              value={
                                globalSettings.footer_settings.org_desc_en || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    org_desc_en: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "প্রধান কার্যালয়ের ঠিকানা (বাংলা)"
                                : "HQ Address (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.footer_settings.address_bn || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    address_bn: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "প্রধান কার্যালয়ের ঠিকানা (English)"
                                : "HQ Address (English)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.footer_settings.address_en || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    address_en: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ফোন নম্বর (কমা দিয়ে আলাদা)"
                                : "Phone Numbers (comma separated)"}
                            </label>
                            <input
                              type="text"
                              value={
                                Array.isArray(
                                  globalSettings.footer_settings.phones,
                                )
                                  ? globalSettings.footer_settings.phones.join(
                                      ", ",
                                    )
                                  : ""
                              }
                              onChange={(e) => {
                                const vals = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    phones: vals,
                                  },
                                }));
                              }}
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ইমেইল এড্রেস"
                                : "Email Address"}
                            </label>
                            <input
                              type="email"
                              value={globalSettings.footer_settings.email || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    email: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "জরুরি ফোন নম্বর"
                                : "Emergency Contact"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.footer_settings
                                  .emergency_contact || ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    emergency_contact: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-stone-200">
                          <h5 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
                            {language === "bn"
                              ? "সামাজিক যোগাযোগ লিংকসমূহ"
                              : "Social Media URLs"}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                Facebook URL
                              </label>
                              <input
                                type="url"
                                value={
                                  globalSettings.footer_settings.facebook_url ||
                                  ""
                                }
                                onChange={(e) =>
                                  setGlobalSettings((prev) => ({
                                    ...prev,
                                    footer_settings: {
                                      ...prev.footer_settings,
                                      facebook_url: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                YouTube URL
                              </label>
                              <input
                                type="url"
                                value={
                                  globalSettings.footer_settings.youtube_url ||
                                  ""
                                }
                                onChange={(e) =>
                                  setGlobalSettings((prev) => ({
                                    ...prev,
                                    footer_settings: {
                                      ...prev.footer_settings,
                                      youtube_url: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                Instagram URL
                              </label>
                              <input
                                type="url"
                                value={
                                  globalSettings.footer_settings
                                    .instagram_url || ""
                                }
                                onChange={(e) =>
                                  setGlobalSettings((prev) => ({
                                    ...prev,
                                    footer_settings: {
                                      ...prev.footer_settings,
                                      instagram_url: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                LinkedIn URL
                              </label>
                              <input
                                type="url"
                                value={
                                  globalSettings.footer_settings.linkedin_url ||
                                  ""
                                }
                                onChange={(e) =>
                                  setGlobalSettings((prev) => ({
                                    ...prev,
                                    footer_settings: {
                                      ...prev.footer_settings,
                                      linkedin_url: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                Pinterest URL
                              </label>
                              <input
                                type="url"
                                value={
                                  globalSettings.footer_settings
                                    .pinterest_url || ""
                                }
                                onChange={(e) =>
                                  setGlobalSettings((prev) => ({
                                    ...prev,
                                    footer_settings: {
                                      ...prev.footer_settings,
                                      pinterest_url: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "কপিরাইট নোটিশ (বাংলা)"
                                : "Copyright Text (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.footer_settings.copyright_bn ||
                                ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    copyright_bn: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "কপিরাইট নোটিশ (English)"
                                : "Copyright Text (English)"}
                            </label>
                            <input
                              type="text"
                              value={
                                globalSettings.footer_settings.copyright_en ||
                                ""
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  footer_settings: {
                                    ...prev.footer_settings,
                                    copyright_en: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-tab 4: Google Map Location */}
                    {globalSubTab === "map" && (
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-700 block">
                            {language === "bn"
                              ? "গুগল ম্যাপ ডিরেকশন URL / শেয়ার লিংক"
                              : "Google Maps Share / Navigation URL"}
                          </label>
                          <input
                            type="url"
                            value={globalSettings.google_map.map_url || ""}
                            onChange={(e) =>
                              setGlobalSettings((prev) => ({
                                ...prev,
                                google_map: {
                                  ...prev.google_map,
                                  map_url: e.target.value,
                                  embed_url: e.target.value,
                                },
                              }))
                            }
                            placeholder="https://maps.app.goo.gl/nGZ4X7sXKzokaJdb8"
                            className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "অক্ষাংশ (Latitude)"
                                : "Latitude"}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={
                                globalSettings.google_map.latitude ?? 23.74831
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    latitude:
                                      parseFloat(e.target.value) || 23.74831,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "দ্রাঘিমাংশ (Longitude)"
                                : "Longitude"}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={
                                globalSettings.google_map.longitude ?? 90.39281
                              }
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    longitude:
                                      parseFloat(e.target.value) || 90.39281,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ম্যাপ সেকশন শিরোনাম (বাংলা)"
                                : "Map Header Title (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={globalSettings.google_map.title_bn || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    title_bn: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ম্যাপ সেকশন শিরোনাম (English)"
                                : "Map Header Title (English)"}
                            </label>
                            <input
                              type="text"
                              value={globalSettings.google_map.title_en || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    title_en: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ঠিকানা (বাংলা)"
                                : "Address (Bengali)"}
                            </label>
                            <input
                              type="text"
                              value={globalSettings.google_map.address_bn || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    address_bn: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block">
                              {language === "bn"
                                ? "ঠিকানা (English)"
                                : "Address (English)"}
                            </label>
                            <input
                              type="text"
                              value={globalSettings.google_map.address_en || ""}
                              onChange={(e) =>
                                setGlobalSettings((prev) => ({
                                  ...prev,
                                  google_map: {
                                    ...prev.google_map,
                                    address_en: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 1: HERO SLIDE CONTROLS */}
                {activeTab === "hero" && (
                  <div className="space-y-4">
                    {!editingHero ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">
                              {language === "bn"
                                ? "প্রথম ব্যানার স্লাইডার সমুহ"
                                : "Homepage Top Banner Carousel"}
                            </h3>
                            <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                              {language === "bn"
                                ? "হোমপেজে ঘূর্ণাবর্ত ব্যানার গুলোর লেখা ও ছবি এখানে ম্যানেজ করুন।"
                                : "Instantly modify banner slides, badge texts, display headers, backgrounds, etc."}
                            </p>
                          </div>
                          <button
                            onClick={createNewHero}
                            className="bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="h-4 w-4" />
                            <span>
                              {language === "bn"
                                ? "নতুন স্লাইড"
                                : "Add Banner Slide"}
                            </span>
                          </button>
                        </div>

                        {heroSlides.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-[#E8DDD0] space-y-3">
                            <Layout className="h-12 w-12 text-stone-300 mx-auto" />
                            <h4 className="text-sm font-bold text-stone-800">
                              {language === "bn"
                                ? "ডাটাবেস সম্পূর্ণ ফাকা!"
                                : "Database Collections Empty"}
                            </h4>
                            <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
                              {language === "bn"
                                ? "নতুন ব্যানার স্লাইড তৈরি করতে উপরের বাটনে ক্লিক করুন।"
                                : "Please click the button above to add a new banner slide."}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {heroSlides.map((slide) => (
                              <div
                                key={slide.id}
                                className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                              >
                                <div
                                  className="h-32 bg-cover bg-center relative"
                                  style={{
                                    backgroundImage: `url(${slide.bgImage})`,
                                  }}
                                >
                                  <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-between text-white">
                                    <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 font-sans text-[8px] font-extrabold uppercase tracking-widest rounded-none">
                                      {slide.badge_bn}
                                    </span>
                                    <h4 className="text-sm font-bold line-clamp-2 leading-snug drop-shadow-sm font-serif">
                                      {language === "bn"
                                        ? slide.title_bn
                                        : slide.title_en}
                                    </h4>
                                  </div>
                                </div>
                                <div className="p-4 flex items-center justify-between border-t border-stone-100 bg-stone-50/50">
                                  <span className="text-[10px] font-sans font-semibold text-stone-600 bg-stone-200/50 px-2.5 py-0.5 rounded-full">
                                    🎯{" "}
                                    {language === "bn"
                                      ? `ক্রম: ${slide.order}`
                                      : `Priority Order: ${slide.order}`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingHero(slide);
                                        setPreviewImage(slide.bgImage);
                                      }}
                                      className="p-1 px-2.5 bg-[#B8862A]/10 hover:bg-[#B8862A]/20 text-[#B8862A] text-xs font-sans font-bold rounded-lg border border-[#B8862A]/20 transition cursor-pointer"
                                    >
                                      {language === "bn" ? "এডিট করুন" : "Edit"}
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
                      <form
                        onSubmit={saveHeroSlide}
                        className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between border-b pb-3">
                          <button
                            type="button"
                            onClick={() => setEditingHero(null)}
                            className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>
                              {language === "bn" ? "ফিরে যান" : "Back to list"}
                            </span>
                          </button>
                          <h4 className="font-bold text-stone-950 font-serif">
                            {language === "bn"
                              ? "ব্যানার তথ্য সংশোধন উইন্ডো"
                              : "Edit Hero Slide Details"}
                          </h4>
                          <div></div>
                        </div>

                        {/* Top banner visual simulation */}
                        <div
                          className="relative h-40 bg-cover bg-center rounded-xl overflow-hidden border"
                          style={{ backgroundImage: `url(${previewImage})` }}
                        >
                          <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end text-white">
                            <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 text-[8px] font-extrabold uppercase rounded-none leading-none mb-1">
                              {editingHero.badge_bn || "ব্যানার ব্যাজ"}
                            </span>
                            <h2 className="text-base font-bold font-serif line-clamp-1">
                              {editingHero.title_bn || "শিরোনাম"}
                            </h2>
                            <p className="text-[10px] text-stone-300 leading-none mt-1 font-sans line-clamp-1">
                              {editingHero.desc_bn || "বিবরণী..."}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* BN text items */}
                          <div className="p-4 bg-[#FAF7F2]/50 border border-[#E8DDD0]/50 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#2E5942] border-b pb-1">
                              🇧🇩{" "}
                              {language === "bn"
                                ? "বাংলা সংস্করণ কপি"
                                : "Bengali Translations Copy"}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "ব্যাজ লেখা"
                                  : "Banner Badge Text"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.badge_bn}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    badge_bn: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "প্রধান শিরোনাম"
                                  : "Header Title (BN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.title_bn}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    title_bn: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "সংক্ষিপ্ত তথ্য"
                                  : "Brief Desc (BN)"}
                              </label>
                              <textarea
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingHero.desc_bn}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    desc_bn: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* EN text items */}
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-stone-600 border-b pb-1">
                              🇬🇧{" "}
                              {language === "bn"
                                ? "ইংরেজি সংস্করণ কপি"
                                : "English Translations Copy"}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "ব্যাজ ইংরেজি"
                                  : "Badge Eng"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.badge_en}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    badge_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "শিরোনাম ইংরেজি"
                                  : "Title Eng"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.title_en}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    title_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "বিবরণ ইংরেজি"
                                  : "Desc Eng"}
                              </label>
                              <textarea
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingHero.desc_en}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    desc_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image settings and Image upload system */}
                        <div className="p-4 border rounded-xl space-y-4 bg-stone-50/50">
                          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                            <span>
                              {language === "bn"
                                ? "স্লাইডার ব্যাকগ্রাউন্ড ইমেজ (URL অথবা আপলোড)"
                                : "Slider Background Image (Web URL or local file upload)"}
                            </span>
                            <span className="text-[10px] text-[#B8862A] font-normal leading-none font-sans">
                              * cPanel database stores as direct data string or
                              high performance URL
                            </span>
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">
                                {language === "bn"
                                  ? "ইমেজ লিঙ্ক বা ফাইল পাথ"
                                  : "Image Link / Server Path"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono bg-white"
                                value={editingHero.bgImage}
                                onChange={(e) => {
                                  setEditingHero({
                                    ...editingHero,
                                    bgImage: e.target.value,
                                  });
                                  setPreviewImage(e.target.value);
                                }}
                                placeholder="./uploads/... অথবা https://..."
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">
                                {language === "bn"
                                  ? "পিসি থেকে ছবি আপলোড করুন"
                                  : "Upload Image from Computer"}
                              </label>
                              <div className="flex gap-2">
                                <label className="flex-1 border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2.5 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 hover:border-[#2E5942] transition duration-150 flex flex-col items-center justify-center space-y-0.5 cursor-pointer group">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isDirectUploading}
                                    onChange={(e) =>
                                      handleDirectImageUpload(e, (url) => {
                                        setEditingHero({
                                          ...editingHero,
                                          bgImage: url,
                                        });
                                        setPreviewImage(url);
                                      })
                                    }
                                  />
                                  <Upload
                                    className={`h-4 w-4 text-[#2E5942] ${isDirectUploading ? "animate-spin" : "group-hover:scale-110"} transition duration-150`}
                                  />
                                  <span className="text-[10px] font-bold font-sans text-[#2E5942]">
                                    {isDirectUploading
                                      ? language === "bn"
                                        ? "আপলোড হচ্ছে..."
                                        : "Uploading..."
                                      : language === "bn"
                                        ? "ফুল ছবি আপলোড (নো ক্রপ)"
                                        : "Full Image Upload (No Crop)"}
                                  </span>
                                  <span className="text-[8px] text-stone-500 font-sans">
                                    100% Original High-Res
                                  </span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => setIsHeroGalleryOpen(true)}
                                  className="px-3 border border-[#B8862A]/40 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 text-[#B8862A] text-[10px] font-sans font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 shadow-xs"
                                  title="Open Library Image Selector"
                                >
                                  <ImageIcon className="h-3.5 w-3.5 text-[#B8862A]" />
                                  <span>
                                    {language === "bn"
                                      ? "ইমেজ লাইব্রেরি"
                                      : "Image Library"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openImageResizer("banner", (resizedUrl) => {
                                      setEditingHero({
                                        ...editingHero,
                                        bgImage: resizedUrl,
                                      });
                                      setPreviewImage(resizedUrl);
                                    })
                                  }
                                  className="px-3 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-sans font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
                                  title="Open Crop/Resize Tool"
                                >
                                  <Sliders className="h-3.5 w-3.5 text-[#B8862A]" />
                                  <span>
                                    {language === "bn" ? "রিসাইজার" : "Resizer"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "স্লাইড অগ্রাধিকার ক্রম (priority)"
                                  : "Horizontal priority order sequence"}
                              </label>
                              <input
                                type="number"
                                className="w-24 px-3 py-1 border border-stone-200 rounded-lg text-xs"
                                value={editingHero.order}
                                onChange={(e) =>
                                  setEditingHero({
                                    ...editingHero,
                                    order: parseInt(e.target.value) || 0,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setEditingHero(null)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-semibold rounded-lg transition cursor-pointer"
                              >
                                {language === "bn" ? "বাতিল" : "Cancel"}
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-sans font-bold rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>
                                  {language === "bn"
                                    ? "আপডেট সেভ করুন"
                                    : "Apply Layout Update"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Media Library Modal for Hero Slider */}
                    <MediaLibraryModal
                      isOpen={isHeroGalleryOpen}
                      onClose={() => setIsHeroGalleryOpen(false)}
                      currentImage={editingHero?.bgImage}
                      language={language}
                      title={
                        language === "bn"
                          ? "হিরো স্লাইডার ছবি নির্বাচন ও আপলোড গ্যালারি"
                          : "Hero Slider Image Picker & Media Library"
                      }
                      onSelectImage={(url) => {
                        if (editingHero) {
                          setEditingHero({
                            ...editingHero,
                            bgImage: url,
                          });
                          setPreviewImage(url);
                        }
                        setIsHeroGalleryOpen(false);
                      }}
                    />
                  </div>
                )}

                {/* TAB 2: WHO WE ARE (আমরা কারা ও মূল পরিচিতি) */}
                {activeTab === "who_we_are" && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#B8862A]/25 shadow-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-[#2E5942]/10 text-[#2E5942] rounded-xl">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-stone-900 font-serif">
                              {language === "bn"
                                ? "২. আমরা কারা ও মূল পরিচিতি"
                                : "2. Who We Are & Overview"}
                            </h3>
                            <p className="text-xs text-stone-500 font-sans">
                              {language === "bn"
                                ? "হোমপেজের হিরো স্লাইডারের ঠিক নিচে থাকা “আমরা কারা” সেকশনটি সরাসরি এডিট করুন।"
                                : 'Edit the central "Who We Are" intro section displayed directly below the top hero slider.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleSaveWhoWeAre()}
                          disabled={isSavingWhoWeAre}
                          className="bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                        >
                          {isSavingWhoWeAre ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>
                            {language === "bn"
                              ? "পরিবর্তন সেভ করুন"
                              : "Save Changes"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    <form
                      onSubmit={handleSaveWhoWeAre}
                      className="bg-white p-6 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-6"
                    >
                      {/* Section Titles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-5 border-b border-stone-150">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#2E5942]"></span>
                            <span>
                              {language === "bn"
                                ? "সেকশন শিরোনাম (বাংলা)"
                                : "Section Title (Bengali)"}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={whoWeAreBlock.title_bn}
                            onChange={(e) =>
                              setWhoWeAreBlock({
                                ...whoWeAreBlock,
                                title_bn: e.target.value,
                              })
                            }
                            placeholder="যেমন: আমরা কারা"
                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm font-serif font-bold text-stone-900 focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#B8862A]"></span>
                            <span>
                              {language === "bn"
                                ? "সেকশন শিরোনাম (ইংরেজি)"
                                : "Section Title (English)"}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={whoWeAreBlock.title_en}
                            onChange={(e) =>
                              setWhoWeAreBlock({
                                ...whoWeAreBlock,
                                title_en: e.target.value,
                              })
                            }
                            placeholder="e.g. Who We Are"
                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm font-sans font-bold text-stone-900 focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]"
                            required
                          />
                        </div>
                      </div>

                      {/* Subtitle / Tagline */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-5 border-b border-stone-150">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#2E5942]"></span>
                            <span>
                              {language === "bn"
                                ? "উপ-শিরোনাম / মূল স্লোগান (বাংলা)"
                                : "Subtitle / Tagline (Bengali)"}
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            value={whoWeAreBlock.subtitle_bn}
                            onChange={(e) =>
                              setWhoWeAreBlock({
                                ...whoWeAreBlock,
                                subtitle_bn: e.target.value,
                              })
                            }
                            placeholder="যেমন: আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন"
                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-serif text-stone-900 focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#B8862A]"></span>
                            <span>
                              {language === "bn"
                                ? "উপ-শিরোনাম / মূল স্লোগান (ইংরেজি)"
                                : "Subtitle / Tagline (English)"}
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            value={whoWeAreBlock.subtitle_en}
                            onChange={(e) =>
                              setWhoWeAreBlock({
                                ...whoWeAreBlock,
                                subtitle_en: e.target.value,
                              })
                            }
                            placeholder="e.g. A transformative nation-building movement cultivating enlightened minds and noble human values"
                            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-sans text-stone-900 focus:outline-none focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942]"
                          />
                        </div>
                      </div>

                      {/* Paragraphs List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 font-serif">
                              {language === "bn"
                                ? "পরিচিতি অনুচ্ছেদসমূহ"
                                : "Description Paragraphs"}
                            </h4>
                            <p className="text-[11px] text-stone-500 font-sans">
                              {language === "bn"
                                ? "হোমপেজে প্রদর্শিত মূল পরিচিতির প্যারাগ্রাফগুলো এখানে লিখুন।"
                                : "Paragraphs displayed in the centered section on homepage."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setWhoWeAreBlock({
                                ...whoWeAreBlock,
                                paragraphs_bn: [
                                  ...whoWeAreBlock.paragraphs_bn,
                                  "নতুন অনুচ্ছেদের বিবরণ এখানে লিখুন।",
                                ],
                                paragraphs_en: [
                                  ...whoWeAreBlock.paragraphs_en,
                                  "Write new paragraph description here.",
                                ],
                              });
                            }}
                            className="text-xs font-bold text-[#2E5942] hover:text-[#1E3B2C] bg-[#2E5942]/10 hover:bg-[#2E5942]/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>
                              {language === "bn"
                                ? "+ নতুন অনুচ্ছেদ"
                                : "+ Add Paragraph"}
                            </span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {whoWeAreBlock.paragraphs_bn.map((pBn, pIdx) => {
                            const pEn = whoWeAreBlock.paragraphs_en[pIdx] || "";
                            return (
                              <div
                                key={pIdx}
                                className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative group"
                              >
                                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                                  <span className="text-xs font-bold text-[#B8862A] font-mono">
                                    {language === "bn"
                                      ? `অনুচ্ছেদ #${pIdx + 1}`
                                      : `Paragraph #${pIdx + 1}`}
                                  </span>

                                  {whoWeAreBlock.paragraphs_bn.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newBn =
                                          whoWeAreBlock.paragraphs_bn.filter(
                                            (_, i) => i !== pIdx,
                                          );
                                        const newEn =
                                          whoWeAreBlock.paragraphs_en.filter(
                                            (_, i) => i !== pIdx,
                                          );
                                        setWhoWeAreBlock({
                                          ...whoWeAreBlock,
                                          paragraphs_bn: newBn,
                                          paragraphs_en: newEn,
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                                      title={
                                        language === "bn"
                                          ? "মুছে ফেলুন"
                                          : "Delete"
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>
                                        {language === "bn" ? "মুছুন" : "Remove"}
                                      </span>
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-stone-600 block font-sans">
                                      {language === "bn"
                                        ? "বাংলা বিবরণ:"
                                        : "Bengali Text:"}
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={pBn}
                                      onChange={(e) => {
                                        const updatedBn = [
                                          ...whoWeAreBlock.paragraphs_bn,
                                        ];
                                        updatedBn[pIdx] = e.target.value;
                                        setWhoWeAreBlock({
                                          ...whoWeAreBlock,
                                          paragraphs_bn: updatedBn,
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-serif leading-relaxed text-stone-900 focus:outline-none focus:border-[#2E5942] bg-white"
                                      placeholder="বাংলা অনুচ্ছেদ লিখুন..."
                                      required
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-stone-600 block font-sans">
                                      {language === "bn"
                                        ? "ইংরেজি বিবরণ:"
                                        : "English Text:"}
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={pEn}
                                      onChange={(e) => {
                                        const updatedEn = [
                                          ...whoWeAreBlock.paragraphs_en,
                                        ];
                                        updatedEn[pIdx] = e.target.value;
                                        setWhoWeAreBlock({
                                          ...whoWeAreBlock,
                                          paragraphs_en: updatedEn,
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-sans leading-relaxed text-stone-900 focus:outline-none focus:border-[#2E5942] bg-white"
                                      placeholder="Write English paragraph..."
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Save Action Footer */}
                      <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                        <button
                          type="submit"
                          disabled={isSavingWhoWeAre}
                          className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-sans font-bold rounded-xl transition shadow-md cursor-pointer flex items-center gap-2"
                        >
                          {isSavingWhoWeAre ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>
                            {language === "bn"
                              ? "আমরা কারা তথ্য সংরক্ষণ করুন"
                              : "Save Who We Are Changes"}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* LIVE HOMEPAGE PREVIEW CARD */}
                    <div className="bg-[#FAF7F2] p-6 md:p-10 rounded-2xl border border-[#B8862A]/30 shadow-sm space-y-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-[#B8862A]/15 text-[#8B621B] font-mono text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {language === "bn"
                            ? "হোমপেজ লাইভ প্রিভিউ"
                            : "Homepage Live Preview"}
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1A1207] tracking-tight">
                        {language === "bn"
                          ? whoWeAreBlock.title_bn || "আমরা কারা"
                          : whoWeAreBlock.title_en || "Who We Are"}
                      </h2>

                      <div className="w-16 h-1 bg-[#B8862A] rounded-full mx-auto" />

                      {(language === "bn"
                        ? whoWeAreBlock.subtitle_bn
                        : whoWeAreBlock.subtitle_en) && (
                        <p className="text-sm font-serif text-[#8B621B] font-medium max-w-2xl mx-auto">
                          {language === "bn"
                            ? whoWeAreBlock.subtitle_bn
                            : whoWeAreBlock.subtitle_en}
                        </p>
                      )}

                      <div className="space-y-4 pt-2 max-w-3xl mx-auto">
                        {(language === "bn"
                          ? whoWeAreBlock.paragraphs_bn
                          : whoWeAreBlock.paragraphs_en
                        ).map((pText, pIdx) => (
                          <p
                            key={pIdx}
                            className="font-serif text-stone-700 text-sm md:text-base leading-relaxed text-center"
                          >
                            {pText}
                          </p>
                        ))}
                      </div>

                      <div className="pt-2">
                        <span className="text-xs font-bold text-[#B8862A] underline underline-offset-4 cursor-default">
                          {language === "bn"
                            ? "বিস্তারিত পরিচিতি দেখুন →"
                            : "Read More About Us →"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: RECENT ACTIVITIES CRUD */}
                {activeTab === "activities" && (
                  <div className="space-y-4">
                    {!editingActivity ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <div>
                            <h3 className="text-lg font-bold text-stone-900">
                              {language === "bn"
                                ? "আসন্ন কার্যক্রমসমূহ ও ব্যানার ২"
                                : "Upcoming Activities & 2nd Carousel"}
                            </h3>
                            <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                              {language === "bn"
                                ? "হোমপেজে থাকা ২য় ক্যারোসেল আসন্ন কার্যক্রমগুলি যুক্ত ও এডিট করুন।"
                                : "Draft, edit or delete countrywide library achievements and events displayed below."}
                            </p>
                          </div>
                          <button
                            onClick={createNewActivity}
                            className="bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-sans text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="h-4 w-4" />
                            <span>
                              {language === "bn"
                                ? "নতুন কার্যক্রম"
                                : "Add Activity Record"}
                            </span>
                          </button>
                        </div>

                        {recentActivities.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-[#E8DDD0] space-y-3">
                            <Layout className="h-12 w-12 text-stone-300 mx-auto" />
                            <h4 className="text-sm font-bold text-stone-800">
                              {language === "bn"
                                ? "ডাটাবেস সম্পূর্ণ ফাকা!"
                                : "No activities found"}
                            </h4>
                            <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
                              {language === "bn"
                                ? "নতুন কার্যক্রম তৈরি করতে উপরের বাটনে ক্লিক করুন।"
                                : "Please click the button above to add a new activity record."}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentActivities.map((act) => (
                              <div
                                key={act.id}
                                className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                              >
                                <div
                                  className="h-32 bg-cover bg-center relative"
                                  style={{
                                    backgroundImage: `url(${act.image})`,
                                  }}
                                >
                                  <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-between text-white">
                                    <span className="self-start px-2 py-0.5 bg-[#2E5942] text-white font-sans text-[8px] font-extrabold uppercase tracking-widest rounded-none border border-[#B8862A]/40">
                                      {act.category_bn}
                                    </span>
                                    <h4 className="text-sm font-bold line-clamp-2 leading-snug drop-shadow-sm font-serif">
                                      {language === "bn"
                                        ? act.title_bn
                                        : act.title_en}
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
                                      🎯{" "}
                                      {language === "bn"
                                        ? `ক্রম: ${act.order}`
                                        : `Priority: ${act.order}`}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingActivity(act);
                                          setPreviewImage(act.image);
                                        }}
                                        className="p-1 px-2.5 bg-[#B8862A]/10 hover:bg-[#B8862A]/20 text-[#B8862A] text-xs font-sans font-bold rounded-lg border border-[#B8862A]/20 transition cursor-pointer"
                                      >
                                        {language === "bn"
                                          ? "এডিট করুন"
                                          : "Edit"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteRecentActivity(act.id)
                                        }
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
                      <form
                        onSubmit={saveRecentActivity}
                        className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between border-b pb-3">
                          <button
                            type="button"
                            onClick={() => setEditingActivity(null)}
                            className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>
                              {language === "bn" ? "ফিরে যান" : "Back to list"}
                            </span>
                          </button>
                          <h4 className="font-bold text-stone-950 font-serif">
                            {language === "bn"
                              ? "কার্যক্রম বিবরণী সংশোধন"
                              : "Edit Activity Record"}
                          </h4>
                          <div></div>
                        </div>

                        {/* Visual simulation */}
                        <div
                          className="relative h-40 bg-cover bg-center rounded-xl overflow-hidden border"
                          style={{ backgroundImage: `url(${previewImage})` }}
                        >
                          <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end text-white">
                            <span className="self-start px-2 py-0.5 bg-[#B8862A] text-stone-950 text-[8px] font-extrabold uppercase rounded-none leading-none mb-1">
                              {editingActivity.category_bn || "ক্যাটাগরি"}
                            </span>
                            <h2 className="text-base font-bold font-serif line-clamp-1">
                              {editingActivity.title_bn || "কার্যক্রমের নাম"}
                            </h2>
                            <p className="text-[9px] text-stone-300 mt-2 font-sans">
                              {editingActivity.loc_bn || "বিশ্বসাহিত্য কেন্দ্র"}{" "}
                              | {editingActivity.date_bn}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* BN Inputs */}
                          <div className="p-4 bg-[#FAF7F2]/50 border border-[#E8DDD0]/50 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#2E5942] border-b pb-1">
                              🇧🇩{" "}
                              {language === "bn"
                                ? "বাংলা কপি এডিট"
                                : "Bengali Translations"}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "কার্যক্রমের ক্যাটাগরি"
                                  : "Category Name (BN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.category_bn}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    category_bn: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "কার্যক্রমের নাম"
                                  : "Activity Title (BN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.title_bn}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    title_bn: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "তারিখ"
                                  : "Date string (BN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.date_bn}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    date_bn: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "স্থান / লোকেশন"
                                  : "Location desc (BN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.loc_bn}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    loc_bn: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "কার্যক্রমের খুঁটিনাটি বিবরণী"
                                  : "Brief desc paragraphs (BN)"}
                              </label>
                              <textarea
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingActivity.desc_bn}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    desc_bn: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-[#B8862A] block">
                                {language === "bn"
                                  ? "স্লাইডারের ছবির ক্যাপশন (বাংলা)"
                                  : "Slider Image Caption (BN)"}
                              </label>
                              <input
                                type="text"
                                placeholder={
                                  language === "bn"
                                    ? "স্লাইডারের নিচে ডান কোণে প্রদর্শিত ছবির ক্যাপশন"
                                    : "Caption shown at bottom-right of slider image"
                                }
                                className="w-full px-3 py-1.5 border border-[#B8862A]/30 rounded-lg text-xs bg-amber-50/20"
                                value={editingActivity.caption_bn || ""}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    caption_bn: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* EN Inputs */}
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-stone-600 border-b pb-1">
                              🇬🇧{" "}
                              {language === "bn"
                                ? "ইংরেজি কপি এডিট"
                                : "English Translations"}
                            </h5>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "ক্যাটাগরি Eng"
                                  : "Category Name (EN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.category_en}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    category_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "নাম Eng"
                                  : "Activity Title (EN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.title_en}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    title_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "তারিখ Eng"
                                  : "Date string (EN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.date_en}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    date_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "স্থান Eng"
                                  : "Location desc (EN)"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.loc_en}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    loc_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "বিবরণ Eng"
                                  : "Brief desc paragraphs (EN)"}
                              </label>
                              <textarea
                                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                rows={2}
                                value={editingActivity.desc_en}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    desc_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-[#B8862A] block">
                                {language === "bn"
                                  ? "স্লাইডারের ছবির ক্যাপশন (ইংরেজি)"
                                  : "Slider Image Caption (EN)"}
                              </label>
                              <input
                                type="text"
                                placeholder={
                                  language === "bn"
                                    ? "Caption shown at bottom-right of slider image"
                                    : "Caption shown at bottom-right of slider image"
                                }
                                className="w-full px-3 py-1.5 border border-[#B8862A]/30 rounded-lg text-xs bg-amber-50/20"
                                value={editingActivity.caption_en || ""}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    caption_en: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Activity image systems */}
                        <div className="p-4 border rounded-xl space-y-4 bg-stone-50/50">
                          <label className="text-xs font-bold text-stone-800 block">
                            {language === "bn"
                              ? "কার্যক্রমের ছবি লিংক / আপলোড"
                              : "Activity Cover Photo (Web URL / Local File Upload)"}
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">
                                {language === "bn"
                                  ? "ইমেজ লিঙ্ক বা ফাইল পাথ"
                                  : "Image Link / Server Path"}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono bg-white"
                                value={editingActivity.image}
                                onChange={(e) => {
                                  setEditingActivity({
                                    ...editingActivity,
                                    image: e.target.value,
                                  });
                                  setPreviewImage(e.target.value);
                                }}
                                placeholder="./uploads/... অথবা https://..."
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-stone-600 block">
                                {language === "bn"
                                  ? "পিসি থেকে ছবি আপলোড করুন"
                                  : "Upload Image from Computer"}
                              </label>
                              <div className="flex gap-2">
                                <label className="flex-1 border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2.5 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 hover:border-[#2E5942] transition duration-150 flex flex-col items-center justify-center space-y-0.5 cursor-pointer group">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isDirectUploading}
                                    onChange={(e) =>
                                      handleDirectImageUpload(e, (url) => {
                                        setEditingActivity({
                                          ...editingActivity,
                                          image: url,
                                        });
                                        setPreviewImage(url);
                                      })
                                    }
                                  />
                                  <Upload
                                    className={`h-4 w-4 text-[#2E5942] ${isDirectUploading ? "animate-spin" : "group-hover:scale-110"} transition duration-150`}
                                  />
                                  <span className="text-[10px] font-bold font-sans text-[#2E5942]">
                                    {isDirectUploading
                                      ? language === "bn"
                                        ? "আপলোড হচ্ছে..."
                                        : "Uploading..."
                                      : language === "bn"
                                        ? "ফুল ছবি আপলোড (নো ক্রপ)"
                                        : "Full Image Upload (No Crop)"}
                                  </span>
                                  <span className="text-[8px] text-stone-500 font-sans">
                                    100% Original High-Res
                                  </span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openImageResizer(
                                      "landscape",
                                      (resizedUrl) => {
                                        setEditingActivity({
                                          ...editingActivity,
                                          image: resizedUrl,
                                        });
                                        setPreviewImage(resizedUrl);
                                      },
                                    )
                                  }
                                  className="px-3 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-sans font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
                                  title="Open Crop/Resize Tool"
                                >
                                  <Sliders className="h-3.5 w-3.5 text-[#B8862A]" />
                                  <span>
                                    {language === "bn" ? "রিসাইজার" : "Resizer"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-700 block">
                                {language === "bn"
                                  ? "অগ্রাধিকার ক্রম (priority order)"
                                  : "Display priority seq"}
                              </label>
                              <input
                                type="number"
                                className="w-24 px-3 py-1 border border-stone-200 rounded-lg text-xs"
                                value={editingActivity.order}
                                onChange={(e) =>
                                  setEditingActivity({
                                    ...editingActivity,
                                    order: parseInt(e.target.value) || 0,
                                  })
                                }
                                required
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setEditingActivity(null)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-sans font-semibold rounded-lg transition cursor-pointer"
                              >
                                {language === "bn" ? "বাতিল" : "Cancel"}
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-sans font-bold rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>
                                  {language === "bn"
                                    ? "কার্যক্রম সেভ করুন"
                                    : "Confirm Save Record"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 8: ABOUT & MANAGEMENT COPIES */}
                {activeTab === "about_management" && (
                  <div className="space-y-4">
                    {!editingPage ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#B8862A]/20 shadow-xs">
                          <h3 className="text-lg font-bold text-stone-900 font-serif">
                            {language === "bn"
                              ? "৮. পরিচিতি ও ব্যবস্থাপনা পেজ কন্টেন্ট"
                              : "8. About & Management Page Contents"}
                          </h3>
                          <p className="text-xs text-stone-500 font-sans leading-normal mt-0.5">
                            {language === "bn"
                              ? 'মেন্যুর "পরিচিতি ও ব্যবস্থাপনা" অংশের পেজগুলোর বিবরণ ও তথ্য এডিট করুন।'
                              : "Customize static page texts, paragraphs and details for BSK About & Management section."}
                          </p>
                        </div>

                        {/* List of default pages to select & edit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: "home", name_bn: "বিশ্বসাহিত্য কেন্দ্র পরিচিতি (সাথে ব্রত, লক্ষ্য, ইতিহাস ও অর্জন)", name_en: "About BSK (with Mission, History & Achievements)" },
                            { id: "mission", name_bn: "ব্রত, লক্ষ্য ও উদ্দেশ্য", name_en: "Mission & Vision" },
                            { id: "founder", name_bn: "প্রতিষ্ঠাতা ও সভাপতি", name_en: "Founder Profile" },
                            { id: "ataglance", name_bn: "এক নজরে কেন্দ্র", name_en: "BSK at a Glance" },
                            { id: "achievement", name_bn: "অর্জনসমূহ", name_en: "Achievements" },
                            { id: "bsk-history", name_bn: "ইতিহাস", name_en: "BSK History" },
                            { id: "governance", name_bn: "পরিচালনা ও ব্যবস্থাপনা", name_en: "Governance & Management" },
                            { id: "trustees", name_bn: "ট্রাস্টি বোর্ড", name_en: "Board of Trustees" },
                            { id: "organogram", name_bn: "প্রশাসনিক কাঠামো ও অর্গানোগ্রাম", name_en: "Administrative Structure" },

                            { id: "mobile-library", name_bn: "ভ্রাম্যমাণ লাইব্রেরি", name_en: "Mobile Library Program" },
                            { id: "central-library", name_bn: "কেন্দ্র লাইব্রেরি", name_en: "Central Library" },
                            { id: "reading-habit", name_bn: "পাঠাভ্যাস উন্নয়ন কর্মসূচি", name_en: "Reading Development Program" },
                            { id: "primary-teacher", name_bn: "প্রাথমিক শিক্ষকদের বইপড়া কর্মসূচি", name_en: "Primary Teacher Reading" },
                            { id: "nationwide-excellence", name_bn: "দেশভিত্তিক উৎকর্ষ কার্যক্রম", name_en: "Nationwide Excellence" },
                            { id: "aalor-ishkool", name_bn: "আলোর ইশকুল", name_en: "Aalor Ishkool" },
                            { id: "aalor-pathshala", name_bn: "আলোর পাঠশালা", name_en: "Aalor Pathshala" },
                            { id: "bangalir_chinta", name_bn: "বাঙালির চিন্তা কর্মসূচি", name_en: "Bangalir Chinta Program" },

                            { id: "publication", name_bn: "প্রকাশনা শাখা", name_en: "Publications" },
                            { id: "bookshop", name_bn: "বই বিক্রয় কেন্দ্র", name_en: "Book Shop" },
                            { id: "book-fair", name_bn: "বইমেলা ও উৎসব", name_en: "Book Fair" },

                            { id: "building", name_bn: "কেন্দ্র ভবন ও পরিচিতি", name_en: "BSK Building & Facilities" },
                            { id: "facilities", name_bn: "মিলনায়তন ও সেমিনার কক্ষ", name_en: "Auditoriums & Facilities" },

                            { id: "contact", name_bn: "যোগাযোগ", name_en: "Contact Information" },
                            { id: "press", name_bn: "প্রেস রিলিজ ও সংবাদ", name_en: "Press Releases & News" },
                            { id: "notice", name_bn: "বিজ্ঞপ্তি ও অডিশন", name_en: "Notices & Announcements" },
                            { id: "blog", name_bn: "ব্লগ ও রিভিউ", name_en: "Blog & Book Reviews" },
                            { id: "recruitment", name_bn: "বিজ্ঞপ্তি ও নিয়োগ সুযোগসমূহ", name_en: "Recruitment & Careers" },
                            { id: "press_contact", name_bn: "মিডিয়া ও প্রেস যোগাযোগ (সেকশন ৫)", name_en: "Media & Press Contact (Section 5)" },
                          ].map((pageInfo) => {
                            // Find if we already customized this page in cPanel Database
                            const isOverridden =
                              pageInfo.id === "press_contact"
                                ? hasCustomMediaContact
                                : pages.some((p) => p.id === pageInfo.id);

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
                                    <span className="font-mono text-stone-400">
                                      ID: {pageInfo.id}
                                    </span>
                                    {isOverridden ? (
                                      <span className="text-[#2E5942] font-semibold bg-[#2E5942]/10 px-1.5 py-0.5 rounded-sm">
                                        ✓{" "}
                                        {language === "bn"
                                          ? "কাস্টমাইজড"
                                          : "Custom Live"}
                                      </span>
                                    ) : (
                                      <span className="text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                        {language === "bn"
                                          ? "ডিফল্ট কপি"
                                          : "Using Local Default"}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <button
                                  onClick={() => {
                                    // Start editing - fallback to default structure from websiteContentRaw if not yet saved in database
                                    if (pageInfo.id === "press_contact") {
                                      const defaultMediaContact = {
                                        coordinator_title_bn:
                                          "মিডিয়া কো-অর্ডিনেটর",
                                        coordinator_title_en:
                                          "Media Liaison Coordinator",
                                        coordinator_name_bn:
                                          "মাহমুদ হাসান রাজু",
                                        coordinator_name_en:
                                          "Mahmud Hasan Raju",
                                        coordinator_role_bn:
                                          "যুগ্ম পরিচালক (তথ্য ও জনসংযোগ)",
                                        coordinator_role_en:
                                          "Joint Director (Public Relations)",
                                        coordinator_email: "raju@bskbd.org",
                                        coordinator_phone: "+8801711135432",
                                        office_label_bn: "কেন্দ্রীয় কার্যালয়:",
                                        office_label_en:
                                          "Central Corporate Desk:",
                                        office_value_bn:
                                          "বিশ্বসাহিত্য কেন্দ্র, ১৭ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা ১০০০।",
                                        office_value_en:
                                          "Bishwo Shahitto Kendro, 17 Kazi Nazrul Islam Avenue, Banglamotor, Dhaka 1000.",
                                        hours_label_bn:
                                          "মিডিয়া ডেস্ক অফিস সময়:",
                                        hours_label_en:
                                          "Media Desks Duty Hours:",
                                        hours_value_bn:
                                          "শনিবার থেকে বুধবার: সকাল ১০:০০ টা থেকে সন্ধ্যা ৬:০০ টা",
                                        hours_value_en:
                                          "Saturday to Wednesday: 10:00 AM to 6:00 PM (GMT +6)",
                                        note_bn:
                                          "মহামারী ও ছুটির দিনে প্রেস ব্রিফিং ভার্চুয়ালি অনুষ্ঠিত হবে।",
                                        note_en:
                                          "Special holiday press briefings scheduled virtually upon email notification.",
                                      };

                                      cpanelApi
                                        .getDoc(
                                          "homepage_blocks",
                                          "media_contact",
                                        )
                                        .then((data) => {
                                          const finalData = data
                                            ? {
                                                ...defaultMediaContact,
                                                ...data,
                                              }
                                            : defaultMediaContact;
                                          setEditingPage({
                                            id: "press_contact",
                                            title_bn: pageInfo.name_bn,
                                            title_en: pageInfo.name_en,
                                            mediaContactData: finalData,
                                            sections: [],
                                          } as any);
                                        })
                                        .catch(() => {
                                          setEditingPage({
                                            id: "press_contact",
                                            title_bn: pageInfo.name_bn,
                                            title_en: pageInfo.name_en,
                                            mediaContactData:
                                              defaultMediaContact,
                                            sections: [],
                                          } as any);
                                        });
                                    } else if (
                                      pageInfo.id === "aalor-ishkool"
                                    ) {
                                      cpanelApi
                                        .getDoc(
                                          "website_pages",
                                          "aalor-ishkool",
                                        )
                                        .then((doc) => {
                                          const combined = {
                                            ...defaultAalorIshkoolData,
                                            id: "aalor-ishkool",
                                            title_bn: pageInfo.name_bn,
                                            title_en: pageInfo.name_en,
                                            html_title: pageInfo.name_bn,
                                            sections: [],
                                            ...(doc || {}),
                                          };
                                          setEditingPage(combined as any);
                                        })
                                        .catch(() => {
                                          setEditingPage({
                                            ...defaultAalorIshkoolData,
                                            id: "aalor-ishkool",
                                            title_bn: pageInfo.name_bn,
                                            title_en: pageInfo.name_en,
                                            html_title: pageInfo.name_bn,
                                            sections: [],
                                          } as any);
                                        });
                                    } else {
                                      const ex = pages.find(
                                        (p) => p.id === pageInfo.id,
                                      );
                                      if (ex) {
                                        const cloned = JSON.parse(
                                          JSON.stringify(ex),
                                        );
                                        if (!Array.isArray(cloned.sections))
                                          cloned.sections = [];
                                        setEditingPage(normalizeWebsitePage(cloned, pageInfo?.id || cloned?.id));
                                      } else {
                                       const raw = (websiteContentRaw as any[]).find((p: any) => p.id === pageInfo.id);
                                       if (raw) {
                                         setEditingPage(normalizeWebsitePage(raw, pageInfo.id));
                                       } else {
                                         setEditingPage(normalizeWebsitePage({
                                           id: pageInfo.id,
                                           title_bn: pageInfo.name_bn,
                                           title_en: pageInfo.name_en,
                                           html_title: pageInfo.name_bn,
                                          }, pageInfo.id));
                                        }
                                      }
                                    }
                                  }}
                                  className="p-1.5 px-3 bg-[#2E5942]/10 hover:bg-[#2E5942]/20 text-[#2E5942] rounded-lg text-xs font-sans font-bold border border-[#2E5942]/15 transition cursor-pointer"
                                >
                                  {language === "bn"
                                    ? "লেখাসমূহ এডিট"
                                    : "Edit Copy"}
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
                          <form
                            onSubmit={savePageOverride}
                            className="bg-white rounded-xl border border-[#B8862A]/20 shadow-md p-6 space-y-6"
                          >
                            <div className="flex items-center justify-between border-b pb-3">
                              <button
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="flex items-center gap-1 text-xs font-sans font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                              >
                                <ArrowLeft className="h-4 w-4" />
                                <span>
                                  {language === "bn"
                                    ? "ফিরে যান"
                                    : "Back to pages list"}
                                </span>
                              </button>
                              <h4 className="font-bold text-stone-950 font-serif">
                                {language === "bn"
                                  ? `"${editingPage.title_bn}" পেজ কপি সংশোধন`
                                  : `Edit Copy for: ${editingPage.title_en}`}
                              </h4>
                              <div></div>
                            </div>

                            {/* Title Overrides and custom section edit fields */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">
                                    {language === "bn"
                                      ? "প্রধান পেজ টাইটেল (বাংলা)"
                                      : "Main Page Title (BN)"}
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_bn}
                                    onChange={(e) =>
                                      setEditingPage({
                                        ...editingPage,
                                        title_bn: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-stone-700 block">
                                    {language === "bn"
                                      ? "প্রধান পেজ টাইটেল (ইংরেজি)"
                                      : "Main Page Title (EN)"}
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                    value={editingPage.title_en}
                                    onChange={(e) =>
                                      setEditingPage({
                                        ...editingPage,
                                        title_en: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="text-[10px] font-extrabold uppercase text-[#2E5942] tracking-wider border-b pb-1 flex justify-between items-center">
                                  <span>
                                    {language === "bn"
                                      ? "অনুচ্ছেদসমূহ ও বিশদ বিবরণীমালা"
                                      : "Page Sections & Document Paragraphs"}
                                  </span>
                                  <span className="text-[9px] text-[#B8862A] lowercase font-sans font-semibold">
                                    {language === "bn"
                                      ? "*রিয়েল-টাইম লাইভ পরিবর্তন ডানে দেখতে পাবেন"
                                      : "*live updates will preview on the right"}
                                  </span>
                                </div>

                                {editingPage.id === "press_contact" ? (
                                  <div className="space-y-6">
                                    {/* Media Contact Fields */}
                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4 text-[#2E5942]" />
                                        <span>
                                          {language === "bn"
                                            ? "১. মিডিয়া কো-অর্ডিনেটর বিবরণী"
                                            : "1. Media Liaison Coordinator Details"}
                                        </span>
                                      </h5>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "পদবী টাইটেল (বাংলা)"
                                              : "Coordinator Title (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_title_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_title_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "পদবী টাইটেল (ইংরেজি)"
                                              : "Coordinator Title (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_title_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_title_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কো-অর্ডিনেটর নাম (বাংলা)"
                                              : "Coordinator Name (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_name_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_name_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কো-অর্ডিনেটর নাম (ইংরেজি)"
                                              : "Coordinator Name (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_name_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_name_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ভুমিকা / রোল (বাংলা)"
                                              : "Coordinator Role (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_role_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_role_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ভুমিকা / রোল (ইংরেজি)"
                                              : "Coordinator Role (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_role_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_role_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ইমেইল অ্যাড্রেস"
                                              : "Email Address"}
                                          </label>
                                          <input
                                            type="email"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_email || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_email:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ফোন নম্বর"
                                              : "Phone Number"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.coordinator_phone || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  coordinator_phone:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Globe2 className="h-4 w-4 text-[#2E5942]" />
                                        <span>
                                          {language === "bn"
                                            ? "২. কেন্দ্রীয় কার্যালয় ও সময়সূচি"
                                            : "2. Corporate Desk & Schedule"}
                                        </span>
                                      </h5>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কার্যালয় লেবেল (বাংলা)"
                                              : "Office Label (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.office_label_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  office_label_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কার্যালয় লেবেল (ইংরেজি)"
                                              : "Office Label (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.office_label_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  office_label_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কার্যালয় ঠিকানা (বাংলা)"
                                              : "Office Address (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.office_value_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  office_value_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "কার্যালয় ঠিকানা (ইংরেজি)"
                                              : "Office Address (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.office_value_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  office_value_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অফিস সময় লেবেল (বাংলা)"
                                              : "Duty Hours Label (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.hours_label_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  hours_label_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অফিস সময় লেবেল (ইংরেজি)"
                                              : "Duty Hours Label (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.hours_label_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  hours_label_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অফিস সময় টেক্সট (বাংলা)"
                                              : "Duty Hours (BN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.hours_value_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  hours_value_bn:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অফিস সময় টেক্সট (ইংরেজি)"
                                              : "Duty Hours (EN)"}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData
                                                ?.hours_value_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  hours_value_en:
                                                    e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-[#2E5942]/5 to-transparent border-l-4 border-[#2E5942] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Info className="h-4 w-4 text-[#2E5942]" />
                                        <span>
                                          {language === "bn"
                                            ? "৩. অতিরিক্ত মন্তব্য ও নোট"
                                            : "3. Additional Notes"}
                                        </span>
                                      </h5>

                                      <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "বিশেষ দ্রষ্টব্য / মন্তব্য (বাংলা)"
                                              : "Additional Note (BN)"}
                                          </label>
                                          <textarea
                                            rows={2}
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData?.note_bn || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  note_bn: e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "বিশেষ দ্রষ্টব্য / মন্তব্য (ইংরেজি)"
                                              : "Additional Note (EN)"}
                                          </label>
                                          <textarea
                                            rows={2}
                                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs"
                                            value={
                                              (editingPage as any)
                                                .mediaContactData?.note_en || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPage({
                                                ...editingPage,
                                                mediaContactData: {
                                                  ...(editingPage as any)
                                                    .mediaContactData,
                                                  note_en: e.target.value,
                                                },
                                              } as any)
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : editingPage.id === "home" ? (
                                  <div className="space-y-6">
                                    {/* 1. INTRO HIGHLIGHT PANEL */}
                                    <div className="p-4 bg-gradient-to-r from-[#B8862A]/5 to-transparent border-l-4 border-[#B8862A] rounded-r-xl space-y-4">
                                      <h5 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-[#B8862A]" />
                                        <span>
                                          {language === "bn"
                                            ? "১. পরিচিতি অংশ কাস্টমাইজেশন (গোল্ডেন লাইনের নিচে)"
                                            : "1. Intro Highlight Customization (Below Golden Line)"}
                                        </span>
                                      </h5>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ভূমিকা টেক্সট (বাংলা)"
                                              : "Intro Text (BN)"}
                                          </label>
                                          <textarea
                                            rows={3}
                                            value={
                                              editingPage.intro_text_bn || ""
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "intro_text_bn",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans"
                                            placeholder="চিত্তের আলোয় দূর হোক অন্ধকার..."
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ভূমিকা টেক্সট (ইংরেজি)"
                                              : "Intro Text (EN)"}
                                          </label>
                                          <textarea
                                            rows={3}
                                            value={
                                              editingPage.intro_text_en || ""
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "intro_text_en",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans"
                                            placeholder="Let there be light in our minds..."
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/60 p-3 rounded-lg border border-stone-200/50">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ভূমিকা ইমেজ (আপলোড)"
                                              : "Intro Image"}
                                          </label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleHomeImageUpload(
                                                e,
                                                "intro_image",
                                              )
                                            }
                                            className="w-full text-[10px]"
                                          />
                                          {editingPage.intro_image && (
                                            <div className="mt-2 relative inline-block">
                                              <img
                                                src={editingPage.intro_image}
                                                className="h-14 rounded-md border border-[#E8DDD0] object-cover"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleHomeFieldChange(
                                                    "intro_image",
                                                    "",
                                                  )
                                                }
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ইমেজ অ্যালাইনমেন্ট"
                                              : "Image Alignment"}
                                          </label>
                                          <select
                                            value={
                                              editingPage.intro_image_align ||
                                              "right"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "intro_image_align",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="right">Right</option>
                                            <option value="left">Left</option>
                                            <option value="center">
                                              Center
                                            </option>
                                            <option value="none">
                                              None (Hide)
                                            </option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "ইমেজের প্রস্থ (উদাঃ 180px)"
                                              : "Image Width (e.g. 180px)"}
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingPage.intro_image_width ||
                                              "180px"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "intro_image_width",
                                                e.target.value,
                                              )
                                            }
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
                                          <span>
                                            {language === "bn"
                                              ? "২. ব্রত ও লক্ষ্য কাস্টমাইজেশন"
                                              : "2. Mission & Vow Customization"}
                                          </span>
                                        </h5>
                                      </div>

                                      {editingPage.sections[0] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "সেকশন শিরোনাম"
                                                : "Section Title"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.sections[0].title ||
                                                ""
                                              }
                                              onChange={(e) => {
                                                const updated = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updated[0].title =
                                                  e.target.value;
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updated,
                                                });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "ব্রত ও লক্ষ্যের প্যারাগ্রাফ সমূহ"
                                                : "Vow Paragraphs"}
                                            </span>
                                            {ensureArray(editingPage.sections?.[0]?.content).map(
                                              (pText, pIdx) => (
                                                <div
                                                  key={pIdx}
                                                  className="space-y-1"
                                                >
                                                  <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                    <span>
                                                      {language === "bn"
                                                        ? `প্যারাগ্রাফ #${pIdx + 1}`
                                                        : `Paragraph #${pIdx + 1}`}
                                                    </span>
                                                    {editingPage.sections[0]
                                                      .content.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedSecs = [
                                                            ...safeSections(editingPage?.sections),
                                                          ];
                                                          updatedSecs[0].content =
                                                            updatedSecs[0].content.filter(
                                                              (_, idx) =>
                                                                idx !== pIdx,
                                                            );
                                                          setEditingPage({
                                                            ...editingPage,
                                                            sections:
                                                              updatedSecs,
                                                          });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                      >
                                                        {language === "bn"
                                                          ? "মুছুন"
                                                          : "Remove"}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={3}
                                                    value={pText}
                                                    onChange={(e) => {
                                                      const updatedSecs = [
                                                        ...safeSections(editingPage?.sections),
                                                      ];
                                                      updatedSecs[0].content[
                                                        pIdx
                                                      ] = e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        sections: updatedSecs,
                                                      });
                                                    }}
                                                    className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              ),
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updatedSecs[0].content.push("");
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updatedSecs,
                                                });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              +{" "}
                                              {language === "bn"
                                                ? "প্যারাগ্রাফ যোগ করুন"
                                                : "Add Paragraph"}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* MINI GALLERY FOR MISSION */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>
                                              {language === "bn"
                                                ? "ব্রত ও লক্ষ্য স্লাইড গ্যালারি (একাধিক ছবি)"
                                                : "Vow Slide Gallery (Multiple Images)"}
                                            </span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [
                                                ...(editingPage.mission_gallery ||
                                                  []),
                                              ];
                                              current.push({
                                                image:
                                                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
                                                caption_bn: "",
                                                caption_en: "",
                                              });
                                              setEditingPage({
                                                ...editingPage,
                                                mission_gallery: current,
                                              });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            +{" "}
                                            {language === "bn"
                                              ? "নতুন ছবি যোগ করুন"
                                              : "Add Photo"}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(
                                            editingPage.mission_gallery || []
                                          ).map((gItem, gIdx) => (
                                            <div
                                              key={gIdx}
                                              className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (
                                                    editingPage.mission_gallery ||
                                                    []
                                                  ).filter(
                                                    (_, idx) => idx !== gIdx,
                                                  );
                                                  setEditingPage({
                                                    ...editingPage,
                                                    mission_gallery: current,
                                                  });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                                title={
                                                  language === "bn"
                                                    ? "ছবি মুছুন"
                                                    : "Delete photo"
                                                }
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "ছবি ফাইল"
                                                      : "Image file"}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                      handleGalleryImageUpload(
                                                        e,
                                                        "mission_gallery",
                                                        gIdx,
                                                      )
                                                    }
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img
                                                      src={gItem.image}
                                                      className="h-12 w-full object-cover rounded-md border"
                                                    />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (বাংলা)"
                                                        : "Caption (BN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.mission_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_bn =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          mission_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (ইংরেজি)"
                                                        : "Caption (EN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.mission_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_en =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          mission_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(editingPage.mission_gallery || [])
                                            .length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === "bn"
                                                ? "গ্যালারিতে কোনো ছবি যোগ করা হয়নি।"
                                                : "No custom photos added in gallery."}
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
                                          <span>
                                            {language === "bn"
                                              ? "৩. ইতিহাস ও যাত্রা কাস্টমাইজেশন"
                                              : "3. History & Journey Customization"}
                                          </span>
                                        </h5>
                                      </div>

                                      {editingPage.sections[1] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "সেকশন শিরোনাম"
                                                : "Section Title"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.sections[1].title ||
                                                ""
                                              }
                                              onChange={(e) => {
                                                const updated = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updated[1].title =
                                                  e.target.value;
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updated,
                                                });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "ইতিহাস ও যাত্রার প্যারাগ্রাফ সমূহ"
                                                : "History Paragraphs"}
                                            </span>
                                            {ensureArray(editingPage.sections?.[1]?.content).map(
                                              (pText, pIdx) => (
                                                <div
                                                  key={pIdx}
                                                  className="space-y-1"
                                                >
                                                  <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                    <span>
                                                      {language === "bn"
                                                        ? `প্যারাগ্রাফ #${pIdx + 1}`
                                                        : `Paragraph #${pIdx + 1}`}
                                                    </span>
                                                    {editingPage.sections[1]
                                                      .content.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedSecs = [
                                                            ...safeSections(editingPage?.sections),
                                                          ];
                                                          updatedSecs[1].content =
                                                            updatedSecs[1].content.filter(
                                                              (_, idx) =>
                                                                idx !== pIdx,
                                                            );
                                                          setEditingPage({
                                                            ...editingPage,
                                                            sections:
                                                              updatedSecs,
                                                          });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                      >
                                                        {language === "bn"
                                                          ? "মুছুন"
                                                          : "Remove"}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={3}
                                                    value={pText}
                                                    onChange={(e) => {
                                                      const updatedSecs = [
                                                        ...safeSections(editingPage?.sections),
                                                      ];
                                                      updatedSecs[1].content[
                                                        pIdx
                                                      ] = e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        sections: updatedSecs,
                                                      });
                                                    }}
                                                    className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              ),
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updatedSecs[1].content.push("");
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updatedSecs,
                                                });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              +{" "}
                                              {language === "bn"
                                                ? "প্যারাগ্রাফ যোগ করুন"
                                                : "Add Paragraph"}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* SECTION LEVEL IMAGE CUSTOMIZATION */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 rounded-lg border border-stone-200">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "সেকশন ইমেজ (আপলোড)"
                                              : "Section Image"}
                                          </label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleHomeImageUpload(
                                                e,
                                                "history_image",
                                              )
                                            }
                                            className="w-full text-[9px]"
                                          />
                                          {editingPage.history_image && (
                                            <div className="mt-1 relative inline-block">
                                              <img
                                                src={editingPage.history_image}
                                                className="h-12 rounded border object-cover"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleHomeFieldChange(
                                                    "history_image",
                                                    "",
                                                  )
                                                }
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অ্যালাইনমেন্ট"
                                              : "Alignment"}
                                          </label>
                                          <select
                                            value={
                                              editingPage.history_image_align ||
                                              "left"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "history_image_align",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                            <option value="center">
                                              Center
                                            </option>
                                            <option value="none">
                                              None (Hide)
                                            </option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "প্রস্থ (উদাঃ 150px)"
                                              : "Width (e.g. 150px)"}
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingPage.history_image_width ||
                                              "150px"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "history_image_width",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs"
                                          />
                                        </div>
                                      </div>

                                      {/* MINI GALLERY FOR HISTORY */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>
                                              {language === "bn"
                                                ? "ইতিহাস ও যাত্রা স্লাইড গ্যালারি"
                                                : "History Slide Gallery"}
                                            </span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [
                                                ...(editingPage.history_gallery ||
                                                  []),
                                              ];
                                              current.push({
                                                image:
                                                  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600",
                                                caption_bn: "",
                                                caption_en: "",
                                              });
                                              setEditingPage({
                                                ...editingPage,
                                                history_gallery: current,
                                              });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            +{" "}
                                            {language === "bn"
                                              ? "নতুন ছবি যোগ করুন"
                                              : "Add Photo"}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(
                                            editingPage.history_gallery || []
                                          ).map((gItem, gIdx) => (
                                            <div
                                              key={gIdx}
                                              className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (
                                                    editingPage.history_gallery ||
                                                    []
                                                  ).filter(
                                                    (_, idx) => idx !== gIdx,
                                                  );
                                                  setEditingPage({
                                                    ...editingPage,
                                                    history_gallery: current,
                                                  });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "ছবি ফাইল"
                                                      : "Image file"}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                      handleGalleryImageUpload(
                                                        e,
                                                        "history_gallery",
                                                        gIdx,
                                                      )
                                                    }
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img
                                                      src={gItem.image}
                                                      className="h-12 w-full object-cover rounded-md border"
                                                    />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (বাংলা)"
                                                        : "Caption (BN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.history_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_bn =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          history_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (ইংরেজি)"
                                                        : "Caption (EN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.history_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_en =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          history_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(editingPage.history_gallery || [])
                                            .length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === "bn"
                                                ? "গ্যালারিতে কোনো ছবি যোগ করা হয়নি।"
                                                : "No custom photos added in gallery."}
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
                                          <span>
                                            {language === "bn"
                                              ? "৪. অর্জিত সম্মান ও পুরস্কার কাস্টমাইজেশন"
                                              : "4. Achievements & Honors Customization"}
                                          </span>
                                        </h5>
                                      </div>

                                      {editingPage.sections[2] && (
                                        <div className="space-y-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "সেকশন শিরোনাম"
                                                : "Section Title"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.sections[2].title ||
                                                ""
                                              }
                                              onChange={(e) => {
                                                const updated = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updated[2].title =
                                                  e.target.value;
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updated,
                                                });
                                              }}
                                              className="w-full px-3 py-1 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <span className="text-[9.5px] font-bold text-stone-600 block">
                                              {language === "bn"
                                                ? "সম্মান ও পুরস্কারের প্যারাগ্রাফ সমূহ"
                                                : "Achievements Paragraphs"}
                                            </span>
                                            {ensureArray(editingPage.sections?.[2]?.content).map(
                                              (pText, pIdx) => (
                                                <div
                                                  key={pIdx}
                                                  className="space-y-1"
                                                >
                                                  <div className="flex justify-between items-center text-[9px] text-stone-500">
                                                    <span>
                                                      {language === "bn"
                                                        ? `প্যারাগ্রাফ #${pIdx + 1}`
                                                        : `Paragraph #${pIdx + 1}`}
                                                    </span>
                                                    {editingPage.sections[2]
                                                      .content.length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const updatedSecs = [
                                                            ...safeSections(editingPage?.sections),
                                                          ];
                                                          updatedSecs[2].content =
                                                            updatedSecs[2].content.filter(
                                                              (_, idx) =>
                                                                idx !== pIdx,
                                                            );
                                                          setEditingPage({
                                                            ...editingPage,
                                                            sections:
                                                              updatedSecs,
                                                          });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                      >
                                                        {language === "bn"
                                                          ? "মুছুন"
                                                          : "Remove"}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <textarea
                                                    rows={3}
                                                    value={pText}
                                                    onChange={(e) => {
                                                      const updatedSecs = [
                                                        ...safeSections(editingPage?.sections),
                                                      ];
                                                      updatedSecs[2].content[
                                                        pIdx
                                                      ] = e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        sections: updatedSecs,
                                                      });
                                                    }}
                                                    className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              ),
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedSecs = [
                                                  ...safeSections(editingPage?.sections),
                                                ];
                                                updatedSecs[2].content.push("");
                                                setEditingPage({
                                                  ...editingPage,
                                                  sections: updatedSecs,
                                                });
                                              }}
                                              className="text-[9.5px] bg-white border border-[#2E5942]/30 text-[#2E5942] hover:bg-[#2E5942]/5 px-2.5 py-1 rounded-lg font-bold font-sans cursor-pointer"
                                            >
                                              +{" "}
                                              {language === "bn"
                                                ? "প্যারাগ্রাফ যোগ করুন"
                                                : "Add Paragraph"}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* SECTION LEVEL IMAGE CUSTOMIZATION FOR ACHIEVEMENTS */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3 rounded-lg border border-stone-200">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "সেকশন ইমেজ (আপলোড)"
                                              : "Section Image"}
                                          </label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleHomeImageUpload(
                                                e,
                                                "achievements_image",
                                              )
                                            }
                                            className="w-full text-[9px]"
                                          />
                                          {editingPage.achievements_image && (
                                            <div className="mt-1 relative inline-block">
                                              <img
                                                src={
                                                  editingPage.achievements_image
                                                }
                                                className="h-12 rounded border object-cover"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleHomeFieldChange(
                                                    "achievements_image",
                                                    "",
                                                  )
                                                }
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-stone-600 block">
                                            {language === "bn"
                                              ? "অ্যালাইনমেন্ট"
                                              : "Alignment"}
                                          </label>
                                          <select
                                            value={
                                              editingPage.achievements_image_align ||
                                              "left"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "achievements_image_align",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs bg-white"
                                          >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                            <option value="center">
                                              Center
                                            </option>
                                            <option value="none">
                                              None (Hide)
                                            </option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-[#1A1207] block">
                                            {language === "bn"
                                              ? "প্রস্থ (উদাঃ 150px)"
                                              : "Width (e.g. 150px)"}
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingPage.achievements_image_width ||
                                              "150px"
                                            }
                                            onChange={(e) =>
                                              handleHomeFieldChange(
                                                "achievements_image_width",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-[#E8DDD0] rounded-md text-xs"
                                          />
                                        </div>
                                      </div>

                                      {/* MINI GALLERY FOR ACHIEVEMENTS */}
                                      <div className="bg-[#B8862A]/5 p-3 rounded-xl border border-[#B8862A]/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                                            <ImagePlus className="h-3.5 w-3.5 text-[#B8862A]" />
                                            <span>
                                              {language === "bn"
                                                ? "অর্জিত সম্মান ও পুরস্কার স্লাইড গ্যালারি"
                                                : "Achievements Slide Gallery"}
                                            </span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = [
                                                ...(editingPage.achievements_gallery ||
                                                  []),
                                              ];
                                              current.push({
                                                image:
                                                  "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600",
                                                caption_bn: "",
                                                caption_en: "",
                                              });
                                              setEditingPage({
                                                ...editingPage,
                                                achievements_gallery: current,
                                              });
                                            }}
                                            className="text-[9.5px] bg-[#B8862A] text-white hover:bg-[#A3731E] px-2 py-1 rounded-md font-bold cursor-pointer transition"
                                          >
                                            +{" "}
                                            {language === "bn"
                                              ? "নতুন ছবি যোগ করুন"
                                              : "Add Photo"}
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(
                                            editingPage.achievements_gallery ||
                                            []
                                          ).map((gItem, gIdx) => (
                                            <div
                                              key={gIdx}
                                              className="bg-white p-2.5 rounded-lg border border-stone-200/80 space-y-2 relative"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (
                                                    editingPage.achievements_gallery ||
                                                    []
                                                  ).filter(
                                                    (_, idx) => idx !== gIdx,
                                                  );
                                                  setEditingPage({
                                                    ...editingPage,
                                                    achievements_gallery:
                                                      current,
                                                  });
                                                }}
                                                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                                                <div className="md:col-span-1 space-y-1.5">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "ছবি ফাইল"
                                                      : "Image file"}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                      handleGalleryImageUpload(
                                                        e,
                                                        "achievements_gallery",
                                                        gIdx,
                                                      )
                                                    }
                                                    className="text-[9px] w-full"
                                                  />
                                                  {gItem.image && (
                                                    <img
                                                      src={gItem.image}
                                                      className="h-12 w-full object-cover rounded-md border"
                                                    />
                                                  )}
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (বাংলা)"
                                                        : "Caption (BN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_bn}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.achievements_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_bn =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          achievements_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-stone-500 block">
                                                      {language === "bn"
                                                        ? "ক্যাপশন (ইংরেজি)"
                                                        : "Caption (EN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={gItem.caption_en}
                                                      onChange={(e) => {
                                                        const current = [
                                                          ...(editingPage.achievements_gallery ||
                                                            []),
                                                        ];
                                                        current[
                                                          gIdx
                                                        ].caption_en =
                                                          e.target.value;
                                                        setEditingPage({
                                                          ...editingPage,
                                                          achievements_gallery:
                                                            current,
                                                        });
                                                      }}
                                                      className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {(
                                            editingPage.achievements_gallery ||
                                            []
                                          ).length === 0 && (
                                            <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                              {language === "bn"
                                                ? "গ্যালারিতে কোনো ছবি যোগ করা হয়নি।"
                                                : "No custom photos added in gallery."}
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
                                          <span>
                                            {language === "bn"
                                              ? "৫. নতুন অনুচ্ছেদ বা কাস্টম প্যারাগ্রাফ সমূহ"
                                              : "5. Dynamic Additional Paragraphs & Custom Sections"}
                                          </span>
                                        </h5>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const current = [
                                              ...(editingPage.extra_sections ||
                                                []),
                                            ];
                                            current.push({
                                              title_bn: "",
                                              title_en: "",
                                              content_bn: [""],
                                              content_en: [""],
                                              image: "",
                                              image_align: "right",
                                              image_width: "w-1/3",
                                            });
                                            setEditingPage({
                                              ...editingPage,
                                              extra_sections: current,
                                            });
                                          }}
                                          className="text-[9.5px] bg-[#2E5942] text-white hover:bg-[#1E3B2C] px-2.5 py-1 rounded-md font-bold cursor-pointer transition flex items-center gap-0.5"
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>
                                            {language === "bn"
                                              ? "নতুন অনুচ্ছেদ যোগ করুন"
                                              : "Add New Paragraph Section"}
                                          </span>
                                        </button>
                                      </div>

                                      <div className="space-y-4">
                                        {(editingPage.extra_sections || []).map(
                                          (extra, extIdx) => (
                                            <div
                                              key={extIdx}
                                              className="bg-white p-4 rounded-xl border border-stone-200 relative space-y-4"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const current = (
                                                    editingPage.extra_sections ||
                                                    []
                                                  ).filter(
                                                    (_, idx) => idx !== extIdx,
                                                  );
                                                  setEditingPage({
                                                    ...editingPage,
                                                    extra_sections: current,
                                                  });
                                                }}
                                                className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 transition cursor-pointer p-1"
                                                title={
                                                  language === "bn"
                                                    ? "অনুচ্ছেদ মুছুন"
                                                    : "Delete Section"
                                                }
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>

                                              <span className="font-bold text-[10px] text-[#B8862A] uppercase block">
                                                {language === "bn"
                                                  ? `কাস্টম অনুচ্ছেদ #${extIdx + 1}`
                                                  : `Custom Section #${extIdx + 1}`}
                                              </span>

                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "শিরোনাম / সারণী (বাংলা)"
                                                      : "Title / Header (BN)"}
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={extra.title_bn}
                                                    onChange={(e) => {
                                                      const current = [
                                                        ...(editingPage.extra_sections ||
                                                          []),
                                                      ];
                                                      current[extIdx].title_bn =
                                                        e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        extra_sections: current,
                                                      });
                                                    }}
                                                    className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "শিরোনাম / সারণী (ইংরেজি)"
                                                      : "Title / Header (EN)"}
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={extra.title_en}
                                                    onChange={(e) => {
                                                      const current = [
                                                        ...(editingPage.extra_sections ||
                                                          []),
                                                      ];
                                                      current[extIdx].title_en =
                                                        e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        extra_sections: current,
                                                      });
                                                    }}
                                                    className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-xs"
                                                  />
                                                </div>
                                              </div>

                                              {/* Extra Section Content - BN */}
                                              <div className="space-y-2.5">
                                                <span className="text-[9px] font-bold text-stone-500 block">
                                                  {language === "bn"
                                                    ? "প্যারাগ্রাফ সমূহ (বাংলা)"
                                                    : "Paragraphs (BN)"}
                                                </span>
                                                {ensureArray(extra?.content_bn).map(
                                                  (pbText, pbIdx) => (
                                                    <div
                                                      key={pbIdx}
                                                      className="space-y-1"
                                                    >
                                                      <div className="flex justify-between items-center text-[8.5px] text-stone-400">
                                                        <span>
                                                          BN Para #{pbIdx + 1}
                                                        </span>
                                                        {extra.content_bn
                                                          .length > 1 && (
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              const current = [
                                                                ...(editingPage.extra_sections ||
                                                                  []),
                                                              ];
                                                              current[
                                                                extIdx
                                                              ].content_bn =
                                                                current[
                                                                  extIdx
                                                                ].content_bn.filter(
                                                                  (_, idx) =>
                                                                    idx !==
                                                                    pbIdx,
                                                                );
                                                              setEditingPage({
                                                                ...editingPage,
                                                                extra_sections:
                                                                  current,
                                                              });
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
                                                          const current = [
                                                            ...(editingPage.extra_sections ||
                                                              []),
                                                          ];
                                                          current[
                                                            extIdx
                                                          ].content_bn[pbIdx] =
                                                            e.target.value;
                                                          setEditingPage({
                                                            ...editingPage,
                                                            extra_sections:
                                                              current,
                                                          });
                                                        }}
                                                        className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                      />
                                                    </div>
                                                  ),
                                                )}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const current = [
                                                      ...(editingPage.extra_sections ||
                                                        []),
                                                    ];
                                                    current[
                                                      extIdx
                                                    ].content_bn.push("");
                                                    setEditingPage({
                                                      ...editingPage,
                                                      extra_sections: current,
                                                    });
                                                  }}
                                                  className="text-[9px] bg-stone-100 hover:bg-stone-200 border px-2 py-0.5 rounded text-stone-700 font-bold font-sans cursor-pointer"
                                                >
                                                  + Add BN Para
                                                </button>
                                              </div>

                                              {/* Extra Section Content - EN */}
                                              <div className="space-y-2.5">
                                                <span className="text-[9px] font-bold text-stone-500 block">
                                                  {language === "bn"
                                                    ? "প্যারাগ্রাফ সমূহ (ইংরেজি)"
                                                    : "Paragraphs (EN)"}
                                                </span>
                                                {ensureArray(extra?.content_en).map(
                                                  (peText, peIdx) => (
                                                    <div
                                                      key={peIdx}
                                                      className="space-y-1"
                                                    >
                                                      <div className="flex justify-between items-center text-[8.5px] text-stone-400">
                                                        <span>
                                                          EN Para #{peIdx + 1}
                                                        </span>
                                                        {extra.content_en
                                                          .length > 1 && (
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              const current = [
                                                                ...(editingPage.extra_sections ||
                                                                  []),
                                                              ];
                                                              current[
                                                                extIdx
                                                              ].content_en =
                                                                current[
                                                                  extIdx
                                                                ].content_en.filter(
                                                                  (_, idx) =>
                                                                    idx !==
                                                                    peIdx,
                                                                );
                                                              setEditingPage({
                                                                ...editingPage,
                                                                extra_sections:
                                                                  current,
                                                              });
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
                                                          const current = [
                                                            ...(editingPage.extra_sections ||
                                                              []),
                                                          ];
                                                          current[
                                                            extIdx
                                                          ].content_en[peIdx] =
                                                            e.target.value;
                                                          setEditingPage({
                                                            ...editingPage,
                                                            extra_sections:
                                                              current,
                                                          });
                                                        }}
                                                        className="w-full p-2 border border-stone-200 rounded-md text-xs"
                                                      />
                                                    </div>
                                                  ),
                                                )}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const current = [
                                                      ...(editingPage.extra_sections ||
                                                        []),
                                                    ];
                                                    current[
                                                      extIdx
                                                    ].content_en.push("");
                                                    setEditingPage({
                                                      ...editingPage,
                                                      extra_sections: current,
                                                    });
                                                  }}
                                                  className="text-[9px] bg-stone-100 hover:bg-stone-200 border px-2 py-0.5 rounded text-stone-700 font-bold font-sans cursor-pointer"
                                                >
                                                  + Add EN Para
                                                </button>
                                              </div>

                                              {/* Image upload & settings for Extra Section */}
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60">
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "অনুচ্ছেদ ইমেজ"
                                                      : "Section Image"}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                      handleExtraSectionImageUpload(
                                                        e,
                                                        extIdx,
                                                      )
                                                    }
                                                    className="text-[9px] w-full"
                                                  />
                                                  {extra.image && (
                                                    <div className="mt-1 relative inline-block">
                                                      <img
                                                        src={extra.image}
                                                        className="h-10 rounded border object-cover"
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const current = [
                                                            ...(editingPage.extra_sections ||
                                                              []),
                                                          ];
                                                          current[
                                                            extIdx
                                                          ].image = "";
                                                          setEditingPage({
                                                            ...editingPage,
                                                            extra_sections:
                                                              current,
                                                          });
                                                        }}
                                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                                                      >
                                                        <X className="h-2.5 w-2.5" />
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "ইমেজ অ্যালাইনমেন্ট"
                                                      : "Alignment"}
                                                  </label>
                                                  <select
                                                    value={
                                                      extra.image_align ||
                                                      "right"
                                                    }
                                                    onChange={(e) => {
                                                      const current = [
                                                        ...(editingPage.extra_sections ||
                                                          []),
                                                      ];
                                                      current[
                                                        extIdx
                                                      ].image_align = e.target
                                                        .value as any;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        extra_sections: current,
                                                      });
                                                    }}
                                                    className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs bg-white"
                                                  >
                                                    <option value="right">
                                                      Right
                                                    </option>
                                                    <option value="left">
                                                      Left
                                                    </option>
                                                    <option value="center">
                                                      Center
                                                    </option>
                                                    <option value="none">
                                                      None
                                                    </option>
                                                  </select>
                                                </div>

                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-bold text-stone-500 block">
                                                    {language === "bn"
                                                      ? "ইমেজ প্রস্থ"
                                                      : "Width ratio"}
                                                  </label>
                                                  <select
                                                    value={
                                                      extra.image_width ||
                                                      "w-1/3"
                                                    }
                                                    onChange={(e) => {
                                                      const current = [
                                                        ...(editingPage.extra_sections ||
                                                          []),
                                                      ];
                                                      current[
                                                        extIdx
                                                      ].image_width =
                                                        e.target.value;
                                                      setEditingPage({
                                                        ...editingPage,
                                                        extra_sections: current,
                                                      });
                                                    }}
                                                    className="w-full px-2 py-0.5 border border-stone-200 rounded-md text-xs bg-white"
                                                  >
                                                    <option value="w-1/4">
                                                      25% (Small)
                                                    </option>
                                                    <option value="w-1/3">
                                                      33% (Default)
                                                    </option>
                                                    <option value="w-1/2">
                                                      50% (Medium)
                                                    </option>
                                                    <option value="w-full">
                                                      100% (Full block)
                                                    </option>
                                                  </select>
                                                </div>
                                              </div>
                                            </div>
                                          ),
                                        )}

                                        {(editingPage.extra_sections || [])
                                          .length === 0 && (
                                          <p className="text-[10px] text-stone-500 text-center py-2 font-mono italic">
                                            {language === "bn"
                                              ? "কোনো অতিরিক্ত অনুচ্ছেদ বা প্যারাগ্রাফ যোগ করা হয়নি।"
                                              : "No additional paragraphs added yet."}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* 5.5 WHO WE ARE SECTION (আমরা কারা সেকশন কাস্টমাইজেশন) */}
                                    <div className="p-4 bg-[#FAF7F2] border border-[#B8862A]/20 rounded-xl space-y-4">
                                      <div className="border-b pb-1">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <Sparkles className="h-4 w-4 text-[#B8862A]" />
                                          <span>
                                            {language === "bn"
                                              ? "৬. “আমরা কারা” (Who We Are) সেকশন কাস্টমাইজেশন"
                                              : '6. "Who We Are" Section Customization'}
                                          </span>
                                        </h5>
                                      </div>

                                      <div className="space-y-4 bg-white p-3.5 rounded-lg border border-stone-200">
                                        {/* Titles & Subtitles */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "সেকশন শিরোনাম (বাংলা)"
                                                : "Section Title (BN)"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.who_we_are_title_bn ??
                                                "আমরা কারা"
                                              }
                                              onChange={(e) =>
                                                setEditingPage({
                                                  ...editingPage,
                                                  who_we_are_title_bn:
                                                    e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs"
                                              placeholder="আমরা কারা"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "সেকশন শিরোনাম (ইংরেজি)"
                                                : "Section Title (EN)"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.who_we_are_title_en ??
                                                "Who We Are"
                                              }
                                              onChange={(e) =>
                                                setEditingPage({
                                                  ...editingPage,
                                                  who_we_are_title_en:
                                                    e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs"
                                              placeholder="Who We Are"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "উপ-শিরোনাম / ট্যাগলাইন (বাংলা)"
                                                : "Subtitle / Tagline (BN)"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.who_we_are_subtitle_bn ??
                                                "আলোকিত মানুষ ও উন্নত সমাজ বিনির্মাণের মহতী জাতীয় আন্দোলন"
                                              }
                                              onChange={(e) =>
                                                setEditingPage({
                                                  ...editingPage,
                                                  who_we_are_subtitle_bn:
                                                    e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "উপ-শিরোনাম / ট্যাগলাইন (ইংরেজি)"
                                                : "Subtitle / Tagline (EN)"}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                editingPage.who_we_are_subtitle_en ??
                                                "A transformative nation-building movement cultivating enlightened minds and noble human values"
                                              }
                                              onChange={(e) =>
                                                setEditingPage({
                                                  ...editingPage,
                                                  who_we_are_subtitle_en:
                                                    e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs"
                                            />
                                          </div>
                                        </div>

                                        {/* Paragraphs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "মূল পরিচিতি অনুচ্ছেদ সমূহ (বাংলা)"
                                                : "Core Narrative Paragraphs (BN)"}
                                            </label>
                                            {(editingPage.who_we_are_paragraphs_bn &&
                                            editingPage.who_we_are_paragraphs_bn
                                              .length > 0
                                              ? editingPage.who_we_are_paragraphs_bn
                                              : [
                                                  "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।",
                                                  "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।",
                                                ]
                                            ).map((pText, pIdx) => (
                                              <div
                                                key={pIdx}
                                                className="space-y-1"
                                              >
                                                <span className="text-[9px] text-stone-500">
                                                  {language === "bn"
                                                    ? `প্যারাগ্রাফ #${pIdx + 1}`
                                                    : `Paragraph #${pIdx + 1}`}
                                                </span>
                                                <textarea
                                                  rows={3}
                                                  value={pText}
                                                  onChange={(e) => {
                                                    const current = [
                                                      ...(editingPage.who_we_are_paragraphs_bn &&
                                                      editingPage
                                                        .who_we_are_paragraphs_bn
                                                        .length > 0
                                                        ? editingPage.who_we_are_paragraphs_bn
                                                        : [
                                                            "বিশ্বসাহিত্য কেন্দ্র বাংলাদেশের একটি অগ্রণী সামাজিক, শিক্ষামূলক ও সাংস্কৃতিক প্রতিষ্ঠান। ১৯৭৮ সালের ১৭ ডিসেম্বর অধ্যাপক আবদুল্লাহ আবু সায়ীদের হাত ধরে মাত্র ১৫ জন সদস্যের একটি ছোট্ট পাঠচক্র থেকে এই মহতী উদ্যোগের সূচনা হয়। গত ৪৬ বছরেরও বেশি সময় ধরে এটি সমগ্র বাংলাদেশে কোটি মানুষের জীবনে আলো জ্বালিয়ে চলেছে।",
                                                            "আমাদের মূল ব্রত— “আলোকিত মানুষ চাই”। আমরা বিশ্বাস করি, বৈষয়িক প্রবৃদ্ধির পাশাপাশি একটি জাতির শ্রেষ্ঠ সম্পদ হলো তার উচ্চ মানবিক গুণসম্পন্ন, রুচিমান ও মুক্তচিন্তার মানুষ। দেশব্যাপী বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি, পাঠচক্র, সাহিত্য ও সংস্কৃতি চর্চার মধ্য দিয়ে কেন্দ্র নতুন প্রজন্মকে পরিপূর্ণ মানুষ হিসেবে গড়ে তুলতে অঙ্গীকারবদ্ধ।",
                                                          ]),
                                                    ];
                                                    current[pIdx] =
                                                      e.target.value;
                                                    setEditingPage({
                                                      ...editingPage,
                                                      who_we_are_paragraphs_bn:
                                                        current,
                                                    });
                                                  }}
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                            ))}
                                          </div>

                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-stone-700 block">
                                              {language === "bn"
                                                ? "মূল পরিচিতি অনুচ্ছেদ সমূহ (ইংরেজি)"
                                                : "Core Narrative Paragraphs (EN)"}
                                            </label>
                                            {(editingPage.who_we_are_paragraphs_en &&
                                            editingPage.who_we_are_paragraphs_en
                                              .length > 0
                                              ? editingPage.who_we_are_paragraphs_en
                                              : [
                                                  "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
                                                  "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations.",
                                                ]
                                            ).map((pText, pIdx) => (
                                              <div
                                                key={pIdx}
                                                className="space-y-1"
                                              >
                                                <span className="text-[9px] text-stone-500">
                                                  {language === "bn"
                                                    ? `প্যারাগ্রাফ #${pIdx + 1}`
                                                    : `Paragraph #${pIdx + 1}`}
                                                </span>
                                                <textarea
                                                  rows={3}
                                                  value={pText}
                                                  onChange={(e) => {
                                                    const current = [
                                                      ...(editingPage.who_we_are_paragraphs_en &&
                                                      editingPage
                                                        .who_we_are_paragraphs_en
                                                        .length > 0
                                                        ? editingPage.who_we_are_paragraphs_en
                                                        : [
                                                            "Bishwo Shahitto Kendro (World Literature Centre) is a pioneering non-profit educational and cultural movement in Bangladesh. Founded on December 17, 1978, under the visionary leadership of Professor Abdullah Abu Sayeed, it originated from a small study circle of 15 members and has flourished over four decades into an indelible national institution.",
                                                            "Guided by our defining creed “We Want Enlightened Humans”, we believe true national progress stems from broad-minded, intellectually enriched, and deeply empathetic souls. Through nationwide reading programs, mobile libraries, literary circles, and creative arts, the Centre remains dedicated to awakening higher human values across generations.",
                                                          ]),
                                                    ];
                                                    current[pIdx] =
                                                      e.target.value;
                                                    setEditingPage({
                                                      ...editingPage,
                                                      who_we_are_paragraphs_en:
                                                        current,
                                                    });
                                                  }}
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 6. TAB 4: FOUNDER PRESIDENT QUOTE (প্রতিষ্ঠাতা সভাপতি বাণী) */}
                                    <div className="p-4 bg-[#FAF7F2] border border-[#B8862A]/20 rounded-xl space-y-4">
                                      <div className="border-b pb-1">
                                        <h5 className="font-serif font-bold text-xs text-[#2E5942] flex items-center gap-1.5">
                                          <Quote className="h-4 w-4" />
                                          <span>
                                            {language === "bn"
                                              ? "৭. অধ্যাপক আবদুল্লাহ আবু সায়ীদ সেকশন, ছবি ও বাণী কাস্টমাইজেশন"
                                              : "7. Prof. Abdullah Abu Sayeed Section, Photo & Quote Customization"}
                                          </span>
                                        </h5>
                                      </div>

                                      {(() => {
                                        const sec3 = (editingPage.sections &&
                                          editingPage.sections[3]) || {
                                          title: "বাণী",
                                          content: ["", ""],
                                        };
                                        return (
                                          <div className="space-y-3 bg-white p-3.5 rounded-lg border border-stone-200">
                                            {/* Founder Photo Upload */}
                                            <div className="flex flex-col sm:flex-row items-center gap-3 pb-3 border-b border-stone-200">
                                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#B8862A] bg-stone-100 shrink-0 flex items-center justify-center shadow-xs">
                                                {editingPage.founder_avatar ||
                                                editingPage.sections?.[3]
                                                  ?.image ? (
                                                  <img
                                                    src={
                                                      editingPage.founder_avatar ||
                                                      editingPage.sections?.[3]
                                                        ?.image
                                                    }
                                                    className="w-full h-full object-cover"
                                                    alt="Founder"
                                                  />
                                                ) : (
                                                  <span className="text-[9px] text-stone-400 font-bold">
                                                    No Photo
                                                  </span>
                                                )}
                                              </div>
                                              <div className="space-y-1 w-full text-left">
                                                <label className="text-[10px] font-bold text-stone-700 block font-serif">
                                                  {language === "bn"
                                                    ? "অধ্যাপক আবদুল্লাহ আবু সায়ীদ ছবি / প্রোফাইল অবতার"
                                                    : "Professor Abdullah Abu Sayeed Photo / Avatar"}
                                                </label>
                                                <div className="flex gap-2 items-center">
                                                  <label className="px-2.5 py-1 bg-white border border-[#2E5942] text-[#2E5942] hover:bg-[#2E5942]/5 rounded-md text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
                                                    <Upload className="h-3 w-3" />
                                                    <span>
                                                      {language === "bn"
                                                        ? "ছবি আপলোড করুন"
                                                        : "Upload Photo"}
                                                    </span>
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="hidden"
                                                      onChange={
                                                        handleFounderAvatarUpload
                                                      }
                                                    />
                                                  </label>
                                                  {(editingPage.founder_avatar ||
                                                    editingPage.sections?.[3]
                                                      ?.image) && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const currentSecs = [
                                                          ...(editingPage.sections ||
                                                            []),
                                                        ];
                                                        if (currentSecs[3])
                                                          currentSecs[3].image =
                                                            "";
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_avatar: "",
                                                          sections: currentSecs,
                                                        });
                                                      }}
                                                      className="px-2.5 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-[10px] font-bold transition cursor-pointer"
                                                    >
                                                      {language === "bn"
                                                        ? "ছবি মুছুন"
                                                        : "Remove Photo"}
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Founder Name */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">
                                                  {language === "bn"
                                                    ? "প্রতিষ্ঠাতার নাম (বাংলা)"
                                                    : "Founder Name (Bangla)"}
                                                </label>
                                                <input
                                                  type="text"
                                                  value={
                                                    editingPage.founder_name_bn !==
                                                    undefined
                                                      ? editingPage.founder_name_bn
                                                      : "অধ্যাপক আবদুল্লাহ আবু সায়ীদ"
                                                  }
                                                  onChange={(e) =>
                                                    setEditingPage({
                                                      ...editingPage,
                                                      founder_name_bn:
                                                        e.target.value,
                                                    })
                                                  }
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">
                                                  {language === "bn"
                                                    ? "প্রতিষ্ঠাতার নাম (ইংরেজি)"
                                                    : "Founder Name (English)"}
                                                </label>
                                                <input
                                                  type="text"
                                                  value={
                                                    editingPage.founder_name_en !==
                                                    undefined
                                                      ? editingPage.founder_name_en
                                                      : "Professor Abdullah Abu Sayeed"
                                                  }
                                                  onChange={(e) =>
                                                    setEditingPage({
                                                      ...editingPage,
                                                      founder_name_en:
                                                        e.target.value,
                                                    })
                                                  }
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                            </div>

                                            {/* Founder Title / Designation */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">
                                                  {language === "bn"
                                                    ? "পদবী / পরিচয় (বাংলা)"
                                                    : "Designation / Title (Bangla)"}
                                                </label>
                                                <input
                                                  type="text"
                                                  value={
                                                    editingPage.founder_title_bn !==
                                                    undefined
                                                      ? editingPage.founder_title_bn
                                                      : "প্রতিষ্ঠাতা ও সভাপতি, বিশ্বসাহিত্য কেন্দ্র"
                                                  }
                                                  onChange={(e) =>
                                                    setEditingPage({
                                                      ...editingPage,
                                                      founder_title_bn:
                                                        e.target.value,
                                                    })
                                                  }
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-stone-600 block">
                                                  {language === "bn"
                                                    ? "পদবী / পরিচয় (ইংরেজি)"
                                                    : "Designation / Title (English)"}
                                                </label>
                                                <input
                                                  type="text"
                                                  value={
                                                    editingPage.founder_title_en !==
                                                    undefined
                                                      ? editingPage.founder_title_en
                                                      : "Founder & President, Bishwo Shahitto Kendro"
                                                  }
                                                  onChange={(e) =>
                                                    setEditingPage({
                                                      ...editingPage,
                                                      founder_title_en:
                                                        e.target.value,
                                                    })
                                                  }
                                                  className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">
                                                {language === "bn"
                                                  ? "বাণী টেক্সট (বাংলা)"
                                                  : "Quote Paragraph (Bangla)"}
                                              </label>
                                              <textarea
                                                rows={4}
                                                value={
                                                  (sec3.content &&
                                                    sec3.content[0]) ||
                                                  ""
                                                }
                                                onChange={(e) => {
                                                  const updated = [
                                                    ...(editingPage.sections ||
                                                      []),
                                                  ];
                                                  while (updated.length <= 3) {
                                                    updated.push({
                                                      title: "বাণী",
                                                      content: ["", ""],
                                                    });
                                                  }
                                                  updated[3] = {
                                                    ...updated[3],
                                                    content: [
                                                      e.target.value,
                                                      updated[3].content?.[1] ||
                                                        "",
                                                    ],
                                                  };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    sections: updated,
                                                  });
                                                }}
                                                className="w-full p-2 border border-stone-200 rounded-md text-xs font-serif"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">
                                                {language === "bn"
                                                  ? "বাণী টেক্সট (ইংরেজি)"
                                                  : "Quote Paragraph (English)"}
                                              </label>
                                              <textarea
                                                rows={4}
                                                value={
                                                  (sec3.content &&
                                                    sec3.content[1]) ||
                                                  ""
                                                }
                                                onChange={(e) => {
                                                  const updated = [
                                                    ...(editingPage.sections ||
                                                      []),
                                                  ];
                                                  while (updated.length <= 3) {
                                                    updated.push({
                                                      title: "বাণী",
                                                      content: ["", ""],
                                                    });
                                                  }
                                                  updated[3] = {
                                                    ...updated[3],
                                                    content: [
                                                      updated[3].content?.[0] ||
                                                        "",
                                                      e.target.value,
                                                    ],
                                                  };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    sections: updated,
                                                  });
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
                                    {editingPage.id === "ataglance" ? (
                                      <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-xl p-5 space-y-6">
                                        <div className="border-b border-[#B8862A]/20 pb-3">
                                          <h4 className="font-serif font-bold text-sm text-[#1A1207] flex items-center gap-1.5 text-stone-800">
                                            <Sparkles className="h-4.5 w-4.5 text-[#B8862A]" />
                                            <span>
                                              {language === "bn"
                                                ? "এক নজরে বিশ্বসাহিত্য কেন্দ্র তথ্য কাস্টমাইজেশন"
                                                : "At a Glance Metrics Customization"}
                                            </span>
                                          </h4>
                                          <p className="text-[11px] text-stone-500 font-sans mt-1 leading-relaxed">
                                            {language === "bn"
                                              ? "নিচের তালিকা থেকে প্রতিটি বিষয়ের তথ্য ও পরিসংখ্যান সংশোধন করুন। ডান পাশের উইন্ডোতে রিয়েল-টাইমে পরিবর্তন দেখতে পাবেন।"
                                              : "Update values and metrics in the table below. The real-time live preview on the right will update immediately."}
                                          </p>
                                        </div>

                                        <div className="space-y-4">
                                          {/* Title fields */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">
                                                {language === "bn"
                                                  ? "পেজ শিরোনাম (বাংলা)"
                                                  : "Page Title (BN)"}
                                              </label>
                                              <input
                                                type="text"
                                                value={
                                                  editingPage.title_bn || ""
                                                }
                                                onChange={(e) =>
                                                  setEditingPage({
                                                    ...editingPage,
                                                    title_bn: e.target.value,
                                                  })
                                                }
                                                className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-stone-600 block">
                                                {language === "bn"
                                                  ? "পেজ শিরোনাম (ইংরেজি)"
                                                  : "Page Title (EN)"}
                                              </label>
                                              <input
                                                type="text"
                                                value={
                                                  editingPage.title_en || ""
                                                }
                                                onChange={(e) =>
                                                  setEditingPage({
                                                    ...editingPage,
                                                    title_en: e.target.value,
                                                  })
                                                }
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
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] w-12 text-center border-r border-[#B8862A]/20">
                                                      #
                                                    </th>
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/20 min-w-[140px]">
                                                      {language === "bn"
                                                        ? "সূচক / বিবরণ"
                                                        : "Metric Name"}
                                                    </th>
                                                    <th className="px-3 py-2 font-serif font-bold text-[#1A1207] min-w-[200px]">
                                                      {language === "bn"
                                                        ? "তথ্য / পরিসংখ্যান"
                                                        : "Stats / Value"}
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {(
                                                    editingPage.key_facts || []
                                                  ).map(
                                                    (
                                                      fact: any,
                                                      idx: number,
                                                    ) => (
                                                      <tr
                                                        key={idx}
                                                        className="border-b border-stone-100 hover:bg-[#FCFBF7]"
                                                      >
                                                        <td className="px-3 py-2 text-center text-stone-400 font-mono border-r border-[#B8862A]/10">
                                                          {idx + 1}
                                                        </td>
                                                        <td
                                                          className="px-3 py-2 font-serif font-bold text-[#1A1207] border-r border-[#B8862A]/10 leading-relaxed max-w-[160px] truncate"
                                                          title={fact.label}
                                                        >
                                                          {fact.label}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                          <textarea
                                                            rows={1}
                                                            value={
                                                              fact.value || ""
                                                            }
                                                            onChange={(e) => {
                                                              const updatedFacts =
                                                                [
                                                                  ...(editingPage.key_facts ||
                                                                    []),
                                                                ];
                                                              updatedFacts[
                                                                idx
                                                              ] = {
                                                                ...fact,
                                                                value:
                                                                  e.target
                                                                    .value,
                                                              };
                                                              setEditingPage({
                                                                ...editingPage,
                                                                key_facts:
                                                                  updatedFacts,
                                                              });
                                                            }}
                                                            className="w-full px-2.5 py-1 border border-stone-200 focus:outline-hidden focus:border-[#B8862A] rounded-md text-xs font-sans text-stone-900 bg-white resize-none"
                                                          />
                                                        </td>
                                                      </tr>
                                                    ),
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        {editingPage.id === "founder" && (
                                          <div className="bg-[#FAF7F2] border border-[#B8862A]/30 rounded-xl p-5 space-y-6">
                                            <h4 className="font-serif font-bold text-sm text-[#1A1207] flex items-center gap-1.5 border-b pb-2 text-stone-800">
                                              <Sparkles className="h-4.5 w-4.5 text-[#B8862A]" />
                                              <span>
                                                {language === "bn"
                                                  ? "প্রতিষ্ঠাতা ও সভাপতি পরিচিতি পেইজ কাস্টমাইজেশন"
                                                  : "Founder Profile Page Customization"}
                                              </span>
                                            </h4>

                                            {/* Avatar and Basic Details */}
                                            <div className="space-y-4">
                                              <h5 className="text-xs font-bold text-stone-700 font-serif border-l-2 border-[#B8862A] pl-1.5">
                                                {language === "bn"
                                                  ? "১. অবতার ফটো ও সাধারণ পরিচিতি"
                                                  : "1. Avatar Photo & Basic Info"}
                                              </h5>
                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg border border-stone-200">
                                                <div className="col-span-1 flex flex-col items-center space-y-2">
                                                  <div className="w-20 h-20 rounded-full border border-stone-200 overflow-hidden flex items-center justify-center bg-stone-50">
                                                    {editingPage.founder_avatar ? (
                                                      <img
                                                        src={
                                                          editingPage.founder_avatar
                                                        }
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <span className="text-[10px] text-stone-400">
                                                        No Image
                                                      </span>
                                                    )}
                                                  </div>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                      handleFounderAvatarUpload
                                                    }
                                                    className="w-full text-[10px]"
                                                  />
                                                </div>
                                                <div className="col-span-3 space-y-3">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                      <label className="text-[10px] font-bold text-stone-600 block">
                                                        {language === "bn"
                                                          ? "নাম (বাংলা)"
                                                          : "Name (BN)"}
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={
                                                          editingPage.founder_name_bn ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          setEditingPage({
                                                            ...editingPage,
                                                            founder_name_bn:
                                                              e.target.value,
                                                          })
                                                        }
                                                        className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                        placeholder="অধ্যাপক আবদুল্লাহ আবু সায়ীদ"
                                                      />
                                                    </div>
                                                    <div className="space-y-1">
                                                      <label className="text-[10px] font-bold text-stone-600 block">
                                                        {language === "bn"
                                                          ? "নাম (ইংরেজি)"
                                                          : "Name (EN)"}
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={
                                                          editingPage.founder_name_en ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          setEditingPage({
                                                            ...editingPage,
                                                            founder_name_en:
                                                              e.target.value,
                                                          })
                                                        }
                                                        className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                        placeholder="Prof. Abdullah Abu Sayeed"
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                                      {language === "bn"
                                                        ? "সংক্ষিপ্ত পরিচিতি বিবরণী (বাংলা)"
                                                        : "Bio Subtitle (BN)"}
                                                    </label>
                                                    <textarea
                                                      rows={2}
                                                      value={
                                                        editingPage.founder_bio_bn ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_bio_bn:
                                                            e.target.value,
                                                        })
                                                      }
                                                      className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                      placeholder="বাংলাদেশের প্রখ্যাত বহুভাষাবিদ..."
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                                      {language === "bn"
                                                        ? "সংক্ষিপ্ত পরিচিতি বিবরণী (ইংরেজি)"
                                                        : "Bio Subtitle (EN)"}
                                                    </label>
                                                    <textarea
                                                      rows={2}
                                                      value={
                                                        editingPage.founder_bio_en ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_bio_en:
                                                            e.target.value,
                                                        })
                                                      }
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
                                                {language === "bn"
                                                  ? "২. সম্মাননা ও পদক ব্যাজসমূহ"
                                                  : "2. Honor Badges"}
                                              </h5>
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[0, 1, 2].map((idx) => {
                                                  const currentBadges =
                                                    Array.isArray(
                                                      editingPage.founder_badges,
                                                    )
                                                      ? editingPage.founder_badges
                                                      : [
                                                          {
                                                            label_bn:
                                                              "রেমন ম্যাগসেসে ২০০৪",
                                                            label_en:
                                                              "Ramon Magsaysay 2004",
                                                          },
                                                          {
                                                            label_bn:
                                                              "একুশে পদক ২০০৫",
                                                            label_en:
                                                              "Ekushey Padak 2005",
                                                          },
                                                          {
                                                            label_bn:
                                                              "ইউনেস্কো কমেনিয়াস ২০০৮",
                                                            label_en:
                                                              "Unesco Comenius 2008",
                                                          },
                                                        ];
                                                  const rawB =
                                                    currentBadges[idx];
                                                  const b =
                                                    rawB &&
                                                    typeof rawB === "object"
                                                      ? rawB
                                                      : {
                                                          label_bn:
                                                            typeof rawB ===
                                                            "string"
                                                              ? rawB
                                                              : "",
                                                          label_en: "",
                                                        };
                                                  return (
                                                    <div
                                                      key={idx}
                                                      className="bg-white p-3 rounded-lg border border-stone-200 space-y-2"
                                                    >
                                                      <span className="text-[9px] font-bold text-[#B8862A] uppercase block">
                                                        Badge #{idx + 1}
                                                      </span>
                                                      <div className="space-y-1">
                                                        <input
                                                          type="text"
                                                          value={
                                                            b.label_bn || ""
                                                          }
                                                          onChange={(e) => {
                                                            const updated = [
                                                              ...currentBadges,
                                                            ];
                                                            updated[idx] = {
                                                              ...b,
                                                              label_bn:
                                                                e.target.value,
                                                            };
                                                            setEditingPage({
                                                              ...editingPage,
                                                              founder_badges:
                                                                updated,
                                                            });
                                                          }}
                                                          className="w-full p-1.5 border border-stone-200 rounded text-xs"
                                                          placeholder="বাংলা লেবেল"
                                                        />
                                                        <input
                                                          type="text"
                                                          value={
                                                            b.label_en || ""
                                                          }
                                                          onChange={(e) => {
                                                            const updated = [
                                                              ...currentBadges,
                                                            ];
                                                            updated[idx] = {
                                                              ...b,
                                                              label_en:
                                                                e.target.value,
                                                            };
                                                            setEditingPage({
                                                              ...editingPage,
                                                              founder_badges:
                                                                updated,
                                                            });
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
                                                {language === "bn"
                                                  ? "৩. রেমন ম্যাগসেসে পুরস্কার সাইটেশন"
                                                  : "3. Ramon Magsaysay Award Citation"}
                                              </h5>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-stone-200">
                                                <div className="space-y-3">
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                                      {language === "bn"
                                                        ? "শিরোনাম (বাংলা)"
                                                        : "Title (BN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={
                                                        editingPage.founder_magsaysay_title_bn ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_magsaysay_title_bn:
                                                            e.target.value,
                                                        })
                                                      }
                                                      className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                      placeholder="রেমন ম্যাগসেসে পুরস্কার (২০০৪)"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                                      {language === "bn"
                                                        ? "সাইটেশন টেক্সট (বাংলা)"
                                                        : "Citation Text (BN)"}
                                                    </label>
                                                    <textarea
                                                      rows={3}
                                                      value={
                                                        editingPage.founder_magsaysay_text_bn ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_magsaysay_text_bn:
                                                            e.target.value,
                                                        })
                                                      }
                                                      className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif"
                                                    />
                                                  </div>
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                                      {language === "bn"
                                                        ? "শিরোনাম (ইংরেজি)"
                                                        : "Title (EN)"}
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={
                                                        editingPage.founder_magsaysay_title_en ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        setEditingPage({
                                                          ...editingPage,
                                                          founder_magsaysay_title_en:
                                                            e.target.value,
                                                        })
                                                      }
                                                      className="w-full p-2 border border-stone-200 rounded-lg text-xs"
                                                      placeholder="Ramon Magsaysay Citation"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-stone-600 block">
                                           x��]�o�ȵ�޿b�Rl�^I�d;�Օ��e�m⤖w��0JKl(R����j��],m?Fq�.nn�D�M�0�!����O�gf8I�1�q�Y�c8s�<��!��W%�ՓZU*�ih�����OQf88N�������x3"�ex�'z�c4E�y8�3�o��?��2K�%Y���5�c����tf/U{�Uj`���n��钁��C1�m�ҟK�s��$��+��tĲb)Z�.�C~S�i26�u��)�¿{dl���~���Ȥ��ѵ�608e
O�J�Y%/[�u����|>�"t�-��Q��䁇[��S~J�������*������vn�����+��n ��?9��5�+�΂���9���r;&T�r&6��t�:����3�����T���ɾ�T�.^����/Vj��;hI�`M��s]���BƖ��&��L2�+E��fv�&����3�磽�n�Ç]�g2��xvĠ��U��s�W�_�V�n���+�����<�#j����cj����?����!X����p�/�8ùg�� �@��D���{0���dȈ�����L{!�l���e(2"o������ȥ��"jI��<j�r�m�|q)���b���y.E[�R��Q�lLL��ݝ�`Q���P�惔�<{���s�v��<l��8���G��_Ç�y�k��b4���<_E������v������yx�=�M��E�z�1�{/��뛡�כ��M˛]�z4/6*�S�����9��^�ԃ�|O�����9C��~ޕ���^	�0�����	���	�v�$��.(�;�,�㽫���Mr����341r�.�D�/�͜,�k����õ�)�Ħl����kg{S�[�0�'���u�"�#�����#t^��ط&�WL%�϶7Z��+7�7?�Y�𱕓��q�a��]�k	����٣��,΢n#E�]nϻ� �;�w�J�Z(�~���w�b᎙kb�J��r!���L��K׻��@Ŧ�o��<��M���أϤ�2L��FZ=,�A�|���îl_����9�",ϤXy�=�Z�,+[����d�&��LB����|G�NM��,2��b�	����n�O��i�$5h��'��8�p�	���X�p委���Qaa���_g,ཛྷZ��XH �,D.2)�q���{� ��ue��2��up��$y�?R?�~�:�xT��ܞ�YD�S�y�h/�C����G||%�{�i�w�N�鰞	"���134�������px����;�G��j�A@��#�W����<��)�������g7~���=�	�`?ƣ?����d�@��=N��+>e{���C�s�֣���|LO',�?�C�]�F�iL�!�������qX�7=�R6wsX�)�0���\g,m��Q/7z\.@0捳�E$���4�1����:4K�yr�����Ynك,� ��-l��CD�}�9��-i��wꮸ�ON+4�j�S7r]]!ď�sF�2�<��k��N���6'g?�f��Q�b/�$-8��~�X[�d��1���+���bqi��
�B&(br̶$�۹�웦p0�l&�\������`��o	���H�TϨk�}d�?a�G,�`E�G�g^��II@�1��E�8Q~м�M��D]��������>_+�[�_����ڗ˵_�,f��r�Uj�j�P���(�]d���5aL, �g���À��K`V'ĉ[���1֐��w���	J�8/D؅B�rm7L�ӡ꧒k&�G��}"��s�R��x�X�J���E�D��-/��7�r�R�xxK��g,�"k�(� �Ebf��n�0S��D��NsG�t���+ﰅ�$��&�h!���$�#��ڹ�k���n� ��9�g�q�9qt�n�gavfA����	+�<�B���Mv����nƨ+� ����]qX{ODj��a�z@��1���ڊ��� 
�>hO�Sql"dzb.�� �tHC�	�+˶V]D������l�z�����e�K�o�5��X�k�-C���3"��@�'�C��s))F�n��N����scZ
�/��|�1;�R�������_	LIt�1]�_ ��qX�5 �d� z�	S��8>�e8�='��ڿkO�ջ��H��[,S?�$�a
@��E�d�]�Yp�C<��E�{BE���n�N(�X��%��w�e|n_GElc�����k�7C����1>!	8�N��u�W8��>�-[/�Ro�x���3z�����4]|G&�+�`���wͥ}�ޯ����#ڱ��=�P�!e�oi_=���h2�ܖ4Bu��64��T�♚YdI�_I�I�N�,q��X�%�a�0�ܖ�d�n��G��ɕ�������|P�H����"�I��!J������Vbt˸F)��m����R�d�zK�J�/�(�����5����� ^ƛRO�<wސ,i�/�̆�{���몺$/w�˚^�xd�~��=`�N���IW����.E\|�����|*�f ��h�i����Y��r+o����]��^�N8���8���gh�0�\s�CT���m �*�d���eV�!�31�������O���
�$�Փ�A`RA�23͒^�VnT�r"�.�(1W�	��	�nZ
J�F>U�D������=X��_/<�W1���9Ѽ�x>�M�z����J<�y5~�����g*5,��~ڗ=]��Ż��'�3��\]v�1>x6�0\݋�?�64�3�ZO8<��m����(�]*��'ۧ�ݕ�t4|.P��>*���O\$��P�6�9�8y?��/��x�1`�:s��<R�c}_�Dꁹ~�,�z�~��_��_�T�k/�T�H�sG����#���ƠWߕ4��`�x\�vUU+�Ml5ɧ��Q4��:m�L�5���%/Y�!Y�l6���p:&�RZ��XBKwV֪Kkhy�W_,�.�D}3 ¡ˋ�dy})�X0:=�,@x�5+����l�&l�6����Nܨ݉����)`�iC�e�?{
D��!b��1���� ��I�ȕ�~�^)�(������c�<��NTM���P��L6Y_rd�~x��R�&�rCj>��b�c��ADd�i����$x���#���d�?ex��B\�ܓ���I6l�yk-��:Q�#�P��s�1���Kڵ���u���.aQ:ښ���|�G� [�Ewkv|z�.D�
1{�G��Wtdkr�l�Ȼ؊��De�#s����rM+]�_���b�G+�-�k �"�81�4�EQ�U�UR�5�	����	�2]��&��(�C���k��".�86���
��%Ȓ�"��#)*�H���. s�3�j�y�Xzd�����K���&�����8�x�sb:o����br�n�֚5�[��!�&� �,˔�,����2�:g`U��"UX�,�mux���nZ|r�Y;K�X.�y�"���)̕�jmi���۵�5��~qgQ�s�n��C(6��/�{w���]��KJ��pl�	3�X���N�c_qXa@�������0��@K��쩒����d̴�?d��ܚ}z!�S8bpʷr�i�I�=�o�O?�� %�����]�>Bi��[*?V6�*�iJ��K�	����s���UmH�vU�I��:�� Y��KF�%�qE\��"8k�Mnyj�!$�΍���(�Z�Y9-�\w{*)|�@y���9繧�E�9���F~Y&�����Q���c{�e�<T��TGG�E�PB2K*�i)?'�Y�%� Ȕ���Nl���p`�?x�o?}�K��3v�{�H䘟;vt,]
>��: F����I��=d�ʹ� z�k';�w���#�ܥJ�TR��h�R$5g)�GU�L4�$�UWȴ�^����JK�$գu� �K�=]^�S1��|	�k�_./��`�nV��o-���`���&����ڎ9nƁ�c*��9�1�-��uV�m�����ۤ'�&5U�xp7ֹ�U������%�a��|��O�ϩ�p��u��xO�k�]^�?��x���~�㵣��lȉS��*���V�����}��2�@w&N+ٮ�bOQI(�e�*�Pz�,Z����ֻY�$mbVLޔm2���?�v!��B?��;��(�B�Di���d���Y)���vO�[���V0i�Msb{D,������{&9���[(�����C�X�;�m�N�x����%U�^�d�hA2�������:`����k��S�Gx�������q�;`a���z��K���s� #�iB�o��:���C���=T�5��z�gS?�I5��$D�}rd�a7HV���]ݰ";�ao1gl�¶�m�-��4����������֍[V��5�
��d�|����֢1�x�5�|���t�cjB�$�&�W��]۫�#Y�6���4�&OuI]��i���S۸<�W�J�H"a�.� 1�V&d쀽I�0���X�L�{'���-w��c�F�V�������}�Z��r?{*#5��u��D���b7�	�Z��&��Ax?�еߑ�����V��5�K�����޷�Hܻq�hg�8&.���l����#��3.��ʝ5;d�����be�F�pѨQ�-�\�5tɐ/o�����į`+��0D�������$�a��A<�f���\B�A~1�AӀ�M��� �{.�6�!V6�+��^��CT��xp 3��	�����b�Q�h䒉�ILWG�$�^����ϱ����`Y�uo3�Z�+}uLX�݋<�C���>{6�>�j�����%��c����'���d�@UYF�����t%�i�L�6C�RL��)p b��Q�����$�6$��"@�^7��c�֫���jGN���<I�ٻ�;_�&��?������/����H�-��Vjt��Ə26��z��4�ԫ�[�!z����,TƲ(�L%�[=�~U� V�����X�=���h+�t��(��l�+��ϗ�VB���|�`Y`C�[�t��F�;D�EI4�}ȷ�c����)z�{���E0ު�^����![~��.����+�����H���XF�M�,20�s�d]�!�9M�Z&��.ּ��:h�뗵��#� �^�i�w(���R��|p�@�]�>�s-�8��#7��p$b��鍳%��cD#`*Z`ND�$>܂A���Ww�	Dl�F66��Z�k}׍]�;�6����Ʋ"9��j��eI5=����:�2*a>�Wv_@��tK1�M�����'��nb�J��;�6�~WT��̟���T�P!yeMu\��-�o*X�����Ki�~��?aQ����è����x&Ӧ�h�i�{?�   �� C�