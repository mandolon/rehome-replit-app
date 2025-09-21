
import React from 'react';
import { Edit, Check, Trash2, Clock } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Task } from '@/lib/schemas/task';

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
  const { toast, dismiss } = useToast();

  const handleDuplicateTask = () => {
    console.log('Duplicating task:', task.id);
  };

  const handleMarkComplete = () => {
    onTaskStatusClick(task.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(task, e as any);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenuDelete(e);
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
          title: "Task added to work records.",
          description: (
            <span className="text-sm">
              View in{" "}
              <button
                type="button"
                className="font-medium underline text-blue-600 hover:text-blue-500"
                onClick={() => {
                  window.location.href = '/timesheets?tab=project-log';
                  dismiss();
                }}
              >
                Project Time Entries
              </button>
            </span>
          ),
          action: (
            <ToastAction
              altText="Undo adding to work records"
              onClick={async () => {
                await fetch(`/api/tasks/${task.taskId}/work-record`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ workRecord: false }),
                });
                dismiss();
              }}
            >
              Undo
            </ToastAction>
          ),
          duration: 5000,
        });
        window.location.reload();
      } else {
        throw new Error('Failed to add task to work records');
      }
    } catch (error) {
      toast({
        title: "Failed to add to work records.",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
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
