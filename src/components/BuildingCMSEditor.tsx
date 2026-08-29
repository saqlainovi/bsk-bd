import React, { useState } from 'react';
import { 
  Building2, Layers, Sparkles, Image as ImageIcon, Upload, Plus, Trash2, ArrowRight, ShieldCheck, MapPin, Clock, Calendar, CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { defaultBuildingData } from '../data/specializedPagesDefaults';

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
  const [activeTab, setActiveTab] = useState<'hero' | 'floors' | 'specs' | 'rental' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  // Merge with defaultBuildingData so all fields exist reliably
  const bData = {
    ...defaultBuildingData,
    ...(editingPage.buildingData || {}),
    ...editingPage
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      if (uploadImageToServer) {
        const url = await uploadImageToServer(file);
        if (url) onSuccess(url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) onSuccess(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      {/* Sub Tabs */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Building2 },
          { id: 'floors', labelBn: '২. তলাভিত্তিক বিবরণ (Floor Directory)', icon: Layers },
          { id: 'specs', labelBn: '৩. স্থাপত্য ও পরিবেশ বৈশিষ্ট্য', icon: Sparkles },
          { id: 'rental', labelBn: '৪. মিলনায়তন বুকিং ব্যানার', icon: ArrowRight },
          { id: 'gallery', labelBn: '৫. ভবন ফটো গ্যালারি', icon: ImageIcon }
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

      {/* TAB 1: HERO & BANNER */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. বিশ্বসাহিত্য কেন্দ্র ভবন পরিচিতি ও ব্যানার</h5>

          {/* Banner Image */}
          <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#B8862A]" />
                <span>ভবন মূল বহির্ভাগ ছবি (Hero Banner Image)</span>
              </label>
              <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
            </div>
            <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
              <img 
                src={bData.hero_image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80'} 
                alt="Building Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80'; }}
              />
              <button 
                type="button"
                onClick={() => updateBuildField('hero_image', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80')}
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
                  value={bData.hero_image || ''}
                  onChange={(e) => updateBuildField('hero_image', e.target.value)}
                  placeholder="https://... অথবা /assets/IMGS/..." 
                  className="w-full p-2 border rounded-lg text-xs font-mono bg-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">পিসি থেকে নতুন ব্যানার ছবি আপলোড করুন</label>
                <label className="border-2 border-dashed border-[#2E5942]/40 rounded-lg p-2 bg-[#2E5942]/5 text-center hover:bg-[#2E5942]/10 transition flex items-center justify-center gap-2 cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={uploading === 'build_hero_image'}
                    onChange={(e) => handleFileUpload(e, (url) => updateBuildField('hero_image', url), 'build_hero_image')} 
                  />
                  <Upload className={`h-4 w-4 text-[#2E5942] ${uploading === 'build_hero_image' ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold text-[#2E5942]">
                    {uploading === 'build_hero_image' ? 'আপলোড হচ্ছে...' : '📁 ব্যানার ছবি নির্বাচন করুন'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Badge, Title, Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার লোকেশন ব্যাজ (বাংলা)</label>
              <input 
                type="text" 
                value={bData.badge_bn || ''} 
                onChange={(e) => updateBuildField('badge_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার লোকেশন ব্যাজ (ইংরেজি)</label>
              <input 
                type="text" 
                value={bData.badge_en || ''} 
                onChange={(e) => updateBuildField('badge_en', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={bData.title_bn || ''} 
                onChange={(e) => updateBuildField('title_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (ইংরেজি)</label>
              <input 
                type="text" 
                value={bData.title_en || ''} 
                onChange={(e) => updateBuildField('title_en', e.target.value)} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ভবন পরিচিতি বিবরণ (বাংলা)</label>
              <textarea 
                rows={3}
                value={bData.subtitle_bn || ''} 
                onChange={(e) => updateBuildField('subtitle_bn', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ভবন পরিচিতি বিবরণ (ইংরেজি)</label>
              <textarea 
                rows={3}
                value={bData.subtitle_en || ''} 
                onChange={(e) => updateBuildField('subtitle_en', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="p-4 bg-stone-50 border rounded-xl space-y-3">
            <h6 className="font-bold text-xs text-stone-800">৩টি কুইক ইনফো ব্যাজ (লোকেশন, তলা সংখ্যা, সময়)</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">লোকেশন ট্যাগ (বাংলা)</label>
                <input 
                  type="text" 
                  value={bData.location_bn || 'বাংলামোটর, ঢাকা'} 
                  onChange={(e) => updateBuildField('location_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">তলার সংখ্যা ট্যাগ (বাংলা)</label>
                <input 
                  type="text" 
                  value={bData.floors_count_bn || '১০-তলা বিশিষ্ট বহুতল ভবন'} 
                  onChange={(e) => updateBuildField('floors_count_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">খোলা থাকার সময় ট্যাগ (বাংলা)</label>
                <input 
                  type="text" 
                  value={bData.timing_bn || 'খোলা: সকাল ৯:০০ - রাত ৯:০০'} 
                  onChange={(e) => updateBuildField('timing_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs" 
                />
              </div>
            </div>
          </div>

          {/* 3 Action Buttons */}
          <div className="p-4 bg-stone-50 border rounded-xl space-y-3">
            <h6 className="font-bold text-xs text-stone-800">৩টি অ্যাকশন বাটন টেক্সট (Action Buttons)</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">বাটন ১: মিলনায়তন বুকিং</label>
                <input 
                  type="text" 
                  value={bData.btn_auditorium_bn || 'অডিটোরিয়াম ও রুম বুকিং'} 
                  onChange={(e) => updateBuildField('btn_auditorium_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">বাটন ২: কেন্দ্রীয় পাঠাগার</label>
                <input 
                  type="text" 
                  value={bData.btn_library_bn || 'কেন্দ্রীয় পাঠাগার'} 
                  onChange={(e) => updateBuildField('btn_library_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">বাটন ৩: রুফটপ ক্যাফেটেরিয়া</label>
                <input 
                  type="text" 
                  value={bData.btn_cafe_bn || 'রুফটপ ক্যাফেটেরিয়া'} 
                  onChange={(e) => updateBuildField('btn_cafe_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white text-xs font-bold" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLOOR DIRECTORY */}
      {activeTab === 'floors' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">২. তলাভিত্তিক অবস্থান ও সুবিধা বিবরণ (Floor Directory)</h5>
              <p className="text-[10px] text-stone-500">ভবনের প্রতিটি তলার নাম, মূল শিরোনাম, সুবিধাসমূহ, ছবি ও পেইজ লিংক।</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                const current = bData.floors || defaultBuildingData.floors;
                const nextNo = current.length > 0 ? (current[current.length - 1].floorNo || 0) + 1 : 1;
                const copy = [
                  ...current,
                  {
                    floorNo: nextNo,
                    floorBn: `${nextNo}ম তলা`,
                    floorEn: `${nextNo}th Floor`,
                    titleBn: 'নতুন তলার শিরোনাম',
                    titleEn: 'New Floor Title',
                    featuresBn: ['সুবিধা ১', 'সুবিধা ২'],
                    featuresEn: ['Feature 1', 'Feature 2'],
                    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
                    actionRoute: ''
                  }
                ];
                updateBuildField('floors', copy);
              }} 
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /><span>নতুন তলা যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-5">
            {(bData.floors || defaultBuildingData.floors).map((fl: any, fIdx: number) => (
              <div key={fIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-mono text-xs text-[#B8862A] font-bold">
                    তলা #{fIdx + 1} — {fl.floorBn || fl.floor_bn || 'তলা'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const copy = (bData.floors || defaultBuildingData.floors).filter((_: any, i: number) => i !== fIdx);
                      updateBuildField('floors', copy);
                    }} 
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">তলার নাম (বাংলা)</label>
                    <input 
                      type="text" 
                      value={fl.floorBn || fl.floor_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], floorBn: e.target.value, floor_bn: e.target.value };
                        updateBuildField('floors', copy);
                      }} 
                      placeholder="যেমন: ভূগর্ভস্থ ও নিচতলা"
                      className="w-full p-1.5 border rounded bg-white font-bold text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">তলার নাম (English)</label>
                    <input 
                      type="text" 
                      value={fl.floorEn || fl.floor_en || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], floorEn: e.target.value, floor_en: e.target.value };
                        updateBuildField('floors', copy);
                      }} 
                      placeholder="Ground Floor"
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">পেইজ রিডাইরেক্ট লিংক (অপশনাল)</label>
                    <select
                      value={fl.actionRoute || ''}
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], actionRoute: e.target.value };
                        updateBuildField('floors', copy);
                      }}
                      className="w-full p-1.5 border rounded bg-white text-xs"
                    >
                      <option value="">কোনো লিংক নেই</option>
                      <option value="auditorium">অডিটোরিয়াম পেইজ (auditorium)</option>
                      <option value="central-library">কেন্দ্রীয় পাঠাগার পেইজ (central-library)</option>
                      <option value="cafe">ক্যাফেটেরিয়া পেইজ (cafe)</option>
                      <option value="bookshop">বই বিক্রয় কেন্দ্র (bookshop)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">তলার মূল শিরোনাম (বাংলা)</label>
                    <input 
                      type="text" 
                      value={fl.titleBn || fl.title_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], titleBn: e.target.value, title_bn: e.target.value };
                        updateBuildField('floors', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white font-bold text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">তলার মূল শিরোনাম (English)</label>
                    <input 
                      type="text" 
                      value={fl.titleEn || fl.title_en || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], titleEn: e.target.value, title_en: e.target.value };
                        updateBuildField('floors', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>

                {/* Floor Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-600 block">তলার ছবি (Image URL + Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={fl.image || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], image: e.target.value };
                        updateBuildField('floors', copy);
                      }} 
                      className="flex-1 p-2 border rounded bg-white font-mono text-xs" 
                      placeholder="https://..." 
                    />
                    <label className="px-3 py-2 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3 h-3" /><span>ছবি আপলোড</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => {
                          const copy = [...(bData.floors || defaultBuildingData.floors)];
                          copy[fIdx] = { ...copy[fIdx], image: url };
                          updateBuildField('floors', copy);
                        }, `fl_img_${fIdx}`)} 
                      />
                    </label>
                  </div>
                  {fl.image && (
                    <div className="relative aspect-video max-h-28 w-full rounded-lg overflow-hidden border bg-stone-100 mt-1">
                      <img 
                        src={fl.image} 
                        className="w-full h-full object-cover" 
                        alt="Floor preview" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Features List (প্রতি লাইনে একটি করে সুবিধা) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সুবিধাসমূহ (বাংলা - প্রতি লাইনে একটি):</label>
                    <textarea 
                      rows={4}
                      value={Array.isArray(fl.featuresBn) ? fl.featuresBn.join('\n') : (fl.featuresBn || '')} 
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], featuresBn: lines };
                        updateBuildField('floors', copy);
                      }} 
                      placeholder="বিশ্বসাহিত্য কেন্দ্র তথ্য ও মূল অভ্যর্থনা কেন্দ্র\nনিরাপদ পার্কিং..."
                      className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সুবিধাসমূহ (English - প্রতি লাইনে একটি):</label>
                    <textarea 
                      rows={4}
                      value={Array.isArray(fl.featuresEn) ? fl.featuresEn.join('\n') : (fl.featuresEn || '')} 
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                        const copy = [...(bData.floors || defaultBuildingData.floors)];
                        copy[fIdx] = { ...copy[fIdx], featuresEn: lines };
                        updateBuildField('floors', copy);
                      }} 
                      placeholder="Main reception desk\nVehicle parking..."
                      className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 4 BUILDING ARCHITECTURAL SPECS */}
      {activeTab === 'specs' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. ভবনের স্থাপত্য ও পরিবেশ বৈশিষ্ট্যসমূহ (৪টি স্পেক্স)</h5>
            <p className="text-[10px] text-stone-500">ওয়েবসাইটে ৪টি আধুনিক স্থাপত্য ও নাগরিক সুবিধা কার্ড।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">সেকশন শিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={bData.specs_heading_bn || 'ভবনের বৈশিষ্ট্য ও নাগরিক সুবিধাসমূহ'} 
                onChange={(e) => updateBuildField('specs_heading_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">সেকশন সাব-টেক্সট (বাংলা)</label>
              <input 
                type="text" 
                value={bData.specs_sub_bn || 'আধুনিক নকশা, নিরাপদ পরিবেশ ও পরিবেশবান্ধব প্রযুক্তির এক অপূর্ব সমন্বয়।'} 
                onChange={(e) => updateBuildField('specs_sub_bn', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {(bData.specs || defaultBuildingData.specs).map((sp: any, sIdx: number) => (
              <div key={sIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">বৈশিষ্ট্য #{sIdx + 1}</span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">শিরোনাম (বাংলা)</label>
                    <input 
                      type="text" 
                      value={sp.titleBn || sp.title_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.specs || defaultBuildingData.specs)];
                        copy[sIdx] = { ...copy[sIdx], titleBn: e.target.value, title_bn: e.target.value };
                        updateBuildField('specs', copy);
                      }} 
                      className="w-full p-1.5 border rounded font-bold bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">শিরোনাম (EN)</label>
                    <input 
                      type="text" 
                      value={sp.titleEn || sp.title_en || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.specs || defaultBuildingData.specs)];
                        copy[sIdx] = { ...copy[sIdx], titleEn: e.target.value, title_en: e.target.value };
                        updateBuildField('specs', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">বিবরণ (বাংলা)</label>
                    <textarea 
                      rows={3}
                      value={sp.descBn || sp.desc_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.specs || defaultBuildingData.specs)];
                        copy[sIdx] = { ...copy[sIdx], descBn: e.target.value, desc_bn: e.target.value };
                        updateBuildField('specs', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">বিবরণ (EN)</label>
                    <textarea 
                      rows={3}
                      value={sp.descEn || sp.desc_en || ''} 
                      onChange={(e) => {
                        const copy = [...(bData.specs || defaultBuildingData.specs)];
                        copy[sIdx] = { ...copy[sIdx], descEn: e.target.value, desc_en: e.target.value };
                        updateBuildField('specs', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIUM RENTAL REDIRECT BANNER */}
      {activeTab === 'rental' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. মিলনায়তন ও রুম বুকিং রিডাইরেক্ট ব্যানার</h5>
          <p className="text-[10px] text-stone-500">ওয়েবসাইটের নিচে অডিটোরিয়াম ভাড়া সংক্রান্ত বড় কল-টু-অ্যাকশন ব্যানার।</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার ব্যাজ (বাংলা)</label>
              <input 
                type="text" 
                value={bData.rental_badge_bn || 'মিলনায়তন বুকিং সেবা'} 
                onChange={(e) => updateBuildField('rental_badge_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার ব্যাজ (ইংরেজি)</label>
              <input 
                type="text" 
                value={bData.rental_badge_en || 'Auditorium Booking Service'} 
                onChange={(e) => updateBuildField('rental_badge_en', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার শিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={bData.rental_title_bn || 'বিশ্বসাহিত্য কেন্দ্র ভবনের কোনো রুম বা মিলনায়তন ভাড়া নিতে চান?'} 
                onChange={(e) => updateBuildField('rental_title_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার শিরোনাম (ইংরেজি)</label>
              <input 
                type="text" 
                value={bData.rental_title_en || 'Looking to Rent an Auditorium or Classroom in BSK Building?'} 
                onChange={(e) => updateBuildField('rental_title_en', e.target.value)} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার বিস্তারিত বিবরণ (বাংলা)</label>
              <textarea 
                rows={3}
                value={bData.rental_desc_bn || 'সেমিনার, ওয়ার্কশপ, প্রদর্শনী ও সাংস্কৃতিক আয়োজনের জন্য ৯টি আধুনিক মিলনায়তন ও শ্রেণীকক্ষের অফিশিয়াল মূল্য তালিকা, আসবাবপত্র তথ্য ও অনলাইন বুকিংয়ের জন্য মিলনায়তন পেজে ভিজিট করুন।'} 
                onChange={(e) => updateBuildField('rental_desc_bn', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার বিস্তারিত বিবরণ (ইংরেজি)</label>
              <textarea 
                rows={3}
                value={bData.rental_desc_en || 'View complete rental rate cards, seat capacity specs, equipment pricing, and online booking options on the dedicated Auditorium page.'} 
                onChange={(e) => updateBuildField('rental_desc_en', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">বাটন টেক্সট (বাংলা)</label>
              <input 
                type="text" 
                value={bData.rental_btn_bn || 'মিলনায়তন বুকিং পেজে যান'} 
                onChange={(e) => updateBuildField('rental_btn_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">বাটন টেক্সট (ইংরেজি)</label>
              <input 
                type="text" 
                value={bData.rental_btn_en || 'Go to Auditorium Page'} 
                onChange={(e) => updateBuildField('rental_btn_en', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PHOTO GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৫. ভবন ফটো গ্যালারি</h5>
              <p className="text-[10px] text-stone-500">বিশ্বসাহিত্য কেন্দ্র ভবনের সুন্দর সুন্দর ছবি ও ক্যাপশন।</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                const current = bData.gallery || defaultBuildingData.gallery;
                updateBuildField('gallery', [
                  ...current,
                  {
                    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
                    caption_bn: 'ভবনের সুন্দর দৃশ্য',
                    caption_en: 'Building View'
                  }
                ]);
              }} 
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /><span>ছবি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(bData.gallery || defaultBuildingData.gallery).map((img: any, gIdx: number) => (
              <div key={gIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#B8862A]">ছবি #{gIdx + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const copy = (bData.gallery || defaultBuildingData.gallery).filter((_: any, i: number) => i !== gIdx);
                      updateBuildField('gallery', copy);
                    }} 
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
                {img.image && (
                  <img 
                    src={img.image} 
                    className="w-full h-28 object-cover rounded" 
                    alt="gal" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80'; }} 
                  />
                )}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={img.image || ''} 
                    onChange={(e) => {
                      const copy = [...(bData.gallery || defaultBuildingData.gallery)];
                      copy[gIdx] = { ...copy[gIdx], image: e.target.value };
                      updateBuildField('gallery', copy);
                    }} 
                    placeholder="URL" 
                    className="flex-1 p-1.5 text-xs border rounded bg-white font-mono" 
                  />
                  <label className="px-2.5 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3" /><span>আপলোড</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const copy = [...(bData.gallery || defaultBuildingData.gallery)];
                        copy[gIdx] = { ...copy[gIdx], image: url };
                        updateBuildField('gallery', copy);
                      }, `b_gal_${gIdx}`)} 
                    />
                  </label>
                </div>
                <input 
                  type="text" 
                  value={img.caption_bn || ''} 
                  onChange={(e) => {
                    const copy = [...(bData.gallery || defaultBuildingData.gallery)];
                    copy[gIdx] = { ...copy[gIdx], caption_bn: e.target.value };
                    updateBuildField('gallery', copy);
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
