import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, PhoneCall, Mail,
  Download, RefreshCw, Sparkles, Globe, Link as LinkIcon, FolderPlus, Eye, Layers,
  CheckCircle2, FileCode, FileArchive, Sliders
} from 'lucide-react';
import { cpanelApi } from '../services/cpanelApi';
import { Language } from '../types';
import { safeCacheData } from './cacheUtils';

interface PressCMSProps {
  language: Language;
  db: any;
  openImageResizer: (preset: 'banner' | 'landscape' | 'square' | 'portrait' | 'any', callback: (resizedUrl: string) => void) => void;
}

// Image compression helper to convert file to lightweight JPEG Base64
const compressAndReadImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Reusable Image Control with direct File Picker, URL Paste, and Resizer
const ImageFieldControl = ({
  label,
  value,
  onChange,
  onOpenResizer,
  language
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onOpenResizer?: () => void;
  language: Language;
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-2 font-sans text-left">
      <label className="text-xs font-bold text-stone-700 block">{label}</label>
      
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 group h-36">
          <img src={value} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" alt="Preview" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {onOpenResizer && (
              <button
                type="button"
                onClick={onOpenResizer}
                className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-xl backdrop-blur-xs transition cursor-pointer text-[10px] font-bold flex items-center gap-1 px-2"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{language === 'bn' ? 'রিসাইজ' : 'Resize'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-xl shadow-md transition cursor-pointer"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-stone-300 truncate max-w-[80%]">
            {value.startsWith('data:') ? 'Base64 Image File' : value}
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
          {/* Option 1: Direct File Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="flex-1 px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 transition cursor-pointer flex items-center justify-center gap-2 text-center shadow-2xs">
              <Upload className="h-4 w-4 text-[#2E5942]" />
              <span>{isUploading ? (language === 'bn' ? 'প্রসেস হচ্ছে...' : 'Processing...') : (language === 'bn' ? '📁 ডিভাইস থেকে ছবি নির্বাচন করুন' : '📁 Choose Image File')}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      setIsUploading(true);
                      const compressed = await compressAndReadImage(file);
                      onChange(compressed);
                    } catch (err) {
                      alert(language === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে' : 'Error reading image file');
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
              />
            </label>

            {onOpenResizer && (
              <button
                type="button"
                onClick={onOpenResizer}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#B8862A]/10 border border-[#B8862A]/30 text-[#B8862A] rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{language === 'bn' ? 'রিসাইজার ক্রপ' : 'Resizer Tool'}</span>
              </button>
            )}
          </div>

          {/* Option 2: Image URL Paste */}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={language === 'bn' ? 'অথবা সরাসরি ইমেজের লিংক/URL পেস্ট করুন (https://...)' : 'Or paste direct image URL (https://...)'}
              className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-hidden focus:border-[#2E5942]"
            />
            <button
              type="button"
              onClick={() => {
                if (urlInput.trim()) {
                  onChange(urlInput.trim());
                  setUrlInput('');
                }
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'যুক্ত করুন' : 'Apply URL'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PressCMS({ language, db, openImageResizer }: PressCMSProps) {
  const [pressList, setPressList] = useState<any[]>([]);
  const [albumsList, setAlbumsList] = useState<any[]>([]);
  const [editingPress, setEditingPress] = useState<any | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [activePressSubTab, setActivePressSubTab] = useState<'header' | 'releases' | 'albums' | 'downloads' | 'contact'>('header');

  // Subtab 1: Press Page Header Banner & Section Titles State
  const [pressHeaderSettings, setPressHeaderSettings] = useState<any>({
    badge_bn: 'বিশ্বসাহিত্য কেন্দ্র প্রেস ও মিডিয়া',
    badge_en: 'BSK Press & Media Center',
    title_bn: 'প্রেস ও মিডিয়া সেন্টার',
    title_en: 'Press & Media Center',
    desc_bn: 'বিশ্বসাহিত্য কেন্দ্রের সর্বশেষ প্রেস রিলিজ, জাতীয় ও আন্তর্জাতিক মিডিয়া কভারেজ, অফিসিয়াল ডাউনলোড এবং গ্যালারি।',
    desc_en: 'All official press releases, nationwide media features, photo archives, and brand assets of Bishwo Shahitto Kendro.',
    banner_image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=1200',
    btn1_text_bn: 'মিডিয়া কিট ডাউনলোড',
    btn1_text_en: 'Download Media Kit',
    btn1_url: '#media-downloads',
    btn2_text_bn: 'যোগাযোগ করুন',
    btn2_text_en: 'Media Contact',
    btn2_url: '#media-contact',
    sec1_title_bn: '১. সর্বশেষ সংবাদ ও প্রেস বিজ্ঞপ্তি',
    sec1_title_en: '1. Latest News & Press Releases',
    sec2_title_bn: '২. নিউজ ও মিডিয়া কভারেজ',
    sec2_title_en: '2. News & Media Coverage',
    sec3_title_bn: '৩. ফটো গ্যালারি ও প্রেস অ্যালবাম',
    sec3_title_en: '3. Photo Gallery & Press Albums',
    sec4_title_bn: '৪. ডাউনলোড এবং রিসোর্স',
    sec4_title_en: '4. Official Media Downloads',
    sec4_subtitle_bn: 'সংবাদ ও কভারেজের জন্য বিশ্বসাহিত্য কেন্দ্রের ব্র্যান্ড এসেট এবং মিডিয়া গাইড বুক ডাউনলোড করুন।',
    sec4_subtitle_en: 'Download high resolution brand assets, SVG logo elements, and official profile booklet guides.',
    sec5_title_bn: '৫. মিডিয়া ও প্রেস যোগাযোগ',
    sec5_title_en: '5. Media & Public Relations Contact',
    sec5_subtitle_bn: 'বিশ্বসাহিত্য কেন্দ্রের যেকোনো কার্যক্রম, সংবাদ বা সাক্ষাৎকার প্রচারের প্রয়োজনে আমাদের জনসংযোগ বিভাগের সাথে সরাসরি যোগাযোগ করুন।',
    sec5_subtitle_en: 'For press briefings, interview bookings, activity reporting, or queries regarding BSK operations, contact our media relation desks.'
  });
  const [isSavingHeaderSettings, setIsSavingHeaderSettings] = useState<boolean>(false);

  // Subtab 4: Official Media Downloads (Section 4) State
  const [pressDownloadsList, setPressDownloadsList] = useState<any[]>([
    {
      id: 'dl-1',
      title_bn: 'BSK অফিশিয়াল লোগো (PNG)',
      title_en: 'BSK Official Logo (PNG)',
      fileType: 'PNG',
      fileSize: '1.2 MB',
      fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png'
    },
    {
      id: 'dl-2',
      title_bn: 'BSK ভেক্টর লোগো (SVG)',
      title_en: 'BSK Logo Vector (SVG)',
      fileType: 'SVG',
      fileSize: '45 KB',
      fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png'
    },
    {
      id: 'dl-3',
      title_bn: 'সাংগঠনিক পরিচিতি ও বিবরণী (PDF)',
      title_en: 'BSK Profile & Brochure (PDF)',
      fileType: 'PDF',
      fileSize: '4.5 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'dl-4',
      title_bn: 'মিডিয়া কিট এবং রিসোর্স ফাইল (ZIP)',
      title_en: 'Media Kit Resources (ZIP Bundle)',
      fileType: 'ZIP',
      fileSize: '45.8 MB',
      fileUrl: 'https://bskbd.org/assets/img/logo_bn2.png'
    }
  ]);
  const [editingDownloadItem, setEditingDownloadItem] = useState<any | null>(null);
  const [isSavingDownloads, setIsSavingDownloads] = useState<boolean>(false);

  // Subtab 5: Media & Public Relations Contact State
  const [mediaContact, setMediaContact] = useState<any>({
    coordinator_title_bn: "মিডিয়া কো-অর্ডিনেটর",
    coordinator_title_en: "Media Liaison Coordinator",
    coordinator_name_bn: "মাহমুদ হাসান রাজু",
    coordinator_name_en: "Mahmud Hasan Raju",
    coordinator_role_bn: "যুগ্ম পরিচালক (তথ্য ও জনসংযোগ)",
    coordinator_role_en: "Joint Director (Public Relations)",
    coordinator_email: "raju@bskbd.org",
    coordinator_phone: "+8801711135432",
    coordinator_photo: "",
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
  });
  const [isSavingMediaContact, setIsSavingMediaContact] = useState<boolean>(false);

  // Load All Press Data from cPanel Database
  useEffect(() => {
    try {
      const cachedPress = localStorage.getItem('cached_press');
      if (cachedPress) setPressList(JSON.parse(cachedPress));
      
      const cachedAlbums = localStorage.getItem('cached_photo_albums');
      if (cachedAlbums) setAlbumsList(JSON.parse(cachedAlbums));

      const cachedSettings = localStorage.getItem('cached_press_settings');
      if (cachedSettings) setPressHeaderSettings(JSON.parse(cachedSettings));

      const cachedDownloads = localStorage.getItem('cached_press_downloads');
      if (cachedDownloads) setPressDownloadsList(JSON.parse(cachedDownloads));
    } catch (e) {
      console.error("Error reading initial local cached press data:", e);
    }

    const fetchAllData = async () => {
      try {
        const pressData = await cpanelApi.getCollection('press');
        pressData.sort((a, b) => {
          const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
          const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
          return dateB - dateA;
        });
        setPressList(pressData);
        safeCacheData('cached_press', pressData);

        const albumsData = await cpanelApi.getCollection('photo_albums');
        setAlbumsList(albumsData);
        safeCacheData('cached_photo_albums', albumsData);

        const settingsData = await cpanelApi.getDoc('homepage_blocks', 'press_settings');
        if (settingsData) {
          setPressHeaderSettings((prev: any) => ({ ...prev, ...settingsData }));
          safeCacheData('cached_press_settings', settingsData);
        }

        const downloadsData = await cpanelApi.getDoc('homepage_blocks', 'press_downloads');
        if (downloadsData && Array.isArray(downloadsData.items)) {
          setPressDownloadsList(downloadsData.items);
          safeCacheData('cached_press_downloads', downloadsData.items);
        }

        const contactData = await cpanelApi.getDoc('homepage_blocks', 'media_contact');
        if (contactData) {
          setMediaContact((prev: any) => ({ ...prev, ...contactData }));
        }
      } catch (err) {
        console.error("Error fetching data in PressCMS:", err);
      }
    };

    fetchAllData();

    const handleUpdate = (e: any) => {
      fetchAllData();
    };
    window.addEventListener('bsk_db_updated', handleUpdate);
    return () => window.removeEventListener('bsk_db_updated', handleUpdate);
  }, []);

  // Save Press Header Settings
  const savePressHeaderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingHeaderSettings(true);
      await cpanelApi.setDoc('homepage_blocks', 'press_settings', pressHeaderSettings);
      await cpanelApi.setDoc('website_pages', 'press', {
        id: 'press',
        title_bn: pressHeaderSettings.title_bn,
        title_en: pressHeaderSettings.title_en,
        updatedAt: new Date().toISOString()
      });
      safeCacheData('cached_press_settings', pressHeaderSettings);
      alert(language === 'bn' ? 'প্রেস পেজ হেডার ব্যানার ও সেকশন শিরোনাম সফলভাবে সেভ করা হয়েছে!' : 'Press page header & section titles saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving press settings: ' + err.message);
    } finally {
      setIsSavingHeaderSettings(false);
    }
  };

  // Save Media Downloads
  const savePressDownloads = async (newList: any[]) => {
    try {
      setIsSavingDownloads(true);
      await cpanelApi.setDoc('homepage_blocks', 'press_downloads', {
        id: 'press_downloads',
        items: newList,
        updatedAt: new Date().toISOString()
      });
      setPressDownloadsList(newList);
      safeCacheData('cached_press_downloads', newList);
      alert(language === 'bn' ? 'মিডিয়া ডাউনলোড ও রিসোর্স তালিকা সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Media downloads saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving downloads: ' + err.message);
    } finally {
      setIsSavingDownloads(false);
    }
  };

  // Save Media Contact
  const saveMediaContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingMediaContact(true);
      await cpanelApi.setDoc('homepage_blocks', 'media_contact', mediaContact);
      alert(language === 'bn' ? 'সফলভাবে মিডিয়া ও প্রেস যোগাযোগ তথ্য সংরক্ষণ করা হয়েছে!' : 'Media contact details saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving contact details: ' + err.message);
    } finally {
      setIsSavingMediaContact(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CMS Main Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h3 className="font-serif font-black text-2xl text-[#1A1207] flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#2E5942]" />
            <span>{language === 'bn' ? '১২. প্রেস ও মিডিয়া সেন্টার সম্পূর্ণ সিএমএস' : '12. Press & Media Center CMS'}</span>
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-1">
            {language === 'bn' 
              ? 'প্রেস পেজের হেডার ব্যানার, প্রেস বিজ্ঞপ্তি, নিউজ কভারেজ, ফটো গ্যালারি, অফিশিয়াল ডাউনলোড এবং মিডিয়া যোগাযোগ সম্পূর্ণ নিয়ন্ত্রণ করুন।' 
              : 'Full control over Press page cover banner, press releases, news coverage, photo gallery albums, media kit downloads, and liaison contact.'}
          </p>
        </div>

        {/* 5 Sub-tabs Selector */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start lg:self-auto select-none flex-wrap gap-1">
          <button
            type="button"
            onClick={() => { setActivePressSubTab('header'); setEditingPress(null); setEditingAlbum(null); setEditingDownloadItem(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
              activePressSubTab === 'header'
                ? 'bg-[#2E5942] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'হেডার ও সেকশন টাইটেল' : 'Header & Titles'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePressSubTab('releases'); setEditingPress(null); setEditingAlbum(null); setEditingDownloadItem(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
              activePressSubTab === 'releases'
                ? 'bg-[#2E5942] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'প্রেস বিজ্ঞপ্তি ও সংবাদ' : 'Press Releases'}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${activePressSubTab === 'releases' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>{pressList.length}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePressSubTab('albums'); setEditingPress(null); setEditingAlbum(null); setEditingDownloadItem(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
              activePressSubTab === 'albums'
                ? 'bg-[#2E5942] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'ফটো গ্যালারি অ্যালবাম' : 'Photo Gallery'}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${activePressSubTab === 'albums' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>{albumsList.length}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePressSubTab('downloads'); setEditingPress(null); setEditingAlbum(null); setEditingDownloadItem(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
              activePressSubTab === 'downloads'
                ? 'bg-[#2E5942] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'মিডিয়া ডাউনলোডসমূহ' : 'Media Downloads'}</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${activePressSubTab === 'downloads' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>{pressDownloadsList.length}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePressSubTab('contact'); setEditingPress(null); setEditingAlbum(null); setEditingDownloadItem(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
              activePressSubTab === 'contact'
                ? 'bg-[#2E5942] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'মিডিয়া যোগাযোগ' : 'Media Contact'}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PRESS PAGE HEADER BANNER & SECTION TITLES */}
      {activePressSubTab === 'header' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6 font-sans text-left">
          <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
            <div>
              <h4 className="font-serif font-extrabold text-[#1A1207] text-base flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#B8862A]" />
                <span>{language === 'bn' ? 'প্রেস পেজের হেডার ব্যানার ও মূল শিরোনাম সম্পাদনা' : 'Press Page Cover Banner & Title Settings'}</span>
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'bn' ? 'প্রেস পেজের উপরের কাভার ব্যানার পিকচার, ব্যাজ, মূল শিরোনাম, বিবরণী ও বাটন টেক্সট পরিমার্জন করুন।' : 'Customize top cover image, badge text, main title, description and CTA buttons for the Press page.'}
              </p>
            </div>
          </div>

          {/* Live Visual Preview Card */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              {language === 'bn' ? '👁️ লাইভ হেডার কভার ব্যানার প্রিভিউ (Live Preview):' : '👁️ Live Header Preview:'}
            </label>
            <div className="bg-[#1A1207] text-[#FAF7F2] p-6 rounded-2xl border border-[#B8862A]/30 relative overflow-hidden shadow-md">
              {pressHeaderSettings.banner_image && (
                <img 
                  src={pressHeaderSettings.banner_image} 
                  alt="Banner Preview" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
                />
              )}
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-block bg-[#B8862A] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  {language === 'bn' ? pressHeaderSettings.badge_bn : pressHeaderSettings.badge_en}
                </span>
                <h3 className="text-2xl font-extrabold font-serif text-white leading-tight">
                  {language === 'bn' ? pressHeaderSettings.title_bn : pressHeaderSettings.title_en}
                </h3>
                <p className="text-stone-300 text-xs font-sans leading-relaxed">
                  {language === 'bn' ? pressHeaderSettings.desc_bn : pressHeaderSettings.desc_en}
                </p>
                <div className="flex gap-2 pt-1">
                  <span className="px-3 py-1.5 bg-[#2E5942] text-white text-[11px] font-bold rounded-lg shadow-xs">
                    {language === 'bn' ? pressHeaderSettings.btn1_text_bn : pressHeaderSettings.btn1_text_en}
                  </span>
                  <span className="px-3 py-1.5 bg-[#FAF7F2] text-[#6B5135] text-[11px] font-bold rounded-lg border border-[#B8862A]/30">
                    {language === 'bn' ? pressHeaderSettings.btn2_text_bn : pressHeaderSettings.btn2_text_en}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={savePressHeaderSettings} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'হেডার ব্যাজ (বাংলা)' : 'Header Badge (Bangla)'}</label>
                <input
                  type="text"
                  required
                  value={pressHeaderSettings.badge_bn || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, badge_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'হেডার ব্যাজ (ইংরেজি)' : 'Header Badge (English)'}</label>
                <input
                  type="text"
                  required
                  value={pressHeaderSettings.badge_en || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, badge_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'মূল শিরোনাম (বাংলা)' : 'Main Title (Bangla)'}</label>
                <input
                  type="text"
                  required
                  value={pressHeaderSettings.title_bn || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, title_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'মূল শিরোনাম (ইংরেজি)' : 'Main Title (English)'}</label>
                <input
                  type="text"
                  required
                  value={pressHeaderSettings.title_en || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, title_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ভূমিকা বিবরণী (বাংলা)' : 'Description (Bangla)'}</label>
                <textarea
                  rows={2}
                  required
                  value={pressHeaderSettings.desc_bn || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, desc_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ভূমিকা বিবরণী (ইংরেজি)' : 'Description (English)'}</label>
                <textarea
                  rows={2}
                  required
                  value={pressHeaderSettings.desc_en || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Header Banner Image Upload Control */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <ImageFieldControl
                label={language === 'bn' ? 'হেডার ব্যানার ব্যাকগ্রাউন্ড ছবি' : 'Header Cover Banner Background Image'}
                value={pressHeaderSettings.banner_image || ''}
                onChange={(val) => setPressHeaderSettings({ ...pressHeaderSettings, banner_image: val })}
                onOpenResizer={() => {
                  openImageResizer('banner', (resizedUrl) => {
                    setPressHeaderSettings(prev => ({ ...prev, banner_image: resizedUrl }));
                  });
                }}
                language={language}
              />
            </div>

            {/* CTA Buttons Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">{language === 'bn' ? 'বাটন ১ টেক্সট (বাংলা)' : 'Button 1 Text (Bangla)'}</label>
                <input
                  type="text"
                  value={pressHeaderSettings.btn1_text_bn || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, btn1_text_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">{language === 'bn' ? 'বাটন ১ টেক্সট (ইংরেজি)' : 'Button 1 Text (English)'}</label>
                <input
                  type="text"
                  value={pressHeaderSettings.btn1_text_en || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, btn1_text_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">{language === 'bn' ? 'বাটন ২ টেক্সট (বাংলা)' : 'Button 2 Text (Bangla)'}</label>
                <input
                  type="text"
                  value={pressHeaderSettings.btn2_text_bn || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, btn2_text_bn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">{language === 'bn' ? 'বাটন ২ টেক্সট (ইংরেজি)' : 'Button 2 Text (English)'}</label>
                <input
                  type="text"
                  value={pressHeaderSettings.btn2_text_en || ''}
                  onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, btn2_text_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Section Headings Configuration */}
            <div className="space-y-4 pt-2">
              <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#2E5942]" />
                <span>{language === 'bn' ? 'প্রেস পেজের সকল সেকশন শিরোনাম কাস্টমাইজেশন' : 'Press Page Section Headings & Subtitles'}</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ১ শিরোনাম (বাংলা)' : 'Section 1 Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec1_title_bn || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec1_title_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ১ শিরোনাম (ইংরেজি)' : 'Section 1 Title (English)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec1_title_en || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec1_title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ২ শিরোনাম (বাংলা)' : 'Section 2 Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec2_title_bn || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec2_title_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ২ শিরোনাম (ইংরেজি)' : 'Section 2 Title (English)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec2_title_en || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec2_title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৩ শিরোনাম (বাংলা)' : 'Section 3 Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec3_title_bn || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec3_title_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৩ শিরোনাম (ইংরেজি)' : 'Section 3 Title (English)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec3_title_en || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec3_title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৪ শিরোনাম (বাংলা)' : 'Section 4 Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec4_title_bn || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec4_title_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৪ শিরোনাম (ইংরেজি)' : 'Section 4 Title (English)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec4_title_en || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec4_title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৫ শিরোনাম (বাংলা)' : 'Section 5 Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec5_title_bn || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec5_title_bn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ৫ শিরোনাম (ইংরেজি)' : 'Section 5 Title (English)'}</label>
                  <input
                    type="text"
                    value={pressHeaderSettings.sec5_title_en || ''}
                    onChange={(e) => setPressHeaderSettings({ ...pressHeaderSettings, sec5_title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingHeaderSettings}
                className="px-6 py-2.5 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingHeaderSettings ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'হেডার ও শিরোনাম সেভ করুন' : 'Save Header Settings')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: PRESS RELEASES & NEWS COVERAGE */}
      {activePressSubTab === 'releases' && (
        <div className="space-y-6">
          {editingPress ? (
            /* Press Release Form */
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingPress.title_bn || !editingPress.title_en) {
                  alert(language === 'bn' ? 'শিরোনাম অবশ্যই প্রদান করতে হবে।' : 'Title is required.');
                  return;
                }
                const finalItem = {
                  ...editingPress,
                  updatedAt: new Date(),
                  createdAt: editingPress.createdAt || new Date(),
                  status: editingPress.status || 'published'
                };
                try {
                  await cpanelApi.setDoc('press', editingPress.id, finalItem);
                  alert(language === 'bn' ? 'প্রেস আইটেমটি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Press item saved successfully!');
                  setEditingPress(null);
                } catch (err) {
                  console.error("Error saving press item:", err);
                  try {
                    const currentCached = localStorage.getItem('cached_press');
                    let list = currentCached ? JSON.parse(currentCached) : [];
                    list = list.filter((p: any) => p.id !== editingPress.id);
                    list.unshift(finalItem);
                    safeCacheData('cached_press', list);
                    setPressList(list);
                    alert(language === 'bn'
                      ? 'তথ্যটি লোকাল ব্রাউজারে সংরক্ষিত হয়েছে।'
                      : 'Saved locally to browser.'
                    );
                    setEditingPress(null);
                  } catch (localErr) {
                    alert(language === 'bn' ? 'সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Error saving press item.');
                  }
                }
              }}
              className="bg-white p-6 rounded-3xl border border-[#B8862A]/20 shadow-xl space-y-6 animate-fade-in font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#B8862A]" />
                  <span>
                    {editingPress.createdAt 
                      ? (language === 'bn' ? 'প্রেস বিজ্ঞপ্তি/সংবাদ সম্পাদনা' : 'Edit Press Item') 
                      : (language === 'bn' ? 'নতুন প্রেস বিজ্ঞপ্তি / সংবাদ যোগ করুন' : 'Add New Press Item')}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingPress(null)}
                  className="p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-xl transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</label>
                  <input
                    type="text"
                    value={editingPress.title_bn || ''}
                    onChange={(e) => setEditingPress({ ...editingPress, title_bn: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: জাতীয় বইপড়া কর্মসূচি উদ্বোধন' : 'e.g. National Book Reading Inauguration'}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</label>
                  <input
                    type="text"
                    value={editingPress.title_en || ''}
                    onChange={(e) => setEditingPress({ ...editingPress, title_en: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: National Book Reading Program' : 'e.g. National Book Reading Program'}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={editingPress.category || 'Press Release'}
                    onChange={(e) => setEditingPress({ ...editingPress, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm bg-white"
                  >
                    <option value="Press Release">{language === 'bn' ? 'প্রেস বিজ্ঞপ্তি (Press Release)' : 'Press Release'}</option>
                    <option value="News">{language === 'bn' ? 'সংবাদ কভারেজ (News)' : 'News'}</option>
                    <option value="Events">{language === 'bn' ? 'ইভেন্ট সংবাদ (Events)' : 'Events'}</option>
                    <option value="Awards">{language === 'bn' ? 'পুরস্কার সম্মাননা (Awards)' : 'Awards'}</option>
                    <option value="Publications">{language === 'bn' ? 'প্রকাশনা (Publications)' : 'Publications'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'প্রকাশের তারিখ' : 'Publish Date'}</label>
                  <input
                    type="date"
                    value={editingPress.publishedDate || ''}
                    onChange={(e) => setEditingPress({ ...editingPress, publishedDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'লেখক / প্রচারক' : 'Author / Source Cell'}</label>
                  <input
                    type="text"
                    value={editingPress.author || ''}
                    onChange={(e) => setEditingPress({ ...editingPress, author: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: মিডিয়া সেল, বিএসকে' : 'e.g. Media Cell, BSK'}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</label>
                  <select
                    value={editingPress.status || 'published'}
                    onChange={(e) => setEditingPress({ ...editingPress, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm bg-white"
                  >
                    <option value="published">{language === 'bn' ? 'প্রকাশিত (Published)' : 'Published'}</option>
                    <option value="draft">{language === 'bn' ? 'খসড়া (Draft)' : 'Draft'}</option>
                  </select>
                </div>

                {editingPress.category === 'News' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সংবাদমাধ্যম লোগো/নাম' : 'Media Source Name'}</label>
                      <input
                        type="text"
                        value={editingPress.mediaSource || ''}
                        onChange={(e) => setEditingPress({ ...editingPress, mediaSource: e.target.value })}
                        placeholder="Prothom Alo / The Daily Star / Kaler Kantho / Somoy TV / Channel i"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'মূল সংবাদের লিংক' : 'External News Link (URL)'}</label>
                      <input
                        type="url"
                        value={editingPress.newsUrl || ''}
                        onChange={(e) => setEditingPress({ ...editingPress, newsUrl: e.target.value })}
                        placeholder="https://example.com/news-article"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (Short Summary)' : 'Short Summary'}</label>
                <textarea
                  value={editingPress.summary || ''}
                  onChange={(e) => setEditingPress({ ...editingPress, summary: e.target.value })}
                  placeholder={language === 'bn' ? 'সারাদেশে বিশ্বসাহিত্য কেন্দ্রের বইপড়া কর্মসূচির নতুন আবর্তনের সূচনা করা হয়েছে...' : 'The BSK book reading program cycle has officially kicked off across Bangladesh...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm h-16 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'মূল বিস্তারিত বিষয়বস্তু (Full Content)' : 'Full Content / Details'}</label>
                <textarea
                  value={editingPress.content || ''}
                  onChange={(e) => setEditingPress({ ...editingPress, content: e.target.value })}
                  placeholder={language === 'bn' ? 'বিস্তারিত তথ্য এখানে লিখুন...' : 'Write complete release details here...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm h-32"
                  required
                />
              </div>

              {/* Cover Image & PDF File Upload Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <ImageFieldControl
                  label={language === 'bn' ? 'প্রেস বিজ্ঞপ্তি কাভার ইমেজ (Cover Image)' : 'Cover Image'}
                  value={editingPress.coverImage || ''}
                  onChange={(val) => setEditingPress({ ...editingPress, coverImage: val })}
                  onOpenResizer={() => {
                    openImageResizer('landscape', (resizedUrl) => {
                      setEditingPress(prev => prev ? { ...prev, coverImage: resizedUrl } : null);
                    });
                  }}
                  language={language}
                />

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'পিডিএফ সংযুক্তি (PDF Attachment)' : 'PDF Attachment'}</label>
                  {editingPress.pdf ? (
                    <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-6 w-6 text-red-600 shrink-0" />
                        <div className="truncate text-left">
                          <p className="text-xs font-bold text-stone-800 truncate">{editingPress.pdfName || 'Document.pdf'}</p>
                          <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-mono">PDF File Attached</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPress(prev => prev ? { ...prev, pdf: '', pdfName: '' } : null)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="relative w-full h-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#2E5942] flex flex-col items-center justify-center bg-white transition cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 950 * 1024) {
                                alert(language === 'bn' ? 'পিডিএফ সাইজ অবশ্যই ৯৫০ কেবির কম হতে হবে।' : 'PDF size must be under 950 KB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setEditingPress(prev => prev ? {
                                  ...prev,
                                  pdf: reader.result as string,
                                  pdfName: file.name
                                } : null);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="h-5 w-5 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-600 font-bold">{language === 'bn' ? '📁 পিডিএফ ফাইল সিলেক্ট করুন' : '📁 Select PDF File'}</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">(Max 950 KB)</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100 justify-end select-none">
                <button
                  type="button"
                  onClick={() => setEditingPress(null)}
                  className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#2E5942] hover:bg-[#2E5942]/90 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Release'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end select-none">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPress({
                      id: 'press_' + Date.now(),
                      title_bn: '',
                      title_en: '',
                      category: 'Press Release',
                      summary: '',
                      content: '',
                      publishedDate: new Date().toISOString().split('T')[0],
                      author: language === 'bn' ? 'মিডিয়া সেল, বিএসকে' : 'Media Cell, BSK',
                      status: 'published',
                      coverImage: '',
                      pdf: ''
                    });
                  }}
                  className="px-4 py-2 bg-[#2E5942] hover:bg-[#2E5942]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'bn' ? 'নতুন প্রেস বিজ্ঞপ্তি / সংবাদ যোগ করুন' : 'Add Press Item'}</span>
                </button>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                {pressList.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 font-sans italic text-sm">
                    {language === 'bn' ? 'কোনো প্রেস বিজ্ঞপ্তি পাওয়া যায়নি।' : 'No press releases or news items found.'}
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {pressList.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-stone-50/50 transition flex items-center justify-between gap-4 font-sans text-left">
                        <div className="flex items-center gap-3 truncate min-w-0">
                          <div className="h-12 w-16 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                            {item.coverImage ? (
                              <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">📰</div>
                            )}
                          </div>
                          <div className="truncate text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-200/50">{item.category}</span>
                              <span className="text-[10px] text-stone-400">📅 {item.publishedDate}</span>
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full uppercase ${
                                item.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-stone-50 text-stone-500 border border-stone-200'
                              }`}>
                                {item.status || 'published'}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-stone-800 truncate max-w-lg">
                              {language === 'bn' ? item.title_bn : item.title_en}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 select-none">
                          <button
                            type="button"
                            onClick={() => setEditingPress(item)}
                            className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl transition cursor-pointer"
                            title="Edit Press"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই প্রেস আইটেমটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this press item?')) {
                                try {
                                  await cpanelApi.deleteDoc('press', item.id);
                                  alert(language === 'bn' ? 'প্রেস আইটেমটি মুছে ফেলা হয়েছে!' : 'Press item deleted successfully!');
                                } catch (err) {
                                  console.error("Error deleting press item:", err);
                                  alert(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Error deleting press item.');
                                }
                              }
                            }}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                            title="Delete Press"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PHOTO GALLERY & ALBUMS */}
      {activePressSubTab === 'albums' && (
        <div className="space-y-6">
          {editingAlbum ? (
            /* Album Form */
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingAlbum.name_bn || !editingAlbum.name_en) {
                  alert(language === 'bn' ? 'অ্যালবাম নাম অবশ্যই প্রদান করতে হবে।' : 'Album name is required.');
                  return;
                }
                const finalAlbum = {
                  ...editingAlbum,
                  photos: editingAlbum.photos || [],
                  updatedAt: new Date()
                };

                const serializedLength = JSON.stringify(finalAlbum).length;
                if (serializedLength > 950 * 1024) {
                  alert(language === 'bn'
                    ? `অ্যালবামটির সাইজ অনেক বড় হয়ে গেছে (${Math.round(serializedLength / 1024)} KB)! ডাটাবেসে ১টি অ্যালবামে সর্বোচ্চ ১০২৪ KB রাখা যায়। অনুগ্রহ করে কিছু ছবি ডিলিট করুন।`
                    : `The album is too large (${Math.round(serializedLength / 1024)} KB)! Please remove some photos.`
                  );
                  return;
                }

                try {
                  await cpanelApi.setDoc('photo_albums', editingAlbum.id, finalAlbum);
                  alert(language === 'bn' ? 'ফটো অ্যালবামটি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Photo album saved successfully!');
                  setEditingAlbum(null);
                } catch (err) {
                  console.error("Error saving photo album:", err);
                  alert(language === 'bn' ? 'সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Error saving photo album.');
                }
              }}
              className="bg-white p-6 rounded-3xl border border-[#B8862A]/20 shadow-xl space-y-6 animate-fade-in font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-[#B8862A]" />
                  <span>
                    {editingAlbum.updatedAt 
                      ? (language === 'bn' ? 'অ্যালবাম তথ্য সংশোধন' : 'Edit Album Details') 
                      : (language === 'bn' ? 'নতুন অ্যালবাম তৈরি করুন' : 'Create New Photo Album')}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-xl transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'অ্যালবাম নাম (বাংলা)' : 'Album Name (Bangla)'}</label>
                  <input
                    type="text"
                    value={editingAlbum.name_bn || ''}
                    onChange={(e) => setEditingAlbum({ ...editingAlbum, name_bn: e.target.value })}
                    placeholder={language === 'bn' ? 'বই বিতরণ / পুরস্কার বিতরণী' : 'Book Distribution / Award Ceremony'}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 font-bold outline-none text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'অ্যালবাম নাম (ইংরেজি)' : 'Album Name (English)'}</label>
                  <input
                    type="text"
                    value={editingAlbum.name_en || ''}
                    onChange={(e) => setEditingAlbum({ ...editingAlbum, name_en: e.target.value })}
                    placeholder="Book Distribution / Award Ceremony"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 font-bold outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* Album Cover Image */}
              <ImageFieldControl
                label={language === 'bn' ? 'অ্যালবাম কাভার ছবি (Album Cover Image)' : 'Album Cover Image'}
                value={editingAlbum.cover || ''}
                onChange={(val) => setEditingAlbum({ ...editingAlbum, cover: val })}
                onOpenResizer={() => {
                  openImageResizer('landscape', (resizedUrl) => {
                    setEditingAlbum(prev => prev ? { ...prev, cover: resizedUrl } : null);
                  });
                }}
                language={language}
              />

              {/* Album Photos Batch Upload */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block">{language === 'bn' ? 'অ্যালবামের ছবিসমূহ (Photos Gallery)' : 'Album Photos Gallery'}</label>
                    <p className="text-[11px] text-stone-400">{language === 'bn' ? 'একসাথে একাধিক ছবি সিলেক্ট করে আপলোড করুন।' : 'Batch upload multiple images at once.'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Batch Upload Button */}
                    <label className="px-3 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded-xl hover:bg-[#203F2F] transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{language === 'bn' ? '📁 একাধিক ছবি একসাথে যুক্ত করুন' : '📁 Upload Multiple Photos'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
                          if (files.length > 0) {
                            try {
                              const compressedPromises = files.map(f => compressAndReadImage(f, 1200, 1200));
                              const compressedList = await Promise.all(compressedPromises);
                              setEditingAlbum(prev => prev ? {
                                ...prev,
                                photos: [...(prev.photos || []), ...compressedList]
                              } : null);
                            } catch (err) {
                              alert(language === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে' : 'Error batch uploading photos');
                            }
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        openImageResizer('any', (resizedUrl) => {
                          setEditingAlbum(prev => prev ? {
                            ...prev,
                            photos: [...(prev.photos || []), resizedUrl]
                          } : null);
                        });
                      }}
                      className="px-3 py-1.5 bg-[#FAF7F2] text-[#B8862A] border border-[#B8862A]/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{language === 'bn' ? 'রিসাইজার' : 'Resizer'}</span>
                    </button>
                  </div>
                </div>

                {(() => {
                  let photosList = editingAlbum.photos || editingAlbum.images || [];
                  if (typeof photosList === 'string') {
                    try { photosList = JSON.parse(photosList); } catch (_) { photosList = []; }
                  }
                  if (!Array.isArray(photosList) || photosList.length === 0) {
                    return (
                      <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs italic">
                        {language === 'bn' ? 'এই অ্যালবামে কোনো ছবি নেই।' : 'No photos in this album.'}
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {photosList.map((photo: string, index: number) => (
                      <div key={index} className="relative h-24 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group shadow-2xs">
                        <img src={photo} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAlbum(prev => {
                              if (!prev) return null;
                              const nextPhotos = [...(prev.photos || [])];
                              nextPhotos.splice(index, 1);
                              return { ...prev, photos: nextPhotos };
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition scale-90 group-hover:scale-100 cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100 justify-end select-none">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#2E5942] hover:bg-[#2E5942]/90 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Album'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end select-none">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlbum({
                      id: 'album_' + Date.now(),
                      name_bn: '',
                      name_en: '',
                      cover: '',
                      photos: []
                    });
                  }}
                  className="px-4 py-2 bg-[#2E5942] hover:bg-[#2E5942]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'bn' ? 'নতুন অ্যালবাম তৈরি করুন' : 'Create New Album'}</span>
                </button>
              </div>

              {/* Grid Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {albumsList.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-stone-400 font-sans italic text-sm bg-white border border-stone-200 rounded-2xl">
                    {language === 'bn' ? 'কোনো ফটো অ্যালবাম পাওয়া যায়নি।' : 'No photo albums found.'}
                  </div>
                ) : (
                  albumsList.map((album) => (
                    <div key={album.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-150 flex flex-col h-full font-sans text-left">
                      <div className="h-32 bg-stone-100 border-b border-stone-100 relative">
                        {album.cover ? (
                          <img src={album.cover} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">🖼️</div>
                        )}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                          {(album.photos || []).length} {language === 'bn' ? 'ছবি' : 'Photos'}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-sm text-stone-800 leading-snug line-clamp-2">
                            {language === 'bn' ? album.name_bn : album.name_en}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3 mt-3 select-none">
                          <button
                            type="button"
                            onClick={() => setEditingAlbum(album)}
                            className="p-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-lg transition cursor-pointer"
                            title="Edit Album"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই অ্যালবামটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this album?')) {
                                try {
                                  await cpanelApi.deleteDoc('photo_albums', album.id);
                                  alert(language === 'bn' ? 'অ্যালবামটি মুছে ফেলা হয়েছে!' : 'Album deleted successfully!');
                                } catch (err) {
                                  console.error("Error deleting album:", err);
                                  alert(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Error deleting album.');
                                }
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                            title="Delete Album"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: OFFICIAL MEDIA DOWNLOADS & RESOURCES (SECTION 4) */}
      {activePressSubTab === 'downloads' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6 font-sans text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h4 className="font-serif font-extrabold text-[#1A1207] text-base flex items-center gap-2">
                <Download className="h-5 w-5 text-[#2E5942]" />
                <span>{language === 'bn' ? '৪. অফিশিয়াল মিডিয়া ডাউনলোড ও রিসোর্স ফিল্ড ব্যবস্থাপনা' : '4. Official Media Kit Downloads Management'}</span>
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'bn' ? 'প্রেস পেজের "৪. ডাউনলোড এবং রিসোর্স" কার্ডের সকল ফাইল ও লিংক যোগ, পরিবর্তন বা মুছে ফেলুন।' : 'Manage all downloadable brand files, PDF guides, SVG logos, and media kit bundles.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingDownloadItem({
                  id: 'dl_' + Date.now(),
                  title_bn: '',
                  title_en: '',
                  fileType: 'PDF',
                  fileSize: '1.0 MB',
                  fileUrl: ''
                });
              }}
              className="px-4 py-2 bg-[#2E5942] hover:bg-[#203F2F] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'bn' ? 'নতুন ডাউনলোড আইটেম যোগ করুন' : 'Add Download File'}</span>
            </button>
          </div>

          {editingDownloadItem ? (
            /* Download Item Form */
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <h5 className="font-serif font-bold text-sm text-stone-900 flex items-center justify-between">
                <span>{language === 'bn' ? 'ডাউনলোড ফাইল বিবরণী সম্পাদনা' : 'Edit Download File Details'}</span>
                <button type="button" onClick={() => setEditingDownloadItem(null)} className="text-stone-400 hover:text-stone-600">
                  <X className="h-4 w-4" />
                </button>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ফাইল শিরোনাম (বাংলা)' : 'File Title (Bangla)'}</label>
                  <input
                    type="text"
                    required
                    value={editingDownloadItem.title_bn || ''}
                    onChange={(e) => setEditingDownloadItem({ ...editingDownloadItem, title_bn: e.target.value })}
                    placeholder="উদা: BSK অফিশিয়াল লোগো (PNG)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ফাইল শিরোনাম (ইংরেজি)' : 'File Title (English)'}</label>
                  <input
                    type="text"
                    required
                    value={editingDownloadItem.title_en || ''}
                    onChange={(e) => setEditingDownloadItem({ ...editingDownloadItem, title_en: e.target.value })}
                    placeholder="e.g. BSK Official Logo (PNG)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ফাইল টাইপ (Type)' : 'File Type'}</label>
                  <select
                    value={editingDownloadItem.fileType || 'PDF'}
                    onChange={(e) => setEditingDownloadItem({ ...editingDownloadItem, fileType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                  >
                    <option value="PNG">PNG Image</option>
                    <option value="SVG">SVG Vector</option>
                    <option value="PDF">PDF Document</option>
                    <option value="ZIP">ZIP Bundle</option>
                    <option value="DOCX">Word Document</option>
                    <option value="OTHER">Other File</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ফাইল সাইজ লেবেল' : 'File Size Label'}</label>
                  <input
                    type="text"
                    value={editingDownloadItem.fileSize || ''}
                    onChange={(e) => setEditingDownloadItem({ ...editingDownloadItem, fileSize: e.target.value })}
                    placeholder="e.g. 1.2 MB / 45 KB"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              {/* File Attachment / URL Input */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'ফাইল আপলোড অথবা URL লিঙ্ক' : 'Upload File or Provide URL'}</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <label className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
                    <Upload className="h-4 w-4 text-[#2E5942]" />
                    <span>{language === 'bn' ? '📁 ডিভাইস থেকে ফাইল আপলোড করুন' : '📁 Upload Local File'}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 950 * 1024) {
                            alert(language === 'bn' ? 'ফাইল সাইজ অবশ্যই ৯৫০ কেবির কম হতে হবে।' : 'File size must be under 950 KB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                            const sizeKB = Math.round(file.size / 1024);
                            const sizeLabel = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
                            setEditingDownloadItem(prev => prev ? {
                              ...prev,
                              fileUrl: reader.result as string,
                              fileSize: sizeLabel
                            } : null);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={editingDownloadItem.fileUrl || ''}
                    onChange={(e) => setEditingDownloadItem({ ...editingDownloadItem, fileUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDownloadItem(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!editingDownloadItem.title_bn || !editingDownloadItem.title_en) {
                      alert(language === 'bn' ? 'শিরোনাম আবশ্যক।' : 'Title is required.');
                      return;
                    }
                    const updatedList = pressDownloadsList.filter(d => d.id !== editingDownloadItem.id);
                    updatedList.push(editingDownloadItem);
                    savePressDownloads(updatedList);
                    setEditingDownloadItem(null);
                  }}
                  className="px-5 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>{language === 'bn' ? 'তালিকায় সেভ করুন' : 'Save to List'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#2E5942] p-5 rounded-2xl text-white space-y-3">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <h5 className="font-serif font-bold text-sm">
                    {language === 'bn' ? 'ডাউনলোড উইজেট প্রিভিউ (Live Preview)' : 'Download Widget Preview'}
                  </h5>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">Section 4</span>
                </div>

                <div className="space-y-2">
                  {pressDownloadsList.map((item) => (
                    <div key={item.id} className="p-3 bg-white/10 border border-white/10 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold">{language === 'bn' ? item.title_bn : item.title_en}</p>
                        <span className="text-[9px] font-mono text-stone-300">{item.fileType} • {item.fileSize}</span>
                      </div>
                      <div className="flex items-center gap-1.5 select-none">
                        <button
                          type="button"
                          onClick={() => setEditingDownloadItem(item)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(language === 'bn' ? 'আইটেমটি মুছে ফেলতে চান?' : 'Delete this item?')) {
                              const newList = pressDownloadsList.filter(d => d.id !== item.id);
                              savePressDownloads(newList);
                            }
                          }}
                          className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: MEDIA CONTACT (SECTION 5) */}
      {activePressSubTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h4 className="font-serif font-extrabold text-stone-900 text-base flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#2E5942]" />
              <span>{language === 'bn' ? '৫. মিডিয়া ও প্রেস যোগাযোগ তথ্য সম্পাদনা' : '5. Edit Media & Public Relations Contact Details'}</span>
            </h4>
            <p className="text-xs text-stone-500 font-sans mt-1">
              {language === 'bn' 
                ? 'প্রেস পেজের একদম নিচের মিডিয়া কো-অর্ডিনেটর বিজনেস কার্ড এবং অফিসের সময়সূচি পরিবর্তন করুন।' 
                : 'Modify the media liaison coordinator business card and operational hours displayed at the bottom of the Press page.'}
            </p>
          </div>

          <form onSubmit={saveMediaContact} className="space-y-4 font-sans text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinator Business Card details */}
              <div className="space-y-4 p-4 bg-stone-50/50 rounded-xl border border-stone-200/60">
                <span className="text-[10px] bg-[#2E5942]/10 text-[#2E5942] font-bold px-2 py-0.5 rounded">
                  {language === 'bn' ? 'মিডিয়া বিজনেস কার্ড ফিল্ড' : 'Media Card Fields'}
                </span>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্ড লেবেল (বাংলা)' : 'Card Label (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_title_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_title_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্ড লেবেল (ইংরেজি)' : 'Card Label (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_title_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_title_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কর্মকর্তার নাম (বাংলা)' : "Officer's Name (Bangla)"}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_name_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_name_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কর্মকর্তার নাম (ইংরেজি)' : "Officer's Name (English)"}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_name_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_name_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'পদবী ও শাখা (বাংলা)' : 'Role & Dept (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_role_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_role_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'পদবী ও শাখা (ইংরেজি)' : 'Role & Dept (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_role_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_role_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</label>
                  <input 
                    type="email" 
                    required
                    value={mediaContact.coordinator_email || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_email: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_phone || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_phone: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                  />
                </div>
              </div>

              {/* Office, Hours and Notes details */}
              <div className="space-y-4 p-4 bg-stone-50/50 rounded-xl border border-stone-200/60">
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded">
                  {language === 'bn' ? 'কার্যালয়, সময় ও নোটিশ ফিল্ড' : 'Desk, Hours & Note Fields'}
                </span>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যালয় লেবেল (বাংলা)' : 'Office Label (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.office_label_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, office_label_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যালয় লেবেল (ইংরেজি)' : 'Office Label (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.office_label_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, office_label_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যালয় ঠিকানা (বাংলা)' : 'Office Address (Bangla)'}</label>
                  <textarea 
                    rows={2}
                    required
                    value={mediaContact.office_value_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, office_value_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যালয় ঠিকানা (ইংরেজি)' : 'Office Address (English)'}</label>
                  <textarea 
                    rows={2}
                    required
                    value={mediaContact.office_value_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, office_value_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'অফিস সময় লেবেল (বাংলা)' : 'Hours Label (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.hours_label_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, hours_label_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'অফিস সময় লেবেল (ইংরেজি)' : 'Hours Label (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.hours_label_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, hours_label_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যকর সময় (বাংলা)' : 'Working Hours (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.hours_value_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, hours_value_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কার্যকর সময় (ইংরেজি)' : 'Working Hours (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.hours_value_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, hours_value_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'জরুরি বিজ্ঞপ্তি / নোট (বাংলা)' : 'Emergency Notice / Note (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.note_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, note_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'জরুরি বিজ্ঞপ্তি / নোট (ইংরেজি)' : 'Emergency Notice / Note (English)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.note_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, note_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-150 flex justify-end">
              <button
                type="submit"
                disabled={isSavingMediaContact}
                className="px-6 py-2 bg-[#2E5942] text-white text-xs font-bold rounded-lg shadow-md hover:scale-102 hover:bg-[#203F2F] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingMediaContact ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'রক্ষণ করুন' : 'Save Details')}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
