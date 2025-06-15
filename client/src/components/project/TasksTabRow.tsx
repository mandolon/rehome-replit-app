
import React from 'react';
import { Edit, Trash2, Paperclip } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import TasksTabStatusIcon from './TasksTabStatusIcon';
import { formatDate, getInitials } from '@/utils/taskUtils';
import { AVATAR_INITIALS_CLASSNAMES } from "@/utils/avatarStyles";
import { getCRMUser } from '@/utils/taskUserCRM';
import { getAvatarColor } from '@/utils/avatarColors';

interface TasksTabRowProps {
  task: any; // Consider defining a more specific type for task if possible
  onTaskClick: (task: any) => void;
  onDeleteClick: (task: any, e: React.MouseEvent) => void;
  onContextMenuDelete: (task: any, e: React.MouseEvent) => void;
}

const TasksTabRow = ({ task, onTaskClick, onDeleteClick, onContextMenuDelete }: TasksTabRowProps) => {
  const formattedDate = formatDate(task.dateCreated);
  const assignee = getCRMUser(task.assignee);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30 group"
          onClick={() => onTaskClick(task)}
        >
          <div className="col-span-6 flex items-center gap-2">
            <TasksTabStatusIcon status={task.status} />
            <span className="text-blue-600 hover:underline truncate">
              {task.taskId} - {task.title}
            </span>
          </div>
          {/* Files column now shows icon if hasAttachment is true */}
          <div className="col-span-2 flex items-center justify-center">
            {task.hasAttachment && (
              <span className="inline-flex items-center justify-center w-6 h-6">
                <Paperclip
                  className="w-4 h-4 text-orange-600 dark:text-white"
                  strokeWidth={2.2}
                  aria-label="Attachment"
                />
              </span>
            )}
          </div>
          <div className="col-span-3 text-muted-foreground">{formattedDate}</div>
          <div className="col-span-3 flex items-center justify-between">
            <div className="flex items-center -space-x-1">
              {assignee && (
                <div className={`w-7 h-7 rounded-full ${AVATAR_INITIALS_CLASSNAMES} text-white ${getAvatarColor(assignee)}`}>
                  {getInitials(assignee.fullName ?? assignee.name)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-1 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit action
                }}
              >
                <Edit className="w-3 h-3 text-muted-foreground" strokeWidth="2" />
              </button>
              <button 
                className="p-1 hover:bg-gray-100 rounded"
                onClick={(e) => onDeleteClick(task, e)}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" strokeWidth="2" />
              </button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={(e) => { e.stopPropagation(); /* Handle edit */ }}>
          <Edit className="w-4 h-4 mr-2" />
          Edit task
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={(e) => onContextMenuDelete(task, e)} 
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TasksTabRow;
