import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@supabase/supabase-js";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    review_text: string;
    created_at: string;
    verified_visit: boolean;
    user_id?: string;
    profiles?: {
      full_name: string | null;
    } | null;
  };
  helpfulCount: number;
  userHasVoted: boolean;
  user: User | null;
  onVoteUpdate: () => void;
}

export const ReviewCard = ({ 
  review, 
  helpfulCount, 
  userHasVoted,
  user,
  onVoteUpdate 
}: ReviewCardProps) => {
  const { toast } = useToast();
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwnReview = user?.id === review.user_id;

  const handleHelpfulVote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on reviews.",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      if (userHasVoted) {
        const { error } = await supabase
          .from("review_helpfulness")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_helpfulness")
          .insert([{
            review_id: review.id,
            user_id: user.id,
            is_helpful: true,
          }]);

        if (error) throw error;
      }
      
      onVoteUpdate();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !isOwnReview) return;

    if (!confirm("Are you sure you want to delete this review?")) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });

      onVoteUpdate();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {review.verified_visit && (
                <span className="text-xs text-primary font-medium">
                  Verified Visit
                </span>
              )}
            </div>
            <h4 className="font-semibold">{review.title}</h4>
            <p className="text-sm text-muted-foreground">
              {review.profiles?.full_name || "Anonymous"} • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{review.review_text}</p>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant={userHasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleHelpfulVote}
            disabled={voting}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful {helpfulCount > 0 && `(${helpfulCount})`}
          </Button>
          
          {isOwnReview && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
