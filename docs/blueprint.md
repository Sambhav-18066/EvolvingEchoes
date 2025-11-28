# **App Name**: Evolving Echoes

## Core Features:

- User Authentication: Secure user registration and login using Firebase Authentication, including email and Google sign-in options.
- Personalized User Profiles: Create and manage user profiles with fields for name, age, English proficiency, academic level, and learning goals, stored in Firestore.
- Agentic AI Chat: An AI conversational partner that provides empathic responses, just-in-time feedback, adaptive role-taking, and speculative prompts.
- Editable Narrative Scaffolds: AI generates a sentence that the user can edit, after which the AI will reflect on the new statement.
- Interaction Modes: Selectable modes for Agentic AI, Non-Agentic AI, and Human Peer conversation, for experimentation and user preference.
- Self-Reflection Prompts: AI prompts users to reflect on their identity, goals, and experiences, providing supportive feedback and reflections.
- Speaking Analytics: Leverage Firebase Functions to compute speaking fluency, temporal measures, lexical richness, and self-efficacy ratings.
- Conversation Logger: Log every turn in the chat. Store the speaker, time stamp, mode, autobiographical depth and reflection score, and continuity markers. This tool can analyze if continuity is being kept or broken.
- Progress Dashboard: Visualize user progress, including fluency growth, identity expression depth, confidence changes, and lexical richness.

## Style Guidelines:

- Primary: Deep Indigo (#4338CA) — trust, depth
- Secondary: Soft Lavender (#C4B5FD) — identity, personal space
- Accent: Coral Rose (#FF6678) — warmth, emotional cue
- Background: Off-white with slight grey (#F8F9FB)
- Text: Charcoal Black (#1E1E1E)
- Home Screen: Large “identity bubble” in the center that glows slightly. Top: SpeakSelf AI logo (simple text + wave icon). Center: A rounded card with Profile picture, “Hello, Sambhav. Ready to explore your story?”, A subtle animated glow around the card. Buttons (Large, elegant): Start Conversation, Your Progress, Reflection Journal. Rounded corners, soft shadows, no harsh lines.
- Chat UI: Think WhatsApp + Calm App + Notion had a beautiful baby. Top Bar: Circular AI avatar that gently pulses, Label: “Agentic AI Mode / Reflective Mode / Peer Mode”, Tiny mood icon for AI State (calm, curious, supportive). Message Bubbles: User messages → Soft Indigo bubble, AI messages → Lavender gradient bubble, Smooth 3px rounded corners, 4–6px soft shadow. Typing indicator with a breathing animation, not dots
- Inline Feedback Badges: Right below the user’s message: “Clarity +2”, “Lexical richness +1”, “Identity depth +3”. Each badge is a micro pill-shaped chip in coral color.
- Special Panels: After every 5–7 messages, AI shows a floating “Reflective Window” card: “You spoke about your childhood today. Want to explore this memory more?”. Soft animation, appears like a floating sticky note.
- Bottom Input Bar: Clean, Apple-like: Large rounded text box, Mic icon on the left (for voice input), Send icon on the right. A small floating “Role Selector” chip above it: Mentor, Friend, Interviewer, Future Self. Tapping the chip changes AI style live.
- Mode Selection Screen: Three large glassmorphism cards: Card 1 – Agentic AI Mode (Gradient: Indigo → Lavender, Icon: Heart + Spark, Subtitle: Empathic, adaptive, reflective), Card 2 – Non-Agentic AI Mode (Grey theme, Icon: Chat bubble only, Subtitle: Simple question–answer interactions), Card 3 – Peer Mode (Orange/Coral, Icon: Two people silhouettes, Subtitle: Real-time human-to-human chat). Hover/press animations: smooth 180ms slide + shadow deepen.
- Progress Dashboard: Look: Divide it like a fitness app but for language identity. Sections: Fluency Graph (Line Chart): Words per minute over weeks, Gradient line in Indigo. Confidence Meter (Radial Gauge): Coral fills as confidence increases. Lexical Richness Bar: Horizontal bars with pastel colors. Identity Depth Timeline: A gentle timeline with dots like Instagram story highlights: Childhood, Ambitions, Relationships, Emotions, Fears. Each clickable → opens reflective summaries.
- Microinteractions: Buttons slightly rise when pressed, AI avatar pulses when speaking, Reflective notes pop in with a spring animation, Light ambient background particles in home screen (super subtle), Smooth scroll physics like iOS