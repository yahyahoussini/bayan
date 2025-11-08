import { rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const cacheDirs = [
  '.vite',
  join('node_modules', '.vite'),
  'dist'
];

let cleared = false;

// Clear main cache directories
cacheDirs.forEach(dir => {
  if (existsSync(dir)) {
    try {
      rmSync(dir, { recursive: true, force: true });
      console.log(`✓ Cleared ${dir}`);
      cleared = true;
    } catch (error) {
      console.error(`✗ Failed to clear ${dir}:`, error.message);
    }
  }
});

// Search for any nested .vite directories in node_modules
function removeViteDirs(dir) {
  if (!existsSync(dir)) return;
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && entry.name === '.vite') {
        try {
          rmSync(fullPath, { recursive: true, force: true });
          console.log(`✓ Cleared ${fullPath}`);
          cleared = true;
        } catch (e) {
          // Ignore errors in nested cleanup
        }
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        removeViteDirs(fullPath);
      }
    }
  } catch (e) {
    // Ignore errors during traversal
  }
}

if (existsSync('node_modules')) {
  removeViteDirs('node_modules');
}

if (!cleared) {
  console.log('No Vite cache directories found.');
} else {
  console.log('\n✓ Vite cache cleared successfully!');
}

