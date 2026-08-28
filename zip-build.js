import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const distDir = path.join(process.cwd(), 'dist');
const publicDir = path.join(process.cwd(), 'public');

if (fs.existsSync(distDir)) {
  // Guarantee special cPanel server files exist in dist/
  const filesToEnsure = ['.htaccess', '404.html', '_redirects', 'api.php'];
  filesToEnsure.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} to dist/`);
    }
  });

  // Read current version
  const versionFilePath = path.join(process.cwd(), 'version.json');
  let currentVersion = 10;
  if (fs.existsSync(versionFilePath)) {
    try {
      const vData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      if (typeof vData.version === 'number') {
        currentVersion = vData.version;
      }
    } catch (e) {}
  }

  const ver = currentVersion;
  console.log(`\n========================================`);
  console.log(`Packaging Clean Version: v${ver}`);
  console.log(`========================================\n`);

  // Clean old zip files from root, dist, and public
  [process.cwd(), distDir, publicDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.zip')) {
          try {
            fs.unlinkSync(path.join(dir, file));
          } catch (_) {}
        }
      });
    }
  });

  // 1. Website Build Zip (for new.bskbd.org)
  const websiteZip = new AdmZip();
  websiteZip.addLocalFolder(distDir);
  const websiteZipPath = path.join(process.cwd(), `website-v${ver}.zip`);
  websiteZip.writeZip(websiteZipPath);
  console.log(`✓ Successfully packed: website-v${ver}.zip (for new.bskbd.org)`);

  // 2. Standalone CMS Dist with embedded CMS mode (for cms.bskbd.org)
  const cmsDistDir = path.join(process.cwd(), 'dist-cms-temp');
  if (fs.existsSync(cmsDistDir)) {
    fs.rmSync(cmsDistDir, { recursive: true, force: true });
  }
  fs.cpSync(distDir, cmsDistDir, { recursive: true });

  const cmsIndexHtmlPath = path.join(cmsDistDir, 'index.html');
  if (fs.existsSync(cmsIndexHtmlPath)) {
    let indexHtmlContent = fs.readFileSync(cmsIndexHtmlPath, 'utf8');
    // Inject global CMS flag directly into <head>
    const cmsScript = `<script>window.__BSK_CMS_MODE__=true;window.__IS_CMS_ONLY__=true;</script>`;
    indexHtmlContent = indexHtmlContent.replace('<head>', `<head>${cmsScript}`);
    indexHtmlContent = indexHtmlContent.replace(
      /<title>.*?<\/title>/i,
      `<title>বিশ্বসাহিত্য কেন্দ্র — CMS অ্যাডমিন পোর্টাল</title>`
    );
    fs.writeFileSync(cmsIndexHtmlPath, indexHtmlContent, 'utf8');
  }

  const cmsZip = new AdmZip();
  cmsZip.addLocalFolder(cmsDistDir);
  const cmsZipPath = path.join(process.cwd(), `cms-v${ver}.zip`);
  cmsZip.writeZip(cmsZipPath);
  console.log(`✓ Successfully packed: cms-v${ver}.zip (for cms.bskbd.org)`);

  // 3. Complete Project Unified Build Zip
  const universalZip = new AdmZip();
  universalZip.addLocalFolder(distDir);
  const universalZipPath = path.join(process.cwd(), `bskbd-v${ver}.zip`);
  universalZip.writeZip(universalZipPath);
  console.log(`✓ Successfully packed: bskbd-v${ver}.zip (Complete unified build)`);

  // Copy clean zips to dist/ and public/
  const finalZips = [`website-v${ver}.zip`, `cms-v${ver}.zip`, `bskbd-v${ver}.zip`];
  finalZips.forEach(zipName => {
    const srcPath = path.join(process.cwd(), zipName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(publicDir, zipName));
      fs.copyFileSync(srcPath, path.join(distDir, zipName));
    }
  });

  // Clean up temp folder
  fs.rmSync(cmsDistDir, { recursive: true, force: true });
  console.log(`\nAll v${ver} release packages are ready!`);
} else {
  console.error('dist/ folder does not exist. Run build first!');
  process.exit(1);
}

