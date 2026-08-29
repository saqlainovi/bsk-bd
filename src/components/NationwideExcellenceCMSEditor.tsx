import React, { useState } from 'react';
import { 
  Award, BookOpen, Users, MapPin, Sparkles, Upload, Plus, Trash2, Image as ImageIcon, FileText, Phone
} from 'lucide-react';
import { Language } from '../types';

interface NationwideExcellenceCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const NationwideExcellenceCMSEditor: React.FC<NationwideExcellenceCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'highlights' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const progData = editingPage.nationwideData || editingPage || {};

  const updateField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      nationwideData: {
        ...(editingPage.nationwideData || {}),
        [key]: val
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      if (uploadImageToServer) {
        const url = await uploadImageToServer(file);
        setter(url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result as string);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const defaultStats = [
    { value: '১৫,০০,০০০+', label_bn: 'অংশগ্রহণকারী শিক্ষার্থী', label_en: 'Active Student Readers' },
    { value: '২,১০০+', label_bn: 'শিক্ষা প্রতিষ্ঠান', label_en: 'Partner Institutions' },
    { value: '৬৪টি', label_bn: 'জেলা কভারেজ', label_en: 'Districts Covered' },
    { value: '৪৫ বছর+', label_bn: 'অনবদ্য পথচলা', label_en: 'Years of Excellence' }
  ];

  const currentStats = Array.isArray(progData.stats) && progData.stats.length > 0 ? progData.stats : defaultStats;

  const updateStat = (idx: number, field: string, val: any) => {
    const next = [...currentStats];
    next[idx] = { ...next[idx], [field]: val };
    updateField('stats', next);
  };

  const defaultHighlights = [
    { title_bn: 'বই পড়া ও মূল্যায়ন উৎসব', desc_bn: 'শিক্ষার্থীদের মাঝে বিশ্বসাহিত্যের বই বিতরণ ও বছর শেষে সাহিত্য মূল্যায়নের মাধ্যমে কৃতি পাঠকদের পুরস্কৃত করা।' },
    { title_bn: 'শিক্ষক সেমিনার ও নির্দেশনা সভা', desc_bn: 'শিক্ষা প্রতিষ্ঠানের দায়িত্বপ্রাপ্ত সংগঠক শিক্ষকদের জন্য বিশেষ প্রশিক্ষণ ও বইপাঠ পরিচালনা নির্দেশিকা।' },
    { title_bn: 'সেরা পাঠক বই পুরস্কার ও পদক', desc_bn: 'মূল্যায়ন পরীক্ষায় কৃতিত্ব অর্জনকারী মেধা অনুযায়ী মেডেল ও সনদপত্র প্রদান।' },
    { title_bn: 'শ্রেণিকক্ষ পাঠাভ্যাস প্রতিযোগিতা', desc_bn: 'শ্রেণিকক্ষে যৌথ আলোচনা ও বই পর্যালোচনার মাধ্যমে তরুণ প্রজন্মের চিন্তা ও বোধশক্তি প্রখর করা।' }
  ];

  const currentHighlights = Array.isArray(progData.highlights) && progData.highlights.length > 0 ? progData.highlights : defaultHighlights;

  const updateHighlight = (idx: number, field: string, val: any) => {
    const next = [...currentHighlights];
    next[idx] = { ...next[idx], [field]: val };
    updateField('highlights', next);
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. কার্যক্রমের ব্যানার ও পরিচিতি', icon: Award },
          { id: 'stats', labelBn: '২. মূল ৪টি পরিসংখ্যান', icon: Sparkles },
          { id: 'highlights', labelBn: '৩. কার্যক্রমের প্রধান দিকসমূহ (' + currentHighlights.length + 'টি)', icon: FileText },
          { id: 'gallery', labelBn: '৪. কার্যক্রমের ফটো গ্যালারি', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive ? 'bg-[#2E5942] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100 border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HERO */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. কার্যক্রমের ব্যানার ও পরিচিতি তথ্য</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">কার্যক্রমের নাম (বাংলা)</label>
              <input
                type="text"
                value={progData.hero_title_bn ?? 'দেশভিত্তিক উৎকর্ষ কার্যক্রম'}
                onChange={(e) => updateField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Program Title (English)</label>
              <input
                type="text"
                value={progData.hero_title_en ?? 'Nationwide Excellence Program'}
                onChange={(e) => updateField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">সাব-টাইটেল ও পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={progData.hero_subtitle_bn ?? 'বাংলাদেশের ৬৪টি জেলার স্কুল ও কলেজের শিক্ষার্থীদের জন্য পরিচালিত অনন্য সাহিত্য মূল্যায়ন, পাঠাভ্যাস ও আলোকিত মানুষ গড়ার আন্দোলন।'}
              onChange={(e) => updateField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={progData.hero_image ?? ''}
                onChange={(e) => updateField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? '...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. কার্যক্রমের মূল ৪টি পরিসংখ্যান</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentStats.map((st: any, idx: number) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-xl border space-y-1">
                <label className="font-bold text-[10px] block text-stone-500">পরিসংখ্যান #{idx + 1}</label>
                <input
                  type="text"
                  value={st.value ?? ''}
                  onChange={(e) => updateStat(idx, 'value', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white font-bold"
                />
                <input
                  type="text"
                  value={st.label_bn ?? ''}
                  onChange={(e) => updateStat(idx, 'label_bn', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. HIGHLIGHTS */}
      {activeTab === 'highlights' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৩. কার্যক্রমের প্রধান দিক ও সেকশনসমূহ</h5>
          <div className="space-y-3">
            {currentHighlights.map((hl: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold font-mono text-[#B8862A] text-xs">দিক #{idx + 1}</span>
                <input
                  type="text"
                  value={hl.title_bn ?? ''}
                  onChange={(e) => updateHighlight(idx, 'title_bn', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={hl.desc_bn ?? ''}
                  onChange={(e) => updateHighlight(idx, 'desc_bn', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. কার্যক্রমের ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={progData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `ng_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateField(`gallery_img_${gIdx}`, url), `ng_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
