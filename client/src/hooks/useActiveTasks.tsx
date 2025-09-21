import { useEffect, useState } from "react";
import { taskService } from "@/lib/services/tasks";

export function useActiveTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const all = await taskService.getTasks();
      setTasks(all.filter((t: any) => t.status !== "completed" && t.status !== "archived"));
      setIsLoading(false);
    })();
  }, []);

  return { activeTasks: tasks, isLoading };
}