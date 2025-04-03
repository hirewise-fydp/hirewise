import express from 'express';
import { createForm, findAllJobDescription, getFormById, getJobDescriptionById, processJd, updateJob } from '../controllers/hr.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.post('/createForm', createForm);
router.get('/getForm/:formId', getFormById);
router.post('/process-jd', upload.single('image'), processJd);
router.get('/findJd/:id', getJobDescriptionById);
router.get('/findAll', findAllJobDescription);
router.put('/updateJob/:id', updateJob);




export default router;