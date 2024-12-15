import express from "express";
import { getFormData } from "../controllers/candidate.controller.js";

const router = express.Router();

router.get("/getformdata/:formId", getFormData);

export default router;
