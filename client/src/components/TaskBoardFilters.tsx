
import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, Calendar, ChevronDown, CheckCircle, Scissors } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import AssigneeFilterPopover from './AssigneeFilterPopover';
import CreatedByFilterPopover from './CreatedByFilterPopover';
import NotePopup from './NotePopup';
import TodoPopup from './TodoPopup';
import ScreenClipPopup from './ScreenClipPopup';

interface TaskBoardFiltersProps {
  onAddTask: () => void;
  showClosed: boolean;
  onToggleClosed: () => void;
  onFiltersChange?: (filters: {
    selectedAssignees: string[];
    selectedCreatedBy: string[];
    selectedStartDate?: Date;
    selectedEndDate?: Date;
  }) => void;
}

const TaskBoardFilters = ({ onAddTask, showClosed, onToggleClosed, onFiltersChange }: TaskBoardFiltersProps) => {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [notePopupOpen, setNotePopupOpen] = useState(false);
  const [todoPopupOpen, setTodoPopupOpen] = useState(false);
  const [screenClipPopupOpen, setScreenClipPopupOpen] = useState(false);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        selectedAssignees,
        selectedCreatedBy,
        selectedStartDate,
        selectedEndDate,
      });
    }
  }, [selectedAssignees, selectedCreatedBy, selectedStartDate, selectedEndDate, onFiltersChange]);

  return (
    <div className="px-4 py-2 border-b border-border">
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 pr-2">Group by:</span>
        
        {/* Status Dropdown */}
        <Popover open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded text-xs border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              Status
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 z-[1100] bg-popover text-popover-foreground border border-border" align="start">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground/70 px-2 py-1">
                Show status
              </div>
              <button className="w-full text-left px-2 py-1 text-xs hover:bg-accent rounded text-foreground">
                TASK/ REDLINE
              </button>
              <button className="w-full text-left px-2 py-1 text-xs hover:bg-accent rounded text-foreground">
                PROGRESS/ UPDATE
              </button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Projects Dropdown */}
        <Popover open={projectsDropdownOpen} onOpenChange={setProjectsDropdownOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded text-xs border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              Projects
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 z-[1100] bg-popover text-popover-foreground border border-border" align="start">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground/70 px-2 py-1">
                Show project
              </div>
              <button 
                onClick={() => setSelectedProject('default')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent text-foreground ${
                  selectedProject === 'default' ? 'bg-accent' : ''
                }`}
              >
                Default Project
              </button>
              <button 
                onClick={() => setSelectedProject('project-a')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent text-foreground ${
                  selectedProject === 'project-a' ? 'bg-accent' : ''
                }`}
              >
                Project A
              </button>
              <button 
                onClick={() => setSelectedProject('project-b')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent text-foreground ${
                  selectedProject === 'project-b' ? 'bg-accent' : ''
                }`}
              >
                Project B
              </button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Date Created Filter */}
        <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${
                selectedStartDate || selectedEndDate 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
              title="Filter by date created"
            >
              Date Created
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 z-[1100] bg-popover text-popover-foreground border border-border" align="start">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground/70 px-2 py-1">
                Show date range
              </div>
              <div className="flex gap-3 px-2">
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-20 text-left px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {selectedStartDate ? selectedStartDate.toLocaleDateString() : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 z-[1200] bg-popover text-popover-foreground border border-border">
                      <ShadcnCalendar
                        mode="single"
                        selected={selectedStartDate}
                        onSelect={setSelectedStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-20 text-left px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {selectedEndDate ? selectedEndDate.toLocaleDateString() : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 z-[1200] bg-popover text-popover-foreground border border-border">
                      <ShadcnCalendar
                        mode="single"
                        selected={selectedEndDate}
                        onSelect={setSelectedEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Assignee Filter Popover */}
        <AssigneeFilterPopover
          selectedPeople={selectedAssignees}
          onChange={setSelectedAssignees}
        />

        {/* Created By Filter Popover */}
        <CreatedByFilterPopover
          selectedPeople={selectedCreatedBy}
          onChange={setSelectedCreatedBy}
        />

        <div className="ml-auto flex items-center gap-1">
          {/* Add Note button */}
          <button 
            onClick={() => setNotePopupOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <Plus className="w-3 h-3" />
            Add Note
          </button>

          {/* Screen Clip button */}
          <button 
            onClick={() => setScreenClipPopupOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <Scissors className="w-3 h-3" />
            Screen Clip
          </button>

          {/* Add ToDo button */}
          <button 
            onClick={() => setTodoPopupOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <Plus className="w-3 h-3" />
            ToDo
          </button>

          {/* Completed button moved here */}
          <button 
            onClick={() => {
              console.log('Completed button clicked, current showClosed:', showClosed);
              onToggleClosed();
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${
              showClosed 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            Completed
          </button>


          <button 
            onClick={onAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
          >
            Add Task
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Note Popup */}
      <NotePopup 
        isOpen={notePopupOpen} 
        onClose={() => setNotePopupOpen(false)} 
      />

      {/* Todo Popup */}
      <TodoPopup 
        isOpen={todoPopupOpen} 
        onClose={() => setTodoPopupOpen(false)} 
      />

      {/* Screen Clip Popup */}
      <ScreenClipPopup 
        isOpen={screenClipPopupOpen} 
        onClose={() => setScreenClipPopupOpen(false)} 
      />
    </div>
  );
};

export default TaskBoardFilters;

