import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface TagSelectorProps {
  label: string;
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagSelector = ({
  label,
  tags,
  selectedTags,
  onChange,
}: TagSelectorProps) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => toggleTag(tag)}
            role="checkbox"
            aria-checked={selectedTags.includes(tag)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTag(tag);
              }
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
