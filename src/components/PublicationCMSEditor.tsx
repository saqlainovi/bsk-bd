import React, { useState } from 'react';
import { 
  BookOpen, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Phone, Mail, Download
} from 'lucide-react';
import { Language } from '../types';

interface PublicationCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const PublicationCMSEditor: React.FC<PublicationCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'series' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const pubData = editingPage.publicationData || editingPage || {};

  const updateField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      publicationData: {
        ...(editingPage.publicationData || {}),
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

  const defaultSeries = [
    { titleBn: 'বিশ্বসাহিত্যের ধ্রুপদী অনুবাদ গ্রন্থমালা', countBn: '৩০০+ খণ্ড', descBn: 'হোমার, শেক্সপিয়র, টলস্টয়, দস্তয়েভস্কি থেকে গ্যাব্রিয়েল গার্সিয়া মার্কেস পর্যন্ত ধ্রুপদী সাহিত্যের অনন্য অনুবাদ।' },
    { titleBn: 'কিশোর ক্লাসিক ও রূপকথা সিরিজ', countBn: '১৫০+ খণ্ড', descBn: 'তরুণদের পাঠাভ্যাস ও মানবিক চেতনা উন্মেষের জন্য বিশ্বসেরা অ্যাডভেঞ্চার ও কিশোর সাহিত্য।' },
    { titleBn: 'বাঙালির চিন্তামূলক রচনা সিরিজ', countBn: '২০৯টি খণ্ড', descBn: 'বাংলা ভাষা ও সংস্কৃতির সহস্রাব্দের দর্শন ও চিন্তার সুবিন্যস্ত সংকলন।' },
    { titleBn: 'বিজ্ঞান, দর্শন ও ইতিহাস গ্রন্থমালা', countBn: '৮০+ খণ্ড', descBn: 'জ্ঞানচর্চা ও মুক্তচিন্তার দিগন্ত উন্মোচনকারী মৌলিক ও অনুবাদ গ্রন্থ।' }
  ];

  const currentSeries = Array.isArray(pubData.series) && pubData.series.length > 0 ? pubData.series : defaultSeries;

  const updateSeriesItem = (idx: number, field: string, val: any) => {
    const next = [...currentSeries];
    next[idx] = { ...next[idx], [field]: val };
    updateField('series', next);
  };

  const addSeriesItem = () => {
    const newS = { titleBn: 'নতুন গ্রন্থমালা সিরিজ', countBn: '৫০+ খণ্ড', descBn: 'সিরিজের বিস্তারিত বিবরণ' };
    updateField('series', [...currentSeries, newS]);
  };

  const deleteSeriesItem = (idx: number) => {
    if (confirm('এই গ্রন্থমালা সিরিজটি মুছে ফেলতে চান?')) {
      const next = currentSeries.filter((_: any, i: number) => i !== idx);
      updateField('series', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. প্রকাশনা পরিচিতি ও ব্যানার', icon: BookOpen },
          { id: 'stats', labelBn: '২. মূল পরিসংখ্যান', icon: Award },
          { id: 'series', labelBn: '৩. প্রধান প্রকাশনা সিরিজসমূহ (' + currentSeries.length + 'টি)', icon: FileText },
          { id: 'gallery', labelBn: '৪. প্রকাশনা ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. প্রকাশনা পরিচিতি তথ্য</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">মূল শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={pubData.hero_title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা'}
                onChange={(e) => updateField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Publication Title (English)</label>
              <input
                type="text"
                value={pubData.hero_title_en ?? 'BSK Publications'}
                onChange={(e) => updateField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={pubData.hero_subtitle_bn ?? '১৯৭৮ সাল থেকে বিশ্বসাহিত্য কেন্দ্র বিশ্বমানের ধ্রুপদী সাহিত্য, চিন্তামূলক রচনাসমগ্র ও সৃজনশীল কিশোর সাহিত্যের অনন্য প্রকাশনা পরিচালনা করে আসছে।'}
              onChange={(e) => updateField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">বই অর্ডারের হটলাইন</label>
              <input
                type="text"
                value={pubData.contact_phone ?? '০১৭৩০০০০০১৪'}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">অর্ডার ইমেইল</label>
              <input
                type="text"
                value={pubData.contact_email ?? 'publication@bskbd.org'}
                onChange={(e) => updateField('contact_email', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pubData.hero_image ?? ''}
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. প্রকাশনার মূল পরিসংখ্যানসমূহ</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">প্রকাশিত মোট বই</label>
              <input
                type="text"
                value={pubData.stat_books ?? '১,৫০০+'}
                onChange={(e) => updateField('stat_books', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">অনূদিত ক্লাসিক গ্রন্থ</label>
              <input
                type="text"
                value={pubData.stat_classics ?? '৫০০+'}
                onChange={(e) => updateField('stat_classics', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">বাঙালির চিন্তা খণ্ড</label>
              <input
                type="text"
                value={pubData.stat_chinta ?? '২০৯টি'}
                onChange={(e) => updateField('stat_chinta', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">পাঠকপ্রিয় পুরস্কার</label>
              <input
                type="text"
                value={pubData.stat_awards ?? '৫০+'}
                onChange={(e) => updateField('stat_awards', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SERIES */}
      {activeTab === 'series' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. প্রধান প্রকাশনা সিরিজ ও গ্রন্থমালা</h5>
              <p className="text-[11px] text-stone-500">সিরিজের নাম, খণ্ড সংখ্যা ও বিস্তারিত বিবরণ পরিবর্তন করুন</p>
            </div>
            <button
              type="button"
              onClick={addSeriesItem}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন সিরিজ যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentSeries.map((s: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">সিরিজ #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteSeriesItem(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">গ্রন্থমালা সিরিজের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={s.titleBn ?? ''}
                      onChange={(e) => updateSeriesItem(idx, 'titleBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">প্রকাশিত খণ্ড সংখ্যা</label>
                    <input
                      type="text"
                      value={s.countBn ?? ''}
                      onChange={(e) => updateSeriesItem(idx, 'countBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[10px] block">সিরিজের বিবরণ</label>
                  <textarea
                    rows={2}
                    value={s.descBn ?? ''}
                    onChange={(e) => updateSeriesItem(idx, 'descBn', e.target.value)}
                    className="w-full p-1.5 border rounded bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. প্রকাশনা ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={pubData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `pubg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateField(`gallery_img_${gIdx}`, url), `pubg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
