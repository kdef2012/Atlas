import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  // Use the -latest alias for maximum reliability across API versions
  model: 'googleai/gemini-1.5-flash-latest',
});
