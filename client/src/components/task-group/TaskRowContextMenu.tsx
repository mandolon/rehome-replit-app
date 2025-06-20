
import React, { useState } from 'react';
import { Edit, Check, Trash2, Clock } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
  const { toast, dismiss } = useToast();

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
        toast({
          description: (
            <span>
              <span className="font-semibold">Task</span>
              {" "}added to work records.{" "}
              <button
                type="button"
                className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
                tabIndex={0}
                onClick={() => {
                  window.location.href = '/timesheets?tab=project-log';
                  dismiss();
                }}
              >
                View records
              </button>
            </span>
          ),
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                // Undo by removing from work records
                await fetch(`/api/tasks/${task.taskId}/work-record`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ workRecord: false }),
                });
                dismiss();
              }}
            >
              Undo
            </Button>
          ),
          duration: 5000,
        });
        window.location.reload();
      } else {
        throw new Error('Failed to add task to work records');
      }
    } catch (error) {
      toast({
        description: (
          <span>
            <span className="font-semibold">Failed</span>
            {" "}to add task to work records. Please try again.{" "}
            <button
              type="button"
              className="font-bold underline text-red-200 hover:text-red-100 transition-colors"
              tabIndex={0}
              onClick={() => {
                window.location.href = '/';
                dismiss();
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        variant: "destructive",
      });
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
