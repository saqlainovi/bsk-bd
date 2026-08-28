import React from 'react';
import { 
  FileText, Upload, Plus, Trash2, Award, Sparkles, BookOpen, ImageIcon, Download, 
  CheckCircle, MapPin, Landmark, HeartHandshake, Eye
} from 'lucide-react';
import { Language } from '../types';

interface ReadingHabitCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const ReadingHabitCMSEditor: React.FC<ReadingHabitCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [uploading, setUploading] = React.useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (url: string) => void, uploadKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(uploadKey);
    try {
      if (uploadImageToServer) {
        const url = await uploadImageToServer(file);
        fieldSetter(url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          fieldSetter(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(language === 'bn' ? 'ফাইল আপলোডে সমস্যা হয়েছে।' : 'Failed to upload file.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2">
      {/* 1. HERO BANNER & INTRO */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
        <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b border-[#B8862A]/20 pb-2.5">
          <Sparkles className="w-4 h-4 text-[#B8862A]" />
          <span>{language === 'bn' ? '১. হিরো ব্যানার, স্লোগান ও পরিচিতি' : '1. Hero Banner, Tagline & Description'}</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'টপ ব্যাজ (বাংলা)' : 'Top Badge (BN)'}</label>
            <input 
              type="text" 
              value={editingPage.badge_bn || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, badge_bn: e.target.value })}
              placeholder="দেশব্যাপী আলোর কাফেলা"
              className="w-full p-2.5 border rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{language === 'bn' ? 'টপ ব্যাজ (ইংরেজি)' : 'Top Badge (EN)'}</label>
            <input 
              type="text" 
              value={editingPage.badge_en || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, badge_en: e.target.value })}
              placeholder="Nationwide Enlightened Society"
              className="w-full p-2.5 border rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-stone-700 block">{language === 'bn' ? '১ম ভূমিকা অনুচ্ছেদ (বাংলা)' : 'Paragraph 1 Intro (BN)'}</label>
          <textarea 
            rows={3}
            value={editingPage.subtitle_bn || ''} 
            onChange={(e) => setEditingPage({ ...editingPage, subtitle_bn: e.target.value })}
            placeholder="কেন্দ্রের পাঠাভ্যাস উন্নয়ন কর্মসূচি শুরু হয়েছে ২০১০ সালে..."
            className="w-full p-2.5 border rounded-lg bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-stone-700 block">{language === 'bn' ? '১ম ভূমিকা অনুচ্ছেদ (ইংরেজি)' : 'Paragraph 1 Intro (EN)'}</label>
          <textarea 
            rows={3}
            value={editingPage.subtitle_en || ''} 
            onChange={(e) => setEditingPage({ ...editingPage, subtitle_en: e.target.value })}
            placeholder="BSK's Reading Habit Development Program started in 2010..."
            className="w-full p-2.5 border rounded-lg bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-stone-700 block">{language === 'bn' ? '২য় উদ্দেশ্য অনুচ্ছেদ (বাংলা)' : 'Paragraph 2 Purpose (BN)'}</label>
          <textarea 
            rows={3}
            value={editingPage.hero_desc_bn || ''} 
            onChange={(e) => setEditingPage({ ...editingPage, hero_desc_bn: e.target.value })}
            placeholder="এই কর্মসূচির মূল উদ্দেশ্য শিক্ষার্থীদের মধ্যে..."
            className="w-full p-2.5 border rounded-lg bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-stone-700 block">{language === 'bn' ? '২য় উদ্দেশ্য অনুচ্ছেদ (ইংরেজি)' : 'Paragraph 2 Purpose (EN)'}</label>
          <textarea 
            rows={3}
            value={editingPage.hero_desc_en || ''} 
            onChange={(e) => setEditingPage({ ...editingPage, hero_desc_en: e.target.value })}
            placeholder="The key objective is to cultivate early reading habits..."
            className="w-full p-2.5 border rounded-lg bg-white"
          />
        </div>

        {/* Circular Featured Image */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
          <label className="font-bold text-stone-800 block">{language === 'bn' ? '🖼️ হিরো বৃত্তাকার ফিচার ছবি ও ক্যাপশন' : '🖼️ Hero Circular Feature Photo & Caption'}</label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {editingPage.hero_image && (
              <img src={editingPage.hero_image} className="w-16 h-16 rounded-full object-cover border border-amber-300 shadow-xs shrink-0" alt="Preview" />
            )}
            <input 
              type="text" 
              value={editingPage.hero_image || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value })}
              placeholder="/assets/IMGS/..."
              className="flex-1 p-2 border rounded-lg font-mono text-xs"
            />
            <label className="px-3.5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
              <Upload className={`h-3.5 w-3.5 ${uploading === 'hero_image' ? 'animate-spin' : ''}`} />
              <span>{uploading === 'hero_image' ? '...' : (language === 'bn' ? 'ছবি আপলোড' : 'Upload')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingPage({ ...editingPage, hero_image: url }), 'hero_image')} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <input 
              type="text" 
              value={editingPage.circle_caption_bn || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, circle_caption_bn: e.target.value })}
              placeholder="ক্যাপশন (বাংলা) যেমন: তরুণ শিক্ষার্থীদের নতুন বইয়ের আনন্দ"
              className="w-full p-2 border rounded-lg"
            />
            <input 
              type="text" 
              value={editingPage.circle_caption_en || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, circle_caption_en: e.target.value })}
              placeholder="Caption (EN) e.g.: Eager students celebrating books"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Rules & Guidelines PDF Link */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
          <label className="font-bold text-stone-800 block flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '📄 কর্মসূচির বিবরণী ও নিয়মাবলি (PDF / Document Link)' : '📄 Program Rules & Guidelines File URL'}</span>
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={editingPage.rules_pdf_url || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, rules_pdf_url: e.target.value })}
              placeholder="https://... বা /assets/documents/rules.pdf"
              className="flex-1 p-2 border rounded-lg font-mono text-xs"
            />
            <label className="px-3.5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
              <Upload className={`h-3.5 w-3.5 ${uploading === 'rules_pdf' ? 'animate-spin' : ''}`} />
              <span>{uploading === 'rules_pdf' ? '...' : (language === 'bn' ? 'PDF আপলোড' : 'Upload PDF')}</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingPage({ ...editingPage, rules_pdf_url: url }), 'rules_pdf')} />
            </label>
          </div>
        </div>
      </div>

      {/* 2. 4 KEY PERFORMANCE STATISTICS */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '২. মূল ৪টি পারফরম্যান্স পরিসংখ্যান (Key Statistics)' : '2. Key 4 Performance Statistics'}</span>
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(editingPage.stats || [
            { value: "২৫০+ টি", label_bn: "সক্রিয় উপজেলা", label_en: "Active Upazilas", subtext_bn: "দেশজুড়ে বিস্তৃত কার্যক্রম", subtext_en: "Expanding across sub-districts" },
            { value: "১২,৯১৭+ টি", label_bn: "স্কুল ও মাদ্রাসা", label_en: "Schools & Madrasas", subtext_bn: "যার মধ্যে ৩৩% মাদ্রাসা অন্তর্ভুক্ত", subtext_en: "Comprising 33% madrasas" },
            { value: "২০.৯ লক্ষ+", label_bn: "বার্ষিক নিয়মিত পাঠক", label_en: "Annual Active Readers", subtext_bn: "৬০% মেয়েদের স্বতঃস্ফূর্ত অংশগ্রহণ", subtext_en: "60% female student ratio" },
            { value: "৮৩ লক্ষ+", label_bn: "মোট উপকৃত শিক্ষার্থী", label_en: "Total Beneficiaries", subtext_bn: "২০১০ সাল থেকে এ পর্যন্ত", subtext_en: "Empowered since year 2010" }
          ]).map((st: any, idx: number) => (
            <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold font-mono text-[#B8862A]">কার্ড #{idx + 1}</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={st.value || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.stats || [])];
                    if (!copy[idx]) copy[idx] = {};
                    copy[idx].value = e.target.value;
                    setEditingPage({ ...editingPage, stats: copy });
                  }}
                  placeholder="সংখ্যা (e.g. ২৫০+ টি)"
                  className="p-2 border rounded font-bold bg-white"
                />
                <input 
                  type="text" 
                  value={st.label_bn || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.stats || [])];
                    if (!copy[idx]) copy[idx] = {};
                    copy[idx].label_bn = e.target.value;
                    setEditingPage({ ...editingPage, stats: copy });
                  }}
                  placeholder="লেবেল (বাংলা)"
                  className="p-2 border rounded bg-white"
                />
              </div>
              <input 
                type="text" 
                value={st.subtext_bn || ''} 
                onChange={(e) => {
                  const copy = [...(editingPage.stats || [])];
                  if (!copy[idx]) copy[idx] = {};
                  copy[idx].subtext_bn = e.target.value;
                  setEditingPage({ ...editingPage, stats: copy });
                }}
                placeholder="সাবটেক্সট (বাংলা) e.g. দেশজুড়ে বিস্তৃত কার্যক্রম"
                className="w-full p-2 border rounded text-[11px] bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. CORE OPPORTUNITIES & DELIVERABLES */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>{language === 'bn' ? '৩. কর্মসূচির মূল ৫টি সুযোগ ও সুফলসমূহ' : '3. 5 Core Opportunities & Benefits'}</span>
          </h5>
        </div>

        <div className="space-y-3">
          {(editingPage.opportunities || [
            { title_bn: "১. অনুকূল পরিবেশ সৃষ্টি", title_en: "1. Favorable Environment", desc_bn: "প্রকল্পভুক্ত সকল মাধ্যমিক বিদ্যালয়ে ও মাদ্রাসায় ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য চমৎকার বইপড়ার অনুকূল পরিবেশ তৈরি করা হয়।" },
            { title_bn: "২. সুন্দর সুখপাঠ্য বইয়ের অভ্যাস", title_en: "2. Good Books Habits", desc_bn: "বয়স ও মন-উপযোগী অত্যন্ত মানসম্মত সুখপাঠ্য এবং উচ্চতর মূল্যবোধসম্পন্ন বাংলা ও ইংরেজি বই পড়ায় শিক্ষার্থীদের অভ্যস্ত করা হয়।" },
            { title_bn: "৩. শিক্ষক ও লাইব্রেরিয়ান প্রশিক্ষণ", title_en: "3. Professional Training", desc_bn: "কর্মসূচি যথাযথভাবে পরিচালনার জন্য প্রতিটি শিক্ষা প্রতিষ্ঠানের মনোনীত শিক্ষক ও লাইব্রেরিয়ানকে নিবিড় প্রশিক্ষণ প্রদান করা হয়।" },
            { title_bn: "৪. সৃজনশীল মূল্যায়ন", title_en: "4. Creative Assessment", desc_bn: "পঠিত বইগুলোর চমৎকার ও আনন্দময় মূল্যায়নের মাধ্যমে শিক্ষার্থীদের মেধা, সৃজনশীলতা ও বোঝার ক্ষমতা পরিমাপ করা হয়।" },
            { title_bn: "৫. আকর্ষণীয় পুরস্কার বিতরণ", title_en: "5. Elite Prize Giving", desc_bn: "মূল্যায়ন শেষে সফল শিক্ষার্থীদের মেধার স্বীকৃতির স্বরূপ দর্শনীয় বইপড়া সনদ এবং আকর্ষণীয় মূল্যবান বই পুরস্বৃত করা হয়।" }
          ]).map((opp: any, oIdx: number) => (
            <div key={oIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={opp.title_bn || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.opportunities || [])];
                    if (!copy[oIdx]) copy[oIdx] = {};
                    copy[oIdx].title_bn = e.target.value;
                    setEditingPage({ ...editingPage, opportunities: copy });
                  }}
                  placeholder="শিরোনাম (বাংলা)"
                  className="p-2 border rounded font-bold bg-white"
                />
                <input 
                  type="text" 
                  value={opp.title_en || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.opportunities || [])];
                    if (!copy[oIdx]) copy[oIdx] = {};
                    copy[oIdx].title_en = e.target.value;
                    setEditingPage({ ...editingPage, opportunities: copy });
                  }}
                  placeholder="Title (EN)"
                  className="p-2 border rounded bg-white"
                />
              </div>
              <textarea 
                rows={2} 
                value={opp.desc_bn || ''} 
                onChange={(e) => {
                  const copy = [...(editingPage.opportunities || [])];
                  if (!copy[oIdx]) copy[oIdx] = {};
                  copy[oIdx].desc_bn = e.target.value;
                  setEditingPage({ ...editingPage, opportunities: copy });
                }}
                placeholder="বিবরণী (বাংলা)"
                className="w-full p-2 border rounded bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. PHOTO GALLERY & FEATURE BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৪. আলোকচিত্র গ্যালারি ও ব্যানার ছবি' : '4. Photo Gallery & Feature Banner'}</span>
          </h5>
          <button 
            type="button" 
            onClick={() => {
              const current = editingPage.gallery || [];
              setEditingPage({
                ...editingPage,
                gallery: [...current, { image: '', caption_bn: 'নতুন আলোকচিত্র', caption_en: 'New Photo' }]
              });
            }}
            className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'গ্যালারিতে ছবি যোগ করুন' : 'Add Photo to Gallery'}</span>
          </button>
        </div>

        {/* Main Wide Gallery Banner */}
        <div className="p-4 bg-stone-50 rounded-xl border space-y-3">
          <label className="font-bold text-stone-800 block">{language === 'bn' ? '🖼️ গ্যালারির প্রধান ওয়াইড ব্যানার ছবি' : '🖼️ Main Wide Gallery Feature Banner'}</label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {editingPage.gallery_banner && (
              <img src={editingPage.gallery_banner} className="w-24 h-16 rounded-lg object-cover border shadow-xs shrink-0" alt="Banner Preview" />
            )}
            <input 
              type="text" 
              value={editingPage.gallery_banner || ''} 
              onChange={(e) => setEditingPage({ ...editingPage, gallery_banner: e.target.value })}
              placeholder="/assets/IMGS/LIBARY/..."
              className="flex-1 p-2 border rounded-lg font-mono text-xs bg-white"
            />
            <label className="px-3.5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
              <Upload className={`h-3.5 w-3.5 ${uploading === 'gallery_banner' ? 'animate-spin' : ''}`} />
              <span>{uploading === 'gallery_banner' ? '...' : (language === 'bn' ? 'ব্যানার আপলোড' : 'Upload Banner')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingPage({ ...editingPage, gallery_banner: url }), 'gallery_banner')} />
            </label>
          </div>

          <input 
            type="text" 
            value={editingPage.gallery_banner_caption_bn || ''} 
            onChange={(e) => setEditingPage({ ...editingPage, gallery_banner_caption_bn: e.target.value })}
            placeholder="ব্যানার ক্যাপশন (বাংলা) যেমন: মাধ্যমিক বিদ্যালয় প্রাঙ্গণ ও পাঠাগারসমূহে জ্ঞানের নিরব বিপ্লব"
            className="w-full p-2 border rounded-lg bg-white"
          />
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {(editingPage.gallery || []).map((photo: any, pIdx: number) => (
            <div key={pIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2 relative">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-[#B8862A]">ফটো #{pIdx + 1}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    const copy = (editingPage.gallery || []).filter((_: any, i: number) => i !== pIdx);
                    setEditingPage({ ...editingPage, gallery: copy });
                  }}
                  className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>

              {photo.image && (
                <img src={photo.image} className="w-full h-28 object-cover rounded-lg border bg-white" alt="Gallery item" />
              )}

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={photo.image || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.gallery || [])];
                    copy[pIdx] = { ...copy[pIdx], image: e.target.value };
                    setEditingPage({ ...editingPage, gallery: copy });
                  }}
                  placeholder="Image URL"
                  className="flex-1 p-1.5 text-xs border rounded bg-white font-mono"
                />
                <label className="px-2.5 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded transition cursor-pointer flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => {
                    const copy = [...(editingPage.gallery || [])];
                    copy[pIdx] = { ...copy[pIdx], image: url };
                    setEditingPage({ ...editingPage, gallery: copy });
                  }, `gal_${pIdx}`)} />
                </label>
              </div>

              <input 
                type="text" 
                value={photo.caption_bn || ''} 
                onChange={(e) => {
                  const copy = [...(editingPage.gallery || [])];
                  copy[pIdx] = { ...copy[pIdx], caption_bn: e.target.value };
                  setEditingPage({ ...editingPage, gallery: copy });
                }}
                placeholder="ক্যাপশন (বাংলা)"
                className="w-full p-1.5 text-xs border rounded bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. FORMS & DOCUMENT DOWNLOADS */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2.5">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? '৫. ফরম ও ডকুমেন্ট ডাউনলোড (Forms & Documents Download)' : '5. Forms & Document Downloads'}</span>
          </h5>
          <button 
            type="button" 
            onClick={() => {
              const current = editingPage.downloads || [];
              setEditingPage({
                ...editingPage,
                downloads: [...current, { id: String(Date.now()), title_bn: 'নতুন ফরম / আবেদনপত্র', title_en: 'New Form / Application', file_size: '১.৫ MB (PDF)', file_url: '' }]
              });
            }}
            className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডকুমেন্ট যোগ করুন' : 'Add Document'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {(editingPage.downloads || []).map((doc: any, dIdx: number) => (
            <div key={dIdx} className="p-3.5 bg-stone-50 rounded-xl border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-[#2E5942]">ডকুমেন্ট #{dIdx + 1}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    const copy = (editingPage.downloads || []).filter((_: any, i: number) => i !== dIdx);
                    setEditingPage({ ...editingPage, downloads: copy });
                  }}
                  className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={doc.title_bn || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.downloads || [])];
                    copy[dIdx] = { ...copy[dIdx], title_bn: e.target.value };
                    setEditingPage({ ...editingPage, downloads: copy });
                  }}
                  placeholder="ডকুমেন্ট শিরোনাম (বাংলা)"
                  className="p-2 border rounded bg-white font-bold"
                />
                <input 
                  type="text" 
                  value={doc.title_en || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.downloads || [])];
                    copy[dIdx] = { ...copy[dIdx], title_en: e.target.value };
                    setEditingPage({ ...editingPage, downloads: copy });
                  }}
                  placeholder="Document Title (English)"
                  className="p-2 border rounded bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text" 
                  value={doc.file_size || ''} 
                  onChange={(e) => {
                    const copy = [...(editingPage.downloads || [])];
                    copy[dIdx] = { ...copy[dIdx], file_size: e.target.value };
                    setEditingPage({ ...editingPage, downloads: copy });
                  }}
                  placeholder="ফাইলের সাইজ (e.g. ২.৫ MB PDF)"
                  className="p-2 border rounded bg-white text-xs"
                />
                <div className="sm:col-span-2 flex gap-2">
                  <input 
                    type="text" 
                    value={doc.file_url || doc.url || ''} 
                    onChange={(e) => {
                      const copy = [...(editingPage.downloads || [])];
                      copy[dIdx] = { ...copy[dIdx], file_url: e.target.value, url: e.target.value };
                      setEditingPage({ ...editingPage, downloads: copy });
                    }}
                    placeholder="File URL / PDF Link"
                    className="flex-1 p-2 border rounded bg-white font-mono text-xs"
                  />
                  <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
                    <input type="file" accept=".pdf,.doc,.docx,.zip" className="hidden" onChange={(e) => handleFileUpload(e, (url) => {
                      const copy = [...(editingPage.downloads || [])];
                      copy[dIdx] = { ...copy[dIdx], file_url: url, url: url };
                      setEditingPage({ ...editingPage, downloads: copy });
                    }, `doc_${dIdx}`)} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
