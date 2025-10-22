import { useState } from "react";
import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StarRatingProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  id: string;
}

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

export const StarRating = ({
  label,
  description,
  value,
  onChange,
  id,
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-1" role="radiogroup" aria-labelledby={id}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TooltipProvider key={star}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChange(star);
                    }
                  }}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label={`Rate ${star} out of 5 stars - ${ratingLabels[star as keyof typeof ratingLabels]}`}
                  role="radio"
                  aria-checked={value === star}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || value)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{ratingLabels[star as keyof typeof ratingLabels]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-muted-foreground">
          {ratingLabels[value as keyof typeof ratingLabels]}
        </p>
      )}
    </div>
  );
};
