import mongoose from "mongoose";

const horarioDiaSchema = new mongoose.Schema(
  {
    cerrado: { type: Boolean, default: false },
    inicio:  { type: Number, default: 9 },  // hora en entero, ej: 9 = 9am
    fin:     { type: Number, default: 21 },
  },
  { _id: false } // subdocumento sin id propio
);

const razonHomeSchema = new mongoose.Schema(
  { id: String, titulo: String, texto: String },
  { _id: false }
);

const servicioHomeSchema = new mongoose.Schema(
  { id: String, titulo: String, descripcion: String, imagen: String },
  { _id: false }
);

const configSchema = new mongoose.Schema(
  {
    // Singleton — siempre un solo documento de config
    clave:      { type: String, default: "global", unique: true },
    heroImagen:    { type: String, default: "" },
    serviciosHome: { type: [servicioHomeSchema], default: [] },
    razonesHome:   { type: [razonHomeSchema], default: [] },
    intervalo: { type: Number, default: 15 }, // minutos entre slots (siempre 15, no configurable)
    bufferMinutos: { type: Number, default: 30 },
    horarioPorDia: {
      type: Map,
      of: horarioDiaSchema,
      default: {
        "0": { cerrado: true,  inicio: 9, fin: 21 },
        "1": { cerrado: false, inicio: 12, fin: 21 },
        "2": { cerrado: false, inicio: 12, fin: 21 },
        "3": { cerrado: false, inicio: 12, fin: 21 },
        "4": { cerrado: false, inicio: 12, fin: 21 },
        "5": { cerrado: false, inicio: 12, fin: 21 },
        "6": { cerrado: false, inicio: 12, fin: 21 },
      },
    },
    diasCerrados:        { type: [Number], default: [0] },
    diasBloqueados:      { type: [String], default: [] }, // fechas ISO
    horasBloqueadasPorDia: { type: Map, of: [String], default: {} },
    diasAbiertosExcepcion: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Config", configSchema);