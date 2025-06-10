import openai from "../config/openaiConfig.js";
const generateResponse = async (systemInstructions, taskInstructions, inputText) => {
  try {
    const formattedInputText =
      typeof inputText === 'object' ? JSON.stringify(inputText) : inputText;

    const fullPrompt = `${systemInstructions}\n\nTask Instructions:\n${taskInstructions}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: fullPrompt },
        { role: 'user', content: formattedInputText },
      ],
      max_tokens: 4096,
      temperature: 0.2,
      
    });

    let rawResponse = response.choices[0].message.content;


    rawResponse = cleanRawResponse(rawResponse);



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

function cleanRawResponse(rawResponse) {

  return rawResponse.replace(/[\u0000-\u001F\u007F]/g, '');
}

export default generateResponse;
