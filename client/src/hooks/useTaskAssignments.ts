
import { useState, useCallback } from "react";
import { updateTaskAPI } from "@/data/taskAPI";
import { Task, TaskUser } from "@/lib/schemas/task";

/**
 * Provides assignment/collab actions for API-backed tasks.
 * Accepts latest Task + state setter for optimistic UI.
 */
export function useTaskAssignments(
  task: Task,
  setTask: (task: Task) => void
) {
  // Optimistic/local update helper
  const optimisticUpdate = (updates: Partial<Task>) => {
    setTask({ ...task, ...updates, updatedAt: new Date().toISOString() });
  };

  const assignPerson = useCallback(
    async (taskId: string, person: TaskUser) => {
      if (!taskId) return;
      optimisticUpdate({ assignee: person });
      try {
        const updated = await updateTaskAPI(taskId, { assignee: person });
        setTask(updated);
        console.log("[API] Assigned", person, "to", taskId);
      } catch (e) {
        console.error("Failed to assign person:", e);
      }
    },
    [task, setTask]
  );

  const removeAssignee = useCallback(
    async (taskId: string) => {
      optimisticUpdate({ assignee: null });
      try {
        const updated = await updateTaskAPI(taskId, { assignee: null });
        setTask(updated);
        console.log("[API] Removed assignee from", taskId);
      } catch (e) {
        console.error("Failed to remove assignee:", e);
      }
    },
    [task, setTask]
  );

  const addCollaborator = useCallback(
    async (taskId: string, person: TaskUser) => {
      const collabs = Array.isArray(task.collaborators) ? [...task.collaborators] : [];
      // Don't add duplicates
      if (collabs.some(c => c.name === person.name)) return;
      const updatedCollabs = [...collabs, person];
      optimisticUpdate({ collaborators: updatedCollabs });
      try {
        const updated = await updateTaskAPI(taskId, { collaborators: updatedCollabs });
        setTask(updated);
        console.log("[API] Added collaborator", person, "to", taskId);
      } catch (e) {
        console.error("Failed to add collaborator:", e);
      }
    },
    [task, setTask]
  );

  const removeCollaborator = useCallback(
    async (taskId: string, collaboratorIndex: number) => {
      const collabs = Array.isArray(task.collaborators) ? [...task.collaborators] : [];
      if (collaboratorIndex < 0 || collaboratorIndex >= collabs.length) return;
      const updatedCollabs = collabs.filter((_, i) => i !== collaboratorIndex);
      optimisticUpdate({ collaborators: updatedCollabs });
      try {
        const updated = await updateTaskAPI(taskId, { collaborators: updatedCollabs });
        setTask(updated);
        console.log("[API] Removed collaborator index", collaboratorIndex, "from", taskId);
      } catch (e) {
        console.error("Failed to remove collaborator:", e);
      }
    },
    [task, setTask]
  );

  return {
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator,
  };
}
