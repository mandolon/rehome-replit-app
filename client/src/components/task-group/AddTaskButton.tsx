
import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';

interface AddTaskButtonProps {
  onAddTask: () => void;
}

const AddTaskButton = ({ onAddTask }: AddTaskButtonProps) => {
  return (
    <div className="px-4 py-2 pl-8">
      <button 
        onClick={onAddTask}
        className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors"
      >
        <Plus className="w-3 h-3" strokeWidth="2" />
        <span>Add Task</span>
        <ChevronDown className="w-3 h-3" strokeWidth="2" />
      </button>
    </div>
  );
};

export default AddTaskButton;
