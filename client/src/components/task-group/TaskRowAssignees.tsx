import React, { useState } from 'react';
import { AVATAR_INITIALS_CLASSNAMES } from "@/utils/avatarStyles";
import { getInitials } from '@/utils/taskUtils';
import { X, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TEAM_USERS } from "@/utils/teamUsers";
import { getCRMUser } from '@/utils/taskUserCRM';
import { getAvatarColor } from '@/utils/avatarColors';

interface TaskRowAssigneesProps {
  task: any;
  onRemoveAssignee: (taskId: string, e: React.MouseEvent) => void;
  onRemoveCollaborator: (taskId: string, collaboratorIndex: number, e: React.MouseEvent) => void;
  onAssignPerson: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
  onAddCollaborator: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
}

const TaskRowAssignees = ({
  task,
  onRemoveAssignee,
  onRemoveCollaborator,
  onAssignPerson,
  onAddCollaborator,
}: TaskRowAssigneesProps) => {
  const [open, setOpen] = useState(false);

  // Canonical users, with custom colors if present
  const assignee = getCRMUser(task.assignee);
  const collaborators = (task.collaborators || []).map(getCRMUser);

  // Only TEAM members in availablePeople
  const assignedIds = [
    ...(assignee ? [assignee.name] : []),
    ...(collaborators?.map((c: any) => c?.name) || [])
  ];
  const availablePeople = TEAM_USERS
    .filter(u => u.crmRole === 'Team')
    .filter(u => !assignedIds.includes(u.name));

  const handleAdd = (person: any) => {
    if (!assignee) {
      console.info("AssignPerson handler called with: ", person);
      onAssignPerson(task.taskId, person);
    } else {
      console.info("AddCollaborator handler called with: ", person);
      onAddCollaborator(task.taskId, person);
    }
    setOpen(false);
  };

  // The TableCell now has `group/assignees`, so the hover behavior is controlled by the parent cell
  return (
    <div className="flex items-center -space-x-1 relative">
      {/* ASSIGNEE */}
      {assignee && (
        <div className="relative" title={assignee.fullName || assignee.name}>
          <div
            className={`${getAvatarColor(assignee)} w-7 h-7 rounded-full ${AVATAR_INITIALS_CLASSNAMES} text-white border-2 border-background flex items-center justify-center`}
          >
            {getInitials(assignee.fullName ?? assignee.name)}
          </div>
          {/* Remove Assignee Button */}
          <button
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-border p-0 flex items-center justify-center text-destructive opacity-0 group-hover/assignees:opacity-100 transition-opacity"
            style={{lineHeight: 1}}
            onClick={e => { e.stopPropagation(); onRemoveAssignee(task.taskId, e); }}
            title="Remove assignee"
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {/* COLLABORATORS */}
      {collaborators?.map((collaborator: any, idx: number) => collaborator && (
        <div className="relative" key={idx} title={collaborator.fullName || collaborator.name}>
          <div
            className={`${getAvatarColor(collaborator)} w-7 h-7 rounded-full ${AVATAR_INITIALS_CLASSNAMES} text-white border-2 border-background flex items-center justify-center`}
          >
            {getInitials(collaborator.fullName ?? collaborator.name)}
          </div>
          {/* Remove Collaborator Button */}
          <button
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-border p-0 flex items-center justify-center text-destructive opacity-0 group-hover/assignees:opacity-100 transition-opacity"
            style={{lineHeight: 1}}
            onClick={e => { e.stopPropagation(); onRemoveCollaborator(task.taskId, idx, e); }}
            title="Remove collaborator"
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {/* ADD PERSON ("+") BUTTON */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Add person"
            className="ml-2 w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground hover:border-foreground transition text-muted-foreground hover:text-foreground bg-white dark:bg-background"
            onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
            tabIndex={0}
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-1 w-40 bg-popover z-50 border border-border rounded shadow-xl">
          <div className="text-xs font-semibold pb-1 px-2 text-foreground">Add person</div>
          <div className="flex flex-col">
            {availablePeople.length > 0 ? (
              availablePeople.map(person => {
                const personWithColor = getCRMUser(person) || person;
                return (
                <button
                  key={person.name}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent hover:text-accent-foreground text-xs text-foreground transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleAdd(personWithColor); }}
                  type="button"
                >
                  <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-medium ${getAvatarColor(personWithColor)}`}>
                    {getInitials(personWithColor.fullName || personWithColor.name)}
                  </div>
                  <span>{personWithColor.fullName || personWithColor.name}</span>
                </button>
                )
              })
            ) : (
              <div className="text-xs text-muted-foreground px-2 py-1">Everyone assigned</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskRowAssignees;
