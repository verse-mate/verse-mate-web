import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useTrackPreAuthLocation } from "@/hooks/useTrackPreAuthLocation";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { AudioPlayerProvider } from "@/audio";
import AppLayout from "@/components/AppLayout";
import FeatureOnboarding from "@/components/onboarding/FeatureOnboarding";
import BibleRoute from "@/components/routes/BibleRoute";
import AuthCallback from "@/components/routes/AuthCallback";
import Logout from "@/components/routes/Logout";
import ReadingScreen from "@/pages/ReadingScreen";
import TopicsScreen from "@/pages/TopicsScreen";
import TopicEventsScreen from "@/pages/TopicEventsScreen";
import TopicEventDetailScreen from "@/pages/TopicEventDetailScreen";
import MostQuotedScreen from "@/pages/MostQuotedScreen";
import BookmarksScreen from "@/pages/BookmarksScreen";
import NotesScreen from "@/pages/NotesScreen";
import HighlightsScreen from "@/pages/HighlightsScreen";
import CommentaryScreen from "@/pages/CommentaryScreen";
import MenuScreen from "@/pages/MenuScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import AboutScreen from "@/pages/AboutScreen";
import GivingScreen from "@/pages/GivingScreen";
import HelpScreen from "@/pages/HelpScreen";
import SignInScreen from "@/pages/SignInScreen";
import CoachHome from "@/pages/CoachHome";
import CoachClassesScreen from "@/pages/CoachClassesScreen";
import CoachTrendsScreen from "@/pages/CoachTrendsScreen";
import CoachFeedbackScreen from "@/pages/CoachFeedbackScreen";
import CoachLeaderScreen from "@/pages/CoachLeaderScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function PreAuthLocationTracker() {
  useTrackPreAuthLocation();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PreAuthLocationTracker />
          <FeatureOnboarding />
          <PostHogProvider>
          <AudioPlayerProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/read" replace />} />
            <Route element={<AppLayout />}>
              {/* Production URLs from frontend-next — preserve exact shape for SEO */}
              <Route path="/bible/:bookSlug/:chapterNumber" element={<BibleRoute />} />
              {/* TopicEventsScreen renders for both /topic/<cat>/<slug> (canonical)
                  and /topics/:topicId (legacy/ID) — same screen, both URL shapes */}
              <Route path="/topic/:categorySlug/:topicSlug" element={<TopicEventsScreen />} />

              {/* Auth — frontend-next URL shape */}
              <Route path="/login" element={<SignInScreen initialMode="signin" />} />
              <Route path="/create-account" element={<SignInScreen initialMode="signup" />} />
              <Route path="/auth/callback/:provider" element={<AuthCallback />} />
              <Route path="/logout" element={<Logout />} />

              {/* Lovable-only routes — never indexed, kept as internal UX paths */}
              <Route path="/read" element={<ReadingScreen />} />
              <Route path="/read/:book/:chapter/commentary" element={<CommentaryScreen />} />
              <Route path="/topics" element={<TopicsScreen />} />
              <Route path="/topics/:topicId" element={<TopicEventsScreen />} />
              <Route path="/topics/:topicId/:eventId" element={<TopicEventDetailScreen />} />
              <Route path="/topics/:topicId/:eventId/most-quoted" element={<MostQuotedScreen />} />
              <Route path="/bookmarks" element={<BookmarksScreen />} />
              <Route path="/notes" element={<NotesScreen />} />
              <Route path="/notes/:book/:chapter" element={<NotesScreen />} />
              <Route path="/highlights" element={<HighlightsScreen />} />
              {/* Bible-Coach portal — gated in-screen (any signed-in user;
                  non-coaches see a friendly gate). /coach branches to the
                  admin roster or the coachee's own dashboard. */}
              <Route path="/coach" element={<CoachHome />} />
              {/* Class Setup — register the classes/meeting links the coaching
                  Notetaker bot joins. */}
              <Route path="/coach/classes" element={<CoachClassesScreen />} />
              <Route path="/coach/trends" element={<CoachTrendsScreen />} />
              <Route path="/coach/feedback" element={<CoachFeedbackScreen />} />
              {/* Admin drill-in: view a specific leader's feedback + trends. */}
              <Route path="/coach/leader/:coachId" element={<CoachLeaderScreen />} />
              <Route path="/coach/leader/:coachId/trends" element={<CoachTrendsScreen />} />
              <Route path="/menu" element={<MenuScreen />} />
              <Route path="/menu/settings" element={<SettingsScreen />} />
              <Route path="/menu/about" element={<AboutScreen />} />
              <Route path="/menu/giving" element={<GivingScreen />} />
              <Route path="/menu/help" element={<HelpScreen />} />
              {/* /menu/signin kept as alias to /login during transition */}
              <Route path="/menu/signin" element={<Navigate to="/login" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AudioPlayerProvider>
          </PostHogProvider>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
