
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getProjectDisplayName } from '@/data/projectClientData';

interface ClientTabLayoutProps {
  formData: {
    projectAddress: string;
    startDate: string;
    duration: string;
    status: string;
  };
  onStatusChange: (status: string) => void;
  onSave: () => void;
  children: React.ReactNode;
}

const ClientTabLayout = ({ formData, onStatusChange, onSave, children }: ClientTabLayoutProps) => {
  const { projectId } = useParams();

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {children}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Fixed Save Button - Always Visible */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex justify-end">
          <Button onClick={onSave} className="px-6 py-2">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientTabLayout;
