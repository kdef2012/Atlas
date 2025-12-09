
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the model instance
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.9, // High creativity for cosmetics
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export interface GeminiResponse {
  text: string;
  finishReason: string;
}

export interface GeminiStreamChunk {
  text: string;
  done: boolean;
}

/**
 * Generate text using Gemini with Nano Banana-style structured prompting
 */
export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string
): Promise<GeminiResponse> {
  try {
    const fullPrompt = systemInstruction 
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    return {
      text: response.text(),
      finishReason: response.candidates?.[0]?.finishReason || 'STOP',
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to generate with Gemini: ${error}`);
  }
}

/**
 * Generate with streaming (for real-time UI updates)
 */
export async function* streamWithGemini(
  prompt: string,
  systemInstruction?: string
): AsyncGenerator<GeminiStreamChunk> {
  try {
    const fullPrompt = systemInstruction 
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const result = await model.generateContentStream(fullPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield {
        text: chunkText,
        done: false,
      };
    }

    yield {
      text: '',
      done: true,
    };
  } catch (error) {
    console.error('Gemini Streaming Error:', error);
    throw new Error(`Failed to stream with Gemini: ${error}`);
  }
}

/**
 * Parse JSON response from Gemini (with retry on parse failure)
 */
export async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string,
  retries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await generateWithGemini(prompt, systemInstruction);
      
      // Try to extract JSON from markdown code blocks
      let jsonText = response.text;
      const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      // Parse and return
      return JSON.parse(jsonText) as T;
    } catch (error) {
      if (attempt === retries) {
        console.error('Failed to parse JSON after retries:', error);
        throw new Error('Failed to parse AI response as JSON');
      }
      // Retry with more explicit JSON instruction
      prompt = prompt + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no explanation.';
    }
  }
  
  throw new Error('Failed to generate valid JSON');
}

/**
 * Count tokens (for cost estimation)
 */
export async function countTokens(text: string): Promise<number> {
  try {
    const result = await model.countTokens(text);
    return result.totalTokens;
  } catch (error) {
    console.error('Token counting error:', error);
    return 0;
  }
}

/**
 * Batch generate multiple items (with rate limiting)
 */
export async function batchGenerate(
  prompts: string[],
  systemInstruction?: string,
  delayMs = 1000
): Promise<GeminiResponse[]> {
  const results: GeminiResponse[] = [];
  
  for (const prompt of prompts) {
    const result = await generateWithGemini(prompt, systemInstruction);
    results.push(result);
    
    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Safety check - returns true if response is safe
 */
export function checkSafety(response: GeminiResponse): boolean {
  // Gemini has built-in safety filters
  // Additional custom checks can be added here
  const text = response.text.toLowerCase();
  
  // Block inappropriate content
  const bannedWords = ['violence', 'weapon', 'drug', 'explicit'];
  for (const word of bannedWords) {
    if (text.includes(word)) {
      return false;
    }
  }
  
  return true;
}

    