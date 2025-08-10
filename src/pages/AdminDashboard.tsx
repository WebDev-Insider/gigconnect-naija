import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
  Eye,
  Download,
  AlertTriangle
} from "lucide-react";

const AdminDashboard = () => {
  const [pendingUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      userType: "freelancer",
      registrationDate: "Dec 8, 2024",
      nin: "12345678901",
      documentsSubmitted: ["NIN Document", "Passport"],
      status: "pending"
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah@example.com",
      userType: "client",
      registrationDate: "Dec 7, 2024",
      nin: "10987654321",
      documentsSubmitted: ["NIN Document", "Passport"],
      status: "pending"
    }
  ]);

  const [systemStats] = useState({
    totalUsers: 1250,
    pendingApprovals: 15,
    activeProjects: 89,
    totalRevenue: "₦45.2M",
    monthlyGrowth: 12.5
  });

  const handleApproveUser = (userId: number) => {
    console.log("Approving user:", userId);
    // TODO: Implement approval logic
  };

  const handleRejectUser = (userId: number) => {
    console.log("Rejecting user:", userId);
    // TODO: Implement rejection logic
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, verify documents, and monitor platform activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.pendingApprovals}</p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{systemStats.activeProjects}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
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
                  <p className="text-2xl font-bold">{systemStats.totalRevenue}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{systemStats.monthlyGrowth}%</p>
                  <p className="text-sm text-muted-foreground">Monthly Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  User Verification Queue
                </CardTitle>
                <CardDescription>
                  Review and approve user registrations with KYC documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <Badge variant="outline" className="capitalize">
                              {user.userType}
                            </Badge>
                            <Badge variant="secondary">
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Registered: {user.registrationDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Personal Information</h4>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">NIN:</span> {user.nin}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Documents Submitted</h4>
                          <div className="space-y-1">
                            {user.documentsSubmitted.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{doc}</span>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage registered users and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">User management coming soon</h3>
                    <p className="text-muted-foreground">Advanced user management features will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Monitor and manage platform projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Project management coming soon</h3>
                    <p className="text-muted-foreground">Project oversight and management tools will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>View detailed platform statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Analytics dashboard coming soon</h3>
                    <p className="text-muted-foreground">Detailed analytics and reporting features will be available here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;