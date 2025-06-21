import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, FolderOpen, File, Calendar, BookOpen, X, Trash2, Circle } from 'lucide-react';
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
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mapped = parsed
          .map((search: any) => ({
            ...search,
            timestamp: search.timestamp.includes('T') ? search.timestamp : new Date().toISOString()
          }))
          .filter((search: any) => {
            // Filter out project searches without projectId - they're from old format
            if (search.type === 'projects' && !search.projectId) {
              return false;
            }
            // Filter out task searches without taskId
            if (search.type === 'tasks' && !search.taskId) {
              return false;
            }
            return true;
          });

        return mapped;
      }
      return [];
    } catch {
      return [];
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
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results from API with caching
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      
      const cacheKey = debouncedQuery.toLowerCase();
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
      }
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      setSearchCache(prev => new Map(prev).set(cacheKey, data));
      
      return data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60000,
    gcTime: 300000,
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
    projectId?: string;
    resultType: string;
  }

  // Format results from API to match component interface
  const formatResults = (data: any, type: string) => {
    if (!data) return [];
    
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
          subtitle = item.description || item.clientName || '';
          description = `${item.title}`;
          break;
        case 'tasks':
          title = item.title;
          subtitle = item.projectTitle || '';
          description = `${item.title} — ${item.projectTitle || ''}`;
          break;
        case 'files':
          title = item.name || item.title;
          subtitle = '';
          description = `${item.name || item.title}`;
          break;
        case 'notes':
          title = item.title;
          subtitle = '';
          description = `${item.title}`;
          break;
      }
      
      return {
        id: item.id,
        title,
        subtitle,
        description,
        avatar: type === 'people' ? item.username.charAt(0).toUpperCase() : undefined,
        taskId: type === 'tasks' ? item.taskId : undefined,
        projectId: type === 'projects' ? item.projectId : undefined,
        resultType: type
      };
    });
  };

  // Filter results based on active filter and search query
  const getFilteredResults = () => {
    if (!searchResults) {
      return [];
    }
    
    if (activeFilter === 'all') {
      const results = [
        ...formatResults(searchResults.projects?.slice(0, 3), 'projects'), // Show projects first
        ...formatResults(searchResults.people?.slice(0, 2), 'people'),
        ...formatResults(searchResults.tasks?.slice(0, 2), 'tasks')
      ];
      return results;
    }
    
    const data = searchResults[activeFilter as keyof typeof searchResults];
    const results = formatResults(data, activeFilter);
    return results;
  };

  // Get all navigable items (search results or recent searches)
  const getNavigableItems = () => {
    if (searchQuery.length > 0) {
      const currentResults = searchResults ? getFilteredResults() : [];
      return currentResults;
    } else {
      return recentSearches;
    }
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    onSearch(query, activeFilter);
    
    // Clear search query when popup closes
    if (query === '') {
      onClose();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      const navigableItems = getNavigableItems();
      
      switch (event.key) {
        case 'Escape':
          setSearchQuery('');
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => {
            const next = prev < navigableItems.length - 1 ? prev + 1 : 0;
            return next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => {
            const next = prev > 0 ? prev - 1 : navigableItems.length - 1;
            return next;
          });
          break;
        case 'Enter':
          event.preventDefault();
          const selectedItem = navigableItems[selectedIndex];
          console.log('Enter key pressed - selectedItem:', selectedItem);
          if (selectedItem && selectedIndex >= 0) {
            if (searchQuery.length > 0) {
              // Handle search result selection
              let resultType = activeFilter;
              if (activeFilter === 'all') {
                resultType = selectedItem.resultType || 'tasks';
              }
              handleResultClick(selectedItem, resultType);
            } else {
              // Handle recent search selection
              saveToRecentSearches(selectedItem.query, selectedItem.type);
              
              switch (selectedItem.type) {
                case 'people':
                  navigate('/teams');
                  break;
                case 'projects':

                  if (selectedItem.projectId) {
                    navigate(`/project/${selectedItem.projectId}`);
                  } else {
                    console.warn('No projectId in keyboard navigation, falling back to projects page');
                    navigate('/projects');
                  }
                  break;
                case 'tasks':
                  if (selectedItem.taskId) {
                    navigate(`/task/${selectedItem.taskId}`, {
                      state: {
                        returnTo: window.location.pathname,
                        returnToName: 'Search'
                      }
                    });
                  } else {
                    navigate('/');
                  }
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
              
              onClose();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen, onClose, onSearch, searchQuery, selectedIndex, activeFilter, recentSearches]);

  // Handle clicking outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setSearchQuery('');
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const saveToRecentSearches = (title: string, type: string) => {
    const newSearch = {
      query: title,
      type: type,
      timestamp: new Date().toISOString()
    };
    
    const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== title)].slice(0, 10);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearAllRecentSearches = async () => {
    setIsClearing(true);
    
    setTimeout(() => {
      setRecentSearches([]);
      localStorage.removeItem('recentSearches');
      setIsClearing(false);
    }, 300);
  };

  const formatFriendlyTimestamp = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const handleResultClick = (result: SearchResult, type: string) => {
    // Save clicked item to recent searches with additional metadata for projects
    if (type === 'projects') {
      const projectId = result.projectId || result.id;

      const projectSearch = {
        query: result.title,
        type: 'projects',
        projectId: projectId,
        timestamp: new Date().toISOString()
      };
      const updatedSearches = [projectSearch, ...recentSearches.filter(s => s.query !== result.title)].slice(0, 10);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    } else if (type === 'tasks') {
      const taskSearch = {
        query: result.title,
        type: 'tasks',
        taskId: result.taskId || result.id,
        projectName: result.subtitle,
        timestamp: new Date().toISOString()
      };
      const updatedSearches = [taskSearch, ...recentSearches.filter(s => s.query !== result.title)].slice(0, 10);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } else {
      saveToRecentSearches(result.title, type);
    }
    
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
        const projectId = result.projectId || result.id;

        if (projectId) {
          navigate(`/project/${projectId}`);
        } else {
          console.warn('No projectId found, falling back to projects page');
          navigate('/projects');
        }
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
        break;
    }
    
    onClose();
  };

  const renderResultRow = (result: SearchResult, type: string, index?: number) => {
    const getResultIcon = () => {
      if (result.avatar && type === 'people') return null;
      switch (type) {
        case 'people': return UserCheck;
        case 'projects': return FolderOpen;
        case 'files': return File;
        case 'tasks': return Circle;
        case 'notes': return BookOpen;
        default: return Search;
      }
    };

    const Icon = getResultIcon();
    const isSelected = searchQuery.length > 0 && index !== undefined && index === selectedIndex;

    return (
      <div
        key={`${type}-${result.id}`}
        data-index={index}
        className={cn(
          "flex items-center gap-2 py-1 cursor-pointer rounded pl-3 pr-2",
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
          <span className="text-xs font-medium text-foreground">
            {result.title}
            {type === 'tasks' && result.subtitle && (
              <span className="text-[10px] font-normal text-muted-foreground/60 ml-1">
                · {result.subtitle}
              </span>
            )}
          </span>
        </div>
        {type === 'tasks' && result.subtitle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetch('/api/projects')
                .then(res => res.json())
                .then(projects => {
                  const project = projects.find((p: any) => p.title === result.subtitle);
                  if (project) {
                    navigate(`/project/${project.projectId}`);
                    onClose();
                  }
                })
                .catch(console.error);
            }}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground px-1 py-0.5 rounded hover:bg-muted/30 transition-colors"
            title={`Go to ${result.subtitle} project`}
          >
            <FolderOpen className="w-2 h-2" />
          </button>
        )}
      </div>
    );
  };

  const renderRecentSearchRow = (search: any, index?: number) => {
    const getTypeIcon = () => {
      switch (search.type) {
        case 'people': return UserCheck;
        case 'projects': return FolderOpen;
        case 'files': return File;
        case 'tasks': return Circle;
        case 'notes': return BookOpen;
        default: return Search;
      }
    };

    const Icon = getTypeIcon();
    const isSelected = searchQuery.length === 0 && index !== undefined && index === selectedIndex;

    const handleRecentSearchClick = () => {
      saveToRecentSearches(search.query, search.type);
      
      switch (search.type) {
        case 'people':
          navigate('/teams');
          break;
        case 'projects':

          if (search.projectId) {
            navigate(`/project/${search.projectId}`);
          } else {
            console.warn('No projectId in recent search, falling back to projects page');
            navigate('/projects');
          }
          break;
        case 'tasks':
          if (search.taskId) {
            navigate(`/task/${search.taskId}`, {
              state: {
                returnTo: window.location.pathname,
                returnToName: 'Search'
              }
            });
          } else {
            navigate('/');
          }
          break;
        case 'files':
          console.log('File navigation:', search.query);
          break;
        case 'notes':
          console.log('Notes navigation:', search.query);
          break;
        default:
          setSearchQuery(search.query);
          return;
      }
      
      onClose();
    };

    return (
      <div
        key={search.query}
        data-index={index}
        className={cn(
          "flex items-center gap-2 py-1 cursor-pointer rounded pl-3 pr-2",
          isSelected 
            ? "bg-accent/70 text-accent-foreground" 
            : "hover:bg-muted/30"
        )}
        onClick={handleRecentSearchClick}
      >
        <Icon className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground">
            {search.query}
            {search.type === 'tasks' && search.projectName && (
              <span className="text-[10px] font-normal text-muted-foreground/60 ml-1">
                · {search.projectName}
              </span>
            )}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatFriendlyTimestamp(search.timestamp)}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  const currentFilteredResults = getFilteredResults();

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                onClose();
              }}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-1 px-6 pb-2 pt-1 overflow-x-auto">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
                  <div className="px-3 py-2">
                    {currentFilteredResults.map((result: SearchResult, index: number) => {
                      const resultType = activeFilter === 'all' ? result.resultType : activeFilter;
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