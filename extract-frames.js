import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the pre-compiled ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic);

// Setup paths
const videoPath = path.join(__dirname, 'original.mp4'); 
const outPath = path.join(__dirname, 'public', 'hero-frames');

// Check if video exists
if (!fs.existsSync(videoPath)) {
    console.error('❌ Error: Could not find original.mp4 in the project folder. Please rename your video to original.mp4 and place it next to this script.');
    process.exit(1);
}

// Clear old frames perfectly
if (fs.existsSync(outPath)) {
    console.log('🗑️ Cleaning up old low-quality frames...');
    fs.rmSync(outPath, { recursive: true, force: true });
}
fs.mkdirSync(outPath, { recursive: true });

console.log('🚀 Extracting frames in ultra-high quality. Please wait...');

ffmpeg(videoPath)
    // -q:v 2 means near-lossless JPEG quality. -r 30 ensures 30fps smooth frames.
    .outputOptions(['-q:v 2']) 
    .output(path.join(outPath, 'ezgif-frame-%03d.jpg'))
    .on('end', () => {
        const files = fs.readdirSync(outPath).filter(f => f.endsWith('.jpg'));
        console.log(`\n✅ Done! Extracted ${files.length} stunning high-quality frames.`);
        console.log(`\nIMPORTANT: Update FRAME_COUNT in HeroCanvas.jsx to be exactly ${files.length} and divide the section math by ${Math.floor(files.length / 5)}.`);
    })
    .on('error', (err) => console.error('❌ Error extracting frames:', err))
    .run();
