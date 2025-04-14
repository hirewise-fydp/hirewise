import { Queue } from 'bullmq';
import { connection } from '../config/redisConfig.js';

export const ocrQueue = new Queue('ocrQueue', { connection });
export const cvQueue = new Queue('cvQueue', { connection });
