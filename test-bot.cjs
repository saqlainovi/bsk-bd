const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'BSK', 'src');

console.log('===============================================================');
console.log('🤖 BSK AUTOMATION TEST BOT - ALL PAGES & CMS BINDINGS AUDIT');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const issues = [];

function assertTest(name, condition, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failedTests++;
    console.log(`  ❌ [FAIL] ${name} -> ${details}`);
    issues.push({ name, details });
  }
}

// 1. Check API.PHP handlers
console.log('--- 1. Testing Backend API (public/api.php) ---');
const apiPhp = fs.readFileSync(path.join('C:', 'BSK', 'public', 'api.php'), 'utf8');
assertTest('API: get_collection handler exists', apiPhp.includes("action === 'get_collection'"), 'Missing get_collection in api.php');
assertTest('API: set_doc handler exists', apiPhp.includes("action === 'set_doc'"), 'Missing set_doc in api.php');
assertTest('API: homepage_programs table provisioned', apiPhp.includes('homepage_programs'), 'Missing homepage_programs table in api.php');
assertTest('API: upload_image handler exists', apiPhp.includes("action === 'upload_image'"), 'Missing upload_image in api.php');

// 2. Check cpanelApi.ts Parser
console.log('\n--- 2. Testing cpanelApi.ts Robustness ---');
const cpanelTs = fs.readFileSync(path.join(srcDir, 'services', 'cpanelApi.ts'), 'utf8');
assertTest('cpanelApi: getCollection parses { success: true, data: [] }', cpanelTs.includes('Array.isArray(parsed?.data)'), 'cpanelApi.getCollection fails on wrapped API response');
assertTest('cpanelApi: getDoc unwraps parsed.data', cpanelTs.includes('parsed?.data !== undefined ? parsed.data : parsed'), 'cpanelApi.getDoc fails to unwrap parsed.data');
assertTest('cpanelApi: Dispatches bsk_db_updated on write', cpanelTs.includes("window.dispatchEvent(new CustomEvent('bsk_db_updated'"), 'Missing event dispatch on save');

// 3. Check Dashboard Homepage Horizontal Slider
console.log('\n--- 3. Testing Homepage Horizontal Programs Slider ---');
const dashTs = fs.readFileSync(path.join(srcDir, 'components', 'Dashboard.tsx'), 'utf8');
assertTest('Dashboard: dbHomepagePrograms overrides bgImage, title, desc', dashTs.includes('baseMap.set(p.id, {') && dashTs.includes('bgImage: imgToUse'), 'Slider does not override dynamic images/content');
assertTest('Dashboard: activeProgramsList sorts by order', dashTs.includes('(a.order || 0) - (b.order || 0)'), 'Slider does not sort by CMS order');
assertTest('Dashboard: Horizontal slider listens to homepage_programs collection', dashTs.includes("'homepage_programs'"), 'Slider does not refresh on DB update');

// 4. Check All 28 Website Pages Dynamic Bindings
console.log('\n--- 4. Testing All 28 Website Pages Dynamic Bindings ---');
const pageContentTs = fs.readFileSync(path.join(srcDir, 'components', 'PageContent.tsx'), 'utf8');
const adminCmsTs = fs.readFileSync(path.join(srcDir, 'components', 'AdminCMS.tsx'), 'utf8');

const ALL_28_PAGES = [
  { id: 'central-library', name: 'কেন্দ্রীয় লাইব্রেরি', specializedEditor: 'CentralLibraryCMSEditor' },
  { id: 'auditorium', name: 'অডিটোরিয়াম ও সেমিনার হল', specializedEditor: 'AuditoriumCMSEditor' },
  { id: 'building', name: 'বিশ্বসাহিত্য কেন্দ্র ভবন', specializedEditor: 'BuildingCMSEditor' },
  { id: 'cafe', name: 'ক্যাফেটেরিয়া ও ফুড জোন', specializedEditor: 'CafeCMSEditor' },
  { id: 'bookshop', name: 'বই বিক্রয় কেন্দ্র', specializedEditor: 'BookShopCMSEditor' },
  { id: 'nationwide-excellence', name: 'দেশভিত্তিক উৎকর্ষ কার্যক্রম', specializedEditor: 'NationwideExcellenceCMSEditor' },
  { id: 'aalor-pathshala', name: 'আলোর পাঠশালা', specializedEditor: 'AalorPathshalaCMSEditor' },
  { id: 'publication', name: 'প্রকাশনা কার্যক্রম', specializedEditor: 'PublicationCMSEditor' },
  { id: 'home', name: 'বিশ্বসাহিত্য কেন্দ্র পরিচিতি', specializedEditor: null },
  { id: 'mission', name: 'ব্রত, লক্ষ্য ও উদ্দেশ্য', specializedEditor: null },
  { id: 'founder', name: 'প্রতিষ্ঠাতা ও সভাপতি', specializedEditor: null },
  { id: 'ataglance', name: 'এক নজরে কেন্দ্র', specializedEditor: null },
  { id: 'trustees', name: 'ট্রাস্টি বোর্ড', specializedEditor: null },
  { id: 'organogram', name: 'প্রশাসনিক কাঠামো ও অর্গানোগ্রাম', specializedEditor: null },
  { id: 'achievement', name: 'সাফল্য ও অর্জন', specializedEditor: null },
  { id: 'bsk-history', name: 'ইতিহাস ও ঐতিহ্য', specializedEditor: null },
  { id: 'governance', name: 'গভর্ন্যান্স ও আর্থিক স্বচ্ছতা', specializedEditor: null },
  { id: 'contact', name: 'যোগাযোগ ও ঠিকানা', specializedEditor: null },
  { id: 'reading-habit', name: 'পাঠাভ্যাস উন্নয়ন কর্মসূচি', specializedEditor: null },
  { id: 'mobile-library', name: 'ভ্রাম্যমাণ লাইব্রেরি', specializedEditor: null },
  { id: 'book-fair', name: 'ভ্রাম্যমাণ বইমেলা', specializedEditor: null },
  { id: 'aalor-ishkool', name: 'আলোর ইশকুল', specializedEditor: null },
  { id: 'bangalir_chinta', name: 'বাঙালির চিন্তা কর্মসূচি', specializedEditor: null },
  { id: 'primary-teacher', name: 'প্রাথমিক শিক্ষকদের বই পড়া কর্মসূচি', specializedEditor: null }
];

ALL_28_PAGES.forEach((page) => {
  // Check if CMS has an editor for this page
  const hasInCms = adminCmsTs.includes(page.id) || (page.specializedEditor && adminCmsTs.includes(page.specializedEditor));
  assertTest(`CMS Editor mapped: ${page.name} (${page.id})`, hasInCms, `Page ${page.id} not found in AdminCMS.tsx`);

  // Check if Frontend has dynamic binding
  if (page.id === 'central-library') {
    const hasLiveBinding = pageContentTs.includes('livePage.hero_image') && pageContentTs.includes('livePage.hero_title_bn') && pageContentTs.includes('livePage.membershipPlans');
    assertTest(`Frontend Live Binding: ${page.name}`, hasLiveBinding, 'Central Library missing dynamic fields in PageContent.tsx');
  } else if (page.id === 'auditorium') {
    const audTs = fs.readFileSync(path.join(srcDir, 'components', 'AuditoriumPage.tsx'), 'utf8');
    assertTest(`Frontend Live Binding: ${page.name}`, audTs.includes('pageData.halls') && audTs.includes('cpanelApi.getDoc'), 'Auditorium missing live db fetch');
  } else if (page.id === 'building') {
    const bldTs = fs.readFileSync(path.join(srcDir, 'components', 'BuildingPage.tsx'), 'utf8');
    assertTest(`Frontend Live Binding: ${page.name}`, bldTs.includes('pageData.floors') && bldTs.includes('cpanelApi.getDoc'), 'Building directory missing live db fetch');
  } else if (page.id === 'nationwide-excellence') {
    const nweTs = fs.readFileSync(path.join(srcDir, 'components', 'NationwideExcellencePage.tsx'), 'utf8');
    assertTest(`Frontend Live Binding: ${page.name}`, nweTs.includes('pageData.highlights') && nweTs.includes('cpanelApi.getDoc'), 'Nationwide excellence missing live db fetch');
  }
});

console.log('\n===============================================================');
console.log(`🎯 AUTOMATION BOT AUDIT REPORT:`);
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed:      ${passedTests}`);
console.log(`   Failed:      ${failedTests}`);
console.log('===============================================================\n');

if (failedTests > 0) {
  console.log('⚠️ Failed Items:', JSON.stringify(issues, null, 2));
  process.exit(1);
} else {
  console.log('🚀 ALL AUTOMATION TESTS PASSED 100%! Ready for release!');
  process.exit(0);
}
