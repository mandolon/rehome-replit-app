
import React from 'react';
import { MoreHorizontal, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SidebarWorkspace from './SidebarWorkspace';

interface SidebarProjectsProps {
  isOpen: boolean;
  onToggle: () => void;
  refreshTrigger?: number;
}

const workspaces = [
  { name: 'PinerWorks', active: true, locked: true },
];

const SidebarProjects = ({ isOpen, onToggle, refreshTrigger }: SidebarProjectsProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="mt-4 px-2">
        <CollapsibleTrigger className="flex items-center gap-2 px-2 py-1.5 w-full text-left hover:bg-sidebar-accent/50 rounded">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            Projects
          </span>
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <MoreHorizontal className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
            <Plus className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 mt-2">
            <div className="space-y-1">
              {workspaces.map((workspace, index) => (
                <SidebarWorkspace key={index} workspace={workspace} refreshTrigger={refreshTrigger} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SidebarProjects;
