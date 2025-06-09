// routes/test.routes.js
import express from "express";
import { accessTest, submitTest, resendTestInvitation } from "../controllers/test.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/access", accessTest); 
router.post("/submit", submitTest); 


router.post("/resend-invitation/:applicationId", verifyJWT, resendTestInvitation);

export default router;