import { Worker, Queue } from 'bullmq';
import { connection } from '../../config/redisConfig.js';
import { validateJobSchema } from '../../controllers/hr.controller.js';
import { extractTextFromFile } from '../../utils/ocr.utils.js';
import generateResponse from '../../services/gptService.js';
import { JobDescription } from '../../models/job.description.model.js';
import { SYSTEM_INSTRUCTIONS_JD_PROCESSING, TASK_INSTRUCTIONS_JD_PROCESSING } from '../../constants.js';
import { User } from '../../models/user.model.js';
import { sendJobFailureEmail } from '../../utils/email.js';
import dotenv from 'dotenv';

dotenv.config();

const deadLetterQueue = new Queue('ocrDeadLetterQueue', { connection });

export const worker = new Worker('ocrQueue', async (job) => {
  const { filePath, jobId } = job.data;
  console.log(`Processing job ${job.id} with filePath: ${filePath}`); 

  try {
    const extractedText = await extractTextFromFile(filePath);
    console.log('Extracted Text:', extractedText);
    const gptResponse = await generateResponse(SYSTEM_INSTRUCTIONS_JD_PROCESSING, TASK_INSTRUCTIONS_JD_PROCESSING, extractedText);
    console.log('GPT Response:', gptResponse);
    

    await JobDescription.findByIdAndUpdate(jobId, {
      ...gptResponse,
      status: 'completed',
    });
    
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error.message);
    throw error;
  }
}, { connection, concurrency: 5 });

worker.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed attempt ${job.attemptsMade}/${job.opts.attempts}:`, err.message);

  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`Job ${job.id} failed after all retries.`);

    await deadLetterQueue.add('failedJob', job.data, {
      removeOnComplete: false,
      removeOnFail: false
    });

    // Update job status in DB
    const jobEntry = await JobDescription.findByIdAndUpdate(job.data.jobId, {
      status: 'failed',
      error: err.message
    }, { new: true });

    // Send email notification using utility
    if (jobEntry) {
      const userEmail = await User.findById(jobEntry.userId, 'email');
      if (userEmail?.email) {
        try {
          await sendJobFailureEmail({
            email: userEmail.email,
            jobTitle: jobEntry.jobTitle,
            jobId: job.data.jobId,
            errorMessage: err.message
          });
        } catch (emailError) {
          console.error('❌ Email notification failed:', emailError);
        }
      }
    }
  }
});

console.log('Worker is running...');