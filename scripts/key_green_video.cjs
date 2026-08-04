const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

async function processVideo() {
  const inputVideo = path.join(__dirname, '../public/avatar_green.mp4');
  const outputDir = path.join(__dirname, '../public/frames');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const oldFiles = fs.readdirSync(outputDir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }

  console.log('Extracting and chromakeying green screen video via ffmpeg-static...');

  // C-accelerated ffmpeg colorkey filter: colorkey=0x00FF00:0.28:0.08, scale to 720p width
  const cmd = `"${ffmpegPath}" -y -i "${inputVideo}" -vf "colorkey=0x00FF00:0.28:0.08,scale=720:-1" -c:v libwebp -quality 80 -compression_level 4 "${outputDir}/frame_%03d.webp"`;
  
  execSync(cmd, { stdio: 'inherit' });

  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
  console.log(`Successfully generated ${files.length} chromakeyed WebP frames with 100% alpha transparency!`);
}

processVideo().catch(console.error);
