'use strict';
import Node from "#Node";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Node.Path.dirname(__filename);


export async function load(folderPath) {
    try {
        const rootPath = Node.Path.resolve(__dirname, '../', folderPath);
        const jsFiles = await getAllJsFiles(rootPath);
        let rootObject = {};

        for (let i = 0; i < jsFiles.length; i++) {
            const filePath = jsFiles[i];
            const relativePath = Node.Path.relative(rootPath, filePath);
            await createNestedObject(rootObject, relativePath, rootPath);
        }
        return rootObject;
    } catch (error) {
        console.log("Error in Load Library!", error);
        return {};
    };
}

export async function getAllJsFiles(dir, fileList = []) {
    const files = Node.Fs.readdirSync(dir);

    files.forEach(async (file) => {
        const filePath = Node.Path.join(dir, file);
        const stat = Node.Fs.statSync(filePath);

        if (stat.isDirectory() && !file.toLowerCase().includes('routes')) {
            // If the current path is a directory, recursively call the function
            await getAllJsFiles(filePath, fileList);
        } else if (stat.isFile() && file.endsWith('.js') && !file.toLowerCase().includes('routes')) {
            // If the current path is a JS file and not Routes.js, add it to the list
            fileList.push(filePath);
        };
    });

    return fileList;
}

export async function createNestedObject(root, filePath, rootPath) {
    try {
        const parts = filePath.split(Node.Path.sep);
        let current = root;

        // Iterate over the parts of the path and create nested objects
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = (part.includes('.js'));
            if (isFile) {
                const fileName = Node.Path.basename(part, '.js');
                const fileAbsolutePath = Node.Path.resolve(rootPath, ...parts.slice(0, i + 1));
                if (!current[fileName]) {
                    const fileUrl = pathToFileURL(fileAbsolutePath).href;
                    const module = await import(fileUrl);
                    current[fileName] = module.default || module;
                } else {
                    console.warn(`Warning: Duplicate file detected - ${fileAbsolutePath}`);
                }
            } else {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            };
        };
        return current
    } catch (error) {
        console.log("Errorr Create  :-", error);

    }
}