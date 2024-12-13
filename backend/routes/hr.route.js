import express from 'express';
import { createForm, createJD, createJobDescription,createForm, fetchAllJobDescriptions } from '../controllers/hr.controller.js';

const router = express.Router();

// Define route handlers
router.get('/create-form', createForm);
router.get('/create-jd', createJD);
router.post('/createjob', createJobDescription);
router.post('/createforms', createForm);
// router.get('/get-all', fetchAllJobDescriptions)



export default router;
