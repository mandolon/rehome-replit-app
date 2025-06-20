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

  const handleFiltersChange = React.useCallback((newFilters: {
    selectedAssignees: string[];
    selectedCreatedBy: string[];
    selectedStartDate?: Date;
    selectedEndDate?: Date;
  }) => {
    setFilters(newFilters);
  }, []);

  // Event handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask(taskData);
    setIsTaskDialogOpen(false);
  };

  const handleQuickAddSave = async (taskData: any) => {
    await createTask(taskData);
    setShowQuickAdd(null);
  };

  const handleTaskArchive = async (taskId: number) => {
    // Archive task implementation
    console.log('Archive task:', taskId);
  };

  const handleToggleClosed = () => setShowClosed(prev => !prev);
  const onDialogOpen = () => setIsTaskDialogOpen(true);
  const onDialogClose = () => setIsTaskDialogOpen(false);

  // Simple callback for task deletion notifications
  const onTaskDeleted = React.useCallback(() => {
    // Task deletion is now handled directly in TaskRow component
    console.log('Task deleted - data will refresh via React Query');
  }, []);

  // Simplified assignment handlers (can be enhanced later)
  const assignPerson = (taskId: string, person: any) => {
    console.log('Assign person:', { taskId, person });
  };

  const removeAssignee = (taskId: string) => {
    console.log('Remove assignee:', taskId);
  };

  const addCollaborator = (taskId: string, person: any) => {
    console.log('Add collaborator:', { taskId, person });
  };

  const removeCollaborator = (taskId: string, idx: number) => {
    console.log('Remove collaborator:', { taskId, idx });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TaskBoardContent
        taskGroups={taskGroups}
        showQuickAdd={showQuickAdd}
        refreshTrigger={0} // No longer needed with direct API calls
        onSetShowQuickAdd={setShowQuickAdd}
        onQuickAddSave={handleQuickAddSave}
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

TaskBoard.displayName = 'TaskBoard';

export default TaskBoard;