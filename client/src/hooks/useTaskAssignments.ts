
import { useCallback } from 'react';
import { Task } from '@/types/task';
import { getTasksByStatus } from '@/data/taskData';

export const useTaskAssignments = (
  customTasks: Task[],
  updateTaskById: (taskId: number, updates: Partial<Task>) => void
) => {
  // Accept taskId as string everywhere and handle both cases
  const assignPerson = useCallback((taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    const taskNumericId = Number(taskId);
    updateTaskById(taskNumericId, { assignee: person });
    console.log(`Assigned ${person.fullName || person.name} to task ${taskId}`);
  }, [updateTaskById]);

  const removeAssignee = useCallback((taskId: string) => {
    const taskNumericId = Number(taskId);
    updateTaskById(taskNumericId, { assignee: null });
    console.log(`Removed assignee from task ${taskId}`);
  }, [updateTaskById]);

  const addCollaborator = useCallback((taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    const taskNumericId = Number(taskId);
    const centralizedTask = getTasksByStatus('redline').concat(getTasksByStatus('progress')).concat(getTasksByStatus('completed')).find(t => t.id === taskNumericId);
    const customTask = customTasks.find(t => t.id === taskNumericId);
    const currentTask = centralizedTask || customTask;
    
    if (currentTask) {
      const updatedCollaborators = [...(currentTask.collaborators || []), person];
      updateTaskById(taskNumericId, { collaborators: updatedCollaborators });
    }
    console.log(`Added ${person.fullName || person.name} as collaborator to task ${taskId}`);
  }, [customTasks, updateTaskById]);

  const removeCollaborator = useCallback((taskId: string, collaboratorIndex: number) => {
    const taskNumericId = Number(taskId);
    const centralizedTask = getTasksByStatus('redline').concat(getTasksByStatus('progress')).concat(getTasksByStatus('completed')).find(t => t.id === taskNumericId);
    const customTask = customTasks.find(t => t.id === taskNumericId);
    const currentTask = centralizedTask || customTask;
    
    if (currentTask) {
      const updatedCollaborators = currentTask.collaborators?.filter((_, index) => index !== collaboratorIndex) || [];
      updateTaskById(taskNumericId, { collaborators: updatedCollaborators });
    }
    console.log(`Removed collaborator ${collaboratorIndex} from task ${taskId}`);
  }, [customTasks, updateTaskById]);

  return {
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator
  };
};
