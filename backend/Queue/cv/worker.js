// queue/cvQueue.js
import { Worker } from 'bullmq';
import { connection } from '../../config/redisConfig.js';
import { extractTextFromFile, cleanupFile } from '../../controllers/hr.controller.js';
import dotenv from 'dotenv';
import { SYSTEM_INSTRUCTIONS_CV_PROCESSING, TASK_INSTRUCTIONS_CV_PROCESSING } from '../../constants.js';
import { CandidateApplication } from '../../models/candidate.model.js';
import generateResponse from '../../services/gptService.js';
import { evaluateCandidate } from '../../services/evaluationService.js';

dotenv.config();


export const cvWorker = new Worker('cvQueue', async (job) => {

    try {
        const { filePath, applicationId } = job.data;
        const extractedText = await extractTextFromFile(filePath);

        const parsedResume = await generateResponse(
            SYSTEM_INSTRUCTIONS_CV_PROCESSING,
            TASK_INSTRUCTIONS_CV_PROCESSING,
            extractedText
        );

        await CandidateApplication.findByIdAndUpdate(applicationId, {
            parsedResume,
            status: 'cv_processed'
        });

        await evaluateCandidate(applicationId);

        cleanupFile(filePath);

    } catch (error) {
        console.error(`CV Processing failed for application ${applicationId}:`, error);
        throw error;
    }
}, {
    connection,
    concurrency: 3,
    limiter: {
        max: 10,
        duration: 1000
    }
});

cvWorker.on('completed', (job) => {
    console.log(`CV processing completed for application ${job.data.applicationId}`);
});

cvWorker.on('failed', async (job, err) => {
    console.error(`CV processing failed for application ${job.data.applicationId}:`, err.message);

    await CandidateApplication.findByIdAndUpdate(job.data.applicationId, {
        status: 'cv_processing_failed',
        error: err.message
    });
});