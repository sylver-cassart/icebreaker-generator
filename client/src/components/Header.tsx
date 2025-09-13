import { MessageSquare } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center py-8 px-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        <MessageSquare className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">
          Icebreaker Generator
        </h1>
      </div>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Generate personalized, professional 2-line icebreakers for outreach. 
        Paste profile content below and get 3 tailored conversation starters.
      </p>
    </header>
  );
}