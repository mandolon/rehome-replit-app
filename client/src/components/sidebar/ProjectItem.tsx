
import React, { useRef } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ProjectContextMenu from './ProjectContextMenu';
import { convertDisplayNameToProjectId } from '@/data/projectStatus';

interface ProjectItemProps {
  project: string;
  displayName: string;
  currentSection: string;
  onProjectClick: (projectName: string) => void;
  onMenuAction: (action: string, projectName: string) => void;
}

const ProjectItem = ({ 
  project, 
  displayName, 
  currentSection, 
  onProjectClick, 
  onMenuAction 
}: ProjectItemProps) => {
  const { projectId } = useParams();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const isProjectActive = (projectName: string) => {
    // Use the centralized conversion function to ensure consistency
    const projectIdFromName = convertDisplayNameToProjectId(projectName);
    console.log('ProjectItem - Checking if active:', {
      projectName,
      projectIdFromName,
      urlProjectId: projectId,
      isActive: projectId === projectIdFromName
    });
    return projectId === projectIdFromName;
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Simulate a right-click to open the context menu
    if (contextMenuRef.current) {
      const rightClickEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
      });
      contextMenuRef.current.dispatchEvent(rightClickEvent);
    }
  };

  const isCurrentProject = isProjectActive(project);
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={contextMenuRef}
          className={cn(
            "flex items-center gap-2 px-2 py-1 text-sm rounded cursor-pointer group",
            isCurrentProject 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
          onClick={() => onProjectClick(project)}
        >
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-sm flex-shrink-0"></div>
          <span className="truncate text-xs flex-1">{displayName}</span>
          {project === 'Ogden • Thew • 2709 T Street' && (
            <span className="text-xs text-muted-foreground flex-shrink-0">1</span>
          )}
          <button
            onClick={handleMoreClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 hover:bg-sidebar-accent rounded"
          >
            <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </ContextMenuTrigger>
      <ProjectContextMenu 
        projectName={project}
        currentSection={currentSection}
        onMenuAction={onMenuAction}
      />
    </ContextMenu>
  );
};

export default ProjectItem;
