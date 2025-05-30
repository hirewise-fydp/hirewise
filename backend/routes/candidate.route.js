import express from "express";
import {
  getApplicationStatus,
  submitApplication,
  getCandidateById
} from "../controllers/candidate.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// router.get("/getformdata/:formId", getFormData);
router.post("/apply/:formId", upload.single("cv"), submitApplication);

router.get("/status/:applicationId", getApplicationStatus);
router.get("/:candidateId", getCandidateById);

export default router;
