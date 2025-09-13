import { useState } from 'react';
import StyleSelector, { type IcebreakerStyle } from '../StyleSelector';

export default function StyleSelectorExample() {
  const [style, setStyle] = useState<IcebreakerStyle>("professional");

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <StyleSelector value={style} onChange={setStyle} />
      
      <StyleSelector value={style} onChange={setStyle} disabled />
      
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Selected style: <span className="font-medium text-foreground">{style}</span>
        </p>
      </div>
    </div>
  );
}