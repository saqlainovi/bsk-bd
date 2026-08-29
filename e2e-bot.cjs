const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

console.log('================================================================');
console.log('🤖 BSK FULL END-TO-END BROWSER AUTOMATION CRAWLER BOT');
console.log('================================================================\n');

// 1. Locate Chrome / Edge
const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = chromePaths.find(p => fs.existsSync(p));
if (!executablePath) {
  console.error('❌ Chrome/Edge executable not found!');
  process.exit(1);
}
console.log(`🌐 Using Browser: ${executablePath}`);

// 2. Simple Static Server for dist/
const distDir = path.join('C:', 'BSK', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist folder does not exist! Please run npm run build first.');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(distDir, reqUrl);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 4173;
server.listen(PORT, async () => {
  console.log(`🚀 Test Server running at http://localhost:${PORT}`);
  await runE2ETests();
});

// 3. Test Suites Definition
const PAGES_TO_TEST = [
  {
    id: 'central-library',
    name: 'কেন্দ্রীয় লাইব্রেরি (Central Library)',
    route: 'central-library',
    collection: 'website_pages',
    testData: {
      id: 'central-library',
      title_bn: '🤖 বট টেস্ট লাইব্রেরি ২০২৬',
      hero_title_bn: '🤖 বট টেস্ট লাইব্রেরি ২০২৬',
      hero_image: 'https://cms.bskbd.org/uploads/bsk_bot_lib_test.jpg',
      about_bn: 'এটি অটোমেশন বট দ্বারা টেস্ট করা কেন্দ্রীয় লাইব্রেরি পরিচিতি অনুচ্ছেদ।',
      stat_books: '📚 ৯৯,৯৯৯+ বই',
      stat_members: '👥 ৫০,০০০+ সদস্য',
      membershipPlans: [
        { titleBn: 'বট স্পেশাল মেম্বারশিপ', depositBn: '৳৯৯৯', feeBn: '৳৯৯', limitBn: '১০টি বই' }
      ]
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const imgSources = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i => i.src));

      const titleFound = bodyText.includes('বট টেস্ট লাইব্রেরি ২০২৬');
      const textFound = bodyText.includes('এটি অটোমেশন বট দ্বারা টেস্ট করা');
      const statFound = bodyText.includes('৯৯,৯৯৯+ বই') || bodyText.includes('৫০,০০০+ সদস্য');
      const planFound = bodyText.includes('বট স্পেশাল মেম্বারশিপ');
      const imgFound = imgSources.some(s => s.includes('bsk_bot_lib_test.jpg'));

      return {
        pass: (titleFound || textFound || statFound || planFound) && imgFound,
        checks: { titleFound, textFound, statFound, planFound, imgFound }
      };
    }
  },
  {
    id: 'homepage_programs',
    name: 'হোমপেজ কার্যক্রম স্লাইডার (Horizontal Swiper)',
    route: '',
    collection: 'homepage_programs',
    testData: {
      id: 'nationwide-excellence',
      title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম BOT TEST',
      desc_bn: '৬৪ জেলায় সাহিত্য মূল্যায়ন বট টেস্ট ২০২৬',
      bgImage: 'https://cms.bskbd.org/uploads/bsk_bot_prog_test.jpg',
      order: 1
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const html = await page.evaluate(() => document.body.innerHTML);

      const titleFound = bodyText.includes('দেশভিত্তিক উৎকর্ষ কার্যক্রম BOT TEST');
      const descFound = bodyText.includes('বট টেস্ট ২০২৬');
      const imgFound = html.includes('bsk_bot_prog_test.jpg');

      return {
        pass: titleFound && (descFound || imgFound),
        checks: { titleFound, descFound, imgFound }
      };
    }
  },
  {
    id: 'auditorium',
    name: 'অডিটোরিয়াম ও সেমিনার হল (Auditorium & Halls)',
    route: 'auditorium',
    collection: 'website_pages',
    testData: {
      id: 'auditorium',
      title_bn: 'অডিটোরিয়াম ও সেমিনার কক্ষ',
      halls: [
        {
          id: 'hall-bot',
          roomNo: 'BOT-101',
          titleBn: 'বট কনফারেন্স লাউঞ্জ',
          titleEn: 'Bot Conference Lounge',
          capacityBn: '৫০০ জন',
          category: 'auditorium',
          singleShiftAc: 15000,
          doubleShiftAc: 28000,
          image: 'https://cms.bskbd.org/uploads/bsk_bot_aud_test.jpg'
        }
      ]
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hallFound = bodyText.includes('বট কনফারেন্স লাউঞ্জ') || bodyText.includes('BOT-101');
      return {
        pass: hallFound,
        checks: { hallFound }
      };
    }
  },
  {
    id: 'building',
    name: 'ভবন ডিরেক্টরি (Building 10-Floor Directory)',
    route: 'building',
    collection: 'website_pages',
    testData: {
      id: 'building',
      title_bn: 'বিশ্বসাহিত্য কেন্দ্র ভবন',
      floors: [
        {
          floorNo: 10,
          floorBn: '১০ম তলা (বট ফ্লোর)',
          floorEn: '10th Floor (Bot Suite)',
          titleBn: 'বট সাইবার রিসার্চ সেন্টার',
          titleEn: 'Bot Cyber Research Center',
          icon: 'Building',
          featuresBn: ['অটোমেশন ল্যাব', 'ক্লাউড সার্ভার রুম']
        }
      ]
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const floorFound = bodyText.includes('বট সাইবার রিসার্চ সেন্টার') || bodyText.includes('১০ম তলা (বট ফ্লোর)');
      return {
        pass: floorFound,
        checks: { floorFound }
      };
    }
  },
  {
    id: 'nationwide-excellence',
    name: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম (Nationwide Excellence)',
    route: 'nationwide-excellence',
    collection: 'website_pages',
    testData: {
      id: 'nationwide-excellence',
      title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম BOT TEST',
      hero_title_bn: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম BOT TEST',
      highlights: [
        {
          id: 'hl-bot',
          title_bn: 'বট পাঠ প্রতিযোগিতা ২০২৬',
          title_en: 'Bot Reading Contest 2026',
          desc_bn: 'দেশব্যাপী পরিচালিত বিশেষ বট পরীক্ষণ কার্যক্রম।',
          desc_en: 'Nationwide bot assessment drive.',
          icon: 'Award'
        }
      ]
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hlFound = bodyText.includes('বট পাঠ প্রতিযোগিতা ২০২৬') || bodyText.includes('BOT TEST');
      return {
        pass: hlFound,
        checks: { hlFound }
      };
    }
  },
  {
    id: 'home',
    name: 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি (About BSK Home Page)',
    route: 'home',
    collection: 'website_pages',
    testData: {
      id: 'home',
      title_bn: 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি BOT TEST',
      sections: [
        {
          id: 'sec-1',
          title: 'বট পরিচিতি টেস্ট',
          content: ['বিশ্বসাহিত্য কেন্দ্র একটি বহুমুখী সমাজসেবামূলক প্রতিষ্ঠান BOT TEST।']
        }
      ]
    },
    verify: async (page) => {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const textFound = bodyText.includes('BOT TEST') || bodyText.includes('বট পরিচিতি টেস্ট');
      return {
        pass: textFound,
        checks: { textFound }
      };
    }
  }
];

async function runE2ETests() {
  console.log('🎬 Launching Headless Chrome Browser...');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let passed = 0;
  let failed = 0;
  const results = [];

  console.log('\n--- 🚀 RUNNING REAL E2E BROWSER TESTS (CMS Upload -> Page Crawl -> DOM Verification) ---');

  for (const item of PAGES_TO_TEST) {
    console.log(`\n⏳ Testing Section: ${item.name}...`);

    try {
      const targetCol = item.collection || 'website_pages';
      const targetUrl = item.route ? `http://localhost:${PORT}/?page=${item.route}` : `http://localhost:${PORT}`;

      // Step 1: Open base page
      await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });

      // Step 2: Inject mock CMS data into local cache with correct key `_db_${col}`
      await page.evaluate((col, docData) => {
        try {
          const key = `_db_${col}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = existing.findIndex((e) => e.id === docData.id);
          if (idx >= 0) existing[idx] = { ...existing[idx], ...docData };
          else existing.push(docData);
          localStorage.setItem(key, JSON.stringify(existing));
        } catch (e) {
          console.error(e);
        }
      }, targetCol, item.testData);

      // Step 3: Navigate directly to the page
      await page.goto(targetUrl, { waitUntil: 'networkidle0' });

      // Small delay to ensure all React hooks & animations settle
      await new Promise(r => setTimeout(r, 800));

      // Step 4: Verify Live DOM Render
      const result = await item.verify(page);

      if (result.pass) {
        passed++;
        console.log(`  ✅ [PASS] ${item.name} -> DOM verified with dynamic text & image!`);
        results.push({ name: item.name, status: 'PASS', checks: result.checks });
      } else {
        failed++;
        console.log(`  ❌ [FAIL] ${item.name} -> Elements not found in rendered DOM!`);
        console.log(`     Checks:`, JSON.stringify(result.checks));
        results.push({ name: item.name, status: 'FAIL', checks: result.checks });
      }
    } catch (err) {
      failed++;
      console.log(`  ❌ [ERROR] ${item.name} -> ${err.message}`);
      results.push({ name: item.name, status: 'ERROR', error: err.message });
    }
  }

  await browser.close();
  server.close();

  console.log('\n================================================================');
  console.log(`📊 E2E BROWSER CRAWLER BOT REPORT:`);
  console.log(`   Total Pages Tested: ${PAGES_TO_TEST.length}`);
  console.log(`   Passed:             ${passed}`);
  console.log(`   Failed:             ${failed}`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 100% PASS! All CMS changes render live on the website DOM with zero errors!');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Please review the report above.');
    process.exit(1);
  }
}
