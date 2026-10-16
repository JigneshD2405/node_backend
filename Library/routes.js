"use strict";
import Node from "#Node";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Node.Path.dirname(__filename);


export async function load(folderPath) {
  try {
    const rootPath = Node.Path.resolve(__dirname, "../", folderPath);
    const routeFiles = await getAllRoutesFiles(rootPath);

    for (let index = 0; index < routeFiles.length; index++) {
      const filePath = routeFiles[index];
      const relativePath = Node.Path.relative(rootPath, filePath);
      await registerRoutes(relativePath, rootPath);
    }
  } catch (error) {
    console.log("Error in Routes Library!", error);
  }
}

export async function getAllRoutesFiles(dir, fileList = []) {
  const files = Node.Fs.readdirSync(dir);

  files.forEach(async (file) => {
    const filePath = Node.Path.join(dir, file);
    const stat = Node.Fs.statSync(filePath);

    if (stat.isDirectory()) {
      // If the current path is a directory, recursively call the function
      await getAllRoutesFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      file.endsWith(".js") &&
      file.toLowerCase().includes("routes")
    ) {
      // If the current path is a JS file and Routes.js, add it to the list
      fileList.push(filePath);
    }
  });

  return fileList;
}

export async function registerRoutes(filePath, rootPath) {
  const parts = filePath.split(Node.Path.sep);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isFile = part.includes(".js");

    if (isFile) {
      const fileAbsolutePath = Node.Path.resolve(rootPath, ...parts.slice(0, i + 1));

      // Convert Windows path to file:// URL before dynamic import
      const module = await import(pathToFileURL(fileAbsolutePath).href);

      Node.Express.use("/", module.default);
    }
  }

}