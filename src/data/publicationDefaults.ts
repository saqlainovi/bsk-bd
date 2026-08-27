export interface PublicationBook {
  id: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  descBn: string;
  descEn: string;
  pages?: number | string;
  coverBg?: string;
  price?: string;
  isbn?: string;
}

export interface PublicationSeries {
  id: string;
  titleBn: string;
  titleEn: string;
  tagBn: string;
  tagEn: string;
  descBn: string;
  descEn: string;
  image?: string;
  imageCaptionBn?: string;
  imageCaptionEn?: string;
  books: PublicationBook[];
}

export interface PublicationCatalog {
  titleBn: string;
  titleEn: string;
  size?: string;
  fileSizeBn?: string;
  fileSizeEn?: string;
  url: string;
}

export interface PublicationStat {
  bnVal: string;
  enVal: string;
  bnLbl: string;
  enLbl: string;
  color?: string;
}

export const defaultPublicationStats: PublicationStat[] = [
  { 
    bnVal: '১০০০+', 
    enVal: '1000+', 
    bnLbl: 'মোট প্রকাশিত গ্রন্থ', 
    enLbl: 'Books Published', 
    color: 'border-emerald-100 bg-emerald-50/50 text-emerald-800' 
  },
  { 
    bnVal: '২৫ বছর', 
    enVal: '25 Years', 
    bnLbl: 'অনুবাদ প্রকল্পের মেয়াদ', 
    enLbl: 'Translation Scheme', 
    color: 'border-amber-100 bg-amber-50/50 text-amber-800' 
  },
  { 
    bnVal: '৭৫০টি', 
    enVal: '750 Classics', 
    bnLbl: 'অনূদিত বিশ্বসেরা বই', 
    enLbl: 'Target World Masterpieces', 
    color: 'border-rose-100 bg-rose-50/50 text-rose-800' 
  },
  { 
    bnVal: '২০৯ খণ্ড', 
    enVal: '209 Vols', 
    bnLbl: 'বাঙালির চিন্তা সংগ্রহ', 
    enLbl: 'Bengali Thought Project', 
    color: 'border-blue-100 bg-blue-50/50 text-blue-800' 
  }
];

export const defaultPublicationSeriesList: PublicationSeries[] = [
  {
    id: 'world-classics',
    titleBn: 'বিশ্বের চিরায়ত গ্রন্থমালা',
    titleEn: 'World Classics Translation',
    tagBn: 'অনূদিত ক্লাসিক',
    tagEn: 'Classics',
    descBn: 'আমাদের দেশে ইংরেজি ভাষায় পঠনপাঠন প্রায় তিরিশ বছরে বেশ কমে গেছে। অথচ পৃথিবীর শ্রেষ্ঠ বইগুলো আজও বাংলাভাষায় অনূদিত হয়নি। ফলে মানবসভ্যতার উচ্চতর জ্ঞানজগতে প্রবেশ ও পঠনপাঠনের পথ আমাদের জন্য প্রায় রুদ্ধ হয়ে রয়েছে এবং বিশ্বসংস্কৃতির সঙ্গে আমাদের কার্যকর যোগাযোগ হারিয়ে গেছে। এই পরিস্থিতি মোকাবিলার উদ্দেশ্যে ‘বিশ্বের চিরায়ত গ্রন্থমালা’-র আওতায় বিশ্বের শ্রেষ্ঠ গ্রন্থাবলি ও রচনা-সম্পাদকে বাংলায় অনুবাদ করে প্রকাশ করার উদ্যোগ নিয়েছে কেন্দ্র। এরই মধ্যে এ-ধরনের বেশকিছু অনুবাদগ্রন্থ প্রকাশিতও হয়েছে। ২০১৪ সাল থেকে ব্যাপক কর্মসূচির আওতায় পৃথিবীর শ্রেষ্ঠ ৭৫০টি বই অনুবাদ ও প্রকাশের ২৫ বছর মেয়াদী একটি কর্মসূচি হাতে নেওয়া হয়েছে। এরই সঙ্গে ইতিপূর্বে বাংলাভাষায় বিচ্ছিন্নভাবে প্রকাশিত বিশ্বের শ্রেষ্ঠ অনুবাদ-গ্রন্থগুলোকে এই প্রকল্পের আওতায় প্রকাশ করে জনসাধারণের কাছে সুলভ করার কাজও চলছে।',
    descEn: 'English proficiency in our country has decreased over the last thirty years. However, the world’s outstanding masterpieces have still not been translated into Bengali. BSK has initiated this ambitious program to bring translated world classics into every home. A 25-year plan to translate 750 global masterpieces is currently underway.',
    image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
    imageCaptionBn: 'কেন্দ্র আয়োজিত গ্রন্থমেলায় বইয়ের সমাহার',
    imageCaptionEn: 'A selection of books displayed at our bookstore and exhibitions.',
    books: [
      {
        id: 'divine-comedy',
        titleBn: 'দিভাইন কমেডি',
        titleEn: 'The Divine Comedy',
        authorBn: 'দান্তে আলিগিয়েরি',
        authorEn: 'Dante Alighieri',
        descBn: 'দান্তের এই অমর মহাকাব্য পরকাল, নরক, ও স্বর্গের বর্ণনার মধ্য দিয়ে মধ্যযুগীয় বিশ্বদর্শনকে তুলে ধরে।',
        descEn: "Dante's masterpiece describing the soul's journey through Hell, Purgatory, and Heaven.",
        pages: 420,
        coverBg: 'bg-emerald-800'
      },
      {
        id: 'don-quixote',
        titleBn: 'ডন কিহোতে',
        titleEn: 'Don Quixote',
        authorBn: 'মিগেল দে থের্ভান্তেস',
        authorEn: 'Miguel de Cervantes',
        descBn: 'স্পেনীয় সাহিত্যের এক কালজয়ী উপন্যাস, যা বীরত্ব ও বাস্তবতার অদ্ভুত লড়াইকে হাস্যরসের মাধ্যমে উপস্থাপন করে।',
        descEn: 'A timeless Spanish novel detailing the chivalric adventures of an eccentric noble.',
        pages: 580,
        coverBg: 'bg-amber-900'
      },
      {
        id: 'republic',
        titleBn: 'রিপাবলিক',
        titleEn: 'The Republic',
        authorBn: 'প্লেটো',
        authorEn: 'Plato',
        descBn: 'আদর্শ রাষ্ট্র, জাস্টিস বা ন্যায়বিচার এবং মানব সমাজের নৈতিক ভিত্তি নিয়ে প্লেটোর বিখ্যাত দার্শনিক কথোপকথন।',
        descEn: "Socrates' dialogue concerning justice, order, and the character of the just city-state.",
        pages: 390,
        coverBg: 'bg-rose-950'
      },
      {
        id: 'crime-punishment',
        titleBn: 'ক্রাইম অ্যান্ড পানিশমেন্ট',
        titleEn: 'Crime and Punishment',
        authorBn: 'ফিওদোর দস্তয়েভস্কি',
        authorEn: 'Fyodor Dostoevsky',
        descBn: 'অপরাধের মনস্তত্ত্ব এবং পাপমোচনের এক অনন্য ও গভীর জীবনদর্শনধর্মী সাহিত্য।',
        descEn: "A deep psychological novel focusing on the mental anguish and moral dilemmas of Raskolnikov.",
        pages: 620,
        coverBg: 'bg-slate-900'
      }
    ]
  },
  {
    id: 'bengali-classics',
    titleBn: 'চিরায়ত বাংলা গ্রন্থমালা',
    titleEn: 'Classical Bengali Series',
    tagBn: 'বাঙালির ঐতিহ্য',
    tagEn: 'Bengali Heritage',
    descBn: '‘চিরায়ত বাংলা গ্রন্থমালা’-র আওতায় এযাবৎ প্রকাশ করা হয়েছে বাংলা ভাষার শ্রেষ্ঠ রচনাগুলো-এই ভাষার সেরা লেখকদের সবচেয়ে সুন্দর, রক্তিম ও অনবদ্য বই এবং রচনাসম্ভার। শুধু প্রাচীনকালের বিদগ্ধ পাঠকদের জন্য এগুলো বের করা হচ্ছে না। বের করা হচ্ছে সেইসব নতুন ও প্রাথমিক পাঠকদের কথা ভেবে যাঁরা জানার আনন্দময় জগতে নতুন পা রেখেছেন। আমাদের আশা, বাংলাভাষার অনন্যসাধারণ লেখকদের সবচেয়ে সজীব, রক্তিম ও উষ্ণ বইগুলো পড়ার মাধ্যমে তাঁরা শিল্প-সাহিত্য, জ্ঞান-বিজ্ঞানের আনন্দে অনুপ্রাণিত হয়ে উঠবেন। আসলে চিরায়ত বাংলা সাহিত্যের নতুন পাঠকসমাজ গড়ে তোলা এ-সিরিজটির মূল উদ্দেশ্য। তবে অগ্রসর পাঠকেরাও এগুলোর দ্বারা একইভাবে উপকৃত হবেন।',
    descEn: 'This series presents the absolute best literature written in Bengali. It gathers the most vibrant, warm, and beautiful creations by master Bengali authors. The collection aims to build a modern reader-base that appreciates classical Bengali thought, literature, and art.',
    image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
    imageCaptionBn: 'চিরায়ত বাংলা সাহিত্যের বইসমূহ',
    imageCaptionEn: 'Masterpieces of classical Bengali literature.',
    books: [
      {
        id: 'gitanjali',
        titleBn: 'গীতাঞ্জলি',
        titleEn: 'Gitanjali',
        authorBn: 'রবীন্দ্রনাথ ঠাকুর',
        authorEn: 'Rabindranath Tagore',
        descBn: 'কবিগুরুর নোবেলজয়ী ভক্তি ও আধ্যাত্মিক গীতি-সংকলন, যা বিশ্ব দরবারে বাংলা সাহিত্যকে অনন্য উচ্চতায় নিয়ে যায়।',
        descEn: "Tagore's Nobel Prize-winning collection of devotional and soulful lyrics.",
        pages: 180,
        coverBg: 'bg-amber-700'
      },
      {
        id: 'kapalkundala',
        titleBn: 'কপালকুণ্ডলা',
        titleEn: 'Kapalkundala',
        authorBn: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
        authorEn: 'Bankim Chandra Chattopadhyay',
        descBn: 'বাংলা সাহিত্যের প্রথম রোমান্টিক এবং রহস্যময় উপন্যাস, যার অমর সংলাপ এখনও পাঠকের চিত্ত আলোড়িত করে।',
        descEn: 'One of the earliest romantic novels in Bengali literature, filled with mystery and tragic romance.',
        pages: 150,
        coverBg: 'bg-blue-900'
      },
      {
        id: 'lalsalu',
        titleBn: 'লালসালু',
        titleEn: 'Lalsalu',
        authorBn: 'সৈয়দ ওয়ালীউল্লাহ্',
        authorEn: 'Syed Waliullah',
        descBn: 'গ্রামীণ সমাজব্যবস্থায় ধর্মীয় কুসংস্কার, অন্ধবিশ্বাস এবং শোষণের বিরুদ্ধে এক ধারালো সামাজিক উপন্যাস।',
        descEn: 'A classic social novel critiquing religious dogma, superstition, and social hypocrisy in rural Bengal.',
        pages: 165,
        coverBg: 'bg-red-800'
      },
      {
        id: 'padma-nadji',
        titleBn: 'পদ্মা নদীর মাঝি',
        titleEn: 'Padma Nadir Majhi',
        authorBn: 'মানিক বন্দ্যোপাধ্যায়',
        authorEn: 'Manik Bandyopadhyay',
        descBn: 'পদ্মাপাড়ের জেলে সম্প্রদায়ের জীবনসংগ্রাম, প্রেম ও প্রকৃতির এক জীবন্ত ক্যানভাস।',
        descEn: "A realistic portrayal of the lives, struggles, and hopes of fishermen living on the banks of the Padma river.",
        pages: 210,
        coverBg: 'bg-teal-900'
      }
    ]
  },
  {
    id: 'juvenile-classics',
    titleBn: 'কিশোর সাহিত্য গ্রন্থমালা',
    titleEn: 'Juvenile Classics Series',
    tagBn: 'কিশোর ক্লাসিক',
    tagEn: 'Juvenile',
    descBn: '‘কিশোর সাহিত্য গ্রন্থমালা’-র আওতায় বাংলাভাষাসহ পৃথিবীর বিভিন্ন দেশ ও ভাষার কিশোরসাহিত্যের শ্রেষ্ঠ বইগুলো প্রকাশ করা হচ্ছে। এ ছাড়াও বাংলাভাষার শ্রেষ্ঠ লেখকদের ইংরেজি ও অন্যান্য ভাষায় অনুবাদ করে প্রকাশ করার লক্ষ্যে একটি কর্মসূচি সম্প্রতি হাতে নেওয়া হয়েছে। এ-পর্যন্ত প্রকাশনা কার্যক্রমের আওতায় প্রকাশিত হয়েছে প্রায় ৪০০ বই। ২০১৪ সাল থেকে প্রকাশনা কার্যক্রমকে ব্যাপকভিত্তিতে সম্প্রসারিত করার পদক্ষেপ নেওয়া হয়েছে।',
    descEn: 'Gathering the world’s outstanding children and adolescent books. Over 400 books have been printed under this banner, including exciting adventures, mysteries, fairy tales, and translated science fiction classics.',
    image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
    imageCaptionBn: 'কিশোর সাহিত্য গ্রন্থমালার বিভিন্ন বই',
    imageCaptionEn: 'Adolescent and juvenile literature series.',
    books: [
      {
        id: 'robinson-crusoe',
        titleBn: 'রবিনসন ক্রুসো',
        titleEn: 'Robinson Crusoe',
        authorBn: 'ড্যানিয়েল ডেফো',
        authorEn: 'Daniel Defoe',
        descBn: 'এক নির্জন দ্বীপে আটকা পড়া এক মানুষের অসমসাহসী টিকে থাকার ও বুদ্ধিদীপ্ত অভিযানের কালজয়ী রোমাঞ্চ।',
        descEn: "The classic tale of survival, endurance, and adventure of a castaway on a remote desert island.",
        pages: 280,
        coverBg: 'bg-green-950'
      },
      {
        id: 'treasure-island',
        titleBn: 'ট্রেজার আইল্যান্ড',
        titleEn: 'Treasure Island',
        authorBn: 'রবার্ট লুই স্টিভেনসন',
        authorEn: 'Robert Louis Stevenson',
        descBn: 'জলদস্যু, গুপ্তধনের মানচিত্র এবং রোমাঞ্চকর সমুদ্রযাত্রার এক শিহরণ জাগানো অ্যাডভেঞ্চার কাহিনী।',
        descEn: "The definitive pirate adventure story of Jim Hawkins and the infamous Long John Silver.",
        pages: 250,
        coverBg: 'bg-indigo-950'
      },
      {
        id: 'tom-sawyer',
        titleBn: 'টম সয়ারের অ্যাডভেঞ্চার',
        titleEn: 'Tom Sawyer',
        authorBn: 'মার্ক টোয়েন',
        authorEn: 'Mark Twain',
        descBn: 'মিসিসিপি নদীর তীরে ডানপিটে টম ও তার বন্ধুদের দুরন্ত শৈশব, দুষ্টুমি ও রোমাঞ্চকর অভিযানের গল্প।',
        descEn: "The delightful adventures of a mischievous young boy growing up along the Mississippi River.",
        pages: 230,
        coverBg: 'bg-sky-950'
      },
      {
        id: 'gulliver-travels',
        titleBn: 'গালিভারের ভ্রমণকাহিনী',
        titleEn: 'Gulliver\'s Travels',
        authorBn: 'জোনাথন সুইফট',
        authorEn: 'Jonathan Swift',
        descBn: 'লিলিপুটদের বামন দেশ এবং দানবদের দেশে গালিভারের বিচিত্র ও কালজয়ী কল্পকাহিনী ও ব্যঙ্গাত্মক ভ্রমণবৃত্তান্ত।',
        descEn: "A brilliant satire describing Lemuel Gulliver's fantastic voyages to Lilliput and Brobdingnag.",
        pages: 310,
        coverBg: 'bg-purple-950'
      }
    ]
  },
  {
    id: 'bangalir-chinta',
    titleBn: 'বাঙালির চিন্তা কর্মসূচি',
    titleEn: 'Bengali Thought Project',
    tagBn: 'মনীষীদের রচনা',
    tagEn: 'Intellectual Thought',
    descBn: 'বিশ্বসাহিত্য কেন্দ্রের প্রকাশনার একটি অত্যন্ত গুরুত্বপূর্ণ প্রকল্প হল বাঙালির চিন্তা কর্মসূচি। এই কর্মসূচির আওতায় গত দুশো বছর ধরে বাঙালি জাতির শ্রেষ্ঠ মনীষীরা শিক্ষা, ধর্ম, বিজ্ঞান, সংস্কৃতি, দর্শন, শিল্প, সাহিত্য, রাজনীতি, সমাজ ইত্যাদি ১৬টি বিষয়ে যেসব মৌলিক চিন্তা করেছেন সেগুলোকে ব্যাপকভাবে সংগ্রহ ও বাছাই করে প্রতিটি বিষয়ের শ্রেষ্ঠ রচনাসম্ভারকে বহু খণ্ডে প্রকাশ করার আয়োজন শেষ হয়েছে। ২০০ খণ্ডে প্রায় ৬৮,০০০ পৃষ্ঠার এই মহাসংগ্রহ কিছুকালের মধ্যেই প্রকাশিত হবে।',
    descEn: 'A pioneering archival initiative editing and sorting the monumental contributions of Bengali thinkers over the last 200 years. Spanning across 16 main domains including Science, Philosophy, Religion, Politics, and Arts, totaling 209 volumes.',
    image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
    imageCaptionBn: 'বাঙালির চিন্তা কর্মসূচির গ্রন্থসম্ভার',
    imageCaptionEn: 'Monumental collections of Bengali thinkers.',
    books: [
      {
        id: 'science-thought',
        titleBn: 'বাঙালির বিজ্ঞানচিন্তা',
        titleEn: 'Bengali Science Thought',
        authorBn: 'বিজ্ঞানচিন্তা ও সম্পাদনা পর্ষদ',
        authorEn: 'Science Editorial Panel',
        descBn: 'বাংলা ভাষায় বিজ্ঞানচর্চা ও বিজ্ঞানচিন্তার বিকাশ ও আদি বিজ্ঞানীদের চিন্তাধারার এক অনন্য দলিল।',
        descEn: 'The evolution of scientific thought and philosophy written in Bengali over the last two centuries.',
        pages: 350,
        coverBg: 'bg-stone-800'
      },
      {
        id: 'philosophy-thought',
        titleBn: 'বাঙালির দর্শনচিন্তা',
        titleEn: 'Bengali Philosophical Thought',
        authorBn: 'দর্শনচিন্তা ও সম্পাদনা পর্ষদ',
        authorEn: 'Philosophy Editorial Panel',
        descBn: 'প্রাচীন ও আধুনিক ভারতীয় এবং বাঙালি দার্শনিকদের তত্ত্ব ও ভাবনার গভীর সংকলন।',
        descEn: 'A comprehensive anthology of philosophical ideas, systems, and debates of Bengali intellectuals.',
        pages: 480,
        coverBg: 'bg-red-950'
      },
      {
        id: 'society-thought',
        titleBn: 'বাঙালির সমাজচিন্তা',
        titleEn: 'Bengali Social Thought',
        authorBn: 'সমাজচিন্তা ও সম্পাদনা পর্ষদ',
        authorEn: 'Social Thought Editorial Panel',
        descBn: 'বাঙালির সামাজিক বিবর্তন, সংস্কার আন্দোলন এবং সমাজ সংস্কারকদের চিন্তাশীল রচনার সংগ্রহ।',
        descEn: 'A collection of critical reflections on society, caste, reform, and cultural identity in Bengal.',
        pages: 410,
        coverBg: 'bg-amber-950'
      },
      {
        id: 'history-thought',
        titleBn: 'বাঙালির ইতিহাসচিন্তা',
        titleEn: 'Bengali Historical Thought',
        authorBn: 'ইতিহাসচিন্তা ও সম্পাদনা পর্ষদ',
        authorEn: 'History Editorial Panel',
        descBn: 'ব্রিটিশ, পাকিস্তান ও বাংলাদেশ আমলের ইতিহাসচর্চার সামগ্রিক ও বহুমাত্রিক সংকলন।',
        descEn: 'The historiographical perspectives and historical research methodologies written in Bengali.',
        pages: 440,
        coverBg: 'bg-emerald-950'
      }
    ]
  }
];

export const defaultPublicationCatalogs: PublicationCatalog[] = [
  {
    titleBn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনীর বইয়ের তালিকা (ক্যাটালগ-২০২৩)',
    titleEn: 'Bishwo Shahitto Kendro Publications Catalog (2023)',
    size: '৪.২ মেগাবাইট • পিডিএফ',
    fileSizeBn: '৪.২ মেগাবাইট • পিডিএফ',
    fileSizeEn: '4.2 MB • PDF',
    url: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'
  },
  {
    titleBn: 'ভারতীয় বিভিন্ন প্রকাশনার সেরা বইয়ের মজুদ তালিকা (২০২১)',
    titleEn: 'Selected Indian Publications Stock List (2021)',
    size: '২.৮ মেগাবাইট • পিডিএফ',
    fileSizeBn: '২.৮ মেগাবাইট • পিডিএফ',
    fileSizeEn: '2.8 MB • PDF',
    url: '/assets/IMGS/PURNIMA SONDHA/alor.jpg'
  },
  {
    titleBn: 'বাংলাদেশের বিভিন্ন প্রকাশনার বইয়ের বিশেষ ছাড় তালিকা (২০২৩)',
    titleEn: 'Special Discount Stock List of Bangladeshi Publishers (2023)',
    size: '৩.৫ মেগাবাইট • পিডিএফ',
    fileSizeBn: '৩.৫ মেগাবাইট • পিডিএফ',
    fileSizeEn: '3.5 MB • PDF',
    url: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg'
  }
];

export const defaultPublicationGallery = [
  {
    image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
    caption_bn: 'কেন্দ্র আয়োজিত গ্রন্থমেলায় বইয়ের সমাহার',
    caption_en: 'Books exhibition at BSK fair'
  },
  {
    image: '/assets/IMGS/LIBARY/484577162_1054485646702916_7369530174410735143_n.jpg',
    caption_bn: 'পাঠক ও সদস্যদের জন্য নতুন বইয়ের প্রদর্শনী',
    caption_en: 'New arrivals exhibition for members'
  }
];

export const defaultPublicationPageData = {
  id: 'publication',
  title_bn: 'প্রকাশনা কার্যক্রম',
  title_en: 'Publications Program',
  html_title: 'প্রকাশনা কার্যক্রম - বিশ্বসাহিত্য কেন্দ্র',
  badge_bn: 'বিশ্বসাহিত্য কেন্দ্র প্রকাশনী',
  badge_en: 'Bishwo Shahitto Kendro Publications',
  subtitle_bn: 'জাতীয় চিত্তকে দীপায়িত করার লক্ষ্যে কেন্দ্রের আরও একটি কার্যক্রম রয়েছে। এটি হল প্রকাশনা কার্যক্রম। এই কর্মসূচির ভেতর দিয়ে ভাষাসহ পৃথিবীর বিভিন্ন দেশ ও ভাষার শ্রেষ্ঠ বইগুলো প্রকাশ করে ঘরে ঘরে পৌঁছে দেওয়ার পদক্ষেপ নেওয়া হয়েছে।',
  subtitle_en: 'To enlighten the national mind, the center has established an active publication wing. This program translates and publishes the world’s outstanding literary and intellectual classics, making them affordable and accessible to readers across the country.',
  hero_image: '/assets/IMGS/484519885_1054490900035724_1436158340120607261_n.jpg',
  catalog_url: '/assets/IMGS/PURNIMA SONDHA/bcrs.jpg',
  stats: defaultPublicationStats,
  series_section_title_bn: 'আমাদের প্রকাশনা সিরিজসমূহ',
  series_section_title_en: 'Our Publication Series',
  series_section_desc_bn: 'সিরিজ নির্বাচন করে বর্ণনা এবং বইয়ের তাক দেখুন',
  series_section_desc_en: 'Select a series to explore details and specific bookshelves',
  publication_series: defaultPublicationSeriesList,
  catalogs_title_bn: 'প্রকাশনী ক্যাটালগ ও বইয়ের তালিকা',
  catalogs_title_en: 'Catalogs & Book Lists',
  catalogs: defaultPublicationCatalogs,
  gallery: defaultPublicationGallery,
  contact_title_bn: 'প্রকাশনা বিভাগের সঙ্গে যোগাযোগ',
  contact_title_en: 'Contact Publications Department',
  contact_org_bn: 'বিশ্বসাহিত্য কেন্দ্র',
  contact_org_en: 'Bishwo Shahitto Kendro',
  contact_address_bn: '১৭ ময়মনসিংহ রোড, বাংলামটর, ঢাকা ১০০০',
  contact_address_en: '17 Mymensingh Road, Banglamotor, Dhaka 1000',
  contact_phones: '৯৬৬০৮১২, ৫৮৬১১৯৪০',
  contact_mobiles: '০১৮৩৯৯০৬৭৫৪, ০১৭১২৫৪১২৬৩',
  contact_email: 'bskprokashona@gmail.com',
  inquiry_title_bn: 'প্রকাশনা বা বই সংক্রান্ত জিজ্ঞাসা',
  inquiry_title_en: 'Publications & Book Inquiry',
  inquiry_desc_bn: 'যেকোনো বইয়ের প্রাপ্তি বা প্রকাশনা বিষয়ক জিজ্ঞাসার জন্য সরাসরি আমাদের জানান',
  inquiry_desc_en: 'Send us your queries regarding book availability, orders, or translations.'
};
