
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
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
          <span className="w-2 h-2 rounded-full mr-2 bg-white/50" style={{ background: "rgba(255,255,255,0.32)" }}/>
          {current.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] !z-[100]">
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onSelect={() => onChange(option.key)}
            className={cn("flex items-center gap-2 py-2 px-2 cursor-pointer", option.key === status ? "font-semibold" : "")}
            disabled={option.key === status}
          >
            <span className={cn("w-3 h-3 rounded-full inline-block", option.color)} />
            <span>{option.label}</span>
            {option.key === status && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskStatusDropdown;
