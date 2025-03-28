
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Web3Provider } from "./contexts/Web3Context";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import Wallet from "./pages/Wallet";
import CryptoMarket from "./pages/CryptoMarket";
import CryptoPortfolio from "./pages/CryptoPortfolio";
import AccountSettings from "./pages/AccountSettings";
import DashboardLayout from "./layouts/DashboardLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Web3Provider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard Routes with Layout */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/wallet" replace />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="crypto" element={<CryptoMarket />} />
                <Route path="portfolio" element={<CryptoPortfolio />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>
              
              {/* Aliases for non-dashboard paths */}
              <Route path="/transactions" element={<Navigate to="/dashboard/transactions" replace />} />
              <Route path="/wallet" element={<Navigate to="/dashboard/wallet" replace />} />
              <Route path="/crypto" element={<Navigate to="/dashboard/crypto" replace />} />
              <Route path="/crypto-portfolio" element={<Navigate to="/dashboard/portfolio" replace />} />
              <Route path="/account" element={<Navigate to="/dashboard/settings" replace />} />
              
              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Web3Provider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
