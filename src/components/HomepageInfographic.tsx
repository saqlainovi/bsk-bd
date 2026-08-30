import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Language } from '../types';

export interface InfographicItem {
  icon?: string;
  metric?: string;
  metric_en?: string;
  title_bn?: string;
  title_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  desc_bn?: string;
  desc_en?: string;
  badge_bn?: string;
  badge_en?: string;
  color?: 'amber' | 'emerald' | 'bronze' | 'indigo' | string;
}

export interface InfographicData {
  template?: 'template1' | 'template2' | 'template3' | 'template4';
  badge_bn?: string;
  badge_en?: string;
  title_bn?: string;
  title_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  header_title_bn?: string;
  header_title_en?: string;
  items?: InfographicItem[];
}

interface HomepageInfographicProps {
  data?: InfographicData | null;
  language: Language;
}

export const defaultInfographicData: InfographicData = {
  template: 'template1',
  badge_bn: '✨ আলোকিত সমাজ বিনির্মাণের রূপরেখা',
  badge_en: '✨ Roadmap for an Enlightened Society',
  title_bn: 'বিশ্বসাহিত্য কেন্দ্রের ৪টি মৌলিক স্তম্ভ ও কর্মপ্রবাহ',
  title_en: 'Four Core Pillars & Strategic Roadmap of BSK',
  subtitle_bn: 'দেশব্যাপী বইপড়া, ভ্রাম্যমাণ সেবা, পাঠচক্র ও সাংস্কৃতিক বিকাশের মাধ্যমে প্রজ্ঞাবান মানবিক নেতৃত্ব গড়ে তোলার ধারাবাহিক প্রয়াস।',
  subtitle_en: 'A continuous movement to foster wise human leadership through nationwide reading, mobile libraries, study circles, and cultural enrichment.',
  items: [
    {
      icon: '📚',
      metric: '২৫০+ উপজেলা',
      metric_en: '250+ Upazilas',
      title_bn: 'দেশব্যাপী বইপড়া কর্মসূচি',
      title_en: 'Nationwide Reading Program',
      subtitle_bn: 'স্কুল-কলেজ পর্যায়ের মূল ভিত্তি',
      subtitle_en: 'Foundational Student Tier',
      desc_bn: 'স্কুল ও মাদ্রাসার লাখ লাখ শিক্ষার্থীদের মাঝে মানসম্পন্ন বিশ্বসাহিত্যের চর্চা ও মননশীলতা গড়ে তোলার সুবিশাল নেটওয়ার্ক।',
      desc_en: 'A vast network fostering reading habits with world literature among millions of school and madrasa students.',
      badge_bn: '১ম স্তম্ভ',
      badge_en: 'Pillar 1',
      color: 'amber'
    },
    {
      icon: '🚐',
      metric: '২০ লক্ষ+ পাঠক',
      metric_en: '2M+ Readers',
      title_bn: 'ভ্রাম্যমাণ লাইব্রেরি সেবা',
      title_en: 'Mobile Library Service',
      subtitle_bn: 'দোরগোড়ায় জ্ঞানের আলো',
      subtitle_en: 'Knowledge at Doorsteps',
      desc_bn: 'বিশেষায়িত ভ্রাম্যমাণ গাড়িবহরে দেশজুড়ে পাঠকের দোরগোড়ায় বই আদান-প্রদান ও মুক্তচিন্তার দ্বার উন্মোচন।',
      desc_en: 'Delivering thousands of books right to reader doorsteps via specialized mobile library fleet.',
      badge_bn: '২য় স্তম্ভ',
      badge_en: 'Pillar 2',
      color: 'emerald'
    },
    {
      icon: '💡',
      metric: '৮৫,০০০+ দুর্লভ বই',
      metric_en: '85k+ Rare Books',
      title_bn: 'পাঠচক্র ও উন্মুক্ত আলোচনা',
      title_en: 'Study Circles & Dialogues',
      subtitle_bn: 'মননশীল চর্চা ও বিতর্ক',
      subtitle_en: 'Intellectual Dialogues',
      desc_bn: 'বিশ্বের শ্রেষ্ঠ সাহিত্য, বিজ্ঞান ও দর্শন নিয়ে নিয়মিত আলোচনা, তরুণদের প্রজ্ঞাবান ও সংবেদনশীল হিসেবে গড়ে তোলা।',
      desc_en: 'Regular in-depth discussions on world literature, philosophy, and sciences to nurture enlightened minds.',
      badge_bn: '৩য় স্তম্ভ',
      badge_en: 'Pillar 3',
      color: 'bronze'
    },
    {
      icon: '✨',
      metric: '৪৬+ বছরের ঐতিহ্য',
      metric_en: '46+ Years Legacy',
      title_bn: 'সাংস্কৃতিক উৎকর্ষ ও নেতৃত্ব',
      title_en: 'Cultural Excellence & Arts',
      subtitle_bn: 'পরিপূর্ণ মানবিক বিকাশ',
      subtitle_en: 'Holistic Human Values',
      desc_bn: 'সংগীত, চিত্রকলা, চলচ্চিত্র ও নৈতিক মূল্যবোধের সমন্বয়ে একটি সংবেদনশীল, রুচিশীল ও আলোকিত জাতীয় চরিত্র নির্মাণ।',
      desc_en: 'Cultivating enlightened national character and empathetic leadership through fine arts, cinema, and moral values.',
      badge_bn: '৪র্থ স্তম্ভ',
      badge_en: 'Pillar 4',
      color: 'indigo'
    }
  ]
};

export const HomepageInfographic: React.FC<HomepageInfographicProps> = ({ data, language }) => {
  const merged: InfographicData = {
    ...defaultInfographicData,
    ...(data || {}),
    items: Array.isArray(data?.items) && data.items.length >= 4 
      ? data.items 
      : defaultInfographicData.items
  };

  const template = merged.template || 'template1';
  const badge = language === 'bn' ? (merged.badge_bn || '✨ ইনফোগ্রাফ ও কর্মপরিকল্পনা') : (merged.badge_en || '✨ Strategic Pillars');
  const title = language === 'bn' 
    ? (merged.title_bn || merged.header_title_bn || defaultInfographicData.title_bn) 
    : (merged.title_en || merged.header_title_en || defaultInfographicData.title_en);
  const subtitle = language === 'bn' 
    ? (merged.subtitle_bn || defaultInfographicData.subtitle_bn) 
    : (merged.subtitle_en || defaultInfographicData.subtitle_en);

  const items = (merged.items || defaultInfographicData.items!).slice(0, 4);

  // Helper for color palettes
  const getColorStyles = (color?: string, idx?: number) => {
    const c = color || (idx === 0 ? 'amber' : idx === 1 ? 'emerald' : idx === 2 ? 'bronze' : 'indigo');
    switch (c) {
      case 'emerald':
        return {
          border: 'border-emerald-200 hover:border-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-200',
          accentText: 'text-emerald-700',
          gradientBg: 'from-emerald-50/50 via-white to-white',
          glow: 'group-hover:shadow-emerald-100',
          numberBg: 'bg-emerald-600 text-white'
        };
      case 'bronze':
        return {
          border: 'border-[#E8DDD0] hover:border-[#8C6212]',
          badgeBg: 'bg-[#FAF7F2] text-[#8C6212] border-[#E8DDD0]',
          iconBg: 'bg-gradient-to-br from-[#8C6212] to-[#5A3E0B] text-white shadow-stone-200',
          accentText: 'text-[#8C6212]',
          gradientBg: 'from-[#FAF7F2]/60 via-white to-white',
          glow: 'group-hover:shadow-amber-100',
          numberBg: 'bg-[#8C6212] text-white'
        };
      case 'indigo':
        return {
          border: 'border-indigo-200 hover:border-indigo-500',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-800 text-white shadow-indigo-200',
          accentText: 'text-indigo-700',
          gradientBg: 'from-indigo-50/40 via-white to-white',
          glow: 'group-hover:shadow-indigo-100',
          numberBg: 'bg-indigo-600 text-white'
        };
      case 'amber':
      default:
        return {
          border: 'border-[#B8862A]/25 hover:border-[#B8862A]',
          badgeBg: 'bg-[#F7EFE5] text-[#8C6212] border-[#B8862A]/30',
          iconBg: 'bg-gradient-to-br from-[#B8862A] to-[#8C6212] text-white shadow-amber-200',
          accentText: 'text-[#B8862A]',
          gradientBg: 'from-[#FAF8F5] via-white to-white',
          glow: 'group-hover:shadow-amber-100',
          numberBg: 'bg-[#B8862A] text-white'
        };
    }
  };

  return (
    <section className="w-full space-y-6 md:space-y-8 animate-fade-in font-sans text-left my-4">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 px-4">
        {badge && (
          <span className="inline-flex items-center gap-1.5 bg-[#FAF7F2] text-[#8C6212] border border-[#B8862A]/20 px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B8862A]" />
            <span>{badge}</span>
          </span>
        )}

        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1207] tracking-tight leading-tight">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans font-light">
            {subtitle}
          </p>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          TEMPLATE 1: MODERN INTERACTIVE METRIC PILLARS
      ────────────────────────────────────────────────────────── */}
      {template === 'template1' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((item, idx) => {
            const styles = getColorStyles(item.color, idx);
            const itemTitle = language === 'bn' ? (item.title_bn || `স্তম্ভ #${idx + 1}`) : (item.title_en || `Pillar #${idx + 1}`);
            const itemSubtitle = language === 'bn' ? item.subtitle_bn : item.subtitle_en;
            const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;
            const itemMetric = language === 'bn' ? (item.metric || `০${idx + 1}`) : (item.metric_en || item.metric || `0${idx + 1}`);
            const itemBadge = language === 'bn' ? (item.badge_bn || `স্তম্ভ ০${idx + 1}`) : (item.badge_en || `Pillar 0${idx + 1}`);

            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-6 bg-gradient-to-b ${styles.gradientBg} border-2 ${styles.border} shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden hover:-translate-y-1.5`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-stone-100/60 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Top Bar: Icon + Metric Tag */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon || '📚'}
                    </div>
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full border ${styles.badgeBg}`}>
                      {itemBadge}
                    </span>
                  </div>

                  {/* Highlight Metric */}
                  <div className="pt-1">
                    <div className="font-serif text-xl sm:text-2xl font-black text-[#1A1207] tracking-tight">
                      {itemMetric}
                    </div>
                    {itemSubtitle && (
                      <div className="text-[11px] font-bold text-stone-500 font-sans mt-0.5">
                        {itemSubtitle}
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 pt-1 border-t border-stone-200/60">
                    <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#1A1207] transition-colors leading-snug">
                      {itemTitle}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                      {itemDesc}
                    </p>
                  </div>
                </div>

                {/* Bottom Step Indicator */}
                <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-bold text-stone-400 group-hover:text-stone-700 transition-colors">
                  <span className="font-mono">Step 0{idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TEMPLATE 2: VISUAL CONNECTED STEP-BY-STEP ROADMAP
      ────────────────────────────────────────────────────────── */}
      {template === 'template2' && (
        <div className="bg-white border-2 border-[#E8DDD0] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8 relative overflow-hidden">
          {/* Subtle background connecting bar across desktop */}
          <div className="hidden lg:block absolute top-[112px] left-[12%] right-[12%] h-1 bg-gradient-to-r from-[#B8862A] via-emerald-600 to-indigo-600 z-0 opacity-25 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {items.map((item, idx) => {
              const styles = getColorStyles(item.color, idx);
              const itemTitle = language === 'bn' ? (item.title_bn || `ধাপ #${idx + 1}`) : (item.title_en || `Step #${idx + 1}`);
              const itemSubtitle = language === 'bn' ? item.subtitle_bn : item.subtitle_en;
              const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;
              const itemMetric = language === 'bn' ? (item.metric || `০${idx + 1}`) : (item.metric_en || item.metric || `0${idx + 1}`);

              return (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] border border-[#E8DDD0] hover:border-[#B8862A] rounded-2xl p-5 space-y-4 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Node Header with Step Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center text-lg shadow-md`}>
                        {item.icon || '🎯'}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-extrabold text-[#8C6212] bg-white px-2.5 py-1 rounded-full border border-[#E8DDD0]">
                        <span>PHASE</span>
                        <span className={`w-4 h-4 rounded-full ${styles.numberBg} flex items-center justify-center text-[10px] ml-0.5`}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Metric Tag */}
                    <div className="bg-white/80 p-2.5 rounded-xl border border-[#E8DDD0]/80">
                      <span className="text-xs font-serif font-black text-[#1A1207] block">
                        {itemMetric}
                      </span>
                      {itemSubtitle && (
                        <span className="text-[10px] font-bold text-stone-500 block">
                          {itemSubtitle}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                      {itemTitle}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {itemDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8DDD0]/50 flex items-center gap-1.5 text-[11px] font-bold text-[#8C6212]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'সক্রিয় কার্যক্রম' : 'Active Workflow'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TEMPLATE 3: GEOMETRIC STAT HUB & ACCENT BADGES
      ────────────────────────────────────────────────────────── */}
      {template === 'template3' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => {
            const styles = getColorStyles(item.color, idx);
            const itemTitle = language === 'bn' ? (item.title_bn || `মডিউল #${idx + 1}`) : (item.title_en || `Module #${idx + 1}`);
            const itemSubtitle = language === 'bn' ? item.subtitle_bn : item.subtitle_en;
            const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;
            const itemMetric = language === 'bn' ? (item.metric || `০${idx + 1}`) : (item.metric_en || item.metric || `0${idx + 1}`);
            const itemBadge = language === 'bn' ? (item.badge_bn || 'হাইলাইটস') : (item.badge_en || 'Highlights');

            return (
              <div 
                key={idx}
                className="bg-white border-2 border-stone-200 hover:border-stone-800 rounded-3xl p-6 shadow-xs hover:shadow-2xl transition-all duration-300 group space-y-4 text-left relative overflow-hidden"
              >
                {/* Top Geometric Ribbon */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2.5 bg-stone-100 rounded-2xl group-hover:rotate-6 transition-transform">
                    {item.icon || '💡'}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                    {itemBadge}
                  </span>
                </div>

                {/* Big Bold Stat Header */}
                <div className="space-y-0.5">
                  <div className="font-serif text-2xl font-black text-stone-900 tracking-tight">
                    {itemMetric}
                  </div>
                  {itemSubtitle && (
                    <div className="text-[11px] font-bold uppercase text-[#B8862A] tracking-wider font-mono">
                      {itemSubtitle}
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-3 space-y-1.5">
                  <h4 className="font-serif font-bold text-sm text-stone-900">
                    {itemTitle}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                    {itemDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TEMPLATE 4: LUXURY HERITAGE & GOLDEN PILLARS
      ────────────────────────────────────────────────────────── */}
      {template === 'template4' && (
        <div className="bg-gradient-to-b from-[#1A1207] to-[#261A0C] border-2 border-[#B8862A]/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl text-amber-50 relative overflow-hidden">
          {/* Subtle background luxury pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#F0CC7A_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {items.map((item, idx) => {
              const itemTitle = language === 'bn' ? (item.title_bn || `স্তম্ভ #${idx + 1}`) : (item.title_en || `Column #${idx + 1}`);
              const itemSubtitle = language === 'bn' ? item.subtitle_bn : item.subtitle_en;
              const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;
              const itemMetric = language === 'bn' ? (item.metric || `০${idx + 1}`) : (item.metric_en || item.metric || `0${idx + 1}`);
              const itemBadge = language === 'bn' ? (item.badge_bn || `স্তম্ভ ০${idx + 1}`) : (item.badge_en || `Pillar 0${idx + 1}`);

              return (
                <div
                  key={idx}
                  className="bg-black/30 border border-[#B8862A]/30 hover:border-[#F0CC7A] rounded-2xl p-5 space-y-4 hover:bg-black/40 transition-all duration-300 group flex flex-col justify-between backdrop-blur-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#B8862A]/20 pb-3">
                      <span className="text-2xl">{item.icon || '🏛️'}</span>
                      <span className="text-[10px] font-mono font-bold text-[#F0CC7A] bg-[#B8862A]/20 px-2.5 py-0.5 rounded-full border border-[#B8862A]/30">
                        {itemBadge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-serif text-xl font-bold text-[#F0CC7A]">
                        {itemMetric}
                      </div>
                      {itemSubtitle && (
                        <div className="text-[11px] font-medium text-amber-200/70">
                          {itemSubtitle}
                        </div>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm text-white">
                      {itemTitle}
                    </h4>

                    <p className="text-xs text-amber-100/70 leading-relaxed font-sans font-light">
                      {itemDesc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#B8862A]/20 flex items-center justify-between text-[10px] text-amber-200/50">
                    <span className="font-mono">BSK HERITAGE</span>
                    <Star className="w-3 h-3 text-[#F0CC7A]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
};
