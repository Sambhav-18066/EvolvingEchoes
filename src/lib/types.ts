export type Message = {
  id: string;
  text: string;
  speaker: 'user' | 'ai';
  timestamp: number;
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

export type InteractionMode = 'agentic' | 'non-agentic' | 'peer';
