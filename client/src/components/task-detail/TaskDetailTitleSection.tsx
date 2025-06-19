
import React from 'react';
import TaskStatusDropdown from './TaskStatusDropdown';

interface TaskDetailTitleSectionProps {
  isEditing: boolean;
  editingValue: string;
  setEditingValue: (v: string) => void;
  startEditingTask: (task: any) => void;
  saveTaskEdit: (id: number | string) => void;
  cancelTaskEdit: () => void;
  task: any;
  onChangeStatus: (newStatus: "redline" | "progress" | "completed") => void;
}

const TaskDetailTitleSection: React.FC<TaskDetailTitleSectionProps> = ({
  isEditing,
  editingValue,
  setEditingValue,
  startEditingTask,
  saveTaskEdit,
  cancelTaskEdit,
  task,
  onChangeStatus
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'redline':
        return '#6b7280'; // gray for "To Do"
      case 'progress':
        return '#3b82f6'; // blue
      case 'completed':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTaskEdit(task.id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelTaskEdit();
    }
  };
  const handleBlur = () => {
    saveTaskEdit(task.id);
  };
  return (
    <div className="space-y-6">
      {/* Task metadata row - cleaner, more spaced layout */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStatusColor(task.status) }}
          />
          <span className="font-medium text-foreground">{task.taskId}</span>
        </div>
        <div className="h-4 w-px bg-border"></div>
        <TaskStatusDropdown
          status={task.status}
          onChange={onChangeStatus}
          disabled={isEditing}
        />
      </div>

      {/* Task title - prominent and clean */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-muted-foreground/50"
            autoFocus
            placeholder="Task title..."
          />
        ) : (
          <h1
            className="text-3xl font-bold cursor-pointer hover:bg-accent/30 rounded-lg p-2 -mx-2 -my-2 transition-all duration-200 group"
            onClick={() => startEditingTask(task)}
            title="Click to edit title"
          >
            <span className="group-hover:text-foreground/80 transition-colors">
              {task.title}
            </span>
          </h1>
        )}
      </div>
    </div>
  );
};

export default TaskDetailTitleSection;
