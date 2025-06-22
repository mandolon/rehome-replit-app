import React, { useMemo, useCallback, useState } from 'react';
import { TEAM_USERS } from "@/utils/teamUsers";
import { getCRMUser } from '@/utils/taskUserCRM';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import TaskRowAssignees from '../task-group/TaskRowAssignees';
import InlineTimeField from './InlineTimeField';

interface TaskDetailFieldsProps {
  task: any;
  currentUser: any;
  assignPerson: (taskId: string, person: any) => void;
  removeAssignee: (taskId: string) => void;
  addCollaborator?: (taskId: string, person: any) => void;
  removeCollaborator?: (taskId: string, collaboratorIndex: number) => void;
  onTimeUpdated?: (newTime: string) => void;
  onDueDateUpdated?: (taskId: string, dueDate: string | null) => void;
}

const TaskDetailFields: React.FC<TaskDetailFieldsProps> = ({
  task,
  currentUser,
  assignPerson,
  removeAssignee,
  addCollaborator,
  removeCollaborator,
  onTimeUpdated,
  onDueDateUpdated
}) => {
  const [timeLogged, setTimeLogged] = useState(task?.timeLogged || '0');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(() => {
    try {
      if (!task?.dueDate || task.dueDate === "—" || task.dueDate === "" || task.dueDate === null) {
        return undefined;
      }
      const date = new Date(task.dueDate);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  });
  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getCreatedByName = (createdBy: string) => {
    if (createdBy === "AL" || createdBy === currentUser.name) {
      return currentUser.name;
    }
    return createdBy;
  };

  // These handlers now match the expected (taskId: string, ...) signature
  const handleRemoveAssignee = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAssignee(taskId);
  }, [removeAssignee]);

  const handleRemoveCollaborator = useCallback((taskId: string, collaboratorIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (removeCollaborator) removeCollaborator(taskId, collaboratorIndex);
  }, [removeCollaborator]);

  const handleAssignPerson = useCallback((taskId: string, person: any) => {
    assignPerson(taskId, person);
  }, [assignPerson]);

  const handleAddCollaborator = useCallback((taskId: string, person: any) => {
    if (addCollaborator) addCollaborator(taskId, person);
  }, [addCollaborator]);

  const handleTimeUpdated = (newTime: string) => {
    setTimeLogged(newTime);
    if (onTimeUpdated) onTimeUpdated(newTime);
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    setSelectedDueDate(date);
    if (onDueDateUpdated) {
      onDueDateUpdated(task.taskId, date ? date.toISOString().split('T')[0] : null);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-1" style={{ padding: '2px 0', marginTop: '-12px', fontSize: '11px' }}>
      <div style={{ lineHeight: '1.1 !important', margin: '0 !important', padding: '0 !important' }}>
        <label className="text-xs text-muted-foreground" style={{ display: 'block !important', marginBottom: '0px !important', paddingBottom: '0px !important' }}>
          Created by
        </label>
        <div className="text-xs" style={{ marginTop: '0px !important', paddingTop: '0px !important' }}>{getCreatedByName(task.createdBy)}</div>
      </div>
      <div style={{ lineHeight: '1.1 !important', margin: '0 !important', padding: '0 !important' }}>
        <label className="text-xs text-muted-foreground" style={{ display: 'block !important', marginBottom: '0px !important', paddingBottom: '0px !important' }}>
          Date Created
        </label>
        <div className="text-xs" style={{ marginTop: '0px !important', paddingTop: '0px !important' }}>{formatCreatedDate(task.createdAt)}</div>
      </div>
      {/* ASSIGNED TO - uses TaskRowAssignees for perfect consistency with table */}
      <div style={{ lineHeight: '1.1 !important', margin: '0 !important', padding: '0 !important' }}>
        <label className="text-xs text-muted-foreground" style={{ display: 'block !important', marginBottom: '0px !important', paddingBottom: '0px !important' }}>
          Assigned to
        </label>
        <div className="text-xs" style={{ marginTop: '0px !important', paddingTop: '0px !important' }}>
          <TaskRowAssignees
            task={task}
            onRemoveAssignee={handleRemoveAssignee}
            onRemoveCollaborator={handleRemoveCollaborator}
            onAssignPerson={handleAssignPerson}
            onAddCollaborator={handleAddCollaborator}
          />
        </div>
      </div>
      <div style={{ lineHeight: '1.1 !important', margin: '0 !important', padding: '0 !important' }}>
        <label className="text-xs text-muted-foreground" style={{ display: 'block !important', marginBottom: '0px !important', paddingBottom: '0px !important' }}>
          Track Time
        </label>
        <div style={{ marginTop: '0px !important', paddingTop: '0px !important' }}>
          <InlineTimeField
            taskId={task.taskId}
            currentTime={timeLogged}
            onTimeUpdated={handleTimeUpdated}
          />
        </div>
      </div>
      <div style={{ lineHeight: '1.1 !important', margin: '0 !important', padding: '0 !important' }}>
        <label className="text-xs text-muted-foreground">
          Due Date
        </label>
        <div className="text-xs">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "text-left cursor-pointer hover:text-foreground transition-colors inline-block border-b border-transparent hover:border-muted-foreground px-1",
                  !selectedDueDate && "text-muted-foreground"
                )}
              >
                {selectedDueDate && !isNaN(selectedDueDate.getTime()) ? format(selectedDueDate, "MMM d, yyyy") : "Set date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <Calendar
                  mode="single"
                  selected={selectedDueDate}
                  onSelect={handleDueDateSelect}
                  initialFocus
                />
                {selectedDueDate && (
                  <div className="pt-2 border-t mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDueDateSelect(undefined)}
                      className="w-full text-xs"
                    >
                      Clear Date
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailFields;
