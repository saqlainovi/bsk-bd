import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const distDir = path.join(process.cwd(), 'dist');
const publicDir = path.join(process.cwd(), 'public');
const universalZipPath = path.join(process.cwd(), 'build.zip');
const websiteZipPath = path.join(process.cwd(), 'website-build.zip');
const cmsBuildZipPath = path.join(process.cwd(), 'cms-build.zip');
const cmsZipPath = path.join(process.cwd(), 'cms.zip');

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

  // Remove any stray zip files inside distDir before packing
  fs.readdirSync(distDir).forEach(file => {
    if (file.endsWith('.zip')) {
      fs.unlinkSync(path.join(distDir, file));
    }
  });

  // 1. Universal Build Zip
  const universalZip = new AdmZip();
  universalZip.addLocalFolder(distDir);
  universalZip.writeZip(universalZipPath);
  console.log(`Successfully packed build.zip! Path: ${universalZipPath}`);

  // 2. Website Build Zip (for new.bskbd.org)
  const websiteZip = new AdmZip();
  websiteZip.addLocalFolder(distDir);
  websiteZip.writeZip(websiteZipPath);
  console.log(`Successfully packed website-build.zip (for new.bskbd.org)! Path: ${websiteZipPath}`);

  // 3. Create Dedicated Standalone CMS Dist with embedded CMS mode
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

  // Pack cms-build.zip and cms.zip
  const cmsZip = new AdmZip();
  cmsZip.addLocalFolder(cmsDistDir);
  cmsZip.writeZip(cmsBuildZipPath);
  console.log(`Successfully packed cms-build.zip (for cms.bskbd.org)! Path: ${cmsBuildZipPath}`);

  const cmsDirectZip = new AdmZip();
  cmsDirectZip.addLocalFolder(cmsDistDir);
  cmsDirectZip.writeZip(cmsZipPath);
  console.log(`Successfully packed cms.zip (for cms.bskbd.org)! Path: ${cmsZipPath}`);

  // Pack v6 zips specifically requested by user
  const websiteV6Path = path.join(process.cwd(), 'website v6.zip');
  websiteZip.writeZip(websiteV6Path);
  console.log(`Successfully packed website v6.zip! Path: ${websiteV6Path}`);

  const cmsV6Path = path.join(process.cwd(), 'cms v6.zip');
  cmsZip.writeZip(cmsV6Path);
  console.log(`Successfully packed cms v6.zip! Path: ${cmsV6Path}`);

  // Copy zip files to public/ for direct web downloads
  const generatedZips = ['build.zip', 'website-build.zip', 'cms-build.zip', 'cms.zip', 'website v6.zip', 'cms v6.zip'];
  generatedZips.forEach(zipName => {
    const srcPath = path.join(process.cwd(), zipName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(publicDir, zipName));
    }
  });

  // Clean up temp folder
  fs.rmSync(cmsDistDir, { recursive: true, force: true });
} else {
  console.error('dist/ folder does not exist. Run build first!');
  process.exit(1);
}

