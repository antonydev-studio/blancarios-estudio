import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import dotenv   from "dotenv";
import User     from "../models/User.js";

dotenv.config();


const ADMIN_NOMBRE   = "Blanca Ríos";
const ADMIN_TELEFONO = "755 131 3518";
const ADMIN_CORREO   = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    const existe = await User.findOne({ correo: ADMIN_CORREO });
    if (existe) {
      console.log("⚠️  Ya existe un usuario con ese correo. Abortando.");
      process.exit(0);
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      nombre:    ADMIN_NOMBRE,
      telefono:  ADMIN_TELEFONO,
      correo:    ADMIN_CORREO,
      contrasena: hash,
      rol:       "admin",
      verificado: true,
    });

    console.log(`✅ Admin creado: ${ADMIN_CORREO}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createAdmin();