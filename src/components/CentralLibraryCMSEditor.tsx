import React, { useState } from 'react';
import { 
  Library, BookOpen, Award, Sparkles, Clock, FileText, Upload, Plus, Trash2, Image as ImageIcon
} from 'lucide-react';
import { Language } from '../types';

interface CentralLibraryCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const CentralLibraryCMSEditor: React.FC<CentralLibraryCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'features' | 'memberships' | 'gallery' | 'downloads'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const libraryData = editingPage.libraryData || editingPage || {};

  const updateLibField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      libraryData: {
        ...(editingPage.libraryData || {}),
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

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      {/* Sub Tabs */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Sparkles },
          { id: 'stats', labelBn: '২. ৪টি মূল পরিসংখ্যান', icon: Award },
          { id: 'features', labelBn: '৩. পাঠকক্ষ ও সেবা সুবিধা', icon: Library },
          { id: 'memberships', labelBn: '৪. সদস্যপদ ও ফি তালিকা', icon: BookOpen },
          { id: 'gallery', labelBn: '৫. ফটো গ্যালারি', icon: ImageIcon },
          { id: 'downloads', labelBn: '৬. ক্যাটালগ ও ফরম', icon: FileText }
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
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. কেন্দ্রীয় গ্রন্থাগার পরিচিতি ও ব্যানার</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={editingPage.title_bn ?? 'কেন্দ্রীয় লাইব্রেরি সেবা'}
              onChange={(e) => updateLibField('title_bn', e.target.value)}
              placeholder="শিরোনাম (বাংলা)"
              className="p-2 border rounded font-bold"
            />
            <input
              type="text"
              value={editingPage.title_en ?? 'Central Library Services'}
              onChange={(e) => updateLibField('title_en', e.target.value)}
              placeholder="Title (English)"
              className="p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">লাইব্রেরি পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={libraryData.about_bn ?? 'বিশ্বসাহিত্য কেন্দ্রের কেন্দ্র লাইব্রেরিটি দেশ-বিদেশের অমূল্য ও ঐতিহ্যবাহী গ্রন্থের এক বিশাল আধার।'}
              onChange={(e) => updateLibField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">লাইব্রেরির মূল লক্ষ্য ও ভিশন (বাংলা)</label>
            <textarea
              rows={2}
              value={libraryData.mission_bn ?? 'মানসম্পন্ন সাহিত্য ও মননশীল গ্রন্থের মাধ্যমে মানুষের মনকে প্রসারিত ও আলোকিত করা।'}
              onChange={(e) => updateLibField('mission_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 2. 4 STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. ৪টি মূল পরিসংখ্যান মেট্রিক্স</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'books', valDef: '৮৫,০০০+', lblDef: 'বইয়ের সংগ্রহ', subDef: 'দেশি-বিদেশী দুর্লভ বই' },
              { id: 'members', valDef: '১৫,০০০+', lblDef: 'সক্রিয় সদস্য', subDef: 'পাঠক ও গবেষকবৃন্দ' },
              { id: 'hall', valDef: 'কেন্দ্রীয় পাঠাগার', lblDef: 'প্রধান ভবন', subDef: 'বাংলামোটর, ঢাকা' },
              { id: 'hours', valDef: 'সকাল ১০টা - রাত ৮টা', lblDef: 'সেবা সময়সীমা', subDef: 'শনিবার থেকে বৃহস্পতিবার' }
            ].map((st, sIdx) => (
              <div key={st.id} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">কার্ড #{sIdx + 1}</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={libraryData[`stat_${st.id}_val`] ?? st.valDef}
                    onChange={(e) => updateLibField(`stat_${st.id}_val`, e.target.value)}
                    className="p-1.5 border rounded font-bold bg-white"
                  />
                  <input
                    type="text"
                    value={libraryData[`stat_${st.id}_lbl`] ?? st.lblDef}
                    onChange={(e) => updateLibField(`stat_${st.id}_lbl`, e.target.value)}
                    className="p-1.5 border rounded bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={libraryData[`stat_${st.id}_sub`] ?? st.subDef}
                  onChange={(e) => updateLibField(`stat_${st.id}_sub`, e.target.value)}
                  className="w-full p-1.5 border rounded text-[11px] bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MEMBERSHIPS */}
      {activeTab === 'memberships' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. সদস্যপদ ও বাৎসরিক ফি কাঠামো</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'general', titleDef: 'সাধারণ পাঠক সদস্যপদ', feeDef: '৫০০ টাকা / বছর', booksDef: 'একবারে ২টি বই (১৫ দিন)' },
              { id: 'student', titleDef: 'শিক্ষার্থী বিশেষ সদস্যপদ', feeDef: '৩০০ টাকা / বছর', booksDef: 'একবারে ২টি বই (১৫ দিন)' },
              { id: 'life', titleDef: 'আজীবন সম্মানিত সদস্যপদ', feeDef: '৫,০০০ টাকা (এককালীন)', booksDef: 'একবারে ৪টি বই (৩০ দিন)' }
            ].map((tier, tIdx) => (
              <div key={tier.id} className="p-3.5 bg-stone-50 rounded-xl border space-y-2">
                <span className="font-mono text-[10px] text-[#2E5942] font-bold">প্যাকেজ #{tIdx + 1}</span>
                <input
                  type="text"
                  value={libraryData[`tier_${tier.id}_title`] ?? tier.titleDef}
                  onChange={(e) => updateLibField(`tier_${tier.id}_title`, e.target.value)}
                  className="w-full p-2 border rounded font-bold bg-white"
                />
                <input
                  type="text"
                  value={libraryData[`tier_${tier.id}_fee`] ?? tier.feeDef}
                  onChange={(e) => updateLibField(`tier_${tier.id}_fee`, e.target.value)}
                  placeholder="ফি"
                  className="w-full p-2 border rounded bg-white text-[#B8862A] font-bold"
                />
                <input
                  type="text"
                  value={libraryData[`tier_${tier.id}_books`] ?? tier.booksDef}
                  onChange={(e) => updateLibField(`tier_${tier.id}_books`, e.target.value)}
                  placeholder="বই ইস্যু সীমা"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৫. লাইব্রেরি আলোকচিত্র গ্যালারি</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'পাঠাগারে অধ্যয়নরত পাঠক' }]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ছবি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(editingPage.gallery || []).map((img: any, gIdx: number) => (
              <div key={gIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#B8862A]">ছবি #{gIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = (editingPage.gallery || []).filter((_: any, i: number) => i !== gIdx);
                      setEditingPage({ ...editingPage, gallery: copy });
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
                {img.image && <img src={img.image} className="w-full h-28 object-cover rounded" alt="gal" />}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={img.image || ''}
                    onChange={(e) => {
                      const copy = [...(editingPage.gallery || [])];
                      copy[gIdx] = { ...copy[gIdx], image: e.target.value };
                      setEditingPage({ ...editingPage, gallery: copy });
                    }}
                    placeholder="URL"
                    className="flex-1 p-1.5 text-xs border rounded bg-white font-mono"
                  />
                  <label className="px-2.5 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const copy = [...(editingPage.gallery || [])];
                        copy[gIdx] = { ...copy[gIdx], image: url };
                        setEditingPage({ ...editingPage, gallery: copy });
                      }, `lib_gal_${gIdx}`)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={img.caption_bn || ''}
                  onChange={(e) => {
                    const copy = [...(editingPage.gallery || [])];
                    copy[gIdx] = { ...copy[gIdx], caption_bn: e.target.value };
                    setEditingPage({ ...editingPage, gallery: copy });
                  }}
                  placeholder="ক্যাপশন (বাংলা)"
                  className="w-full p-1.5 border rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
