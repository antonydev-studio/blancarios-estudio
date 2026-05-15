import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre:    { type: String, required: true, trim: true },
    telefono:  { type: String, required: true, trim: true },
    correo:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    contrasena:{ type: String, required: true },
    rol:       { type: String, enum: ["cliente", "admin"], default: "cliente" },
    verificado:         { type: Boolean, default: false },
    codigoVerificacion: { type: String,  default: null },
    codigoExpira:       { type: Date,    default: null },
    listaNegraActiva: { type: Boolean, default: false },
    notas:     { type: String, default: "" },
  },
  { timestamps: true }
);

// Nunca devolver la contraseña en las respuestas JSON
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.contrasena;
  return obj;
};

export default mongoose.models.User || mongoose.model("User", usuarioSchema);