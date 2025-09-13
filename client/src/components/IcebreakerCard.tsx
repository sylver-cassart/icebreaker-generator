import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IcebreakerCardProps {
  line1: string;
  line2: string;
  index: number;
}

export default function IcebreakerCard({ line1, line2, index }: IcebreakerCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const text = `${line1}\n${line2}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Breakr ready to paste into your message",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-icebreaker-${index}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Option {index + 1}
              </div>
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-foreground">
                  {line1}
                </p>
                <p className="text-base leading-relaxed text-foreground">
                  {line2}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              data-testid={`button-copy-${index}`}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}