
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIKeyProvider } from "./contexts/AIKeyContext";
import { AnkiProvider } from "./contexts/AnkiContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import CreateCards from "./pages/CreateCards";
import NotFound from "./pages/NotFound";
import ApiKeySettings from "./pages/ApiKeySettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AIKeyProvider>
          <AnkiProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<CreateCards />} />
                <Route path="/api-key" element={<ApiKeySettings />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AnkiProvider>
        </AIKeyProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
