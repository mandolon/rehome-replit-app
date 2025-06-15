import React, { useState } from 'react';
import TaskGroupHeader from './task-group/TaskGroupHeader';
import TaskTableSection from './task-group/TaskTableSection';
import { Task, TaskGroup, TaskUser } from '@/types/task';

interface TaskGroupSectionProps {
  group: TaskGroup;
  showQuickAdd: string | null;
  onSetShowQuickAdd: (status: string | null) => void;
  onQuickAddSave: (taskData: any) => void;
  onTaskClick: (task: Task) => void;
  onTaskArchive?: (taskId: number) => void;
  onTaskDeleted?: () => void;
  useContext?: boolean;
  // Assignment handler props (added!)
  assignPerson?: (taskId: string, person: TaskUser) => void;
  removeAssignee?: (taskId: string) => void;
  addCollaborator?: (taskId: string, person: TaskUser) => void;
  removeCollaborator?: (taskId: string, idx: number) => void;
}

const TaskGroupSection = React.memo(({
  group,
  showQuickAdd,
  onSetShowQuickAdd,
  onQuickAddSave,
  onTaskClick,
  onTaskArchive,
  onTaskDeleted,
  useContext = true,
  // Assignment handlers (added!)
  assignPerson,
  removeAssignee,
  addCollaborator,
  removeCollaborator,
}: any) => { // updated prop types to 'any' for flexibility, could be more specific in a full refactor
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1.5">
      <TaskGroupHeader
        group={group}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(prev => !prev)}
      />

      {isExpanded && (
        <TaskTableSection
          group={group}
          showQuickAdd={showQuickAdd}
          onSetShowQuickAdd={onSetShowQuickAdd}
          onQuickAddSave={onQuickAddSave}
          onTaskClick={onTaskClick}
          onTaskDeleted={onTaskDeleted} // Used exactly as received, always () => void
          useContext={useContext}
          // Assignment handlers pass-through (added!)
          assignPerson={assignPerson}
          removeAssignee={removeAssignee}
          addCollaborator={addCollaborator}
          removeCollaborator={removeCollaborator}
        />
      )}
    </div>
  );
});

TaskGroupSection.displayName = "TaskGroupSection";
export default TaskGroupSection;
