export interface PressItem {
  id: string;
  title_bn: string;
  title_en: string;
  summary: string;
  content: string;
  category: string;
  publishedDate: string;
  author: string;
  status: string;
  coverImage?: string;
  pdf?: string;
  mediaSource?: string;
  newsUrl?: string;
}

export interface PhotoAlbum {
  id: string;
  name_bn: string;
  name_en: string;
  cover: string;
  photos: string[];
}

export const fallbackPress: PressItem[] = [
  {
    id: "press-1",
    title_bn: "দেশব্যাপী বইপড়া কর্মসূচির নতুন আবর্তন উদ্বোধন করলেন অধ্যাপক সায়ীদ",
    title_en: "Professor Sayeed Inaugurates New Cycle of Nationwide Book Reading Program",
    summary: "সারাদেশে ৬৪টি জেলায় বিশ্বসাহিত্য কেন্দ্রের বইপড়া কর্মসূচির নতুন আবর্তনের শুভ সূচনা করা হয়েছে। এ বছর প্রায় ৪০ লক্ষ শিক্ষার্থী এই মহৎ কর্মসূচির অংশ হবে।",
    content: "বিশ্বসাহিত্য কেন্দ্রের প্রতিষ্ঠাতা সভাপতি অধ্যাপক আবদুল্লাহ আবু সায়ীদ আজ কেন্দ্র মিলনায়তনে আয়োজিত এক বর্ণাঢ্য সংবাদ সম্মেলনে দেশব্যাপী বইপড়া কর্মসূচির নতুন আবর্তনের শুভ উদ্বোধন ঘোষণা করেন। এবারের আবর্তনে দেশের ৬৪টি জেলার ৪ হাজার শিক্ষাপ্রতিষ্ঠানের প্রায় ৪০ লক্ষ শিক্ষার্থী যুক্ত হচ্ছে। অধ্যাপক সায়ীদ বলেন, 'জ্ঞানের আলো ছড়িয়ে দেয়ার মাধ্যমেই আমাদের ভবিষ্যৎ প্রজন্ম আলোকিত মানুষে পরিণত হবে।' এই কর্মসূচির মাধ্যমে কেন্দ্র থেকে শিক্ষার্থীদের মাঝে বিনামূল্যে বই বিতরণ করা হচ্ছে।",
    category: "Press Release",
    publishedDate: "2026-06-28",
    author: "মিডিয়া সেল, বিএসকে",
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: "press-2",
    title_bn: "প্রথম আলো বিশেষ প্রতিবেদন: ভ্রাম্যমাণ লাইব্রেরির ২৫ বছর পূর্তি ও নতুন দিগন্ত",
    title_en: "Prothom Alo Special Feature: 25 Years of Mobile Libraries and Future Horizons",
    summary: "বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরি কার্যক্রমের গৌরবময় ২৫ বছর পূর্তি উপলক্ষে প্রথম আলো পত্রিকায় প্রকাশিত বিশেষ সচিত্র কভারেজ ও সম্পাদকীয় প্রতিবেদন।",
    content: "বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরি কার্যক্রম ২৫ বছর পূর্ণ করল। প্রথম আলোর বিশেষ প্রতিবেদনে তুলে ধরা হয়েছে কীভাবে এই লাইব্রেরি দেশের প্রত্যন্ত অঞ্চলের মানুষের দ্বারে দ্বারে জ্ঞানের আলো পৌঁছে দিয়েছে। বর্তমানে কেন্দ্রের প্রায় ১০০টি ভ্রাম্যমাণ বাস সক্রিয়ভাবে ৩ লক্ষাধিক পাঠককে নিয়মিত সেবা প্রদান করছে।",
    category: "News",
    publishedDate: "2026-06-24",
    author: "প্রথম আলো প্রতিবেদক",
    status: "published",
    mediaSource: "Prothom Alo",
    newsUrl: "https://www.prothomalo.com",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "press-3",
    title_bn: "The Daily Star: BSK brings book-reading revolution in rural schools",
    title_en: "The Daily Star: BSK Brings Book-Reading Revolution in Rural Schools",
    summary: "A feature in The Daily Star documenting BSK's immense social impact in cultivating healthy reading habits among underprivileged rural youth.",
    content: "An extensive analytical piece published in The Daily Star illustrates the profound and far-reaching impacts of Bishwo Shahitto Kendro's reading initiatives in promoting critical thinking and intellectual growth among underprivileged rural students in primary and secondary schools across Bangladesh.",
    category: "News",
    publishedDate: "2026-06-19",
    author: "The Daily Star Correspondent",
    status: "published",
    mediaSource: "The Daily Star",
    newsUrl: "https://www.thedailystar.net",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "press-4",
    title_bn: "দেশব্যাপী ৩১ লক্ষ বই বিতরণ উৎসব সফলভাবে সম্পন্ন",
    title_en: "BSK Completes Distribution of 3.1 Million Selective Books",
    summary: "সারাদেশের ৬৪ জেলায় নির্বাচিত সেরা কিশোর ক্লাসিক ও বিশ্ব সাহিত্যের বই কিশোর-কিশোরীদের মাঝে সাফল্যের সাথে বিতরণ সম্পন্ন হয়েছে।",
    content: "বিশ্বসাহিত্য কেন্দ্রের অন্যতম বড় সাফল্য হলো দেশের প্রত্যন্ত অঞ্চলের কিশোর-কিশোরীদের হাতে বিশ্বমানের সাহিত্যের বই পৌঁছে দেয়া। এবারের বার্ষিক কার্যক্রমে ৩১ লক্ষাধিক বই সফলভাবে বিতরণ করা হয়েছে।",
    category: "Events",
    publishedDate: "2026-06-15",
    author: "প্রচার বিভাগ, বিএসকে",
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "press-5",
    title_bn: "বিএসকে বার্ষিক পাঠক পুরস্কার উৎসব ও সেরা পাঠক সম্মাননা",
    title_en: "BSK Hosts Annual Reader Award Ceremony for 10,000 Brilliant Minds",
    summary: "ঢাকা মহানগরের সেরা ১০,০০০ পাঠক শিক্ষার্থীকে মেধা বৃত্তি ও বিশ্বসাহিত্য কেন্দ্রের আজীবন পাঠক সম্মাননা প্রদান অনুষ্ঠান সম্পন্ন হয়েছে।",
    content: "বিশ্বসাহিত্য কেন্দ্রের উদ্যোগে আয়োজিত পাঠক মূল্যায়ন পরীক্ষার ফলশ্রুতিতে ঢাকা অঞ্চলের শ্রেষ্ঠ পাঠকদের পুরস্বৃত করা হয়েছে। প্রধান অতিথি হিসেবে উপস্থিত থেকে পুরস্কার তুলে দেন বরেণ্য লেখক ও কবিগণ।",
    category: "Awards",
    publishedDate: "2026-06-08",
    author: "পুরস্কার সেল, বিএসকে",
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600"
  }
];

export const photoAlbums: PhotoAlbum[] = [
  {
    id: "distribution",
    name_bn: "বই বিতরণ",
    name_en: "Book Distribution",
    cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600",
    photos: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "awards",
    name_bn: "পুরস্কার অনুষ্ঠান",
    name_en: "Award Ceremony",
    cover: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600",
    photos: [
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "seminar",
    name_bn: "সেমিনার",
    name_en: "Seminars",
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
    photos: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "circle",
    name_bn: "পাঠচক্র",
    name_en: "Study Circles",
    cover: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
    photos: [
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: "press_conf",
    name_bn: "প্রেস কনফারেন্স",
    name_en: "Press Conferences",
    cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    photos: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800"
    ]
  }
];
