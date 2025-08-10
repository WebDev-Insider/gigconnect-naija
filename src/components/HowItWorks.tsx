import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageCircle, 
  CreditCard, 
  CheckCircle,
  UserPlus,
  Briefcase
} from "lucide-react";

const clientSteps = [
  {
    icon: Search,
    title: "Browse & Search",
    description: "Find the perfect freelancer by browsing categories or posting your job requirements"
  },
  {
    icon: MessageCircle,
    title: "Connect & Discuss",
    description: "Chat with freelancers, discuss project details, and agree on price and timeline"
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay securely through our escrow system - funds are held safely until work is completed"
  },
  {
    icon: CheckCircle,
    title: "Receive & Approve",
    description: "Review completed work, request revisions if needed, and approve to release payment"
  }
];

const freelancerSteps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Sign up, verify your identity, and showcase your skills with an attractive profile"
  },
  {
    icon: Briefcase,
    title: "Create Gigs",
    description: "List your services with clear descriptions, pricing, and delivery timeframes"
  },
  {
    icon: MessageCircle,
    title: "Get Orders",
    description: "Respond to client messages, accept orders, and start working on projects"
  },
  {
    icon: CheckCircle,
    title: "Deliver & Earn",
    description: "Submit completed work, get client approval, and receive payment to your wallet"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How GigConnect Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and efficient. Connect with talent or find work in just a few steps.
          </p>
        </div>

        {/* Client Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2">For Clients</h3>
            <p className="text-muted-foreground">Get your projects done by skilled professionals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clientSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-card shadow-md border-border/50 hover:shadow-elegant transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector */}
                {index < clientSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              Start Hiring Today
            </Button>
          </div>
        </div>

        {/* Freelancer Journey */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2">For Freelancers</h3>
            <p className="text-muted-foreground">Turn your skills into income opportunities</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {freelancerSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-card shadow-md border-border/50 hover:shadow-elegant transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector */}
                {index < freelancerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Join as Freelancer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;