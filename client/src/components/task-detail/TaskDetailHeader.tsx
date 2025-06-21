
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
    <div className="py-4 flex-shrink-0 bg-background/80 backdrop-blur-sm border-b border-[#bbbbbb] dark:border-border">
      <div className="flex items-center gap-2 px-6">
        <button 
          onClick={onClose} 
          className="hover:bg-accent rounded-lg transition-colors group -ml-1"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4 group-hover:text-foreground transition-colors" />
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
