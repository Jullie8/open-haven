import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProgramCard } from "@/components/ProgramCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface FavoriteLocation {
  id: string;
  location_id: string;
  visited: boolean;
  notes: string | null;
  locations: {
    id: string;
    name: string | null;
    address: string;
    city: string;
    county: string;
    schedule: string | null;
    accessibility_features: string[] | null;
    organizations: {
      name: string;
      services: string[] | null;
    };
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          location_id,
          visited,
          notes,
          locations (
            id,
            name,
            address,
            city,
            county,
            schedule,
            accessibility_features,
            organizations (
              name,
              services
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load your favorites.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const visitedFavorites = favorites.filter(fav => fav.visited);
  const unvisitedFavorites = favorites.filter(fav => !fav.visited);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your favorite programs and manage your visits
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl shadow-[var(--shadow-card)]">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No favorites yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start exploring programs and save your favorites to track them here
            </p>
            <Button onClick={() => navigate("/programs")}>
              Browse Programs
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Heart className="h-4 w-4" />
                All Favorites ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="visited" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Visited ({visitedFavorites.length})
              </TabsTrigger>
              <TabsTrigger value="unvisited" className="gap-2">
                <Heart className="h-4 w-4" />
                To Visit ({unvisitedFavorites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 gap-6">
                {favorites.map((favorite) => (
                  <ProgramCard
                    key={favorite.location_id}
                    id={favorite.locations.id}
                    organizationName={favorite.locations.organizations.name}
                    locationName={favorite.locations.name || undefined}
                    address={favorite.locations.address}
                    city={favorite.locations.city}
                    county={favorite.locations.county}
                    schedule={favorite.locations.schedule || undefined}
                    services={favorite.locations.organizations.services || undefined}
                    accessibilityFeatures={favorite.locations.accessibility_features || undefined}
                    isFavorited={true}
                    onFavoriteToggle={fetchFavorites}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="visited">
              {visitedFavorites.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl shadow-[var(--shadow-card)]">
                  <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No visited locations yet. Mark locations as visited on their detail pages.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {visitedFavorites.map((favorite) => (
                    <ProgramCard
                      key={favorite.location_id}
                      id={favorite.locations.id}
                      organizationName={favorite.locations.organizations.name}
                      locationName={favorite.locations.name || undefined}
                      address={favorite.locations.address}
                      city={favorite.locations.city}
                      county={favorite.locations.county}
                      schedule={favorite.locations.schedule || undefined}
                      services={favorite.locations.organizations.services || undefined}
                      accessibilityFeatures={favorite.locations.accessibility_features || undefined}
                      isFavorited={true}
                      onFavoriteToggle={fetchFavorites}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unvisited">
              {unvisitedFavorites.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl shadow-[var(--shadow-card)]">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    All your favorites have been visited!
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {unvisitedFavorites.map((favorite) => (
                    <ProgramCard
                      key={favorite.location_id}
                      id={favorite.locations.id}
                      organizationName={favorite.locations.organizations.name}
                      locationName={favorite.locations.name || undefined}
                      address={favorite.locations.address}
                      city={favorite.locations.city}
                      county={favorite.locations.county}
                      schedule={favorite.locations.schedule || undefined}
                      services={favorite.locations.organizations.services || undefined}
                      accessibilityFeatures={favorite.locations.accessibility_features || undefined}
                      isFavorited={true}
                      onFavoriteToggle={fetchFavorites}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
