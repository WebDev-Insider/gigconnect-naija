import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Paperclip, CreditCard, CheckCircle, Clock, Upload } from 'lucide-react';

interface Message {
  id: string;
  sender: 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  type: 'text' | 'payment' | 'file' | 'system';
  attachments?: string[];
}

interface ChatInterfaceProps {
  userRole: 'client' | 'freelancer';
  projectTitle: string;
  otherUserName: string;
  projectStatus: 'active' | 'pending_payment' | 'in_progress' | 'completed';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userRole,
  projectTitle,
  otherUserName,
  projectStatus
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'client',
      content: 'Hi! I need help with my logo design project. Can you start working on it?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: '2',
      sender: 'freelancer',
      content: 'Hello! Yes, I can help you with that. Let me review the requirements and I\'ll get started.',
      timestamp: new Date(Date.now() - 3500000),
      type: 'text'
    },
    {
      id: '3',
      sender: 'client',
      content: 'Great! The payment has been initiated via escrow.',
      timestamp: new Date(Date.now() - 3000000),
      type: 'payment'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handlePaymentProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const submitPaymentProof = () => {
    if (paymentProof) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userRole,
        content: `Payment proof uploaded: ${paymentProof.name}`,
        timestamp: new Date(),
        type: 'payment',
        attachments: [paymentProof.name]
      };
      setMessages([...messages, message]);
      setShowPaymentModal(false);
      setPaymentProof(null);
    }
  };

  const markJobComplete = () => {
    const message: Message = {
      id: Date.now().toString(),
      sender: userRole,
      content: 'Job has been marked as complete. Payment will be released to freelancer.',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages([...messages, message]);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: 'Active' },
      pending_payment: { color: 'bg-yellow-500', text: 'Pending Payment' },
      in_progress: { color: 'bg-blue-500', text: 'In Progress' },
      completed: { color: 'bg-gray-500', text: 'Completed' }
    };
    
    const config = statusConfig[projectStatus];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  return (
    <div className="flex flex-col h-screen max-h-[600px] bg-background border border-border rounded-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{otherUserName}</h3>
              <p className="text-sm text-muted-foreground">{projectTitle}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === userRole ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.sender === userRole ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === userRole
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-muted-foreground'
                  } ${message.type === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  {message.type === 'payment' && (
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">Payment Update</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  {message.attachments && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs opacity-80">
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Avatar className={`h-8 w-8 ${message.sender === userRole ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
                <AvatarFallback className="text-xs">
                  {message.sender === userRole ? 'You' : otherUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Payment Actions */}
      {userRole === 'client' && projectStatus === 'active' && (
        <div className="p-4 border-t border-border bg-card">
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay Freelancer (via Secure Escrow)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Secure Escrow Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Payment Instructions:</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Transfer to our Paystack account details below, then upload proof of payment.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div><strong>Bank:</strong> Guaranty Trust Bank</div>
                      <div><strong>Account Name:</strong> GigConnect Nigeria Ltd</div>
                      <div><strong>Account Number:</strong> 0123456789</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => navigator.clipboard.writeText('0123456789')}
                    >
                      Copy Account Number
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Payment Proof</label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePaymentProofUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <Button 
                    onClick={submitPaymentProof} 
                    disabled={!paymentProof}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Payment Proof
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Job Completion */}
      {userRole === 'client' && projectStatus === 'in_progress' && (
        <div className="p-4 border-t border-border bg-card">
          <Button onClick={markJobComplete} className="w-full flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark Job Complete
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};