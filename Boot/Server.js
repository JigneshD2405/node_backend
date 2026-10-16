"use strict";

/* ------------------------------
 * Imports
 * ------------------------------ */
import Node from "#Node";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import { engine } from "express-handlebars";
import fs from "fs";
import https from "https";
import ip from "ip";
import Joi from "joi";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";
import AggregatePagination from "mongoose-aggregate-paginate-v2";
import morgan from "morgan";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";
import xlsx from "xlsx";
/* ------------------------------
 * Core Assignments to Node
 * ------------------------------ */
Node.Mongoose = mongoose;
Node.ip = ip;
Node.moment = moment;
Node.Fs = fs;
Node.Path = path;
Node.Https = https;
Node.AggregatePagination = AggregatePagination;
Node.Joi = Joi;
Node.Winston = winston;
Node.Bcrypt = bcrypt;
Node.Jwt = jwt;
Node.Memory = new NodeCache({ stdTTL: 86400 });
Node.Crypto = crypto;
Node.NodeMailer = nodemailer;
Node.Xlsx = xlsx;
Node.Moment = moment;
/* ------------------------------
 * Directory Setup
 * ------------------------------ */
const __dirname = Node.Path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------
 * Express App Initialization
 * ------------------------------ */
Node.Express = express();
Node.Router = express.Router();

// Middleware
Node.Express.use(cors());
Node.Express.use(compression());
Node.Express.use(fileUpload());
Node.Express.use(express.static("./Documents"));
Node.Express.use(morgan("dev"));
Node.Express.use("/Assets", express.static("./Assets"));
Node.Express.use(bodyParser.json({ limit: "50mb" }));
Node.Express.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Headers
Node.Express.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// View Engine
Node.Express.engine("handlebars", engine({ extname: "hbs" }));
Node.Express.set("view engine", "hbs");
Node.Express.set("views", path.join(__dirname, "../views"));
Node.Express.use("/Documents", express.static("./Documents"));
Node.Express.use(express.static("./Assets"));

/* ------------------------------
 * Node Initialization
 * ------------------------------ */

Node.initialize = async (port) => {
  try {
    process.env.PORT = port || process.env.PORT || 8080;
    process.env.NODE_ENV ||= Node.DEVELOPMENT_ENV;

    //Initialize DB....
    await (await import("#Library/mongodb.js")).load();

    // Load Modules file
    const { load: loadModules } = await import("#Library/load.js");

    // Load All Until Files in APP/Utils
    Node.App.Utils = await loadModules("./App/Utils");

    // Load All Js Files in APP Folder
    Node.App = await loadModules("./App");

    //
    await Node.Router.use(Node.App.Middlewares.Middleware.authMiddleware);

    // Initialize
    await (await import("#Library/routes.js")).load("./App");

    // Initialize HTTP
    await (await import("#Library/http.js")).load();

    await Node.HttpServer.listen(process.env.PORT);

    //Socket
    await (await import("#Library/socket.js")).load();
    // Initialize Logger
    await Node.App.Utils.Logger.initLogger();

    // Initialize Crons/Schedulers
    await (await import("#Library/mkdir.js")).load();
    await (await import("#Library/schedule.js")).load();

    const dateTime = moment().format("DD-MM-YYYY HH:mm:ss");

    console.log("|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|");
    console.log(` |         Node ${process.env.NODE_ENV} server started.                      |`);
    console.log(` |         Date: ${dateTime}                             |`);
    console.log(` |         http://${ip.address()}:${process.env.PORT}                              |`);
    console.log("|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|");

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
    });

    Node.AppInstance = Node.Express;
  } catch (error) {
    console.error("Error during Node initialization:", error);
  }
};
