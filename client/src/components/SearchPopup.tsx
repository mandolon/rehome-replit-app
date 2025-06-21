import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Folder, FileText, CheckSquare, StickyNote, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filter: string) => void;
}

const SearchPopup = ({ isOpen, onClose, onSearch }: SearchPopupProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recent searches data
  const recentSearches = [
    { query: 'Sarah Johnson', type: 'people', timestamp: '2 hours ago' },
    { query: 'API Documentation', type: 'files', timestamp: 'Yesterday' },
    { query: 'Mobile App Development', type: 'projects', timestamp: '3 days ago' },
    { query: 'Sprint Planning', type: 'notes', timestamp: '1 week ago' }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: Search, count: 156 },
    { id: 'people', label: 'People', icon: Users, count: 24 },
    { id: 'projects', label: 'Projects', icon: Folder, count: 18 },
    { id: 'files', label: 'Files', icon: FileText, count: 89 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 47 },
    { id: 'notes', label: 'Notes', icon: StickyNote, count: 12 }
  ];

  // Type definitions for search results
  interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    avatar?: string;
  }

  // Mock search results for demonstration
  const mockResults = {
    people: [
      { id: 1, title: 'Sarah Johnson', subtitle: 'Project Manager', description: 'Lead on client dashboard project', avatar: 'SJ' },
      { id: 2, title: 'Mike Chen', subtitle: 'Senior Developer', description: 'Full-stack engineer specializing in React', avatar: 'MC' },
      { id: 3, title: 'Emily Rodriguez', subtitle: 'UI/UX Designer', description: 'Design system and user experience lead', avatar: 'ER' }
    ] as SearchResult[],
    projects: [
      { id: 1, title: 'Client Dashboard Redesign', subtitle: 'In Progress', description: 'Modern dashboard interface for client portal' },
      { id: 2, title: 'Mobile App Development', subtitle: 'Planning', description: 'Cross-platform mobile application' },
      { id: 3, title: 'API Integration', subtitle: 'Completed', description: 'Third-party service integrations' }
    ] as SearchResult[],
    files: [
      { id: 1, title: 'Project Requirements.pdf', subtitle: 'Document', description: 'Updated 2 hours ago by Sarah Johnson' },
      { id: 2, title: 'Design System Guide.figma', subtitle: 'Design File', description: 'Last modified yesterday' },
      { id: 3, title: 'API Documentation.md', subtitle: 'Markdown', description: 'Technical documentation for API endpoints' }
    ] as SearchResult[],
    tasks: [
      { id: 1, title: 'Implement search functionality', subtitle: 'High Priority', description: 'Create global search with filters' },
      { id: 2, title: 'Review design mockups', subtitle: 'Medium Priority', description: 'Validate UI/UX designs with stakeholders' },
      { id: 3, title: 'Database optimization', subtitle: 'Low Priority', description: 'Improve query performance' }
    ] as SearchResult[],
    notes: [
      { id: 1, title: 'Meeting Notes - Sprint Planning', subtitle: 'Team Meeting', description: 'Sprint goals and task assignments' },
      { id: 2, title: 'Client Feedback Summary', subtitle: 'Client Communication', description: 'Consolidated feedback from client review' },
      { id: 3, title: 'Technical Architecture Notes', subtitle: 'Development', description: 'System design and implementation notes' }
    ] as SearchResult[]
  };

  // Filter results based on active filter and search query
  const getFilteredResults = () => {
    if (activeFilter === 'all') {
      return [
        ...mockResults.people.slice(0, 2),
        ...mockResults.projects.slice(0, 2),
        ...mockResults.tasks.slice(0, 2)
      ];
    }
    return mockResults[activeFilter as keyof typeof mockResults] || [];
  };

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when popup opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query, activeFilter);
  };

  const renderResultRow = (result: any, type: string) => {
    const getResultIcon = () => {
      switch (type) {
        case 'people': return Users;
        case 'projects': return Folder;
        case 'files': return FileText;
        case 'tasks': return CheckSquare;
        case 'notes': return StickyNote;
        default: return Search;
      }
    };

    const Icon = getResultIcon();

    return (
      <div
        key={`${type}-${result.id}`}
        className="flex items-center gap-2 px-3 py-1 hover:bg-muted/30 cursor-pointer transition-colors"
      >
        {result.avatar && type === 'people' ? (
          <div className="w-3 h-3 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            {result.avatar}
          </div>
        ) : (
          <Icon className="w-3 h-3 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: '0.75rem' }} className="font-normal text-foreground">{result.title}</span>
          <span style={{ fontSize: '0.75rem' }} className="text-muted-foreground ml-2">{result.subtitle}</span>
        </div>
      </div>
    );
  };

  const renderRecentSearchRow = (search: any) => {
    const getTypeIcon = () => {
      switch (search.type) {
        case 'people': return Users;
        case 'projects': return Folder;
        case 'files': return FileText;
        case 'tasks': return CheckSquare;
        case 'notes': return StickyNote;
        default: return Search;
      }
    };

    const Icon = getTypeIcon();

    return (
      <div
        key={search.query}
        className="flex items-center gap-2 px-3 py-1 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => {
          setSearchQuery(search.query);
          handleSearch(search.query);
        }}
      >
        <Icon className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: '0.75rem' }} className="font-normal text-foreground">{search.query}</span>
          <span style={{ fontSize: '0.75rem' }} className="text-muted-foreground ml-2">{search.timestamp}</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 flex justify-center">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for people, projects, files, tasks, notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-7 pr-3 py-1 text-xs w-96 h-auto"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-muted/20">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "h-auto px-2 py-1 text-xs border border-border",
                  activeFilter === filter.id
                    ? "bg-accent/50"
                    : "hover:bg-accent/50"
                )}
              >
                <Icon className="w-3 h-3 mr-2" strokeWidth="2" />
                {filter.label}
                <Badge variant="secondary" className="ml-2 text-xs h-auto px-1 py-0">
                  {filter.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        <Separator />

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length === 0 ? (
            <div>
              {/* Recent Searches Section */}
              <div className="px-3 py-2">
                <h3 style={{ fontSize: '0.75rem' }} className="font-semibold text-muted-foreground uppercase tracking-wide mb-1">RECENT SEARCHES</h3>
                <div>
                  {recentSearches.map((search) => renderRecentSearchRow(search))}
                </div>
              </div>
              <Separator />
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Start typing to search...</p>
              </div>
            </div>
          ) : (
            <div>
              {getFilteredResults().length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  {getFilteredResults().map((result) => {
                    // Determine result type based on properties
                    let type = 'tasks';
                    if ('avatar' in result && result.avatar) type = 'people';
                    else if (result.subtitle?.includes('Progress') || result.subtitle?.includes('Planning') || result.subtitle?.includes('Completed')) type = 'projects';
                    else if (result.subtitle?.includes('Document') || result.subtitle?.includes('Design File') || result.subtitle?.includes('Markdown')) type = 'files';
                    else if (result.subtitle?.includes('Meeting') || result.subtitle?.includes('Communication') || result.subtitle?.includes('Development')) type = 'notes';
                    
                    return renderResultRow(result, type);
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          {searchQuery && (
            <Badge variant="outline" className="text-xs">
              {getFilteredResults().length} results
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchPopup;