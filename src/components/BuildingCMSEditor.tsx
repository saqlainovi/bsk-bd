import React, { useState } from 'react';
import { 
  Building2, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Layers
} from 'lucide-react';
import { Language } from '../types';

interface BuildingCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const BuildingCMSEditor: React.FC<BuildingCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'floors' | 'features' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const buildingData = editingPage.buildingData || editingPage || {};

  const updateBuildField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      buildingData: {
        ...(editingPage.buildingData || {}),
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
          { id: 'hero', labelBn: '১. ভবন পরিচিতি ও স্থপতি', icon: Building2 },
          { id: 'floors', labelBn: '২. তলাভিত্তিক বিবরণ (Floor Directory)', icon: Layers },
          { id: 'features', labelBn: '৩. স্থাপত্য ও পরিবেশ বৈশিষ্ট্য', icon: Sparkles },
          { id: 'gallery', labelBn: '৪. ভবন ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. বিশ্বসাহিত্য কেন্দ্র ভবন পরিচিতি</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={editingPage.title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবন'}
              onChange={(e) => updateBuildField('title_bn', e.target.value)}
              placeholder="শিরোনাম (বাংলা)"
              className="p-2 border rounded font-bold"
            />
            <input
              type="text"
              value={editingPage.title_en ?? 'Bishwo Shahitto Kendro Building'}
              onChange={(e) => updateBuildField('title_en', e.target.value)}
              placeholder="Title (English)"
              className="p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">ভবন পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={buildingData.about_bn ?? 'ঢাকার বাংলামোটরে অবস্থিত বিশ্বসাহিত্য কেন্দ্র ভবনটি কেবল একটি স্থাপত্য নয়, এটি দেশের শিল্প, সাহিত্য ও সাংস্কৃতিক কর্মকাণ্ডের এক প্রাণবন্ত কেন্দ্র। পরিবেশবান্ধব নকশা ও উন্মুক্ত আলো-বাতাসের এক অপূর্ব সমন্বয়।'}
              onChange={(e) => updateBuildField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 2. FLOORS */}
      {activeTab === 'floors' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. তলাভিত্তিক অবস্থান ও বিবরণ</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'g', defFloor: 'নিচতলা (Ground Floor)', defDesc: 'অভ্যর্থনা, তথ্যকেন্দ্র, গাড়ি পার্কিং ও বুক কাফে কর্নার' },
              { id: '1st', defFloor: '১ম তলা (1st Floor)', defDesc: 'মূল অডিটোরিয়াম ও লবি প্রদর্শনী গ্যালারি' },
              { id: '2nd', defFloor: '২য় তলা (2nd Floor)', defDesc: 'সুসজ্জিত বই বিক্রয় কেন্দ্র (বুকশপ) ও বিক্রয় সেল' },
              { id: '3rd', defFloor: '৩য় তলা (3rd Floor)', defDesc: 'কেন্দ্রীয় গ্রন্থাগার ও মুক্ত পাঠকক্ষ' },
              { id: '4th', defFloor: '৪র্থ তলা (4th Floor)', defDesc: 'দেশভিত্তিক উৎকর্ষ ও পাঠাভ্যাস উন্নয়ন কর্মসূচি কার্যালয়' },
              { id: '5th', defFloor: '৫ম তলা (5th Floor)', defDesc: 'ভ্রাম্যমাণ লাইব্রেরি কেন্দ্রীয় কার্যালয় ও সেমিনার কক্ষ' },
              { id: '6th', defFloor: '৬ষ্ঠ তলা (6th Floor)', defDesc: 'সাধারণ প্রশাসন, মানবসম্পদ ও হিসাব বিভাগ' },
              { id: 'rooftop', defFloor: 'ছাদবাগান ও মুক্তমঞ্চ (Rooftop)', defDesc: 'গাছপালা সজ্জিত ছাদবাগান, ওপেন এয়ার ক্যাফে ও মুক্তমঞ্চ' }
            ].map((fl, fIdx) => (
              <div key={fl.id} className="p-3.5 bg-stone-50 rounded-xl border space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">লেয়ার #{fIdx + 1}</span>
                <input
                  type="text"
                  value={buildingData[`floor_${fl.id}_title`] ?? fl.defFloor}
                  onChange={(e) => updateBuildField(`floor_${fl.id}_title`, e.target.value)}
                  className="w-full p-2 border rounded font-bold bg-white"
                />
                <textarea
                  rows={2}
                  value={buildingData[`floor_${fl.id}_desc`] ?? fl.defDesc}
                  onChange={(e) => updateBuildField(`floor_${fl.id}_desc`, e.target.value)}
                  className="w-full p-1.5 border rounded bg-white text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৪. ভবন ফটো গ্যালারি</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবনের মনোরম দৃশ্য' }]
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
                      }, `bld_gal_${gIdx}`)}
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
