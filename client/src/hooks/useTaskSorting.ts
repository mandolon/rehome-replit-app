
import { useMemo, useState, useCallback } from "react";
import { Task } from "@/types/task";

function compareAssignee(a: Task, b: Task, direction: "asc" | "desc") {
  const nameA = a.assignee?.name?.toLowerCase?.() ?? "";
  const nameB = b.assignee?.name?.toLowerCase?.() ?? "";
  if (!nameA && !nameB) return 0;
  if (!nameA) return 1;
  if (!nameB) return -1;
  return direction === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
}

function compareDateCreated(a: Task, b: Task, direction: "asc" | "desc") {
  const parse = (date: string) => {
    if (!date) return new Date(0);
    const parts = date.split("/");
    if (parts.length === 3) {
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      return new Date(year, month, day);
    } else {
      return new Date(date);
    }
  };
  const dA = parse(a.dateCreated);
  const dB = parse(b.dateCreated);
  return direction === "asc" ? dA.getTime() - dB.getTime() : dB.getTime() - dA.getTime();
}

// Custom hook for sorting tasks
export function useTaskSorting(tasks: Task[]) {
  const [sortBy, setSortBy] = useState<null | "dateCreated" | "assignee">(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleDateCreatedFilterClick = useCallback(() => {
    if (sortBy === "dateCreated") {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortBy("dateCreated");
      setSortDirection("desc");
    }
  }, [sortBy]);

  const handleAssignedToFilterClick = useCallback(() => {
    if (sortBy === "assignee") {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortBy("assignee");
      setSortDirection("asc");
    }
  }, [sortBy]);

  const visibleTasks = useMemo(() => {
    let filtered = tasks.filter((task) => !task.archived && !task.deletedAt);
    if (sortBy === "dateCreated") {
      filtered = [...filtered].sort((a, b) => compareDateCreated(a, b, sortDirection));
    } else if (sortBy === "assignee") {
      filtered = [...filtered].sort((a, b) => compareAssignee(a, b, sortDirection));
    }
    return filtered;
  }, [tasks, sortBy, sortDirection]);

  return {
    visibleTasks,
    sortBy,
    sortDirection,
    handleDateCreatedFilterClick,
    handleAssignedToFilterClick,
    setSortBy,
    setSortDirection
  };
}
