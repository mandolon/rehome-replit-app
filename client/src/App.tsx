
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Home2 from "./pages/Home2";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import Projects from "./pages/Projects";
import TaskDetailPage from "./pages/TaskDetailPage";
import TeamsPage from "./pages/TeamsPage";
import InvoicePage from "./pages/InvoicePage";
import TimesheetsPage from "./pages/TimesheetsPage";
import WorkRecordsPage from "./pages/WorkRecordsPage";
import WhiteboardsPage from "./pages/WhiteboardsPage";
import ClientWhiteboards from "./pages/ClientWhiteboards";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import TasksPage from "./pages/TasksPage";
import SchedulesPage from "./pages/SchedulesPage";
import ClientAccountPage from "./pages/ClientAccountPage";
import ClientDashboard from "./pages/ClientDashboard";
import AdminHelpPage from "./pages/AdminHelpPage";
import TeamHelpPage from "./pages/TeamHelpPage";
import ClientHelpPage from "./pages/ClientHelpPage";
import PDFViewerPage from "./pages/PDFViewerPage";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ProjectDataProvider } from "./contexts/ProjectDataContext";
import { UserProvider } from "./contexts/UserContext";
import { TaskProvider } from "./contexts/TaskContext";
import { TaskAttachmentProvider } from "./contexts/TaskAttachmentContext";
import ImpersonationGate from "./components/ImpersonationGate";
import LoginPage from "./components/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CoreLayout from "./app/(core)/layout";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);

const LocationLogger = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('App component is rendering, current path:', location.pathname);
  }, [location]);
  return null;
};

const App = () => {
  // Providers that do NOT require router context (ThemeProvider, QueryClientProvider, TooltipProvider) are at the top level.
  // Providers that REQUIRE router context (UserProvider, TaskProvider, etc.) go INSIDE BrowserRouter.
  return (
    <AppProviders>
      <BrowserRouter>
        <UserProvider>
          <SidebarProvider>
            <ProjectDataProvider>
              <TaskAttachmentProvider>
                <TaskProvider>
                  <Toaster />
                  <Sonner />
                  <LocationLogger />
                  <ImpersonationGate>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute>
                            <CoreLayout>
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/home2" element={<Home2 />} />
                                <Route path="/tasks" element={<TasksPage />} />
                                <Route path="/schedules" element={<SchedulesPage />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/project/:projectId" element={<ProjectPage />} />
                                <Route path="/task/:taskId" element={<TaskDetailPage />} />
                                <Route path="/teams" element={<TeamsPage />} />
                                <Route path="/client/account" element={<ClientAccountPage />} />
                                <Route path="/client/dashboard" element={<ClientDashboard />} />
                                <Route path="/invoices" element={<InvoicePage />} />
                                <Route path="/timesheets" element={<TimesheetsPage />} />
                                <Route path="/work-records" element={<WorkRecordsPage />} />
                                <Route path="/whiteboards" element={<WhiteboardsPage />} />
                                <Route path="/client/whiteboards" element={<ClientWhiteboards />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/settings/notifications" element={<SettingsPage />} />
                                <Route path="/help" element={<HelpRedirector />} />
                                <Route path="/help/admin" element={<AdminHelpPage />} />
                                <Route path="/help/team" element={<TeamHelpPage />} />
                                <Route path="/help/client" element={<ClientHelpPage />} />
                                <Route path="/sandbox/pdf-viewer" element={<PDFViewerPage />} />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </CoreLayout>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </ImpersonationGate>
                </TaskProvider>
              </TaskAttachmentProvider>
            </ProjectDataProvider>
          </SidebarProvider>
        </UserProvider>
      </BrowserRouter>
    </AppProviders>
  );
};

import { useUser } from "./contexts/UserContext";
import { useNavigate } from "react-router-dom";

const HelpRedirector = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Admin') {
      navigate('/help/admin', { replace: true });
    } else if (currentUser.role === 'Team Lead' || currentUser.role === 'Project Manager' || currentUser.role === 'Engineer' || currentUser.role === 'Designer' || currentUser.role === 'Operations' || currentUser.role === 'QA Tester' || currentUser.role === 'Consultant' || currentUser.role === 'CAD Tech' || currentUser.role === 'Jr Designer' || currentUser.role === 'Developer' || currentUser.role === 'Marketing Manager' || currentUser.role === 'Customer Support' || currentUser.role === 'Interior Designer' || currentUser.role === 'Contractor') {
      navigate('/help/team', { replace: true });
    } else if (currentUser.role === 'Client') {
      navigate('/help/client', { replace: true });
    } else {
      navigate('/help/client', { replace: true });
    }
  }, [currentUser, navigate]);
  return <div>Redirecting to the appropriate Help page…</div>;
};

export default App;
