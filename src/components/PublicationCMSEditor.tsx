import React, { useState } from 'react';
import { 
  BookOpen, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Layers
} from 'lucide-react';
import { Language } from '../types';

interface PublicationCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const PublicationCMSEditor: React.FC<PublicationCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'series' | 'catalogs' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const publicationData = editingPage.publicationData || editingPage || {};

  const updatePubField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      publicationData: {
        ...(editingPage.publicationData || {}),
        [key]: val
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      if (uploadImageToServer) {
        const url = await uploadImageToServer(file);
        setter(url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result as string);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. প্রকাশনা পরিচিতি', icon: BookOpen },
          { id: 'stats', labelBn: '২. ৪টি প্রকাশনা মেট্রিক্স', icon: Award },
          { id: 'series', labelBn: '৩. গ্রন্থ সিরিজ ও ক্যাটাগরি', icon: Layers },
          { id: 'catalogs', labelBn: '৪. ক্যাটালগ ও অর্ডার ফরম', icon: FileText },
          { id: 'gallery', labelBn: '৫. প্রকাশনা ফটো গ্যালারি', icon: ImageIcon }
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

      {/* 1. HERO */}
      {activeTab === 'hero' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. প্রকাশনা ও প্রকাশনী পরিচিতি</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={editingPage.title_bn ?? 'প্রকাশনা ও প্রকাশনী'}
              onChange={(e) => updatePubField('title_bn', e.target.value)}
              placeholder="শিরোনাম (বাংলা)"
              className="p-2 border rounded font-bold"
            />
            <input
              type="text"
              value={editingPage.title_en ?? 'BSK Publications'}
              onChange={(e) => updatePubField('title_en', e.target.value)}
              placeholder="Title (English)"
              className="p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">প্রকাশনা ভিশন ও পরিচিতি অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={publicationData.about_bn ?? 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা বিভাগ দীর্ঘ ৪ দশকেরও বেশি সময় ধরে বিশ্বসাহিত্যের চিরায়ত শ্রেষ্ঠ গ্রন্থ, বাংলা সাহিত্যের অমূল্য সংকলন এবং শিশু-কিশোর সাহিত্যের সেরা বইসমূহ রুচিশীল মুদ্রণে প্রকাশ করে আসছে।'}
              onChange={(e) => updatePubField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 4. CATALOGS */}
      {activeTab === 'catalogs' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৪. ক্যাটালগ ও বইয়ের তালিকা</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.downloads || [];
                setEditingPage({
                  ...editingPage,
                  downloads: [...current, { title_bn: 'নতুন প্রকাশনা ক্যাটালগ', file_size: '৩.২ MB (PDF)', file_url: '' }]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ক্যাটালগ যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {(editingPage.downloads || [
              { title_bn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনা সমগ্র ক্যাটালগ', file_size: '৩.৮ MB • PDF', file_url: '' },
              { title_bn: 'বাঙালির চিন্তামূলক রচনা সংকলন অর্ডার সহায়িকা', file_size: '২.৫ MB • PDF', file_url: '' }
            ]).map((doc: any, dIdx: number) => (
              <div key={dIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-[#2E5942] font-bold">ক্যাটালগ #{dIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = (editingPage.downloads || []).filter((_: any, i: number) => i !== dIdx);
                      setEditingPage({ ...editingPage, downloads: copy });
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={doc.title_bn || ''}
                    onChange={(e) => {
                      const copy = [...(editingPage.downloads || [])];
                      copy[dIdx] = { ...copy[dIdx], title_bn: e.target.value };
                      setEditingPage({ ...editingPage, downloads: copy });
                    }}
                    placeholder="ক্যাটালগ শিরোনাম"
                    className="sm:col-span-2 p-2 border rounded bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={doc.file_size || ''}
                    onChange={(e) => {
                      const copy = [...(editingPage.downloads || [])];
                      copy[dIdx] = { ...copy[dIdx], file_size: e.target.value };
                      setEditingPage({ ...editingPage, downloads: copy });
                    }}
                    placeholder="সাইজ"
                    className="p-2 border rounded bg-white text-xs"
                  />
                </div>
                <div className="flex gap-2">
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
                  <label className="px-3 py-2 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড PDF</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const copy = [...(editingPage.downloads || [])];
                        copy[dIdx] = { ...copy[dIdx], file_url: url, url: url };
                        setEditingPage({ ...editingPage, downloads: copy });
                      }, `pub_cat_${dIdx}`)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
