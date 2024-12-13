import express from 'express';
import { createForm, createJD, fetchAllJobDescriptions, processJd } from '../controllers/hr.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Define route handlers
router.get('/create-form', createForm);
router.get('/create-jd', createJD);
router.post('/process-jd', upload.single('image'), processJd);



export default router;
