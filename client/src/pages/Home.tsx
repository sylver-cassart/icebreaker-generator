import { useState } from "react";
import Header from "@/components/Header";
import ProfileInput from "@/components/ProfileInput";
import GenerateButton from "@/components/GenerateButton";
import ResultsDisplay from "@/components/ResultsDisplay";
import LoadingState from "@/components/LoadingState";
import ErrorDisplay from "@/components/ErrorDisplay";
import ThemeToggle from "@/components/ThemeToggle";

interface Icebreaker {
  line1: string;
  line2: string;
}

interface GenerationResult {
  icebreakers: Icebreaker[];
  notes: string;
}

export default function Home() {
  const [profileText, setProfileText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!profileText.trim()) {
      setError("Please enter some profile content first");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // TODO: Replace with actual API call to /api/generate-icebreakers
      // Simulating API call for prototype
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Remove mock functionality - replace with real API
      const mockResults: GenerationResult = {
        icebreakers: [
          {
            line1: "Your recent growth achievements show impressive strategic thinking.",
            line2: "I help teams automate their reporting workflows—could save you hours weekly on data analysis."
          },
          {
            line1: "Noticed your focus on retention and LTV optimization.",
            line2: "I build no-code automations that turn customer behavior into actionable growth insights."
          },
          {
            line1: "Your tech stack alignment with growth metrics caught my attention.",
            line2: "I specialize in connecting tools like yours into seamless reporting workflows for founders."
          }
        ],
        notes: "Focused on growth expertise and automation value proposition"
      };
      
      setResults(mockResults);
    } catch (err) {
      setError("Failed to generate icebreakers. Please try again.");
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        
        <div className="space-y-8">
          {/* Input Section */}
          <div className="max-w-2xl mx-auto">
            <ProfileInput
              value={profileText}
              onChange={setProfileText}
              disabled={loading}
            />
          </div>

          {/* Action Section */}
          <div className="flex justify-center">
            <GenerateButton
              onClick={handleGenerate}
              loading={loading}
              disabled={!profileText.trim() || loading}
            />
          </div>

          {/* Results Section */}
          <div className="max-w-2xl mx-auto">
            {loading && <LoadingState />}
            
            {error && !loading && (
              <ErrorDisplay message={error} onRetry={handleRetry} />
            )}
            
            {results && !loading && !error && (
              <ResultsDisplay {...results} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Built for professional outreach. Always review and personalize before sending.
          </p>
        </footer>
      </div>
    </div>
  );
}