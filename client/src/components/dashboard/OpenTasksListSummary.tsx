
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskStatusIcon from "@/components/TaskStatusIcon";
import { useTaskContext } from "@/contexts/TaskContext";

const OpenTasksListSummary = () => {
  const { getAllTasks } = useTaskContext();

  // Use the context-aware dynamic list INCLUDING created tasks
  const tasks = getAllTasks();
  const openTasks = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      !task.archived &&
      !task.deletedAt
  );

  return (
    <Card className="border border-blue-200 bg-blue-25">
      <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold text-blue-700 flex items-center gap-2">
          Open Task List
          <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-bold rounded px-2 py-0.5 min-w-[1.8rem]">
            {openTasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        {openTasks.length === 0 ? (
          <div className="text-muted-foreground text-xs">No open tasks</div>
        ) : (
          <ul className="space-y-0.5">
            {openTasks.map((task) => (
              <li
                key={task.taskId}
                className="flex items-center gap-2 px-1 py-1 hover:bg-blue-100 rounded transition-colors group cursor-pointer"
                title={task.title}
              >
                <TaskStatusIcon status={task.status} onClick={() => {}} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-blue-900 truncate">
                    {task.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {task.project}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenTasksListSummary;

