import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, GraduationCap, Upload, Plus, Trash2, Globe, Users, Image as ImageIcon, MapPin, Award
} from 'lucide-react';
import { Language } from '../types';

interface AalorPathshalaCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const AalorPathshalaCMSEditor: React.FC<AalorPathshalaCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'centers' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const pathshalaData = editingPage.pathshalaData || editingPage || {};

  const updateField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      pathshalaData: {
        ...(editingPage.pathshalaData || {}),
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

  const defaultCenters = [
    { titleBn: 'ঢাকা কেন্দ্রীয় পাঠশালা কেন্দ্র', locationBn: 'বাংলা মোটোর, ঢাকা', studentsBn: '৩০০+ শিক্ষার্থী', descBn: 'সুবিধাবঞ্চিত শিশুদের জন্য সান্ধ্যকালীন পাঠদান ও বই বিতরণ কেন্দ্র।' },
    { titleBn: 'চট্টগ্রাম কমিউনিটি পাঠশালা', locationBn: 'আন্দরকিল্লা, চট্টগ্রাম', studentsBn: '২০০+ শিক্ষার্থী', descBn: 'নৈতিক মূল্যবোধ ও প্রাথমিক সৃজনশীল সাহিত্য প্রশিক্ষণ কেন্দ্র।' },
    { titleBn: 'রাজশাহী আলোর পাঠশালা', locationBn: 'মতিহার, রাজশাহী', studentsBn: '১৫০+ শিক্ষার্থী', descBn: 'বই পড়া, ছবি আঁকা ও শিশু বিকাশ কার্যক্রম।' }
  ];

  const currentCenters = Array.isArray(pathshalaData.centers) && pathshalaData.centers.length > 0 ? pathshalaData.centers : defaultCenters;

  const updateCenter = (idx: number, field: string, val: any) => {
    const next = [...currentCenters];
    next[idx] = { ...next[idx], [field]: val };
    updateField('centers', next);
  };

  const addCenter = () => {
    const newC = { titleBn: 'নতুন পাঠশালা কেন্দ্র', locationBn: 'অবস্থান / জেলা', studentsBn: '১০০+ শিক্ষার্থী', descBn: 'কেন্দ্রের বিস্তারিত কার্যক্রম' };
    updateField('centers', [...currentCenters, newC]);
  };

  const deleteCenter = (idx: number) => {
    if (confirm('এই কেন্দ্রটি মুছে ফেলতে চান?')) {
      const next = currentCenters.filter((_: any, i: number) => i !== idx);
      updateField('centers', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পাঠশালা পরিচিতি ও ব্যানার', icon: Sparkles },
          { id: 'stats', labelBn: '২. মূল পরিসংখ্যান', icon: Award },
          { id: 'centers', labelBn: '৩. পাঠশালা কেন্দ্রসমূহ (' + currentCenters.length + 'টি)', icon: MapPin },
          { id: 'gallery', labelBn: '৪. পাঠশালা ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. আলোর পাঠশালা পরিচিতি ও ব্যানার</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">কার্যক্রমের নাম (বাংলা)</label>
              <input
                type="text"
                value={pathshalaData.title_bn ?? 'আলোর পাঠশালা'}
                onChange={(e) => updateField('title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Program Title (English)</label>
              <input
                type="text"
                value={pathshalaData.title_en ?? 'Aalor Pathshala'}
                onChange={(e) => updateField('title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">সাব-টাইটেল ও পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={pathshalaData.subtitle_bn ?? 'সুবিধাবঞ্চিত শিশুদের বিনামূল্যে শিক্ষাদান, রুচিশীল বইপড়া, নৈতিক মূল্যবোধ ও নান্দনিক মেধা বিকাশের একটি অনন্য মানবিক উদ্যোগ।'}
              onChange={(e) => updateField('subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pathshalaData.hero_image ?? pathshalaData.image ?? ''}
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. পাঠশালার মূল পরিসংখ্যানসমূহ</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">সক্রিয় কেন্দ্র</label>
              <input
                type="text"
                value={pathshalaData.stat_centers ?? '৩৫+ টি'}
                onChange={(e) => updateField('stat_centers', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">সুবিধাপ্রাপ্ত শিক্ষার্থী</label>
              <input
                type="text"
                value={pathshalaData.stat_students ?? '৫,০০০+'}
                onChange={(e) => updateField('stat_students', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">স্বেচ্ছাসেবক শিক্ষক</label>
              <input
                type="text"
                value={pathshalaData.stat_volunteers ?? '১৫০+'}
                onChange={(e) => updateField('stat_volunteers', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">বিতরণকৃত বই</label>
              <input
                type="text"
                value={pathshalaData.stat_books ?? '২৫,০০০+'}
                onChange={(e) => updateField('stat_books', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CENTERS */}
      {activeTab === 'centers' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. সক্রিয় পাঠশালা কেন্দ্রসমূহের তালিকা</h5>
              <p className="text-[11px] text-stone-500">প্রতিটি কেন্দ্রের অবস্থান, সুবিধাভোগী সংখ্যা ও বিবরণী পরিবর্তন করুন</p>
            </div>
            <button
              type="button"
              onClick={addCenter}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন কেন্দ্র যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentCenters.map((center: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">কেন্দ্র #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteCenter(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">কেন্দ্রের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={center.titleBn ?? ''}
                      onChange={(e) => updateCenter(idx, 'titleBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">অবস্থান / এলাকা</label>
                    <input
                      type="text"
                      value={center.locationBn ?? ''}
                      onChange={(e) => updateCenter(idx, 'locationBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[10px] block">কেন্দ্রের কার্যক্রম ও বিবরণ</label>
                  <input
                    type="text"
                    value={center.descBn ?? ''}
                    onChange={(e) => updateCenter(idx, 'descBn', e.target.value)}
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. আলোর পাঠশালা ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={pathshalaData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `pg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateField(`gallery_img_${gIdx}`, url), `pg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
