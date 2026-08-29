import React, { useState } from 'react';
import { Sparkles, BookOpen, GraduationCap, Upload, Plus, Trash2, ImageIcon, Award, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface NationwideExcellenceCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const NationwideExcellenceCMSEditor: React.FC<NationwideExcellenceCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
}) => {
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'highlights' | 'levels' | 'gallery' | 'downloads'>('hero');
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
        const updated = [...(editingPage.excellence_gallery || [])];
        updated[gIdx].image = url;
        setEditingPage({ ...editingPage, excellence_gallery: updated });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    }
  };

  const handleHighlightUpload = async (e: React.ChangeEvent<HTMLInputElement>, hIdx: number) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(`hl_${hIdx}`);
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        const updated = [...(editingPage.highlights || [])];
        updated[hIdx].image = url;
        setEditingPage({ ...editingPage, highlights: updated });
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
          { id: 'stats', labelBn: '২. ৪টি মূল পরিসংখ্যান', icon: Award },
          { id: 'highlights', labelBn: '৩. কার্যক্রমের মূল বৈশিষ্ট্যসমূহ', icon: BookOpen },
          { id: 'levels', labelBn: '৪. ৪টি পাঠ স্তর ও শ্রেণি কাঠামো', icon: Layers },
          { id: 'gallery', labelBn: '৫. ফটো গ্যালারি', icon: ImageIcon },
          { id: 'downloads', labelBn: '৬. সিলেবাস ও নিয়মাবলী', icon: FileText }
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

      {/* 1. HERO BANNER */}
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
                <span>কার্যক্রম মূল ব্যানার ছবি (Hero Banner Image)</span>
              </label>
              <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
            </div>

            <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
              <img 
                src={editingPage.hero_image || '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'} 
                alt="Excellence Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <button
                type="button"
                onClick={() => {
                  setEditingPage({
                    ...editingPage,
                    hero_image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg',
                    image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'
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
              <label className="font-bold text-stone-700 block">{isBn ? 'প্রধান শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
              <input
                type="text"
                value={editingPage.title_bn || editingPage.hero_title_bn || ''}
                onChange={(e) => setEditingPage({ ...editingPage, title_bn: e.target.value, hero_title_bn: e.target.value })}
                placeholder="দেশভিত্তিক উৎকর্ষ কার্যক্রম"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'প্রধান শিরোনাম (ইংরেজি)' : 'Title (EN)'}</label>
              <input
                type="text"
                value={editingPage.title_en || editingPage.hero_title_en || ''}
                onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value, hero_title_en: e.target.value })}
                placeholder="Nationwide Reading & Excellence Movement"
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
                placeholder="মূল কর্মসূচি • বিশ্বসাহিত্য কেন্দ্র"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'ব্যাজ লেখা (ইংরেজি)' : 'Badge Text (EN)'}</label>
              <input
                type="text"
                value={editingPage.badge_en || ''}
                onChange={(e) => setEditingPage({ ...editingPage, badge_en: e.target.value })}
                placeholder="Flagship Movement • BSK"
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / সারসংক্ষেপ (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={3}
              value={editingPage.subtitle_bn || editingPage.hero_subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, subtitle_bn: e.target.value, hero_subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
        </div>
      )}

      {/* 2. STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <Award className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '২. ৪টি মূল পরিসংখ্যান মেট্রিক্স' : '2. 4 Key Stats'}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'stats_students', defVal: '১৫,০০,০০০+', label: 'অংশগ্রহণকারী শিক্ষার্থী', sub: 'দেশব্যাপী প্রতি বছর' },
              { key: 'stats_institutions', defVal: '২,১০০+', label: 'শিক্ষা প্রতিষ্ঠান', sub: 'স্কুল, কলেজ ও মাদ্রাসা' },
              { key: 'stats_districts', defVal: '৬৪টি', label: 'জেলা কভারেজ', sub: 'সমগ্র বাংলাদেশে' },
              { key: 'stats_years', defVal: '৪৫ বছর+', label: 'অনবদ্য পথচলা', sub: '১৯৭৯ সাল থেকে নিরবচ্ছিন্ন' }
            ].map((st, sIdx) => (
              <div key={st.key} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">কার্ড #{sIdx + 1}: {st.label}</span>
                <input
                  type="text"
                  value={editingPage[st.key] || st.defVal}
                  onChange={(e) => setEditingPage({ ...editingPage, [st.key]: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded bg-white font-bold text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. HIGHLIGHTS */}
      {activeTab === 'highlights' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#B8862A]" />
              <span>{isBn ? '৩. কার্যক্রমের প্রধান বৈশিষ্ট্যসমূহ' : '3. Program Highlights'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.highlights || [];
                setEditingPage({
                  ...editingPage,
                  highlights: [
                    ...current,
                    {
                      id: String(current.length + 1),
                      title_bn: 'নতুন বৈশিষ্ট্য',
                      title_en: 'New Highlight',
                      desc_bn: 'বৈশিষ্ট্যের বিবরণী।',
                      desc_en: 'Highlight description.',
                      image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'
                    }
                  ]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন বৈশিষ্ট্য যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-4">
            {(editingPage.highlights || [
              {
                id: '1',
                title_bn: 'বই পড়া ও মূল্যায়ন উৎসব',
                title_en: 'Book Reading & Evaluation Festival',
                desc_bn: 'শিক্ষার্থীদের মাঝে বয়স ও মান উপযোগী চমৎকার বিশ্বসাহিত্যের বই বিতরণ এবং বছর শেষে উৎসাহমূলক সাহিত্য মূল্যায়নের মাধ্যমে কৃতি পাঠকদের পুরস্কৃত করা।',
                desc_en: 'Distributing curated world classics tailored for young minds, followed by annual literary evaluation tests.',
                image: '/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg'
              },
              {
                id: '2',
                title_bn: 'শিক্ষক সেমিনার ও নির্দেশনা সভা',
                title_en: 'Teacher Guidance & Seminars',
                desc_bn: 'শিক্ষা প্রতিষ্ঠানের দায়িত্বপ্রাপ্ত সংগঠক শিক্ষকদের জন্য বিশেষ প্রশিক্ষণ, বইপাঠ পরিচালনা নির্দেশিকা এবং সাহিত্য অনুরাগী সমাজ গঠনের কর্মশালা।',
                desc_en: 'Specialized training workshops and guidebooks for organizer teachers.',
                image: '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg'
              }
            ]).map((hl: any, hIdx: number) => (
              <div key={hIdx} className="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B8862A]">বৈশিষ্ট্য #{hIdx + 1}: {hl.title_bn}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.highlights || []).filter((_: any, i: number) => i !== hIdx);
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title BN"
                    value={hl.title_bn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.highlights || [])];
                      updated[hIdx] = { ...updated[hIdx], title_bn: e.target.value };
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="p-2 border rounded bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Title EN"
                    value={hl.title_en || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.highlights || [])];
                      updated[hIdx] = { ...updated[hIdx], title_en: e.target.value };
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="p-2 border rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    placeholder="Desc BN"
                    value={hl.desc_bn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.highlights || [])];
                      updated[hIdx] = { ...updated[hIdx], desc_bn: e.target.value };
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="p-2 border rounded bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Desc EN"
                    value={hl.desc_en || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.highlights || [])];
                      updated[hIdx] = { ...updated[hIdx], desc_en: e.target.value };
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="p-2 border rounded bg-white"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={hl.image || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.highlights || [])];
                      updated[hIdx] = { ...updated[hIdx], image: e.target.value };
                      setEditingPage({ ...editingPage, highlights: updated });
                    }}
                    className="flex-1 p-2 border rounded bg-white font-mono text-xs"
                  />
                  <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    <span>আপলোড</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHighlightUpload(e, hIdx)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. LEVELS */}
      {activeTab === 'levels' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <Layers className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '৪. ৪টি পাঠ স্তর ও শ্রেণি কাঠামো' : '4. 4 Reading Levels & Structure'}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: '1', defTitle: 'প্রাথমিক স্তর (৬ষ্ঠ-৭ম শ্রেণি)', defClasses: 'Class 6 & 7', defDesc: 'রোমাঞ্চ, রূপকথা, বিজ্ঞান কল্পকাহিনী ও শিক্ষামূলক গল্পের বই।' },
              { id: '2', defTitle: 'জুনিয়র স্তর (৮ম শ্রেণি)', defClasses: 'Class 8', defDesc: 'ইতিহাস, জীবনী, বিশ্বসাহিত্য ও চিন্তাশীল কিশোর উপন্যাস।' },
              { id: '3', defTitle: 'সেকেন্ডারি স্তর (৯ম-১০ম শ্রেণি)', defClasses: 'Class 9 & 10', defDesc: 'ধ্রুপদী সাহিত্য, দর্শন, বৈজ্ঞানিক অনুসন্ধান ও মননশীল প্রবন্ধ।' },
              { id: '4', defTitle: 'কলেজ ও উচ্চতর স্তর (একাদশ-দ্বাদশ)', defClasses: 'Class 11 & 12', defDesc: 'বিশ্বসাহিত্যের শ্রেষ্ঠ চিরায়ত গ্রন্থ ও মানব সভ্যতার ইতিহাস।' }
            ].map((lvl, lIdx) => (
              <div key={lvl.id} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">স্তর #{lIdx + 1}</span>
                <input
                  type="text"
                  value={editingPage[`level_${lvl.id}_title`] || lvl.defTitle}
                  onChange={(e) => setEditingPage({ ...editingPage, [`level_${lvl.id}_title`]: e.target.value })}
                  className="w-full p-2 border rounded bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={editingPage[`level_${lvl.id}_desc`] || lvl.defDesc}
                  onChange={(e) => setEditingPage({ ...editingPage, [`level_${lvl.id}_desc`]: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PHOTO GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#B8862A]" />
              <span>{isBn ? '৫. উৎসব ও পাঠক ফটো গ্যালারি' : '5. Festival Photo Gallery'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.excellence_gallery || [];
                setEditingPage({
                  ...editingPage,
                  excellence_gallery: [...current, { image: '', caption_bn: 'ছবি পরিচিতি', caption_en: 'Photo Caption' }]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isBn ? 'ছবি যোগ করুন' : 'Add Photo'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(editingPage.excellence_gallery || []).map((gal: any, galIdx: number) => (
              <div key={galIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B8862A]">Photo #{galIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.excellence_gallery || []).filter((_: any, i: number) => i !== galIdx);
                      setEditingPage({ ...editingPage, excellence_gallery: updated });
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
                      const updated = [...(editingPage.excellence_gallery || [])];
                      updated[galIdx].image = e.target.value;
                      setEditingPage({ ...editingPage, excellence_gallery: updated });
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
                    const updated = [...(editingPage.excellence_gallery || [])];
                    updated[galIdx].caption_bn = e.target.value;
                    setEditingPage({ ...editingPage, excellence_gallery: updated });
                  }}
                  className="w-full p-1.5 border border-stone-200 rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DOWNLOADS & PDF */}
      {activeTab === 'downloads' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
            <FileText className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '৬. সিলেবাস ও নির্দেশিকা ডাউনলোড লিংক' : '6. Syllabus & Rules PDF'}</span>
          </h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'বইপড়া সিলেবাস ও নিয়মাবলী PDF লিংক' : 'Rules PDF URL'}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPage.rules_pdf_url || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, rules_pdf_url: e.target.value })}
                  placeholder="/assets/docs/... or https://..."
                  className="flex-1 p-2 border border-stone-200 rounded-lg bg-white font-mono text-xs"
                />
                <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isBn ? 'PDF আপলোড' : 'Upload PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const url = await uploadImageToServer(e.target.files[0]);
                          setEditingPage({ ...editingPage, rules_pdf_url: url });
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">{isBn ? 'যোগাযোগ হটলাইন ফোন' : 'Contact Phone'}</label>
                <input
                  type="text"
                  value={editingPage.contact_phone || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, contact_phone: e.target.value })}
                  placeholder="+৮৮০ ১৭৩০০৫৫৮০১"
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">{isBn ? 'যোগাযোগ ইমেইল' : 'Contact Email'}</label>
                <input
                  type="email"
                  value={editingPage.contact_email || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, contact_email: e.target.value })}
                  placeholder="reading@bskbd.org"
                  className="w-full p-2 border rounded bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
