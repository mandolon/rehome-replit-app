
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
import { updateTaskAPI } from "@/data/taskAPI";
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
        const deletedTask = await updateTaskAPI(task.taskId, {
          deletedAt: new Date().toISOString(),
        });
        toast({
          title: "Task trashed.",
          description: "Task moved to trash.",
          duration: 3000,
        });
        setShowDeleteDialog(false);
        if (onDeleted) onDeleted(); // <--- NEW: trigger close after delete
      } else {
        await legacyDeleteTask(task.id);
        toast({
          title: "Task trashed.",
          description: "Task moved to trash.",
          duration: 3000,
        });
        setShowDeleteDialog(false);
        if (onDeleted) onDeleted(); // <--- NEW: trigger close after delete
      }
    } catch (err) {
      toast({
        title: "Delete failed.",
        description: (err as any)?.message || "Could not move task to trash.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => setShowDeleteDialog(false);

  return (
    <div className="flex justify-end pt-8 pb-4">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive border-none shadow-none px-2 py-1 h-auto font-normal"
        onClick={handleTrashClick}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4 transition-colors" />
        <span className="font-normal">Move to Trash</span>
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

