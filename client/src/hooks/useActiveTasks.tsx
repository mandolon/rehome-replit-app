import { useQuery } from '@tanstack/react-query';
import { Task } from '@shared/schema';

export const useActiveTasks = () => {
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['active-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Filter to only show active tasks (not completed and not archived)
      return data.filter((task: Task) => 
        !task.archived && 
        !task.markedComplete && 
        task.status !== 'completed'
      );
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  return {
    activeTasks: tasks,
    isLoading,
    error
  };
};