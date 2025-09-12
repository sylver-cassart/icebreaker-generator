import ResultsDisplay from '../ResultsDisplay';

export default function ResultsDisplayExample() {
  const mockResults = {
    icebreakers: [
      {
        line1: "Your cohort analysis post for D2C stores was sharp—ties neatly to CartPilot's AOV lift focus.",
        line2: "I build light AI automations for growth teams; happy to share a plug-and-play cohort report flow."
      },
      {
        line1: "0→$2.3m ARR in 18 months at CartPilot is serious execution.",
        line2: "I help teams templatise retention reporting with n8n/Zapier—usually frees 4–6 hours a week."
      },
      {
        line1: "Noticed you run Klaviyo and Customer.io alongside Mixpanel.",
        line2: "I can wire a no-code loop that turns post-purchase data into weekly LTV snapshots for the team."
      }
    ],
    notes: "Angles: recent post, ARR milestone, stack alignment."
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ResultsDisplay {...mockResults} />
    </div>
  );
}