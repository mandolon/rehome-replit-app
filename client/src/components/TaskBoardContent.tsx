
import React from 'react';
import TaskBoardHeader from './TaskBoardHeader';
import TaskBoardFilters from './TaskBoardFilters';
import TaskGroupSection from './TaskGroupSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, TaskGroup } from '@/types/task';

interface TaskBoardContentProps {
  taskGroups: TaskGroup[];
  showQuickAdd: string | null;
  refreshTrigger: number;
  onSetShowQuickAdd: (status: string | null) => void;
  onQuickAddSave: (taskData: any) => void;
  onTaskClick: (task: Task) => void;
  onTaskArchive: (taskId: number) => void;
  onTaskDeleted: () => void; // <-- ensure consistent signature
  onAddTask: () => void;
  // Handlers for assignment (Supabase only)
  assignPerson: (taskId: string, person: any) => void;
  removeAssignee: (taskId: string) => void;
  addCollaborator: (taskId: string, person: any) => void;
  removeCollaborator: (taskId: string, idx: number) => void;
}

const TaskBoardContent = ({
  taskGroups,
  showQuickAdd,
  refreshTrigger,
  onSetShowQuickAdd,
  onQuickAddSave,
  onTaskClick,
  onTaskArchive,
  onTaskDeleted, // This will just be a refresh callback
  onAddTask,
  assignPerson,
  removeAssignee,
  addCollaborator,
  removeCollaborator,
}: any) => {
  const renderedGroups = React.useMemo(
    () => taskGroups.map((group, groupIndex) => (
      <TaskGroupSection
        key={`${groupIndex}-${refreshTrigger}`}
        group={group}
        showQuickAdd={showQuickAdd}
        onSetShowQuickAdd={onSetShowQuickAdd}
        onQuickAddSave={onQuickAddSave}
        onTaskClick={onTaskClick}
        onTaskArchive={onTaskArchive}
        onTaskDeleted={onTaskDeleted} // Pass unchanged! Now guaranteed to be () => void
        useContext={false}
        // Pass these down for assignment
        assignPerson={assignPerson}
        removeAssignee={removeAssignee}
        addCollaborator={addCollaborator}
        removeCollaborator={removeCollaborator}
      />
    )),
    [taskGroups, showQuickAdd, refreshTrigger, onSetShowQuickAdd, onQuickAddSave, onTaskClick, onTaskArchive, onTaskDeleted, assignPerson, removeAssignee, addCollaborator, removeCollaborator]
  );

  return (
    <div className="flex-1 bg-background pl-2">
      <div className="h-full flex flex-col">
        <TaskBoardHeader />
        <TaskBoardFilters onAddTask={onAddTask} />

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {renderedGroups}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TaskBoardContent;
