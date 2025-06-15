
import React from 'react';
import { Filter } from 'lucide-react';

const TasksTabHeader = () => {
  return (
    <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground py-1.5 border-b group relative">
      <div className="col-span-6">Name</div>
      <div className="col-span-2 text-center">Files</div>
      <div className="col-span-2 flex items-center justify-center gap-1">
        <span>Date Created</span>
        <Filter
          className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-label="Filter by date"
        />
      </div>
      <div className="col-span-2 flex items-center justify-center gap-1">
        <span>Assigned to</span>
        <Filter
          className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-label="Filter by assignee"
        />
      </div>
    </div>
  );
};

export default TasksTabHeader;
