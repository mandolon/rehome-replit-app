import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, FolderOpen, File, Calendar, BookOpen, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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
  const [searchCache, setSearchCache] = useState<Map<string, any>>(new Map());
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<any[]>(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old timestamp format to ISO format if needed
        return parsed.map((search: any) => ({
          ...search,
          timestamp: search.timestamp.includes('T') ? search.timestamp : new Date().toISOString()
        }));
      }
      
      // Default recent searches with proper ISO timestamps
      const now = new Date();
      return [
        { 
          query: 'Sarah Johnson', 
          type: 'people', 
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        { 
          query: 'API Documentation', 
          type: 'files', 
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
        },
        { 
          query: 'Mobile App Development', 
          type: 'projects', 
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        { 
          query: 'Sprint Planning', 
          type: 'notes', 
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
        }
      ];
    } catch {
      const now = new Date();
      return [
        { 
          query: 'Sarah Johnson', 
          type: 'people', 
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        },
        { 
          query: 'API Documentation', 
          type: 'files', 
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          query: 'Mobile App Development', 
          type: 'projects', 
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          query: 'Sprint Planning', 
          type: 'notes', 
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  });
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 100); // Reduced to 100ms for near-instant search experience

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results from API with caching
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      
      // Check cache first
      const cacheKey = debouncedQuery.toLowerCase();
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
      }
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      // Cache the result
      setSearchCache(prev => new Map(prev).set(cacheKey, data));
      
      return data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000,   // Keep in cache for 5 minutes
  });



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
    taskId?: string;
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

  // Format results from API to match component interface
  const formatResults = (data: any, type: string) => {
    if (!data) return [];
    
    // Helper function to assign roles to people
    const getPersonRole = (username: string): string => {
      const roles = ['Architect', 'Consultant', 'Designer', 'Client', 'Developer', 'Project Manager', 'Team Lead'];
      const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return roles[hash % roles.length];
    };
    
    return data.map((item: any) => {
      let title = '';
      let subtitle = '';
      let description = '';
      
      switch (type) {
        case 'people':
          title = item.username;
          subtitle = getPersonRole(item.username);
          description = `${item.username} — ${getPersonRole(item.username)}`;
          break;
        case 'projects':
          title = item.title;
          subtitle = 'Project';
          description = `${item.title} — Project`;
          break;
        case 'tasks':
          title = item.title;
          subtitle = 'Task';
          description = `${item.title} — Task`;
          break;
        case 'files':
          title = item.name || item.title;
          subtitle = 'File';
          description = `${item.name || item.title} — File`;
          break;
        case 'notes':
          title = item.title;
          subtitle = 'Note';
          description = `${item.title} — Note`;
          break;
      }
      
      return {
        id: item.id,
        title,
        subtitle,
        description,
        avatar: type === 'people' ? item.username.charAt(0).toUpperCase() : undefined,
        taskId: type === 'tasks' ? item.taskId : undefined
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

  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!isOpen) {
        // Global Ctrl+K shortcut to open search (when not already open)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('openSearch'));
        }
        return;
      }

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Only handle navigation if there are search results
      const results = getFilteredResults();
      if (searchQuery && results.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        } else if (event.key === 'Enter' && selectedIndex >= 0) {
          event.preventDefault();
          const selectedResult = results[selectedIndex];
          if (selectedResult) {
            // Trigger the same action as clicking the result
            let resultType = activeFilter === 'all' ? 'mixed' : activeFilter;
            if (activeFilter === 'all') {
              if (selectedResult.avatar) resultType = 'people';
              else if (selectedResult.subtitle?.includes('Project')) resultType = 'projects';
              else resultType = 'tasks';
            }
            handleResultClick(selectedResult, resultType);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, onClose, searchQuery, selectedIndex, activeFilter]);

  // Reset selected index when search query or filter changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, activeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query, activeFilter);
    
    // Note: We don't save the typed query to recent searches anymore
    // Only save when user clicks on a specific result item
  };

  const saveToRecentSearches = (title: string, type: string) => {
    const newSearch = {
      query: title,
      type: type,
      timestamp: new Date().toISOString() // Store as ISO string for proper date calculations
    };
    
    const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== title)].slice(0, 10);
    setRecentSearches(updatedSearches);
    
    // Save to localStorage
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  };

  const formatFriendlyTimestamp = (timestamp: string | Date) => {
    const now = new Date();
    const searchDate = new Date(timestamp);
    
    // Normalize dates to start of day for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const searchDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
    
    const diffTime = today.getTime() - searchDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 6) {
      // Show weekday name for items within the past week
      return searchDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (diffDays <= 13) {
      return 'Last week';
    } else if (diffDays <= 30) {
      // Show week grouping for items within the past month
      const weeksAgo = Math.ceil(diffDays / 7);
      return `${weeksAgo} weeks ago`;
    } else {
      // Show full date for older items
      return searchDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== searchDate.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleResultClick = (result: SearchResult, type: string) => {
    // Save clicked item to recent searches
    saveToRecentSearches(result.title, type);
    
    // Handle navigation based on type
    switch (type) {
      case 'tasks':
        const taskId = result.taskId || result.id;
        navigate(`/task/${taskId}`, {
          state: {
            returnTo: window.location.pathname,
            returnToName: 'Search'
          }
        });
        break;
      case 'projects':
        navigate(`/projects`);
        break;
      case 'people':
        navigate(`/teams`);
        break;
      case 'files':
        console.log('File clicked:', result.title);
        break;
      case 'notes':
        console.log('Note clicked:', result.title);
        break;
      default:
        console.log('Unknown type clicked:', type, result.title);
    }
    
    onClose(); // Close search popup
  };

  const renderResultRow = (result: SearchResult, type: string, index?: number) => {
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
    const isSelected = index !== undefined && index === selectedIndex;

    return (
      <div
        key={`${type}-${result.id}`}
        className={cn(
          "flex items-center gap-2 py-1 cursor-pointer rounded px-2 mx-1",
          isSelected 
            ? "bg-accent/70 text-accent-foreground" 
            : "hover:bg-muted/30"
        )}
        onClick={() => handleResultClick(result, type)}
      >
        {result.avatar && type === 'people' ? (
          <div className="w-3 h-3 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-medium">
            {result.avatar}
          </div>
        ) : Icon ? (
          <Icon className="w-3 h-3 text-muted-foreground" />
        ) : null}
        <div className="flex-1 min-w-0">
          <span className="text-xs text-foreground">
            {result.title}
            <span className="text-muted-foreground ml-2">— {result.subtitle}</span>
          </span>
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

    const handleRecentSearchClick = () => {
      // Update the search query to show results
      setSearchQuery(search.query);
      
      // Move this item to the top of recent searches
      saveToRecentSearches(search.query, search.type);
    };

    return (
      <div
        key={search.query}
        className="flex items-center gap-2 px-3 py-1 hover:bg-muted/30 cursor-pointer"
        onClick={handleRecentSearchClick}
      >
        <Icon className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">{search.query}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatFriendlyTimestamp(search.timestamp)}</span>
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
          className="w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-2xl h-[500px] flex flex-col"
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
                className="pl-7 pr-3 py-1 border border-border rounded text-xs w-full bg-card"
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
          <div className="flex items-center gap-2 pl-6 pr-3 py-2">
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
                <div className="px-3 py-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 pl-3">RECENT SEARCH</h3>
                  <div>
                    {recentSearches.map((search) => renderRecentSearchRow(search))}
                  </div>
                </div>

              </div>
            ) : (
              <div>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : getFilteredResults().length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="pl-6 pr-3 py-2">
                    {getFilteredResults().map((result: SearchResult, index: number) => {
                      // Determine result type based on active filter or properties
                      let resultType = activeFilter === 'all' ? 'mixed' : activeFilter;
                      if (activeFilter === 'all') {
                        if (result.avatar) resultType = 'people';
                        else if (result.subtitle?.includes('Project') || result.subtitle?.includes('In Progress') || result.subtitle?.includes('Completed')) resultType = 'projects';
                        else resultType = 'tasks';
                      }
                      
                      return renderResultRow(result, resultType, index);
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