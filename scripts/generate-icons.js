import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

async function generateIcons() {
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons from SVG...');

  // 1. 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. Maskable 512x512 (with 15% safe padding around central logo on solid background)
  // Create solid background with teal
  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <rect width="512" height="512" fill="#0d9488" />
      <g transform="translate(64, 64) scale(0.75)">
        <!-- Medical Cross -->
        <path d="M216 112 h80 v104 h104 v80 h-104 v104 h-80 v-104 h-104 v-80 h104 z" fill="#ffffff" />
        <!-- Main Paw Pad -->
        <path d="M256 244 c-24 0 -42 16 -38 36 c3 16 18 24 38 24 s35 -8 38 -24 c4 -20 -14 -36 -38 -36 z" fill="#0d9488" />
        <!-- Toes -->
        <ellipse cx="224" cy="226" rx="9" ry="14" transform="rotate(-18 224 226)" fill="#0d9488" />
        <ellipse cx="245" cy="214" rx="9" ry="14" transform="rotate(-6 245 214)" fill="#0d9488" />
        <ellipse cx="267" cy="214" rx="9" ry="14" transform="rotate(6 267 214)" fill="#0d9488" />
        <ellipse cx="288" cy="226" rx="9" ry="14" transform="rotate(18 288 226)" fill="#0d9488" />
      </g>
    </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. Favicon 64x64 PNG
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
