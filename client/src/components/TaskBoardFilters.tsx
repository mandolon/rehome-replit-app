
import React, { useState } from 'react';
import { Filter, Search, Plus, Calendar } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import AssigneeFilterPopover from './AssigneeFilterPopover';

interface TaskBoardFiltersProps {
  onAddTask: () => void;
}

const TaskBoardFilters = ({ onAddTask }: TaskBoardFiltersProps) => {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  return (
    <div className="px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          Group: Status
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
          Subtasks
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
          Columns
        </button>

        {/* Date Filter Popover for "Date Created" */}
        <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 ${
                selectedDate ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Filter by date created"
            >
              <Calendar className="w-3 h-3" />
              Date Created
              {selectedDate && (
                <span className="ml-1 text-xs text-blue-600">
                  {selectedDate.toLocaleDateString()}
                </span>
              )}
            </Button>
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

        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-700 text-xs">
            Closed
          </button>
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

