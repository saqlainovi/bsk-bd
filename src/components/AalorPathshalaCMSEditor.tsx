import React from 'react';
import { Sparkles, BookOpen, GraduationCap, Upload, Plus, Trash2, Globe, Users } from 'lucide-react';
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
      {/* 1. Hero & Portal Info */}
      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#B8862A]/30 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-[#B8862A]/20 pb-2">
          <Sparkles className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '১. আলোর পাঠশালা পোর্টাল পরিচিতি' : '1. Aalor Pathshala Portal Info'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
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
          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-stone-700 block">🖼️ {isBn ? 'ব্যানার ছবি' : 'Banner Image'}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingPage.hero_image || editingPage.image || ''}
                onChange={(e) => setEditingPage({ ...editingPage, hero_image: e.target.value, image: e.target.value })}
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

      {/* 2. Detailed Description */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <Globe className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '২. বিস্তারিত বিবরণ ও কার্যক্রম' : '2. Detailed Description & Features'}</span>
        </h4>
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'বিস্তারিত বিবরণ (বাংলা)' : 'Description (BN)'}</label>
            <textarea
              rows={5}
              value={editingPage.content_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, content_bn: e.target.value })}
              className="w-full p-2.5 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'বিস্তারিত বিবরণ (ইংরেজি)' : 'Description (EN)'}</label>
            <textarea
              rows={5}
              value={editingPage.content_en || ''}
              onChange={(e) => setEditingPage({ ...editingPage, content_en: e.target.value })}
              className="w-full p-2.5 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
