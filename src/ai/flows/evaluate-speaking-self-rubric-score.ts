'use server';

/**
 * @fileOverview This file defines a Genkit flow to evaluate a user's response
 * using a Speaking-of-Self rubric. It includes the flow definition,
 * input/output schemas, and a prompt that guides the AI in assessing
 * the response based on predefined criteria.
 *
 * - evaluateSpeakingSelfRubricScore - A function that evaluates the user's response based on a rubric.
 * - EvaluateSpeakingSelfRubricScoreInput - The input type for the evaluateSpeakingSelfRubricScore function.
 * - EvaluateSpeakingSelfRubricScoreOutput - The return type for the evaluateSpeakingSelfRubricScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateSpeakingSelfRubricScoreInputSchema = z.object({
  response: z
    .string()
    .describe('The user response to evaluate against the rubric.'),
  rubricCriteria: z
    .string()
    .describe('The rubric criteria to use for evaluation.'),
});
export type EvaluateSpeakingSelfRubricScoreInput = z.infer<
  typeof EvaluateSpeakingSelfRubricScoreInputSchema
>;

const EvaluateSpeakingSelfRubricScoreOutputSchema = z.object({
  score: z
    .number()
    .describe('The score based on the rubric criteria.'),
  justification: z
    .string()
    .describe('The justification for the assigned score.'),
});
export type EvaluateSpeakingSelfRubricScoreOutput = z.infer<
  typeof EvaluateSpeakingSelfRubricScoreOutputSchema
>;

export async function evaluateSpeakingSelfRubricScore(
  input: EvaluateSpeakingSelfRubricScoreInput
): Promise<EvaluateSpeakingSelfRubricScoreOutput> {
  return evaluateSpeakingSelfRubricScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSpeakingSelfRubricScorePrompt',
  input: {schema: EvaluateSpeakingSelfRubricScoreInputSchema},
  output: {schema: EvaluateSpeakingSelfRubricScoreOutputSchema},
  prompt: `You are an AI assistant specialized in evaluating user responses based on a Speaking-of-Self rubric.

  Evaluate the following user response:
  {{response}}

  Based on the following rubric criteria:
  {{rubricCriteria}}

  Provide a score and a justification for the score.
  Score:
  Justification: `,
});

const evaluateSpeakingSelfRubricScoreFlow = ai.defineFlow(
  {
    name: 'evaluateSpeakingSelfRubricScoreFlow',
    inputSchema: EvaluateSpeakingSelfRubricScoreInputSchema,
    outputSchema: EvaluateSpeakingSelfRubricScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
