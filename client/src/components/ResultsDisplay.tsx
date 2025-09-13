import IcebreakerCard from "./IcebreakerCard";

interface Icebreaker {
  line1: string;
  line2: string;
}

interface ResultsDisplayProps {
  icebreakers: Icebreaker[];
  notes?: string;
}

export default function ResultsDisplay({ icebreakers, notes }: ResultsDisplayProps) {
  if (icebreakers.length === 0) return null;

  return (
    <div className="space-y-6" data-testid="results-display">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Your Personalized Breakrs
        </h2>
        <p className="text-muted-foreground">
          Choose the one that fits your style and copy it to use in your outreach
        </p>
      </div>

      <div className="space-y-4">
        {icebreakers.map((icebreaker, index) => (
          <IcebreakerCard
            key={index}
            line1={icebreaker.line1}
            line2={icebreaker.line2}
            index={index}
          />
        ))}
      </div>

      {notes && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Strategy notes:</span> {notes}
          </p>
        </div>
      )}
    </div>
  );
}