import React from 'react';
import TaskStatusIcon from '../TaskStatusIcon';
import { Input } from '@/components/ui/input';
import QuickAddProjectDropdown from './QuickAddProjectDropdown';

interface QuickAddTaskMainInputProps {
  colSpan: number;
  taskName: string;
  setTaskName: (val: string) => void;
  selectedProject: string;
  setShowProjectDropdown: (b: boolean) => void;
  showProjectDropdown: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredProjects: { displayName: string; projectId: string }[];
  onProjectSelect: (p: { displayName: string; projectId: string }, e?: React.MouseEvent) => void;
  taskNameInputRef: React.RefObject<HTMLInputElement>;
  projectDropdownAnchor: React.RefObject<HTMLButtonElement>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  dropdownStyle: { top: number; left: number; width: number } | null;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const QuickAddTaskMainInput: React.FC<QuickAddTaskMainInputProps> = ({
  colSpan,
  taskName,
  setTaskName,
  selectedProject,
  setShowProjectDropdown,
  showProjectDropdown,
  searchTerm,
  setSearchTerm,
  filteredProjects,
  onProjectSelect,
  taskNameInputRef,
  projectDropdownAnchor,
  searchInputRef,
  dropdownStyle,
  handleKeyDown,
}) => {
  return (
    <div className={`col-span-${colSpan} flex items-center gap-2 pl-4`}>
      <TaskStatusIcon status="todo" onClick={() => {}} />
      <div className="flex-1 relative">
        <button
          ref={projectDropdownAnchor}
          className="block text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-1 transition-colors"
          onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          style={{ background: "transparent" }}
        >
          {selectedProject || 'Select List...'}
        </button>
        <Input
          placeholder="Task Name or type '/' for commands"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-medium text-xs text-foreground h-auto p-0 border-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:font-medium placeholder:text-xs placeholder:text-muted-foreground"
          autoFocus
          ref={taskNameInputRef}
        />
        <QuickAddProjectDropdown
          show={showProjectDropdown}
          dropdownStyle={dropdownStyle}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProjects={filteredProjects}
          onSelect={onProjectSelect}
          searchInputRef={searchInputRef}
          onMouseDown={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default QuickAddTaskMainInput;
