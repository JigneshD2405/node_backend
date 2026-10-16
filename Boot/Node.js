/**
 * Title : Node Boot
 * Desc :  Boot Variable for Memory
 */

function Node() {
  this.Server = {};
  this.App = { Utils: {} };
  this.Mongoose = {};
  this.AggregatePagination = {};
  this.Fs = {};
  this.Os = {};
  this.Https = {};
  this.HttpServer = {};
  this.Winston = {};
  this.Bcrypt = {};
  this.UploadPath = {};
  this.Express = {};
  this.ExpressValidator = {};
  this.Router = {};
  this.Path = {};
  this.Crypto = {};
  this.Socket = {};

  this.Moment = {};
  this.Jwt = {};
  this.UUID = {};
  this.NodeMailer = {};

  this.Memory = {};
  this.TimezoneOffset = {};
  this.ip = {};
  this.logger = {};

  this.DEVELOPMENT_ENV = "development";
  this.PRODUCTION_ENV = "production";
  this.STAGING_ENV = "staging";

  this.Joi = {};
  this.emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  this.contactRegex = /^[0-9]+$/;

  this.UNPROTECTED_APIS = [
    "/sign-in",
    "/send-otp",
    "/resend-otp",
    "/verify-otp",
    "/forgot-password",
    "/city-lookup",
    "/state-lookup",
    "/area-lookup",
    "/value-lookup",

    "/category-lookup",
    "/role-lookup",
    "/investigation-center-lookup",
    "/user-lookup",
    "/department-lookup",
    "/ref-doctor-lookup",
  ];

  this.API_ACTION = {
    POST: "create",
    GET: "read",
    LIST: "list",
    UPDATE: "update",
    DELETE: "delete",
    UPDATE_PASSWORD: "update_password",
    LOGIN: "login",
    LOGOUT: "logout",
  };
  this.ACTION_ENUM = ["create", "read", "update", "delete", "list", "update_password", "login", "logout"];

  this.ROLES = {
    RECEPTIONIST: "RECEPTIONIST",
    PRO: "PRO",
    SUPER_ADMIN: "SUPER_ADMIN",
  };

  this.PATIENT_CATEGORY = {
    SELF: "SELF",
  };
  this.PAYMENT_STATUS = {
    UNPAID: "UNPAID",
    PAID: "PAID",
    PARTIALLY_PAID: "PARTIALLY_PAID",
  };

  this.MODULE = {
    SUPER_ADMIN: "SUPER_ADMIN",
    INVESTIGATION_CENTER: "INVESTIGATION_CENTER",
    PERMISSION: "PERMISSION",
    ROLE_PERMISSION: "ROLE_PERMISSION",
    ROLE: "ROLE",
    USER_PERMISSION: "USER_PERMISSION",
    AREA: "AREA",
    CITY: "CITY",
    LOOKUP_CATEGORY: "LOOKUP_CATEGORY",
    LOOKUP_VALUE: "LOOKUP_VALUE",
    STATE: "STATE",
    USER: "USER",
    DEPARTMENT: "DEPARTMENT",
    INVESTIGATION: "INVESTIGATION",
    HOSPITAL: "HOSPITAL",
    PATIENT: "PATIENT",
    REFERENCE_DOCTOR: "REFERENCE_DOCTOR",
    PATIENT_PAYMENT: "PATIENT_PAYMENT",
    APPOINTMENTS: "APPOINTMENTS",
    PATIENT_REPORT_DOC: "PATIENT_REPORT_DOC",
    PATIENT_MODALITY: "PATIENT_MODALITY",
    PATIENT_REF_DOC: "PATIENT_REF_DOC",
  };
  this.MODULE_ENUM = Object.values(this.MODULE);

  this.ACCESS_UNPROTECTED_APIS = [];

  this.FEATURE_LIMIT_API = [];

  this.ROUTES = {};
  this.PATIENT_TITLES = ["Mr", "Ms", "Mrs", "Miss", "Master", "Mx"];
  this.GENDER = ["Male", "Female", "Other"];
}

export default new Node();
