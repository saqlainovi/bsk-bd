import React from 'react';
import { Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  language: 'bn' | 'en';
  onNavigate: (tabId: string) => void;
}

export default function Footer({ language, onNavigate }: FooterProps) {
  return (
    <footer className="pt-8 border-t border-[#B8862A]/20 pb-4 mt-12 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-[#6B5135] text-[11px]">
        <div className="space-y-3 text-left">
          <div className="flex flex-col gap-1 items-start w-[185px]">
            <img 
              src="https://bskbd.org/assets/img/logo_bn2.png" 
              alt="BSK Logo" 
              className="w-[185px] h-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="w-full flex justify-between text-[11px] font-serif font-black text-stone-900 select-none mt-1">
              {language === 'bn' ? (
                <>
                  <span>আ</span>
                  <span>লো</span>
                  <span>কি</span>
                  <span>ত</span>
                  <span className="w-1.5 shrink-0" />
                  <span>মা</span>
                  <span>নু</span>
                  <span>ষ</span>
                  <span className="w-1.5 shrink-0" />
                  <span>চা</span>
                  <span>ই</span>
                </>
              ) : (
                <span className="text-[9px] tracking-widest font-bold">Seeking Enlightened Souls</span>
              )}
            </div>
          </div>
          <p className="leading-relaxed">
            {language === 'bn' ? 'বাংলাদেশের শীর্ষস্থানীয় সাহিত্য ও চিত্ত বিকাশের সংস্কৃতিক সংগঠন। ১৯৭৮ সাল থেকে নিরলস কাজ করে চলেছে।' : 'Bangladesh\'s leading cultural organization building humane and complete minds since 1978.'}
          </p>
        </div>
        <div className="space-y-1 text-left">
          <h5 className="font-bold text-[#1A1207] uppercase tracking-wider font-serif text-[12px] mb-1">{language === 'bn' ? 'পরিচিতি' : 'Introduction'}</h5>
          <span className="block hover:text-[#B8862A] cursor-pointer" onClick={() => onNavigate('mission')}>{language === 'bn' ? 'ব্রত-লক্ষ্য-উদ্দেশ্য' : 'Mission & Vision'}</span>
          <span className="block hover:text-[#B8862A] cursor-pointer" onClick={() => onNavigate('governance')}>{language === 'bn' ? 'পরিচালনা ও ট্রাস্টি বোর্ড' : 'Trustees & Governance'}</span>
          <span className="block hover:text-[#B8862A] cursor-pointer" onClick={() => onNavigate('bsk-history')}>{language === 'bn' ? 'ইতিহাস ও যাত্রা' : 'History & Milestones'}</span>
          <span className="block hover:text-[#B8862A] cursor-pointer" onClick={() => onNavigate('achievement')}>{language === 'bn' ? 'অর্জিত সম্মাননা' : 'Achievements'}</span>
        </div>
        <div className="space-y-1 flex flex-col text-left">
          <h5 className="font-bold text-[#1A1207] uppercase tracking-wider font-serif text-[12px] mb-1">{language === 'bn' ? 'প্রধান কার্যক্রম' : 'Main Activities'}</h5>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('nationwide-excellence')}>{language === 'bn' ? 'দেশভিত্তিক উৎকর্ষ কার্যক্রম' : 'Nationwide Excellence'}</span>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('mobile-library')}>{language === 'bn' ? 'ভ্রাম্যমাণ লাইব্রেরি' : 'Mobile Libraries'}</span>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('book-fair')}>{language === 'bn' ? 'ভ্রাম্যমাণ বইমেলা' : 'Mobile Book Fair'}</span>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('central-library')}>{language === 'bn' ? 'কেন্দ্রীয় লাইব্রেরি' : 'Central Library HQ'}</span>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('aalor-ishkool')}>{language === 'bn' ? 'আলোর ইশকুল' : 'Aalor Ishkool (Light School)'}</span>
          <span className="hover:text-[#B8862A] cursor-pointer text-left" onClick={() => onNavigate('reading-habit')}>{language === 'bn' ? 'পাঠাভ্যাস উন্নয়ন' : 'Reading Culture Program'}</span>
        </div>
        <div className="space-y-2 text-left">
          <h5 className="font-bold text-[#1A1207] uppercase tracking-wider font-serif text-[12px] mb-1">{language === 'bn' ? 'অফিসিয়াল কেন্দ্র' : 'HQ Headquarters'}</h5>
          <span className="block">{language === 'bn' ? '📍 বাংলামোটর, ঢাকা, বাংলাদেশ' : '📍 Banglamotor, Dhaka, Bangladesh'}</span>
          <span className="block">📞 +880-2-9661188</span>
          <span className="block">✉️ info@bskbd.org</span>
        </div>
        <div className="space-y-2 text-left">
          <h5 className="font-bold text-[#1A1207] uppercase tracking-wider font-serif text-[12px] mb-1">
            {language === 'bn' ? 'সামাজিক যোগাযোগ' : 'Social Media'}
          </h5>
          <div className="flex flex-col gap-2 mt-1.5">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#1877F2] transition duration-150 group">
              <Facebook className="h-3.5 w-3.5 text-[#6B5135] group-hover:text-[#1877F2] transition duration-150" />
              <span className="font-medium text-[11px] text-[#6B5135] group-hover:text-[#1877F2] transition duration-150">{language === 'bn' ? 'ফেসবুক' : 'Facebook'}</span>
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#FF0000] transition duration-150 group">
              <Youtube className="h-3.5 w-3.5 text-[#6B5135] group-hover:text-[#FF0000] transition duration-150" />
              <span className="font-medium text-[11px] text-[#6B5135] group-hover:text-[#FF0000] transition duration-150">{language === 'bn' ? 'ইউটিউব' : 'YouTube'}</span>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#E4405F] transition duration-150 group">
              <Instagram className="h-3.5 w-3.5 text-[#6B5135] group-hover:text-[#E4405F] transition duration-150" />
              <span className="font-medium text-[11px] text-[#6B5135] group-hover:text-[#E4405F] transition duration-150">{language === 'bn' ? 'ইনস্টাগ্রাম' : 'Instagram'}</span>
            </a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#BD081C] transition duration-150 group">
              <svg className="h-3.5 w-3.5 text-[#6B5135] group-hover:text-[#BD081C] transition duration-150 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.63 11.13-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.49.75 1.49 1.65 0 1-.64 2.5-.97 3.88-.28 1.17.58 2.12 1.73 2.12 2.08 0 3.68-2.2 3.68-5.37 0-2.8-2.02-4.77-4.9-4.77-3.34 0-5.3 2.5-5.3 5.1 0 1 .38 2.1 1.04 2.9.1.1.1.2.08.33l-.38 1.57c-.06.26-.2.32-.47.2-1.78-.83-2.9-3.43-2.9-5.52 0-4.5 3.27-8.63 9.42-8.63 4.95 0 8.8 3.53 8.8 8.24 0 4.92-3.1 8.88-7.4 8.88-1.45 0-2.8-.75-3.27-1.64l-.9 3.4c-.32 1.23-1.2 2.77-1.78 3.73A12 12 0 1 0 12 0z"/>
              </svg>
              <span className="font-medium text-[11px] text-[#6B5135] group-hover:text-[#BD081C] transition duration-150">{language === 'bn' ? 'পিন্টারেস্ট' : 'Pinterest'}</span>
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0077B5] transition duration-150 group">
              <Linkedin className="h-3.5 w-3.5 text-[#6B5135] group-hover:text-[#0077B5] transition duration-150" />
              <span className="font-medium text-[11px] text-[#6B5135] group-hover:text-[#0077B5] transition duration-150">{language === 'bn' ? 'লিঙ্কডইন' : 'LinkedIn'}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#B8862A]/10 mt-6 pt-4 w-full flex flex-col sm:flex-row items-center justify-between text-[9.5px] text-[#6B5135] font-sans tracking-wide">
        <span>© ২০২৪ বিশ্বসাহিত্য কেন্দ্র · bskbd.org · সর্বস্বত্ব সংরক্ষিত</span>
        <span>আলোকিত মানুষ চাই</span>
      </div>
    </footer>
  );
}
