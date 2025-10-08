import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface ProgramCardProps {
  id: string;
  organizationName: string;
  locationName?: string;
  address: string;
  city: string;
  county: string;
  schedule?: string;
  services?: string[];
  accessibilityFeatures?: string[];
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
}

export const ProgramCard = ({
  id,
  organizationName,
  locationName,
  address,
  city,
  county,
  schedule,
  services = [],
  accessibilityFeatures = [],
  isFavorited = false,
  onFavoriteToggle,
}: ProgramCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsTogglingFavorite(true);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("location_id", id);

        if (error) throw error;

        toast({
          title: "Removed from favorites",
          description: "This location has been removed from your favorites.",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, location_id: id }]);

        if (error) throw error;

        toast({
          title: "Added to favorites",
          description: "This location has been added to your favorites.",
        });
      }

      onFavoriteToggle?.();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:scale-[1.01]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-1">
              {organizationName}
            </CardTitle>
            {locationName && (
              <CardDescription className="text-sm font-medium text-muted-foreground">
                {locationName}
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            disabled={isTogglingFavorite}
            className="shrink-0"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorited ? "fill-accent text-accent" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span>
              {address}, {city} - {county} County
            </span>
          </div>
          {schedule && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{schedule}</span>
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Services</p>
            <div className="flex flex-wrap gap-1.5">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {accessibilityFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accessibility</p>
            <div className="flex flex-wrap gap-1.5">
              {accessibilityFeatures.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {accessibilityFeatures.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{accessibilityFeatures.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate(`/location/${id}`)}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
