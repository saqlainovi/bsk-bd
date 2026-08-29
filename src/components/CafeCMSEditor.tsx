import React, { useState } from 'react';
import { 
  Utensils, Coffee, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Clock, Phone, DollarSign
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

  const defaultMenuItems = [
    { id: '1', nameBn: 'স্পেশাল মিল্ক চা', nameEn: 'Special Milk Tea', category: 'hot_drinks', price: 25, descBn: 'সুগন্ধি খাঁটি দুধের চা', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
    { id: '2', nameBn: 'এসপ্রেসো কফি', nameEn: 'Espresso Coffee', category: 'hot_drinks', price: 50, descBn: 'তাজা রোস্টেড প্রিমিয়াম কফি', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
    { id: '3', nameBn: 'ভেজিটেবল রোল ও শিঙাড়া', nameEn: 'Vegetable Roll & Singara', category: 'snacks', price: 20, descBn: 'মুচমুচে সুস্বাদু তাজা নাস্তা', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
    { id: '4', nameBn: 'চিকেন স্যান্ডউইচ', nameEn: 'Chicken Sandwich', category: 'snacks', price: 80, descBn: 'গ্রিলড চিকেন ও টাটকা মেয়োনিজ', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' },
    { id: '5', nameBn: 'লেমন আইসড টি', nameEn: 'Lemon Iced Tea', category: 'cold_drinks', price: 45, descBn: 'তাজা লেবু ও পুদিনা পাতার ঠাণ্ডা পানীয়', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500' },
    { id: '6', nameBn: 'চকলেট ব্রাউনি উইথ আইসক্রিম', nameEn: 'Brownie with Ice Cream', category: 'dessert', price: 120, descBn: 'সমৃদ্ধ ডার্ক চকলেট ব্রাউনি', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500' }
  ];

  const currentMenu = Array.isArray(cafeData.menuItems) && cafeData.menuItems.length > 0 ? cafeData.menuItems : defaultMenuItems;

  const updateMenuItem = (idx: number, field: string, val: any) => {
    const next = [...currentMenu];
    next[idx] = { ...next[idx], [field]: val };
    updateCafeField('menuItems', next);
  };

  const addMenuItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      nameBn: 'নতুন খাবারের নাম',
      nameEn: 'New Food Item',
      category: 'snacks',
      price: 50,
      descBn: 'খাবারের সংক্ষিপ্ত বিবরণ',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500'
    };
    updateCafeField('menuItems', [...currentMenu, newItem]);
  };

  const deleteMenuItem = (idx: number) => {
    if (confirm('এই খাবার আইটেমটি মুছে ফেলতে চান?')) {
      const next = currentMenu.filter((_: any, i: number) => i !== idx);
      updateCafeField('menuItems', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. ক্যাফে পরিচিতি ও ব্যানার', icon: Coffee },
          { id: 'menu', labelBn: '২. ফুড ও ড্রিংকস মেনু (' + currentMenu.length + 'টি)', icon: Utensils },
          { id: 'hours', labelBn: '৩. সময়সূচি ও স্থান', icon: Clock },
          { id: 'gallery', labelBn: '৪. ক্যাফে ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. ক্যাফে পরিচিতি ও বিবরণ</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">ক্যাফের নাম (বাংলা)</label>
              <input
                type="text"
                value={cafeData.hero_title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র বুক ক্যাফে'}
                onChange={(e) => updateCafeField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Cafe Title (English)</label>
              <input
                type="text"
                value={cafeData.hero_title_en ?? 'BSK Literary Book Cafe & Rooftop'}
                onChange={(e) => updateCafeField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">পরিচিতি ও পরিবেশের বিবরণ (বাংলা)</label>
            <textarea
              rows={3}
              value={cafeData.hero_subtitle_bn ?? 'বইয়ের সান্নিধ্যে এক কাপ ধোঁয়া ওঠা চা-কফি আর স্বাস্থ্যকর স্ন্যাক্স উপভোগের মনোরম স্থান। কেন্দ্রের ৯ তলার রুফটপ গার্ডেনে মুক্ত আলো-বাতাসে আড্ডা ও পাঠের চমৎকার পরিবেশ।'}
              onChange={(e) => updateCafeField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cafeData.hero_image ?? ''}
                onChange={(e) => updateCafeField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? '...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateCafeField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. MENU */}
      {activeTab === 'menu' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">২. ফুড ও ড্রিংকস মেনু আইটেমসমূহ</h5>
              <p className="text-[11px] text-stone-500">মেনুর খাবার আইটেমের নাম, মূল্য, ক্যাটাগরি ও ছবি পরিবর্তন করুন</p>
            </div>
            <button
              type="button"
              onClick={addMenuItem}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন আইটেম যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentMenu.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">আইটেম #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteMenuItem(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">আইটেম নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={item.nameBn ?? ''}
                      onChange={(e) => updateMenuItem(idx, 'nameBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">মূল্য (৳)</label>
                    <input
                      type="text"
                      value={item.price ?? ''}
                      onChange={(e) => updateMenuItem(idx, 'price', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[10px] block">আইটেম বিবরণী</label>
                  <input
                    type="text"
                    value={item.descBn ?? ''}
                    onChange={(e) => updateMenuItem(idx, 'descBn', e.target.value)}
                    className="w-full p-1.5 border rounded bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[10px] block">খাবারের ছবি URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image ?? ''}
                      onChange={(e) => updateMenuItem(idx, 'image', e.target.value)}
                      className="flex-1 p-1.5 border rounded bg-white text-xs"
                    />
                    <label className="px-2 py-1 bg-[#2E5942] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploading === `m_${idx}` ? '...' : 'আপলোড'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateMenuItem(idx, 'image', url), `m_${idx}`)} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. HOURS */}
      {activeTab === 'hours' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৩. সময়সূচি ও ক্যাফে অবস্থান</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">ক্যাফে খোলা থাকার সময়</label>
              <input
                type="text"
                value={cafeData.opening_hours_bn ?? 'প্রতিদিন বেলা ৩:০০ - রাত ৯:০০ (শুক্রবারসহ প্রতিদিন খোলা)'}
                onChange={(e) => updateCafeField('opening_hours_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">ক্যাফের অবস্থান</label>
              <input
                type="text"
                value={cafeData.location_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবন (৯ম তলা ও রুফটপ), বাংলা মোটোর, ঢাকা'}
                onChange={(e) => updateCafeField('location_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. বুক ক্যাফে ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={cafeData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateCafeField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `cg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateCafeField(`gallery_img_${gIdx}`, url), `cg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
