import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, X, Check, Sliders, Sparkles, RefreshCw, AlertCircle, 
  Crop, Maximize, FileImage, ShieldAlert, SlidersHorizontal, Image as ImageIcon
} from 'lucide-react';

interface ImageResizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resizedBase64: string) => void;
  language: 'bn' | 'en';
  aspectRatioPreset?: 'banner' | 'landscape' | 'square' | 'portrait' | 'any';
}

export default function ImageResizer({ 
  isOpen, 
  onClose, 
  onSave, 
  language, 
  aspectRatioPreset = 'landscape' 
}: ImageResizerProps) {
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  
  // Custom Controls state
  const [preset, setPreset] = useState<string>(aspectRatioPreset);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [cropMode, setCropMode] = useState<'cover' | 'contain' | 'stretch' | 'blur_fill'>('cover');
  const [quality, setQuality] = useState<number>(0.92);
  const [autoResize, setAutoResize] = useState<boolean>(true);
  const [keepRawLossless, setKeepRawLossless] = useState<boolean>(false);
  const [rawDataUrl, setRawDataUrl] = useState<string>('');
  const [resizedDataUrl, setResizedDataUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preset when context changes
  useEffect(() => {
    setPreset(aspectRatioPreset);
  }, [aspectRatioPreset]);

  // Handle dimensions updates based on preset selection
  useEffect(() => {
    if (autoResize && !keepRawLossless) {
      applyPresetProps(preset);
    }
  }, [preset, autoResize, keepRawLossless, originalWidth, originalHeight]);

  // Regenerate resized image thumbnail when any control state changes
  useEffect(() => {
    if (originalImage) {
      if (keepRawLossless) {
        setResizedDataUrl(rawDataUrl);
      } else {
        setIsProcessing(true);
        const timer = setTimeout(() => {
          processCanvasImage();
          setIsProcessing(false);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [originalImage, width, height, cropMode, quality, autoResize, keepRawLossless, preset, rawDataUrl]);

  if (!isOpen) return null;

  function applyPresetProps(selectedPreset: string) {
    switch (selectedPreset) {
      case 'banner':
        setWidth(2400);
        setHeight(900);
        setCropMode('cover');
        break;
      case 'landscape':
        setWidth(1920);
        setHeight(1080);
        setCropMode('cover');
        break;
      case 'portrait':
        setWidth(1200);
        setHeight(1600);
        setCropMode('cover');
        break;
      case 'square':
        setWidth(1200);
        setHeight(1200);
        setCropMode('cover');
        break;
      case 'any':
      default:
        setQuality(0.98);
        if (originalWidth > 0 && originalHeight > 0) {
          // Keep original's aspect ratio up to a high-def cap (2400px)
          const maxDim = 2400;
          if (originalWidth > maxDim || originalHeight > maxDim) {
            const ratio = originalWidth / originalHeight;
            if (originalWidth > originalHeight) {
              setWidth(maxDim);
              setHeight(Math.round(maxDim / ratio));
            } else {
              setHeight(maxDim);
              setWidth(Math.round(maxDim * ratio));
            }
          } else {
            setWidth(originalWidth);
            setHeight(originalHeight);
          }
        }
        break;
    }
  }

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' 
        ? 'দয়া করে একটি সঠিক ইমেজ ফাইল নির্বাচন করুন!' 
        : 'Please select a valid image file!');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setRawDataUrl(dataUri);
      const img = document.createElement('img');
      img.onload = () => {
        setOriginalImage(img);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        
        // Auto trigger dimension settings
        if (autoResize) {
          const startingPreset = preset === 'any' ? 'any' : preset;
          applyPresetProps(startingPreset);
        } else {
          // Custom manual default to what was loaded caps
          setWidth(img.width > 1200 ? 1200 : img.width);
          setHeight(img.height > 800 ? 800 : img.height);
        }
        setIsProcessing(false);
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  function processCanvasImage() {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    let targetW = width;
    let targetH = height;

    // Safety constraints
    if (targetW <= 0) targetW = 100;
    if (targetH <= 0) targetH = 100;

    canvas.width = targetW;
    canvas.height = targetH;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable superior browser subpixel downscaling and smoothing (prevents blurriness)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Solid container background in case of transparent background or contain layout
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const imgRatio = originalWidth / originalHeight;
    const targetRatio = targetW / targetH;

    if (cropMode === 'stretch') {
      ctx.drawImage(originalImage, 0, 0, targetW, targetH);
    } else if (cropMode === 'cover') {
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = originalWidth;
      let sourceHeight = originalHeight;

      if (imgRatio > targetRatio) {
        sourceWidth = originalHeight * targetRatio;
        sourceX = (originalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = originalWidth / targetRatio;
        sourceY = (originalHeight - sourceHeight) / 2;
      }

      ctx.drawImage(
        originalImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetW,
        targetH
      );
    } else if (cropMode === 'contain') {
      // Contain logic with centered bounding bars
      let drawW = targetW;
      let drawH = targetH;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        drawH = targetW / imgRatio;
        offsetY = (targetH - drawH) / 2;
      } else {
        drawW = targetH * imgRatio;
        offsetX = (targetW - drawW) / 2;
      }

      ctx.drawImage(
        originalImage, 
        0, 
        0, 
        originalWidth, 
        originalHeight, 
        offsetX, 
        offsetY, 
        drawW, 
        drawH
      );
    } else if (cropMode === 'blur_fill') {
      // 1. Draw blurred and dim cover background
      try {
        ctx.filter = 'blur(16px) brightness(0.85)';
      } catch (err) {}
      
      let bgSourceX = 0;
      let bgSourceY = 0;
      let bgSourceWidth = originalWidth;
      let bgSourceHeight = originalHeight;

      if (imgRatio > targetRatio) {
        bgSourceWidth = originalHeight * targetRatio;
        bgSourceX = (originalWidth - bgSourceWidth) / 2;
      } else {
        bgSourceHeight = originalWidth / targetRatio;
        bgSourceY = (originalHeight - bgSourceHeight) / 2;
      }

      ctx.drawImage(
        originalImage,
        bgSourceX,
        bgSourceY,
        bgSourceWidth,
        bgSourceHeight,
        0,
        0,
        targetW,
        targetH
      );

      // Disable filter for drawing the main centered photo crisply
      try {
        ctx.filter = 'none';
      } catch (err) {}

      // Add a nice semi-transparent light modal back-plate
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, targetW, targetH);

      // 2. Center-contain the high-res crisp image with drop shadow
      let drawW = targetW;
      let drawH = targetH;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        drawH = targetW / imgRatio;
        offsetY = (targetH - drawH) / 2;
      } else {
        drawW = targetH * imgRatio;
        offsetX = (targetW - drawW) / 2;
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      ctx.drawImage(
        originalImage, 
        0, 
        0, 
        originalWidth, 
        originalHeight, 
        offsetX, 
        offsetY, 
        drawW, 
        drawH
      );

      // Reset shadows
      ctx.shadowColor = 'rgba(0,0,0,0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Export to small, high quality, compatible direct base64 string URI
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    setResizedDataUrl(dataUrl);
  }

  const calculateSizeKb = () => {
    if (!resizedDataUrl) return 0;
    const base64Content = resizedDataUrl.split(',')[1];
    if (!base64Content) return 0;
    return Math.round((base64Content.length * 3) / 4 / 1024);
  };

  const handleSaveResult = () => {
    if (!resizedDataUrl) return;
    onSave(resizedDataUrl);
    onClose();
  };

  const clearSelectedImage = () => {
    setOriginalImage(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setResizedDataUrl('');
    setFileName('');
  };

  const sizeKb = calculateSizeKb();

  return (
    <div className="fixed inset-0 z-[10005] bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-3xl border border-[#B8862A]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Title */}
        <div className="bg-[#2E5942] text-white px-6 py-4 flex items-center justify-between border-b border-[#B8862A]/25">
          <div className="flex items-center space-x-2.5">
            <ImageIcon className="h-5 w-5 text-[#F0CC7A]" />
            <div>
              <h3 className="text-sm md:text-base font-bold text-white font-serif">
                {language === 'bn' ? 'ছবি আপলোড ও ইমেজ রিসাইজার টুল' : 'Image Upload & Interactive Canvas Resizer'}
              </h3>
              <p className="text-[10px] text-stone-200">
                {language === 'bn' ? 'পিক্সেল অপ্টিমাইজেশন ও ফাইল সাইজ রিডাকশন কন্ট্রোল' : 'Optimize coordinates, crop bounds & reduce payload size'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* LEFT: IMAGE PREVIEWS OR UPLOADER */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            
            {!originalImage ? (
              /* DRAG DROP ZONE */
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-3 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition duration-200 cursor-pointer min-h-[250px] ${
                  dragActive 
                    ? 'border-[#2E5942] bg-[#2E5942]/5 scale-[0.99]' 
                    : 'border-[#B8862A]/25 hover:border-[#2E5942] bg-white hover:bg-stone-50/50'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleInputChange}
                  accept="image/*"
                  className="hidden" 
                />
                <div className="p-4 bg-[#2E5942]/10 rounded-full text-[#2E5942] mb-3 border border-[#2E5942]/10">
                  <Upload className="h-8 w-8 text-[#B8862A] animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">
                  {language === 'bn' ? 'এখানে ছবি ড্র্যাগ করুন অথবা ক্লিক করে ফাইল সিলেক্ট করুন' : 'Drag & Drop your image here or Click to select'}
                </h4>
                <p className="text-xs text-stone-500 mt-1.5 max-w-xs font-serif leading-normal">
                  {language === 'bn' 
                    ? 'যেকোনো PNG, JPG বা WEBP ছবি দিন, অটো রিসাইজ হয়ে নিখুঁত মাপে ওয়েবসাইটে যুক্ত হবে।' 
                    : 'Compatible with standard image types. Resizer will apply perfect aspect configurations instantly.'}
                </p>
              </div>
            ) : (
              /* LIVE EXPERIMENTAL PREVIEWS */
              <div className="flex-1 flex flex-col justify-center space-y-4">
                
                {/* Image Details block */}
                <div className="bg-white border rounded-xl p-3 flex justify-between items-center text-[11px] text-stone-600">
                  <div className="truncate pr-2">
                    <span className="font-bold text-[#2E5942]">{language === 'bn' ? 'মূল ফাইল: ' : 'Original: '}</span>
                    <span className="font-mono">{fileName || 'Uploaded_image.jpg'}</span>
                  </div>
                  <div className="shrink-0 font-mono text-stone-500 font-bold">
                    {originalWidth} x {originalHeight} px
                  </div>
                </div>

                {/* Main Resized Preview Block */}
                <div className="relative border bg-stone-200 rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner group">
                  {isProcessing ? (
                    <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center backdrop-blur-xs z-10">
                      <RefreshCw className="h-8 w-8 text-[#2E5942] animate-spin" />
                    </div>
                  ) : null}
                  
                  {resizedDataUrl ? (
                    <img 
                      src={resizedDataUrl} 
                      alt="Optimized Preview" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <div className="text-xs text-stone-400">Processing bounds...</div>
                  )}

                  {/* Absolute Badge showing real-time file analytics */}
                  <div className="absolute bottom-2 left-2 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] text-[#F0CC7A] font-mono font-bold flex items-center gap-1">
                    <span>✨ {language === 'bn' ? (keepRawLossless ? 'আসল ফাইলের সাইজ: ' : 'রিসাইজড সাইজ: ') : (keepRawLossless ? 'Original Size: ' : 'Optimized Payload: ')}</span>
                    <span className="text-white text-xs">{sizeKb} KB</span>
                  </div>

                  {/* Absolute Badge showing dimensions */}
                  <div className="absolute top-2 right-2 bg-[#2E5942]/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-white font-mono font-bold">
                    {keepRawLossless ? originalWidth : width} x {keepRawLossless ? originalHeight : height} px
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={clearSelectedImage}
                    className="text-[10px] uppercase tracking-wider font-bold text-red-700 hover:text-red-950 flex items-center gap-1 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    {language === 'bn' ? 'অন্য ছবি সিলেক্ট করুন' : 'Clear & pick another'}
                  </button>

                  <div className="text-[10px] text-stone-400 italic">
                    {language === 'bn' 
                      ? (keepRawLossless ? '* ওরিজিনাল কোয়ালিটি পুরোপুরি সংরক্ষিত' : '* ডাটাবেস গতি ঠিক রাখার জন্য ছবি অটো কম্প্রেসড হবে') 
                      : (keepRawLossless ? '* 100% original lossless quality preserved' : '* Auto compressed to preserve page speed buffers')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: CONTROLS & PARMS SETTING */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#B8862A]/15 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              
              {/* Option toggle: Auto versus Manual */}
              <div className={`border rounded-xl p-3.5 space-y-2 transition ${keepRawLossless ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-[#2E5942]/5 border-[#2E5942]/10'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoResize}
                    disabled={keepRawLossless}
                    onChange={(e) => setAutoResize(e.target.checked)}
                    className="h-4 w-4 text-[#2E5942] rounded focus:ring-[#2E5942] cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-xs font-extrabold text-[#1C3E2D] flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#B8862A]" />
                    {language === 'bn' ? 'অটো রিসাইজ (প্রস্তাবিত)' : 'Auto Resize (Highly Recommended)'}
                  </span>
                </label>
                <p className="text-[9px] text-stone-600 font-serif leading-relaxed pl-6">
                  {language === 'bn' 
                    ? 'এটি অন থাকলে ছবি স্বয়ংক্রিয়ভাবে ওয়েবসাইটের ফ্রেমের সাথে মিলিয়ে পারফেক্ট সাইজ ও রেশিওতে কনভার্ট হবে।' 
                    : 'Automatically scales image to the strict pixel matrices matching the target compartment.'}
                </p>
              </div>

              {/* Raw Lossless bypass */}
              <div className={`border rounded-xl p-3.5 space-y-2 transition ${keepRawLossless ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={keepRawLossless}
                    onChange={(e) => {
                      setKeepRawLossless(e.target.checked);
                      if (e.target.checked) {
                        setAutoResize(false);
                      } else {
                        setAutoResize(true);
                      }
                    }}
                    className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                    <FileImage className="h-3.5 w-3.5 text-amber-600" />
                    {language === 'bn' ? 'ওরিজিনাল ফাইল রাখুন (কোনো পরিবর্তন ছাড়া)' : 'Keep Raw Original (Lossless / Uncut)'}
                  </span>
                </label>
                <p className="text-[9px] text-stone-600 font-serif leading-relaxed pl-6">
                  {language === 'bn' 
                    ? 'ছবি রিসাইজ বা কম্প্রেশন ছাড়াই হুবহু আপনার আপলোড করা ফাইলে সেভ হবে। বইয়ের কভার বা মেম্বার ফটোর শার্পনেস পুরোপুরি নিখুঁত বজায় থাকবে।' 
                    : 'Uploads the exact source file with absolutely zero cropping, quality degradation, or pixel scaling.'}
                </p>
              </div>

              {/* Preset selection - shown if auto resize is on, but can be switched always */}
              <div className={`space-y-1.5 transition ${keepRawLossless ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-widest block">
                  {language === 'bn' ? 'সাইজ ক্যাটাগরি প্রিসেট' : 'Dimension Presets'}
                </label>
                <select 
                  value={preset}
                  disabled={keepRawLossless}
                  onChange={(e) => {
                    setPreset(e.target.value);
                    if (e.target.value !== 'custom') {
                      applyPresetProps(e.target.value);
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-850"
                >
                  <option value="banner">{language === 'bn' ? 'প্রথম ব্যানার ব্যাকিং (১৬০০ x ৬০০)' : 'Top Hero Carousel Banner (1600x600)'}</option>
                  <option value="landscape">{language === 'bn' ? 'কার্যক্রম / গ্যালারি ল্যান্ডস্কেপ (৮০০ x ৫০০)' : 'Activity & Galleries Standard (800x500)'}</option>
                  <option value="square">{language === 'bn' ? 'বর্গাকার প্রতিকৃতি (৪০০ x ৪০০)' : 'Founder Square portrait (400x400)'}</option>
                  <option value="portrait">{language === 'bn' ? 'খাড়া পোর্ট্রেট (৪০০ x ৫০০)' : 'Secondary Portrait (400x500)'}</option>
                  <option value="any">{language === 'bn' ? 'মূল অনুপাত বজায় রাখুন' : 'Save Original Proportions'}</option>
                  <option value="custom">{language === 'bn' ? 'কাস্টম সাইজ (ম্যানুয়াল অ্যাডজাস্ট)' : 'Custom Manual Control'}</option>
                </select>
              </div>

              {/* Manual inputs - enabled if not autoResize or manual picked */}
              {(!autoResize || preset === 'custom') && !keepRawLossless && (
                <div className="p-3 bg-white border rounded-xl space-y-3.5 animate-slideDown">
                  <h5 className="text-[10px] font-bold text-[#B8862A] uppercase tracking-wide flex items-center gap-1 border-b pb-1">
                    <Sliders className="h-3 w-3" />
                    {language === 'bn' ? 'ম্যানুয়াল ডাইমেনশন স্লাইডার' : 'Manual Dimension Controls'}
                  </h5>
                  
                  {/* Width Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-600 font-bold">{language === 'bn' ? 'প্রস্থ (Width):' : 'Width:'}</span>
                      <span className="font-mono bg-stone-100 p-0.5 rounded font-bold px-1.5">{width}px</span>
                    </div>
                    <input 
                      type="range" 
                      min={100} 
                      max={2000} 
                      step={20}
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value))}
                      className="w-full accent-[#2E5942]" 
                    />
                  </div>

                  {/* Height Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-600 font-bold">{language === 'bn' ? 'উচ্চতা (Height):' : 'Height:'}</span>
                      <span className="font-mono bg-stone-100 p-0.5 rounded font-bold px-1.5">{height}px</span>
                    </div>
                    <input 
                      type="range" 
                      min={100} 
                      max={1500} 
                      step={20}
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      className="w-full accent-[#2E5942]" 
                    />
                  </div>
                </div>
              )}

              {/* Crop Mode Selection */}
              <div className={`space-y-1.5 transition ${keepRawLossless ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-widest block">
                  {language === 'bn' ? 'ক্রপিং এডজাস্টমেন্ট মোড' : 'Fitting & Cropping Style'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-center">
                  <button
                    onClick={() => setCropMode('cover')}
                    disabled={keepRawLossless}
                    className={`p-2 rounded-lg border text-[10px] font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      cropMode === 'cover'
                        ? 'border-[#2E5942] bg-[#2E5942]/10 text-[#1E3B2C] ring-2 ring-[#2E5942]/40 font-extrabold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Crop className="h-3.5 w-3.5 text-[#2E5942]" />
                    <span>{language === 'bn' ? 'কাট-ফিট (Cover)' : 'Cover Fit'}</span>
                  </button>

                  <button
                    onClick={() => setCropMode('contain')}
                    disabled={keepRawLossless}
                    className={`p-2 rounded-lg border text-[10px] font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      cropMode === 'contain'
                        ? 'border-[#2E5942] bg-[#2E5942]/10 text-[#1E3B2C] ring-2 ring-[#2E5942]/40 font-extrabold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Maximize className="h-3.5 w-3.5 rotate-45 text-[#2E5942]" />
                    <span>{language === 'bn' ? 'সম্পূর্ণ (Contain)' : 'Contain All'}</span>
                  </button>

                  <button
                    onClick={() => setCropMode('stretch')}
                    disabled={keepRawLossless}
                    className={`p-2 rounded-lg border text-[10px] font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      cropMode === 'stretch'
                        ? 'border-[#2E5942] bg-[#2E5942]/10 text-[#1E3B2C] ring-2 ring-[#2E5942]/40 font-extrabold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#2E5942]" />
                    <span>{language === 'bn' ? 'টেনে মেলানো' : 'Stretch'}</span>
                  </button>

                  {/* PREMIUM GLASS BLUR FILL */}
                  <button
                    onClick={() => setCropMode('blur_fill')}
                    disabled={keepRawLossless}
                    className={`p-2 rounded-lg border text-[10px] font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      cropMode === 'blur_fill'
                        ? 'border-[#B8862A] bg-[#B8862A]/10 text-amber-950 ring-2 ring-[#B8862A]/50 font-extrabold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#B8862A] animate-pulse" />
                    <span>{language === 'bn' ? 'স্মার্ট ব্লার (Blur Fill)' : 'Smart blur fit'}</span>
                  </button>
                </div>
              </div>

              {/* Compression Quality */}
              <div className={`space-y-1 transition ${keepRawLossless ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-700 font-bold uppercase tracking-widest">{language === 'bn' ? 'ছবি কম্প্রেশন কোয়ালিটি' : 'Compression Quality'}</span>
                  <span className="font-mono text-stone-600 font-bold">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min={0.10} 
                  max={0.98} 
                  step={0.05}
                  value={quality}
                  disabled={keepRawLossless}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-[#B8862A]" 
                />
                <div className="text-[8px] text-stone-500 py-0.5 leading-tight">
                  {language === 'bn' 
                    ? '* কোয়ালিটি সামান্য কমালে ছবির রেজোলিউশন ঠিক রেখে ফাইলের সাইজ বহুগুণে ছোট হয়।' 
                    : 'Reduces heavy image weights down to standard load thresholds without visual degradations.'}
                </div>
              </div>

            </div>

            {/* Submit / Finish save triggers */}
            <div className="space-y-2 pt-4 border-t border-[#B8862A]/10 mt-auto">
              
              {/* Upload Notification for MySQL storage */}
              {sizeKb > 5000 ? (
                <div className="flex gap-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[10.5px]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {language === 'bn'
                      ? `ফাইলের সাইজ অনেক বড় (${sizeKb} KB)। আপনার MySQL ডাটাবেজে এটি সরাসরি সেভ হবে। তবে ওয়েবসাইটের স্পিড আরও ফাস্ট রাখতে চাইলে ছবির রেজোলিউশন অপ্টিমাইজ করে নিতে পারেন।`
                      : `Large file (${sizeKb} KB). It will be saved directly to your MySQL database. You can optimize dimensions for faster webpage loading.`}
                  </span>
                </div>
              ) : null}

              <button
                onClick={handleSaveResult}
                disabled={!resizedDataUrl}
                className={`w-full py-3 rounded-xl text-xs font-bold font-sans tracking-wide uppercase flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ${
                  resizedDataUrl
                    ? 'bg-[#2E5942] hover:bg-[#1E3B2C] text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{language === 'bn' ? 'ছবি সিলেক্ট ও কোয়ালিটি কনফার্ম করুন' : 'Confirm & Apply Image'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 border border-stone-250 hover:bg-stone-100 text-stone-600 text-[11px] font-bold rounded-lg transition"
              >
                {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
