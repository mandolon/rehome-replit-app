import React from 'react';
import { Users, MapPin, IdCard } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getClientData } from '@/data/projectClientData';
import ProjectTabForm from './client/ProjectTabForm';

const ProjectTab = () => {
  const { projectId } = useParams();
  const clientData = getClientData(projectId);

  // This now needs to be calculated using a local state, or
  // you can still just render the address from the clientData like before.
  const fullAddress = `${clientData.projectAddress}, ${clientData.city}, ${clientData.state}`;

  // Save action wrapper (for button)
  const handleSave = () => {
    // Could trigger some refresh logic if needed
  };

  return (
    <div className="h-full flex flex-col">
      {/* Project Actions Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-blue-700" />
            <span className="text-sm font-semibold">{fullAddress}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 ml-2">
              <IdCard className="w-4 h-4 text-gray-400" />
              <span>{clientData.projectId}</span>
            </span>
          </div>
          {/* Right side - Agents and Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Agents</span>
              <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-medium">2</span>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700">Ask AI</button>
            <button className="text-xs text-gray-600 hover:text-gray-700">Share</button>
            <button className="text-xs text-gray-600 hover:text-gray-700">Chat</button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <ProjectTabForm onSave={handleSave} />
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Fixed Save Button - Always Visible */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex justify-end">
          <Button onClick={handleSave} className="px-6 py-2">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
