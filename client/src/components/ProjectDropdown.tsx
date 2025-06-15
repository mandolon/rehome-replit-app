
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Project {
  displayName: string;
  projectId: string;
}

interface ProjectDropdownProps {
  anchorRef: React.RefObject<HTMLElement>;
  show: boolean;
  projects: Project[];
  onSelect: (project: Project) => void;
  onClose: () => void;
  selectedProject?: string;
}

function getAbsoluteRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  anchorRef,
  show,
  projects,
  onSelect,
  onClose,
  selectedProject
}) => {
  const [dropdownStyle, setDropdownStyle] = useState<{top: number; left: number; width: number} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter(project =>
    project.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Position dropdown under the anchor
  useEffect(() => {
    if (show && anchorRef.current) {
      const anchorRect = getAbsoluteRect(anchorRef.current);
      const dropdownWidth = anchorRect.width < 280 ? 280 : anchorRect.width;
      let top = anchorRect.top + anchorRect.height + 5;
      let left = anchorRect.left;

      const rightEdge = left + dropdownWidth;
      const viewportWidth = window.innerWidth;

      if (rightEdge > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }
      if (left < 8) left = 8;

      setDropdownStyle({ top, left, width: dropdownWidth });
    }
  }, [show, anchorRef]);

  // Focus search bar when open
  useEffect(() => {
    if (show && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
    }
  }, [show]);

  // Handle click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (show) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [show, onClose]);

  if (!show || !dropdownStyle) return null;

  return createPortal(
    <div
      id="project-dropdown"
      className="bg-background border border-border rounded-md shadow-lg z-[1000] max-h-60 overflow-auto"
      style={{
        position: 'absolute',
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
        minWidth: 240,
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-6 text-[11px] h-6 py-1 border-0 shadow-none focus-visible:ring-0"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="max-h-32 overflow-y-auto">
        {filteredProjects.map((project) => (
          <button
            key={project.projectId}
            type="button"
            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent border-b border-border/30 last:border-b-0 ${
              selectedProject === project.displayName ? "bg-accent" : ""
            }`}
            onClick={e => {
              e.stopPropagation();
              onSelect(project);
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            {project.displayName}
          </button>
        ))}
        {filteredProjects.length === 0 && (
          <div className="text-xs text-muted-foreground px-3 py-2" onMouseDown={e => e.stopPropagation()}>
            No lists found.
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProjectDropdown;
