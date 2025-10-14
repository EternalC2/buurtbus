import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// !! WAARSCHUWING: Dit is een onveilige methode voor debugging !!
// Vervang "UW_API_SLEUTEL_HIER" door uw daadwerkelijke sleutel.
// Als dit werkt, weten we dat het probleem het laden van de .env-variabele is.
const GEMINI_API_KEY = "UW_API_SLEUTEL_HIER";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
  model: 'gemini-1.5-flash-latest',
});
