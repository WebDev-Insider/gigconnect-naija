import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle, 
  Search,
  Filter,
  Flag,
  Users,
  Clock,
  Trash2,
  Edit,
  MessageCircle,
  UserX
} from "lucide-react";

const ModeratorDashboard = () => {
  const [flaggedContent] = useState([
    {
      id: 1,
      type: "message",
      content: "This is inappropriate content that violates our terms...",
      reporter: "user123",
      reported: "problemuser",
      project: "Website Development",
      timestamp: "2 hours ago",
      status: "pending",
      severity: "high"
    },
    {
      id: 2,
      type: "comment",
      content: "Spam message promoting external services...",
      reporter: "client456",
      reported: "spammer",
      project: "Logo Design",
      timestamp: "4 hours ago",
      status: "under_review",
      severity: "medium"
    },
    {
      id: 3,
      type: "dispute",
      content: "Client not responding after payment, need mediation...",
      reporter: "freelancer789",
      reported: "client987",
      project: "Mobile App Design",
      timestamp: "1 day ago",
      status: "resolved",
      severity: "low"
    }
  ]);

  const [activeChats] = useState([
    {
      id: 1,
      participants: ["client123", "freelancer456"],
      project: "E-commerce Website",
      lastMessage: "When can you deliver the final version?",
      timestamp: "5 minutes ago",
      flagged: false,
      messages: 47
    },
    {
      id: 2,
      participants: ["startup_ceo", "designer789"],
      project: "Brand Identity",
      lastMessage: "The logo needs some adjustments...",
      timestamp: "15 minutes ago",
      flagged: true,
      messages: 23
    }
  ]);

  const [userActions] = useState([
    {
      id: 1,
      action: "Warning Issued",
      user: "problemuser",
      reason: "Inappropriate language in chat",
      timestamp: "1 hour ago",
      moderator: "mod_sarah"
    },
    {
      id: 2,
      action: "Content Removed",
      user: "spammer",
      reason: "Promotional content in project comments",
      timestamp: "3 hours ago",
      moderator: "mod_john"
    },
    {
      id: 3,
      action: "Dispute Resolved",
      user: "freelancer789",
      reason: "Mediated payment dispute",
      timestamp: "1 day ago",
      moderator: "mod_sarah"
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Moderator Dashboard</h1>
            <p className="text-muted-foreground">Community oversight and conflict resolution</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search Content
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Flag className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Active Disputes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flagged" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
            <TabsTrigger value="chats">Chat Monitoring</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
            <TabsTrigger value="actions">Action History</TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Input placeholder="Search flagged content..." className="flex-1" />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Severity
              </Button>
            </div>

            <div className="grid gap-6">
              {flaggedContent.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg capitalize">{item.type} Report</CardTitle>
                        <CardDescription className="mt-2">
                          Reported by {item.reporter} • {item.timestamp}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={
                          item.severity === "high" ? "destructive" :
                          item.severity === "medium" ? "default" : "secondary"
                        }>
                          {item.severity} priority
                        </Badge>
                        <Badge variant={
                          item.status === "pending" ? "destructive" :
                          item.status === "under_review" ? "default" : "secondary"
                        }>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{item.content}</p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Project:</span> {item.project}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Reported User:</span> {item.reported}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Context
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact Parties
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Input placeholder="Search chat participants or projects..." className="flex-1" />
              <Button variant="outline">
                <Flag className="h-4 w-4 mr-2" />
                Show Flagged Only
              </Button>
            </div>

            <div className="grid gap-6">
              {activeChats.map((chat) => (
                <Card key={chat.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{chat.project}</CardTitle>
                        <CardDescription className="mt-2">
                          {chat.participants.join(" ↔ ")} • {chat.messages} messages
                        </CardDescription>
                      </div>
                      {chat.flagged && (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Last Message:</p>
                        <p className="text-sm text-muted-foreground mt-1">{chat.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-2">{chat.timestamp}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Monitor Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Join Conversation
                        </Button>
                        {chat.flagged && (
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4 mr-2" />
                            Moderate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Mediation Tools
                </CardTitle>
                <CardDescription>
                  Resolve conflicts between clients and freelancers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dispute-project">Project/Dispute ID</Label>
                    <Input id="dispute-project" placeholder="Enter project or dispute ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dispute-type">Dispute Type</Label>
                    <Input id="dispute-type" placeholder="Payment, Quality, Communication" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediation-notes">Mediation Notes</Label>
                  <Textarea 
                    id="mediation-notes"
                    placeholder="Document your mediation process and decisions..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Contact Both Parties
                  </Button>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Set Resolution Deadline
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Dispute Resolution Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Disputes</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Verify escrow payment status in admin panel</li>
                      <li>• Check project milestone completion</li>
                      <li>• Review chat history for agreements</li>
                      <li>• Facilitate direct communication if needed</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Quality Disputes</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Review original project requirements</li>
                      <li>• Compare delivered work with specifications</li>
                      <li>• Suggest revision timeline if appropriate</li>
                      <li>• Consider partial payment for partial delivery</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Communication Issues</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Set clear response time expectations</li>
                      <li>• Facilitate structured communication</li>
                      <li>• Document all agreements in writing</li>
                      <li>• Monitor progress closely</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Input placeholder="Search by user or action type..." className="flex-1" />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Date
              </Button>
            </div>

            <div className="grid gap-4">
              {userActions.map((action) => (
                <Card key={action.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            action.action.includes("Warning") ? "destructive" :
                            action.action.includes("Removed") ? "default" : "secondary"
                          }>
                            {action.action}
                          </Badge>
                          <span className="font-medium">{action.user}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{action.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {action.timestamp} • by {action.moderator}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorDashboard;