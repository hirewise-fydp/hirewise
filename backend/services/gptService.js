import openai from "../config/openaiConfig.js";
// /**
//  * Generate a response using OpenAI based on provided instructions and input text.
//  *
//  * @param {string} systemInstructions - General instructions for the system.
//  * @param {string} taskInstructions - Specific instructions for the task.
//  * @param {string} inputText - User-provided input.
//  * @returns {Promise<string>} - The generated response from OpenAI.
//  */
// const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
//   try {
//     const fullPrompt = `${systemInstructions}\n\nTask Instructions:\n${taskInstructions}`;

//     const response = await openai.chat.completions.create({
//         model: 'gpt-4',
//         messages: [
//             { role: 'system', content: fullPrompt },
//             { role: 'user', content: inputText },
//         ],
//     });

//     const rawResponse = response.choices[0].message.content;
//     console.log("raw response", rawResponse);
    
//     try {
      
//       const validJson = JSON.parse(rawResponse);
    
//       return validJson
//     } catch (error) {
//       console.error("Error parsing JSON:", error.message);
//     }
    
//   } catch (error) {
//     console.error('Error in GPT Service:', error.message);
//     throw new Error('Failed to generate response from OpenAI');
//   }
// };

// export default generateResponse

const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
  try {
    // Ensure `inputText` is properly formatted
    const formattedInputText = 
      typeof inputText === 'object' ? JSON.stringify(inputText) : inputText;

    const fullPrompt = `${systemInstructions}\n\nTask Instructions:\n${taskInstructions}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: fullPrompt },
        { role: 'user', content: formattedInputText },
      ],
    });

    let rawResponse = response.choices[0].message.content;
    console.log("Raw Response Type:", typeof rawResponse);
    console.log("Raw Response Content (Before Cleaning):", rawResponse);

    // Clean the raw response to ensure valid JSON
    rawResponse = cleanRawResponse(rawResponse);
    console.log("Raw Response Content (After Cleaning):", rawResponse);

    // Parse JSON safely
    try {
      const parsedResponse = JSON.parse(rawResponse);
      return parsedResponse;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError.message);
      throw new Error("Failed to parse OpenAI response as JSON");
    }
  } catch (error) {
    console.error('Error in GPT Service:', error.message);
    throw new Error('Failed to generate response from OpenAI');
  }
};

// Function to clean invalid control characters
function cleanRawResponse(rawResponse) {
  // Removes control characters from the string
  return rawResponse.replace(/[\u0000-\u001F\u007F]/g, ''); // Removes ASCII control characters
}

export default generateResponse;
