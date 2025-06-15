
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Project {
  displayName: string;
  projectId: string;
}

interface QuickAddProjectDropdownProps {
  show: boolean;
  dropdownStyle: { top: number; left: number; width: number } | null;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filteredProjects: Project[];
  onSelect: (project: Project, e?: React.MouseEvent) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onMouseDown: (e: React.MouseEvent) => void;
}

const QuickAddProjectDropdown: React.FC<QuickAddProjectDropdownProps> = ({
  show,
  dropdownStyle,
  searchTerm,
  setSearchTerm,
  filteredProjects,
  onSelect,
  searchInputRef,
  onMouseDown
}) => {
  if (!show || !dropdownStyle) return null;
  return createPortal(
    <div
      id="quick-add-project-list-dropdown"
      className="bg-popover border border-border rounded-md shadow-lg z-[1000] max-h-60 overflow-auto"
      style={{
        position: 'absolute',
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
        minWidth: 240,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-2 border-b border-border bg-popover">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-6 text-[11px] h-6 py-1 border-0 shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-muted-foreground"
            ref={searchInputRef}
            onMouseDown={e => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="max-h-32 overflow-y-auto bg-popover">
        {filteredProjects.map((project) => (
          <button
            key={project.projectId}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground border-b border-border/30 last:border-b-0 transition-colors duration-75"
            onClick={(e) => onSelect(project, e)}
            onMouseDown={e => e.stopPropagation()}
          >
            {project.displayName}
          </button>
        ))}
        {filteredProjects.length === 0 && (
          <div className="text-xs text-muted-foreground px-3 py-2 bg-popover" onMouseDown={e => e.stopPropagation()}>
            No lists found.
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default QuickAddProjectDropdown;
