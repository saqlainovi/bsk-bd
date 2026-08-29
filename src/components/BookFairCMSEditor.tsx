import React, { useState } from 'react';
import { Sparkles, BookOpen, ShieldCheck, MapPin, Calendar, Upload, Plus, Trash2, Phone, Download, ImageIcon } from 'lucide-react';
import { Language } from '../types';

interface BookFairCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer: (file: File) => Promise<string>;
}

export const BookFairCMSEditor: React.FC<BookFairCMSEditorProps> = ({
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, dlIdx: number) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(`dl_${dlIdx}`);
      try {
        const url = await uploadImageToServer(e.target.files[0]);
        const updated = [...(editingPage.downloads || [])];
        updated[dlIdx].url = url;
        setEditingPage({ ...editingPage, downloads: updated });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(null);
      }
    }
  };

  return (
    <div className="space-y-6 text-left font-sans text-xs">
      {/* 1. Hero Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <Sparkles className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '১. হিরো ব্যানার ও স্লোগান' : '1. Hero Banner & Tagline'}</span>
        </h4>

        {/* Banner Image Upload & Live Preview */}
        <div className="p-4 border border-[#B8862A]/30 rounded-xl space-y-3 bg-[#FAF7F2]/40">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#B8862A]" />
              <span>বইমেলা মূল ব্যানার ছবি (Hero Banner Image)</span>
            </label>
            <span className="text-[10px] text-[#B8862A] font-mono">* প্রস্তাবিত সাইজ: ১২০০x৬০০ পিক্সেল</span>
          </div>

          <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs">
            <img 
              src={editingPage.hero_image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop'} 
              alt="Book Fair Banner" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <button
              type="button"
              onClick={() => {
                setEditingPage({
                  ...editingPage,
                  hero_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop',
                  image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop'
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
                value={editingPage.hero_image || ''}
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
            <label className="font-bold text-stone-700 block">{isBn ? 'উপশিরোনাম / স্লোগান (বাংলা)' : 'Subtitle (BN)'}</label>
            <textarea
              rows={2}
              value={editingPage.subtitle_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, subtitle_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
            />
          </div>
        </div>
      </div>

      {/* 2. Overview Paragraphs */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2 border-b pb-2">
          <BookOpen className="h-4 w-4 text-[#B8862A]" />
          <span>{isBn ? '২. বইমেলা কার্যক্রম পরিচিতি' : '2. Book Fair Overview'}</span>
        </h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">{isBn ? 'পরিচিতি শিরোনাম (বাংলা)' : 'Heading (BN)'}</label>
            <input
              type="text"
              value={editingPage.overview_title_bn || ''}
              onChange={(e) => setEditingPage({ ...editingPage, overview_title_bn: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg bg-white font-bold"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'প্রথম অনুচ্ছেদ (বাংলা)' : 'Paragraph 1 (BN)'}</label>
              <textarea
                rows={3}
                value={editingPage.overview_p1_bn || ''}
                onChange={(e) => setEditingPage({ ...editingPage, overview_p1_bn: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">{isBn ? 'দ্বিতীয় অনুচ্ছেদ (বাংলা)' : 'Paragraph 2 (BN)'}</label>
              <textarea
                rows={3}
                value={editingPage.overview_p2_bn || ''}
                onChange={(e) => setEditingPage({ ...editingPage, overview_p2_bn: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg bg-white font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Download Catalogs */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
            <Download className="h-4 w-4 text-[#B8862A]" />
            <span>{isBn ? '৩. ডাউনলোড ডকুমেন্টস ও ক্যাটালগ' : '3. Downloads & Catalogs'}</span>
          </h4>
          <button
            type="button"
            onClick={() => {
              const current = editingPage.downloads || [];
              setEditingPage({
                ...editingPage,
                downloads: [...current, { title_bn: 'নতুন ডকুমেন্ট', title_en: 'New Document', file_size: '১.৫ MB PDF', url: '' }]
              });
            }}
            className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isBn ? 'ডকুমেন্ট যোগ করুন' : 'Add File'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {(editingPage.downloads || []).map((dl: any, dlIdx: number) => (
            <div key={dlIdx} className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#B8862A]">File #{dlIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (editingPage.downloads || []).filter((_: any, i: number) => i !== dlIdx);
                    setEditingPage({ ...editingPage, downloads: updated });
                  }}
                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title (BN)"
                  value={dl.title_bn || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.downloads || [])];
                    updated[dlIdx].title_bn = e.target.value;
                    setEditingPage({ ...editingPage, downloads: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white font-bold"
                />
                <input
                  type="text"
                  placeholder="File Size (e.g. ২.৫ MB PDF)"
                  value={dl.file_size || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.downloads || [])];
                    updated[dlIdx].file_size = e.target.value;
                    setEditingPage({ ...editingPage, downloads: updated });
                  }}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Document File URL"
                  value={dl.url || ''}
                  onChange={(e) => {
                    const updated = [...(editingPage.downloads || [])];
                    updated[dlIdx].url = e.target.value;
                    setEditingPage({ ...editingPage, downloads: updated });
                  }}
                  className="flex-1 p-1.5 border border-stone-200 rounded bg-white font-mono text-xs"
                />
                <label className="px-2.5 py-1 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  <span>Upload</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, dlIdx)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
