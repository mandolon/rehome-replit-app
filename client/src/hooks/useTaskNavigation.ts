
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Task } from '@/types/task';

export const useTaskNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToTask = useCallback((task: Task, returnToName?: string, returnToTab?: string) => {
    navigate(`/task/${task.taskId}`, {
      state: {
        returnTo: location.pathname,
        returnToName: returnToName,
        returnToTab: returnToTab
      }
    });
  }, [navigate, location.pathname]);

  const navigateToTaskDetail = useCallback((task: Task) => {
    navigateToTask(task, 'Tasks');
  }, [navigateToTask]);

  const navigateToTaskFromProject = useCallback((task: Task, projectName: string) => {
    navigateToTask(task, `${projectName} - Tasks`, 'tasks');
  }, [navigateToTask]);

  return {
    navigateToTask,
    navigateToTaskDetail,
    navigateToTaskFromProject
  };
};
