import { JobDescription } from "../models/job.description.model.js";
import { Form } from "../models/form.model.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { uploadToCloudinary, safeCleanup } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { addJobToQueue } from "../Queue/jd/ocrProducer.js";
import { ocrQueue } from "../Queue/Queue.js";
import { CandidateApplication } from "../models/candidate.model.js";
import { Test } from "../models/test.model.js"; // Adjust path to your Test model
import generateResponse from "../services/gptService.js"; // Adjust path to your GPT service
import { resendTestInvitation } from "./test.controller.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateFile = (file) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  const maxSize = 10 * 1024 * 1024;

  if (!file) throw new ApiError(400, "No file provided");
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(
      400,
      "Invalid file type. Please upload a PDF, Word document, or image."
    );
  }
  if (file.size > maxSize) {
    throw new ApiError(400, "File size exceeds the limit of 10MB.");
  }
};

export const validateJobSchema = (data) => {
  const requiredFields = [
    "jobSummary",
    "keyResponsibilities",
    "qualifications",
    "location",
  ];
  return requiredFields.every((field) => data[field] !== undefined);
};

export const processJd = async (req, res) => {
  console.log('process JD request body', req.body)
  const { title, modules, jobType ,Location, startDate, endDate,   employmentType, evaluationConfig,customParameters } = req.body;
  const { accessToken } = req.cookies;
  console.log("location job:", Location)

  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    if (!title) throw new ApiError(400, "Job title is required");

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    validateFile(req.file);

    const localFilePath = path.join(
      __dirname,
      "../Uploads/",
      req.file.filename
    );

    const cloudinaryResult = await uploadToCloudinary(localFilePath, {
      folder: "hr_uploads",
    });

    if (!cloudinaryResult) {
      throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    
    let parsedEvaluationConfig = {};
    let parsedCustomParameters = [];
    try {
      if (evaluationConfig) {
        parsedEvaluationConfig = JSON.parse(evaluationConfig);
      }
      if (customParameters) {
        const rawCustomParameters = JSON.parse(customParameters);
        
        parsedCustomParameters = rawCustomParameters.map(param => {
          const [key, value] = Object.entries(param)[0]; 
          if (!key || value === undefined) {
            throw new Error('Each custom parameter must have a key and value');
          }
          return { key, value };
        });
      }
    } catch (error) {
      throw new ApiError(400, `Invalid JSON format for evaluationConfig or customParameters: ${error.message}`);
    }

    const newJob = await JobDescription.create({
      userId: decoded._id,
      jobTitle: title,
      location: Location,
      activeDuration: {
        startDate: startDate,
        endDate: endDate,
      },
      jobType: jobType,
      employmentType: employmentType,
      modules,
      status: "pending",
      file: {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        format: cloudinaryResult.format,
      },
      evaluationConfig: {
        skills: parsedEvaluationConfig.skills || 0,
        experience: parsedEvaluationConfig.experience || 0,
        education: parsedEvaluationConfig.education || 0,
        certifications: parsedEvaluationConfig.certifications || 0,
      },
      customParameters: parsedCustomParameters,
    });

    await addJobToQueue(cloudinaryResult.url, newJob._id);

    res.status(201).json({
      message: "Job uploaded, processing in background.",
      jobId: newJob._id,
      fileUrl: cloudinaryResult.url,
    });
  } catch (error) {
    if (req.file) {
      await safeCleanup(path.join(__dirname, "../Uploads/", req.file.filename));
    }
    console.error("Error processing job:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Processing failed",
    });
  }
};

export const createForm = async (req, res) => {
  try {
    const { jobId, fields } = req.body;
    console.log("Request received to create form:", jobId, fields);

    const jobExists = await JobDescription.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ error: "Job not found" });
    }

    const newForm = new Form({ job: jobId, fields });
    await newForm.save();

    return res
      .status(201)
      .json({ message: "Form created successfully", formId: newForm._id });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFormById = async (req, res) => {
  try {
    console.log("Request received to fetch Form");

    const { formId } = req.params;
    console.log("Form ID:", formId);

    if (!formId) {
      return res.status(400).json({ message: "Form ID is required" });
    }

    const form = await Form.findById(formId).populate("job");
    console.log("form:", form);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const retryJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const failedJob = await JobDescription.findById(jobId);

    if (!failedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (failedJob.status !== "failed") {
      return res.status(400).json({ message: "Job is not in failed state" });
    }

    await ocrQueue.add("retryJob", {
      filePath: failedJob.filePath,
      jobId: failedJob._id,
    });

    await JobDescription.findByIdAndUpdate(jobId, { status: "retrying" });

    res.json({ message: `Job ${jobId} has been requeued for processing.` });
  } catch (error) {
    console.error("Error retrying job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getJobDescriptionById = async (req, res) => {
  try {
    console.log("Request received to fetch Job Description");

    const { id } = req.params;
    console.log("ID:", id);

    if (!id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const jobDescription = await JobDescription.findById(id).lean(); // Use lean() to get plain JS object
    if (!jobDescription) {
      return res.status(404).json({ message: "Job Description not found" });
    }

    const form = await Form.findOne({ job: id }, "_id");
    const formId = form ? form._id : null;

    // Add formId as a property inside the jobDescription object
    jobDescription.formId = formId;

    res.status(200).json(jobDescription);
  } catch (error) {
    console.error("Error fetching job description:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const findAllJobDescription = async (req, res) => {
//   try {
//     console.log('Request received to fetch all Job Descriptions');

//     const jobDescriptions = await JobDescription.find();
//     res.status(200).json(jobDescriptions);
//   } catch (error) {
//     console.error('Error fetching job descriptions:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

export const findAllJobDescription = async (req, res) => {
  try {
    console.log(
      "Request received to fetch all Job Descriptions with Form ID and candidate count"
    );
    const { id } = req.params;
    console.log("id:", id);
    const jobsWithFormIdAndCandidateCount = await JobDescription.aggregate([
      {
        $match: {
          userId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "forms",
          localField: "_id",
          foreignField: "job",
          as: "form",
        },
      },
      {
        $addFields: {
          formId: { $arrayElemAt: ["$form._id", 0] },
        },
      },
      {
        $lookup: {
          from: "candidateapplications",
          localField: "_id",
          foreignField: "job",
          as: "candidates",
        },
      },
      {
        $addFields: {
          candidateCount: { $size: "$candidates" },
        },
      },
      {
        $project: {
          form: 0,
          candidates: 0,
        },
      },
    ]);
    console.log(
      "all job fetched:-------------------------",
      jobsWithFormIdAndCandidateCount
    );

    res.status(200).json(jobsWithFormIdAndCandidateCount);
  } catch (error) {
    console.error("Error fetching job descriptions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    console.log("Request received to update Job");
    const { id } = req.params;
    const updateData = req.body;

    console.log(updateData, "updateData");

    if (!id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const updatedJob = await JobDescription.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: false,
    });

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCandidate = async (req, res) => {
  const { id } = req.params;

  try {
    // const jobId = mongoose.Types.ObjectId(id);
    const candidates = await CandidateApplication.find({ job: id })
      .populate("job")
      .exec();

    if (!candidates) {
      return res
        .status(404)
        .json({ message: "No candidates found for this job" });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a manual test
export const createManualTest = async (req, res) => {
  try {
    const { job, questions } = req.body;

    // Validate required fields
    if (!job || !questions) {
      return res
        .status(400)
        .json({ message: "Job and questions are required" });
    }

    // Validate questions
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    for (const question of questions) {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !["conceptual", "logical", "basic"].includes(question.questionType)
      ) {
        return res.status(400).json({ message: "Invalid question format" });
      }
    }

    // Create and save the manual test
    const test = new Test({
      job,
      questions,
      isGeneratedByAI: false,
    });

    await test.save();

    await JobDescription.findByIdAndUpdate(job, {
      $set: { testCreated: true },
    });

    res.status(201).json({ message: "Manual test created successfully", test });
  } catch (error) {
    console.error("Error creating manual test:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const generateAITestQuestions = async (req, res) => {
  try {
    const { job, testConfig } = req.body;
    console.log("job:", job);
    console.log("test config:", testConfig);

    const jobData = await JobDescription.findById(job);
    if (!jobData) {
      throw new ApiError(404, "Job not found");
    }

    if (!job || !testConfig) {
      throw new ApiError(400, "Job and testConfig are required");
    }

    console.log("Test config:", testConfig);
    

    const {
      experience,
      conceptualQuestions,
      logicalQuestions,
      basicQuestions,
      difficultyLevel,
    } = testConfig;
    if (
      !experience ||
      !conceptualQuestions ||
      !logicalQuestions ||
      !basicQuestions ||
      !difficultyLevel
    ) {
      return res
        .status(400)
        .json({ message: "All testConfig fields are required" });
    }

    // Prepare GPT prompt with job-specific details
    const systemInstructions = `
      You are an expert in generating test questions for job assessments. Create a set of questions tailored to the specific job description provided. The questions must align with the job's requirements, responsibilities, and qualifications, ensuring relevance and accuracy. The response must be a valid JSON array of question objects, each containing:
      - questionText: The question text, directly related to the job's skills, responsibilities, or qualifications.
      - options: An array of 4 possible answers, with one correct answer.
      - correctAnswer: The correct answer (must match one of the options exactly).
      - questionType: One of "conceptual", "logical", or "basic", as specified.
      Ensure the questions match the specified experience level, difficulty, and question type distribution. Avoid generic questions; they must be specific to the job's context and requirements.
    `;

    const taskInstructions = `
      Generate ${conceptualQuestions} conceptual, ${logicalQuestions} logical, and ${basicQuestions} basic questions for the following job i.e total ${conceptualQuestions + logicalQuestions + basicQuestions} questions:
      - Job Title: ${jobData.jobTitle}
      - Job Summary: ${jobData.jobSummary || 'Not provided'}
      - Key Responsibilities: ${jobData.keyResponsibilities?.join(', ') || 'Not provided'}
      - Qualifications:
        - Education: ${jobData.qualifications?.education || 'Not provided'}
        - Experience: ${jobData.qualifications?.experience || 'Not provided'}
        - Skills: ${jobData.qualifications?.skills?.join(', ') || 'Not provided'}
      - Custom Parameters: ${jobData.customParameters?.length > 0 ? jobData.customParameters.map(param => `${param.key}: ${param.value}`).join(', ') : 'None'}
      The questions should be suitable for a candidate with ${experience} experience and have a ${difficultyLevel} difficulty level. Ensure questions test relevant skills and knowledge specific to the job's requirements. Return the questions in a JSON array.
    `;

    console.log("System Instructions:", systemInstructions);
    console.log("Task Instructions:", taskInstructions);
    

    const inputText = { testConfig, jobData };

    // Call GPT service to generate questions
    const generatedQuestions = await generateResponse(
      systemInstructions,
      taskInstructions,
      inputText
    );

    // Validate generated questions
    if (!Array.isArray(generatedQuestions)) {
      return res
        .status(500)
        .json({ message: "Invalid response format from AI service" });
    }

    for (const question of generatedQuestions) {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !["conceptual", "logical", "basic"].includes(question.questionType)
      ) {
        return res
          .status(500)
          .json({ message: "Invalid question format from AI service" });
      }
    }
    console.log("Generated Questions:", generatedQuestions);
    

    // Return generated questions for HR review
    res.status(200).json({
      message: "AI-generated questions ready for review",
      job,
      testConfig,
      questions: generatedQuestions,
    });
  } catch (error) {
    console.error("Error generating AI test questions:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
  }
};

// Save AI-generated test after HR approval
export const saveAITest = async (req, res) => {
  try {
    const { job, questions, testConfig } = req.body;

    // Validate required fields
    if (!job || !questions || !testConfig) {
      return res
        .status(400)
        .json({ message: "Job, questions, and testConfig are required" });
    }

    // Validate testConfig fields
    const {
      experience,
      conceptualQuestions,
      logicalQuestions,
      basicQuestions,
      difficultyLevel,
    } = testConfig;
    if (
      !experience ||
      !conceptualQuestions ||
      !logicalQuestions ||
      !basicQuestions ||
      !difficultyLevel
    ) {
      return res
        .status(400)
        .json({ message: "All testConfig fields are required" });
    }

    // Validate questions
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    for (const question of questions) {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !["conceptual", "logical", "basic"].includes(question.questionType)
      ) {
        return res.status(400).json({ message: "Invalid question format" });
      }
    }

    // Create and save the AI-generated test
    const test = new Test({
      job,
      questions,
      testConfig,
      isGeneratedByAI: true,
    });

    await test.save();

    await JobDescription.findByIdAndUpdate(job, {
      $set: { testCreated: true },
    });

    res
      .status(201)
      .json({ message: "AI-generated test saved successfully", test });
  } catch (error) {
    console.error("Error saving AI-generated test:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const hasTest = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    // Check if a test exists for the job
    const test = await Test.findOne({ job: jobId });

    if (test) {
      return res.status(200).json({
        message: "Test found for job",
        hasTest: true,
        testId: test._id,
      });
    } else {
      return res.status(200).json({
        message: "No test found for job",
        hasTest: false,
      });
    }
  } catch (error) {
    console.error("Error checking test for job:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
