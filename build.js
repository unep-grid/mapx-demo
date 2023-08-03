import fs from "fs/promises";
import path from "path";
import { JSDOM } from "jsdom";

const config = {
  basePath: "/mapx-demo",
  srcFolder: "./src",
  destFolder: "./docs",
};

async function processHTML(fullPath, destPath) {
  const contents = await fs.readFile(fullPath, "utf-8");
  const dom = new JSDOM(contents);
  const document = dom.window.document;

  // Update href attributes
  document.querySelectorAll('[href^="/"]').forEach((a) => {
    a.href = config.basePath + a.getAttribute("href");
  });

  // Update src attributes
  document.querySelectorAll('[src^="/"]').forEach((el) => {
    el.src = config.basePath + el.getAttribute("src");
  });

  await fs.writeFile(destPath, dom.serialize(), "utf-8");
}

async function processJS(fullPath, destPath) {
  let contents = await fs.readFile(fullPath, "utf-8");
  contents = contents.replace(
    /import\s+.*from\s+"(\.?\/?(?!http).*?)"/g,
    (match, p1) => {
      let relativePath = p1;
      if (relativePath.startsWith("./")) {
        relativePath = relativePath.substring(1); // Remove the dot if it starts with ./
      }
      return match.replace(p1, `${config.basePath}${relativePath}`);
    }
  );
  await fs.writeFile(destPath, contents, "utf-8");
}

async function updateFilePaths(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const files = await fs.readdir(srcDir);
  await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        return updateFilePaths(fullPath, destPath);
      }
      switch (path.extname(fullPath)) {
        case ".html":
          return processHTML(fullPath, destPath);
        case ".js":
          return processJS(fullPath, destPath);
        default:
          // If it's a different file type, just copy it
          return fs.copyFile(fullPath, destPath);
      }
    })
  );
}

updateFilePaths(config.srcFolder, config.destFolder)
  .then(() => console.log("Paths updated successfully"))
  .catch((err) => console.error("An error occurred:", err));
