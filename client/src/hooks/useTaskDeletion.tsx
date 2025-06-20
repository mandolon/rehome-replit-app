
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { Undo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/contexts/UserContext';
import { useQueryClient } from '@tanstack/react-query';

export const useTaskDeletion = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteTask, restoreDeletedTask } = useTaskContext();
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();

  function isSupabaseTask(task: Task) {
    return !!task.taskId && !!task.updatedAt;
  }

  const handleDeleteClick = useCallback((task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskOrId: Task | number | string) => {
      let taskToDeleteObj: Task | null = null;
      if (typeof taskOrId === "object" && taskOrId.id !== undefined) {
        taskToDeleteObj = taskOrId;
      } else if (typeof taskOrId === "number" || typeof taskOrId === "string") {
        // If only id/taskId was passed, can't resolve here, so fallback: skip
        return;
      }

      if (!taskToDeleteObj) return;
      setIsDeleting(true);
      try {
        const deletedByName = currentUser?.name || currentUser?.email || "—";
        // Use the API to soft delete the task
        if (taskToDeleteObj.taskId) {
          const response = await fetch(`/api/tasks/${taskToDeleteObj.taskId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete task');
          }
          
          // Invalidate and refetch tasks
          await queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
        } else {
          // Legacy: only pass the ID, as the context only expects one argument
          await deleteTask(taskToDeleteObj.id);
        }

        toast({
          description: (
            <span>
              <span className="font-semibold">Task</span>
              {" "}moved to trash.{" "}
              <button
                type="button"
                className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
                tabIndex={0}
                onClick={() => {
                  navigate('/settings?tab=trash');
                  dismiss();
                }}
              >
                Go to trash
              </button>
            </span>
          ),
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                // UNDO soft delete by restoring the task
                if (taskToDeleteObj?.taskId) {
                  const response = await fetch(`/api/tasks/${taskToDeleteObj.taskId}/restore`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (response.ok) {
                    await queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
                  }
                } else if (taskToDeleteObj) {
                  restoreDeletedTask(taskToDeleteObj.id);
                }
                dismiss();
              }}
            >
              Undo
            </Button>
          ),
          duration: 5000,
        });
      } catch (error) {
        toast({
          description: (
            <span>
              <span className="font-semibold">Task</span>
              {" "}deletion failed. Please try again.{" "}
              <button
                type="button"
                className="font-bold underline text-red-200 hover:text-red-100 transition-colors"
                tabIndex={0}
                onClick={() => {
                  navigate('/');
                  dismiss();
                }}
              >
                Go to tasks
              </button>
            </span>
          ),
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setTaskToDelete(null);
      }
    },
    [deleteTask, restoreDeletedTask, toast, navigate, dismiss, currentUser]
  );

  return {
    showDeleteDialog,
    taskToDelete,
    isDeleting,
    handleDeleteClick,
    handleDeleteTask,
    handleCloseDeleteDialog
  };
};

