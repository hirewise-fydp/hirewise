import { cvQueue } from "../Queue.js";

export const addJobToQueue = async (filePath, jobId) => {
  await cvQueue.add('processJD', { filePath, jobId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false
  });
};



