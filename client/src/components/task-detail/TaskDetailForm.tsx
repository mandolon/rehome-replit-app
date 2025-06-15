
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import TaskDetailTitleSection from './TaskDetailTitleSection';
import TaskDetailDescription from './TaskDetailDescription';
import TaskDetailFields from './TaskDetailFields';
import { updateTaskSupabase } from '@/data/taskSupabase';
import { toast } from "@/hooks/use-toast";
import { useTaskDetailAssignmentHandlers } from './hooks/useTaskDetailAssignmentHandlers';
import { useTaskDetailDescriptionSave } from './hooks/useTaskDetailDescriptionSave';

interface TaskDetailFormProps {
  task: Task;
}

const TaskDetailForm = ({ task: originalTask }: TaskDetailFormProps) => {
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
      setTask(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
      try {
        const updated = await updateTaskSupabase(task.taskId, updates);
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

  // Description save/dirty state logic (refactored out)
  // Pass setTask as a React state setter (accepts both Task and updater function)
  const {
    desc,
    descLoading,
    handleSaveDescription,
  } = useTaskDetailDescriptionSave(task, setTask, isSupabaseTask);

  return (
    <div className="space-y-3 relative">
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
      <TaskDetailFields
        task={task}
        currentUser={currentUser}
        assignPerson={handleAssignPerson}
        removeAssignee={handleRemoveAssignee}
        addCollaborator={handleAddCollaborator}
        removeCollaborator={handleRemoveCollaborator}
      />
      {/* Attachments and Trash sections are outside this form */}
    </div>
  );
};

export default TaskDetailForm;
