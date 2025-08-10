import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Verified, 
  Clock, 
  MessageSquare, 
  CreditCard, 
  Award 
} from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Secure Escrow System",
    description: "Your money is protected until work is completed to your satisfaction"
  },
  {
    icon: Verified,
    title: "Verified Freelancers",
    description: "All freelancers undergo identity verification and skill assessment"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Get help whenever you need it with our dedicated support team"
  },
  {
    icon: MessageSquare,
    title: "Dispute Resolution",
    description: "Fair and fast resolution of any issues through our mediation system"
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description: "Pay with bank transfer, cards, or mobile money - all secured by Paystack"
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "Request unlimited revisions until you're completely satisfied"
  }
];

const stats = [
  { number: "50,000+", label: "Jobs Completed" },
  { number: "₦50M+", label: "Paid to Freelancers" },
  { number: "98%", label: "Success Rate" },
  { number: "4.8/5", label: "Average Rating" }
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose GigConnect?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your success and security are our top priorities. Here's how we ensure the best experience for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {trustFeatures.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-subtle rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h3>
            <p className="text-muted-foreground">
              Join a growing community of successful freelancers and satisfied clients
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;