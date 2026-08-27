import { BookOpen, Library } from 'lucide-react';

export interface NewsItem {
  id: string;
  icon: string;
  tag_bn: string;
  tag_en: string;
  date_bn: string;
  date_en: string;
  title_bn: string;
  title_en: string;
}

export interface EventItem {
  id: string;
  day: string;
  dayEn: string;
  month: string;
  monthEn: string;
  chip_bn: string;
  chip_en: string;
  title_bn: string;
  title_en: string;
  time_bn: string;
  time_en: string;
  loc_bn: string;
  loc_en: string;
}

export interface NoticeItem {
  id: string;
  title_bn: string;
  title_en: string;
  isUrgent: boolean;
  isNew: boolean;
  date_bn: string;
  date_en: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "news-1",
    icon: "\uD83D\uDCE2",
    tag_bn: "সংবাদ",
    tag_en: "News",
    date_bn: "৪ অক্টোবর ২০২৪",
    date_en: "Oct 4, 2024",
    title_bn: "আসন্ন শুক্রবার আলোর ইশকুলের সেমিনার ও ধ্রুপদী বক্তৃতামালা",
    title_en: "Aalor Ishkool: Sub-Continental Music Appreciation Lecture This Friday"
  },
  {
    id: "news-2",
    icon: "\uD83C\uDFC6",
    tag_bn: "পুরস্কার",
    tag_en: "Award",
    date_bn: "৩ ডিসেম্বর ২০২৩",
    date_en: "Dec 3, 2023",
    title_bn: "দেশব্যাপী ৩১ লক্ষ বই বিতরণ উৎসব সফলভাবে সম্পন্ন",
    title_en: "3.1 Million Selective Books Successfully Distributed Across 64 Districts"
  },
  {
    id: "news-3",
    icon: "\uD83D\uDCDA",
    tag_bn: "কার্যক্রম",
    tag_en: "Activity",
    date_bn: "১৮ নভেম্বর ২০২৩",
    date_en: "Nov 18, 2023",
    title_bn: "সারাদেশে নতুন আবর্তনে বইপড়া কর্মসূচির ওরিয়েন্টেশন",
    title_en: "Orientation of Countrywide Reading Habits Program Launched"
  }
];

export const events: EventItem[] = [
  {
    id: "event-1",
    day: "০৪",
    dayEn: "04",
    month: "অক্টোবর",
    monthEn: "OCT",
    chip_bn: "সঙ্গীত",
    chip_en: "Music",
    title_bn: "উপদেশীয় ধ্রুপদী সঙ্গীত বক্তৃতামালা - ২",
    title_en: "Classical Music Appreciation Lecture Series - Session 2",
    time_bn: "সন্ধ্যা ৬:০০ টা",
    time_en: "6:00 PM",
    loc_bn: "কেন্দ্রীয় মিলনায়তন, ঢাকা",
    loc_en: "Central Auditorium, Dhaka"
  },
  {
    id: "event-2",
    day: "২৫",
    dayEn: "25",
    month: "ডিসেম্বর",
    monthEn: "DEC",
    chip_bn: "আলোচনা",
    chip_en: "Discussion",
    title_bn: "আলোর ইশকুল: পশ্চিমের রবি বিশেষ সন্ধ্যা",
    title_en: "Aalor Ishkool: Rabindranath Tagore Evening Session",
    time_bn: "সন্ধ্যা ৫:৩০ মিনিট",
    time_en: "5:30 PM",
    loc_bn: "মিলনায়তন, বাংলামোটর",
    loc_en: "Auditorium, Banglamotor"
  },
  {
    id: "event-3",
    day: "১৭",
    dayEn: "17",
    month: "নভেম্বর",
    monthEn: "NOV",
    chip_bn: "উদ্বোধন",
    chip_en: "Inaugural",
    title_bn: "সৃজনশীল বিদ্যাপীঠ আলোর ইশকুলের শুভ উদ্বোধন",
    title_en: "Aalor Ishkool: Grand Cohort Inaugural Ceremony",
    time_bn: "সকাল ৯:৩০ মিনিট",
    time_en: "9:30 AM",
    loc_bn: "সেমিনার কক্ষ, ২য় তলা",
    loc_en: "Seminar Room, 2nd Floor"
  },
  {
    id: "event-4",
    day: "০৪",
    dayEn: "04",
    month: "নভেম্বর",
    monthEn: "NOV",
    chip_bn: "কর্মশালা",
    chip_en: "Workshop",
    title_bn: "পাঠক মূল্যায়ন কার্যক্রম ও পরীক্ষক ওরিয়েন্টেশন",
    title_en: "Evaluators & Coordinators Training Workshop",
    time_bn: "বিকাল ৪:০০ টা",
    time_en: "4:00 PM",
    loc_bn: "বিশ্বসাহিত্য কেন্দ্র ভবন",
    loc_en: "BSK Headquarters"
  }
];

export const notices: NoticeItem[] = [
  {
    id: "notice-1",
    title_bn: "একাদশ ও দ্বাদশ শ্রেণীর দেশভিত্তিক বইপড়া কর্মসূচির ফরম সংগ্রহ ও জমাদান",
    title_en: "Enrollment Forms Collection for College Level Reading Program",
    isUrgent: true,
    isNew: true,
    date_bn: "৩০ সেপ্টেম্বর ২০২৪",
    date_en: "Sep 30, 2024"
  },
  {
    id: "notice-2",
    title_bn: "কেন্দ্রীয় লাইব্রেরি সদস্যপদের বার্ষিক ফি পরিশোধের সময়সীমা বৃদ্ধি",
    title_en: "Extension of BSK HQ Central Library Annual Membership Fee Deadline",
    isUrgent: false,
    isNew: true,
    date_bn: "১৫ সেপ্টেম্বর ২০২৪",
    date_en: "Sep 15, 2024"
  },
  {
    id: "notice-3",
    title_bn: "রবীন্দ্র-নজরুল জয়ন্তী উপলক্ষে আবৃত্তি ও চিত্রাঙ্কন প্রতিযোগিতা ২০২৪",
    title_en: "Aura of Poets: Poetry Oration and Painting Contests 2024",
    isUrgent: false,
    isNew: false,
    date_bn: "২৮ আগস্ট ২০২৪",
    date_en: "Aug 28, 2024"
  }
];

export interface BlogPostItem {
  id: string;
  title_bn: string;
  title_en: string;
  excerpt_bn: string;
  excerpt_en: string;
  author_bn: string;
  author_en: string;
  author_role_bn: string;
  author_role_en: string;
  date_bn: string;
  date_en: string;
  read_time_bn: string;
  read_time_en: string;
  category_bn: string;
  category_en: string;
  image: string;
  content_bn?: string[];
  content_en?: string[];
}

export const defaultBlogPosts: BlogPostItem[] = [
  {
    id: "blog-1",
    title_bn: "বইপড়া আন্দোলনের অন্তরালে: আলোকিত মানুষ গড়ার চার দশক",
    title_en: "Behind the Reading Movement: Four Decades of Enlightening Minds",
    excerpt_bn: "বিশ্বসাহিত্য কেন্দ্র কেবল বই পড়ার একটি সংঘ নয়, এটি মানুষের মন ও আত্মাকে প্রসারিত করার এক মহান জাতীয় স্বপ্ন।",
    excerpt_en: "Bishwo Shahitto Kendro is not merely a reading group; it is a national dream to expand human consciousness.",
    author_bn: "আব্দুল্লাহ আবু সায়ীদ",
    author_en: "Abdullah Abu Sayeed",
    author_role_bn: "প্রতিষ্ঠাতা ও সভাপতি, বিশ্বসাহিত্য কেন্দ্র",
    author_role_en: "Founder & Chairman, BSK",
    date_bn: "১৫ মে ২০২৪",
    date_en: "May 15, 2024",
    read_time_bn: "৫ মিনিট পাঠ",
    read_time_en: "5 min read",
    category_bn: "সাহিত্য ও চিন্তা",
    category_en: "Literature & Thought",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    content_bn: [
      "মানুষ তার স্বপ্নের সমান বড়। আর সেই স্বপ্ন গড়ে ওঠে বইয়ের পাতায় পাতায় অক্ষরের আলোয়। বিশ্বসাহিত্য কেন্দ্র গত চার দশক ধরে তরুণদের মনে সেই সুউচ্চ স্বপ্নের বীজ বুনে চলেছে।",
      "আমাদের চারপাশের জগত যখন প্রতিদিন ক্ষুদ্র স্বার্থের মোহে সংকুচিত হয়ে আসছে, তখন বই আমাদের শেখায় কীভাবে বিস্তৃত হতে হয়, কীভাবে অন্যের দুঃখকে নিজের করে উপলব্ধি করতে হয়।",
      "আমাদের দেশভিত্তিক বইপড়া কর্মসূচি, ভ্রাম্যমাণ লাইব্রেরি ও আলোর ইশকুল একটিই সত্যকে বারবার সামনে এনে দাঁড় করায়—উচ্চতর সংস্কৃতি ও মননশীলতাই একটি জাতিকে মহৎ করে তোলে।"
    ],
    content_en: [
      "A human being is as grand as their dreams. And those dreams are forged in the luminous pages of books. For over four decades, Bishwo Shahitto Kendro has sown seeds of noble aspirations.",
      "When the world around us shrinks into petty interests, literature teaches us how to expand, how to empathize with humanity.",
      "Our nationwide reading habits program, mobile library network, and Aalor Ishkool highlight a single truth: higher culture and refined intellect elevate a nation."
    ]
  },
  {
    id: "blog-2",
    title_bn: "শ্রেণীকক্ষের বাইরে শিক্ষার আলো: আলোর ইশকুলের অভিজ্ঞতা",
    title_en: "Light Beyond the Classroom: Experiences from Aalor Ishkool",
    excerpt_bn: "পাঠ্যপুস্তকের বাঁধাধরা সীমানা পেরিয়ে বিশ্বের কালজয়ী জ্ঞান ও বিশ্বসাহিত্যের সাথে তরুণদের নিবিড় অনুভূতির মেলবন্ধন।",
    excerpt_en: "Connecting young minds with timeless world classics beyond academic textbooks.",
    author_bn: "অধ্যাপক জামিলুর রহমান",
    author_en: "Prof. Jamilur Rahman",
    author_role_bn: "সংগঠক ও সদস্য, বিশ্বসাহিত্য কেন্দ্র",
    author_role_en: "Organizer & Fellow, BSK",
    date_bn: "১০ জুন ২০২৪",
    date_en: "June 10, 2024",
    read_time_bn: "৪ মিনিট পাঠ",
    read_time_en: "4 min read",
    category_bn: "শিক্ষা ও পাঠাভ্যাস",
    category_en: "Education & Reading",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80",
    content_bn: [
      "আলোর ইশকুল কেবল শ্রেণীকক্ষ নয়, এটি মুক্তচিন্তার মিলনমেলা। এখানে তরুণরা দর্শন, সঙ্গীত, চলচ্চিত্র ও বিশ্বসাহিত্যের কালজয়ী কীর্তিগুলোর স্বাদ পায়।",
      "বিশ্বমানের বই ও ধ্রুপদী ভাবনার সংস্পর্শে একজন শিক্ষার্থী কীভাবে চিন্তা করতে শেখে—তা প্রত্যক্ষ করা এক আনন্দদায়ক অনুভূতি।",
      "আমরা বিশ্বাস করি, আগামী দিনের নেতৃত্ব দেবে তারাই, যাদের হৃদয় সুসংবেদনশীল এবং চিন্তা যুক্তিবাদী।"
    ]
  },
  {
    id: "blog-3",
    title_bn: "গ্রাম থেকে গ্রামে বইয়ের গাড়ি: ভ্রাম্যমাণ লাইব্রেরির যাত্রা",
    title_en: "Libraries on Wheels: The Journey of Mobile Libraries Across Bangladesh",
    excerpt_bn: "দুর্গম পল্লী থেকে শহরের অলিগলি—যেখানে বই পৌঁছায় না, সেখানে চাকা গড়ায় আমাদের স্বপ্নের লাইব্রেরি বাস।",
    excerpt_en: "Rolling library buses carrying world classics to remote villages and urban alleys.",
    author_bn: "ড. শায়লা পারভীন",
    author_en: "Dr. Shaila Parveen",
    author_role_bn: "উন্নয়ন ও গবেষণা পরিচালক",
    author_role_en: "Director of Research, BSK",
    date_bn: "২০ জুলাই ২০২৪",
    date_en: "July 20, 2024",
    read_time_bn: "৬ মিনিট পাঠ",
    read_time_en: "6 min read",
    category_bn: "সংস্কৃতি ও ইতিহাস",
    category_en: "Culture & History",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80",
    content_bn: [
      "প্রতিদিন ভোরে দেশের দূর-দূরান্তে বিশ্বসাহিত্য কেন্দ্রের ভ্রাম্যমাণ লাইব্রেরির গাড়িগুলো যাত্রা শুরু করে। মোড়ে মোড়ে যখন শিশুরা হাত তুলে বাস থামায়, সেই দৃশ্য এক নতুন বাংলাদেশের রূপ রেখা আঁকে।",
      "বই পৌঁছে দেওয়ার এ কার্যক্রম আজ দেশের অন্যতম বৃহত্তম সাংস্কৃতিক নেটওয়ার্ক। লক্ষ লক্ষ শিশু-কিশোর এই বাসের মাধ্যমে বিশ্বসাহিত্যের স্বাদ গ্রহণ করছে।",
      "আমাদের এই পথচলা চিরন্তন পাঠাগার ও নতুন আলোর দিকে।"
    ]
  }
];

export const defaultCirculars = [
  {
    id: "circ-1",
    title_bn: "দেশব্যাপী বইপড়া ও লাইব্রেরি কর্মসূচিতে সহকারী কর্মসূচি কর্মকর্তা নিয়োগ",
    title_en: "Recruitment for Assistant Program Officer in Nationwide Reading Program",
    position_bn: "সহকারী কর্মসূচি কর্মকর্তা (Assistant Program Officer)",
    position_en: "Assistant Program Officer",
    dept_bn: "দেশব্যাপী বইপড়া কর্মসূচি",
    dept_en: "Nationwide Book Reading Program",
    deadline_bn: "৩০ জুন ২০২৫",
    deadline_en: "30 June 2025",
    desc_bn: "বিশ্বসাহিত্য কেন্দ্রের দেশব্যাপী স্কুল-কলেজ পর্যায়ের বইপড়া কর্মসূচি বাস্তবায়ন, শিক্ষক ও ছাত্রছাত্রীদের সাথে যোগাযোগ এবং মাঠপর্যায়ে বই উৎসব পরিচালনার জন্য উদ্যমী ও সংস্কৃতিমনা প্রার্থী আবশ্যক।",
    desc_en: "Energetic and motivated candidates required for executing nationwide reading program, school coordination, and field book festivals.",
    status: "active"
  },
  {
    id: "circ-2",
    title_bn: "ভ্রাম্যমাণ লাইব্রেরি কার্যক্রমে ইউনিট সুপারভাইজার নিয়োগ বিজ্ঞপ্তি",
    title_en: "Unit Supervisor Recruitment for Mobile Library Operations",
    position_bn: "ভ্রাম্যমাণ লাইব্রেরি সুপারভাইজার (Mobile Library Supervisor)",
    position_en: "Mobile Library Supervisor",
    dept_bn: "ভ্রাম্যমাণ লাইব্রেরি ইউনিট",
    dept_en: "Mobile Library Unit",
    deadline_bn: "১৫ জুলাই ২০২৫",
    deadline_en: "15 July 2025",
    desc_bn: "ভ্রাম্যমাণ লাইব্রেরি গাড়ির সার্বিক পাঠক সেবা, বই ইস্যু ও জমা গ্রহণ এবং পাঠচক্র পরিচালনায় অভিজ্ঞ প্রার্থী অগ্রাধিকার পাবেন।",
    desc_en: "Candidates with passion for library reader service, book management, and community reading circles.",
    status: "active"
  }
];
