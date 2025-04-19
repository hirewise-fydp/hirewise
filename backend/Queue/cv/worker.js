
import { Worker } from 'bullmq';
import { connection } from '../../config/redisConfig.js';
import { extractTextFromFile } from '../../utils/ocr.utils.js';
import dotenv from 'dotenv';
import { SYSTEM_INSTRUCTIONS_CV_PROCESSING, TASK_INSTRUCTIONS_CV_PROCESSING } from '../../constants.js';
import { CandidateApplication } from '../../models/candidate.model.js';
import generateResponse from '../../services/gptService.js';
import { evaluateCandidate } from '../../services/evaluationService.js';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const cvWorker = new Worker('cvQueue', async (job) => {
    let tempFilePath = null;
    try {
        const { filePath, applicationId } = job.data;
        console.log('CV Worker Job Data:', { filePath, applicationId });

        
        // Process the file
        const extractedText = await extractTextFromFile( filePath );
        console.log('extractedText Resume:', extractedText);

        const parsedResume = await generateResponse(
            SYSTEM_INSTRUCTIONS_CV_PROCESSING,
            TASK_INSTRUCTIONS_CV_PROCESSING,
            extractedText
        );
        console.log('Parsed Resume:', parsedResume);

        await CandidateApplication.findByIdAndUpdate(applicationId, {
            parsedResume,
            status: 'cv_processed'
        });

        await evaluateCandidate(applicationId);

    } catch (error) {
        console.error(`CV Processing failed for application ${job.data.applicationId}:`, error.message);
        throw error;
    } finally {
        // Clean up temporary file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                console.log('Cleaned up temporary file:', tempFilePath);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary file:', cleanupError);
            }
        }
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