import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillTagProps {
  skill: string;
  variant?: "offered" | "wanted";
  removable?: boolean;
  onRemove?: () => void;
}

export default function SkillTag({ skill, variant = "offered", removable = false, onRemove }: SkillTagProps) {
  const baseClasses = "text-xs rounded-full";
  const variantClasses = variant === "offered" 
    ? "bg-skill-secondary bg-opacity-10 text-white border-skill-secondary"
    : "bg-skill-accent bg-opacity-10 text-white border-skill-accent";

  return (
    <Badge 
      variant="outline" 
      className={`${baseClasses} ${variantClasses} ${removable ? "flex items-center gap-1" : ""}`}
    >
      {skill}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-opacity-20 rounded-full p-0.5"
        >
          <X className="h-2 w-2" />
        </button>
      )}
    </Badge>
  );
}
