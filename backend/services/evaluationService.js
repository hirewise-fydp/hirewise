// services/evaluationService.js
import { SYSTEM_INSTRUCTIONS_CV_JD_COMPARISON, TASK_INSTRUCTIONS_CV_JD_COMPARISON } from '../constants.js';
import { CandidateApplication } from '../models/candidate.model.js';
import { Test } from '../models/test.model.js';
import { cvRejectionEmail, sendTestInvitationEmail } from '../utils/email.js';
import generateResponse from './gptService.js';
import { generateTestToken } from './tokenService.js';

export const evaluateCandidate = async (applicationId) => {
    console.log('Evaluating candidate for application:', applicationId);
    
    try {
        const application = await CandidateApplication.findById(applicationId)
            .populate('job');

        if (!application) {
            throw new Error('Application not found');
        }

        const evaluationResults = await calculateScores(
            application.parsedResume,
            application.job
        );

        // Update application
        application.cvScore = evaluationResults.cvScore;
        application.evaluationResults = {
            skillMatches: evaluationResults.skillMatches || [],
            experienceScore: evaluationResults.experienceScore || 0,
            educationScore: evaluationResults.educationScore || 0,
            overallScore: evaluationResults.overallScore || 0
        };
        if (application.cvScore >= 75) {
            application.status = "test_invited";
            application.testToken = generateTestToken(application._id);
            application.testTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        } else {
            application.status = "rejected";
        }

        // Mark evaluationResults as modified to ensure Mongoose saves it
        application.markModified('evaluationResults');

        await application.save();
        const jobTitle = application.job?.jobTitle || 'Unknown Job';
        if (application.status === 'test_invited') {
            try {
                await sendTestInvitationEmail({
                    email: application.candidateEmail,
                    candidateName: application.candidateEmail,
                    jobTitle,
                    applicationId: application._id.toString(),
                    testToken: application.testToken || 'N/A'
                });
                console.log(`Test invitation email sent to ${application.candidateEmail}`);
            } catch (emailError) {
                console.error(`Failed to send test invitation email to ${application.candidateEmail}:`, emailError);
            }
        } else if (application.status === 'rejected') {
            try {
                await cvRejectionEmail({
                    email: application.candidateEmail,
                    candidateName: application.candidateName,
                    jobTitle,
                    applicationId: application._id.toString(),
                    reason: 'Your CV score did not meet the required threshold.'
                });
                console.log(`Rejection email sent to ${application.candidateEmail}`);
            } catch (emailError) {
                console.error(`Failed to send rejection email to ${application.candidateEmail}:`, emailError);
            }
        }

    } catch (error) {
        console.error('Evaluation failed for application', applicationId, error);
        await CandidateApplication.findByIdAndUpdate(applicationId, {
            status: 'evaluation_failed',
            error: error.message
        });
        throw error;
    }
};
export const evaluateTestAnswers = async (applicationId) => {
    console.log('Evaluating test answers for application:', applicationId);

    try {
        const application = await CandidateApplication.findById(applicationId)
            .populate('job');
        
        if (!application) {
            throw new Error('Application not found');
        }

        const test = await Test.findOne({ job: application.job._id });
        if (!test) {
            throw new Error('Test not found for this job');
        }

        const systemInstructions = `
            You are an expert in evaluating candidate test responses for job assessments. Your task is to evaluate the provided answers against the correct answers and provide a score and detailed feedback.
            Return a JSON object with:
            - testScore: A number out of 100 representing the percentage of correct answers.
            - feedback: A detailed textual report explaining the performance, highlighting strengths, weaknesses, and areas for improvement.
        `;

        const taskInstructions = `
            Evaluate the following candidate answers for the test associated with the job "${application.job.jobTitle}".
            The answers are provided as an array of objects, each containing:
            - questionNumber: The question number (1-based index).
            - questionText: The text of the question.
            - selectedOption: The candidate's selected answer.
            - correctAnswer: The correct answer.
            - isCorrect: A boolean indicating if the selected answer is correct.
            Calculate the test score as the percentage of correct answers.
            Provide a detailed feedback report in plain language, structured for readability, covering:
            - Overall performance summary.
            - Specific questions where the candidate performed well or poorly.
            - Recommendations for improvement.
        `;

        const evaluation = await generateResponse(
            systemInstructions,
            taskInstructions,
            { answers: application.testAnswers }
        );

        if (!evaluation || typeof evaluation !== 'object') {
            throw new Error('Invalid evaluation response format');
        }

        if (typeof evaluation.testScore !== 'number' || evaluation.testScore < 0 || evaluation.testScore > 100) {
            throw new Error('Invalid test score in evaluation response');
        }
        if (typeof evaluation.feedback !== 'string') {
            throw new Error('Invalid feedback in evaluation response');
        }

        // Update application with test results
        application.testScore = evaluation.testScore || 0;
        application.evaluationResults.feedback = evaluation.feedback || '';
        
        // Set status based on test score
        if (evaluation.testScore >= 75) {
            application.status = 'short_listed';
        } else {
            application.status = 'rejected';
        }

        application.markModified('evaluationResults');
        await application.save();

        console.log(`Test evaluation completed for application ${applicationId}: Score ${evaluation.testScore}`);

    
        const jobTitle = application.job?.jobTitle || 'Unknown Job';
        try {
            if (evaluation.testScore >= 75) {
                await sendShortlistEmail({
                    email: application.candidateEmail,
                    candidateName: application.candidateName,
                    jobTitle,
                    applicationId: application._id.toString(),
                    testScore: evaluation.testScore
                });
                console.log(`Shortlist email sent to ${application.candidateEmail}`);
            } else {
                await sendTestRejectionEmail({
                    email: application.candidateEmail,
                    candidateName: application.candidateName,
                    jobTitle,
                    applicationId: application._id.toString(),
                    testScore: evaluation.testScore,
                    feedback: evaluation.feedback
                });
                console.log(`Test rejection email sent to ${application.candidateEmail}`);
            }
        } catch (emailError) {
            console.error(`Failed to send email to ${application.candidateEmail}:`, emailError);
        }

    } catch (error) {
        console.error('Test evaluation failed for application', applicationId, error);
        await CandidateApplication.findByIdAndUpdate(applicationId, {
            status: 'evaluation_failed',
            error: error.message
        });
        const application = await CandidateApplication.findById(applicationId).populate('job');
        if (application) {
            try {
                await sendEvaluationFailureEmail({
                    email: application.candidateEmail,
                    candidateName: application.candidateName,
                    jobTitle: application.job?.jobTitle || 'Unknown Job',
                    applicationId: application._id.toString(),
                    errorMessage: error.message
                });
            } catch (emailError) {
                console.error(`Failed to send evaluation failure email to ${application.candidateEmail}:`, emailError);
            }
        }
        throw error;
    }
};

async function calculateScores(parsedResume, job) {

    
    const input = {
        cv: parsedResume,
        jd: job
    };

    const evaluation = await generateResponse(
        SYSTEM_INSTRUCTIONS_CV_JD_COMPARISON,
        TASK_INSTRUCTIONS_CV_JD_COMPARISON,
        input
    );

    

    
    const formattedEvaluation = {
        cvScore: evaluation.cvScore || 0,
        skillMatches: (evaluation.evaluationResults.skillMatches || []).map(skill => ({
            skill: skill.name || skill.skill || '',
            matchStrength: skill.confidence || skill.matchStrength || 0
        })).filter(skill => skill.skill && typeof skill.matchStrength === 'number'),
        experienceScore: evaluation.evaluationResults.experience || evaluation.evaluationResults.experienceScore || 0,
        educationScore: evaluation.evaluationResults.education || evaluation.evaluationResults.educationScore || 0,
        overallScore: evaluation.evaluationResults.overall || evaluation.evaluationResults.overallScore || 0
    };

    console.log('Formatted evaluation:', formattedEvaluation);

    return formattedEvaluation;
}