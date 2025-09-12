import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function GenerateButton({
  onClick,
  loading = false,
  disabled = false,
}: GenerateButtonProps) {
  return (
    <Button
      data-testid="button-generate"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Icebreakers
        </>
      )}
    </Button>
  );
}