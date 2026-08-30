import React from 'react';
import { 
  Megaphone, Clock, PieChart, Trophy, Globe, Users, 
  BookOpen, Library, Award, Sparkles, Compass, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Language } from '../types';

export interface InfographicStripItem {
  number_label_bn?: string;
  number_label_en?: string;
  title_bn?: string;
  title_en?: string;
  desc_bn?: string;
  desc_en?: string;
  icon_key?: 'megaphone' | 'clock' | 'pie_chart' | 'trophy' | 'globe_search' | 'community' | 'book' | 'library' | 'award' | string;
  png_icon_url?: string;
  bg_color?: string; // BSK theme hex
  icon_style?: 'circle' | 'plain';
}

export interface InfographicData {
  badge_bn?: string;
  badge_en?: string;
  title_bn?: string;
  title_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  header_bg_color?: string;
  items?: InfographicStripItem[];
}

interface HomepageInfographicProps {
  data?: InfographicData | null;
  language: Language;
}

export const defaultZigZagData: InfographicData = {
  badge_bn: 'বিশ্বসাহিত্য কেন্দ্র',
  badge_en: 'BISHWO SHAHITTO KENDRO',
  title_bn: 'আলোকিত সমাজ বিনির্মাণের রূপরেখা',
  title_en: 'Roadmap & Strategic Metrics',
  subtitle_bn: 'জ্ঞান, মনুষ্যত্ব ও সাংস্কৃতিক উৎকর্ষ অর্জনের দেশব্যাপী পরিকল্পিত কর্মপ্রবাহ',
  subtitle_en: 'A nationwide structured workflow for knowledge, human values, and cultural enlightenment',
  header_bg_color: '#2E5942',
  items: [
    {
      number_label_bn: '১. দেশব্যাপী বইপড়া ও প্রচার কর্মসূচি',
      number_label_en: '1. NATIONWIDE READING & OUTREACH',
      title_bn: 'দেশব্যাপী বইপড়া ও প্রচার কর্মসূচি',
      title_en: 'Nationwide Reading & Outreach',
      desc_bn: 'স্কুল-কলেজ পর্যায়ের লাখ লাখ শিক্ষার্থীর মাঝে উন্নত বিশ্বসাহিত্যের বই পৌঁছে দেওয়া এবং নিয়মিত পাঠাভ্যাস ও মননশীলতা গড়ে তোলার সমন্বিত প্রয়াস।',
      desc_en: 'Reaching millions of students across schools and colleges with world-class literature to foster lifelong reading habits and deep values.',
      icon_key: 'megaphone',
      bg_color: '#B8862A',
      icon_style: 'plain'
    },
    {
      number_label_bn: '২. সুশৃঙ্খল সময়ানুবর্তিতা ও ভ্রাম্যমাণ সেবা',
      number_label_en: '2. ROUTINE VELOCITY & MOBILE SERVICE',
      title_bn: 'সুশৃঙ্খল সময়ানুবর্তিতা ও ভ্রাম্যমাণ সেবা',
      title_en: 'Routine Velocity & Mobile Service',
      desc_bn: 'নির্দিষ্ট রুট ও সময়সূচি অনুযায়ী বিশেষায়িত ভ্রাম্যমাণ গাড়িবহরের মাধ্যমে পাঠকের দোরগোড়ায় বই আদান-প্রদান এবং সার্বক্ষণিক সক্রিয় পাঠক সেবা।',
      desc_en: 'Delivering books directly to reader doorsteps via structured schedules and active mobile library fleets across districts.',
      icon_key: 'clock',
      bg_color: '#8C6212',
      icon_style: 'circle'
    },
    {
      number_label_bn: '৩. পাঠচক্র ও নিয়মিত পাঠক মূল্যায়ন',
      number_label_en: '3. STUDY CIRCLES & ASSESSMENT METRICS',
      title_bn: 'পাঠচক্র ও নিয়মিত পাঠক মূল্যায়ন',
      title_en: 'Study Circles & Assessment Metrics',
      desc_bn: 'প্রতিটি শিক্ষাবর্ষে বার্ষিক বইপড়া মূল্যায়ন পরীক্ষা, নিয়মিত পাঠচক্র সংলাপ ও পাঠক প্রবৃদ্ধি বিশ্লেষণের সুসংহত মেট্রিক্স।',
      desc_en: 'Annual assessment examinations, intellectual dialogues in study circles, and structured reader engagement analytics.',
      icon_key: 'pie_chart',
      bg_color: '#1E3B2C',
      icon_style: 'circle'
    },
    {
      number_label_bn: '৪. মেধা মূল্যায়ন ও জাতীয় পুরস্কার বিতরণ',
      number_label_en: '4. QUALITY EXCELLENCE & AWARDS',
      title_bn: 'মেধা মূল্যায়ন ও জাতীয় পুরস্কার বিতরণ',
      title_en: 'Quality Excellence & Awards',
      desc_bn: 'কঠোর নিরপেক্ষ মূল্যায়নের মাধ্যমে পাঠে কৃতিত্বের জন্য দেশজুড়ে বর্ণাঢ্য উৎসব ও বিশেষ পুরস্কার প্রদানের মাধ্যমে শিক্ষার্থীদের অনুপ্রাণিত করা।',
      desc_en: 'Recognizing student achievements through national award ceremonies, certificates, and books to inspire a generation of leaders.',
      icon_key: 'trophy',
      bg_color: '#A3751E',
      icon_style: 'plain'
    },
    {
      number_label_bn: '৫. দেশব্যাপী বিস্তার ও উপজেলা নেটওয়ার্ক',
      number_label_en: '5. NATIONWIDE OUTREACH & NETWORK',
      title_bn: 'দেশব্যাপী বিস্তার ও উপজেলা নেটওয়ার্ক',
      title_en: 'Nationwide Outreach & Network',
      desc_bn: 'দেশের ২৫০+ উপজেলায় ১২,০০০+ শিক্ষাপ্রতিষ্ঠানে কার্যকর নেটওয়ার্কিং ও তৃণমূল পর্যায়ের প্রতিটি অঞ্চলে আলোর বিস্তার।',
      desc_en: 'Expanding grassroot network across 250+ upazilas and over 12,000 academic institutions throughout Bangladesh.',
      icon_key: 'globe_search',
      bg_color: '#2E5942',
      icon_style: 'plain'
    },
    {
      number_label_bn: '৬. সম্মিলিত সমাজ ও আলোকিত জাতীয় চরিত্র',
      number_label_en: '6. COMMUNITY & ENLIGHTENED CHARACTER',
      title_bn: 'সম্মিলিত সমাজ ও আলোকিত জাতীয় চরিত্র',
      title_en: 'Community & Enlightened Character',
      desc_bn: 'সাহিত্য, চিত্রকলা, চলচ্চিত্র ও নৈতিক মূল্যবোধের সমন্বয়ে একটি সংবেদনশীল, রুচিশীল ও মানবিক নেতৃত্বসম্পন্ন আলোকিত বাংলাদেশ বিনির্মাণ।',
      desc_en: 'Cultivating holistic national character and empathetic leadership through the fusion of fine arts, culture, and high values.',
      icon_key: 'community',
      bg_color: '#261A0C',
      icon_style: 'circle'
    }
  ]
};

// Render Crisp Vector Line-Art SVG Icons (Strictly NO Emoji)
const renderLineArtIcon = (iconKey?: string, iconStyle?: 'circle' | 'plain') => {
  const isCircle = iconStyle === 'circle';

  let iconElement = <Megaphone className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;

  switch (iconKey) {
    case 'clock':
      iconElement = <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'pie_chart':
      iconElement = <PieChart className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'trophy':
      iconElement = <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'globe_search':
      iconElement = <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'community':
      iconElement = <Users className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'book':
      iconElement = <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'library':
      iconElement = <Library className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'award':
      iconElement = <Award className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
    case 'megaphone':
    default:
      iconElement = <Megaphone className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5]" />;
      break;
  }

  if (isCircle) {
    return (
      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-3 sm:border-4 border-white/90 flex items-center justify-center p-4 sm:p-6 shadow-md transition-transform duration-300 group-hover:scale-105">
        {iconElement}
      </div>
    );
  }

  return (
    <div className="p-2 transition-transform duration-300 group-hover:scale-110">
      {iconElement}
    </div>
  );
};

export const HomepageInfographic: React.FC<HomepageInfographicProps> = ({ data, language }) => {
  const merged: InfographicData = {
    ...defaultZigZagData,
    ...(data || {}),
    items: Array.isArray(data?.items) && data.items.length > 0 
      ? data.items 
      : defaultZigZagData.items
  };

  const badge = language === 'bn' ? (merged.badge_bn || defaultZigZagData.badge_bn) : (merged.badge_en || defaultZigZagData.badge_en);
  const title = language === 'bn' ? (merged.title_bn || defaultZigZagData.title_bn) : (merged.title_en || defaultZigZagData.title_en);
  const subtitle = language === 'bn' ? (merged.subtitle_bn || defaultZigZagData.subtitle_bn) : (merged.subtitle_en || defaultZigZagData.subtitle_en);
  const headerBg = merged.header_bg_color || '#2E5942';

  const items = merged.items || defaultZigZagData.items!;

  return (
    <section className="w-full my-6 md:my-10 animate-fade-in font-sans text-left">
      <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-stone-300">
        
        {/* ── TOP HEADER BANNER ── */}
        <div 
          className="py-10 px-6 sm:px-12 text-center text-white space-y-3 relative overflow-hidden"
          style={{ backgroundColor: headerBg }}
        >
          {/* Subtle background luxury texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {badge && (
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-white/90 bg-black/20 px-4 py-1 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{badge}</span>
            </div>
          )}

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs sm:text-sm text-white/80 font-sans font-light max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── ALTERNATING ZIG-ZAG STRIPS (Exact Reference Style) ── */}
        <div className="divide-y divide-white/10">
          {items.map((item, idx) => {
            const isOdd = idx % 2 === 0; // Even index in 0-based is row 1, 3, 5 (Icon on Left)
            const bgColor = item.bg_color || (idx === 0 ? '#B8862A' : idx === 1 ? '#8C6212' : idx === 2 ? '#1E3B2C' : idx === 3 ? '#A3751E' : idx === 4 ? '#2E5942' : '#261A0C');
            const numLabel = language === 'bn' 
              ? (item.number_label_bn || item.title_bn || `${idx + 1}. কার্যক্রম`) 
              : (item.number_label_en || item.title_en || `${idx + 1}. Activity`);
            const desc = language === 'bn' ? item.desc_bn : item.desc_en;

            return (
              <div
                key={idx}
                className="p-6 sm:p-10 lg:p-12 text-white transition-all duration-300 group flex items-center"
                style={{ backgroundColor: bgColor }}
              >
                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                  
                  {/* Left Side: Icon if Odd, Text if Even on desktop */}
                  {isOdd ? (
                    <>
                      {/* Left: Icon */}
                      <div className="md:col-span-4 flex justify-center md:justify-start">
                        {item.png_icon_url ? (
                          <img 
                            src={item.png_icon_url} 
                            alt={numLabel}
                            className="w-20 h-20 sm:w-28 sm:h-28 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          renderLineArtIcon(item.icon_key, item.icon_style)
                        )}
                      </div>

                      {/* Right: Text */}
                      <div className="md:col-span-8 space-y-2.5 text-center md:text-left">
                        <h3 className="font-serif font-black text-lg sm:text-2xl lg:text-3xl tracking-tight uppercase leading-snug">
                          {numLabel}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 font-sans font-light leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Mobile order: Icon first on mobile, text left on desktop */}
                      {/* Left: Text on desktop */}
                      <div className="order-2 md:order-1 md:col-span-8 space-y-2.5 text-center md:text-left">
                        <h3 className="font-serif font-black text-lg sm:text-2xl lg:text-3xl tracking-tight uppercase leading-snug">
                          {numLabel}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 font-sans font-light leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      {/* Right: Icon */}
                      <div className="order-1 md:order-2 md:col-span-4 flex justify-center md:justify-end">
                        {item.png_icon_url ? (
                          <img 
                            src={item.png_icon_url} 
                            alt={numLabel}
                            className="w-20 h-20 sm:w-28 sm:h-28 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          renderLineArtIcon(item.icon_key, item.icon_style)
                        )}
                      </div>
                    </>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
