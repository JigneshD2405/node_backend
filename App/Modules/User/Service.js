import { eventLog } from "#App/Utils/eventLog.js";
import { HTTP_ERRORS } from "#HttpResponse/Index.js";
import { createPatient, fetchPermissions, generateOtp, generateValueCode, sendSMS } from "#Index";

import Node from "#Node";
import User from "./Model.js";
import {
  ForgotPasswordSchema,
  SendOTPSchema,
  SignInSchema,
  UpdatePasswordSchema,
  updateUserSchema,
  VerifyOtpSchema,
} from "./Validator.js";
const keyword = "User";

export const getById = async (req) => {
  const id = req.params.id;
  let payload = await User.aggregate([
    {
      $match: { _id: id, deleted: false },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              value_code: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$role",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phoneNumber: 1,
        roleId: 1,
        value_code: 1,
        departmentId: 1,
        investigationCenterId: 1,
        role: 1,
        gender: 1,
        dateOfBirth: 1,
        address: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!payload.length) {
    payload = await Node.App.Modules.Auth.SuperAdmin.Model.findOne(
      { deleted: false, _id: id },
      { tokens: 0, password: 0, __v: 0, status: 0, deleted: 0, createdAt: 0, updatedAt: 0 },
    );
    if (!payload) throw new HTTP_ERRORS.NotFoundError(keyword);
  }
  return payload[0] ? payload[0] : payload;
};

const getUser = async (condition = {}, keyword = "User", isNotExist = true) => {
  condition.deleted = false;
  let payload = (await User.findOne(condition)) || (await Node.App.Modules.Auth.SuperAdmin.Model.findOne(condition));
  if (!payload && isNotExist) throw new HTTP_ERRORS.NotFoundError(keyword);
  if (payload && !isNotExist) throw new HTTP_ERRORS.AlreadyExistError(keyword);

  return payload;
};

const validateDepartment = async (investigationCenterId, departmentId = "") => {
  let condition = { _id: new Node.Mongoose.Types.ObjectId(investigationCenterId), deleted: false };

  let investigationCenter = await Node.App.Modules.Functional.InvestigationCenter.Model.findOne(condition);
  if (!investigationCenter) {
    throw new HTTP_ERRORS.NotFoundError("Investigation Center");
  }
  if (departmentId) {
    condition._id = new Node.Mongoose.Types.ObjectId(departmentId);
    condition.investigationCenterId = new Node.Mongoose.Types.ObjectId(investigationCenterId);
    let department = await Node.App.Modules.Functional.Department.Model.findOne(condition);
    if (!department) {
      throw new HTTP_ERRORS.CustomError("Department with investigation not found");
    }
  }
  return investigationCenter;
};

const ValidateValueCode = async (value_code, _id = "") => {
  let valueCode = value_code;
  let condition = { value_code: value_code, deleted: false };
  if (_id) condition._id = { $ne: _id };
  let user = await User.findOne(condition);
  if (user) {
    let randomNumber = Math.floor(1000 + Math.random() * 900);
    return ValidateValueCode(`${value_code}_${randomNumber}`);
  }
  return valueCode;
};

export const create = async (req, session) => {
  let { error, value } = await Node.App.Modules.Auth.SuperAdmin.Validator.createAdminSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }

  await getUser({ email: value.email }, "Email", false);
  await getUser({ phoneNumber: value.phoneNumber }, "Phone Number", false);
  await Node.App.Modules.Auth.Roles.Service.getById({ params: { id: value.roleId } });
  if (value.investigationCenterId) {
    await validateDepartment(value.investigationCenterId, value.departmentId);
  }
  if (!value.departmentId) {
    value.departmentId = null;
  }
  if (!value.investigationCenterId) {
    value.investigationCenterId = null;
  }

  const salt = await Node.Bcrypt.genSalt(10);
  value.password = await Node.Bcrypt.hash(value.password, salt);

  value.createdBy = req.login_user._id;
  value.updatedBy = req.login_user._id;
  value.fullName = `${value.firstName} ${value.lastName}`;
  let payload = await createPatient(User, value, session);

  delete payload.password;
  delete payload.tokens;

  eventLog({
    module: Node.MODULE.USER,
    action: Node.API_ACTION.POST,
    entityId: payload._id,
    entityName: payload.email || "",
    description: `New User (${payload.firstName} ${payload.lastName}) created`,
    oldValue: {},
    newValue: payload,
    req,
  });
};

export const signIn = async (req) => {
  const { error, value } = await SignInSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }
  let user = await User.findOneAndPopulate({ email: value.email });

  if (!user) {
    user = await Node.App.Modules.Auth.SuperAdmin.Model.findOne({
      email: value.email,
    });

    if (!user) throw new HTTP_ERRORS.NotFoundError(keyword);
    user.roleId = { value_code: Node.ROLES.SUPER_ADMIN };
  }
  if (user?.deleted) throw new HTTP_ERRORS.CustomError("User is deleted. Please contact administrator !!");
  if (!user?.status) throw new HTTP_ERRORS.CustomError("User is inactive. Please contact administrator !!");

  let user_type = user.roleId.value_code;

  const isValidpassword = await Node.Bcrypt.compare(value.password, user.password);
  if (!isValidpassword) throw new HTTP_ERRORS.CustomError("Invalid User Credentials");

  let permissions = user_type !== Node.ROLES.SUPER_ADMIN ? await fetchPermissions(user.roleId._id, user._id) : [];

  const token = await Node.App.Utils.Index.generateToken({
    _id: user._id,
    user_type: user_type,
  });

  user =
    user_type !== Node.ROLES.SUPER_ADMIN
      ? await User.findOneAndUpdate({ _id: user._id }, { $push: { tokens: token } }, { new: true })
      : await Node.App.Modules.Auth.SuperAdmin.Model.findOneAndUpdate(
        { _id: user._id },
        { $push: { tokens: token } },
        { new: true },
      );

  Node.Memory.set(user._id.toString(), JSON.stringify(user.tokens));

  return {
    token: token,
    user_type: user_type,
    user_id: user?._id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    permissions: permissions,
    investigationCenterId: user?.investigationCenterId || null,
    departmentId: user?.departmentId || null,
  };
};

export const list = async (req) => {
  let filterObj = { deleted: false };
  let sortObj = {};
  let { page, limit, firstName, lastName, phoneNumber, email, sort, sortType, roleId } = req.query;
  sortObj[sort || "createdAt"] = sortType ? Number(sortType) : -1;

  if (firstName) {
    filterObj.firstName = { $regex: firstName, $options: "i" };
  }
  if (lastName) {
    filterObj.lastName = { $regex: lastName, $options: "i" };
  }
  if (phoneNumber) {
    filterObj.phoneNumber = { $regex: phoneNumber, $options: "i" };
  }
  if (email) {
    filterObj.email = { $regex: email, $options: "i" };
  }

  if (roleId) {
    filterObj["roleId"] = new Node.Mongoose.Types.ObjectId(roleId);
  }

  return await User.aggregatePaginate(
    [
      { $match: filterObj },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                value_code: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          value_code: 1,
          email: 1,
          phoneNumber: 1,
          createdAt: 1,
          role: 1,
        },
      },
      {
        $sort: sortObj,
      },
    ],
    { page: page, limit: limit },
  );
};

export const signOut = async (req) => {
  let user = await User.findOne({
    _id: new Node.Mongoose.Types.ObjectId(req.login_user._id),
  });
  if (user) {
    user.tokens = user.tokens.filter((token) => token !== req.token);
    user = await User.findOneAndUpdate({ _id: user._id }, { tokens: user.tokens }, { new: true });
    Node.Memory.set(user._id.toString(), JSON.stringify(user.tokens));
  }
  return true;
};

export const remove = async (req) => {
  const id = req.params.id;

  let isUserExist = await getById(req);

  let payload = await User.findOneAndUpdate(
    { _id: id, deleted: false },
    { deleted: true, deletedAt: new Date(), deletedBy: req.login_user._id, tokens: [] },
    { new: true },
  );
  if (!payload) throw new HTTP_ERRORS.NotFoundError(keyword);

  Node.Memory.del(payload._id.toString());
  delete payload.password;
  delete payload.tokens;
  delete isUserExist.password;
  delete isUserExist.tokens;

  eventLog({
    module: Node.MODULE.USER,
    action: Node.API_ACTION.DELETE,
    entityId: id,
    entityName: isUserExist.email || "",
    description: `User (${isUserExist.firstName} ${isUserExist.lastName}) deleted`,
    oldValue: isUserExist,
    newValue: payload,
    req,
  });
  return payload;
};

export const update = async (req) => {
  const id = req.params.id;

  let { error, value } = updateUserSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }
  let isUserExist = await getById(req);
  await getUser({ email: value.email, _id: { $ne: id } }, "Email", false);
  await getUser({ phoneNumber: value.phoneNumber, _id: { $ne: id } }, "Phone Number", false);

  if (
    (isUserExist?.investigationCenterId?.toString() !== value.investigationCenterId && value.investigationCenterId) ||
    (isUserExist?.departmentId?.toString() !== value.departmentId && value.departmentId)
  ) {
    await validateDepartment(value.investigationCenterId, value.departmentId);
  }

  if (!value.investigationCenterId) value.investigationCenterId = null;
  if (!value.departmentId) value.departmentId = null;
  if (req.login_user._id.toString() === req.params.id.toString()) {
    delete value.investigationCenterId;
    delete value.departmentId;
    delete value.email;
  }
  value.value_code = await ValidateValueCode(await generateValueCode(`${value.firstName + " " + value.lastName}`), id);

  if (value.roleId && value.roleId !== isUserExist.roleId.toString()) {
    await Node.App.Modules.Auth.Roles.Service.getById({
      params: {
        id: value.roleId,
      },
    });
  }

  if (value.password) {
    const salt = await Node.Bcrypt.genSalt(10);
    value.password = await Node.Bcrypt.hash(value.password, salt);
  } else {
    delete value.password;
  }
  let payload = await User.findOneAndUpdate({ _id: id }, { $set: value }, { new: true });
  delete payload.password;
  delete payload.tokens;
  delete isUserExist.password;
  delete isUserExist.tokens;

  eventLog({
    module: Node.MODULE.USER,
    action: Node.API_ACTION.UPDATE,
    entityId: id,
    entityName: isUserExist.email || "",
    description: `User (${isUserExist.firstName} ${isUserExist.lastName}) updated`,
    oldValue: isUserExist,
    newValue: payload,
    req,
  });
  return payload;
};

export const sendOtp = async (req, resend = false) => {
  let { error, value } = SendOTPSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }

  let isUserExist =
    (await User.findOne({ email: value.email })) ||
    (await Node.App.Modules.Auth.SuperAdmin.Model.findOne({ email: value.email }));
  if (!isUserExist) throw new HTTP_ERRORS.CustomError("User with this email Not found");
  if (isUserExist?.deleted) throw new HTTP_ERRORS.CustomError("User is deleted. Please contact administrator !!");
  if (isUserExist?.status === false)
    throw new HTTP_ERRORS.CustomError("User is not active. Please contact administrator !!");

  let lastOtpData = await Node.App.Modules.Utils.Otp.Model.findOneLast({ email: value.email }, { createdAt: -1 });
  if (lastOtpData && Date.now() - lastOtpData.createdAt.getTime() < 60 * 1000) {
    const secondsLeft = ((60 * 1000 - (Date.now() - lastOtpData.createdAt)) / 1000).toFixed(0);
    throw new HTTP_ERRORS.CustomError(`You can request a new OTP after ${secondsLeft} seconds.`);
  }
  if (resend) {
    await Node.App.Modules.Utils.Otp.Model.updateMany({ email: value.email }, { expired: true });
  }
  let otp = await generateOtp(6);
  const salt = await Node.Bcrypt.genSalt(10);
  const hashedOtp = await Node.Bcrypt.hash(otp.toString(), salt);
  await Node.App.Modules.Utils.Otp.Model.create({
    email: value.email,
    otp: hashedOtp,
    validTill: new Date(Date.now() + 60 * 1000),
  });

  await sendSMS({
    contact: "123456789",
    MsgText: `Your One Time Password ${otp} for Phone Number`,
    TemplateID: "1707173287528365523",
  });
  return true;
};

export const resendOtp = async (req) => {
  await sendOtp(req, true);
  return true;
};

export const verifyOtp = async (req) => {
  const { error, value } = await VerifyOtpSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }

  let lastOtpData = await Node.App.Modules.Utils.Otp.Model.findOneLast(
    { email: value.email, verified: false, expired: false },
    { createdAt: -1 },
  );
  if (!lastOtpData) throw new HTTP_ERRORS.CustomError("OTP not found");
  if (lastOtpData?.validTill <= Date.now()) {
    throw new HTTP_ERRORS.CustomError(`OTP is expired,Please send otp again.`);
  }
  const isValidOtp = await Node.Bcrypt.compare(value.otp, lastOtpData.otp);
  if (!isValidOtp) throw new HTTP_ERRORS.CustomError("Entered OTP is invalid");

  await Node.App.Modules.Utils.Otp.Model.updateOne({ _id: lastOtpData._id }, { $set: { verified: true } });
  return true;
};

export const forgotPassword = async (req) => {
  const { error, value } = await ForgotPasswordSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS.CustomError(error.details[0].message);
  }

  let lastOtpData = await Node.App.Modules.Utils.Otp.Model.findOneLast(
    { email: value.email, verified: true },
    { createdAt: -1 },
  );
  if (!lastOtpData) throw new HTTP_ERRORS.CustomError("OTP not found");

  const isValidOtp = await Node.Bcrypt.compare(value.otp, lastOtpData.otp);
  if (!isValidOtp) throw new HTTP_ERRORS.CustomError("Entered OTP is invalid");

  const salt = await Node.Bcrypt.genSalt(10);
  value.password = await Node.Bcrypt.hash(value.password, salt);
  await User.findOneAndUpdate({ email: value.email }, { $set: { password: value.password, tokens: [] } });
  await Node.App.Modules.Utils.Otp.Model.deleteOne({ _id: lastOtpData._id });
  return true;
};

export const updatePassword = async (req) => {
  const { error, value } = await UpdatePasswordSchema.validate(req.body || {});
  if (error) {
    throw new HTTP_ERRORS(error.details[0].message);
  }
  let user = await User.findOne({ _id: req.login_user._id });
  if (!user) throw new HTTP_ERRORS.CustomError("User not found");

  const isMatch = await Node.Bcrypt.compare(value.currentPassword, user.password);
  if (!isMatch) throw new HTTP_ERRORS.CustomError("Current password is incorrect");
  const salt = await Node.Bcrypt.genSalt(10);
  value.newPassword = await Node.Bcrypt.hash(value.newPassword, salt);

  let payload = await User.findOneAndUpdate(
    { _id: req.login_user._id },
    { $set: { password: value.newPassword } },
    { new: true },
  );

  delete payload.password;
  delete payload.tokens;
  delete user.password;
  delete user.tokens;

  eventLog({
    module: Node.MODULE.USER,
    action: Node.API_ACTION.UPDATE_PASSWORD,
    entityId: user._id,
    entityName: user.email || "",
    description: `User (${payload.firstName} ${payload.lastName}) updated password`,
    oldValue: user,
    newValue: payload,
    req,
  });
  return payload;
};

export const lookup = async (req) => {
  let matchObj = { deleted: false };
  let proRole = await Node.App.Modules.Auth.Roles.Model.findOne({
    deleted: false,
    value_code: req.query.value_code || undefined,
  });
  if (!proRole) {
    return [];
  }
  matchObj.roleId = proRole._id;

  return await User.aggregate([
    {
      $match: matchObj,
    },
    {
      $project: {
        _id: 1,
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
      },
    },
    {
      $sort: {
        fullName: 1,
      },
    },
  ]);
};
