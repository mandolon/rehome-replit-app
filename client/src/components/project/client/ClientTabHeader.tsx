
import React from 'react';
import { MapPin } from 'lucide-react';

interface ClientTabHeaderProps {
  projectDisplayName: string;
  projectAddress: string;
  startDate: string;
  duration: string;
  status: string;
  onStatusChange: (status: string) => void;
}

const ClientTabHeader = ({
  projectDisplayName,
  projectAddress,
  startDate,
  duration,
  status,
  onStatusChange
}: ClientTabHeaderProps) => {
  return (
    <>
      {/* Header with client name and project address */}
      <div className="border-b border-border pb-3 mb-3">
        <h1 className="text-lg font-semibold text-foreground">
          {projectDisplayName}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{projectAddress}</span>
        </div>
      </div>
    </>
  );
};

export default ClientTabHeader;
