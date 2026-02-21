import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  // Use the high-stability model identifier to prevent 404 errors
  model: 'googleai/gemini-1.5-flash',
});
