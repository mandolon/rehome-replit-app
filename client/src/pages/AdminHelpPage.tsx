
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import HelpSection from "@/components/help/HelpSection";
import FallbackInstructions from "@/components/help/FallbackInstructions";

const AdminHelpPage = () => (
  <AppLayout>
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Admin Help</h1>
      <HelpSection title="User Impersonation ('View as User')">
        <p>Admins can temporarily view the app as another user for troubleshooting or support. Here’s how to safely revert:</p>
        <FallbackInstructions />
      </HelpSection>
      <HelpSection title="Team Management">
        <p>Admins can manage team members, assign roles, and access all projects.</p>
      </HelpSection>
      <HelpSection title="Advanced Features">
        <p>As an admin, you can change global settings, review logs, and access all areas of the system.</p>
      </HelpSection>
    </div>
  </AppLayout>
);

export default AdminHelpPage;
