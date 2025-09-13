import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type IcebreakerStyle = "professional" | "casual" | "creative";

interface StyleSelectorProps {
  value: IcebreakerStyle;
  onChange: (value: IcebreakerStyle) => void;
  disabled?: boolean;
}

const styleOptions = [
  {
    value: "professional" as const,
    label: "Professional",
    description: "Formal, business-focused tone perfect for corporate outreach"
  },
  {
    value: "casual" as const,
    label: "Casual",
    description: "Friendly and approachable tone for warm connections"
  },
  {
    value: "creative" as const,
    label: "Creative",
    description: "Unique and engaging tone that stands out from the crowd"
  }
];

export default function StyleSelector({
  value,
  onChange,
  disabled = false,
}: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Breakr Style
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose the tone and approach for your breakrs
        </p>
      </div>
      
      <RadioGroup
        value={value}
        onValueChange={(value) => onChange(value as IcebreakerStyle)}
        disabled={disabled}
        className="space-y-3"
        data-testid="style-selector"
      >
        {styleOptions.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="mt-1"
              data-testid={`style-option-${option.value}`}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={option.value}
                className="text-sm font-medium cursor-pointer"
              >
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}