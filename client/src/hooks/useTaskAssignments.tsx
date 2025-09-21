import { useCallback } from 'react';
import { Task } from '@/lib/schemas/task';

export function useTaskAssignments(
  getAllTasks: () => Task[],
  updateTaskById: (taskId: number, updates: Partial<Task>) => void
) {
  const assignPerson = useCallback((taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    const task = getAllTasks().find(t => t.taskId === taskId);
    if (task) {
      updateTaskById(task.id, {
        assignee: {
          id: person.name,
          name: person.name,
          avatar: person.avatar,
          fullName: person.fullName || person.name,
        }
      });
    }
  }, [getAllTasks, updateTaskById]);

  const removeAssignee = useCallback((taskId: string) => {
    const task = getAllTasks().find(t => t.taskId === taskId);
    if (task) {
      updateTaskById(task.id, {
        assignee: null,
      });
    }
  }, [getAllTasks, updateTaskById]);

  const addCollaborator = useCallback((taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    const task = getAllTasks().find(t => t.taskId === taskId);
    if (task) {
      const currentCollaborators = task.collaborators || [];
      const newCollaborator = {
        name: person.name,
        avatar: person.avatar,
        fullName: person.fullName || person.name
      };
      updateTaskById(task.id, {
        collaborators: [...currentCollaborators, newCollaborator]
      });
    }
  }, [getAllTasks, updateTaskById]);

  const removeCollaborator = useCallback((taskId: string, collaboratorIndex: number) => {
    const task = getAllTasks().find(t => t.taskId === taskId);
    if (task && task.collaborators) {
  const updatedCollaborators = task.collaborators.filter((_: any, index: number) => index !== collaboratorIndex);
      updateTaskById(task.id, {
        collaborators: updatedCollaborators
      });
    }
  }, [getAllTasks, updateTaskById]);

  return {
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator,
  };
}