"use strict";
import Node from "#Node";
import path from "path";

const middleware = {
  authMiddleware: async function (req, res, next) {
    try {
      req.bypassMiddleware = false;

      if (Node.UNPROTECTED_APIS.some((api) => req.path.startsWith(api))) {
        req.bypassMiddleware = true;
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const folder = req.path.split("/")[1];
        if (["Assets", "Documents"].includes(folder)) {
          return res.status(403).sendFile(path.resolve("View/index.html"));
        }
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const [type, token] = authHeader.split(" ");
      if (type !== "Bearer" || !token) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      const payload = Node.App.Utils.Index.verifyToken(token);
      if (!payload || payload.status === 400 || !payload.data?._id) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      req.login_user = payload.data;
      req.login_user._id = new Node.Mongoose.Types.ObjectId(req.login_user._id);
      req.token = token;

      let login_user =
        payload.data.user_type !== Node.ROLES.SUPER_ADMIN
          ? await Node.App.Modules.Auth.User.Model.findOneAndPopulate({
              _id: req.login_user._id,
              deleted: false,
            })
          : await Node.App.Modules.Auth.SuperAdmin.Model.findOne({
              _id: req.login_user._id,
              deleted: false,
            });

      if (!login_user) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }
      req.login_user = login_user;
      if (payload.data.user_type === Node.ROLES.SUPER_ADMIN) {
        req.login_user = { ...req.login_user, roleId: { value_code: Node.ROLES.SUPER_ADMIN } };
      }

      if (!Array.isArray(login_user?.tokens) || !login_user.tokens.some((stored) => stored.trim() === token.trim())) {
        return res.status(401).json({ status: 401, message: "Unauthorized user" });
      }

      Node.Memory.set(login_user._id.toString(), JSON.stringify(login_user.tokens));
      next();
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
  },
};

export default middleware;
