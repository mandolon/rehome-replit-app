
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TaskDetail from '@/components/TaskDetail';
import { getProjectIdFromDisplayName } from '@/utils/projectMapping';
import { useTaskContext } from '@/contexts/TaskContext';
import { useUser } from '@/contexts/UserContext';
import { TaskUser, Task } from '@/types/task';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { canUserViewTask } from '@/utils/taskVisibility';

const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshTrigger, customTasks } = useTaskContext();
  const { currentUser } = useUser();

  const { returnTo, returnToName, returnToTab } = location.state || {};

  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // NEW: Get realtime tasks from Supabase-powered board
  const { supabaseTasks, supabaseTasksLoading } = useTaskBoard();

  useEffect(() => {
    let fetchedTask: Task | null = null;
    if (taskId) {
      // 1. First look in Supabase-powered realtime tasks (if present)
      if (supabaseTasks && supabaseTasks.length > 0) {
        fetchedTask = supabaseTasks.find(
          t => t.taskId === taskId || t.id === Number(taskId)
        ) || null;
      }
      // 2. (Legacy fallback) Try customTasks from TaskContext
      if (!fetchedTask && customTasks.length > 0) {
        const taskFromCustom = customTasks.find(
          t => t.taskId === taskId || t.id === Number(taskId)
        );
        if (taskFromCustom) {
          fetchedTask = taskFromCustom;
        }
      }
      // 3. (Optional: fallback to direct backend fetch)
      // (removed getTaskByTaskId/getTaskById which are static/legacy)
    }
    setCurrentTask(fetchedTask);
  }, [taskId, refreshTrigger, customTasks, supabaseTasks]);

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo, {
        state: {
          returnToTab: returnToTab
        }
      });
    } else {
      navigate('/tasks');
    }
  };

  const handleProjectClick = () => {
    if (currentTask?.project) {
      const projectId = getProjectIdFromDisplayName(currentTask.project);
      if (projectId) {
        navigate(`/project/${projectId}`);
      }
    }
  };

  // NEW: After delete, always return to tasks page
  const handleDeleted = () => {
    navigate('/tasks');
  };

  // Unified Authorization (uses taskVisibility helper now!)
  const isCurrentUserTaskViewer = React.useMemo(() => {
    if (!currentTask || !currentUser) return false;
    const check = canUserViewTask(currentTask, currentUser);
    if (!check.allowed) {
      console.log('Access denied:', {
        reason: check.reason,
        currentUser,
        assignee: currentTask.assignee,
        collaborators: currentTask.collaborators,
        createdBy: currentTask.createdBy
      });
    } else {
      console.log('Access allowed:', check.reason);
    }
    return check.allowed;
  }, [currentTask, currentUser]);

  // Improved loading/error UI
  if (supabaseTasksLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Loading task...</h2>
            <p className="text-muted-foreground">If this persists, the task may not exist.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentTask) {
    // Not found after loading is done
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Task Not Found</h2>
            <p className="text-muted-foreground">This task does not exist or has been removed.</p>
            <button
              onClick={handleBack}
              className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isCurrentUserTaskViewer) {
    // Access denied state
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto">
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You are not assigned to this task and cannot view the details or participate in activity.</p>
            <button
              onClick={handleBack}
              className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0 pl-4 pr-4">
          <TaskDetail 
            isOpen={true} 
            onClose={handleBack}
            onProjectClick={handleProjectClick}
            task={currentTask}
            onDeleted={handleDeleted} // <--- ADDED
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskDetailPage;

