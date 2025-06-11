// models/candidate.model.js
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    // Application Metadata
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },

    // Candidate Information (from form)
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    candidatePhone: String,
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Resume Processing
    cvFile: {
      url: String,
      publicId: String,
      format: String,
    },
    parsedResume: {
      type: mongoose.Schema.Types.Mixed,
    },

    testToken: String,
    testTokenExpires: Date,
    testStartedAt: Date,
    testSubmittedAt: Date,
    testAnswers: [
      {
        questionNumber: { type: Number, required: true },
        questionText: { type: String, required: true },
        selectedOption: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean },
      },
    ],
    status: {
      type: String,
      enum: [
        "cv_processing",
        "cv_processed",
        "cv_screened",
        "test_invited",
        "test_started",
        "test_invalidated",
        "test_completed",
        "rejected",
        "short_listed",
        "evaluation_failed",
        "cv_processing_failed",
      ],
      default: "cv_processing",
    },
    cvScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    testScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    file: {
      url: String,
      publicId: String,
      format: String,
    },
    evaluationResults: {
      feedback: String,
      skillMatches: {
        type: [
          {
            skill: { type: String, required: true },
            matchStrength: { type: Number, required: true },
          },
        ],
      },
      experienceScore: {
        type: Number,
      },
      educationScore: {
        type: Number,
      },
      overallScore: {
        type: Number,
      },
    },

    testToken: String,
    testTokenExpires: Date,
    testStartedAt: Date,
    testSubmittedAt: Date,

    dataRetention: {
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
candidateSchema.index({ "parsedResume.skills": 1 });
candidateSchema.index({ cvScore: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ job: 1 });
candidateSchema.index({ testToken: 1 });

// TTL Index for auto-deletion
candidateSchema.index(
  { "dataRetention.expiresAt": 1 },
  { expireAfterSeconds: 0 }
);

candidateSchema.pre("remove", async function (next) {
  if (this.file?.publicId) {
    const { deleteFromCloudinary } = await import(
      "../utils/cloudinary.utils.js"
    );
    await deleteFromCloudinary(this.file.publicId);
  }
  if (this.cvFile?.publicId) {
    const { deleteFromCloudinary } = await import(
      "../utils/cloudinary.utils.js"
    );
    await deleteFromCloudinary(this.cvFile.publicId);
  }
  next();
});

export const CandidateApplication = mongoose.model(
  "CandidateApplication",
  candidateSchema
);
