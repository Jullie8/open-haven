import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Phone, Mail, Globe, Calendar, Heart, 
  ArrowLeft, Loader2, CheckCircle2, StickyNote 
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface LocationData {
  id: string;
  name: string | null;
  address: string;
  city: string;
  county: string;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  schedule: string | null;
  accessibility_features: string[] | null;
  organizations: {
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    services: string[] | null;
  };
}

interface FavoriteData {
  id: string;
  notes: string | null;
  visited: boolean;
  visit_date: string | null;
}

const LocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [favorite, setFavorite] = useState<FavoriteData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [visited, setVisited] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchLocation();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchFavorite();
    }
  }, [user, id]);

  const fetchLocation = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select(`
          id,
          name,
          address,
          city,
          county,
          state,
          zip_code,
          latitude,
          longitude,
          schedule,
          accessibility_features,
          organizations (
            name,
            description,
            phone,
            email,
            website,
            services
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setLocation(data);
    } catch (error) {
      console.error("Error fetching location:", error);
      toast({
        title: "Error",
        description: "Failed to load location details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, notes, visited, visit_date")
        .eq("user_id", user.id)
        .eq("location_id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFavorite(data);
        setNotes(data.notes || "");
        setVisited(data.visited);
      }
    } catch (error) {
      console.error("Error fetching favorite:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      if (favorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", favorite.id);

        if (error) throw error;

        setFavorite(null);
        setNotes("");
        setVisited(false);
        toast({
          title: "Removed from favorites",
        });
      } else {
        const { data, error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, location_id: id }])
          .select()
          .single();

        if (error) throw error;

        setFavorite(data);
        toast({
          title: "Added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!user || !favorite) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("favorites")
        .update({ 
          notes,
          visited,
          visit_date: visited ? new Date().toISOString().split('T')[0] : null
        })
        .eq("id", favorite.id);

      if (error) throw error;

      toast({
        title: "Notes saved",
        description: "Your notes have been updated.",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Location not found.</p>
          <Button onClick={() => navigate("/programs")} className="mt-4">
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  const fullAddress = `${location.address}, ${location.city}, ${location.state || 'NY'} ${location.zip_code || ''}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/programs")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{location.organizations.name}</CardTitle>
                    {location.name && (
                      <p className="text-lg text-muted-foreground">{location.name}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleToggleFavorite}
                    variant={favorite ? "default" : "outline"}
                    size="icon"
                  >
                    <Heart className={favorite ? "fill-current" : ""} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {location.organizations.description && (
                  <p className="text-muted-foreground">{location.organizations.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{fullAddress}</p>
                      <p className="text-sm text-muted-foreground mt-1">{location.county} County</p>
                    </div>
                  </div>

                  {location.organizations.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a 
                          href={`tel:${location.organizations.phone}`}
                          className="text-primary hover:underline"
                        >
                          {location.organizations.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {location.organizations.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a 
                          href={`mailto:${location.organizations.email}`}
                          className="text-primary hover:underline"
                        >
                          {location.organizations.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {location.organizations.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a 
                          href={location.organizations.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {location.organizations.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {location.schedule && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Schedule</p>
                        <p className="text-muted-foreground">{location.schedule}</p>
                      </div>
                    </div>
                  )}
                </div>

                {location.organizations.services && location.organizations.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {location.organizations.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {location.accessibility_features && location.accessibility_features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Accessibility Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {location.accessibility_features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {user && favorite && (
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Your Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes about this location</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add your thoughts, questions, or observations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visited"
                      checked={visited}
                      onCheckedChange={(checked) => setVisited(checked as boolean)}
                    />
                    <Label 
                      htmlFor="visited"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I've visited this location
                    </Label>
                  </div>

                  <Button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="w-full"
                  >
                    {savingNotes ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
