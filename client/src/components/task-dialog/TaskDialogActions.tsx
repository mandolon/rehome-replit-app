
import React, { useRef, useState } from 'react';
import { Calendar, User, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { TEAM_USERS } from '@/utils/teamUsers';
import { TeamUser } from '@/types/user';

interface TaskDialogActionsProps {
  assignedTo: string | TeamUser;
  setAssignedTo: (value: TeamUser) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  taskName: string;
  onCreateTask: (attachments?: File[]) => void;
}

// Only use TEAM members for assignment dropdown
const teamAssignees = TEAM_USERS.filter(member => member.crmRole === 'Team');

const TaskDialogActions = ({
  assignedTo,
  setAssignedTo,
  dueDate,
  setDueDate,
  taskName,
  onCreateTask
}: TaskDialogActionsProps) => {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files)]);
      e.target.value = "";
    }
  };
  const handleRemoveFile = (idx: number) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));

  const isCreateDisabled = !taskName.trim() || !assignedTo || (typeof assignedTo === "string");

  // Ensure Select value is always a string (the user id)
  let selectValue: string = "";
  if (typeof assignedTo === "string") {
    selectValue = assignedTo;
  } else if (assignedTo && typeof assignedTo === "object" && "id" in assignedTo) {
    selectValue = assignedTo.id;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Select 
          value={selectValue}
          onValueChange={value => {
            // Always set full teamAssignees object as assignee
            const found = teamAssignees.find(u => u.id === value);
            setAssignedTo(found ? { ...found } : teamAssignees[0]);
          }}
        >
          <SelectTrigger className="w-28 h-7 text-xs">
            <User className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {teamAssignees.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-32 h-7 text-xs pl-7 justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <Calendar className="w-3 h-3 absolute left-2" />
              {dueDate ? format(dueDate, "PPP") : "Due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-xs px-2 py-1 h-6 text-muted-foreground hover:text-foreground border border-border rounded"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file(s)"
          type="button"
        >
          <Paperclip className="w-3 h-3" />
          <span className="">{attachedFiles.length}</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-label="Attach file(s)"
        />

        {/* Inline file chips */}
        {attachedFiles.length > 0 && (
          <div className="flex gap-1 flex-wrap items-center max-w-[120px]">
            {attachedFiles.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 bg-muted px-2 py-0.5 rounded text-xs font-medium"
                title={file.name}
              >
                {file.name}
                <button onClick={() => handleRemoveFile(idx)} className="ml-0.5 text-destructive" type="button" aria-label="Remove file">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Button 
        onClick={() => onCreateTask(attachedFiles)}
        disabled={isCreateDisabled}
        className="h-7 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
      >
        Create Task
      </Button>
    </div>
  );
};

export default TaskDialogActions;

