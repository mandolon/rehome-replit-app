
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
    label: "To Do",
    color: "text-gray-700",
    style: { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" },
  },
  {
    key: "progress",
    label: "In Progress",
    color: "text-blue-700",
    style: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  },
  {
    key: "completed",
    label: "Completed", 
    color: "text-green-700",
    style: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
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
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            current.color,
            disabled && "opacity-60 pointer-events-none"
          )}
          style={current.style}
          aria-label="Change task status"
        >
          {current.label}
          <ChevronDown className="w-4 h-4 ml-1.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] !z-[100]">
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
