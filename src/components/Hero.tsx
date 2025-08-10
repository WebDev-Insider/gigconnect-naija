import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star, Users, Shield } from "lucide-react";
import heroImage from "@/assets/hero-freelancers.jpg";

const Hero = () => {
  return (
    <section className="relative bg-gradient-subtle min-h-[90vh] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Connect with 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Local Talent</span> 
                <br />
                Get Work Done
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Nigeria's premier platform for finding skilled freelancers for typing, graphics, errands, 
                assignments and digital tasks. Secure payments, quality work, trusted community.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>10,000+ Active Freelancers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Escrow</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-primary" />
                <span>4.8/5 Rating</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
              >
                Hire Freelancers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Start Freelancing
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <Card className="p-4 bg-gradient-card shadow-md border-border/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24hr</div>
                  <div className="text-sm text-muted-foreground">Avg Delivery</div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-card shadow-md border-border/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₦500</div>
                  <div className="text-sm text-muted-foreground">Starting Price</div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-card shadow-md border-border/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Secure Payment</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-elegant">
              <img 
                src={heroImage} 
                alt="Nigerian freelancers working on various digital tasks" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-success text-success-foreground px-4 py-2 rounded-full font-semibold shadow-lg">
              ✓ Verified Freelancers
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold shadow-lg">
              💰 Secure Escrow
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;