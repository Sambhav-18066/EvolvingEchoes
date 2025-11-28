'use server';

/**
 * @fileOverview Generates thought-provoking questions and prompts related to identity, goals, and experiences.
 *
 * - generateSelfReflectionPrompts - A function that generates self-reflection prompts.
 * - GenerateSelfReflectionPromptsInput - The input type for the generateSelfReflectionPrompts function.
 * - GenerateSelfReflectionPromptsOutput - The return type for the generateSelfReflectionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfReflectionPromptsInputSchema = z.object({
  userProfile: z
    .object({
      name: z.string().describe('The user\'s name.'),
      age: z.number().describe('The user\'s age.'),
      englishProficiency: z.string().describe('The user\'s English proficiency level.'),
      academicLevel: z.string().describe('The user\'s academic level.'),
      goals: z.string().describe('The user\'s learning goals.'),
    })
    .describe('The user profile information.'),
  topic: z.string().describe('The topic for self-reflection prompts.'),
  numberOfPrompts: z.number().describe('The number of self-reflection prompts to generate.'),
});
export type GenerateSelfReflectionPromptsInput = z.infer<
  typeof GenerateSelfReflectionPromptsInputSchema
>;

const GenerateSelfReflectionPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of self-reflection prompts.'),
});
export type GenerateSelfReflectionPromptsOutput = z.infer<
  typeof GenerateSelfReflectionPromptsOutputSchema
>;

export async function generateSelfReflectionPrompts(
  input: GenerateSelfReflectionPromptsInput
): Promise<GenerateSelfReflectionPromptsOutput> {
  return generateSelfReflectionPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSelfReflectionPromptsPrompt',
  input: {schema: GenerateSelfReflectionPromptsInputSchema},
  output: {schema: GenerateSelfReflectionPromptsOutputSchema},
  prompt: `You are an AI assistant designed to help English learners practice expressing themselves and reflecting on their lives.

  Based on the user's profile and the specified topic, generate a list of thought-provoking questions and prompts to encourage self-reflection.

  User Profile:
  Name: {{{userProfile.name}}}
  Age: {{{userProfile.age}}}
  English Proficiency: {{{userProfile.englishProficiency}}}
  Academic Level: {{{userProfile.academicLevel}}}
  Goals: {{{userProfile.goals}}}

  Topic: {{{topic}}}
  Number of Prompts: {{{numberOfPrompts}}}

  Prompts:`,
});

const generateSelfReflectionPromptsFlow = ai.defineFlow(
  {
    name: 'generateSelfReflectionPromptsFlow',
    inputSchema: GenerateSelfReflectionPromptsInputSchema,
    outputSchema: GenerateSelfReflectionPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
