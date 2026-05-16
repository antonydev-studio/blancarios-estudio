import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import User     from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { enviarCodigoVerificacion, enviarCodigoRecuperacion } from "../services/emailService.js";
import { CONTRASENA_REGEX, CORREO_REGEX } from "../utils/validators.js";

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error("⛔ CRITICAL: JWT_SECRET is missing or too short (< 32 chars). Set a strong secret in Vercel env vars.");
}

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, listaNegraActiva: usuario.listaNegraActiva ?? false },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ── Registro ──────────────────────────────────────────────────────────────────
export async function registro(req, res) {
  try {
    const nombre    = req.body.nombre?.trim();
    const telefono  = req.body.telefono?.trim();
    const correo    = req.body.correo?.trim().toLowerCase();
    const contrasena = req.body.contrasena;

    if (!nombre || !telefono || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
    }

    if (!CORREO_REGEX.test(correo)) {
      return res.status(400).json({ mensaje: "Formato de correo inválido." });
    }

    if (!CONTRASENA_REGEX.test(contrasena)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    const existe = await User.findOne({ correo });
    if (existe) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo." });
    }

    const hash    = await bcrypt.hash(contrasena, 12);
    const usuario = await User.create({ nombre, telefono, correo, contrasena: hash });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoVerificacion = codigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    // Vincular citas huérfanas agendadas con el mismo teléfono antes de tener cuenta.
    // Se compara el teléfono en ambas formas: con y sin formato, usando coincidencia exacta.
    const telefonoLimpio = telefono.replace(/\D/g, "");
    await Appointment.updateMany(
      { clienteTelefono: { $in: [telefonoLimpio, telefono] }, userId: null },
      { userId: usuario._id }
    );

    try {
      await enviarCodigoVerificacion(correo, nombre, codigo);
    } catch (emailErr) {
      console.error("Error enviando correo de verificación:", emailErr);
      await User.findByIdAndDelete(usuario._id);
      return res.status(500).json({ mensaje: "No se pudo enviar el correo de verificación." });
    }

    res.status(201).json({ mensaje: "Código enviado", correo });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Verificar código ───────────────────────────────────────────────────────────
export async function verificarCodigo(req, res) {
  try {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
      return res.status(400).json({ mensaje: "Correo y código son requeridos." });
    }

    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Código incorrecto o expirado." });
    }

    if (
      usuario.codigoVerificacion !== codigo ||
      !usuario.codigoExpira ||
      usuario.codigoExpira < new Date()
    ) {
      return res.status(400).json({ mensaje: "Código incorrecto o expirado." });
    }

    usuario.verificado = true;
    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    await usuario.save();

    const token = generarToken(usuario);
    res.json({ token, usuario });
  } catch (err) {
    console.error("Error en verificarCodigo:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Reenviar código ────────────────────────────────────────────────────────────
export async function reenviarCodigo(req, res) {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ mensaje: "El correo es requerido." });
    }

    const usuario = await User.findOne({ correo, verificado: false });
    if (!usuario) {
      return res.status(400).json({ mensaje: "No se encontró una cuenta pendiente de verificación." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoVerificacion = codigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    try {
      await enviarCodigoVerificacion(correo, usuario.nombre, codigo);
    } catch (emailErr) {
      console.error("Error reenviando correo:", emailErr);
      return res.status(500).json({ mensaje: "No se pudo enviar el código. Intenta de nuevo." });
    }

    res.json({ mensaje: "Código reenviado" });
  } catch (err) {
    console.error("Error en reenviarCodigo:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const correo    = req.body.correo?.trim().toLowerCase();
    const contrasena = req.body.contrasena;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: "Correo y contraseña requeridos." });
    }

    const usuario = await User.findOne({ correo }).select("+contrasena");
    if (!usuario) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    if (!usuario.verificado) {
      return res.status(403).json({
        mensaje: "Cuenta no verificada. Revisa tu correo para activarla.",
        requiereVerificacion: true,
        correo: usuario.correo,
      });
    }

    const valida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valida) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    // Link any orphaned guest appointments booked with this phone
    if (usuario.telefono) {
      const telefonoLimpio = usuario.telefono.replace(/\D/g, "");
      await Appointment.updateMany(
        { clienteTelefono: { $in: [telefonoLimpio, usuario.telefono] }, userId: null },
        { userId: usuario._id }
      );
    }

    const token = generarToken(usuario);
    res.json({ token, usuario });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Olvidé mi contraseña — Paso 1 ────────────────────────────────────────────
export async function olvidéContrasena(req, res) {
  try {
    const correo = req.body.correo?.trim().toLowerCase();
    if (!correo) {
      return res.status(400).json({ mensaje: "El correo es requerido." });
    }

    // Respuesta genérica por seguridad — no revelar si el correo existe
    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.json({ mensaje: "Si ese correo existe, recibirás un código." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoVerificacion = codigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    try {
      await enviarCodigoRecuperacion(correo, usuario.nombre, codigo);
    } catch (emailErr) {
      console.error("Error enviando correo de recuperación:", emailErr);
    }

    res.json({ mensaje: "Si ese correo existe, recibirás un código." });
  } catch (err) {
    console.error("Error en olvidéContrasena:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Olvidé mi contraseña — Paso 2: verificar código ──────────────────────────
export async function verificarCodigoRecuperacion(req, res) {
  try {
    const correo = req.body.correo?.trim().toLowerCase();
    const { codigo } = req.body;

    if (!correo || !codigo) {
      return res.status(400).json({ mensaje: "Correo y código son requeridos." });
    }

    const usuario = await User.findOne({ correo });
    if (
      !usuario ||
      usuario.codigoVerificacion !== codigo ||
      !usuario.codigoExpira ||
      usuario.codigoExpira < new Date()
    ) {
      return res.status(400).json({ mensaje: "Código incorrecto o expirado." });
    }

    // No limpiar el código todavía — se necesita para validar en el Paso 3
    res.json({ ok: true, mensaje: "Código válido." });
  } catch (err) {
    console.error("Error en verificarCodigoRecuperacion:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Olvidé mi contraseña — Paso 3: establecer nueva contraseña ───────────────
export async function nuevaContrasena(req, res) {
  try {
    const correo = req.body.correo?.trim().toLowerCase();
    const { codigo, nuevaContrasena: nuevaPass } = req.body;

    if (!correo || !codigo || !nuevaPass) {
      return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
    }

    if (!CONTRASENA_REGEX.test(nuevaPass)) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    const usuario = await User.findOne({ correo }).select("+contrasena");
    if (
      !usuario ||
      usuario.codigoVerificacion !== codigo ||
      !usuario.codigoExpira ||
      usuario.codigoExpira < new Date()
    ) {
      return res.status(400).json({ mensaje: "Código incorrecto o expirado." });
    }

    usuario.contrasena = await bcrypt.hash(nuevaPass, 12);
    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("Error en nuevaContrasena:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── Verificar sesión activa ───────────────────────────────────────────────────
export async function verificarSesion(req, res) {
  res.json({ usuario: req.usuario });
}
