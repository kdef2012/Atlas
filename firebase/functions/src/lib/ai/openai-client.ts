
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = 'gpt-4o'; // Use GPT-4o as requested

export interface OpenAIResponse {
  text: string;
  finishReason: string;
}

export async function generateWithOpenAI(
  prompt: string,
  systemInstruction?: string
): Promise<OpenAIResponse> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: model,
    });

    const content = chatCompletion.choices[0]?.message?.content || '';
    const finishReason = chatCompletion.choices[0]?.finish_reason || 'stop';

    return {
      text: content,
      finishReason: finishReason,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to generate with OpenAI: ${error}`);
  }
}

export async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string,
  retries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add instruction to get JSON output for OpenAI
      const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY the JSON object. Do not wrap it in markdown or provide any explanation.`;
      
      const response = await generateWithOpenAI(jsonPrompt, systemInstruction);
      
      let jsonText = response.text;
      // More robust regex to find a JSON object, even with surrounding text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      return JSON.parse(jsonText) as T;
    } catch (error) {
      if (attempt === retries) {
        console.error('Failed to parse JSON after retries:', error);
        throw new Error('Failed to parse AI response as JSON');
      }
    }
  }
  throw new Error('Failed to generate valid JSON');
}
