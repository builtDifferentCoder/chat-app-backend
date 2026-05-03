import { Router } from "express";
import {
  signup,
  login,
  googleLogin,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

export default router;
