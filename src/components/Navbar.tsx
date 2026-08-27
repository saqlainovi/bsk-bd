import React from 'react';
import { 
  Home, Compass, History, User, Info, Award, Users, 
  MapPin, Library, Truck, BookOpen, GraduationCap, School, BookOpenCheck, 
  PenTool, Building, Layout, Map, Phone, Search, Languages, Menu, X, Landmark, ChevronDown, Newspaper, Lock, Coffee
} from 'lucide-react';
import { 
  MenuTrigger as AriaMenuTrigger, 
  Button as AriaButton, 
  Popover as AriaPopover, 
  Menu as AriaMenu, 
  MenuItem as AriaMenuItem 
} from 'react-aria-components';
import { Language } from '../types';
import { cpanelApi } from '../services/cpanelApi';
import { motion } from 'motion/react';
import { gsap } from 'gsap';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAdminCMSOpen?: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  searchQuery,
  setSearchQuery,
  onAdminCMSOpen
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<number | null>(null);
  const [portals, setPortals] = React.useState<any>(null);

  const logoRef = React.useRef<HTMLImageElement>(null);

  // GSAP Gasp Entrance Animation for Logo (clears transform on complete to eliminate GPU layer blur)
  React.useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.85, opacity: 0, y: -10 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 1.0, 
          ease: 'back.out(1.7)',
          onComplete: () => {
            if (logoRef.current) {
              gsap.set(logoRef.current, { clearProps: 'transform' });
            }
          }
        }
      );
    }
  }, []);

  const [globalSettings, setGlobalSettings] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchNavbarSettings = async () => {
      try {
        const portalsData = await cpanelApi.getDoc('homepage_blocks', 'portals');
        if (portalsData) setPortals(portalsData);

        const globalData = await cpanelApi.getDoc('website_pages', 'global_settings');
        if (globalData) setGlobalSettings(globalData);
      } catch (err) {
        console.warn("Error loading Navbar settings via cpanelApi:", err);
      }
    };

    fetchNavbarSettings();

    const handleUpdate = (e: any) => {
      if (!e?.detail?.collection || e.detail.collection === 'homepage_blocks' || e.detail.collection === 'website_pages') {
        fetchNavbarSettings();
      }
    };

    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('bsk_db_updated', handleUpdate);
    };
  }, []);

  const annBar = globalSettings?.announcement_bar;
  const navSet = globalSettings?.navbar_settings;
  const logoUrl = navSet?.logo_url || "https://bskbd.org/assets/img/logo_bn2.png";

  const bcrsUrl = portals?.bcrs?.url || "https://bcrs.bskbd.org/";
  const bcrsTitle = language === 'bn' ? (portals?.bcrs?.title_bn || 'বাঙালির চিন্তা') : (portals?.bcrs?.title_en || 'BCRS');
  const bcrsTooltip = language === 'bn' ? (portals?.bcrs?.tooltip_bn || 'বাঙালির চিন্তামূলক রচনা সংগ্রহ') : (portals?.bcrs?.tooltip_en || 'Bengali Thoughtful Writings Collection');
  const bcrsBgImage = portals?.bcrs?.bgImage || "/assets/IMGS/PURNIMA SONDHA/bcrs.jpg";
  const bcrsOpacity = portals?.bcrs?.opacity !== undefined ? portals.bcrs.opacity / 100 : 0.70;
  const bcrsLogo = portals?.bcrs?.logo || "";

  const alorUrl = portals?.alor?.url || "https://alorpathshala.org/";
  const alorTitle = language === 'bn' ? (portals?.alor?.title_bn || 'আলোর পাঠশালা') : (portals?.alor?.title_en || 'Alor Pathshala');
  const alorTooltip = language === 'bn' ? (portals?.alor?.tooltip_bn || 'আলোকিত পাঠশালা') : (portals?.alor?.tooltip_en || 'Alor Pathshala');
  const alorBgImage = portals?.alor?.bgImage || "/assets/IMGS/PURNIMA SONDHA/alor.jpg";
  const alorOpacity = portals?.alor?.opacity !== undefined ? portals.alor.opacity / 100 : 0.70;
  const alorLogo = portals?.alor?.logo || "";

  // GSAP Refs for Portals
  const bcrsRef = React.useRef<HTMLAnchorElement>(null);
  const alorRef = React.useRef<HTMLAnchorElement>(null);
  const bcrsTextRef = React.useRef<HTMLDivElement>(null);
  const alorTextRef = React.useRef<HTMLDivElement>(null);
  const portalContainerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredPortal, setHoveredPortal] = React.useState<'bcrs' | 'alor' | null>(null);

  // GSAP Refs for Search & Language controls
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchIconRef = React.useRef<SVGSVGElement>(null);
  const langBtnRef = React.useRef<HTMLButtonElement>(null);
  const langTextRef = React.useRef<HTMLSpanElement>(null);
  const langIconRef = React.useRef<SVGSVGElement>(null);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  // Search Hover & Expand GSAP Animations
  const handleSearchMouseEnter = () => {
    if (searchContainerRef.current) {
      gsap.to(searchContainerRef.current, {
        width: 180,
        backgroundColor: '#FFFFFF',
        borderColor: '#B8862A',
        boxShadow: '0 2px 10px rgba(184, 134, 42, 0.18)',
        duration: 0.35,
        ease: 'power2.out'
      });
    }
    if (searchInputRef.current) {
      gsap.to(searchInputRef.current, {
        opacity: 1,
        duration: 0.25,
        delay: 0.05
      });
    }
    if (searchIconRef.current) {
      gsap.to(searchIconRef.current, {
        color: '#B8862A',
        scale: 1.1,
        rotate: 15,
        duration: 0.3,
        ease: 'back.out(2)'
      });
    }
  };

  const handleSearchMouseLeave = () => {
    if (!isSearchFocused && !searchQuery) {
      if (searchContainerRef.current) {
        gsap.to(searchContainerRef.current, {
          width: 32,
          backgroundColor: '#F5F5F4',
          borderColor: 'rgba(184, 134, 42, 0.2)',
          boxShadow: 'none',
          duration: 0.35,
          ease: 'power2.inOut'
        });
      }
      if (searchInputRef.current) {
        gsap.to(searchInputRef.current, {
          opacity: 0,
          duration: 0.2
        });
      }
      if (searchIconRef.current) {
        gsap.to(searchIconRef.current, {
          color: '#1A1207',
          scale: 1,
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  // Language Button Hover GSAP Animations
  const handleLangMouseEnter = () => {
    if (langBtnRef.current) {
      gsap.to(langBtnRef.current, {
        scale: 1.06,
        backgroundColor: '#FBF8F1',
        borderColor: '#B8862A',
        boxShadow: '0 2px 8px rgba(184, 134, 42, 0.2)',
        duration: 0.25,
        ease: 'power2.out'
      });
    }
    if (langIconRef.current) {
      gsap.to(langIconRef.current, {
        rotate: 180,
        color: '#B8862A',
        duration: 0.35,
        ease: 'back.out(1.7)'
      });
    }
  };

  const handleLangMouseLeave = () => {
    if (langBtnRef.current) {
      gsap.to(langBtnRef.current, {
        scale: 1,
        backgroundColor: '#F5F5F4',
        borderColor: '#E7E5E4',
        boxShadow: 'none',
        duration: 0.25,
        ease: 'power2.out'
      });
    }
    if (langIconRef.current) {
      gsap.to(langIconRef.current, {
        rotate: 0,
        color: '#44403C',
        duration: 0.35,
        ease: 'power2.out'
      });
    }
  };

  const handleToggleLanguageAnimated = () => {
    if (langTextRef.current) {
      gsap.fromTo(langTextRef.current, 
        { y: -8, opacity: 0, scale: 0.8 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
    if (langIconRef.current) {
      gsap.fromTo(langIconRef.current,
        { rotate: -180, scale: 0.7 },
        { rotate: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.4)' }
      );
    }
    toggleLanguage();
  };

  // Ultra-smooth, glitch-free GSAP morphing animation between BCRS and Alor Pathshala portals
  React.useEffect(() => {
    const bcrs = bcrsRef.current;
    const alor = alorRef.current;
    const bcrsText = bcrsTextRef.current;
    const alorText = alorTextRef.current;
    if (!bcrs || !alor) return;

    const computeWidths = () => {
      const w = window.innerWidth;
      if (w >= 1536) return { def: 155, act: 205, sib: 105 };
      if (w >= 1280) return { def: 130, act: 175, sib: 85 };
      if (w >= 1024) return { def: 105, act: 145, sib: 70 };
      if (w >= 768) return { def: 95, act: 130, sib: 65 };
      return { def: 85, act: 115, sib: 55 };
    };

    const { def, act, sib } = computeWidths();

    if (hoveredPortal === 'bcrs') {
      gsap.to(bcrs, { width: `${act}px`, duration: 0.38, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(alor, { width: `${sib}px`, duration: 0.38, ease: 'power2.out', overwrite: 'auto' });
      if (bcrsText) gsap.to(bcrsText, { opacity: 1, scale: 1.03, duration: 0.25, ease: 'power1.out', overwrite: 'auto' });
      if (alorText) gsap.to(alorText, { opacity: 0.7, scale: 0.94, duration: 0.25, ease: 'power1.out', overwrite: 'auto' });
    } else if (hoveredPortal === 'alor') {
      gsap.to(alor, { width: `${act}px`, duration: 0.38, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(bcrs, { width: `${sib}px`, duration: 0.38, ease: 'power2.out', overwrite: 'auto' });
      if (alorText) gsap.to(alorText, { opacity: 1, scale: 1.03, duration: 0.25, ease: 'power1.out', overwrite: 'auto' });
      if (bcrsText) gsap.to(bcrsText, { opacity: 0.7, scale: 0.94, duration: 0.25, ease: 'power1.out', overwrite: 'auto' });
    } else {
      gsap.to([bcrs, alor], { width: `${def}px`, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      if (bcrsText) gsap.to(bcrsText, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out', overwrite: 'auto' });
      if (alorText) gsap.to(alorText, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out', overwrite: 'auto' });
    }
  }, [hoveredPortal, language, portals]);

  // Handle live window resize for portals when idle
  React.useEffect(() => {
    const handleResize = () => {
      if (!hoveredPortal && bcrsRef.current && alorRef.current) {
        const w = window.innerWidth;
        const def = w >= 1536 ? 155 : (w >= 1280 ? 130 : (w >= 1024 ? 105 : (w >= 768 ? 95 : 85)));
        gsap.to([bcrsRef.current, alorRef.current], { width: `${def}px`, duration: 0.2, overwrite: 'auto' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredPortal]);

  const categories = [
    {
      title_bn: 'পরিচিতি ও ব্যাবস্থাপনা',
      title_en: 'About & Management',
      items: [
        { id: 'home', title_bn: 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি', title_en: 'About BSK', icon: Home },
        { id: 'founder', title_bn: 'প্রতিষ্ঠাতা ও সভাপতি', title_en: 'Founder Profile', icon: User },
        { id: 'ataglance', title_bn: 'এক নজরে কেন্দ্র', title_en: 'BSK at a Glance', icon: Info },
        { id: 'trustees', title_bn: 'ট্রাস্টি বোর্ড', title_en: 'Board of Trustees', icon: Users },
        { id: 'organogram', title_bn: 'প্রশাসনিক কাঠামো', title_en: 'Organogram', icon: Landmark }
      ]
    },
    {
      title_bn: 'কার্যক্রম',
      title_en: 'Programs',
      items: [
        { id: 'nationwide-excellence', title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম', title_en: 'Nationwide Excellence Program', icon: Award },
        { id: 'mobile-library', title_bn: 'ভ্রাম্যমাণ লাইব্রেরি', title_en: 'Mobile Library', icon: Truck },
        { id: 'reading-habit', title_bn: 'পাঠাভ্যাস উন্নয়ন', title_en: 'Reading Habit', icon: BookOpen },
        { id: 'book-fair', title_bn: 'ভ্রাম্যমাণ বইমেলা', title_en: 'Mobile Book Fair', icon: BookOpenCheck },
        { id: 'aalor-ishkool', title_bn: 'আলোর ইশকুল', title_en: 'Aalor Ishkool', icon: GraduationCap },
        { id: 'aalor-pathshala', title_bn: 'আলোর পাঠশালা', title_en: 'Aalor Pathshala', icon: School },
        { id: 'bangalir_chinta', title_bn: 'বাঙালির চিন্তা কর্মসূচি', title_en: 'Bengali Thought', icon: BookOpenCheck },
        { id: 'primary-teacher', title_bn: 'প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি', title_en: 'Primary Teachers Reading Program', icon: PenTool },
        { id: 'publication', title_bn: 'প্রকাশনা কার্যক্রম', title_en: 'Publications', icon: BookOpenCheck }
      ]
    },
    {
      title_bn: 'পরিষেবা',
      title_en: 'Services',
      items: [
        { id: 'central-library', title_bn: 'লাইব্রেরি', title_en: 'Library', icon: Library },
        { id: 'publication', title_bn: 'প্রকাশনা ও প্রকাশনী', title_en: 'Publications', icon: BookOpenCheck },
        { id: 'bookshop', title_bn: 'বই বিক্রয় কেন্দ্র', title_en: 'Book Shop', icon: Layout },
        { id: 'building', title_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন', title_en: 'BSK Building', icon: Building },
        { id: 'auditorium', title_bn: 'অডিটোরিয়াম ও সেমিনার কক্ষ', title_en: 'Auditoriums & Halls', icon: Landmark },
        { id: 'cafe', title_bn: 'ক্যাফেটেরিয়া', title_en: 'BSK Cafe', icon: Coffee }
      ]
    }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const closeAllMenus = () => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleOpenAdmin = () => {
    if (onAdminCMSOpen) {
      onAdminCMSOpen();
    } else {
      setCurrentTab('admin');
    }
    closeAllMenus();
  };

  // Close dropdown on clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="relative w-full max-w-full bg-[#F9F6F1] text-[#1A1207] border-b border-[#B8862A]/20 shadow-xs z-50 overflow-x-clip">
      {/* Dynamic Announcement Ticker Bar */}
      {annBar?.enabled !== false && (annBar?.text_bn || annBar?.text_en) && (
        <div className="bg-[#2E5942] text-white py-1.5 px-4 border-b border-[#203F2F] font-sans text-xs flex items-center justify-between gap-3 shadow-inner z-50">
          <div className="flex items-center gap-2.5 overflow-hidden mx-auto md:mx-0">
            <span className="px-2 py-0.5 bg-[#F0CC7A] text-[#1A1207] font-bold text-[10px] rounded-full shrink-0 tracking-wide uppercase">
              {language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notice'}
            </span>
            <p className="truncate font-medium text-[11px] md:text-xs tracking-wide">
              {language === 'bn' ? annBar?.text_bn : (annBar?.text_en || annBar?.text_bn)}
            </p>
          </div>
          {annBar?.link && (
            <a
              href={annBar.link}
              onClick={(e) => {
                if (annBar.link?.startsWith('/')) {
                  e.preventDefault();
                  const pageId = annBar.link.replace('/', '');
                  setCurrentTab(pageId);
                }
              }}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#F0CC7A] hover:underline shrink-0"
            >
              <span>
                {language === 'bn' 
                  ? (annBar?.button_text_bn || 'বিস্তারিত দেখুন →')
                  : (annBar?.button_text_en || 'Learn More →')}
              </span>
            </a>
          )}
        </div>
      )}

      <div className="w-full max-w-full pl-0 pr-0 h-16 sm:h-18 lg:h-20 flex items-center justify-between">
        
        {/* Left Section: Brand Logo */}
        <div className="flex items-center justify-start lg:justify-center shrink-0 lg:flex-1 pl-3 sm:pl-4 lg:pl-0 h-full min-w-0">
          <div 
            onClick={() => { setCurrentTab('dashboard'); closeAllMenus(); }}
            className="flex items-center justify-center cursor-pointer py-1 h-full select-none"
          >
            <motion.img 
              ref={logoRef}
              src={logoUrl} 
              alt="Bishwo Shahitto Kendro Logo" 
              className="h-9 xs:h-10 sm:h-11 md:h-12 lg:h-10 xl:h-11 2xl:h-13 w-auto object-contain transition-all duration-200 contrast-[1.08] brightness-[0.98] drop-shadow-2xs"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
              referrerPolicy="no-referrer"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
            />
          </div>
        </div>

        {/* Center Section: Desktop Navigation Items - Strictly Centered in the Middle of the Navbar */}
        <nav className="hidden lg:flex items-center justify-center space-x-0.5 xl:space-x-1 min-[1366px]:space-x-1.5 2xl:space-x-2 shrink-0">
          {/* Direct flat button for Home (মূল পাতা) */}
          <button
            onClick={() => { setCurrentTab('dashboard'); closeAllMenus(); }}
            className={`px-1.5 xl:px-2 min-[1366px]:px-2.5 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap transition cursor-pointer border shrink-0 ${
              currentTab === 'dashboard' 
                ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
            }`}
          >
            {language === 'bn' ? 'মূল পাতা' : 'Home'}
          </button>

          {categories.map((cat, idx) => {
            const isAnyInCatActive = cat.items.some(item => item.id === currentTab);

            return (
              <div key={idx} className="relative shrink-0">
                <AriaMenuTrigger>
                  <AriaButton
                    className={`px-1 xl:px-1.5 min-[1366px]:px-2 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap flex items-center space-x-0.5 2xl:space-x-1 transition cursor-pointer border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8862A]/50 shrink-0 ${
                      isAnyInCatActive 
                        ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                        : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
                    }`}
                  >
                    <span>{language === 'bn' ? cat.title_bn : cat.title_en}</span>
                    <ChevronDown className="h-3 w-3 2xl:h-3.5 2xl:w-3.5 text-[#B8862A] transition-transform duration-200" />
                  </AriaButton>

                  <AriaPopover 
                    className="w-72 bg-[#F9F6F1] border border-[#B8862A]/20 rounded-xl shadow-xl overflow-hidden py-2 z-50 focus:outline-none animate-fade-in"
                    placement={idx === 2 ? 'bottom end' : 'bottom start'}
                  >
                    <div className="px-3 pb-2 mb-1 border-b border-[#B8862A]/10 text-[11px] uppercase font-bold text-[#B8862A] tracking-wider font-mono">
                      {language === 'bn' ? cat.title_bn : cat.title_en}
                    </div>
                    
                    <AriaMenu 
                      className="max-h-[250px] md:max-h-[300px] overflow-y-auto space-y-0.5 px-1.5 scrollbar-thin focus:outline-none"
                      onAction={(key) => {
                        const item = cat.items.find(i => i.id === key);
                        if (item) {
                          if (item.id === 'admin-cms') {
                            if (onAdminCMSOpen) onAdminCMSOpen();
                          } else {
                            setCurrentTab(item.id.toString());
                          }
                          closeAllMenus();
                        }
                      }}
                    >
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                          <AriaMenuItem
                            key={item.id}
                            id={item.id}
                            className={`w-full flex items-center px-3 py-2 rounded-lg text-[13.5px] font-semibold text-left transition focus:outline-none cursor-pointer ${
                              isActive 
                                ? 'bg-[#B8862A] text-stone-950 font-bold shadow-inner' 
                                : 'text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/10 focus:bg-[#B8862A]/10 focus:text-[#B8862A]'
                            }`}
                          >
                            <Icon className={`mr-2.5 h-4 w-4 shrink-0 ${isActive ? 'text-stone-950' : 'text-[#B8862A]'}`} />
                            <span className="truncate">
                              {language === 'bn' ? item.title_bn : item.title_en}
                            </span>
                          </AriaMenuItem>
                        );
                      })}
                    </AriaMenu>
                  </AriaPopover>
                </AriaMenuTrigger>
              </div>
            );
          })}

          {/* Direct flat button for Notice/Bigopti (বিজ্ঞপ্তি) */}
          <button
            onClick={() => { setCurrentTab('notice'); closeAllMenus(); }}
            className={`px-1 xl:px-1.5 min-[1366px]:px-2 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap transition cursor-pointer border shrink-0 ${
              currentTab === 'notice' || currentTab === 'recruitment'
                ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
            }`}
          >
            {language === 'bn' ? 'বিজ্ঞপ্তি' : 'Announcements'}
          </button>

          {/* Direct flat button for Press (প্রেস) */}
          <button
            onClick={() => { setCurrentTab('press'); closeAllMenus(); }}
            className={`px-1 xl:px-1.5 min-[1366px]:px-2 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap transition cursor-pointer border shrink-0 ${
              currentTab === 'press' 
                ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
            }`}
          >
            {language === 'bn' ? 'প্রেস' : 'Press'}
          </button>

          {/* Direct flat button for Blog (ব্লগ) */}
          <button
            onClick={() => { setCurrentTab('blog'); closeAllMenus(); }}
            className={`px-1 xl:px-1.5 min-[1366px]:px-2 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap transition cursor-pointer border shrink-0 ${
              currentTab === 'blog' 
                ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
            }`}
          >
            {language === 'bn' ? 'ব্লগ' : 'Blog'}
          </button>

          {/* Direct flat button for Contact (যোগাযোগ) */}
          <button
            onClick={() => { setCurrentTab('contact'); closeAllMenus(); }}
            className={`px-1 xl:px-1.5 min-[1366px]:px-2 2xl:px-3 py-1 xl:py-1.5 2xl:py-2 rounded-md text-[12px] xl:text-[13px] min-[1366px]:text-[14px] min-[1536px]:text-[15px] font-bold font-serif whitespace-nowrap transition cursor-pointer border shrink-0 ${
              currentTab === 'contact' 
                ? 'text-[#B8862A] bg-[#B8862A]/10 border-[#B8862A]/30 font-extrabold' 
                : 'border-transparent text-[#140E06] hover:text-[#B8862A] hover:bg-[#B8862A]/5 hover:border-[#B8862A]/10'
            }`}
          >
            {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
          </button>

          {/* GSAP-Powered Hover-Expandable Search Bar - Positioned right after Contact */}
          <div 
            ref={searchContainerRef}
            onMouseEnter={handleSearchMouseEnter}
            onMouseLeave={handleSearchMouseLeave}
            className="relative flex items-center h-7.5 xl:h-8 min-[1366px]:h-8.5 rounded-full bg-stone-100/90 border border-[#B8862A]/20 transition-colors overflow-hidden shrink-0 cursor-pointer"
            style={{ width: searchQuery ? '180px' : '32px' }}
          >
            <div 
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              className="absolute left-0 w-8 h-full flex items-center justify-center pointer-events-auto"
            >
              <Search 
                ref={searchIconRef} 
                className="h-3.5 w-3.5 text-[#1A1207]/80 shrink-0" 
              />
            </div>
            <input
              ref={searchInputRef}
              id="top-search"
              type="text"
              placeholder={language === 'bn' ? 'অনুসন্ধান...' : 'Search...'}
              value={searchQuery}
              onFocus={() => {
                setIsSearchFocused(true);
                handleSearchMouseEnter();
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                if (!searchQuery) handleSearchMouseLeave();
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-8 pr-2.5 py-1 text-xs text-[#1A1207] placeholder-stone-400 bg-transparent focus:outline-none font-sans"
              style={{ opacity: searchQuery ? 1 : 0 }}
            />
          </div>

          {/* GSAP-Powered Animated Language Toggle - Positioned right after Search */}
          <button
            ref={langBtnRef}
            onClick={handleToggleLanguageAnimated}
            onMouseEnter={handleLangMouseEnter}
            onMouseLeave={handleLangMouseLeave}
            className="flex items-center justify-center space-x-1 px-2 h-7.5 xl:h-8 min-[1366px]:h-8.5 bg-stone-100 border border-stone-200 text-[10.5px] min-[1366px]:text-[11.5px] font-bold text-stone-800 rounded-full transition-shadow shrink-0 cursor-pointer select-none"
            title={language === 'bn' ? 'Change Language' : 'ভাষা পরিবর্তন করুন'}
          >
            <Languages ref={langIconRef} className="h-3.5 w-3.5 text-stone-700 shrink-0" />
            <span ref={langTextRef} className="font-serif tracking-wider shrink-0">
              {language === 'bn' ? 'EN' : 'বাং'}
            </span>
          </button>
        </nav>

        {/* Right Side: Tools (Portals & Mobile Hamburger) */}
        <div className="flex items-center justify-end self-stretch h-full p-0 m-0 shrink-0 lg:flex-1">
          
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 mr-2 sm:mr-3 rounded-lg border border-[#B8862A]/20 bg-[#B8862A]/10 text-[#B8862A] hover:bg-[#B8862A]/25 transition cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Our Portals Container - Seamlessly joined and strictly flush to the website frame's right edge (0px right gap) */}
          <div 
            ref={portalContainerRef}
            onMouseLeave={() => setHoveredPortal(null)}
            className="hidden sm:flex items-stretch self-stretch h-full p-0 m-0 shrink-0 select-none overflow-hidden"
          >
            {/* BCRS (Bangalir Chinta) Portal Link */}
            <a
              ref={bcrsRef}
              href={bcrsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredPortal('bcrs')}
              className="group relative flex items-center justify-center overflow-hidden px-1.5 sm:px-2 min-[1366px]:px-3 2xl:px-4 border-l border-r border-[#B8862A]/20 text-xs font-bold transition shrink-0 cursor-pointer h-full z-10 select-none will-change-[width]"
              title={bcrsTooltip}
              style={{ 
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)',
                width: '125px'
              }}
            >
              {/* Background Image with Hover Scale */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-115 scale-105"
                style={{ backgroundImage: `url("${bcrsBgImage}")` }}
              />
              <div 
                className="absolute inset-0 transition-colors duration-300" 
                style={{ backgroundColor: `rgba(12, 10, 9, ${bcrsOpacity})` }}
              />
              
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#B8862A]/30 to-transparent pointer-events-none group-hover:via-[#B8862A]/70 transition-all duration-300" />
              <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.7)] group-hover:shadow-[inset_0_0_20px_rgba(184,134,42,0.35)] transition-shadow duration-300 pointer-events-none" />

              {/* Light sheen animation */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-25 pointer-events-none transition-transform duration-1000 -translate-x-[150%] group-hover:translate-x-[150%]" />

              <div 
                ref={bcrsTextRef}
                className="relative z-10 flex items-center space-x-1 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.95)] whitespace-nowrap transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F0CC7A] shrink-0" />
                <span className="font-serif tracking-wide text-[10px] sm:text-[10.5px] min-[1366px]:text-[11.5px] min-[1440px]:text-[12.5px] 2xl:text-[14px]">
                  {bcrsTitle}
                </span>
              </div>
            </a>

            {/* Alor Pathshala Portal Link */}
            <a
              ref={alorRef}
              href={alorUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredPortal('alor')}
              className="group relative flex items-center justify-center overflow-hidden px-1.5 sm:px-2 min-[1366px]:px-3 2xl:px-4 -ml-[10px] border-r border-[#2E5942]/20 text-xs font-bold transition shrink-0 cursor-pointer h-full z-0 select-none will-change-[width]"
              title={alorTooltip}
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%)',
                width: '125px'
              }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-115 scale-105"
                style={{ backgroundImage: `url("${alorBgImage}")` }}
              />
              <div 
                className="absolute inset-0 transition-colors duration-300" 
                style={{ backgroundColor: `rgba(12, 10, 9, ${alorOpacity})` }}
              />
              
              <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#2E5942]/30 to-transparent pointer-events-none group-hover:via-[#2E5942]/70 transition-all duration-300" />
              <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.7)] group-hover:shadow-[inset_0_0_20px_rgba(46,89,66,0.35)] transition-shadow duration-300 pointer-events-none" />

              {/* Light sheen animation */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-25 pointer-events-none transition-transform duration-1000 -translate-x-[150%] group-hover:translate-x-[150%]" />

              <div 
                ref={alorTextRef}
                className="relative z-10 flex items-center space-x-1 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.95)] whitespace-nowrap transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F0CC7A] shrink-0" />
                <span className="font-serif tracking-wide text-[10px] sm:text-[10.5px] min-[1366px]:text-[11.5px] min-[1440px]:text-[12.5px] 2xl:text-[14px]">
                  {alorTitle}
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* ── Mobile Expandable Drawer Menu ── */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#F9F6F1] border-b border-[#B8862A]/20 shadow-2xl z-40 max-h-[85vh] overflow-y-auto animate-fade-in lg:hidden">
          
          {/* Mobile Search Input */}
          <div className="p-4 border-b border-[#B8862A]/10 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#B8862A]/60" />
              <input
                id="mobile-search"
                type="text"
                placeholder={language === 'bn' ? 'অনুসন্ধান করুন...' : 'Search portal...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-[#B8862A]/20 rounded-lg text-xs text-[#1A1207] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B8862A] transition"
              />
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* Direct primary actions grid (Home, Notice, Press, Blog, Contact) */}
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 animate-fade-in">
              <button
                onClick={() => { setCurrentTab('dashboard'); closeAllMenus(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold font-serif transition text-center cursor-pointer ${
                  currentTab === 'dashboard' 
                    ? 'bg-[#B8862A] text-stone-950 border border-[#B8862A]' 
                    : 'bg-stone-50 text-stone-900 border border-[#B8862A]/20 hover:bg-[#B8862A]/5'
                }`}
              >
                <Home className="mb-1 h-4 w-4 text-[#B8862A]/85" />
                <span>{language === 'bn' ? 'মূল পাতা' : 'Home'}</span>
              </button>

              <button
                onClick={() => { setCurrentTab('notice'); closeAllMenus(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold font-serif transition text-center cursor-pointer ${
                  currentTab === 'notice' || currentTab === 'recruitment'
                    ? 'bg-[#B8862A] text-stone-950 border border-[#B8862A]' 
                    : 'bg-stone-50 text-stone-900 border border-[#B8862A]/20 hover:bg-[#B8862A]/5'
                }`}
              >
                <Award className="mb-1 h-4 w-4 text-[#B8862A]/85" />
                <span>{language === 'bn' ? 'বিজ্ঞপ্তি' : 'Announce'}</span>
              </button>

              <button
                onClick={() => { setCurrentTab('press'); closeAllMenus(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold font-serif transition text-center cursor-pointer ${
                  currentTab === 'press' 
                    ? 'bg-[#B8862A] text-stone-950 border border-[#B8862A]' 
                    : 'bg-stone-50 text-stone-900 border border-[#B8862A]/20 hover:bg-[#B8862A]/5'
                }`}
              >
                <Newspaper className="mb-1 h-4 w-4 text-[#B8862A]/85" />
                <span>{language === 'bn' ? 'প্রেস' : 'Press'}</span>
              </button>

              <button
                onClick={() => { setCurrentTab('blog'); closeAllMenus(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold font-serif transition text-center cursor-pointer ${
                  currentTab === 'blog' 
                    ? 'bg-[#B8862A] text-stone-950 border border-[#B8862A]' 
                    : 'bg-stone-50 text-stone-900 border border-[#B8862A]/20 hover:bg-[#B8862A]/5'
                }`}
              >
                <BookOpenCheck className="mb-1 h-4 w-4 text-[#B8862A]/85" />
                <span>{language === 'bn' ? 'ব্লগ' : 'Blog'}</span>
              </button>

              <button
                onClick={() => { setCurrentTab('contact'); closeAllMenus(); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[9px] font-bold font-serif transition text-center cursor-pointer ${
                  currentTab === 'contact' 
                    ? 'bg-[#B8862A] text-stone-950 border border-[#B8862A]' 
                    : 'bg-stone-50 text-stone-900 border border-[#B8862A]/20 hover:bg-[#B8862A]/5'
                }`}
              >
                <Phone className="mb-1 h-4 w-4 text-[#B8862A]/85" />
                <span>{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</span>
              </button>
            </div>

            {/* Our Portals Section (Mobile) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-[#B8862A] tracking-wider font-mono block px-1">
                {language === 'bn' ? 'আমাদের পোর্টালসমূহ' : 'Our Portals'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <motion.a
                  href={bcrsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center space-x-2 p-2.5 overflow-hidden border border-[#B8862A]/10 text-xs font-bold text-center h-[38px] -skew-x-[12deg] rounded-md shadow-sm"
                  title={bcrsTooltip}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-550 group-hover:scale-110 scale-110 skew-x-[12deg]"
                    style={{ backgroundImage: `url("${bcrsBgImage}")` }}
                  />
                  <div 
                    className="absolute inset-0 transition-colors" 
                    style={{ backgroundColor: `rgba(12, 10, 9, ${bcrsOpacity})` }}
                  />
                  {/* Soft side glow */}
                  <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#B8862A]/20 pointer-events-none group-hover:bg-[#B8862A]/50 transition-colors" />
                  <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] group-hover:shadow-[inset_0_0_12px_rgba(184,134,42,0.3)] transition-shadow pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-center space-x-1.5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)] skew-x-[12deg]">
                    <BookOpen className="h-4 w-4 shrink-0 text-[#F0CC7A]" />
                    <span>{bcrsTitle}</span>
                  </div>
                </motion.a>
                <motion.a
                  href={alorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center space-x-2 p-2.5 overflow-hidden border border-[#2E5942]/10 text-xs font-bold text-center h-[38px] -skew-x-[12deg] rounded-md shadow-sm"
                  title={alorTooltip}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-550 group-hover:scale-110 scale-110 skew-x-[12deg]"
                    style={{ backgroundImage: `url("${alorBgImage}")` }}
                  />
                  <div 
                    className="absolute inset-0 transition-colors" 
                    style={{ backgroundColor: `rgba(12, 10, 9, ${alorOpacity})` }}
                  />
                  {/* Soft side glow */}
                  <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-[#2E5942]/20 pointer-events-none group-hover:bg-[#2E5942]/50 transition-colors" />
                  <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] group-hover:shadow-[inset_0_0_12px_rgba(46,89,66,0.3)] transition-shadow pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-center space-x-1.5 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)] skew-x-[12deg]">
                    <GraduationCap className="h-4 w-4 shrink-0 text-[#F0CC7A]" />
                    <span>{alorTitle}</span>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Categorized Sections */}
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#B8862A] tracking-wider font-mono block px-1">
                  {language === 'bn' ? cat.title_bn : cat.title_en}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'admin-cms') {
                            if (onAdminCMSOpen) onAdminCMSOpen();
                            closeAllMenus();
                          } else {
                            setCurrentTab(item.id);
                            closeAllMenus();
                          }
                        }}
                        className={`flex items-center px-3.5 py-2 rounded-lg text-xs transition text-left ${
                          isActive 
                            ? 'bg-[#B8862A] text-stone-950 font-bold' 
                            : 'text-stone-800 hover:text-[#B8862A] hover:bg-[#B8862A]/5 border border-stone-100 bg-stone-50'
                        }`}
                      >
                        <Icon className={`mr-2.5 h-4.5 w-4.5 shrink-0 ${isActive ? 'text-stone-950' : 'text-[#B8862A]'}`} />
                        <span className="truncate">
                          {language === 'bn' ? item.title_bn : item.title_en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Centered BSK badge and copyright */}
          <div className="p-4 bg-stone-50 text-center text-[10px] text-stone-500 border-t border-[#B8862A]/15 mt-2">
            <div>© {new Date().getFullYear()} বিশ্বসাহিত্য কেন্দ্র | BSK Bangladesh</div>
            <div className="mt-1 font-mono text-[#B8862A] hover:underline transition cursor-default">
              v3.25 • 64 Districts Reach
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
