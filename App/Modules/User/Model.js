"use strict";
import CommonSchema from "#App/Common/CommonModel.js";
import Node from "#Node";
const Schema = Node.Mongoose.Schema;

const schemaObj = {
  value_code: {
    type: String,
    required: true,
    immutable: true,
  },
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  gender: {
    type: String,
    required: true,
    enum: Node.GENDER,
  },
  address: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  password: {
    type: String,
    require: true,
  },
  roleId: {
    type: Node.Mongoose.Schema.Types.ObjectId,
    ref: "Roles",
    require: true,
  },
  departmentId: {
    type: Node.Mongoose.Schema.Types.ObjectId,
    ref: "department",
    default: null,
  },
  investigationCenterId: {
    type: Node.Mongoose.Schema.Types.ObjectId,
    ref: "investigation-center",
    default: null,
  },
  value_code: {
    type: String,
    require: true,
  },
  tokens: {
    type: Array,
    default: [],
  },
};

const schema = new Schema(schemaObj, { collection: "users", timestamps: true });
schema.add(CommonSchema);
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
schema.index({ phoneNumber: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
schema.index({ value_code: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
schema.plugin(Node.AggregatePagination);
const User = Node.Mongoose.model("Users", schema);

export default {
  create: async function (data) {
    try {
      return await User.create(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  createWithSession: async (data, session) => {
    if (!session) {
      throw new HTTP_ERRORS.CustomError("session is required");
    }
    return await User.create(data, session);
  },
  findOne: async function (condition = {}, project = {}) {
    try {
      return await User.findOne(condition, project).lean();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  findOneAndPopulate: async function (condition, project = {}) {
    try {
      return await User.findOne(condition, project).populate("roleId").lean();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateOne: async function (condition, data, optional = {}) {
    try {
      return await User.updateOne(condition, data, optional);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateMany: async function (condition, data, optional = {}) {
    try {
      return await User.updateMany(condition, data, optional);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  findOneAndUpdate: async function (condition, data, optional = {}) {
    try {
      return await User.findOneAndUpdate(condition, data, optional).lean();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteOne: async function (condition) {
    try {
      return await User.deleteOne(condition);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  aggregatePaginate: async function (condition = [], options = { page: 1, limit: 20 }) {
    try {
      const aggregate = User.aggregate(condition).collation({ locale: "en", strength: 2 });
      return await User.aggregatePaginate(aggregate, options);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  find: async function (condition = {}) {
    try {
      return await User.find(condition).lean();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  lookup: async function (condition = {}) {
    try {
      return await User.find(condition).sort().lean();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  aggregate: async function (condition = []) {
    try {
      return await User.aggregate(condition).collation({ locale: "en", strength: 2 }).allowDiskUse(true);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertMany: async function (data) {
    try {
      return await User.insertMany(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  bulkWrite: async function (data) {
    try {
      return await User.bulkWrite(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
