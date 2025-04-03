import openai from "../config/openaiConfig.js";
const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ Correct way to delay execution
  console.log("Generating response...");

  return {
    "jobSummary": "To Manage sales of Direct Modern Trade (Makro, Metro, Hyperstar, CSDs & Food Services Distributors (indirect) and local General trade business of ISB/ RWP / Jehlum/ Taxila belt region through local distribution network.",
    "keyResponsibilities": [
      "Ensure primary and secondary sales targets achievement of the region (Value & Volumes).",
      "Expand distribution network in the ISB / RWP region, with the ability to add distributors without delay.",
      "Ensure reasonable numeric coverage of the complete Falak range in the ISB / RWP region.",
      "Ensure availability and visibility of the complete Falak Brand range.",
      "Assist in planning promotional activities to enhance sales and brand equity.",
      "Endorse maximum productivity of all reporting staff considering current and future plans according to Matco policies.",
      "Bring new ideas to diversify business in the assigned region as per company goals.",
      "Coordinate with customers and resolve issues.",
      "Maximize coordination with departments like accounts and logistics.",
      "Ensure recovery of credit amounts within the agreed timeframe."
    ],
    "qualifications": {
      "education": "Bachelor’s degree (minimum), preferably a Master's.",
      "experience": "3-4 years of experience in the same RSM position working in the same region, or experience leading a regional head position in the same region under a different designation.",
      "skills": [
        "Complete command of MS Excel, Word, PowerPoint, and email drafting.",
        "Strong negotiation skills.",
        "Self-control.",
        "Team-building skills.",
        "Fluency in Urdu and Punjabi; English as a secondary language.",
        "Good time management and prioritization skills.",
        "Strong analytical troubleshooting and problem-solving skills.",
        "Multi-tasking ability.",
        "Willingness to relocate if required.",
        "Ability to attract top talent."
      ]
    },
    "location": "Islamabad (ISB)",
    "compensation": {
      "salaryRange": null,
      "benefits": []
    },
    "applicationProcess": "Not specified."
  };
};


// const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
//   try {
//     const formattedInputText = 
//       typeof inputText === 'object' ? JSON.stringify(inputText) : inputText;

//     const fullPrompt = `${systemInstructions}\n\nTask Instructions:\n${taskInstructions}`;
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4',
//       messages: [
//         { role: 'system', content: fullPrompt },
//         { role: 'user', content: formattedInputText },
//       ],
//     });

//     let rawResponse = response.choices[0].message.content;
//     console.log("Raw Response Type:", typeof rawResponse);
//     console.log("Raw Response Content (Before Cleaning):", rawResponse);


//     rawResponse = cleanRawResponse(rawResponse);
//     console.log("Raw Response Content (After Cleaning):", rawResponse);


//     try {
//       const parsedResponse = JSON.parse(rawResponse);
//       return parsedResponse;
//     } catch (parseError) {
//       console.error("Error parsing JSON:", parseError.message);
//       throw new Error("Failed to parse OpenAI response as JSON");
//     }
//   } catch (error) {
//     console.error('Error in GPT Service:', error.message);
//     throw new Error('Failed to generate response from OpenAI');
//   }
// };

// function cleanRawResponse(rawResponse) {
  
//   return rawResponse.replace(/[\u0000-\u001F\u007F]/g, '');
// }

export default generateResponse;
