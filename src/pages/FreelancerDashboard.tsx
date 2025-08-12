import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Star,
  DollarSign,
  FileText,
  MessageSquare,
  Wallet,
  TrendingUp,
  Eye,
  Send
} from "lucide-react";

const FreelancerDashboard = () => {
  const [activeProjects] = useState([
    {
      id: 1,
      title: "E-commerce Website Development",
      client: "Tech Solutions Ltd",
      budget: "₦400,000",
      deadline: "Jan 15, 2025",
      status: "In Progress",
      progress: 75
    },
    {
      id: 2,
      title: "Brand Identity Design",
      client: "StartupX",
      budget: "₦120,000",
      deadline: "Dec 20, 2024",
      status: "Under Review",
      progress: 100
    }
  ]);

  const [availableJobs] = useState([
    {
      id: 1,
      title: "Mobile App UI/UX Design",
      client: "InnovateNow",
      budget: "₦250,000 - ₦350,000",
      deadline: "2 weeks",
      description: "Looking for a talented UI/UX designer to create a modern mobile app interface...",
      skills: ["UI/UX", "Figma", "Mobile Design"],
      proposals: 8
    },
    {
      id: 2,
      title: "WordPress Website Development",
      client: "Local Business",
      budget: "₦150,000 - ₦200,000",
      deadline: "3 weeks",
      description: "Need a professional WordPress website for my restaurant business...",
      skills: ["WordPress", "PHP", "CSS"],
      proposals: 12
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Freelancer Dashboard</h1>
            <p className="text-muted-foreground">Manage your projects and discover new opportunities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
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
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦1.8M</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Profile Completeness</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="text-sm font-medium">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium">2 hours avg</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="jobs">Available Jobs</TabsTrigger>
            <TabsTrigger value="proposals">My Proposals</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {activeProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4" />
                          {project.client}
                        </CardDescription>
                      </div>
                      <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{project.deadline}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Client
                        </Button>
                        <Button size="sm">View Project</Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6">
              {availableJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-2">
                          by {job.client}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{job.proposals} proposals</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{job.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{job.deadline}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send Proposal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No proposals sent yet</h3>
                    <p className="text-muted-foreground">Browse available jobs and send your first proposal</p>
                  </div>
                  <Button>Browse Jobs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No messages yet</h3>
                    <p className="text-muted-foreground">Messages from clients will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-bold text-primary">₦0</p>
                      <p className="text-muted-foreground">Earnings are released per-job after client approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Projects Completed</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earned</span>
                      <span className="font-semibold">₦180,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating</span>
                      <span className="font-semibold">4.8 ⭐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FreelancerDashboard;