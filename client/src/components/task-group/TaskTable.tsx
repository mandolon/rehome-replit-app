import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TaskRow from './TaskRow';
import TaskRowCreatedBy from "./TaskRowCreatedBy";
import { Task } from '@/types/task';
import { Triangle } from 'lucide-react';

interface TaskTableProps {
  tasks: any[];
  editingTaskId: number | null;
  editingValue: string;
  onSetEditingValue: (value: string) => void;
  onTaskClick: (task: any) => void;
  onTaskNameClick: (task: any, e: React.MouseEvent) => void;
  onEditClick: (task: any, e: React.MouseEvent) => void;
  onSaveEdit: (taskId: number) => void;
  onCancelEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent, taskId: number) => void;
  onTaskStatusClick: (taskId: number) => void;
  onRemoveAssignee: (taskId: string, e: React.MouseEvent) => void;
  onRemoveCollaborator: (taskId: string, collaboratorIndex: number, e: React.MouseEvent) => void;
  onAssignPerson: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
  onAddCollaborator: (taskId: string, person: { name: string; avatar: string; fullName?: string }) => void;
  onTaskDeleted?: () => void;
  // For sorting
  currentSortBy?: 'dateCreated' | 'assignee' | null;
  currentSortDirection?: 'asc' | 'desc';
  onDateCreatedFilterClick?: (e: React.MouseEvent) => void;
  onAssignedToFilterClick?: (e: React.MouseEvent) => void;
}

// @ts-ignore forwardRef types
const TaskTable = React.memo(React.forwardRef<HTMLDivElement, any>(({
  tasks,
  editingTaskId,
  editingValue,
  onSetEditingValue,
  onTaskClick,
  onTaskNameClick,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onKeyDown,
  onTaskStatusClick,
  onRemoveAssignee,
  onRemoveCollaborator,
  onAssignPerson,
  onAddCollaborator,
  onTaskDeleted,
  currentSortBy,
  currentSortDirection,
  onDateCreatedFilterClick,
  onAssignedToFilterClick,
}, ref) => {
  const memoizedTasks = React.useMemo(() => tasks, [tasks]);
  const isDateActive = currentSortBy === 'dateCreated';
  const isAssigneeActive = currentSortBy === 'assignee';

  return (
    <div ref={ref}>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border transition-colors hover:bg-accent/50 group">
            <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[47%] sm:w-[36%] pl-8 transition-colors group-hover:bg-accent/50 hover:bg-accent cursor-pointer">
              Name
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[7%] transition-colors group-hover:bg-accent/50 hover:bg-accent cursor-pointer">
              Files
            </TableHead>
            {/* Date Created - functional filter triangle */}
            <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[12%] transition-colors group-hover:bg-accent/50 hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-1 relative w-fit select-none group/date">
                Date Created
                <button
                  type="button"
                  className="ml-1 p-0 bg-transparent border-none rounded cursor-pointer opacity-0 group-hover/date:opacity-100 hover:opacity-100 transition-opacity duration-150 outline-none focus:ring-1 focus:ring-blue-300 focus:bg-blue-50 active:bg-blue-100"
                  style={{ lineHeight: 0, display: 'flex', alignItems: 'center' }}
                  onClick={onDateCreatedFilterClick}
                  aria-label="Filter by date"
                  tabIndex={0}
                >
                  <Triangle
                    className={`w-[11px] h-[11px] pointer-events-none transition-transform duration-150 
                      ${currentSortBy === 'dateCreated' ? 
                        (currentSortDirection === 'desc' ? 'rotate-180' : '') 
                        : 'rotate-180 opacity-50'}
                      text-gray-400 fill-gray-200`}
                    fill="#E5E7EB"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Filter by date created</span>
                </button>
              </div>
            </TableHead>
            {/* Created by */}
            <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[10%] transition-colors group-hover:bg-accent/50 hover:bg-accent">
              Created by
            </TableHead>
            {/* Assigned to - functional filter triangle */}
            <TableHead className="text-muted-foreground font-medium text-xs py-1.5 h-auto align-baseline w-[18%] transition-colors group-hover:bg-accent/50 hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-1 relative w-fit select-none group/assigned">
                Assigned to
                <button
                  type="button"
                  className="ml-1 p-0 bg-transparent border-none rounded cursor-pointer opacity-0 group-hover/assigned:opacity-100 hover:opacity-100 transition-opacity duration-150 outline-none focus:ring-1 focus:ring-blue-300 focus:bg-blue-50 active:bg-blue-100"
                  style={{ lineHeight: 0, display: 'flex', alignItems: 'center' }}
                  onClick={onAssignedToFilterClick}
                  aria-label="Filter by assignee"
                  tabIndex={0}
                >
                  <Triangle
                    className={`w-[11px] h-[11px] pointer-events-none transition-transform duration-150 
                      ${currentSortBy === 'assignee' ? 
                        (currentSortDirection === 'desc' ? 'rotate-180' : '') 
                        : 'rotate-180 opacity-50'}
                      text-gray-400 fill-gray-200`}
                    fill="#E5E7EB"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Filter by assignee</span>
                </button>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-b">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              editingTaskId={editingTaskId}
              editingValue={editingValue}
              onSetEditingValue={onSetEditingValue}
              onTaskClick={onTaskClick}
              onTaskNameClick={onTaskNameClick}
              onEditClick={onEditClick}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onKeyDown={onKeyDown}
              onTaskStatusClick={onTaskStatusClick}
              onRemoveAssignee={onRemoveAssignee}
              onRemoveCollaborator={onRemoveCollaborator}
              onAssignPerson={onAssignPerson}
              onAddCollaborator={onAddCollaborator}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}));

TaskTable.displayName = "TaskTable";
export default TaskTable;
