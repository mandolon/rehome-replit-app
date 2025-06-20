
import React from 'react';
import TaskDialog from './TaskDialog';
import TaskBoardContent from './TaskBoardContent';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { useTaskAttachmentContext } from '@/contexts/TaskAttachmentContext';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks';
import { Task } from '@/types/task';

const TaskBoard: React.FC = React.memo(() => {
  // Enable real-time updates
  useRealtimeTasks();
  
  // Use Subabase-powered board for state
  const {
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    showQuickAdd,
    setShowQuickAdd,
    refreshTrigger,
    taskGroups,
    handleCreateTask,
    handleQuickAddSave,
    handleTaskClick,
    handleTaskArchive,
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator,
  } = useTaskBoard();

  // State for showing/hiding closed tasks
  const [showClosed, setShowClosed] = React.useState(false);
  
  // State for filters
  const [filters, setFilters] = React.useState<{
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

  // --- Task Deletion logic from useTaskDeletion
  const {
    handleDeleteTask, // Will soft delete as expected for SB & legacy
    isDeleting,
  } = useTaskDeletion();

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

  // --- Unified delete handler for this board. Accept Task or id as arg.
  const onTaskDeleted = React.useCallback(async (task: Task | string | number) => {
    let realTask: Task | null = null;
    if (typeof task === "object" && task.taskId) {
      realTask = task;
    } else if (typeof task === "string" || typeof task === "number") {
      // There isn't a global task list here, so we can't always find details. We'll try to infer.
      // Try to find the task by id/taskId in any group
      const allTasks = taskGroups.flatMap(g => g.tasks);
      realTask =
        allTasks.find(t =>
          t.taskId === task ||
          t.id === task
        ) || null;
    }
    if (!realTask) {
      console.error("Can't resolve task for deletion");
      return;
    }
    // Soft delete via the task deletion hook (will set deletedAt)
    await handleDeleteTask(realTask);
  }, [handleDeleteTask, taskGroups]);

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
