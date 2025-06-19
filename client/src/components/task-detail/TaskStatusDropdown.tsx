
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
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "redline",
    label: "Redline / To Do",
    color: "bg-red-500 text-white",
  },
  {
    key: "progress",
    label: "In Progress",
    color: "bg-blue-500 text-white",
  },
  {
    key: "completed",
    label: "Completed", 
    color: "bg-green-500 text-white",
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
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition bg-opacity-80 border-none outline-none focus:ring-1 focus:ring-ring",
            current.color,
            disabled && "opacity-60 pointer-events-none"
          )}
          aria-label="Change task status"
        >
          {current.label}
          <ChevronDown className="w-3 h-3 ml-1" />
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
