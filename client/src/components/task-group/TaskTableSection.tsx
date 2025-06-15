import React, { useRef, useEffect } from "react";
import TaskTable from "./TaskTable";
import AddTaskButton from "./AddTaskButton";
import QuickAddTask from "@/components/QuickAddTask";
import { useTaskSorting } from "@/hooks/useTaskSorting";
import { Task, TaskGroup } from "@/types/task";
import { useTaskContext } from "@/contexts/TaskContext";

interface TaskTableSectionProps {
  group: TaskGroup;
  showQuickAdd: string | null;
  onSetShowQuickAdd: (value: string | null) => void;
  onQuickAddSave: (taskData: any) => void;
  onTaskClick: (task: Task) => void;
  onTaskDeleted?: () => void;
  // If this is a context-driven usage, useContext is true (default); if false, expect all handlers as props.
  useContext?: boolean;
  editingTaskId?: number | null;
  editingValue?: string;
  setEditingValue?: (value: string) => void;
  startEditingTask?: (task: any) => void;
  saveTaskEdit?: (id: number) => void;
  cancelTaskEdit?: () => void;
  toggleTaskStatus?: (id: number) => void;
  assignPerson?: (taskId: string, person: any) => void;
  removeAssignee?: (taskId: string) => void;
  addCollaborator?: (taskId: string, person: any) => void;
  removeCollaborator?: (taskId: string, idx: number) => void;
}

const TaskTableSection = ({
  group,
  showQuickAdd,
  onSetShowQuickAdd,
  onQuickAddSave,
  onTaskClick,
  onTaskDeleted,
  useContext = true,
  editingTaskId: propsEditingTaskId,
  editingValue: propsEditingValue,
  setEditingValue: propsSetEditingValue,
  startEditingTask: propsStartEditingTask,
  saveTaskEdit: propsSaveTaskEdit,
  cancelTaskEdit: propsCancelTaskEdit,
  toggleTaskStatus: propsToggleTaskStatus,
  assignPerson: propsAssignPerson,
  removeAssignee: propsRemoveAssignee,
  addCollaborator: propsAddCollaborator,
  removeCollaborator: propsRemoveCollaborator
}: any) => {
  const quickAddRef = useRef<HTMLDivElement>(null);
  const taskTableRef = useRef<HTMLDivElement>(null);

  // Only use context if in context-driven board
  let editingTaskId, editingValue, setEditingValue, startEditingTask, saveTaskEdit, cancelTaskEdit, toggleTaskStatus, assignPerson, removeAssignee, addCollaborator, removeCollaborator;
  if (useContext) {
    const ctx = useTaskContext();
    editingTaskId = ctx.editingTaskId;
    editingValue = ctx.editingValue;
    setEditingValue = ctx.setEditingValue;
    startEditingTask = ctx.startEditingTask;
    saveTaskEdit = ctx.saveTaskEdit;
    cancelTaskEdit = ctx.cancelTaskEdit;
    toggleTaskStatus = ctx.toggleTaskStatus;
    assignPerson = ctx.assignPerson;
    removeAssignee = ctx.removeAssignee;
    addCollaborator = ctx.addCollaborator;
    removeCollaborator = ctx.removeCollaborator;
  } else {
    editingTaskId = propsEditingTaskId;
    editingValue = propsEditingValue;
    setEditingValue = propsSetEditingValue;
    startEditingTask = propsStartEditingTask;
    saveTaskEdit = propsSaveTaskEdit;
    cancelTaskEdit = propsCancelTaskEdit;
    toggleTaskStatus = propsToggleTaskStatus;
    assignPerson = propsAssignPerson;
    removeAssignee = propsRemoveAssignee;
    addCollaborator = propsAddCollaborator;
    removeCollaborator = propsRemoveCollaborator;
  }

  const {
    visibleTasks,
    sortBy,
    sortDirection,
    handleDateCreatedFilterClick,
    handleAssignedToFilterClick
  } = useTaskSorting(group.tasks);

  const isShowingQuickAdd = showQuickAdd === group.status;

  // Handler rewiring for correct signature everywhere
  if (useContext) {
    const ctx = useTaskContext();
    // All context handlers below must have the correct signatures and should use task.taskId for upstream
    assignPerson = ctx.assignPerson;
    removeAssignee = ctx.removeAssignee;
    addCollaborator = ctx.addCollaborator;
    removeCollaborator = ctx.removeCollaborator;
  } else {
    assignPerson = propsAssignPerson;
    removeAssignee = propsRemoveAssignee;
    addCollaborator = propsAddCollaborator;
    removeCollaborator = propsRemoveCollaborator;
  }

  // Handle click outside to cancel quick add
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isShowingQuickAdd) return;
      const quickAddEl = quickAddRef.current;
      const target = event.target as Node;
      if (quickAddEl && quickAddEl.contains(target)) return;
      // Radix popover special area
      let node: Node | null = target;
      while (node) {
        if (node instanceof HTMLElement && node.hasAttribute("data-radix-popper-content-wrapper")) return;
        node = node.parentNode;
      }
      onSetShowQuickAdd(null);
    };

    if (isShowingQuickAdd) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowingQuickAdd, onSetShowQuickAdd]);

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingTaskId && taskTableRef.current && !taskTableRef.current.contains(event.target as Node)) {
        if (cancelTaskEdit) cancelTaskEdit();
      }
    };

    if (editingTaskId && cancelTaskEdit) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingTaskId, cancelTaskEdit]);

  return (
    <>
      <TaskTable
        ref={taskTableRef}
        tasks={visibleTasks}
        editingTaskId={editingTaskId}
        editingValue={editingValue}
        onSetEditingValue={setEditingValue}
        onTaskClick={onTaskClick}
        onTaskNameClick={(task, e) => { e.stopPropagation(); if (startEditingTask) startEditingTask(task); }}
        onEditClick={(task, e) => { e.stopPropagation(); if (startEditingTask) startEditingTask(task); }}
        onSaveEdit={saveTaskEdit}
        onCancelEdit={cancelTaskEdit}
        onKeyDown={(e, tid) => {
          if (e.key === "Enter" && saveTaskEdit) saveTaskEdit(tid);
          else if (e.key === "Escape" && cancelTaskEdit) cancelTaskEdit();
        }}
        onTaskStatusClick={toggleTaskStatus}
        onRemoveAssignee={(tid, e) => { e.stopPropagation(); if (removeAssignee) removeAssignee(tid); }}
        onRemoveCollaborator={(tid, idx, e) => { e.stopPropagation(); if (removeCollaborator) removeCollaborator(tid, idx); }}
        onAssignPerson={assignPerson}
        onAddCollaborator={addCollaborator}
        onTaskDeleted={onTaskDeleted}
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onDateCreatedFilterClick={handleDateCreatedFilterClick}
        onAssignedToFilterClick={handleAssignedToFilterClick}
      />

      {isShowingQuickAdd ? (
        <div ref={quickAddRef}>
          <QuickAddTask
            onSave={onQuickAddSave}
            onCancel={() => onSetShowQuickAdd(null)}
            defaultStatus={group.status}
          />
        </div>
      ) : (
        <AddTaskButton onAddTask={() => onSetShowQuickAdd(group.status)} />
      )}
    </>
  );
};

export default TaskTableSection;
