import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Surveys from "./pages/Surveys";
import CreateSurvey from "./pages/CreateSurvey";
import SurveyApplication from "./pages/SurveyApplication";
import PreviewSurvey from "./pages/PreviewSurvey";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import PublicSurvey from "./pages/PublicSurvey";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";

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
          <Route path="/public/survey/:id" element={<PublicSurvey />} />
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="create" element={<CreateSurvey />} />
            <Route path="survey/preview" element={<PreviewSurvey />} />
            <Route path="survey/:id" element={<SurveyApplication />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<Users />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
