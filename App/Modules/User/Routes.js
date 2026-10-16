"use strict";
import { middleware } from "#App/Middlewares/RouteMiddleware.js";
import Node from "#Node";
import { checkPermission } from "#Permission";
import Controller from "./Controller.js";

try {
  /**
   *  Title :  User API List
   *  Desc  :
   */

  Node.Router.route("/user")
    .post(checkPermission(Node.MODULE.USER, Node.API_ACTION.POST), middleware, Controller.post)
    .get(checkPermission(Node.MODULE.USER, Node.API_ACTION.LIST), middleware, Controller.list);
  Node.Router.route("/user/:id")
    .get(middleware, Controller.get)
    .patch(middleware, Controller.patch)
    .delete(checkPermission(Node.MODULE.USER, Node.API_ACTION.DELETE), middleware, Controller.delete);
  Node.Router.route("/sign-out").post(Controller.signOut);
  Node.Router.route("/update-password").post(Controller.updatePassword);

  // Without Auth
  Node.Router.route("/sign-in").post(Controller.signIn);
  Node.Router.route("/send-otp").post(Controller.sendOtp);
  Node.Router.route("/resend-otp").post(Controller.resendOtp);
  Node.Router.route("/verify-otp").post(Controller.verifyOtp);
  Node.Router.route("/forgot-password").post(Controller.forgotPassword);

  Node.Router.route("/user-lookup").get(middleware, Controller.lookup);
} catch (error) {
  Node.App.HttpResponse.Response.errorResponse(error);
}

export default Node.Router;
