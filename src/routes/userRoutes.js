import { Router } from "express";
import { searchUsers, getUserById } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserById);

export default router;
