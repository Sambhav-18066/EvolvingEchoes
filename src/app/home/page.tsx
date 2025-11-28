
'use client';

import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BookOpen, LineChart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
  const { user, isUserLoading } = useUser();
  const db = getFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;
  const userName = userProfile?.name?.split(' ')[0] || '';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={true} />
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden bg-card/80 backdrop-blur-md">
            <div className="absolute inset-0 glow opacity-50"></div>
            <CardContent className="relative z-10 flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={userProfile?.name} data-ai-hint={userAvatar.imageHint} />}
                <AvatarFallback>{userName ? userName.charAt(0) : ''}</AvatarFallback>
              </Avatar>
              {isLoading ? (
                <Skeleton className="h-9 w-48 mt-2" />
              ) : (
                <h1 className="text-3xl font-bold font-headline mt-2">Hello, {userName}.</h1>
              )}
              <p className="text-muted-foreground mt-2 text-lg">Ready to explore your story?</p>

              <div className="w-full flex flex-col gap-4 mt-8">
                <Link href="/modes" className="w-full">
                  <Button size="lg" className="w-full h-14 text-base rounded-xl shadow-lg shadow-primary/20">
                    <MessageSquare className="mr-3" />
                    Start Conversation
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard" className="w-full">
                    <Button variant="secondary" size="lg" className="w-full h-14 text-base rounded-xl">
                      <LineChart className="mr-2" />
                      Your Progress
                    </Button>
                  </Link>
                  <Link href="/home#journal" className="w-full">
                     <Button variant="secondary" size="lg" className="w-full h-14 text-base rounded-xl">
                       <BookOpen className="mr-2" />
                       Reflection Journal
                     </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
