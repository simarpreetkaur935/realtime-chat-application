import express from "express";
import {sendMessage, getMessage, markConversationRead} from "../controllers/messagecontroller.js"
import isLogin from "../middleware/isLogin.js"

const router = express.Router();

router.post("/send/:id",isLogin,sendMessage);
router.patch("/read/:id",isLogin,markConversationRead);
router.get("/:id",isLogin,getMessage)

export default router;
