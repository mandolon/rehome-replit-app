import React, { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';
import { taskApi } from '@/api/tasks';
import { Task } from '@/types/task';
import { useNavigate } from 'react-router-dom';

const TrashTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [restoringIds, setRestoringIds] = useState<string[]>([]);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [optimisticallyRestored, setOptimisticallyRestored] = useState<string[]>([]);
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<string[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load all tasks including deleted ones
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskApi.getAllTasks();
      setAllTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({ 
        description: 'Failed to load tasks',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTasks();
  }, []);

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
      await taskApi.restoreTask(task.taskId);
      
      // Refresh the task list
      await loadAllTasks();
      
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
      
      await taskApi.permanentDeleteTask(task.taskId);
      
      // Refresh the task list
      await loadAllTasks();
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
      const promises = deletedTasks.map((task: Task) => taskApi.permanentDeleteTask(task.taskId));
      await Promise.all(promises);
      
      // Refresh the task list
      await loadAllTasks();
      
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