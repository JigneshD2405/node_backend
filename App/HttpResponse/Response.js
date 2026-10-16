import Node from "#Node";

class HttpError extends Error {
  constructor({ message, HTTP_ERROR_CODE, name }) {
    super(message);
    this.HTTP_ERROR_CODE = HTTP_ERROR_CODE;
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.name = name;
  }
}

function errorResponse(error) {
  Node.App.Utils.Logger.logger.log("error", error);
  if (error instanceof HttpError) {
    return [{ status: error.HTTP_ERROR_CODE.status, message: error.message }];
  }
  return [Node.App.HttpResponse.Index.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR];
}

class HttpResponse {
  constructor(res, [HTTP_STATUS_CODE, data = {}], message) {
    // Set the status code and send the data as JSON
    let response = {
      data: data,
      message: (message ? message + " " : "") + HTTP_STATUS_CODE.message,
    };
    res.status(HTTP_STATUS_CODE.status).json(response);
  }
}

class SocketResponse {
  constructor([HTTP_STATUS_CODE, data = {}], message) {
    // Set the status code and send the data as JSON
    return {
      data: data,
      message: (message ? message + " " : "") + HTTP_STATUS_CODE.message,
    };
  }
}

export { errorResponse, HttpError, HttpResponse, SocketResponse };
