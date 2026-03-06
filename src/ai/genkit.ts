import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  // Reverted to stable Gemini 1.5 Flash to resolve model deprecation errors
  model: 'googleai/gemini-1.5-flash',
});
