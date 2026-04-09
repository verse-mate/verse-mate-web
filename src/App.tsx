import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "@/components/AppLayout";
import ReadingScreen from "@/pages/ReadingScreen";
import TopicsScreen from "@/pages/TopicsScreen";
import TopicEventsScreen from "@/pages/TopicEventsScreen";
import BookmarksScreen from "@/pages/BookmarksScreen";
import MenuScreen from "@/pages/MenuScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import AboutScreen from "@/pages/AboutScreen";
import GivingScreen from "@/pages/GivingScreen";
import HelpScreen from "@/pages/HelpScreen";
import SignInScreen from "@/pages/SignInScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/read" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/read" element={<ReadingScreen />} />
              <Route path="/topics" element={<TopicsScreen />} />
              <Route path="/topics/:topicId" element={<TopicEventsScreen />} />
              <Route path="/bookmarks" element={<BookmarksScreen />} />
              <Route path="/menu" element={<MenuScreen />} />
              <Route path="/menu/settings" element={<SettingsScreen />} />
              <Route path="/menu/about" element={<AboutScreen />} />
              <Route path="/menu/giving" element={<GivingScreen />} />
              <Route path="/menu/help" element={<HelpScreen />} />
              <Route path="/menu/signin" element={<SignInScreen />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
