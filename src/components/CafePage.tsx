import React, { useState } from 'react';
import { 
  Coffee, Utensils, UtensilsCrossed, CupSoda, Clock, Phone, Mail, MapPin, 
  Search, Sparkles, ShoppingBag, CheckCircle, Info, Heart, ChevronRight, 
  Download, Send, Soup, Cake, Flame, ChefHat, Check, X, ShieldCheck
} from 'lucide-react';
import { ParsedPage, Language } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CafePageProps {
  page: ParsedPage;
  language: Language;
  onNavigate: (route: string) => void;
}

interface MenuItem {
  id: string;
  nameBn: string;
  nameEn: string;
  category: string; // 'appetizer' | 'soup' | 'dessert' | 'drinks' | 'bangla_set' | 'chinese_set' | 'biryani_set' | 'customized' | 'salad'
  priceBn: string;
  priceEn: string;
  detailsBn?: string;
  detailsEn?: string;
  tagBn?: string;
  tagEn?: string;
  itemsBn?: string[]; // for set menus
  itemsEn?: string[];
  image?: string;
}

export const CafePage: React.FC<CafePageProps> = ({ page, language, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Order / Reservation Modal State
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'catering'>('dine-in');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Filter Categories
  const categories = [
    { id: 'all', bn: 'সব আইটেম', en: 'All Items', icon: Utensils },
    { id: 'appetizer', bn: 'অ্যাপেটাইজার ও স্ন্যাক্স', en: 'Appetizers & Snacks', icon: Flame },
    { id: 'soup', bn: 'স্যুপ', en: 'Soups', icon: Soup },
    { id: 'dessert', bn: 'ডেজার্ট ও মিষ্টি', en: 'Desserts & Sweets', icon: Cake },
    { id: 'drinks', bn: 'ড্রিংকস, কফি ও চা', en: 'Drinks, Coffee & Tea', icon: CupSoda },
    { id: 'bangla_set', bn: 'বাংলা সেট মেন্যু', en: 'Bangla Set Menu', icon: UtensilsCrossed },
    { id: 'chinese_set', bn: 'চাইনিজ সেট মেন্যু', en: 'Chinese Set Menu', icon: ChefHat },
    { id: 'biryani_set', bn: 'বিরিয়ানী সেট মেন্যু', en: 'Biryani Set Menu', icon: Sparkles },
    { id: 'customized', bn: 'কাস্টমাইজড / এ লা কার্তে', en: 'Customized / A La Carte', icon: Utensils },
    { id: 'salad', bn: 'সালাদ', en: 'Salads', icon: Heart },
  ];

  // Complete Official Menu Data from PDF
  const menuItems: MenuItem[] = [
    // --- APPETIZERS (অ্যাপেটাইজার) ---
    { id: 'app-1', nameBn: 'ভেজিটেবল সিঙ্গারা', nameEn: 'Vegetable Shingara', category: 'appetizer', priceBn: '১৫', priceEn: '15', tagBn: 'হট স্ন্যাক্স', tagEn: 'Hot Snack' },
    { id: 'app-2', nameBn: 'কলিজা সিঙ্গারা', nameEn: 'Kolija Shingara', category: 'appetizer', priceBn: '২০', priceEn: '20', tagBn: 'স্পেশাল', tagEn: 'Special' },
    { id: 'app-3', nameBn: 'চিকেন সিঙ্গারা', nameEn: 'Chicken Shingara', category: 'appetizer', priceBn: '২০', priceEn: '20' },
    { id: 'app-4', nameBn: 'চিকেন সামুচা', nameEn: 'Chicken Samucha', category: 'appetizer', priceBn: '২০', priceEn: '20' },
    { id: 'app-5', nameBn: 'ভেজিটেবল পাকোড়া', nameEn: 'Vegetable Pakora', category: 'appetizer', priceBn: '১২', priceEn: '12' },
    { id: 'app-6', nameBn: 'চিকেন পাকোড়া', nameEn: 'Chicken Pakora', category: 'appetizer', priceBn: '২০', priceEn: '20' },
    { id: 'app-7', nameBn: 'চিকেন স্যান্ডউইচ (২ পার্ট)', nameEn: 'Chicken Sandwich (2 Layer)', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-8', nameBn: 'চিকেন স্যান্ডউইচ (৩ পার্ট)', nameEn: 'Chicken Sandwich (3 Layer)', category: 'appetizer', priceBn: '৭০', priceEn: '70', tagBn: 'জনপ্রিয়', tagEn: 'Popular' },
    { id: 'app-9', nameBn: 'সাব স্যান্ডউইচ', nameEn: 'Sub Sandwich', category: 'appetizer', priceBn: '৮০', priceEn: '80' },
    { id: 'app-10', nameBn: 'চিকেন বার্গার', nameEn: 'Chicken Burger', category: 'appetizer', priceBn: '৮০', priceEn: '80', tagBn: 'জনপ্রিয়', tagEn: 'Popular' },
    { id: 'app-11', nameBn: 'চিকেন ফ্রাই', nameEn: 'Chicken Fry', category: 'appetizer', priceBn: '৬০', priceEn: '60' },
    { id: 'app-12', nameBn: 'চিকেন রোল', nameEn: 'Chicken Roll', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-13', nameBn: 'চিকেন বান', nameEn: 'Chicken Bun', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-14', nameBn: 'চিকেন নুডুলস', nameEn: 'Chicken Noodles', category: 'appetizer', priceBn: '৭০', priceEn: '70' },
    { id: 'app-15', nameBn: 'ভেজিটেবল রোল', nameEn: 'Vegetable Roll', category: 'appetizer', priceBn: '৪০', priceEn: '40' },
    { id: 'app-16', nameBn: 'চিকেন মোমো (৩ পিস)', nameEn: 'Chicken Momo (3 Pcs)', category: 'appetizer', priceBn: '৭০', priceEn: '70', tagBn: 'ফেভারিট', tagEn: 'Favorite' },
    { id: 'app-17', nameBn: 'ভেজিটেবল মোমো (৩ পিস)', nameEn: 'Vegetable Momo (3 Pcs)', category: 'appetizer', priceBn: '৬০', priceEn: '60' },
    { id: 'app-18', nameBn: 'প্রন মোমো (৩ পিস)', nameEn: 'Prawn Momo (3 Pcs)', category: 'appetizer', priceBn: '১০০', priceEn: '100', tagBn: 'স্পেশাল', tagEn: 'Special' },
    { id: 'app-19', nameBn: 'স্প্রিং রোল (২ পিস)', nameEn: 'Spring Roll (2 Pcs)', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-20', nameBn: 'মিনি সামুচা (২ পিস)', nameEn: 'Mini Samucha (2 Pcs)', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-21', nameBn: 'চিকেন নাগেটস (২ পিস)', nameEn: 'Chicken Nuggets (2 Pcs)', category: 'appetizer', priceBn: '৫০', priceEn: '50' },
    { id: 'app-22', nameBn: 'মাটন প্যাটিস', nameEn: 'Mutton Patties', category: 'appetizer', priceBn: '৮০', priceEn: '80' },
    { id: 'app-23', nameBn: 'চিকেন প্যাটিস', nameEn: 'Chicken Patties', category: 'appetizer', priceBn: '৬০', priceEn: '60' },
    { id: 'app-24', nameBn: 'প্লেন কেক', nameEn: 'Plain Cake', category: 'appetizer', priceBn: '২৫', priceEn: '25' },
    { id: 'app-25', nameBn: 'ফ্রুট কেক', nameEn: 'Fruit Cake', category: 'appetizer', priceBn: '৩০', priceEn: '30' },
    { id: 'app-26', nameBn: 'চমচম', nameEn: 'Chomchom Sweet', category: 'appetizer', priceBn: '২৫', priceEn: '25' },
    { id: 'app-27', nameBn: 'লাড্ডু', nameEn: 'Laddu', category: 'appetizer', priceBn: '২৫', priceEn: '25' },
    { id: 'app-28', nameBn: 'ছানাসন্দেশ', nameEn: 'Chhana Sondesh', category: 'appetizer', priceBn: '৫০', priceEn: '50', tagBn: 'খাস মিষ্টি', tagEn: 'Special Sweet' },
    { id: 'app-29', nameBn: 'কালোজাম', nameEn: 'Kalo Jam Sweet', category: 'appetizer', priceBn: '২৫', priceEn: '25' },
    { id: 'app-30', nameBn: 'জিলাপি', nameEn: 'Jilapi', category: 'appetizer', priceBn: '১৫', priceEn: '15' },
    { id: 'app-31', nameBn: 'গ্রীন আপেল (১ পিস)', nameEn: 'Green Apple (1 Pc)', category: 'appetizer', priceBn: '৪০', priceEn: '40' },
    { id: 'app-32', nameBn: 'রেড আপেল (১ পিস)', nameEn: 'Red Apple (1 Pc)', category: 'appetizer', priceBn: '৪০', priceEn: '40' },
    { id: 'app-33', nameBn: 'কমলা (১ পিস)', nameEn: 'Orange (1 Pc)', category: 'appetizer', priceBn: '৪০', priceEn: '40' },
    { id: 'app-34', nameBn: 'কলা (১ পিস)', nameEn: 'Banana (1 Pc)', category: 'appetizer', priceBn: '১৫', priceEn: '15' },
    { id: 'app-35', nameBn: 'পেয়ারা (১ পিস)', nameEn: 'Guava (1 Pc)', category: 'appetizer', priceBn: '২০', priceEn: '20' },
    { id: 'app-36', nameBn: 'লেক্সাস বিস্কুট (১ প্যাকেট)', nameEn: 'Lexus Biscuit (1 Pack)', category: 'appetizer', priceBn: '১০', priceEn: '10' },
    { id: 'app-37', nameBn: 'বেকারি বিস্কুট (২ পিস)', nameEn: 'Bakery Biscuit (2 Pcs)', category: 'appetizer', priceBn: '১৫', priceEn: '15' },
    { id: 'app-38', nameBn: 'পানি (৫০০ এমএল)', nameEn: 'Mineral Water (500 ml)', category: 'appetizer', priceBn: '২০', priceEn: '20' },
    { id: 'app-39', nameBn: 'পানি (৩৩০ এমএল)', nameEn: 'Mineral Water (330 ml)', category: 'appetizer', priceBn: '১৫', priceEn: '15' },
    { id: 'app-40', nameBn: 'পানি (২৫০ এমএল)', nameEn: 'Mineral Water (250 ml)', category: 'appetizer', priceBn: '১০', priceEn: '10' },

    // --- SOUPS (স্যুপ) ---
    { id: 'soup-1', nameBn: 'থাই ক্লিয়ার স্যুপ', nameEn: 'Thai Clear Soup', category: 'soup', priceBn: '৮০', priceEn: '80', detailsBn: 'লেমনগ্রাস ও তাজা উপকরণের রিফ্রেশিং থাই ক্লিয়ার স্যুপ', detailsEn: 'Refreshing Thai clear soup infused with lemongrass and herbs' },
    { id: 'soup-2', nameBn: 'থাই থিক স্যুপ', nameEn: 'Thai Thick Soup', category: 'soup', priceBn: '৮০', priceEn: '80', tagBn: 'পছন্দের', tagEn: 'Popular', detailsBn: 'চিকেন ও প্রন সমৃদ্ধ ঘন থাই স্যুপ', detailsEn: 'Rich and creamy Thai soup with chicken and prawn' },
    { id: 'soup-3', nameBn: 'চিকেন কর্ন স্যুপ', nameEn: 'Chicken Corn Soup', category: 'soup', priceBn: '৮০', priceEn: '80', detailsBn: 'সুইট কর্ন ও চিকেনের মজাদার সুস্বাদু স্যুপ', detailsEn: 'Comforting soup with sweet corn kernels and shredded chicken' },
    { id: 'soup-4', nameBn: 'মিক্স ভেজিটেবল স্যুপ', nameEn: 'Mixed Vegetable Soup', category: 'soup', priceBn: '৮০', priceEn: '80', detailsBn: 'হরেক রকমের তাজা সবজি সমৃদ্ধ পুষ্টিকর স্যুপ', detailsEn: 'Nutritious soup brimming with fresh seasonal vegetables' },
    { id: 'soup-5', nameBn: 'ক্রিম অব মাশরুম স্যুপ', nameEn: 'Cream of Mushroom Soup', category: 'soup', priceBn: '৮০', priceEn: '80', detailsBn: 'মাশরুম ও ক্রিম দিয়ে তৈরি স্বাস্থ্যকর স্যুপ', detailsEn: 'Rich velvety soup made with fresh mushrooms and cream' },
    { id: 'soup-6', nameBn: 'ক্রিম অব টমেটো স্যুপ', nameEn: 'Cream of Tomato Soup', category: 'soup', priceBn: '৮০', priceEn: '80', detailsBn: 'তাজা পাকা টমেটোর স্মুথ ক্রিমি স্যুপ', detailsEn: 'Classic creamy soup made from ripe garden tomatoes' },

    // --- DESSERTS (ডেজার্ট) ---
    { id: 'des-1', nameBn: 'সুইট কাস্টার্ড', nameEn: 'Sweet Custard', category: 'dessert', priceBn: '৮০', priceEn: '80' },
    { id: 'des-2', nameBn: 'ফ্রুটস কাস্টার্ড', nameEn: 'Fruits Custard', category: 'dessert', priceBn: '৮০', priceEn: '80', tagBn: 'জনপ্রিয়', tagEn: 'Popular' },
    { id: 'des-3', nameBn: 'ফালুদা', nameEn: 'Special Falooda', category: 'dessert', priceBn: '৮০', priceEn: '80', tagBn: 'বিশেষ স্বাদ', tagEn: 'Special' },
    { id: 'des-4', nameBn: 'পুডিং', nameEn: 'Caramel Pudding', category: 'dessert', priceBn: '৮০', priceEn: '80' },
    { id: 'des-5', nameBn: 'ফিরনি', nameEn: 'Traditional Firni', category: 'dessert', priceBn: '৮০', priceEn: '80' },
    { id: 'des-6', nameBn: 'দই', nameEn: 'Sweet Yogurt (Doi)', category: 'dessert', priceBn: '৮০', priceEn: '80' },

    // --- DRINKS & COFFEE / TEA (ড্রিংকস/জুস/কফি/চা) ---
    { id: 'drk-1', nameBn: 'সিজনাল ফ্রেশ জুস (পেঁপে / আম / আনারস)', nameEn: 'Seasonal Fresh Juice (Papaya/Mango/Pineapple)', category: 'drinks', priceBn: '৬০', priceEn: '60', tagBn: 'তাজা জুস', tagEn: 'Fresh Juice' },
    { id: 'drk-2', nameBn: 'ফ্রেশ জুস (আপেল / মাল্টা / কমলা)', nameEn: 'Fresh Juice (Apple/Malta/Orange)', category: 'drinks', priceBn: '৮০', priceEn: '80' },
    { id: 'drk-3', nameBn: 'লাচ্ছি', nameEn: 'Sweet Lassi', category: 'drinks', priceBn: '৮০', priceEn: '80', tagBn: 'ঠান্ডা রিফ্রেশিং', tagEn: 'Refreshing' },
    { id: 'drk-4', nameBn: 'সফট ড্রিংকস', nameEn: 'Soft Drinks', category: 'drinks', priceBn: '২৫', priceEn: '25' },
    { id: 'drk-5', nameBn: 'রেগুলার কফি', nameEn: 'Regular Hot Coffee', category: 'drinks', priceBn: '৬০', priceEn: '60' },
    { id: 'drk-6', nameBn: 'মেশিন কফি', nameEn: 'Machine Espresso Coffee', category: 'drinks', priceBn: '৩০', priceEn: '30', tagBn: 'হট ফেভারিট', tagEn: 'Hot Favorite' },
    { id: 'drk-7', nameBn: 'রং চা / গ্রীন টি', nameEn: 'Liquor Tea / Green Tea', category: 'drinks', priceBn: '১০', priceEn: '10' },
    { id: 'drk-8', nameBn: 'দুধ চা', nameEn: 'Milk Tea (Doodh Cha)', category: 'drinks', priceBn: '২০', priceEn: '20', tagBn: 'খাস চা', tagEn: 'Classic Tea' },

    // --- BANGLA SET MENUS (বাংলা সেট মেন্যু) ---
    { 
      id: 'bset-1', 
      nameBn: 'বাংলা সেট মেন্যু - ১', 
      nameEn: 'Bangla Set Menu - 1', 
      category: 'bangla_set', 
      priceBn: '৪২০', 
      priceEn: '420',
      tagBn: 'টপ সেলার',
      tagEn: 'Top Seller',
      itemsBn: ['সাদাভাত (কাটারীভোগ)', 'মিক্স সবজি', 'রুই মাছ ভুনা', 'চিকেন কারি (সোনালি)', 'ঘনডাল', 'সালাদ', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Katari Bhog Steamed Rice', 'Mixed Vegetable', 'Rui Fish Bhuna', 'Sonali Chicken Curry', 'Thick Lentil Dal', 'Fresh Salad', 'Mineral Water (330ml)']
    },
    { 
      id: 'bset-2', 
      nameBn: 'বাংলা সেট মেন্যু - ২', 
      nameEn: 'Bangla Set Menu - 2', 
      category: 'bangla_set', 
      priceBn: '৪৭৫', 
      priceEn: '475',
      tagBn: 'ইলিশ স্পেশাল',
      tagEn: 'Ilish Special',
      itemsBn: ['সাদাভাত (কাটারীভোগ)', 'লাউ চিংড়ি / সবজি', 'বেগুন ভাজা', 'সরষে ইলিশ', 'ঘনডাল', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Katari Bhog Steamed Rice', 'Lau Prawn / Vegetable', 'Eggplant Fry', 'Shorshe Ilish (Mustard Hilsa)', 'Thick Lentil Dal', 'Mineral Water (330ml)']
    },
    { 
      id: 'bset-3', 
      nameBn: 'বাংলা সেট মেন্যু - ৩', 
      nameEn: 'Bangla Set Menu - 3', 
      category: 'bangla_set', 
      priceBn: '৪৭৫', 
      priceEn: '475',
      itemsBn: ['সাদাভাত (কাটারীভোগ)', 'সবজি / ভাজি', 'রুই মাছ ভুনা', 'গরুর মাংস', 'ঘনডাল', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Katari Bhog Steamed Rice', 'Vegetable / Bhaji', 'Rui Fish Bhuna', 'Beef Curry', 'Thick Lentil Dal', 'Mineral Water (330ml)']
    },
    { 
      id: 'bset-4', 
      nameBn: 'বাংলা সেট মেন্যু - ৪', 
      nameEn: 'Bangla Set Menu - 4', 
      category: 'bangla_set', 
      priceBn: '৪৭৫', 
      priceEn: '475',
      itemsBn: ['সাদাভাত (কাটারীভোগ)', 'সবজি / ভাজি', 'রুই মাছ ভুনা', 'খাসির মাংস', 'ঘনডাল', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Katari Bhog Steamed Rice', 'Vegetable / Bhaji', 'Rui Fish Bhuna', 'Mutton Curry', 'Thick Lentil Dal', 'Mineral Water (330ml)']
    },
    { 
      id: 'bset-5', 
      nameBn: 'বাংলা সেট মেন্যু - ৫', 
      nameEn: 'Bangla Set Menu - 5', 
      category: 'bangla_set', 
      priceBn: '৫০৫', 
      priceEn: '505',
      tagBn: 'পোলাও স্পেশাল',
      tagEn: 'Polao Special',
      itemsBn: ['প্লেন পোলাও', 'বেগুন ভাজা', 'রুই মাছ ফ্রাই', 'চিকেন রোস্ট (সোনালি)', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Plain Polao Rice', 'Eggplant Fry', 'Rui Fish Fry', 'Sonali Chicken Roast', 'Mineral Water (330ml)']
    },
    { 
      id: 'bset-6', 
      nameBn: 'বাংলা সেট মেন্যু - ৬', 
      nameEn: 'Bangla Set Menu - 6', 
      category: 'bangla_set', 
      priceBn: '৫০৫', 
      priceEn: '505',
      tagBn: 'খিচুড়ি স্পেশাল',
      tagEn: 'Khichuri Special',
      itemsBn: ['ভুনা খিচুড়ি', 'বেগুন ভাজা', 'চিকেন কারী (সোনালি)', 'ডিম ভুনা', 'পানি (৩৩০এমএল)'],
      itemsEn: ['Bhuna Khichuri', 'Eggplant Fry', 'Sonali Chicken Curry', 'Egg Bhuna', 'Mineral Water (330ml)']
    },

    // --- CHINESE SET MENUS (চাইনিজ সেট মেন্যু) ---
    { 
      id: 'cset-1', 
      nameBn: 'চাইনিজ সেট মেন্যু - ১', 
      nameEn: 'Chinese Set Menu - 1', 
      category: 'chinese_set', 
      priceBn: '২৫০', 
      priceEn: '250',
      itemsBn: ['ফ্রাইড রাইস', 'ফ্রাইড চিকেন (২ পিস)', 'চাইনিজ ভেজিটেবল', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Fried Rice', 'Fried Chicken (2 Pcs)', 'Chinese Vegetable', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },
    { 
      id: 'cset-2', 
      nameBn: 'চাইনিজ সেট মেন্যু - ২', 
      nameEn: 'Chinese Set Menu - 2', 
      category: 'chinese_set', 
      priceBn: '২৭০', 
      priceEn: '270',
      tagBn: 'জনপ্রিয়',
      tagEn: 'Popular',
      itemsBn: ['ফ্রাইড রাইস', 'ফ্রাইড চিকেন (২ পিস)', 'চিকেন ভেজিটেবল', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Fried Rice', 'Fried Chicken (2 Pcs)', 'Chicken Vegetable', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },
    { 
      id: 'cset-3', 
      nameBn: 'চাইনিজ সেট মেন্যু - ৩', 
      nameEn: 'Chinese Set Menu - 3', 
      category: 'chinese_set', 
      priceBn: '৪৫০', 
      priceEn: '450',
      tagBn: 'প্রিমিয়াম',
      tagEn: 'Premium',
      itemsBn: ['ফ্রাইড রাইস', 'ফ্রাইড চিকেন (২ পিস)', 'চিকেন মাসালা', 'প্রোন ভেজিটেবল', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Fried Rice', 'Fried Chicken (2 Pcs)', 'Chicken Masala', 'Prawn Vegetable', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },
    { 
      id: 'cset-4', 
      nameBn: 'চাইনিজ সেট মেন্যু - ৪', 
      nameEn: 'Chinese Set Menu - 4', 
      category: 'chinese_set', 
      priceBn: '৩৬০', 
      priceEn: '360',
      itemsBn: ['ফ্রাইড রাইস', 'ফ্রাইড চিকেন (২ পিস)', 'চিকেন ভেজিটেবল', 'প্রোন / চিকেনচিলি অনিয়ন', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Fried Rice', 'Fried Chicken (2 Pcs)', 'Chicken Vegetable', 'Prawn / Chicken Chili Onion', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },

    // --- BIRYANI SET MENUS (বিরিয়ানী সেট মেন্যু) ---
    { 
      id: 'bir-1', 
      nameBn: 'বিরিয়ানী সেট মেন্যু - ১ (কাচ্চি)', 
      nameEn: 'Biryani Set Menu - 1 (Kacchi)', 
      category: 'biryani_set', 
      priceBn: '৩৬০', 
      priceEn: '360',
      tagBn: 'কাচ্চি ফেভারিট',
      tagEn: 'Kacchi Favorite',
      itemsBn: ['কাচ্চি বিরিয়ানি', 'চিকেন টিক্কা', 'ডিম ভুনা', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Kacchi Biryani', 'Chicken Tikka', 'Egg Bhuna', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },
    { 
      id: 'bir-2', 
      nameBn: 'বিরিয়ানী সেট মেন্যু - ২ (চিকেন)', 
      nameEn: 'Biryani Set Menu - 2 (Chicken)', 
      category: 'biryani_set', 
      priceBn: '৩৬০', 
      priceEn: '360',
      itemsBn: ['চিকেন বিরিয়ানি', 'চিকেন টিক্কা', 'ডিম ভুনা', 'পানি (৩৩০এমএল)', 'ড্রিংকস (২৫০এমএল)'],
      itemsEn: ['Chicken Biryani', 'Chicken Tikka', 'Egg Bhuna', 'Mineral Water (330ml)', 'Soft Drink (250ml)']
    },

    // --- CUSTOMIZED / A LA CARTE MENU (কাস্টমাইজড মেন্যু) ---
    { id: 'cst-1', nameBn: 'ভাত (মিনিকোট)', nameEn: 'Rice (Minikat)', category: 'customized', priceBn: '৫০', priceEn: '50' },
    { id: 'cst-2', nameBn: 'ভাত (কাটারীভোগ)', nameEn: 'Rice (Katari Bhog)', category: 'customized', priceBn: '৬০', priceEn: '60' },
    { id: 'cst-3', nameBn: 'ভাত (বাসমতি)', nameEn: 'Rice (Basmati)', category: 'customized', priceBn: '৭০', priceEn: '70' },
    { id: 'cst-4', nameBn: 'ভাত (নাজির)', nameEn: 'Rice (Nazirshail)', category: 'customized', priceBn: '৫০', priceEn: '50' },
    { id: 'cst-5', nameBn: 'প্লেন পোলাও', nameEn: 'Plain Polao', category: 'customized', priceBn: '৮০', priceEn: '80' },
    { id: 'cst-6', nameBn: 'রুই মাছ', nameEn: 'Rui Fish', category: 'customized', priceBn: '১৪০', priceEn: '140' },
    { id: 'cst-7', nameBn: 'বোয়াল মাছ', nameEn: 'Boal Fish', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-8', nameBn: 'আইড় মাছ', nameEn: 'Ayr Fish', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-9', nameBn: 'ইলিশ মাছ', nameEn: 'Ilish (Hilsa) Fish', category: 'customized', priceBn: '২৫০', priceEn: '250', tagBn: 'খাস ইলিশ', tagEn: 'Special Hilsa' },
    { id: 'cst-10', nameBn: 'কোরাল মাছ', nameEn: 'Koral Fish', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-11', nameBn: 'রূপচাদা মাছ', nameEn: 'Rupchanda Fish', category: 'customized', priceBn: '৩৫০', priceEn: '350', tagBn: 'প্রিমিয়াম', tagEn: 'Premium' },
    { id: 'cst-12', nameBn: 'চিংড়ি মাছ', nameEn: 'Prawn Curry', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-13', nameBn: 'পাবদা মাছ', nameEn: 'Pabda Fish', category: 'customized', priceBn: '১৫০', priceEn: '150' },
    { id: 'cst-14', nameBn: 'টেংরা মাছ', nameEn: 'Tengra Fish', category: 'customized', priceBn: '১৫০', priceEn: '150' },
    { id: 'cst-15', nameBn: 'ছোট মাছ', nameEn: 'Small Assorted Fish', category: 'customized', priceBn: '১২০', priceEn: '120' },
    { id: 'cst-16', nameBn: 'বেলে মাছ', nameEn: 'Bele Fish', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-17', nameBn: 'মাছ ভর্তা', nameEn: 'Mashed Fish (Bhorta)', category: 'customized', priceBn: '৪০', priceEn: '40' },
    { id: 'cst-18', nameBn: 'সবজি / ভাজি', nameEn: 'Vegetable / Bhaji', category: 'customized', priceBn: '৩০', priceEn: '30' },
    { id: 'cst-19', nameBn: 'ভুনা খিচুড়ি', nameEn: 'Bhuna Khichuri', category: 'customized', priceBn: '৮০', priceEn: '80' },
    { id: 'cst-20', nameBn: 'ডিম ভুনা', nameEn: 'Egg Bhuna', category: 'customized', priceBn: '৩০', priceEn: '30' },
    { id: 'cst-21', nameBn: 'বেগুন ভাজা', nameEn: 'Eggplant Fry', category: 'customized', priceBn: '২০', priceEn: '20' },
    { id: 'cst-22', nameBn: 'আচার / চাটনি', nameEn: 'Pickle / Chutney', category: 'customized', priceBn: '২০', priceEn: '20' },
    { id: 'cst-23', nameBn: 'পরোটা (২ পিস)', nameEn: 'Paratha (2 Pcs)', category: 'customized', priceBn: '৩০', priceEn: '30' },
    { id: 'cst-24', nameBn: 'ডাল / ভাজি', nameEn: 'Dal / Bhaji', category: 'customized', priceBn: '৩০', priceEn: '30' },
    { id: 'cst-25', nameBn: 'ডিম ভাজি', nameEn: 'Egg Fry', category: 'customized', priceBn: '২০', priceEn: '20' },
    { id: 'cst-26', nameBn: 'স্লাইস ব্রেড (৪ পিস)', nameEn: 'Sliced Bread (4 Pcs)', category: 'customized', priceBn: '৬০', priceEn: '60' },
    { id: 'cst-27', nameBn: 'চিকেন কারি (২ পিস)', nameEn: 'Chicken Curry (2 Pcs)', category: 'customized', priceBn: '১৪০', priceEn: '140' },
    { id: 'cst-28', nameBn: 'চিকেন রোস্ট (১ পিস)', nameEn: 'Chicken Roast (1 Pc)', category: 'customized', priceBn: '১২০', priceEn: '120' },
    { id: 'cst-29', nameBn: 'মাটন কারি (২ পিস)', nameEn: 'Mutton Curry (2 Pcs)', category: 'customized', priceBn: '২২০', priceEn: '220' },
    { id: 'cst-30', nameBn: 'গরুর মাংস (৪ পিস)', nameEn: 'Beef Curry (4 Pcs)', category: 'customized', priceBn: '২০০', priceEn: '200' },
    { id: 'cst-31', nameBn: 'চিকেন টিক্কা', nameEn: 'Chicken Tikka', category: 'customized', priceBn: '৩০', priceEn: '30' },
    { id: 'cst-32', nameBn: 'কাচ্চি বিরিয়ানি', nameEn: 'Kacchi Biryani', category: 'customized', priceBn: '২৭০', priceEn: '270' },
    { id: 'cst-33', nameBn: 'বিফ বিরিয়ানি', nameEn: 'Beef Biryani', category: 'customized', priceBn: '২৫০', priceEn: '250' },
    { id: 'cst-34', nameBn: 'মাটন বিরিয়ানি', nameEn: 'Mutton Biryani', category: 'customized', priceBn: '২৭০', priceEn: '270' },
    { id: 'cst-35', nameBn: 'চিকেন বিরিয়ানি', nameEn: 'Chicken Biryani', category: 'customized', priceBn: '২৩০', priceEn: '230' },

    // --- SALADS (সালাদ) ---
    { id: 'sld-1', nameBn: 'চিকেন ক্যাশিউনাট সালাদ', nameEn: 'Chicken Cashewnut Salad', category: 'salad', priceBn: '৮০', priceEn: '80', tagBn: 'বিশেষ স্বাদ', tagEn: 'Special' },
    { id: 'sld-2', nameBn: 'চিকেন ভেজিটেবল সালাদ', nameEn: 'Chicken Vegetable Salad', category: 'salad', priceBn: '৮০', priceEn: '80' },
    { id: 'sld-3', nameBn: 'গার্লিক ক্যারিবিয়ান সালাদ', nameEn: 'Garlic Caribbean Salad', category: 'salad', priceBn: '৮০', priceEn: '80' },
    { id: 'sld-4', nameBn: 'গার্লিক ওয়েস্টার্ন সালাদ', nameEn: 'Garlic Western Salad', category: 'salad', priceBn: '৮০', priceEn: '80' },
    { id: 'sld-5', nameBn: 'ফ্রুট সালাদ', nameEn: 'Fresh Fruit Salad', category: 'salad', priceBn: '৮০', priceEn: '80', tagBn: 'স্বাস্থ্যকর', tagEn: 'Healthy' },
  ];

  // Filtered menu logic
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemsBn && item.itemsBn.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Handle Submit Order / Inquiry
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম ও ফোন নম্বর প্রদান করুন।' : 'Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'cafe_orders'), {
        itemNameBn: selectedItem?.nameBn || 'সাধারণ ক্যাফে অর্ডার',
        itemNameEn: selectedItem?.nameEn || 'General Cafe Order',
        itemId: selectedItem?.id || 'general',
        priceBn: selectedItem?.priceBn || '0',
        priceEn: selectedItem?.priceEn || '0',
        customerName,
        customerPhone,
        customerAddress,
        quantity,
        orderType,
        specialNote,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setSubmitting(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setOrderModalOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setSpecialNote('');
        setQuantity(1);
      }, 3000);
    } catch (err) {
      console.error('Error saving cafe order:', err);
      setSubmitting(false);
      alert(language === 'bn' ? 'অর্ডার জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to submit order. Please try again.');
    }
  };

  return (
    <div className="space-y-10 w-full animate-fade-in text-left">
      
      {/* 1. HERO BANNER - BSK CAFETERIA & RESTAURANT */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1207] via-[#2A1D0B] to-[#3D2B14] text-white border border-[#B8862A]/20 shadow-xl p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,134,42,0.15),transparent_60%)] z-0" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-[#B8862A]/20 text-[#F0CC7A] px-3.5 py-1.5 rounded-full border border-[#B8862A]/30 text-xs font-semibold tracking-wider uppercase font-mono">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#B8862A]" />
              <span>{language === 'bn' ? (page?.badge_bn || 'বিশ্বসাহিত্য কেন্দ্র ক্যাফেটেরিয়া ও রেস্তোরাঁ') : (page?.badge_en || 'BSK Cafeteria & Restaurant')}</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {language === 'bn' ? (page?.title_bn || 'আলোকিত মানুষের রুচিসম্মত স্বাদের ঠিকানা') : (page?.title_en || 'Refined Dining & Warm Gatherings')}
            </h1>

            <p className="text-sm md:text-base text-stone-300 font-sans leading-relaxed font-light">
              {language === 'bn'
                ? (page?.subtitle_bn || page?.sections?.[0]?.content?.[0] || 'বাংলা সেট মেন্যু, চাইনিজ, খাঁটি বিরিয়ানি, গরম গরম অ্যাপেটাইজার, রিফ্রেশিং স্যুপ, মিষ্টি ডেজার্ট এবং খাস চা-কফির এক অপরূপ সমাহার। বইপ্রেমী ও সংস্কৃতিমনস্ক মানুষদের সুস্বাদু অভিজ্ঞতার বিশ্বস্ত প্রতিষ্ঠান।')
                : (page?.subtitle_en || page?.sections?.[0]?.content_en?.[0] || 'Enjoy our signature Bangla set menus, Chinese delicacies, authentic Biryani, hot appetizers, hearty soups, sweet desserts, and artisan coffees. Serving students, readers, and book lovers daily.')}
            </p>

            {/* Quick Contact & Timings Pills */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-sans">
              <div className="flex items-center space-x-2 bg-black/30 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Clock className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <span>{language === 'bn' ? 'প্রতিদিন: সকাল ৮:০০ - রাত ১০:০০' : 'Daily: 8:00 AM - 10:00 PM'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Phone className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <a href="tel:01761496476" className="hover:text-[#F0CC7A] transition-colors font-mono font-bold">
                  ০১৭৬১-৪৯৬৪৭৬
                </a>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 border border-white/10 px-3.5 py-2 rounded-xl text-stone-200">
                <Mail className="w-4 h-4 text-[#F0CC7A] shrink-0" />
                <a href="mailto:cafeteria@bskbd.org" className="hover:text-[#F0CC7A] transition-colors font-mono">
                  cafeteria@bskbd.org
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setOrderModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 bg-[#B8862A] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-[#9A6D1F] transition-all shadow-md cursor-pointer hover:shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'bn' ? 'অনলাইন অর্ডার / বুকিং করুন' : 'Book Table / Online Order'}</span>
              </button>

              <a
                href="#menu-section"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-3 rounded-xl text-xs md:text-sm font-bold transition-all"
              >
                <Utensils className="w-4 h-4" />
                <span>{language === 'bn' ? 'সম্পূর্ণ ডিজিটাল মেন্যু দেখুন' : 'Explore Digital Menu'}</span>
              </a>
            </div>
          </div>

          {/* Right Hero Image Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm lg:max-w-full w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#B8862A]/40 to-transparent rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#B8862A]/30 shadow-2xl bg-[#1A1207]/60 aspect-[4/3] w-full">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80" 
                  alt="BSK Cafeteria Dining" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[#F0CC7A] font-serif">
                    {language === 'bn' ? '☕ বিশ্বসাহিত্য কেন্দ্র ক্যাফেটেরিয়া ভবন প্রাঙ্গণ' : '☕ BSK Cafeteria Building Ambience'}
                  </p>
                  <p className="text-[10px] text-stone-300 font-sans mt-0.5">
                    {language === 'bn' ? '১৭ ময়মনসিংহ রোড, বাংলামোটর, ঢাকা-১০০০' : '17 Mymensingh Road, Banglamotor, Dhaka-1000'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. STATS & FEATURES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            bnVal: '৪০+', 
            enVal: '40+', 
            bnLbl: 'অ্যাপেটাইজার ও স্ন্যাক্স', 
            enLbl: 'Appetizer Items', 
            icon: Flame, 
            color: 'bg-[#F7EFE5] text-[#8C6212]' 
          },
          { 
            bnVal: '৬ টি', 
            enVal: '6 Sets', 
            bnLbl: 'ঐতিহ্যবাহী বাংলা সেট', 
            enLbl: 'Bangla Set Menus', 
            icon: UtensilsCrossed, 
            color: 'bg-[#E6F4EA] text-[#137333]' 
          },
          { 
            bnVal: '৩৫+', 
            enVal: '35+', 
            bnLbl: 'কাস্টমাইজড এ লা কার্তে', 
            enLbl: 'A La Carte Dishes', 
            icon: ChefHat, 
            color: 'bg-[#E8F0FE] text-[#1A73E8]' 
          },
          { 
            bnVal: '১০০% স্বাস্থ্যকর', 
            enVal: '100% Hygienic', 
            bnLbl: 'তাজা ও খাঁটি উপাদান', 
            enLbl: 'Fresh & Pure Quality', 
            icon: ShieldCheck, 
            color: 'bg-[#FDF2F2] text-[#C5221F]' 
          },
        ].map((stat, sIdx) => {
          const StatIcon = stat.icon;
          return (
            <div 
              key={sIdx}
              className="p-4 bg-white border border-[#E8DDD0] rounded-2xl shadow-xs flex items-center space-x-3 hover:border-[#B8862A] transition-colors"
            >
              <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                <StatIcon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="font-serif text-base md:text-lg font-extrabold text-[#1A1207] block leading-none">
                  {language === 'bn' ? stat.bnVal : stat.enVal}
                </span>
                <span className="text-xs text-stone-600 font-sans mt-0.5 block">
                  {language === 'bn' ? stat.bnLbl : stat.enLbl}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MENU EXPLORER SECTION */}
      <div id="menu-section" className="space-y-6 pt-4">
        
        {/* Section Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DDD0] pb-4">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#1A1207] flex items-center space-x-2">
              <Utensils className="w-6 h-6 text-[#B8862A]" />
              <span>{language === 'bn' ? 'অফিসিয়াল ক্যাফেটেরিয়া মেন্যু তালিকা' : 'Official Cafeteria Menu Catalogue'}</span>
            </h2>
            <p className="text-xs text-stone-600 mt-1 font-sans">
              {language === 'bn'
                ? 'নিচে ক্যাটাগরি অনুযায়ী ফিল্টার অথবা পছন্দের খাবারের নাম দিয়ে সরাসরি খুঁজুন।'
                : 'Filter by categories below or search directly for your favorite item.'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px] md:min-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'খাবারের নাম লিখে খুঁজুন...' : 'Search menu item...'}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDD0] rounded-xl text-xs font-medium text-[#1A1207] focus:outline-none focus:ring-2 focus:ring-[#B8862A]/40 focus:border-[#B8862A] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#FAF7F2] p-2 rounded-2xl border border-[#E8DDD0] max-w-full overflow-x-auto">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#B8862A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-[#B8862A]/10 hover:text-[#B8862A]'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'bn' ? cat.bn : cat.en}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-stone-500 font-sans flex items-center justify-between">
          <span>
            {language === 'bn' 
              ? `মোট ${filteredItems.length} টি খাবার প্রদর্শিত হচ্ছে` 
              : `Showing ${filteredItems.length} menu items`}
          </span>
          {activeCategory !== 'all' && (
            <button 
              onClick={() => setActiveCategory('all')}
              className="text-[#B8862A] hover:underline font-bold"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View All'}
            </button>
          )}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8DDD0] rounded-2xl text-stone-500 space-y-2">
            <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-medium">
              {language === 'bn' ? 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো খাবার পাওয়া যায়নি।' : 'No items match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-[#E8DDD0] rounded-2xl p-4 flex flex-col justify-between hover:border-[#B8862A] hover:shadow-md transition-all duration-200 group"
              >
                <div className="space-y-3">
                  
                  {/* Item Header & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#1A1207] group-hover:text-[#B8862A] transition-colors leading-snug">
                        {language === 'bn' ? item.nameBn : item.nameEn}
                      </h3>
                      {item.tagBn && (
                        <span className="inline-block mt-1 bg-[#FAF2E6] text-[#8C6212] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#B8862A]/20">
                          {language === 'bn' ? item.tagBn : item.tagEn}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-base font-extrabold text-[#B8862A] block">
                        ৳{language === 'bn' ? item.priceBn : item.priceEn}/-
                      </span>
                    </div>
                  </div>

                  {/* Details / Included items for set menus */}
                  {item.itemsBn && (
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-100 space-y-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block font-mono">
                        {language === 'bn' ? 'সেট মেন্যুতে অন্তর্ভুক্ত:' : 'Includes:'}
                      </span>
                      <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside font-sans">
                        {(language === 'bn' ? item.itemsBn : item.itemsEn || item.itemsBn).map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.detailsBn && (
                    <p className="text-xs text-stone-600 font-sans leading-relaxed">
                      {language === 'bn' ? item.detailsBn : item.detailsEn}
                    </p>
                  )}

                </div>

                {/* Quick Order Button */}
                <div className="pt-3.5 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono uppercase">
                    BSK CAFETERIA
                  </span>

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setOrderModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 bg-[#B8862A]/10 text-[#8C6212] hover:bg-[#B8862A] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. CAFETERIA VENUE & CONTACT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-6 border-t border-[#E8DDD0]">
        
        {/* Contact Info Card */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1207] border-b border-stone-100 pb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#B8862A]" />
              <span>{language === 'bn' ? 'ক্যাফেটেরিয়া অবস্থান ও যোগাযোগ' : 'Location & Contact Details'}</span>
            </h3>

            <div className="space-y-3.5 text-xs text-stone-700 font-sans leading-relaxed">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1A1207] font-semibold">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</strong>
                  <span>{language === 'bn' ? 'বিশ্বসাহিত্য কেন্দ্র ভবন, ১৭ ময়মনসিংহ রোড, বাংলামোটর, ঢাকা-১০০০' : 'Bishwo Shahitto Kendro, 17 Mymensingh Road, Banglamotor, Dhaka-1000'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1A1207] font-semibold">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</strong>
                  <a href="tel:01761496476" className="text-[#B8862A] font-bold font-mono hover:underline">
                    01761 49 64 76 / 01761496476
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-[#B8862A] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1A1207] font-semibold">{language === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</strong>
                  <a href="mailto:cafeteria@bskbd.org" className="text-[#B8862A] font-mono hover:underline">
                    cafeteria@bskbd.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8F3] border border-[#E8DDD0] p-3 rounded-xl text-[11px] text-stone-600 flex items-center space-x-2 font-sans">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-ping shrink-0" />
            <span>{language === 'bn' ? 'অনুষ্ঠান বা ক্যাটারিং বুকিংয়ের জন্য পূর্বে যোগাযোগের বিনীত অনুরোধ।' : 'Advance booking recommended for catering & group events.'}</span>
          </div>
        </div>

        {/* Embedded Map / Ambience Card */}
        <div className="bg-[#1A1207] border border-[#B8862A]/20 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <span className="text-[10px] font-mono text-[#F0CC7A] uppercase tracking-wider block">
              {language === 'bn' ? 'মনোরম পরিবেশ' : 'Aesthetic Environment'}
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              {language === 'bn' ? 'আলোকিত আড্ডা ও স্বাদের মিলনমেলা' : 'Intellectual Adda & Gourmet Treats'}
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed font-light">
              {language === 'bn'
                ? 'বিশ্বসাহিত্য কেন্দ্র ভবনের ছায়াসুনিবিড় শান্ত মনোরম পরিবেশে প্রতিদিন বন্ধু-বান্ধব, পরিবার ও শুভানুধ্যায়ীদের নিয়ে উপভোগ করুন বিশেষ চা, কফি এবং খাঁটি সুস্বাদু খাবার।'
                : 'Experience a serene aesthetic ambiance where readers, writers, and artists gather daily over freshly brewed coffee, traditional snacks, and hearty set meals.'}
            </p>
          </div>

          <div className="pt-2 z-10">
            <button
              onClick={() => {
                setSelectedItem(null);
                setOrderModalOpen(true);
              }}
              className="w-full bg-[#B8862A] hover:bg-[#9A6D1F] text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-md"
            >
              {language === 'bn' ? 'বুকিং বা খাবারের বিস্তারিত তথ্য জানাতে ক্লিক করুন' : 'Click to Request Booking or Information'}
            </button>
          </div>
        </div>

      </div>

      {/* 5. ORDER / BOOKING MODAL */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DDD0] rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setOrderModalOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="inline-flex items-center space-x-1.5 text-[#B8862A] text-xs font-bold font-mono uppercase">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ক্যাফেটেরিয়া অর্ডার / বুকিং' : 'Cafeteria Order / Booking'}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1207]">
                {selectedItem 
                  ? (language === 'bn' ? selectedItem.nameBn : selectedItem.nameEn)
                  : (language === 'bn' ? 'সাধারণ বুকিং বা টেবিল রিজার্ভেশন' : 'General Table Reservation / Inquiry')}
              </h3>
              {selectedItem && (
                <span className="font-mono text-sm font-extrabold text-[#B8862A] block">
                  মূল্য: ৳{language === 'bn' ? selectedItem.priceBn : selectedItem.priceEn}/-
                </span>
              )}
            </div>

            {orderSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2 font-sans animate-fade-in">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">
                  {language === 'bn' ? 'আপনার অনুরোধটি সফলভাবে জমা হয়েছে!' : 'Your order request submitted successfully!'}
                </h4>
                <p className="text-xs text-emerald-700">
                  {language === 'bn'
                    ? 'আমাদের ক্যাফেটেরিয়া প্রতিনিধি শীঘ্রই আপনার সাথে ফোনে নিশ্চিত করবেন।'
                    : 'Our cafeteria staff will call you shortly to confirm details.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs font-sans">
                
                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700">
                    {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <input 
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ রফিকুল ইসলাম' : 'e.g. Rafiqul Islam'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#B8862A] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-stone-700">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input 
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#B8862A] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-stone-700">
                      {language === 'bn' ? 'সেবা নির্বাচন করুন' : 'Order Type'}
                    </label>
                    <select
                      value={orderType}
                      onChange={(e: any) => setOrderType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#B8862A] focus:outline-none"
                    >
                      <option value="dine-in">{language === 'bn' ? 'ডাইন-ইন (ক্যাফেতে বসে খাওয়া)' : 'Dine-In'}</option>
                      <option value="takeaway">{language === 'bn' ? 'টেক-অ্যাওয়ে (পার্সেল)' : 'Takeaway / Parcel'}</option>
                      <option value="catering">{language === 'bn' ? 'ইভেন্ট / ক্যাটারিং রিজার্ভেশন' : 'Event / Catering Booking'}</option>
                    </select>
                  </div>
                </div>

                {selectedItem && (
                  <div className="space-y-1">
                    <label className="block font-semibold text-stone-700">
                      {language === 'bn' ? 'পরিমাণ (জন / প্লেট)' : 'Quantity'}
                    </label>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-[#1A1207]">{quantity}</span>
                      <button 
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 font-bold flex items-center justify-center hover:bg-stone-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700">
                    {language === 'bn' ? 'বিশেষ বার্তা বা ঠিকানা (ঐচ্ছিক)' : 'Special Request or Address (Optional)'}
                  </label>
                  <textarea 
                    rows={2}
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder={language === 'bn' ? 'কোনো বিশেষ পছন্দ বা আনুমানিক সময়...' : 'Any special notes or timing...'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#B8862A] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#B8862A] hover:bg-[#9A6D1F] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {submitting
                        ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                        : (language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order')}
                    </span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
