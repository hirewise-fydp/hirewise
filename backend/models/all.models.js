
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['HR', 'Admin'],
    default: 'HR'
  },
}, { timestamps: true });

// Job Schema
const JobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  jobSummary: {
    type: String,
    required: true
  },
  keyResponsibilities: {
    type: [String],
    required: true
  },
  qualifications: {
    education: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      required: true
    }
  },
  location: {
    type: String,
    required: true
  },
  compensation: {
    salaryRange: {
      type: String,
      default: ''
    },
    benefits: {
      type: [String],
      default: []
    }
  },
  applicationProcess: {
    type: String,
    required: true
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
    default: true
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
}, { timestamps: true });

// Test Schema
const TestSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    }
  }],
  isGeneratedByAI: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// CV Schema
const CVSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  cvFile: {
    type: String,
    required: true // Path to CV file
  },
  screeningScore: {
    type: Number,
    default: null
  },
  screeningReport: {
    type: String,
    default: ''
  },
  testingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Rejected', 'Shortlisted'],
    default: 'Pending'
  }
}, { timestamps: true });

// Form Builder Schema
const FormSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  fields: [{
    label: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'textarea', 'select', 'checkbox', 'radio'],
      required: true
    },
    options: {
      type: [String], // For select, checkbox, radio fields
      default: []
    },
    required: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Job: mongoose.model('Job', JobSchema),
  Test: mongoose.model('Test', TestSchema),
  CV: mongoose.model('CV', CVSchema),
  Form: mongoose.model('Form', FormSchema)
};

