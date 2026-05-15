// src/models/Movement.js

import mongoose from "mongoose";

const movementSchema = new mongoose.Schema(
  {
    tipo:         { type: String, enum: ["ingreso", "egreso"], required: true },
    monto:        { type: Number, required: true, min: 0.01 },
    descripcion:  { type: String, required: true, trim: true },
    fecha:        { type: String, required: true }, // ISO yyyy-mm-dd
    hora:         { type: String, default: "" },
    esAutomatico: { type: Boolean, default: false },
    citaId:       { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Movement || mongoose.model("Movement", movementSchema);
