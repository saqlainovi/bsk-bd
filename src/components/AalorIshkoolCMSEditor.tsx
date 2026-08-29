import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, Upload, Plus, Trash2, GraduationCap, ImageIcon, Award, FileText, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface AalorIshkoolCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const AalorIshkoolCMSEditor: React.FC<AalorIshkoolCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
}) => {
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'hero' | 'pillars' | 'courses' | 'admission' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading('hero');
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        setEditingPage({ ...editingPage, hero_image: url, image: url });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, gIdx: number) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(`gal_${gIdx}`);
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        const updated = [...(editingPage.gallery || [])];
        updated[gIdx].image = url;
        setEditingPage({ ...editingPage, gallery: updated });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    }
  };

  return (
    <div className="space-y-6 text-left font-sans text-xs">
      {/* Sub Tabs */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Sparkles },
          { id: 'pillars', labelBn: '২. ৫টি মূল স্তম্ভ', icon: Layers },
          { id: 'courses', labelBn: '৩. ৪০টি বিষয়ভিত্তিক কোর্স', icon: BookOpen },
          { id: 'admission', labelBn: '৪. ভর্তি ও আবেদন তথ্য', icon: GraduationCap },
          { id: 'gallery', labelBn: '৫. ফটো গ্যালারি', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive ? 'bg-[#1A1207] text-[#F0CC7A] shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100 border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HERO & INTRO */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <Sparkles className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '১. হিরো ব্যানার ও মূল স্লোগান' : '1. Hero Banner & Tagline'}</span>
          </h4>

          {/* Banner Image Upload & Live Preview */}
          <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#B8862A]" />
                <span>আলোর ইশকুল মূল ব্যানার ছবি (Hero Banner Image)</span>
              </label>
              <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
            </div>

            <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
              <img 
                src={editingPage.hero_image || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop'} 
                alt="Ishkool Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <button
                type="button"
                onClick={() => {
                  setEditingPage({
                    ...editingPage,
                    hero_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
                    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop'
                  });
                }}
                className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded-lg font-bold cursor-pointer transition"
              >
                ডিফল্ট ছবি ফিরিয়ে আনুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">ইমেজ লিংক বা সার্ভার ইউআরএল</label>
                <input
                  type="text"
                  value={editingPage.hero_image || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value, image: e.target.value })}
                  placeholder="/assets/IMGS/..."
                  className="w-full p-2 border rounded-lg text-xs font-mono bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">পিসি থেকে নতুন ব্যানার ছবি আপলোড করুন</label>
                <label className="border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 hover:border-[#2E5942] transition flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading === 'hero'}
                    onChange={handleHeroUpload}
                  />
                  <Upload className={`h-4 w-4 text-[#2E5942] ${uploading === 'hero' ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold text-[#2E5942]">
                    {uploading === 'hero' ? 'আপলোড হচ্ছে...' : '📁 ব্যানার ছবি নির্বাচন করুন'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'হিরো শিরোনাম (বাংলা)' : 'Hero Title (BN)'}</label>
              <input
                type="text"
                value={editingPage.hero_title_bn || editingPage.title_bn || ''}
                onChange={(e) => setEditingPage({ ...editingPage, hero_title_bn: e.target.value, title_bn: e.target.value })}
                placeholder="আলোর ইশকুল - আত্মবিকাশ ও মুক্তবুদ্ধির চর্চা কেন্দ্র"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'হিরো শিরোনাম (ইংরেজি)' : 'Hero Title (EN)'}</label>
              <input
                type="text"
                value={editingPage.hero_title_en || editingPage.title_en || ''}
                onChange={(e) => setEditingPage({ ...editingPage, hero_title_en: e.target.value, title_en: e.target.value })}
                placeholder="Aalor Ishkool - Center for Self-Development"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'ব্যাজ লেখা (বাংলা)' : 'Badge Text (BN)'}</label>
              <input
                type="text"
                value={editingPage.badge_bn || ''}
                onChange={(e) => setEditingPage({ ...editingPage, badge_bn: e.target.value })}
                placeholder="৪ বছর মেয়াদী বিশেষ পাঠ্যক্রম • বিশ্বসাহিত্য কেন্দ্র"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'ব্যাজ লেখা (ইংরেজি)' : 'Badge Text (EN)'}</label>
              <input
                type="text"
                value={editingPage.badge_en || ''}
                onChange={(e) => setEditingPage({ ...editingPage, badge_en: e.target.value })}
                placeholder="4-Year Liberal Curriculum • BSK"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / স্লোগান (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={2}
              value={editingPage.hero_subtitle_bn || editingPage.subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_subtitle_bn: e.target.value, subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'উক্তি / স্মরণীয় বাণী (বাংলা)' : 'Core Quote (BN)'}</label>
            <input
              type="text"
              value={editingPage.hero_quote_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_quote_bn: e.target.value })}
              placeholder="✨ &quot;মানুষ তার স্বপ্নের সমান বড়...&quot;"
              className="w-full p-2 border border-stone-200 rounded-lg bg-white italic"
            />
          </div>
        </div>
      )}

      {/* 2. 5 CORE PILLARS */}
      {activeTab === 'pillars' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <Layers className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '২. কর্মসূচির ৫টি মূল স্তম্ভ' : '2. 5 Core Curriculum Pillars'}</span>
          </h4>
          <div className="space-y-3">
            {(editingPage.pillars || [
              { num: '১', titleBn: '২০০টি শ্রেষ্ঠ বই', titleEn: '200 Great Books', descBn: 'বিশ্বসাহিত্যের শ্রেষ্ঠ চিরায়ত গ্রন্থ অধ্যয়ন।' },
              { num: '২', titleBn: 'শ্রেষ্ঠ চলচ্চিত্র প্রদর্শনী', titleEn: 'World Film Classics', descBn: 'বিশ্বচলচ্চিত্রের ধ্রুপদী সৃষ্টিকর্মের রসাস্বাদন।' },
              { num: '৩', titleBn: 'সংগীতের রসাস্বাদন', titleEn: 'Musical Appreciation', descBn: 'শাস্ত্রীয় ও প্রাচ্য-পাশ্চাত্য সংগীতের তালিম।' },
              { num: '৪', titleBn: 'চিত্রকলা ও স্থাপত্য', titleEn: 'Visual Arts & Architecture', descBn: 'বিশ্বের অমর চিত্রকর্ম ও ভাস্কর্য পর্যবেক্ষণ।' },
              { num: '৫', titleBn: 'বিজ্ঞান ও যুক্তিদর্শন', titleEn: 'Logic & Philosophy', descBn: 'বিজ্ঞানমনস্কতা, মুক্তচিন্তা ও যুক্তিবোধ গঠন।' }
            ]).map((pil: any, pIdx: number) => (
              <div key={pIdx} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-[#B8862A]">স্তম্ভ #{pil.num || pIdx + 1}: {pil.titleBn}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (BN)"
                    value={pil.titleBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.pillars || [])];
                      updated[pIdx].titleBn = e.target.value;
                      setEditingPage({ ...editingPage, pillars: updated });
                    }}
                    className="p-2 border border-stone-200 rounded bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Title (EN)"
                    value={pil.titleEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.pillars || [])];
                      updated[pIdx].titleEn = e.target.value;
                      setEditingPage({ ...editingPage, pillars: updated });
                    }}
                    className="p-2 border border-stone-200 rounded bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    placeholder="Description (BN)"
                    value={pil.descBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.pillars || [])];
                      updated[pIdx].descBn = e.target.value;
                      setEditingPage({ ...editingPage, pillars: updated });
                    }}
                    className="p-2 border border-stone-200 rounded bg-white font-sans"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description (EN)"
                    value={pil.descEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.pillars || [])];
                      updated[pIdx].descEn = e.target.value;
                      setEditingPage({ ...editingPage, pillars: updated });
                    }}
                    className="p-2 border border-stone-200 rounded bg-white font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. COURSES */}
      {activeTab === 'courses' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#B8862A]" />
              <span>{isBn ? '৩. বিষয়ভিত্তিক কোর্সসমূহ' : '3. Subject Courses'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.courses || [];
                setEditingPage({
                  ...editingPage,
                  courses: [
                    ...current,
                    { id: `c-${current.length + 1}`, year: '১ম বর্ষ', titleBn: 'নতুন কোর্স', titleEn: 'New Course', hours: '২৪ ঘণ্টা' }
                  ]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>কোর্স যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(editingPage.courses || [
              { id: '1', year: '১ম বর্ষ', titleBn: 'বাংলা ভাষা ও সাহিত্যের রূপরেখা', titleEn: 'Bengali Literature', hours: '৩২ ঘণ্টা' },
              { id: '2', year: '১ম বর্ষ', titleBn: 'বিশ্বসাহিত্যের ধ্রুপদী মহাকাব্য', titleEn: 'World Classics & Epics', hours: '৩৬ ঘণ্টা' },
              { id: '3', year: '২য় বর্ষ', titleBn: 'দর্শন ও চিন্তার ইতিহাস', titleEn: 'History of Philosophy', hours: '৩২ ঘণ্টা' },
              { id: '4', year: '৩য় বর্ষ', titleBn: 'বিশ্বচলচ্চিত্র ও নান্দনিকতা', titleEn: 'Film Aesthetics', hours: '২৮ ঘণ্টা' }
            ]).map((crs: any, cIdx: number) => (
              <div key={cIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B8862A]">কোর্স #{cIdx + 1} ({crs.year || 'সকল বর্ষ'})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.courses || []).filter((_: any, i: number) => i !== cIdx);
                      setEditingPage({ ...editingPage, courses: updated });
                    }}
                    className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="বর্ষ (যেমন: ১ম বর্ষ)"
                    value={crs.year || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.courses || [])];
                      updated[cIdx].year = e.target.value;
                      setEditingPage({ ...editingPage, courses: updated });
                    }}
                    className="p-1.5 border rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Course Title (BN)"
                    value={crs.titleBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.courses || [])];
                      updated[cIdx].titleBn = e.target.value;
                      setEditingPage({ ...editingPage, courses: updated });
                    }}
                    className="col-span-2 p-1.5 border rounded bg-white text-xs font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ADMISSION & REQUIREMENTS */}
      {activeTab === 'admission' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <GraduationCap className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '৪. ভর্তি ও আবেদন যোগ্যতা' : '4. Admission Info'}</span>
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">{isBn ? 'ভর্তি বাটন লেবেল (বাংলা)' : 'Apply Button Label (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.apply_btn_label_bn || 'ভর্তি ও আবেদন ফরম'}
                  onChange={(e) => setEditingPage({ ...editingPage, apply_btn_label_bn: e.target.value })}
                  className="w-full p-2 border rounded bg-white font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">{isBn ? 'ভর্তি বাটন লেবেল (ইংরেজি)' : 'Apply Button Label (EN)'}</label>
                <input
                  type="text"
                  value={editingPage.apply_btn_label_en || 'Online Admission Form'}
                  onChange={(e) => setEditingPage({ ...editingPage, apply_btn_label_en: e.target.value })}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'ভর্তি সংক্রান্ত নির্দেশিকা ও যোগ্যতা (বাংলা)' : 'Admission Details (BN)'}</label>
              <textarea
                rows={4}
                value={editingPage.admission_desc_bn || 'এইচএসসি বা সমমান পাস যে কোনো বিদ্যোৎসাহী শিক্ষার্থী ও জ্ঞানান্বেষী আলোর ইশকুলের ৪ বছর মেয়াদী বিশেষ পাঠ্যক্রমে ভর্তি হতে পারেন।'}
                onChange={(e) => setEditingPage({ ...editingPage, admission_desc_bn: e.target.value })}
                className="w-full p-2 border rounded bg-white font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. PHOTO GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#B8862A]" />
              <span>{isBn ? '৫. আলোর ইশকুল ফটো গ্যালারি' : '5. Photo Gallery'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'পাঠচক্রের দৃশ্য', caption_en: 'Session photo' }]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ছবি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(editingPage.gallery || []).map((gal: any, galIdx: number) => (
              <div key={galIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B8862A]">Photo #{galIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.gallery || []).filter((_: any, i: number) => i !== galIdx);
                      setEditingPage({ ...editingPage, gallery: updated });
                    }}
                    className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {gal.image && (
                  <div className="relative aspect-video max-h-36 w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-900">
                    <img src={gal.image} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={gal.image || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.gallery || [])];
                      updated[galIdx].image = e.target.value;
                      setEditingPage({ ...editingPage, gallery: updated });
                    }}
                    className="flex-1 p-1.5 border border-stone-200 rounded bg-white font-mono text-xs"
                  />
                  <label className="px-2.5 py-1 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, galIdx)} />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Caption (BN)"
                  value={gal.caption_bn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.gallery || [])];
                    updated[galIdx].caption_bn = e.target.value;
                    setEditingPage({ ...editingPage, gallery: updated });
                  }}
                  className="w-full p-1.5 border border-stone-200 rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
