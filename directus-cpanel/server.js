/**
 * Directus cPanel Startup Entry Point (Passenger / Node.js App compatible)
 */
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || 8055;
const host = process.env.HOST || '0.0.0.0';

console.log(`[BSK Directus] Starting Directus CMS Server on ${host}:${port}...`);

const directusBin = path.join(__dirname, 'node_modules', '.bin', 'directus');
const child = spawn(directusBin, ['start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
    HOST: host,
  }
});

child.on('error', (err) => {
  console.error('[BSK Directus] Startup Error:', err);
});

child.on('exit', (code) => {
  console.log(`[BSK Directus] Process exited with code ${code}`);
});
