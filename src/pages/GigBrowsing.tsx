import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, Search, Filter, Clock, DollarSign, User } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: string;
  category: string;
  freelancer: {
    name: string;
    rating: number;
    reviews: number;
    avatar?: string;
    isOnline: boolean;
  };
  images: string[];
  tags: string[];
  isFavorite: boolean;
}

const GigBrowsing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [deliveryTime, setDeliveryTime] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock data - would come from API
  const gigs: Gig[] = [
    {
      id: '1',
      title: 'I will design a modern logo for your business',
      description: 'Professional logo design with unlimited revisions. Get your brand identity designed by an experienced graphic designer.',
      price: 15000,
      deliveryTime: '3 days',
      category: 'Graphics & Design',
      freelancer: {
        name: 'Adebayo Johnson',
        rating: 4.9,
        reviews: 127,
        isOnline: true
      },
      images: ['/placeholder.svg'],
      tags: ['logo', 'branding', 'design'],
      isFavorite: false
    },
    {
      id: '2',
      title: 'I will type your documents accurately and fast',
      description: 'Professional typing services for documents, assignments, and business materials. Fast delivery guaranteed.',
      price: 5000,
      deliveryTime: '1 day',
      category: 'Writing & Translation',
      freelancer: {
        name: 'Blessing Okafor',
        rating: 4.8,
        reviews: 89,
        isOnline: false
      },
      images: ['/placeholder.svg'],
      tags: ['typing', 'documents', 'fast'],
      isFavorite: true
    },
    {
      id: '3',
      title: 'I will complete your assignments and research',
      description: 'Academic writing and research assistance for students. High-quality work with proper citations.',
      price: 12000,
      deliveryTime: '2 days',
      category: 'Academic Help',
      freelancer: {
        name: 'Ibrahim Hassan',
        rating: 4.7,
        reviews: 156,
        isOnline: true
      },
      images: ['/placeholder.svg'],
      tags: ['academic', 'research', 'writing'],
      isFavorite: false
    }
  ];

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

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gig.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

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
              <Card key={gig.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={gig.images[0]}
                      alt={gig.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(gig.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${gig.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
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
                  
                  {/* Freelancer Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {gig.freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {gig.freelancer.name}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${gig.freelancer.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{gig.freelancer.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({gig.freelancer.reviews})
                    </span>
                  </div>
                  
                  {/* Price and Delivery */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{gig.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>₦{gig.price.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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