import pkg from 'bullmq';
const { Worker, Queue } = pkg;
import nodemailer from 'nodemailer';  // ✅ Import nodemailer
import { connection } from '../../config/redisConfig.js';
import { extractTextFromFile, cleanupFile, validateJobSchema } from '../../controllers/hr.controller.js';
import generateResponse from '../../services/gptService.js';
import { JobDescription } from '../../models/job.description.model.js';
import { SYSTEM_INSTRUCTIONS, TASK_INSTRUCTIONS } from '../../constants.js';
import dotenv from 'dotenv';
import { User } from '../../models/user.model.js';

dotenv.config();

const deadLetterQueue = new Queue('ocrDeadLetterQueue', { connection });
console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);


// ✅ Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use your email service
  auth: {
    user: process.env.EMAIL_USER,  // Your email
    pass: process.env.EMAIL_PASS   // Your email password (use app password for Gmail)
  }
});

export const worker = new Worker('ocrQueue', async (job) => {
  const { filePath, jobId } = job.data;

  try {
    const extractedText = await extractTextFromFile(filePath);
    const gptResponse = await generateResponse(SYSTEM_INSTRUCTIONS, TASK_INSTRUCTIONS, extractedText);

    if (!validateJobSchema(gptResponse)) {
      throw new Error('Invalid job schema generated by AI');
    }

    await JobDescription.findByIdAndUpdate(jobId, {
      ...gptResponse,
      status: 'completed',
    });

    cleanupFile(filePath);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error.message);
    throw error; // Ensures retries occur
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

    // ✅ Update job status in DB
    const jobEntry = await JobDescription.findByIdAndUpdate(job.data.jobId, {
      status: 'failed',
      error: err.message
    }, { new: true });

    // ✅ Send Email Notification (Only after all retries fail)
    if (jobEntry) {
      const userEmail = await User.findById(jobEntry.userId, 'email');
      if (userEmail) {
        await sendFailureEmail(userEmail.email, jobEntry.jobTitle, job.data.jobId, err.message);
      }
    }
  }
});


// ✅ Email Notification Function
const sendFailureEmail = async (email, jobTitle,jobId, errorMessage) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Job Processing Failed: ${jobTitle}`,
      text: `Hello,\n\nYour job "${jobTitle} with id ${jobId}" failed during processing.\nError: ${errorMessage}\n\nPlease try again or contact support.`,
    });

    console.log(`📧 Failure email sent to ${email}`);
  } catch (emailError) {
    console.error('❌ Failed to send email:', emailError);
  }
};

console.log('Worker is running...');
