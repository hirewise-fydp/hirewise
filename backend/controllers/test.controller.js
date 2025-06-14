// controllers/test.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { CandidateApplication } from "../models/candidate.model.js";
import { Test } from "../models/test.model.js";
import { verifyTestToken } from "../services/tokenService.js";
import { evaluateTestAnswers } from "../services/evaluationService.js";
import { sendTestCompletionEmail } from "../utils/email.js";
import mongoose from "mongoose";

// Access test using token
export const accessTest = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(401, "Missing access token");
  }

  const decoded = verifyTestToken(token);
  if (!decoded) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const application = await CandidateApplication.findById(
    decoded.applicationId
  ).populate("job");

  console.log(`Accessing test for application: ${application}`);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status === "test_started") {
    throw new ApiError(
      403,
      "You've already applied for this test once and cannot access it again"
    );
  }

  const test = await Test.findOne({ job: application.job._id });
  if (!test) {
    throw new ApiError(404, "Test not found for this job");
  }

  // Mark test as started
  application.status = "test_started";
  application.testStartedAt = new Date();
  await application.save();

  // Return test questions (excluding correct answers)
  const sanitizedQuestions = test.questions.map((q, index) => ({
    questionNumber: index + 1,
    questionText: q.questionText,
    options: q.options,
    questionType: q.questionType,
  }));

  return res.status(200).json({
    success: true,
    data: {
      applicationId: application._id,
      jobTitle: application.job.jobTitle,
      questions: sanitizedQuestions,
    },
    message: "Test accessed successfully",
  });
});

export const submitTest = asyncHandler(async (req, res) => {
  const { applicationId, answers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, "Invalid application ID");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "Answers must be a non-empty array");
  }

  const application = await CandidateApplication.findById(
    applicationId
  ).populate("job");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status !== "test_started") {
    throw new ApiError(403, "Test not in progress or already submitted");
  }

  const test = await Test.findOne({ job: application.job._id });
  if (!test) {
    throw new ApiError(404, "Test not found for this job");
  }

  const testAnswers = [];
  for (const answer of answers) {
    const { questionNumber, selectedOption } = answer;
    if (
      !Number.isInteger(questionNumber) ||
      questionNumber < 1 ||
      questionNumber > test.questions.length
    ) {
      throw new ApiError(400, `Invalid question number: ${questionNumber}`);
    }
    const question = test.questions[questionNumber - 1];
    if (!question.options.includes(selectedOption)) {
      throw new ApiError(400, `Invalid option for question ${questionNumber}`);
    }
    testAnswers.push({
      questionNumber,
      questionText: question.questionText,
      selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedOption === question.correctAnswer,
    });
  }

  application.testAnswers = testAnswers;
  application.status = "test_completed";
  application.testSubmittedAt = new Date();
  application.testToken = null;
  application.testTokenExpires = null;
  await application.save();

  await evaluateTestAnswers(applicationId);

  return res.status(200).json({
    success: true,
    data: { applicationId },
    message: "Test submitted successfully, evaluation in progress",
  });
});

export const resendTestInvitation = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, "Invalid application ID");
  }

  const application = await CandidateApplication.findById(
    applicationId
  ).populate("job");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status !== "test_invited") {
    throw new ApiError(403, "Candidate not eligible for test invitation");
  }

  // Generate new test token
  const newToken = generateTestToken(application._id);
  application.testToken = newToken;
  application.testTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await application.save();

  // Send test invitation email
  try {
    await sendTestInvitationEmail({
      email: application.candidateEmail,
      candidateName: application.candidateName,
      jobTitle: application.job.jobTitle,
      applicationId: application._id.toString(),
      testToken: newToken,
    });
  } catch (emailError) {
    console.error(
      `Failed to resend test invitation email to ${application.candidateEmail}:`,
      emailError
    );
    throw new ApiError(500, "Failed to send test invitation email");
  }

  return res.status(200).json({
    success: true,
    data: { applicationId },
    message: "Test invitation resent successfully",
  });
});

export const invalidateTest = asyncHandler(async (req, res) => {
  const { token } = req.query;

  console.log(`Invalidating test with token: ${token}`);

  if (!token) {
    throw new ApiError(401, "Missing access token");
  }

  const decoded = verifyTestToken(token);
  if (!decoded) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const application = await CandidateApplication.findById(
    decoded.applicationId
  ).populate("job");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (!["test_started", "test_completed"].includes(application.status)) {
    throw new ApiError(403, "Test is not in a state that can be invalidated");
  }

  const test = await Test.findOne({ job: application.job._id });
  if (!test) {
    throw new ApiError(404, "Test not found for this job");
  }

  // Reset test-related data
  application.status = "test_invalidated";
  application.testAnswers = [];
  application.testStartedAt = null;
  application.testSubmittedAt = null;
  application.testToken = null;
  application.testTokenExpires = null;
  await application.save();

  // Log invalidation for auditing (optional, can be extended based on requirements)
  console.log(
    `Test invalidated for application: ${applicationId}, job: ${application.job.jobTitle}`
  );

  return res.status(200).json({
    success: true,
    data: { applicationId },
    message: "Test invalidated successfully. Candidate can retake the test.",
  });
});
