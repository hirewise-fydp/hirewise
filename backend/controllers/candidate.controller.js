import { Form } from '../models/form.model.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';


import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiError.js';
const { ObjectId } = mongoose.Types;

import axios from 'axios';
import generateResponse from '../services/gptService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFormData = async (req, res) => {
  const { formId } = req.params;
  const formid=new ObjectId(formId)
  console.log(formid)

  try {
    const form = await Form.findById(formid);
    console.log("form",form)
    res.status(200).json({ fields: form.formData });
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Something went wrong while fetching the form data." });
  }
};



const SYSTEM_INSTRUCTIONS = `
You are a highly skilled assistant trained to transform raw, unstructured resumes into structured JSON data. 
You will map information from the raw resume into a specific schema. 
Follow the schema strictly, and organize data logically and consistently. 
Extract all relevant details accurately, and format the output as a JSON object. 
Do not skip any details that fit into the schema.
Provide only the valid JSON in the output with no other information in the response other than JSON.
`;

const TASK_INSTRUCTIONS = `
Read the given raw resume. Transform the unstructured text into a structured JSON object based on the following schema:

{
  "personalInfo": {
    "fullName": "String",
    "email": "String",
    "phone": "String",
    "linkedin": "String", // Optional
    "portfolio": "String", // Optional
    "address": "String" // Optional
  },
  "skills": [
    {
      "category": "String", // e.g., Technical, Soft Skills, Management, Design, etc.
      "skillsList": ["String"] // List of specific skills
    }
  ],
  "experience": [
    {
      "companyName": "String",
      "role": "String",
      "startDate": "Date",
      "endDate": "Date", // Null if still working
      "description": "String",
      "keyAchievements": ["String"] // List of achievements or responsibilities
    }
  ],
  "education": [
    {
      "degree": "String",
      "institution": "String",
      "graduationYear": "Number"
    }
  ],
  "certifications": [
    {
      "title": "String",
      "issuingOrganization": "String",
      "issueDate": "Date"
    }
  ],
  "projects": [
    {
      "title": "String",
      "description": "String",
      "technologiesOrToolsUsed": ["String"], // Generalized for all domains
      "link": "String"
    }
  ],
  "achievements": ["String"], // Awards, honors, or recognitions
  "internships": [
    {
      "companyName": "String",
      "role": "String",
      "startDate": "Date",
      "endDate": "Date",
      "description": "String"
    }
  ],
  "references": [
    {
      "name": "String",
      "contactInfo": "String", // Phone or email
      "relationship": "String" // e.g., Former Manager, Colleague, etc.
    }
  ]
}

Guidelines:
- Extract "personalInfo" details including name, email, phone number, LinkedIn, and portfolio if available.
- For "skills", organize skills into relevant categories like Technical, Soft Skills, Leadership, Management, Research, etc. Use a category that best describes the skills listed in the resume.
- List "experience" with roles, companies, dates, descriptions, and key achievements where applicable.
- Include "education" details with degrees, institutions, and graduation years.
- Add "certifications" with titles, issuing organizations, and issue dates if provided.
- Capture "projects" with brief descriptions, technologies/tools used, and links.
- Extract "achievements" such as awards, recognitions, or honors.
- Include "internships" if mentioned with relevant details.
- Add "references" with names, contact information, and relationships.

If a field is missing or not provided in the input, include the property in the JSON and leave its value as null, an empty string (""), or an empty array ([]), as appropriate.

Ensure:
- All dates follow the format YYYY-MM-DD.
- Arrays are used where specified.
- Skills must be grouped into relevant categories.
- The response contains only valid JSON with no additional information or text.
`;


export const processResume = async (req, res) => {
  const filePath = path.join(__dirname, '../uploads/', req.file.filename);



  try {
    
    const extractedText = await extractTextFromFile(filePath);
    console.log('extractedText', extractedText);
    
    
    const gptResponse = await generateResponse(SYSTEM_INSTRUCTIONS, TASK_INSTRUCTIONS, extractedText);
    console.log("GPT RESPONSE", gptResponse);
    

    
    res.status(201).json({
      message: 'Resume created and processed successfully',
      ProcessedResume: gptResponse,
    });
  } catch (error) {
    console.error('Error handling job description:', error.response?.data || error.message);

    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to process and create Resume' });
    }
  } finally {
    
    cleanupFile(filePath);
  }
};


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







