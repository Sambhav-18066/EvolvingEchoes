'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a reflective prompt based on a conversation history.
 *
 * - generateReflection - A function that generates a reflective prompt.
 * - GenerateReflectionInput - The input type for the generateReflection function.
 * - GenerateReflectionOutput - The return type for the generateReflection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

const GenerateReflectionInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
});
export type GenerateReflectionInput = z.infer<
  typeof GenerateReflectionInputSchema
>;

const GenerateReflectionOutputSchema = z.object({
  reflection: z
    .string()
    .describe('A reflective prompt based on the conversation history.'),
});
export type GenerateReflectionOutput = z.infer<
  typeof GenerateReflectionOutputSchema
>;

export async function generateReflection(
  input: GenerateReflectionInput
): Promise<GenerateReflectionOutput> {
  return generateReflectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReflectionPrompt',
  input: {schema: GenerateReflectionInputSchema},
  output: {schema: GenerateReflectionOutputSchema},
  prompt: `You are an AI assistant that helps users reflect on their conversations. 
  Analyze the following conversation and generate a single, thought-provoking question or observation to encourage deeper reflection. 
  Focus on a key theme or feeling that emerged.

  Conversation History:
  {{#each history}}
  - {{speaker}}: {{text}}
  {{/each}}

  Generate a reflective prompt. For example: "You spoke about your childhood today. This seems like an important memory. Would you like to explore this more?"
  `,
});

const generateReflectionFlow = ai.defineFlow(
  {
    name: 'generateReflectionFlow',
    inputSchema: GenerateReflectionInputSchema,
    outputSchema: GenerateReflectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
