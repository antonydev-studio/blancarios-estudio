// src/routes/movements.js

import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  getMovements,
  createMovement,
  deleteMovement,
} from "../controllers/movementController.js";

const router = Router();

router.get("/",       requireAdmin, getMovements);
router.post("/",      requireAdmin, createMovement);
router.delete("/:id", requireAdmin, deleteMovement);

export default router;
