
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const current = STATUS_OPTIONS.find((s) => s.key === status) || STATUS_OPTIONS[0];
  const otherOptions = STATUS_OPTIONS.filter((s) => s.key !== status);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "rounded px-2.5 py-0.5 text-xs font-semibold transition-colors h-auto bg-transparent border-0",
            current.color,
            disabled && "opacity-60 pointer-events-none"
          )}
          aria-label="Change task status"
        >
          {current.label}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex flex-col gap-1">
          {otherOptions.map((option) => (
            <Button
              key={option.key}
              variant="ghost"
              size="sm"
              onClick={() => onChange(option.key)}
              className={cn(
                "rounded px-2.5 py-0.5 text-xs font-semibold transition-colors h-auto justify-start bg-transparent border-0",
                option.color
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskStatusDropdown;
