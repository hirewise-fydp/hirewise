import mongoose from "mongoose";

const TestSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          enum: ["conceptual", "logical", "basic"],
          required: true,
        },
      },
    ],
    isGeneratedByAI: {
      type: Boolean,
      default: false,
    },

    // 🧩 All test config values grouped under testConfig
    testConfig: {
      experience: {
        type: String,
        required: true,
      },
      conceptualQuestions: {
        type: Number,
        required: true,
      },
      logicalQuestions: {
        type: Number,
        required: true,
      },
      basicQuestions: {
        type: Number,
        required: true,
      },
      difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
      },
    },
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", TestSchema);
