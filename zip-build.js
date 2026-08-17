import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const distDir = path.join(process.cwd(), 'dist');
const zipPath = path.join(process.cwd(), 'build.zip');

if (fs.existsSync(distDir)) {
  const zip = new AdmZip();
  // Add everything in dist/ directly to the root of the zip file
  zip.addLocalFolder(distDir);
  zip.writeZip(zipPath);
  console.log(`Successfully packed build.zip! Path: ${zipPath}`);
} else {
  console.error('dist/ folder does not exist. Run build first!');
  process.exit(1);
}
