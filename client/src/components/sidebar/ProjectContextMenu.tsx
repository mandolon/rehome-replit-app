
import React from 'react';
import { Edit, Copy, Archive, Trash2, ArrowRight } from 'lucide-react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

interface ProjectContextMenuProps {
  projectName: string;
  currentSection: string;
  onMenuAction: (action: string, projectName: string) => void;
}

const ProjectContextMenu = ({ projectName, currentSection, onMenuAction }: ProjectContextMenuProps) => {
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem onClick={() => onMenuAction('rename', projectName)}>
        <Edit className="w-4 h-4 mr-2" />
        Rename
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onMenuAction('duplicate', projectName)}>
        <Copy className="w-4 h-4 mr-2" />
        Duplicate
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <ArrowRight className="w-4 h-4 mr-2" />
          Move to
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {currentSection !== 'in Progress' && (
            <ContextMenuItem onClick={() => onMenuAction('move-to-progress', projectName)}>
              In Progress
            </ContextMenuItem>
          )}
          {currentSection !== 'on Hold' && (
            <ContextMenuItem onClick={() => onMenuAction('move-to-hold', projectName)}>
              On Hold
            </ContextMenuItem>
          )}
          {currentSection !== 'Completed' && (
            <ContextMenuItem onClick={() => onMenuAction('move-to-completed', projectName)}>
              Completed
            </ContextMenuItem>
          )}
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => onMenuAction('archive', projectName)}>
        <Archive className="w-4 h-4 mr-2" />
        Archive
      </ContextMenuItem>
      <ContextMenuItem 
        className="text-red-600 focus:text-red-600" 
        onClick={() => onMenuAction('delete', projectName)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default ProjectContextMenu;
