import IcebreakerCard from '../IcebreakerCard';

export default function IcebreakerCardExample() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <IcebreakerCard 
        line1="Your cohort analysis post for D2C stores was sharp—ties neatly to CartPilot's AOV lift focus."
        line2="I build light AI automations for growth teams; happy to share a plug-and-play cohort report flow."
        index={0}
      />
      <IcebreakerCard 
        line1="0→$2.3m ARR in 18 months at CartPilot is serious execution."
        line2="I help teams templatise retention reporting with n8n/Zapier—usually frees 4–6 hours a week."
        index={1}
      />
      <IcebreakerCard 
        line1="Noticed you run Klaviyo and Customer.io alongside Mixpanel."
        line2="I can wire a no-code loop that turns post-purchase data into weekly LTV snapshots for the team."
        index={2}
      />
    </div>
  );
}