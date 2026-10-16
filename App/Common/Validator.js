"use strict";
import Node from "#Node";

/* ============================================================================
   COMMON VALIDATION PATTERNS
   ============================================================================ */

/**
 * Reusable MongoDB ObjectId validator
 */
export const objectId = Node.Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Must be a valid MongoDB ObjectId",
  });

export const phoneNumber = Node.Joi.string()
  .trim()
  .pattern(/^[0-9]{10}$/)
  .required()
  .messages({
    "string.empty": "Phone Number is required",
    "string.pattern.base": "Phone Number must be a valid phone number",
    "any.required": "Phone Number is required",
  });
export const email = Node.Joi.string().email().required().messages({
  "string.empty": `Email is required`,
  "any.required": `Email is required`,
  "string.email": `Email must be a valid email`,
});

/**
 * Password validation pattern with requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PASSWORD_PATTERN = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$");

export const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

/**
 * Reusable positive number validator
 */
export const positiveNumber = Node.Joi.number().min(0);
