import React from 'react';
import { ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task, TaskGroup as TaskGroupType } from '@/types/task';

interface TaskGroupProps {
  title: string;
  count: number;
  color: string;
  tasks: Task[];
}

const TaskGroup = ({ title, count, color, tasks }: TaskGroupProps) => {
  return (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="flex items-center gap-3">
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-sm ${color}`}></div>
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-muted-foreground text-sm">{count}</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground ml-auto" />
        <button className="text-muted-foreground hover:text-foreground">
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground">Add Task</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
        <div className="col-span-4">Name</div>
        <div className="col-span-2">Est. Complet...</div>
        <div className="col-span-1">Files</div>
        <div className="col-span-2">Date cre...</div>
        <div className="col-span-2">Due date</div>
        <div className="col-span-1">Assignee</div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Add Task Button */}
      <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground group">
        <Plus className="w-4 h-4" />
        <span>Add Task</span>
      </button>
    </div>
  );
};

export default TaskGroup;
