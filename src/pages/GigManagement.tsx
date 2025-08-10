import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  Clock, 
  DollarSign,
  Image,
  FileText,
  Globe,
  PauseCircle
} from "lucide-react";

const GigManagement = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [gigs] = useState([
    {
      id: 1,
      title: "Professional Website Design",
      description: "I will create a modern, responsive website for your business",
      price: "₦150,000",
      deliveryTime: "7 days",
      status: "Active",
      orders: 12,
      rating: 4.9,
      samples: 3
    },
    {
      id: 2,
      title: "Logo Design & Branding",
      description: "Complete brand identity package with logo and style guide",
      price: "₦80,000",
      deliveryTime: "3 days",
      status: "Paused",
      orders: 8,
      rating: 4.8,
      samples: 5
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gig Management</h1>
            <p className="text-muted-foreground">Create and manage your service offerings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isOnline} 
                onCheckedChange={setIsOnline}
                id="availability"
              />
              <Label htmlFor="availability" className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Globe className="h-4 w-4 text-green-500" />
                    Online
                  </>
                ) : (
                  <>
                    <PauseCircle className="h-4 w-4 text-orange-500" />
                    Offline
                  </>
                )}
              </Label>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Gig
            </Button>
          </div>
        </div>

        <Tabs defaultValue="gigs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gigs">My Gigs</TabsTrigger>
            <TabsTrigger value="create">Create Gig</TabsTrigger>
          </TabsList>

          <TabsContent value="gigs" className="space-y-6">
            <div className="grid gap-6">
              {gigs.map((gig) => (
                <Card key={gig.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{gig.title}</CardTitle>
                        <CardDescription className="mt-2">{gig.description}</CardDescription>
                      </div>
                      <Badge variant={gig.status === "Active" ? "default" : "secondary"}>
                        {gig.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{gig.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{gig.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{gig.orders} orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">⭐</span>
                        <span>{gig.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{gig.samples} samples uploaded</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Add Samples
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Gig</CardTitle>
                <CardDescription>
                  Provide details about your service offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gig Title</Label>
                    <Input 
                      id="title" 
                      placeholder="I will create a professional website..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      placeholder="Web Development"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your service in detail..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery">Delivery Time</Label>
                    <Input 
                      id="delivery" 
                      placeholder="7 days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revisions">Revisions</Label>
                    <Input 
                      id="revisions" 
                      type="number"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sample Work & Media</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Upload images, videos, or documents to showcase your work
                    </p>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input 
                    id="tags" 
                    placeholder="website, design, responsive, modern"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add tags to help clients find your gig
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1">
                    Save as Draft
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Preview Gig
                  </Button>
                  <Button className="flex-1">
                    Publish Gig
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GigManagement;