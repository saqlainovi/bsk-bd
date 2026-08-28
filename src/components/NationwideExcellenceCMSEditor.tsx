import React from 'react';
import { Sparkles, BookOpen, GraduationCap, Upload, Plus, Trash2, ImageIcon, Phone } from 'lucide-react';
import { Language } from '../types';

interface NationwideExcellenceCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const NationwideExcellenceCMSEditor: React.FC<NationwideExcellenceCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer,
}) => {
  const isBn = language === 'bn';

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        setEditingPage({ ...editingPage, hero_image: url, image: url });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, gIdx: number) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        const updated = [...(editingPage.excellence_gallery || [])];
        updated[gIdx].image = url;
        setEditingPage({ ...editingPage, excellence_gallery: updated });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 1. Hero Banner */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
          <Sparkles className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '১. হিরো ব্যানার ও স্লোগান' : '1. Hero Banner & Tagline'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'ব্যাজ লেখা (বাংলা)' : 'Badge Text (BN)'}</label>
            <input
              type="text"
              value={editingPage.badge_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, badge_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'ব্যাজ লেখা (ইংরেজি)' : 'Badge Text (EN)'}</label>
            <input
              type="text"
              value={editingPage.badge_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, badge_en: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / সারসংক্ষেপ (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={2}
              value={editingPage.subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">🖼️ {isBn ? 'ব্যানার ছবি' : 'Banner Image'}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingPage.hero_image || ''}
                onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value })}
                className="flex-1 p-2 border border-stone-200 rounded-lg bg-white font-mono text-xs"
              />
              <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>{isBn ? 'আপলোড' : 'Upload'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Photo Gallery */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '২. উৎসব ও পাঠক গ্যালারি' : '2. Festival Photo Gallery'}</span>
          </h4>
          <button
            type="button"
            onClick={() => {
              const current = editingPage.excellence_gallery || [];
              setEditingPage({
                ...editingPage,
                excellence_gallery: [...current, { image: '', caption_bn: 'ছবি পরিচিতি', caption_en: 'Photo Caption' }]
              });
            }}
            className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isBn ? 'ছবি যোগ করুন' : 'Add Photo'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(editingPage.excellence_gallery || []).map((gal: any, galIdx: number) => (
            <div key={galIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#B8862A]">Photo #{galIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (editingPage.excellence_gallery || []).filter((_: any, i: number) => i !== galIdx);
                    setEditingPage({ ...editingPage, excellence_gallery: updated });
                  }}
                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={gal.image || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.excellence_gallery || [])];
                    updated[galIdx].image = e.target.value;
                    setEditingPage({ ...editingPage, excellence_gallery: updated });
                  }}
                  className="flex-1 p-1.5 border border-stone-200 rounded bg-white font-mono text-xs"
                />
                <label className="px-2.5 py-1 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, galIdx)} />
                </label>
              </div>
              <input
                type="text"
                placeholder="Caption (BN)"
                value={gal.caption_bn || ''}
                onChange={(e) => {
                  const updated = [...(editingPage.excellence_gallery || [])];
                  updated[galIdx].caption_bn = e.target.value;
                  setEditingPage({ ...editingPage, excellence_gallery: updated });
                }}
                className="w-full p-1.5 border border-stone-200 rounded bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
