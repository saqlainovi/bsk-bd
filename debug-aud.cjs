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

server.listen(4175, async () => {
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
  
  await page.goto('http://localhost:4175', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const testData = {
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
    };
    localStorage.setItem('_db_website_pages', JSON.stringify([testData]));
  });

  await page.goto('http://localhost:4175/?page=auditorium', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await browser.close();
  server.close();
  process.exit(0);
});
