import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="space-y-6" data-testid="loading-state">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Analyzing Profile & Generating Icebreakers
        </h2>
        <p className="text-muted-foreground">
          AI is crafting personalized conversation starters...
        </p>
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-muted rounded h-4 w-16"></div>
                  <div className="bg-muted rounded h-8 w-8"></div>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted rounded h-4 w-full"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        <span>This usually takes 10-15 seconds</span>
      </div>
    </div>
  );
}