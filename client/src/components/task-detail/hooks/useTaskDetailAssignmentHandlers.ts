
import { useSupabaseTaskAssignments } from '@/hooks/useSupabaseTaskAssignments';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';

/**
 * Keeps all assignment/collaborator handler logic together for reuse.
 * Returns the full handler set. Supply `task` (local state) and `setTask`.
 */
export function useTaskDetailAssignmentHandlers(task: Task, setTask: (t: Task) => void) {
  const {
    assignPerson: legacyAssignPerson,
    removeAssignee: legacyRemoveAssignee,
    addCollaborator: legacyAddCollaborator,
    removeCollaborator: legacyRemoveCollaborator,
  } = useTaskContext();

  // Are we supabase-backed?
  const isSupabaseTask = !!task.taskId && !!task.updatedAt;
  const supabaseHandlers = useSupabaseTaskAssignments(task, setTask);

  // Handler selection
  const handlerSet = isSupabaseTask ? supabaseHandlers : {
    assignPerson: legacyAssignPerson,
    removeAssignee: legacyRemoveAssignee,
    addCollaborator: legacyAddCollaborator,
    removeCollaborator: legacyRemoveCollaborator,
  };

  const handleAssignPerson = (taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    handlerSet.assignPerson(taskId, person);
  };
  const handleRemoveAssignee = (taskId: string) => {
    handlerSet.removeAssignee(taskId);
  };
  const handleAddCollaborator = (taskId: string, person: { name: string; avatar: string; fullName?: string }) => {
    if (handlerSet.addCollaborator) handlerSet.addCollaborator(taskId, person);
  };
  const handleRemoveCollaborator = (taskId: string, idx: number) => {
    if (handlerSet.removeCollaborator) handlerSet.removeCollaborator(taskId, idx);
  };

  return {
    handleAssignPerson,
    handleRemoveAssignee,
    handleAddCollaborator,
    handleRemoveCollaborator,
    isSupabaseTask,
  };
}
