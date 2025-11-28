import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Waves, Zap, BarChart, PenSquare } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
          <div className="relative inline-block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl glow"></div>
            <h1 className="relative text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 leading-tight">
              Discover Your Story
            </h1>
          </div>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Evolving Echoes helps you explore your personal identity through guided conversations with a supportive AI partner.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20">
                Get Started
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <PenSquare className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Guided Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Engage in conversations about your identity, goals, and experiences, prompted by our agentic AI.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Waves className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Agentic AI Partner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our AI adapts to you, offering empathic responses and helping you build your narrative.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <BarChart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Track Your Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Visualize your progress in fluency, confidence, and self-expression on your personal dashboard.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Evolving Echoes. All rights reserved.</p>
      </footer>
    </div>
  );
}
