import React, { useState } from 'react';
import { 
  Library, BookOpen, Award, Sparkles, Clock, FileText, Upload, Plus, Trash2, Image as ImageIcon, Download, Bookmark
} from 'lucide-react';
import { Language } from '../types';
import { defaultCentralLibraryData } from '../data/specializedPagesDefaults';

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
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'about' | 'services' | 'categories' | 'membership' | 'downloads'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  // Merge with defaultCentralLibraryData so all fields exist reliably
  const libData = {
    ...defaultCentralLibraryData,
    ...(editingPage.centralLibraryData || {}),
    ...editingPage
  };

  const updateLibField = (key: string, val: any) => {
    const extra: any = {};
    if (key === 'hero_image') {
      extra.heroImage = val;
      extra.image = val;
    }
    if (key === 'hero_badge_bn') extra.badge_bn = val;
    if (key === 'hero_badge_en') extra.badge_en = val;
    if (key === 'hero_title_bn') extra.title_bn = val;
    if (key === 'hero_title_en') extra.title_en = val;

    setEditingPage({
      ...editingPage,
      [key]: val,
      ...extra,
      centralLibraryData: {
        ...(editingPage.centralLibraryData || {}),
        [key]: val,
        ...extra
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
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Sparkles },
          { id: 'stats', labelBn: '২. ৪টি পরিসংখ্যান', icon: Award },
          { id: 'about', labelBn: '৩. পরিচিতি ও মূল বৈশিষ্ট্য', icon: Library },
          { id: 'services', labelBn: '৪. ৬টি সেবা ও গ্যালারি', icon: BookOpen },
          { id: 'categories', labelBn: '৫. বইয়ের বিভাগসমূহ', icon: Bookmark },
          { id: 'membership', labelBn: '৬. সদস্যপদ ও ফি তালিকা', icon: Clock },
          { id: 'downloads', labelBn: '৭. ক্যাটালগ ও ফরম', icon: Download }
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

      {/* TAB 1: HERO & INTRO */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. কেন্দ্রীয় গ্রন্থাগার পরিচিতি ও ব্যানার</h5>

          {/* Banner Image */}
          <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#B8862A]" />
                <span>গ্রন্থাগার মূল ব্যানার ছবি (Hero Banner Image)</span>
              </label>
              <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
            </div>
            <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
              <img 
                src={libData.hero_image || '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg'} 
                alt="Library Banner" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={(e) => { e.currentTarget.src = '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg'; }}
              />
              <button 
                type="button"
                onClick={() => updateLibField('hero_image', '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded-lg font-bold cursor-pointer transition"
              >
                ডিফল্ট ছবি ফিরিয়ে আনুন
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">ইমেজ লিংক বা সার্ভার ইউআরএল</label>
                <input 
                  type="text" 
                  value={libData.hero_image || ''}
                  onChange={(e) => updateLibField('hero_image', e.target.value)}
                  placeholder="/assets/IMGS/LIBARY/..." 
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
                    disabled={uploading === 'lib_hero_image'}
                    onChange={(e) => handleFileUpload(e, (url) => updateLibField('hero_image', url), 'lib_hero_image')} 
                  />
                  <Upload className={`h-4 w-4 text-[#2E5942] ${uploading === 'lib_hero_image' ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold text-[#2E5942]">
                    {uploading === 'lib_hero_image' ? 'আপলোড হচ্ছে...' : '📁 ব্যানার ছবি নির্বাচন করুন'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Badge, Title, Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যাজ লেখা (বাংলা)</label>
              <input 
                type="text" 
                value={libData.hero_badge_bn || libData.badge_bn || ''} 
                onChange={(e) => { updateLibField('hero_badge_bn', e.target.value); updateLibField('badge_bn', e.target.value); }} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যাজ লেখা (ইংরেজি)</label>
              <input 
                type="text" 
                value={libData.hero_badge_en || libData.badge_en || ''} 
                onChange={(e) => { updateLibField('hero_badge_en', e.target.value); updateLibField('badge_en', e.target.value); }} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={libData.hero_title_bn || libData.title_bn || ''} 
                onChange={(e) => { updateLibField('hero_title_bn', e.target.value); updateLibField('title_bn', e.target.value); }} 
                className="w-full p-2 border rounded font-bold text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">প্রধান শিরোনাম (ইংরেজি)</label>
              <input 
                type="text" 
                value={libData.hero_title_en || libData.title_en || ''} 
                onChange={(e) => { updateLibField('hero_title_en', e.target.value); updateLibField('title_en', e.target.value); }} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">উপশিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={libData.hero_subtitle_bn || libData.subtitle_bn || ''} 
                onChange={(e) => { updateLibField('hero_subtitle_bn', e.target.value); updateLibField('subtitle_bn', e.target.value); }} 
                placeholder="১৯৭৮ সাল থেকে রুচিশীল ও মননশীল পাঠক তৈরির নির্ভরযোগ্য ঠিকানা" 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">উপশিরোনাম (ইংরেজি)</label>
              <input 
                type="text" 
                value={libData.hero_subtitle_en || libData.subtitle_en || ''} 
                onChange={(e) => { updateLibField('hero_subtitle_en', e.target.value); updateLibField('subtitle_en', e.target.value); }} 
                placeholder="A haven for book lovers and researchers since 1978" 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার সংক্ষেপ বিবরণী (বাংলা)</label>
              <textarea 
                rows={3}
                value={libData.hero_desc_bn || ''} 
                onChange={(e) => updateLibField('hero_desc_bn', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">ব্যানার সংক্ষেপ বিবরণী (ইংরেজি)</label>
              <textarea 
                rows={3}
                value={libData.hero_desc_en || ''} 
                onChange={(e) => updateLibField('hero_desc_en', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">আবেদন বাটন টেক্সট (বাংলা)</label>
              <input 
                type="text" 
                value={libData.apply_btn_label_bn || 'সদস্য হতে আবেদন করুন'} 
                onChange={(e) => updateLibField('apply_btn_label_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">আবেদন বাটন টেক্সট (ইংরেজি)</label>
              <input 
                type="text" 
                value={libData.apply_btn_label_en || 'Apply for Membership'} 
                onChange={(e) => updateLibField('apply_btn_label_en', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATISTICS */}
      {activeTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">২. ৪টি মূল পরিসংখ্যান মেট্রিক্স</h5>
          <p className="text-[10px] text-stone-500">ওয়েবসাইটের ব্যানার নিচে ৪টি হাইলাইট পরিসংখ্যান কার্ড।</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(libData.stats || defaultCentralLibraryData.stats).map((st: any, sIdx: number) => (
              <div key={sIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">কার্ড #{sIdx + 1}</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">মান (বাংলা)</label>
                    <input 
                      type="text" 
                      value={st.val || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], val: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded font-bold bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">মান (EN)</label>
                    <input 
                      type="text" 
                      value={st.val_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], val_en: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">লেবেল (বাংলা)</label>
                    <input 
                      type="text" 
                      value={st.lbl || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], lbl: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded font-bold bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">লেবেল (EN)</label>
                    <input 
                      type="text" 
                      value={st.lbl_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], lbl_en: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সাব-টেক্সট (বাংলা)</label>
                    <input 
                      type="text" 
                      value={st.sub || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], sub: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded text-[11px] bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সাব-টেক্সট (EN)</label>
                    <input 
                      type="text" 
                      value={st.sub_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.stats || defaultCentralLibraryData.stats)];
                        copy[sIdx] = { ...copy[sIdx], sub_en: e.target.value };
                        updateLibField('stats', copy);
                      }} 
                      className="w-full p-1.5 border rounded text-[11px] bg-white" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT, MISSION & 2 FEATURES */}
      {activeTab === 'about' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৩. পরিচিতি, মূল লক্ষ্য ও ২টি প্রধান বৈশিষ্ট্য</h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">সেকশন শিরোনাম (বাংলা)</label>
              <input 
                type="text" 
                value={libData.about_heading_bn || ''} 
                onChange={(e) => updateLibField('about_heading_bn', e.target.value)} 
                className="w-full p-2 border rounded font-bold" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">সেকশন শিরোনাম (ইংরেজি)</label>
              <input 
                type="text" 
                value={libData.about_heading_en || ''} 
                onChange={(e) => updateLibField('about_heading_en', e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">লাইব্রেরি পরিচিতি অনুচ্ছেদ (বাংলা)</label>
              <textarea 
                rows={4}
                value={libData.about_text_bn || ''} 
                onChange={(e) => updateLibField('about_text_bn', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[11px] block">লাইব্রেরি পরিচিতি অনুচ্ছেদ (ইংরেজি)</label>
              <textarea 
                rows={4}
                value={libData.about_text_en || ''} 
                onChange={(e) => updateLibField('about_text_en', e.target.value)} 
                className="w-full p-2 border rounded text-xs leading-relaxed" 
              />
            </div>
          </div>

          <div className="p-4 bg-[#FAF8F3] border border-[#B8862A]/25 rounded-xl space-y-3">
            <h6 className="font-bold text-xs text-[#B8862A] font-serif">আমাদের মূল উদ্দেশ্য (Mission Box)</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">মিশন শিরোনাম (বাংলা)</label>
                <input 
                  type="text" 
                  value={libData.mission_title_bn || 'আমাদের মূল উদ্দেশ্য (Mission)'} 
                  onChange={(e) => updateLibField('mission_title_bn', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">মিশন শিরোনাম (ইংরেজি)</label>
                <input 
                  type="text" 
                  value={libData.mission_title_en || 'Our Mission'} 
                  onChange={(e) => updateLibField('mission_title_en', e.target.value)} 
                  className="w-full p-1.5 border rounded bg-white" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">মিশন বিবরণ (বাংলা)</label>
                <textarea 
                  rows={3}
                  value={libData.mission_text_bn || ''} 
                  onChange={(e) => updateLibField('mission_text_bn', e.target.value)} 
                  className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">মিশন বিবরণ (ইংরেজি)</label>
                <textarea 
                  rows={3}
                  value={libData.mission_text_en || ''} 
                  onChange={(e) => updateLibField('mission_text_en', e.target.value)} 
                  className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h6 className="font-bold text-xs text-stone-800 border-b pb-1">২টি হাইলাইট বৈশিষ্ট্য কার্ড</h6>
            
            {/* Feature 1 */}
            <div className="p-4 bg-stone-50 border rounded-xl space-y-2">
              <span className="font-mono text-[10px] text-[#2E5942] font-bold">বৈশিষ্ট্য #১</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">শিরোনাম (বাংলা)</label>
                  <input 
                    type="text" 
                    value={libData.feature1_title_bn || ''} 
                    onChange={(e) => updateLibField('feature1_title_bn', e.target.value)} 
                    className="w-full p-1.5 border rounded bg-white font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">শিরোনাম (ইংরেজি)</label>
                  <input 
                    type="text" 
                    value={libData.feature1_title_en || ''} 
                    onChange={(e) => updateLibField('feature1_title_en', e.target.value)} 
                    className="w-full p-1.5 border rounded bg-white" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">বিবরণ (বাংলা)</label>
                  <textarea 
                    rows={2}
                    value={libData.feature1_desc_bn || ''} 
                    onChange={(e) => updateLibField('feature1_desc_bn', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">বিবরণ (ইংরেজি)</label>
                  <textarea 
                    rows={2}
                    value={libData.feature1_desc_en || ''} 
                    onChange={(e) => updateLibField('feature1_desc_en', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-xs" 
                  />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 bg-stone-50 border rounded-xl space-y-2">
              <span className="font-mono text-[10px] text-[#2E5942] font-bold">বৈশিষ্ট্য #২</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">শিরোনাম (বাংলা)</label>
                  <input 
                    type="text" 
                    value={libData.feature2_title_bn || ''} 
                    onChange={(e) => updateLibField('feature2_title_bn', e.target.value)} 
                    className="w-full p-1.5 border rounded bg-white font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">শিরোনাম (ইংরেজি)</label>
                  <input 
                    type="text" 
                    value={libData.feature2_title_en || ''} 
                    onChange={(e) => updateLibField('feature2_title_en', e.target.value)} 
                    className="w-full p-1.5 border rounded bg-white" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">বিবরণ (বাংলা)</label>
                  <textarea 
                    rows={2}
                    value={libData.feature2_desc_bn || ''} 
                    onChange={(e) => updateLibField('feature2_desc_bn', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold block">বিবরণ (ইংরেজি)</label>
                  <textarea 
                    rows={2}
                    value={libData.feature2_desc_en || ''} 
                    onChange={(e) => updateLibField('feature2_desc_en', e.target.value)} 
                    className="w-full p-2 border rounded bg-white text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 6 SERVICES & INTERACTIVE GALLERY */}
      {activeTab === 'services' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">৪. লাইব্রেরি সেবাসমূহ ও ইন্টারেক্টিভ গ্যালারি</h5>
              <p className="text-[10px] text-stone-500">ওয়েবসাইটে প্রতিটি সেবায় ক্লিক করে বিস্তারিত তথ্য ও বড় ছবি দেখা যায়।</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                const current = libData.services || defaultCentralLibraryData.services;
                const copy = [
                  ...current,
                  {
                    title_bn: 'নতুন লাইব্রেরি সেবা',
                    title_en: 'New Library Service',
                    desc_bn: 'সেবার সংক্ষিপ্ত বর্ণনা...',
                    desc_en: 'Service description...',
                    img: '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg',
                    schedule_bn: 'শনিবার - বৃহস্পতিবার',
                    schedule_en: 'Sat - Thu'
                  }
                ];
                updateLibField('services', copy);
              }} 
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /><span>সেবা যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-4">
            {(libData.services || defaultCentralLibraryData.services).map((ser: any, sIdx: number) => (
              <div key={sIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-mono text-xs text-[#B8862A] font-bold">সেবা #{sIdx + 1} — {ser.title_bn}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const copy = (libData.services || defaultCentralLibraryData.services).filter((_: any, i: number) => i !== sIdx);
                      updateLibField('services', copy);
                    }} 
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সেবার শিরোনাম (বাংলা)</label>
                    <input 
                      type="text" 
                      value={ser.title_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], title_bn: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white font-bold text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সেবার শিরোনাম (ইংরেজি)</label>
                    <input 
                      type="text" 
                      value={ser.title_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], title_en: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>

                {/* Service Image and Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-600 block">সেবার ছবি (Image URL + Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={ser.img || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], img: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      className="flex-1 p-2 border rounded bg-white font-mono text-xs" 
                      placeholder="/assets/IMGS/LIBARY/..." 
                    />
                    <label className="px-3 py-2 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3 h-3" /><span>ছবি আপলোড</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => {
                          const copy = [...(libData.services || defaultCentralLibraryData.services)];
                          copy[sIdx] = { ...copy[sIdx], img: url };
                          updateLibField('services', copy);
                        }, `lib_svc_${sIdx}`)} 
                      />
                    </label>
                  </div>
                  {ser.img && (
                    <div className="relative aspect-video max-h-32 w-full rounded-lg overflow-hidden border bg-stone-100 mt-1">
                      <img 
                        src={ser.img} 
                        className="w-full h-full object-cover" 
                        alt="Service preview" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg'; }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">বিস্তারিত বিবরণ (বাংলা)</label>
                    <textarea 
                      rows={2} 
                      value={ser.desc_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], desc_bn: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">বিস্তারিত বিবরণ (ইংরেজি)</label>
                    <textarea 
                      rows={2} 
                      value={ser.desc_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], desc_en: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      className="w-full p-2 border rounded bg-white text-xs leading-relaxed" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সেবা সময়সূচি (বাংলা)</label>
                    <input 
                      type="text" 
                      value={ser.schedule_bn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], schedule_bn: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      placeholder="শনিবার - বৃহস্পতিবার"
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">সেবা সময়সূচি (ইংরেজি)</label>
                    <input 
                      type="text" 
                      value={ser.schedule_en || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.services || defaultCentralLibraryData.services)];
                        copy[sIdx] = { ...copy[sIdx], schedule_en: e.target.value };
                        updateLibField('services', copy);
                      }} 
                      placeholder="Sat - Thu"
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 8 BOOK CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৫. জনপ্রিয় বইয়ের বিভাগসমূহ (৮টি ক্যাটাগরি)</h5>
          <p className="text-[10px] text-stone-500">ওয়েবসাইটের নিচে ৮টি জনপ্রিয় বইয়ের ক্যাটাগরি ও বইয়ের সংখ্যা।</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {(libData.categories || defaultCentralLibraryData.categories).map((cat: any, cIdx: number) => (
              <div key={cIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <span className="font-mono text-[10px] text-[#B8862A] font-bold">বিভাগ #{cIdx + 1}</span>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-stone-600">নাম (বাংলা)</label>
                  <input 
                    type="text" 
                    value={cat.name_bn || ''} 
                    onChange={(e) => {
                      const copy = [...(libData.categories || defaultCentralLibraryData.categories)];
                      copy[cIdx] = { ...copy[cIdx], name_bn: e.target.value };
                      updateLibField('categories', copy);
                    }} 
                    className="w-full p-1.5 border rounded bg-white font-bold text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-stone-600">নাম (EN)</label>
                  <input 
                    type="text" 
                    value={cat.name_en || ''} 
                    onChange={(e) => {
                      const copy = [...(libData.categories || defaultCentralLibraryData.categories)];
                      copy[cIdx] = { ...copy[cIdx], name_en: e.target.value };
                      updateLibField('categories', copy);
                    }} 
                    className="w-full p-1.5 border rounded bg-white text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-stone-600">বইয়ের সংখ্যা (BN)</label>
                  <input 
                    type="text" 
                    value={cat.count_bn || ''} 
                    onChange={(e) => {
                      const copy = [...(libData.categories || defaultCentralLibraryData.categories)];
                      copy[cIdx] = { ...copy[cIdx], count_bn: e.target.value };
                      updateLibField('categories', copy);
                    }} 
                    placeholder="২৫,০০০+ বই"
                    className="w-full p-1.5 border rounded bg-white text-[11px]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MEMBERSHIP RULES & 3 TIERS */}
      {activeTab === 'membership' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৬. সদস্যপদ লাভ, নিয়মাবলী ও বাৎসরিক ফি কাঠামো</h5>

          {/* Rules Paragraphs */}
          <div className="p-4 bg-[#FAF8F3] border border-[#B8862A]/25 rounded-xl space-y-3">
            <h6 className="font-bold text-xs text-[#B8862A] font-serif">গ্রন্থাগারের সদস্যপদ লাভের নিয়মাবলী (Rules Text)</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">নিয়মাবলী অনুচ্ছেদ (বাংলা - প্রতি লাইনে ক, খ, গ...)</label>
                <textarea 
                  rows={6}
                  value={libData.membership_rules_bn || ''} 
                  onChange={(e) => updateLibField('membership_rules_bn', e.target.value)} 
                  className="w-full p-2 border rounded bg-white text-xs leading-relaxed font-sans" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold block">নিয়মাবলী অনুচ্ছেদ (ইংরেজি)</label>
                <textarea 
                  rows={6}
                  value={libData.membership_rules_en || ''} 
                  onChange={(e) => updateLibField('membership_rules_en', e.target.value)} 
                  className="w-full p-2 border rounded bg-white text-xs leading-relaxed font-sans" 
                />
              </div>
            </div>
          </div>

          {/* 3 Tier Plans */}
          <div className="space-y-3">
            <h6 className="font-bold text-xs text-stone-800">৩টি মেম্বারশিপ প্যাকেজ / টিয়ার</h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(libData.membershipPlans || defaultCentralLibraryData.membershipPlans).map((plan: any, pIdx: number) => (
                <div key={pIdx} className="p-4 bg-stone-50 rounded-xl border space-y-2">
                  <span className="font-mono text-[10px] text-[#2E5942] font-bold">প্যাকেজ #{pIdx + 1}</span>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold block text-stone-600">প্যাকেজের নাম (বাংলা)</label>
                    <input 
                      type="text" 
                      value={plan.nameBn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.membershipPlans || defaultCentralLibraryData.membershipPlans)];
                        copy[pIdx] = { ...copy[pIdx], nameBn: e.target.value };
                        updateLibField('membershipPlans', copy);
                      }} 
                      className="w-full p-1.5 border rounded font-bold bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold block text-stone-600">ফি কাঠামো (বাংলা)</label>
                    <input 
                      type="text" 
                      value={plan.feeBn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.membershipPlans || defaultCentralLibraryData.membershipPlans)];
                        copy[pIdx] = { ...copy[pIdx], feeBn: e.target.value };
                        updateLibField('membershipPlans', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-[#B8862A] font-bold text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold block text-stone-600">জামানত (বাংলা)</label>
                    <input 
                      type="text" 
                      value={plan.depositBn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.membershipPlans || defaultCentralLibraryData.membershipPlans)];
                        copy[pIdx] = { ...copy[pIdx], depositBn: e.target.value };
                        updateLibField('membershipPlans', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold block text-stone-600">বই ধার সীমা (বাংলা)</label>
                    <input 
                      type="text" 
                      value={plan.quotaBn || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.membershipPlans || defaultCentralLibraryData.membershipPlans)];
                        copy[pIdx] = { ...copy[pIdx], quotaBn: e.target.value };
                        updateLibField('membershipPlans', copy);
                      }} 
                      className="w-full p-1.5 border rounded bg-white text-xs" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DOWNLOADS & PHOTO GALLERY */}
      {activeTab === 'downloads' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৭. ক্যাটালগ, আবেদন ফরম ও ফটো গ্যালারি</h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catalog PDF */}
            <div className="p-4 bg-stone-50 rounded-xl border space-y-2">
              <label className="font-bold text-xs text-stone-800 flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#B8862A]" />
                <span>গ্রন্থাগার ক্যাটালগ PDF ফাইল</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={libData.catalog_pdf_url || ''} 
                  onChange={(e) => updateLibField('catalog_pdf_url', e.target.value)} 
                  placeholder="/assets/downloads/library_catalog.pdf"
                  className="flex-1 p-2 border rounded bg-white font-mono text-xs" 
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3 h-3" /><span>আপলোড</span>
                  <input 
                    type="file" 
                    accept=".pdf,application/pdf" 
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => updateLibField('catalog_pdf_url', url), 'lib_cat_pdf')} 
                  />
                </label>
              </div>
            </div>

            {/* Application Form PDF */}
            <div className="p-4 bg-stone-50 rounded-xl border space-y-2">
              <label className="font-bold text-xs text-stone-800 flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#2E5942]" />
                <span>সদস্যপদ আবেদন ফরম PDF</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={libData.form_pdf_url || ''} 
                  onChange={(e) => updateLibField('form_pdf_url', e.target.value)} 
                  placeholder="/assets/downloads/membership_form.pdf"
                  className="flex-1 p-2 border rounded bg-white font-mono text-xs" 
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3 h-3" /><span>আপলোড</span>
                  <input 
                    type="file" 
                    accept=".pdf,application/pdf" 
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (url) => updateLibField('form_pdf_url', url), 'lib_form_pdf')} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Extra Photo Gallery */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <h6 className="font-bold text-xs text-stone-800">অতিরিক্ত ফটো গ্যালারি</h6>
              <button 
                type="button" 
                onClick={() => {
                  const current = libData.gallery || defaultCentralLibraryData.gallery;
                  updateLibField('gallery', [...current, { image: '', caption_bn: 'পাঠাগারের মনোরম দৃশ্য', caption_en: 'Library View' }]);
                }} 
                className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /><span>ছবি যোগ করুন</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(libData.gallery || defaultCentralLibraryData.gallery).map((img: any, gIdx: number) => (
                <div key={gIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-[#B8862A]">ছবি #{gIdx + 1}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const copy = (libData.gallery || defaultCentralLibraryData.gallery).filter((_: any, i: number) => i !== gIdx);
                        updateLibField('gallery', copy);
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
                      onError={(e) => { e.currentTarget.src = '/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg'; }} 
                    />
                  )}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={img.image || ''} 
                      onChange={(e) => {
                        const copy = [...(libData.gallery || defaultCentralLibraryData.gallery)];
                        copy[gIdx] = { ...copy[gIdx], image: e.target.value };
                        updateLibField('gallery', copy);
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
                          const copy = [...(libData.gallery || defaultCentralLibraryData.gallery)];
                          copy[gIdx] = { ...copy[gIdx], image: url };
                          updateLibField('gallery', copy);
                        }, `lib_gal_${gIdx}`)} 
                      />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={img.caption_bn || ''} 
                    onChange={(e) => {
                      const copy = [...(libData.gallery || defaultCentralLibraryData.gallery)];
                      copy[gIdx] = { ...copy[gIdx], caption_bn: e.target.value };
                      updateLibField('gallery', copy);
                    }} 
                    placeholder="ক্যাপশন (বাংলা)" 
                    className="w-full p-1.5 border rounded bg-white" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
