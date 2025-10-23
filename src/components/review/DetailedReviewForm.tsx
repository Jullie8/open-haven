import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
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
  { id: "reported", label: "Reported to oversight agency" },
  { id: "discussed", label: "Discussed with program staff" },
  { id: "consulted", label: "Consulted a healthcare professional" },
  { id: "other", label: "Other" },
];

const contextTags = [
  "Safety",
  "Staff Behavior",
  "Facilities",
  "Communication",
  "Activities",
];


export const DetailedReviewForm = ({
  locationId,
  organizationId,
  userId,
  onReviewSubmitted,
}: DetailedReviewFormProps) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [submitting, setSubmitting] = useState(false);

  const maxChars = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast({
        title: "Review type required",
        description: "Please select a review type.",
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
      setSelectedType("");
      setReviewText("");
      setSelectedAction("");
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
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Review Type */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Review Type</h3>
              <p className="text-sm text-muted-foreground">Step 1 of 5</p>
            </div>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              {reviewTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label
                    htmlFor={type.id}
                    className={`cursor-pointer text-base ${
                      type.warning ? "text-destructive flex items-center gap-2" : ""
                    }`}
                  >
                    {type.warning && <AlertTriangle className="h-4 w-4" />}
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Step 2: Describe Your Experience */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Describe Your Experience</h3>
              <p className="text-sm text-muted-foreground">Step 2 of 5</p>
            </div>
            <Textarea
              placeholder="Describe your experience in detail..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              maxLength={maxChars}
              className="resize-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Avoid using personal names or sharing sensitive health info.
              </p>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {reviewText.length}/{maxChars} characters
              </p>
            </div>
          </div>

          <Separator />

          {/* Step 3: Actions Taken */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Actions Taken</h3>
              <p className="text-sm text-muted-foreground">Step 3 of 5</p>
            </div>
            <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
              {actionsTaken.map((action) => (
                <div key={action.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={action.id} id={action.id} />
                  <Label htmlFor={action.id} className="cursor-pointer text-base">
                    {action.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Step 4: Optional Context Tags */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Optional Context Tags</h3>
              <p className="text-sm text-muted-foreground">Step 4 of 5</p>
            </div>
            <TagSelector
              label=""
              tags={contextTags}
              selectedTags={selectedContextTags}
              onChange={setSelectedContextTags}
            />
          </div>

          <Separator />

          {/* Step 5: Review Visibility */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Review Visibility</h3>
              <p className="text-sm text-muted-foreground">Step 5 of 5</p>
            </div>
            <RadioGroup value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer text-base">
                  Public (visible after moderation)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer text-base">
                  Private (for moderators only)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Sensitive reports will always be reviewed manually before publishing.
            </p>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedType("");
                setReviewText("");
                setSelectedAction("");
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
