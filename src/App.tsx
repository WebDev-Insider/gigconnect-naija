import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GigManagement from "./pages/GigManagement";
import WalletPayments from "./pages/WalletPayments";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import ChatPage from "./pages/ChatPage";
import GigBrowsing from "./pages/GigBrowsing";
import JobPosting from "./pages/JobPosting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/gig-management" element={<GigManagement />} />
          <Route path="/wallet-payments" element={<WalletPayments />} />
          <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/browse-gigs" element={<GigBrowsing />} />
          <Route path="/post-job" element={<JobPosting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
