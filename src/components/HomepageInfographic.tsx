import React, { useState } from 'react';
import { 
  Lightbulb, Settings, Clock, Search, MessageSquare, Trophy, 
  BookOpen, Sparkles, Compass, HeartHandshake, Award, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Language } from '../types';

export interface InfographicNodeItem {
  id?: string;
  position_label_bn?: string;
  position_label_en?: string;
  title_bn?: string;
  title_en?: string;
  desc_bn?: string;
  desc_en?: string;
  icon?: string; // emoji or key
  color?: string; // hex
  ring_color?: string;
  metric?: string;
}

export interface InfographicData {
  center_title_bn?: string;
  center_title_en?: string;
  center_subtitle_bn?: string;
  center_subtitle_en?: string;
  center_badge_bn?: string;
  center_badge_en?: string;
  badge_bn?: string;
  badge_en?: string;
  title_bn?: string;
  title_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  items?: InfographicNodeItem[];
}

interface HomepageInfographicProps {
  data?: InfographicData | null;
  language: Language;
}

export const defaultInfographicNodes: InfographicData = {
  center_title_bn: 'কর্মপ্রবাহ ও স্তম্ভ',
  center_title_en: 'INFOGRAPHICS',
  center_subtitle_bn: 'বিশ্বসাহিত্য কেন্দ্র রূপরেখা',
  center_subtitle_en: 'CORE ELEMENTS',
  center_badge_bn: 'আলোকিত সমাজ বিনির্মাণ',
  center_badge_en: 'Enlightened Society',
  items: [
    {
      position_label_bn: 'পদ্ধতি ০১',
      position_label_en: 'POSITION A',
      title_bn: 'জ্ঞান ও বইয়ের আলো',
      title_en: 'Vision & Ideation',
      desc_bn: 'দেশব্যাপী সুখপাঠ্য মননশীল বইয়ের মাধ্যমে নতুন প্রজন্মের অন্তরে উচ্চতর জীবনাকাঙ্ক্ষা ও মূল্যবোধ জাগ্রত করা।',
      desc_en: 'Cultivating visionary thinking and noble human values through quality literature.',
      icon: '💡',
      color: '#F59E0B',
      ring_color: '#FBBF24'
    },
    {
      position_label_bn: 'পদ্ধতি ০২',
      position_label_en: 'POSITION B',
      title_bn: 'সুসংগঠিত পরিচালনা',
      title_en: 'Execution & Operations',
      desc_bn: 'দেশজুড়ে ২৫০+ উপজেলায় ১২,৯১৭টি শিক্ষাপ্রতিষ্ঠানে কার্যকর ও সুবিন্যস্ত বইপড়া নেটওয়ার্ক পরিচালনা।',
      desc_en: 'Operating a nationwide reading network across 250+ upazilas and 12,000+ schools.',
      icon: '⚙️',
      color: '#06B6D4',
      ring_color: '#22D3EE'
    },
    {
      position_label_bn: 'পদ্ধতি ০৩',
      position_label_en: 'POSITION C',
      title_bn: 'নিয়মানুবর্তিতা ও সময়ানুগ সেবা',
      title_en: 'Timely Outreach',
      desc_bn: 'প্রতিটি শিক্ষাবর্ষে সময়মতো বই বিতরণ, পাঠচক্র মূল্যায়ন এবং ভ্রাম্যমাণ গাড়িবহরের নিয়মিত রুট পরিচালনা।',
      desc_en: 'Ensuring on-time book distribution, routine assessments, and active mobile fleets.',
      icon: '⏰',
      color: '#EF4444',
      ring_color: '#F87171'
    },
    {
      position_label_bn: 'পদ্ধতি ০৪',
      position_label_en: 'POSITION D',
      title_bn: 'গভীর গবেষণা ও দর্শন',
      title_en: 'Inquiry & Philosophy',
      desc_bn: 'বিশ্বের শ্রেষ্ঠ দর্শন, সাহিত্য, বিজ্ঞান ও শিল্পকলা নিয়ে গভীর পঠন-পাঠন এবং তরুণদের বিশ্লেষণী চিন্তার বিকাশ।',
      desc_en: 'In-depth research and critical study of world literature and philosophy.',
      icon: '🔍',
      color: '#D946EF',
      ring_color: '#E879F9'
    },
    {
      position_label_bn: 'পদ্ধতি ০৫',
      position_label_en: 'POSITION E',
      title_bn: 'উন্মুক্ত আলোচনা ও মতবিনিময়',
      title_en: 'Dialogue & Discourse',
      desc_bn: 'নিয়মিত পাঠচক্র, সাহিত্য আড্ডা এবং মুক্ত সংলাপের মাধ্যমে পরমতসহিষ্ণু মানবিক সমাজ গঠন।',
      desc_en: 'Interactive dialogues, debates, and seminars nurturing an empathetic culture.',
      icon: '💬',
      color: '#0EA5E9',
      ring_color: '#38BDF8'
    },
    {
      position_label_bn: 'পদ্ধতি ০৬',
      position_label_en: 'POSITION F',
      title_bn: 'সাফল্য ও আলোকিত জাতি',
      title_en: 'Excellence & Impact',
      desc_bn: 'কোটি মানুষের জীবনে আলোর স্পর্শ এবং মানবিক গুণসম্পন্ন আলোকিত ভবিষ্যৎ নেতৃত্ব তৈরি।',
      desc_en: 'Empowering millions with enlightenment, awards, and noble leadership.',
      icon: '🏆',
      color: '#84CC16',
      ring_color: '#A3E635'
    }
  ]
};

export const HomepageInfographic: React.FC<HomepageInfographicProps> = ({ data, language }) => {
  const [activeNodeIdx, setActiveNodeIdx] = useState<number | null>(null);

  const merged: InfographicData = {
    ...defaultInfographicNodes,
    ...(data || {}),
    items: Array.isArray(data?.items) && data.items.length > 0 
      ? data.items 
      : defaultInfographicNodes.items
  };

  const centerTitle = language === 'bn' 
    ? (merged.center_title_bn || merged.title_bn || defaultInfographicNodes.center_title_bn) 
    : (merged.center_title_en || merged.title_en || defaultInfographicNodes.center_title_en);

  const centerSubtitle = language === 'bn' 
    ? (merged.center_subtitle_bn || defaultInfographicNodes.center_subtitle_bn) 
    : (merged.center_subtitle_en || defaultInfographicNodes.center_subtitle_en);

  const items = (merged.items || defaultInfographicNodes.items!).slice(0, 6);

  // Rainbow dot colors below center hub
  const rainbowDots = ['#F59E0B', '#06B6D4', '#EF4444', '#D946EF', '#0EA5E9', '#84CC16'];

  return (
    <section className="w-full my-6 md:my-10 animate-fade-in font-sans text-left">
      <div className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-2 border-[#E8DDD0] rounded-3xl p-6 sm:p-8 lg:p-12 shadow-sm overflow-hidden relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#B8862A]/5 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ── DESKTOP & TABLET ARC VISUAL INFOGRAPHIC (md & above) ── */}
        <div className="hidden md:block relative w-full max-w-5xl mx-auto">
          
          {/* 1. CENTER TOP HERO CIRCLE HUB */}
          <div className="flex justify-center relative z-20 mb-8">
            <div className="relative group">
              {/* Outer soft shadow aura */}
              <div className="absolute -inset-3 bg-gradient-to-b from-stone-200/50 to-stone-100/30 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
              
              {/* Center White Neumorphic Hub */}
              <div className="relative w-56 h-56 lg:w-64 lg:h-64 rounded-full bg-gradient-to-b from-white via-[#FDFCFA] to-[#F7F4EE] border-4 border-white shadow-[0_15px_35px_rgba(0,0,0,0.08),0_5px_15px_rgba(0,0,0,0.04),inset_0_-4px_6px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center p-6 text-center">
                
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#8C6212] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#B8862A]/20 mb-1.5 shadow-2xs">
                  {language === 'bn' ? (merged.center_badge_bn || 'ইনফোগ্রাফ এলিমেন্টস') : (merged.center_badge_en || 'INFOGRAPHICS')}
                </span>

                <h3 className="font-serif text-xl lg:text-2xl font-black text-[#1A1207] tracking-tight leading-tight uppercase">
                  {centerTitle}
                </h3>

                <p className="text-[11px] font-sans font-semibold text-stone-500 tracking-wider uppercase mt-1">
                  {centerSubtitle}
                </p>

                {/* 6 Cute Rainbow Indicator Dots */}
                <div className="flex items-center gap-2 mt-3">
                  {rainbowDots.map((dot, dIdx) => (
                    <span 
                      key={dIdx} 
                      className={`w-2 h-2 rounded-full transition-transform duration-300 ${activeNodeIdx === dIdx ? 'scale-150 shadow-xs' : 'opacity-80'}`}
                      style={{ backgroundColor: dot }}
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* 2. SVG CONNECTING ARC & DOT CONNECTOR NODES */}
          <div className="absolute top-[110px] left-0 right-0 w-full h-[180px] pointer-events-none z-10">
            <svg viewBox="0 0 1000 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Main curved smooth connecting bridge line */}
              <path
                d="M 120,10 Q 500,210 880,10"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 120,10 Q 500,210 880,10"
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 6"
              />

              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="20%" stopColor="#06B6D4" />
                  <stop offset="40%" stopColor="#EF4444" />
                  <stop offset="60%" stopColor="#D946EF" />
                  <stop offset="80%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#84CC16" />
                </linearGradient>
              </defs>

              {/* 6 Connector Nodes along the curve */}
              <circle cx="140" cy="18" r="7" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
              <circle cx="280" cy="78" r="7" fill="#FFFFFF" stroke="#06B6D4" strokeWidth="4" />
              <circle cx="420" cy="108" r="7" fill="#FFFFFF" stroke="#EF4444" strokeWidth="4" />
              <circle cx="580" cy="108" r="7" fill="#FFFFFF" stroke="#D946EF" strokeWidth="4" />
              <circle cx="720" cy="78" r="7" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="4" />
              <circle cx="860" cy="18" r="7" fill="#FFFFFF" stroke="#84CC16" strokeWidth="4" />
            </svg>
          </div>

          {/* 3. 6 RADIATING LAYERED CIRCULAR BUTTONS & POSITION DESCRIPTIONS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 relative z-20 pt-4">
            {items.map((node, idx) => {
              const isHovered = activeNodeIdx === idx;
              const nodeColor = node.color || rainbowDots[idx % rainbowDots.length];
              const ringColor = node.ring_color || nodeColor;
              const posLabel = language === 'bn' ? (node.position_label_bn || `পজিশন ০${idx + 1}`) : (node.position_label_en || `POSITION ${String.fromCharCode(65 + idx)}`);
              const nodeTitle = language === 'bn' ? node.title_bn : node.title_en;
              const nodeDesc = language === 'bn' ? node.desc_bn : node.desc_en;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveNodeIdx(idx)}
                  onMouseLeave={() => setActiveNodeIdx(null)}
                  className="flex flex-col items-center text-center space-y-4 group cursor-pointer transition-all duration-300"
                >
                  
                  {/* Layered 3D Button Node Frame */}
                  <div className="relative">
                    {/* Outer Dashed Colored Orbit Ring */}
                    <div 
                      className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full border-2 border-dashed p-1 flex items-center justify-center transition-all duration-500 ${
                        isHovered ? 'scale-110 rotate-45' : 'group-hover:scale-105'
                      }`}
                      style={{ borderColor: ringColor }}
                    >
                      {/* Mid Neumorphic Solid Colored Disc */}
                      <div 
                        className="w-full h-full rounded-full p-2 flex items-center justify-center shadow-lg transition-transform duration-300"
                        style={{ 
                          backgroundColor: nodeColor,
                          boxShadow: `0 10px 25px ${nodeColor}40, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 4px rgba(0,0,0,0.15)`
                        }}
                      >
                        {/* Inner White Glossy Button Core with Icon */}
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-stone-50 flex items-center justify-center text-2xl lg:text-3xl shadow-inner border border-white">
                          <span className="group-hover:scale-115 transition-transform duration-300">
                            {node.icon || '✨'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1.5 px-1">
                    <div 
                      className="font-mono text-xs font-black tracking-wider uppercase transition-colors"
                      style={{ color: nodeColor }}
                    >
                      {posLabel}
                    </div>

                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1A1207] leading-snug group-hover:text-[#8C6212] transition-colors">
                      {nodeTitle}
                    </h4>

                    <p className="text-[11px] text-stone-500 font-sans font-light leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      {nodeDesc}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* ── MOBILE ACCORDION / STACKED VIEW (sm screens) ── */}
        <div className="block md:hidden space-y-6">
          {/* Center Hub */}
          <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-b from-white to-[#FAF7F2] border-4 border-white shadow-xl flex flex-col items-center justify-center p-4 text-center">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8C6212] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#B8862A]/20 mb-1">
              {language === 'bn' ? (merged.center_badge_bn || 'ইনফোগ্রাফ') : (merged.center_badge_en || 'INFOGRAPHICS')}
            </span>
            <h3 className="font-serif text-base font-black text-[#1A1207] uppercase">
              {centerTitle}
            </h3>
            <p className="text-[10px] font-sans font-semibold text-stone-500 uppercase mt-0.5">
              {centerSubtitle}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {rainbowDots.map((dot, dIdx) => (
                <span key={dIdx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
              ))}
            </div>
          </div>

          {/* Node Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((node, idx) => {
              const nodeColor = node.color || rainbowDots[idx % rainbowDots.length];
              const posLabel = language === 'bn' ? (node.position_label_bn || `পজিশন ০${idx + 1}`) : (node.position_label_en || `POSITION ${String.fromCharCode(65 + idx)}`);
              const nodeTitle = language === 'bn' ? node.title_bn : node.title_en;
              const nodeDesc = language === 'bn' ? node.desc_bn : node.desc_en;

              return (
                <div key={idx} className="bg-white border border-[#E8DDD0] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 text-white shadow-md"
                    style={{ backgroundColor: nodeColor }}
                  >
                    {node.icon || '✨'}
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider block" style={{ color: nodeColor }}>
                      {posLabel}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-stone-900 leading-snug">
                      {nodeTitle}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-sans font-light leading-relaxed">
                      {nodeDesc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
