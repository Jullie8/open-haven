import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  locationId: string;
  organizationId: string;
  userId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    review_text: string;
  } | null;
}

export const ReviewForm = ({ 
  locationId, 
  organizationId, 
  userId,
  onReviewSubmitted,
  existingReview
}: ReviewFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  type ProgramRatings = {
    dignity: number;
    activities: number;
    safety: number;
  };

  const [programRatings, setProgramRatings] = useState<ProgramRatings>({
    dignity: 0,
    activities: 0,
    safety: 0,
  });
  const [title, setTitle] = useState(existingReview?.title || "");
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !reviewText.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            title: title.trim(),
                review_text: reviewText.trim(),
                program_ratings: programRatings,
          })
          .eq("id", existingReview.id);

        if (error) throw error;

        toast({
          title: "Review updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("reviews")
          .insert([{
            user_id: userId,
            location_id: locationId,
            organization_id: organizationId,
            rating,
            title: title.trim(),
            review_text: reviewText.trim(),
            program_ratings: programRatings,
            verified_visit: true,
          }]);

        if (error) throw error;

        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });

        setRating(0);
        setTitle("");
        setReviewText("");
      }

      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold">Your Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`${star} star`}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Review Title *</Label>
            <Input
              id="title"
              placeholder="Sum up your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review" className="font-semibold">Your Review *</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this program..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>{reviewText.length}/2000 characters</div>
              <div>{2000 - reviewText.length} characters remaining</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="mb-3 font-semibold text-base">Program Ratings (optional)</div>
            <div className="space-y-4">
              {[
                { key: 'dignity', label: 'Dignity & Respect' },
                { key: 'activities', label: 'Activities & Engagement' },
                { key: 'safety', label: 'Safety & Well-being' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setProgramRatings((prev) => ({ ...prev, [key]: s }))}
                        onMouseEnter={() => {}}
                        onMouseLeave={() => {}}
                        aria-label={`${label} ${s} star`}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            s <= programRatings[key as keyof ProgramRatings]
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white hover:brightness-95 py-4 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              existingReview ? "Update Review" : "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
