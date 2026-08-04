const { exec } = require('child_process');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

// Absolute paths
const inputPath = path.resolve(__dirname, '../public/avatar_green.mp4');
const outputPath = path.resolve(__dirname, '../public/avatar_black.mp4');

// We want to key out the dark green background #368040, replace it with pure black,
// scale it to 960x540 for fast loading/seeking, and force every frame to be a keyframe (g=1).
const filterGraph = `[0:v]chromakey=0x368040:0.32:0.12[ck]; color=c=black:s=960x540[bg]; [ck]scale=960:540[ck_scaled]; [bg][ck_scaled]overlay=shortest=1[out]`;

const cmd = `"${ffmpeg}" -i "${inputPath}" -filter_complex "${filterGraph}" -map "[out]" -c:v libx264 -preset slow -crf 22 -g 1 -tune fastdecode -an -y "${outputPath}"`;

console.log("Starting ffmpeg command:", cmd);

const start = Date.now();
const process = exec(cmd);

process.stdout.on('data', (data) => console.log(data.toString()));
process.stderr.on('data', (data) => console.error(data.toString()));

process.on('close', (code) => {
  if (code === 0) {
    console.log(`Conversion completed successfully in ${((Date.now() - start) / 1000).toFixed(1)}s!`);
    console.log(`Output saved to: ${outputPath}`);
  } else {
    console.error(`ffmpeg process exited with code ${code}`);
  }
});
