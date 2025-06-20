import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';
import { fetchAllTasksIncludingDeleted, updateTask, permanentDeleteTask } from '@/data/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/task';
import { useNavigate } from 'react-router-dom';

const TrashTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [restoringIds, setRestoringIds] = useState<string[]>([]);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [optimisticallyRestored, setOptimisticallyRestored] = useState<string[]>([]);
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<string[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all tasks including deleted ones with direct API call
  const { data: allTasks = [], isLoading: loading } = useQuery({
    queryKey: ['api-tasks-all'],
    queryFn: async () => {
      const response = await fetch('/api/tasks/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Mutation for restoring tasks with direct API call
  const restoreTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks-all'] });
    },
  });

  // Mutation for permanently deleting tasks with direct API call
  const permanentDeleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}/permanent`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks-all'] });
    },
  });

  const deletedTasks = useMemo(() => {
    return allTasks.filter(
      (task: Task) => !!task.deletedAt && 
        !optimisticallyRestored.includes(task.id?.toString() ?? '') &&
        !optimisticallyDeleted.includes(task.id?.toString() ?? '')
    );
  }, [allTasks, optimisticallyRestored, optimisticallyDeleted]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return deletedTasks;
    return deletedTasks.filter((task: Task) =>
      (task.title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (task.project?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (task.taskId?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );
  }, [deletedTasks, searchQuery]);

  const handleRestore = async (taskId: string) => {
    setRestoringIds((prev) => [...prev, taskId.toString()]);
    const task = allTasks.find((t: Task) => t.id?.toString() === taskId.toString());

    if (!task) {
      console.error("[TrashTab] Restore failed: Task not found.", { taskId });
      setRestoringIds((prev) => prev.filter(id => id !== taskId.toString()));
      return;
    }

    try {
      await restoreTaskMutation.mutateAsync({
        taskId: task.taskId,
        updates: { deletedAt: null, deletedBy: null }
      });
      
      setOptimisticallyRestored((prev) => [...prev, taskId.toString()]);

      toast({
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}has been restored.{" "}
            <button
              type="button"
              className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        duration: 3500,
      });
    } catch (e) {
      console.error('Error restoring task:', e);
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}restore failed.{" "}
            <button
              type="button"
              className="font-bold underline text-red-200 hover:text-red-100 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        variant: 'destructive' 
      });
    } finally {
      setRestoringIds((prev) => prev.filter(id => id !== taskId.toString()));
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    const task = allTasks.find((t: Task) => t.id?.toString() === taskId.toString());
    if (!task) return;

    try {
      // Optimistically remove from UI
      setOptimisticallyDeleted(prev => [...prev, taskId.toString()]);
      
      await permanentDeleteMutation.mutateAsync(task.taskId);
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}permanently deleted.{" "}
            <button
              type="button"
              className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        duration: 3000 
      });
    } catch (e) {
      // Revert optimistic update on error
      setOptimisticallyDeleted(prev => prev.filter(id => id !== taskId.toString()));
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}deletion failed.{" "}
            <button
              type="button"
              className="font-bold underline text-red-200 hover:text-red-100 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        variant: 'destructive' 
      });
    }
  };

  const handleEmptyTrash = async () => {
    if (deletedTasks.length === 0) return;
    
    setEmptyingTrash(true);
    const taskIds = deletedTasks.map((t: Task) => t.id?.toString() ?? '');
    
    try {
      // Optimistically remove all tasks from UI
      setOptimisticallyDeleted(prev => [...prev, ...taskIds]);
      
      // Delete all tasks
      const promises = deletedTasks.map((task: Task) => permanentDeleteMutation.mutateAsync(task.taskId));
      await Promise.all(promises);
      
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}trash has been emptied.{" "}
            <button
              type="button"
              className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        duration: 3000 
      });
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticallyDeleted(prev => prev.filter(id => !taskIds.includes(id)));
      console.error('Error emptying trash:', error);
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Task</span>
            {" "}trash emptying failed.{" "}
            <button
              type="button"
              className="font-bold underline text-red-200 hover:text-red-100 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to tasks
            </button>
          </span>
        ),
        variant: 'destructive' 
      });
    } finally {
      setEmptyingTrash(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deleted tasks..." className="pl-8" disabled />
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading deleted tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deleted tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {deletedTasks.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmptyTrash}
            disabled={emptyingTrash}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {emptyingTrash ? 'Emptying...' : 'Empty Trash'}
          </Button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <Trash2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            {searchQuery ? 'No deleted tasks match your search.' : 'Trash is empty.'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task: Task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{task.title}</div>
                <div className="text-xs text-muted-foreground">
                  {task.project && `${task.project} • `}
                  Deleted {task.deletedAt ? formatDate(task.deletedAt) : 'recently'}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(task.id?.toString() ?? '')}
                  disabled={restoringIds.includes(task.id?.toString() ?? '')}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {restoringIds.includes(task.id?.toString() ?? '') ? 'Restoring...' : 'Restore'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePermanentDelete(task.id?.toString() ?? '')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Forever
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashTab;