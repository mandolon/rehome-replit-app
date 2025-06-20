import React from 'react';
import { Search, Plus, Filter, Grid3X3, List, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkRecordsHeaderProps {
  onAddWorkRecord: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    project: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
}

const WorkRecordsHeader = ({
  onAddWorkRecord,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
}: WorkRecordsHeaderProps) => {
  return (
    <div className="border-b border-border px-6 py-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Work Records</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your work activities</p>
        </div>
        <Button onClick={onAddWorkRecord} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground font-medium mb-2">Status</p>
              <Select value={filters.status} onValueChange={(value) => onFiltersChange({...filters, status: value})}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Options */}
        <div className="flex items-center border border-border rounded-md">
          <Button variant="ghost" size="sm" className="px-2 border-r border-border">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2">
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Customize</DropdownMenuItem>
            <DropdownMenuItem>Columns</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Assignee</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default WorkRecordsHeader;