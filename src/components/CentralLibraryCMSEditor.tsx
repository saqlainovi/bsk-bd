import React, { useState } from 'react';
import { 
  Library, BookOpen, Award, Sparkles, Clock, FileText, Upload, Plus, Trash2, Image as ImageIcon, Phone, Mail, MapPin
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
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'memberships' | 'gallery'>('hero');
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

  const defaultPlans = [
    { titleBn: 'সাধারণ সদস্যপদ (General Membership)', depositBn: '৳ ৫০০', feeBn: '৳ ৫০ / মাস', limitBn: 'একসাথে ২টি বই (১৪ দিন)', descBn: 'সকল প্রাপ্তবয়স্ক পাঠক ও শিক্ষার্থীদের জন্য উন্মুক্ত সাধারণ সদস্যপদ।' },
    { titleBn: 'আজীবন সদস্যপদ (Life Membership)', depositBn: '৳ ৫,০০০', feeBn: 'মাসিক ফি নেই', limitBn: 'একসাথে ৪টি বই (২১ দিন)', descBn: 'এককালীন অনুদানে আজীবন বিশেষ পাঠক সুবিধা ও বার্ষিক প্রকাশনা উপহার।' },
    { titleBn: 'শিশু-কিশোর সদস্যপদ (Junior Readers)', depositBn: '৳ ৩০০', feeBn: '৳ ৩০ / মাস', limitBn: 'একসাথে ২টি বই (১৪ দিন)', descBn: 'স্কুল-কলেজের কিশোর পাঠকদের জন্য বিশেষ পাঠক সেবা ও রঙিন কিশোর সাহিত্য।' }
  ];

  const currentPlans = Array.isArray(libraryData.membershipPlans) && libraryData.membershipPlans.length > 0 ? libraryData.membershipPlans : defaultPlans;

  const updatePlan = (idx: number, field: string, val: any) => {
    const next = [...currentPlans];
    next[idx] = { ...next[idx], [field]: val };
    updateLibField('membershipPlans', next);
  };

  const addPlan = () => {
    const newP = { titleBn: 'নতুন সদস্যপদ স্কিম', depositBn: '৳ ৫০০', feeBn: '৳ ৫০ / মাস', limitBn: '২টি বই', descBn: 'সদস্যপদের বিবরণ' };
    updateLibField('membershipPlans', [...currentPlans, newP]);
  };

  const deletePlan = (idx: number) => {
    if (confirm('এই সদস্যপদ স্কিমটি মুছে ফেলতে চান?')) {
      const next = currentPlans.filter((_: any, i: number) => i !== idx);
      updateLibField('membershipPlans', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. লাইব্রেরি পরিচিতি ও ব্যানার', icon: Library },
          { id: 'stats', labelBn: '২. মূল ৪টি পরিসংখ্যান', icon: Award },
          { id: 'memberships', labelBn: '৩. সদস্যপদ ও ফি তালিকা (' + currentPlans.length + 'টি)', icon: BookOpen },
          { id: 'gallery', labelBn: '৪. লাইব্রেরি ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. লাইব্রেরি পরিচিতি ও তথ্য</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">লাইব্রেরি নাম (বাংলা)</label>
              <input
                type="text"
                value={libraryData.hero_title_bn ?? 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় লাইব্রেরি'}
                onChange={(e) => updateLibField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Library Title (English)</label>
              <input
                type="text"
                value={libraryData.hero_title_en ?? 'BSK Central Library Services'}
                onChange={(e) => updateLibField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={libraryData.about_bn ?? 'বিশ্বসাহিত্য কেন্দ্র কেন্দ্রীয় লাইব্রেরি ১৯৭৮ সাল থেকে রুচিশীল ও মননশীল পাঠকদের সেবা দিয়ে আসছে। এখানে রয়েছে বাংলা ও বিশ্বসাহিত্যের কালজয়ী রচনাসমগ্র, দর্শন, বিজ্ঞান, ইতিহাস, চিত্রকলা ও সমাজবিদ্যার অমূল্য গ্রন্থভাণ্ডার।'}
              onChange={(e) => updateLibField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">লাইব্রেরি খোলা থাকার সময়সূচি</label>
              <input
                type="text"
                value={libraryData.library_hours_bn ?? 'শনিবার থেকে বৃহস্পতিবার: সকাল ১০:০০ - রাত ৮:০০ (শুক্রবার বন্ধ)'}
                onChange={(e) => updateLibField('library_hours_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">লাইব্রেরি হটলাইন / ফোন</label>
              <input
                type="text"
                value={libraryData.hotline ?? '০১৭৩০০০০০১৪'}
                onChange={(e) => updateLibField('hotline', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">লাইব্রেরি অবস্থান</label>
              <input
                type="text"
                value={libraryData.library_location_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবন (৭ম তলা), বাংলা মোটোর, ঢাকা'}
                onChange={(e) => updateLibField('library_location_bn', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={libraryData.hero_image ?? ''}
                onChange={(e) => updateLibField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? '...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLibField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. লাইব্রেরির মূল পরিসংখ্যানসমূহ</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">সংগৃহীত বই</label>
              <input
                type="text"
                value={libraryData.stat_books ?? '১,০০,০০০+'}
                onChange={(e) => updateLibField('stat_books', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">নিবন্ধিত পাঠক</label>
              <input
                type="text"
                value={libraryData.stat_members ?? '২৫,০০০+'}
                onChange={(e) => updateLibField('stat_members', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">পাঠকক্ষ আসন</label>
              <input
                type="text"
                value={libraryData.stat_seats ?? '৩০০+'}
                onChange={(e) => updateLibField('stat_seats', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border space-y-1">
              <label className="font-bold block">সাপ্তাহিক সেবা</label>
              <input
                type="text"
                value={libraryData.stat_days ?? '৬ দিন'}
                onChange={(e) => updateLibField('stat_days', e.target.value)}
                className="w-full p-1.5 border rounded bg-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMBERSHIPS */}
      {activeTab === 'memberships' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. সদস্যপদ স্কিম ও ফি তালিকা</h5>
              <p className="text-[11px] text-stone-500">জামালত, মাসিক ফি ও বই নেওয়ার সীমা নির্ধারণ করুন</p>
            </div>
            <button
              type="button"
              onClick={addPlan}
              className="px-3 py-1.5 bg-[#2E5942] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন স্কিম যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentPlans.map((plan: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">প্ল্যান #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => deletePlan(idx)}
                    className="text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">সদস্যপদের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={plan.titleBn ?? ''}
                      onChange={(e) => updatePlan(idx, 'titleBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">ফেরতযোগ্য জামানত (Deposit)</label>
                    <input
                      type="text"
                      value={plan.depositBn ?? ''}
                      onChange={(e) => updatePlan(idx, 'depositBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">মাসিক ফি (Monthly Fee)</label>
                    <input
                      type="text"
                      value={plan.feeBn ?? ''}
                      onChange={(e) => updatePlan(idx, 'feeBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] block">বই নেওয়ার সীমা ও সময়</label>
                    <input
                      type="text"
                      value={plan.limitBn ?? ''}
                      onChange={(e) => updatePlan(idx, 'limitBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] block">সংক্ষিপ্ত বিবরণ</label>
                    <input
                      type="text"
                      value={plan.descBn ?? ''}
                      onChange={(e) => updatePlan(idx, 'descBn', e.target.value)}
                      className="w-full p-1.5 border rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. কেন্দ্রীয় লাইব্রেরি ফটো গ্যালারি</h5>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={libraryData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateLibField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `lg_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLibField(`gallery_img_${gIdx}`, url), `lg_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
