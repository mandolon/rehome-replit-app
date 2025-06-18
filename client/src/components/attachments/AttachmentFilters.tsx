import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { TaskAttachment } from '@/contexts/TaskAttachmentContext';
import { getCategoryColor, getTagColor } from '@/utils/fileTagging';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AttachmentFiltersProps {
  attachments: TaskAttachment[];
  onFilterChange: (filteredAttachments: TaskAttachment[]) => void;
}

export default function AttachmentFilters({ attachments, onFilterChange }: AttachmentFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique categories and tags from all attachments
  const allCategories = Array.from(new Set(attachments.map(a => a.category)));
  const allTags = Array.from(new Set(attachments.flatMap(a => a.tags)));

  // Apply filters whenever they change
  React.useEffect(() => {
    let filtered = attachments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(attachment =>
        attachment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        attachment.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(attachment =>
        selectedCategories.includes(attachment.category)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(attachment =>
        selectedTags.some(tag => attachment.tags.includes(tag))
      );
    }

    onFilterChange(filtered);
  }, [attachments, searchTerm, selectedCategories, selectedTags, onFilterChange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm;

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input */}
      <Input
        placeholder="Search files, tags, categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-xs text-xs"
      />

      {/* Filter Dropdown */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`text-xs ${hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' : ''}`}
          >
            <Filter className="w-3 h-3 mr-1" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {selectedCategories.length + selectedTags.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Categories Section */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-1">
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? getCategoryColor(category) + ' ring-2 ring-blue-400'
                        : getCategoryColor(category) + ' opacity-60 hover:opacity-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {allTags.slice(0, 20).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      selectedTags.includes(tag)
                        ? getTagColor(tag) + ' ring-2 ring-blue-400'
                        : getTagColor(tag) + ' opacity-60 hover:opacity-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {allTags.length > 20 && (
                  <span className="text-xs text-muted-foreground py-1">
                    +{allTags.length - 20} more
                  </span>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 ml-2">
          {selectedCategories.map(category => (
            <span
              key={category}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}
            >
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-2 h-2" />
              </button>
            </span>
          ))}
          {selectedTags.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getTagColor(tag)}`}
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-2 h-2" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}