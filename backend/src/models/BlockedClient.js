import mongoose from "mongoose";

const blockedClientSchema = new mongoose.Schema(
  {
    telefono:  { type: String, required: true, unique: true, trim: true },
    motivo:    { type: String, default: "" },
    activo:    { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("BlockedClient", blockedClientSchema);
