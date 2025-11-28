
export type Message = {
  id: string;
  text: string;
  speaker: 'user' | 'ai';
  timestamp: number;
  audioUrl?: string;
  feedback?: {
    clarity?: number;
    lexicalRichness?: number;
    identityDepth?: number;
  };
  mood?: 'calm' | 'curious' | 'supportive'
};

export type UserProfile = {
  name: string;
  age: number;
  englishProficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  academicLevel: 'High School' | 'Undergraduate' | 'Graduate' | 'Post-graduate';
  goals: string;
};

export enum InteractionMode {
  AGENTIC = 'agentic',
  NON_AGENTIC = 'non-agentic',
  PEER = 'peer',
}
