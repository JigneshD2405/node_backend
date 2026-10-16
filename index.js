'use strict';
import Node from "#Node";
import dotenv from "dotenv";
import "./Boot/Server.js";

dotenv.config();

(async function () {
  await Node.initialize();
})();