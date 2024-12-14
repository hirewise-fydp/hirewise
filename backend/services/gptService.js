import openai from "../config/openaiConfig.js";
/**
 * Generate a response using OpenAI based on provided instructions and input text.
 *
 * @param {string} systemInstructions - General instructions for the system.
 * @param {string} taskInstructions - Specific instructions for the task.
 * @param {string} inputText - User-provided input.
 * @returns {Promise<string>} - The generated response from OpenAI.
 */
const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
  try {
    const fullPrompt = `${systemInstructions}\n\nTask Instructions:\n${taskInstructions}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: fullPrompt },
            { role: 'user', content: inputText },
        ],
    });

    const rawResponse = response.choices[0].message.content;
    try {
      
      const validJson = JSON.parse(rawResponse);
    
      return validJson
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
    }
    
  } catch (error) {
    console.error('Error in GPT Service:', error.message);
    throw new Error('Failed to generate response from OpenAI');
  }
};

export default generateResponse




// \n\nInput:\n${inputText}\n\nOutput: