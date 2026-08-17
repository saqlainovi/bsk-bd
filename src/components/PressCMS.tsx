import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, PhoneCall, Mail
} from 'lucide-react';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { Language } from '../types';
import { handleFirestoreError, OperationType } from '../firebase';
import { safeCacheData } from './cacheUtils';

interface PressCMSProps {
  language: Language;
  db: any;
  openImageResizer: (preset: 'banner' | 'landscape' | 'square' | 'portrait' | 'any', callback: (resizedUrl: string) => void) => void;
}

export default function PressCMS({ language, db, openImageResizer }: PressCMSProps) {
  const [pressList, setPressList] = useState<any[]>([]);
  const [albumsList, setAlbumsList] = useState<any[]>([]);
  const [editingPress, setEditingPress] = useState<any | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [activePressSubTab, setActivePressSubTab] = useState<'releases' | 'albums' | 'contact'>('releases');

  // Media & Public Relations Contact State
  const [mediaContact, setMediaContact] = useState<any>({
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
  });
  const [isSavingMediaContact, setIsSavingMediaContact] = useState<boolean>(false);

  // Load Press releases & news coverage from Firestore
  useEffect(() => {
    // Immediate local storage retrieval as immediate data fallback
    try {
      const cachedPress = localStorage.getItem('cached_press');
      if (cachedPress) {
        setPressList(JSON.parse(cachedPress));
      }
      const cachedAlbums = localStorage.getItem('cached_photo_albums');
      if (cachedAlbums) {
        setAlbumsList(JSON.parse(cachedAlbums));
      }
    } catch (e) {
      console.error("Error reading initial local cached press or albums:", e);
    }

    const unsubPress = onSnapshot(collection(db, 'press'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      // Sort descending by publishedDate, then by createdAt
      list.sort((a, b) => {
        const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        const createA = a.createdAt?.seconds || 0;
        const createB = b.createdAt?.seconds || 0;
        return createB - createA;
      });
      setPressList(list);
      safeCacheData('cached_press', list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'press');
    });

    // Load Photo Albums from Firestore
    const unsubAlbums = onSnapshot(collection(db, 'photo_albums'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      setAlbumsList(list);
      safeCacheData('cached_photo_albums', list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'photo_albums');
    });

    return () => {
      unsubPress();
      unsubAlbums();
    };
  }, [db]);

  // Synchronize Media Contact block from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'homepage_blocks', 'media_contact'), (docSnap) => {
      if (docSnap.exists()) {
        setMediaContact(docSnap.data());
      }
    }, (error) => {
      console.warn("Error reading media_contact block in PressCMS:", error);
    });
    return () => unsub();
  }, [db]);

  const saveMediaContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingMediaContact(true);
      await setDoc(doc(db, 'homepage_blocks', 'media_contact'), mediaContact);
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
      {/* CMS Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <h3 className="font-serif font-black text-2xl text-[#1A1207] flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#2E5942]" />
            <span>{language === 'bn' ? '১২. প্রেস ও মিডিয়া সেন্টার' : '12. Press & Media Center'}</span>
          </h3>
          <p className="text-xs text-stone-500 font-sans mt-1">
            {language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্রের প্রেস বিজ্ঞপ্তি, সংবাদ কভারেজ এবং ফটো অ্যালবামসমূহ পরিচালনা করুন।' : 'Manage official press releases, news coverage articles, and photo albums.'}
          </p>
        </div>

        {/* Sub-tabs selector block */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/50 self-start md:self-auto select-none">
          <button
            type="button"
            onClick={() => { setActivePressSubTab('releases'); setEditingPress(null); setEditingAlbum(null); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 ${
              activePressSubTab === 'releases'
                ? 'bg-white text-[#2E5942] shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'প্রেস বিজ্ঞপ্তি ও সংবাদ' : 'Press Releases'}</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-[#2E5942]/10 text-[#2E5942] rounded-full">{pressList.length}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActivePressSubTab('albums'); setEditingPress(null); setEditingAlbum(null); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 ${
              activePressSubTab === 'albums'
                ? 'bg-white text-[#2E5942] shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'ফটো অ্যালবামসমূহ' : 'Photo Albums'}</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-[#2E5942]/10 text-[#2E5942] rounded-full">{albumsList.length}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActivePressSubTab('contact'); setEditingPress(null); setEditingAlbum(null); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 ${
              activePressSubTab === 'contact'
                ? 'bg-white text-[#2E5942] shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'মিডিয়া ও প্রেস যোগাযোগ' : 'Media Contacts'}</span>
          </button>
        </div>
      </div>

      {/* Subtab content 1: Press Releases */}
      {activePressSubTab === 'releases' && (
        <div className="space-y-6">
          {editingPress ? (
            /* Press release form */
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
                  await setDoc(doc(db, 'press', editingPress.id), finalItem);
                  alert(language === 'bn' ? 'প্রেস আইটেমটি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Press item saved successfully!');
                  setEditingPress(null);
                } catch (err) {
                  console.error("Error saving press item:", err);
                  try {
                    // Fallback storage
                    const currentCached = localStorage.getItem('cached_press');
                    let list = currentCached ? JSON.parse(currentCached) : [];
                    list = list.filter((p: any) => p.id !== editingPress.id);
                    list.unshift(finalItem);
                    safeCacheData('cached_press', list);
                    setPressList(list);
                    alert(language === 'bn'
                      ? 'ফায়ারস্টোরে সেভ করতে সমস্যা হয়েছে (কোটা বা নেটওয়ার্ক সীমাবদ্ধতা)। তবে তথ্যটি আপনার ব্রাউজার মেমোরিতে সাময়িকভাবে সংরক্ষণ করা হয়েছে!'
                      : 'Error saving to Firestore (network/quota issue). However, the details have been successfully saved locally to your browser!'
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
                      ? (language === 'bn' ? 'প্রেস বিজ্ঞপ্তি সংশোধন' : 'Edit Press Item') 
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
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
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (১০০-১৫০ অক্ষর)' : 'Short Summary (100-150 chars)'}</label>
                <textarea
                  value={editingPress.summary || ''}
                  onChange={(e) => setEditingPress({ ...editingPress, summary: e.target.value })}
                  placeholder={language === 'bn' ? 'সারাদেশে বিশ্বসাহিত্য কেন্দ্রের বইপড়া কর্মসূচির নতুন আবর্তনের সূচনা করা হয়েছে...' : 'The BSK book reading program cycle has officially kicked off across Bangladesh...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm h-16 resize-none"
                  maxLength={250}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'মূল বিস্তারিত বিষয়বস্তু' : 'Full Content / Details'}</label>
                <textarea
                  value={editingPress.content || ''}
                  onChange={(e) => setEditingPress({ ...editingPress, content: e.target.value })}
                  placeholder={language === 'bn' ? 'বিস্তারিত এখানে লিখুন...' : 'Write complete release details here...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm h-32"
                  required
                />
              </div>

              {/* Cover Image & PDF Upload Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'কাভার ইমেজ' : 'Cover Image'}</label>
                  {editingPress.coverImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 group h-32">
                      <img src={editingPress.coverImage} className="w-full h-full object-cover" alt="Cover Preview" />
                      <button
                        type="button"
                        onClick={() => setEditingPress(prev => prev ? { ...prev, coverImage: '' } : null)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        openImageResizer('landscape', (resizedUrl) => {
                          setEditingPress(prev => prev ? { ...prev, coverImage: resizedUrl } : null);
                        });
                      }}
                      className="w-full h-32 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#2E5942] flex flex-col items-center justify-center bg-white transition cursor-pointer"
                    >
                      <ImageIcon className="h-6 w-6 text-stone-400 mb-1" />
                      <span className="text-xs text-stone-500 font-bold">{language === 'bn' ? 'ল্যান্ডস্কেপ ছবি সিলেক্ট করুন' : 'Select Landscape Image'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'পিডিএফ সংযুক্তি (ঐচ্ছিক)' : 'PDF Attachment (Optional)'}</label>
                  {editingPress.pdf ? (
                    <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-6 w-6 text-red-600 shrink-0" />
                        <div className="truncate text-left">
                          <p className="text-xs font-bold text-stone-800 truncate">{editingPress.pdfName || (language === 'bn' ? 'পিডিএফ ডকুমেন্ট' : 'PDF Document')}</p>
                          <p className="text-[10px] text-stone-400">PDF Base64</p>
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
                    <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#2E5942] flex flex-col items-center justify-center bg-white transition">
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="h-6 w-6 text-stone-400 mb-1 pointer-events-none" />
                      <span className="text-xs text-stone-500 font-bold pointer-events-none">{language === 'bn' ? 'পিডিএফ আপলোড করুন (সর্বোচ্চ ৯৫০ KB)' : 'Upload PDF File (Max 950 KB)'}</span>
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
                  className="px-4 py-2 bg-[#2E5942] hover:bg-[#2E5942]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md animate-fade-in"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'bn' ? 'নতুন প্রেস বিজ্ঞপ্তি / সংবাদ যোগ করুন' : 'Add Press Item'}</span>
                </button>
              </div>

              {/* Table list block */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                {pressList.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 font-sans italic text-sm">
                    {language === 'bn' ? 'কোনো প্রেস বিজ্ঞপ্তি পাওয়া যায়নি।' : 'No press releases or news found.'}
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {pressList.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-stone-50/50 transition flex items-center justify-between gap-4 font-sans text-left">
                        <div className="flex items-center gap-3 truncate min-w-0">
                          <div className="h-10 w-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
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
                                  await deleteDoc(doc(db, 'press', item.id));
                                  alert(language === 'bn' ? 'প্রেস আইটেমটি মুছে ফেলা হয়েছে!' : 'Press item deleted successfully!');
                                } catch (err) {
                                  console.error("Error deleting press item:", err);
                                  try {
                                    const currentCached = localStorage.getItem('cached_press');
                                    if (currentCached) {
                                      let list = JSON.parse(currentCached);
                                      list = list.filter((p: any) => p.id !== item.id);
                                      safeCacheData('cached_press', list);
                                      setPressList(list);
                                      alert(language === 'bn' ? 'লোকাল মেমোরি থেকে মুছে ফেলা হয়েছে (ফায়ারস্টোর অফলাইন)।' : 'Removed from local memory (Firestore offline/quota).');
                                    }
                                  } catch (localErr) {
                                    alert(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Error deleting press item.');
                                  }
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

      {/* Subtab content 2: Photo Albums */}
      {activePressSubTab === 'albums' && (
        <div className="space-y-6">
          {editingAlbum ? (
            /* Album form */
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

                // Firestore document size safety check (max 1MB per document)
                const serializedLength = JSON.stringify(finalAlbum).length;
                if (serializedLength > 950 * 1024) {
                  alert(language === 'bn'
                    ? `অ্যালবামটির সাইজ অনেক বড় হয়ে গেছে (${Math.round(serializedLength / 1024)} KB)! ফায়ারস্টোরে ১টি অ্যালবামে সর্বোচ্চ ১০২৪ KB রাখা যায়। অনুগ্রহ করে কিছু ছবি ডিলিট করুন অথবা কম সাইজে পুনরায় ছবিগুলো আপলোড করুন।`
                    : `The album is too large (${Math.round(serializedLength / 1024)} KB)! Firestore has a limit of 1,024 KB per album. Please remove some photos or re-upload them in a smaller, compressed format.`
                  );
                  return;
                }

                try {
                  await setDoc(doc(db, 'photo_albums', editingAlbum.id), finalAlbum);
                  alert(language === 'bn' ? 'ফটো অ্যালবামটি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Photo album saved successfully!');
                  setEditingAlbum(null);
                } catch (err) {
                  console.error("Error saving photo album:", err);
                  try {
                    // Fallback storage
                    const currentCached = localStorage.getItem('cached_photo_albums');
                    let list = currentCached ? JSON.parse(currentCached) : [];
                    list = list.filter((a: any) => a.id !== editingAlbum.id);
                    list.unshift(finalAlbum);
                    safeCacheData('cached_photo_albums', list);
                    setAlbumsList(list);
                    alert(language === 'bn'
                      ? 'ফায়ারস্টোরে সেভ করতে সমস্যা হয়েছে (কোটা বা নেটওয়ার্ক সীমাবদ্ধতা)। তবে তথ্যটি আপনার ব্রাউজার মেমোরিতে সাময়িকভাবে সংরক্ষণ করা হয়েছে!'
                      : 'Error saving to Firestore (network/quota issue). However, the details have been successfully saved locally to your browser!'
                    );
                    setEditingAlbum(null);
                  } catch (localErr) {
                    alert(language === 'bn' ? 'সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Error saving photo album.');
                  }
                }
              }}
              className="bg-white p-6 rounded-3xl border border-[#B8862A]/20 shadow-xl space-y-6 animate-fade-in font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-serif font-bold text-lg text-[#1A1207] flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#B8862A]" />
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#2E5942] focus:ring-1 focus:ring-[#2E5942] outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'অ্যালবাম কাভার ছবি' : 'Album Cover Image'}</label>
                {editingAlbum.cover ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 group h-32 w-full md:w-1/2">
                    <img src={editingAlbum.cover} className="w-full h-full object-cover" alt="Cover Preview" />
                    <button
                      type="button"
                      onClick={() => setEditingAlbum(prev => prev ? { ...prev, cover: '' } : null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openImageResizer('landscape', (resizedUrl) => {
                        setEditingAlbum(prev => prev ? { ...prev, cover: resizedUrl } : null);
                      });
                    }}
                    className="w-full md:w-1/2 h-32 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#2E5942] flex flex-col items-center justify-center bg-[#FAF7F2] transition cursor-pointer"
                  >
                    <ImageIcon className="h-6 w-6 text-stone-400 mb-1" />
                    <span className="text-xs text-stone-500 font-bold">{language === 'bn' ? 'অ্যালবাম কভার পিকচার সিলেক্ট করুন' : 'Select Album Cover Image'}</span>
                  </button>
                )}
              </div>

              {/* Photos inside Album */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 block">{language === 'bn' ? 'অ্যালবামের ছবিসমূহ' : 'Album Photos'}</label>
                  <button
                    type="button"
                    onClick={() => {
                      openImageResizer('any', (resizedUrl) => {
                        setEditingAlbum(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            photos: [...(prev.photos || []), resizedUrl]
                          };
                        });
                      });
                    }}
                    className="px-3 py-1.5 bg-[#2E5942]/10 hover:bg-[#2E5942]/20 text-[#2E5942] text-[11px] font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{language === 'bn' ? 'ছবি যুক্ত করুন' : 'Add Photo'}</span>
                  </button>
                </div>

                {(!editingAlbum.photos || editingAlbum.photos.length === 0) ? (
                  <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs italic">
                    {language === 'bn' ? 'এই অ্যালবামে কোনো ছবি নেই।' : 'No photos in this album.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {editingAlbum.photos.map((photo: string, index: number) => (
                      <div key={index} className="relative h-20 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group">
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
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition scale-0 group-hover:scale-100 cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Grid block list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {albumsList.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-stone-400 font-sans italic text-sm bg-white border border-stone-200 rounded-2xl">
                    {language === 'bn' ? 'কোনো ফটো অ্যালবাম পাওয়া যায়নি।' : 'No photo albums found.'}
                  </div>
                ) : (
                  albumsList.map((album) => (
                    <div key={album.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-150 flex flex-col h-full font-sans text-left">
                      <div className="h-28 bg-stone-100 border-b border-stone-100 relative">
                        {album.cover ? (
                          <img src={album.cover} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">🖼️</div>
                        )}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded-full">
                          {(album.photos || []).length} {language === 'bn' ? 'ছবি' : 'Photos'}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-sm text-stone-800 leading-snug line-clamp-2">
                            {language === 'bn' ? album.name_bn : album.name_en}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">ID: {album.id}</p>
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
                                  await deleteDoc(doc(db, 'photo_albums', album.id));
                                  alert(language === 'bn' ? 'অ্যালবামটি মুছে ফেলা হয়েছে!' : 'Album deleted successfully!');
                                } catch (err) {
                                  console.error("Error deleting album:", err);
                                  try {
                                    const currentCached = localStorage.getItem('cached_photo_albums');
                                    if (currentCached) {
                                      let list = JSON.parse(currentCached);
                                      list = list.filter((a: any) => a.id !== album.id);
                                      safeCacheData('cached_photo_albums', list);
                                      setAlbumsList(list);
                                      alert(language === 'bn' ? 'লোকাল মেমোরি থেকে অ্যালবামটি মুছে ফেলা হয়েছে (ফায়ারস্টোর অফলাইন)।' : 'Removed album from local memory (Firestore offline/quota).');
                                    }
                                  } catch (localErr) {
                                    alert(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Error deleting album.');
                                  }
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

      {/* Subtab content 3: Media & PR Contact Details */}
      {activePressSubTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h4 className="font-serif font-extrabold text-stone-900 text-base flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#2E5942]" />
              <span>{language === 'bn' ? 'মিডিয়া ও প্রেস যোগাযোগ তথ্য সম্পাদনা' : 'Edit Media & Public Relations Contact Details'}</span>
            </h4>
            <p className="text-xs text-stone-500 font-sans mt-1">
              {language === 'bn' 
                ? 'প্রেস পেজের একদম নিচের মিডিয়া কো-অর্ডিনেটর কার্ড এবং অন্যান্য যোগাযোগ বিবরণী সংশোধন করুন।' 
                : 'Modify the media liaison coordinator business card and operational hours displayed at the bottom of the Press page.'}
            </p>
          </div>

          <form onSubmit={saveMediaContact} className="space-y-4 font-sans text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinator Card details */}
              <div className="space-y-4 p-4 bg-stone-50/50 rounded-xl border border-stone-200/60">
                <span className="text-[10px] bg-[#2E5942]/10 text-[#2E5942] font-bold px-2 py-0.5 rounded">
                  {language === 'bn' ? 'মিডিয়া কার্ড বিবরণী' : 'Media Card Fields'}
                </span>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'মিডিয়া কার্ডের লেবেল (বাংলা)' : 'Card Label (Bangla)'}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_title_bn || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_title_bn: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'মিডিয়া কার্ডের লেবেল (ইংরেজি)' : 'Card Label (English)'}</label>
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
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">{language === 'bn' ? 'কর্মকর্তার নাম (ইংরেজি)' : "Officer's Name (English)"}</label>
                  <input 
                    type="text" 
                    required
                    value={mediaContact.coordinator_name_en || ''} 
                    onChange={(e) => setMediaContact({ ...mediaContact, coordinator_name_en: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
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

              {/* Desk Office, Hours and Notes details */}
              <div className="space-y-4 p-4 bg-stone-50/50 rounded-xl border border-stone-200/60">
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded">
                  {language === 'bn' ? 'কার্যালয়, সময় ও নোটিশ বিজ্ঞপ্তি' : 'Desk, Hours & Note Fields'}
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
