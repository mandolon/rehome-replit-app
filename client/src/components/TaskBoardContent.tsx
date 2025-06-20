
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
  showClosed: boolean;
  onToggleClosed: () => void;
  // Handlers for assignment (Supabase only)
  assignPerson: (taskId: string, person: any) => void;
  removeAssignee: (taskId: string) => void;
  addCollaborator: (taskId: string, person: any) => void;
  removeCollaborator: (taskId: string, idx: number) => void;
  // Filter props
  filters?: {
    selectedAssignees: string[];
    selectedCreatedBy: string[];
    selectedStartDate?: Date;
    selectedEndDate?: Date;
  };
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
  showClosed,
  onToggleClosed,
  assignPerson,
  removeAssignee,
  addCollaborator,
  removeCollaborator,
}: TaskBoardContentProps) => {
  // Apply filters to task groups
  const filteredTaskGroups = useMemo(() => {
    if (!filters || (
      filters.selectedAssignees.length === 0 &&
      filters.selectedCreatedBy.length === 0 &&
      !filters.selectedStartDate &&
      !filters.selectedEndDate
    )) {
      return taskGroups;
    }

    return taskGroups.map(group => ({
      ...group,
      tasks: group.tasks.filter(task => {
        // Filter by assignee
        if (filters.selectedAssignees.length > 0) {
          const assigneeName = task.assignee?.name || '';
          if (!filters.selectedAssignees.includes(assigneeName)) {
            return false;
          }
        }

        // Filter by created by
        if (filters.selectedCreatedBy.length > 0) {
          if (!filters.selectedCreatedBy.includes(task.createdBy)) {
            return false;
          }
        }

        // Filter by date range
        if (filters.selectedStartDate || filters.selectedEndDate) {
          const taskDate = task.dateCreated ? new Date(task.dateCreated) : null;
          if (!taskDate) return false;

          if (filters.selectedStartDate && taskDate < filters.selectedStartDate) {
            return false;
          }
          if (filters.selectedEndDate && taskDate > filters.selectedEndDate) {
            return false;
          }
        }

        return true;
      }),
      count: 0 // Will be recalculated
    })).map(group => ({
      ...group,
      count: group.tasks.length
    }));
  }, [taskGroups, filters]);
  const renderedGroups = React.useMemo(
    () => taskGroups
      .filter((group: TaskGroup) => showClosed ? group.status === 'completed' : group.status !== 'completed')
      .map((group: TaskGroup, groupIndex: number) => (
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
    [taskGroups, showClosed, showQuickAdd, refreshTrigger, onSetShowQuickAdd, onQuickAddSave, onTaskClick, onTaskArchive, onTaskDeleted, assignPerson, removeAssignee, addCollaborator, removeCollaborator]
  );

  return (
    <div className="flex-1 bg-background pl-2 overflow-hidden">
      <div className="h-full flex flex-col">
        <TaskBoardHeader />
        <TaskBoardFilters 
          onAddTask={onAddTask} 
          showClosed={showClosed}
          onToggleClosed={onToggleClosed}
        />

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 pt-6 pb-4 space-y-4">
            {renderedGroups}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TaskBoardContent;
