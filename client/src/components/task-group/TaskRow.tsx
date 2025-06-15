import React, { useMemo, useCallback } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import TaskRowContent from './TaskRowContent';
import TaskRowFiles from './TaskRowFiles';
import TaskRowAssignees from './TaskRowAssignees';
import TaskRowContextMenu from './TaskRowContextMenu';
import TaskRowCreatedBy from './TaskRowCreatedBy';
import DeleteTaskDialog from '../DeleteTaskDialog';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';
import { formatDate } from '@/utils/taskUtils';
import { Task } from '@/types/task';

interface TaskRowProps {
  task: any;
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
}

const TaskRow = React.memo(({
  task,
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
  onTaskDeleted
}: TaskRowProps) => {
  const {
    showDeleteDialog,
    taskToDelete,
    isDeleting,
    handleDeleteClick,
    handleDeleteTask,
    handleCloseDeleteDialog
  } = useTaskDeletion();

  const formattedDate = useMemo(() => formatDate(task.dateCreated), [task.dateCreated]);

  const handleDeleteClickInternal = useCallback((e: React.MouseEvent) => {
    handleDeleteClick(task, e);
  }, [handleDeleteClick, task]);

  const handleContextMenuDelete = useCallback((e: React.MouseEvent) => {
    // Context menu is already closed by TaskRowContextMenu, so we can directly trigger the dialog
    handleDeleteClick(task, e);
  }, [handleDeleteClick, task]);

  const handleDeleteTaskInternal = useCallback(async () => {
    await handleDeleteTask(task);
    if (onTaskDeleted) {
      onTaskDeleted();
    }
  }, [handleDeleteTask, onTaskDeleted, task]);

  const rowContent = useMemo(() => (
    <TaskRowContent
      task={task}
      editingTaskId={editingTaskId}
      editingValue={editingValue}
      onSetEditingValue={onSetEditingValue}
      onTaskClick={onTaskClick}
      onEditClick={onEditClick}
      onSaveEdit={onSaveEdit}
      onCancelEdit={onCancelEdit}
      onKeyDown={onKeyDown}
      onTaskStatusClick={onTaskStatusClick}
      onDeleteClick={handleDeleteClickInternal}
    />
  ), [
    task,
    editingTaskId,
    editingValue,
    onSetEditingValue,
    onTaskClick,
    onEditClick,
    onSaveEdit,
    onCancelEdit,
    onKeyDown,
    onTaskStatusClick,
    handleDeleteClickInternal
  ]);

  const rowAssignees = useMemo(() => (
    <TaskRowAssignees
      task={task}
      onRemoveAssignee={onRemoveAssignee}
      onRemoveCollaborator={onRemoveCollaborator}
      onAssignPerson={onAssignPerson}
      onAddCollaborator={onAddCollaborator}
    />
  ), [task, onRemoveAssignee, onRemoveCollaborator, onAssignPerson, onAddCollaborator]);

  return (
    <>
      <TaskRowContextMenu
        task={task}
        onEditClick={onEditClick}
        onTaskStatusClick={onTaskStatusClick}
        onContextMenuDelete={handleContextMenuDelete}
      >
        <TableRow key={task.id} className="hover:bg-accent/50 group">
          <TableCell className="py-2 w-[47%]">
            {rowContent}
          </TableCell>
          <TableCell className="py-2 w-[7%] border-l border-r border-l-transparent border-r-transparent hover:border-border transition-colors">
            <TaskRowFiles 
              hasAttachment={task.hasAttachment}
              taskId={task.taskId}
            />
          </TableCell>
          <TableCell className="text-xs text-muted-foreground py-2 w-[12%]">
            {formattedDate}
          </TableCell>
          <TableCell className="py-2 w-[10%]">
            <TaskRowCreatedBy createdBy={task.createdBy} />
          </TableCell>
          {/* Add a named group to assignees cell to make x icons appear only on cell hover */}
          <TableCell className="py-2 w-[18%] border-l border-r border-l-transparent border-r-transparent hover:border-border transition-colors group/assignees">
            {rowAssignees}
          </TableCell>
        </TableRow>
      </TaskRowContextMenu>
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTaskInternal}
        taskTitle={taskToDelete?.title || task.title}
        isLoading={isDeleting}
      />
    </>
  );
});

TaskRow.displayName = "TaskRow";

export default TaskRow;
