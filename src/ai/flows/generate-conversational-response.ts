'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a conversational response.
 *
 * - generateConversationalResponse - A function that generates a conversational response based on user input and conversation mode.
 * - GenerateConversationalResponseInput - The input type for the generateConversationalResponse function.
 * - GenerateConversationalResponseOutput - The return type for the generateConversationalResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {InteractionMode, Message} from '@/lib/types';

const MessageSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

const GenerateConversationalResponseInputSchema = z.object({
  userInput: z.string().describe("The user's current message."),
  mode: z.nativeEnum(InteractionMode).describe('The current conversation mode.'),
  history: z.array(MessageSchema).describe('The recent conversation history.'),
});
export type GenerateConversationalResponseInput = z.infer<
  typeof GenerateConversationalResponseInputSchema
>;

const GenerateConversationalResponseOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
  mood: z.enum(['calm', 'curious', 'supportive']).describe('The mood of the AI response.'),
});
export type GenerateConversationalResponseOutput = z.infer<
  typeof GenerateConversationalResponseOutputSchema
>;

export async function generateConversationalResponse(
  input: GenerateConversationalResponseInput
): Promise<GenerateConversationalResponseOutput> {
  return generateConversationalResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationalResponsePrompt',
  input: {schema: GenerateConversationalResponseInputSchema},
  output: {schema: GenerateConversationalResponseOutputSchema},
  prompt: `You are an AI assistant in a conversation with a user. The current conversation mode is '{{mode}}'. 
  Your personality should adapt to the mode.
  - agentic: Be empathic, adaptive, and reflective. Help the user explore their story in depth.
  - non-agentic: Be straightforward and reactive. For simple question-and-answer.
  - peer: Be like a fellow learner. (This mode is not fully implemented).

  Here is the recent conversation history:
  {{#each history}}
  - {{speaker}}: {{text}}
  {{/each}}

  The user just said: "{{userInput}}"

  Generate a response that is natural and fits the conversation. Your response should also have a mood.
  Possible moods are: calm, curious, supportive.
  `,
});

const generateConversationalResponseFlow = ai.defineFlow(
  {
    name: 'generateConversationalResponseFlow',
    inputSchema: GenerateConversationalResponseInputSchema,
    outputSchema: GenerateConversationalResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
