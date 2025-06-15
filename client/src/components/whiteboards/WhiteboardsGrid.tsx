
import React from 'react';
import WhiteboardCard from './WhiteboardCard';
import { getVisibleWhiteboardsForUser } from "@/utils/whiteboardStore";
import { useUser } from "@/contexts/UserContext";
import { projectClientData } from "@/data/projectClientStaticData";

// Helper
function getProjectName(projectId: string) {
  const p = projectClientData[projectId];
  if (!p) return projectId;
  const primaryClient = p.clients.find(c => c.isPrimary) || p.clients[0];
  return `${primaryClient?.lastName ?? ""} • ${p.projectAddress}`;
}

const WhiteboardsGrid = ({ viewMode }: { viewMode: 'grid' | 'list' }) => {
  const { currentUser } = useUser();
  const whiteboards = getVisibleWhiteboardsForUser(currentUser);

  if (whiteboards.length === 0) return (
    <div className="text-center text-muted-foreground italic py-8">
      No whiteboards found for your projects.
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="px-6 py-4">
        <div className="space-y-2">
          {whiteboards.map((whiteboard) => (
            <div key={whiteboard.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer">
              <div className="w-8 h-8 bg-muted rounded flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm flex gap-2 items-center">
                  {whiteboard.title}
                  {whiteboard.sharedWithClient && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px]">Shared</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{getProjectName(whiteboard.projectId)}</div>
                <div className="text-xs text-muted-foreground">{whiteboard.lastModified}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {whiteboards.map((whiteboard) => (
          <WhiteboardCard
            key={whiteboard.id}
            whiteboard={{
              ...whiteboard,
              projectName: getProjectName(whiteboard.projectId),
            }}
            showSharingStatus
          />
        ))}
      </div>
    </div>
  );
};

export default WhiteboardsGrid;
