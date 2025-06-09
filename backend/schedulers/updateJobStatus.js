import cron from 'node-cron';
import { JobDescription } from '../models/job.description.model.js';


const updateExpiredJobs = async () => {
  try {
    const currentDate = new Date();
    const result = await JobDescription.updateMany(
      {
        'activeDuration.endDate': { $lt: currentDate },
        jobExpired: true,
      },
      { $set: { jobExpired: false } }
    );
    console.log(`Updated ${result.modifiedCount} job descriptions' isActive flags.`);
  } catch (error) {
    console.error('Error updating isActive flags in cron job:', error);
  }
};


const initializeCronJobs = () => {
  
  cron.schedule('0 0 * * *', updateExpiredJobs, {
    timezone: 'Asia/Karachi', // Set to Pakistan Standard Time
  });
  console.log('Cron job for updating job status initialized.');
};

export { initializeCronJobs };