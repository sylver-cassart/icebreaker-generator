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
      const response = await fetch("/api/generate-icebreakers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileText: profileText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Generation error:", err);
      
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          setError("Network error - please check your connection and try again");
        } else if (err.message.includes("API key")) {
          setError("API configuration error - please contact support");
        } else if (err.message.includes("quota") || err.message.includes("rate limit")) {
          setError("Service temporarily unavailable - please try again in a few minutes");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to generate icebreakers. Please try again.");
      }
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