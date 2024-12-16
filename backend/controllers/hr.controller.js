import { JobDescription } from '../models/job.description.model.js';
import { Form } from '../models/form.model.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from "jsonwebtoken"
import FormData from 'form-data';

import mongoose from 'mongoose';
import axios from 'axios';
import generateResponse from '../services/gptService.js';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createForm = async (req, res) => {
  try {
    const { jobId, formData } = req.body;
    const { ObjectId } = mongoose.Types;
    const ID = new ObjectId(jobId)
    
    const newForm = await Form.create({jobId: ID, formData: formData} );
    res.status(201).json({ message: 'Form created', form: newForm });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create form' });
  }
};

export const createJD = async (req, res) => {
  console.log('JD CREATED');
};

export const fetchAllJobDescriptions = async () => {
  try {
    const jobDescriptions = await JobDescription.find({});
    console.log('All Job Descriptions:', jobDescriptions);
  } catch (err) {
    console.error('Error fetching job descriptions:', err);
  }
};

export const createJobDescription = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    const newJobDescription = await JobDescription.create({ title });
    processJobDescription(newJobDescription._id); // Pass to JD processing
    res.status(201).json({
      message: 'Job description created',
      jobDescription: newJobDescription,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job description' });
  }
};



const SYSTEM_INSTRUCTIONS = `
You are a highly skilled assistant trained to transform raw, unstructured job descriptions into structured JSON data. 
You will map information from the raw job description into a specific schema. 
Follow the schema strictly, and organize data logically and consistently. 
Extract all relevant details accurately, and format the output as a JSON object. 
Do not skip any details that fit into the schema.
Provide only the valid json in the output with no other information in the response other than json
`;

const TASK_INSTRUCTIONS = `
Read the given raw job description. Transform the unstructured text into a structured JSON object based on the following schema:

{
  jobSummary: String,
  keyResponsibilities: [String],
  qualifications: {
    education: String,
    experience: String,
    skills: [String]
  },
  location: String,
  compensation: {
    salaryRange: String,
    benefits: [String]
  },
  applicationProcess: String
}

Ensure:
- jobSummary captures the "Job Purpose" section.
- keyResponsibilities is an array of individual responsibilities from the "Principal Accountabilities" section.
- qualifications.education reflects the required education level.
- qualifications.experience describes required experience.
- qualifications.skills is an array of skills mentioned.
- location specifies the job location.
- compensation.salaryRange includes any salary details mentioned (if available, otherwise leave empty).
- compensation.benefits includes an array of benefits (if available, otherwise leave empty).
- applicationProcess captures how candidates are expected to apply or any application-related notes.

For missing fields (e.g., salary details or benefits), include the property but leave the value as null or an empty array ([]) as appropriate.
Follow the schema format exactly. Use arrays where specified. Retain all essential details and omit extraneous or irrelevant information.
`;

export const processJd = async (req, res) => {
  const filePath = path.join(__dirname, '../uploads/', req.file.filename);
  const { title } = req.body;
  const  {accessToken}=req.cookies
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const userid=decoded._id;

  if (!title) {
    return res.status(400).json({ error: 'Job title is required' });
  }

  try {
    
    const newJob = await JobDescription.create({userId:userid, jobTitle: title });
    const extractedText = await extractTextFromFile(filePath);

    
    const gptResponse = await generateResponse(SYSTEM_INSTRUCTIONS, TASK_INSTRUCTIONS, extractedText);
    console.log("GPT RESPONSE", gptResponse);
    

    
    Object.assign(newJob, gptResponse);
    await newJob.save();

    
    res.status(201).json({
      message: 'Job description created and processed successfully',
      jobDescription: newJob,
    });
  } catch (error) {
    console.error('Error handling job description:', error.response?.data || error.message);

    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to process and create job description' });
    }
  } finally {
    
    cleanupFile(filePath);
  }
};

// export const processJd = async (req, res) => {
//   console.log("REQUEST", req.cookies);


//   const {accessToken} = req.cookies
//   const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  


  
//   res.status(201).json({
//           message: 'Job description created and processed successfully',
          
//         });
// };
/**
 * Extracts text from the uploaded file using the OCR service.
 *
 * @param {string} filePath - Path to the uploaded file.
 * @returns {Promise<string>} - Extracted text from the file.
 */

const extractTextFromFile = async (filePath) => {
  console.log("FILEPAT", filePath);
  
  const formData = new FormData();
  formData.append('image', fs.createReadStream(filePath));

  const response = await axios.post('http://127.0.0.1:5001/extract-text', formData, {
    headers: formData.getHeaders(),
  });

  return response.data.text;
};

/**
 * Deletes the file at the specified path.
 *
 * @param {string} filePath - Path to the file to delete.
 */


const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error.message);
  }
};