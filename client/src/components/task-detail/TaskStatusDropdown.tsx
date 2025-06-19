
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusOption = {
  key: "redline" | "progress" | "completed";
  label: string;
  color: string;
  bgColor?: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "redline",
    label: "TASK/ REDLINE",
    color: "text-white",
    bgColor: "#c62a2f",
  },
  {
    key: "progress",
    label: "PROGRESS/ UPDATE",
    color: "text-white",
    bgColor: "#3b82f6",
  },
  {
    key: "completed",
    label: "COMPLETED", 
    color: "text-white",
    bgColor: "#22c55e",
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
              ? option.color // Selected state: white text
              : "bg-transparent text-muted-foreground hover:bg-muted", // Unselected state: muted
            disabled && "opacity-60 pointer-events-none"
          )}
          style={status === option.key && option.bgColor ? { backgroundColor: option.bgColor } : {}}
          aria-label={`Set status to ${option.label}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default TaskStatusDropdown;
