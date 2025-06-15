
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Task } from '@/types/task'; // Import the Task type

interface TaskDetailHeaderProps {
  task: Task; // Use the imported Task type
  onClose: () => void;
  onProjectClick?: () => void;
}

const TaskDetailHeader = ({ task, onClose, onProjectClick }: TaskDetailHeaderProps) => {
  return (
    <div className="border-b border-border p-2 flex-shrink-0">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={onClose} className="p-1 hover:bg-accent rounded">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {onProjectClick ? (
          <button 
            onClick={onProjectClick}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            {task.project} {/* This is the project display name */}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">{task.project}</span>
        )}
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs font-medium">{task.taskId}</span>
      </div>
    </div>
  );
};

export default TaskDetailHeader;
