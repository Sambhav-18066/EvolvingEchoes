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
import { BrainCircuit, Mic, Send, Sparkles, Users, User, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateConversationalResponse } from "@/ai/flows/generate-conversational-response";

const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar-1');
const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

const modeDetails: Record<string, { name: string; icon: React.ReactNode }> = {
  [InteractionMode.AGENTIC]: { name: 'Agentic AI Mode', icon: <Sparkles className="w-4 h-4" /> },
  [InteractionMode.NON_AGENTIC]: { name: 'Non-Agentic AI Mode', icon: <BrainCircuit className="w-4 h-4" /> },
  [InteractionMode.PEER]: { name: 'Peer Mode', icon: <Users className="w-4 h-4" /> }
};

export default function ConversationPage() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as InteractionMode) || InteractionMode.AGENTIC;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReflectiveWindow, setShowReflectiveWindow] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      speaker: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    if (messages.length > 0 && messages.length % 5 === 0) {
      setShowReflectiveWindow(true);
    }
    
    try {
      const aiResult = await generateConversationalResponse({ userInput: currentInput, mode });
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResult.response,
        speaker: 'ai',
        timestamp: Date.now(),
        mood: aiResult.mood,
      };
      setMessages(prev => [...prev, aiResponse]);
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
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header isLoggedIn={true} />
      <div className="flex-1 flex pt-20 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 gap-4">
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
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   AI is feeling {messages[messages.length-1]?.mood || 'calm'}
                 </p>
               </div>
             </div>
             <Button variant="ghost" asChild>
                <Link href="/modes">Change Mode</Link>
             </Button>
          </div>
          <Card className="flex-1 flex flex-col relative">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            </ScrollArea>
             {showReflectiveWindow && <ReflectiveWindow onClose={() => setShowReflectiveWindow(false)} />}
            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Mic className="w-5 h-5" />
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
          </Card>
        </main>
      </div>
    </div>
  );
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.speaker === 'user';
  return (
    <div className={cn("flex items-end gap-3 w-full max-w-xl", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={isUser ? userAvatar?.imageUrl : aiAvatar?.imageUrl} />
        <AvatarFallback>{isUser ? 'S' : 'AI'}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className={cn(
          "p-3 rounded-2xl shadow-md",
          isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-bl-sm"
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
    <div className="absolute inset-x-4 bottom-24 z-10 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
        <Card className="shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
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
