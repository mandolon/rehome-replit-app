
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
import { updateTaskSupabase } from "@/data/taskSupabase";
import { useTaskContext } from "@/contexts/TaskContext";
import { Task } from "@/types/task";
import { toast } from "@/hooks/use-toast";

interface TaskDetailTrashButtonProps {
  task: Task; // fully hydrated task, as in TaskDetailForm
  onDeleted?: () => void; // <--- NEW: callback for post-delete action
}

const TaskDetailTrashButton: React.FC<TaskDetailTrashButtonProps> = ({ task, onDeleted }) => {
  const isSupabaseTask = !!task.taskId && !!task.updatedAt;
  const { deleteTask: legacyDeleteTask } = useTaskContext();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTrashClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (isSupabaseTask) {
        // Soft-delete: set deleted_at to now
        const deletedTask = await updateTaskSupabase(task.taskId, {
          deletedAt: new Date().toISOString(),
        });
        toast({
          title: "Task Trashed",
          description: "Task moved to trash.",
          duration: 3000,
        });
        setShowDeleteDialog(false);
        if (onDeleted) onDeleted(); // <--- NEW: trigger close after delete
      } else {
        await legacyDeleteTask(task.id);
        toast({
          title: "Task Trashed",
          description: "Task moved to trash.",
          duration: 3000,
        });
        setShowDeleteDialog(false);
        if (onDeleted) onDeleted(); // <--- NEW: trigger close after delete
      }
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: (err as any)?.message || "Could not move task to trash.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => setShowDeleteDialog(false);

  return (
    <div className="flex justify-end pt-8 pb-1">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive border-none shadow-none px-2 py-1 h-auto"
        onClick={handleTrashClick}
        disabled={isDeleting}
      >
        {/* Trash icon: smaller, colored only on hover */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6h18M9 6v12a2 2 0 002 2h2a2 2 0 002-2V6m-9 0a2 2 0 012-2h2a2 2 0 012 2m7 0v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6"
            className="transition-colors"
          />
        </svg>
        <span>Move to Trash</span>
      </Button>
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        taskTitle={task.title}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TaskDetailTrashButton;

