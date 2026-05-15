import { Router }       from "express";
import { requireAdmin } from "../middleware/auth.js";
import { getConfig, updateConfig } from "../controllers/configController.js";

const router = Router();

router.get("/",   getConfig);                    // público
router.patch("/", requireAdmin, updateConfig);   // solo admin

export default router;