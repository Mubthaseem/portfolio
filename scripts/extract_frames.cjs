const fs = require('fs');
const path = require('path');
const { parseGIF, decompressFrames } = require('gifuct-js');
const sharp = require('sharp');

async function extract() {
  const gifPath = path.join(__dirname, '../public/avatar.gif');
  const outputDir = path.join(__dirname, '../public/frames');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Reading avatar.gif...');
  const buffer = fs.readFileSync(gifPath);
  const gif = parseGIF(buffer);
  const rawFrames = decompressFrames(gif, true);

  console.log(`Extracted ${rawFrames.length} frames. Exporting WebP sequence...`);

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  let tempBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i];
    const dims = frame.dims;

    if (dims) {
      const patch = Buffer.from(frame.patch);
      if (frame.disposalType === 2) {
        for (let y = 0; y < dims.height; y++) {
          for (let x = 0; x < dims.width; x++) {
            const idx = ((dims.top + y) * width + (dims.left + x)) * 4;
            tempBuffer[idx] = 0;
            tempBuffer[idx + 1] = 0;
            tempBuffer[idx + 2] = 0;
            tempBuffer[idx + 3] = 0;
          }
        }
      }

      for (let y = 0; y < dims.height; y++) {
        for (let x = 0; x < dims.width; x++) {
          const patchIdx = (y * dims.width + x) * 4;
          const targetIdx = ((dims.top + y) * width + (dims.left + x)) * 4;

          const alpha = patch[patchIdx + 3];
          if (alpha > 0) {
            tempBuffer[targetIdx] = patch[patchIdx];
            tempBuffer[targetIdx + 1] = patch[patchIdx + 1];
            tempBuffer[targetIdx + 2] = patch[patchIdx + 2];
            tempBuffer[targetIdx + 3] = alpha;
          }
        }
      }
    }

    const filename = `frame_${String(i).padStart(3, '0')}.webp`;
    const outPath = path.join(outputDir, filename);

    // Scale to max width 960px for lightning fast 60fps load and zero RAM overhead
    await sharp(tempBuffer, {
      raw: { width, height, channels: 4 }
    })
      .resize({ width: Math.min(960, width), fit: 'contain' })
      .webp({ quality: 80, alphaQuality: 90 })
      .toFile(outPath);

    if ((i + 1) % 10 === 0 || i === rawFrames.length - 1) {
      console.log(`Extracted frame ${i + 1} / ${rawFrames.length}`);
    }
  }

  const manifest = {
    totalFrames: rawFrames.length,
    width,
    height
  };
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Frame extraction complete!');
}

extract().catch(console.error);
