
import React, { useState } from 'react';
import { useTaskNavigation } from '@/hooks/useTaskNavigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DeleteTaskDialog from '../DeleteTaskDialog';
import TasksTabHeader from './TasksTabHeader';
import TasksTabRow from './TasksTabRow';
import { getTasksByProjectId } from '@/data/taskData';

interface TasksTabProps {
  projectName: string;
  projectId: string;
}

const TasksTab = ({ projectName, projectId }: TasksTabProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { navigateToTaskFromProject } = useTaskNavigation();
  const queryClient = useQueryClient();

  // Direct API delete mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      setShowDeleteDialog(false);
      setTaskToDelete(null);
      setIsDeleting(false);
      setRefreshTrigger(prev => prev + 1);
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  // Get tasks for the current project, filtering out deleted ones
  const projectTasks = getTasksByProjectId(projectId).filter(task => !task.deletedAt);

  const handleTaskClick = (task: any) => {
    navigateToTaskFromProject(task, projectName);
  };

  const handleDeleteClick = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  const handleDeleteTaskInternal = async () => {
    if (taskToDelete) {
      setIsDeleting(true);
      try {
        await deleteTaskMutation.mutateAsync(taskToDelete.taskId);
      } catch (error) {
        console.error('Delete failed:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleContextMenuDelete = (task: any, e: React.MouseEvent) => {
    e.preventDefault();
    handleDeleteClick(task, e);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 mt-0">
      <div className="space-y-0.5">
        <TasksTabHeader />
        {/* Task Rows */}
        {projectTasks.map((task) => (
          <TasksTabRow
            key={task.id}
            task={task}
            onTaskClick={handleTaskClick}
            onDeleteClick={(task, e) => handleDeleteClick(task, e)}
            onContextMenuDelete={handleContextMenuDelete}
          />
        ))}
      </div>
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTaskInternal}
        taskTitle={taskToDelete?.title || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TasksTab;
