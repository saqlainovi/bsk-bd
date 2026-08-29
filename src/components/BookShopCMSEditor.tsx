import React, { useState } from 'react';
import { 
  Store, BookOpen, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, MapPin, Phone
} from 'lucide-react';
import { Language } from '../types';

interface BookShopCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const BookShopCMSEditor: React.FC<BookShopCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'branches' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const bookShopData = editingPage.bookShopData || editingPage || {};

  const updateShopField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      bookShopData: {
        ...(editingPage.bookShopData || {}),
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

  const defaultBranches = [
    { nameBn: 'কেন্দ্রীয় বুকশপ (হেডকোয়ার্টার)', addressBn: 'বিশ্বসাহিত্য কেন্দ্র ভবন (নিচতলা), ১৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলা মোটোর, ঢাকা', phone: '০১৭৩০০০০০১২', mapLink: 'https://maps.google.com' },
    { nameBn: 'চট্টগ্রাম শাখা বুকশপ', addressBn: 'সিডিএ এভিনিউ, জিইসি মোড়, চট্টগ্রাম', phone: '০১৭৩০০০০০১৩', mapLink: 'https://maps.google.com' },
    { nameBn: 'রাজশাহী শাখা বুকশপ', addressBn: 'সাহেব বাজার, আরডিএ মার্কেট সংলগ্ন, রাজশাহী', phone: '০১৭৩০০০০০১৪', mapLink: 'https://maps.google.com' },
    { nameBn: 'খুলনা শাখা বুকশপ', addressBn: 'শিববাড়ি মোড়, কেডিএ এভিনিউ, খুলনা', phone: '০১৭৩০০০০০১৫', mapLink: 'https://maps.google.com' }
  ];

  const currentBranches = Array.isArray(bookShopData.branches) && bookShopData.branches.length > 0 ? bookShopData.branches : defaultBranches;

  const updateBranch = (idx: number, field: string, val: any) => {
    const next = [...currentBranches];
    next[idx] = { ...next[idx], [field]: val };
    updateShopField('branches', next);
  };

  const addBranch = () => {
    const newB = { nameBn: 'নতুন শাখা বুকশপ', addressBn: 'শাখার পূর্ণাঙ্গ ঠিকানা', phone: '০১৭৩০০০০...', mapLink: '' };
    updateShopField('branches', [...currentBranches, newB]);
  };

  const deleteBranch = (idx: number) => {
    if (confirm('এই শাখাটি মুছে ফেলতে চান?')) {
      const next = currentBranches.filter((_: any, i: number) => i !== idx);
      updateShopField('branches', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. বুকশপ পরিচিতি ও ব্যানার', icon: Store },
          { id: 'stats', labelBn: '২. পরিসংখ্যান ও অফার', icon: Award },
          { id: 'branches', labelBn: '৩. বিক্রয়কেন্দ্র ও শাখাসমূহ (' + currentBranches.length + 'টি)', icon: MapPin },
          { id: 'gallery', labelBn: '৪. বুকশপ ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. বুকশপ পরিচিতি তথ্য</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">বুকশপের নাম (বাংলা)</label>
              <input
                type="text"
                value={bookShopData.hero_title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র বই বিক্রয় কেন্দ্র'}
                onChange={(e) => updateShopField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Shop Title (English)</label>
              <input
                type="text"
                value={bookShopData.hero_title_en ?? 'BSK Book Shop & Publication Outlet'}
                onChange={(e) => updateShopField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={bookShopData.hero_subtitle_bn ?? 'বিশ্বসাহিত্য কেন্দ্রের সকল প্রকাশনাসহ দেশ-বিদেশের খ্যাতিমান প্রকাশকদের মানসম্মত ও রুচিশীল বইয়ের সমৃদ্ধ সমাহার। কেন্দ্র পাঠকদের জন্য সবসময় বিশেষ ছাড়ের ব্যবস্থা রয়েছে।'}
              onChange={(e) => updateShopField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">বুকশপ হটলাইন</label>
              <input
                type="text"
                value={bookShopData.hotline ?? '০১৭৩০০০০০১২'}
                onChange={(e) => updateShopField('hotline', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">বই অর্ডারের ইমেইল</label>
              <input
                type="text"
                value={bookShopData.order_email ?? 'bookshop@bskbd.org'}
                onChange={(e) => updateShopField('order_email', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bookShopData.hero_image ?? ''}
                onChange={(e) => updateShopField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? '...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateShopField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. বুকশপ পরিসংখ্যান ও ডিসকাউন্ট পলিসি</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">সংগৃহীত মোট বইয়ের টাইটেল</label>
              <input
                type="text"
                value={bookShopData.stat_books ?? '১০,০০০+'}
                onChange={(e) => updateShopField('stat_books', e.target.value)}
                className="w-full p-2 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">কেন্দ্র প্রকাশনা ছাড়</label>
              <input
                type="text"
                value={bookShopData.stat_discount ?? '২৫% - ৩৫%'}
                onChange={(e) => updateShopField('stat_discount', e.target.value)}
                className="w-full p-2 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">দেশব্যাপী সক্রিয় শাখা</label>
              <input
                type="text"
                value={bookShopData.stat_branches ?? '৮টি বিভাগীয় কেন্দ্র'}
                onChange={(e) => updateShopField('stat_branches', e.target.value)}
                className="w-full p-2 border rounded bg-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. BRANCHES */}
      {activeTab === 'branches' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. বিক্রয়কেন্দ্র ও শাখাসমূহের পূর্ণাঙ্গ তালিকা</h5>
              <p className="text-[11px] text-stone-500">প্রতিটি শাখার নাম, ঠিকানা ও ফোন নম্বর পরিবর্তন করুন</p>
            </div>
            <button
              type="button"
              onClick={addBranch}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন শাখা যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentBranches.map((branch: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">শাখা #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteBranch(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">শাখার নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={branch.nameBn ?? ''}
                      onChange={(e) => updateBranch(idx, 'nameBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">যোগাযোগ ফোন নম্বর</label>
                    <input
                      type="text"
                      value={branch.phone ?? ''}
                      onChange={(e) => updateBranch(idx, 'phone', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[10px] block">শাখার পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    value={branch.addressBn ?? ''}
                    onChange={(e) => updateBranch(idx, 'addressBn', e.target.value)}
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. বুকশপ ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={bookShopData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateShopField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `bg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateShopField(`gallery_img_${gIdx}`, url), `bg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
