import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Award, Plus, Trash2, Upload, ExternalLink,
  Layers, Phone, HelpCircle, FileText, ChevronRight, CheckCircle2,
  Info, Eye, Image as ImageIcon, ArrowUp, ArrowDown, BookMarked,
  School, Users, Landmark, Library, Mail, Send
} from 'lucide-react';
import { Language } from '../types';

interface PrimaryTeacherCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (fileOrBase64: any) => Promise<string | null>;
  compressImage?: (file: File) => Promise<string>;
}

export const PrimaryTeacherCMSEditor: React.FC<PrimaryTeacherCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
  compressImage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'hero' | 'stats' | 'overview' | 'books' | 'workflow' | 'gallery' | 'faq' | 'contact' | 'custom_sections'
  >('hero');

  const [expandedBookIdx, setExpandedBookIdx] = useState<number | null>(0);
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(0);
  const [expandedGalleryIdx, setExpandedGalleryIdx] = useState<number | null>(0);
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(0);

  const updateField = (key: string, value: any) => {
    setEditingPage({
      ...editingPage,
      [key]: value,
      primaryTeacherData: {
        ...(editingPage.primaryTeacherData || {}),
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
            primaryTeacherData: {
              ...(editingPage.primaryTeacherData || {}),
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

  const handleBookCoverUpload = async (index: number, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        const books = [...(editingPage.books || editingPage.primaryTeacherData?.books || [])];
        if (books[index]) {
          books[index] = { ...books[index], cover: finalUrl };
          updateField('books', books);
        }
      }
    } catch (err) {
      console.error('Book cover upload failed:', err);
    }
  };

  const handleGalleryPhotoUpload = async (index: number, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        const gallery = [...(editingPage.gallery || editingPage.primaryTeacherData?.gallery || [])];
        if (gallery[index]) {
          gallery[index] = { ...gallery[index], url: finalUrl };
          updateField('gallery', gallery);
        }
      }
    } catch (err) {
      console.error('Gallery photo upload failed:', err);
    }
  };

  const currentBooks = editingPage.books || editingPage.primaryTeacherData?.books || [];
  const currentWorkflow = editingPage.workflow_steps || editingPage.primaryTeacherData?.workflow_steps || [];
  const currentGallery = editingPage.gallery || editingPage.primaryTeacherData?.gallery || [];
  const currentFaqs = editingPage.faqs || editingPage.primaryTeacherData?.faqs || [];

  return (
    <div className="space-y-6 pt-4 border-t border-[#B8862A]/20 text-left">
      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-1.5 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. হিরো ব্যানার ও শিরোনাম', labelEn: '1. Hero Banner & Identity', icon: Sparkles },
          { id: 'stats', labelBn: '২. মূল পরিসংখ্যান ও মেট্রিক্স', labelEn: '2. Key Statistics', icon: Award },
          { id: 'overview', labelBn: '৩. দর্শন, উক্তি ও সারসংক্ষেপ', labelEn: '3. Vision, Quote & Summary', icon: Library },
          { id: 'books', labelBn: `৪. পাঠ্য বইসমূহ (${currentBooks.length}টি)`, labelEn: `4. Reading Books (${currentBooks.length})`, icon: BookOpen },
          { id: 'workflow', labelBn: `৫. বাস্তবায়ন পর্যায় (${currentWorkflow.length}টি)`, labelEn: `5. Workflow Steps (${currentWorkflow.length})`, icon: CheckCircle2 },
          { id: 'gallery', labelBn: `৬. আলোকচিত্র গ্যালারি (${currentGallery.length}টি)`, labelEn: `6. Photo Gallery (${currentGallery.length})`, icon: ImageIcon },
          { id: 'faq', labelBn: `৭. সাধারণ জিজ্ঞাসা (${currentFaqs.length}টি)`, labelEn: `7. FAQs (${currentFaqs.length})`, icon: HelpCircle },
          { id: 'contact', labelBn: '৮. হেল্পডেস্ক ও যোগাযোগ', labelEn: '8. Helpdesk & Contact', icon: Phone },
          { id: 'custom_sections', labelBn: '৯. অতিরিক্ত অনুচ্ছেদ ও তথ্য', labelEn: '9. Custom Sections', icon: FileText }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold font-serif transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#2E5942] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-[#FAF7F2] border border-[#E8DDD0]'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#F0CC7A]' : 'text-[#B8862A]'}`} />
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO BANNER & IDENTITY SUB-TAB                                          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'hero' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '১. হিরো ব্যানার, শিরোনাম ও পরিচিতি' : '1. Hero Banner, Titles & Identity'}</span>
            </h5>
            <span className="text-[11px] bg-[#2E5942]/10 text-[#2E5942] font-semibold px-2 py-0.5 rounded-full">
              ID: primary-teacher
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'কর্মসূচির প্রধান শিরোনাম (বাংলা) *' : 'Program Title (BN) *'}
              </label>
              <input
                type="text"
                value={editingPage.title_bn || editingPage.hero_title_bn || ''}
                onChange={(e) => {
                  setEditingPage({
                    ...editingPage,
                    title_bn: e.target.value,
                    hero_title_bn: e.target.value,
                    primaryTeacherData: {
                      ...(editingPage.primaryTeacherData || {}),
                      hero_title_bn: e.target.value
                    }
                  });
                }}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#2E5942]"
                placeholder="যেমন: প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'কর্মসূচির প্রধান শিরোনাম (English) *' : 'Program Title (EN) *'}
              </label>
              <input
                type="text"
                value={editingPage.title_en || editingPage.hero_title_en || ''}
                onChange={(e) => {
                  setEditingPage({
                    ...editingPage,
                    title_en: e.target.value,
                    hero_title_en: e.target.value,
                    primaryTeacherData: {
                      ...(editingPage.primaryTeacherData || {}),
                      hero_title_en: e.target.value
                    }
                  });
                }}
                className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#2E5942]"
                placeholder="e.g. Primary Teachers Reading Program"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'যৌথ উদ্যোগ ব্যাজ (বাংলা)' : 'Joint Initiative Badge (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_initiative_bn || editingPage.primaryTeacherData?.badge_initiative_bn || ''}
                onChange={(e) => updateField('badge_initiative_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="যৌথ উদ্যোগ: বিসাকে ও প্রাথমিক শিক্ষা অধিদপ্তর (DPE)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'যৌথ উদ্যোগ ব্যাজ (English)' : 'Joint Initiative Badge (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_initiative_en || editingPage.primaryTeacherData?.badge_initiative_en || ''}
                onChange={(e) => updateField('badge_initiative_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Joint Initiative: BSK & DPE"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'প্রতিষ্ঠা সাল ব্যাজ (বাংলা)' : 'Establishment Year Badge (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_est_bn || editingPage.primaryTeacherData?.badge_est_bn || ''}
                onChange={(e) => updateField('badge_est_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="স্থাপিত ২০১০ সাল"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'প্রতিষ্ঠা সাল ব্যাজ (English)' : 'Establishment Year Badge (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.badge_est_en || editingPage.primaryTeacherData?.badge_est_en || ''}
                onChange={(e) => updateField('badge_est_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Est. 2010"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 block">
              {language === 'bn' ? 'হিরো সাবটাইটেল / সারসংক্ষেপ বিবরণ (বাংলা)' : 'Hero Subtitle / Overview (BN)'}
            </label>
            <textarea
              rows={3}
              value={editingPage.hero_subtitle_bn || editingPage.primaryTeacherData?.hero_subtitle_bn || ''}
              onChange={(e) => updateField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#2E5942]"
              placeholder="ভবিষ্যৎ প্রজন্মের বাতিঘর প্রাথমিক শিক্ষকদের চিন্তার পরিধি প্রসারিত..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 block">
              {language === 'bn' ? 'হিরো সাবটাইটেল / সারসংক্ষেপ বিবরণ (English)' : 'Hero Subtitle / Overview (EN)'}
            </label>
            <textarea
              rows={3}
              value={editingPage.hero_subtitle_en || editingPage.primaryTeacherData?.hero_subtitle_en || ''}
              onChange={(e) => updateField('hero_subtitle_en', e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#2E5942]"
              placeholder="A nationwide reading movement initiated in 2010..."
            />
          </div>

          {/* Quick Action Button Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'বই দেখুন বাটন লেবেল (বাংলা)' : 'Explore Books Button (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.btn_books_bn || editingPage.primaryTeacherData?.btn_books_bn || ''}
                onChange={(e) => updateField('btn_books_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="পড়ার বইসমূহ দেখুন"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'বই দেখুন বাটন লেবেল (English)' : 'Explore Books Button (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.btn_books_en || editingPage.primaryTeacherData?.btn_books_en || ''}
                onChange={(e) => updateField('btn_books_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Explore Program Books"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'যোগাযোগ বাটন লেবেল (বাংলা)' : 'Contact Button (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.btn_contact_bn || editingPage.primaryTeacherData?.btn_contact_bn || ''}
                onChange={(e) => updateField('btn_contact_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="যোগাযোগ ও তথ্য কেন্দ্র"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'যোগাযোগ বাটন লেবেল (English)' : 'Contact Button (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.btn_contact_en || editingPage.primaryTeacherData?.btn_contact_en || ''}
                onChange={(e) => updateField('btn_contact_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Inquiry Desk"
              />
            </div>
          </div>

          {/* Banner Cover Image & Real cPanel Upload */}
          <div className="bg-white p-4 rounded-xl border border-stone-300 space-y-3">
            <label className="text-[11px] font-bold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#2E5942]" />
                <span>{language === 'bn' ? 'হিরো ব্যানার কাভার ইমেজ (Hero Banner Cover)' : 'Hero Banner Cover Image'}</span>
              </span>
              <span className="text-[10px] text-stone-400">cPanel Media Upload</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-300 shrink-0 relative group">
                <img
                  src={editingPage.cover_image || editingPage.hero_image || editingPage.primaryTeacherData?.cover_image || '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg'}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={editingPage.cover_image || editingPage.hero_image || editingPage.primaryTeacherData?.cover_image || ''}
                  onChange={(e) => {
                    updateField('cover_image', e.target.value);
                    updateField('hero_image', e.target.value);
                  }}
                  className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-stone-50 font-mono"
                  placeholder="/assets/IMGS/... or https://..."
                />
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সার্ভারে নতুন ছবি আপলোড' : 'Upload New Cover'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('cover_image', file);
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {language === 'bn' ? 'সরাসরি MySQL এবং সার্ভার স্টোরেজে সংরক্ষিত হয়' : 'Stored directly to server storage & SQL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. KEY STATS & METRICS SUB-TAB                                             */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'stats' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '২. মূল পরিসংখ্যান ও প্রভাব মেট্রিক্স' : '2. Key Impact Statistics & Counters'}</span>
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stat 1: PTIs */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-[#2E5942] font-bold text-xs">
                <School className="w-4 h-4" />
                <span>{language === 'bn' ? 'মেট্রিক ১: পিটিআই সেন্টার সংখ্যা' : 'Metric 1: PTI Count'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংখ্যা মান' : 'Value'}</label>
                <input
                  type="text"
                  value={editingPage.stats_pti || editingPage.primaryTeacherData?.stats_pti || ''}
                  onChange={(e) => updateField('stats_pti', e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded text-xs bg-stone-50 font-bold"
                  placeholder="৬৭টি"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (বাংলা)' : 'Label (BN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_pti_label_bn || editingPage.primaryTeacherData?.stats_pti_label_bn || ''}
                    onChange={(e) => updateField('stats_pti_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="পিটিআই (PTI) সেন্টারে সক্রিয়"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (English)' : 'Label (EN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_pti_label_en || editingPage.primaryTeacherData?.stats_pti_label_en || ''}
                    onChange={(e) => updateField('stats_pti_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="Active PTI Centers"
                  />
                </div>
              </div>
            </div>

            {/* Stat 2: Trainees */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-[#2E5942] font-bold text-xs">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'মেট্রিক ২: বার্ষিক শিক্ষক সংখ্যা' : 'Metric 2: Trainees Count'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংখ্যা মান' : 'Value'}</label>
                <input
                  type="text"
                  value={editingPage.stats_teachers || editingPage.primaryTeacherData?.stats_teachers || ''}
                  onChange={(e) => updateField('stats_teachers', e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded text-xs bg-stone-50 font-bold"
                  placeholder="১২,০০০+"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (বাংলা)' : 'Label (BN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_teachers_label_bn || editingPage.primaryTeacherData?.stats_teachers_label_bn || ''}
                    onChange={(e) => updateField('stats_teachers_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="বার্ষিক শিক্ষক অংশগ্রহণকারী"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (English)' : 'Label (EN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_teachers_label_en || editingPage.primaryTeacherData?.stats_teachers_label_en || ''}
                    onChange={(e) => updateField('stats_teachers_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="Annual Educator Trainees"
                  />
                </div>
              </div>
            </div>

            {/* Stat 3: Books */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-[#2E5942] font-bold text-xs">
                <BookMarked className="w-4 h-4" />
                <span>{language === 'bn' ? 'মেট্রিক ৩: পাঠ্য বই সংখ্যা' : 'Metric 3: Assigned Books'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংখ্যা মান' : 'Value'}</label>
                <input
                  type="text"
                  value={editingPage.stats_books || editingPage.primaryTeacherData?.stats_books || ''}
                  onChange={(e) => updateField('stats_books', e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded text-xs bg-stone-50 font-bold"
                  placeholder="১২টি"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (বাংলা)' : 'Label (BN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_books_label_bn || editingPage.primaryTeacherData?.stats_books_label_bn || ''}
                    onChange={(e) => updateField('stats_books_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="বাছাইকৃত পাঠ্য গ্রন্থমালা"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (English)' : 'Label (EN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_books_label_en || editingPage.primaryTeacherData?.stats_books_label_en || ''}
                    onChange={(e) => updateField('stats_books_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="Selected Core Books"
                  />
                </div>
              </div>
            </div>

            {/* Stat 4: Start Year */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-[#2E5942] font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>{language === 'bn' ? 'মেট্রিক ৪: সূচনা সাল / স্থায়িত্ব' : 'Metric 4: Inception Year'}</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সংখ্যা মান' : 'Value'}</label>
                <input
                  type="text"
                  value={editingPage.stats_year || editingPage.primaryTeacherData?.stats_year || ''}
                  onChange={(e) => updateField('stats_year', e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded text-xs bg-stone-50 font-bold"
                  placeholder="২০১০"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (বাংলা)' : 'Label (BN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_year_label_bn || editingPage.primaryTeacherData?.stats_year_label_bn || ''}
                    onChange={(e) => updateField('stats_year_label_bn', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="সফল পরিচালনার বর্ষ"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'লেবেল (English)' : 'Label (EN)'}</label>
                  <input
                    type="text"
                    value={editingPage.stats_year_label_en || editingPage.primaryTeacherData?.stats_year_label_en || ''}
                    onChange={(e) => updateField('stats_year_label_en', e.target.value)}
                    className="w-full p-1.5 border border-stone-300 rounded text-xs"
                    placeholder="Continuously Operating"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. VISION, QUOTE & SUMMARY SUB-TAB                                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'overview' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Library className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৩. দর্শন, উক্তি, বৈশিষ্ট্য ও এক নজরে সারসংক্ষেপ' : '3. Vision, Quote, Features & Summary'}</span>
            </h5>
          </div>

          {/* Vision Heading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'দর্শনের শিরোনাম (বাংলা)' : 'Vision Section Title (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.vision_title_bn || editingPage.primaryTeacherData?.vision_title_bn || ''}
                onChange={(e) => updateField('vision_title_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="কর্মসূচির দর্শন ও গুরুত্ব"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'দর্শনের শিরোনাম (English)' : 'Vision Section Title (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.vision_title_en || editingPage.primaryTeacherData?.vision_title_en || ''}
                onChange={(e) => updateField('vision_title_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Program Vision & Philosophy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'দর্শনের সাবটাইটেল (বাংলা)' : 'Vision Subtitle (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.vision_subtitle_bn || editingPage.primaryTeacherData?.vision_subtitle_bn || ''}
                onChange={(e) => updateField('vision_subtitle_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="আলোকিত প্রাথমিক শিক্ষকই পারেন ভবিষ্যৎ বাংলাদেশকে সুন্দর করে গড়ে তুলতে"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'দর্শনের সাবটাইটেল (English)' : 'Vision Subtitle (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.vision_subtitle_en || editingPage.primaryTeacherData?.vision_subtitle_en || ''}
                onChange={(e) => updateField('vision_subtitle_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Empowering primary educators with broad vision"
              />
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
            <h6 className="text-xs font-bold text-[#2E5942] font-serif">
              {language === 'bn' ? 'অনুপ্রেরণামূলক বাণী / উক্তি বক্স' : 'Inspirational Quote Box'}
            </h6>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'উক্তি বক্তব্য (বাংলা)' : 'Quote Text (BN)'}</label>
              <textarea
                rows={2}
                value={editingPage.quote_text_bn || editingPage.primaryTeacherData?.quote_text_bn || ''}
                onChange={(e) => updateField('quote_text_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded text-xs"
                placeholder="“একটি শিশুর সবচেয়ে বড় বাতিঘর তার প্রাথমিক শিক্ষক...”"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'উক্তি বক্তা (বাংলা)' : 'Author (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.quote_author_bn || editingPage.primaryTeacherData?.quote_author_bn || ''}
                  onChange={(e) => updateField('quote_author_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="— আবদুল্লাহ আবু সায়ীদ (প্রতিষ্ঠাতা, বিশ্বসাহিত্য কেন্দ্র)"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'উক্তি বক্তা (English)' : 'Author (EN)'}</label>
                <input
                  type="text"
                  value={editingPage.quote_author_en || editingPage.primaryTeacherData?.quote_author_en || ''}
                  onChange={(e) => updateField('quote_author_en', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="— Abdullah Abu Sayeed (Founder, Bishwo Shahitto Kendro)"
                />
              </div>
            </div>
          </div>

          {/* 2 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#2E5942] uppercase tracking-wider">Feature 1</span>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.feature1_title_bn || editingPage.primaryTeacherData?.feature1_title_bn || ''}
                  onChange={(e) => updateField('feature1_title_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="১২টি রুচিশীল উৎকৃষ্ট বই"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (BN)'}</label>
                <textarea
                  rows={2}
                  value={editingPage.feature1_desc_bn || editingPage.primaryTeacherData?.feature1_desc_bn || ''}
                  onChange={(e) => updateField('feature1_desc_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="উপন্যাস, গল্প, ইতিহাস ও শিক্ষাদানের নান্দনিক বই সম্বলিত বিশেষ সংগ্রহ।"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] uppercase tracking-wider">Feature 2</span>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.feature2_title_bn || editingPage.primaryTeacherData?.feature2_title_bn || ''}
                  onChange={(e) => updateField('feature2_title_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="একাডেমিক নম্বর ও উপহার"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (BN)'}</label>
                <textarea
                  rows={2}
                  value={editingPage.feature2_desc_bn || editingPage.primaryTeacherData?.feature2_desc_bn || ''}
                  onChange={(e) => updateField('feature2_desc_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="মূল্যায়ন পরীক্ষার সফলতায় নম্বরসহ সুন্দর বই উপহার প্রাপ্তির ব্যবস্থা।"
                />
              </div>
            </div>
          </div>

          {/* Program Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
            <h6 className="text-xs font-bold text-[#1A1207] font-serif border-b pb-1 flex items-center gap-1.5">
              <Library className="w-4 h-4 text-[#2E5942]" />
              <span>{language === 'bn' ? 'এক নজরে কর্মসূচি (সাইডবার সারসংক্ষেপ কার্ড)' : 'Program Summary Sidebar Card'}</span>
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'অংশগ্রহণকারী (বাংলা)' : 'Participants (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.summary_participants_bn || editingPage.primaryTeacherData?.summary_participants_bn || ''}
                  onChange={(e) => updateField('summary_participants_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="সকল পিটিআই প্রশিক্ষণার্থী শিক্ষক"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বাস্তবায়ন স্থান (বাংলা)' : 'Location (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.summary_location_bn || editingPage.primaryTeacherData?.summary_location_bn || ''}
                  onChange={(e) => updateField('summary_location_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="বাংলাদেশের ৬৭টি সরকারি-বেসরকারি পিটিআই"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'যৌথ পরিচালনায় (বাংলা)' : 'Organizers (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.summary_organizers_bn || editingPage.primaryTeacherData?.summary_organizers_bn || ''}
                  onChange={(e) => updateField('summary_organizers_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="বিশ্বসাহিত্য কেন্দ্র ও প্রাথমিক শিক্ষা অধিদপ্তর"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'বার্ষিক সময়সীমা (বাংলা)' : 'Cycle (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.summary_cycle_bn || editingPage.primaryTeacherData?.summary_cycle_bn || ''}
                  onChange={(e) => updateField('summary_cycle_bn', e.target.value)}
                  className="w-full p-1.5 border border-stone-300 rounded text-xs"
                  placeholder="পিটিআই শিক্ষাবর্ষ অনুযায়ী ১ বছর"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. CURATED READING BOOKS LIST SUB-TAB                                      */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'books' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? `৪. বাছাইকৃত পাঠ্য বইসমূহ (${currentBooks.length}টি)` : `4. Curated Reading Books (${currentBooks.length})`}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? 'প্রতিটি বইয়ের নাম, লেখক, কাভার ইমেজ ও বিস্তারিত বিবরণ' : 'Book title, author, cover image, and syllabus description'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newBook = {
                  id: `b_${Date.now()}`,
                  titleBn: 'নতুন বইয়ের শিরোনাম',
                  titleEn: 'New Book Title',
                  authorBn: 'লেখকের নাম',
                  authorEn: 'Author Name',
                  cover: '/assets/IMGS/482961231_1052017300283084_4946044543018534392_n.jpg',
                  descBn: 'বইটির মূল্যায়ন ও সারসংক্ষেপ এখানে লিখুন।',
                  descEn: 'Write the book summary and pedagogical insight here.'
                };
                const updated = [...currentBooks, newBook];
                updateField('books', updated);
                setExpandedBookIdx(updated.length - 1);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন বই যোগ করুন' : 'Add Book'}</span>
            </button>
          </div>

          {/* Books Header Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Heading (BN)'}</label>
              <input
                type="text"
                value={editingPage.books_heading_bn || editingPage.primaryTeacherData?.books_heading_bn || ''}
                onChange={(e) => updateField('books_heading_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="কর্মসূচিতে পঠিত বইসমূহ"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন সাবটাইটেল (বাংলা)' : 'Section Subtitle (BN)'}</label>
              <input
                type="text"
                value={editingPage.books_subtitle_bn || editingPage.primaryTeacherData?.books_subtitle_bn || ''}
                onChange={(e) => updateField('books_subtitle_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="প্রশিক্ষণার্থী শিক্ষকদের জন্য নির্ধারিত ১২টি বাছাইকৃত বই"
              />
            </div>
          </div>

          {/* Books Accordion List */}
          <div className="space-y-3">
            {currentBooks.map((book: any, idx: number) => {
              const isExpanded = expandedBookIdx === idx;
              return (
                <div
                  key={book.id || idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() => setExpandedBookIdx(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2]/50 transition border-b border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#2E5942]/10 text-[#2E5942] text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div className="w-10 h-12 rounded overflow-hidden bg-stone-100 border shrink-0">
                        <img
                          src={book.cover || '/assets/IMGS/482961231_1052017300283084_4946044543018534392_n.jpg'}
                          alt={book.titleBn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900 font-serif">
                          {book.titleBn || book.title_bn || `Book #${idx + 1}`}
                        </h6>
                        <p className="text-[10px] text-[#B8862A] font-medium">
                          {book.authorBn || book.author_bn || 'Author'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx > 0) {
                            const updated = [...currentBooks];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            updateField('books', updated);
                            setExpandedBookIdx(idx - 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={idx === currentBooks.length - 1}
                        onClick={() => {
                          if (idx < currentBooks.length - 1) {
                            const updated = [...currentBooks];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            updateField('books', updated);
                            setExpandedBookIdx(idx + 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete book "${book.titleBn || `Book #${idx + 1}`}"?`)) {
                            const updated = currentBooks.filter((_: any, i: number) => i !== idx);
                            updateField('books', updated);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-stone-400 text-xs ml-1 font-bold">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Book Editor Form */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 bg-[#FAF7F2]/30 text-left border-t border-stone-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'বইয়ের শিরোনাম (বাংলা) *' : 'Book Title (BN) *'}
                          </label>
                          <input
                            type="text"
                            value={book.titleBn || book.title_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], titleBn: e.target.value, title_bn: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="যেমন: পথের পাঁচালী"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'বইয়ের শিরোনাম (English) *' : 'Book Title (EN) *'}
                          </label>
                          <input
                            type="text"
                            value={book.titleEn || book.title_en || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], titleEn: e.target.value, title_en: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="e.g. Pather Panchali"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'লেখক / অনুবাদক (বাংলা)' : 'Author / Translator (BN)'}
                          </label>
                          <input
                            type="text"
                            value={book.authorBn || book.author_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], authorBn: e.target.value, author_bn: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="যেমন: বিভূতিভূষণ বন্দ্যোপাধ্যায়"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'লেখক / অনুবাদক (English)' : 'Author / Translator (EN)'}
                          </label>
                          <input
                            type="text"
                            value={book.authorEn || book.author_en || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], authorEn: e.target.value, author_en: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="e.g. Bibhutibhushan Bandyopadhyay"
                          />
                        </div>
                      </div>

                      {/* Book Cover Image & Upload */}
                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                        <label className="text-[10px] font-bold text-stone-700 block">
                          {language === 'bn' ? 'বইয়ের প্রচ্ছদ ছবি (Cover URL / Upload)' : 'Book Cover Image'}
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-16 h-20 rounded bg-stone-100 border shrink-0 overflow-hidden">
                            <img
                              src={book.cover || '/assets/IMGS/482961231_1052017300283084_4946044543018534392_n.jpg'}
                              alt="Cover"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 w-full space-y-1.5">
                            <input
                              type="text"
                              value={book.cover || ''}
                              onChange={(e) => {
                                const updated = [...currentBooks];
                                updated[idx] = { ...updated[idx], cover: e.target.value };
                                updateField('books', updated);
                              }}
                              className="w-full p-1.5 border border-stone-300 rounded text-xs font-mono"
                              placeholder="/assets/IMGS/... or https://..."
                            />
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-lg text-xs font-bold cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>{language === 'bn' ? 'প্রচ্ছদ আপলোড' : 'Upload Cover'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleBookCoverUpload(idx, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'বইয়ের পরিচিতি / মূল্যায়ন (বাংলা)' : 'Book Description (BN)'}
                          </label>
                          <textarea
                            rows={3}
                            value={book.descBn || book.desc_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], descBn: e.target.value, desc_bn: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="বাঙালি জীবনের সহজ-সরল রূপকথা ও প্রকৃতির নিখাদ অনুভূতির কালজয়ী উপন্যাস..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'বইয়ের পরিচিতি / মূল্যায়ন (English)' : 'Book Description (EN)'}
                          </label>
                          <textarea
                            rows={3}
                            value={book.descEn || book.desc_en || ''}
                            onChange={(e) => {
                              const updated = [...currentBooks];
                              updated[idx] = { ...updated[idx], descEn: e.target.value, desc_en: e.target.value };
                              updateField('books', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="A timeless classic exploring rural Bengal, human relations, and nature's innocence."
                          />
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 5. WORKFLOW & EVALUATION STEPS SUB-TAB                                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'workflow' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? `৫. বাস্তবায়ন ও মূল্যায়ন পর্যায় (${currentWorkflow.length}টি ধাপ)` : `5. Workflow & Evaluation Steps (${currentWorkflow.length})`}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? 'পিটিআই সমাপনী বর্ষে বইপড়া পরিচালনার প্রতিটি ধাপের শিরোনাম ও বিবরণ' : 'Step-by-step methodology followed across all 67 PTIs'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newStep = {
                  step: `০${currentWorkflow.length + 1}`,
                  titleBn: 'নতুন পর্যায় বা ধাপ',
                  titleEn: 'New Workflow Step',
                  descBn: 'এই ধাপের বাস্তবায়ন ও মূল্যায়ন বিবরণ এখানে লিখুন।',
                  descEn: 'Write the step implementation and evaluation details here.'
                };
                const updated = [...currentWorkflow, newStep];
                updateField('workflow_steps', updated);
                setExpandedStepIdx(updated.length - 1);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন ধাপ যোগ করুন' : 'Add Step'}</span>
            </button>
          </div>

          {/* Workflow Header Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম (বাংলা)' : 'Section Heading (BN)'}</label>
              <input
                type="text"
                value={editingPage.workflow_heading_bn || editingPage.primaryTeacherData?.workflow_heading_bn || ''}
                onChange={(e) => updateField('workflow_heading_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="বাস্তবায়ন ও মূল্যায়ন পর্যায়সমূহ"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন সাবটাইটেল (বাংলা)' : 'Section Subtitle (BN)'}</label>
              <input
                type="text"
                value={editingPage.workflow_subtitle_bn || editingPage.primaryTeacherData?.workflow_subtitle_bn || ''}
                onChange={(e) => updateField('workflow_subtitle_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="পিটিআই সমাপনী বর্ষে বইপড়া পরিচালনার পূর্ণাঙ্গ প্রক্রিয়া"
              />
            </div>
          </div>

          {/* Workflow Steps List */}
          <div className="space-y-3">
            {currentWorkflow.map((st: any, idx: number) => {
              const isExpanded = expandedStepIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2]/50 transition border-b border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#2E5942] text-[#F0CC7A] text-xs font-bold font-serif flex items-center justify-center shadow-xs">
                        {st.step || `০${idx + 1}`}
                      </span>
                      <div>
                        <h6 className="text-xs font-bold text-stone-900 font-serif">
                          {st.titleBn || st.title_bn || `Step #${idx + 1}`}
                        </h6>
                        <p className="text-[10px] text-stone-500 line-clamp-1">
                          {st.descBn || st.desc_bn || ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx > 0) {
                            const updated = [...currentWorkflow];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            updateField('workflow_steps', updated);
                            setExpandedStepIdx(idx - 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === currentWorkflow.length - 1}
                        onClick={() => {
                          if (idx < currentWorkflow.length - 1) {
                            const updated = [...currentWorkflow];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            updateField('workflow_steps', updated);
                            setExpandedStepIdx(idx + 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete step "${st.titleBn || `Step #${idx + 1}`}"?`)) {
                            const updated = currentWorkflow.filter((_: any, i: number) => i !== idx);
                            updateField('workflow_steps', updated);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-stone-400 text-xs ml-1 font-bold">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-[#FAF7F2]/30 text-left border-t border-stone-100">
                      <div className="w-32 space-y-1">
                        <label className="text-[10px] font-bold text-stone-700 block">
                          {language === 'bn' ? 'ধাপ নম্বর / কোড' : 'Step Number'}
                        </label>
                        <input
                          type="text"
                          value={st.step || ''}
                          onChange={(e) => {
                            const updated = [...currentWorkflow];
                            updated[idx] = { ...updated[idx], step: e.target.value };
                            updateField('workflow_steps', updated);
                          }}
                          className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white font-bold font-serif text-center"
                          placeholder="০১"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'ধাপের নাম (বাংলা) *' : 'Step Title (BN) *'}
                          </label>
                          <input
                            type="text"
                            value={st.titleBn || st.title_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentWorkflow];
                              updated[idx] = { ...updated[idx], titleBn: e.target.value, title_bn: e.target.value };
                              updateField('workflow_steps', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="যেমন: বই সেট নির্বাচন ও পিটিআই প্রেরণ"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'ধাপের নাম (English) *' : 'Step Title (EN) *'}
                          </label>
                          <input
                            type="text"
                            value={st.titleEn || st.title_en || ''}
                            onChange={(e) => {
                              const updated = [...currentWorkflow];
                              updated[idx] = { ...updated[idx], titleEn: e.target.value, title_en: e.target.value };
                              updateField('workflow_steps', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="e.g. Book Selection & Dispatch"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'ধাপের বিবরণ (বাংলা)' : 'Step Description (BN)'}
                          </label>
                          <textarea
                            rows={3}
                            value={st.descBn || st.desc_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentWorkflow];
                              updated[idx] = { ...updated[idx], descBn: e.target.value, desc_bn: e.target.value };
                              updateField('workflow_steps', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="প্রতিটি পিটিআই-এর লাইব্রেরি ও শিক্ষার্থীদের জন্য ১২টি নির্বাচিত উৎকৃষ্ট বইয়ের সেট..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'ধাপের বিবরণ (English)' : 'Step Description (EN)'}
                          </label>
                          <textarea
                            rows={3}
                            value={st.descEn || st.desc_en || ''}
                            onChange={(e) => {
                              const updated = [...currentWorkflow];
                              updated[idx] = { ...updated[idx], descEn: e.target.value, desc_en: e.target.value };
                              updateField('workflow_steps', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="Sets of 12 selected titles dispatched directly to PTI libraries."
                          />
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 6. PHOTO GALLERY ARCHIVES SUB-TAB                                          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'gallery' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? `৬. আলোকচিত্র গ্যালারি ও স্মারক (${currentGallery.length}টি)` : `6. Photo Archives & Gallery (${currentGallery.length})`}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? 'পিটিআই সেমিনার, মূল্যায়ন ও বই বিতরণ অনুষ্ঠানের স্থিরচিত্র' : 'Visual moments from PTI seminars and ceremonies'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem = {
                  url: '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg',
                  captionBn: 'নতুন পিটিআই সেমিনার ও বই বিতরণ অনুষ্ঠান',
                  captionEn: 'New PTI Seminar & Book Distribution'
                };
                const updated = [...currentGallery, newItem];
                updateField('gallery', updated);
                setExpandedGalleryIdx(updated.length - 1);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন ছবি যোগ করুন' : 'Add Photo'}</span>
            </button>
          </div>

          {/* Gallery Header Labels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'গ্যালারি শিরোনাম (বাংলা)' : 'Gallery Title (BN)'}</label>
              <input
                type="text"
                value={editingPage.gallery_heading_bn || editingPage.primaryTeacherData?.gallery_heading_bn || ''}
                onChange={(e) => updateField('gallery_heading_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="আলোকচিত্র গ্যালারি"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'গ্যালারি সাবটাইটেল (বাংলা)' : 'Gallery Subtitle (BN)'}</label>
              <input
                type="text"
                value={editingPage.gallery_subtitle_bn || editingPage.primaryTeacherData?.gallery_subtitle_bn || ''}
                onChange={(e) => updateField('gallery_subtitle_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                placeholder="পিটিআই সেমিনার, বই উপহার বিতরণ ও শিক্ষকদের অংশগ্রহণের স্থিরচিত্র"
              />
            </div>
          </div>

          {/* Gallery Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentGallery.map((item: any, idx: number) => {
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-[#2E5942] font-mono">Photo #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx > 0) {
                            const updated = [...currentGallery];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            updateField('gallery', updated);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentGallery.length - 1}
                        onClick={() => {
                          if (idx < currentGallery.length - 1) {
                            const updated = [...currentGallery];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            updateField('gallery', updated);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete photo #${idx + 1}?`)) {
                            const updated = currentGallery.filter((_: any, i: number) => i !== idx);
                            updateField('gallery', updated);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100 border relative group">
                    <img
                      src={item.url || '/assets/IMGS/704955917_1403269678491176_3561834860714546840_n.jpg'}
                      alt={item.captionBn}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.url || ''}
                        onChange={(e) => {
                          const updated = [...currentGallery];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          updateField('gallery', updated);
                        }}
                        className="w-full p-1.5 border border-stone-300 rounded text-xs font-mono"
                        placeholder="/assets/IMGS/... or https://..."
                      />
                      <label className="p-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleGalleryPhotoUpload(idx, file);
                          }}
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ছবির ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                      <input
                        type="text"
                        value={item.captionBn || item.caption_bn || ''}
                        onChange={(e) => {
                          const updated = [...currentGallery];
                          updated[idx] = { ...updated[idx], captionBn: e.target.value, caption_bn: e.target.value };
                          updateField('gallery', updated);
                        }}
                        className="w-full p-1.5 border border-stone-300 rounded text-xs"
                        placeholder="শিক্ষকদের নিয়ে আয়োজিত বইপড়া সেমিনার..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'ছবির ক্যাপশন (English)' : 'Caption (EN)'}</label>
                      <input
                        type="text"
                        value={item.captionEn || item.caption_en || ''}
                        onChange={(e) => {
                          const updated = [...currentGallery];
                          updated[idx] = { ...updated[idx], captionEn: e.target.value, caption_en: e.target.value };
                          updateField('gallery', updated);
                        }}
                        className="w-full p-1.5 border border-stone-300 rounded text-xs"
                        placeholder="Teacher Book Reading Seminar..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 7. FREQUENTLY ASKED QUESTIONS SUB-TAB                                      */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'faq' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? `৭. সাধারণ জিজ্ঞাসা ও নির্দেশিকা (${currentFaqs.length}টি প্রশ্ন)` : `7. FAQs & Guidelines (${currentFaqs.length})`}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? 'পিটিআই শিক্ষক ও সমন্বয়কদের প্রয়োজনীয় প্রশ্নের উত্তর' : 'Questions and answers for trainees and coordinators'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newFaq = {
                  qBn: 'নতুন সাধারণ প্রশ্ন এখানে লিখুন?',
                  qEn: 'Write new question here?',
                  aBn: 'উত্তরের বিস্তারিত বিবরণ এখানে লিখুন।',
                  aEn: 'Write detailed answer here.'
                };
                const updated = [...currentFaqs, newFaq];
                updateField('faqs', updated);
                setExpandedFaqIdx(updated.length - 1);
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন প্রশ্ন যোগ করুন' : 'Add FAQ'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentFaqs.map((faq: any, idx: number) => {
              const isExpanded = expandedFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() => setExpandedFaqIdx(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2]/50 transition border-b border-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#2E5942]/10 text-[#2E5942] text-xs font-bold flex items-center justify-center font-mono">
                        Q{idx + 1}
                      </span>
                      <h6 className="text-xs font-bold text-stone-900 font-serif line-clamp-1">
                        {faq.qBn || faq.question_bn || `FAQ #${idx + 1}`}
                      </h6>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx > 0) {
                            const updated = [...currentFaqs];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            updateField('faqs', updated);
                            setExpandedFaqIdx(idx - 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentFaqs.length - 1}
                        onClick={() => {
                          if (idx < currentFaqs.length - 1) {
                            const updated = [...currentFaqs];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            updateField('faqs', updated);
                            setExpandedFaqIdx(idx + 1);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete FAQ #${idx + 1}?`)) {
                            const updated = currentFaqs.filter((_: any, i: number) => i !== idx);
                            updateField('faqs', updated);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-stone-400 text-xs ml-1 font-bold">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-[#FAF7F2]/30 text-left border-t border-stone-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'প্রশ্ন (বাংলা) *' : 'Question (BN) *'}
                          </label>
                          <input
                            type="text"
                            value={faq.qBn || faq.question_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentFaqs];
                              updated[idx] = { ...updated[idx], qBn: e.target.value, question_bn: e.target.value };
                              updateField('faqs', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="যেমন: প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচির মূল লক্ষ্য কী?"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'প্রশ্ন (English) *' : 'Question (EN) *'}
                          </label>
                          <input
                            type="text"
                            value={faq.qEn || faq.question_en || ''}
                            onChange={(e) => {
                              const updated = [...currentFaqs];
                              updated[idx] = { ...updated[idx], qEn: e.target.value, question_en: e.target.value };
                              updateField('faqs', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="e.g. What is the core objective of the Primary Teacher Program?"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'উত্তর (বাংলা) *' : 'Answer (BN) *'}
                          </label>
                          <textarea
                            rows={3}
                            value={faq.aBn || faq.answer_bn || ''}
                            onChange={(e) => {
                              const updated = [...currentFaqs];
                              updated[idx] = { ...updated[idx], aBn: e.target.value, answer_bn: e.target.value };
                              updateField('faqs', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="শিক্ষকের মনকে রুচিস্নিগ্ধ ও উন্নত করে তোলা গেলে..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-700 block">
                            {language === 'bn' ? 'উত্তর (English) *' : 'Answer (EN) *'}
                          </label>
                          <textarea
                            rows={3}
                            value={faq.aEn || faq.answer_en || ''}
                            onChange={(e) => {
                              const updated = [...currentFaqs];
                              updated[idx] = { ...updated[idx], aEn: e.target.value, answer_en: e.target.value };
                              updateField('faqs', updated);
                            }}
                            className="w-full p-2 border border-stone-300 rounded text-xs bg-white"
                            placeholder="To nurture noble thoughts, sensitivity, and intellectual refinement..."
                          />
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

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 8. CONTACT & INQUIRY DESK SUB-TAB                                          */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'contact' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৮. হেল্পডেস্ক, পিটিআই ডেস্ক ও যোগাযোগ' : '8. Helpdesk, PTI Desk & Contact Info'}</span>
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'ডেস্ক শিরোনাম (বাংলা)' : 'Desk Title (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.contact_title_bn || editingPage.primaryTeacherData?.contact_title_bn || ''}
                onChange={(e) => updateField('contact_title_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="পিটিআই ডেস্কে যোগাযোগ"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'ডেস্ক শিরোনাম (English)' : 'Desk Title (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.contact_title_en || editingPage.primaryTeacherData?.contact_title_en || ''}
                onChange={(e) => updateField('contact_title_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="PTI Program Desk"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'ফোন / হটলাইন নম্বর' : 'Phone / Hotline'}
              </label>
              <input
                type="text"
                value={editingPage.contact_phone || editingPage.primaryTeacherData?.contact_phone || ''}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="+৮৮০-২-৯৬৬১১৮৮ (এক্সটেনশন: ১০৮)"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'}
              </label>
              <input
                type="email"
                value={editingPage.contact_email || editingPage.primaryTeacherData?.contact_email || ''}
                onChange={(e) => updateField('contact_email', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="primary@bskbd.org"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'কেন্দ্রীয় কার্যালয়ের ঠিকানা (বাংলা)' : 'Headquarters Address (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.contact_hq_bn || editingPage.primaryTeacherData?.contact_hq_bn || ''}
                onChange={(e) => updateField('contact_hq_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="বিশ্বসাহিত্য কেন্দ্র ভবন, ১৪ নম্বর সংগ্রাহক রোড, বাংলামোটর, ঢাকা।"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'কেন্দ্রীয় কার্যালয়ের ঠিকানা (English)' : 'Headquarters Address (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.contact_hq_en || editingPage.primaryTeacherData?.contact_hq_en || ''}
                onChange={(e) => updateField('contact_hq_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Bishwo Shahitto Kendro Bhaban, 14 Shongrahok Road, Banglamotor, Dhaka."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অনুসন্ধান ফরম শিরোনাম (বাংলা)' : 'Inquiry Form Title (BN)'}
              </label>
              <input
                type="text"
                value={editingPage.inquiry_title_bn || editingPage.primaryTeacherData?.inquiry_title_bn || ''}
                onChange={(e) => updateField('inquiry_title_bn', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="পিটিআই বা শিক্ষক অনুসন্ধানী তথ্য বার্তা"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 block">
                {language === 'bn' ? 'অনুসন্ধান ফরম শিরোনাম (English)' : 'Inquiry Form Title (EN)'}
              </label>
              <input
                type="text"
                value={editingPage.inquiry_title_en || editingPage.primaryTeacherData?.inquiry_title_en || ''}
                onChange={(e) => updateField('inquiry_title_en', e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-xl text-xs bg-white"
                placeholder="Send Inquiry Message"
              />
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 9. CUSTOM SECTIONS & DOCUMENTATION SUB-TAB                                 */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'custom_sections' && (
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B8862A]" />
                <span>{language === 'bn' ? '৯. অতিরিক্ত অনুচ্ছেদ ও প্রামাণ্য বিবরণী' : '9. Custom Content Sections & Paragraphs'}</span>
              </h5>
              <p className="text-[11px] text-stone-500 font-sans">
                {language === 'bn' ? 'কর্মসূচির ওভারভিউতে প্রদর্শনের জন্য কাস্টম প্যারাগ্রাফ ও অধ্যায়' : 'Custom narrative paragraphs displayed on the overview tab'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const currentSecs = Array.isArray(editingPage.sections) ? editingPage.sections : [];
                const updated = [...currentSecs, { title: 'নতুন অনুচ্ছেদ শিরোনাম', content: ['প্রথম অনুচ্ছেদ বিবরণী।'] }];
                setEditingPage({ ...editingPage, sections: updated });
              }}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন সেকশন যোগ করুন' : 'Add Section'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {(Array.isArray(editingPage.sections) ? editingPage.sections : []).map((sec: any, sIdx: number) => (
              <div key={sIdx} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-[#2E5942]">Section #{sIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (Array.isArray(editingPage.sections) ? editingPage.sections : []).filter((_: any, i: number) => i !== sIdx);
                      setEditingPage({ ...editingPage, sections: updated });
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সেকশন মুছুন' : 'Remove'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-600 block">{language === 'bn' ? 'সেকশন শিরোনাম' : 'Section Title'}</label>
                  <input
                    type="text"
                    value={sec.title || ''}
                    onChange={(e) => {
                      const updated = [...(Array.isArray(editingPage.sections) ? editingPage.sections : [])];
                      updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                      setEditingPage({ ...editingPage, sections: updated });
                    }}
                    className="w-full p-2 border border-stone-300 rounded text-xs"
                    placeholder="যেমন: কর্মসূচির দর্শন ও বাস্তবায়ন..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-600 flex items-center justify-between">
                    <span>{language === 'bn' ? 'অনুচ্ছেদসমূহ (Paragraphs)' : 'Paragraphs'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(Array.isArray(editingPage.sections) ? editingPage.sections : [])];
                        const paras = [...(updated[sIdx].content || [])];
                        paras.push('নতুন অনুচ্ছেদ বিবরণী।');
                        updated[sIdx] = { ...updated[sIdx], content: paras };
                        setEditingPage({ ...editingPage, sections: updated });
                      }}
                      className="text-[#2E5942] hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{language === 'bn' ? 'অনুচ্ছেদ যোগ' : 'Add Paragraph'}</span>
                    </button>
                  </label>

                  {(sec.content || []).map((para: string, pIdx: number) => (
                    <div key={pIdx} className="flex gap-2 items-start">
                      <textarea
                        rows={2}
                        value={para}
                        onChange={(e) => {
                          const updated = [...(Array.isArray(editingPage.sections) ? editingPage.sections : [])];
                          const paras = [...(updated[sIdx].content || [])];
                          paras[pIdx] = e.target.value;
                          updated[sIdx] = { ...updated[sIdx], content: paras };
                          setEditingPage({ ...editingPage, sections: updated });
                        }}
                        className="flex-1 p-2 border border-stone-300 rounded text-xs"
                        placeholder="অনুচ্ছেদের বিষয়বস্তু লিখুন..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(Array.isArray(editingPage.sections) ? editingPage.sections : [])];
                          const paras = (updated[sIdx].content || []).filter((_: any, i: number) => i !== pIdx);
                          updated[sIdx] = { ...updated[sIdx], content: paras };
                          setEditingPage({ ...editingPage, sections: updated });
                        }}
                        className="text-stone-400 hover:text-red-500 p-1.5 cursor-pointer mt-1"
                        title="Delete Paragraph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
