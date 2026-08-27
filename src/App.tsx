import React from 'react';
import { Language, ParsedPage } from './types';
import websiteContentRaw from './data/website_content.json';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PageContent from './components/PageContent';
import FounderTribute from './components/FounderTribute';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, BookOpen, Clock, Globe, ArrowRight, HeartHandshake, Eye, MapPin, CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import { cpanelApi } from './services/cpanelApi';
import AdminCMS from './components/AdminCMS';
import AdminLogin from './components/AdminLogin';
import JobApplicationPage from './components/JobApplicationPage';
import { DonationPage } from './components/DonationPage';

export default function App() {
  const isCmsSubdomain = React.useMemo(() => {
    if (typeof window !== 'undefined' && ((window as any).__BSK_CMS_MODE__ === true || (window as any).__IS_CMS_ONLY__ === true)) {
      return true;
    }
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    return (
      host === 'cms.bskbd.org' ||
      host.startsWith('cms.') ||
      host.includes('cms-') ||
      host.startsWith('admin.') ||
      host.includes('admin-') ||
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname === '/cms' ||
      pathname.startsWith('/cms/') ||
      hash.includes('admin') ||
      hash.includes('cms') ||
      searchParams.get('mode') === 'cms' ||
      searchParams.get('cms') === '1' ||
      searchParams.get('admin') === '1'
    );
  }, []);

  const [currentTab, setCurrentTab] = React.useState<string>(() => isCmsSubdomain ? 'admin' : 'dashboard');
  const [language, setLanguage] = React.useState<Language>('bn');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isAdminCMSOpen, setIsAdminCMSOpen] = React.useState<boolean>(false);
  const [overriddenPages, setOverriddenPages] = React.useState<ParsedPage[]>([]);
  const [activeApplyCircular, setActiveApplyCircular] = React.useState<any | null>(null);
  const [isPageLoading, setIsPageLoading] = React.useState<boolean>(false);
  const [storageWarning, setStorageWarning] = React.useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('bsk_admin_passcode_verified') === 'true' ||
        sessionStorage.getItem('bsk_admin_authenticated') === 'true' ||
        !!sessionStorage.getItem('bsk_admin_token') ||
        !!localStorage.getItem('bsk_admin_token')
      );
    } catch (_) {
      return false;
    }
  });

  // Register global listener to handle disk space / IndexedDB storage errors gracefully
  React.useEffect(() => {
    const handleStorageError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = 'reason' in event 
        ? String((event as PromiseRejectionEvent).reason?.message || (event as PromiseRejectionEvent).reason)
        : String((event as ErrorEvent).message || (event as ErrorEvent).error?.message);

      if (
        errorMsg.toLowerCase().includes('file_error_no_space') ||
        errorMsg.toLowerCase().includes('quotaexceedederror') ||
        errorMsg.toLowerCase().includes('quota exceeded') ||
        errorMsg.toLowerCase().includes('indexeddb') ||
        errorMsg.toLowerCase().includes('leveldb')
      ) {
        console.warn('Caught browser/storage space warning: ', errorMsg);
        setStorageWarning(true);
        // Prevent default browser crash dialogs where applicable
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleStorageError);
    window.addEventListener('unhandledrejection', handleStorageError);

    return () => {
      window.removeEventListener('error', handleStorageError);
      window.removeEventListener('unhandledrejection', handleStorageError);
    };
  }, []);

  // Intercept and synchronize URL paths, query parameters, or hashes
  React.useEffect(() => {
    const checkPath = (p: string): string | null => {
      if (!p && !isCmsSubdomain) return null;
      try {
        // remove leading/trailing slashes, index.html, queries
        const cleanRaw = (p || '').split('?')[0].split('#')[0];
        const decoded = decodeURIComponent(cleanRaw);
        const sanitized = decoded.replace(/^\/+|\/+$/g, '').replace(/index\.html$/i, '').replace(/^\/+|\/+$/g, '').trim().toLowerCase();
        
        if (isCmsSubdomain) {
          if (!sanitized || sanitized === 'admin' || sanitized === 'admin-cms' || sanitized === 'cms' || sanitized === 'login' || sanitized === 'auth' || sanitized === 'dashboard' || sanitized === 'main' || sanitized === 'portal') {
            return 'admin';
          }
        }

        if (!sanitized || sanitized === 'dashboard' || sanitized === 'main' || sanitized === 'portal') return isCmsSubdomain ? 'admin' : 'dashboard';
        if (sanitized === 'admin' || sanitized === 'admin-cms' || sanitized === 'cms' || sanitized === 'login' || sanitized === 'auth') return 'admin';
        if (sanitized === 'aknojore' || sanitized === 'ataglance' || sanitized === 'at-a-glance') return 'ataglance';
        if (sanitized === 'home' || sanitized === 'about' || sanitized === 'about-us' || sanitized === 'porichiti') return 'home';
        if (sanitized === 'founder' || sanitized === 'president' || sanitized === 'abdullah-abu-sayeed' || sanitized === 'sayeed') return 'founder';
        if (sanitized === 'mission' || sanitized === 'vision' || sanitized === 'broto') return 'mission';
        if (sanitized === 'achievement' || sanitized === 'achievements' || sanitized === 'awards' || sanitized === 'award') return 'achievement';
        if (sanitized === 'bsk-history' || sanitized === 'history' || sanitized === 'itibritto') return 'bsk-history';
        if (sanitized === 'governance' || sanitized === 'trustee-board' || sanitized === 'trustees' || sanitized === 'trustee') return 'trustees';
        if (sanitized === 'organogram' || sanitized === 'structure' || sanitized === 'administrative-structure') return 'organogram';
        if (sanitized === 'mobile-library' || sanitized === 'mobile_library' || sanitized === 'mobilelibrary' || sanitized === 'bhramyaman' || sanitized === 'bhramyaman-library') return 'mobile-library';
        if (sanitized === 'central-library' || sanitized === 'library' || sanitized === 'central_library' || sanitized === 'kendrio-library') return 'central-library';
        if (sanitized === 'reading-habit' || sanitized === 'reading_habit' || sanitized === 'reading-habit-dev' || sanitized === 'readinghabit' || sanitized === 'pathobhyas') return 'reading-habit';
        if (sanitized === 'aalor-ishkool' || sanitized === 'aalor_ishkool' || sanitized === 'aalorishkool' || sanitized === 'alor-ishkool' || sanitized === 'alorishkool') return 'aalor-ishkool';
        if (sanitized === 'aalor-pathshala' || sanitized === 'aalor_pathshala' || sanitized === 'aalorpathshala' || sanitized === 'alor-pathshala' || sanitized === 'pathshala') return 'aalor-pathshala';
        if (sanitized === 'bangalir_chinta' || sanitized === 'bangalir-chinta' || sanitized === 'bangalirchinta') return 'bangalir_chinta';
        if (sanitized === 'primary-teacher' || sanitized === 'primary_teacher' || sanitized === 'primaryteacher' || sanitized === 'teacher-reading') return 'primary-teacher';
        if (sanitized === 'nationwide-excellence' || sanitized === 'nationwide_excellence' || sanitized === 'utkorsho' || sanitized === 'deshbittik') return 'nationwide-excellence';
        if (sanitized === 'book-fair' || sanitized === 'book_fair' || sanitized === 'boimela' || sanitized === 'mela') return 'book-fair';
        if (sanitized === 'publication' || sanitized === 'publications' || sanitized === 'prokashona' || sanitized === 'publishing') return 'publication';
        if (sanitized === 'bookshop' || sanitized === 'books' || sanitized === 'boi-bikroy' || sanitized === 'store' || sanitized === 'shop') return 'bookshop';
        if (sanitized === 'building' || sanitized === 'bhaban' || sanitized === 'kendro-bhaban') return 'building';
        if (sanitized === 'auditorium' || sanitized === 'auditoriums' || sanitized === 'facilities' || sanitized === 'facility' || sanitized === 'hall' || sanitized === 'halls' || sanitized === 'seminar') return 'auditorium';
        if (sanitized === 'cafe' || sanitized === 'cafeteria' || sanitized === 'canteen') return 'cafe';
        if (sanitized === 'notice' || sanitized === 'notices' || sanitized === 'announcement' || sanitized === 'announcements' || sanitized === 'notish') return 'notice';
        if (sanitized === 'recruitment' || sanitized === 'career' || sanitized === 'careers' || sanitized === 'bigopti' || sanitized === 'jobs' || sanitized === 'job' || sanitized === 'vacancies') return 'recruitment';
        if (sanitized === 'job-application' || sanitized === 'job-apply' || sanitized === 'apply' || sanitized === 'application') return 'job-application';
        if (sanitized === 'donation' || sanitized === 'donations' || sanitized === 'donate' || sanitized === 'support' || sanitized === 'sahojogita' || sanitized === 'onudan') return 'donation';
        if (sanitized === 'blog' || sanitized === 'blogs' || sanitized === 'article' || sanitized === 'articles') return 'blog';
        if (sanitized === 'press' || sanitized === 'media' || sanitized === 'news' || sanitized === 'press-release') return 'press';
        if (sanitized === 'contact' || sanitized === 'inquiry' || sanitized === 'feedback' || sanitized === 'jogajog') return 'contact';

        // Check against any dynamic or static page ID in json
        const allKnownPages = websiteContentRaw as ParsedPage[];
        const matchedPage = allKnownPages.find(p => p.id.toLowerCase() === sanitized);
        if (matchedPage) return matchedPage.id;

        return sanitized;
      } catch (_) {
        return null;
      }
    };

    const handleUrlCheck = () => {
      // 1. Check if arriving via 404 SPA fallback redirect (sessionStorage)
      const redirected = sessionStorage.redirect || sessionStorage.getItem('spa_redirect_path');
      if (redirected) {
        delete sessionStorage.redirect;
        sessionStorage.removeItem('spa_redirect_path');
        try {
          let urlObj: URL;
          if (redirected.startsWith('http')) {
            urlObj = new URL(redirected);
          } else {
            urlObj = new URL(redirected, window.location.origin);
          }
          const tab = checkPath(urlObj.pathname) || checkPath(urlObj.searchParams.get('page') || '') || checkPath(urlObj.hash.replace(/^#\/?/, ''));
          if (tab) {
            setCurrentTab(tab);
            return;
          }
        } catch (_) {}
      }

      // 2. Check query parameters like ?page=founder or ?tab=home
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const queryTab = searchParams.get('tab') || searchParams.get('page') || searchParams.get('p') || searchParams.get('route');
        if (queryTab) {
          const validQueryTab = checkPath(queryTab);
          if (validQueryTab) {
            setCurrentTab(validQueryTab);
            return;
          }
        }
      } catch (_) {}

      const path = window.location.pathname;
      const hash = window.location.hash;

      // 3. Check hash first (#/founder or #founder)
      const hashPart = hash.replace(/^#\/?/, '');
      if (hashPart) {
        const hashTab = checkPath(hashPart);
        if (hashTab) {
          setCurrentTab((prev) => prev !== hashTab ? hashTab : prev);
          return;
        }
      }

      // 4. Check pathname (/founder or /home)
      const pathTab = checkPath(path);
      if (pathTab) {
        setCurrentTab((prev) => prev !== pathTab ? pathTab : prev);
        return;
      }

      // 5. Default to admin on CMS subdomain, otherwise dashboard
      if (path === '/' || path === '' || path === '/index.html') {
        const defaultTarget = isCmsSubdomain ? 'admin' : 'dashboard';
        setCurrentTab((prev) => prev !== defaultTarget ? defaultTarget : prev);
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);

    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, []);

  // Update browser URL / History state when currentTab changes
  React.useEffect(() => {
    if (isCmsSubdomain) {
      // On cms.bskbd.org subdomain, maintain clean root URL without pushing /admin
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        window.history.replaceState({ tab: 'admin' }, '', '/');
      }
      return;
    }

    const tabToPathMap: Record<string, string> = {
      dashboard: '/',
      ataglance: '/aknojore',
      admin: '/admin',
      home: '/home',
      founder: '/founder',
      mission: '/mission',
      achievement: '/achievement',
      'bsk-history': '/bsk-history',
      governance: '/governance',
      trustees: '/trustees',
      organogram: '/organogram',
      'mobile-library': '/mobile-library',
      'central-library': '/central-library',
      'reading-habit': '/reading-habit',
      'aalor-ishkool': '/aalor-ishkool',
      'aalor-pathshala': '/aalor-pathshala',
      'bangalir_chinta': '/bangalir_chinta',
      'primary-teacher': '/primary-teacher',
      'nationwide-excellence': '/nationwide-excellence',
      'book-fair': '/book-fair',
      publication: '/publication',
      bookshop: '/bookshop',
      building: '/building',
      auditorium: '/auditorium',
      facilities: '/auditorium',
      cafe: '/cafe',
      notice: '/notice',
      recruitment: '/recruitment',
      'job-application': '/job-application',
      donation: '/donation',
      blog: '/blog',
      contact: '/contact',
      press: '/press',
    };

    const targetPath = tabToPathMap[currentTab] || `/${currentTab}`;
    
    // Only update if path is actually different to avoid pushState loops or duplicate entries
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: currentTab }, '', targetPath);
    }
  }, [currentTab]);

  // Listen to website_pages cPanel database overrides in real-time
  React.useEffect(() => {
    const loadPages = async () => {
      try {
        const pgs = await cpanelApi.getCollection<ParsedPage>('website_pages');
        setOverriddenPages(pgs);
      } catch (error) {
        console.warn("Error fetching pages from cPanel database:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadPages();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'website_pages') {
        loadPages();
      }
    };

    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('bsk_db_updated', handleUpdate);
    };
  }, []);

  // Dynamically merge local static JSON with the live cPanel database overrides
  const websiteContent = React.useMemo(() => {
    return (websiteContentRaw as ParsedPage[]).map((page) => {
      const match = overriddenPages.find(op => op.id === page.id);
      return match ? match : page;
    });
  }, [overriddenPages]);

  // Helper to normalize tab route IDs safely
  const normalizeTabId = (tabId: string): string => {
    if (!tabId) return 'dashboard';
    const clean = tabId.trim().toLowerCase();
    
    if (clean === 'dashboard' || clean === '' || clean === '/') return 'dashboard';
    if (clean === 'admin') return 'admin';
    if (clean === 'founder') return 'founder';
    if (clean === 'home') return 'home';
    if (clean === 'mission') return 'mission';
    if (clean === 'bsk-history' || clean === 'history') return 'bsk-history';
    if (clean === 'achievement' || clean === 'achievements') return 'achievement';
    if (clean === 'mobile-library' || clean === 'mobile_library' || clean === 'mobilelibrary') return 'mobile-library';
    if (clean === 'central-library' || clean === 'central_library' || clean === 'centrallibrary') return 'central-library';
    if (clean === 'reading-habit' || clean === 'reading_habit' || clean === 'reading-habit-dev' || clean === 'readinghabit') return 'reading-habit';
    if (clean === 'aalor-ishkool' || clean === 'aalor_ishkool' || clean === 'aalorishkool') return 'aalor-ishkool';
    if (clean === 'aalor-pathshala' || clean === 'aalor_pathshala' || clean === 'aalorpathshala') return 'aalor-pathshala';
    if (clean === 'bangalir_chinta' || clean === 'bangalir-chinta' || clean === 'bangalirchinta') return 'bangalir_chinta';
    if (clean === 'primary-teacher' || clean === 'primary_teacher' || clean === 'primaryteacher') return 'primary-teacher';
    if (clean === 'nationwide-excellence' || clean === 'nationwide_excellence' || clean === 'utkorsho') return 'nationwide-excellence';
    if (clean === 'book-fair' || clean === 'book_fair' || clean === 'boimela') return 'book-fair';
    if (clean === 'publication' || clean === 'publications') return 'publication';
    if (clean === 'bookshop' || clean === 'books') return 'bookshop';
    if (clean === 'auditorium' || clean === 'auditoriums' || clean === 'facilities' || clean === 'facility' || clean === 'hall') return 'auditorium';
    if (clean === 'cafe' || clean === 'cafeteria' || clean === 'canteen') return 'cafe';
    if (clean === 'building') return 'building';
    if (clean === 'ataglance' || clean === 'aknojore') return 'ataglance';
    if (clean === 'trustees' || clean === 'governance') return 'trustees';
    if (clean === 'organogram') return 'organogram';
    if (clean === 'press') return 'press';
    if (clean === 'recruitment' || clean === 'career' || clean === 'bigopti' || clean === 'jobs' || clean === 'vacancies') return 'recruitment';
    if (clean === 'job-application' || clean === 'job-apply' || clean === 'apply' || clean === 'application') return 'job-application';
    if (clean === 'donation' || clean === 'donations' || clean === 'donate' || clean === 'support' || clean === 'sahojogita' || clean === 'onudan') return 'donation';
    if (clean === 'notice' || clean === 'announcement' || clean === 'announcements') return 'notice';
    if (clean === 'blog' || clean === 'blogs' || clean === 'article' || clean === 'articles') return 'blog';
    if (clean === 'contact') return 'contact';

    return clean;
  };

  // Find parsed page content with fallback to prevent "data load error"
  const activePage = React.useMemo(() => {
    const norm = normalizeTabId(currentTab);
    const found = websiteContent.find(p => p.id === norm || p.id === currentTab);
    if (found) return found;

    if (norm === 'auditorium') {
      const facPage = websiteContent.find(p => p.id === 'facilities' || p.id === 'auditorium') || (websiteContentRaw as ParsedPage[]).find(p => p.id === 'facilities' || p.id === 'auditorium');
      if (facPage) {
        return {
          ...facPage,
          id: 'auditorium',
          title_bn: 'অডিটোরিয়াম ও সেমিনার কক্ষ',
          title_en: 'Auditoriums & Halls'
        };
      }
    }

    if (norm === 'cafe') {
      return {
        id: 'cafe',
        title_bn: 'ক্যাফেটেরিয়া',
        title_en: 'BSK Cafe',
        html_title: 'ক্যাফেটেরিয়া',
        sections: []
      };
    }

    if (norm === 'recruitment') {
      const recPage = websiteContent.find(p => p.id === 'recruitment') || (websiteContentRaw as ParsedPage[]).find(p => p.id === 'recruitment');
      if (recPage) return recPage;
      return {
        id: 'recruitment',
        title_bn: 'নিয়োগ বিজ্ঞপ্তি ও ক্যারিয়ার সুযোগ',
        title_en: 'Career Circulars & Opportunities',
        html_title: 'নিয়োগ বিজ্ঞপ্তি',
        sections: []
      };
    }

    // Fallback search in raw websiteContent
    const fallback = (websiteContentRaw as ParsedPage[]).find(p => p.id === norm || p.id === currentTab);
    if (fallback) return fallback;

    // Safe fallback to 'home' page so error card is never shown
    return (websiteContentRaw as ParsedPage[]).find(p => p.id === 'home') || websiteContent[0];
  }, [currentTab, websiteContent]);

  // Handle Search matched strings
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: { pageId: string; pageTitleBn: string; pageTitleEn: string; sectionTitle: string; matchText: string }[] = [];
    const query = searchQuery.toLowerCase();

    for (const page of websiteContent) {
      if (!page) continue;
      // Check titles match
      const titleMatches = (page.title_bn || '').toLowerCase().includes(query) || (page.title_en || '').toLowerCase().includes(query);
      
      if (Array.isArray(page.sections)) {
        for (const sec of page.sections) {
          if (!sec) continue;
          if (sec.title && sec.title.toLowerCase().includes(query)) {
            results.push({
              pageId: page.id,
              pageTitleBn: page.title_bn,
              pageTitleEn: page.title_en,
              sectionTitle: sec.title,
              matchText: (Array.isArray(sec.content) && sec.content[0]) || (language === 'bn' ? 'এই অনুচ্ছেদে বিস্তারিত তথ্য রয়েছে।' : 'Details inside this section.')
            });
            continue;
          }

          if (Array.isArray(sec.content)) {
            for (const pText of sec.content) {
              if (pText && pText.toLowerCase().includes(query)) {
                // Find snippet around match
                results.push({
                  pageId: page.id,
                  pageTitleBn: page.title_bn,
                  pageTitleEn: page.title_en,
                  sectionTitle: sec.title || page.title_bn,
                  matchText: pText
                });
              }
            }
          }
        }
      }
    }
    return results;
  }, [searchQuery, language, websiteContent]);

  const handleStatNavigate = (tabId: string, extraData?: any) => {
    setIsPageLoading(true);
    const target = normalizeTabId(tabId);
    if (extraData) {
      setActiveApplyCircular(extraData);
    }
    setCurrentTab(target);
    setSearchQuery('');
    setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
  };

  // If on CMS subdomain or currentTab is admin, render Admin portal exclusively
  if (isCmsSubdomain || currentTab === 'admin') {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F2] text-[#1A1207] flex flex-col justify-between bg-grain select-none">
        <div className="flex-1 flex flex-col w-full">
          {!isAdminLoggedIn ? (
            <AdminLogin 
              language={language} 
              onLoginSuccess={() => {
                setIsAdminLoggedIn(true);
              }} 
              onBackToHome={() => {
                if (isCmsSubdomain) {
                  window.location.href = 'https://bskbd.org';
                } else {
                  setCurrentTab('dashboard');
                  if (window.location.pathname === '/admin') {
                    window.history.pushState({}, '', '/');
                  } else {
                    window.location.hash = '';
                  }
                }
              }} 
            />
          ) : (
            <AdminCMS 
              language={language} 
              onClose={() => {
                if (isCmsSubdomain) {
                  // Staying inside CMS on cms.bskbd.org
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setCurrentTab('dashboard');
                  if (window.location.pathname === '/admin') {
                    window.history.pushState({}, '', '/');
                  } else {
                    window.location.hash = '';
                  }
                }
              }} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-full bg-white text-[#1A1207] lg:overflow-hidden overflow-x-hidden bg-grain select-none">
      {/* Dynamic storage full / low memory resilience banner */}
      {storageWarning && (
        <div className="bg-[#FAF0D9] border-b border-[#B8862A]/30 px-4 py-2.5 text-center flex items-center justify-between gap-4 animate-fade-in text-[11.5px] md:text-xs text-[#5C4033] font-medium z-50">
          <div className="flex items-center gap-2 mx-auto">
            <span className="text-base">⚠️</span>
            <span>
              {language === 'bn' 
                ? 'আপনার ডিভাইসের মেমরি বা ব্রাউজার স্টোরেজ পূর্ণ রয়েছে। ওয়েবসাইটটি সঠিকভাবে দেখতে দয়া করে ব্রাউজারের ক্যাশ বা ডিভাইস স্টোরেজ কিছুটা খালি করুন।' 
                : 'Your browser storage/device disk space is full. Please clear browser cache or free up space to ensure smooth operation.'}
            </span>
          </div>
          <button 
            onClick={() => setStorageWarning(false)} 
            className="p-1 hover:bg-[#B8862A]/10 rounded-full transition text-[#5C4033] cursor-pointer shrink-0 font-bold font-sans text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setIsPageLoading(true);
          const target = (tab === 'mission' || tab === 'bsk-history' || tab === 'achievement') ? 'home' : tab;
          setCurrentTab(target);
          setSearchQuery(''); // clear search on navigation
          setTimeout(() => {
            setIsPageLoading(false);
          }, 450);
        }} 
        language={language} 
        setLanguage={setLanguage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdminCMSOpen={() => setIsAdminCMSOpen(true)}
      />

      {/* Main Content Pane */}
      <main className={`flex-1 lg:overflow-y-auto overflow-y-visible flex flex-col w-full ${currentTab === 'dashboard' && !searchQuery.trim() ? '' : 'px-4 md:px-8 py-6 max-w-7xl mx-auto'}`}>
        {/* Content render body */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {isPageLoading ? (
              /* High fidelity classy literary loading spinner */
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 my-auto text-center space-y-6"
              >
                <div className="relative flex items-center justify-center">
                  {/* Glowing custom outer spinning wheel */}
                  <div className="w-16 h-16 border-4 border-t-[#B8862A] border-r-transparent border-b-[#B8862A] border-l-transparent rounded-full animate-spin"></div>
                  {/* Innermost pulsing book icon */}
                  <div className="absolute">
                    <BookOpen className="w-6 h-6 text-[#B8862A] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-[#1A1207] animate-pulse">
                    {language === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading program materials...'}
                  </h3>
                  <p className="text-xs text-[#6B5135] font-serif italic max-w-sm mx-auto">
                    {language === 'bn' ? '"আলোকিত মানুষ চাই" — আবদুল্লাহ আবু সায়ীদ' : '"Enlightened citizens for a better tomorrow" — Abdullah Abu Sayeed'}
                  </p>
                </div>
              </motion.div>
            ) : searchQuery.trim() ? (
              /* Global Search Results Panel */
              <motion.div 
                key="search-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-4xl"
              >
                <div className="flex justify-between items-center border-b border-[#B8862A]/20 pb-3">
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl md:text-2xl font-extrabold text-[#1A1207]">
                      {language === 'bn' ? 'অনুসন্ধানের ফলাফল' : 'Real-time Search Results'}
                    </h2>
                    <p className="text-xs text-[#6B5135]">
                      {language === 'bn' 
                        ? `"${searchQuery}" এর জন্য সর্বমোট ${searchResults.length}টি ফলাফল পাওয়া গেছে` 
                        : `Found ${searchResults.length} matching fragments matches for "${searchQuery}"`}
                    </p>
                  </div>
                  <button 
                    id="clear-search"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-full hover:bg-[#E8DDD0] transition text-[#3D2B14] cursor-pointer"
                    title={language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear Search'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 space-y-3 bg-white border border-[#E8DDD0] rounded-2xl p-6">
                    <Search className="h-12 w-12 text-[#6B5135]/45 mx-auto" />
                    <h3 className="font-bold text-[#1A1207] text-sm">
                      {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matches found'}
                    </h3>
                    <p className="text-xs text-[#6B5135] max-w-md mx-auto leading-relaxed">
                      {language === 'bn' 
                        ? 'অনুগ্রহ করে ভিন্ন কোনো শব্দ বা বাংলা বানান ব্যবহার করে পুনরায় অনুসন্ধান করুন।' 
                        : 'Try searching for other tags like "library", "ভ্রাম্যমাণ", "সায়ীদ" or "achievement".'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((res, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setCurrentTab(res.pageId);
                          setSearchQuery('');
                        }}
                        className="group p-5 bg-white border border-[#E8DDD0] hover:border-[#B8862A] rounded-2xl cursor-pointer shadow-sm shadow-[#3D2B14]/5 transition flex flex-col justify-between animate-fade-in"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#B8862A]">
                            <span>{language === 'bn' ? res.pageTitleBn : res.pageTitleEn}</span>
                            <span>•</span>
                            <span className="text-[#6B5135] font-medium">{res.sectionTitle}</span>
                          </div>
                          <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-sans line-clamp-3">
                            {res.matchText}
                          </p>
                        </div>
                        <div className="flex items-center justify-end text-[10px] text-[#B8862A] font-bold pt-3 border-t border-[#E8DDD0]/50 mt-3 opacity-0 group-hover:opacity-100 transition duration-150">
                          <span>{language === 'bn' ? 'তথ্যটি বিস্তারিত পড়ুন' : 'Read details'}</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : currentTab === 'dashboard' ? (
              /* Portal Dashboard */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Dashboard language={language} onNavigate={handleStatNavigate} />
              </motion.div>
            ) : currentTab === 'founder' ? (
              /* Dedicated profile of Professor Abdullah Abu Sayeed */
              <motion.div
                key="founder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <FounderTribute 
                  page={
                    (activePage && activePage.id === 'founder' ? activePage : null) || 
                    websiteContent.find(p => p.id === 'founder') || 
                    (websiteContentRaw as ParsedPage[]).find(p => p.id === 'founder') || 
                    { id: 'founder', title_bn: 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ', title_en: 'Prof. Abdullah Abu Sayeed', html_title: 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ', sections: [] }
                  } 
                  language={language} 
                />
              </motion.div>
            ) : currentTab === 'job-application' ? (
              /* Dedicated Job Application Page */
              <motion.div
                key="job-application"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <JobApplicationPage
                  circular={activeApplyCircular}
                  language={language}
                  onNavigate={handleStatNavigate}
                  onBack={() => handleStatNavigate('recruitment')}
                />
              </motion.div>
            ) : currentTab === 'donation' ? (
              /* Dedicated Support & Donation Page */
              <motion.div
                key="donation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <DonationPage
                  language={language}
                  onNavigate={handleStatNavigate}
                />
              </motion.div>
            ) : activePage ? (
              /* Standard dynamic page content */
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <PageContent page={activePage} language={language} onNavigate={handleStatNavigate} />
              </motion.div>
            ) : (
              /* Fallback default error card */
              <div className="bg-white border border-[#E8DDD0] rounded-2xl p-8 text-center text-stone-500 max-w-2xl mx-auto mt-12 space-y-3">
                <BookOpen className="h-10 w-10 mx-auto text-[#B8862A]" />
                <h3 className="font-bold text-[#1A1207]">{language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Page under maintenance'}</h3>
                <p className="text-xs leading-relaxed text-stone-600">
                  {language === 'bn' 
                    ? 'অনুরোধকৃত পাতাটি ডিস্ট্রিবিউট ফাইলে পাওয়া যায়নি। অনুগ্রহ করে ড্যাশবোর্ডে ফিরে যান।' 
                    : 'The requested archival resource could not be resolved. Navigate back to dashboard.'}
                </p>
                <button 
                  id="tab-error-home"
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 bg-[#B8862A] text-stone-950 font-bold text-xs rounded-lg transition hover:bg-[#D4A84B] cursor-pointer"
                >
                  {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Go to Dashboard'}
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer for non-dashboard views or searches */}
        {(currentTab !== 'dashboard' || !!searchQuery.trim()) && (
          <Footer language={language} onNavigate={handleStatNavigate} />
        )}
      </main>

      {/* Full Screen Live CMS Portal Modal Overlay */}
      {isAdminCMSOpen && (
        <AdminCMS 
          language={language} 
          onClose={() => setIsAdminCMSOpen(false)} 
        />
      )}
    </div>
  );
}
