export const DB_NAME="Hirewise"

export const SYSTEM_INSTRUCTIONS = `
You are a highly skilled assistant trained to transform raw, unstructured job descriptions into structured JSON data. 
You will map information from the raw job description into a specific schema. 
Follow the schema strictly, and organize data logically and consistently. 
Extract all relevant details accurately, and format the output as a JSON object. 
Do not skip any details that fit into the schema.
Provide only the valid json in the output with no other information in the response other than json
`;

export const TASK_INSTRUCTIONS = `
Read the given raw job description. Transform the unstructured text into a structured JSON object based on the following schema:

{
  jobSummary: String,
  keyResponsibilities: [String],
  qualifications: {
    education: String,
    experience: String,
    skills: [String]
  },
  location: String,
  compensation: {
    salaryRange: String,
    benefits: [String]
  },
  applicationProcess: String
}

Ensure:
- jobSummary captures the "Job Purpose" section.
- keyResponsibilities is an array of individual responsibilities from the "Principal Accountabilities" section.
- qualifications.education reflects the required education level.
- qualifications.experience describes required experience.
- qualifications.skills is an array of skills mentioned.
- location specifies the job location.
- compensation.salaryRange includes any salary details mentioned (if available, otherwise leave empty).
- compensation.benefits includes an array of benefits (if available, otherwise leave empty).
- applicationProcess captures how candidates are expected to apply or any application-related notes.

For missing fields (e.g., salary details or benefits), include the property but leave the value as null or an empty array ([]) as appropriate.
Follow the schema format exactly. Use arrays where specified. Retain all essential details and omit extraneous or irrelevant information.
`;
