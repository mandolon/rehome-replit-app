
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { Undo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateTaskSupabase } from '@/data/taskSupabase';
import { useUser } from '@/contexts/UserContext'; // <-- ADDED

export const useTaskDeletion = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteTask, restoreDeletedTask } = useTaskContext();
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useUser(); // <-- ADDED

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
        if (isSupabaseTask(taskToDeleteObj)) {
          // SOFT DELETE: Set deletedAt and deletedBy
          await updateTaskSupabase(taskToDeleteObj.taskId, {
            deletedAt: new Date().toISOString(),
            deletedBy: deletedByName
          });
        } else {
          // Legacy: only pass the ID, as the context only expects one argument
          await deleteTask(taskToDeleteObj.id);
        }

        toast({
          description: (
            <div className="flex items-center gap-2 w-full">
              <span className="font-semibold">Task</span>
              <span>moved to</span>
              <button
                type="button"
                className="underline decoration-dotted underline-offset-4 text-blue-700 hover:text-blue-600 transition-colors"
                tabIndex={0}
                onClick={() => {
                  navigate('/settings?tab=trash');
                  dismiss();
                }}
                style={{ fontWeight: 500 }}
              >
                trash
              </button>
              <span className="ml-6" />
              <Button
                variant="ghost"
                size="sm"
                className="pl-1 pr-2 py-0.5 h-7 flex items-center gap-1 group"
                onClick={async (e) => {
                  e.stopPropagation();
                  // UNDO
                  if (isSupabaseTask(taskToDeleteObj!)) {
                    await updateTaskSupabase(taskToDeleteObj.taskId, {
                      deletedAt: null,
                      deletedBy: null
                    });
                  } else {
                    restoreDeletedTask(taskToDeleteObj!.id);
                  }
                  dismiss();
                }}
              >
                <Undo className="w-4 h-4 mr-1 text-muted-foreground group-hover:text-foreground" strokeWidth={2.2}/>
                Undo
              </Button>
              <span className="mx-2 h-5 border-l border-border inline-block self-center" />
            </div>
          ),
          duration: 5000,
          className: "p-3 pr-2 w-auto min-w-[340px]",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
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

