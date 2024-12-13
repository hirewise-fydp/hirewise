import { JobDescription } from '../models/job-description.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createForm = async (req, res) => {
    console.log("FORM CREATED");
    
}

export const createJD = async(req, res) => {
    console.log("JD CREATED");
    
}

export const fetchAllJobDescriptions = async () => {
    try {
      const jobDescriptions = await JobDescription.find({});
      console.log('All Job Descriptions:', jobDescriptions);
    } catch (err) {
      console.error('Error fetching job descriptions:', err);
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
