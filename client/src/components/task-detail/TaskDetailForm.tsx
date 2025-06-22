
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import TaskDetailTitleSection from './TaskDetailTitleSection';
import TaskDetailDescription from './TaskDetailDescription';
import TaskDetailFields from './TaskDetailFields';
import { updateTaskAPI } from '@/data/taskAPI';
import { toast } from "@/hooks/use-toast";
import { useTaskDetailAssignmentHandlers } from './hooks/useTaskDetailAssignmentHandlers';
import { useTaskDetailDescriptionSave } from './hooks/useTaskDetailDescriptionSave';

interface TaskDetailFormProps {
  task: Task;
  onTimeUpdated?: (newTime: string) => void;
}

const TaskDetailForm = ({ task: originalTask, onTimeUpdated }: TaskDetailFormProps) => {
  const { currentUser } = useUser();
  const {
    editingTaskId,
    editingValue,
    setEditingValue,
    startEditingTask,
    saveTaskEdit,
    cancelTaskEdit,
    changeTaskStatus: legacyChangeTaskStatus
  } = useTaskContext();

  const [task, setTask] = useState<Task>(originalTask);

  // Assignment/collaborator handlers (refactored out)
  const {
    handleAssignPerson,
    handleRemoveAssignee,
    handleAddCollaborator,
    handleRemoveCollaborator,
    isSupabaseTask
  } = useTaskDetailAssignmentHandlers(task, setTask);

  // Supabase/legacy status change logic stays here (no assignment logic touched)
  const isEditing = editingTaskId === task.id;
  
  const handleChangeStatus = async (newStatus: "redline" | "progress" | "completed") => {
    if (!task) return;
    if (isSupabaseTask) {
      const oldStatus = task.status;
      const wasArchived = !!task.archived;
      const willArchive = newStatus === "completed";
      const updates: Partial<Task> = {
        status: newStatus,
        archived: willArchive
      };
      
      // Set markedComplete fields when marking as completed
      if (newStatus === "completed" && task.status !== "completed") {
        updates.markedComplete = new Date().toISOString();
        updates.markedCompleteBy = currentUser?.name || "Unknown";
      }
      
      setTask(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
      try {
        const updated = await updateTaskAPI(task.taskId, updates);
        setTask(updated);
        toast({
          title: "Status Updated",
          description: `Task moved to "${newStatus === "redline"
            ? "Redline / To Do"
            : newStatus === "progress"
              ? "In Progress"
              : "Completed"
            }".`
        });
      } catch (e) {
        setTask(prev => ({
          ...prev,
          status: oldStatus,
          archived: wasArchived,
        }));
        toast({
          title: "Error updating status",
          description: (e as any)?.message || "Failed to update task status.",
        });
      }
    } else {
      legacyChangeTaskStatus(task.id, newStatus);
    }
  };

  // Due date update handler
  const handleDueDateUpdated = async (taskId: string, dueDate: string | null) => {
    const updates: Partial<Task> = { dueDate };
    
    setTask(prev => ({ ...prev, dueDate, updatedAt: new Date().toISOString() }));
    
    try {
      const updated = await updateTaskAPI(taskId, updates);
      setTask(updated);
      toast({
        title: "Due Date Updated",
        description: dueDate ? `Due date set to ${new Date(dueDate).toLocaleDateString()}` : "Due date removed"
      });
    } catch (e) {
      // Revert on error
      setTask(prev => ({ ...prev, dueDate: task.dueDate }));
      toast({
        title: "Error updating due date",
        description: (e as any)?.message || "Failed to update due date.",
        variant: "destructive"
      });
    }
  };

  // Description save/dirty state logic (refactored out)
  // Pass setTask as a React state setter (accepts both Task and updater function)
  const {
    desc,
    descLoading,
    handleSaveDescription,
  } = useTaskDetailDescriptionSave(task, setTask, isSupabaseTask);

  return (
    <div className="space-y-2 relative">
      <TaskDetailTitleSection
        isEditing={isEditing}
        editingValue={editingValue}
        setEditingValue={setEditingValue}
        startEditingTask={startEditingTask}
        saveTaskEdit={saveTaskEdit}
        cancelTaskEdit={cancelTaskEdit}
        task={task}
        onChangeStatus={handleChangeStatus}
      />
      <TaskDetailDescription
        value={desc}
        onSave={handleSaveDescription}
        disabled={descLoading}
      />
      <div className="mt-1">
        <TaskDetailFields
          task={task}
          currentUser={currentUser}
          assignPerson={handleAssignPerson}
          removeAssignee={handleRemoveAssignee}
          addCollaborator={handleAddCollaborator}
          removeCollaborator={handleRemoveCollaborator}
          onTimeUpdated={onTimeUpdated}
          onDueDateUpdated={handleDueDateUpdated}
        />
      </div>
      {/* Attachments and Trash sections are outside this form */}
    </div>
  );
};

export default TaskDetailForm;
