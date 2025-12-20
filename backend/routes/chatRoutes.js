import express from "express";
import {
  createChat,
  getChatMessages,
  deleteChat,
} from "../controllers/chatController.js";
import { uploadChatFiles } from "../controllers/uploadFiles.js";
import { protect } from "../middlewares/authmiddleware.js";
import { sendMessage } from "../controllers/sendMessage.js";
import upload from "../lib/multer.js";
const router = express.Router();

router.get("/send", protect, sendMessage);
router.post("/create", protect, createChat);
router.post("/upload", protect, upload.fields([{ name: "files", maxCount: 3 }]), uploadChatFiles);
router.post("/send", protect, sendMessage);
router.get("/:chatId/messages", protect,getChatMessages);
router.delete('/:chatId', protect, deleteChat);

export default router;
