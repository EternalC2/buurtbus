'use server';

/**
 * @fileOverview Estimates the arrival time of the buurtbus using a Genkit flow.
 *
 * - estimateArrivalTime - A function that estimates the arrival time.
 * - EstimatedArrivalTimeInput - The input type for the estimateArrivalTime function.
 * - EstimatedArrivalTimeOutput - The return type for the estimateArrivalTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatedArrivalTimeInputSchema = z.object({
  userLocation: z
    .string()
    .describe('The current GPS coordinates of the user requesting the bus.'),
  busRoute: z.string().describe('The current route the bus is driving.'),
  timeOfRequest: z
    .string()
    .describe(
      'The time the user requested the bus in ISO 8601 format like 2019-10-12T07:20:50.52Z'
    ),
  historicalData: z
    .string()
    .describe(
      'Historical data about this bus route including average speed and common delays'
    ),
});
export type EstimatedArrivalTimeInput = z.infer<
  typeof EstimatedArrivalTimeInputSchema
>;

const EstimatedArrivalTimeOutputSchema = z.object({
  estimatedArrivalTime: z
    .string()
    .describe(
      'The estimated arrival time of the bus, formatted as ISO 8601.'
    ),
  confidence: z
    .number()
    .describe(
      'A number between 0 and 1 indicating how confident the model is in the arrival time estimation.'
    ),
});
export type EstimatedArrivalTimeOutput = z.infer<
  typeof EstimatedArrivalTimeOutputSchema
>;

export async function estimateArrivalTime(
  input: EstimatedArrivalTimeInput
): Promise<EstimatedArrivalTimeOutput> {
  return estimateArrivalTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatedArrivalTimePrompt',
  input: {schema: EstimatedArrivalTimeInputSchema},
  output: {schema: EstimatedArrivalTimeOutputSchema},
  prompt: `You are an expert system for estimating the arrival time of a Buurtbus.

  Given the following information, estimate the arrival time of the bus and how confident you are in the estimate.

  User Location: {{{userLocation}}}
  Bus Route: {{{busRoute}}}
  Time of Request: {{{timeOfRequest}}}
  Historical Data: {{{historicalData}}}

  Consider traffic, weather, and any known delays on the route. Also, take into account the historical data to make as accurate of a prediction as possible.
  The estimated arrival time should be based on the time of request.
  Confidence should be represented as a number between 0 and 1.
  Arrival time should be formatted as ISO 8601.`,
});

const estimateArrivalTimeFlow = ai.defineFlow(
  {
    name: 'estimateArrivalTimeFlow',
    inputSchema: EstimatedArrivalTimeInputSchema,
    outputSchema: EstimatedArrivalTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
