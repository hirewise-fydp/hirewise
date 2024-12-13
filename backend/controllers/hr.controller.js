import { JobDescription } from '../models/job-description.js';



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
