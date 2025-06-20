
import React, { useState } from 'react';
import TaskDialog from './TaskDialog';
import TaskBoardContent from './TaskBoardContent';
import { useTaskData } from '@/hooks/useTaskData';
import { Task } from '@/types/task';

const TaskBoard: React.FC = React.memo(() => {
  // Use clean task data hook
  const {
    taskGroups,
    isLoading,
    createTask,
    updateTask,
    deleteTask
  } = useTaskData();

  // Local state for UI
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState<{
    selectedAssignees: string[];
    selectedCreatedBy: string[];
    selectedStartDate?: Date;
    selectedEndDate?: Date;
  }>({
    selectedAssignees: [],
    selectedCreatedBy: [],
  });
  
  const handleToggleClosed = React.useCallback(() => {
    console.log('Toggle closed called, current state:', showClosed);
    setShowClosed(!showClosed);
  }, [showClosed]);

  const handleFiltersChange = React.useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);
  const { addAttachments } = useTaskAttachmentContext();

  // Task deletion is now handled directly in TaskRow components

  // Board tasks are now directly provided by the hook

  // Quick Add handles attachments as in Supabase system
  const onQuickAddSave = React.useCallback(async (taskData: any) => {
    await handleQuickAddSave(taskData);

    // If attachments exist, try to find the new task (by title/project/dateCreated) and add them
    if (taskData.attachments && taskData.attachments.length > 0) {
      let foundTask = null;
      for (const group of taskGroups) {
        foundTask = group.tasks.find((t: any) =>
          t.title === taskData.title &&
          t.projectId === taskData.projectId &&
          t.dateCreated === taskData.dateCreated
        );
        if (foundTask) break;
      }
      if (foundTask && foundTask.taskId) {
        addAttachments(foundTask.taskId, taskData.attachments, "ME");
      } else {
        console.warn('Could not find created task to add attachments.');
      }
    }
    setShowQuickAdd(null);
  }, [handleQuickAddSave, addAttachments, taskGroups, setShowQuickAdd]);

  // Dialog open/close
  const onDialogOpen = React.useCallback(() => setIsTaskDialogOpen(true), [setIsTaskDialogOpen]);
  const onDialogClose = React.useCallback(() => setIsTaskDialogOpen(false), [setIsTaskDialogOpen]);

  // Simple callback for task deletion notifications
  const onTaskDeleted = React.useCallback(() => {
    // Task deletion is now handled directly in TaskRow component
    console.log('Task deleted - data will refresh via React Query');
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TaskBoardContent
        taskGroups={taskGroups}
        showQuickAdd={showQuickAdd}
        refreshTrigger={refreshTrigger}
        onSetShowQuickAdd={setShowQuickAdd}
        onQuickAddSave={onQuickAddSave}
        onTaskClick={handleTaskClick}
        onTaskArchive={handleTaskArchive}
        onTaskDeleted={onTaskDeleted}
        onAddTask={onDialogOpen}
        showClosed={showClosed}
        onToggleClosed={handleToggleClosed}
        assignPerson={assignPerson}
        removeAssignee={removeAssignee}
        addCollaborator={addCollaborator}
        removeCollaborator={removeCollaborator}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={onDialogClose}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
});

TaskBoard.displayName = "TaskBoard";
export default TaskBoard;
