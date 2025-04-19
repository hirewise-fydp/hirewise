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
import { Form } from '../models/form.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

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


  try {
    const formId = req.params.formId;
    if (!formId) {
      throw new ApiError(400, 'Form ID is required');
    }
    // Find the form by formId to get the associated jobId
    const form = await Form.findById(formId).select('job');
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const jobId = form.job; // Extract jobId from the form
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
    }const localFilePath = path.join(__dirname, '../Uploads/', req.file.filename);
    const cloudinaryResult = await uploadToCloudinary(localFilePath, {
          folder: 'candidate_uploads',
        });
    
        if (!cloudinaryResult) {
          throw new ApiError(500, 'Failed to upload file to Cloudinary');
        }

    // Create application
    const application = await CandidateApplication.create({
      job: jobId,
      candidateName: name,
      candidateEmail: email,
      candidatePhone: phone,
      formData,
      cvFile: {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        format: cloudinaryResult.format,
      },
      status: 'cv_processing',
    });

    console.log('Application created:', application._id);


    // Add to processing queue
    await addCvToQueue({filePath: cloudinaryResult.url, applicationId:application._id});

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


export const getCandidateById = async (req, res) => {
  const {candidateId }= req.params;
  try {
      const candidate = await CandidateApplication.findById(candidateId)
          .populate('job'); // Populates the referenced JobDescription data

      if (!candidate) {
          return res.status(404).json({ message: 'Candidate not found' });
      }

      res.status(200).json(candidate);
  } catch (error) {
      console.error('Error retrieving candidate:', error);
      res.status(500).json({ message: 'Server error', error });
  }
};