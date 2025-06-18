
import React, { useState } from 'react';
import { Filter, Search, Plus, Calendar, ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import AssigneeFilterPopover from './AssigneeFilterPopover';

interface TaskBoardFiltersProps {
  onAddTask: () => void;
  showClosed: boolean;
  onToggleClosed: () => void;
}

const TaskBoardFilters = ({ onAddTask, showClosed, onToggleClosed }: TaskBoardFiltersProps) => {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();
  const [selectedProject, setSelectedProject] = useState<string>('');

  return (
    <div className="px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Group by:</span>
        
        {/* Status Dropdown */}
        <Popover open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded text-xs border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              Status
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 z-[1100]">
            <div className="space-y-1">
              <button className="w-full text-left px-2 py-1 text-xs hover:bg-accent rounded">
                TASK/ REDLINE
              </button>
              <button className="w-full text-left px-2 py-1 text-xs hover:bg-accent rounded">
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
          <PopoverContent className="w-48 p-2 z-[1100]">
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedProject('default')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent ${
                  selectedProject === 'default' ? 'bg-accent' : ''
                }`}
              >
                Default Project
              </button>
              <button 
                onClick={() => setSelectedProject('project-a')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent ${
                  selectedProject === 'project-a' ? 'bg-accent' : ''
                }`}
              >
                Project A
              </button>
              <button 
                onClick={() => setSelectedProject('project-b')}
                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent ${
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
          <PopoverContent className="w-auto p-3 z-[1100]">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-24 text-left px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {selectedStartDate ? selectedStartDate.toLocaleDateString() : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 z-[1200]">
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
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-24 text-left px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {selectedEndDate ? selectedEndDate.toLocaleDateString() : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 z-[1200]">
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
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="px-3 py-1 text-xs h-7"
                  onClick={() => setDateFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Assignee Filter Popover */}
        <AssigneeFilterPopover
          selectedPeople={selectedAssignees}
          onChange={setSelectedAssignees}
        />

        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
          Subtasks
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
          Columns
        </button>
        <button 
          onClick={() => {
            console.log('Closed button clicked, current showClosed:', showClosed);
            onToggleClosed();
          }}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${
            showClosed 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          Closed
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Old Assignee button replaced by assignee filter above */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-7 pr-3 py-1 border border-border rounded text-xs w-48"
            />
          </div>
          <button 
            onClick={onAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
          >
            Add Task
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskBoardFilters;

