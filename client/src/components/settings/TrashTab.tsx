import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Trash2, FileText, FolderOpen, Paperclip, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [selectedItemType, setSelectedItemType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deletedAt' | 'title' | 'itemType'>('deletedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
    let filtered = visibleTrashItems;

    // Filter by item type
    if (selectedItemType !== 'all') {
      filtered = filtered.filter((item: TrashItem) => item.itemType === selectedItemType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: TrashItem) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort items
    return filtered.sort((a: TrashItem, b: TrashItem) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'itemType':
          aValue = a.itemType;
          bValue = b.itemType;
          break;
        case 'deletedAt':
        default:
          aValue = new Date(a.deletedAt).getTime();
          bValue = new Date(b.deletedAt).getTime();
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [visibleTrashItems, searchQuery, selectedItemType, sortBy, sortDirection]);

  const itemTypeCounts = useMemo(() => {
    const counts = { all: 0, task: 0, project: 0, note: 0 };
    visibleTrashItems.forEach((item: TrashItem) => {
      counts.all++;
      counts[item.itemType as keyof typeof counts]++;
    });
    return counts;
  }, [visibleTrashItems]);

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
        return (
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center ring-1 ring-blue-200 dark:ring-blue-800/50">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          </div>
        );
      case 'project':
        return (
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center ring-1 ring-green-200 dark:ring-green-800/50">
            <FolderOpen className="w-3 h-3 text-green-600" />
          </div>
        );
      case 'note':
        return (
          <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center ring-1 ring-orange-200 dark:ring-orange-800/50">
            <FileText className="w-3 h-3 text-orange-600" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-900/30 rounded-md flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-800/50">
            <Trash2 className="w-3 h-3 text-gray-600" />
          </div>
        );
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      case 'note':
        return 'Note';
      default:
        return 'Item';
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'task':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50';
      case 'project':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50';
      case 'note':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/50';
    }
  };

  const getItemContext = (item: TrashItem) => {
    if (item.itemType === 'task' && item.metadata?.project) {
      return `Project: ${item.metadata.project}`;
    }
    if (item.itemType === 'project' && item.metadata?.taskCount) {
      return `${item.metadata.taskCount} tasks`;
    }
    if (item.itemType === 'note' && item.metadata?.category) {
      return `Category: ${item.metadata.category}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">Trash</h2>
              <p className="text-sm text-muted-foreground mt-1">Deleted items from your workspace</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search deleted items..." className="pl-10" disabled />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading deleted items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - matching task board style */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Trash</h2>
            <p className="text-sm text-muted-foreground mt-1">Deleted items from your workspace</p>
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
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deleted items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All Items', count: itemTypeCounts.all },
                { key: 'task', label: 'Tasks', count: itemTypeCounts.task },
                { key: 'project', label: 'Projects', count: itemTypeCounts.project },
                { key: 'note', label: 'Notes', count: itemTypeCounts.note }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={selectedItemType === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedItemType(filter.key)}
                  className="h-8 px-3 text-xs"
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
            
            <div className="h-4 w-px bg-border" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                  <ArrowUpDown className="w-3 h-3 mr-2" />
                  Sort by {sortBy === 'deletedAt' ? 'Date' : sortBy === 'itemType' ? 'Type' : 'Title'}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortBy('deletedAt'); setSortDirection('desc'); }}>
                  Date Deleted (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('deletedAt'); setSortDirection('asc'); }}>
                  Date Deleted (Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('title'); setSortDirection('asc'); }}>
                  Title (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('title'); setSortDirection('desc'); }}>
                  Title (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('itemType'); setSortDirection('asc'); }}>
                  Type (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-hidden">
        {filteredTrashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Trash2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              {searchQuery ? 'No deleted items match your search.' : 'Trash is empty.'}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border transition-colors hover:bg-accent/50 group">
                  <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[8%] pl-8 transition-colors group-hover:bg-accent/50">
                    Type
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[12%] transition-colors group-hover:bg-accent/50">
                    ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[40%] transition-colors group-hover:bg-accent/50">
                    Title
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[20%] transition-colors group-hover:bg-accent/50">
                    Deleted Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[20%] transition-colors group-hover:bg-accent/50">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrashItems.map((item: TrashItem) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-accent/50 group cursor-pointer"
                  >
                    <TableCell className="py-3 pl-8">
                      <div className="flex items-center gap-3">
                        {getItemIcon(item.itemType)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getItemTypeColor(item.itemType)}`}>
                          {getItemTypeLabel(item.itemType)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-foreground text-sm">{item.itemId}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</div>
                          )}
                          {getItemContext(item) && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5 italic">
                              {getItemContext(item)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm text-muted-foreground">{formatDate(item.deletedAt)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(item.id);
                          }}
                          disabled={restoringIds.includes(item.id)}
                          className="text-xs h-7 px-2 hover:bg-accent/80"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {restoringIds.includes(item.id) ? 'Restoring...' : 'Restore'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(item.id);
                          }}
                          className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete Forever
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashTab;