import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, FolderOpen, File, Calendar, BookOpen, X, Trash2 } from 'lucide-react';
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
  const [isClearing, setIsClearing] = useState(false);
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
  const resultsRef = useRef<HTMLDivElement>(null);
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
    console.log('getFilteredResults called - searchResults:', searchResults, 'activeFilter:', activeFilter);
    if (!searchResults) {
      console.log('No search results, returning empty array');
      return [];
    }
    
    if (activeFilter === 'all') {
      const results = [
        ...formatResults(searchResults.people?.slice(0, 2), 'people'),
        ...formatResults(searchResults.projects?.slice(0, 2), 'projects'),
        ...formatResults(searchResults.tasks?.slice(0, 2), 'tasks')
      ];
      console.log('All filter results:', results);
      return results;
    }
    
    const data = searchResults[activeFilter as keyof typeof searchResults];
    const results = formatResults(data, activeFilter);
    console.log('Filtered results for', activeFilter, ':', results);
    return results;
  };

  // Store the current filtered results for consistent keyboard navigation
  const currentFilteredResults = searchQuery.length > 0 && searchResults ? getFilteredResults() : [];
  
  // Get all navigable items (search results or recent searches)
  const getNavigableItems = () => {
    if (searchQuery.length > 0) {
      console.log('getNavigableItems for search:', currentFilteredResults.length, 'items');
      return currentFilteredResults;
    } else {
      console.log('getNavigableItems for recent searches:', recentSearches.length, 'items');
      return recentSearches;
    }
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

      // Handle navigation for both search results and recent searches
      const navigableItems = searchQuery.length > 0 ? currentFilteredResults : recentSearches;
      
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        console.log('ArrowDown pressed, navigableItems:', navigableItems.length, 'selectedIndex:', selectedIndex);
        if (navigableItems.length > 0) {
          const newIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % navigableItems.length;
          console.log('Setting selectedIndex to:', newIndex);
          setSelectedIndex(newIndex);
        } else {
          console.log('No navigable items available');
        }
        return;
      }
      
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (navigableItems.length > 0) {
          setSelectedIndex(prev => prev <= 0 ? navigableItems.length - 1 : prev - 1);
        }
        return;
      }
      
      if (event.key === 'Enter' && selectedIndex >= 0 && navigableItems.length > 0) {
        event.preventDefault();
        const selectedItem = navigableItems[selectedIndex];
        
        if (searchQuery.length > 0) {
          // Handle search result selection
          let resultType = activeFilter === 'all' ? 'mixed' : activeFilter;
          if (activeFilter === 'all') {
            if (selectedItem.avatar) resultType = 'people';
            else if (selectedItem.subtitle?.includes('Project')) resultType = 'projects';
            else resultType = 'tasks';
          }
          handleResultClick(selectedItem, resultType);
        } else {
          // Handle recent search selection - navigate directly
          saveToRecentSearches(selectedItem.query, selectedItem.type);
          
          switch (selectedItem.type) {
            case 'people':
              navigate('/teams');
              break;
            case 'projects':
              navigate('/projects');
              break;
            case 'tasks':
              navigate('/');
              break;
            case 'files':
              console.log('File navigation:', selectedItem.query);
              break;
            case 'notes':
              console.log('Notes navigation:', selectedItem.query);
              break;
            default:
              setSearchQuery(selectedItem.query);
              return;
          }
          
          onClose(); // Close search popup after navigation
        }
        return;
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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

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

  const clearAllRecentSearches = () => {
    setIsClearing(true);
    
    // Wait for fade-out animation to complete, then clear the data
    setTimeout(() => {
      setRecentSearches([]);
      setIsClearing(false);
      
      // Clear from localStorage
      try {
        localStorage.removeItem('recentSearches');
      } catch (error) {
        console.warn('Failed to clear recent searches from localStorage:', error);
      }
    }, 300); // 300ms matches the animation duration
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
    const isSelected = searchQuery.length > 0 && index !== undefined && index === selectedIndex;
    
    // Debug logging for selection state
    if (index !== undefined) {
      console.log(`Result ${index}: isSelected=${isSelected}, searchQuery.length=${searchQuery.length}, selectedIndex=${selectedIndex}`);
    }

    return (
      <div
        key={`${type}-${result.id}`}
        data-index={index}
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

  const renderRecentSearchRow = (search: any, index?: number) => {
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
    const isSelected = searchQuery.length === 0 && index !== undefined && index === selectedIndex;

    const handleRecentSearchClick = () => {
      // Move this item to the top of recent searches
      saveToRecentSearches(search.query, search.type);
      
      // Navigate directly to the item's page based on type
      switch (search.type) {
        case 'people':
          navigate('/teams');
          break;
        case 'projects':
          navigate('/projects');
          break;
        case 'tasks':
          // For tasks, we need to find the specific task - for now navigate to main tasks view
          navigate('/');
          break;
        case 'files':
          // Navigate to files section when available
          console.log('File navigation:', search.query);
          break;
        case 'notes':
          // Navigate to notes section when available
          console.log('Notes navigation:', search.query);
          break;
        default:
          // Fallback to searching if type is unknown
          setSearchQuery(search.query);
          return;
      }
      
      onClose(); // Close search popup after navigation
    };

    return (
      <div
        key={search.query}
        data-index={index}
        className={cn(
          "flex items-center gap-2 px-3 py-1 cursor-pointer rounded mx-1",
          isSelected 
            ? "bg-accent/70 text-accent-foreground" 
            : "hover:bg-muted/30"
        )}
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
          <div className="flex items-center gap-3 pl-6 pr-3 py-2 group">
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
          <div className="flex items-center gap-2 pl-6 pr-3 py-2 border-b border-border">
            {filters.map((filter) => {
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
                  <span>{filter.label}</span>
                  <span className="text-muted-foreground">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div ref={resultsRef} className="flex-1 overflow-y-auto">
            {searchQuery.length === 0 ? (
              <div>
                {/* Recent Searches Section */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-1 pl-3 pr-1">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">RECENT SEARCH</h3>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={clearAllRecentSearches}
                        disabled={isClearing}
                        className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors disabled:opacity-50"
                        title="Clear all recent searches"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className={`transition-opacity duration-300 ${isClearing ? 'opacity-0' : 'opacity-100'}`}>
                    {recentSearches.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground/70">No recent searches</p>
                      </div>
                    ) : (
                      recentSearches.map((search, index) => renderRecentSearchRow(search, index))
                    )}
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
                ) : currentFilteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="pl-6 pr-3 py-2">
                    {currentFilteredResults.map((result: SearchResult, index: number) => {
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
        </div>
      </div>
    </>
  );
};

export default SearchPopup;