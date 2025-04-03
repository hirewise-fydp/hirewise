import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobDescriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
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
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'retrying'], default: 'pending'
  },
  modules: {
    cvScreening: {
      type: Boolean,
      default: false
    },
    automatedTesting: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    // default: true
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }]
}, { timestamps: true });
export const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);