import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceMeter } from "@/components/dashboard/confidence-meter";
import { FluencyChart } from "@/components/dashboard/fluency-chart";
import { IdentityTimeline } from "@/components/dashboard/identity-timeline";
import { LexicalRichnessChart } from "@/components/dashboard/lexical-richness-chart";
import { BookOpen, Calendar, Repeat } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={true} />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Your Progress Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fluency Growth (Words Per Minute)</CardTitle>
                <CardDescription>Your WPM over the last 8 weeks.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FluencyChart />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Confidence Meter</CardTitle>
                  <CardDescription>Your self-rated confidence level.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConfidenceMeter />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Lexical Richness</CardTitle>
                  <CardDescription>Unique words used per session.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <LexicalRichnessChart />
                </CardContent>
              </Card>
            </div>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Identity Depth Timeline</CardTitle>
                <CardDescription>Key themes you've explored in your conversations.</CardDescription>
              </CardHeader>
              <CardContent>
                <IdentityTimeline />
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
                <p className="text-xs text-muted-foreground">+4 from last month</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Length</CardTitle>
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12m 45s</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
