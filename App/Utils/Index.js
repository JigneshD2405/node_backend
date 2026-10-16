import { HTTP_ERRORS } from "#HttpResponse/Index.js";
import Node from "#Node";

export async function sendNotification(
  recipients,
  subject,
  body,
  options = {},
  from = { email: process.env.EMAIL },
  attachments = [],
) {
  const { isEmail = false, isSMS = false, isWhatsApp = false } = options;
  const sendPromises = [];

  if (isEmail && recipients.email?.length) {
    recipients.email.forEach((email, index) => {
      if (email) sendPromises.push(sendEmail(email, from.email, subject.email, body.email[index], attachments));
    });
  }

  if (isSMS) sendPromises.push(sendSMS(recipients.sms, body.sms));
  if (isWhatsApp) sendPromises.push(sendWhatsApp(recipients.whatsapp, body.whatsapp));

  try {
    await Promise.all(sendPromises);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function sendEmail(to, from, subject, html, attachments = []) {
  const transporter = Node.NodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = { from, to, subject, html };
  if (attachments.length > 0) mailOptions.attachments = attachments;
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

export async function sendSMS(data) {
  if (process.env.NODE_ENV !== Node.DEVELOPMENT_ENV && process.env.SMS_KEY) {
    console.log(data.MsgText);
  } else {
    console.log(data.MsgText);
  }
}

export async function sendWhatsApp(to, { templateName, headerPlaceHolder = "", message, language = "en" }) {
  try {
    if (process.env.NODE_ENV === Node.PRODUCTION_ENV && process.env.DOUBLETICK_KEY) {
      Node.DoubleClick.auth(process.env.DOUBLETICK_KEY);
      Node.DoubleClick.outgoingMessagesWhatsappTemplate({
        messages: [
          {
            content: {
              language,
              templateData: { body: { placeholders: message } },
              templateName,
            },
            to: `+91${to}`,
          },
        ],
      })
        .then(({ data }) => {
          if (data?.messages?.[0]?.status === "SENT") {
            console.log("Message sent successfully.");
          } else {
            console.log(`Error: status ${data?.messages?.[0]?.status}, message: ${data?.messages?.[0]?.errorMessage}`);
          }
        })
        .catch((err) => console.error("Error in DoubleClick sendWhatsApp:", err));
    } else {
      console.log(`Sending WhatsApp message to ${to}: ${message}`);
    }
  } catch (error) {
    console.error("Error in sendWhatsApp:", error);
  }
}

export function generateToken(payload) {
  try {
    return Node.Jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
  } catch (error) {
    Node.App.HttpResponse.Response.errorResponse(error);
    throw new Error("Error generating token!");
  }
}

export function verifyToken(token) {
  try {
    const payload = Node.Jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return { status: 200, data: payload };
  } catch (error) {
    Node.App.HttpResponse.Response.errorResponse(error);
    return { status: 400, data: error };
  }
}

export function generateUniqueId() {
  return Node.UUID();
}

export async function renderEmailTemplate(templateName, context) {
  return new Promise((resolve, reject) => {
    Node.Express.render(templateName, context, (err, renderedHtml) => {
      if (err) reject(err);
      else resolve(renderedHtml);
    });
  });
}

export async function generateOtp(digit = 6) {
  if (process.env.NODE_ENV !== Node.DEVELOPMENT_ENV) {
    return digit === 4 ? Math.floor(1000 + Math.random() * 9000) : Math.floor(100000 + Math.random() * 900000);
  } else {
    return digit === 4 ? 1234 : 123456;
  }
}

export function generateFileName(ext) {
  const date = new Date();
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(
    2,
    "0",
  )}${String(date.getHours()).padStart(2, "0")}${Math.floor(1000 + Math.random() * 9000)}${String(
    date.getMinutes(),
  ).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}${String(date.getMilliseconds()).padStart(
    3,
    "0",
  )}.${ext}`;
}

export async function generateAssetsFile(file, name) {
  try {
    const fileName = name.toLowerCase().replaceAll(" ", "-");
    const filePath = Node.Path.join(Node.UploadPath, "../Assets", fileName);
    await Node.Fs.writeFileSync(filePath, file.data);
    return fileName;
  } catch (error) {
    Node.App.HttpResponse.Response.errorResponse(error);
    throw new Error(error.message);
  }
}

export async function generateValueCode(value) {
  try {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_");
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function verifyPassword(password, hashedPassword) {
  return await Node.Bcrypt.compare(password, hashedPassword);
}

export const validateRelatedEntities = async (data) => {
  const { areaId, cityId, stateId } = data;
  const [area, city, state] = await Promise.all([
    Node.App.Modules.Utils.Area.Model.findOne({ _id: areaId, deleted: false }),
    Node.App.Modules.Utils.City.Model.findOne({ _id: cityId, deleted: false }),
    Node.App.Modules.Utils.State.Model.findOne({ _id: stateId, deleted: false }),
  ]);
  if (!area) throw new HTTP_ERRORS.NotFoundError("Area");
  if (!city) throw new HTTP_ERRORS.NotFoundError("City");
  if (!state) throw new HTTP_ERRORS.NotFoundError("State");
  return { area, city, state };
};

export const getNamePrefix = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    const word = parts[0].toUpperCase();
    return word[0] + (word[1] || "X");
  }
  return "XX";
};

export const generatePatientCode = (fullName) => {
  const prefix = getNamePrefix(fullName);

  const randomPart = Math.random().toString(36).substring(2, 8).padEnd(6, "0").toUpperCase();

  return `${prefix}-${randomPart}`;
};

export const createPatient = async (Model, data, session) => {
  let payload;
  if (data.value_code) {
    payload = await Model.createWithSession([{ ...data }], { session });
    return payload;
  }
  while (!payload) {
    const value_code = generatePatientCode(data.fullName);
    try {
      payload = await Model.createWithSession([{ ...data, value_code }], { session });
    } catch (err) {
      if (err.code !== 11000) throw err;
      else {
        throw new HTTP_ERRORS.CustomError(err.message || "Error Occurred in Value Code generation");
      }
    }
  }

  return payload;
};

export const fetchPermissions = async (roleId, userId) => {
  if (!roleId) {
    throw new HTTP_ERRORS.CustomError("Role is required");
  }
  if (!userId) {
    throw new HTTP_ERRORS.CustomError("User is required");
  }

  return await Node.App.Modules.Auth.RolePermission.Model.aggregate([
    {
      $match: {
        roleId: new Node.Mongoose.Types.ObjectId(roleId),
        deleted: false,
      },
    },
    {
      $unionWith: {
        coll: "user-permission",
        pipeline: [
          {
            $match: {
              userId: new Node.Mongoose.Types.ObjectId(userId),
              deleted: false,
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$permissionId",
        doc: {
          $first: "$$ROOT",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$doc",
      },
    },
    {
      $lookup: {
        from: "permissions",
        localField: "permissionId",
        foreignField: "_id",
        as: "permission",
      },
    },
    {
      $unwind: "$permission",
    },
    {
      $group: {
        _id: "$permission.value_code",
        permissions: {
          $addToSet: "$permission.action",
        },
      },
    },
    {
      $project: {
        _id: 0,
        value_code: "$_id",
        permissions: 1,
      },
    },
  ]);
};

export const uploadFile = async (file, folder) => {
  try {
    const ext = file.name?.split(".")[file.name?.split(".").length - 1];
    let fileName = generateFileName(ext);
    const filePath = Node.Path.join(Node.UploadPath, folder, fileName);
    await Node.Fs.writeFileSync(filePath, file.data);

    return { fileName: fileName, doc_path: `${folder}/${fileName}` };
  } catch (error) {
    return { error: error };
  }
};

export const deleteFile = async (filePath) => {
  try {
    const file = Node.Path.join(Node.UploadPath, filePath);

    if (Node.Fs.existsSync(file)) {
      Node.Fs.unlinkSync(file);
    }
  } catch (error) {
    return { error: error };
  }
};

export const generateRandom = function () {
  const date = new Date();
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(
    2,
    "0",
  )}${String(date.getHours()).padStart(2, "0")}${Math.floor(1000 + Math.random() * 9000)}${String(
    date.getMinutes(),
  ).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}${String(date.getMilliseconds()).padStart(3, "0")}`;
};

export const createExcel = async (data, cols) => {
  try {
    let folder = "excel";
    let fileName = `${generateRandom()}.xlsx`;
    let path = Node.Path.join(Node.UploadPath, folder, fileName);

    const workBook = Node.Xlsx.utils.book_new();
    const workSheet = Node.Xlsx.utils.aoa_to_sheet(data);
    if (cols) {
      workSheet["!cols"] = cols;
    }
    Node.Xlsx.utils.book_append_sheet(workBook, workSheet, "Sheet 1");

    Node.Xlsx.writeFile(workBook, path);

    return `/${folder}/${fileName}`;
  } catch (error) {
    return { error: error };
  }
};
