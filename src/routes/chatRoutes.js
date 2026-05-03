import { Router } from "express";
import {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, getChats);

router.post("/group", authMiddleware, createGroupChat);
router.put("/group/rename", authMiddleware, renameGroup);
router.put("/group/add", authMiddleware, addToGroup);
router.put("/group/remove", authMiddleware, removeFromGroup);

export default router;
