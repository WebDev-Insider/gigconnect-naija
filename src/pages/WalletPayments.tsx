import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wallet, 
  Shield, 
  Upload, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  CreditCard,
  ArrowUpDown,
  FileText
} from "lucide-react";

const WalletPayments = () => {
  const [transactions] = useState([
    {
      id: 1,
      type: "escrow",
      client: "Tech Solutions Ltd",
      project: "E-commerce Website",
      amount: "₦400,000",
      status: "Funds in Escrow",
      date: "Dec 8, 2024",
      paymentProof: true
    },
    {
      id: 2,
      type: "completed",
      client: "StartupX",
      project: "Brand Identity Design",
      amount: "₦120,000",
      status: "Payment Sent",
      date: "Dec 5, 2024",
      paymentProof: true
    },
    {
      id: 3,
      type: "pending",
      client: "Local Business",
      project: "WordPress Website",
      amount: "₦180,000",
      status: "Payment Pending Verification",
      date: "Dec 10, 2024",
      paymentProof: true
    }
  ]);

  const paystackDetails = {
    accountName: "FreelanceHub Escrow",
    accountNumber: "0123456789",
    bankName: "First Bank Nigeria"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Wallet & Payments</h1>
            <p className="text-muted-foreground">Secure escrow payment management</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">₦520,000</p>
                  <p className="text-sm text-muted-foreground">Funds in Escrow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">₦1,200,000</p>
                  <p className="text-sm text-muted-foreground">Total Received</p>
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
                  <p className="text-2xl font-bold text-orange-600">₦180,000</p>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="escrow">Escrow Process</TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-6">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{transaction.project}</CardTitle>
                        <CardDescription className="mt-2">
                          Client: {transaction.client}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        transaction.status === "Funds in Escrow" ? "default" :
                        transaction.status === "Payment Sent" ? "default" : "secondary"
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">{transaction.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{transaction.date}</span>
                        </div>
                        {transaction.paymentProof && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Payment Proof Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat with Client
                        </Button>
                        {transaction.status === "Funds in Escrow" && (
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Request Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="escrow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How Secure Escrow Works
                </CardTitle>
                <CardDescription>
                  Protecting both clients and freelancers through secure payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Client Initiates Payment</h4>
                      <p className="text-muted-foreground">
                        Client clicks "Pay Freelancer (via Secure Escrow)" button in chat and receives our bank details.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Payment Proof Upload</h4>
                      <p className="text-muted-foreground">
                        Client uploads payment receipt/screenshot. Status changes to "Payment Pending Verification".
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Platform Verification</h4>
                      <p className="text-muted-foreground">
                        Admin verifies payment in Paystack dashboard and marks as "Funds in Escrow".
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Job Completion</h4>
                      <p className="text-muted-foreground">
                        After job completion and client approval, payment is released to freelancer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-blue-900">Security Benefits</h5>
                      <ul className="text-blue-700 text-sm mt-1 space-y-1">
                        <li>• Funds are held securely until job completion</li>
                        <li>• Both parties are protected from fraud</li>
                        <li>• Dispute resolution available if needed</li>
                        <li>• Full transaction transparency</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Payment Proof</CardTitle>
                <CardDescription>
                  For clients: Upload your payment receipt or screenshot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-select">Select Project</Label>
                  <Input id="project-select" placeholder="Choose the project this payment is for" />
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Proof</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Upload payment receipt, screenshot, or bank transfer confirmation
                    </p>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="payment-notes"
                    placeholder="Any additional information about the payment..."
                  />
                </div>

                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Payment Proof
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank-details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Escrow Account Details
                </CardTitle>
                <CardDescription>
                  Send payments to this secure escrow account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Account Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{paystackDetails.accountName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(paystackDetails.accountName)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg">{paystackDetails.accountNumber}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(paystackDetails.accountNumber)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bank:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{paystackDetails.bankName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(paystackDetails.bankName)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-amber-900">Important Instructions</h5>
                      <ul className="text-amber-700 text-sm mt-1 space-y-1">
                        <li>• Always use the project title as payment reference</li>
                        <li>• Upload payment proof immediately after transfer</li>
                        <li>• Funds will be held securely until job completion</li>
                        <li>• Contact support if you have any payment issues</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Instructions for Clients</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <p className="text-sm">Copy the account details above</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <p className="text-sm">Make bank transfer with project title as reference</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <p className="text-sm">Upload payment proof in the "Escrow Process" tab</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <p className="text-sm">Wait for payment verification and job commencement</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPayments;