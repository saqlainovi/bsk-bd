# 🚀 cPanel-এ Directus CMS সেটআপ গাইড (Bishwo Shahitto Kendro)

এই ফোল্ডারের মাধ্যমে আপনি আপনার cPanel-এ মাত্র ৫ মিনিটে **Directus Headless CMS** চালু করতে পারবেন।

---

## 📋 ধাপ ১: সাবডোমেন তৈরি করুন
1. cPanel ড্যাশবোর্ডে গিয়ে **Domains** বা **Subdomains**-এ ক্লিক করুন।
2. একটি সাবডোমেন তৈরি করুন, যেমন: `cms.bskbd.org`
3. সাবডোমেন ডিরেক্টরি দিন: `cms.bskbd.org` অথবা `directus`

---

## 📋 ধাপ ২: ফাইল আপলোড করুন
1. cPanel-এর **File Manager**-এ যান।
2. সাবডোমেনের ফোল্ডারে (`cms.bskbd.org`) গিয়ে এই `directus-cpanel` ফোল্ডারের সব ফাইল আপলোড করুন:
   - `package.json`
   - `server.js`
   - `.env.example` ফাইলটিকে রিনেম করে `.env` বানিয়ে নিন।
   - একটি খালি `uploads` ফোল্ডার তৈরি করুন।

---

## 📋 ধাপ ৩: cPanel "Setup Node.js App" কনফিগারেশন
1. cPanel-এ গিয়ে সার্চ করুন **"Setup Node.js App"**।
2. **Create Application** বাটনে ক্লিক করুন:
   - **Node.js version:** `18.x` বা `20.x` (বা লেটেস্ট এলটিএস)
   - **Application mode:** `Production`
   - **Application root:** `cms.bskbd.org` (আপনার ডিরেক্টরি)
   - **Application URL:** `cms.bskbd.org` (ড্রপডাউন থেকে সিলেক্ট করুন)
   - **Application startup file:** `server.js`
3. **Create** বাটনে ক্লিক করুন।

---

## 📋 ধাপ ৪: ডিপেনডেন্সি ইনস্টল ও বুটস্ট্র্যাপ
1. Node.js App ম্যানেজারে গিয়ে **"Run NPM Install"** বাটনে ক্লিক করুন।
2. ইনস্টল শেষ হলে cPanel **Terminal** অথবা SSH ওপেন করুন এবং প্রজেক্ট ফোল্ডারে ঢুকুন:
   ```bash
   cd ~/cms.bskbd.org
   npx directus bootstrap
   ```
   *(এটি স্বয়ংক্রিয়ভাবে আপনার `bskbd_new` ডাটাবেজে Directus-এর কোর টেবিল ও এডমিন অ্যাকাউন্ট তৈরি করবে)*
3. Node.js App পেইজে এসে **"Restart"** বাটনে ক্লিক করুন।

---

## 📋 ধাপ ৫: Directus প্যানেলে প্রবেশ
- ব্রাউজারে যান: `https://cms.bskbd.org`
- **Email:** `admin@bskbd.org`
- **Password:** `bsk@2026`

লগইন করার সাথে সাথেই আপনি আপনার সব ডাটাবেজ টেবিল এবং সুন্দর ড্র্যাগ-অ্যান্ড-ড্রপ CMS প্যানেল দেখতে পাবেন!

---

## 📋 ধাপ ৬: React অ্যাপের সাথে কানেক্ট করা
React প্রজেক্টের `.env` ফাইলে নিচের দুটি লাইন যুক্ত করুন:
```env
VITE_DIRECTUS_URL="https://cms.bskbd.org"
VITE_DIRECTUS_TOKEN="আপনার_Directus_Admin_Static_Token"
```
এখন আপনার ওয়েবসাইট স্বয়ংক্রিয়ভাবে Directus CMS থেকে সব ডেটা ও ইমেজ লোড করবে!
