import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageSquare, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ModesPage() {
  const agenticImage = PlaceHolderImages.find(p => p.id === 'mode-agentic');
  const nonAgenticImage = PlaceHolderImages.find(p => p.id === 'mode-non-agentic');
  const peerImage = PlaceHolderImages.find(p => p.id === 'mode-peer');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={true} />
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Conversation Mode</h1>
            <p className="text-muted-foreground mt-2 text-lg">Select an experience that best suits your goals for today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ModeCard
              title="Agentic AI Mode"
              description="An empathic, adaptive, and reflective AI partner that helps you explore your story in depth."
              icon={<div className="flex items-center justify-center"><Heart className="text-accent" /><Sparkles className="text-yellow-400" /></div>}
              image={agenticImage}
              href="/conversation?mode=agentic"
              className="border-primary/50 hover:border-primary"
              gradient="from-primary/10 to-secondary/10"
            />
            <ModeCard
              title="Non-Agentic AI"
              description="A straightforward, reactive AI for simple question-and-answer interactions. Focuses on direct practice."
              icon={<MessageSquare className="text-slate-500" />}
              image={nonAgenticImage}
              href="/conversation?mode=non-agentic"
              className="border-slate-300 hover:border-slate-500"
              gradient="from-slate-100 to-slate-200/10"
            />
            <ModeCard
              title="Peer Mode"
              description="Practice your conversation skills in a real-time text chat with another learner. (Coming Soon)"
              icon={<Users className="text-orange-500" />}
              image={peerImage}
              href="#"
              className="border-orange-300 hover:border-orange-500 opacity-60"
              gradient="from-orange-100 to-amber-200/10"
              disabled
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: { imageUrl: string, imageHint: string };
  href: string;
  className?: string;
  gradient?: string;
  disabled?: boolean;
}

function ModeCard({ title, description, icon, image, href, className, gradient, disabled = false }: ModeCardProps) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl flex flex-col group ${className}`}>
      <CardHeader className="p-0 relative h-40">
        {image && <Image src={image.imageUrl} alt={title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" data-ai-hint={image.imageHint} />}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} `}></div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="w-14 h-14 rounded-full bg-background border shadow-sm flex items-center justify-center -mt-12 mb-4 z-10">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="mt-2 flex-grow">{description}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={href}>Select Mode</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
