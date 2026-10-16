import Node from '#Node';
const commonSchema = new Node.Mongoose.Schema({
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
  createdBy: { type: Node.Mongoose.Schema.Types.ObjectId, required: true, immutable: true },
  updatedBy: { type: Node.Mongoose.Schema.Types.ObjectId, required: true },
  deletedBy: { type: Node.Mongoose.Schema.Types.ObjectId, default: null },
  status: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
})


export default commonSchema;

