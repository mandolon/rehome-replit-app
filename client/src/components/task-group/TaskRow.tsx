import React, { useMemo, useCallback, useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import TaskRowContent from './TaskRowContent';
import TaskRowFiles from './TaskRowFiles';
import TaskRowAssignees from './TaskRowAssignees';
import TaskRowContextMenu from './TaskRowContextMenu';
import TaskRowCreatedBy from './TaskRowCreatedBy';
import DeleteTaskDialog from '../DeleteTaskDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  isCompletedView?: boolean;
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
  onTaskDeleted,
  isCompletedView = false
}: TaskRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Direct API delete mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-board-data'] });
      setShowDeleteDialog(false);
      setIsDeleting(false);
    },
    onError: () => {
      setIsDeleting(false);
    }
  });

  const formattedDate = useMemo(() => formatDate(task.dateCreated), [task.dateCreated]);

  const handleDeleteClickInternal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleContextMenuDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteTaskInternal = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(task.taskId);
      if (onTaskDeleted) {
        onTaskDeleted();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
    }
  }, [deleteTaskMutation, task.taskId, onTaskDeleted]);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

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
          <TableCell className="py-[7px] w-[47%]">
            {rowContent}
          </TableCell>
          {!isCompletedView && (
            <TableCell className="py-[7px] w-[7%] border-l border-r border-l-transparent border-r-transparent hover:border-border transition-colors">
              <TaskRowFiles 
                hasAttachment={task.hasAttachment}
                taskId={task.taskId}
              />
            </TableCell>
          )}
          <TableCell className="text-xs text-muted-foreground py-[7px] w-[12%]">
            {formattedDate}
          </TableCell>
          <TableCell className="py-[7px] w-[10%]">
            <TaskRowCreatedBy createdBy={task.createdBy} />
          </TableCell>
          {isCompletedView && (
            <TableCell className="text-xs text-muted-foreground py-[7px] w-[12%]">
              {task.markedComplete ? formatDate(task.markedComplete) : '-'}
            </TableCell>
          )}
          {isCompletedView && (
            <TableCell className="text-xs text-muted-foreground py-[7px] w-[10%]">
              {task.markedCompleteBy || '-'}
            </TableCell>
          )}
          {!isCompletedView && (
            <TableCell className="py-[7px] w-[18%] border-l border-r border-l-transparent border-r-transparent hover:border-border transition-colors group/assignees">
              {rowAssignees}
            </TableCell>
          )}
        </TableRow>
      </TaskRowContextMenu>
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTaskInternal}
        taskTitle={task.title}
        isLoading={isDeleting}
      />
    </>
  );
});

TaskRow.displayName = "TaskRow";

export default TaskRow;
