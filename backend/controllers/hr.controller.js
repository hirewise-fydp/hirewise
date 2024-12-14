import { JobDescription } from "../models/job.description.model.js";



export const createJD = async (req, res) => {
  console.log("JD CREATED");
};

export const fetchAllJobDescriptions = async () => {
  try {
    const jobDescriptions = await JobDescription.find({});
    console.log("All Job Descriptions:", jobDescriptions);
  } catch (err) {
    console.error("Error fetching job descriptions:", err);
  }
};

export const createJobDescription = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }
    const newJobDescription = await JobDescription.create({ title });
    processJobDescription(newJobDescription._id);// yahan se jd processing k lye jaigi
    res
      .status(201)
      .json({
        message: "Job description created",
        jobDescription: newJobDescription,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job description" });
  }
};


const processJobDescription = async (jobId) => {
  try {
         
      //yahan p ocr service ko jd den ga 



      // setTimeout(async () => {
      //     const processedData = {
      //         description: 'Processed job description data', 
      //         skills: ['JavaScript', 'Node.js', 'MongoDB'],
      //         experience: '3-5 years'
      //     };

      //     await JobDescription.findByIdAndUpdate(jobId, { jdData: processedData });
      // }, 10000); 
  } catch (error) {
      console.error('Error processing job description:', error);
  }
};




export const createForm = async (req, res) => {
  try {
      const { jobId, formData } = req.body;
      if (!jobId || !formData) {
          return res.status(400).json({ error: 'Job ID and form data are required' });
      }
      const jobExists = await JobDescription.findById(jobId);
      if (!jobExists) {
          return res.status(404).json({ error: 'Job description not found' });
      }
      const newForm = await Form.create({ jobId, formData });
      res.status(201).json({ message: 'Form created', form: newForm });
  } catch (error) {
      res.status(500).json({ error: 'Failed to create form' });
  }
};