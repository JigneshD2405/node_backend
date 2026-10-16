import { HttpError } from "./Response.js";

const HTTP_STATUS_CODE = {
    OK: { status: 200, message: 'Successfull' }, // Success
    LIST: { status: 200, message: 'List Getted Successfully' }, // Resource getted successfully
    GETTED: { status: 200, message: 'Getted Successfully' }, // Resource getted successfully
    UPDATED: { status: 200, message: 'Updated Successfully' }, // Resource updated successfully
    DELETED: { status: 200, message: 'Deleted Successfully' }, // Resource deleted successfully
    CREATED: { status: 201, message: 'Created Successfully' }, // Resource created successfully
    BAD_REQUEST: { status: 400, message: 'Bad Request' }, // Bad request
    UNAUTHORIZED: { status: 401, message: 'Unauthorized Request' }, // Unauthorized access
    PAYMENT_REQUIRED: { status: 402, message: 'Payment Required' }, // Payment required
    FORBIDDEN: { status: 403, message: 'Access Forbidden' }, // Access forbidden
    NOT_FOUND: { status: 404, message: 'Not Found' }, // Resource not found
    UNPROCESSABLE_CONTENT: { status: 422, message: 'Unprocessable Request' }, // Unprocessable content
    INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal Server Error' }, // Internal server error
    CUSTOM_ERROR: { status: 400, message: '' }, // Message from parent
    CUSTOM_SUCCESS: { status: 200, message: '' }, // Message from parent
    ACCESS_DENIED: { status: 406, message: '' }, // Message from parent
};

const HTTP_ERRORS = {
    InvalidCredentials: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Invalid Credentials',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'InvalidCredentials',
            });
        }
    },
    AlreadyExistError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Already Exists',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'AlreadyExistError',
            });
        }
    },
    TokenExpirationError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Token Expired',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'TokenExpirationError',
            });
        }
    },
    NotFoundError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Not Found',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.NOT_FOUND,
                name: 'NotFoundError',
            });
        }
    },
    DuplicationError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Duplicated',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'DuplicationError',
            });
        }
    },
    InternalServerError: class extends HttpError {
        constructor(message) {
            super({
                message: 'Internal Server Error',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                name: 'InternalServerError',
            });
        }
    },
    ValidationError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Not Validated',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'ValidationError',
            });
        }
    },
    RequiredError: class extends HttpError {
        constructor(message) {
            super({
                message: (message ? message + ' ' : '') + 'Is Required',
                HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST,
                name: 'RequiredError',
            });
        }
    },
    CustomError: class extends HttpError {
        constructor(message) {
            super({ message: message || '', HTTP_ERROR_CODE: HTTP_STATUS_CODE.BAD_REQUEST, name: 'CustomError' });
        }
    },
    CustomSuccess: class extends HttpError {
        constructor(message) {
            super({ message: message || '', HTTP_ERROR_CODE: HTTP_STATUS_CODE.CUSTOM_SUCCESS, name: 'CustomSuccess' });
        }
    },
    AccessDenied: class extends HttpError {
        constructor(message) {
            super({ message: message || '', HTTP_ERROR_CODE: HTTP_STATUS_CODE.ACCESS_DENIED, name: 'AccessDenied' });
        }
    },
};


export { HTTP_ERRORS, HTTP_STATUS_CODE };

