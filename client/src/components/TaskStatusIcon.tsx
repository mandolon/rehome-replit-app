
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatusIconProps {
  status: string;
  onClick: () => void;
}

const TaskStatusIcon = ({ status, onClick }: TaskStatusIconProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== 'completed') {
      setIsAnimating(true);
      setTimeout(() => {
        onClick();
      }, 150);
    } else {
      onClick();
    }
  };

  // Map status to base color (used for the hover/fill effect)
  const statusColor = (() => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'redline':
        return 'border-red-500';
      case 'progress':
        return 'border-blue-500';
      default:
        return 'border-gray-300';
    }
  })();

  // Hover color: fill circle with ~50% opacity of corresponding base color
  const statusFillHover = (() => {
    switch (status) {
      case 'redline':
        return 'hover:bg-red-500/50 dark:hover:bg-red-400/40';
      case 'progress':
        return 'hover:bg-blue-500/50 dark:hover:bg-blue-400/40';
      default:
        return 'hover:bg-gray-300/50 dark:hover:bg-gray-700/40';
    }
  })();

  const getStatusIcon = () => {
    if (status === 'completed') {
      // Completed state: fully filled green, no hover effect on fill
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center transition-all duration-200">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth="3" />
        </div>
      );
    }

    if (status === 'redline') {
      return (
        <div
          className={cn(
            "w-4 h-4 border-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
            statusColor,
            statusFillHover,
            isAnimating && "animate-[scale-in_0.3s_ease-out] bg-green-500 border-green-500"
          )}
        >
          {isAnimating && (
            <div className="w-full h-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white animate-[fade-in_0.2s_ease-out_0.1s_both]" strokeWidth="3" />
            </div>
          )}
        </div>
      );
    }

    if (status === 'progress') {
      return (
        <div
          className={cn(
            "w-4 h-4 border-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
            statusColor,
            statusFillHover,
            isAnimating && "animate-[scale-in_0.3s_ease-out] bg-green-500 border-green-500"
          )}
        >
          {isAnimating && (
            <div className="w-full h-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white animate-[fade-in_0.2s_ease-out_0.1s_both]" strokeWidth="3" />
            </div>
          )}
        </div>
      );
    }

    // Default (unassigned/inactive) state
    return (
      <div
        className={cn(
          "w-4 h-4 border-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
          statusColor,
          statusFillHover
        )}
      />
    );
  };

  return (
    <button onClick={handleClick} className="p-0.5 hover:bg-accent rounded transition-colors">
      {getStatusIcon()}
    </button>
  );
};

export default TaskStatusIcon;
