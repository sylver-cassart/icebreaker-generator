import ErrorDisplay from '../ErrorDisplay';

export default function ErrorDisplayExample() {
  const handleRetry = () => {
    console.log('Retry clicked');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <ErrorDisplay 
        message="Unable to generate icebreakers. Please check your profile content and try again."
        onRetry={handleRetry}
      />
      <ErrorDisplay 
        message="API key not configured. Please contact support."
      />
    </div>
  );
}