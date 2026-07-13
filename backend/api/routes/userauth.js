import express from "express";
import { userRegister } from "../controllers/usercontroller.js";
import { userLogin } from "../controllers/usercontroller.js";
import { userLogOut } from "../controllers/usercontroller.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login",userLogin);
router.post("/logout",userLogOut);

export default router;