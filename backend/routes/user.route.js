import { Router } from "express";
import { registerUser, loginUser, checkAuth, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logoutUser)
router.post("/refresh-token", refreshAccessToken);

router.get("/auth/check", checkAuth);

export default router;