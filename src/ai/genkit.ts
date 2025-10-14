import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// !! WAARSCHUWING: De onderstaande API-sleutel is hardgecodeerd voor debugging !!
// Dit is onveilig. Verwijder dit en beveilig uw sleutel na het testen.
const GEMINI_API_KEY = "AIzaSyC9PniL9CXX5s06yS9fIJHUR_AtckpJIkE";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
  model: 'gemini-1.5-flash-latest',
});
