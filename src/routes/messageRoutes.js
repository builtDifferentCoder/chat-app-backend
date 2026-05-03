import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getMessages);

export default router;
