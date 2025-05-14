const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create dist/entities directory if it doesn't exist
const distDir = path.join(__dirname, 'dist', 'entities');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy entities to dist folder
const entitiesDir = path.join(__dirname, 'entities');
fs.readdirSync(entitiesDir).forEach(file => {
  if (file.endsWith('.ts')) {
    const source = path.join(entitiesDir, file);
    const dest = path.join(distDir, file.replace('.ts', '.js'));
    execSync(`tsc ${source} --outDir ${path.dirname(dest)} --esModuleInterop --experimentalDecorators --emitDecoratorMetadata`);
  }
});
