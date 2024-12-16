import express from "express";
import { getFormData, processResume } from "../controllers/candidate.controller.js";
import { upload } from '../middlewares/multer.middleware.js';
import { compareResumeToJobDescription } from "../controllers/comparision.controller.js";


const router = express.Router();

router.get("/getformdata/:formId", getFormData);
router.post('/process-Resume', upload.single('image'), processResume);
router.post('/compare', compareResumeToJobDescription);

export default router;
