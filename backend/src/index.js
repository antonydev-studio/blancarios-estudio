import express           from "express";
import mongoose          from "mongoose";
import cors              from "cors";
import dotenv            from "dotenv";
import rateLimit         from "express-rate-limit";
import authRoutes        from "./routes/auth.js";
import serviceRoutes     from "./routes/services.js";
import appointmentRoutes from "./routes/appointments.js";
import configRoutes      from "./routes/config.js";
import userRoutes        from "./routes/users.js";
import movementRoutes        from "./routes/movements.js";
import blockedClientsRoutes  from "./routes/blockedClients.js";

dotenv.config();

const app  = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://blancariosestudio.com",
  "https://www.blancariosestudio.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { mensaje: "Demasiados intentos. Espera 5 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registroLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: { mensaje: "Demasiados intentos. Espera 30 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login",                   authLimiter);
app.use("/api/auth/registro",                registroLimiter);
app.use("/api/auth/verificar-codigo",        authLimiter);
app.use("/api/auth/olvide-contrasena",       authLimiter);
app.use("/api/auth/verificar-recuperacion",  authLimiter);
app.use("/api/auth/nueva-contrasena",        authLimiter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, mensaje: "Servidor Barber BR funcionando ✓" });
});

app.use("/api/auth",         authRoutes);
app.use("/api/services",     serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/config",       configRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/movements",       movementRoutes);
app.use("/api/blocked-clients", blockedClientsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Error conectando MongoDB:", err.message);
    process.exit(1);
  });