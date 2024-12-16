import generateResponse from '../services/gptService.js';
import { ApiError } from '../utils/ApiError.js';

const SYSTEM_INSTRUCTIONS = `
You are an expert assistant for analyzing and comparing resumes and job descriptions. Your task is to evaluate how well a given resume maps to a job description.

You will analyze structured JSON inputs for a resume and a job description and produce two outputs:
1. A compatibility score out of 100, representing how well the resume aligns with the job description.
2. A detailed textual evaluation report highlighting:
   - Which skills, experiences, and qualifications in the resume match the JD.
   - Which parts of the JD are not covered by the resume.
   - Suggestions for improving the resume to better match the JD.

Provide your output as a JSON object with the following schema:
{
  "compatibilityScore": Number, // Out of 100
  "evaluationReport": String // Detailed textual evaluation
}
`;

const TASK_INSTRUCTIONS = `
Compare the following structured JSON resume and job description inputs. Use the following criteria for evaluation:

1. Skills: Evaluate the overlap between required skills in the JD and skills listed in the resume. Consider relevance, breadth, and depth.
2. Experience: Compare the job roles, responsibilities, and achievements in the resume to the key responsibilities in the JD.
3. Education: Check if the resume meets the educational qualifications in the JD.
4. Certifications: Evaluate whether certifications in the resume align with those mentioned or implied in the JD.
5. Overall Match: Assess how well the resume fulfills the JD holistically, considering any gaps or mismatches.

Provide:
- A compatibility score out of 100. Higher scores indicate better alignment.
- A detailed evaluation report highlighting strengths, weaknesses, and specific recommendations for improvement.

Use plain language for the evaluation report, and structure it clearly for easy readability.`;

export const compareResumeToJobDescription = async (req, res) => {
  const resumeJson = {
    "personalInfo": {
        "fullName": "MUHAMMAD USAID SIDDIQUI",
        "email": "usaidsidiqui70@gmail.com",
        "phone": "0331-3083452",
        "linkedin": null,
        "portfolio": null,
        "address": null
    },
    "skills": [
        {
            "category": "Technical",
            "skillsList": [
                "React.js",
                "Database Sql / No Sql",
                "ORM Sequelize /  Mongoose",
                "Python",
                "Javascript",
                "Node.js / Express.js",
                "Git / Github",
                "Gsap"
            ]
        }
    ],
    "experience": [
        {
            "companyName": "NCL-NED",
            "role": "Software Development Intern",
            "startDate": "2024-01-01",
            "endDate": "2024-02-28",
            "description": null,
            "keyAchievements": []
        },
        {
            "companyName": "Contive",
            "role": "Software Development Intern",
            "startDate": "2024-03-01",
            "endDate": "2024-06-30",
            "description": null,
            "keyAchievements": []
        },
        {
            "companyName": "Intovative",
            "role": "Jr. Software Developer",
            "startDate": "2024-07-01",
            "endDate": null,
            "description": "Collaborated on building and enhancing software modules and features for both backend and frontend applications. Designed, developed, and maintained database schemas to support software functionalities. Implemented seamless integration of software components to ensure optimal performance and user experience.",
            "keyAchievements": [
                "Collaborated on building and enhancing software modules and features for both backend and frontend applications.",
                "Designed, developed, and maintained database schemas to support software functionalities.",
                "Implemented seamless integration of software components to ensure optimal performance and user experience."
            ]
        }
    ],
    "education": [
        {
            "degree": "Computer Information and System Engineering",
            "institution": "Ned University Of Engineering and Technology",
            "graduationYear": 2025
        },
        {
            "degree": "Pre Engineering",
            "institution": "Adamjee Govt Science College",
            "graduationYear": 2021
        }
    ],
    "certifications": [
        {
            "title": "Back-End Apps with Node.js and Express",
            "issuingOrganization": "Coursera Node.js IBM",
            "issueDate": "2024-01-04"
        },
        {
            "title": "Front-end Job Simulation",
            "issuingOrganization": "Skyscanner Job Simulation",
            "issueDate": "2024-02-12"
        }
    ],
    "projects": [
        {
            "title": "EDOC | Online Medical Consultancy Software",
            "description": "Designed and developed an online medical consultancy software enabling seamless doctor consultations through video calling. Admin manages the registrations for doctor and appointments for patients.",
            "technologiesOrToolsUsed": [
                "React.js",
                "Node.js",
                "Express.js",
                "My Sql"
            ],
            "link": null
        },
        {
            "title": "ZENVENTORY | Inventory Management System",
            "description": "Developed inventory management system for stores management. Manages product’s  supplier, customer and  status for a store.",
            "technologiesOrToolsUsed": [
                "Html",
                "Css",
                "Javascript",
                "Node.js",
                "My Sql"
            ],
            "link": null
        },
        {
            "title": "CRICKETBASE | Cricket Data Insights",
            "description": "Built an IPL database management system to run various queries on IPL datasets. Implemented a backend with Node.js and served data through a frontend using simple HTML, CSS, and JavaScript.",
            "technologiesOrToolsUsed": [
                "Node.js",
                "HTML",
                "CSS",
                "JavaScript",
                "My Sql"
            ],
            "link": null
        }
    ],
    "achievements": [],
    "internships": [],
    "references": []
}


    const jdJson = {
        "jobTitle": "Software Project Manager",
        "jobSummary": "To Manage sales of Direct Modern Trade (Makro, Metro, Hyperstar, CSDs & Food Services Distributors (indirect) and local General trade business of ISB/ RWP / Jehlum/ Taxila belt region through local distribution network.",
        "keyResponsibilities": [
          "To ensure Primary and secondary sales targets achievement of the region. (Value & Volumes).",
          "To Expend distribution network in to whole ISB / RWP region. must have ability to add distributor anywhere in assigned region without any delay.",
          "To ensure reasonable numeric coverage of complete fala range in to whole ISB/ RWP region.",
          "To Ensure the availability & visibility of complete Falak Brand range.",
          "Assist in planning all the promotional activities to enhance the sales and brand equity.",
          "Assist in endorsing the maximum productivity of all the reporting staff considering the current & future plans according to Matco policies.",
          "Bring new ideas to diversify the business of the assigned region as per company’s goals.",
          "Assist in coordinating with all the related customers with resolving the issue.",
          "Assist in maximizing coordination with other department like accounts & Logistics team.",
          "Ensure to recover credit amount as per agreed time frame."
        ],
        "qualifications": {
          "education": "Bachelor’s degree MIN , preferable masters",
          "experience": "3-4 years’ experience of same RSM position, working in same region. or Must lead regional Head position of same region with any other designation.",
          "skills": [
            "Complete Command on MS Excel/ word/ power point and email drafting.",
            "Required Best negotiations skill.",
            "Self-controlled.",
            "Team building skills.",
            "Able to speak URDU / Punjabi language fluently. English as a secondary language.",
            "Good time Management and prioritizing skills",
            "Strong analytical troubleshooting and problem-resolution/solving skills",
            "Multi-tasking",
            "Ability to relocate If required",
            "Ability to attract the top talent"
          ]
        },
        "location": "ISB",
        "compensation": {
          "salaryRange": null,
          "benefits": []
        },
        "applicationProcess": "Statements in this document are intended to reflect, in general, the role and responsibilities of the position, but are not to be interpreted as totally inclusive. Accepted by Job Holder Verified by Line Manager Approved by HR",
       
      }

  if (!resumeJson || !jdJson) {
    return res.status(400).json({ error: 'Resume JSON and JD JSON are required' });
  }

  try {
    // Call GPT service with system and task instructions, and the provided inputs.
    const gptResponse = await generateResponse(SYSTEM_INSTRUCTIONS, TASK_INSTRUCTIONS, {
      resume: resumeJson,
      jobDescription: jdJson,
    });

    console.log("GPT RESPONSE", gptResponse);

    // Parse and return the response
    // const validJSON = JSON.parse(gptResponse);
    res.status(200).json(gptResponse);
  } catch (error) {
    console.error('Error comparing resume to JD:', error.response?.data || error.message);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to compare resume to job description' });
    }
  }
};
