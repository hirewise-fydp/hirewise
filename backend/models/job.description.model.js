import mongoose from "mongoose";
const Schema = mongoose.Schema;


const jobDescriptionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: {
    type: String,
    // required: true
  },
  jobSummary: {
    type: String,
    // required: true
  },
  keyResponsibilities: {
    type: [String],
    // required: true
  },
  qualifications: {
    education: {
      type: String, 
      // required: true
    },
    experience: {
      type: String,
      // required: true
    },
    skills: {
      type: [String],
      // required: true
    }
  },
  location: {
    type: String,
    // required: true
  },
  compensation: {
    salaryRange: {
      type: String, 
      required: false,
      default: ''
    },
    benefits: {
      type: [String], 
      required: false
    }
  },
  applicationProcess: {
    type: String,
    // required: true
  }
});

export const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);


