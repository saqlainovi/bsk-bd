import React from 'react';
import { Sparkles, BookOpen, Layers, Upload, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Language } from '../types';

interface AalorIshkoolCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const AalorIshkoolCMSEditor: React.FC<AalorIshkoolCMSEditorProps> = ({
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

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 1. Hero & Tagline */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
          <Sparkles className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '১. হিরো ব্যানার ও মূল স্লোগান' : '1. Hero Banner & Core Slogan'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'হিরো শিরোনাম (বাংলা)' : 'Hero Title (BN)'}</label>
            <input
              type="text"
              value={editingPage.hero_title_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_title_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'হিরো শিরোনাম (ইংরেজি)' : 'Hero Title (EN)'}</label>
            <input
              type="text"
              value={editingPage.hero_title_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_title_en: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / সারসংক্ষেপ (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={2}
              value={editingPage.hero_subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / সারসংক্ষেপ (ইংরেজি)' : 'Subtitle (EN)'}</label>
            <textarea
              rows={2}
              value={editingPage.hero_subtitle_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, hero_subtitle_en: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">🖼️ {isBn ? 'হিরো ব্যাকগ্রাউন্ড ছবি' : 'Hero Image'}</label>
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

      {/* 2. 5 Core Pillars */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <Layers className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '২. কর্মসূচির ৫টি মূল স্তম্ভ' : '2. 5 Core Curriculum Pillars'}</span>
        </h4>
        <div className="space-y-3">
          {(editingPage.pillars || []).map((pil: any, pIdx: number) => (
            <div key={pIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#B8862A]">
                <span>Pillar #{pil.num || pIdx + 1}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title (BN)"
                  value={pil.titleBn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.pillars || [])];
                    updated[pIdx].titleBn = e.target.value;
                    setEditingPage({ ...editingPage, pillars: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Title (EN)"
                  value={pil.titleEn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.pillars || [])];
                    updated[pIdx].titleEn = e.target.value;
                    setEditingPage({ ...editingPage, pillars: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <textarea
                  rows={2}
                  placeholder="Description (BN)"
                  value={pil.descBn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.pillars || [])];
                    updated[pIdx].descBn = e.target.value;
                    setEditingPage({ ...editingPage, pillars: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white font-sans"
                />
                <textarea
                  rows={2}
                  placeholder="Description (EN)"
                  value={pil.descEn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.pillars || [])];
                    updated[pIdx].descEn = e.target.value;
                    setEditingPage({ ...editingPage, pillars: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white font-sans"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Philosophy & Vision */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
          <BookOpen className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '৩. চেতনা ও দর্শন' : '3. Philosophy & Core Vision'}</span>
        </h4>
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'দর্শনের শিরোনাম (বাংলা)' : 'Philosophy Heading (BN)'}</label>
            <input
              type="text"
              value={editingPage.philosophy_heading_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, philosophy_heading_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'দর্শনের বিস্তারিত বক্তব্য (বাংলা)' : 'Philosophy Text (BN)'}</label>
            <textarea
              rows={4}
              value={editingPage.philosophy_text_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, philosophy_text_bn: e.target.value })}
              className="w-full p-2.5 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
