import { HTTP_ERRORS } from "#App/HttpResponse/Index.js";
import { HttpResponse, errorResponse } from "#App/HttpResponse/Response.js";
import mongoose from "mongoose";

export const middleware = async (req, res, next) => {
  try {
    const invalidValues = [undefined, "undefined", null, "null"];
    const objectIdFields = ["id", "_id", "menuId"];
    const queryIdFields = ["restaurantId", "categoryId", "inventoryId"];

    for (const key of Object.keys(req.params)) {
      if (invalidValues.includes(req.params[key])) {
        req.params[key] = "";
      }
    }

    for (const key of Object.keys(req.query)) {
      if (invalidValues.includes(req.query[key])) {
        req.query[key] = "";
      }
    }

    const limit = parseInt(req.query.limit);
    req.query.limit = !isNaN(limit) ? limit : 20;

    let error404 = false;

    for (const field of objectIdFields) {
      if (req.params[field]) {
        if (mongoose.Types.ObjectId.isValid(req.params[field])) {
          req.params[field] = new mongoose.Types.ObjectId(req.params[field]);
        } else error404 = true;
      }
    }

    for (const field of queryIdFields) {
      if (req.query[field]) {
        if (mongoose.Types.ObjectId.isValid(req.query[field])) {
          req.query[field] = new mongoose.Types.ObjectId(req.query[field]);
        } else error404 = true;
      }
    }

    if (error404) throw new HTTP_ERRORS.NotFoundError();

    if (req.bypassMiddleware) return next();

    return next();
  } catch (error) {
    return new HttpResponse(res, errorResponse(error));
  }
};
