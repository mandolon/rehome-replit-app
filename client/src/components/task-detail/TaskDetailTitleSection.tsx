
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
    <div className="space-y-4">
      {/* Task ID with circle icon and status inline */}
      <div className="flex items-center justify-between mt-2">
        <div className="border border-border rounded px-3 py-1 flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full border-2"
            style={{ borderColor: '#c62a2f' }}
          >
          </div>
          <span className="text-xs font-semibold">Task</span>
          <div className="w-px h-4 bg-border"></div>
          <span className="text-xs font-semibold text-muted-foreground">{task.taskId}</span>
        </div>
        <div className="flex-shrink-0">
          <TaskStatusDropdown
            status={task.status}
            onChange={onChangeStatus}
            disabled={isEditing}
          />
        </div>
      </div>

      {/* Task title - separate section */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="text-2xl font-semibold opacity-60 bg-transparent border-none outline-none focus:ring-0 px-1 py-0.5 -mx-1 -my-0.5 rounded transition-colors truncate w-full"
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-semibold cursor-pointer hover:bg-accent/50 rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors truncate"
            onClick={() => startEditingTask(task)}
            title="Click to edit title"
          >
            {task.title}
          </h1>
        )}
      </div>
    </div>
  );
};

export default TaskDetailTitleSection;
