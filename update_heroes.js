const fs = require('fs');
const path = require('path');

// Target directories
const newHeroDir = path.join(__dirname, 'newhero');
const publicHeroFramesDir = path.join(__dirname, 'public', 'hero-frames');
const oldHeroFramesDir = path.join(__dirname, 'new hero frames');

console.log('Starting hero frames update...');

try {
    // Replace public/hero-frames with new frames
    if (fs.existsSync(publicHeroFramesDir)) {
        console.log('Removing old public/hero-frames directory...');
        fs.rmSync(publicHeroFramesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicHeroFramesDir, { recursive: true });

    if (fs.existsSync(newHeroDir)) {
        console.log(`Copying files from ${newHeroDir} to ${publicHeroFramesDir}...`);
        const files = fs.readdirSync(newHeroDir);
        let copied = 0;
        for (const file of files) {
            fs.copyFileSync(path.join(newHeroDir, file), path.join(publicHeroFramesDir, file));
            copied++;
        }
        console.log(`Copied ${copied} frames successfully.`);
    } else {
        console.log(`Warning: Could not find ${newHeroDir}.`);
    }

    // Attempt to delete requested folder
    if (fs.existsSync(oldHeroFramesDir)) {
        console.log(`Removing old source directory ${oldHeroFramesDir}...`);
        fs.rmSync(oldHeroFramesDir, { recursive: true, force: true });
        console.log('Removed successfully.');
    } else {
        console.log(`Info: old source directory ${oldHeroFramesDir} does not exist.`);
    }

    console.log('Done! The hero frames have been updated successfully.');
} catch (error) {
    console.error('An error occurred:', error);
}
