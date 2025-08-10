import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">GigConnect Nigeria</h3>
            <p className="text-background/80">
              Connecting Nigerian talent with opportunities. 
              Your trusted platform for freelance services and microgigs.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-background hover:text-background/80">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-background/80">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-background/80">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-background/80">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                How it Works
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Browse Categories
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Find Freelancers
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Post a Job
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Success Stories
              </a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Help Center
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Safety & Trust
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Contact Support
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Dispute Resolution
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                Privacy Policy
              </a>
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-background/80">
                <Mail className="h-4 w-4" />
                <span>support@gigconnect.ng</span>
              </div>
              <div className="flex items-center space-x-2 text-background/80">
                <Phone className="h-4 w-4" />
                <span>+234 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-background/80">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <p className="text-sm text-background/80">Subscribe to our newsletter</p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-background/80 text-sm">
              © 2024 GigConnect Nigeria. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-background/80">
              <span>Made with ❤️ in Nigeria</span>
              <a href="#" className="hover:text-background transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-background transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;