// utils/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const {
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SERVICE = 'gmail',
    EMAIL_FROM_NAME = 'Job Application System'
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS must be set in .env');
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Verify transporter setup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error);
    } else {
        console.log('✅ Email transporter is ready');
    }
});

// Generic function to send emails
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

// Job failure notification (for failed job description processing)
export const sendJobFailureEmail = async ({ email, jobTitle, jobId, errorMessage }) => {
    const subject = `Job Processing Failed: ${jobTitle}`;
    const text = `Hello,\n\nYour job "${jobTitle}" (ID: ${jobId}) failed during processing.\nError: ${errorMessage}\n\nPlease try again or contact support.`;
    const html = `
    <p>Hello,</p>
    <p>Your job "<strong>${jobTitle}</strong>" (ID: ${jobId}) failed during processing.</p>
    <p><strong>Error:</strong> ${errorMessage}</p>
    <p>Please try again or contact support.</p>
  `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};

export const cvRejectionEmail = async ({ email, candidateName, jobTitle, applicationId, reason }) => {
    const subject = `Application Update: ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nWe regret to inform you that your application for "${jobTitle}" (Application ID: ${applicationId}) was not selected to proceed.\nReason: ${reason}\n\nThank you for applying, and we wish you success in your job search.`;
    const html = `
    <p>Dear ${candidateName},</p>
    <p>We regret to inform you that your application for "<strong>${jobTitle}</strong>" (Application ID: ${applicationId}) was not selected to proceed.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Thank you for applying, and we wish you success in your job search.</p>
  `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};

// Test invitation email (for candidates invited to take a test)
export const sendTestInvitationEmail = async ({ email, candidateName, jobTitle, applicationId, testToken }) => {
    const testLink = `${process.env.FRONTEND_URL}/test?token=${testToken}`;
    const subject = `Test Invitation: ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nCongratulations! Your application for "${jobTitle}" (Application ID: ${applicationId}) has been selected for the next stage.\n\nPlease use the following token to access your test: ${testToken}\n\nGood luck!`;
    const html = `
    <p>Dear ${candidateName},</p>
    <p>Congratulations! Your application for "<strong>${jobTitle}</strong>" (Application ID: ${applicationId}) has been selected for the next stage.</p>
    <p>Please use the following token to access your test: <strong>${testLink}</strong></p>
    <p>Good luck!</p>
  `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};

// Application received confirmation (sent after submitting an application)
export const sendApplicationReceivedEmail = async ({ email, candidateName, jobTitle, applicationId }) => {
    const subject = `Application Received: ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nThank you for applying for "${jobTitle}" (Application ID: ${applicationId}).\n\nYour application is being processed, and we will update you on the next steps soon.`;
    const html = `
    <p>Dear ${candidateName},</p>
    <p>Thank you for applying for "<strong>${jobTitle}</strong>" (Application ID: ${applicationId}).</p>
    <p>Your application is being processed, and we will update you on the next steps soon.</p>
  `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};

// Evaluation failure notification (for when candidate evaluation fails)
export const sendEvaluationFailureEmail = async ({ email, candidateName, jobTitle, applicationId, errorMessage }) => {
    const subject = `Application Processing Issue: ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nWe encountered an issue while processing your application for "${jobTitle}" (Application ID: ${applicationId}).\nError: ${errorMessage}\n\nOur team is looking into this, and we will contact you with next steps.`;
    const html = `
    <p>Dear ${candidateName},</p>
    <p>We encountered an issue while processing your application for "<strong>${jobTitle}</strong>" (Application ID: ${applicationId}).</p>
    <p><strong>Error:</strong> ${errorMessage}</p>
    <p>Our team is looking into this, and we will contact you with next steps.</p>
  `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
};