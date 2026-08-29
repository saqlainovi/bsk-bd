import React, { useState } from 'react';
import { Sparkles, BookOpen, GraduationCap, Upload, Plus, Trash2, Globe, Users, ImageIcon } from 'lucide-react';
import { Language } from '../types';

interface AalorPathshalaCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const AalorPathshalaCMSEditor: React.FC<AalorPathshalaCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
}) => {
  const isBn = language === 'bn';
  const [uploading, setUploading] = useState<string | null>(null);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading('hero');
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        setEditingPage({ ...editingPage, hero_image: url, image: url });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    }
  };

  return (
    <div className="space-y-6 text-left font-sans text-xs">
      {/* 1. Hero & Portal Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <Sparkles className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '১. আলোর পাঠশালা পোর্টাল পরিচিতি ও ব্যানার' : '1. Aalor Pathshala Portal Info & Banner'}</span>
        </h4>

        {/* Banner Image Upload & Live Preview */}
        <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#B8862A]" />
              <span>আলোর পাঠশালা মূল ব্যানার ছবি (Hero Banner Image)</span>
            </label>
            <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
          </div>

          <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
            <img 
              src={editingPage.hero_image || editingPage.image || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop'} 
              alt="Pathshala Banner" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <button
              type="button"
              onClick={() => {
                setEditingPage({
                  ...editingPage,
                  hero_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop',
                  image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop'
                });
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
                value={editingPage.hero_image || editingPage.image || ''}
                onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value, image: e.target.value })}
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
                  disabled={uploading === 'hero'}
                  onChange={handleHeroUpload}
                />
                <Upload className={`h-4 w-4 text-[#2E5942] ${uploading === 'hero' ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold text-[#2E5942]">
                  {uploading === 'hero' ? 'আপলোড হচ্ছে...' : '📁 ব্যানার ছবি নির্বাচন করুন'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'পেজ শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
            <input
              type="text"
              value={editingPage.title_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, title_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'পেজ শিরোনাম (ইংরেজি)' : 'Title (EN)'}</label>
            <input
              type="text"
              value={editingPage.title_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={2}
              value={editingPage.subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম (ইংরেজি)' : 'Subtitle (EN)'}</label>
            <textarea
              rows={2}
              value={editingPage.subtitle_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, subtitle_en: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
        </div>
      </div>

      {/* 2. Detailed Description */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <Globe className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '২. বিস্তারিত বিবরণ ও কার্যক্রম' : '2. Detailed Description & Features'}</span>
        </h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'প্রথম অনুচ্ছেদ (বাংলা)' : 'Paragraph 1 (BN)'}</label>
            <textarea
              rows={4}
              value={editingPage.desc_p1_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, desc_p1_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'দ্বিতীয় অনুচ্ছেদ (বাংলা)' : 'Paragraph 2 (BN)'}</label>
            <textarea
              rows={4}
              value={editingPage.desc_p2_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, desc_p2_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'ই-লাইব্রেরি পোর্টাল URL' : 'E-Library Portal URL'}</label>
              <input
                type="text"
                value={editingPage.portal_url || 'https://alorpathshala.org'}
                onChange={(e) => setEditingPage({ ...editingPage, portal_url: e.target.value })}
                className="w-full p-2 border rounded bg-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'বাটন লেবেল (বাংলা)' : 'Button Label (BN)'}</label>
              <input
                type="text"
                value={editingPage.portal_btn_label_bn || 'আলোর পাঠশালা পোর্টালে প্রবেশ করুন'}
                onChange={(e) => setEditingPage({ ...editingPage, portal_btn_label_bn: e.target.value })}
                className="w-full p-2 border rounded bg-white font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
