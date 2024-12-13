import express from 'express';
import { createForm, createJD, fetchAllJobDescriptions } from '../controllers/hr.controller.js';

const router = express.Router();

// Define route handlers
router.get('/create-form', createForm);
router.get('/create-jd', createJD);
// router.get('/get-all', fetchAllJobDescriptions)



export default router;
