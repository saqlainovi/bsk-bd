import React, { useState } from 'react';
import { 
  Store, BookOpen, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, MapPin, Phone
} from 'lucide-react';
import { Language } from '../types';

interface BookShopCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const BookShopCMSEditor: React.FC<BookShopCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'catalogs' | 'branches' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const bookShopData = editingPage.bookShopData || editingPage || {};

  const updateShopField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      bookShopData: {
        ...(editingPage.bookShopData || {}),
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
      {/* Sub Tabs */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. পরিচিতি ও ব্যানার', icon: Store },
          { id: 'stats', labelBn: '২. মূল তথ্য ও বিশেষ ছাড়', icon: Award },
          { id: 'catalogs', labelBn: '৩. ক্যাটালগ ও বইয়ের তালিকা', icon: FileText },
          { id: 'branches', labelBn: '৪. বিক্রয় কেন্দ্র ও আউটলেট', icon: MapPin },
          { id: 'gallery', labelBn: '৫. বুকশপ ফটো গ্যালারি', icon: ImageIcon }
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. বই বিক্রয় কেন্দ্র পরিচিতি ও ব্যানার</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={editingPage.title_bn ?? 'বই বিক্রয় কেন্দ্র'}
              onChange={(e) => updateShopField('title_bn', e.target.value)}
              placeholder="শিরোনাম (বাংলা)"
              className="p-2 border rounded font-bold"
            />
            <input
              type="text"
              value={editingPage.title_en ?? 'BSK Book Shop'}
              onChange={(e) => updateShopField('title_en', e.target.value)}
              placeholder="Title (English)"
              className="p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">বুকশপ বিবরণী অনুচ্ছেদ (বাংলা)</label>
            <textarea
              rows={3}
              value={bookShopData.about_bn ?? 'বিশ্বসাহিত্য কেন্দ্র ভবনের ২য় তলায় অবস্থিত আমাদের সমৃদ্ধ বই বিক্রয় কেন্দ্র। এখানে কেন্দ্র প্রকাশিত কালজয়ী গ্রন্থ ছাড়াও দেশ-বিদেশের খ্যাতিমান প্রকাশনীর বই বিশেষ ছাড়ে পাওয়া যায়।'}
              onChange={(e) => updateShopField('about_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold block">হটলাইন ও অর্ডার যোগাযোগ (বাংলা)</label>
            <input
              type="text"
              value={bookShopData.hotline_bn ?? '+৮৮০ ১৭৩০০৫৫৮০২, +৮৮০ ২-৯৬৬০৮১২'}
              onChange={(e) => updateShopField('hotline_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* 3. CATALOGS */}
      {activeTab === 'catalogs' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৩. ডাউনলোডযোগ্য ক্যাটালগ ও বইয়ের তালিকা</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.downloads || [];
                setEditingPage({
                  ...editingPage,
                  downloads: [...current, { title_bn: 'নতুন ক্যাটালগ', file_size: '২.৫ MB (PDF)', file_url: '' }]
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
              { title_bn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনীর বইয়ের তালিকা (ক্যাটালগ)', file_size: '৩.৮ MB • PDF', file_url: '' },
              { title_bn: 'বিশেষ ছাড়ের বইয়ের মজুদ তালিকা (বাংলাদেশি প্রকাশনা)', file_size: '২.৫ MB • PDF', file_url: '' },
              { title_bn: 'ভারতীয় বিভিন্ন প্রকাশনার বইয়ের মজুদ তালিকা (কলকাতা)', file_size: '২.৯ MB • PDF', file_url: '' }
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
                    placeholder="সাইজ e.g. ৩.৫ MB PDF"
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
                      }, `cat_${dIdx}`)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif">৫. বুকশপ ফটো গ্যালারি</h5>
            <button
              type="button"
              onClick={() => {
                const current = editingPage.gallery || [];
                setEditingPage({
                  ...editingPage,
                  gallery: [...current, { image: '', caption_bn: 'বই বিক্রয় কেন্দ্রের দৃশ্য' }]
                });
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ছবি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(editingPage.gallery || []).map((img: any, gIdx: number) => (
              <div key={gIdx} className="p-3 bg-stone-50 rounded-xl border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#B8862A]">ছবি #{gIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = (editingPage.gallery || []).filter((_: any, i: number) => i !== gIdx);
                      setEditingPage({ ...editingPage, gallery: copy });
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>
                {img.image && <img src={img.image} className="w-full h-28 object-cover rounded" alt="gal" />}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={img.image || ''}
                    onChange={(e) => {
                      const copy = [...(editingPage.gallery || [])];
                      copy[gIdx] = { ...copy[gIdx], image: e.target.value };
                      setEditingPage({ ...editingPage, gallery: copy });
                    }}
                    placeholder="URL"
                    className="flex-1 p-1.5 text-xs border rounded bg-white font-mono"
                  />
                  <label className="px-2.5 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const copy = [...(editingPage.gallery || [])];
                        copy[gIdx] = { ...copy[gIdx], image: url };
                        setEditingPage({ ...editingPage, gallery: copy });
                      }, `shop_gal_${gIdx}`)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={img.caption_bn || ''}
                  onChange={(e) => {
                    const copy = [...(editingPage.gallery || [])];
                    copy[gIdx] = { ...copy[gIdx], caption_bn: e.target.value };
                    setEditingPage({ ...editingPage, gallery: copy });
                  }}
                  placeholder="ক্যাপশন (বাংলা)"
                  className="w-full p-1.5 border rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
