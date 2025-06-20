import React, { useState, useMemo } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import type { Task } from '@/types/task';

type Person = { name: string; avatar: string; };

interface CreatedByFilterPopoverProps {
  selectedPeople: string[];
  onChange: (people: string[]) => void;
}

const CreatedByFilterPopover = ({ selectedPeople, onChange }: CreatedByFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all tasks to get unique creators
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Get unique creators from tasks, sorted alphabetically by first name
  const creators = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    const uniqueCreators = new Set<string>();
    tasks.forEach((task: Task) => {
      if (task.createdBy && typeof task.createdBy === 'string' && task.createdBy !== 'system') {
        uniqueCreators.add(task.createdBy);
      }
    });
    
    return Array.from(uniqueCreators)
      .filter(name => name && name.trim() !== '') // Filter out empty strings
      .map(name => ({ name, avatar: "👤" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const handleToggle = (person: Person) => {
    if (selectedPeople.includes(person.name)) {
      onChange(selectedPeople.filter(name => name !== person.name));
    } else {
      onChange([...selectedPeople, person.name]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${
            selectedPeople.length > 0
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          }`}
          title="Filter by creator"
        >
          Created by
          <ChevronDown className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 z-[1100]" align="start">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground/70 px-2 py-1">
            Show tasks created by
          </div>
          {creators.length === 0 ? (
            <div className="px-2 py-1 text-xs text-muted-foreground">
              No creators available
            </div>
          ) : (
            creators.map((person) => (
              <button
                key={person.name}
                onClick={() => handleToggle(person)}
                className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-accent rounded text-left"
              >
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(person.name)}
                  onChange={() => handleToggle(person)}
                  className="w-3 h-3 rounded border-gray-300"
                />
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{person.name}</span>
                </div>
              </button>
            ))
          )}
          {selectedPeople.length > 0 && (
            <>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => onChange([])}
                className="w-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-left"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreatedByFilterPopover;