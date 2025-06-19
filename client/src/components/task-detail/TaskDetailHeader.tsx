
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
    <div className="border-b border-border px-6 py-4 flex-shrink-0 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-accent rounded-lg transition-colors group"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5 group-hover:text-foreground transition-colors" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Projects</span>
          <span className="text-muted-foreground/50">/</span>
          {onProjectClick ? (
            <button 
              onClick={onProjectClick}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {task.project}
            </button>
          ) : (
            <span className="font-medium">{task.project}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailHeader;
