'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating narrative scaffolds that users can edit and refine.
 *
 * - generateNarrativeScaffold - A function that generates sentence starters or suggestions based on user input.
 * - GenerateNarrativeScaffoldInput - The input type for the generateNarrativeScaffold function.
 * - GenerateNarrativeScaffoldOutput - The return type for the generateNarrativeScaffold function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNarrativeScaffoldInputSchema = z.object({
  previousInput: z
    .string()
    .describe('The user\'s previous input, used to generate the narrative scaffold.'),
});
export type GenerateNarrativeScaffoldInput = z.infer<
  typeof GenerateNarrativeScaffoldInputSchema
>;

const GenerateNarrativeScaffoldOutputSchema = z.object({
  narrativeScaffold: z
    .string()
    .describe('A sentence starter or suggestion based on the user\'s previous input.'),
});
export type GenerateNarrativeScaffoldOutput = z.infer<
  typeof GenerateNarrativeScaffoldOutputSchema
>;

export async function generateNarrativeScaffold(
  input: GenerateNarrativeScaffoldInput
): Promise<GenerateNarrativeScaffoldOutput> {
  return generateNarrativeScaffoldFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNarrativeScaffoldPrompt',
  input: {schema: GenerateNarrativeScaffoldInputSchema},
  output: {schema: GenerateNarrativeScaffoldOutputSchema},
  prompt: `You are an AI assistant designed to help English learners explore their personal narratives. Based on the user's previous input, generate a sentence starter or suggestion that they can edit and refine to better express their thoughts and feelings.\n\nPrevious Input: {{{previousInput}}}\n\nNarrative Scaffold:`,
});

const generateNarrativeScaffoldFlow = ai.defineFlow(
  {
    name: 'generateNarrativeScaffoldFlow',
    inputSchema: GenerateNarrativeScaffoldInputSchema,
    outputSchema: GenerateNarrativeScaffoldOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
