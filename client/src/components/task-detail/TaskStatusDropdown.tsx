
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusOption = {
  key: "redline" | "progress" | "completed";
  label: string;
  color: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "redline",
    label: "TASK/ REDLINE",
    color: "bg-red-500 text-white",
  },
  {
    key: "progress",
    label: "PROGRESS/ UPDATE",
    color: "bg-blue-500 text-white",
  },
  {
    key: "completed",
    label: "COMPLETED", 
    color: "bg-green-500 text-white",
  },
];

interface TaskStatusDropdownProps {
  status: string;
  onChange: (newStatus: "redline" | "progress" | "completed") => void;
  disabled?: boolean;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ status, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-1">
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.key}
          variant="ghost"
          size="sm"
          onClick={() => onChange(option.key)}
          disabled={disabled}
          className={cn(
            "rounded border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors h-auto",
            status === option.key 
              ? option.color // Selected state: colored background
              : "bg-transparent text-muted-foreground hover:bg-muted", // Unselected state: muted
            disabled && "opacity-60 pointer-events-none"
          )}
          aria-label={`Set status to ${option.label}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default TaskStatusDropdown;
