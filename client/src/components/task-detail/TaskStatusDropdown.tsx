
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusOption = {
  key: "redline" | "progress" | "completed";
  label: string;
  color: string;
  style: React.CSSProperties;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "redline",
    label: "TASK/ REDLINE",
    color: "text-white",
    style: { backgroundColor: "#c62a2f" },
  },
  {
    key: "progress",
    label: "PROGRESS/ UPDATE",
    color: "text-white",
    style: { backgroundColor: "#3b82f6" },
  },
  {
    key: "completed",
    label: "COMPLETED", 
    color: "text-white",
    style: { backgroundColor: "#10b981" },
  },
];

interface TaskStatusDropdownProps {
  status: string;
  onChange: (newStatus: "redline" | "progress" | "completed") => void;
  disabled?: boolean;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ status, onChange, disabled }) => {
  const current = STATUS_OPTIONS.find((s) => s.key === status) || STATUS_OPTIONS[0];
  const otherOptions = STATUS_OPTIONS.filter((s) => s.key !== status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "inline-flex items-center rounded border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            current.color,
            disabled && "opacity-60 pointer-events-none"
          )}
          style={current.style}
          aria-label="Change task status"
        >
          {current.label}
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px] !z-[100]">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs text-muted-foreground font-medium">Update Status</p>
        </div>
        {otherOptions.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onSelect={() => onChange(option.key)}
            className="cursor-pointer py-2 px-3"
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskStatusDropdown;
