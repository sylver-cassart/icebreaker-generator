import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ProfileInput({
  value,
  onChange,
  placeholder = "Paste LinkedIn profile content here...",
  disabled = false,
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
      
      <Textarea
        id="profile-input"
        data-testid="input-profile"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[200px] text-base resize-none"
        rows={8}
      />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tip: Include recent achievements, tech stack, or specific content themes</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}