import React, { useMemo, useCallback } from 'react';
import { TEAM_USERS } from "@/utils/teamUsers";
import { getCRMUser } from '@/utils/taskUserCRM';
import { format } from 'date-fns';
import TaskRowAssignees from '../task-group/TaskRowAssignees';

interface TaskDetailFieldsProps {
  task: any;
  currentUser: any;
  assignPerson: (taskId: string, person: any) => void;
  removeAssignee: (taskId: string) => void;
  addCollaborator?: (taskId: string, person: any) => void;
  removeCollaborator?: (taskId: string, collaboratorIndex: number) => void;
}

const TaskDetailFields: React.FC<TaskDetailFieldsProps> = ({
  task,
  currentUser,
  assignPerson,
  removeAssignee,
  addCollaborator,
  removeCollaborator
}) => {
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

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Created by
        </label>
        <div className="text-xs">{getCreatedByName(task.createdBy)}</div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Date Created
        </label>
        <div className="text-xs">{formatCreatedDate(task.createdAt)}</div>
      </div>
      {/* ASSIGNED TO - uses TaskRowAssignees for perfect consistency with table */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Assigned to
        </label>
        <div className="text-xs">
          <TaskRowAssignees
            task={task}
            onRemoveAssignee={handleRemoveAssignee}
            onRemoveCollaborator={handleRemoveCollaborator}
            onAssignPerson={handleAssignPerson}
            onAddCollaborator={handleAddCollaborator}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Marked Complete
        </label>
        <div className="text-xs text-muted-foreground">—</div>
      </div>
    </div>
  );
};

export default TaskDetailFields;
