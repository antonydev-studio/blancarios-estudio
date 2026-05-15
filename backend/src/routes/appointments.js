import { Router }       from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createAppointment,
  getMisAppointments,
  getOccupiedSlots,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  patchClienteAppointment,
  autoFinalizarCitas,
} from "../controllers/appointmentController.js";

const router = Router();

router.post("/",                    createAppointment);                      // público
router.get("/mias",                 requireAuth,  getMisAppointments);       // cliente
router.get("/occupied",             getOccupiedSlots);                       // público — ANTES de /:id
router.get("/auto-finalizar",       requireAdmin, autoFinalizarCitas);       // admin — ANTES de /:id
router.get("/",                     requireAdmin, getAllAppointments);        // admin
router.patch("/mias/:id",           requireAuth,  patchClienteAppointment);  // cliente
router.patch("/:id",                requireAdmin, updateAppointment);         // admin
router.delete("/:id",               requireAdmin, deleteAppointment);        // admin

export default router;