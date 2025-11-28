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
import { BrainCircuit, Mic, Send, Sparkles, Users, MicOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateConversationalResponse } from "@/ai/flows/generate-conversational-response";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar-1');
const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

const modeDetails: Record<string, { name: string; icon: React.ReactNode }> = {
  [InteractionMode.AGENTIC]: { name: 'Agentic AI Mode', icon: <Sparkles className="w-4 h-4" /> },
  [InteractionMode.NON_AGENTIC]: { name: 'Non-Agentic AI Mode', icon: <BrainCircuit className="w-4 h-4" /> },
  [InteractionMode.PEER]: { name: 'Peer Mode', icon: <Users className="w-4 h-4" /> }
};

// @ts-ignore
const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function ConversationPage() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as InteractionMode) || InteractionMode.AGENTIC;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReflectiveWindow, setShowReflectiveWindow] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const transcriptRef = useRef('');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      speaker: 'user',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    transcriptRef.current = '';
    setIsTyping(true);

    const userMessagesCount = newMessages.filter(m => m.speaker === 'user').length;
    
    try {
      const aiResult = await generateConversationalResponse({ userInput: text, mode });
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResult.response,
        speaker: 'ai',
        timestamp: Date.now(),
        mood: aiResult.mood,
      };
      setMessages(prev => [...prev, aiResponse]);

      if (userMessagesCount > 0 && userMessagesCount % 5 === 0) {
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
  }, [isRecording, messages, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  }

  useEffect(() => {
    setMessages([{
      id: '1',
      text: `Hello! I see you've chosen ${modeDetails[mode].name}. I'm ready to listen. What's on your mind today?`,
      speaker: 'ai',
      timestamp: Date.now(),
      mood: 'calm',
    }]);
  }, [mode]);

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
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // The 'end' event can be triggered by stop() or by the API itself.
      // We only want to auto-send if the API stops it after a pause,
      // not when we programmatically call stop().
      if (transcriptRef.current.trim()) {
        handleSendMessage(transcriptRef.current.trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are not critical errors, so we can ignore them.
        return;
      }
      console.error("Speech recognition error", event.error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `An error occurred: ${event.error}. Please ensure you've granted microphone permissions.`,
      });
    };

    recognition.onresult = (event: any) => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      let final_transcript = '';
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      transcriptRef.current = final_transcript;
      setInput(transcriptRef.current + interim_transcript);

      // Set a timeout to stop recognition if the user stops talking.
      speechTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
            recognition.stop();
        }
      }, 2000); // 2 seconds of silence
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      recognitionRef.current.stop();
    } else {
      try {
        transcriptRef.current = '';
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
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                {showReflectiveWindow && (
                    <div className="flex justify-center">
                        <ReflectiveWindow onClose={() => setShowReflectiveWindow(false)} />
                    </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-card">
             <div className="max-w-4xl mx-auto w-full">
              <form onSubmit={handleSubmit} ref={formRef} className="flex items-end gap-2">
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

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.speaker === 'user';
  return (
    <div className={cn("flex items-end gap-3 w-full", isUser ? "ml-auto flex-row-reverse justify-end" : "mr-auto justify-start")}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={isUser ? userAvatar?.imageUrl : aiAvatar?.imageUrl} />
        <AvatarFallback>{isUser ? 'S' : 'AI'}</AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "p-3 rounded-2xl shadow-md max-w-lg",
          isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm"
        )}>
          <p className="text-base">{message.text}</p>
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

const ReflectiveWindow = ({ onClose }: { onClose: () => void }) => (
    <div className="w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500 my-4">
        <Card className="shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Reflective Window</CardTitle>
                <CardDescription>A moment to pause and reflect on our conversation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>You spoke about your childhood today. This seems like an important memory. Would you like to explore this more?</p>
                <div className="flex gap-2 mt-4">
                    <Button onClick={onClose}>Explore More</Button>
                    <Button variant="ghost" onClick={onClose}>Continue</Button>
                </div>
            </CardContent>
        </Card>
    </div>
);
