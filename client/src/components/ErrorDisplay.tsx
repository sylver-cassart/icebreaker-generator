import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive/20" data-testid="error-display">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Generation Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                data-testid="button-retry"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}