"use strict";
import Node from "#Node";
import { fileURLToPath } from "url";
const __dirname = Node.Path.dirname(fileURLToPath(import.meta.url));

export async function load() {
  try {
    console.info("Loading... Mkdir");
    Node.Fs.mkdirSync(`./Documents`, { recursive: true });
    Node.Fs.mkdirSync(`./Documents/patient-report`, { recursive: true });
    Node.Fs.mkdirSync(`./Documents/excel`, { recursive: true });
    Node.UploadPath = Node.Path.join(__dirname, "../Documents");
  } catch (error) {
    console.log("Error... Mkdir", error);
  }
}
