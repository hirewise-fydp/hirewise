// Queue/producer.js
import { cvQueue } from "../Queue.js";

export const addCvToQueue = async ({ filePath, applicationId }) => {
    await cvQueue.add('processCV', { filePath, applicationId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false
    });
};