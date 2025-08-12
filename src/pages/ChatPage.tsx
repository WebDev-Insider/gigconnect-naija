import React from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const chatId = params.get('chatId') || undefined;
  const orderId = params.get('orderId') || undefined;
  // Mock data - in real app this would come from URL params/state
  const chatData = {
    userRole: 'client' as const,
    projectTitle: 'Modern Logo Design for Tech Startup',
    otherUserName: 'Adebayo Johnson',
    projectStatus: 'in_progress' as const,
    projectDetails: {
      budget: '₦25,000',
      deadline: '3 days',
      category: 'Graphic Design'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{chatData.projectTitle}</h3>
                    <Badge variant="secondary">{chatData.projectDetails.category}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Budget
                      </div>
                      <span className="font-medium">{chatData.projectDetails.budget}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Deadline
                      </div>
                      <span className="font-medium">{chatData.projectDetails.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-2">Project Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a modern, minimalist logo for a tech startup. Should include company initials 
                      and work well in both light and dark themes. Deliverables include vector files, 
                      PNG variants, and a simple brand guidelines document.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <ChatInterface
                  userRole={chatData.userRole}
                  projectTitle={chatData.projectTitle}
                  otherUserName={chatData.otherUserName}
                  projectStatus={chatData.projectStatus}
                  chatId={chatId}
                  orderId={orderId}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;