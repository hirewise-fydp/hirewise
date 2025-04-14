// models/candidate.model.js
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    // Application Metadata
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobDescription",
        required: true
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },

    // Candidate Information (from form)
    candidateName: {
        type: String,
        required: true
    },
    candidateEmail: {
        type: String,
        required: true
    },
    candidatePhone: String,
    formData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    // Resume Processing
    cvFile: {
        type: String,
        required: true
    },
    parsedResume: {
        type: mongoose.Schema.Types.Mixed
    },

    // Evaluation Tracking
    status: {
        type: String,
        enum: ["cv_processing", "cv_screened", "test_invited", "test_completed", "rejected", "hired"],
        default: "applied"
    },
    cvScore: {
        type: Number,
        min: 0,
        max: 100
    },
    testScore: {
        type: Number,
        min: 0,
        max: 100
    },
    evaluationResults: {
        skillMatches: {
            type: [{
                skill: { type: String, required: true },
                matchStrength: { type: Number, required: true }
            }],
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

    // Test Tracking
    testToken: String,
    testTokenExpires: Date,
    testStartedAt: Date,
    testSubmittedAt: Date,


    dataRetention: {
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
    }
}, { timestamps: true });

// Indexes for faster queries
candidateSchema.index({ 'parsedResume.skills': 1 });
candidateSchema.index({ cvScore: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ job: 1 });

// TTL Index for auto-deletion
candidateSchema.index({ 'dataRetention.expiresAt': 1 }, { expireAfterSeconds: 0 });


export const CandidateApplication = mongoose.model("CandidateApplication", candidateSchema);