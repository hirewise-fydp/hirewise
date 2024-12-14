import express from 'express';
import { createJD, createForm, processJd } from '../controllers/hr.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Define route handlers
router.post('/create-form', createForm);
router.get('/create-jd', createJD);
// router.post('/createjob', createJobDescription);
router.post('/process-jd', upload.single('image'), processJd);



export default router;
