
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TaskDetail from '@/components/TaskDetail';
import { getProjectIdFromDisplayName } from '@/utils/projectMapping';
import { useTaskContext } from '@/contexts/TaskContext';
import { useUser } from '@/contexts/UserContext';
import { Task } from '@/lib/schemas/task';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { canUserViewTask } from '@/utils/taskVisibility';
import { taskService } from '@/lib/services/tasks';

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
    // Clear current task immediately when taskId changes to prevent stale data
    setCurrentTask(null);
    
    let fetchedTask: Task | null = null;
    if (taskId) {
      // 1. First look in tasks from TaskBoard hook (if present)
      if (supabaseTasks && supabaseTasks.length > 0) {
        fetchedTask = supabaseTasks.find(
          t => t.taskId === taskId || t.id === Number(taskId)
        ) || null;
      }
      // 2. If not found, try to fetch directly from service
      if (!fetchedTask) {
        taskService.getTaskById(taskId).then(task => {
          if (task) {
            setCurrentTask(task);
          }
        });
        return;
      }
      // 3. (Legacy fallback) Try customTasks from TaskContext
      if (!fetchedTask && customTasks.length > 0) {
        const taskFromCustom = customTasks.find(
          t => t.taskId === taskId || t.id === Number(taskId)
        );
        if (taskFromCustom) {
          fetchedTask = taskFromCustom;
        }
      }
    }
    
    // Set the task in the next tick to ensure state update
    setTimeout(() => {
      setCurrentTask(fetchedTask);
    }, 0);
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading task...</h2>
          <p className="text-muted-foreground">If this persists, the task may not exist.</p>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    // Not found after loading is done
    return (
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
    );
  }

  if (!isCurrentUserTaskViewer) {
    // Access denied state
    return (
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
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskDetail 
          isOpen={true} 
          onClose={handleBack}
          onProjectClick={handleProjectClick}
          task={currentTask}
          onDeleted={handleDeleted}
        />
      </div>
    </div>
  );
};

export default TaskDetailPage;

