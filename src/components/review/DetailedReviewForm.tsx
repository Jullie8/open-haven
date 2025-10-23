import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, Star } from "lucide-react";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";
import { useToast } from "@/hooks/use-toast";

interface DetailedReviewFormProps {
  locationId: string;
  organizationId: string;
  userId: string;
  onReviewSubmitted: () => void;
}

const reviewTypes = [
  { id: "general", label: "General Feedback / Experience" },
  { id: "safety", label: "Safety Concern", warning: true },
  { id: "staff", label: "Staff / Communication" },
  { id: "program", label: "Program Quality" },
  { id: "facilities", label: "Environment / Facilities" },
  { id: "other", label: "Other" },
];

const actionsTaken = [
  "Reported to oversight agency",
  "Discussed with program staff",
  "Consulted a healthcare professional",
  "Other",
];

const contextTags = [
  "Safety",
  "Staff Behavior",
  "Facilities",
  "Communication",
  "Activities",
];

const qualityMetrics = [
  {
    id: "dignity",
    label: "Dignity & Respect",
    description: "Person is treated with dignity and respect",
  },
  {
    id: "activities",
    label: "Activities & Engagement",
    description: "Activities are meaningful and engaging",
  },
  {
    id: "safety",
    label: "Safety & Well-being",
    description: "Environment feels safe and supportive",
  },
];

export const DetailedReviewForm = ({
  locationId,
  organizationId,
  userId,
  onReviewSubmitted,
}: DetailedReviewFormProps) => {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({
    dignity: 3,
    activities: 3,
    safety: 3,
  });
  const [reviewText, setReviewText] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [submitting, setSubmitting] = useState(false);

  const maxChars = 2000;

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      toast({
        title: "Overall rating required",
        description: "Please provide an overall rating.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType) {
      toast({
        title: "Focus area required",
        description: "Please select a focus area for your review.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your experience.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // TODO: Add AI redaction or moderation before submission
    // TODO: Send to backend moderation queue
    // TODO: Integrate with Supabase

    try {
      // Placeholder for backend submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Review submitted",
        description:
          "Your review has been submitted for moderation. Thank you for your feedback!",
      });

      // Reset form
      setOverallRating(0);
      setSelectedType("");
      setQualityScores({ dignity: 3, activities: 3, safety: 3 });
      setReviewText("");
      setSelectedActions([]);
      setSelectedContextTags([]);
      setVisibility("public");

      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Write a Detailed Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Accordion type="multiple" defaultValue={["step1", "step2", "step3"]} className="w-full">
            {/* Step 1: Overall Rating */}
            <AccordionItem value="step1">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Overall Rating
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-2">
                  <Label>Rate your overall experience</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="transition-colors hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= overallRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {overallRating > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {overallRating === 1 && "Poor"}
                      {overallRating === 2 && "Fair"}
                      {overallRating === 3 && "Average"}
                      {overallRating === 4 && "Good"}
                      {overallRating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Privacy & Visibility */}
            <AccordionItem value="step2">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Privacy & Visibility
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <RadioGroup value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="cursor-pointer">
                      Public (visible after moderation)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="cursor-pointer">
                      Confidential Report (for moderators only)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Sensitive reports will always be reviewed manually before publishing.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Identify Focus Area */}
            <AccordionItem value="step3">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Step 1: Select Review Type
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                  {reviewTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label
                        htmlFor={type.id}
                        className={`cursor-pointer ${
                          type.warning ? "text-destructive flex items-center gap-1" : ""
                        }`}
                      >
                        {type.warning && <AlertTriangle className="h-4 w-4" />}
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4: Structured Quality Assessment */}
            <AccordionItem value="step4">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Structured Quality Assessment
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {qualityMetrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">{metric.label}</Label>
                      <span className="text-sm font-semibold text-primary">
                        {qualityScores[metric.id]}/5
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                    <Slider
                      value={[qualityScores[metric.id]]}
                      onValueChange={(value) =>
                        setQualityScores((prev) => ({ ...prev, [metric.id]: value[0] }))
                      }
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 - Poor</span>
                      <span>5 - Excellent</span>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Step 5: Narrative Description */}
            <AccordionItem value="step5">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Step 3: Describe Your Experience
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <Textarea
                  placeholder="Describe your experience in detail..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={8}
                  maxLength={maxChars}
                  className="resize-none"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-start gap-2 text-xs text-destructive font-medium">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>DO NOT include names, medical details, or addresses</span>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {reviewText.length}/{maxChars} characters
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 6: Actions Taken */}
            <AccordionItem value="step6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Step 4: Actions Taken
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <Label>Have you taken any of these actions?</Label>
                {actionsTaken.map((action) => (
                  <div key={action} className="flex items-start space-x-2">
                    <Checkbox
                      id={`action-${action}`}
                      checked={selectedActions.includes(action)}
                      onCheckedChange={() =>
                        setSelectedActions((prev) =>
                          prev.includes(action)
                            ? prev.filter((a) => a !== action)
                            : [...prev, action]
                        )
                      }
                    />
                    <Label htmlFor={`action-${action}`} className="cursor-pointer">
                      {action}
                    </Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Step 7: Optional Context Tags */}
            <AccordionItem value="step7">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Step 5: Optional Context Tags
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <TagSelector
                  label="Select relevant tags (optional)"
                  tags={contextTags}
                  selectedTags={selectedContextTags}
                  onChange={setSelectedContextTags}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOverallRating(0);
                setSelectedType("");
                setQualityScores({ dignity: 3, activities: 3, safety: 3 });
                setReviewText("");
                setSelectedActions([]);
                setSelectedContextTags([]);
                setVisibility("public");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
