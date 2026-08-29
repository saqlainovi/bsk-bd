import React, { useState } from 'react';
import { 
  Building2, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Layers, MapPin, Phone
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

  const defaultFloors = [
    { floorNo: 0, floorBn: 'নিচতলা ও ভূগর্ভস্থ', floorEn: 'Ground & Basement', titleBn: 'প্রধান অভ্যর্থনা, মূল বইয়ের দোকান ও পার্কিং', featuresBn: 'তথ্য কেন্দ্র, ফ্ল্যাগশিপ বুকশপ, আন্ডারগ্রাউন্ড পার্কিং', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800' },
    { floorNo: 2, floorBn: '২য় তলা', floorEn: '2nd Floor', titleBn: 'প্রধান মিলনায়তন ও গ্যালারি হল', featuresBn: 'ইস্তেন্দিয়ার জাহিদ হাসান মিলনায়তন (২০০ আসন), গ্যালারি মিলনায়তন-১০১ (৭১ আসন)', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800' },
    { floorNo: 3, floorBn: '৩য় তলা', floorEn: '3rd Floor', titleBn: 'সাধারণ শ্রেণীকক্ষ ও কর্মশালা রুম', featuresBn: 'শ্রেণীকক্ষ ৩০১, ৩০২ ও ৩০৩ (প্রতিটিতে ৩০ আসন), এসি ও প্রজেক্টর সুবিধা', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800' },
    { floorNo: 4, floorBn: '৪র্থ তলা', floorEn: '4th Floor', titleBn: 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় পাঠাগার', featuresBn: 'বিশাল পাঠকক্ষ, ১ লক্ষাধিক বই, অনলাইন ক্যাটালগ ও গবেষণা সাময়িকী', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800' },
    { floorNo: 5, floorBn: '৫ম তলা', floorEn: '5th Floor', titleBn: 'চিত্রশালা (আর্ট গ্যালারি) ও মিলনায়তন ৪০১', featuresBn: 'চিত্রকলা প্রদর্শনী হল (৪০-৫০ শিল্পকর্ম), ৮০ আসন বিশিষ্ট সেমিনার কক্ষ', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800' },
    { floorNo: 6, floorBn: '৬ষ্ঠ তলা', floorEn: '6th Floor', titleBn: 'প্রশাসনিক কার্যালয় ও দেশভিত্তিক উৎকর্ষ কর্মসূচি', featuresBn: 'কেন্দ্রের কেন্দ্রীয় প্রশাসনিক উইং, পাঠাভ্যাস ও ভ্রাম্যমাণ লাইব্রেরি সমন্বয় সেল', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800' },
    { floorNo: 7, floorBn: '৭ম তলা', floorEn: '7th Floor', titleBn: 'আলোর ইশকুল ও ট্রাস্টি বোর্ড রুম', featuresBn: 'সাংস্কৃতিক প্রশিক্ষণ ক্লাস, ট্রাস্টি বোর্ড কনফারেন্স হল', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800' },
    { floorNo: 8, floorBn: '৮ম তলা', floorEn: '8th Floor', titleBn: 'রেকর্ডিং স্টুডিও ও মাল্টিমিডিয়া ল্যাব', featuresBn: 'অডিও-ভিজুয়াল প্রোডাকশন স্টুডিও, ডিজিটাল আর্কাইভিং সেল', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800' },
    { floorNo: 9, floorBn: '৯ম তলা', floorEn: '9th Floor', titleBn: 'বুক ক্যাফেটেরিয়া ও রুফটপ গার্ডেন লাউঞ্জ', featuresBn: 'খোলা আকাশের নিচে ক্যাফে, স্বাস্থ্যকর খাবার ও উন্মুক্ত আড্ডার জায়গা', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800' }
  ];

  const currentFloors = Array.isArray(buildingData.floors) && buildingData.floors.length > 0 ? buildingData.floors : defaultFloors;

  const updateFloor = (idx: number, field: string, val: any) => {
    const next = [...currentFloors];
    next[idx] = { ...next[idx], [field]: val };
    updateBuildField('floors', next);
  };

  const addFloor = () => {
    const newF = {
      floorNo: currentFloors.length + 1,
      floorBn: `${currentFloors.length + 1}ম তলা`,
      floorEn: `Floor ${currentFloors.length + 1}`,
      titleBn: 'নতুন তলার শিরোনাম',
      featuresBn: 'এই তলার বৈশিষ্ট্যসমূহ ও কার্যক্রম',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    };
    updateBuildField('floors', [...currentFloors, newF]);
  };

  const deleteFloor = (idx: number) => {
    if (confirm('এই তলার তথ্য মুছে ফেলতে চান?')) {
      const next = currentFloors.filter((_: any, i: number) => i !== idx);
      updateBuildField('floors', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. ভবন পরিচিতি ও ব্যানার', icon: Building2 },
          { id: 'floors', labelBn: '২. তলা-ভিত্তিক ডিরেক্টরি (' + currentFloors.length + 'টি)', icon: Layers },
          { id: 'features', labelBn: '৩. স্থাপত্য ও পরিবেশবান্ধব বৈশিষ্ট্য', icon: Sparkles },
          { id: 'gallery', labelBn: '৪. ভবনের ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. ভবন পরিচিতি ও বিবরণ</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">ভবনের মূল শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={buildingData.hero_title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবন'}
                onChange={(e) => updateBuildField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Title (English)</label>
              <input
                type="text"
                value={buildingData.hero_title_en ?? 'BSK Central Landmark Complex'}
                onChange={(e) => updateBuildField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">সাব-টাইটেল ও পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={buildingData.hero_subtitle_bn ?? 'ঢাকার বাংলা মোটোরে অবস্থিত ১০ তলা বিশিষ্ট পরিবেশবান্ধব এই আধুনিক ভবনটি সাহিত্য, শিল্প, সংস্কৃতি ও জ্ঞানচর্চার এক অপূর্ব মিলনকেন্দ্র।'}
              onChange={(e) => updateBuildField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">ভবনের ঠিকানা</label>
              <input
                type="text"
                value={buildingData.address_bn ?? '১৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলা মোটোর, ঢাকা-১০০০'}
                onChange={(e) => updateBuildField('address_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">স্থাপত্যশৈলী ও নকশা বিবরণ</label>
              <input
                type="text"
                value={buildingData.architect_info_bn ?? 'আধুনিক আলো-বাতাসপূর্ণ পরিবেশবান্ধব গ্রিন বিল্ডিং নকশা'}
                onChange={(e) => updateBuildField('architect_info_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">হেল্পলাইন / তথ্য ফোন</label>
              <input
                type="text"
                value={buildingData.hotline ?? '০১৭৩০০০০০১৪'}
                onChange={(e) => updateBuildField('hotline', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ভবনের ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={buildingData.hero_image ?? ''}
                onChange={(e) => updateBuildField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? '...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateBuildField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOORS */}
      {activeTab === 'floors' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">২. তলা-ভিত্তিক সম্পূর্ণ ডিরেক্টরি</h5>
              <p className="text-[11px] text-stone-500">ভবনের প্রতিটি তলার নাম, বিভাগসমূহ, কার্যক্রম ও ফটো এডিট করুন</p>
            </div>
            <button
              type="button"
              onClick={addFloor}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন তলা যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentFloors.map((floor: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">তলা #{idx + 1}: {floor.floorBn}</span>
                  <button
                    type="button"
                    onClick={() => deleteFloor(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">তলার নাম / নম্বর</label>
                    <input
                      type="text"
                      value={floor.floorBn ?? ''}
                      onChange={(e) => updateFloor(idx, 'floorBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">তলার প্রধান শিরোনাম / বিভাগসমূহ</label>
                    <input
                      type="text"
                      value={floor.titleBn ?? ''}
                      onChange={(e) => updateFloor(idx, 'titleBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[10px] block">এই তলার বৈশিষ্ট্যসমূহ ও কার্যক্রমের বিবরণ</label>
                  <textarea
                    rows={2}
                    value={typeof floor.featuresBn === 'string' ? floor.featuresBn : Array.isArray(floor.featuresBn) ? floor.featuresBn.join(', ') : ''}
                    onChange={(e) => updateFloor(idx, 'featuresBn', e.target.value)}
                    className="w-full p-1.5 border rounded bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[10px] block">তলার ছবি URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={floor.image ?? ''}
                      onChange={(e) => updateFloor(idx, 'image', e.target.value)}
                      className="flex-1 p-1.5 border rounded bg-white text-xs"
                    />
                    <label className="px-2 py-1 bg-[#2E5942] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploading === `fl_${idx}` ? '...' : 'আপলোড'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateFloor(idx, 'image', url), `fl_${idx}`)} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FEATURES */}
      {activeTab === 'features' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৩. স্থাপত্য ও পরিবেশবান্ধব বৈশিষ্ট্য</h5>
          <div className="space-y-1">
            <label className="font-bold block">পরিবেশবান্ধব ও আধুনিক সুযোগ-সুবিধার বিবরণ (প্রতি লাইনে একটি)</label>
            <textarea
              rows={6}
              value={buildingData.green_features_bn ?? '১. প্রাকৃতিক আলো ও বাতাস চলাচলের জন্য উন্মুক্ত করিডোর ও গ্রিন ব্যালকনি।\\n২. সৌরবিদ্যুৎ ও শক্তি সাশ্রয়ী আধুনিক এলইডি আলোকসজ্জা।\\n৩. সর্বাধুনিক অগ্নি-নিরাপত্তা ও জরুরী নির্গমন সিঁড়ি ব্যবস্থা।\\n৪. ভূগর্ভস্থ স্বয়ংক্রিয় গাড়ি পার্কিং ও সার্বক্ষণিক সিসিটিভি নিরাপত্তা।\\n৫. প্রতিবন্ধী ও প্রবীণদের চলাচলের জন্য র‍্যাম্প ও আধুনিক লিফট সুবিধা।'}
              onChange={(e) => updateBuildField('green_features_bn', e.target.value)}
              className="w-full p-2 border rounded font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. বিশ্বসাহিত্য কেন্দ্র ভবন ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={buildingData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateBuildField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `bg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateBuildField(`gallery_img_${gIdx}`, url), `bg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
