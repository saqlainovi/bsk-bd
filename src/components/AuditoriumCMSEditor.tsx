import React, { useState } from 'react';
import { 
  Building2, Award, FileText, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, Clock, Phone, Mail, MapPin, DollarSign, Layers
} from 'lucide-react';
import { Language } from '../types';

interface AuditoriumCMSEditorProps {
  editingPage: any;
  setEditingPage: (page: any) => void;
  language: Language;
  uploadImageToServer?: (file: File) => Promise<string>;
}

export const AuditoriumCMSEditor: React.FC<AuditoriumCMSEditorProps> = ({
  editingPage,
  setEditingPage,
  language,
  uploadImageToServer
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'halls' | 'terms' | 'gallery'>('hero');
  const [uploading, setUploading] = useState<string | null>(null);

  const auditoriumData = editingPage.auditoriumData || editingPage || {};

  const updateAudField = (key: string, val: any) => {
    setEditingPage({
      ...editingPage,
      [key]: val,
      auditoriumData: {
        ...(editingPage.auditoriumData || {}),
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

  const defaultRooms = [
    {
      id: 'r103', roomNo: '১০৩', floorBn: '২য় তলা', floorEn: '2nd Floor',
      titleBn: 'ইস্তেন্দিয়ার জাহিদ হাসান মিলনায়তন', titleEn: 'Istendiar Zahid Hasan Auditorium',
      category: 'auditorium', capacityBn: '২০০ আসন', capacityEn: '200 Seats',
      singleShiftAc: 12000, singleShiftNonAc: 12000, doubleShiftAc: 20000, doubleShiftNonAc: 20000,
      soundSystemCost: 2500, multimediaCost: 2500, projectorCost: 1500,
      furnitureBn: '২০০টি চেয়ার, ২টি টেবিল, ৫টি অতিথি চেয়ার',
      bannerSizeBn: '৭ ফুট × ৩ ফুট',
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'বিশ্বসাহিত্য কেন্দ্রের প্রধান ও বৃহত্তম মিলনায়তন। সাউন্ডপ্রুফ ডিজাইন ও আধুনিক কনফারেন্স ব্যবস্থা।'
    },
    {
      id: 'r101', roomNo: '১০১', floorBn: '২য় তলা', floorEn: '2nd Floor',
      titleBn: 'মিলনায়তন-২য় তলা', titleEn: 'Auditorium (2nd Floor - R101)',
      category: 'auditorium', capacityBn: '৭১ আসন (ফিক্সড)', capacityEn: '71 Fixed Seats',
      singleShiftAc: 8500, singleShiftNonAc: 8500, doubleShiftAc: 14000, doubleShiftNonAc: 14000,
      soundSystemCost: 1500, multimediaCost: 2000, projectorCost: 1500,
      furnitureBn: '৭১টি ফিক্সড চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      bannerSizeBn: '৮ ফুট × ৪ ফুট',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      descriptionBn: '৭১টি ফিক্সড গ্যালারি চেয়ার বিশিষ্ট থিয়েটার ঘরানার মিলনায়তন।'
    },
    {
      id: 'r301-303', roomNo: '৩০১, ৩০২, ৩০৩', floorBn: '৩য় তলা', floorEn: '3rd Floor',
      titleBn: 'সাধারণ শ্রেণীকক্ষ (৩০১, ৩০২, ৩০৩)', titleEn: 'General Classrooms (R301, 302, 303)',
      category: 'classroom', capacityBn: '৩০ আসন', capacityEn: '30 Seats each',
      singleShiftAc: 2200, singleShiftNonAc: 1500, doubleShiftAc: 4000, doubleShiftNonAc: 2500,
      soundSystemCost: 500, multimediaCost: 2000, projectorCost: 1500,
      furnitureBn: '৩০টি চেয়ার, ১টি টেবিল, ৩টি অতিথি চেয়ার',
      bannerSizeBn: '৭ ফুট × ৩ ফুট',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'প্রশিক্ষণ কর্মশালা, স্টাডি সার্কেল, ক্লাস ও ছোট পরিসরের প্রাতিষ্ঠানিক মিটিং আয়োজনের উপযোগী।'
    },
    {
      id: 'r402', roomNo: '৪০২', floorBn: '৫ম তলা', floorEn: '5th Floor',
      titleBn: 'চিত্রশালা / আর্ট গ্যালারি', titleEn: 'Art Gallery & Exhibition Hall (R402)',
      category: 'gallery', capacityBn: '৪০-৫০টি চিত্র প্রদর্শনী', capacityEn: '40-50 Artworks',
      singleShiftAc: 3500, singleShiftNonAc: 3500, doubleShiftAc: 6000, doubleShiftNonAc: 6000,
      soundSystemCost: 500, multimediaCost: 2000, projectorCost: 1500,
      furnitureBn: 'স্পট লাইট, ১৬টি চেয়ার, ৫০টি ছবি ঝুলানোর ট্র্যাকিং ব্যবস্থা',
      bannerSizeBn: 'হলরুম প্রবেশমুখ ব্যানার',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      descriptionBn: 'চিত্রকলা প্রদর্শনী, আলোকচিত্র প্রদর্শনী ও শিল্পকর্ম প্রদর্শনীর জন্য আধুনিক আর্ট গ্যালারি।'
    }
  ];

  const currentRooms = Array.isArray(auditoriumData.rooms) && auditoriumData.rooms.length > 0 ? auditoriumData.rooms : defaultRooms;

  const updateRoom = (idx: number, field: string, val: any) => {
    const next = [...currentRooms];
    next[idx] = { ...next[idx], [field]: val };
    updateAudField('rooms', next);
  };

  const addRoom = () => {
    const newRoom = {
      id: `room-${Date.now()}`,
      roomNo: 'নতুন রুম নং',
      floorBn: 'নতুন তলা',
      floorEn: 'Floor',
      titleBn: 'নতুন মিলনায়তন / কক্ষ',
      titleEn: 'New Hall / Room',
      category: 'auditorium',
      capacityBn: '৫০ আসন',
      capacityEn: '50 Seats',
      singleShiftAc: 5000,
      singleShiftNonAc: 3000,
      doubleShiftAc: 9000,
      doubleShiftNonAc: 5500,
      soundSystemCost: 1000,
      multimediaCost: 1500,
      projectorCost: 1000,
      furnitureBn: '৫০টি চেয়ার, ১টি টেবিল',
      bannerSizeBn: '৮ ফুট × ৪ ফুট',
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
      descriptionBn: 'নতুন মিলনায়তনের বিস্তারিত বিবরণ।'
    };
    updateAudField('rooms', [...currentRooms, newRoom]);
  };

  const deleteRoom = (idx: number) => {
    if (confirm('আপনি কি এই হল/রুমটি মুছে ফেলতে চান?')) {
      const next = currentRooms.filter((_: any, i: number) => i !== idx);
      updateAudField('rooms', next);
    }
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans text-xs pt-2 text-left">
      <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-[#B8862A]/30 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'hero', labelBn: '১. ব্যানার ও পরিচিতি', icon: Building2 },
          { id: 'halls', labelBn: '২. সকল মিলনায়তন ও কক্ষসমূহ (' + currentRooms.length + 'টি)', icon: Layers },
          { id: 'terms', labelBn: '৩. বুকিং নিয়মাবলী ও সময়সূচি', icon: FileText },
          { id: 'gallery', labelBn: '৪. ফটো গ্যালারি', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive ? 'bg-[#2E5942] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100 border'
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
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">১. ব্যানার ও পরিচিতি তথ্য</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">মূল শিরোনাম (বাংলা)</label>
              <input
                type="text"
                value={auditoriumData.hero_title_bn ?? 'অডিটোরিয়াম ও সেমিনার হল বুকিং'}
                onChange={(e) => updateAudField('hero_title_bn', e.target.value)}
                className="w-full p-2 border rounded font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Title (English)</label>
              <input
                type="text"
                value={auditoriumData.hero_title_en ?? 'Auditoriums & Seminar Halls Booking'}
                onChange={(e) => updateAudField('hero_title_en', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">সাব-টাইটেল / সংক্ষিপ্ত বিবরণ (বাংলা)</label>
            <textarea
              rows={2}
              value={auditoriumData.hero_subtitle_bn ?? 'শিল্প, সাহিত্য, সংস্কৃতি ও শিক্ষামূলক অনুষ্ঠান, সেমিনার ও নাট্য প্রদর্শনীর জন্য অত্যাধুনিক মিলনায়তন ও বিভিন্ন ধারণক্ষমতার সুসজ্জিত সেমিনার হল।'}
              onChange={(e) => updateAudField('hero_subtitle_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">হটলাইন / বুকিং ফোন</label>
              <input
                type="text"
                value={auditoriumData.contact_phone ?? '০১৭৩০০০০০১৫'}
                onChange={(e) => updateAudField('contact_phone', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">বুকিং ইমেইল</label>
              <input
                type="text"
                value={auditoriumData.contact_email ?? 'auditorium@bskbd.org'}
                onChange={(e) => updateAudField('contact_email', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">অবস্থান / ঠিকানা</label>
              <input
                type="text"
                value={auditoriumData.contact_location ?? 'বিশ্বসাহিত্য কেন্দ্র ভবন, বাংলা মোটোর, ঢাকা'}
                onChange={(e) => updateAudField('contact_location', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">ব্যানার কভার ছবি URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={auditoriumData.hero_image ?? ''}
                onChange={(e) => updateAudField('hero_image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2 border rounded"
              />
              <label className="px-3 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'hero' ? 'আপলোড...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateAudField('hero_image', url), 'hero')} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. HALLS */}
      {activeTab === 'halls' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h5 className="text-sm font-bold text-[#1A1207] font-serif">২. সকল মিলনায়তন ও রুমসমূহের তালিকা</h5>
              <p className="text-[11px] text-stone-500">প্রতিটি হলের ধারণক্ষমতা, ভাড়া, আসবাবপত্র, ব্যানার সাইজ ও ছবি পরিবর্তন করুন</p>
            </div>
            <button
              type="button"
              onClick={addRoom}
              className="px-3 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন রুম যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-4">
            {currentRooms.map((room: any, idx: number) => (
              <div key={room.id || idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold font-mono text-[#B8862A] text-xs">রুম #{idx + 1} (ID: {room.id || room.roomNo})</span>
                  <button
                    type="button"
                    onClick={() => deleteRoom(idx)}
                    className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] block">হলের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={room.titleBn ?? ''}
                      onChange={(e) => updateRoom(idx, 'titleBn', e.target.value)}
                      className="w-full p-2 border rounded font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] block">রুম নং ও তলা</label>
                    <input
                      type="text"
                      value={`${room.roomNo || ''} - ${room.floorBn || ''}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        updateRoom(idx, 'roomNo', parts[0]?.trim());
                        if (parts[1]) updateRoom(idx, 'floorBn', parts[1]?.trim());
                      }}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] block">ধারণক্ষমতা (আসন সংখ্যা)</label>
                    <input
                      type="text"
                      value={room.capacityBn ?? ''}
                      onChange={(e) => updateRoom(idx, 'capacityBn', e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border">
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-stone-600 block">১ম শিফট (AC ভাড়া ৳)</label>
                    <input
                      type="number"
                      value={room.singleShiftAc ?? 0}
                      onChange={(e) => updateRoom(idx, 'singleShiftAc', Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-stone-600 block">১ম শিফট (Non-AC ৳)</label>
                    <input
                      type="number"
                      value={room.singleShiftNonAc ?? 0}
                      onChange={(e) => updateRoom(idx, 'singleShiftNonAc', Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-stone-600 block">ডাবল শিফট (AC ৳)</label>
                    <input
                      type="number"
                      value={room.doubleShiftAc ?? 0}
                      onChange={(e) => updateRoom(idx, 'doubleShiftAc', Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-stone-600 block">সাউন্ড সিস্টেম ফি (৳)</label>
                    <input
                      type="number"
                      value={room.soundSystemCost ?? 0}
                      onChange={(e) => updateRoom(idx, 'soundSystemCost', Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] block">আসবাবপত্র ও সুবিধা</label>
                    <input
                      type="text"
                      value={room.furnitureBn ?? ''}
                      onChange={(e) => updateRoom(idx, 'furnitureBn', e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[11px] block">ব্যানার সাইজ</label>
                    <input
                      type="text"
                      value={room.bannerSizeBn ?? ''}
                      onChange={(e) => updateRoom(idx, 'bannerSizeBn', e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[11px] block">হলের বিবরণ (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={room.descriptionBn ?? ''}
                    onChange={(e) => updateRoom(idx, 'descriptionBn', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[11px] block">হলের ছবি URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={room.image ?? ''}
                      onChange={(e) => updateRoom(idx, 'image', e.target.value)}
                      className="flex-1 p-1.5 border rounded bg-white text-xs"
                    />
                    <label className="px-2.5 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{uploading === `room_${idx}` ? '...' : 'আপলোড'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateRoom(idx, 'image', url), `room_${idx}`)} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TERMS */}
      {activeTab === 'terms' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৩. বুকিং নিয়মাবলী ও শিফট সময়সূচি</h5>
          <div className="space-y-1">
            <label className="font-bold block">শিফট সময়সূচির বিবরণ</label>
            <textarea
              rows={3}
              value={auditoriumData.shift_timings_bn ?? '১ম শিফট (সকাল ৯:০০ - দুপুর ১:০০) | ২য় শিফট (দুপুর ২:০০ - রাত ৮:০০) | ফুল ডে শিফট (সকাল ৯:০০ - রাত ৮:০০)'}
              onChange={(e) => updateAudField('shift_timings_bn', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">বুকিং নীতিমালা ও শর্তাবলী (প্রতি লাইনে একটি করে নিয়ম)</label>
            <textarea
              rows={6}
              value={auditoriumData.booking_rules_bn ?? '১. বুকিং নিশ্চিত করতে ৫০% অগ্রিম প্রদান আবশ্যক।\\n২. রাজনৈতিক বা নিষিদ্ধ কোনো কার্যক্রম পরিচালনা করা যাবে না।\\n৩. ধূমপান ও প্লাস্টিক বর্জন কেন্দ্রে কঠোরভাবে পালনীয়।\\n৪. সাউন্ড ও আলোর ব্যবহার নির্দিষ্ট ডেসিবলের মধ্যে রাখতে হবে।'}
              onChange={(e) => updateAudField('booking_rules_bn', e.target.value)}
              className="w-full p-2 border rounded font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 4. GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h5 className="text-sm font-bold text-[#1A1207] font-serif border-b pb-2">৪. মিলনায়তন ও সেমিনার হল ফটো গ্যালারি</h5>
          <p className="text-[11px] text-stone-500">গ্যালারিতে প্রদর্শনের জন্য ছবি যুক্ত করুন</p>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((gIdx) => (
              <div key={gIdx} className="flex gap-2 items-center p-2.5 bg-stone-50 rounded-xl border">
                <span className="font-mono font-bold text-stone-400 w-6">#{gIdx + 1}</span>
                <input
                  type="text"
                  value={auditoriumData[`gallery_img_${gIdx}`] ?? ''}
                  onChange={(e) => updateAudField(`gallery_img_${gIdx}`, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2 border rounded bg-white"
                />
                <label className="px-3 py-2 bg-[#2E5942] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading === `g_${gIdx}` ? '...' : 'আপলোড'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateAudField(`gallery_img_${gIdx}`, url), `g_${gIdx}`)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
