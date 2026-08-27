// src/components/MediaLibraryModal.tsx
// Comprehensive Multi-Source Media & Image Library for BSK CMS
import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Copy,
  Plus,
} from "lucide-react";
import { getMediaLibrary, MediaItem, uploadImageToServer, getApiUrl } from "../services/cpanelApi";
import { Language } from "../types";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  language?: Language;
  currentImage?: string;
  title?: string;
}

export const staticBskLibraryImages = [
  {
    name: "BSK Main Center & Kendro Library 1",
    url: "/assets/IMGS/LIBARY/484036140_1054485683369579_2651909291206012899_n.jpg",
    category: "library",
  },
  {
    name: "BSK Central Library Reading Space",
    url: "/assets/IMGS/LIBARY/484173839_1054477563370391_4423360347440951157_n.jpg",
    category: "library",
  },
  {
    name: "BSK Book Stacks & Archives",
    url: "/assets/IMGS/LIBARY/484279184_1054485723369575_4075618552384323885_n.jpg",
    category: "library",
  },
  {
    name: "BSK Library Hall Collection",
    url: "/assets/IMGS/LIBARY/484318312_1054477440037070_1610026182586324512_n.jpg",
    category: "library",
  },
  {
    name: "BSK Library Study Area",
    url: "/assets/IMGS/LIBARY/484495050_1054485666702914_3052177565535586646_n.jpg",
    category: "library",
  },
  {
    name: "BSK Research & Resource Center",
    url: "/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg",
    category: "library",
  },
  {
    name: "BSK Main Building & Architecture 1",
    url: "/assets/IMGS/481260669_1052017186949762_8260665744101041376_n.jpg",
    category: "building",
  },
  {
    name: "BSK Main Building & Architecture 2",
    url: "/assets/IMGS/482211665_1052017196949761_6208359942702643653_n.jpg",
    category: "building",
  },
  {
    name: "Purnima Sondha Festival 1",
    url: "/assets/IMGS/PURNIMA SONDHA/482984380_1054522833365864_3595341043727603033_n.jpg",
    category: "events",
  },
  {
    name: "Purnima Sondha Literary Gathering",
    url: "/assets/IMGS/PURNIMA SONDHA/710482162_1411805830970894_1483679360212622425_n.jpg",
    category: "events",
  },
  {
    name: "Purnima Sondha Cultural Stage",
    url: "/assets/IMGS/PURNIMA SONDHA/714223583_1412738130877664_111984798886283783_n.jpg",
    category: "events",
  },
  {
    name: "Alor Jatri Cultural Group",
    url: "/assets/IMGS/PURNIMA SONDHA/alor.jpg",
    category: "events",
  },
  {
    name: "BCRS National Recitation Event",
    url: "/assets/IMGS/PURNIMA SONDHA/bcrs.jpg",
    category: "events",
  },
];

export const curatedLiteraryThemes = [
  {
    name: "Grand Classical Library",
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
  {
    name: "Literary Scholars Study",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
  {
    name: "Enlightened Book Leaves",
    url: "https://images.unsplash.com/photo-1507842229450-782124e4e918?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
  {
    name: "Modern Architectural Library",
    url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
  {
    name: "Quiet Reading Hall",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
  {
    name: "Youth Reader Discussion",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=2000&auto=format&fit=crop",
    category: "presets",
  },
];

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  language = "bn",
  currentImage,
  title,
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"uploaded" | "upload_new" | "bsk_photos" | "presets" | "custom_url">("uploaded");
  const [uploadedImages, setUploadedImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load uploaded images from server on open
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await getMediaLibrary();
      setUploadedImages(items);
    } catch (err) {
      console.warn("Failed to load media library:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setUploadProgress(language === "bn" ? "সার্ভারে আপলোড ও অপ্টিমাইজ হচ্ছে..." : "Uploading & processing image...");
      const serverUrl = await uploadImageToServer(file);
      if (serverUrl) {
        // Refresh library
        await loadMedia();
        // Select it directly
        onSelectImage(serverUrl);
        onClose();
      }
    } catch (err: any) {
      console.warn("Upload error:", err);
      // Fallback read as base64 data url
      const reader = new FileReader();
      reader.onload = (evt) => {
        const b64 = evt.target?.result as string;
        if (b64) {
          onSelectImage(b64);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (e.target) e.target.value = "";
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredUploaded = uploadedImages.filter(
    (img) => !searchQuery || img.name.toLowerCase().includes(searchQuery.toLowerCase()) || img.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#1A1207] text-white flex items-center justify-between border-b border-[#B8862A]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B8862A]/20 border border-[#B8862A]/40 flex items-center justify-center text-[#B8862A]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                {title || (language === "bn" ? "মিডিয়া ও ইমেজ লাইব্রেরি (Media Library)" : "Media & Image Library")}
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                {language === "bn"
                  ? "সার্ভার আপলোড, কেন্দ্র আর্কাইভ ও প্রিসেট ইমেজ গ্যালারি"
                  : "Server Uploads, BSK Photo Archives & Curated Presets"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="bg-stone-100 px-4 pt-3 flex flex-wrap gap-2 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab("uploaded")}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "uploaded"
                ? "bg-white text-[#2E5942] border-[#2E5942] shadow-xs"
                : "text-stone-600 hover:text-stone-900 border-transparent"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>
              {language === "bn" ? "আমার আপলোড করা ছবি" : "Uploaded Images"} ({uploadedImages.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload_new")}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "upload_new"
                ? "bg-white text-[#2E5942] border-[#2E5942] shadow-xs"
                : "text-stone-600 hover:text-stone-900 border-transparent"
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-[#B8862A]" />
            <span>{language === "bn" ? "নতুন ছবি আপলোড" : "Upload New File"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bsk_photos")}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "bsk_photos"
                ? "bg-white text-[#2E5942] border-[#2E5942] shadow-xs"
                : "text-stone-600 hover:text-stone-900 border-transparent"
            }`}
          >
            <span>\uD83C\uDFDB️ {language === "bn" ? "কেন্দ্র ও কর্মসূচি আর্কাইভ" : "BSK Campus & Programs"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "presets"
                ? "bg-white text-[#2E5942] border-[#2E5942] shadow-xs"
                : "text-stone-600 hover:text-stone-900 border-transparent"
            }`}
          >
            <span>\uD83D\uDCDA {language === "bn" ? "ব্যানার প্রিসেট (HD)" : "Curated HD Themes"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom_url")}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "custom_url"
                ? "bg-white text-[#2E5942] border-[#2E5942] shadow-xs"
                : "text-stone-600 hover:text-stone-900 border-transparent"
            }`}
          >
            <span>\uD83D\uDD17 {language === "bn" ? "সরাসরি লিঙ্ক (URL)" : "Direct URL"}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FAF7F2]/40">
          {/* TAB 1: UPLOADED IMAGES */}
          {activeTab === "uploaded" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === "bn"
                        ? "আপলোড করা ছবির নাম দিয়ে খুঁজুন..."
                        : "Search uploaded images..."
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#2E5942]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadMedia}
                    disabled={loading}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>{language === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
                  </button>
                  <label className="px-3.5 py-2 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Plus className="h-3.5 w-3.5" />
                    <span>{uploading ? (language === "bn" ? "আপলোড হচ্ছে..." : "Uploading...") : (language === "bn" ? "নতুন ছবি আপলোড" : "Upload New")}</span>
                  </label>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#B8862A]" />
                  <p className="text-xs font-medium">
                    {language === "bn" ? "সার্ভার থেকে ছবি লোড হচ্ছে..." : "Loading images from server..."}
                  </p>
                </div>
              ) : filteredUploaded.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#B8862A] flex items-center justify-center mx-auto">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800 font-serif">
                      {language === "bn"
                        ? "এখনো কোনো ছবি আপলোড করা হয়নি"
                        : "No uploaded images found"}
                    </h4>
                    <p className="text-xs text-stone-500 font-sans mt-1">
                      {language === "bn"
                        ? "আপনার কম্পিউটার থেকে নতুন ছবি আপলোড করুন অথবা কেন্দ্র আর্কাইভ ও প্রিসেট থেকে বেছে নিন।"
                        : "Upload images from your computer or pick from the BSK photo archives & presets."}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2E5942] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#1E3B2C] transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-4 w-4" />
                    <span>{language === "bn" ? "প্রথম ছবি আপলোড করুন" : "Upload First Image"}</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredUploaded.map((imgItem, idx) => {
                    const isSelected = currentImage === imgItem.url;
                    return (
                      <div
                        key={idx}
                        className={`group relative rounded-xl overflow-hidden border bg-white shadow-xs transition duration-200 flex flex-col ${
                          isSelected ? "border-2 border-[#2E5942] ring-2 ring-[#2E5942]/20" : "border-stone-200 hover:border-[#B8862A]"
                        }`}
                      >
                        <div className="aspect-video relative overflow-hidden bg-stone-100">
                          <img
                            src={imgItem.url}
                            alt={imgItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop";
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 left-2 bg-[#2E5942] text-white p-1 rounded-md shadow-xs">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 flex flex-col justify-between flex-1 space-y-2">
                          <div>
                            <p className="text-[11px] font-bold text-stone-800 truncate" title={imgItem.name}>
                              {imgItem.name}
                            </p>
                            {imgItem.date && (
                              <p className="text-[9px] text-stone-400 font-sans">
                                {new Date(imgItem.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectImage(imgItem.url);
                                onClose();
                              }}
                              className="flex-1 py-1.5 bg-[#2E5942] hover:bg-[#1E3B2C] text-white text-[10px] font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>{language === "bn" ? "ব্যবহার করুন" : "Select"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(imgItem.url)}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedUrl === imgItem.url ? (
                                <Check className="h-3 w-3 text-[#2E5942]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD NEW IMAGE */}
          {activeTab === "upload_new" && (
            <div className="max-w-xl mx-auto py-6 space-y-6 text-center">
              <div className="border-2 border-dashed border-[#2E5942]/50 bg-white rounded-3xl p-8 sm:p-10 shadow-xs hover:border-[#2E5942] hover:bg-[#2E5942]/5 transition duration-200 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#2E5942]/10 text-[#2E5942] flex items-center justify-center">
                  <Upload className={`h-8 w-8 ${uploading ? "animate-spin" : ""}`} />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    {language === "bn" ? "পিসি বা ডিভাইস থেকে ছবি নির্বাচন করুন" : "Select Image from Device"}
                  </h4>
                  <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto">
                    {language === "bn"
                      ? "JPG, PNG, WebP বা GIF ফরম্যাটের উচ্চ রেজোলিউশন ছবি আপলোড করুন।"
                      : "Supports high-resolution JPG, PNG, WebP, GIF files."}
                  </p>
                </div>

                {uploadProgress && (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold animate-pulse">
                    {uploadProgress}
                  </div>
                )}

                <label className="px-6 py-3 bg-[#2E5942] hover:bg-[#1E3B2C] text-white font-serif font-bold text-sm rounded-xl transition duration-200 shadow-md cursor-pointer inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? (language === "bn" ? "আপলোড হচ্ছে..." : "Uploading...") : (language === "bn" ? "ফাইল ব্রাউজ করুন" : "Browse Files")}</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: BSK CAMPUS & PROGRAMS ARCHIVE */}
          {activeTab === "bsk_photos" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>\uD83C\uDFDB️ {language === "bn" ? "কেন্দ্র ও লাইব্রেরি আলোকচিত্র" : "BSK Center & Library"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {staticBskLibraryImages.map((imgItem, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectImage(imgItem.url);
                        onClose();
                      }}
                      className="group relative rounded-xl overflow-hidden border border-stone-200 aspect-video cursor-pointer hover:border-[#2E5942] hover:shadow-md transition bg-stone-100"
                    >
                      <img
                        src={imgItem.url}
                        alt={imgItem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-center">
                        <span className="bg-[#2E5942] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                          {language === "bn" ? "ব্যবহার করুন" : "Select"}
                        </span>
                        <span className="text-[9px] text-white/90 mt-1 line-clamp-1">{imgItem.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CURATED HD PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>\uD83D\uDCDA {language === "bn" ? "কিউরেটেড বইপড়া ও সাহিত্য থিম (Ultra HD)" : "Curated Literary Art (Ultra HD)"}</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {curatedLiteraryThemes.map((imgItem, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectImage(imgItem.url);
                      onClose();
                    }}
                    className="group relative rounded-xl overflow-hidden border border-stone-200 aspect-video cursor-pointer hover:border-[#2E5942] hover:shadow-md transition bg-stone-100"
                  >
                    <img
                      src={imgItem.url}
                      alt={imgItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-center">
                      <span className="bg-[#2E5942] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        {language === "bn" ? "ব্যবহার করুন" : "Select"}
                      </span>
                      <span className="text-[9px] text-white/90 mt-1 line-clamp-1">{imgItem.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DIRECT URL INPUT */}
          {activeTab === "custom_url" && (
            <div className="max-w-xl mx-auto py-8 space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-stone-800 font-serif">
                  {language === "bn" ? "সরাসরি ছবির লিঙ্ক (Image URL) প্রবেশ করান" : "Enter Direct Image Link"}
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://... অথবা ./uploads/..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#2E5942]"
                  />
                  <p className="text-[10px] text-stone-500 font-sans">
                    {language === "bn"
                      ? "বাহ্যিক ওয়েব লিঙ্ক বা সার্ভার পাথ সরাসরি পেস্ট করতে পারেন।"
                      : "You can paste any direct web image URL or relative server path."}
                  </p>
                </div>

                {customUrlInput && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={customUrlInput}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={!customUrlInput.trim()}
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      onSelectImage(customUrlInput.trim());
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 bg-[#2E5942] hover:bg-[#1E3B2C] disabled:opacity-50 text-white font-serif font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>{language === "bn" ? "এই ছবিটি সংরক্ষণ ও প্রয়োগ করুন" : "Apply Custom Image URL"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex justify-between items-center text-xs">
          <span className="text-stone-500 font-sans text-[11px]">
            {language === "bn" ? "বিশ্বসাহিত্য কেন্দ্র মিডিয়া ও ইমেজ হাব" : "BSK Media Hub"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded-xl border border-stone-200 transition cursor-pointer"
          >
            {language === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
