import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GigConnect Nigeria
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#categories" className="text-foreground hover:text-primary transition-colors">
              Categories
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" className="text-foreground hover:text-primary">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
                How it Works
              </a>
              <a href="#categories" className="text-foreground hover:text-primary transition-colors">
                Categories
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button asChild variant="ghost" className="text-foreground hover:text-primary justify-start">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity justify-start">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;