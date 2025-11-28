
"use client";

import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { InteractionMode, Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BrainCircuit, Mic, Send, Sparkles, Users, MicOff, Volume2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateConversationalResponse } from "@/ai/flows/generate-conversational-response";
import { generateReflection } from "@/ai/flows/generate-reflection";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, setDocumentNonBlocking } from "@/firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";

const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar-1');
const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

const modeDetails: Record<string, { name: string; icon: React.ReactNode, initialMessage: string }> = {
  [InteractionMode.AGENTIC]: { name: 'Agentic AI Mode', icon: <Sparkles className="w-4 h-4" />, initialMessage: "Hello! I see you've chosen Agentic AI Mode. I'm ready to listen. What's on your mind today?" },
  [InteractionMode.NON_AGENTIC]: { name: 'Non-Agentic AI Mode', icon: <BrainCircuit className="w-4 h-4" />, initialMessage: "Hello! You've selected Non-Agentic AI Mode. Ask me anything." },
  [InteractionMode.PEER]: { name: 'Peer Mode', icon: <Users className="w-4 h-4" />, initialMessage: "Hey! I'm in Peer Mode. Ready to practice our conversation skills together? What should we talk about?" }
};

// @ts-ignore
const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function ConversationPage() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as InteractionMode) || InteractionMode.AGENTIC;
  const { user } = useUser();
  const db = useFirestore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReflectiveWindow, setShowReflectiveWindow] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const stopByUser = useRef(false);
  const { toast } = useToast();

  // Refs to track session stats
  const sessionStartTime = useRef(Date.now());
  const userWordCount = useRef(0);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported by this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Google US English')));
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
        // Fallback if no specific female voice is found
        const defaultVoice = voices.find(voice => voice.lang.startsWith('en') && voice.default);
        if (defaultVoice) utterance.voice = defaultVoice;
    }

    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const updateStats = useCallback(async () => {
    if (!user || !db) return;
  
    const sessionDurationSeconds = (Date.now() - sessionStartTime.current) / 1000;
    const sessionDurationMinutes = Math.floor(sessionDurationSeconds / 60);
  
    const userProfileRef = doc(db, "users", user.uid);
  
    try {
      // Ensure the document exists before trying to update it.
      // This creates the doc with default stats if it's the user's first session.
      const initialStats = {
        stats: {
          sessions: { total: 0, change: 0 },
          averageSessionLength: { minutes: 0, seconds: 0, change: 0 },
          journalEntries: { total: 0, change: 0 },
          confidence: 75,
          fluency: [],
          lexicalRichness: [],
        }
      };
      setDocumentNonBlocking(userProfileRef, initialStats, { merge: true });
  
      const uniqueWords = new Set(messages.filter(m => m.speaker === 'user').map(m => m.text).join(' ').split(/\s+/).filter(Boolean)).size;
  
      const updatePayload = {
        'stats.sessions.total': increment(1),
        'stats.averageSessionLength.minutes': increment(sessionDurationMinutes),
        'stats.lexicalRichness': arrayUnion({
          date: new Date().toISOString().split('T')[0],
          uniqueWords: uniqueWords,
        }),
      };
  
      // Now, perform the update on the (now guaranteed to exist) document
      updateDoc(userProfileRef, updatePayload)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'update',
            requestResourceData: updatePayload,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
  
    } catch (error: any) {
       console.error("Error setting up stats update:", error);
       const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'write',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  }, [user, db, messages]);


  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      if (user && messages.length > 1) { // only update if there was an interaction
        updateStats();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, messages.length]);


  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Add words to word count
    userWordCount.current += text.trim().split(/\s+/).length;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      speaker: 'user',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    const userMessagesCount = newMessages.filter(m => m.speaker === 'user').length;
    
    try {
      const history = newMessages.slice(-10).map(({ speaker, text }) => ({ speaker, text }));
      const aiResult = await generateConversationalResponse({ userInput: text, mode, history });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResult.response,
        speaker: 'ai',
        timestamp: Date.now(),
        mood: aiResult.mood,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      speak(aiResponse.text);

      if (userMessagesCount > 0 && userMessagesCount % 5 === 0) {
        const reflectionResult = await generateReflection({ history: history.concat([{speaker: 'ai', text: aiResult.response}]) });
        setReflectionText(reflectionResult.reflection);
        setShowReflectiveWindow(true);
      } else {
        setShowReflectiveWindow(false);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting. Please try again in a moment.",
        speaker: 'ai',
        timestamp: Date.now(),
        mood: 'calm',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, mode, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }

  useEffect(() => {
    // Pre-load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        // This is often necessary to get the full list of voices.
        const poller = setInterval(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                clearInterval(poller);
            }
        }, 100);
    }
    const initialMessage = {
      id: '1',
      text: modeDetails[mode].initialMessage,
      speaker: 'ai',
      timestamp: Date.now(),
      mood: 'calm',
    };
    setMessages([initialMessage]);
    speak(initialMessage.text);
    sessionStartTime.current = Date.now();
    userWordCount.current = 0;
  }, [mode, speak]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);
  
   useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      stopByUser.current = false;
    };

    recognition.onend = () => {
        setIsRecording(false);
        // Do not automatically send on end. User must click send.
    };
    
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are normal occurrences, don't show a scary error.
        return;
      }
      console.error("Speech recognition error:", event.error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `An error occurred: ${event.error}. Please ensure you've granted microphone permissions.`,
      });
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Set the input to the most recent stable (final) transcript,
      // with the ongoing (interim) transcript appended.
      setInput(finalTranscript.trim() + interimTranscript);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);


  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }

    if (isRecording) {
      stopByUser.current = true;
      recognitionRef.current.stop();
    } else {
      try {
        setInput('');
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start recognition", e);
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not start recording. Please ensure microphone permissions are granted and try again.",
        });
      }
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <Header isLoggedIn={true} />
      <main className="flex-1 flex flex-col pt-20 overflow-hidden">
        <div className="flex-shrink-0 border-b p-4">
           <div className="flex items-center justify-between p-2 rounded-lg bg-card border">
             <div className="flex items-center gap-3">
               <Avatar className="h-10 w-10 relative">
                 {aiAvatar && <AvatarImage src={aiAvatar.imageUrl} data-ai-hint={aiAvatar.imageHint} />}
                 <AvatarFallback>AI</AvatarFallback>
                 <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full">
                   {modeDetails[mode].icon}
                 </div>
               </Avatar>
               <div>
                 <h2 className="font-semibold">{modeDetails[mode].name}</h2>
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <span className={cn("w-2 h-2 rounded-full", isTyping ? "bg-yellow-500 animate-pulse" : "bg-green-500")}></span>
                   {isTyping ? "AI is thinking..." : `AI is feeling ${messages[messages.length - 1]?.mood || 'calm'}`}
                 </p>
               </div>
             </div>
             <Button variant="ghost" asChild>
                <Link href="/modes">Change Mode</Link>
             </Button>
           </div>
        </div>
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
            <ScrollArea className="flex-1 p-6" viewportRef={viewportRef}>
              <div className="space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} onPlayAudio={() => speak(message.text)} />
                ))}
                {isTyping && <TypingIndicator />}
                 {showReflectiveWindow && (
                    <div className="w-full flex justify-center py-4">
                      <ReflectiveWindow 
                        reflection={reflectionText}
                        onClose={() => setShowReflectiveWindow(false)} 
                      />
                    </div>
                  )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-card">
             <div className="max-w-4xl mx-auto w-full">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={toggleRecording} type="button">
                  {isRecording ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5" />}
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="rounded-full h-12 pr-28 text-base"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     <Select defaultValue="friend">
                       <SelectTrigger className="w-[100px] h-9 rounded-full text-xs">
                         <SelectValue placeholder="Role" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="mentor">Mentor</SelectItem>
                         <SelectItem value="friend">Friend</SelectItem>
                         <SelectItem value="interviewer">Interviewer</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </div>
                <Button type="submit" size="icon" className="w-12 h-12 rounded-full flex-shrink-0 shadow-lg shadow-primary/30">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
             </div>
            </div>
          </div>
        </main>
    </div>
  );
}

const MessageBubble = ({ message, onPlayAudio }: { message: Message, onPlayAudio: (text: string) => void }) => {
  const isUser = message.speaker === 'user';
  return (
    <div className={cn("flex items-end gap-3 w-full", isUser ? "ml-auto flex-row-reverse justify-end" : "mr-auto justify-start")}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={isUser ? userAvatar?.imageUrl : aiAvatar?.imageUrl} />
        <AvatarFallback>{isUser ? 'S' : 'AI'}</AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "p-3 rounded-2xl shadow-md max-w-lg flex items-center gap-2",
          isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm"
        )}>
          <p className="text-base">{message.text}</p>
          {!isUser && (
            <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0" onClick={() => onPlayAudio(message.text)}>
                <Volume2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        {isUser && message.feedback && (
          <div className="flex gap-2 justify-end">
            <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent">Clarity +{message.feedback.clarity}</Badge>
            <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent">Depth +{message.feedback.identityDepth}</Badge>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-end gap-3 mr-auto">
    <Avatar className="h-8 w-8">
      <AvatarImage src={aiAvatar?.imageUrl} />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="p-3 rounded-2xl shadow-md bg-secondary text-secondary-foreground rounded-bl-sm flex items-center gap-1">
      <span className="w-2 h-2 bg-secondary-foreground rounded-full breathing-indicator" style={{animationDelay: '0s'}}></span>
      <span className="w-2 h-2 bg-secondary-foreground rounded-full breathing-indicator" style={{animationDelay: '0.2s'}}></span>
      <span className="w-2 h-2 bg-secondary-foreground rounded-full breathing-indicator" style={{animationDelay: '0.4s'}}></span>
    </div>
  </div>
);

const ReflectiveWindow = ({ reflection, onClose }: { reflection: string, onClose: () => void }) => (
    <div className="w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500 my-4">
        <Card className="shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Reflective Window</CardTitle>
                <CardDescription>A moment to pause and reflect on our conversation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{reflection || "Thinking..."}</p>
                <div className="flex gap-2 mt-4">
                    <Button onClick={onClose}>Explore More</Button>
                    <Button variant="ghost" onClick={onClose}>Continue</Button>
                </div>
            </CardContent>
        </Card>
    </div>
);

    

    