
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getProjectDisplayName } from '@/data/projectClientData';
import ProjectItem from './ProjectItem';

interface SidebarProjectSectionProps {
  title: string;
  projects: string[];
  isOpen: boolean;
  onToggle: () => void;
  isActive?: boolean;
  refreshTrigger?: number;
}

const SidebarProjectSection = React.memo(({ 
  title, 
  projects, 
  isOpen, 
  onToggle, 
  isActive = false,
  refreshTrigger 
}: SidebarProjectSectionProps) => {
  const navigate = useNavigate();
  const [projectDisplayNames, setProjectDisplayNames] = useState<Record<string, string>>({});

  // Update project display names when refresh trigger changes
  useEffect(() => {
    const updatedNames: Record<string, string> = {};
    projects.forEach(project => {
      const projectIdFromName = project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      updatedNames[project] = getProjectDisplayName(projectIdFromName) || project;
    });
    setProjectDisplayNames(updatedNames);
  }, [projects, refreshTrigger]);

  const handleProjectClick = useCallback((projectName: string) => {
    // Convert project name to URL-friendly format
    const projectIdFromName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    navigate(`/project/${projectIdFromName}`);
  }, [navigate]);

  const handleMenuAction = useCallback((action: string, projectName: string) => {
    console.log(`${action} for project: ${projectName}`);
    
    switch (action) {
      case 'rename':
        // Handle rename
        break;
      case 'duplicate':
        // Handle duplicate
        break;
      case 'archive':
        // Handle archive
        break;
      case 'delete':
        // Handle delete
        break;
      case 'move-to-progress':
        // Handle move to in progress
        break;
      case 'move-to-hold':
        // Handle move to on hold
        break;
      case 'move-to-completed':
        // Handle move to completed
        break;
    }
  }, []);

  const projectItems = useMemo(() => 
    projects.map((project, index) => {
      const displayName = projectDisplayNames[project] || project;
      
      return (
        <ProjectItem
          key={index}
          project={project}
          displayName={displayName}
          currentSection={title}
          onProjectClick={handleProjectClick}
          onMenuAction={handleMenuAction}
        />
      );
    }), [projects, projectDisplayNames, title, handleProjectClick, handleMenuAction]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="ml-2 mt-1">
        <CollapsibleTrigger className={cn(
          "flex items-center gap-2 px-2 py-1.5 w-full text-left rounded",
          "hover:bg-sidebar-accent/50"
        )}>
          {isOpen ? (
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="text-sm truncate">{title}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-2 mt-1 space-y-1">
            {projectItems}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

SidebarProjectSection.displayName = 'SidebarProjectSection';

export default SidebarProjectSection;
