
import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';
import { restoreTask, softDeleteTask } from '@/data/taskHelpers';
import { updateTaskSupabase, deleteTaskSupabase, fetchAllTasks } from '@/data/taskSupabase';
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks';
import { useNavigate } from 'react-router-dom';

const TrashTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [restoringIds, setRestoringIds] = useState<string[]>([]);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const { tasks: allTasks, loading } = useRealtimeTasks();
  const [optimisticallyRestored, setOptimisticallyRestored] = useState<string[]>([]);
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<string[]>([]);
  const navigate = useNavigate();

  const deletedTasks = useMemo(() => {
    return (allTasks ?? []).filter(
      task => !!task.deletedAt && 
        !optimisticallyRestored.includes(task.id?.toString() ?? '') &&
        !optimisticallyDeleted.includes(task.id?.toString() ?? '')
    );
  }, [allTasks, optimisticallyRestored, optimisticallyDeleted]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return deletedTasks;
    return deletedTasks.filter(task =>
      (task.title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (task.project?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (task.taskId?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );
  }, [deletedTasks, searchQuery]);

  // Fix logic: Supabase task is true if taskId matches expected format and id is a number
  function isSupabaseTask(task) {
    // A Supabase task will have a taskId as "T####" and a numeric id (not legacy weird combos)
    return typeof task.taskId === "string" && /^T\d+/.test(task.taskId) && typeof task.id === "number";
  }

  const handleRestore = async (taskId) => {
    setRestoringIds((prev) => [...prev, taskId.toString()]);
    const task = allTasks.find(t => t.id === taskId);

    if (!task) {
      console.error("[TrashTab] Restore failed: Task not found.", { taskId });
      setRestoringIds((prev) => prev.filter(id => id !== taskId.toString()));
      return;
    }

    if (isSupabaseTask(task)) {
      console.log("[TrashTab] Restoring SUPABASE task via updateTaskSupabase", task);
      try {
        const result = await updateTaskSupabase(task.taskId, { deletedAt: null, deletedBy: null });
        setOptimisticallyRestored((prev) => [...prev, taskId.toString()]);

        toast({
          title: 'Task Restored',
          description: (
            <span>
              Task has been restored.&nbsp;
              <Button
                variant="link"
                size="sm"
                className="pl-1 pr-2 py-0.5 h-7"
                onClick={() => navigate('/tasks')}
              >
                Go to Tasks
              </Button>
            </span>
          ),
          duration: 3500,
        });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to restore task.', variant: 'destructive' });
      } finally {
        setRestoringIds((prev) => prev.filter(id => id !== taskId.toString()));
      }
    } else {
      console.log("[TrashTab] Restoring LEGACY task via restoreTask", task);
      try {
        restoreTask(taskId);
        setOptimisticallyRestored((prev) => [...prev, taskId.toString()]);
        toast({
          title: 'Task Restored',
          description: (
            <span>
              Legacy task has been restored.&nbsp;
              <Button
                variant="link"
                size="sm"
                className="pl-1 pr-2 py-0.5 h-7"
                onClick={() => navigate('/tasks')}
              >
                Go to Tasks
              </Button>
            </span>
          ),
          duration: 3500,
        });
      } catch (e) {
        console.error("[TrashTab] Error restoring legacy task", e);
      } finally {
        setRestoringIds((prev) => prev.filter(id => id !== taskId.toString()));
      }
    }
  };

  const handlePermanentDelete = async (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    if (isSupabaseTask(task)) {
      try {
        // Optimistically remove from UI
        setOptimisticallyDeleted(prev => [...prev, taskId.toString()]);
        
        await deleteTaskSupabase(task.taskId);
        toast({ title: 'Task permanently deleted', description: '', duration: 3000 });
      } catch (e) {
        // Revert optimistic update on error
        setOptimisticallyDeleted(prev => prev.filter(id => id !== taskId.toString()));
        toast({ title: 'Error', description: 'Could not permanently delete.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Legacy tasks cannot be permanently deleted in demo.', description: '', variant: 'destructive' });
    }
  };

  const handleEmptyTrash = async () => {
    if (deletedTasks.length === 0) return;
    
    setEmptyingTrash(true);
    const supabaseTasks = deletedTasks.filter(isSupabaseTask);
    const taskIds = supabaseTasks.map(t => t.id.toString());
    
    try {
      // Optimistically remove all tasks from UI
      setOptimisticallyDeleted(prev => [...prev, ...taskIds]);
      
      // Delete all Supabase tasks
      const promises = supabaseTasks.map(task => deleteTaskSupabase(task.taskId));
      await Promise.all(promises);
      
      toast({ 
        title: 'Trash emptied', 
        description: `${supabaseTasks.length} task(s) permanently deleted.`, 
        duration: 3000 
      });
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticallyDeleted(prev => prev.filter(id => !taskIds.includes(id)));
      console.error('Error emptying trash:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to empty trash completely.', 
        variant: 'destructive' 
      });
    } finally {
      setEmptyingTrash(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Trash</h2>
          <p className="text-sm text-muted-foreground">
            Items shown below will be automatically deleted forever after 30 days.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search deleted tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Actions */}
        {deletedTasks.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => deletedTasks.forEach((task) => handleRestore(task.id))}
              disabled={restoringIds.length > 0 || emptyingTrash}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore all
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleEmptyTrash}
              disabled={emptyingTrash || restoringIds.length > 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {emptyingTrash ? 'Emptying...' : 'Empty trash'}
            </Button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div>Loading…</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery ? 'No items found for your search' : 'No deleted items'}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-2 border-b">
              <div className="col-span-5">Task</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">Deleted</div>
              <div className="col-span-2">Deleted by</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            {/* Task Rows */}
            {filteredTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-3 text-xs py-3 hover:bg-accent/50 rounded border-b border-border/30">
                <div className="col-span-5">
                  <div className="font-medium">{task.taskId} - {task.title}</div>
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {task.project}
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {task.deletedAt ? formatDate(task.deletedAt) : '—'}
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {task.deletedBy || '—'}
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(task.id)}
                    className="h-6 px-2"
                    disabled={restoringIds.includes(task.id?.toString() ?? '') || emptyingTrash}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePermanentDelete(task.id)}
                    className="h-6 px-2 text-red-500 hover:text-red-700"
                    disabled={emptyingTrash || restoringIds.length > 0}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashTab;
