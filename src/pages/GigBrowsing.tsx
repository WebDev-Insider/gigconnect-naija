import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, Search, Filter, Clock, DollarSign, User, Loader2 } from 'lucide-react';
import { useGigs, type Gig } from '@/hooks/useGigs';
import { useAuth } from '@/contexts/AuthContext';

const GigBrowsing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [deliveryTime, setDeliveryTime] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({});

  const { user } = useAuth();
  const { gigs, isLoading, error } = useGigs(filters);

  const categories = [
    'All Categories',
    'Graphics & Design',
    'Writing & Translation',
    'Academic Help',
    'Digital Marketing',
    'Programming & Tech',
    'Errands & Tasks'
  ];

  const toggleFavorite = (gigId: string) => {
    // Toggle favorite logic here
    console.log('Toggle favorite for gig:', gigId);
  };

  // Apply filters to gigs
  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gig.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gigs...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-destructive">Error loading gigs: {error.message}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Browse Gigs</h1>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under-5000">Under ₦5,000</SelectItem>
                  <SelectItem value="5000-15000">₦5,000 - ₦15,000</SelectItem>
                  <SelectItem value="15000-30000">₦15,000 - ₦30,000</SelectItem>
                  <SelectItem value="above-30000">Above ₦30,000</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="3-days">Up to 3 Days</SelectItem>
                  <SelectItem value="7-days">Up to 7 Days</SelectItem>
                  <SelectItem value="longer">Longer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Best Rating</SelectItem>
                  <SelectItem value="delivery">Fastest Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {filteredGigs.length} services available
            </p>
          </div>

          {/* Gigs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGigs.map((gig) => (
              <Link key={gig.id} to={`/gig/${gig.id}`}>
                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={gig.portfolio[0] || '/placeholder.svg'}
                        alt={gig.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(gig.id);
                        }}
                      >
                        <Heart className="h-4 w-4 text-gray-600 hover:fill-red-500 hover:text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {gig.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary">
                      {gig.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {gig.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gig.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Price and Delivery */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{gig.deliveryTime} days</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <span>₦{gig.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Gigs
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GigBrowsing;