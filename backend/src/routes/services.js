import { Router }     from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = Router();

router.get("/",      getServices);               // público
router.post("/",     requireAdmin, createService);
router.patch("/:id", requireAdmin, updateService);
router.delete("/:id",requireAdmin, deleteService);

export default router;