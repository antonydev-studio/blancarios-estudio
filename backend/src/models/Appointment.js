import mongoose from "mongoose";

const citaSchema = new mongoose.Schema(
  {
    fecha:    { type: String, required: true }, // "2024-07-15" — ISO yyyy-mm-dd
    hora:     { type: String, required: true }, // "10:00 AM"
    servicios:{ type: [String], required: true },
    duracion: { type: Number, required: true },
    precio:   { type: Number, required: true },
    estado:   {
      type: String,
      enum: ["pendiente", "confirmada", "finalizada", "cancelada"],
      default: "pendiente",
    },
    // Cliente — puede ser usuario registrado o invitado
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    clienteNombre:   { type: String, required: true },
    clienteTelefono: { type: String, required: true },
    clienteCorreo:   { type: String, default: "" },
    // Notas internas del admin
    notasAdmin: { type: String, default: "" },
    // Reagendado por el cliente — solo se permite una vez
    reagendada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Garantiza que no existan dos citas activas en el mismo {fecha, hora}
citaSchema.index(
  { fecha: 1, hora: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: { $ne: "cancelada" } },
    name: "unique_fecha_hora_no_cancelada",
  }
);

export default mongoose.model("Appointment", citaSchema);