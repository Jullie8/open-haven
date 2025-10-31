import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchFilters } from "@/components/SearchFilters";
import { ProgramCard } from "@/components/ProgramCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Location {
  id: string;
  organization_id: string;
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
}

interface LocationRating {
  location_id: string;
  average_rating: number;
  review_count: number;
}

interface Favorite {
  location_id: string;
}

const Programs = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [ratings, setRatings] = useState<LocationRating[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [countyFilter, setCountyFilter] = useState("All Counties");
  const { toast } = useToast();

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
    fetchLocations();
    fetchRatings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select(`
          id,
          organization_id,
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
        `)
        .order("city");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        title: "Error",
        description: "Failed to load programs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("location_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from("location_ratings")
        .select("*");

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const getRating = (locationId: string) => {
    return ratings.find(r => r.location_id === locationId);
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      searchQuery === "" ||
      location.organizations.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.organizations.services?.some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? false);

    // Normalize county names data includes the word "County"
    const normalizeCounty = (c: string) => (c || "").replace(/\s+county$/i, "").trim().toLowerCase();
    const matchesCounty =
      countyFilter === "All Counties" || normalizeCounty(location.county) === normalizeCounty(countyFilter);

    return matchesSearch && matchesCounty;
  });

  const isFavorited = (locationId: string) => {
    return favorites.some(fav => fav.location_id === locationId);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Day Habilitation Programs
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore all available programs and find the perfect fit
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card p-6 rounded-xl shadow-[var(--shadow-card)] sticky top-20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                countyFilter={countyFilter}
                onCountyChange={setCountyFilter}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredLocations.length} {filteredLocations.length === 1 ? 'program' : 'programs'}
            </div>
            
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No programs found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredLocations.map((location) => (
                  <ProgramCard
                    key={location.id}
                    id={location.id}
                    organizationName={location.organizations.name}
                    locationName={location.name || undefined}
                    address={location.address}
                    city={location.city}
                    county={location.county}
                    schedule={location.schedule || undefined}
                    services={location.organizations.services || undefined}
                    accessibilityFeatures={location.accessibility_features || undefined}
                    isFavorited={isFavorited(location.id)}
                    onFavoriteToggle={fetchFavorites}
                    rating={getRating(location.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Programs;
