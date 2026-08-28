import React, { useState } from 'react';
import { 
  Building2, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Clock
} from 'lucide-react';
import { Language } from '../types';

interface AuditoriumCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const AuditoriumCMSEditor: React.FC<AuditoriumCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'halls' | 'pricing' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const auditoriumData = editingPage.auditoriumData || editingPage || {};

  const updateAudField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      auditoriumData: {
        ...(editingPage.auditoriumData || {}),
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
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Building2 },
          { id: 'halls', labelBn: '২. অডিটোরিয়াম ও সেমিনার কক্ষ', icon: Sparkles },
          { id: 'pricing', labelBn: '৩. ভাড়া ও বুকিং কাঠামো', icon: Award },
          { id: 'gallery', labelBn: '৪. ফটো গ্যালারি', icon: ImageIcon }
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

      {/* 1. HERO */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. অডিটোরিয়াম ও সেমিনার হল পরিচিতি</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={editingPage.title_bn ?? 'অডিটোরিয়াম ও সেমিনার কক্ষ'}
              onChange={(e) => updateAudField('title_bn', e.target.value)}
              placeholder="শিরোনাম (বাংলা)"
              className="p-2 border rounded font-bold"
            />
            <input
              type="text"
              value={editingPage.title_en ?? 'Auditoriums & Seminar Halls'}
              onChange={(e) => updateAudField('title_en', e.target.value)}
              placeholder="Title (English)"
              className="p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">অডিটোরিয়াম পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={auditoriumData.about_bn ?? 'শিল্প, সাহিত্য, সংস্কৃতি ও শিক্ষামূলক অনুষ্ঠান, সেমিনার ও নাট্য প্রদর্শনীর জন্য বিশ্বসাহিত্য কেন্দ্রে রয়েছে অত্যাধুনিক শীতাতপ নিয়ন্ত্রিত অডিটোরিয়াম ও বিভিন্ন ধারণক্ষমতার সুসজ্জিত সেমিনার হল।'}
              onChange={(e) => updateAudField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 2. HALLS */}
      {activeTab === 'halls' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. হলসমূহ ও ধারণক্ষমতা</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'main', defTitle: 'মূল অডিটোরিয়াম (Main Auditorium)', defCap: '৪৫০ আসন বিশিষ্ট', defFloor: '২য় ও ৩য় তলা' },
              { id: 'seminar1', defTitle: 'চিত্রকলা সেমিনার হল (Seminar Hall 1)', defCap: '১২০ আসন বিশিষ্ট', defFloor: '৪র্থ তলা' },
              { id: 'seminar2', defTitle: 'সংগীত ও চলচ্চিত্র কক্ষ (Mini Hall)', defCap: '৬০ আসন বিশিষ্ট', defFloor: '৫ম তলা' },
              { id: 'boardroom', defTitle: 'কনফারেন্স ও বোর্ড রুম (Meeting Room)', defCap: '২৫ আসন বিশিষ্ট', defFloor: '৬ষ্ঠ তলা' }
            ].map((hall, hIdx) => (
              <div key={hall.id} className="p-3.5 bg-stone-50 rounded-xl border space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">হল #{hIdx + 1}</span>
                <input
                  type="text"
                  value={auditoriumData[`hall_${hall.id}_title`] ?? hall.defTitle}
                  onChange={(e) => updateAudField(`hall_${hall.id}_title`, e.target.value)}
                  className="w-full p-2 border rounded font-bold bg-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={auditoriumData[`hall_${hall.id}_cap`] ?? hall.defCap}
                    onChange={(e) => updateAudField(`hall_${hall.id}_cap`, e.target.value)}
                    placeholder="আসন সংখ্যা"
                    className="p-2 border rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={auditoriumData[`hall_${hall.id}_floor`] ?? hall.defFloor}
                    onChange={(e) => updateAudField(`hall_${hall.id}_floor`, e.target.value)}
                    placeholder="অবস্থান / তলা"
                    className="p-2 border rounded bg-white text-xs"
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
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৪. অডিটোরিয়াম ফটো গ্যালারি</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'অডিটোরিয়াম হল ও স্টেজ' }]
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
                      }, `aud_gal_${gIdx}`)}
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
