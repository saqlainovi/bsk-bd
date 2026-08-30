import React, { useState } from 'react';
import { 
  PieChart as PieIcon, GitFork, Table as TableIcon, BarChart3, 
  ArrowRight, CheckCircle2, TrendingUp, Sparkles, Activity, Layers, Compass
} from 'lucide-react';
import { Language } from '../types';

export interface ChartDataItem {
  label_bn?: string;
  label_en?: string;
  value?: number | string;
  percentage?: number;
  unit_bn?: string;
  unit_en?: string;
  desc_bn?: string;
  desc_en?: string;
  icon?: string;
  color?: string; // hex or tailwind class
}

export interface InfographicData {
  chart_type?: 'pie_chart' | 'flow_diagram' | 'data_table' | 'infochart_bars';
  badge_bn?: string;
  badge_en?: string;
  title_bn?: string;
  title_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  header_title_bn?: string;
  header_title_en?: string;
  items?: ChartDataItem[];
}

interface HomepageInfographicProps {
  data?: InfographicData | null;
  language: Language;
}

export const defaultChartData: InfographicData = {
  chart_type: 'pie_chart',
  badge_bn: '📊 পরিসংখ্যান ও প্রভাবচিত্র',
  badge_en: '📊 Statistics & Impact Analytics',
  title_bn: 'বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী কার্যক্রম ও পাঠক বিশ্লেষণ',
  title_en: 'BSK Nationwide Footprint & Reader Demographics Analysis',
  subtitle_bn: 'দেশজুড়ে বিস্তৃত কার্যক্রমের পরিসংখ্যান ও পাঠক অংশগ্রহণের প্রত্যক্ষ বিশ্লেষণ চিত্র।',
  subtitle_en: 'A visual statistical representation of reader demographics, national coverage, and program impact.',
  items: [
    {
      label_bn: 'নারী শিক্ষার্থী ও ছাত্রী পাঠক',
      label_en: 'Female Students & Readers',
      value: '১২.৫ লক্ষ+',
      percentage: 60,
      unit_bn: '৬০% অংশগ্রহণ',
      unit_en: '60% Share',
      desc_bn: 'দেশব্যাপী বইপড়া কর্মসূচিতে মেয়েদের স্বতঃস্ফূর্ত ও সক্রিয় অংশগ্রহণ।',
      desc_en: 'Spontaneous active participation of female students nationwide.',
      icon: '👩‍🎓',
      color: '#B8862A'
    },
    {
      label_bn: 'মাদ্রাসা ও সাধারণ ছাত্র পাঠক',
      label_en: 'Madrasa & General Male Students',
      value: '৫.২ লক্ষ+',
      percentage: 25,
      unit_bn: '২৫% অংশগ্রহণ',
      unit_en: '25% Share',
      desc_bn: 'স্কুল ও মাদ্রাসার সাধারণ শিক্ষার্থীদের বইপড়ার নিয়মিত চর্চা।',
      desc_en: 'Regular reading activities among general and madrasa students.',
      icon: '👨‍🎓',
      color: '#10B981'
    },
    {
      label_bn: 'ভ্রাম্যমাণ লাইব্রেরি পাঠক',
      label_en: 'Mobile Library Members',
      value: '২.১ লক্ষ+',
      percentage: 10,
      unit_bn: '১০% অংশগ্রহণ',
      unit_en: '10% Share',
      desc_bn: 'সরাসরি দোরগোড়ায় পৌঁছে দেওয়া ভ্রাম্যমাণ গাড়িবহরের নিয়মিত সদস্য।',
      desc_en: 'Registered members borrowing books via mobile library buses.',
      icon: '🚐',
      color: '#6366F1'
    },
    {
      label_bn: 'পাঠচক্র ও আজীবন গবেষক',
      label_en: 'Study Circle & Lifetime Scholars',
      value: '১.১ লক্ষ+',
      percentage: 5,
      unit_bn: '৫% অংশগ্রহণ',
      unit_en: '5% Share',
      desc_bn: 'উচ্চতর পাঠচক্র, সাহিত্য ও দর্শন চর্চার বিশিষ্ট সদস্য ও স্কলারবৃন্দ।',
      desc_en: 'Scholars and critical thinkers participating in study circles.',
      icon: '💡',
      color: '#EC4899'
    }
  ]
};

export const HomepageInfographic: React.FC<HomepageInfographicProps> = ({ data, language }) => {
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);

  const merged: InfographicData = {
    ...defaultChartData,
    ...(data || {}),
    items: Array.isArray(data?.items) && data.items.length >= 2 
      ? data.items 
      : defaultChartData.items
  };

  const chartType = merged.chart_type || (merged as any).template === 'template2' ? 'flow_diagram' : (merged as any).template === 'template3' ? 'data_table' : (merged as any).template === 'template4' ? 'infochart_bars' : (merged.chart_type || 'pie_chart');
  
  const badge = language === 'bn' ? (merged.badge_bn || '📊 ইনফোগ্রাফ বিশ্লেষণ') : (merged.badge_en || '📊 Infograph Analytics');
  const title = language === 'bn' 
    ? (merged.title_bn || merged.header_title_bn || defaultChartData.title_bn) 
    : (merged.title_en || merged.header_title_en || defaultChartData.title_en);
  const subtitle = language === 'bn' 
    ? (merged.subtitle_bn || defaultChartData.subtitle_bn) 
    : (merged.subtitle_en || defaultChartData.subtitle_en);

  const items = (merged.items || defaultChartData.items!).slice(0, 4);

  // Colors fallback
  const sliceColors = ['#B8862A', '#10B981', '#6366F1', '#EC4899'];

  // Calculate Pie / Donut SVG strokes
  let cumulativePercentage = 0;
  const totalCircumference = 2 * Math.PI * 70; // r = 70

  const pieSlices = items.map((item, idx) => {
    const pct = item.percentage !== undefined ? Number(item.percentage) : (idx === 0 ? 60 : idx === 1 ? 25 : idx === 2 ? 10 : 5);
    const strokeDasharray = `${(pct / 100) * totalCircumference} ${totalCircumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * totalCircumference);
    cumulativePercentage += pct;
    const color = item.color || sliceColors[idx % sliceColors.length];
    return {
      ...item,
      pct,
      strokeDasharray,
      strokeDashoffset,
      color
    };
  });

  return (
    <section className="w-full space-y-6 animate-fade-in font-sans text-left my-4">
      
      {/* MINIMAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8DDD0] pb-4 gap-3">
        <div className="space-y-1.5 max-w-2xl">
          {badge && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C6212] bg-[#FAF7F2] px-3 py-0.5 rounded-full border border-[#B8862A]/20 font-mono">
              <Sparkles className="w-3 h-3 text-[#B8862A]" />
              <span>{badge}</span>
            </span>
          )}
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A1207] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-stone-500 font-sans font-light">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-400 bg-white px-3 py-1.5 rounded-xl border border-[#E8DDD0] shrink-0 self-start md:self-auto">
          <Activity className="w-3.5 h-3.5 text-[#B8862A]" />
          <span>{language === 'bn' ? 'লাইভ ইনফোগ্রাফ চার্ট' : 'Interactive Visual Chart'}</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          1. PIE / DONUT CHART INFOGRAPHIC
      ────────────────────────────────────────────────────────── */}
      {chartType === 'pie_chart' && (
        <div className="bg-white border-2 border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* SVG Interactive Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                  {/* Background Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#FAF8F5"
                    strokeWidth="28"
                  />
                  {/* Slices */}
                  {pieSlices.map((slice, sIdx) => {
                    const isHovered = activeHoverIdx === sIdx;
                    return (
                      <circle
                        key={sIdx}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 34 : 28}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setActiveHoverIdx(sIdx)}
                        onMouseLeave={() => setActiveHoverIdx(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center Summary Dial */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                  {activeHoverIdx !== null && pieSlices[activeHoverIdx] ? (
                    <div className="space-y-0.5 animate-in fade-in zoom-in duration-150">
                      <span className="text-2xl sm:text-3xl font-black font-serif text-[#1A1207]">
                        {pieSlices[activeHoverIdx].pct}%
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 block truncate max-w-[120px]">
                        {language === 'bn' ? pieSlices[activeHoverIdx].label_bn : pieSlices[activeHoverIdx].label_en}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl font-black font-serif text-[#1A1207]">
                        ১০০%
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#8C6212] uppercase tracking-wider block">
                        {language === 'bn' ? 'মোট নেটওয়ার্ক' : 'Total Coverage'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side Interactive Breakdown & Legend */}
            <div className="lg:col-span-7 space-y-3.5">
              {pieSlices.map((slice, idx) => {
                const isHovered = activeHoverIdx === idx;
                const itemLabel = language === 'bn' ? slice.label_bn : slice.label_en;
                const itemDesc = language === 'bn' ? slice.desc_bn : slice.desc_en;
                const itemUnit = language === 'bn' ? (slice.unit_bn || `${slice.pct}% অনুপাত`) : (slice.unit_en || `${slice.pct}% Share`);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveHoverIdx(idx)}
                    onMouseLeave={() => setActiveHoverIdx(null)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isHovered
                        ? 'bg-[#FAF8F5] border-[#B8862A] shadow-md -translate-y-0.5'
                        : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs"
                        style={{ backgroundColor: `${slice.color}15`, color: slice.color, border: `1.5px solid ${slice.color}30` }}
                      >
                        {slice.icon || '📊'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                            {itemLabel}
                          </h4>
                          <span 
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${slice.color}20`, color: slice.color }}
                          >
                            {slice.pct}%
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-sans font-light leading-relaxed">
                          {itemDesc}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pl-13 sm:pl-0">
                      <div className="font-serif font-extrabold text-base text-[#1A1207]">
                        {slice.value || `${slice.pct}%`}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {itemUnit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          2. FLOW DIAGRAM & PROCESS PIPELINE
      ────────────────────────────────────────────────────────── */}
      {chartType === 'flow_diagram' && (
        <div className="bg-white border-2 border-[#E8DDD0] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs space-y-8 relative overflow-hidden">
          {/* Connecting Directional Gradient Line */}
          <div className="hidden lg:block absolute top-[92px] left-[8%] right-[8%] h-1.5 bg-gradient-to-r from-[#B8862A] via-[#10B981] to-[#6366F1] z-0 rounded-full opacity-35" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {items.map((item, idx) => {
              const color = item.color || sliceColors[idx % sliceColors.length];
              const itemLabel = language === 'bn' ? item.label_bn : item.label_en;
              const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;
              const itemValue = item.value || `Phase 0${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] border-2 border-[#E8DDD0] hover:border-[#B8862A] rounded-2xl p-5 space-y-4 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Node Dial Header */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: color, color: '#FFFFFF' }}
                      >
                        {item.icon || '🔄'}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-[#E8DDD0] text-stone-700">
                        <span>FLOW 0{idx + 1}</span>
                        {idx < 3 && <ArrowRight className="w-3 h-3 text-[#B8862A] ml-0.5" />}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E8DDD0]">
                      <span className="font-serif font-black text-sm text-[#1A1207] block">
                        {itemValue}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                      {itemLabel}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                      {itemDesc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8DDD0] flex items-center justify-between text-[11px] font-bold text-stone-500">
                    <span>{language === 'bn' ? `ধাপ #০${idx + 1}` : `Step #0${idx + 1}`}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          3. STATISTICAL DATA TABLE
      ────────────────────────────────────────────────────────── */}
      {chartType === 'data_table' && (
        <div className="bg-white border-2 border-[#E8DDD0] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8DDD0] text-[#1A1207] font-serif font-bold">
                  <th className="p-4 sm:p-5">{language === 'bn' ? 'কার্যক্রম ও পাঠক বিভাগ' : 'Program & Demographics'}</th>
                  <th className="p-4 sm:p-5">{language === 'bn' ? 'সক্রিয় সংখ্যা / মেট্রিক' : 'Active Footprint / Metric'}</th>
                  <th className="p-4 sm:p-5">{language === 'bn' ? 'অগ্রগতি ও শতকরা অনুপাত' : 'Progress & Share (%)'}</th>
                  <th className="p-4 sm:p-5">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item, idx) => {
                  const pct = item.percentage !== undefined ? Number(item.percentage) : (idx === 0 ? 60 : idx === 1 ? 25 : idx === 2 ? 10 : 5);
                  const color = item.color || sliceColors[idx % sliceColors.length];
                  const itemLabel = language === 'bn' ? item.label_bn : item.label_en;
                  const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;

                  return (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 rounded-xl bg-[#FAF8F5] border border-[#E8DDD0]">
                            {item.icon || '📊'}
                          </span>
                          <div>
                            <div className="font-serif font-bold text-sm text-stone-900">
                              {itemLabel}
                            </div>
                            <div className="text-[11px] text-stone-500 font-light">
                              {itemDesc}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 font-serif font-extrabold text-sm text-[#1A1207]">
                        {item.value || `${pct}%`}
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex justify-between font-mono text-[10px] font-bold text-stone-600">
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700" 
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span 
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          <span>{language === 'bn' ? 'চলমান' : 'Active'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          4. MULTI-BAR & PROGRESS INFOCHART
      ────────────────────────────────────────────────────────── */}
      {chartType === 'infochart_bars' && (
        <div className="bg-white border-2 border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-xs space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map((item, idx) => {
              const pct = item.percentage !== undefined ? Number(item.percentage) : (idx === 0 ? 85 : idx === 1 ? 65 : idx === 2 ? 45 : 30);
              const color = item.color || sliceColors[idx % sliceColors.length];
              const itemLabel = language === 'bn' ? item.label_bn : item.label_en;
              const itemDesc = language === 'bn' ? item.desc_bn : item.desc_en;

              return (
                <div key={idx} className="p-5 bg-[#FAF8F5] border border-[#E8DDD0] rounded-2xl space-y-3 shadow-2xs hover:border-[#B8862A] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon || '📈'}</span>
                      <h4 className="font-serif font-bold text-sm text-stone-900">
                        {itemLabel}
                      </h4>
                    </div>
                    <span className="font-serif font-black text-base text-[#1A1207]">
                      {item.value || `${pct}%`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-3 bg-white border border-stone-200 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-400">
                      <span>0%</span>
                      <span>{pct}% Target Metric</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 font-sans font-light leading-relaxed">
                    {itemDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
};
