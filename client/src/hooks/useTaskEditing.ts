
import { useState, useCallback } from 'react';
import { Task } from '@/types/task';

export const useTaskEditing = (updateTaskById: (taskId: number, updates: Partial<Task>) => void) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditingTask = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditingValue(task.title);
  }, []);

  const saveTaskEdit = useCallback((taskId: number) => {
    if (editingValue.trim() === '') {
      console.warn('Cannot save empty task title');
      setEditingTaskId(null);
      setEditingValue('');
      return;
    }

    updateTaskById(taskId, { title: editingValue.trim() });
    setEditingTaskId(null);
    setEditingValue('');
  }, [editingValue, updateTaskById]);

  const cancelTaskEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingValue('');
  }, []);

  return {
    editingTaskId,
    editingValue,
    setEditingValue,
    startEditingTask,
    saveTaskEdit,
    cancelTaskEdit
  };
};
