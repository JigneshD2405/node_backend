"use strict";
import Node from "#Node";
import http from "http";

export async function load() {
  try {

    console.info("Loading... HttpServer");

    if (process.env.NODE_ENV !== Node.DEVELOPMENT_ENV) {
      let options = {
        key: Node.Fs.readFileSync("./Library/server.key"),
        cert: Node.Fs.readFileSync("./Library/fullchain.crt"),
      };
      Node.HttpServer = http.Server(options, Node.Express);
    } else {

      Node.HttpServer = http.Server(Node.Express);
    }
  } catch (error) {
    console.log("Error... HttpServer", error);
  }
}
