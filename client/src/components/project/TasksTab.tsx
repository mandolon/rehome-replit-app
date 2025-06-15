
import React, { useState } from 'react';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';
import { useTaskNavigation } from '@/hooks/useTaskNavigation';
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
  const { navigateToTaskFromProject } = useTaskNavigation();
  const {
    showDeleteDialog,
    taskToDelete,
    isDeleting,
    handleDeleteClick,
    handleDeleteTask,
    handleCloseDeleteDialog
  } = useTaskDeletion();

  // Get tasks for the current project, filtering out deleted ones
  const projectTasks = getTasksByProjectId(projectId).filter(task => !task.deletedAt);

  const handleTaskClick = (task: any) => {
    navigateToTaskFromProject(task, projectName);
  };

  // Pass the task to delete!
  const handleDeleteTaskInternal = async () => {
    if (taskToDelete) {
      await handleDeleteTask(taskToDelete);
      setRefreshTrigger(prev => prev + 1);
    }
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
