
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import HelpSection from "@/components/help/HelpSection";

const TeamHelpPage = () => (
  <AppLayout>
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Team Member Help</h1>
      <HelpSection title="Project Collaboration">
        <p>Work on assigned tasks and contribute to project progress. Communicate with teammates and track statuses in real-time.</p>
      </HelpSection>
      <HelpSection title="Task Management">
        <p>Update task statuses, leave comments, and upload files as needed.</p>
      </HelpSection>
      <HelpSection title="Support">
        <p>If you need more access, contact your admin. Only admins can use the “view as user” tool.</p>
      </HelpSection>
    </div>
  </AppLayout>
);

export default TeamHelpPage;
