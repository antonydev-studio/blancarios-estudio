import { Router }           from "express";
import {
  registro, login, verificarSesion, verificarCodigo, reenviarCodigo,
  olvidéContrasena, verificarCodigoRecuperacion, nuevaContrasena,
} from "../controllers/authController.js";
import { requireAuth }      from "../middleware/auth.js";

const router = Router();

router.post("/registro",                 registro);
router.post("/login",                    login);
router.post("/verificar-codigo",         verificarCodigo);
router.post("/reenviar-codigo",          reenviarCodigo);
router.post("/olvide-contrasena",        olvidéContrasena);
router.post("/verificar-recuperacion",   verificarCodigoRecuperacion);
router.post("/nueva-contrasena",         nuevaContrasena);
router.get("/me",                        requireAuth, verificarSesion);

export default router;
