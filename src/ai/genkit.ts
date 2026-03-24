import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'gemini-1.5-flash', // [FIX] Sửa lại đúng tên model mới nhất của Google
});