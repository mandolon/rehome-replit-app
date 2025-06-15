
import React from 'react';
import { MoreHorizontal, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCRMUser } from '@/utils/taskUserCRM';
import { getInitials, formatDate } from '@/utils/taskUtils';
import { Task } from '@/types/task';
import { AVATAR_INITIALS_CLASSNAMES } from "@/utils/avatarStyles";
import { getAvatarColor } from '@/utils/avatarColors';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  // Always reference CRM-user with color
  const assignee = getCRMUser(task.assignee);
  const collaborators = (task.collaborators || []).map(getCRMUser);

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-accent/50 rounded-lg transition-colors group">
      {/* Checkbox and Task Info */}
      <div className="col-span-4 flex items-center gap-3">
        <input type="checkbox" className="w-4 h-4 rounded border-2" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {task.title}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {task.project}
          </div>
        </div>
      </div>
      {/* Estimated Completion */}
      <div className="col-span-2 flex items-center text-sm text-muted-foreground">
        {task.estimatedCompletion}
      </div>
      {/* Files */}
      <div className="col-span-1 flex items-center">
        {task.hasAttachment && (
          <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
            <Paperclip className="w-3 h-3 text-orange-600" strokeWidth="2" />
          </div>
        )}
      </div>
      {/* Date Created */}
      <div className="col-span-2 flex items-center text-sm text-muted-foreground">
        {formatDate(task.dateCreated)}
      </div>
      {/* Due Date */}
      <div className="col-span-2 flex items-center text-sm text-muted-foreground">
        {task.dueDate}
      </div>
      {/* Assignee & collaborators */}
      <div className="col-span-1 flex items-center justify-end gap-1">
        <div className="flex items-center -space-x-1">
          {assignee && (
            <div className={`w-7 h-7 rounded-full text-white ${AVATAR_INITIALS_CLASSNAMES} ${getAvatarColor(assignee)}`}>
              {getInitials(assignee.fullName ?? assignee.name)}
            </div>
          )}
          {collaborators.map((collaborator, index) => collaborator && (
            <div
              key={index}
              className={`w-7 h-7 rounded-full text-white border-2 border-background ${AVATAR_INITIALS_CLASSNAMES} ${getAvatarColor(collaborator)}`}
            >
              {getInitials(collaborator.fullName ?? collaborator.name)}
            </div>
          ))}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth="2" />
        </button>
      </div>
    </div>
  );
};
export default TaskCard;
