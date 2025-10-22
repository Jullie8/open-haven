import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle } from "lucide-react";
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
  { id: "safety", label: "Safety Concern ⚠️", warning: true },
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

const ratingCategories = [
  {
    id: "staff",
    label: "Staff",
    description: "Were staff professional, caring, and respectful?",
  },
  {
    id: "communication",
    label: "Communication",
    description: "How well did staff communicate with families or guardians?",
  },
  {
    id: "facilities",
    label: "Facilities & Environment",
    description:
      "Was the space clean, safe, and comfortable (lighting, noise, accessibility)?",
  },
  {
    id: "activities",
    label: "Activities & Program Quality",
    description: "Were activities meaningful, structured, and appropriate?",
  },
  {
    id: "safety",
    label: "Safety & Dignity",
    description: "Did the person feel safe and treated with respect?",
  },
  {
    id: "overall",
    label: "Overall Rating",
    description: "Overall experience with the program.",
  },
];

export const DetailedReviewForm = ({
  locationId,
  organizationId,
  userId,
  onReviewSubmitted,
}: DetailedReviewFormProps) => {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [submitting, setSubmitting] = useState(false);

  const showRatings = selectedTypes.includes("general");
  const maxChars = 2000;

  const toggleReviewType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTypes.length === 0) {
      toast({
        title: "Review type required",
        description: "Please select at least one review type.",
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
      setSelectedTypes([]);
      setRatings({});
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Review Type */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Step 1: Select Review Type</h3>
              <ChevronDown className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-4">
              {reviewTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleReviewType(type.id)}
                  />
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Step 2: Structured Ratings */}
          {showRatings && (
            <>
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold">
                    Step 2: Structured Ratings
                  </h3>
                  <ChevronDown className="h-5 w-5 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-4">
                  {ratingCategories.map((category) => (
                    <StarRating
                      key={category.id}
                      id={category.id}
                      label={category.label}
                      description={category.description}
                      value={ratings[category.id] || 0}
                      onChange={(value) =>
                        setRatings((prev) => ({ ...prev, [category.id]: value }))
                      }
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Step 3: Describe the Concern */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">
                Step 3: Describe Your Experience
              </h3>
              <ChevronDown className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-4">
              <Textarea
                placeholder="Describe your experience in detail..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={8}
                maxLength={maxChars}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs">
                <p className="text-muted-foreground">
                  Avoid using personal names or sharing sensitive health info.
                </p>
                <p className="text-muted-foreground">
                  {reviewText.length}/{maxChars} characters
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Step 4: Actions Taken */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Step 4: Actions Taken</h3>
              <ChevronDown className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-4">
              <Label>Have you taken any of these actions?</Label>
              {actionsTaken.map((action) => (
                <div key={action} className="flex items-start space-x-2">
                  <Checkbox
                    id={`action-${action}`}
                    checked={selectedActions.includes(action)}
                    onCheckedChange={() => toggleAction(action)}
                  />
                  <Label htmlFor={`action-${action}`} className="cursor-pointer">
                    {action}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Step 5: Context Tags */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">
                Step 5: Optional Context Tags
              </h3>
              <ChevronDown className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <TagSelector
                label="Select relevant tags (optional)"
                tags={contextTags}
                selectedTags={selectedContextTags}
                onChange={setSelectedContextTags}
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Step 6: Visibility */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Step 6: Review Visibility</h3>
              <ChevronDown className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-4">
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
                    Private (for moderators only)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Sensitive reports will always be reviewed manually before publishing.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Step 7: Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedTypes([]);
                setRatings({});
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
