import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Trash2, FileText, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/task';
import { useNavigate } from 'react-router-dom';

interface TrashItem {
  id: string;
  itemType: 'task' | 'note' | 'project';
  itemId: string;
  title: string;
  description?: string;
  metadata?: any;
  deletedBy: string;
  deletedAt: string;
  originalData: any;
}

const TrashTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [restoringIds, setRestoringIds] = useState<string[]>([]);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [optimisticallyRestored, setOptimisticallyRestored] = useState<string[]>([]);
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<string[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all trash items with direct API call
  const { data: allTrashItems = [], isLoading: loading } = useQuery({
    queryKey: ['api-trash-items'],
    queryFn: async () => {
      const response = await fetch('/api/trash');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Direct API restore function
  const restoreTrashItem = async (trashItemId: string) => {
    const response = await fetch(`/api/trash/${trashItemId}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // Direct API permanent delete function
  const permanentDeleteTrashItem = async (trashItemId: string) => {
    const response = await fetch(`/api/trash/${trashItemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return trashItemId;
  };

  const visibleTrashItems = useMemo(() => {
    return allTrashItems.filter(
      (item: TrashItem) => 
        !optimisticallyRestored.includes(item.id) &&
        !optimisticallyDeleted.includes(item.id)
    );
  }, [allTrashItems, optimisticallyRestored, optimisticallyDeleted]);

  const filteredTrashItems = useMemo(() => {
    if (!searchQuery.trim()) return visibleTrashItems;
    return visibleTrashItems.filter((item: TrashItem) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visibleTrashItems, searchQuery]);

  const handleRestore = async (trashItemId: string) => {
    setRestoringIds((prev) => [...prev, trashItemId]);
    const trashItem = allTrashItems.find((item: TrashItem) => item.id === trashItemId);

    if (!trashItem) {
      console.error("[TrashTab] Restore failed: Trash item not found.", { trashItemId });
      setRestoringIds((prev) => prev.filter(id => id !== trashItemId));
      return;
    }

    try {
      await restoreTrashItem(trashItemId);
      
      // Refresh trash items and related data
      queryClient.invalidateQueries({ queryKey: ['api-trash-items'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      
      setOptimisticallyRestored((prev) => [...prev, trashItemId]);

      toast({
        description: (
          <span>
            <span className="font-semibold">{trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'}</span>
            {" "}has been restored.{" "}
            <button
              type="button"
              className="font-bold underline text-blue-700 hover:text-blue-600 transition-colors"
              tabIndex={0}
              onClick={() => {
                navigate('/tasks');
              }}
            >
              Go to {trashItem.itemType === 'task' ? 'tasks' : trashItem.itemType === 'project' ? 'projects' : 'notes'}
            </button>
          </span>
        ),
        duration: 3500,
      });
    } catch (e) {
      console.error('Error restoring item:', e);
      toast({ 
        description: (
          <span>
            <span className="font-semibold">{trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'}</span>
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
      setRestoringIds((prev) => prev.filter(id => id !== trashItemId));
    }
  };

  const handlePermanentDelete = async (trashItemId: string) => {
    const trashItem = allTrashItems.find((item: TrashItem) => item.id === trashItemId);
    if (!trashItem) return;

    try {
      // Optimistically remove from UI
      setOptimisticallyDeleted(prev => [...prev, trashItemId]);
      
      await permanentDeleteTrashItem(trashItemId);
      
      // Refresh trash items and related data
      queryClient.invalidateQueries({ queryKey: ['api-trash-items'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      toast({ 
        description: (
          <span>
            <span className="font-semibold">{trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'}</span>
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
      setOptimisticallyDeleted(prev => prev.filter(id => id !== trashItemId));
      toast({ 
        description: (
          <span>
            <span className="font-semibold">{trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'}</span>
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
    if (visibleTrashItems.length === 0) return;
    
    setEmptyingTrash(true);
    const trashItemIds = visibleTrashItems.map((item: TrashItem) => item.id);
    
    try {
      // Optimistically remove all items from UI
      setOptimisticallyDeleted(prev => [...prev, ...trashItemIds]);
      
      // Empty all trash items via API
      const response = await fetch('/api/trash', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to empty trash');
      }
      
      // Refresh trash items and related data
      queryClient.invalidateQueries({ queryKey: ['api-trash-items'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Trash</span>
            {" "}has been emptied.{" "}
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
      setOptimisticallyDeleted(prev => prev.filter(id => !trashItemIds.includes(id)));
      console.error('Error emptying trash:', error);
      toast({ 
        description: (
          <span>
            <span className="font-semibold">Trash</span>
            {" "}emptying failed.{" "}
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

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'task':
        return <Trash2 className="w-4 h-4 text-muted-foreground" />;
      case 'project':
        return <FolderOpen className="w-4 h-4 text-muted-foreground" />;
      case 'note':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Trash2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deleted tasks..." className="pl-8" disabled />
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading deleted tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trash items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {visibleTrashItems.length > 0 && (
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

      {filteredTrashItems.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            {searchQuery ? 'No deleted items match your search.' : 'Trash is empty.'}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            <div className="col-span-1">Type</div>
            <div className="col-span-1">ID</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Deleted Date</div>
            <div className="col-span-3">Actions</div>
          </div>
          
          {/* Table Rows */}
          {filteredTrashItems.map((item: TrashItem) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-accent/50 rounded-lg transition-colors group border-b border-border/50 last:border-b-0"
            >
              <div className="col-span-1 flex items-center">
                {getItemIcon(item.itemType)}
              </div>
              <div className="col-span-1">
                <span className="font-medium text-foreground text-sm">{item.itemId}</span>
              </div>
              <div className="col-span-4">
                <div className="font-medium text-sm text-foreground truncate">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                )}
              </div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {formatDate(item.deletedAt)}
              </div>
              <div className="col-span-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(item.id)}
                  disabled={restoringIds.includes(item.id)}
                  className="text-xs h-8 px-3"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {restoringIds.includes(item.id) ? 'Restoring...' : 'Restore'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePermanentDelete(item.id)}
                  className="text-xs h-8 px-3 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
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