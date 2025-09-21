
import React from "react";
import HelpSection from "@/components/help/HelpSection";

const ClientHelpPage = () => (
  <div className="max-w-2xl mx-auto py-8 px-4">
    <h1 className="text-2xl font-bold mb-4">Client Help</h1>
    <HelpSection title="Project Viewing">
      <p>View updates on your projects, including progress, documents, and key communications.</p>
    </HelpSection>
    <HelpSection title="Communication">
      <p>Send and receive messages from your project team.</p>
    </HelpSection>
    <HelpSection title="Support">
      <p>Contact your administrator or team lead for any questions regarding your account or access.</p>
    </HelpSection>
  </div>
);

export default ClientHelpPage;
