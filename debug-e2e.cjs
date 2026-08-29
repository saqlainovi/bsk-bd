const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const distDir = path.join('C:', 'BSK', 'dist');
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  let filePath = path.join(distDir, reqUrl);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(distDir, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4174, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('pageerror', err => console.log('🔴 PAGE ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('🔴 CONSOLE ERROR:', msg.text());
  });
  
  await page.goto('http://localhost:4174', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const testData = {
      id: 'central-library',
      title_bn: '🤖 বট টেস্ট লাইব্রেরি ২০২৬',
      hero_title_bn: '🤖 বট টেস্ট লাইব্রেরি ২০২৬',
      hero_image: 'https://cms.bskbd.org/uploads/bsk_bot_lib_test.jpg',
      about_bn: 'এটি অটোমেশন বট দ্বারা টেস্ট করা কেন্দ্রীয় লাইব্রেরি পরিচিতি অনুচ্ছেদ।'
    };
    localStorage.setItem('_db_website_pages', JSON.stringify([testData]));
  });

  await page.goto('http://localhost:4174/?page=central-library', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await browser.close();
  server.close();
  process.exit(0);
});
