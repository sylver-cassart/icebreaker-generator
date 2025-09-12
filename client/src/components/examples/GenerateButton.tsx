import { useState } from 'react';
import GenerateButton from '../GenerateButton';

export default function GenerateButtonExample() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    console.log('Generate clicked');
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <GenerateButton onClick={handleClick} />
      <GenerateButton onClick={handleClick} loading={loading} />
      <GenerateButton onClick={handleClick} disabled />
    </div>
  );
}