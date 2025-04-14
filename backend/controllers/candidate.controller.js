// controllers/candidate.controller.js
import { CandidateApplication } from '../models/candidate.model.js';
import { JobDescription } from '../models/job.description.model.js';
import { ApiError } from '../utils/ApiError.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { addCvToQueue } from '../Queue/cv/producer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File cleanup helper
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

// Submit application
export const submitApplication = async (req, res) => {
  console.log('Received application:', req.body, req.file);
  console.log(req.params.jobId);


  try {
    const jobId = req.params.jobId;
    const { name, email, phone, ...formData } = req.body;
    const cvFile = req.file;

    // Validate
    if (!cvFile || !name || !email) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Verify job exists
    const job = await JobDescription.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    // Create application
    const application = await CandidateApplication.create({
      job: jobId,
      candidateName: name,
      candidateEmail: email,
      candidatePhone: phone,
      formData,
      cvFile: cvFile.path,
      status: 'cv_processing',
    });

    console.log('Application created:', application._id);


    // Add to processing queue
    await addCvToQueue({ filePath: cvFile.path, applicationId: application._id });

    return res.status(202).json({
      success: true,
      statusCode: 202,
      data: {
        applicationId: application._id,
        status: application.status,
      },
      message: 'Application received and processing',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      data: null,
      message: error.message || 'Internal server error',
    });
  }
};

// Check application status
export const getApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await CandidateApplication.findById(applicationId, 'status cvScore testScore');

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: application,
      message: 'Application status retrieved successfully',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      data: null,
      message: error.message || 'Internal server error',
    });
  }
};