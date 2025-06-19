import React, { useState } from 'react';
import { Check, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Status configuration
const STATUS_CONFIG = {
  redline: {
    key: 'redline' as const,
    label: 'TASK/ REDLINE',
    color: 'bg-[#c62a2f]',
    borderColor: 'border-[#c62a2f]',
    hoverColor: 'hover:bg-[#c62a2f]/50 dark:hover:bg-[#c62a2f]/40',
    textColor: 'text-[#c62a2f]',
  },
  progress: {
    key: 'progress' as const,
    label: 'PROGRESS/ UPDATE',
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    hoverColor: 'hover:bg-blue-500/50 dark:hover:bg-blue-400/40',
    textColor: 'text-blue-500',
  },
  completed: {
    key: 'completed' as const,
    label: 'COMPLETED',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    hoverColor: 'hover:bg-green-500/50 dark:hover:bg-green-400/40',
    textColor: 'text-green-500',
  },
} as const;

export type TaskStatus = keyof typeof STATUS_CONFIG;

// Task Status Icon Component
interface TaskStatusIconProps {
  status: TaskStatus | 'default';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TaskStatusIcon = ({ 
  status, 
  onClick, 
  disabled = false, 
  className,
  size = 'md'
}: TaskStatusIconProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const checkSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !onClick) return;
    
    if (status !== 'completed') {
      setIsAnimating(true);
      setTimeout(() => {
        onClick();
        setIsAnimating(false);
      }, 300);
    } else {
      onClick();
    }
  };

  const config = status !== 'default' ? STATUS_CONFIG[status] : null;

  const getStatusIcon = () => {
    if (status === 'completed') {
      return (
        <div className={cn(
          sizeClasses[size],
          "bg-green-500 rounded-full flex items-center justify-center transition-all duration-200"
        )}>
          <Check className={cn(checkSizeClasses[size], "text-white")} strokeWidth="3" />
        </div>
      );
    }

    const statusColor = config ? config.borderColor : 'border-gray-300';
    const hoverColor = config ? config.hoverColor : 'hover:bg-gray-300/50 dark:hover:bg-gray-700/40';

    return (
      <div
        className={cn(
          sizeClasses[size],
          "border-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center",
          statusColor,
          hoverColor,
          isAnimating && "animate-[scale-in_0.3s_ease-out] bg-green-500 border-green-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {isAnimating && (
          <div className="w-full h-full flex items-center justify-center">
            <Check className={cn(checkSizeClasses[size], "text-white animate-[fade-in_0.2s_ease-out_0.1s_both]")} strokeWidth="3" />
          </div>
        )}
      </div>
    );
  };

  if (!onClick) {
    return (
      <div className={cn("p-0.5", className)}>
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={cn("p-0.5 h-auto hover:bg-accent rounded transition-colors", className)}
    >
      {getStatusIcon()}
    </Button>
  );
};

// Task Status Badge Component
interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export const TaskStatusBadge = ({ status, className, variant = 'default' }: TaskStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        variant === 'default' && config.color + ' text-white',
        variant === 'outline' && config.borderColor + ' ' + config.textColor,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

// Task Status Dropdown Component
interface TaskStatusDropdownProps {
  status: TaskStatus;
  onChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
  className?: string;
}

export const TaskStatusDropdown = ({ 
  status, 
  onChange, 
  disabled = false,
  className 
}: TaskStatusDropdownProps) => {
  const currentConfig = STATUS_CONFIG[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className={cn("h-8 px-3 text-xs", className)}
        >
          <div className={cn("w-2 h-2 rounded-full mr-2", currentConfig.color)} />
          {currentConfig.label}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.values(STATUS_CONFIG).map((config) => (
          <DropdownMenuItem
            key={config.key}
            onClick={() => onChange(config.key)}
            className="flex items-center gap-2"
          >
            <div className={cn("w-2 h-2 rounded-full", config.color)} />
            {config.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Task Group Header Component
interface TaskGroupHeaderProps {
  title: string;
  count: number;
  status: TaskStatus;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAddTask?: () => void;
  className?: string;
}

export const TaskGroupHeader = ({ 
  title, 
  count, 
  status, 
  isCollapsed = false,
  onToggleCollapse,
  onAddTask,
  className 
}: TaskGroupHeaderProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="p-0 h-auto"
      >
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isCollapsed && "rotate-[-90deg]"
          )} 
        />
      </Button>
      
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-sm", config.color)} />
        <span className="font-semibold text-sm">{title}</span>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </Button>
        
        {onAddTask && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAddTask}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
};

// Task Group Container Component
interface TaskGroupProps {
  title: string;
  count: number;
  status: TaskStatus;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAddTask?: () => void;
  className?: string;
}

export const TaskGroup = ({ 
  title, 
  count, 
  status, 
  children, 
  isCollapsed = false,
  onToggleCollapse,
  onAddTask,
  className 
}: TaskGroupProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <TaskGroupHeader
        title={title}
        count={count}
        status={status}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onAddTask={onAddTask}
      />
      
      {!isCollapsed && (
        <>
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Est. Complet...</div>
            <div className="col-span-1">Files</div>
            <div className="col-span-2">Date cre...</div>
            <div className="col-span-2">Due date</div>
            <div className="col-span-1">Assignee</div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            {children}
          </div>
          
          {/* Add Task Button */}
          {onAddTask && (
            <Button 
              variant="ghost" 
              onClick={onAddTask}
              className="w-full justify-start h-auto px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </>
      )}
    </div>
  );
};

// Export all components and types
export type { TaskStatus, TaskStatusIconProps, TaskStatusBadgeProps, TaskStatusDropdownProps, TaskGroupHeaderProps, TaskGroupProps };
export { STATUS_CONFIG };