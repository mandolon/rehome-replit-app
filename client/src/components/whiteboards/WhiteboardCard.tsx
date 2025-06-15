
import React from 'react';
import { FileText, Users } from 'lucide-react';

interface WhiteboardCardWhiteboard {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  thumbnail: string;
  projectName: string;
  sharedWithClient?: boolean;
}

interface WhiteboardCardProps {
  whiteboard: WhiteboardCardWhiteboard;
  showSharingStatus?: boolean;
}

const WhiteboardCard = ({ whiteboard, showSharingStatus }: WhiteboardCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center group-hover:bg-muted/80 transition-colors">
        <FileText className="w-12 h-12 text-muted-foreground" />
        {showSharingStatus && whiteboard.sharedWithClient && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] bg-green-200 text-green-700 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3 mr-1 inline" /> Shared
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {whiteboard.title}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {whiteboard.projectName}
        </div>
        <div className="text-xs text-muted-foreground">
          {whiteboard.lastModified}
        </div>
      </div>
    </div>
  );
};

export default WhiteboardCard;
