
import React from "react";
import { TaskStatusDropdown as ShadcnTaskStatusDropdown, TaskStatus } from "@/components/ui/task-status";

interface TaskStatusDropdownProps {
  status: string;
  onChange: (newStatus: "redline" | "progress" | "completed") => void;
  disabled?: boolean;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ status, onChange, disabled }) => {
  // Ensure status is valid, default to redline if invalid
  const validStatus = (status === 'redline' || status === 'progress' || status === 'completed') 
    ? status as TaskStatus 
    : 'redline';

  return (
    <ShadcnTaskStatusDropdown
      status={validStatus}
      onChange={onChange}
      disabled={disabled}
      className="text-xs font-medium"
    />
  );
};

export default TaskStatusDropdown;
