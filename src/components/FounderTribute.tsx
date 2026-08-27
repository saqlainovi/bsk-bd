import { ParsedPage, Language } from '../types';
import { Award, Quote, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import websiteContentRaw from '../data/website_content.json';

interface FounderTributeProps {
  page: ParsedPage;
  language: Language;
}

export default function FounderTribute({ page, language }: FounderTributeProps) {
  const safePage = page || {} as ParsedPage;

  // Default raw static founder page from website_content.json
  const defaultFounderRaw = (websiteContentRaw as ParsedPage[]).find(p => p.id === 'founder') || { sections: [] };

  // Helper to test if string is dummy or test
  const isTestVal = (val: string | undefined | null) => {
    if (!val) return true;
    const clean = val.trim().toLowerCase();
    return clean === '' || clean === 'test' || clean === 'test...' || clean === 'tst';
  };

  // Classic inspiring citations
  const defaultQuotes = [
    {
      bn: '“ক্ষুদ্র মানুষ আর বড় জাতি একসঙ্গে হতে পারে না। যদি বড় জাতি গড়তে চাই, তবে বড় মনের মানুষ তৈরি করতে হবে।”',
      en: '“Small minds and a grand nation cannot coexist. If we want to build a grand nation, we must nurture expanded souls first.”'
    },
    {
      bn: '“বই পড়লে মানুষ ধনী হয় না কিন্তু মননের ঐশ্বর্যে সে রাজপ্রাসাদের অধিকারীকেও ছাড়িয়ে যেতে পারে।”',
      en: '“Reading books might not make someone financially wealthy, but the riches of their mind can easily surpass a king’s palace.”'
    }
  ];

  const rawQuotes = Array.isArray(safePage.founder_quotes) && safePage.founder_quotes.length > 0
    ? safePage.founder_quotes.map((q: any) => {
        if (!q) return { bn: '', en: '' };
        if (typeof q === 'string') return { bn: q, en: q };
        return { bn: q.text_bn || q.text || '', en: q.text_en || q.text || '' };
      }).filter(q => !isTestVal(q.bn) || !isTestVal(q.en))
    : [];

  const displayQuotes = rawQuotes.length > 0 ? rawQuotes : defaultQuotes;

  const founderNameBn = !isTestVal(safePage.founder_name_bn) ? safePage.founder_name_bn : 'অধ্যাপক আবদুল্লাহ আবু সায়ীদ';
  const founderNameEn = !isTestVal(safePage.founder_name_en) ? safePage.founder_name_en : 'Prof. Abdullah Abu Sayeed';
  const avatarUrl = (!isTestVal(safePage.founder_avatar) && safePage.founder_avatar) ? safePage.founder_avatar : "https://bskbd.org/assets/img/logo_bn2.png";

  const founderBioBn = !isTestVal(safePage.founder_bio_bn) ? safePage.founder_bio_bn : 'বাংলাদেশের প্রখ্যাত বহুভাষাবিদ, লেখক, শিক্ষাবিদ এবং বুদ্ধিজীবী। ১৯৭৮ সাল থেকে দেশব্যাপী "বইপড়া" আন্দোলনের রূপকার এবং বিশ্বসাহিত্য কেন্দ্রের প্রাণপুরুষ।';
  const founderBioEn = !isTestVal(safePage.founder_bio_en) ? safePage.founder_bio_en : 'A legendary Bangladeshi writer, educator, television presenter, and intellectual. He is the mastermind behind the country-wide Book Reading Movement.';

  const magsayTitleBn = !isTestVal(safePage.founder_magsaysay_title_bn) ? safePage.founder_magsaysay_title_bn : 'রেমন ম্যাগসেসে পুরস্কার (২০০৪)';
  const magsayTitleEn = !isTestVal(safePage.founder_magsaysay_title_en) ? safePage.founder_magsaysay_title_en : 'Ramon Magsaysay Citation';
  const magsayTextBn = !isTestVal(safePage.founder_magsaysay_text_bn) ? safePage.founder_magsaysay_text_bn : '“বাংলাদেশের নবীন প্রজন্মকে সাহিত্যের গভীর অনুরাগে সিক্ত করে বাংলা ও বিশ্ব সাহিত্যের অন্যতম সেরা বইগুলোর সাথে পরিচয় করিয়ে দিয়ে তাদের নৈতিক ও মানবিক চেতনার জাগরণ ঘটানোর অসামান্য অবদানের স্বীকৃতি।”';
  const magsayTextEn = !isTestVal(safePage.founder_magsaysay_text_en) ? safePage.founder_magsaysay_text_en : '“Awarded for cultivating in the youth of Bangladesh a profound love for literature and humanity through reading circles and books selection.”';

  const unescoTitleBn = !isTestVal(safePage.founder_unesco_title_bn) ? safePage.founder_unesco_title_bn : 'ইউনেস্কো কমেনিয়াস পদক (২০০৮)';
  const unescoTitleEn = !isTestVal(safePage.founder_unesco_title_en) ? safePage.founder_unesco_title_en : 'UNESCO Comenius Honor';
  const unescoTextBn = !isTestVal(safePage.founder_unesco_text_bn) ? safePage.founder_unesco_text_bn : '“বিস্ময়কর ও উদ্ভাবনী বইপড়ার চমৎকার আয়োজনের মাধ্যমে সারা দেশে শিশু-কিশোর ও জনগণের মাঝে শিক্ষা বিস্তার ও চিন্তাশীলতার ভিত্তি স্থাপন সম্ভব করায় বিশ্বসাহিত্য কেন্দ্রকে এই ইউনেস্কো পদক দেওয়া হয়।”';
  const unescoTextEn = !isTestVal(safePage.founder_unesco_text_en) ? safePage.founder_unesco_text_en : '“Awarding BSK for outstanding innovative, modern, and inspiring methods to expand reading interests and habits with a countrywide reach.”';

  // Extract sections and check if they are valid
  const rawSections = Array.isArray(safePage.sections) ? safePage.sections : [];
  const validSections = rawSections.filter(sec => {
    if (!sec || !Array.isArray(sec.content) || sec.content.length === 0) return false;
    const firstContent = sec.content[0];
    return !isTestVal(firstContent);
  });

  const displaySections = validSections.length > 0 ? validSections : (defaultFounderRaw.sections || []);

  return (
    <div className="space-y-8 animate-fade-in w-full text-[#1A1207]">
      {/* Top Banner introducing Professor Abdullah Abu Sayeed */}
      <div className="relative rounded-2xl overflow-hidden border border-[#B8862A]/30 bg-[#1A1207] text-[#FAF7F2] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-lg bg-grain">
        {/* Founder Avatar Frame */}
        <div className="relative shrink-0 w-32 h-32 rounded-full overflow-hidden border-2 border-[#B8862A] p-1 bg-[#FAF7F2] shadow-inner flex items-center justify-center select-none grayscale hover:grayscale-0 transition duration-300">
          <img 
            src={avatarUrl} 
            alt={language === 'bn' ? founderNameBn : founderNameEn} 
            className={`rounded-full ${safePage.founder_avatar && !isTestVal(safePage.founder_avatar) ? 'w-full h-full object-cover' : 'w-24 h-24 object-contain'}`}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="space-y-3 text-center md:text-left flex-1">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#B8862A]/25 border border-[#B8862A]/50 text-[#F0CC7A] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-[#F0CC7A]" />
            <span>{language === 'bn' ? 'প্রতিষ্ঠাতা ও সভাপতি' : 'Founder & President'}</span>
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold !text-white drop-shadow-sm">
            {language === 'bn' ? founderNameBn : founderNameEn}
          </h1>
          <p className="text-xs md:text-sm !text-white/95 leading-relaxed font-normal font-sans drop-shadow-xs">
            {language === 'bn' ? founderBioBn : founderBioEn}
          </p>
          
          {Array.isArray(safePage.founder_badges) && safePage.founder_badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 font-mono">
              {safePage.founder_badges.map((b: any, bIdx: number) => {
                if (!b) return null;
                const txt = typeof b === 'string' 
                  ? b 
                  : (language === 'bn' ? (b.label_bn || b.label || '') : (b.label_en || b.label || ''));
                if (!txt || typeof txt !== 'string' || isTestVal(txt)) return null;
                return (
                  <span key={bIdx} className="px-2.5 py-1 bg-[#3D2B14] text-[#F0CC7A] border border-[#B8862A]/40 text-[9px] rounded-md font-bold uppercase">
                    {txt}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RAMON MAGSAYSAY & UNESCO citation spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-white border border-[#E8DDD0] hover:border-[#B8862A]/50 rounded-2xl space-y-3.5 shadow-sm shadow-[#3D2B14]/5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 text-[#1A1207] border-b border-[#E8DDD0]/80 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#B8862A]/30 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="h-5 w-5 text-[#B8862A]" />
            </div>
            <h3 className="font-serif font-bold text-base md:text-lg text-[#1A1207] tracking-tight">
              {language === 'bn' ? magsayTitleBn : magsayTitleEn}
            </h3>
          </div>
          <p className="text-sm md:text-[15px] text-stone-900 font-sans leading-relaxed font-normal">
            {language === 'bn' ? magsayTextBn : magsayTextEn}
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E8DDD0] hover:border-[#B8862A]/50 rounded-2xl space-y-3.5 shadow-sm shadow-[#3D2B14]/5 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-3 text-[#1A1207] border-b border-[#E8DDD0]/80 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#B8862A]/30 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="h-5 w-5 text-[#B8862A]" />
            </div>
            <h3 className="font-serif font-bold text-base md:text-lg text-[#1A1207] tracking-tight">
              {language === 'bn' ? unescoTitleBn : unescoTitleEn}
            </h3>
          </div>
          <p className="text-sm md:text-[15px] text-stone-900 font-sans leading-relaxed font-normal">
            {language === 'bn' ? unescoTextBn : unescoTextEn}
          </p>
        </div>
      </div>

      {/* Slider of selected inspirational quotes */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1A1207]">
          {language === 'bn' ? 'অনন্য বাণী ও জীবনদর্শন' : 'Inspirational Philosophy'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayQuotes.map((q, idx) => (
            <div key={idx} className="bg-white border border-[#E8DDD0] p-5 rounded-xl relative overflow-hidden">
              <span className="absolute -top-4 -left-2 text-6xl text-[#E8DDD0]/50 font-serif leading-none select-none pointer-events-none">“</span>
              <p className="text-sm text-stone-900 leading-relaxed font-serif italic mb-2 relative z-10">
                {language === 'bn' ? q.bn : q.en}
              </p>
              <div className="text-[11px] text-[#6B5135] font-sans font-bold text-right">
                {language === 'bn' 
                  ? `— ${founderNameBn}` 
                  : `— ${founderNameEn}`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Extracted content paragraphs */}
      <div className="space-y-4">
        <h3 className="font-serif text-base md:text-lg font-bold text-[#1A1207] border-b border-[#E8DDD0] pb-2">
          {language === 'bn' ? 'জীবনী ও আদর্শিক দর্শন' : 'Biography & Intellectual Vision'}
        </h3>
        
        <div className="space-y-4">
          {displaySections.map((sec, sIdx) => {
            if (!sec || !sec.content || !Array.isArray(sec.content) || sec.content.length === 0) return null;
            return (
              <div key={sIdx} className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DDD0] shadow-xs space-y-4">
                {sec.title && sec.title !== safePage.title_bn && (
                  <h4 className="font-serif font-bold text-base text-[#1A1207] border-l-2 border-[#B8862A] pl-3">
                    {sec.title}
                  </h4>
                )}
                <div className="space-y-3.5">
                  {(Array.isArray(sec.content) ? sec.content : []).map((pText, pIdx) => (
                    <p key={pIdx} className="text-stone-900 text-sm md:text-base leading-relaxed font-sans">
                      {pText}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
