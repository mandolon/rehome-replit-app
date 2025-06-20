
import React, { useState } from 'react';
import { Edit, Check, Trash2, Clock } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Task } from '@/types/task';

interface TaskRowContextMenuProps {
  task: Task;
  children: React.ReactNode;
  onEditClick: (task: Task, e: React.MouseEvent) => void;
  onTaskStatusClick: (taskId: number) => void;
  onContextMenuDelete: (e: React.MouseEvent) => void;
}

const TaskRowContextMenu = ({
  task,
  children,
  onEditClick,
  onTaskStatusClick,
  onContextMenuDelete
}: TaskRowContextMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleDuplicateTask = () => {
    console.log('Duplicating task:', task.id);
    setOpen(false);
  };

  const handleMarkComplete = () => {
    onTaskStatusClick(task.id);
    setOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(task, e as any);
    setOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenuDelete(e);
    setOpen(false);
  };

  const handleAddToWorkRecords = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.taskId}/work-record`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workRecord: true }),
      });

      if (response.ok) {
        console.log('Task added to work records:', task.taskId);
        // Refresh the page or trigger a re-fetch
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding task to work records:', error);
    }
    setOpen(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleEditClick}>
          <Edit className="w-4 h-4 mr-2" />
          Edit task
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMarkComplete}>
          <Check className="w-4 h-4 mr-2" />
          Mark as complete
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicateTask}>
          <div className="w-4 h-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleAddToWorkRecords}>
          <Clock className="w-4 h-4 mr-2" />
          Add to work records
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={handleDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TaskRowContextMenu;
