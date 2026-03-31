import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegStatic);

const videoPath = path.join(__dirname, 'original.mp4'); 
const outPath = path.join(__dirname, 'public', 'hero-frames');

if (!fs.existsSync(videoPath)) {
    console.error('❌ Error: Could not find original.mp4 in the project folder.');
    process.exit(1);
}

if (fs.existsSync(outPath)) {
    console.log('🗑️ Cleaning up the giant 40MB heavy frames...');
    fs.rmSync(outPath, { recursive: true, force: true });
}
fs.mkdirSync(outPath, { recursive: true });

console.log('🚀 Extracting frames optimized for instantaneous Vercel web loading. Please wait...');

ffmpeg(videoPath)
    // Quality compression: -q:v 8 heavily compresses JPEGs while looking nearly identical
    // Scale compression: scales all frames down to standard layout width (1280p) to shrink file size.
    .outputOptions(['-q:v 8', '-vf scale=1280:-1']) 
    .output(path.join(outPath, 'ezgif-frame-%03d.jpg'))
    .on('end', () => {
        const files = fs.readdirSync(outPath).filter(f => f.endsWith('.jpg'));
        console.log(`\n✅ Done! Extracted ${files.length} compressed frames.`);
        console.log(`\nYour Vercel load time will now drop from huge 40MB delays down to a few snappy megabytes!`);
    })
    .on('error', (err) => console.error('❌ Error extracting frames:', err))
    .run();
