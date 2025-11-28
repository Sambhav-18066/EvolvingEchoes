import { config } from 'dotenv';
config();

import '@/ai/flows/evaluate-speaking-self-rubric-score.ts';
import '@/ai/flows/generate-narrative-scaffold.ts';
import '@/ai/flows/generate-self-reflection-prompts.ts';