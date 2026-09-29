import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const INPUT_DIR = join(process.cwd(), 'public/images/artikel');
const OUTPUT_DIR = join(process.cwd(), 'public/images/artikel-webp');
const LOGO_PATH = join(process.cwd(), 'public/images/logo-floodbar-watermark-white-fix.png');

const WATERMARK_WIDTH_PERCENT = 30; // 30% of image width
const WATERMARK_OPACITY = 0.2; // 20% opacity
const WEBP_QUALITY = 80;
const MAX_IMAGE_WIDTH = 800; // Resize lebar maksimal 800px

async function addWatermark(inputPath, outputPath) {
  let image = sharp(inputPath);
  const metadata = await image.metadata();

  let { width, height } = metadata;

  // Resize if width exceeds max
  if (width > MAX_IMAGE_WIDTH) {
    const ratio = MAX_IMAGE_WIDTH / width;
    width = MAX_IMAGE_WIDTH;
    height = Math.round(height * ratio);
    image = image.resize(MAX_IMAGE_WIDTH, null, { fit: 'inside' });
  }

  // Calculate watermark size (30% of image width)
  const watermarkWidth = Math.round(width * (WATERMARK_WIDTH_PERCENT / 100));

  // Resize logo to target size
  const resizedLogo = await sharp(LOGO_PATH)
    .resize(watermarkWidth, watermarkWidth, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Apply opacity via SVG wrapper
  const watermarkSvg = `
    <svg width="${watermarkWidth}" height="${watermarkWidth}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="${WATERMARK_OPACITY}">
        <image href="data:image/png;base64,${resizedLogo.toString('base64')}" width="${watermarkWidth}" height="${watermarkWidth}" />
      </g>
    </svg>
  `;

  // Calculate position (center)
  const left = Math.round((width - watermarkWidth) / 2);
  const top = Math.round((height - watermarkWidth) / 2);

  await image
    .webp({ quality: WEBP_QUALITY })
    .composite([{
      input: Buffer.from(watermarkSvg),
      left,
      top,
    }])
    .toFile(outputPath);

  return { width, height, watermarkWidth, left, top };
}

async function processOneFile(filename) {
  const inputPath = join(INPUT_DIR, filename);
  const outputFilename = extname(filename).toLowerCase() === '.jpg'
    ? filename.replace(/\.jpg$/i, '.webp')
    : filename.replace(/\.jpeg$/i, '.webp');
  const outputPath = join(OUTPUT_DIR, outputFilename);

  const inputStats = await import('fs').then(fs => fs.statSync(inputPath));

  console.log(`Processing: ${filename}`);
  console.log(`  Input size: ${(inputStats.size / 1024).toFixed(1)} KB`);

  const info = await addWatermark(inputPath, outputPath);

  const outputStats = await import('fs').then(fs => fs.statSync(outputPath));
  const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

  console.log(`  Output size: ${(outputStats.size / 1024).toFixed(1)} KB`);
  console.log(`  Reduction: ${reduction}%`);
  console.log(`  Dimensions: ${info.width}x${info.height}`);
  console.log(`  Watermark: ${info.watermarkWidth}x${info.watermarkWidth} at (${info.left}, ${info.top})`);
  console.log('');
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = (await readdir(INPUT_DIR))
    .filter(f => /\.(jpg|jpeg)$/i.test(f) && f.includes('antisipasi-banjir'));

  if (files.length === 0) {
    console.log('No JPG files found');
    return;
  }

  console.log(`Processing ${files.length} file(s) for testing...\n`);

  for (const file of files) {
    await processOneFile(file);
  }

  console.log('Done! Check the output in public/images/artikel-webp/');
}

main().catch(console.error);
