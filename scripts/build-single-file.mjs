import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = resolve(root, "index.html");
const cssPath = resolve(root, "styles.css");
const jsPath = resolve(root, "app.js");
const outputPath = resolve(root, "dist", "contract-video-explainer.html");

const [html, css, js] = await Promise.all([
  readFile(htmlPath, "utf8"),
  readFile(cssPath, "utf8"),
  readFile(jsPath, "utf8"),
]);

const singleFile = html
  .replace('    <link rel="stylesheet" href="styles.css" />', `    <style>\n${css}\n    </style>`)
  .replace('    <script src="app.js"></script>', `    <script>\n${js}\n    </script>`);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, singleFile);

console.log(`Built ${outputPath}`);
