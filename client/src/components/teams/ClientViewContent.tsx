
import React from 'react';
import { getClientData, getProjectDisplayName } from "@/data/projectClientData";
import { MapPin } from "lucide-react";

// For demo: This could come from context or user selection – hardcoded for now
const fallbackProjectId = Object.keys(getClientData())[0] || "adams-1063-40th-street";

interface ClientViewContentProps {
  projectId?: string;
}

const ClientViewContent = ({ projectId }: ClientViewContentProps) => {
  // Use the provided projectId or fallback to the first available client
  const clientData = getClientData(projectId || fallbackProjectId);
  const primaryClient = clientData.clients?.find(c => c.isPrimary) || clientData.clients?.[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto">
      <div className="mb-6 text-lg font-semibold flex flex-col gap-1">
        <span>Client CRM View</span>
        <span className="text-xs text-muted-foreground font-normal">
          This is what a client sees in the CRM. They only see their info and their project/account manager.
        </span>
      </div>
      <div className="space-y-5">
        <div className="rounded bg-accent/40 border border-border p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{getProjectDisplayName(projectId || fallbackProjectId)}</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
            <div>
              <dt className="text-muted-foreground">Primary First Name</dt>
              <dd className="font-medium text-foreground">{primaryClient?.firstName ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Primary Last Name</dt>
              <dd className="font-medium text-foreground">{primaryClient?.lastName ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Project Address</dt>
              <dd className="font-medium text-foreground">{clientData.projectAddress}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">City</dt>
              <dd className="font-medium text-foreground">{clientData.city}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">State</dt>
              <dd className="font-medium text-foreground">{clientData.state}</dd>
            </div>
            {/* For now, secondary info omitted since it is not in array of clients */}
            <div>
              <dt className="text-muted-foreground">Project ID</dt>
              <dd className="font-medium text-foreground">{clientData.projectId}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ClientViewContent;
