"use strict";
import Node from "#Node";
import { Server } from "socket.io";
export const load = () => {
  try {
    console.info("Loading... Node Socket.");
    Node.Socket = new Server(Node.HttpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 10000,
    });
    Node.Socket.use(async (req, next) => {
      try {
        const authHeader = req.handshake.auth.token;
        if (!authHeader) {
          return next(new Error("Unauthorized user"));
        }
        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) {
          return next(new Error("Unauthorized user"));
        }
        const payload = Node.App.Utils.Index.verifyToken(token);
        if (!payload || payload.status === 400 || !payload.data?._id) {
          return next(new Error("Unauthorized user"));
        }

        req.login_user = payload.data;
        req.login_user._id = new Node.Mongoose.Types.ObjectId(req.login_user._id);
        req.token = token;

        let login_user =
          payload.data.user_type !== Node.ROLES.SUPER_ADMIN
            ? await Node.App.Modules.Auth.User.Model.findOneAndPopulate({
              _id: req.login_user._id,
              deleted: false,
            }).lean()
            : await Node.App.Modules.Auth.SuperAdmin.Model.findOne({
              _id: req.login_user._id,
              deleted: false,
            }).lean();

        if (!login_user) {
          return next(new Error("Unauthorized user"));
        }
        req.login_user = login_user;
        if (payload.data.user_type === Node.ROLES.SUPER_ADMIN) {
          req.login_user = { ...req.login_user, roleId: { value_code: Node.ROLES.SUPER_ADMIN } };
        }

        if (!Array.isArray(login_user?.tokens) || !login_user.tokens.some((stored) => stored.trim() === token.trim())) {
          return next(new Error("Unauthorized user"));
        }

        next();
      } catch (error) {
        console.log("Error in Load Socket Middleware!", error);
        return next(new Error("Internal Server Error"));
      }
    });
    Node.Socket.on("connection", (socket) => {
      console.info(`New client connected: ${socket.id}`);
      let login_user = socket.login_user;

      socket.join(login_user._id.toString());
      if (socket.rooms.has(login_user._id.toString())) {
        console.log(`✓ Socket ${socket.id} successfully joined room: ${login_user._id.toString()}`);
      } else {
        console.error(`✗ Failed to join room: ${roomName}`);
      }
      socket.on("error", (err) => {
        console.log("Error :- ", err);
        socket.disconnect();
      });
    });
  } catch (error) {
    console.log("Error occurred in Socket :- ", error);
  }
};
