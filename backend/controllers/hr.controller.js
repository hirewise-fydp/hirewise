import { JobDescription } from '../models/job.description.model.js';
import { Form } from '../models/form.model.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createForm = async (req, res) => {
  try {
    console.log(req.body)
    const { jobId, formData } = req.body;
    console.log("jobid",String(jobId))
    // if (!jobId || !formData) {
    //   return res.status(400).json({ error: 'Job ID and form data are required' });
    // }
    // const jobExists = await JobDescription.findById(jobId);
    // if (!jobExists) {
    //   return res.status(404).json({ error: 'Job description not found' });
    // }
    const newForm = await Form.create({jobId, formData} );
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

const processJobDescription = async (jobId) => {
  try {
    // Placeholder for OCR service interaction

    // Simulate processing data
    // setTimeout(async () => {
    //   const processedData = {
    //     description: 'Processed job description data',
    //     skills: ['JavaScript', 'Node.js', 'MongoDB'],
    //     experience: '3-5 years',
    //   };
    //   await JobDescription.findByIdAndUpdate(jobId, { jdData: processedData });
    // }, 10000);
  } catch (error) {
    console.error('Error processing job description:', error);
  }
};

export const processJd = async (req, res) => {
  const filePath = path.join(__dirname, '../uploads/', req.file.filename);

  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));

    const response = await axios.post('http://127.0.0.1:5001/extract-text', formData, {
      headers: formData.getHeaders(),
    });

    // Delete the uploaded file after sending
    fs.unlinkSync(filePath);

    // Respond with the OCR text
    res.json({ text: response.data.text });
  } catch (error) {
    console.error('Error processing image:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error processing image' });
  }
};
