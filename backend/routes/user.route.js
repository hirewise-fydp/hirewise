import { Router } from "express";
import { registerUser, loginUser, checkAuth } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/auth/check", checkAuth);

export default router;