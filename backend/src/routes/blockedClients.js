import { Router }           from "express";
import { requireAdmin }      from "../middleware/auth.js";
import {
  getBlockedClients,
  createBlockedClient,
  toggleBlockedClient,
  deleteBlockedClient,
} from "../controllers/blockedClientController.js";

const router = Router();

router.get("/",       requireAdmin, getBlockedClients);
router.post("/",      requireAdmin, createBlockedClient);
router.patch("/:id",  requireAdmin, toggleBlockedClient);
router.delete("/:id", requireAdmin, deleteBlockedClient);

export default router;
