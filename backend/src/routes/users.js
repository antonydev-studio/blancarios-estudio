import { Router }      from "express";
import { requireAdmin } from "../middleware/auth.js";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

router.get("/",       requireAdmin, getUsers);
router.patch("/:id",  requireAdmin, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

export default router;
