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
      },
      conceptualQuestions: {
        type: Number,
      },
      logicalQuestions: {
        type: Number,
      },
      basicQuestions: {
        type: Number,
      },
      difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
    },
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", TestSchema);
