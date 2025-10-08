import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">DayHab Connect</span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
