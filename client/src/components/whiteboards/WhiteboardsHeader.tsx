
import React from 'react';
import { Grid, List, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhiteboardsHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}

const WhiteboardsHeader = ({ 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortByChange 
}: WhiteboardsHeaderProps) => {
  const tabs = [
    { id: 'recent', label: 'Recently viewed', active: true },
    { id: 'shared-files', label: 'Shared files', active: false },
    { id: 'shared-projects', label: 'Shared projects', active: false },
  ];

  const handleCreateWhiteboard = () => {
    console.log('Create new whiteboard');
    // TODO: Implement create whiteboard functionality
  };

  return (
    <div className="border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Recents</h1>
          <button 
            onClick={handleCreateWhiteboard}
            className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth="2" />
            <span>Create New Whiteboard</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  tab.active
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">All files</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                  {sortBy}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSortByChange('Last viewed')}>
                  Last viewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortByChange('Last modified')}>
                  Last modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortByChange('Name')}>
                  Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border rounded">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardsHeader;
