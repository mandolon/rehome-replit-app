
import { useEffect, useState, useRef } from "react";
import { Task } from "@/types/task";
import { fetchAllTasks } from "@/data/taskSupabase";
import { useUser } from "@/contexts/UserContext";
import { filterTasksForUser } from "@/utils/taskVisibility";

export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const { currentUser } = useUser();

  // Filters and sets tasks so users only see what they should
  const secureSetTasks = (allTasks: Task[]) => {
    setTasks(filterTasksForUser(allTasks, currentUser));
  };

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    fetchAllTasks()
      .then(secureSetTasks)
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Real-time functionality removed for now - can be implemented with WebSockets later
  // For now, tasks will update on page refresh or manual refresh

  return { tasks, setTasks: secureSetTasks, loading };
}
