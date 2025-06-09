import express from 'express';
import { createForm, findAllJobDescription, getFormById, getJobDescriptionById, processJd, updateJob, getAllCandidate, createManualTest, generateAITestQuestions, saveAITest, hasTest  } from '../controllers/hr.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.post('/createForm', createForm);
router.get('/getForm/:formId', getFormById);
router.post('/process-jd', upload.single('image'), processJd);
router.get('/findJd/:id', getJobDescriptionById);
router.get('/findAll/:id', findAllJobDescription);
router.post("/tests/manual", createManualTest);
router.post("/tests/ai/generate", generateAITestQuestions);
router.post("/tests/ai/save", saveAITest);
router.get('/hasTest/:jobId', hasTest)
router.put('/updateJob/:id', updateJob);
router.get('/getAllCandidate/:id', getAllCandidate);


export default router;