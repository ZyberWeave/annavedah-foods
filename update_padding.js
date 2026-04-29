const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(appDir, (filePath) => {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (content.includes('container mx-auto px-4 py-16')) {
      content = content.replace(/container mx-auto px-4 py-16/g, 'container mx-auto px-4 pt-32 lg:pt-40 pb-16');
      modified = true;
    }
    
    if (filePath.includes('app\\page.tsx') || filePath.includes('app/page.tsx')) {
       if (content.includes('pt-20')) {
          content = content.replace('pt-20', 'pt-32 lg:pt-40');
          modified = true;
       }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
