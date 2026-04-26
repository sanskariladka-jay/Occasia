import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";

import Landing from "./pages/Landing";
import Roadmap from "./pages/Roadmap";
import NotFound from "./pages/NotFound";

import Auth from "./pages/auth/Auth";
import RegisterCollege from "./pages/auth/RegisterCollege";
import Setup from "./pages/auth/Setup";
import ChangePassword from "./pages/auth/ChangePassword";

import Dashboard from "./pages/app/Dashboard";
import EventsList from "./pages/app/EventsList";
import NewEvent from "./pages/app/NewEvent";
import EventDetail from "./pages/app/EventDetail";
import Profile from "./pages/app/Profile";
import Users from "./pages/app/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/roadmap" element={<Roadmap />} />

            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/register-college" element={<RegisterCollege />} />
            <Route path="/auth/setup" element={<Setup />} />
            <Route path="/auth/change-password" element={<ChangePassword />} />

            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/new" element={<NewEvent />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="users"
                element={
                  <RequireAuth requireRoles={["admin", "principal", "ed", "hod", "advisor"]}>
                    <Users />
                  </RequireAuth>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
