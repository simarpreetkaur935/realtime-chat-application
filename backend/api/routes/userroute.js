import express from "express";
import isLogin from "../middleware/isLogin.js";
import { getUserBySearch } from "../controllers/userroutecotroller.js";
import { getCurrentChatters } from "../controllers/userroutecotroller.js";


const router = express.Router();

router.get("/search", isLogin, getUserBySearch);
router.get("/currentchatters", isLogin, getCurrentChatters);

export default router;