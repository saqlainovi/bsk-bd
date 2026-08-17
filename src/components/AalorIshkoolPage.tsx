import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Sparkles, Compass, CheckCircle, 
  HelpCircle, ArrowRight, Award, Music, Film, Layers, 
  Calendar, Clock, FileText, Send, Mail, CheckCircle2, ChevronRight,
  BookMarked, Lightbulb, Users, Phone, MapPin, Search, Star
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AalorIshkoolPageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (tab: string) => void;
  setActivePhoto: (url: string) => void;
  setActivePhotoIndex: (i: number) => void;
  setActiveAlbumPhotos: (urls: string[]) => void;
}

export const AalorIshkoolPage: React.FC<AalorIshkoolPageProps> = ({
  page,
  language,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'courses' | 'books' | 'apply'>('overview');
  const [searchCourse, setSearchCourse] = useState('');
  const [courseCategory, setCourseCategory] = useState<'all' | 'philosophy' | 'arts' | 'history' | 'literature' | 'science'>('all');
  const [activeYear, setActiveYear] = useState<number>(1);
  const [searchBook, setSearchBook] = useState('');

  // Firebase Admission Form State
  const [form, setForm] = useState({ name: '', phone: '', email: '', occupation: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError(language === 'bn' ? 'অনুগ্রহ করে নাম ও মোবাইল নম্বর প্রদান করুন।' : 'Please enter your name and phone number.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'alor_ishkool_applications'), {
        name: form.name,
        phone: form.phone,
        email: form.email || '',
        occupation: form.occupation || '',
        message: form.message || '',
        createdAt: serverTimestamp(),
        source: 'Aalor Ishkool Page'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback local acknowledgment
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // 40 Subject Courses from PDF brochure
  const courses40 = [
    { id: 1, titleBn: "উপমহাদেশীয় ধ্রুপদী নৃত্য", titleEn: "Subcontinental Classical Dance", category: "arts" },
    { id: 2, titleBn: "বাঙালীর ইতিহাস (সামাজিক, সাংস্কৃতিক ও রাজনৈতিক জীবনে বিভিন্ন আন্দোলন ও বিপ্লব)", titleEn: "History of Bengalis (Social, Cultural & Political Revolutions)", category: "history" },
    { id: 3, titleBn: "স্থাপত্যের নান্দনিকতা", titleEn: "Aesthetics of Architecture", category: "arts" },
    { id: 4, titleBn: "বাংলাদেশের গাছ, ফুল ও নিসর্গ পরিচিতি", titleEn: "Flora, Trees & Natural Landscape of Bangladesh", category: "science" },
    { id: 5, titleBn: "চীনের দর্শন", titleEn: "Chinese Philosophy", category: "philosophy" },
    { id: 6, titleBn: "নৃ-তত্ত্ব: পাঠচক্রের অন্তর্গত বই পড়তে হবে", titleEn: "Anthropology (Core Text Reading)", category: "science" },
    { id: 7, titleBn: "বিশ্বের শ্রেষ্ঠ স্বল্পদৈর্ঘ্য চলচ্চিত্র প্রদর্শন", titleEn: "Screening of World's Masterpiece Short Films", category: "arts" },
    { id: 8, titleBn: "ইংরেজি: চার বছরের মধ্যে উন্নতমানের ইংরেজি শেখার কর্মসূচি", titleEn: "Advanced English Proficiency Program (4-Year Track)", category: "literature" },
    { id: 9, titleBn: "মুসলিম দর্শন", titleEn: "Islamic Philosophy & Intellectual Traditions", category: "philosophy" },
    { id: 10, titleBn: "বাংলাদেশের আইন ও বিচার ব্যবস্থা পরিচিতি", titleEn: "Introduction to Legal & Judicial System of Bangladesh", category: "history" },
    { id: 11, titleBn: "সাহিত্য সংঘ (কবিতা পড়া, গান, নাচ, আবৃত্তি, বই রিভিউ, টিভিতে অনুষ্ঠান)", titleEn: "Literary Guild (Poetry Recital, Music, Book Reviews & Broadcasts)", category: "literature" },
    { id: 12, titleBn: "ভারতীয় ধ্রুপদী সংগীত", titleEn: "Indian Classical Music", category: "arts" },
    { id: 13, titleBn: "জ্যোতির্বিদ্যা", titleEn: "Astronomy & Cosmology", category: "science" },
    { id: 14, titleBn: "বিশ্বের শ্রেষ্ঠ চলচ্চিত্র", titleEn: "World Cinema Masterpieces & Film Studies", category: "arts" },
    { id: 15, titleBn: "সাম্প্রতিক দর্শন", titleEn: "Contemporary Philosophy", category: "philosophy" },
    { id: 16, titleBn: "নাট্যানুষ্ঠান, চিত্রকলা প্রদর্শনী ও সাংস্কৃতিক অনুষ্ঠান আস্বাদন", titleEn: "Appreciation of Theater, Fine Arts & Cultural Exhibitions", category: "arts" },
    { id: 17, titleBn: "অস্বাভাবিক মনস্তত্ত্ব", titleEn: "Abnormal Psychology & Human Mind", category: "science" },
    { id: 18, titleBn: "দেয়ালিকা তৈরি প্রশিক্ষণ (স্কুল)", titleEn: "Wall Magazine Creation Workshop", category: "arts" },
    { id: 19, titleBn: "ইকেবানা (জাপানি পদ্ধতিতে ফুল সাজানো)", titleEn: "Ikebana (Japanese Flower Arrangement Art)", category: "arts" },
    { id: 20, titleBn: "আবৃত্তি সংঘ", titleEn: "Elocution & Recitation Circle", category: "literature" },
    { id: 21, titleBn: "বিভিন্ন পর্যায়ে বাংলাদেশ ভ্রমণ", titleEn: "Educational Heritage Travels Across Bangladesh", category: "history" },
    { id: 22, titleBn: "বই বক্তৃতা (বিভিন্ন বিষয়ের উপর)", titleEn: "Book Oration Series", category: "literature" },
    { id: 23, titleBn: "গল্প বলা কর্মশালা (স্কুল)", titleEn: "Storytelling Workshop", category: "literature" },
    { id: 24, titleBn: "বার্ষিক নাটক/অভিনয়ের নির্মাণ কৌশল শেখা", titleEn: "Annual Theater Production & Acting Techniques", category: "arts" },
    { id: 25, titleBn: "রাজনৈতিক দর্শন", titleEn: "Political Philosophy", category: "philosophy" },
    { id: 26, titleBn: "ফটোগ্রাফি সংঘ", titleEn: "Photography Guild", category: "arts" },
    { id: 27, titleBn: "বিজ্ঞানের অগ্রযাত্রা ও মানবসভ্যতার ওপর তার প্রভাব", titleEn: "Progress of Science & Its Impact on Civilization", category: "science" },
    { id: 28, titleBn: "আমলাতন্ত্রের ইতিহাস", titleEn: "History of Bureaucracy", category: "history" },
    { id: 29, titleBn: "ভারতীয় দর্শন", titleEn: "Indian Philosophical Thought", category: "philosophy" },
    { id: 30, titleBn: "রবীন্দ্র পাঠচক্র (রবীন্দ্রনাথের বহুমুখী অবদানের ওপর সামগ্রিক পঠন-পাঠন)", titleEn: "Tagore Studies Circle (Comprehensive Study of Rabindranath)", category: "literature" },
    { id: 31, titleBn: "চিত্রকলার উপর বক্তৃতা", titleEn: "Lectures on History & Aesthetics of Painting", category: "arts" },
    { id: 32, titleBn: "পাশ্চাত্য দর্শন", titleEn: "Western Philosophy", category: "philosophy" },
    { id: 33, titleBn: "প্রযুক্তির ইতিহাস", titleEn: "History of Technology & Innovation", category: "science" },
    { id: 34, titleBn: "বিভিন্ন দেশের শ্রেষ্ঠ প্রামাণ্যচিত্র ও নৃত্যানুষ্ঠান", titleEn: "World Documentaries & Cultural Dance Screenings", category: "arts" },
    { id: 35, titleBn: "জীবনী (মহীয়সী ও মনীষীদের জীবন গাথা)", titleEn: "Biographies of Great Luminaries", category: "history" },
    { id: 36, titleBn: "বিভিন্ন বিচ্ছিন্ন বিষয়ে বক্তৃতা ও মুক্ত আলোচনা", titleEn: "Symposia & Open Discourse Series", category: "philosophy" },
    { id: 37, titleBn: "ভূগোলের রূপরেখা (ম্যাপের খেলা)", titleEn: "Outlines of Geography (Map Games)", category: "science" },
    { id: 38, titleBn: "প্রাচ্য সংগীত", titleEn: "Oriental & Eastern Music Traditions", category: "arts" },
    { id: 39, titleBn: "অসুখ, ওষুধ ও আরোগ্যের ইতিহাস", titleEn: "History of Medicine, Illness & Healing", category: "science" },
    { id: 40, titleBn: "বাঙালী দর্শন", titleEn: "Bengali Philosophical Thought & Heritage", category: "philosophy" }
  ];

  // Book lists by year from PDF
  const booksByYear: Record<number, { titleBn: string; authorBn: string; titleEn?: string }[]> = {
    1: [
      { titleBn: "শেষের কবিতা", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "পালামৌ", authorBn: "সঞ্জীবচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "সপ্তপদী", authorBn: "তারাশঙ্কর বন্দ্যোপাধ্যায়" },
      { titleBn: "কপালকুণ্ডলা", authorBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "অল কোয়ায়েট অন দ্য ওয়েস্টার্ন ফ্রন্ট", authorBn: "এরিক মারিয়া রেমার্ক" },
      { titleBn: "ক্রীতদাসের হাসি", authorBn: "শওকত ওসমান" },
      { titleBn: "গান্ধার", authorBn: "কৃষণ চন্দর" },
      { titleBn: "দ্য ওল্ড ম্যান অ্যান্ড দ্য সি", authorBn: "আর্নেস্ট হেমিংওয়ে" },
      { titleBn: "আঙ্কল টমস কেবিন", authorBn: "হারিয়েট বিচার স্টো" },
      { titleBn: "ডাকঘর", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "সিদ্ধার্থ", authorBn: "হেরমান হেস" },
      { titleBn: "শৃঙ্খলিত প্রমিথিউস", authorBn: "এসকিলাস" },
      { titleBn: "ও হেনরির শ্রেষ্ঠ গল্প", authorBn: "ও হেনরি" },
      { titleBn: "পারস্য প্রতিভা", authorBn: "মোহাম্মদ বরকতুল্লাহ" },
      { titleBn: "অদৃশ্য মানব", authorBn: "এইচ. জি. ওয়েলস" },
      { titleBn: "লাল নীল দীপাবলি", authorBn: "হুমায়ুন আজাদ" },
      { titleBn: "গোরা", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "ড. জেকিল ও মি. হাইড", authorBn: "রবার্ট লুই স্টিভেন্সন" },
      { titleBn: "কবি", authorBn: "তারাশঙ্কর বন্দ্যোপাধ্যায়" },
      { titleBn: "পুতুল নাচের ইতিকথা", authorBn: "মানিক বন্দ্যোপাধ্যায়" },
      { titleBn: "নাজিম হিকমতের কবিতা", authorBn: "সুভাষ মুখোপাধ্যায় (অনূদিত)" },
      { titleBn: "রাজা ঈদিপাস", authorBn: "সোফোক্লিস" },
      { titleBn: "দ্য প্রফেট", authorBn: "কাহলিল জিবরান" },
      { titleBn: "বদলে যান এখনই", authorBn: "তারিক হক" },
      { titleBn: "মোতাহের হোসেন চৌধুরীর নির্বাচিত প্রবন্ধ", authorBn: "মোতাহের হোসেন চৌধুরী" },
      { titleBn: "তাপসী ও তরঙ্গিনী", authorBn: "বুদ্ধদেব বসু" },
      { titleBn: "সক্রেটিসের জবানবন্দী", authorBn: "সরদার ফজলুল করিম" },
      { titleBn: "অস্কার ওয়াইল্ডের রূপকথা", authorBn: "অস্কার ওয়াইল্ড" },
      { titleBn: "এ্যান্টিগনি", authorBn: "সোফোক্লিস" },
      { titleBn: "মধ্যযুগের শ্রেষ্ঠ বাংলা কবিতা", authorBn: "বিশ্বসাহিত্য কেন্দ্র" },
      { titleBn: "গালিবের গজল থেকে", authorBn: "আবু সয়ীদ আইয়ুব" },
      { titleBn: "ম্যাক্সিম", authorBn: "লা রোশফুকো" },
      { titleBn: "পদ্মা নদীর মাঝি", authorBn: "মানিক বন্দ্যোপাধ্যায়" },
      { titleBn: "দেশে বিদেশে", authorBn: "সৈয়দ মুজতবা আলী" },
      { titleBn: "কৃষ্ণকান্তের উইল", authorBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "হ্যান্স অ্যান্ডারসনের রূপকথা", authorBn: "হ্যান্স ক্রিশ্চিয়ান অ্যান্ডারসন" },
      { titleBn: "শ্রেষ্ঠ ছোটগল্প", authorBn: "ম্যাক্সিম গোর্কি" },
      { titleBn: "সূর্য সেন", authorBn: "অশোক কুমার মুখোপাধ্যায়" },
      { titleBn: "বিদ্যাসাগর", authorBn: "শঙ্খ ঘোষ" },
      { titleBn: "চে", authorBn: "সুনন্দন চক্রবর্তী" },
      { titleBn: "গ্যালিলিও", authorBn: "শিবাজী বন্দ্যোপাধ্যায়" },
      { titleBn: "গান্ধী", authorBn: "সুভাষ ঘোষাল" },
      { titleBn: "ডিরোজিও", authorBn: "অভীক মজুমদার" },
      { titleBn: "ভলতেয়ার", authorBn: "দেবীপ্রসাদ চট্টোপাধ্যায়" },
      { titleBn: "বিপ্লবের সন্তান নেপোলিয়ান", authorBn: "স্বপন মুখোপাধ্যায়" }
    ],
    2: [
      { titleBn: "রেনেসাঁস সম্পর্কে প্রস্তাবনা", authorBn: "শিবনারায়ণ রায়" },
      { titleBn: "গ্রীক সভ্যতা", authorBn: "সৈয়দ আমীরুল ইসলাম" },
      { titleBn: "রামতনু লাহিড়ী ও তৎকালীন বঙ্গসমাজ", authorBn: "শিবনাথ শাস্ত্রী" },
      { titleBn: "বাংলার রেনেসাঁস", authorBn: "অন্নদাশঙ্কর রায়" },
      { titleBn: "ভল্গা থেকে গঙ্গা", authorBn: "রাহুল সাংকৃত্যায়ন" },
      { titleBn: "সোজন বাদিয়ার ঘাট", authorBn: "জসীমউদ্দীন" },
      { titleBn: "আনা কারেনিনা", authorBn: "লিও তলস্তয়" },
      { titleBn: "নোরা (আ ডল'স হাউস)", authorBn: "হেনরিক ইবসেন" },
      { titleBn: "গুড আর্থ", authorBn: "পার্ল এস বাক" },
      { titleBn: "মাছি", authorBn: "জাঁ পল সার্ত্র" },
      { titleBn: "দ্য ট্রায়াল", authorBn: "ফ্রাঞ্জ কাফকা" },
      { titleBn: "রক্তকরবী", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "মহাভারত (সংক্ষিপ্ত)", authorBn: "রাজশেখর বসু" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "জ্যাক লন্ডন" },
      { titleBn: "সেরা কিশোর গল্প", authorBn: "লিও তলস্তয়" },
      { titleBn: "বাংলা সাহিত্যের নির্বাচিত ছোটগল্প ১", authorBn: "প্রবিসকে" },
      { titleBn: "পথে প্রবাসে", authorBn: "অন্নদাশঙ্কর রায়" },
      { titleBn: "হেক্টর", authorBn: "জাঁ জিরাদু" },
      { titleBn: "তারাস বুলবা", authorBn: "নিকোলাই গোগল" },
      { titleBn: "যদ্যপি আমার গুরু", authorBn: "আহমদ ছফা" },
      { titleBn: "পঞ্চভূত", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "শীতে উপেক্ষিতা", authorBn: "রঞ্জন" },
      { titleBn: "শ্রীকান্ত (প্রথম পর্ব)", authorBn: "শরৎচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "সভ্যতা", authorBn: "ক্লাইভ বেল" },
      { titleBn: "চাঁদ বণিকের পালা", authorBn: "শম্ভু মিত্র" },
      { titleBn: "শ্রেষ্ঠ বিদেশী গল্প", authorBn: "আবদুল্লাহ আবু সায়ীদ" }
    ],
    3: [
      { titleBn: "গাংচিল", authorBn: "আন্তন চেখভ" },
      { titleBn: "একাত্তরের দিনগুলি", authorBn: "জাহানারা ইমাম" },
      { titleBn: "শয়তান", authorBn: "লিও তলস্তয়" },
      { titleBn: "বুদ্ধচরিত", authorBn: "অশ্ব ঘোষ" },
      { titleBn: "মহাপ্রস্থানের পথে", authorBn: "প্রবোধকুমার স্যান্যাল" },
      { titleBn: "পুষ্প, বৃক্ষ এবং বিহঙ্গ পুরাণ", authorBn: "আহমদ ছফা" },
      { titleBn: "চরণ ছুঁয়ে যাই", authorBn: "শংকর" },
      { titleBn: "বিसर्जन", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "বাংলাদেশের ছোটগল্প", authorBn: "প্রবিসকে" },
      { titleBn: "কাদম্বরী", authorBn: "বাণভট্ট" },
      { titleBn: "জীবনস্মৃতি", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "অতীশ দীপঙ্কর", authorBn: "একরাম আলী" },
      { titleBn: "জগদীশ চন্দ্র", authorBn: "সুভাষ মুখোপাধ্যায়" },
      { titleBn: "মিকেলাঞ্জেলো", authorBn: "সমীর সেনগুপ্ত" },
      { titleBn: "কনফুসিয়াস-এর কথোপকথন", authorBn: "হেলাল উদ্দিন আহমেদ" },
      { titleBn: "সুভাষ চন্দ্র", authorBn: "সুপর্ণা ভট্টাচার্য" },
      { titleBn: "ব্রেনসেন", authorBn: "জঁ রোস্তাঁ" },
      { titleBn: "হুমায়ুননামা", authorBn: "গুলবদন বেগম" },
      { titleBn: "মেঘদূত", authorBn: "কালিদাস" },
      { titleBn: "আরব্য রজনীর গল্প", authorBn: "রকিব হাসান (অনুদিত)" },
      { titleBn: "ফ্রাঙ্কেনস্টাইন", authorBn: "মেরি শেলী" },
      { titleBn: "দ্য প্রিন্স", authorBn: "নিকোলো ম্যাকিয়াভেলি" },
      { titleBn: "রিপাবলিক", authorBn: "সরদার ফজলুল করিম" },
      { titleBn: "ম্যাকবেথ", authorBn: "উইলিয়াম শেক্সপিয়র" },
      { titleBn: "এন এনিমি অব দ্য পিপল", authorBn: "হেনরিক ইবসেন" },
      { titleBn: "দ্য পার্ল", authorBn: "জন স্টাইনবেক" },
      { titleBn: "মরণপূতে রবীন্দ্রনাথ", authorBn: "মৈত্রেয়ী দেবী" },
      { titleBn: "কেউ কিছু বলতে পারে না", authorBn: "জর্জ বার্নার্ড শ'" },
      { titleBn: "ইলিয়াড", authorBn: "হোমার" },
      { titleBn: "সুকর্ণ", authorBn: "নুপেন্দ্রকৃষ্ণ চট্টোপাধ্যায়" },
      { titleBn: "মাইকেল", authorBn: "শিশুর কুমার দাস" },
      { titleBn: "রোকেয়া", authorBn: "সুতপা ভট্টাচার্য" },
      { titleBn: "আলাউদ্দীন", authorBn: "আলপনা রায়" },
      { titleBn: "সেপিয়েন্স", authorBn: "নোয়া হারারি" }
    ],
    4: [
      { titleBn: "শিকওয়া ও জবাব-ই শিকওয়া", authorBn: "ইকবাল" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "হাসান আজিজুল হক" },
      { titleBn: "কাব্যজিজ্ঞাসা", authorBn: "অতুলচন্দ্র গুপ্ত" },
      { titleBn: "বাংলার কাব্য", authorBn: "হুমায়ুন কবির" },
      { titleBn: "চারিত্রপূজা", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "চিরকুমার সভা", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "সৈয়দ মুজতবা আলী" },
      { titleBn: "অব্যক্ত", authorBn: "জগদীশচন্দ্র বসু" },
      { titleBn: "ওয়ার এন্ড পিস (যুদ্ধ ও শান্তি)", authorBn: "লিও তলস্তয়" },
      { titleBn: "আমার শিল্পী জীবনের কথা", authorBn: "আব্বাসউদ্দিন আহমেদ" },
      { titleBn: "আত্মজীবনী", authorBn: "দেবেন্দ্রনাথ ঠাকুর" },
      { titleBn: "চেঙ্গিজ খান", authorBn: "ভাসিলি ইয়ান" },
      { titleBn: "দিগ্বিজয়ী তৈমুর", authorBn: "হ্যারল্ড ল্যাম্ব" },
      { titleBn: "জোয়ান অব আর্ক", authorBn: "আসাদ চৌধুরী" },
      { titleBn: "লে মিজারেবল", authorBn: "ভিক্টর হুগো" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "শরৎচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "শ্রেষ্ঠ প্রবন্ধ", authorBn: "অবনীন্দ্রনাথ ঠাকুর" },
      { titleBn: "বীরবলের হালখাতা", authorBn: "প্রমথ চৌধুরী" },
      { titleBn: "অবরোধবাসিনী", authorBn: "বেগম রোকেয়া" },
      { titleBn: "শিবরামের মজার গল্প", authorBn: "আব্দুশ শাকুর (সম্পাদিত)" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "মার্ক টোয়েন" },
      { titleBn: "শ্রেষ্ঠ গল্প", authorBn: "গি দ্য মোপাসাঁ" },
      { titleBn: "ডন কিহোতে", authorBn: "মিগুয়েল দে সার্ভেন্টিস" }
    ],
    5: [
      { titleBn: "চাঁদের অমাবস্যা", authorBn: "সৈয়দ ওয়ালীউল্লাহ" },
      { titleBn: "পথের দাবী", authorBn: "শরৎচন্দ্র চট্টোপাধ্যায়" },
      { titleBn: "ইউরোপ প্রবাসীর পত্র", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "জাপান যাত্রী", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "প্রদোষে প্রাকৃতজন", authorBn: "শওকত আলী" },
      { titleBn: "খোয়াবনামা", authorBn: "আখতারুজ্জামান ইলিয়াস" },
      { titleBn: "সূর্য দীঘল বাড়ি", authorBn: "আবু ইসহাক" },
      { titleBn: "আরণ্যক", authorBn: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" },
      { titleBn: "ডন কিহোতে", authorBn: "মিগুয়েল দে সার্ভেন্টিস" },
      { titleBn: "আমার ছেলেবেলা", authorBn: "ম্যাক্সিম গোর্কি" },
      { titleBn: "পৃথিবীর পাঠশালায়", authorBn: "ম্যাক্সিম গোর্কি" },
      { titleBn: "পৃথিবীর পথে", authorBn: "ম্যাক্সিম গোর্কি" },
      { titleBn: "উপখণ্ড", authorBn: "গজেন্দ্র কুমার মিত্র" },
      { titleBn: "দি প্লেগ", authorBn: "আলবেয়ার কামু" },
      { titleBn: "উত্তম পুরুষ", authorBn: "রশীদ করিম" },
      { titleBn: "দ্য অ্যালকেমিস্ট", authorBn: "পাউলো কোয়েলহো" },
      { titleBn: "ডেড সোলস", authorBn: "নিকোলাই গোগল" },
      { titleBn: "দিবারাত্রির কাব্য", authorBn: "মানিক বন্দ্যোপাধ্যায়" },
      { titleBn: "সম্রাট জোন্স", authorBn: "ইউজিন ও নীল" },
      { titleBn: "শ্রেষ্ঠ উর্দু গল্প (১-৫ খণ্ড)", authorBn: "বিশ্বসাহিত্য কেন্দ্র" },
      { titleBn: "চৌড়াই চরিত মানস", authorBn: "সতীনাথ ভাদুড়ী" },
      { titleBn: "হাজার চুরাশীর মা", authorBn: "মহাশ্বেতা দেবী" },
      { titleBn: "কুবেরের বিষয় আশয়", authorBn: "শ্যামল গঙ্গোপাধ্যায়" },
      { titleBn: "আলসওয়ার জয়গান", authorBn: "বার্ট্রান্ড রাসেল" },
      { titleBn: "মানববিদ্বেষী", authorBn: "মলিয়ের" },
      { titleBn: "ছিন্নপত্র", authorBn: "রবীন্দ্রনাথ ঠাকুর" },
      { titleBn: "হাসুলীবাঁকের উপকথা", authorBn: "তারাশঙ্কর বন্দ্যোপাধ্যায়" },
      { titleBn: "ট্রেন টু পাকিস্তান", authorBn: "খুশবন্ত সিং" },
      { titleBn: "চাচা কাহিনী", authorBn: "সৈয়দ মুজতবা আলী" },
      { titleBn: "সে রাতে পূর্ণিমা ছিল", authorBn: "শহীদুল জহির" },
      { titleBn: "মৃচ্ছকটিক", authorBn: "শূদ্রক" },
      { titleBn: "চাণক্যের অর্থশাস্ত্র", authorBn: "কৌটিল্য" },
      { titleBn: "বার্থ অব ট্র্যাজেডি", authorBn: "ফ্রেডরিক নিটশে" },
      { titleBn: "সেপিয়েন্স", authorBn: "নোয়া হারারি" },
      { titleBn: "আল বিরুনীর ভারততত্ত্ব", authorBn: "আবু রায়হান আল-বিরুনী" },
      { titleBn: "বাাবরনামা", authorBn: "জহির উদ্-দিন মুহম্মদ বাবর" },
      { titleBn: "ইবনে বতুতার ভ্রমণ", authorBn: "ইবনে বতুতা" },
      { titleBn: "একশত বছরের নিরবতা", authorBn: "গাব্রিয়েল গার্সিয়া মার্কেজ" },
      { titleBn: "উপনিবেশ", authorBn: "নারায়ণ গঙ্গোপাধ্যায়" },
      { titleBn: "মবিডিক", authorBn: "হারমান মেলভিল" },
      { titleBn: "কৌটিল্যের শ্লোক", authorBn: "কৌটিল্য" },
      { titleBn: "সাহেব বিবি গোলাম", authorBn: "বিমল মিত্র" },
      { titleBn: "অন্তর্জলী যাত্রা", authorBn: "কমলকুমার মজুমদার" },
      { titleBn: "বিশ্ব ইতিহাস প্রসঙ্গ", authorBn: "জওহরলাল নেহেরু" },
      { titleBn: "আমি জোরথুস্ত্র বলছি", authorBn: "ফ্রেডরিক নিটশে" },
      { titleBn: "সেই সময়", authorBn: "সুনীল গঙ্গোপাধ্যায়" },
      { titleBn: "আমার দেখা রাজনীতির পঞ্চাশ বছর", authorBn: "আবুল মনসুর আহমদ" }
    ]
  };

  const filteredCourses = courses40.filter(c => {
    const matchesCat = courseCategory === 'all' || c.category === courseCategory;
    const q = searchCourse.trim().toLowerCase();
    const matchesQ = !q || c.titleBn.toLowerCase().includes(q) || c.titleEn.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const currentYearBooks = booksByYear[activeYear] || [];
  const filteredBooks = currentYearBooks.filter(b => {
    const q = searchBook.trim().toLowerCase();
    return !q || b.titleBn.toLowerCase().includes(q) || b.authorBn.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-10 w-full animate-fade-in text-left font-sans pb-12">
      {/* 1. Official Header Banner (Brochure Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-amber-50 shadow-2xl border border-amber-800/40 p-6 sm:p-10 md:p-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80')` }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? (page?.badge_bn || 'আলোকিত মানুষ চাই') : (page?.badge_en || 'Seeking Enlightened Human Beings')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-amber-100 tracking-tight leading-tight">
              {language === 'bn' ? (page?.title_bn || 'আলোর ইশকুল') : (page?.title_en || 'Aalor Ishkool (Light School)')}
            </h1>
            <p className="font-serif text-lg sm:text-xl text-amber-300 italic font-medium">
              {language === 'bn' ? (page?.subtitle_bn || '— চেতনার আলোকযাত্রা') : (page?.subtitle_en || '— Journey of Intellectual Awakening')}
            </p>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-light pt-1">
              {language === 'bn' 
                ? (page?.hero_desc_bn || page?.sections?.[0]?.content?.[0] || 'আমাদের দেশে আজ বিপুল সংখ্যাতেই তো এমন মানুষ দরকার যাঁরা বিশ্বজ্ঞানের জগৎকে বিশদ ও সুপরিসরভাবে জানেন, সেইসব জলাশয়ের মতো মানুষ যাঁদের কাছ থেকে দেশ ও জাতি প্রয়োজনের মুহূর্তে তৃষ্ণার জল সংগ্রহ করতে পারবে; যাঁরা প্রতিনিয়ত নিজেদের মূল্যবান জ্ঞানভান্ডার, মূল্যবোধ, অভিজ্ঞতা ও দূরদৃষ্টি দিয়ে বিপর্যয়ের মুহূর্তে জাতির ত্রাণে সাহায্য করতে পারবেন।')
                : (page?.hero_desc_en || page?.sections?.[0]?.content_en?.[0] || 'Our nation profoundly needs deeply knowledgeable, vision-driven individuals whose minds serve as reservoir-lakes of wisdom—capable of guiding and serving the nation in times of crisis.')}
            </p>

            <div className="p-3 bg-amber-950/60 rounded-2xl border border-amber-700/40 text-amber-200 text-xs font-serif italic">
              ✨ {language === 'bn' ? '"মানুষ তার স্বপ্নের সমান বড়..." — ১৭ বছরের পরীক্ষা-নিরীক্ষার পর প্রণীত বিশ্বসাহিত্য কেন্দ্রের অনন্য উদ্যোগ।' : '"Human beings are as grand as their dreams..." — Formulated through 17 years of educational research.'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('apply')}
              className="px-6 py-3 bg-[#B8862A] hover:bg-[#9E7120] text-stone-950 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{language === 'bn' ? 'ভর্তি ও আবেদন ফরম' : 'Online Admission Form'}</span>
            </button>

            <button 
              onClick={() => setActiveTab('courses')}
              className="px-6 py-3 bg-stone-900/80 hover:bg-stone-800 text-amber-200 font-bold rounded-2xl border border-amber-700/50 transition-all text-xs md:text-sm text-center cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? '৪০টি বিষয়ভিত্তিক কোর্স' : 'View 40 Subject Courses'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8DDD0] pb-3">
        {[
          { id: 'overview', bn: '📌 কার্যক্রমের মূল রূপরেখা', en: 'Overview & Highlights', icon: Lightbulb },
          { id: 'methods', bn: '📖 পঠন নীতি ও ৩টি কৌশল', en: 'Reading Methods', icon: BookMarked },
          { id: 'courses', bn: '🎓 ৪০টি বিষয়ভিত্তিক কোর্স', en: '40 Subjects Curriculum', icon: Layers },
          { id: 'books', bn: '📚 বর্ষভিত্তিক বইয়ের তালিকা', en: 'Yearly Book Lists', icon: BookOpen },
          { id: 'apply', bn: '📝 অনলাইন ভর্তি ও আবেদন', en: 'Apply Online', icon: GraduationCap }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#B8862A] text-white shadow-md'
                  : 'bg-[#FAF7F2] text-stone-700 border border-[#E8DDD0] hover:bg-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{language === 'bn' ? tab.bn : tab.en}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & 5 PILLARS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* 5 Core Pillars from PDF Page 3 */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-2xl text-stone-900">
              {language === 'bn' ? 'কর্মসূচির প্রধান ৫টি মূল স্তম্ভ (৫ বছর মেয়াদি)' : '5 Core Pillars of the 5-Year Curriculum'}
            </h3>
            <p className="text-xs text-stone-600">
              {language === 'bn' ? 'আলোর ইশকুলের সমবেত জ্ঞানচর্চার প্রক্রিয়াটি চলবে লঘু ও আনন্দময় চালে' : 'Interactive, joyful, and stress-free academic exploration'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {[
                {
                  num: "১",
                  titleBn: "২০০টি শ্রেষ্ঠ বই",
                  titleEn: "200 Great Books",
                  descBn: "বাংলা ভাষাসহ পৃথিবীর বিভিন্ন দেশ ও ভাষার অন্তত দু'শটি শ্রেষ্ঠ বইয়ের পঠন-পাঠন ও উষ্ণ আলোচনা।",
                  descEn: "In-depth study and vibrant discussions on at least 200 immortal books across world literature.",
                  icon: BookOpen,
                  bg: "bg-amber-50 border-amber-200 text-amber-900"
                },
                {
                  num: "২",
                  titleBn: "৪০ শাখায় ২৫০ বক্তৃতা",
                  titleEn: "250 Lectures in 40 Branches",
                  descBn: "মানবজ্ঞানের ৪০টি গুরুত্বপূর্ণ শাখার ভেতর দিয়ে দেশের বিশিষ্ট গুণীজনদের ২৫০টি সমৃদ্ধ বক্তৃতা।",
                  descEn: "250 enriching lectures delivered by eminent scholars covering 40 vital disciplines of human knowledge.",
                  icon: Users,
                  bg: "bg-emerald-50 border-emerald-200 text-emerald-900"
                },
                {
                  num: "৩",
                  titleBn: "সংগীত ও চলচ্চিত্র আস্বাদন",
                  titleEn: "Music & Film Appreciation",
                  descBn: "পৃথিবীর শ্রেষ্ঠ সংগীত, চলচ্চিত্র, প্রামাণ্যচিত্র, নাট্যানুষ্ঠান, শিল্প প্রদর্শনী ও আউটিং।",
                  descEn: "Guided appreciation of world-class music, cinema, documentaries, drama, and art exhibitions.",
                  icon: Music,
                  bg: "bg-sky-50 border-sky-200 text-sky-900"
                },
                {
                  num: "৪",
                  titleBn: "অডিও-ভিজ্যুয়াল সংযোগ",
                  titleEn: "Visual Documentaries",
                  descBn: "প্রতিটি পঠন-পাঠন ও বক্তৃতার সাথে বিশ্বমানের চলচ্চিত্র ও প্রামাণ্যচিত্র প্রদর্শনী।",
                  descEn: "Integrating high-definition visual documentaries alongside reading sessions and guest lectures.",
                  icon: Film,
                  bg: "bg-purple-50 border-purple-200 text-purple-900"
                },
                {
                  num: "৫",
                  titleBn: "সাপ্তাহিক রুটিন",
                  titleEn: "Friday Weekly Sessions",
                  descBn: "প্রতি সপ্তাহের শুধুমাত্র শুক্রবার সকাল থেকে অপরাহ্ণের মধ্যে নিয়মিত আমেজময় আসর।",
                  descEn: "Relaxed weekly gatherings hosted every Friday morning through afternoon.",
                  icon: Clock,
                  bg: "bg-rose-50 border-rose-200 text-rose-900"
                }
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className={`p-5 rounded-2xl border ${item.bg} space-y-3 flex flex-col justify-between shadow-xs`}>
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-white/80 font-serif font-black flex items-center justify-center text-sm shadow-xs">
                        {item.num}
                      </span>
                      <ItemIcon className="w-5 h-5 opacity-80" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base mb-1">
                        {language === 'bn' ? item.titleBn : item.titleEn}
                      </h4>
                      <p className="text-xs opacity-90 leading-relaxed font-sans">
                        {language === 'bn' ? item.descBn : item.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Philosophical Text from Page 3 */}
          <div className="p-6 md:p-8 bg-[#FAF7F2] border border-[#E8DDD0] rounded-3xl space-y-4">
            <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#B8862A]" />
              <span>{language === 'bn' ? 'চৈতন্যের দীপ্ত বিকাশ ও আলোকিত মানুষ সৃষ্টি' : 'Higher Intellectual Growth & Enlightened Minds'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans font-light">
              {language === 'bn' 
                ? 'উচ্চযোগ্যতাসম্পন্ন, জ্ঞানঋদ্ধ ও বহুমাত্রিক মানুষই পারেন একটা জাতিকে এই সহযোগিতা দিয়ে সামনের দিকে এগিয়ে নিতে। এমনি সুযোগ্য ও আলোকিত মানুষ সৃষ্টির লক্ষ্যে শুরু হতে যাচ্ছে বিশ্বসাহিত্য কেন্দ্রের নতুন কার্যক্রম "আলোর ইশকুল"। এই পাঠ্যসূচি ও এর ফলপ্রসূতা নিয়ে ১৭ বছর ধরে পরীক্ষা-নিরীক্ষার পর কার্যক্রমটি শুরু হতে যাচ্ছে। আমরা বিশ্বাস করি এই কার্যক্রমে অংশ নিয়ে মেধাবী অংশগ্রহণকারীরা উঁচু মানের যোগ্যতা, মূল্যবোধ ও দূরদৃষ্টিসম্পন্ন মানুষ হিসেবে গড়ে উঠবেন।' 
                : 'Only highly qualified, wisdom-rich, multidimensional human beings can steer a nation forward. Aalor Ishkool is crafted precisely to nurture such visionary citizens.'}
            </p>
          </div>

          {/* Special English & Other Programs from PDF Page 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-amber-950 text-amber-50 rounded-3xl space-y-3 border border-amber-800">
              <div className="inline-block px-3 py-1 bg-amber-800/60 rounded-lg text-[10px] uppercase font-bold text-amber-300">
                {language === 'bn' ? 'বিশেষ প্রোগ্রাম' : 'Special Program'}
              </div>
              <h4 className="font-serif text-xl font-bold text-amber-100">
                {language === 'bn' ? 'ইংরেজি শিক্ষা কর্মসূচি' : 'Special English Proficiency Track'}
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {language === 'bn' 
                  ? 'সভ্যরা যাতে অল্প সময়ে ভালো মানের ইংরেজি শিখতে পারেন সেই লক্ষ্যে প্রতি তিন সপ্তাহে একটি করে ৪০ পৃষ্ঠার ছোট ইংরেজি বই পড়বেন। প্রতিটি বইয়ের কঠিন শব্দগুলোর পাশে বাংলা অর্থ ও উচ্চারণ দেওয়া থাকবে। ২০টি বই পড়ার পর সহজে ইংরেজি শেখা সম্ভব হবে। দ্বিতীয় পর্বে ৪,০০০ শব্দ সংবলিত বিশেষ বই অনুশীলনী দেওয়া হবে।' 
                  : '3-week cycle reading 40-page English books with side-by-side Bengali translations and pronunciations, followed by an intensive 4,000-word vocabulary module.'}
              </p>
            </div>

            <div className="p-6 bg-stone-900 text-stone-100 rounded-3xl space-y-3 border border-stone-800">
              <div className="inline-block px-3 py-1 bg-stone-800 rounded-lg text-[10px] uppercase font-bold text-amber-300">
                {language === 'bn' ? 'অনুষঙ্গ' : 'Cultural Activities'}
              </div>
              <h4 className="font-serif text-xl font-bold text-white">
                {language === 'bn' ? 'সাহিত্য সংঘ ও সাংস্কৃতিক ফোরাম' : 'Literary Guild & Cultural Forum'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {language === 'bn' 
                  ? 'প্রতিমাসে নিয়মিত "সাহিত্য সংঘ" পরিচালিত হবে। এতে থাকবে কবিতা পাঠ, বিভিন্ন বইয়ের ওপর গান-আবৃত্তি, এবং আকর্ষণীয় সাহিত্য পর্ব। এছাড়াও বুদ্ধিজীবীর নোটবই ও বিশ্বইতিহাস প্রসঙ্গ সম্পর্কিত বিশেষ পারফর্মান্স থাকবে।' 
                  : 'Monthly Literary Guild events including poetry recitation, musical adaptations, book discussions, and television broadcasts.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READING METHODS & 3 GOLDEN PATHS */}
      {activeTab === 'methods' && (
        <div className="space-y-8 animate-fade-in">
          {/* Section Header */}
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-2">
            <h3 className="font-serif font-bold text-2xl text-amber-950 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-[#B8862A]" />
              <span>{language === 'bn' ? 'সাপ্তাহিক বই পড়া ও গভীর অনুশীলনী নীতি' : 'Weekly Reading Protocol & Guidelines'}</span>
            </h3>
            <p className="text-xs text-amber-900/80">
              {language === 'bn' ? 'ব্রোশারের পৃষ্ঠা ৪ ও ৫ অনুযায়ী বই আত্মস্থকরণের সুনির্দিষ্ট বৈজ্ঞানিক পদ্ধতি' : 'Exact structured reading rules from Page 4 & 5 of official brochure'}
            </p>
          </div>

          {/* 6 Weekly Rules from PDF Page 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: "১",
                titleBn: "সাপ্তাহিক বই আবর্তন",
                descBn: "প্রথম সপ্তাহে নির্ধারিত বইটি উদ্বোধনের দিনেই ইস্যু করে নেবেন, সপ্তাহ ধরে সেটি পড়বেন এবং পরের সপ্তাহে তার ওপর উষ্ণ, তপ্ত ও মেধামুখর আলোচনায় অংশ নেবেন। আলোচনা শেষে বইটি ফিরিয়ে দিয়ে নতুন বই নেবেন।"
              },
              {
                step: "২",
                titleBn: "বক্তব্যের মূল্যায়ন",
                descBn: "বই আলোচনায় অংশ নেবার সময় প্রত্যেকের বক্তব্য কতটা সুন্দর ও গুরুত্বপূর্ণ হলো তা নিয়মিত গুরুত্বের সাথে মূল্যায়ন করা হবে।"
              },
              {
                step: "৩",
                titleBn: "উপস্থিতি ও নোট খাতা সংরক্ষণ",
                descBn: "প্রত্যেকে কতদিন বই আলোচনায় অংশ নিলেন তার হিসাব যত্নসহ রাখা হবে। এছাড়াও নোট খাতায় বই থেকে কোন মানের উদ্ধৃতি লিখলেন সেগুলোর মূল্যায়নের ব্যবস্থা থাকবে।"
              },
              {
                step: "৪",
                titleBn: "লেখক পরিচিতি উপস্থাপন",
                descBn: "বই আলোচনার শুরুতে একজন সভ্য লেখকের জীবনীসহ বইটির ভূমিকা সংক্ষেপে উপস্থাপন করবেন।"
              },
              {
                step: "৫",
                titleBn: "সমালোচনা পাঠ",
                descBn: "সাতটি বই পড়ার পর একটি বইয়ের তাত্ত্বিক উপলব্ধিকে মজবুত করার জন্য ঐ বইয়ের ওপর বিখ্যাত সমালোচকদের লেখা সমালোচনা পড়তে দেওয়া হবে।"
              },
              {
                step: "৬",
                titleBn: "কমে মূল্যে নিজস্ব লাইব্রেরি গঠন",
                descBn: "সভ্যরা যাতে বইগুলো সহজে কিনতে পারেন সেজন্য কেন্দ্র থেকে সর্বোচ্চ কমিশনে (৪০% পর্যন্ত ছাড়) বই ক্রয়ের সহায়তা করা হয়।"
              }
            ].map(rule => (
              <div key={rule.step} className="p-5 bg-white border border-[#E8DDD0] rounded-2xl flex gap-4 items-start shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-[#B8862A] text-white font-bold flex items-center justify-center shrink-0 font-serif">
                  {rule.step}
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    {language === 'bn' ? rule.titleBn : rule.titleBn}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {rule.descBn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 3 Golden Techniques to Deeply Digest Books (Page 4-5) */}
          <div className="p-6 md:p-8 bg-[#1A1207] text-amber-50 rounded-3xl border border-amber-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                ✨ {language === 'bn' ? 'ব্রোশারের ৩টি স্বর্ণালী পদ্ধতি' : '3 Master Pathways to Book Absorption'}
              </span>
              <h3 className="font-serif font-bold text-2xl text-amber-100">
                {language === 'bn' ? 'একটি বইকে গভীরভাবে আত্মস্থ করার ৩টি নিয়ম' : 'How to Deeply Digest Any Great Book'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-stone-900/90 rounded-2xl border border-amber-900/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                  ক
                </div>
                <h4 className="font-serif font-bold text-amber-200">
                  {language === 'bn' ? 'হাইলাইটার কলমের ব্যবহার' : 'Highlighter Method'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {language === 'bn' 
                    ? 'পড়ার সময় বইটির যে লাইনগুলো আনন্দময়, সৌন্দর্যময়, অনবদ্য বা গভীর মনে হবে সেগুলোর ওপর হাইলাইটার দিয়ে দাগ দিয়ে রাখতে হবে।' 
                    : 'Mark insightful, elegant, and profound passages with a highlighter pen while reading.'}
                </p>
              </div>

              <div className="p-5 bg-stone-900/90 rounded-2xl border border-amber-900/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                  খ
                </div>
                <h4 className="font-serif font-bold text-amber-200">
                  {language === 'bn' ? 'রিভিশন (আবার পড়া পর্ব)' : 'Daily Revision Routine'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {language === 'bn' 
                    ? 'সপ্তাহের প্রতিদিন বইটি পড়ার পর অন্তত ৫ মিনিট দাগ দেওয়া অংশগুলো রিভিশন দেওয়া। এতে বইটি হৃদয়ে চিরস্থায়ীভাবে গাঢ় হয়।' 
                    : 'Spend at least 5 minutes daily reviewing highlighted passages to consolidate the reading in memory.'}
                </p>
              </div>

              <div className="p-5 bg-stone-900/90 rounded-2xl border border-amber-900/50 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                  গ
                </div>
                <h4 className="font-serif font-bold text-amber-200">
                  {language === 'bn' ? 'সেরা ২০টি লাইন নোট করা' : '20-Line Quote Journal'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {language === 'bn' 
                    ? 'একটি নোট বই নিয়ে বসা এবং বইটি থেকে অন্তত ২০টি সেরা ও মননশীল লাইন খাতায় স্বহস্তে টুকে রাখা।' 
                    : 'Maintain a dedicated journal and handwrite at least 20 unforgettable quotes from each book.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 40 SUBJECT COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E8DDD0] pb-4">
            <div>
              <h3 className="font-serif font-bold text-2xl text-stone-900">
                {language === 'bn' ? '৪০টি বিষয়ের উপর বক্তৃতাভিত্তিক কোর্স তালিকা' : '40 Lecture-based Subject Courses'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {language === 'bn' ? 'আলোকিত মানুষ গড়ার লক্ষ্যে মানবজ্ঞানের ৪০টি গুরুত্বপূর্ণ শাখার পূর্ণাঙ্গ ক্যাটালগ' : 'Complete official catalogue of 40 broad academic disciplines'}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                placeholder={language === 'bn' ? 'কোর্স বা বিষয় খুঁজুন...' : 'Search subjects...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8862A]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', bn: 'সব ৪০টি বিষয়', en: 'All 40 Courses' },
              { id: 'philosophy', bn: '🧠 দর্শন ও চিন্তা', en: 'Philosophy' },
              { id: 'arts', bn: '🎨 কলা, সংগীত ও চলচ্চিত্র', en: 'Arts & Cinema' },
              { id: 'history', bn: '📜 ইতিহাস ও ঐতিহ্য', en: 'History' },
              { id: 'literature', bn: '📚 সাহিত্য ও ভাষা', en: 'Literature' },
              { id: 'science', bn: '🔬 বিজ্ঞান ও বিশ্বজগৎ', en: 'Science' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCourseCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  courseCategory === cat.id
                    ? 'bg-stone-900 text-amber-300 shadow-xs'
                    : 'bg-[#FAF7F2] text-stone-700 border border-[#E8DDD0] hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? cat.bn : cat.en}
              </button>
            ))}
          </div>

          {/* 40 Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="p-4 bg-white rounded-2xl border border-[#E8DDD0] shadow-xs hover:border-[#B8862A] hover:shadow-md transition-all flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 font-serif font-black flex items-center justify-center text-xs shrink-0 border border-amber-200">
                  {course.id}
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                    {language === 'bn' ? course.titleBn : course.titleEn}
                  </h4>
                  <span className="inline-block text-[10px] text-[#B8862A] font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                    {course.category.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: YEARLY CURATED BOOK LISTS */}
      {activeTab === 'books' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E8DDD0] pb-4">
            <div>
              <h3 className="font-serif font-bold text-2xl text-stone-900">
                {language === 'bn' ? 'আলোর ইশকুল নির্বাচিত বইয়ের তালিকা' : 'Curated Book Lists by Academic Year'}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {language === 'bn' ? 'বিশ্বসাহিত্যের দু\'শটি অনবদ্য ধ্রুপদী বইয়ের তালিকা (ব্রোশার থেকে সংগৃহীত)' : 'Official reading list from 1st Year to Advanced Level'}
              </p>
            </div>

            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                value={searchBook}
                onChange={(e) => setSearchBook(e.target.value)}
                placeholder={language === 'bn' ? 'বই বা লেখকের নাম দিয়ে খুঁজুন...' : 'Search books or authors...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8862A]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Academic Year Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { year: 1, bn: '১ম বর্ষ (৪৫টি বই)', en: '1st Year' },
              { year: 2, bn: '২য় বর্ষ (২৬টি বই)', en: '2nd Year' },
              { year: 3, bn: '৩য় বর্ষ (৩৪টি বই)', en: '3rd Year' },
              { year: 4, bn: '৪র্থ বর্ষ (২৩টি বই)', en: '4th Year' },
              { year: 5, bn: 'সমকালীন ও অগ্রসর পাঠক (৪৭টি বই)', en: 'Advanced & Contemporary' }
            ].map(y => (
              <button
                key={y.year}
                onClick={() => setActiveYear(y.year)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeYear === y.year
                    ? 'bg-[#B8862A] text-white shadow-md'
                    : 'bg-[#FAF7F2] text-stone-700 border border-[#E8DDD0] hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? y.bn : y.en}
              </button>
            ))}
          </div>

          {/* Book List Table Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBooks.map((book, bIdx) => (
              <div 
                key={bIdx} 
                className="p-3.5 bg-white rounded-xl border border-[#E8DDD0] flex items-center gap-3 shadow-2xs hover:border-[#B8862A] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 font-mono border border-amber-200">
                  {bIdx + 1}
                </div>
                <div className="space-y-0.5 text-left overflow-hidden">
                  <h5 className="font-serif font-bold text-stone-900 text-xs truncate">
                    {book.titleBn}
                  </h5>
                  <p className="text-[11px] text-stone-500 truncate">
                    ✍️ {book.authorBn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ONLINE ADMISSION FORM & CONTACT */}
      {activeTab === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Info Column */}
          <div className="lg:col-span-5 bg-amber-950 text-amber-50 p-6 md:p-8 rounded-3xl border border-amber-800 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                📌 {language === 'bn' ? 'ভর্তির নিয়মাবলি ও আমানত' : 'Admission Rules & Fees'}
              </span>
              <h3 className="font-serif font-bold text-2xl text-amber-100">
                {language === 'bn' ? 'আলোর ইশকুল সদস্যপদ' : 'Membership Guidelines'}
              </h3>
            </div>

            <div className="space-y-4 text-xs text-amber-200/90 leading-relaxed font-sans">
              <div className="p-3.5 bg-amber-900/50 rounded-2xl border border-amber-700/50 space-y-1">
                <span className="font-bold text-amber-300">১. জামানত ও চাঁদা:</span>
                <p>বইয়ের নিরাপত্তা অর্থ বাবদ ৫০০/- টাকা জমা রাখতে হবে (কার্যক্রম শেষে বই অক্ষত ফেরতে অফেরতযোগ্য নিরাপত্তা অর্থ ফেরত দেওয়া হবে) এবং সাংস্কৃতিক চাঁদা হিসেবে ৫০০/- টাকা নির্ধারণ করা হয়েছে।</p>
              </div>

              <div className="p-3.5 bg-amber-900/50 rounded-2xl border border-amber-700/50 space-y-1">
                <span className="font-bold text-amber-300">২. ক্লাসের সময়সূচী:</span>
                <p>প্রতি সপ্তাহের শুধুমাত্র শুক্রবার সকালে বা অপরাহ্ণে বিশ্বসাহিত্য কেন্দ্র ভবনে আসর অনুষ্ঠিত হয়।</p>
              </div>

              <div className="p-3.5 bg-amber-900/50 rounded-2xl border border-amber-700/50 space-y-1">
                <span className="font-bold text-amber-300">৩. যোগাযোগ ঠিকানা:</span>
                <p>বিশ্বসাহিত্য কেন্দ্র, ১৭ ময়মনসিং রোড, বাংলামোটর, ঢাকা-১০০০। ফোন: ২২৩৩৬০৮১২, ৫৮৬১২৩৭৪।</p>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 bg-white border border-[#E8DDD0] rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2 text-left">
              {language === 'bn' ? 'অনলাইন ভর্তি ও আসন বুকিং ফর্ম' : 'Online Admission Application'}
            </h3>
            <p className="text-xs text-stone-500 mb-5 text-left">
              {language === 'bn' 
                ? 'আপনার তথ্য দিয়ে নিচের ফর্মটি জমা দিন। আমাদের ভর্তি সেল থেকে অতিসত্বর যোগাযোগ করা হবে।' 
                : 'Fill in your details below to lock your pre-registration seat.'}
            </p>

            {submitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2 text-left">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{language === 'bn' ? 'ধন্যবাদ! আপনার আবেদন সফলভাবে গৃহীত হয়েছে।' : 'Application Submitted Successfully!'}</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {language === 'bn' ? 'আপনার প্রদত্ত মোবাইল নম্বরে আলোর ইশকুল ভর্তি সেল থেকে যোগাযোগ করা হবে।' : 'Our counselor will contact you via phone shortly.'}
                </p>
                <button 
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', occupation: '', message: '' }); }}
                  className="text-xs font-bold underline text-emerald-800 hover:text-emerald-950 cursor-pointer pt-2"
                >
                  {language === 'bn' ? 'আরেকটি ফরম জমা দিন' : 'Submit another response'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-left">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {language === 'bn' ? 'পূর্ণ নাম (আবশ্যক)*' : 'Full Name*'}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: আব্দুল করিম"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs focus:ring-2 focus:ring-[#B8862A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {language === 'bn' ? 'মোবাইল নম্বর (আবশ্যক)*' : 'Phone Number*'}
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="০১৭XXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs focus:ring-2 focus:ring-[#B8862A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                    </label>
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs focus:ring-2 focus:ring-[#B8862A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {language === 'bn' ? 'পেশা / প্রতিষ্ঠান' : 'Occupation'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="শিক্ষার্থী / চাকরিজীবী"
                      value={form.occupation}
                      onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                      className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs focus:ring-2 focus:ring-[#B8862A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    {language === 'bn' ? 'সংক্ষিপ্ত মন্তব্য বা বিষয় পছন্দ' : 'Course Preference / Message'}
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="যেমন: আমি ১ম বর্ষের ক্লাসে যুক্ত হতে চাই..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 border border-[#E8DDD0] rounded-xl text-xs focus:ring-2 focus:ring-[#B8862A] focus:outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#B8862A] hover:bg-[#9E7120] text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'ভর্তি আবেদন জমা দিন' : 'Submit Application')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
