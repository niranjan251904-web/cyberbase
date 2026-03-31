const fs = require('fs');
const path = require('path');

// Target directories
const sourceDir = path.join(__dirname, 'hero');
const publicHeroFramesDir = path.join(__dirname, 'public', 'hero-frames');
const dirToDelete = path.join(__dirname, 'newhero');

console.log('Starting hero frames update part 2...');

try {
    // Replace public/hero-frames with new frames
    if (fs.existsSync(publicHeroFramesDir)) {
        console.log('Removing old public/hero-frames directory...');
        fs.rmSync(publicHeroFramesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicHeroFramesDir, { recursive: true });

    if (fs.existsSync(sourceDir)) {
        console.log(`Copying files from ${sourceDir} to ${publicHeroFramesDir}...`);
        const files = fs.readdirSync(sourceDir);
        let copied = 0;
        for (const file of files) {
            fs.copyFileSync(path.join(sourceDir, file), path.join(publicHeroFramesDir, file));
            copied++;
        }
        console.log(`Copied ${copied} frames successfully.`);
    } else {
        console.log(`Warning: Could not find ${sourceDir}.`);
    }

    // Attempt to delete requested folder
    if (fs.existsSync(dirToDelete)) {
        console.log(`Removing old source directory ${dirToDelete}...`);
        fs.rmSync(dirToDelete, { recursive: true, force: true });
        console.log('Removed successfully.');
    } else {
        console.log(`Info: old source directory ${dirToDelete} does not exist.`);
    }

    console.log('Done! The new hero frames have been updated successfully.');
} catch (error) {
    console.error('An error occurred:', error);
}
