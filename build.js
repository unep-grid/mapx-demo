import fs from 'fs/promises';
import path from 'path';

const config = {
  basePath: '/mapx-demo',
  srcFolder: './src',
  destFolder: './docs',
};

async function copyAndUpdateHtmlFiles(fullPath, destPath) {
  let contents = await fs.readFile(fullPath, 'utf-8');
  contents = contents.replace(new RegExp(`\"\/(css|js|images)\/`, 'g'), `"${config.basePath}/$1/`);
  await fs.writeFile(destPath, contents, 'utf-8');
}

async function copyAndUpdateJsFiles(fullPath, destPath) {
  let contents = await fs.readFile(fullPath, 'utf-8');
  contents = contents.replace(/import\s+.*from\s+"(\.(?!http).*?)"/g, (match, p1) => {
    return match.replace(p1, `${config.basePath}${p1}`);
  });
  await fs.writeFile(destPath, contents, 'utf-8');
}

async function updateFilePaths(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const files = await fs.readdir(srcDir);
  await Promise.all(files.map(async (file) => {
    const fullPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      return updateFilePaths(fullPath, destPath);
    }
    switch (path.extname(fullPath)) {
      case '.html':
        return copyAndUpdateHtmlFiles(fullPath, destPath);
      case '.js':
        return copyAndUpdateJsFiles(fullPath, destPath);
      default:
        // If it's a different file type, just copy it
        return fs.copyFile(fullPath, destPath);
    }
  }));
}

updateFilePaths(config.srcFolder, config.destFolder)
  .then(() => console.log('Paths updated successfully'))
  .catch(err => console.error('An error occurred:', err));
