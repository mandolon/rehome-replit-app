import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, FolderOpen, File, Calendar, BookOpen, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filter: string) => void;
}

const SearchPopup = ({ isOpen, onClose, onSearch }: SearchPopupProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results from API
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0
  });

  // Recent searches data
  const recentSearches = [
    { query: 'Sarah Johnson', type: 'people', timestamp: '2 hours ago' },
    { query: 'API Documentation', type: 'files', timestamp: 'Yesterday' },
    { query: 'Mobile App Development', type: 'projects', timestamp: '3 days ago' },
    { query: 'Sprint Planning', type: 'notes', timestamp: '1 week ago' }
  ];

  // Calculate filter counts from real search results
  const getFilterCounts = () => {
    if (!searchResults) {
      return { all: 0, people: 0, projects: 0, files: 0, tasks: 0, notes: 0 };
    }
    
    const counts = {
      people: searchResults.people?.length || 0,
      projects: searchResults.projects?.length || 0,
      files: searchResults.files?.length || 0,
      tasks: searchResults.tasks?.length || 0,
      notes: searchResults.notes?.length || 0,
    };
    
    const all = counts.people + counts.projects + counts.files + counts.tasks + counts.notes;
    
    return { all, ...counts };
  };

  const filterCounts = getFilterCounts();
  
  const filters = [
    { id: 'all', label: 'All', icon: Search, count: filterCounts.all },
    { id: 'people', label: 'People', icon: UserCheck, count: filterCounts.people },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: filterCounts.projects },
    { id: 'files', label: 'Files', icon: File, count: filterCounts.files },
    { id: 'tasks', label: 'Tasks', icon: Calendar, count: filterCounts.tasks },
    { id: 'notes', label: 'Notes', icon: BookOpen, count: filterCounts.notes }
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

  // Helper function to assign roles to people
  const getPersonRole = (username: string): string => {
    const roles = ['Architect', 'Consultant', 'Designer', 'Client', 'Developer', 'Project Manager', 'Team Lead'];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return roles[hash % roles.length];
  };

  // Format results from API to match component interface
  const formatResults = (data: any, type: string) => {
    if (!data) return [];
    
    return data.map((item: any) => {
      let title = '';
      let subtitle = '';
      let description = '';
      
      switch (type) {
        case 'people':
          title = item.username;
          subtitle = getPersonRole(item.username);
          description = `${item.username} • ${getPersonRole(item.username)}`;
          break;
        case 'projects':
          title = item.title;
          subtitle = 'Project';
          description = `${item.title} • Project`;
          break;
        case 'tasks':
          title = item.title;
          subtitle = 'Task';
          description = `${item.title} • Task`;
          break;
        case 'files':
          title = item.name || item.title;
          subtitle = 'File';
          description = `${item.name || item.title} • File`;
          break;
        case 'notes':
          title = item.title;
          subtitle = 'Note';
          description = `${item.title} • Note`;
          break;
      }
      
      return {
        id: item.id,
        title,
        subtitle,
        description,
        avatar: type === 'people' ? item.username.charAt(0).toUpperCase() : undefined
      };
    });
  };

  // Filter results based on active filter and search query
  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    if (activeFilter === 'all') {
      return [
        ...formatResults(searchResults.people?.slice(0, 2), 'people'),
        ...formatResults(searchResults.projects?.slice(0, 2), 'projects'),
        ...formatResults(searchResults.tasks?.slice(0, 2), 'tasks')
      ];
    }
    
    const data = searchResults[activeFilter as keyof typeof searchResults];
    return formatResults(data, activeFilter);
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

  const renderResultRow = (result: SearchResult, type: string) => {
    const getResultIcon = () => {
      if (result.avatar && type === 'people') return null;
      switch (type) {
        case 'people': return UserCheck;
        case 'projects': return FolderOpen;
        case 'files': return File;
        case 'tasks': return Calendar;
        case 'notes': return BookOpen;
        default: return Search;
      }
    };

    const Icon = getResultIcon();

    return (
      <div
        key={`${type}-${result.id}`}
        className="flex items-center gap-2 py-1 hover:bg-muted/30 cursor-pointer"
        onClick={() => {
          handleSearch(result.title);
        }}
      >
        {result.avatar && type === 'people' ? (
          <div className="w-3 h-3 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            {result.avatar}
          </div>
        ) : Icon ? (
          <Icon className="w-3 h-3 text-muted-foreground" />
        ) : null}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">{result.title}</span>
          <span className="text-xs text-muted-foreground ml-2">{result.subtitle}</span>
        </div>
      </div>
    );
  };

  const renderRecentSearchRow = (search: any) => {
    const getTypeIcon = () => {
      switch (search.type) {
        case 'people': return UserCheck;
        case 'projects': return FolderOpen;
        case 'files': return File;
        case 'tasks': return Calendar;
        case 'notes': return BookOpen;
        default: return Search;
      }
    };

    const Icon = getTypeIcon();

    return (
      <div
        key={search.query}
        className="flex items-center gap-2 px-3 py-1 hover:bg-muted/30 cursor-pointer"
        onClick={() => {
          setSearchQuery(search.query);
          handleSearch(search.query);
        }}
      >
        <Icon className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">{search.query}</span>
          <span className="text-xs text-muted-foreground ml-2">{search.timestamp}</span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-40" />
      
      {/* Search Popup */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <div
          ref={popupRef}
          className="w-full max-w-2xl mx-4 bg-background border border-border rounded-lg shadow-2xl h-[500px] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 pl-6 pr-3 py-2 border-b border-border group">
            <div className="relative flex-1">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for people, projects, files, tasks, notes..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-7 pr-3 py-1 border border-border rounded text-xs w-full"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 pl-6 pr-3 py-2 border-b border-border bg-muted/20">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 text-xs border border-border rounded",
                    activeFilter === filter.id
                      ? "text-foreground bg-accent/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-3 h-3" strokeWidth="2" />
                  <span>{filter.label}</span>
                  <span className="text-muted-foreground">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.length === 0 ? (
              <div>
                {/* Recent Searches Section */}
                <div className="px-3 py-2 border-b border-border">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 pl-3">RECENT SEARCH</h3>
                  <div>
                    {recentSearches.map((search) => renderRecentSearchRow(search))}
                  </div>
                </div>
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Start typing to search...</p>
                </div>
              </div>
            ) : (
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Searching...</div>
                  </div>
                ) : getFilteredResults().length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="pl-6 pr-3 py-2">
                    {getFilteredResults().map((result: SearchResult) => {
                      // Determine result type based on active filter or properties
                      let type = activeFilter === 'all' ? 'mixed' : activeFilter;
                      if (activeFilter === 'all') {
                        if (result.avatar) type = 'people';
                        else if (result.subtitle?.includes('Project') || result.subtitle?.includes('In Progress') || result.subtitle?.includes('Completed')) type = 'projects';
                        else type = 'tasks';
                      }
                      
                      return renderResultRow(result, type);
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
            {searchQuery && (
              <div className="text-xs text-muted-foreground">
                {getFilteredResults().length} results
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPopup;