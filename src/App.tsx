
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ProjectInput from "./pages/ProjectInput";
import DispatchLogic from "./pages/DispatchLogic";
import RevenueStreams from "./pages/RevenueStreams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project-input" element={<ProjectInput />} />
            <Route path="/dispatch-logic" element={<DispatchLogic />} />
            <Route path="/revenue-streams" element={<RevenueStreams />} />
            <Route path="/financials" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/scenarios" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/results" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/settings" element={<Dashboard />} /> {/* Placeholder */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
