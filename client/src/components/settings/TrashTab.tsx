import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Trash2, FileText, FolderOpen, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTrashToast } from '@/components/ui/unified-toast';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/schemas/task';
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
  const { itemRestored, itemDeleted, trashEmptied } = useTrashToast();
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: TrashItem) =>
        item.title.toLowerCase().includes(query) ||
        item.itemId.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Sort items
    filtered.sort((a: TrashItem, b: TrashItem) => {
      let aValue, bValue;

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
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [visibleTrashItems, selectedItemType, searchQuery, sortBy, sortDirection]);

  const itemTypeCounts = useMemo(() => {
    const counts = {
      all: visibleTrashItems.length,
      task: 0,
      project: 0,
      note: 0
    };

    visibleTrashItems.forEach((item: TrashItem) => {
      if (item.itemType === 'task') counts.task++;
      else if (item.itemType === 'project') counts.project++;
      else if (item.itemType === 'note') counts.note++;
    });

    return counts;
  }, [visibleTrashItems]);

  const handleRestore = async (trashItemId: string) => {
    const trashItem = allTrashItems.find((item: TrashItem) => item.id === trashItemId);
    if (!trashItem) return;

    try {
      setRestoringIds((prev) => [...prev, trashItemId]);
      
      // Optimistically remove from UI
      setOptimisticallyRestored(prev => [...prev, trashItemId]);
      
      await restoreTrashItem(trashItemId);
      
      // Refresh related data
      queryClient.invalidateQueries({ queryKey: ['api-trash-items'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      itemRestored(trashItem.itemType as 'task' | 'project' | 'note', trashItem.title);
    } catch (e) {
      console.error('Error restoring item:', e);
      toast({
        description: `${trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'} "${trashItem.title}" restore failed.`,
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
      itemDeleted(trashItem.itemType as 'task' | 'project' | 'note', trashItem.title);
    } catch (e) {
      // Revert optimistic update on error
      setOptimisticallyDeleted(prev => prev.filter(id => id !== trashItemId));
      toast({
        description: `${trashItem.itemType === 'task' ? 'Task' : trashItem.itemType === 'project' ? 'Project' : 'Note'} "${trashItem.title}" deletion failed.`,
        variant: 'destructive'
      });
    }
  };

  const handleEmptyTrash = async () => {
    if (visibleTrashItems.length === 0) return;
    
    const trashItemIds = visibleTrashItems.map((item: TrashItem) => item.id);
    
    try {
      setEmptyingTrash(true);
      
      // Optimistically remove all items from UI
      setOptimisticallyDeleted(prev => [...prev, ...trashItemIds]);
      
      const response = await fetch('/api/trash', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to empty trash');
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['api-trash-items'] });
      queryClient.invalidateQueries({ queryKey: ['api-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      
      trashEmptied();
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticallyDeleted(prev => prev.filter(id => !trashItemIds.includes(id)));
      console.error('Error emptying trash:', error);
      toast({
        description: "Trash emptying failed.",
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
        <div className="border-b border-border px-4 py-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Trash</h2>
              <p className="text-xs text-muted-foreground">Deleted items from your workspace</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 pr-2">Filter by:</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search deleted items..."
                  disabled
                  className="pl-7 pr-3 py-1 h-7 text-xs w-48"
                />
              </div>
            </div>
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
      <div className="border-b border-border px-4 py-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Trash</h2>
            <p className="text-xs text-muted-foreground">Deleted items from your workspace</p>
          </div>
          {visibleTrashItems.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmptyTrash}
              disabled={emptyingTrash}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {emptyingTrash ? 'Emptying...' : 'Empty Trash'}
            </Button>
          )}
        </div>
      </div>

      {/* Filters Section - matching task board filters */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 pr-2">Filter by:</span>
          
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
              className="h-7 px-2 text-xs"
            >
              {filter.label} ({filter.count})
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
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
          
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search deleted items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 h-7 text-xs w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-auto">
        {filteredTrashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Trash2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              {searchQuery ? 'No deleted items match your search.' : 'Trash is empty.'}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 pb-4 min-h-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border transition-colors hover:bg-accent/50 group">
                  <TableHead className="text-muted-foreground font-medium text-xs py-1 h-8 align-baseline w-[8%] pl-6 transition-colors group-hover:bg-accent/50">
                    Type
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1 h-8 align-baseline w-[12%] transition-colors group-hover:bg-accent/50">
                    ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1 h-8 align-baseline w-[40%] transition-colors group-hover:bg-accent/50">
                    Title
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1 h-8 align-baseline w-[20%] transition-colors group-hover:bg-accent/50">
                    Deleted Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs py-1 h-8 align-baseline w-[20%] transition-colors group-hover:bg-accent/50">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrashItems.map((item: TrashItem) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-accent/50 group cursor-pointer h-12"
                  >
                    <TableCell className="py-2 pl-6">
                      <div className="flex items-center gap-2">
                        {getItemIcon(item.itemType)}
                        <Badge variant="secondary" className={`px-1.5 py-0.5 text-xs font-medium ${getItemTypeColor(item.itemType)}`}>
                          {getItemTypeLabel(item.itemType)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="font-medium text-foreground text-xs">{item.itemId}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-foreground truncate">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                          )}
                          {getItemContext(item) && (
                            <div className="text-xs text-muted-foreground truncate">{getItemContext(item)}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.deletedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(item.id)}
                          disabled={restoringIds.includes(item.id)}
                          className="h-6 px-2 text-xs"
                        >
                          {restoringIds.includes(item.id) ? (
                            'Restoring...'
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Restore
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermanentDelete(item.id)}
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
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