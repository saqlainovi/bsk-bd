import React, { useState } from 'react';
import { 
  Truck, BookOpen, Calendar, ShieldAlert, FileText, HelpCircle, 
  Sparkles, Award, Compass, Plus, Trash2, Upload, ExternalLink,
  Layers, MapPin, Clock, Phone, Mail, CheckCircle2, ChevronRight,
  ArrowRight, Search, Info
} from 'lucide-react';
import { Language } from '../types';

interface MobileLibraryCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (fileOrBase64: any) => Promise<string | null>;
  compressImage?: (file: File) => Promise<string>;
}

export const MobileLibraryCMSEditor: React.FC<MobileLibraryCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
  compressImage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'hero' | 'stats' | 'tabs_nav' | 'overview' | 'fleet' | 'schedule' | 'membership' | 'apply_form' | 'faq_contact'
  >('hero');

  const updateField = (key: string, value: any) => {
    setEditingPage({
      ...editingPage,
      [key]: value
    });
  };

  const handleImageUpload = async (fieldKey: string, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        updateField(fieldKey, finalUrl);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleArrayItemImageUpload = async (arrayKey: string, index: number, imagePropKey: string, file: File) => {
    try {
      const uploaded = await uploadImageToServer(file);
      const finalUrl = uploaded || (compressImage ? await compressImage(file) : '');
      if (finalUrl) {
        const arr = [...(editingPage[arrayKey] || [])];
        if (arr[index]) {
          arr[index] = { ...arr[index], [imagePropKey]: finalUrl };
          updateField(arrayKey, arr);
        }
      }
    } catch (err) {
      console.error('Array image upload failed:', err);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#B8862A]/20 text-left">
      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-1.5 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. হিরো ব্যানার ও স্লোগান', labelEn: '1. Hero Banner & Identity', icon: Sparkles },
          { id: 'stats', labelBn: '২. প্রভাব ও পরিসংখ্যান', labelEn: '2. Key Impact Stats', icon: Award },
          { id: 'tabs_nav', labelBn: '৩. ট্যাব নেভিগেশন', labelEn: '3. Tabs Navigation Labels', icon: Layers },
          { id: 'overview', labelBn: '৪. পরিচিতি ও কার্যপ্রণালী', labelEn: '4. Overview & How It Works', icon: Compass },
          { id: 'fleet', labelBn: '৫. বাস বহর (৭ ক্যাটাগরি)', labelEn: '5. Bus Fleet (7 Categories)', icon: Truck },
          { id: 'schedule', labelBn: '৬. স্পট ও সময়সূচি', labelEn: '6. Spots & Schedules', icon: Calendar },
          { id: 'membership', labelBn: '৭. সদস্যপদ ও জামানত', labelEn: '7. Membership Tiers & Rules', icon: ShieldAlert },
          { id: 'apply_form', labelBn: '৮. অনলাইন আবেদন ফরম', labelEn: '8. Application Form Labels', icon: FileText },
          { id: 'faq_contact', labelBn: '৯. প্রশ্নোত্তর ও হেল্পলাইন', labelEn: '9. FAQ & Helpline', icon: HelpCircle },
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
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-5">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
            <Sparkles className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '১. হিরো ব্যানার, স্লোগান ও পরিচিতি' : '1. Hero Banner, Tagline & Officer'}</span>
          </h5>

          {/* Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ লেখা (বাংলা)' : 'Badge Text (BN)'}</label>
              <input
                type="text"
                value={editingPage.badge_bn || ''}
                onChange={(e) => updateField('badge_bn', e.target.value)}
                placeholder="দেশব্যাপী ৬৪ জেলায় দোরগোড়ায় বই"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ব্যাজ লেখা (ইংরেজি)' : 'Badge Text (EN)'}</label>
              <input
                type="text"
                value={editingPage.badge_en || ''}
                onChange={(e) => updateField('badge_en', e.target.value)}
                placeholder="64 Districts Mobile Library Fleet"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (বাংলা)' : 'Hero Title (BN)'}</label>
              <input
                type="text"
                value={editingPage.title_bn || ''}
                onChange={(e) => updateField('title_bn', e.target.value)}
                placeholder="ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রধান শিরোনাম (ইংরেজি)' : 'Hero Title (EN)'}</label>
              <input
                type="text"
                value={editingPage.title_en || ''}
                onChange={(e) => updateField('title_en', e.target.value)}
                placeholder="Mobile Library Program"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans font-bold"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'উপ-শিরোনাম / বাণী (বাংলা)' : 'Subtitle / Quote (BN)'}</label>
              <textarea
                rows={3}
                value={editingPage.subtitle_bn || ''}
                onChange={(e) => updateField('subtitle_bn', e.target.value)}
                placeholder="“মানুষের মনকে আলোকিত করার জন্য বইকে পৌঁছে দেওয়া হচ্ছে মানুষের দোরগোড়ায়।”"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'উপ-শিরোনাম / বাণী (ইংরেজি)' : 'Subtitle / Quote (EN)'}</label>
              <textarea
                rows={3}
                value={editingPage.subtitle_en || ''}
                onChange={(e) => updateField('subtitle_en', e.target.value)}
                placeholder="“Bringing literature right to the doorstep to enlighten minds.”"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'হিরো ব্যাকগ্রাউন্ড ছবি (URL)' : 'Hero Background Image (URL)'}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingPage.hero_image || ''}
                onChange={(e) => updateField('hero_image', e.target.value)}
                placeholder="https://... or /assets/IMGS/..."
                className="p-2 border border-stone-200 rounded text-xs bg-white font-mono flex-1"
              />
              <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('hero_image', file);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Buttons & Links in Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'আবেদন বাটন লেবেল (BN/EN)' : 'Apply Button Label (BN/EN)'}</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={editingPage.apply_btn_label_bn || ''}
                  onChange={(e) => updateField('apply_btn_label_bn', e.target.value)}
                  placeholder="অনলাইন সদস্যপদ নিবন্ধন"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  value={editingPage.apply_btn_label_en || ''}
                  onChange={(e) => updateField('apply_btn_label_en', e.target.value)}
                  placeholder="Apply for Membership"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'স্পট বাটন লেবেল (BN/EN)' : 'Schedule Button Label (BN/EN)'}</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={editingPage.schedule_btn_label_bn || ''}
                  onChange={(e) => updateField('schedule_btn_label_bn', e.target.value)}
                  placeholder="স্পট ও রুট খুঁজুন"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  value={editingPage.schedule_btn_label_en || ''}
                  onChange={(e) => updateField('schedule_btn_label_en', e.target.value)}
                  placeholder="Find Spot & Schedule"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ই-লাইব্রেরি বাটন ও URL' : 'E-Library Button & URL'}</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={editingPage.elibrary_btn_label_bn || ''}
                  onChange={(e) => updateField('elibrary_btn_label_bn', e.target.value)}
                  placeholder="ই-লাইব্রেরি (আলোর পাঠশালা)"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  value={editingPage.elibrary_url || ''}
                  onChange={(e) => updateField('elibrary_url', e.target.value)}
                  placeholder="https://alorpathshala.org"
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right Hero Badge Box Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সূচনা টেক্সট (BN/EN)' : 'Since Text (BN/EN)'}</label>
              <input
                type="text"
                value={editingPage.since_text_bn || ''}
                onChange={(e) => updateField('since_text_bn', e.target.value)}
                placeholder="১৯৯৯ থেকে চলমান"
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white mb-1"
              />
              <input
                type="text"
                value={editingPage.since_text_en || ''}
                onChange={(e) => updateField('since_text_en', e.target.value)}
                placeholder="Operating Since 1999"
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'কর্মকর্তার নাম (BN/EN)' : 'Officer Name (BN/EN)'}</label>
              <input
                type="text"
                value={editingPage.officer_name_bn || ''}
                onChange={(e) => updateField('officer_name_bn', e.target.value)}
                placeholder="উজ্জ্বল হোসেন"
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white mb-1"
              />
              <input
                type="text"
                value={editingPage.officer_name_en || ''}
                onChange={(e) => updateField('officer_name_en', e.target.value)}
                placeholder="Uzzal Hossain"
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'হটলাইন নম্বর' : 'Helpline Number'}</label>
              <input
                type="text"
                value={editingPage.helpline_number || ''}
                onChange={(e) => updateField('helpline_number', e.target.value)}
                placeholder="০১৭১১-৫৩৫৩৯৮"
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 2: CORE IMPACT STATS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'stats' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2">
            <Award className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '২. মূল প্রভাব ও পরিসংখ্যান (৬টি কার্ড)' : '2. Key Impact Statistics (6 Info Cards)'}</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Districts */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 1: Districts</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৬৪টি)"
                value={editingPage.stats_districts_val || ''}
                onChange={(e) => updateField('stats_districts_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (জেলা কভারেজ)"
                value={editingPage.stats_districts_label_bn || ''}
                onChange={(e) => updateField('stats_districts_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Districts Covered)"
                value={editingPage.stats_districts_label_en || ''}
                onChange={(e) => updateField('stats_districts_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            {/* 2. Upazilas */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 2: Upazilas</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৩৬৮টি)"
                value={editingPage.stats_upazilas_val || ''}
                onChange={(e) => updateField('stats_upazilas_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (উপজেলা রুট)"
                value={editingPage.stats_upazilas_label_bn || ''}
                onChange={(e) => updateField('stats_upazilas_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Upazilas Covered)"
                value={editingPage.stats_upazilas_label_en || ''}
                onChange={(e) => updateField('stats_upazilas_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            {/* 3. Spots */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 3: Spots</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৩,২০০টি)"
                value={editingPage.stats_spots_val || ''}
                onChange={(e) => updateField('stats_spots_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (বই লেনদেন স্পট)"
                value={editingPage.stats_spots_label_bn || ''}
                onChange={(e) => updateField('stats_spots_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Reading Spots)"
                value={editingPage.stats_spots_label_en || ''}
                onChange={(e) => updateField('stats_spots_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            {/* 4. Fleet */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 4: Fleet</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৭৬টি)"
                value={editingPage.stats_fleet_val || ''}
                onChange={(e) => updateField('stats_fleet_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (লাইব্রেরি বাস বহর)"
                value={editingPage.stats_fleet_label_bn || ''}
                onChange={(e) => updateField('stats_fleet_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Library Fleet Vehicles)"
                value={editingPage.stats_fleet_label_en || ''}
                onChange={(e) => updateField('stats_fleet_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            {/* 5. Books */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 5: Books</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৪৩ লক্ষ+)"
                value={editingPage.stats_books_val || ''}
                onChange={(e) => updateField('stats_books_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (সংরক্ষিত বই)"
                value={editingPage.stats_books_label_bn || ''}
                onChange={(e) => updateField('stats_books_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Books in Fleet)"
                value={editingPage.stats_books_label_en || ''}
                onChange={(e) => updateField('stats_books_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>

            {/* 6. Active Members */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-[#B8862A] block font-mono">Stat 6: Active Members</span>
              <input
                type="text"
                placeholder="মান (যেমন: ৩,০০,০০০+)"
                value={editingPage.stats_members_val || ''}
                onChange={(e) => updateField('stats_members_val', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="লেবেল BN (সক্রিয় নিবন্ধিত পাঠক)"
                value={editingPage.stats_members_label_bn || ''}
                onChange={(e) => updateField('stats_members_label_bn', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Label EN (Active Members)"
                value={editingPage.stats_members_label_en || ''}
                onChange={(e) => updateField('stats_members_label_en', e.target.value)}
                className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 3: TABS NAVIGATION LABELS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'tabs_nav' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2">
            <Layers className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৩. ওয়েবসাইট পেজের ৬টি প্রধান ট্যাব নেভিগেশন লেবেল' : '3. 6 Primary Tab Navigation Labels'}</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 1: Overview</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="পরিচিতি ও ইতিহাস (BN)"
                  value={editingPage.tab_overview_bn || ''}
                  onChange={(e) => updateField('tab_overview_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Overview & Mission (EN)"
                  value={editingPage.tab_overview_en || ''}
                  onChange={(e) => updateField('tab_overview_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 2: Fleet</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="বাস বহর (৭ ক্যাটাগরি) (BN)"
                  value={editingPage.tab_fleet_bn || ''}
                  onChange={(e) => updateField('tab_fleet_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Bus Fleet Categories (EN)"
                  value={editingPage.tab_fleet_en || ''}
                  onChange={(e) => updateField('tab_fleet_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 3: Schedule</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="স্পট ও রুট সময়সূচি (BN)"
                  value={editingPage.tab_schedule_bn || ''}
                  onChange={(e) => updateField('tab_schedule_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Spots & Schedule (EN)"
                  value={editingPage.tab_schedule_en || ''}
                  onChange={(e) => updateField('tab_schedule_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 4: Membership</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="সদস্যপদ ও জামানত নিয়মাবলী (BN)"
                  value={editingPage.tab_membership_bn || ''}
                  onChange={(e) => updateField('tab_membership_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Membership Rules (EN)"
                  value={editingPage.tab_membership_en || ''}
                  onChange={(e) => updateField('tab_membership_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 5: Apply</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="অনলাইন আবেদন (BN)"
                  value={editingPage.tab_apply_bn || ''}
                  onChange={(e) => updateField('tab_apply_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Apply Online (EN)"
                  value={editingPage.tab_apply_en || ''}
                  onChange={(e) => updateField('tab_apply_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-600 block">Tab 6: FAQ & Contact</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="প্রশ্নোত্তর ও হেল্পলাইন (BN)"
                  value={editingPage.tab_faq_bn || ''}
                  onChange={(e) => updateField('tab_faq_bn', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="FAQ & Contact (EN)"
                  value={editingPage.tab_faq_en || ''}
                  onChange={(e) => updateField('tab_faq_en', e.target.value)}
                  className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 4: OVERVIEW & HOW IT WORKS
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'overview' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-5">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2">
            <Compass className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৪. পরিচিতি, ইতিহাস ও কার্যক্রম পরিচালনার ধাপ' : '4. Overview, Narrative & Step-by-Step Operations'}</span>
          </h5>

          {/* Heading & Paragraphs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ব্যাজ (বাংলা)' : 'Section Badge (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.overview_badge_bn || ''}
                  onChange={(e) => updateField('overview_badge_bn', e.target.value)}
                  placeholder="কর্মসূচির প্রেক্ষাপট ও সূচনার গল্প"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সেকশন ব্যাজ (ইংরেজি)' : 'Section Badge (EN)'}</label>
                <input
                  type="text"
                  value={editingPage.overview_badge_en || ''}
                  onChange={(e) => updateField('overview_badge_en', e.target.value)}
                  placeholder="Program Origins & Evolution"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'পরিচিতি শিরোনাম (বাংলা)' : 'Overview Heading (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.overview_heading_bn || ''}
                  onChange={(e) => updateField('overview_heading_bn', e.target.value)}
                  placeholder="দোরগোড়ায় বই: বাংলাদেশের সবচেয়ে জনপ্রিয় লাল-সবুজ লাইব্রেরি বাস"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-serif font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'পরিচিতি শিরোনাম (ইংরেজি)' : 'Overview Heading (EN)'}</label>
                <input
                  type="text"
                  value={editingPage.overview_heading_en || ''}
                  onChange={(e) => updateField('overview_heading_en', e.target.value)}
                  placeholder="Books at Your Doorstep: Bangladesh’s Iconic Green & Red Library Bus"
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-sans font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রথম অনুচ্ছেদ (বাংলা)' : 'Paragraph 1 (BN)'}</label>
                <textarea
                  rows={4}
                  value={editingPage.overview_p1_bn || ''}
                  onChange={(e) => updateField('overview_p1_bn', e.target.value)}
                  placeholder="বিশ্বসাহিত্য কেন্দ্র ১৯৯৯ সালে নরওয়েজিয়ান সহযোগিতা সংস্থা (NORAD)..."
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'প্রথম অনুচ্ছেদ (ইংরেজি)' : 'Paragraph 1 (EN)'}</label>
                <textarea
                  rows={4}
                  value={editingPage.overview_p1_en || ''}
                  onChange={(e) => updateField('overview_p1_en', e.target.value)}
                  placeholder="Bishwo Shahitto Kendro launched the Mobile Library Program in 1999..."
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'দ্বিতীয় অনুচ্ছেদ (বাংলা)' : 'Paragraph 2 (BN)'}</label>
                <textarea
                  rows={4}
                  value={editingPage.overview_p2_bn || ''}
                  onChange={(e) => updateField('overview_p2_bn', e.target.value)}
                  placeholder="পরবর্তীতে গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা মন্ত্রণালয়..."
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'দ্বিতীয় অনুচ্ছেদ (ইংরেজি)' : 'Paragraph 2 (EN)'}</label>
                <textarea
                  rows={4}
                  value={editingPage.overview_p2_en || ''}
                  onChange={(e) => updateField('overview_p2_en', e.target.value)}
                  placeholder="Subsequently, through three consecutive government co-funded development projects..."
                  className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4 How It Works Steps CRUD */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'কার্যপ্রণালী ধাপসমূহ (How It Works Steps)' : 'How It Works Steps (CRUD)'}</label>
              <button
                type="button"
                onClick={() => {
                  const steps = editingPage.how_it_works_steps || [];
                  const newStep = {
                    num: `${steps.length + 1}`,
                    titleBn: 'নতুন ধাপ',
                    titleEn: 'New Step',
                    descBn: 'ধাপের বিস্তারিত বিবরণ লিখুন।',
                    descEn: 'Detailed description of this step.'
                  };
                  updateField('how_it_works_steps', [...steps, newStep]);
                }}
                className="text-[11px] font-bold text-[#2E5942] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন ধাপ যোগ' : 'Add Step'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(editingPage.how_it_works_steps || []).map((step: any, sIdx: number) => (
                <div key={sIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#B8862A]">Step #{sIdx + 1} (No: {step.num})</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingPage.how_it_works_steps || []).filter((_: any, i: number) => i !== sIdx);
                        updateField('how_it_works_steps', updated);
                      }}
                      className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      {language === 'bn' ? 'মুছুন' : 'Remove'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title BN"
                      value={step.titleBn || ''}
                      onChange={(e) => {
                        const updated = [...(editingPage.how_it_works_steps || [])];
                        updated[sIdx] = { ...updated[sIdx], titleBn: e.target.value };
                        updateField('how_it_works_steps', updated);
                      }}
                      className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Title EN"
                      value={step.titleEn || ''}
                      onChange={(e) => {
                        const updated = [...(editingPage.how_it_works_steps || [])];
                        updated[sIdx] = { ...updated[sIdx], titleEn: e.target.value };
                        updateField('how_it_works_steps', updated);
                      }}
                      className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      placeholder="Desc BN"
                      value={step.descBn || ''}
                      onChange={(e) => {
                        const updated = [...(editingPage.how_it_works_steps || [])];
                        updated[sIdx] = { ...updated[sIdx], descBn: e.target.value };
                        updateField('how_it_works_steps', updated);
                      }}
                      className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Desc EN"
                      value={step.descEn || ''}
                      onChange={(e) => {
                        const updated = [...(editingPage.how_it_works_steps || [])];
                        updated[sIdx] = { ...updated[sIdx], descEn: e.target.value };
                        updateField('how_it_works_steps', updated);
                      }}
                      className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notice Banner */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'প্রকল্প নোটিশ ব্যানার (Notice Box)' : 'Project Status Notice Box'}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Notice Title BN"
                value={editingPage.notice_title_bn || ''}
                onChange={(e) => updateField('notice_title_bn', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="Notice Title EN"
                value={editingPage.notice_title_en || ''}
                onChange={(e) => updateField('notice_title_en', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <textarea
                rows={2}
                placeholder="Notice Desc BN"
                value={editingPage.notice_desc_bn || ''}
                onChange={(e) => updateField('notice_desc_bn', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <textarea
                rows={2}
                placeholder="Notice Desc EN"
                value={editingPage.notice_desc_en || ''}
                onChange={(e) => updateField('notice_desc_en', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 5: BUS FLEET (7 CATEGORIES CRUD)
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'fleet' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৫. লাইব্রেরি বাসের ৭টি বিশেষ ক্যাটাগরি (Bus Fleet CRUD)' : '5. Bus Fleet (7 Categories CRUD)'}</span>
            </h5>
            <button
              type="button"
              onClick={() => {
                const fleet = editingPage.busFleet || [];
                const newBus = {
                  id: `type-${fleet.length + 1}`,
                  titleBn: `টাইপ-${fleet.length + 1}: নতুন লাইব্রেরি যান`,
                  titleEn: `Type-${fleet.length + 1}: New Library Vehicle`,
                  capacityBn: '৫,০০০+ বই',
                  capacityEn: '5,000+ Books',
                  coverageBn: 'নতুন রুট ও কভারেজ এলাকা',
                  coverageEn: 'New routes and coverage area',
                  descBn: 'গাড়ির বিস্তারিত বিবরণ ও সুযোগ-সুবিধা।',
                  descEn: 'Detailed vehicle specs and equipment.',
                  image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop'
                };
                updateField('busFleet', [...fleet, newBus]);
              }}
              className="text-[11px] font-bold text-[#2E5942] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন বাস ক্যাটাগরি যোগ' : 'Add Bus Class'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {(editingPage.busFleet || []).map((bus: any, bIdx: number) => (
              <div key={bIdx} className="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B8862A] font-serif">Vehicle #{bIdx + 1}: {bus.titleBn || bus.titleEn}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.busFleet || []).filter((_: any, i: number) => i !== bIdx);
                      updateField('busFleet', updated);
                    }}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title BN"
                    value={bus.titleBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], titleBn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Title EN"
                    value={bus.titleEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], titleEn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Capacity BN (যেমন: ১৮,০০০+ বই)"
                    value={bus.capacityBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], capacityBn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Capacity EN (e.g. 18,000+ Books)"
                    value={bus.capacityEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], capacityEn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Coverage BN"
                    value={bus.coverageBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], coverageBn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Coverage EN"
                    value={bus.coverageEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], coverageEn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    placeholder="Description BN"
                    value={bus.descBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], descBn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description EN"
                    value={bus.descEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], descEn: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>

                {/* Bus Image Upload */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Bus Image URL"
                    value={bus.image || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.busFleet || [])];
                      updated[bIdx] = { ...updated[bIdx], image: e.target.value };
                      updateField('busFleet', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono flex-1"
                  />
                  <label className="px-2.5 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-[11px] font-bold cursor-pointer shrink-0 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleArrayItemImageUpload('busFleet', bIdx, 'image', file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 6: SPOTS & SCHEDULES CRUD
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৬. স্পট ও রুট সময়সূচি তালিকা (Schedules CRUD)' : '6. Spots & Schedules CRUD'}</span>
            </h5>
            <button
              type="button"
              onClick={() => {
                const scheds = editingPage.schedules || [];
                const newSpot = {
                  division: 'dhaka',
                  districtBn: 'নতুন জেলা',
                  districtEn: 'New District',
                  upazilaBn: 'উপজেলা',
                  upazilaEn: 'Upazila',
                  spotBn: 'স্পট / স্থানের নাম',
                  spotEn: 'Spot Name',
                  dayBn: 'রবিবার',
                  dayEn: 'Sunday',
                  timeBn: 'বিকাল ৩:০০ - ৫:০০',
                  timeEn: '3:00 PM - 5:00 PM',
                  busTypeBn: 'টাইপ-১ (১৮,০০০ বই)',
                  officer: '০১৭১১-০০০০০০'
                };
                updateField('schedules', [...scheds, newSpot]);
              }}
              className="text-[11px] font-bold text-[#2E5942] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন স্পট যোগ' : 'Add Spot'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {(editingPage.schedules || []).map((spot: any, sIdx: number) => (
              <div key={sIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#B8862A] font-mono">Spot #{sIdx + 1}: {spot.districtBn} • {spot.upazilaBn} ({spot.division})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.schedules || []).filter((_: any, i: number) => i !== sIdx);
                      updateField('schedules', updated);
                    }}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select
                    value={spot.division || 'dhaka'}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], division: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  >
                    <option value="dhaka">ঢাকা (Dhaka)</option>
                    <option value="chattogram">চট্টগ্রাম (Chattogram)</option>
                    <option value="rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="khulna">খুলনা (Khulna)</option>
                    <option value="sylhet">সিলেট (Sylhet)</option>
                    <option value="barishal">বরিশাল (Barishal)</option>
                    <option value="rangpur">রংপুর (Rangpur)</option>
                    <option value="mymensingh">ময়মনসিংহ (Mymensingh)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="District BN"
                    value={spot.districtBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], districtBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />

                  <input
                    type="text"
                    placeholder="District EN"
                    value={spot.districtEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], districtEn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />

                  <input
                    type="text"
                    placeholder="Upazila BN"
                    value={spot.upazilaBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], upazilaBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />

                  <input
                    type="text"
                    placeholder="Upazila EN"
                    value={spot.upazilaEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], upazilaEn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Spot BN (রবীন্দ্র সরোবর...)"
                    value={spot.spotBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], spotBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Spot EN"
                    value={spot.spotEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], spotEn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Day BN (রবিবার)"
                    value={spot.dayBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], dayBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Time BN (বিকাল ৩:০০ - ৫:০০)"
                    value={spot.timeBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], timeBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Vehicle Class (টাইপ-১ / ১৮,০০০ বই)"
                    value={spot.busTypeBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], busTypeBn: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Officer Contact (০১৭১১-৫৩৫৩৯৮)"
                    value={spot.officer || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.schedules || [])];
                      updated[sIdx] = { ...updated[sIdx], officer: e.target.value };
                      updateField('schedules', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 7: MEMBERSHIP TIERS & RULES
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'membership' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৭. সদস্যপদ বিভাগ ও জামানতের চার্ট (Membership Tiers)' : '7. Membership Tiers & Refund Policy'}</span>
            </h5>
          </div>

          {/* Heading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Heading (BN)'}</label>
              <input
                type="text"
                value={editingPage.membership_heading_bn || ''}
                onChange={(e) => updateField('membership_heading_bn', e.target.value)}
                placeholder="সদস্যপদ বিভাগ ও জামানতের চার্ট"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Heading (EN)'}</label>
              <input
                type="text"
                value={editingPage.membership_heading_en || ''}
                onChange={(e) => updateField('membership_heading_en', e.target.value)}
                placeholder="4 Membership Deposit Tiers"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
          </div>

          {/* Tiers List */}
          <div className="space-y-3">
            {(editingPage.membershipTiers || []).map((tier: any, tIdx: number) => (
              <div key={tIdx} className="p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-[#B8862A] block font-serif">Tier #{tIdx + 1}: {tier.titleBn}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title BN"
                    value={tier.titleBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], titleBn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Title EN"
                    value={tier.titleEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], titleEn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Deposit BN (৳১০০ ফেরতযোগ্য)"
                    value={tier.depositBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], depositBn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Deposit EN (৳100 Refundable)"
                    value={tier.depositEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], depositEn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Max Book Val BN"
                    value={tier.maxBookValBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], maxBookValBn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Borrow Period BN"
                    value={tier.periodBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], periodBn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Suitable For BN"
                    value={tier.suitableBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], suitableBn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Suitable For EN"
                    value={tier.suitableEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.membershipTiers || [])];
                      updated[tIdx] = { ...updated[tIdx], suitableEn: e.target.value };
                      updateField('membershipTiers', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Refund Policy */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'জামানত ফেরত নীতিমালা (Refund Policy)' : 'Refund Policy'}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <textarea
                rows={2}
                placeholder="Refund Policy BN"
                value={editingPage.refund_policy_desc_bn || ''}
                onChange={(e) => updateField('refund_policy_desc_bn', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <textarea
                rows={2}
                placeholder="Refund Policy EN"
                value={editingPage.refund_policy_desc_en || ''}
                onChange={(e) => updateField('refund_policy_desc_en', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 8: APPLICATION FORM LABELS & UI
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'apply_form' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2">
            <FileText className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৮. অনলাইন আবেদন ফরম শিরোনাম, লেবেল ও বার্তা' : '8. Application Form Labels & Messages'}</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ফরম শিরোনাম (বাংলা)' : 'Form Title (BN)'}</label>
              <input
                type="text"
                value={editingPage.apply_title_bn || ''}
                onChange={(e) => updateField('apply_title_bn', e.target.value)}
                placeholder="ভ্রাম্যমাণ লাইব্রেরি অনলাইন সদস্যপদ ফরম"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ফরম শিরোনাম (ইংরেজি)' : 'Form Title (EN)'}</label>
              <input
                type="text"
                value={editingPage.apply_title_en || ''}
                onChange={(e) => updateField('apply_title_en', e.target.value)}
                placeholder="Mobile Library Membership Application"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ফরম সাবটাইটেল (বাংলা)' : 'Form Subtitle (BN)'}</label>
              <textarea
                rows={2}
                value={editingPage.apply_subtitle_bn || ''}
                onChange={(e) => updateField('apply_subtitle_bn', e.target.value)}
                placeholder="ফরমটি পূরণ করে জমা দিন..."
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ফরম সাবটাইটেল (ইংরেজি)' : 'Form Subtitle (EN)'}</label>
              <textarea
                rows={2}
                value={editingPage.apply_subtitle_en || ''}
                onChange={(e) => updateField('apply_subtitle_en', e.target.value)}
                placeholder="Fill in the details below..."
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সাবমিট বাটন লেবেল (বাংলা)' : 'Submit Button Label (BN)'}</label>
              <input
                type="text"
                value={editingPage.form_submit_btn_bn || ''}
                onChange={(e) => updateField('form_submit_btn_bn', e.target.value)}
                placeholder="সদস্যপদ আবেদন জমা দিন"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'সাবমিট বাটন লেবেল (ইংরেজি)' : 'Submit Button Label (EN)'}</label>
              <input
                type="text"
                value={editingPage.form_submit_btn_en || ''}
                onChange={(e) => updateField('form_submit_btn_en', e.target.value)}
                placeholder="Submit Membership Application"
                className="w-full p-2 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Success Screen Texts */}
          <div className="pt-2 border-t border-stone-200 space-y-2">
            <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'আবেদন সফল বার্তা (Success Message Texts)' : 'Application Success Texts'}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Success Title BN"
                value={editingPage.apply_success_title_bn || ''}
                onChange={(e) => updateField('apply_success_title_bn', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
              <input
                type="text"
                placeholder="Success Title EN"
                value={editingPage.apply_success_title_en || ''}
                onChange={(e) => updateField('apply_success_title_en', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <textarea
                rows={2}
                placeholder="Success Desc BN"
                value={editingPage.apply_success_desc_bn || ''}
                onChange={(e) => updateField('apply_success_desc_bn', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
              <textarea
                rows={2}
                placeholder="Success Desc EN"
                value={editingPage.apply_success_desc_en || ''}
                onChange={(e) => updateField('apply_success_desc_en', e.target.value)}
                className="p-1.5 border border-stone-200 rounded text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SUBTAB 9: FAQ & DIRECT HELPLINE
         ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'faq_contact' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-5">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? '৯. সাধারণ জিজ্ঞাসিত প্রশ্নাবলী ও হেল্পলাইন (FAQ & Contact)' : '9. FAQ & Helpline Direct Desk'}</span>
            </h5>
            <button
              type="button"
              onClick={() => {
                const faqs = editingPage.faqs || [];
                const newFaq = {
                  qBn: 'নতুন প্রশ্ন এখানে লিখুন?',
                  qEn: 'New Question Here?',
                  aBn: 'প্রশ্নের উত্তর এখানে লিখুন।',
                  aEn: 'Write answer here.'
                };
                updateField('faqs', [...faqs, newFaq]);
              }}
              className="text-[11px] font-bold text-[#2E5942] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন FAQ যোগ' : 'Add FAQ'}</span>
            </button>
          </div>

          {/* FAQs List */}
          <div className="space-y-3">
            {(editingPage.faqs || []).map((faq: any, fIdx: number) => (
              <div key={fIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#B8862A]">FAQ #{fIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editingPage.faqs || []).filter((_: any, i: number) => i !== fIdx);
                      updateField('faqs', updated);
                    }}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Question BN"
                    value={faq.qBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.faqs || [])];
                      updated[fIdx] = { ...updated[fIdx], qBn: e.target.value };
                      updateField('faqs', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Question EN"
                    value={faq.qEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.faqs || [])];
                      updated[fIdx] = { ...updated[fIdx], qEn: e.target.value };
                      updateField('faqs', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    placeholder="Answer BN"
                    value={faq.aBn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.faqs || [])];
                      updated[fIdx] = { ...updated[fIdx], aBn: e.target.value };
                      updateField('faqs', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer EN"
                    value={faq.aEn || ''}
                    onChange={(e) => {
                      const updated = [...(editingPage.faqs || [])];
                      updated[fIdx] = { ...updated[fIdx], aEn: e.target.value };
                      updateField('faqs', updated);
                    }}
                    className="p-1.5 border border-stone-200 rounded text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Contact Helpline Box */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <label className="text-xs font-bold text-[#1A1207]">{language === 'bn' ? 'সরাসরি হেল্পলাইন যোগাযোগ বক্স (Contact Helpline Box)' : 'Helpline Direct Contact Box'}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'অফিসার নাম (BN)' : 'Officer Name (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.contact_officer_name_bn || ''}
                  onChange={(e) => updateField('contact_officer_name_bn', e.target.value)}
                  placeholder="উজ্জ্বল হোসেন (Uzzal Hossain)"
                  className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'মোবাইল / হটলাইন' : 'Mobile / Hotline'}</label>
                <input
                  type="text"
                  value={editingPage.contact_phone_val || ''}
                  onChange={(e) => updateField('contact_phone_val', e.target.value)}
                  placeholder="০১৭১১-৫৩৫৩৯৮ (01711-535398)"
                  className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'ইমেইল এড্রেস' : 'Official Email'}</label>
                <input
                  type="text"
                  value={editingPage.contact_email_val || ''}
                  onChange={(e) => updateField('contact_email_val', e.target.value)}
                  placeholder="mobilelibrary@bskbd.org"
                  className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-700 block">{language === 'bn' ? 'কেন্দ্রীয় কার্যালয় ঠিকানা (BN)' : 'Headquarters Address (BN)'}</label>
                <input
                  type="text"
                  value={editingPage.contact_hq_address_bn || ''}
                  onChange={(e) => updateField('contact_hq_address_bn', e.target.value)}
                  placeholder="বিশ্বসাহিত্য কেন্দ্র, ১৭৪ কাজী নজরুল ইসলাম এভিনিউ, বাংলামোটর, ঢাকা-১০০০।"
                  className="w-full p-1.5 border border-stone-200 rounded text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
