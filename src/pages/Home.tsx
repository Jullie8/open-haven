import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Heart, MapPin, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find the Perfect Day Habilitation Program
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Empowering caregivers with complete, accurate information to make informed choices. 
                Explore programs, compare locations, and find the best fit for your loved ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/programs")}
                  className="text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Explore Programs
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-8"
                >
                  Get Started
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Caregivers and individuals in a supportive day program environment" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose DayHab Connect?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the tools and information you need to make the best decision for your loved ones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:scale-105 duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Complete Location Data</h3>
              <p className="text-muted-foreground">
                See all locations for each organization, not just one. Know exactly where programs operate 
                and plan visits accordingly.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:scale-105 duration-300">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Save & Compare</h3>
              <p className="text-muted-foreground">
                Create a personalized dashboard to save favorites, track visits, and compare programs 
                side-by-side to find the perfect match.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:scale-105 duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Empowered Choices</h3>
              <p className="text-muted-foreground">
                No more relying on a single recommendation. Access complete, up-to-date information 
                and make fully informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Find the Right Program?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start exploring day habilitation programs in your area today. Create an account to save 
            your favorites and track your search.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/programs")}
            className="text-lg px-8 shadow-lg hover:shadow-xl transition-all"
          >
            Browse Programs Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 DayHab Connect. Empowering caregivers with choice and transparency.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
