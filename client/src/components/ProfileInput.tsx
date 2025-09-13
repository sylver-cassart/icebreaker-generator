import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type IcebreakerStyle } from "@/components/StyleSelector";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedStyle: IcebreakerStyle;
  onStyleChange: (style: IcebreakerStyle) => void;
}

export default function ProfileInput({
  value,
  onChange,
  placeholder = "Paste LinkedIn profile content here...",
  disabled = false,
  selectedStyle,
  onStyleChange,
}: ProfileInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-input" className="text-base font-medium">
          LinkedIn Profile Content
        </Label>
        <p className="text-sm text-muted-foreground">
          Copy and paste the person's headline, about section, experience, or recent posts. The more specific details, the better the icebreakers.
        </p>
      </div>
      
      <div className="relative">
        <Textarea
          id="profile-input"
          data-testid="input-profile"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[200px] text-base resize-none pr-32"
          rows={8}
        />
        
        <div className="absolute bottom-3 right-3">
          <Select
            value={selectedStyle}
            onValueChange={(value) => onStyleChange(value as IcebreakerStyle)}
            disabled={disabled}
          >
            <SelectTrigger className="w-28 h-8 text-xs" data-testid="style-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional" data-testid="style-option-professional">
                Professional
              </SelectItem>
              <SelectItem value="casual" data-testid="style-option-casual">
                Casual
              </SelectItem>
              <SelectItem value="creative" data-testid="style-option-creative">
                Creative
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tip: Include recent achievements, tech stack, or specific content themes</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}