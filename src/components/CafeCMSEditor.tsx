import React, { useState } from 'react';
import { 
  Utensils, Coffee, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Clock
} from 'lucide-react';
import { Language } from '../types';

interface CafeCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const CafeCMSEditor: React.FC<CafeCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'menu' | 'hours' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const cafeData = editingPage.cafeData || editingPage || {};

  const updateCafeField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      cafeData: {
        ...(editingPage.cafeData || {}),
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
          { id: 'hero', labelBn: '১. পরিচিতি ও ছাদবাগান', icon: Coffee },
          { id: 'menu', labelBn: '২. ফুড ও ড্রিংকস মেনু', icon: Utensils },
          { id: 'hours', labelBn: '৩. সময়সূচি ও বুকিং', icon: Clock },
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. ক্যাফেটেরিয়া ও মুক্তমঞ্চ পরিচিতি ও ব্যানার</h5>

          {/* Banner Image Upload & Live Preview */}
          <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#B8862A]" />
                <span>ক্যাফে মূল ব্যানার ছবি (Hero Banner Image)</span>
              </label>
              <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
            </div>

            <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
              <img 
                src={editingPage.hero_image || cafeData.hero_image || '/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg'} 
                alt="Cafe Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <button
                type="button"
                onClick={() => {
                  updateCafeField('hero_image', '/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg');
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
                  value={editingPage.hero_image || cafeData.hero_image || ''}
                  onChange={(e) => updateCafeField('hero_image', e.target.value)}
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
                    disabled={uploading === 'cafe_hero_image'}
                    onChange={(e) => handleFileUpload(e, (url) => {
                      updateCafeField('hero_image', url);
                    }, 'cafe_hero_image')}
                  />
                  <Upload className={`h-4 w-4 text-[#2E5942] ${uploading === 'cafe_hero_image' ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold text-[#2E5942]">
                    {uploading === 'cafe_hero_image' ? 'আপলোড হচ্ছে...' : '📁 ব্যানার ছবি নির্বাচন করুন'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={editingPage.title_bn ?? 'ক্যাফেটেরিয়া ও ফুড মেনু'}
                onChange={(e) => updateCafeField('title_bn', e.target.value)}
                placeholder="শিরোনাম (বাংলা)"
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (ইংরেজি)</label>
              <input
                type="text"
                value={editingPage.title_en ?? 'BSK Book Cafe & Rooftop'}
                onChange={(e) => updateCafeField('title_en', e.target.value)}
                placeholder="Title (English)"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold block">ক্যাফে পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={cafeData.about_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবনের ছাদবাগানে অবস্থিত এক শান্ত ও স্নিগ্ধ পরিবেশের ক্যাফে। বইপড়া, চিন্তার আড্ডা এবং নির্মল পরিবেশে কফি ও নাস্তার উপভোগ্য আয়োজন।'}
              onChange={(e) => updateCafeField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 2. MENU */}
      {activeTab === 'menu' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">২. জনপ্রিয় ফুড ও বেভারেজ আইটেম</h5>
            <button
              type="button"
              onClick={() => {
                const current = cafeData.menu_items || [];
                updateCafeField('menu_items', [...current, { name_bn: 'নতুন আইটেম', price: '৳ ১৫০', desc_bn: 'সুস্বাদু ও তাজা' }]);
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>আইটেম যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cafeData.menu_items || [
              { name_bn: 'এসপ্রেসো ও ক্যাপুচিনো কফি', price: '৳ ১৮০', desc_bn: 'ব্রু করা প্রিমিয়াম কফি বিন' },
              { name_bn: 'স্পেশাল মালাই চা', price: '৳ ৫০', desc_bn: 'খাঁটি দুধের সুগন্ধি চা' },
              { name_bn: 'চিকেন রোল ও সমুচা প্ল্যাটার', price: '৳ ১২০', desc_bn: 'মুচমুচে গরম স্ন্যাক্স' },
              { name_bn: 'ফ্রুট জুস ও স্মুদি', price: '৳ ১৫০', desc_bn: 'তাজা মৌসুমি ফলের রস' }
            ]).map((item: any, mIdx: number) => (
              <div key={mIdx} className="p-3.5 bg-stone-50 rounded-xl border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#2E5942] font-bold">মেনু #{mIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = (cafeData.menu_items || []).filter((_: any, i: number) => i !== mIdx);
                      updateCafeField('menu_items', copy);
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={item.name_bn || ''}
                    onChange={(e) => {
                      const copy = [...(cafeData.menu_items || [])];
                      copy[mIdx] = { ...copy[mIdx], name_bn: e.target.value };
                      updateCafeField('menu_items', copy);
                    }}
                    placeholder="খাবারের নাম"
                    className="col-span-2 p-2 border rounded bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={item.price || ''}
                    onChange={(e) => {
                      const copy = [...(cafeData.menu_items || [])];
                      copy[mIdx] = { ...copy[mIdx], price: e.target.value };
                      updateCafeField('menu_items', copy);
                    }}
                    placeholder="মূল্য e.g. ৳ ১২০"
                    className="p-2 border rounded bg-white text-xs text-[#B8862A] font-bold"
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
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৪. ক্যাফে ও ছাদবাগান ফটো গ্যালারি</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'ক্যাফে ও ছাদবাগানের পরিবেশ' }]
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
                      }, `cafe_gal_${gIdx}`)}
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
