// services/evaluationService.js
import { SYSTEM_INSTRUCTIONS_CV_JD_COMPARISON, TASK_INSTRUCTIONS_CV_JD_COMPARISON } from '../constants.js';
import { CandidateApplication } from '../models/candidate.model.js';
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
        if (application.cvScore >= 10) {
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

    console.log('Raw evaluation from GPT:', JSON.stringify(evaluation.evaluationResults.skillMatches));

    // Transform evaluation to match schema
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