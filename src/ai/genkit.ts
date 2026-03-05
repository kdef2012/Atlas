import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  // Synchronized to the stable 1.5 architecture to prevent 404 errors and reduce rate-limit interference
  model: 'googleai/gemini-1.5-flash',
});
