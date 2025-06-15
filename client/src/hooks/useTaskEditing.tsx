import { useState, useCallback } from 'react';
import { Task } from '@shared/schema';

export function useTaskEditing(updateTaskById: (taskId: number, updates: Partial<Task>) => void) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const startEditingTask = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditingValue(task.title);
  }, []);

  const saveTaskEdit = useCallback((taskId: number) => {
    if (editingTaskId === taskId) {
      updateTaskById(taskId, { title: editingValue });
      setEditingTaskId(null);
      setEditingValue('');
    }
  }, [editingTaskId, editingValue, updateTaskById]);

  const cancelTaskEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingValue('');
  }, []);

  return {
    editingTaskId,
    editingValue,
    startEditingTask,
    saveTaskEdit,
    cancelTaskEdit,
    setEditingValue,
  };
}