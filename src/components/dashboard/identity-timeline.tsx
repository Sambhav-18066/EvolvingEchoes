import { Button } from "@/components/ui/button";
import { Ambition, Briefcase, Heart, Home, Shield, School } from "lucide-react";

const timelineItems = [
  { theme: "Childhood", icon: <Home className="h-5 w-5" />, color: "bg-blue-200 text-blue-800" },
  { theme: "School Life", icon: <School className="h-5 w-5" />, color: "bg-green-200 text-green-800" },
  { theme: "Ambitions", icon: <Briefcase className="h-5 w-5" />, color: "bg-purple-200 text-purple-800" },
  { theme: "Relationships", icon: <Heart className="h-5 w-5" />, color: "bg-pink-200 text-pink-800" },
  { theme: "Fears", icon: <Shield className="h-5 w-5" />, color: "bg-yellow-200 text-yellow-800" },
];

export function IdentityTimeline() {
  return (
    <div className="relative w-full py-4">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
      <div className="flex justify-between items-center">
        {timelineItems.map((item, index) => (
          <div key={item.theme} className="relative z-10">
            <Button variant="outline" className={`w-32 h-32 rounded-full flex flex-col gap-1 items-center justify-center border-4 hover:border-primary transition-colors duration-300 ${index % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-sm font-semibold mt-1">{item.theme}</span>
            </Button>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
