import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import ProjectHero from "@/components/client-dashboard/ProjectHero";
import ProjectTimeline from "@/components/client-dashboard/ProjectTimeline";
import ActivityFeed from "@/components/client-dashboard/ActivityFeed";
import DocumentsGallery from "@/components/client-dashboard/DocumentsGallery";
import ProjectTeam from "@/components/client-dashboard/ProjectTeam";
import QuickActions from "@/components/client-dashboard/QuickActions";
import ProjectHealth from "@/components/client-dashboard/ProjectHealth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * Tweaked layout for tab-based navigation for clients.
 */
const activeProject = {
  name: "Adams - 1063 40th Street",
  address: "1063 40th Street, Sacramento, CA",
  status: "Design Development",
  imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
};

const ClientDashboard = () => {
  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto py-6 px-2 sm:px-4">
        <div className="space-y-6">
          {/* Project Hero */}
          <ProjectHero
            imageUrl={activeProject.imageUrl}
            address={activeProject.address}
            projectName={activeProject.name}
            status={activeProject.status}
          />

          {/* Project Health */}
          <ProjectHealth />

          {/* Dashboard Tabs */}
          <div className="mt-4">
            <Tabs defaultValue="overview">
              <TabsList className="mb-2 w-full justify-start bg-accent">
                <TabsTrigger value="overview" className="px-4 py-2 text-base rounded-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="timeline" className="px-4 py-2 text-base rounded-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Project Timeline
                </TabsTrigger>
                <TabsTrigger value="team" className="px-4 py-2 text-base rounded-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Team
                </TabsTrigger>
                <TabsTrigger value="documents" className="px-4 py-2 text-base rounded-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Documents
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6 pt-2">
                <ActivityFeed />
              </TabsContent>
              <TabsContent value="timeline" className="pt-2">
                <ProjectTimeline />
              </TabsContent>
              <TabsContent value="team" className="space-y-6 pt-2">
                <ProjectTeam />
                <QuickActions />
              </TabsContent>
              <TabsContent value="documents" className="pt-2">
                <DocumentsGallery />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
