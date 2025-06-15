
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskGroup, TaskUser } from '@/types/task';
import { useUser } from '@/contexts/UserContext';
import { useRealtimeTasks } from './useRealtimeTasks';
import { insertTask, updateTaskSupabase, deleteTaskSupabase } from '@/data/taskSupabase';
import { nanoid } from "nanoid";

// New: helper to deep copy and update list
function updateTaskInList(tasks: Task[], taskId: string, updater: (t: Task) => Task) {
  return tasks.map(t => t.taskId === taskId ? updater(t) : t);
}

export const useTaskBoard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { tasks, setTasks, loading } = useRealtimeTasks();

  // Dialog/quick add state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Supabase powered task groups
  const getTaskGroups = (): TaskGroup[] => {
    const centralizedRedline = tasks.filter(task => task.status === 'redline' && !task.archived && !task.deletedAt);
    const centralizedProgress = tasks.filter(task => task.status === 'progress' && !task.archived && !task.deletedAt);
    const centralizedCompleted = tasks.filter(task => task.status === 'completed' && !task.archived && !task.deletedAt);

    const taskGroups: TaskGroup[] = [
      {
        title: "TASK/ REDLINE",
        count: centralizedRedline.length,
        color: "bg-red-500",
        status: "redline",
        tasks: centralizedRedline
      },
      {
        title: "PROGRESS/ UPDATE",
        count: centralizedProgress.length,
        color: "bg-blue-500",
        status: "progress",
        tasks: centralizedProgress
      },
      {
        title: "COMPLETED",
        count: centralizedCompleted.length,
        color: "bg-green-500",
        status: "completed",
        tasks: centralizedCompleted
      }
    ];
    return taskGroups;
  };

  // Generate a new taskId for every task insert
  const generateTaskId = () => "T" + Math.floor(Math.random() * 100000).toString().padStart(4, "0");

  // --- No more optimistic update! Only insert, let realtime pull in
  const handleCreateTask = useCallback(
    async (newTask: any) => {
      const taskId = newTask.taskId ?? generateTaskId();
      await insertTask({
        ...newTask,
        taskId,
        createdBy: currentUser?.name ?? currentUser?.email ?? "Unknown",
      });
      setIsTaskDialogOpen(false);
    },
    [currentUser]
  );

  const handleQuickAddSave = useCallback(
    async (taskData: any) => {
      const taskId = taskData.taskId ?? generateTaskId();
      await insertTask({
        ...taskData,
        taskId,
        createdBy: currentUser?.name ?? currentUser?.email ?? "Unknown",
      });
      setShowQuickAdd(null);
    },
    [currentUser]
  );

  const handleTaskClick = (task: Task) => {
    navigate(`/task/${task.taskId}`);
  };

  const handleTaskArchive = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTaskSupabase(task.taskId, { archived: true });
    }
  };

  const handleTaskDeleted = async (taskId: string) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      await deleteTaskSupabase(task.taskId);
    }
  };

  // ------------- NEW ASSIGN PERSON (and collaborators) HANDLERS FOR SUPABASE --------------
  // For consistent types, all handlers use .taskId as string

  const assignPerson = async (taskId: string, person: TaskUser) => {
    // Assign main assignee, set .assignee field to person, leave collaborators unchanged
    await updateTaskSupabase(taskId, { assignee: person });
    // Let real-time pull updated row
  };
  const removeAssignee = async (taskId: string) => {
    await updateTaskSupabase(taskId, { assignee: null });
  };
  const addCollaborator = async (taskId: string, person: TaskUser) => {
    const task = tasks.find(t => t.taskId === taskId);
    const collabs = (task?.collaborators ?? []).slice();
    if (!collabs.find(c => c.id === person.id)) {
      collabs.push(person);
    }
    await updateTaskSupabase(taskId, { collaborators: collabs });
  };
  const removeCollaborator = async (taskId: string, collaboratorIndex: number) => {
    const task = tasks.find(t => t.taskId === taskId);
    const collabs = (task?.collaborators ?? []).slice();
    collabs.splice(collaboratorIndex, 1);
    await updateTaskSupabase(taskId, { collaborators: collabs });
  };

  return {
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    showQuickAdd,
    setShowQuickAdd,
    refreshTrigger,
    getTaskGroups,
    handleCreateTask,
    handleQuickAddSave,
    handleTaskClick,
    handleTaskArchive,
    handleTaskDeleted,
    // Assignment handlers for Supabase tasks only:
    assignPerson,
    removeAssignee,
    addCollaborator,
    removeCollaborator,
    supabaseTasks: tasks, // expose realtime tasks for detail page
    supabaseTasksLoading: loading,
  };
};
