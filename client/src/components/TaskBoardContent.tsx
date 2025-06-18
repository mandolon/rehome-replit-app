
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
  selectedAssignees: string[];
  setSelectedAssignees: (assignees: string[]) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedStartDate: Date | undefined;
  setSelectedStartDate: (date: Date | undefined) => void;
  selectedEndDate: Date | undefined;
  setSelectedEndDate: (date: Date | undefined) => void;
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
  // Filter props
  selectedAssignees,
  setSelectedAssignees,
  selectedProject,
  setSelectedProject,
  selectedStartDate,
  setSelectedStartDate,
  selectedEndDate,
  setSelectedEndDate,
}: TaskBoardContentProps) => {
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
          selectedAssignees={selectedAssignees}
          setSelectedAssignees={setSelectedAssignees}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedStartDate={selectedStartDate}
          setSelectedStartDate={setSelectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedEndDate={setSelectedEndDate}
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
