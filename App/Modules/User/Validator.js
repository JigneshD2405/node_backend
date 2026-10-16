import { email, PASSWORD_ERROR_MESSAGE, PASSWORD_PATTERN, phoneNumber } from "#App/Common/Validator.js";
import Node from "#Node";
/* ============================================================================
   USER SCHEMAS
   ============================================================================ */

export const createUserSchema = Node.Joi.object({
  firstName: Node.Joi.string().required().messages({
    "string.empty": `First Name is required`,
    "any.required": `First Name is required`,
  }),
  lastName: Node.Joi.string().required().messages({
    "string.empty": `Last Name is required`,
    "any.required": `Last Name is required`,
  }),
  email: email,
  phoneNumber: phoneNumber,
  password: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
  roleId: Node.Joi.string().required().messages({
    "string.empty": `Role is required.`,
    "any.required": `Role is required.`,
  }),
  gender: Node.Joi.string().required().messages({
    "any.only": "Gender must be male, female, or other",
    "any.required": "Gender is required",
  }),
  dateOfBirth: Node.Joi.string().required().messages({
    "any.only": "Date of Birth is required",
    "any.required": "Date of Birth is required",
  }),
  address: Node.Joi.string().optional(),
  investigationCenterId: Node.Joi.string()
    .allow("", null)
    .messages({
      "string.empty": `Investigation Center is required.`,
      "any.required": `Investigation Center is required.`,
    })
    .optional(),
  departmentId: Node.Joi.string()
    .allow("", null)
    .messages({
      "string.empty": `Department is required.`,
      "any.required": `Department is required.`,
    })
    .optional(),
}).unknown(true);

export const updateUserSchema = Node.Joi.object({
  firstName: Node.Joi.string().required().messages({
    "string.empty": `First Name is required.`,
    "any.required": `First Name is required.`,
  }),
  lastName: Node.Joi.string().required().messages({
    "string.empty": `Last Name is required.`,
    "any.required": `Last Name is required.`,
  }),
  email: email,
  phoneNumber: phoneNumber,
  password: Node.Joi.string()
    .pattern(PASSWORD_PATTERN)
    .messages({
      "string.empty": `Password is required.`,
      "any.required": `Password is required.`,
      "string.pattern.base": PASSWORD_ERROR_MESSAGE,
    })
    .allow("", null)
    .optional(),
  roleId: Node.Joi.string().messages({
    "string.empty": `Role is required.`,
    "any.required": `Role is required.`,
  }),
  gender: Node.Joi.string().required().messages({
    "any.only": "Gender must be male, female, or other",
    "any.required": "Gender is required",
  }),
  dateOfBirth: Node.Joi.string()
    .required()
    .messages({
      "any.only": "Date of Birth is required",
      "any.required": "Date of Birth is required",
    })
    .allow("", null)
    .optional(),
  address: Node.Joi.string().allow("", null).optional(),
  investigationCenterId: Node.Joi.string()
    .allow("", null)
    .messages({
      "string.empty": `Investigation Center is required.`,
      "any.required": `Investigation Center is required.`,
    })
    .optional(),
  departmentId: Node.Joi.string()
    .allow("", null)
    .messages({
      "string.empty": `Department is required.`,
      "any.required": `Department is required.`,
    })
    .optional(),
}).unknown(true);

/* ============================================================================
   AUTHENTICATION SCHEMAS
   ============================================================================ */

export const SignInSchema = Node.Joi.object({
  email: email,
  password: Node.Joi.string().required().messages({
    "string.empty": `password is required.`,
    "any.required": `password is required.`,
  }),
}).unknown(true);

export const SendOTPSchema = Node.Joi.object({
  email: email,
}).unknown(true);

export const VerifyOtpSchema = Node.Joi.object({
  email: Node.Joi.string().messages({
    "string.empty": `Email is required.`,
    "any.required": `Email is required.`,
  }),
  otp: Node.Joi.string().length(6).pattern(new RegExp(Node.contactRegex)).required().messages({
    "any.required": `OTP is required.`,
    "string.empty": `OTP is required.`,
    "string.length": `OTP must be a number and have 6 digits.`,
    "string.pattern.base": `OTP must be a number and have 6 digits .`,
  }),
}).unknown(true);

export const ForgotPasswordSchema = Node.Joi.object({
  email: email,
  otp: Node.Joi.string().length(6).pattern(new RegExp(Node.contactRegex)).required().messages({
    "any.required": `OTP is required.`,
    "string.empty": `OTP is required.`,
    "string.length": `OTP must be a number and have 6 digits.`,
    "string.pattern.base": `OTP must be a number and have 6 digits .`,
  }),
  password: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
}).unknown(true);

export const UpdatePasswordSchema = Node.Joi.object({
  currentPassword: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
  newPassword: Node.Joi.string().required().pattern(PASSWORD_PATTERN).messages({
    "string.empty": `Password is required.`,
    "any.required": `Password is required.`,
    "string.pattern.base": PASSWORD_ERROR_MESSAGE,
  }),
}).unknown(true);
