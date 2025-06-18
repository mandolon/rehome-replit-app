
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

  return (
    <div className="px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group by:</span>
        
        <button className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-700">
          Status
        </button>
        
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded text-xs border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          Projects
        </button>
        
        {/* Date Filter Popover for "Date Created" */}
        <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${
                selectedDate ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : ''
              }`}
              title="Filter by date created"
            >
              Date Created
              {selectedDate && (
                <span className="ml-1 text-xs text-blue-600 dark:text-blue-300">
                  {selectedDate.toLocaleDateString()}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 z-[1100]">
            <ShadcnCalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="pointer-events-auto"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 text-xs"
              onClick={() => setSelectedDate(undefined)}
            >
              Clear
            </Button>
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

