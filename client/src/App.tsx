import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import TasksPage from "@/pages/TasksPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import CoreLayout from "./app/(core)/layout";
import { UserProvider } from "./contexts/UserContext";
import { ProjectDataProvider } from "./contexts/ProjectDataContext";
import { TaskProvider } from "./contexts/TaskContext";
import { TaskAttachmentProvider } from "./contexts/TaskAttachmentContext";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <UserProvider>
          <ProjectDataProvider>
            <TaskAttachmentProvider>
              <TaskProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Navigate to="/tasks" replace />} />
                  <Route path="/tasks" element={<CoreLayout><TasksPage /></CoreLayout>} />
                  <Route path="/task/:taskId" element={<CoreLayout><TaskDetailPage /></CoreLayout>} />
                  <Route path="*" element={<Navigate to="/tasks" replace />} />
                </Routes>
              </TaskProvider>
            </TaskAttachmentProvider>
          </ProjectDataProvider>
        </UserProvider>
      </BrowserRouter>
    </AppProviders>
  );
}