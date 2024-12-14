import express from 'express';
import { createJD, createJobDescription,createForm } from '../controllers/hr.controller.js';

const router = express.Router();

// Define route handlers
router.get('/create-form', createForm);
router.get('/create-jd', createJD);
router.post('/createjob', createJobDescription);
// router.get('/get-all', fetchAllJobDescriptions)



export default router;
