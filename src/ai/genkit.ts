import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Om Genkit in een productieomgeving te gebruiken, stelt u de 
// GEMINI_API_KEY omgevingsvariabele in op uw server.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
