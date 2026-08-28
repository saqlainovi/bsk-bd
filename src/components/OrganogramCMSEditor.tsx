import React, { useState } from 'react';
import { 
  Landmark, Award, Briefcase, Sparkles, Plus, Trash2, Upload,
  Layers, Users, CheckCircle, ChevronRight, Eye, Image as ImageIcon
} from 'lucide-react';
import { Language } from '../types';

interface OrganogramCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const OrganogramCMSEditor: React.FC<OrganogramCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'leadership' | 'departments'>('hierarchy');
  const [uploading, setUploading] = useState<string | null>(null);

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

  const organogramData = editingPage.organogramData || editingPage || {};

  const updateOrgField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      organogramData: {
        ...(editingPage.organogramData || {}),
        [key]: val
      }
    });
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      {/* Tab Switcher */}
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hierarchy', labelBn: '১. সাংগঠনিক চার্ট স্তরসমূহ', labelEn: '1. Hierarchy Nodes', icon: Layers },
          { id: 'leadership', labelBn: '২. শীর্ষ নেতৃত্ব ও প্রশাসন প্রোফাইল', labelEn: '2. Leadership Profiles', icon: Users },
          { id: 'departments', labelBn: '৩. বিভাগীয় শাখা ও দায়িত্বসমূহ', labelEn: '3. Departments & Roles', icon: Briefcase }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive ? 'bg-[#1A1207] text-[#F0CC7A] shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HIERARCHY NODES */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2.5">
            <Layers className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? 'সাংগঠনিক চার্ট স্তরসমূহ (Tree Hierarchy Nodes)' : 'Hierarchy Tree Nodes'}</span>
          </h5>

          {/* Node 1: Board of Trustees */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <span className="text-[10px] font-bold text-[#B8862A] font-mono">স্তর ১: ট্রাস্টি বোর্ড (Level 1)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={organogramData.trustee_title_bn ?? 'ট্রাস্টি বোর্ড (Board of Trustees)'}
                onChange={(e) => updateOrgField('trustee_title_bn', e.target.value)}
                placeholder="টাইটেল (বাংলা)"
                className="p-2 border rounded bg-white font-bold"
              />
              <input
                type="text"
                value={organogramData.trustee_sub_bn ?? 'নীতিনির্ধারণ ও দিকনির্দেশনা কমিটি (৯ সদস্য)'}
                onChange={(e) => updateOrgField('trustee_sub_bn', e.target.value)}
                placeholder="সাবটেক্সট (বাংলা)"
                className="p-2 border rounded bg-white"
              />
            </div>
            <textarea
              rows={2}
              value={organogramData.trustee_desc_bn ?? '৯ জন অত্যন্ত সম্মানিত ট্রাস্টি সদস্য নিয়ে গঠিত ট্রাস্টি বোর্ড। প্রতি তিন মাস অন্তর এদের সমন্বয়ে নীতিনির্ধারণী সাধারণ সভা অনুষ্ঠিত হয়।'}
              onChange={(e) => updateOrgField('trustee_desc_bn', e.target.value)}
              placeholder="বিস্তারিত বিবরণ (বাংলা)"
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          {/* Node 2: President & CEO */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <span className="text-[10px] font-bold text-[#B8862A] font-mono">স্তর ২: সভাপতি ও প্রধান নির্বাহী (Level 2)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={organogramData.ceo_title_bn ?? 'সভাপতি ও প্রধান নির্বাহী (President & CEO)'}
                onChange={(e) => updateOrgField('ceo_title_bn', e.target.value)}
                placeholder="পদবী (বাংলা)"
                className="p-2 border rounded bg-white font-bold"
              />
              <input
                type="text"
                value={organogramData.ceo_name_bn ?? 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ'}
                onChange={(e) => updateOrgField('ceo_name_bn', e.target.value)}
                placeholder="নাম (বাংলা)"
                className="p-2 border rounded bg-white"
              />
            </div>
            <textarea
              rows={2}
              value={organogramData.ceo_desc_bn ?? 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ কেন্দ্রের নীতিনির্ধারক ও আন্দোলন পরিচালনাকারী প্রধান কাণ্ডারি।'}
              onChange={(e) => updateOrgField('ceo_desc_bn', e.target.value)}
              placeholder="দায়িত্বের বিবরণ (বাংলা)"
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          {/* Node 3: Advisor Panel */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <span className="text-[10px] font-bold text-[#B8862A] font-mono">স্তর ৩ (ক): উপদেষ্টা প্যানেল (Advisory Board)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={organogramData.advisor_title_bn ?? 'উপদেষ্টা প্যানেল'}
                onChange={(e) => updateOrgField('advisor_title_bn', e.target.value)}
                className="p-2 border rounded bg-white font-bold"
              />
              <input
                type="text"
                value={organogramData.advisor_sub_bn ?? 'কর্মসূচি ও নীতি উপদেষ্টা'}
                onChange={(e) => updateOrgField('advisor_sub_bn', e.target.value)}
                className="p-2 border rounded bg-white"
              />
            </div>
            <textarea
              rows={2}
              value={organogramData.advisor_desc_bn ?? 'বিশিষ্ট সরকারি ও বেসরকারি অবসরপ্রাপ্ত শীর্ষ কর্মকর্তা এবং নীতিবিদদের নিয়ে গঠিত উপদেষ্টা দল।'}
              onChange={(e) => updateOrgField('advisor_desc_bn', e.target.value)}
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          {/* Node 4: Director Admin & Finance */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <span className="text-[10px] font-bold text-[#B8862A] font-mono">স্তর ৩ (খ): পরিচালক - প্রশাসন ও অর্থ</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={organogramData.director_title_bn ?? 'পরিচালক (প্রশাসন ও অর্থ)'}
                onChange={(e) => updateOrgField('director_title_bn', e.target.value)}
                className="p-2 border rounded bg-white font-bold"
              />
              <input
                type="text"
                value={organogramData.director_name_bn ?? 'জনাব শরিফ হোসেন ভূঞা'}
                onChange={(e) => updateOrgField('director_name_bn', e.target.value)}
                className="p-2 border rounded bg-white"
              />
            </div>
            <textarea
              rows={2}
              value={organogramData.director_desc_bn ?? 'জনাব শরিফ হোসেন ভূঞা বিশ্বসাহিত্য কেন্দ্রের দৈনন্দিন দাপ্তরিক কাজ ও সমন্বয় সাধন করেন।'}
              onChange={(e) => updateOrgField('director_desc_bn', e.target.value)}
              className="w-full p-2 border rounded bg-white"
            />
          </div>
        </div>
      )}

      {/* 2. LEADERSHIP PROFILES */}
      {activeTab === 'leadership' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B8862A]" />
              <span>{language === 'bn' ? 'শীর্ষ নেতৃত্ব ও কর্মকর্তা তালিকা' : 'Leadership & Officers Directory'}</span>
            </h5>
            <button
              type="button"
              onClick={() => {
                const current = organogramData.leadership_list || [
                  { name_bn: 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ', role_bn: 'প্রতিষ্ঠাতা ও সভাপতি', image: '/assets/IMGS/700224535_1396309085853902_3026706898645620199_n.jpg', bio_bn: 'প্রধান কাণ্ডারি ও স্বপ্নদ্রষ্টা' },
                  { name_bn: 'জনাব শরিফ হোসেন ভূঞা', role_bn: 'পরিচালক (প্রশাসন ও অর্থ)', image: '', bio_bn: 'দৈনন্দিন প্রশাসন ও আর্থিক সমন্বয়ক' }
                ];
                updateOrgField('leadership_list', [...current, { name_bn: 'নতুন কর্মকর্তা', role_bn: 'পদবী', image: '', bio_bn: 'বিবরণ' }]);
              }}
              className="text-xs font-bold text-[#2E5942] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কর্মকর্তা যোগ করুন' : 'Add Officer'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(organogramData.leadership_list || [
              { name_bn: 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ', role_bn: 'প্রতিষ্ঠাতা ও সভাপতি', image: '/assets/IMGS/700224535_1396309085853902_3026706898645620199_n.jpg', bio_bn: 'প্রধান কাণ্ডারি ও স্বপ্নদ্রষ্টা' },
              { name_bn: 'জনাব শরিফ হোসেন ভূঞা', role_bn: 'পরিচালক (প্রশাসন ও অর্থ)', image: '', bio_bn: 'দৈনন্দিন প্রশাসন ও আর্থিক সমন্বয়ক' }
            ]).map((leader: any, lIdx: number) => (
              <div key={lIdx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#B8862A]">প্রোফাইল #{lIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = (organogramData.leadership_list || []).filter((_: any, i: number) => i !== lIdx);
                      updateOrgField('leadership_list', copy);
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {leader.image ? (
                    <img src={leader.image} className="w-14 h-14 rounded-full object-cover border" alt="Leader" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 font-bold">ছবি</div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={leader.name_bn || ''}
                      onChange={(e) => {
                        const copy = [...(organogramData.leadership_list || [])];
                        copy[lIdx] = { ...copy[lIdx], name_bn: e.target.value };
                        updateOrgField('leadership_list', copy);
                      }}
                      placeholder="কর্মকর্তার নাম (বাংলা)"
                      className="w-full p-1.5 border rounded bg-white font-bold"
                    />
                    <input
                      type="text"
                      value={leader.role_bn || ''}
                      onChange={(e) => {
                        const copy = [...(organogramData.leadership_list || [])];
                        copy[lIdx] = { ...copy[lIdx], role_bn: e.target.value };
                        updateOrgField('leadership_list', copy);
                      }}
                      placeholder="পদবী (বাংলা)"
                      className="w-full p-1.5 border rounded bg-white text-xs text-[#B8862A]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leader.image || ''}
                    onChange={(e) => {
                      const copy = [...(organogramData.leadership_list || [])];
                      copy[lIdx] = { ...copy[lIdx], image: e.target.value };
                      updateOrgField('leadership_list', copy);
                    }}
                    placeholder="ছবি URL"
                    className="flex-1 p-1.5 text-xs border rounded bg-white font-mono"
                  />
                  <label className="px-3 py-1.5 bg-[#2E5942] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const copy = [...(organogramData.leadership_list || [])];
                        copy[lIdx] = { ...copy[lIdx], image: url };
                        updateOrgField('leadership_list', copy);
                      }, `lead_${lIdx}`)}
                    />
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={leader.bio_bn || ''}
                  onChange={(e) => {
                    const copy = [...(organogramData.leadership_list || [])];
                    copy[lIdx] = { ...copy[lIdx], bio_bn: e.target.value };
                    updateOrgField('leadership_list', copy);
                  }}
                  placeholder="সংক্ষিপ্ত ভূমিকা ও দায়িত্বের বিবরণ..."
                  className="w-full p-1.5 border rounded bg-white text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DEPARTMENTS & WINGS */}
      {activeTab === 'departments' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif flex items-center gap-2 border-b pb-2.5">
            <Briefcase className="w-4 h-4 text-[#B8862A]" />
            <span>{language === 'bn' ? 'প্রধান ৫টি প্রশাসনিক বিভাগ ও দায়িত্ব' : '5 Core Departments & Responsibilities'}</span>
          </h5>

          <div className="space-y-4">
            {[
              { id: 'dept_reading', defaultTitle: 'দেশভিত্তিক উৎকর্ষ ও পাঠাভ্যাস কার্যক্রম বিভাগ' },
              { id: 'dept_mobile', defaultTitle: 'ভ্রাম্যমাণ লাইব্রেরি ও শাখা নেটওয়ার্ক বিভাগ' },
              { id: 'dept_pub', defaultTitle: 'প্রকাশনা, অনুবাদ ও বই বিক্রয় সেল' },
              { id: 'dept_admin', defaultTitle: 'সাধারণ প্রশাসন, লজিস্টিক ও মানবসম্পদ বিভাগ' },
              { id: 'dept_finance', defaultTitle: 'অর্থ, হিসাব ও বাজেট নিরীক্ষা বিভাগ' }
            ].map((dept, idx) => (
              <div key={dept.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-mono text-[10px] font-bold text-[#2E5942]">বিভাগ #{idx + 1}</span>
                <input
                  type="text"
                  value={organogramData[`${dept.id}_title_bn`] ?? dept.defaultTitle}
                  onChange={(e) => updateOrgField(`${dept.id}_title_bn`, e.target.value)}
                  placeholder="বিভাগের নাম (বাংলা)"
                  className="w-full p-2 border rounded bg-white font-bold"
                />
                <textarea
                  rows={2}
                  value={organogramData[`${dept.id}_desc_bn`] ?? ''}
                  onChange={(e) => updateOrgField(`${dept.id}_desc_bn`, e.target.value)}
                  placeholder="এই বিভাগের প্রধান কার্যাবলী ও দায়িত্বের বিস্তারিত বিবরণ..."
                  className="w-full p-2 border rounded bg-white text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
