import { JobDescription } from '../models/job.description.model.js';
import { Form } from '../models/form.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from "jsonwebtoken";
import { uploadToCloudinary, safeCleanup } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { addJobToQueue } from '../Queue/jd/ocrProducer.js';
import { ocrQueue } from '../Queue/Queue.js';
import { CandidateApplication } from '../models/candidate.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ];
  const maxSize = 10 * 1024 * 1024;

  if (!file) throw new ApiError(400, 'No file provided');
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(400, 'Invalid file type. Please upload a PDF, Word document, or image.');
  }
  if (file.size > maxSize) {
    throw new ApiError(400, 'File size exceeds the limit of 10MB.');
  }
};



export const validateJobSchema = (data) => {
  const requiredFields = ['jobSummary', 'keyResponsibilities', 'qualifications', 'location', 'applicationProcess'];
  return requiredFields.every((field) => data[field] !== undefined);
};


export const processJd = async (req, res) => {
  const { title, modules } = req.body;
  const { accessToken } = req.cookies;

  try {
    if (!req.file) throw new ApiError(400, 'No file uploaded');
    if (!title) throw new ApiError(400, 'Job title is required');

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    validateFile(req.file);

    const localFilePath = path.join(__dirname, '../Uploads/', req.file.filename);

    const cloudinaryResult = await uploadToCloudinary(localFilePath, {
      folder: 'hr_uploads',
    });

    if (!cloudinaryResult) {
      throw new ApiError(500, 'Failed to upload file to Cloudinary');
    }

    const newJob = await JobDescription.create({
      userId: decoded._id,
      jobTitle: title,
      modules,
      status: 'pending',
      file: {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        format: cloudinaryResult.format,
      },
    });

    await addJobToQueue(cloudinaryResult.url, newJob._id);

    res.status(201).json({
      message: 'Job uploaded, processing in background.',
      jobId: newJob._id,
      fileUrl: cloudinaryResult.url,
    });
  } catch (error) {
    if (req.file) {
      await safeCleanup(path.join(__dirname, '../Uploads/', req.file.filename));
    }
    console.error('Error processing job:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Processing failed',
    });
  }
};



export const createForm = async (req, res) => {
  try {
    const { jobId, fields } = req.body;
    console.log('Request received to create form:', jobId, fields);


    const jobExists = await JobDescription.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ error: 'Job not found' });
    }


    const newForm = new Form({ job: jobId, fields });
    await newForm.save();

    return res.status(201).json({ message: 'Form created successfully', formId: newForm._id });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getFormById = async (req, res) => {
  try {
    console.log('Request received to fetch Form');

    const { formId } = req.params;
    console.log('Form ID:', formId);

    if (!formId) {
      return res.status(400).json({ message: 'Form ID is required' });
    }

    const form = await Form.findById(formId).populate('job');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const retryJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const failedJob = await JobDescription.findById(jobId);

    if (!failedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (failedJob.status !== 'failed') {
      return res.status(400).json({ message: 'Job is not in failed state' });
    }

    await ocrQueue.add('retryJob', {
      filePath: failedJob.filePath,
      jobId: failedJob._id
    });

    await JobDescription.findByIdAndUpdate(jobId, { status: 'retrying' });

    res.json({ message: `Job ${jobId} has been requeued for processing.` });
  } catch (error) {
    console.error('Error retrying job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export const getJobDescriptionById = async (req, res) => {
  try {
    console.log('Request received to fetch Job Description');

    const { id } = req.params;
    console.log('ID:', id);

    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const jobDescription = await JobDescription.findById(id);
    if (!jobDescription) {
      return res.status(404).json({ message: 'Job Description not found' });
    }

    res.status(200).json(jobDescription);
  } catch (error) {
    console.error('Error fetching job description:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// export const findAllJobDescription = async (req, res) => {
//   try {
//     console.log('Request received to fetch all Job Descriptions');

//     const jobDescriptions = await JobDescription.find();
//     res.status(200).json(jobDescriptions);
//   } catch (error) {
//     console.error('Error fetching job descriptions:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

export const findAllJobDescription = async (req, res) => {
  try {
    console.log("Request received to fetch all Job Descriptions with Form ID");

    const jobsWithFormId = await JobDescription.aggregate([
      {
        $lookup: {
          from: "forms", // collection name in MongoDB
          localField: "_id",
          foreignField: "job",
          as: "form"
        }
      },
      {
        $addFields: {
          formId: { $arrayElemAt: ["$form._id", 0] }
        }
      },
      {
        $project: {
          form: 0 // exclude full form data if you only want formId
        }
      }
    ]);

    res.status(200).json(jobsWithFormId);
  } catch (error) {
    console.error("Error fetching job descriptions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    console.log('Request received to update Job');
    const { id } = req.params;
    const updateData = req.body;

    console.log(updateData, 'updateData');


    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await JobDescription.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }


    Object.keys(updateData).forEach((key) => {
      job[key] = updateData[key];
    });

    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



export const getAllCandidate = async (req, res) => {
  const { id } = req.params;

  try {
    // const jobId = mongoose.Types.ObjectId(id);
    const candidates = await CandidateApplication.find({ job: id }).populate('job').exec();

    if (!candidates) {
      return res.status(404).json({ message: 'No candidates found for this job' });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}