"use strict";
import { HTTP_STATUS_CODE } from "#App/HttpResponse/Index.js";
import { checkPermission } from "#App/Middlewares/PermissionMiddleware.js";
import Node from "#Node";
import {
  create,
  forgotPassword,
  getById,
  list,
  lookup,
  remove,
  resendOtp,
  sendOtp,
  signIn,
  signOut,
  update,
  updatePassword,
  verifyOtp,
} from "./Service.js";
const keyword = "User";

export default {
  post: async (req, res) => {
    const session = await Node.Mongoose.startSession();
    try {
      session.startTransaction();
      await create(req, session);
      await session.commitTransaction();
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.CREATED], keyword);
    } catch (error) {
      await session.abortTransaction();
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    } finally {
      session.endSession();
    }
  },
  signIn: async function (req, res) {
    try {
      let payload = await signIn(req);
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.OK, payload], "Sign in");
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  get: async (req, res) => {
    try {
      if (req.login_user._id.toString() !== req.params.id) {
        checkPermission(Node.MODULE.USER, Node.API_ACTION.GET);
      }
      let payload = await getById(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS, payload],
        "User details fetched successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  list: async (req, res) => {
    try {
      let payload = await list(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS, payload],
        "User list fetched successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  signOut: async (req, res) => {
    try {
      await signOut(req);
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.OK], "Sign Out");
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  patch: async (req, res) => {
    try {
      if (req.params.id.toString() !== req.login_user._id.toString) {
        checkPermission(Node.MODULE.USER, Node.API_ACTION.UPDATE);
      }
      await update(req);
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.UPDATED], keyword);
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  delete: async (req, res) => {
    try {
      await remove(req);
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.DELETED], keyword);
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  sendOtp: async (req, res) => {
    try {
      await sendOtp(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS],
        "OTP sent successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  resendOtp: async (req, res) => {
    try {
      await resendOtp(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS],
        "OTP resent successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  verifyOtp: async (req, res) => {
    try {
      await verifyOtp(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS],
        "OTP verified successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  forgotPassword: async (req, res) => {
    try {
      await forgotPassword(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS],
        "Password updated successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  updatePassword: async (req, res) => {
    try {
      await updatePassword(req);
      return new Node.App.HttpResponse.Response.HttpResponse(
        res,
        [HTTP_STATUS_CODE.CUSTOM_SUCCESS],
        "Password updated successfully",
      );
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
  lookup: async (req, res) => {
    try {
      let payload = await lookup(req);
      return new Node.App.HttpResponse.Response.HttpResponse(res, [HTTP_STATUS_CODE.LIST, payload], keyword);
    } catch (error) {
      return new Node.App.HttpResponse.Response.HttpResponse(res, Node.App.HttpResponse.Response.errorResponse(error));
    }
  },
};
