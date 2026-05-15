import mongoose from "mongoose";

const servicioSchema = new mongoose.Schema(
  {
    titulo:       { type: String, required: true, trim: true },
    descripcion:  { type: String, default: "" },
    imagen:       { type: String, default: "" },
    precio:       { type: Number, required: true, min: 0 },
    duracion:     { type: Number, required: true, min: 5 }, // minutos
    categoria:    { type: String, default: "General" },
    activo:       { type: Boolean, default: true },
    oferta:       { type: Boolean, default: false },
    precioOferta: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", servicioSchema);