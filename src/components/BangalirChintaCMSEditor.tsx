import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Award, Plus, Trash2, Upload, ExternalLink,
  Layers, Phone, HelpCircle, FileText, ChevronRight, CheckCircle2,
  Info, Eye, Image as ImageIcon, ArrowUp, ArrowDown, BookMarked
} from 'lucide-react';
import { Language } from '../types';

interface BangalirChintaCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (fileOrBase64: any) => Promise<string | null>;
  compressImage?: (file: File) => Promise<string>;
}

export const BangalirChintaCMSEditor: React.FC<BangalirChintaCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
  compressImage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'hero' | 'stats' | 'showcase_labels' | 'subjects' | 'order_info' | 'custom_sections'
  >('hero');

  const [expandedSubjectIdx, setExpandedSubjectIdx] = useState<number | null>(0);

  const updateField = (key: string, value: any) => {
    setEditingPage({
      ...editingPage,
      [key]: value,
      bangalirChintaData: {
        ...(editingPage.bangalirChintaData || {}),
        [key]: value
      }
    });
  };

  const handleImageUpload = async (fieldKey: string, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        updateField(fieldKey, finalUrl);
        if (fieldKey === 'cover_image' || fieldKey === 'hero_image') {
          setEditingPage({
            ...editingPage,
            cover_image: finalUrl,
            hero_image: finalUrl,
            bangalirChintaData: {
              ...(editingPage.bangalirChintaData || {}),
              cover_image: finalUrl,
              hero_image: finalUrl
            }
          });
        }
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleSubjectImageUpload = async (index: number, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        const subjects = [...(editingPage.subjects || editingPage.bangalirChintaData?.subjects || [])];
        if (subjects[index]) {
          subjects[index] = { ...subjects[index], coverImage: finalUrl };
          updateField('subjects', subjects);
        }
      }
    } catch (err) {
      console.error('Subject image upload failed:', err);
    }
  };

  const currentSubjects = editingPage.subjects || editingPage.bangalirChintaData?.subjects || [];

  return (
    <div className="space-y-6 pt-4 border-t border-[#B8862A]/20 text-left">
      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-1.5 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. হিরো ব্যানার ও শিরোনাম', labelEn: '1. Hero Banner & Identity', icon: Sparkles },
          { id: 'stats', labelBn: '২. মূল পরিসংখ্যান ও মেট্রিক্স', labelEn: '2. Key Stats & Pricing', icon: Award },
          { id: 'showcase_labels', labelBn: '৩. বই ও প্রদর্শনী লেবেল', labelEn: '3. Showcase & Section Labels', icon: Layers },
          { id: 'subjects', labelBn: `৪. বিষয়ভিত্তিক সংকলন (${currentSubjects.length}টি)`, labelEn: `4. Thematic Subjects (${currentSubjects.length})`, icon: BookOpen },
          { id: 'order_info', labelBn: '৫. সংগ্রহ, অর্ডার ও হেল্পলাইন', labelEn: '5. Order & Contact Info', icon: BookMarked },
          { id: 'custom_sections', labelBn: '৬. অতিরিক্ত তথ্য ও ডকুমেন্টেশন', labelEn: '6. Custom Sections', icon: FileText }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#1A0A08] text-[#F0CC7A] shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#F0CC7A]' : 'text-[#B8862A]'}`} />
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 1: HERO BANNER & IDENTITY
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'hero' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
            <Sparkles className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '১. হিরো ব্যানার, শিরোনাম ও পরিচিতি' : '1. Hero Banner, Titles & Identity'}</span>
          </h5>

          {/* Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'টপ ব্যাজ (বাংলা)' : 'Top Badge (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_bn ?? editingPage.bangalirChintaData?.badge_bn ?? ''}
                onChange={(e) => updateField('badge_bn', e.target.value)}
                placeholder="বিশ্বসাহিত্য কেন্দ্র প্রকাশনা প্রকল্প"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-serif"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'টপ ব্যাজ (ইংরেজি)' : 'Top Badge (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_en ?? editingPage.bangalirChintaData?.badge_en ?? ''}
                onChange={(e) => updateField('badge_en', e.target.value)}
                placeholder="BSK Major Publishing Project"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-sans"
              />
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'মূল শিরোনাম (বাংলা)' : 'Hero Title (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.hero_title_bn ?? editingPage.title_bn ?? editingPage.bangalirChintaData?.hero_title_bn ?? ''}
                onChange={(e) => {
                  updateField('hero_title_bn', e.target.value);
                  updateField('title_bn', e.target.value);
                }}
                placeholder="বাঙালির চিন্তামূলক রচনা সংগ্রহ (২০৯ খণ্ড)"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-serif font-bold text-stone-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'মূল শিরোনাম (ইংরেজি)' : 'Hero Title (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.hero_title_en ?? editingPage.title_en ?? editingPage.bangalirChintaData?.hero_title_en ?? ''}
                onChange={(e) => {
                  updateField('hero_title_en', e.target.value);
                  updateField('title_en', e.target.value);
                }}
                placeholder="Bengali Thoughtful Writings Collection (209 Volumes)"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-sans font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Subtitles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'সাবটাইটেল / সারসংক্ষেপ (বাংলা)' : 'Subtitle / Vision (BN)'}
              </label>
              <textarea
                rows={4}
                value={editingPage.hero_subtitle_bn ?? editingPage.bangalirChintaData?.hero_subtitle_bn ?? ''}
                onChange={(e) => updateField('hero_subtitle_bn', e.target.value)}
                placeholder="বাঙালি মনীষীদের চিন্তাশীল রচনাগুলো বিষয়ভিত্তিকভাবে সংগ্রহ ও সম্পাদনা করে প্রকাশ করছে বিশ্বসাহিত্য কেন্দ্র..."
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-serif leading-relaxed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'সাবটাইটেল / সারসংক্ষেপ (ইংরেজি)' : 'Subtitle / Vision (EN)'}
              </label>
              <textarea
                rows={4}
                value={editingPage.hero_subtitle_en ?? editingPage.bangalirChintaData?.hero_subtitle_en ?? ''}
                onChange={(e) => updateField('hero_subtitle_en', e.target.value)}
                placeholder="Bishwo Shahitto Kendro is publishing a thematic collection of thoughtful writings..."
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Hero Cover Image */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <label className="text-[11px] font-bold text-stone-700 block">
              {language === 'bn' ? 'কভার / ব্যানার ছবি (Cover / Banner Image)' : 'Cover / Banner Image'}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={editingPage.cover_image || editingPage.hero_image || editingPage.bangalirChintaData?.cover_image || ''}
                onChange={(e) => {
                  updateField('cover_image', e.target.value);
                  updateField('hero_image', e.target.value);
                }}
                placeholder="/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg"
                className="flex-1 p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-mono"
              />
              <label className="px-4 py-2.5 bg-[#2E5942] hover:bg-[#234533] text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 inline-flex items-center gap-1.5 transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload('cover_image', f);
                  }}
                />
              </label>
            </div>
            {(editingPage.cover_image || editingPage.hero_image || editingPage.bangalirChintaData?.cover_image) && (
              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-stone-300 relative bg-stone-100 shadow-inner">
                <img
                  src={editingPage.cover_image || editingPage.hero_image || editingPage.bangalirChintaData?.cover_image}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 2: KEY STATS & PRICING
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-1.5 border-b pb-2">
            <Award className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '২. মূল পরিসংখ্যান ও প্রাইসিং কার্ডস' : '2. Key Stats & Pricing Cards'}</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat 1: Total Volumes */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#B8862A]/20 space-y-3">
              <div className="font-bold text-xs text-[#B8862A] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '১. মোট খণ্ড মেট্রিক' : '1. Total Volumes Stat'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600">ভ্যালু / সংখ্যা (Value)</label>
                <input
                  type="text"
                  value={editingPage.stats_vols ?? editingPage.bangalirChintaData?.stats_vols ?? '২০৯টি'}
                  onChange={(e) => updateField('stats_vols', e.target.value)}
                  placeholder="২০৯টি"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold bg-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-500">লেবেল (বাংলা)</label>
                  <input
                    type="text"
                    value={editingPage.stats_vols_label_bn ?? editingPage.bangalirChintaData?.stats_vols_label_bn ?? 'মোট খণ্ড'}
                    onChange={(e) => updateField('stats_vols_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500">Label (English)</label>
                  <input
                    type="text"
                    value={editingPage.stats_vols_label_en ?? editingPage.bangalirChintaData?.stats_vols_label_en ?? 'Total Volumes'}
                    onChange={(e) => updateField('stats_vols_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Stat 2: Total Subjects */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#B8862A]/20 space-y-3">
              <div className="font-bold text-xs text-[#B8862A] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '২. বিষয়ভিত্তিক শাখা মেট্রিক' : '2. Thematic Subjects Stat'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600">ভ্যালু / সংখ্যা (Value)</label>
                <input
                  type="text"
                  value={editingPage.stats_subjects ?? editingPage.bangalirChintaData?.stats_subjects ?? '১৬টি'}
                  onChange={(e) => updateField('stats_subjects', e.target.value)}
                  placeholder="১৬টি"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold bg-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-500">লেবেল (বাংলা)</label>
                  <input
                    type="text"
                    value={editingPage.stats_subjects_label_bn ?? editingPage.bangalirChintaData?.stats_subjects_label_bn ?? 'বিষয়ভিত্তিক শাখা'}
                    onChange={(e) => updateField('stats_subjects_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500">Label (English)</label>
                  <input
                    type="text"
                    value={editingPage.stats_subjects_label_en ?? editingPage.bangalirChintaData?.stats_subjects_label_en ?? 'Thematic Subjects'}
                    onChange={(e) => updateField('stats_subjects_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Stat 3: Set Special Price */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#B8862A]/20 space-y-3">
              <div className="font-bold text-xs text-[#B8862A] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '৩. সেট মূল্য মেট্রিক' : '3. Set Special Price Stat'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600">মূল্য (Price Value)</label>
                <input
                  type="text"
                  value={editingPage.collection_price ?? editingPage.bangalirChintaData?.collection_price ?? '১,৯০,০০০ টাকা'}
                  onChange={(e) => updateField('collection_price', e.target.value)}
                  placeholder="১,৯০,০০০ টাকা"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold bg-white font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-500">লেবেল (বাংলা)</label>
                  <input
                    type="text"
                    value={editingPage.stats_price_label_bn ?? editingPage.bangalirChintaData?.stats_price_label_bn ?? 'বিশেষ সেট মূল্য'}
                    onChange={(e) => updateField('stats_price_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500">Label (English)</label>
                  <input
                    type="text"
                    value={editingPage.stats_price_label_en ?? editingPage.bangalirChintaData?.stats_price_label_en ?? 'Set Special Price'}
                    onChange={(e) => updateField('stats_price_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 3: SHOWCASE & SECTION LABELS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'showcase_labels' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৩. বইয়ের মকআপ ও সেকশন হেডারের লেবেলসমূহ' : '3. 3D Book Mockup & Section Header Labels'}</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Book top header label */}
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-2">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? '৩ডি বইয়ের টপ স্লোগান (বাংলা ও ইংরেজি)' : '3D Book Top Slogan (BN & EN)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.book_top_label_bn ?? editingPage.bangalirChintaData?.book_top_label_bn ?? 'বাঙালির চিন্তামূলক রচনা'}
                  onChange={(e) => updateField('book_top_label_bn', e.target.value)}
                  placeholder="বাঙালির চিন্তামূলক রচনা"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif"
                />
                <input
                  type="text"
                  value={editingPage.book_top_label_en ?? editingPage.bangalirChintaData?.book_top_label_en ?? 'Bengali Thoughtful Writings'}
                  onChange={(e) => updateField('book_top_label_en', e.target.value)}
                  placeholder="Bengali Thoughtful Writings"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans"
                />
              </div>
            </div>

            {/* Book footer organization label */}
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-2">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? '৩ডি বইয়ের ফুটার লেবেল (বাংলা ও ইংরেজি)' : '3D Book Footer Org Label (BN & EN)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.book_footer_label_bn ?? editingPage.bangalirChintaData?.book_footer_label_bn ?? 'বিশ্বসাহিত্য কেন্দ্র'}
                  onChange={(e) => updateField('book_footer_label_bn', e.target.value)}
                  placeholder="বিশ্বসাহিত্য কেন্দ্র"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif"
                />
                <input
                  type="text"
                  value={editingPage.book_footer_label_en ?? editingPage.bangalirChintaData?.book_footer_label_en ?? 'Bishwo Shahitto Kendro'}
                  onChange={(e) => updateField('book_footer_label_en', e.target.value)}
                  placeholder="Bishwo Shahitto Kendro"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans"
                />
              </div>
            </div>

            {/* Editor header label */}
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-2">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'সম্পাদক পরিচিতি হেডার লেবেল' : 'Editor Section Header Label'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.editor_label_bn ?? editingPage.bangalirChintaData?.editor_label_bn ?? 'সম্পাদনা ও সংকলন'}
                  onChange={(e) => updateField('editor_label_bn', e.target.value)}
                  placeholder="সম্পাদনা ও সংকলন"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif"
                />
                <input
                  type="text"
                  value={editingPage.editor_label_en ?? editingPage.bangalirChintaData?.editor_label_en ?? 'Edited & Compiled By'}
                  onChange={(e) => updateField('editor_label_en', e.target.value)}
                  placeholder="Edited & Compiled By"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans"
                />
              </div>
            </div>

            {/* Browse Grid Header */}
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-2">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'গ্রিড ব্রাউজিং হেডার (বাংলা ও ইংরেজি)' : 'Browse Grid Heading (BN & EN)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.browse_heading_bn ?? editingPage.bangalirChintaData?.browse_heading_bn ?? 'বিষয়ভিত্তিক সংকলনসমূহ ব্রাউজ করুন'}
                  onChange={(e) => updateField('browse_heading_bn', e.target.value)}
                  placeholder="বিষয়ভিত্তিক সংকলনসমূহ ব্রাউজ করুন"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif"
                />
                <input
                  type="text"
                  value={editingPage.browse_heading_en ?? editingPage.bangalirChintaData?.browse_heading_en ?? 'Browse Thematic Collections'}
                  onChange={(e) => updateField('browse_heading_en', e.target.value)}
                  placeholder="Browse Thematic Collections"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans"
                />
              </div>
            </div>

            {/* Browse Grid Subtitle */}
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'গ্রিড ব্রাউজিং সাবটাইটেল / নির্দেশিকা' : 'Browse Grid Subtitle / Guidance'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.browse_subtitle_bn ?? editingPage.bangalirChintaData?.browse_subtitle_bn ?? 'যেকোনো বিষয়ে ক্লিক করে তার বিস্তারিত বিবরণ ও সংকলক পরিচিতি জানুন'}
                  onChange={(e) => updateField('browse_subtitle_bn', e.target.value)}
                  placeholder="যেকোনো বিষয়ে ক্লিক করে তার বিস্তারিত বিবরণ ও সংকলক পরিচিতি জানুন"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif"
                />
                <input
                  type="text"
                  value={editingPage.browse_subtitle_en ?? editingPage.bangalirChintaData?.browse_subtitle_en ?? 'Click any subject tile to view volume details and editorial summary'}
                  onChange={(e) => updateField('browse_subtitle_en', e.target.value)}
                  placeholder="Click any subject tile to view volume details and editorial summary"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 4: THEMATIC SUBJECTS LIST (FULL CRUD)
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? '৪. বিষয়ভিত্তিক সংকলন তালিকা (সম্পূর্ণ বিষয় পরিচালনা)' : '4. Thematic Subjects Management'}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                {language === 'bn' ? 'প্রতিটি বিষয়ের শিরোনাম, ভলিউম সংখ্যা, সংকলক/সম্পাদক এবং সারসংক্ষেপ এডিট করুন।' : 'Add, edit, reorder or remove subjects.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newSub = {
                  id: `sub-${Date.now()}`,
                  title: 'নতুন বিষয়চিন্তা',
                  en: 'New Subject',
                  vols: '১০ খণ্ড',
                  volsEn: '10 Volumes',
                  editor: 'সম্পাদকের নাম',
                  editorEn: 'Editor Name',
                  desc: 'বিষয়ভিত্তিক সংকলনের বিস্তারিত সারসংক্ষেপ ও রচনার বিবরণ।',
                  descEn: 'Detailed thematic overview and writings summary.',
                  coverColor: 'from-[#3D2517] to-[#1A100A]',
                  accentColor: '#B8862A'
                };
                const updated = [...currentSubjects, newSub];
                updateField('subjects', updated);
                setExpandedSubjectIdx(updated.length - 1);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#234533] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন বিষয় যোগ করুন' : 'Add Subject'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentSubjects.map((sub: any, sIdx: number) => {
              const isExpanded = expandedSubjectIdx === sIdx;
              return (
                <div 
                  key={sub.id || `sub-${sIdx}`}
                  className={`rounded-xl border transition-all ${
                    isExpanded 
                      ? 'bg-[#FAF8F3] border-[#B8862A]/50 shadow-xs' 
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Card Header */}
                  <div 
                    onClick={() => setExpandedSubjectIdx(isExpanded ? null : sIdx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#B8862A]/10 text-[#B8862A] flex items-center justify-center font-mono font-bold text-xs">
                        {sIdx + 1}
                      </span>
                      <div>
                        <span className="font-serif font-bold text-sm text-stone-900">
                          {sub.title || 'শিরোনামহীন বিষয়'}
                        </span>
                        {sub.en && (
                          <span className="text-xs font-sans text-stone-500 ml-2">
                            ({sub.en})
                          </span>
                        )}
                        <span className="ml-3 text-[11px] font-mono text-[#B8862A] font-bold">
                          {sub.vols || sub.volsEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Reorder Up */}
                      {sIdx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const arr = [...currentSubjects];
                            const temp = arr[sIdx];
                            arr[sIdx] = arr[sIdx - 1];
                            arr[sIdx - 1] = temp;
                            updateField('subjects', arr);
                            setExpandedSubjectIdx(sIdx - 1);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Reorder Down */}
                      {sIdx < currentSubjects.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const arr = [...currentSubjects];
                            const temp = arr[sIdx];
                            arr[sIdx] = arr[sIdx + 1];
                            arr[sIdx + 1] = temp;
                            updateField('subjects', arr);
                            setExpandedSubjectIdx(sIdx + 1);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(language === 'bn' ? `আপনি কি '${sub.title}' সংকলনটি মুছে ফেলতে চান?` : `Delete '${sub.title}'?`)) {
                            const arr = currentSubjects.filter((_: any, i: number) => i !== sIdx);
                            updateField('subjects', arr);
                            if (expandedSubjectIdx === sIdx) setExpandedSubjectIdx(null);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer ml-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Card Body */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[#B8862A]/20 space-y-3 bg-white rounded-b-xl">
                      {/* Title & EN Title */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">বিষয়ের নাম (বাংলা)</label>
                          <input
                            type="text"
                            value={sub.title || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], title: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="অর্থনীতিচিন্তা"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif font-bold bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">Subject Name (English)</label>
                          <input
                            type="text"
                            value={sub.en || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], en: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="Economics"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans font-bold bg-white"
                          />
                        </div>
                      </div>

                      {/* Volumes & Editors */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">খণ্ড সংখ্যা (বাংলা)</label>
                          <input
                            type="text"
                            value={sub.vols || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], vols: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="৮ খণ্ড"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-mono font-bold bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">Volumes (English)</label>
                          <input
                            type="text"
                            value={sub.volsEn || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], volsEn: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="8 Volumes"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-mono font-bold bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">সম্পাদক/সংকলক (বাংলা)</label>
                          <input
                            type="text"
                            value={sub.editor || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], editor: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="হারাধন গাঙ্গুলী"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-serif text-[#B8862A] font-bold bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">Editor/Compiler (EN)</label>
                          <input
                            type="text"
                            value={sub.editorEn || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], editorEn: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="Haradhan Ganguly"
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs font-sans text-[#B8862A] font-bold bg-white"
                          />
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">সংক্ষিপ্ত বিবরণ (বাংলা)</label>
                          <textarea
                            rows={3}
                            value={sub.desc || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], desc: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="প্রাচীন বাংলা থেকে আজকের বাংলাদেশের অর্থনীতির একটা সামগ্রিক চিত্র..."
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">Description / Overview (English)</label>
                          <textarea
                            rows={3}
                            value={sub.descEn || ''}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], descEn: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="A masterpiece showcasing the comprehensive picture..."
                            className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Gradient Styling & Custom Image */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-stone-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">কভার গ্রেডিয়েন্ট (Tailwind Classes)</label>
                          <input
                            type="text"
                            value={sub.coverColor || 'from-[#4E2F1D] to-[#3D2517]'}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], coverColor: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="from-[#4E2F1D] to-[#3D2517]"
                            className="w-full p-2 border border-stone-200 rounded text-xs font-mono bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">অ্যাকসেন্ট কালার (Hex Code)</label>
                          <input
                            type="text"
                            value={sub.accentColor || '#B8862A'}
                            onChange={(e) => {
                              const arr = [...currentSubjects];
                              arr[sIdx] = { ...arr[sIdx], accentColor: e.target.value };
                              updateField('subjects', arr);
                            }}
                            placeholder="#B8862A"
                            className="w-full p-2 border border-stone-200 rounded text-xs font-mono bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-600">কভার ফটো (ঐচ্ছিক ইমেজ আপলোড)</label>
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              value={sub.coverImage || ''}
                              onChange={(e) => {
                                const arr = [...currentSubjects];
                                arr[sIdx] = { ...arr[sIdx], coverImage: e.target.value };
                                updateField('subjects', arr);
                              }}
                              placeholder="URL"
                              className="flex-1 p-2 border border-stone-200 rounded text-xs font-mono bg-white"
                            />
                            <label className="p-2 bg-stone-800 hover:bg-black text-white rounded text-xs cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSubjectImageUpload(sIdx, f);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 5: ORDERING & CONTACT INFO
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'order_info' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-1.5 border-b pb-2">
            <BookMarked className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৫. সংগ্রহ, অর্ডারের নিয়মাবলী ও অফিশিয়াল লিংক' : '5. Collection, Ordering & Official Portal'}</span>
          </h5>

          {/* Section Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Title (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.order_section_title_bn ?? editingPage.bangalirChintaData?.order_section_title_bn ?? 'সংগ্রহ ও অর্ডারের নিয়মাবলী'}
                onChange={(e) => updateField('order_section_title_bn', e.target.value)}
                placeholder="সংগ্রহ ও অর্ডারের নিয়মাবলী"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-serif font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'সেকশন শিরোনাম (ইংরেজি)' : 'Section Title (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.order_section_title_en ?? editingPage.bangalirChintaData?.order_section_title_en ?? 'Collection & Order Information'}
                onChange={(e) => updateField('order_section_title_en', e.target.value)}
                placeholder="Collection & Order Information"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-sans font-bold"
              />
            </div>
          </div>

          {/* Order Info Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অর্ডার সংক্রান্ত বিস্তারিত বিবরণ (বাংলা)' : 'Order Guidelines Text (BN)'}
              </label>
              <textarea
                rows={3}
                value={editingPage.collection_info_bn ?? editingPage.bangalirChintaData?.collection_info_bn ?? ''}
                onChange={(e) => updateField('collection_info_bn', e.target.value)}
                placeholder="সম্পূর্ণ সেট, ২০৯ খণ্ড একত্রে অথবা বিষয়ভিত্তিক সেট সংগ্রহ করা যাবে..."
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white leading-relaxed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অর্ডার সংক্রান্ত বিস্তারিত বিবরণ (ইংরেজি)' : 'Order Guidelines Text (EN)'}
              </label>
              <textarea
                rows={3}
                value={editingPage.collection_info_en ?? editingPage.bangalirChintaData?.collection_info_en ?? ''}
                onChange={(e) => updateField('collection_info_en', e.target.value)}
                placeholder="The complete set of 209 volumes or thematic sets can be collected..."
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Hotlines & Sales Center */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অর্ডার হেল্পলাইন নম্বর(সমূহ)' : 'Order Hotline Numbers'}
              </label>
              <input
                type="text"
                value={editingPage.order_hotline ?? editingPage.bangalirChintaData?.order_hotline ?? '০১৭৩০০০০০১৪, ০১৮১৯২৫৫৫৮১'}
                onChange={(e) => updateField('order_hotline', e.target.value)}
                placeholder="০১৭৩০০০০০১৪, ০১৮১৯২৫৫৫৮১"
                className="w-full p-2.5 border border-stone-200 rounded-xl text-xs bg-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অর্ডার হেল্পলাইন লেবেল' : 'Order Hotline Label'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingPage.order_hotline_label_bn ?? editingPage.bangalirChintaData?.order_hotline_label_bn ?? 'অর্ডার হেল্পলাইন:'}
                  onChange={(e) => updateField('order_hotline_label_bn', e.target.value)}
                  placeholder="অর্ডার হেল্পলাইন:"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  value={editingPage.order_hotline_label_en ?? editingPage.bangalirChintaData?.order_hotline_label_en ?? 'Order Hotline:'}
                  onChange={(e) => updateField('order_hotline_label_en', e.target.value)}
                  placeholder="Order Hotline:"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Official Website URL & Button Labels */}
          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#B8862A]/20 space-y-3">
            <div className="font-bold text-xs text-[#B8862A] flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" />
              <span>{language === 'bn' ? 'অফিশিয়াল ওয়েবসাইট পোর্টাল লিংক ও বাটন' : 'Official Web Portal URL & Button'}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">ওয়েবসাইট URL (Official URL)</label>
              <input
                type="text"
                value={editingPage.website_url ?? editingPage.bangalirChintaData?.website_url ?? 'https://bcrs.bskbd.org'}
                onChange={(e) => updateField('website_url', e.target.value)}
                placeholder="https://bcrs.bskbd.org"
                className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">বাটন টেক্সট (বাংলা)</label>
                <input
                  type="text"
                  value={editingPage.website_btn_bn ?? editingPage.bangalirChintaData?.website_btn_bn ?? 'বাঙালির চিন্তা অফিশিয়াল ওয়েবসাইট ভিজিট করুন'}
                  onChange={(e) => updateField('website_btn_bn', e.target.value)}
                  placeholder="বাঙালির চিন্তা অফিশিয়াল ওয়েবসাইট ভিজিট করুন"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white font-serif"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">Button Text (English)</label>
                <input
                  type="text"
                  value={editingPage.website_btn_en ?? editingPage.bangalirChintaData?.website_btn_en ?? 'Visit Official Bangalir Chinta Website'}
                  onChange={(e) => updateField('website_btn_en', e.target.value)}
                  placeholder="Visit Official Bangalir Chinta Website"
                  className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 6: CUSTOM SECTIONS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'custom_sections' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-xs font-bold text-stone-900 font-serif flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#2E5942]" />
                <span>{language === 'bn' ? '৬. অতিরিক্ত কন্টেন্ট সেকশন' : '6. Additional Custom Content Sections'}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                {language === 'bn' ? 'পৃষ্ঠার নিচের দিকে যেকোনো অতিরিক্ত বিবরণ বা ডকুমেন্টেশন অনুচ্ছেদ যোগ করুন।' : 'Add extra descriptive sections or images at the bottom of the page.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const secs = [...(editingPage.sections || [])];
                secs.push({
                  title: 'নতুন অনুচ্ছেদ',
                  content: ['নতুন অনুচ্ছেদের বিস্তারিত বিবরণী এখানে লিখুন।'],
                  image: ''
                });
                updateField('sections', secs);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#234533] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সেকশন যোগ করুন' : 'Add Section'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {(editingPage.sections || []).map((sec: any, secIdx: number) => (
              <div key={secIdx} className="p-4 bg-[#FAF8F3] rounded-xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#2E5942] font-mono">Section #{secIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const secs = (editingPage.sections || []).filter((_: any, i: number) => i !== secIdx);
                      updateField('sections', secs);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-700">সেকশন শিরোনাম (Section Title)</label>
                  <input
                    type="text"
                    value={sec.title || ''}
                    onChange={(e) => {
                      const secs = [...(editingPage.sections || [])];
                      secs[secIdx] = { ...secs[secIdx], title: e.target.value };
                      updateField('sections', secs);
                    }}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-700">অনুচ্ছেদ বিবরণী (Paragraph Content)</label>
                  <textarea
                    rows={3}
                    value={Array.isArray(sec.content) ? sec.content.join('\n\n') : (sec.content || '')}
                    onChange={(e) => {
                      const secs = [...(editingPage.sections || [])];
                      secs[secIdx] = { ...secs[secIdx], content: e.target.value.split('\n\n') };
                      updateField('sections', secs);
                    }}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-700">সেকশন ছবি (ঐচ্ছিক)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={sec.image || ''}
                      onChange={(e) => {
                        const secs = [...(editingPage.sections || [])];
                        secs[secIdx] = { ...secs[secIdx], image: e.target.value };
                        updateField('sections', secs);
                      }}
                      className="flex-1 p-2 border border-stone-200 rounded-lg text-xs bg-white font-mono"
                    />
                    <label className="px-3 py-2 bg-[#2E5942] text-white rounded-lg text-xs font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const up = await uploadImageToServer(f);
                            if (up) {
                              const secs = [...(editingPage.sections || [])];
                              secs[secIdx] = { ...secs[secIdx], image: up };
                              updateField('sections', secs);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
